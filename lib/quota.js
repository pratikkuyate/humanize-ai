import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import { FREE_ATTEMPTS, QUOTA_WINDOW_SECONDS, METERED_TOOLS } from "./freeTier.js";
import {
  COOKIE_NAME,
  readState,
  writeState,
  cookieOptions,
  currentBucket,
} from "./quotaCookie.js";
import { DB_READY } from "./db.js";
import { SESSION_COOKIE, getSession } from "./session.js";

/**
 * Free-tier metering, behind one interface with two interchangeable drivers.
 *
 *   redis  — counts per IP in Upstash / Vercel KV. Survives cookie clearing.
 *            Active whenever credentials are present.
 *   cookie — counts per device in a signed HttpOnly cookie. No external service,
 *            no cost. The automatic fallback when no credentials are set.
 *
 * Callers never branch on the driver: every function returns the same shape, and
 * `applyQuota(response, quota)` writes whatever the driver needs onto the
 * response. Adding Upstash credentials later upgrades enforcement with no code
 * change anywhere else.
 *
 * Server-only — imports node:crypto and must never reach a client bundle. The
 * browser talks to this through /api/quota.
 */

const url =
  process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "";
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "";

const redis = url && token ? new Redis({ url, token }) : null;

/** @type {"redis" | "cookie"} */
export const QUOTA_DRIVER = redis ? "redis" : "cookie";

/**
 * Crawlers must never consume quota or receive a 429. Serving rate-limit errors
 * to Googlebot is a crawl-health signal we actively do not want, and the AI
 * crawlers are welcomed explicitly in [app/robots.js].
 */
const BOT_PATTERN =
  /bot|crawl|spider|slurp|bingpreview|gptbot|claudebot|claude-web|anthropic-ai|perplexity|duckduckbot|baiduspider|yandex|facebookexternalhit|ia_archiver|lighthouse|headlesschrome/i;

/**
 * @typedef {Object} QuotaResult
 * @property {boolean}  allowed    Whether the caller may proceed.
 * @property {number}   remaining  Runs left in the current window.
 * @property {number}   limit      Total runs per window.
 * @property {string=}  resetAt    ISO timestamp when the window rolls over.
 * @property {boolean}  metered    False when metering is off (bot or unmeasurable).
 * @property {string=}  cookie     Cookie value the response must carry (cookie driver).
 */

function unmetered(extra = {}) {
  return {
    allowed: true,
    remaining: FREE_ATTEMPTS,
    limit: FREE_ATTEMPTS,
    metered: false,
    pro: false,
    ...extra,
  };
}

/**
 * Does this request carry a live Pro pass?
 *
 * Ordered to cost a signed-out visitor nothing. The overwhelming majority of
 * traffic here is anonymous, so the cheap header check runs first and the
 * database is only touched once a session cookie is actually present.
 *
 * Fails closed to "not Pro" on any error, which degrades a subscriber to the
 * free tier during an outage rather than handing everyone unlimited access.
 *
 * @param {Request} request
 * @returns {Promise<{ pro: boolean, proUntil?: string, userId?: string }>}
 */
export async function proStatus(request) {
  if (!DB_READY) return { pro: false };

  // Cheap gate: no session cookie means no account, so no query.
  const cookies = request.headers.get("cookie") ?? "";
  if (!cookies.includes(`${SESSION_COOKIE}=`)) return { pro: false };

  try {
    const session = await getSession(request);
    if (!session?.proUntil) return { pro: false, userId: session?.userId };

    return {
      pro: session.proUntil.getTime() > Date.now(),
      proUntil: session.proUntil.toISOString(),
      userId: session.userId,
    };
  } catch {
    return { pro: false };
  }
}

function resetAtIso() {
  if (QUOTA_WINDOW_SECONDS === 0) return undefined;
  const next = (currentBucket() + 1) * QUOTA_WINDOW_SECONDS;
  return new Date(next * 1000).toISOString();
}

/** @param {number} used */
function toResult(used, extra = {}) {
  return {
    allowed: used <= FREE_ATTEMPTS,
    remaining: Math.max(0, FREE_ATTEMPTS - used),
    limit: FREE_ATTEMPTS,
    resetAt: resetAtIso(),
    metered: true,
    pro: false,
    ...extra,
  };
}

/** Requests we refuse to meter at all, whichever driver is active. */
function eligible(request, tool) {
  if (!METERED_TOOLS.includes(/** @type {any} */ (tool))) return false;
  const userAgent = request.headers.get("user-agent") ?? "";
  return !BOT_PATTERN.test(userAgent);
}

// ─── Redis driver ─────────────────────────────────────────────────────────────

/**
 * Resolve the client IP behind Vercel's proxy.
 *
 * `x-forwarded-for` is a comma-separated chain and only the FIRST entry is the
 * real client — everything after it is appended by proxies and is trivially
 * spoofable by the caller.
 */
function clientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : (request.headers.get("x-real-ip") ?? "").trim();

  if (!ip) return "";

  // Bucket IPv6 to its /64 prefix. Many carriers hand out a fresh address per
  // connection within the same /64, so keying on the full address would give a
  // single phone unlimited free runs.
  if (ip.includes(":")) return ip.split(":").slice(0, 4).join(":");
  return ip;
}

function redisKey(tool, ip) {
  // A raw IP is personal data. Only ever store a salted digest of it.
  const hash = createHash("sha256")
    .update(`${ip}${process.env.QUOTA_SALT ?? ""}`)
    .digest("hex")
    .slice(0, 32);
  const window = QUOTA_WINDOW_SECONDS === 0 ? "lifetime" : currentBucket();
  return `q:${tool}:${hash}:${window}`;
}

// ─── Public interface ─────────────────────────────────────────────────────────

/**
 * Read the current quota without spending an attempt.
 *
 * @param {Request} request
 * @param {string} tool
 * @returns {Promise<QuotaResult>}
 */
export async function peekQuota(request, tool) {
  if (!eligible(request, tool)) return unmetered();

  const { pro, proUntil } = await proStatus(request);
  if (pro) return unmetered({ pro: true, proUntil });

  if (QUOTA_DRIVER === "cookie") {
    return toResult(readState(request).counts[tool] ?? 0);
  }

  const ip = clientIp(request);
  if (!ip) return unmetered();

  try {
    return toResult(Number((await redis.get(redisKey(tool, ip))) ?? 0));
  } catch {
    // Fail open — a KV outage silently breaking the headline tool costs far more
    // than the handful of ungated runs it lets through.
    return unmetered();
  }
}

/**
 * Spend one attempt and report what is left.
 *
 * @param {Request} request
 * @param {string} tool
 * @returns {Promise<QuotaResult>}
 */
export async function consumeQuota(request, tool) {
  if (!eligible(request, tool)) return unmetered();

  // Pro spends nothing, checked before any counter is touched.
  //
  // One consequence worth knowing: a user who spent free runs before upgrading
  // still has that count sitting in their cookie, so when the pass expires they
  // resume from it rather than from zero. It clears itself at the next window
  // rollover — at most a day — which is not worth a reset path to avoid.
  const { pro, proUntil } = await proStatus(request);
  if (pro) return unmetered({ pro: true, proUntil });

  if (QUOTA_DRIVER === "cookie") {
    const state = readState(request);
    const used = (state.counts[tool] ?? 0) + 1;
    state.counts[tool] = used;
    return toResult(used, { cookie: writeState(state) });
  }

  const ip = clientIp(request);
  if (!ip) return unmetered();

  try {
    // Increment first and compare after, so two requests racing from the same IP
    // cannot both read "1 remaining" and both proceed.
    const used = await redis.incr(redisKey(tool, ip));

    // Only the first write in a window sets the TTL; re-setting it on every
    // request would slide the window forward and the quota would never reset.
    if (used === 1 && QUOTA_WINDOW_SECONDS > 0) {
      await redis.expire(redisKey(tool, ip), QUOTA_WINDOW_SECONDS);
    }

    return toResult(used);
  } catch {
    return unmetered();
  }
}

/**
 * Give back an attempt taken by a run that then failed for our reasons.
 *
 * Without this, a Gemini outage burns the user's free runs on responses they
 * never received. Returns a result the caller must apply to the response, since
 * under the cookie driver the refund only exists once the cookie is rewritten.
 *
 * @param {Request} request
 * @param {string} tool
 * @returns {Promise<QuotaResult>}
 */
export async function refundQuota(request, tool) {
  if (!eligible(request, tool)) return unmetered();

  // Nothing was spent, so there is nothing to give back.
  const { pro, proUntil } = await proStatus(request);
  if (pro) return unmetered({ pro: true, proUntil });

  if (QUOTA_DRIVER === "cookie") {
    const state = readState(request);
    const used = Math.max(0, (state.counts[tool] ?? 0) - 1);
    state.counts[tool] = used;
    return toResult(used, { cookie: writeState(state) });
  }

  const ip = clientIp(request);
  if (!ip) return unmetered();

  try {
    const used = await redis.decr(redisKey(tool, ip));
    if (used < 0) {
      await redis.set(redisKey(tool, ip), 0);
      return toResult(0);
    }
    return toResult(used);
  } catch {
    return unmetered();
  }
}

/**
 * Attach everything the driver needs to a response: standard rate-limit headers,
 * plus the quota cookie when the cookie driver is active.
 *
 * @template {import('next/server').NextResponse} T
 * @param {T} response
 * @param {QuotaResult} quota
 * @returns {T}
 */
export function applyQuota(response, quota) {
  if (!quota?.metered) return response;

  response.headers.set("X-RateLimit-Limit", String(quota.limit));
  response.headers.set("X-RateLimit-Remaining", String(quota.remaining));
  if (quota.resetAt) response.headers.set("X-RateLimit-Reset", quota.resetAt);

  if (quota.cookie) {
    response.cookies.set(COOKIE_NAME, quota.cookie, cookieOptions());
  }

  return response;
}

/** Strip driver-internal fields before a quota object goes over the wire. */
export function publicQuota(quota) {
  return {
    allowed: quota.allowed,
    remaining: quota.remaining,
    limit: quota.limit,
    resetAt: quota.resetAt,
    metered: quota.metered,
    pro: Boolean(quota.pro),
    proUntil: quota.proUntil,
  };
}
