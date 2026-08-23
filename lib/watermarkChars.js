/**
 * Hidden-character catalog and cleaner used by the Claude watermark remover.
 *
 * Anthropic does not stamp a cryptographic watermark into Claude's text output.
 * What people call a "Claude watermark" is two separate things:
 *
 *   1. Invisible Unicode characters that ride along with copy-pasted output —
 *      most commonly the narrow no-break space (U+202F) that models emit around
 *      em dashes, plus zero-width joiners, bidi marks, and the Unicode Tags
 *      block (U+E0000-U+E007F), which can encode arbitrary hidden data.
 *   2. Visible typography fingerprints — em dashes, curly quotes, the single
 *      ellipsis glyph — that survive every paraphrase.
 *
 * Everything here is pure and synchronous so it can run client-side with no
 * API call, mirroring the approach in [lib/aiScore.js].
 */

/** Characters that carry no width and are deleted outright. */
const ZERO_WIDTH = [
  { cp: 0x200b, code: "U+200B", name: "Zero-width space" },
  { cp: 0x200c, code: "U+200C", name: "Zero-width non-joiner" },
  { cp: 0x200d, code: "U+200D", name: "Zero-width joiner" },
  { cp: 0x2060, code: "U+2060", name: "Word joiner" },
  { cp: 0xfeff, code: "U+FEFF", name: "Zero-width no-break space (BOM)" },
  { cp: 0x00ad, code: "U+00AD", name: "Soft hyphen" },
  { cp: 0x034f, code: "U+034F", name: "Combining grapheme joiner" },
  { cp: 0x180e, code: "U+180E", name: "Mongolian vowel separator" },
  { cp: 0x061c, code: "U+061C", name: "Arabic letter mark" },
  { cp: 0x200e, code: "U+200E", name: "Left-to-right mark" },
  { cp: 0x200f, code: "U+200F", name: "Right-to-left mark" },
  { cp: 0x202a, code: "U+202A", name: "Left-to-right embedding" },
  { cp: 0x202b, code: "U+202B", name: "Right-to-left embedding" },
  { cp: 0x202c, code: "U+202C", name: "Pop directional formatting" },
  { cp: 0x202d, code: "U+202D", name: "Left-to-right override" },
  { cp: 0x202e, code: "U+202E", name: "Right-to-left override" },
  { cp: 0x2066, code: "U+2066", name: "Left-to-right isolate" },
  { cp: 0x2067, code: "U+2067", name: "Right-to-left isolate" },
  { cp: 0x2068, code: "U+2068", name: "First strong isolate" },
  { cp: 0x2069, code: "U+2069", name: "Pop directional isolate" },
];

/**
 * Unusual space characters. These are visible as whitespace but are not the
 * plain ASCII space, so they survive as a fingerprint - U+202F in particular is
 * the single most common hidden marker in Claude and ChatGPT output.
 */
const SPACE_LIKE = [
  { cp: 0x00a0, code: "U+00A0", name: "No-break space" },
  { cp: 0x202f, code: "U+202F", name: "Narrow no-break space" },
  { cp: 0x2000, code: "U+2000", name: "En quad" },
  { cp: 0x2001, code: "U+2001", name: "Em quad" },
  { cp: 0x2002, code: "U+2002", name: "En space" },
  { cp: 0x2003, code: "U+2003", name: "Em space" },
  { cp: 0x2004, code: "U+2004", name: "Three-per-em space" },
  { cp: 0x2005, code: "U+2005", name: "Four-per-em space" },
  { cp: 0x2006, code: "U+2006", name: "Six-per-em space" },
  { cp: 0x2007, code: "U+2007", name: "Figure space" },
  { cp: 0x2008, code: "U+2008", name: "Punctuation space" },
  { cp: 0x2009, code: "U+2009", name: "Thin space" },
  { cp: 0x200a, code: "U+200A", name: "Hair space" },
  { cp: 0x205f, code: "U+205F", name: "Medium mathematical space" },
  { cp: 0x1680, code: "U+1680", name: "Ogham space mark" },
  { cp: 0x3000, code: "U+3000", name: "Ideographic space" },
];

/**
 * The Unicode Tags block. Every character in it renders as nothing at all,
 * which makes it the usual carrier for deliberately hidden payloads.
 */
const TAG_BLOCK = { start: 0xe0000, end: 0xe007f };

const ZERO_WIDTH_BY_CP = new Map(ZERO_WIDTH.map((c) => [c.cp, c]));
const SPACE_LIKE_BY_CP = new Map(SPACE_LIKE.map((c) => [c.cp, c]));

/** Visible glyphs models favour, and what to swap them for. */
const TYPOGRAPHY = [
  { pattern: /\s*—\s*/g, replacement: " - ", code: "U+2014", name: "Em dash" },
  { pattern: /–/g, replacement: "-", code: "U+2013", name: "En dash" },
  { pattern: /[‘’‚‛]/g, replacement: "'", code: "U+2018/19", name: "Curly single quote" },
  { pattern: /[“”„‟]/g, replacement: '"', code: "U+201C/1D", name: "Curly double quote" },
  { pattern: /…/g, replacement: "...", code: "U+2026", name: "Ellipsis glyph" },
  { pattern: /′/g, replacement: "'", code: "U+2032", name: "Prime" },
  { pattern: /″/g, replacement: '"', code: "U+2033", name: "Double prime" },
  { pattern: /[−‐‑]/g, replacement: "-", code: "U+2212", name: "Minus / non-ASCII hyphen" },
];

const PICTOGRAPHIC = /\p{Extended_Pictographic}/u;
const VARIATION_SELECTOR = 0xfe0f;

/**
 * Is the joiner at `index` doing real work rather than hiding in prose?
 *
 * U+200D welds emoji sequences together and U+200C separates letters in scripts
 * such as Persian, Hindi, and Malayalam. In both cases the neighbours tell us
 * whether the character is structural or just a stray marker.
 *
 * @param {string[]} chars Text split into code points.
 * @param {number} index
 */
function isMeaningfulJoiner(chars, index) {
  const cp = /** @type {number} */ (chars[index].codePointAt(0));
  if (cp !== 0x200d && cp !== 0x200c) return false;

  // Skip past any variation selector sitting between the joiner and the glyph.
  let before = index - 1;
  while (before >= 0 && chars[before].codePointAt(0) === VARIATION_SELECTOR) before--;
  const prev = before >= 0 ? chars[before] : "";
  const next = index + 1 < chars.length ? chars[index + 1] : "";
  if (!prev || !next) return false;

  if (cp === 0x200d) {
    return PICTOGRAPHIC.test(prev) && PICTOGRAPHIC.test(next);
  }

  // U+200C: keep it only inside non-Latin script, where it is a real spelling
  // device rather than an artifact of copy-pasted model output.
  const isComplexLetter = (c) =>
    /\p{L}/u.test(c) && /** @type {number} */ (c.codePointAt(0)) > 0x24f;
  return isComplexLetter(prev) && isComplexLetter(next);
}

/**
 * @typedef {Object} Finding
 * @property {string} code   Unicode code point label, e.g. "U+202F".
 * @property {string} name   Human-readable character name.
 * @property {number} count  How many occurrences were found.
 * @property {string} action What the cleaner did with it.
 * @property {"invisible" | "spacing" | "typography"} group
 */

/**
 * Strip hidden characters (and optionally normalize AI typography) from text.
 *
 * @param {string} text
 * @param {{ normalizeTypography?: boolean }} [options]
 * @returns {{ cleaned: string, findings: Finding[], hiddenCount: number, typographyCount: number, changed: boolean }}
 */
export function removeWatermark(text, options = {}) {
  const { normalizeTypography = true } = options;

  if (!text) {
    return { cleaned: "", findings: [], hiddenCount: 0, typographyCount: 0, changed: false };
  }

  /** @type {Map<string, Finding>} */
  const found = new Map();

  /**
   * @param {{ code: string, name: string }} char
   * @param {string} action
   * @param {Finding["group"]} group
   */
  function record(char, action, group) {
    const existing = found.get(char.code);
    if (existing) {
      existing.count += 1;
      return;
    }
    found.set(char.code, { code: char.code, name: char.name, count: 1, action, group });
  }

  // Pass 1 - walk by code point so astral characters (the Tags block) survive
  // the trip through the string index intact.
  const chars = Array.from(text);
  let cleaned = "";
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const cp = /** @type {number} */ (char.codePointAt(0));

    if (cp >= TAG_BLOCK.start && cp <= TAG_BLOCK.end) {
      record(
        { code: "U+E0000-E007F", name: "Unicode tag character (hidden data)" },
        "removed",
        "invisible"
      );
      continue;
    }

    const zeroWidth = ZERO_WIDTH_BY_CP.get(cp);
    if (zeroWidth) {
      // A zero-width joiner between two pictographs is load-bearing: it is what
      // welds an emoji sequence together. Stripping it would split a family
      // emoji into three people, so leave those alone.
      if (isMeaningfulJoiner(chars, i)) {
        cleaned += char;
        continue;
      }
      record(zeroWidth, "removed", "invisible");
      continue;
    }

    const spaceLike = SPACE_LIKE_BY_CP.get(cp);
    if (spaceLike) {
      record(spaceLike, "replaced with a normal space", "spacing");
      cleaned += " ";
      continue;
    }

    cleaned += char;
  }

  const hiddenCount = [...found.values()].reduce((sum, f) => sum + f.count, 0);

  // Pass 2 - visible fingerprints, only when the user asks for it.
  let typographyCount = 0;
  if (normalizeTypography) {
    for (const rule of TYPOGRAPHY) {
      const matches = cleaned.match(rule.pattern);
      if (!matches) continue;
      typographyCount += matches.length;
      found.set(rule.code, {
        code: rule.code,
        name: rule.name,
        count: matches.length,
        action: "normalized",
        group: "typography",
      });
      cleaned = cleaned.replace(rule.pattern, rule.replacement);
    }
    // Em-dash expansion can leave doubled spaces behind.
    cleaned = cleaned.replace(/ {2,}/g, " ");
  }

  const findings = [...found.values()].sort((a, b) => b.count - a.count);

  return {
    cleaned,
    findings,
    hiddenCount,
    typographyCount,
    changed: cleaned !== text,
  };
}

/** Total number of distinct hidden characters the cleaner knows about. */
export const KNOWN_CHAR_COUNT =
  ZERO_WIDTH.length + SPACE_LIKE.length + (TAG_BLOCK.end - TAG_BLOCK.start + 1);
