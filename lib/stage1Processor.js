/** @import { Stage1Result, Stage1Metadata } from './types.js' */

// ─── Removal patterns ─────────────────────────────────────────────────────────
// These phrases are stripped outright because they add zero meaning.

const AI_CLICHES = [
  // Meta-commentary
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
  // Filler closers
  /\bin (?:conclusion|summary|closing|closing remarks?)[,:]?\s*/gi,
  /\bto (?:summarize|conclude|wrap up)[,:]?\s*/gi,
  /\ball in all[,.]?\s*/gi,
  /\bto sum (?:up|things up)[,:]?\s*/gi,
  // Filler openers
  /\bfirst and foremost[,.]?\s*/gi,
  /\blast but (?:certainly )?not least[,.]?\s*/gi,
  /\bat the end of the day[,.]?\s*/gi,
  /\bin today's (?:fast-paced |digital |modern |ever-?changing )?world\b/gi,
  /\bin the (?:modern|current|digital|contemporary) (?:era|age|landscape|world)\b/gi,
  /\bin the realm of\b/gi,
  /\bin the (?:field|domain|area|space) of\b/gi,
  /\bwhen it comes to\b/gi,
  /\bthe (?:fact|reality|truth) (?:of the matter )?is that\b/gi,
  // Hype adjectives
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

// ─── Vocabulary simplification ────────────────────────────────────────────────
// Replace formal/verbose words with plain equivalents.

const VOCABULARY_REPLACEMENTS = new Map([
  [/\butilize\b/gi, "use"],
  [/\butilization\b/gi, "use"],
  [/\bfacilitate\b/gi, "help"],
  [/\bcommence\b/gi, "start"],
  [/\binitiate\b/gi, "start"],
  [/\bterminate\b/gi, "end"],
  [/\bascertain\b/gi, "find out"],
  [/\bdemonstrate\b/gi, "show"],
  [/\bpurchase\b/gi, "buy"],
  [/\brequire\b/gi, "need"],
  [/\bobtain\b/gi, "get"],
  [/\bprovide\b/gi, "give"],
  [/\bconsequently\b/gi, "so"],
  [/\bthus\b/gi, "so"],
  [/\bhence\b/gi, "so"],
  [/\btherefore\b/gi, "so"],
  [/\bnevertheless\b/gi, "still"],
  [/\bnonetheless\b/gi, "still"],
  [/\bsubsequently\b/gi, "then"],
  [/\bfurthermore\b/gi, "also"],
  [/\bmoreover\b/gi, "also"],
  [/\bhenceforth\b/gi, "from now on"],
  [/\bnotwithstanding\b/gi, "despite"],
  [/\bpertaining to\b/gi, "about"],
  [/\bin order to\b/gi, "to"],
  [/\bfor the purpose of\b/gi, "to"],
  [/\bprior to\b/gi, "before"],
  [/\bsubsequent to\b/gi, "after"],
  [/\bin the event that\b/gi, "if"],
  [/\bdue to the fact that\b/gi, "because"],
  [/\bowing to the fact that\b/gi, "because"],
  [/\bwith regard to\b/gi, "about"],
  [/\bwith respect to\b/gi, "about"],
  [/\bin terms of\b/gi, "for"],
  [/\ba number of\b/gi, "several"],
  [/\bthe majority of\b/gi, "most"],
  [/\bleverage\b/gi, "use"],
  [/\bleveraging\b/gi, "using"],
  [/\bimplement\b/gi, "use"],
  [/\bimplementation\b/gi, "use"],
  [/\boptimize\b/gi, "improve"],
  [/\boptimization\b/gi, "improvement"],
  [/\bencompass\b/gi, "include"],
  [/\bengender\b/gi, "create"],
  [/\bexhibit\b/gi, "show"],
  [/\bpossess\b/gi, "have"],
  [/\bemployed\b/gi, "used"],
  [/\bcomprises?\b/gi, "includes"],
  [/\bconsists? of\b/gi, "includes"],
  [/\bmyriad of\b/gi, "many"],
  [/\bplethora of\b/gi, "many"],
  [/\bdisseminate\b/gi, "share"],
  [/\bmodify\b/gi, "change"],
  [/\bconvey\b/gi, "say"],
  [/\belucidate\b/gi, "explain"],
  [/\bexpedite\b/gi, "speed up"],
  [/\bsubstantial\b/gi, "large"],
  [/\bnumerous\b/gi, "many"],
  [/\bsignificant\b/gi, "major"],
]);

// ─── Contractions ─────────────────────────────────────────────────────────────

const CONTRACTIONS = new Map([
  [/\bI am\b/g, "I'm"],
  [/\bI have\b/g, "I've"],
  [/\bI will\b/g, "I'll"],
  [/\bI would\b/g, "I'd"],
  [/\bit is\b/g, "it's"],
  [/\bit has\b/g, "it's"],
  [/\bdo not\b/g, "don't"],
  [/\bdoes not\b/g, "doesn't"],
  [/\bdid not\b/g, "didn't"],
  [/\bis not\b/g, "isn't"],
  [/\bare not\b/g, "aren't"],
  [/\bwas not\b/g, "wasn't"],
  [/\bwere not\b/g, "weren't"],
  [/\bwill not\b/g, "won't"],
  [/\bwould not\b/g, "wouldn't"],
  [/\bcould not\b/g, "couldn't"],
  [/\bshould not\b/g, "shouldn't"],
  [/\bcannot\b/g, "can't"],
  [/\bwe are\b/g, "we're"],
  [/\bwe have\b/g, "we've"],
  [/\bwe will\b/g, "we'll"],
  [/\bthey are\b/g, "they're"],
  [/\bthey have\b/g, "they've"],
  [/\bthat is\b/g, "that's"],
  [/\bthere is\b/g, "there's"],
  [/\bwhat is\b/g, "what's"],
  [/\bwho is\b/g, "who's"],
  [/\byou are\b/g, "you're"],
  [/\byou have\b/g, "you've"],
  [/\byou will\b/g, "you'll"],
  [/\bhe is\b/g, "he's"],
  [/\bshe is\b/g, "she's"],
]);

// ─── Analysis patterns ────────────────────────────────────────────────────────

/** Passive voice markers — "is/was/were/been + past-participle-ish" */
const PASSIVE_PATTERN = /\b(?:is|was|were|are|been|be|being)\s+\w+ed\b/gi;

/** Hedging phrases that make writing mealy-mouthed */
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

/** Formal connective transitions that AI over-uses */
const FORMAL_TRANSITIONS = [
  "furthermore", "moreover", "additionally", "consequently",
  "nevertheless", "nonetheless", "therefore", "thus", "hence",
  "subsequently", "accordingly", "in addition", "as a result",
  "in contrast", "on the other hand", "it is worth noting",
  "it should be noted", "it is important to", "it is essential to",
];

/** Stop words excluded from frequency analysis */
const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "up", "about", "into", "through", "during",
  "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
  "do", "does", "did", "will", "would", "could", "should", "may", "might",
  "that", "this", "these", "those", "it", "its", "i", "you", "he", "she",
  "we", "they", "their", "our", "your", "my", "his", "her", "not", "also",
  "as", "so", "if", "then", "than", "when", "where", "which", "who", "how",
  "all", "each", "both", "few", "more", "most", "other", "some", "such",
  "very", "just", "can", "get", "use", "used", "new", "one", "two",
]);

// ─── Main class ───────────────────────────────────────────────────────────────

export class Stage1Preprocessor {
  /**
   * @param {string} rawText
   * @returns {Stage1Result}
   */
  process(rawText) {
    let text = this._normalizeWhitespace(rawText);
    text = this._removeCliches(text);
    text = this._simplifyVocabulary(text);
    text = this._applyContractions(text);

    // Run analysis on the cleaned text
    const sentences = this._splitSentences(text);
    const metadata = this._analyze(text, sentences);

    return { cleanedText: text.trim(), metadata };
  }

  _normalizeWhitespace(text) {
    return text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]+/g, " ")
      .replace(/[ \t]*\n[ \t]*/g, "\n")
      .trim();
  }

  _removeCliches(text) {
    let result = text;
    for (const pattern of AI_CLICHES) {
      result = result.replace(pattern, "");
    }
    return result.replace(/[ \t]{2,}/g, " ").trim();
  }

  _simplifyVocabulary(text) {
    let result = text;
    for (const [pattern, replacement] of VOCABULARY_REPLACEMENTS) {
      result = result.replace(pattern, replacement);
    }
    return result;
  }

  _applyContractions(text) {
    let result = text;
    for (const [pattern, contraction] of CONTRACTIONS) {
      result = result.replace(pattern, contraction);
    }
    return result;
  }

  _splitSentences(text) {
    const raw = text.match(/[^.!?]+[.!?]+["']?/g) ?? [];
    return raw.map((s) => s.trim()).filter((s) => s.length > 0);
  }

  /**
   * @param {string} fullText
   * @param {string[]} sentences
   * @returns {Stage1Metadata}
   */
  _analyze(fullText, sentences) {
    const sentenceCount = sentences.length;

    const wordCounts = sentences.map(
      (s) => s.split(/\s+/).filter((w) => w.length > 0).length
    );
    const totalWords = wordCounts.reduce((a, b) => a + b, 0);
    const averageSentenceLength =
      sentenceCount > 0 ? Math.round(totalWords / sentenceCount) : 0;

    return {
      sentenceCount,
      burstiness: this._calculateBurstiness(wordCounts),
      averageSentenceLength,
      repeatedStarts: this._findRepeatedStarts(sentences),
      frequentWords: this._findFrequentWords(sentences),
      passiveSentenceCount: this._countPassiveSentences(sentences),
      formalTransitionsFound: this._findFormalTransitions(fullText),
      hedgingPhraseCount: this._countHedgingPhrases(fullText),
    };
  }

  /**
   * Burstiness = (std − mean) / (std + mean).
   * Positive = varied sentence lengths (human-like).
   * Negative = uniform lengths (robotic).
   * @param {number[]} wordCounts
   */
  _calculateBurstiness(wordCounts) {
    if (wordCounts.length < 2) return 0;
    const mean = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;
    const variance =
      wordCounts.reduce((sum, c) => sum + (c - mean) ** 2, 0) / wordCounts.length;
    const std = Math.sqrt(variance);
    if (std + mean === 0) return 0;
    return parseFloat(((std - mean) / (std + mean)).toFixed(2));
  }

  /** @param {string[]} sentences */
  _findRepeatedStarts(sentences) {
    /** @type {Map<string, number>} */
    const counts = new Map();
    for (const s of sentences) {
      const word = s.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
      if (word && word.length > 1) {
        counts.set(word, (counts.get(word) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .filter(([, n]) => n > 1)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([w]) => w);
  }

  /** @param {string[]} sentences */
  _findFrequentWords(sentences) {
    /** @type {Map<string, number>} */
    const counts = new Map();
    const tokens = sentences.join(" ").toLowerCase().match(/\b[a-z]{3,}\b/g) ?? [];
    for (const t of tokens) {
      if (!STOP_WORDS.has(t)) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return [...counts.entries()]
      .filter(([, n]) => n > 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([w]) => w);
  }

  /** Count sentences that contain a passive construction */
  _countPassiveSentences(sentences) {
    return sentences.filter((s) => PASSIVE_PATTERN.test(s)).length;
  }

  /** Find which formal transitions are actually present in the text */
  _findFormalTransitions(text) {
    const lower = text.toLowerCase();
    return FORMAL_TRANSITIONS.filter((t) => lower.includes(t));
  }

  /** Count how many hedging phrases appear */
  _countHedgingPhrases(text) {
    return HEDGING_PATTERNS.reduce((total, pattern) => {
      const matches = text.match(pattern);
      return total + (matches ? matches.length : 0);
    }, 0);
  }
}
