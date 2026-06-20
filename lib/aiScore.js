/**
 * Client-safe heuristic "AI-likeness" scorer.
 *
 * Pure JavaScript — no server/Node dependencies — so it runs entirely in the
 * browser. The signal definitions (clichés, hedging, passive voice, formal
 * transitions, burstiness math) are reused from the Stage 1 humanizer engine
 * in lib/stage1Processor.js, extracted here as standalone pure functions.
 *
 * IMPORTANT: this is a transparent heuristic, NOT a verdict. It measures
 * stylistic patterns common in AI text (uniform sentence length, cliché
 * density, hedging, etc.). It is not affiliated with and does not replicate
 * detectors like GPTZero or Turnitin, which use different methods. Treat the
 * output as a writing-style signal, never as proof of authorship.
 */

// ─── Signal patterns (mirrored from stage1Processor.js) ─────────────────────

const AI_CLICHES = [
  /\bit(?:'s| is) (?:important|crucial|essential|vital|key|critical) to note that\b/gi,
  /\bit(?:'s| is) worth (?:noting|mentioning|highlighting|pointing out) that\b/gi,
  /\bplease note that\b/gi,
  /\bnotably,?\s*/gi,
  /\bit(?:'s| is) (?:clear|evident|apparent|obvious) that\b/gi,
  /\bwithout (?:further |any )?(?:ado|delay)\b/gi,
  /\bsuffice it to say[,.]?\s*/gi,
  /\bneedless to say[,.]?\s*/gi,
  /\bit goes without saying(?: that)?\b/gi,
  /\brest assured[,.]?\s*/gi,
  /\ballow me to\b/gi,
  /\blet(?:'s| us) (?:delve|dive) into\b/gi,
  /\bdelve into\b/gi,
  /\bembark on(?: a)?\b/gi,
  /\bexplore the (?:intricacies|nuances|complexities) of\b/gi,
  /\bin (?:conclusion|summary|closing|closing remarks?)[,:]?\s*/gi,
  /\bto (?:summarize|conclude|wrap up)[,:]?\s*/gi,
  /\ball in all[,.]?\s*/gi,
  /\bto sum (?:up|things up)[,:]?\s*/gi,
  /\bfirst and foremost[,.]?\s*/gi,
  /\blast but (?:certainly )?not least[,.]?\s*/gi,
  /\bat the end of the day[,.]?\s*/gi,
  /\bin today's (?:fast-paced |digital |modern |ever-?changing )?world\b/gi,
  /\bin the (?:modern|current|digital|contemporary) (?:era|age|landscape|world)\b/gi,
  /\bin the realm of\b/gi,
  /\bin the (?:field|domain|area|space) of\b/gi,
  /\bwhen it comes to\b/gi,
  /\bthe (?:fact|reality|truth) (?:of the matter )?is that\b/gi,
  /\bgroundbreaking\b/gi,
  /\brevolutionary\b/gi,
  /\bcutting-?edge\b/gi,
  /\bstate-?of-?the-?art\b/gi,
  /\binnovative (?:solution|approach|method)\b/gi,
  /\bgame-?changer\b/gi,
  /\bparadigm(?: shift)?\b/gi,
  /\bsynergy\b/gi,
  /\bholistic\b/gi,
  /\bseamlessly\b/gi,
  /\bpivotal (?:role|moment|point)\b/gi,
  /\bactionable insights?\b/gi,
  /\bkey (?:takeaway|takeaways)\b/gi,
];

const HEDGING_PATTERNS = [
  /\bin many ways\b/gi,
  /\bto some extent\b/gi,
  /\bit could be argued(?: that)?\b/gi,
  /\bit is possible that\b/gi,
  /\bthis may suggest\b/gi,
  /\bin a sense\b/gi,
  /\bsomewhat\b/gi,
  /\bseems? to\b/gi,
  /\bappears? to\b/gi,
  /\bmight suggest\b/gi,
  /\bcould potentially\b/gi,
  /\bmay potentially\b/gi,
  /\bpotentially\b/gi,
  /\bin certain (?:cases|situations|circumstances)\b/gi,
  /\bunder certain (?:circumstances|conditions)\b/gi,
  /\bgenerally speaking\b/gi,
  /\bbroadly speaking\b/gi,
];

const FORMAL_TRANSITIONS = [
  "furthermore", "moreover", "additionally", "consequently",
  "nevertheless", "nonetheless", "therefore", "thus", "hence",
  "subsequently", "accordingly", "in addition", "as a result",
  "in contrast", "on the other hand", "it is worth noting",
  "it should be noted", "it is important to", "it is essential to",
];

// Non-global so per-sentence .test() is stateless.
const PASSIVE_PATTERN = /\b(?:is|was|were|are|been|be|being)\s+\w+ed\b/i;

const MIN_WORDS = 40; // below this the score is statistically meaningless

// ─── Helpers ────────────────────────────────────────────────────────────────

function splitSentences(text) {
  const raw = text.match(/[^.!?]+[.!?]+["']?/g) ?? [];
  return raw.map((s) => s.trim()).filter((s) => s.length > 0);
}

function countMatches(text, patterns) {
  let total = 0;
  for (const pattern of patterns) {
    const m = text.match(pattern); // String.match with /g is stateless across calls
    total += m ? m.length : 0;
  }
  return total;
}

/** Burstiness = (std − mean) / (std + mean). Low/negative = uniform = AI-like. */
function calculateBurstiness(wordCounts) {
  if (wordCounts.length < 2) return 0;
  const mean = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;
  const variance =
    wordCounts.reduce((sum, c) => sum + (c - mean) ** 2, 0) / wordCounts.length;
  const std = Math.sqrt(variance);
  if (std + mean === 0) return 0;
  return parseFloat(((std - mean) / (std + mean)).toFixed(2));
}

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * @param {string} text
 * @returns {{
 *   score: number|null,
 *   label: string,
 *   tooShort: boolean,
 *   wordCount: number,
 *   sentenceCount: number,
 *   signals: Array<{ key: string, label: string, value: string, strength: number, weight: number, hint: string }>
 * }}
 */
export function scoreText(text) {
  const clean = (text || "").trim();
  const words = clean.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;
  const sentences = splitSentences(clean);
  const sentenceCount = sentences.length;

  if (wordCount < MIN_WORDS) {
    return {
      score: null,
      label: "Add more text",
      tooShort: true,
      wordCount,
      sentenceCount,
      signals: [],
    };
  }

  const wordCounts = sentences.map(
    (s) => s.split(/\s+/).filter((w) => w.length > 0).length
  );
  const burstiness = calculateBurstiness(wordCounts);
  const avgSentenceLength =
    sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0;

  // Per-100-word densities so the score is length-independent.
  const per100 = wordCount / 100;
  const clicheCount = countMatches(clean, AI_CLICHES);
  const hedgingCount = countMatches(clean, HEDGING_PATTERNS);
  const clicheDensity = clicheCount / per100;
  const hedgingDensity = hedgingCount / per100;

  const passiveCount = sentences.filter((s) => PASSIVE_PATTERN.test(s)).length;
  const passiveRatio = sentenceCount > 0 ? passiveCount / sentenceCount : 0;

  const lower = clean.toLowerCase();
  const transitionsFound = FORMAL_TRANSITIONS.filter((t) => lower.includes(t));
  const transitionDensity = transitionsFound.length / per100;

  // Repeated sentence openers (AI tends to reuse the same first word).
  const startCounts = new Map();
  for (const s of sentences) {
    const w = s.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
    if (w && w.length > 1) startCounts.set(w, (startCounts.get(w) ?? 0) + 1);
  }
  const repeatedStarts = [...startCounts.values()].reduce(
    (sum, n) => sum + (n > 1 ? n - 1 : 0),
    0
  );
  const repeatedStartRatio = sentenceCount > 0 ? repeatedStarts / sentenceCount : 0;

  // Each signal → strength in [0,1] toward "AI-like", times its weight.
  const signals = [
    {
      key: "burstiness",
      label: "Sentence-length variation",
      value: burstiness.toFixed(2),
      strength: clamp01((0.2 - burstiness) / 0.6),
      weight: 35,
      hint: "Human writing mixes short and long sentences. Uniform length is the strongest AI tell.",
    },
    {
      key: "cliche",
      label: "AI cliché density",
      value: `${clicheCount} found`,
      strength: clamp01(clicheDensity / 2),
      weight: 20,
      hint: '"Delve," "in today\'s world," "it\'s worth noting" and similar filler appear far more in AI text.',
    },
    {
      key: "transitions",
      label: "Formal transitions",
      value: `${transitionsFound.length} types`,
      strength: clamp01(transitionDensity / 1.5),
      weight: 15,
      hint: "Over-use of “furthermore,” “moreover,” “consequently” signals templated writing.",
    },
    {
      key: "hedging",
      label: "Hedging language",
      value: `${hedgingCount} found`,
      strength: clamp01(hedgingDensity / 1.5),
      weight: 12,
      hint: "Vague qualifiers like “somewhat,” “potentially,” “seems to” are common in AI output.",
    },
    {
      key: "passive",
      label: "Passive voice",
      value: `${Math.round(passiveRatio * 100)}% of sentences`,
      strength: clamp01(passiveRatio / 0.4),
      weight: 10,
      hint: "Heavy passive voice reads as impersonal and machine-like.",
    },
    {
      key: "repeats",
      label: "Repeated sentence openers",
      value: `${repeatedStarts}`,
      strength: clamp01(repeatedStartRatio / 0.3),
      weight: 8,
      hint: "Starting many sentences with the same word is a pattern humans rarely fall into.",
    },
  ];

  const score = Math.round(
    signals.reduce((sum, s) => sum + s.strength * s.weight, 0)
  );

  let label;
  if (score >= 70) label = "Reads as likely AI-generated";
  else if (score >= 40) label = "Mixed signals — possibly AI-assisted";
  else label = "Reads as likely human-written";

  return {
    score,
    label,
    tooShort: false,
    wordCount,
    sentenceCount,
    signals,
  };
}
