/**
 * Free-tier limits. Single source of truth for client and server.
 *
 * Both the browser and the API routes import from here so the number shown to
 * the user is always the number that gets enforced.
 */

/** Words allowed in a single request on the free tier. */
export const FREE_MAX_WORDS = 7_000;

/** Runs allowed per tool, per IP, per window, without an account. */
export const FREE_ATTEMPTS = 3;

/**
 * How long a used attempt is held before it frees up again, in seconds.
 *
 * ASSUMPTION — "3 attempts without logging in" did not specify a window, so this
 * defaults to a rolling 24 hours. A permanent lifetime cap is deliberately not
 * the default: quotas here are keyed by IP, and one office, school, or library
 * shares a single public address, so a lifetime cap would permanently lock out
 * an entire building on its third run. Change this one constant to adjust:
 *
 *   86_400   = daily reset (current)
 *   604_800  = weekly reset
 *   0        = never resets, i.e. a lifetime cap
 */
export const QUOTA_WINDOW_SECONDS = 86_400;

/** Minimum characters the humanizer accepts. Unchanged from the original API. */
export const MIN_LENGTH = 50;

/**
 * Hard character ceiling, independent of the word limit.
 *
 * Word counting a multi-megabyte paste is itself a cheap way to burn server CPU,
 * so this rejects absurd payloads before `countWords` ever runs. It sits well
 * above FREE_MAX_WORDS so a legitimate 7,000-word document never trips it.
 */
export const MAX_CHARACTERS = 120_000;

/** Tools that consume quota. Used as the KV key namespace. */
export const METERED_TOOLS = /** @type {const} */ ([
  "humanize",
  "detect",
  "clean",
]);
