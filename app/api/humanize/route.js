import { NextResponse } from "next/server";
import { humanizeText } from "@/lib/gemini";

const MIN_LENGTH = 50;
const MAX_LENGTH = 20_000;

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

  if (trimmed.length > MAX_LENGTH) {
    return NextResponse.json(
      {
        success: false,
        error: `Text must not exceed ${MAX_LENGTH.toLocaleString()} characters.`,
      },
      { status: 400 }
    );
  }

  try {
    const { humanizedText, metadata } = await humanizeText(trimmed);

    return NextResponse.json({
      success: true,
      originalText: trimmed,
      humanizedText,
      metadata,
    });
  } catch (err) {
    console.log('error', err);
    const message = err instanceof Error ? err.message : String(err);

    // Surface rate-limit errors clearly
    if (message.includes("429") || message.toLowerCase().includes("quota")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The AI service is currently rate-limited. Please wait a moment and try again.",
        },
        { status: 429 }
      );
    }

    // Missing API key
    if (message.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The Gemini API key is not configured. Add GEMINI_API_KEY to .env.local.",
        },
        { status: 503 }
      );
    }

    console.error("[/api/humanize]", message);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong while processing your content. Please try again.",
      },
      { status: 500 }
    );
  }
}
