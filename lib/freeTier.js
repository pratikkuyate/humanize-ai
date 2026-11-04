/**
 * Free-tier limits. Single source of truth for client and server.
 *
 * Both the browser and the API routes import from here so the number shown to
 * the user is always the number that gets enforced.
 */

/** Words allowed in a single request on the free tier. */
export const FREE_MAX_WORDS = 1_000;

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

/**
 * Inputs above this many words are split into sections and take noticeably
 * longer. lib/gemini.js chunks at this size; the form and loading screen use it
 * to warn the user before and during a long run.
 */
export const LONG_DOCUMENT_WORDS = 3_000;

/** Minimum characters the humanizer accepts. Unchanged from the original API. */
export const MIN_LENGTH = 50;

/**
 * Hard character ceiling, independent of the word limit.
 *
 * Word counting a multi-megabyte paste is itself a cheap way to burn server CPU,
 * so this rejects absurd payloads before `countWords` ever runs. It sits far
 * above FREE_MAX_WORDS so a long Pro document never trips it.
 */
export const MAX_CHARACTERS = 120_000;

/**
 * Words humanized in a preview — what a free user gets once their runs for the
 * window are spent, with the rest of their text shown blurred behind an unlock
 * prompt. Capped at half the text too, so a short paste still leaves something
 * to unlock rather than coming back complete.
 */
export const PREVIEW_WORDS = 150;

/**
 * Previews allowed per window once the free runs are gone. Counted separately
 * from runs: without a cap, previews would be a way to humanize a whole
 * document 150 words at a time for free.
 */
export const FREE_PREVIEWS = 1;

/**
 * Tools that consume quota, and how many uses each gets per window. The keys
 * double as the KV key namespace.
 *
 * Only the humanizer is metered — it is the one call with real cost behind it.
 * `preview` is its post-limit allowance, not a separate tool. The AI detector
 * and watermark remover compute entirely in the browser, cost nothing to run,
 * and their pages promise no usage limit. Capping them would also undercut
 * their job as free link-earning tools.
 */
export const TOOL_LIMITS = { humanize: FREE_ATTEMPTS, preview: FREE_PREVIEWS };

export const METERED_TOOLS = /** @type {(keyof typeof TOOL_LIMITS)[]} */ (
  Object.keys(TOOL_LIMITS)
);
