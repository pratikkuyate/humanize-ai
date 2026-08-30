import { createHmac, timingSafeEqual } from "node:crypto";
import { QUOTA_WINDOW_SECONDS } from "./freeTier.js";

/**
 * Cookie-backed quota state — the zero-infrastructure driver.
 *
 * Used whenever no Redis credentials are configured. Counts live in a single
 * signed, HttpOnly cookie instead of a shared store, which means:
 *
 *   - No external service, no account, no cost, nothing to go down.
 *   - The count is per-device rather than per-IP, so clearing cookies or opening
 *     a private window resets it.
 *
 * The signature stops someone editing the number without the secret; it does not
 * stop them throwing the cookie away. That is the accepted trade — this tier is
 * a prompt to sign up, not a security boundary. Real enforcement arrives with
 * accounts. See §1 of [PRICING-PLAN.md].
 */

export const COOKIE_NAME = "sh_quota";

/** Falls back to a constant so the driver still works before QUOTA_SALT is set. */
function secret() {
  return process.env.QUOTA_SALT || "simply-humanize-unsigned-fallback";
}

function sign(payload) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** Which fixed window we are in. Lets a stale cookie reset itself on read. */
export function currentBucket() {
  if (QUOTA_WINDOW_SECONDS === 0) return 0;
  return Math.floor(Date.now() / 1000 / QUOTA_WINDOW_SECONDS);
}

/**
 * @typedef {{ bucket: number, counts: Record<string, number> }} QuotaState
 */

/** @returns {QuotaState} */
function emptyState() {
  return { bucket: currentBucket(), counts: {} };
}

/**
 * Pull quota state out of the request's cookie header.
 *
 * Returns a fresh state when the cookie is absent, malformed, forged, or left
 * over from a previous window — all of which are indistinguishable from a first
 * visit as far as the user is concerned.
 *
 * @param {Request} request
 * @returns {QuotaState}
 */
export function readState(request) {
  const header = request.headers.get("cookie");
  if (!header) return emptyState();

  const raw = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);

  if (!raw) return emptyState();

  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return emptyState();

  // Constant-time compare, and guard the length check that timingSafeEqual
  // itself throws on.
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return emptyState();
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof parsed?.bucket !== "number" || typeof parsed?.counts !== "object") {
      return emptyState();
    }
    // A cookie from an earlier window is simply an expired one.
    if (parsed.bucket !== currentBucket()) return emptyState();
    return { bucket: parsed.bucket, counts: parsed.counts ?? {} };
  } catch {
    return emptyState();
  }
}

/**
 * Serialize state into the signed cookie value.
 *
 * @param {QuotaState} state
 */
export function writeState(state) {
  const payload = Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** Cookie attributes. HttpOnly so page scripts cannot rewrite the count. */
export function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: /** @type {const} */ ("lax"),
    path: "/",
    maxAge: QUOTA_WINDOW_SECONDS > 0 ? QUOTA_WINDOW_SECONDS : 60 * 60 * 24 * 365,
  };
}
