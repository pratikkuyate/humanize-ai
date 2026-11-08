import { NextResponse } from "next/server";
import { humanizeText } from "@/lib/gemini";
import { countWords, takeWords } from "@/lib/wordCount";
import { consumeQuota, refundQuota, applyQuota, publicQuota } from "@/lib/quota";
import { FREE_MAX_WORDS, PREVIEW_WORDS, MIN_LENGTH, MAX_CHARACTERS } from "@/lib/freeTier";
import { CHEAPEST_PASS } from "@/lib/pricing";

/**
 * POST /api/humanize
 * Body: { text: string }
 */

// Long Pro documents are split into chunks that each make three Gemini calls,
// which can run well past the default function timeout. 300s is the ceiling on
// Vercel Hobby with Fluid compute; raise it on a paid plan if needed.
export const maxDuration = 300;
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

  const wordCount = countWords(trimmed);

  // Spend a run first; what the run covers depends on the result.
  //
  //   Pro                          → the whole text
  //   free, run left, ≤ word cap   → the whole text
  //   free, run left, > word cap   → the first FREE_MAX_WORDS words
  //   free, no runs, preview left  → a PREVIEW_WORDS preview, spends the preview
  //   free, no runs, no preview    → 429, and the client shows the upgrade dialog
  //
  // Anything not humanized comes back as `partial.lockedText`, the user's own
  // words, which the client shows blurred behind an unlock prompt. Only the
  // covered part is ever sent to Gemini, so there is no hidden full result in
  // the response for anyone to dig out.
  const runQuota = await consumeQuota(request, "humanize");

  /** @type {"full" | "limit" | "preview"} */
  let mode = "full";
  let source = trimmed;
  // The counter this request actually spent — refunded if the run then fails,
  // and the one whose cookie the response carries.
  let spent = { tool: "humanize", quota: runQuota };

  if (!runQuota.allowed) {
    const previewWords = Math.min(PREVIEW_WORDS, Math.floor(wordCount / 2));
    const head = takeWords(trimmed, previewWords);
    const previewQuota =
      head.length >= MIN_LENGTH ? await consumeQuota(request, "preview") : null;

    if (!previewQuota?.allowed) {
      return applyQuota(
        NextResponse.json(
          {
            success: false,
            error: "quota_exceeded",
            message: `You've used all ${runQuota.limit} free runs. Get unlimited access from ${CHEAPEST_PASS.priceDisplay} for ${CHEAPEST_PASS.days} days.`,
            remaining: 0,
            limit: runQuota.limit,
            resetAt: runQuota.resetAt,
          },
          { status: 429 }
        ),
        previewQuota ?? runQuota
      );
    }

    mode = "preview";
    source = head;
    spent = { tool: "preview", quota: previewQuota };
  } else if (!runQuota.pro && wordCount > FREE_MAX_WORDS) {
    mode = "limit";
    source = takeWords(trimmed, FREE_MAX_WORDS);
  }

  try {
    const { humanizedText, metadata } = await humanizeText(source);
    const lockedText = trimmed.slice(source.length).trim();

    return applyQuota(
      NextResponse.json({
        success: true,
        originalText: trimmed,
        humanizedText,
        metadata,
        // The run counter, even for a preview, so the form keeps showing the
        // runs as used up rather than the preview's own count.
        quota: publicQuota(runQuota),
        partial:
          mode === "full"
            ? null
            : {
                reason: mode,
                humanizedWords: countWords(source),
                totalWords: wordCount,
                lockedWords: countWords(lockedText),
                lockedText,
              },
      }),
      spent.quota
    );
  } catch (err) {
    // The run failed on our side, so give the attempt back rather than charging
    // for a response the user never received. Under the cookie driver the refund
    // only takes effect once it is written onto the outgoing response.
    const refunded = await refundQuota(request, spent.tool);

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

    // Every model in the fallback chain was overloaded
    const httpStatus = /** @type {any} */ (err)?.httpStatus;
    if (httpStatus === 503 || httpStatus === 500 || httpStatus === 504) {
      return applyQuota(
        NextResponse.json(
          {
            success: false,
            error: "The AI service is busy right now. Please try again in a few seconds.",
          },
          { status: 503 }
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
