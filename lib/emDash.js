/**
 * Em dash replacement used by the em dash remover tool.
 *
 * AI models lean on the em dash far more than most people do, and it is one of
 * the most recognised "this was written by ChatGPT" tells. Deleting the dash is
 * not enough — the sentence still needs a pause — so every style below swaps
 * it for ordinary punctuation instead.
 *
 * Pure and synchronous so it runs client-side with no API call, like
 * [lib/watermarkChars.js] and [lib/aiScore.js].
 */

const EM = "—";

/**
 * Horizontal whitespace that can sit around a dash. Includes the narrow
 * no-break space (U+202F) and hair/thin spaces models emit next to em dashes.
 * Deliberately excludes newlines so paragraphs are never merged.
 */
const WS = "[ \\t\\u00A0\\u202F\\u2009\\u200A]";

const DASH_WITH_SPACES = new RegExp(`${WS}*${EM}${WS}*`, "g");

/**
 * Characters used *as* em dashes. Only the spaced forms are caught, so number
 * ranges ("2019–2024") and command-line flags ("--version") are left alone.
 */
const SPACED_EN_DASH = new RegExp(`${WS}+\\u2013${WS}+`, "g");
const DOUBLE_HYPHEN = /(?<=[\p{L}\p{N}])--(?=[\p{L}\p{N}])|[ \t]+--[ \t]+/gu;

/**
 * @typedef {"comma" | "parentheses" | "period" | "hyphen"} EmDashStyle
 */

/** Replacement styles, in the order the tool offers them. */
export const EM_DASH_STYLES = [
  {
    id: "comma",
    label: "Commas",
    example: "The tool, which runs locally, is free.",
    hint: "Safest default. Works for single dashes and paired asides alike.",
  },
  {
    id: "parentheses",
    label: "Parentheses",
    example: "The tool (which runs locally) is free.",
    hint: "Paired dashes become a bracketed aside; single dashes become commas.",
  },
  {
    id: "period",
    label: "Periods",
    example: "The tool runs locally. It is free.",
    hint: "Splits into shorter sentences. Review paired asides by hand.",
  },
  {
    id: "hyphen",
    label: "Spaced hyphen",
    example: "The tool - which runs locally - is free.",
    hint: "Keeps the rhythm, uses a plain keyboard hyphen.",
  },
];

const PUNCT = /[,;:.!?]/;

/**
 * The text that should replace one dash, given its neighbours. Only the
 * dash's own surroundings are inspected, so the rest of the user's text —
 * including deliberate spacing such as French "Bonjour !" — is never touched.
 *
 * @param {string} prev Character before the dash ("" at start of text).
 * @param {string} next Character after the dash ("" at end of text).
 * @param {string} filler What a mid-sentence dash becomes, e.g. ", ".
 */
function pause(prev, next, filler) {
  if (PUNCT.test(next) || next === ")") return ""; //    "word—." → "word."
  if (PUNCT.test(prev)) return " "; //                   "end.—Next" → "end. Next"
  return filler;
}

/**
 * Replace every remaining dash token with `filler`, punctuation-aware.
 *
 * @param {string} text
 * @param {string} filler
 * @param {(next: string) => string} [after] Transform for the character after the dash.
 */
function replaceTokens(text, filler, after) {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== EM) {
      out += text[i];
      continue;
    }
    const prev = out.slice(-1);
    const next = text[i + 1] ?? "";
    const replacement = pause(prev, next, filler);
    out += replacement;
    if (after && replacement === filler && next) {
      out += after(next);
      i += 1;
    }
  }
  return out;
}

/**
 * Replace em dashes (and, optionally, characters typed as em dashes) with
 * ordinary punctuation.
 *
 * @param {string} text
 * @param {{ style?: EmDashStyle, includeLookalikes?: boolean }} [options]
 * @returns {{ cleaned: string, count: number, emDashCount: number, lookalikeCount: number, pairCount: number, changed: boolean }}
 */
export function replaceEmDashes(text, options = {}) {
  const { style = "comma", includeLookalikes = true } = options;

  if (!text) {
    return { cleaned: "", count: 0, emDashCount: 0, lookalikeCount: 0, pairCount: 0, changed: false };
  }

  let work = text;
  let lookalikeCount = 0;

  if (includeLookalikes) {
    work = work.replace(SPACED_EN_DASH, () => {
      lookalikeCount += 1;
      return EM;
    });
    work = work.replace(DOUBLE_HYPHEN, () => {
      lookalikeCount += 1;
      return EM;
    });
  }

  const emDashCount = (text.match(/—/g) || []).length;

  // Collapse "word — word", "word—word", "word — word" to one token.
  work = work.replace(DASH_WITH_SPACES, EM);
  const count = (work.match(/—/g) || []).length;

  // A dash opening a line is a list bullet or dialogue marker; a dash closing
  // one is a trailing-off. Neither is a mid-sentence pause.
  work = work.replace(/^—/gm, "- ").replace(/—$/gm, "");

  let pairCount = 0;
  if (style === "parentheses") {
    // Two dashes in the same sentence enclose an aside. The closing bracket
    // takes a trailing space only when a word (not punctuation) follows.
    work = work.replace(/—([^—.!?\n]+?)—(.?)/g, (_, aside, next) => {
      pairCount += 1;
      const inner = aside.trim();
      const wrapped = /^\(.*\)$/.test(inner) ? inner : `(${inner})`;
      const gap = next && !PUNCT.test(next) ? " " : "";
      return ` ${wrapped}${gap}${next}`;
    });
    work = replaceTokens(work, ", ");
  } else if (style === "period") {
    work = replaceTokens(work, ". ", (next) => next.toUpperCase());
  } else if (style === "hyphen") {
    work = replaceTokens(work, " - ");
  } else {
    work = replaceTokens(work, ", ");
  }

  const cleaned = work;

  return {
    cleaned,
    count,
    emDashCount,
    lookalikeCount,
    pairCount,
    changed: cleaned !== text,
  };
}
