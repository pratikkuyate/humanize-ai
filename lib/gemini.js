// TODO: Add your Gemini API key to .env.local
// GEMINI_API_KEY=your_key_here
// Get one free at: https://aistudio.google.com/app/apikey

import { GoogleGenAI } from "@google/genai";
import { Stage1Preprocessor } from "./stage1Processor.js";
import {
  buildStage2Prompt,
  buildStage3Prompt,
  buildSelfCritiquePrompt,
} from "./prompts.js";

/** @import { Stage1Result } from './types.js' */

// Valid model IDs: "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"
// "gemini-3.5-flash" does NOT exist — do not use it.
const MODEL_ID = "gemini-3.5-flash";
const MAX_RETRIES = 1;
const RETRY_BASE_DELAY_MS = 10_000; // 10 s base; free tier resets each 60 s

// ─── Client ───────────────────────────────────────────────────────────────────

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to .env.local: GEMINI_API_KEY=your_key"
    );
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

// ─── HTTP status extraction ───────────────────────────────────────────────────

/**
 * The @google/genai SDK attaches .status (number) directly on thrown errors.
 * Fall back to parsing the message string for older SDK versions.
 * @param {unknown} err
 * @returns {number | null}
 */
function extractHttpStatus(err) {
  if (err && typeof err === "object") {
    const e = /** @type {any} */ (err);
    if (typeof e.status === "number") return e.status;
    if (typeof e.httpError?.status === "number") return e.httpError.status;
  }
  const msg = err instanceof Error ? err.message : String(err);
  const match = msg.match(/\[(\d{3})\s/);
  return match ? parseInt(match[1], 10) : null;
}

// ─── Gemini call with retry ───────────────────────────────────────────────────

/**
 * Calls Gemini and retries up to MAX_RETRIES times on 429 / 503.
 * Uses exponential backoff: 10 s, 20 s, 40 s.
 *
 * @param {GoogleGenAI} client
 * @param {string} prompt
 * @param {number} [attempt]
 * @returns {Promise<string>}
 */
async function callGemini(client, prompt, attempt = 0) {
  try {
    const response = await client.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        temperature: 0.9,   // slightly higher → more varied, less robotic output
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });

    const text = response.text;
    if (!text || text.trim().length === 0) {
      throw new Error("Gemini returned an empty response.");
    }
    return text.trim();
  } catch (err) {
    const status = extractHttpStatus(err);

    if ((status === 429 || status === 503) && attempt < MAX_RETRIES) {
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
      console.warn(
        `[gemini] HTTP ${status} on attempt ${attempt + 1}/${MAX_RETRIES + 1}. Retrying in ${delay / 1000}s…`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return callGemini(client, prompt, attempt + 1);
    }

    // Enrich the error with the status so route.js can classify it correctly
    const msg = err instanceof Error ? err.message : String(err);
    const enriched = new Error(msg);
    /** @type {any} */ (enriched).httpStatus = status;
    throw enriched;
  }
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

/**
 * Full 4-stage pipeline:
 *   Stage 1  — deterministic preprocessing (no API call)
 *   Stage 2  — LLM rewrite with specific transformation rules
 *   Stage 2.5 — self-critique: hunt for AI patterns that survived Stage 2
 *   Stage 3  — final editorial polish (rhythm, voice, concrete language)
 *
 * @param {string} rawText
 * @returns {Promise<{ humanizedText: string; metadata: import('./types.js').Stage1Metadata }>}
 */
export async function humanizeText(rawText) {
  const preprocessor = new Stage1Preprocessor();
  /** @type {Stage1Result} */
  const { cleanedText, metadata } = preprocessor.process(rawText);

  const client = getClient();

  const stage2Text = await callGemini(client, buildStage2Prompt(cleanedText, metadata));
  const critiqueText = await callGemini(client, buildSelfCritiquePrompt(cleanedText, stage2Text));
  const finalText = await callGemini(client, buildStage3Prompt(critiqueText));

  return { humanizedText: finalText, metadata };
}
