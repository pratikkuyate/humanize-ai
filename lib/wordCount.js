/**
 * The single word counter for the whole app.
 *
 * This module is imported by BOTH the browser (to draw the live counter) and the
 * API route (to enforce the limit). They must never disagree: if the visible
 * count and the enforced count drift apart, users type up to the number on
 * screen and then get rejected, which is the worst possible moment to lose them.
 *
 * That requirement rules out `Intl.Segmenter`, which looks like the right tool
 * but resolves against whatever ICU data the runtime ships — Node and the
 * browser can legitimately return different counts for the same string. It also
 * splits "state-of-the-art" into four words and chops URLs into pieces, neither
 * of which matches what a word processor shows.
 *
 * The rule below is plain regex, so it is byte-for-byte identical everywhere:
 *
 *   - Whitespace-delimited tokens count as one word each, so hyphenates, URLs,
 *     and contractions stay whole.
 *   - CJK characters count individually, because Chinese, Japanese, and Thai are
 *     not space-delimited and would otherwise score a whole document as 1 word.
 *     This matches how word processors handle CJK.
 */

/** Han, Hiragana, Katakana, CJK Extension A/B, and compatibility ideographs. */
const CJK_PATTERN =
  /[぀-ヿ㐀-䶿一-鿿豈-﫿\u{20000}-\u{2fa1f}]/gu;

/**
 * Count the words in a string.
 *
 * @param {string} text
 * @returns {number}
 */
export function countWords(text) {
  if (!text) return 0;

  const trimmed = text.trim();
  if (!trimmed) return 0;

  const cjkCharacters = trimmed.match(CJK_PATTERN)?.length ?? 0;

  // Blank out the CJK so it cannot glue Latin tokens together, then count what
  // is left by whitespace.
  const latinTokens = trimmed
    .replace(CJK_PATTERN, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  return latinTokens + cjkCharacters;
}

/**
 * The leading part of `text` that holds at most `maxWords` words, ended on a
 * sentence or line boundary where there is one, so a partial result never
 * stops mid-sentence. Falls back to a plain word boundary when the first
 * sentence alone is longer than `maxWords`.
 *
 * Counts with countWords, so the cut agrees with the limit shown on screen.
 * The prefix is returned exactly as written (minus trailing whitespace), which
 * makes the untouched remainder `text.slice(prefix.length)`.
 *
 * @param {string} text
 * @param {number} maxWords
 * @returns {string}
 */
export function takeWords(text, maxWords) {
  if (countWords(text) <= maxWords) return text;

  const token = /\S+\s*/g;
  let words = 0;
  let wordEnd = 0;
  let sentenceEnd = 0;

  for (let match = token.exec(text); match; match = token.exec(text)) {
    const n = countWords(match[0]);
    if (words + n > maxWords) break;
    words += n;
    wordEnd = match.index + match[0].length;
    // Ends a sentence (closing quotes or brackets allowed), or ends a line.
    if (/[.!?…]["'”’)\]]*\s*$/.test(match[0]) || /\n/.test(match[0])) {
      sentenceEnd = wordEnd;
    }
  }

  return text.slice(0, sentenceEnd || wordEnd).trimEnd();
}
