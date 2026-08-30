import { NextResponse } from "next/server";
import { humanizeText } from "@/lib/gemini";
import { countWords } from "@/lib/wordCount";
import { consumeQuota, refundQuota, applyQuota, publicQuota, proStatus } from "@/lib/quota";
import { FREE_MAX_WORDS, MIN_LENGTH, MAX_CHARACTERS } from "@/lib/freeTier";
import { PRO_PRICE_DISPLAY, PASS_DAYS } from "@/lib/pricing";

/**
 * POST /api/humanize
 * Body: { text: string }
 */
export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  const { text } = body ?? {};

  if (!text || typeof text !== "string") {
    return NextResponse.json(
      { success: false, error: "The 'text' field is required." },
      { status: 400 }
    );
  }

  const trimmed = text.trim();

  if (trimmed.length < MIN_LENGTH) {
    return NextResponse.json(
      {
        success: false,
        error: `Text must be at least ${MIN_LENGTH} characters long.`,
      },
      { status: 400 }
    );
  }

  // Cheap guard first: reject absurd payloads before spending CPU counting them.
  // This ceiling applies to everyone, Pro included — word-counting a multi-
  // megabyte paste is itself a way to burn server CPU.
  if (trimmed.length > MAX_CHARACTERS) {
    return NextResponse.json(
      {
        success: false,
        error: `Text must not exceed ${MAX_CHARACTERS.toLocaleString()} characters in a single run.`,
      },
      { status: 400 }
    );
  }

  // Pro is sold as "no word limit per run", so the free cap is resolved before
  // validation rather than after. consumeQuota below checks Pro again; on a
  // request that is about to spend several seconds in Gemini, one extra ~20ms
  // lookup is not worth threading state through to avoid.
  const { pro } = await proStatus(request);

  const wordCount = countWords(trimmed);

  if (!pro && wordCount > FREE_MAX_WORDS) {
    return NextResponse.json(
      {
        success: false,
        error: `Text must not exceed ${FREE_MAX_WORDS.toLocaleString()} words on the free plan. Yours is ${wordCount.toLocaleString()}.`,
        wordCount,
        maxWords: FREE_MAX_WORDS,
        upgrade: true,
      },
      { status: 400 }
    );
  }

  // Validation passed — now spend an attempt.
  const quota = await consumeQuota(request, "humanize");

  if (!quota.allowed) {
    return applyQuota(
      NextResponse.json(
        {
          success: false,
          error: "quota_exceeded",
          message: `You've used all ${quota.limit} free runs. Get ${PASS_DAYS} days of unlimited access for ${PRO_PRICE_DISPLAY}, or wait for them to reset.`,
          remaining: 0,
          limit: quota.limit,
          resetAt: quota.resetAt,
        },
        { status: 429 }
      ),
      quota
    );
  }

  try {
    const { humanizedText, metadata } = await humanizeText(trimmed);

    return applyQuota(
      NextResponse.json({
        success: true,
        originalText: trimmed,
        humanizedText,
        metadata,
        quota: publicQuota(quota),
      }),
      quota
    );
  } catch (err) {
    // The run failed on our side, so give the attempt back rather than charging
    // for a response the user never received. Under the cookie driver the refund
    // only takes effect once it is written onto the outgoing response.
    const refunded = await refundQuota(request, "humanize");

    const message = err instanceof Error ? err.message : String(err);

    // Surface rate-limit errors clearly
    if (message.includes("429") || message.toLowerCase().includes("quota")) {
      return applyQuota(
        NextResponse.json(
          {
            success: false,
            error:
              "The AI service is currently rate-limited. Please wait a moment and try again.",
          },
          { status: 429 }
        ),
        refunded
      );
    }

    // Missing API key
    if (message.includes("GEMINI_API_KEY")) {
      return applyQuota(
        NextResponse.json(
          {
            success: false,
            error:
              "The Gemini API key is not configured. Add GEMINI_API_KEY to .env.local.",
          },
          { status: 503 }
        ),
        refunded
      );
    }

    console.error("[/api/humanize]", message);

    return applyQuota(
      NextResponse.json(
        {
          success: false,
          error: "Something went wrong while processing your content. Please try again.",
        },
        { status: 500 }
      ),
      refunded
    );
  }
}
