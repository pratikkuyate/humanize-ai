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

// Tried in order. 503 "high demand" is per-model capacity, so a different
// model usually answers immediately. Override with a comma-separated
// GEMINI_MODELS in .env.local.
const MODEL_CHAIN = (process.env.GEMINI_MODELS || "gemini-3.1-flash-lite,gemini-2.5-flash-lite,gemini-2.5-flash")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
const CHAIN_PASSES = 2;          // walk the whole chain at most twice
const PASS_RETRY_DELAY_MS = 2_000;

// 404 covers a retired/misspelled model name in the chain.
const FALLBACK_STATUSES = new Set([404, 429, 500, 503, 504]);

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

// ─── Gemini call with model fallback ─────────────────────────────────────────

/**
 * Calls Gemini, falling through MODEL_CHAIN on overload / rate-limit errors.
 * `state.startIndex` is updated to the model that succeeded so later stages
 * of the same request don't re-hit a model that just failed.
 *
 * @param {GoogleGenAI} client
 * @param {string} prompt
 * @param {{ startIndex: number }} state
 * @returns {Promise<string>}
 */
async function callGemini(client, prompt, state) {
  /** @type {unknown} */
  let lastErr;

  for (let pass = 0; pass < CHAIN_PASSES; pass++) {
    if (pass > 0) await new Promise((resolve) => setTimeout(resolve, PASS_RETRY_DELAY_MS));

    for (let i = 0; i < MODEL_CHAIN.length; i++) {
      const index = (state.startIndex + i) % MODEL_CHAIN.length;
      const model = MODEL_CHAIN[index];
      try {
        const response = await client.models.generateContent({
          model,
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
        state.startIndex = index;
        return text.trim();
      } catch (err) {
        lastErr = err;
        const status = extractHttpStatus(err);
        const isEmpty = err instanceof Error && err.message.includes("empty response");
        if (!isEmpty && !(status !== null && FALLBACK_STATUSES.has(status))) break;
        console.warn(`[gemini] ${model} failed (HTTP ${status ?? "empty"}), trying next model…`);
      }
    }

    const status = extractHttpStatus(lastErr);
    if (status !== null && !FALLBACK_STATUSES.has(status)) break; // non-retryable
  }

  // Enrich the error with the status so route.js can classify it correctly
  const msg = lastErr instanceof Error ? lastErr.message : String(lastErr);
  const enriched = new Error(msg);
  /** @type {any} */ (enriched).httpStatus = extractHttpStatus(lastErr);
  throw enriched;
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
  const state = { startIndex: 0 };

  const stage2Text = await callGemini(client, buildStage2Prompt(cleanedText, metadata), state);
  const critiqueText = await callGemini(client, buildSelfCritiquePrompt(cleanedText, stage2Text), state);
  const finalText = await callGemini(client, buildStage3Prompt(critiqueText), state);

  return { humanizedText: finalText, metadata };
}
