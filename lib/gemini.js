// TODO: Add your Gemini API key to .env.local
// GEMINI_API_KEY=your_key_here
// Get one free at: https://aistudio.google.com/app/apikey

import { GoogleGenAI } from "@google/genai";
import { Stage1Preprocessor } from "./stage1Processor.js";
import { countWords } from "./wordCount.js";
import { LONG_DOCUMENT_WORDS } from "./freeTier.js";
import {
  buildStage2Prompt,
  buildStage3Prompt,
  buildSelfCritiquePrompt,
} from "./prompts.js";

/** @import { Stage1Result } from './types.js' */

// Tried in order. 503 "high demand" is per-model capacity, so a different
// model usually answers immediately. Override with a comma-separated
// GEMINI_MODELS in .env.local.
const MODEL_CHAIN = (process.env.GEMINI_MODELS || "gemini-3.1-flash-lite,gemini-3.5-flash-lite,gemini-3.5-flash,gemini-2.5-flash")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
const CHAIN_PASSES = 2;          // walk the whole chain at most twice
const PASS_RETRY_DELAY_MS = 2_000;

// 404 covers a retired/misspelled model name in the chain.
const FALLBACK_STATUSES = new Set([404, 429, 500, 503, 504]);

const MAX_OUTPUT_TOKENS = 8192;

// Every stage returns the whole text, so output is capped by MAX_OUTPUT_TOKENS
// (~5,500 English words, less when thinking tokens count against it). Inputs
// above CHUNK_WORDS are split on paragraph boundaries and each piece runs the
// full pipeline on its own, which is what lets Pro accept long documents
// without the result being cut off. Shorter inputs take the single-pass path.
const CHUNK_WORDS = LONG_DOCUMENT_WORDS;
const CHUNK_CONCURRENCY = 4;

// How many times a chunk that still hit the output cap is halved and retried.
const MAX_SPLIT_DEPTH = 3;

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
            maxOutputTokens: MAX_OUTPUT_TOKENS,
          },
        });

        // A response that hit the token cap is a partial rewrite. Returning it
        // would silently drop the end of the user's text, so surface it and let
        // the pipeline retry on smaller pieces.
        if (response.candidates?.[0]?.finishReason === "MAX_TOKENS") {
          const truncated = new Error("Gemini output was cut off at the token limit.");
          /** @type {any} */ (truncated).truncated = true;
          throw truncated;
        }

        const text = response.text;
        if (!text || text.trim().length === 0) {
          throw new Error("Gemini returned an empty response.");
        }
        state.startIndex = index;
        return text.trim();
      } catch (err) {
        // Another model would hit the same cap on the same input.
        if (/** @type {any} */ (err)?.truncated) throw err;
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

// ─── Chunking ─────────────────────────────────────────────────────────────────

/** @param {string} text */
function splitSentences(text) {
  return text.match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) ?? [text];
}

/**
 * Greedily pack pieces into groups of at most `maxWords`, joined by `sep`.
 * A single piece larger than `maxWords` becomes a group of its own.
 *
 * @param {string[]} pieces
 * @param {number} maxWords
 * @param {string} sep
 */
function pack(pieces, maxWords, sep) {
  /** @type {string[]} */
  const groups = [];
  let current = [];
  let words = 0;

  for (const piece of pieces) {
    const n = countWords(piece);
    if (current.length > 0 && words + n > maxWords) {
      groups.push(current.join(sep).trim());
      current = [];
      words = 0;
    }
    current.push(piece);
    words += n;
  }
  if (current.length > 0) groups.push(current.join(sep).trim());

  return groups.filter(Boolean);
}

/**
 * Split text into chunks of at most `maxWords`, on paragraph boundaries where
 * possible. A paragraph that is itself over the limit is split by sentence.
 *
 * @param {string} text
 * @param {number} maxWords
 */
function splitIntoChunks(text, maxWords) {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  /** @type {string[]} */
  const chunks = [];
  /** @type {string[]} */
  let run = [];

  const flush = () => {
    chunks.push(...pack(run, maxWords, "\n\n"));
    run = [];
  };

  for (const paragraph of paragraphs) {
    if (countWords(paragraph) > maxWords) {
      flush();
      chunks.push(...pack(splitSentences(paragraph), maxWords, ""));
    } else {
      run.push(paragraph);
    }
  }
  flush();

  return chunks;
}

/**
 * Halve a chunk for a retry after the output cap was hit, or return null when
 * it is a single sentence and cannot be split further.
 *
 * @param {string} text
 * @returns {[string, string] | null}
 */
function splitInTwo(text) {
  const half = Math.ceil(countWords(text) / 2);
  const parts = splitIntoChunks(text, half);
  if (parts.length < 2) return null;
  const mid = Math.ceil(parts.length / 2);
  return [parts.slice(0, mid).join("\n\n"), parts.slice(mid).join("\n\n")];
}

/**
 * Run `worker` over `items` with at most `limit` in flight, preserving order.
 *
 * @template T, R
 * @param {T[]} items
 * @param {number} limit
 * @param {(item: T) => Promise<R>} worker
 * @returns {Promise<R[]>}
 */
async function mapWithConcurrency(items, limit, worker) {
  /** @type {R[]} */
  const results = new Array(items.length);
  let next = 0;

  async function lane() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, lane));
  return results;
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

/**
 * Stages 2 → 2.5 → 3 on one piece of already-preprocessed text. If a stage hits
 * the output cap, the piece is halved and each half is run again.
 *
 * @param {GoogleGenAI} client
 * @param {string} cleanedText
 * @param {import('./types.js').Stage1Metadata} metadata
 * @param {{ startIndex: number }} state
 * @param {number} depth
 * @returns {Promise<string>}
 */
async function runStages(client, cleanedText, metadata, state, depth = 0) {
  try {
    const stage2Text = await callGemini(client, buildStage2Prompt(cleanedText, metadata), state);
    const critiqueText = await callGemini(client, buildSelfCritiquePrompt(cleanedText, stage2Text), state);
    return await callGemini(client, buildStage3Prompt(critiqueText), state);
  } catch (err) {
    const halves = /** @type {any} */ (err)?.truncated && depth < MAX_SPLIT_DEPTH
      ? splitInTwo(cleanedText)
      : null;
    if (!halves) throw err;

    console.warn(`[gemini] output hit the token cap; retrying as two halves (depth ${depth + 1})`);
    const outputs = await Promise.all(
      halves.map((half) => runChunk(client, half, state, depth + 1))
    );
    return outputs.join("\n\n");
  }
}

/**
 * Preprocess one chunk and run it through the LLM stages. Each chunk gets its
 * own Stage 1 analysis so the prompt's diagnostics describe the text it is
 * actually rewriting.
 *
 * @param {GoogleGenAI} client
 * @param {string} text
 * @param {{ startIndex: number }} state
 * @param {number} depth
 */
function runChunk(client, text, state, depth = 0) {
  const { cleanedText, metadata } = new Stage1Preprocessor().process(text);
  return runStages(client, cleanedText, metadata, state, depth);
}

/**
 * Full 4-stage pipeline:
 *   Stage 1  — deterministic preprocessing (no API call)
 *   Stage 2  — LLM rewrite with specific transformation rules
 *   Stage 2.5 — self-critique: hunt for AI patterns that survived Stage 2
 *   Stage 3  — final editorial polish (rhythm, voice, concrete language)
 *
 * Inputs over CHUNK_WORDS are split by paragraph and the chunks run in
 * parallel; the returned metadata always describes the whole input.
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

  if (countWords(cleanedText) <= CHUNK_WORDS) {
    const finalText = await runStages(client, cleanedText, metadata, state);
    return { humanizedText: finalText, metadata };
  }

  const chunks = splitIntoChunks(cleanedText, CHUNK_WORDS);
  const outputs = await mapWithConcurrency(chunks, CHUNK_CONCURRENCY, (chunk) =>
    runChunk(client, chunk, state)
  );

  return { humanizedText: outputs.join("\n\n"), metadata };
}
