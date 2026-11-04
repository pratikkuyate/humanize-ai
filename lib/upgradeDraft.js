/**
 * Keeps the user's text through the upgrade detour.
 *
 * Going Pro from the upgrade dialog means leaving the tool for signup and
 * checkout. Without this, whatever they had pasted is gone by the time they
 * come back, and they have to find it again.
 *
 * sessionStorage on purpose: it never leaves the browser, it is scoped to this
 * tab, and it is wiped when the tab closes — so "nothing you paste is stored"
 * still holds. It also survives the round trip through Google sign-in, which
 * happens in the same tab. The detector's "Humanize it" hand-off uses the same
 * mechanism.
 *
 * Browser-only.
 */

const KEY = "humanize_upgrade_draft";

// Long enough to sign up and pay; short enough that a stale draft does not
// reappear in a tab someone left open overnight.
const MAX_AGE_MS = 60 * 60 * 1000;

/**
 * @param {string} text
 */
export function saveDraft(text) {
  if (!text?.trim()) return;
  try {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ text, path: window.location.pathname, savedAt: Date.now() })
    );
  } catch {
    // Storage full or disabled (some private modes). Losing the draft is the
    // old behaviour, so there is nothing worse to fall back to.
  }
}

/** @returns {{ text: string, path: string } | null} */
function readDraft() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (typeof draft?.text !== "string" || Date.now() - draft.savedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    // Only ever a local path — it is used as a link target.
    const path =
      typeof draft.path === "string" && draft.path.startsWith("/") && !draft.path.startsWith("//")
        ? draft.path
        : "/";
    return { text: draft.text, path };
  } catch {
    return null;
  }
}

/** The page the draft came from, without consuming it. */
export function draftReturnPath() {
  return readDraft()?.path ?? null;
}

/** Read the draft once and clear it. */
export function takeDraft() {
  const draft = readDraft();
  if (draft) {
    try {
      sessionStorage.removeItem(KEY);
    } catch {}
  }
  return draft?.text ?? null;
}
