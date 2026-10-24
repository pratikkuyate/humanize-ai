/**
 * Funnel events, sent to GA4 (and mirrored to Clarity so session recordings can
 * be filtered by what the visitor did).
 *
 * Client-only and fire-and-forget: if gtag is blocked or not loaded yet, the
 * call is a silent no-op — analytics must never break a tool.
 *
 * Params carry counts, tool names, and outcomes only. NEVER pass the user's
 * text or anything derived from it beyond a number: every page promises that
 * pasted text is not stored or shared, and an analytics payload is both.
 *
 * Event names follow GA4's snake_case convention. `sign_up` and `purchase` are
 * GA4 recommended events, so they light up the built-in reports without extra
 * configuration. Mark `humanize_success`, `sign_up`, and `purchase` as key
 * events in the GA4 admin.
 *
 * @param {string} name
 * @param {Record<string, string | number | boolean | undefined>} [params]
 */
export function track(name, params = {}) {
  if (typeof window === "undefined") return;

  try {
    if (typeof window.gtag === "function") window.gtag("event", name, params);
  } catch {}

  try {
    if (typeof window.clarity === "function") window.clarity("event", name);
  } catch {}
}

/**
 * Round a word count into a coarse bucket, so reports group runs by size
 * without recording an exact count per document.
 *
 * @param {number} words
 */
export function wordBucket(words) {
  if (words < 250) return "<250";
  if (words < 500) return "250-499";
  if (words < 1000) return "500-999";
  if (words < 2000) return "1000-1999";
  if (words < 4000) return "2000-3999";
  return "4000+";
}
