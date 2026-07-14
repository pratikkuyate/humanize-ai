/**
 * Smoke test for the multilingual humanize pipeline (SEO-AUDIT Part 2,
 * Family D prerequisite: "do not ship until the pipeline actually handles
 * the language").
 *
 * Usage: node --env-file=.env.local scripts/test-language.mjs [lang]
 *   lang defaults to "es". Uses the language's own sample text from
 *   lib/languages.js, runs the real 3-stage pipeline, and prints
 *   before/after plus basic structural stats.
 */

import { humanizeText } from "../lib/gemini.js";
import { languages } from "../lib/languages.js";
import { Stage1Preprocessor } from "../lib/stage1Processor.js";

const lang = process.argv[2] ?? "es";
const entry = languages.find((l) => l.slug === lang);
if (!entry) {
  console.error(`No language entry for "${lang}". Available: ${languages.map((l) => l.slug).join(", ")}`);
  process.exit(1);
}

const sample = entry.samples[0];
const pre = new Stage1Preprocessor();

function stats(text) {
  const { metadata } = pre.process(text, lang);
  return `sentences=${metadata.sentenceCount} avgLen=${metadata.averageSentenceLength}w burstiness=${metadata.burstiness}`;
}

console.log(`\n═══ INPUT (${entry.name}) ═══  ${stats(sample)}\n`);
console.log(sample);

const started = Date.now();
const { humanizedText } = await humanizeText(sample, lang);
const secs = ((Date.now() - started) / 1000).toFixed(1);

console.log(`\n═══ OUTPUT (${secs}s) ═══  ${stats(humanizedText)}\n`);
console.log(humanizedText);

// Quick red flags
const emDashes = (humanizedText.match(/—/g) ?? []).length;
console.log(`\n═══ CHECKS ═══`);
console.log(`em-dashes in output: ${emDashes} ${emDashes <= 1 ? "✓" : "✗ (should be ≤1)"}`);
const looksEnglish = /\b(the|and|with|that|this)\b/i.test(humanizedText);
console.log(`suspicious English function words: ${looksEnglish ? "⚠ check output language!" : "none ✓"}`);
