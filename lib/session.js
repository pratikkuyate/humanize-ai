import { createHash, randomBytes } from "node:crypto";
import { sql, one } from "./db.js";

/**
 * Server-side sessions.
 *
 * The cookie holds a random 256-bit token and nothing else. What is stored in
 * the database is the SHA-256 of that token, never the token itself — so a
 * dump of the sessions table cannot be replayed as a set of live logins, the
 * same reasoning that applies to storing password hashes rather than passwords.
 *
 * A plain digest is right here where a password needs scrypt: the token is
 * already 256 bits of CSPRNG output, so there is no dictionary to attack and
 * nothing for a slow hash to buy.
 *
 * Server-only — imports node:crypto and the database client.
 */

export const SESSION_COOKIE = "sh_session";

/** How long a login lasts. Refreshed on use, so an active user is never logged out. */
const SESSION_DAYS = 30;

/** Re-extend a session only once it is inside this window, to avoid a write per request. */
const REFRESH_WITHIN_DAYS = 25;

const DAY_MS = 24 * 60 * 60 * 1000;

function digest(token) {
  return createHash("sha256").update(token).digest("hex");
}

/** Read our session cookie off a raw Request. */
export function readSessionToken(request) {
  const header = request.headers.get("cookie");
  if (!header) return null;

  return (
    header
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
      ?.slice(SESSION_COOKIE.length + 1) || null
  );
}

export function sessionCookieOptions(maxAgeSeconds = SESSION_DAYS * 24 * 60 * 60) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Lax, not Strict: Google's OAuth callback and Razorpay's redirect are both
    // cross-site navigations back into the app, and under Strict the browser
    // would withhold the cookie and the user would land back logged out.
    sameSite: /** @type {const} */ ("lax"),
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/**
 * Start a session for a user.
 *
 * @param {string} userId
 * @param {Request} [request] used only to record device metadata
 * @returns {Promise<string>} the raw token to put in the cookie
 */
export async function createSession(userId, request) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * DAY_MS);

  const userAgent = request?.headers.get("user-agent")?.slice(0, 500) ?? null;
  const forwarded = request?.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0].trim();
  const ipHash = ip
    ? createHash("sha256").update(`${ip}${process.env.QUOTA_SALT ?? ""}`).digest("hex").slice(0, 32)
    : null;

  await sql`
    INSERT INTO sessions (id, user_id, expires_at, user_agent, ip_hash)
    VALUES (${digest(token)}, ${userId}, ${expires.toISOString()}, ${userAgent}, ${ipHash})
  `;

  return token;
}

/**
 * Resolve a request to its signed-in user, plus their live Pro entitlement.
 *
 * Deliberately one query rather than three. Every metered API call needs to know
 * both "who is this" and "are they Pro", and on a serverless HTTP driver each
 * extra round trip is real latency on the request path.
 *
 * The LEFT JOIN collapses to the furthest-out expiry across all live
 * entitlement rows, which is what makes stacked purchases add up instead of
 * overwriting each other.
 *
 * @param {Request} request
 * @returns {Promise<{
 *   userId: string, email: string, name: string | null, imageUrl: string | null,
 *   hasPassword: boolean, proUntil: Date | null, expiresAt: Date, token: string
 * } | null>}
 */
export async function getSession(request) {
  const token = readSessionToken(request);
  if (!token) return null;

  const row = await one(sql`
    SELECT
      s.user_id,
      s.expires_at,
      u.email,
      u.name,
      u.image_url,
      u.password_hash IS NOT NULL AS has_password,
      (
        SELECT max(e.expires_at)
        FROM entitlements e
        WHERE e.user_id = u.id
          AND e.revoked_at IS NULL
          AND e.expires_at > now()
      ) AS pro_until
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ${digest(token)} AND s.expires_at > now()
  `);

  if (!row) return null;

  return {
    userId: row.user_id,
    email: row.email,
    name: row.name,
    imageUrl: row.image_url,
    hasPassword: row.has_password,
    proUntil: row.pro_until ? new Date(row.pro_until) : null,
    expiresAt: new Date(row.expires_at),
    token,
  };
}

/**
 * Whether a session is close enough to expiry to be worth extending.
 * Keeps active users signed in without writing to the database on every request.
 */
export function needsRefresh(session) {
  return session.expiresAt.getTime() - Date.now() < REFRESH_WITHIN_DAYS * DAY_MS;
}

/** Push a session's expiry back out to the full window. */
export async function refreshSession(token) {
  const expires = new Date(Date.now() + SESSION_DAYS * DAY_MS);
  await sql`
    UPDATE sessions SET expires_at = ${expires.toISOString()} WHERE id = ${digest(token)}
  `;
  return expires;
}

/** End one session. */
export async function destroySession(token) {
  if (!token) return;
  await sql`DELETE FROM sessions WHERE id = ${digest(token)}`;
}

/**
 * End every session for a user.
 *
 * Not called yet — it is the "sign out everywhere" primitive that a password
 * change or a compromised-account report will need, and the reason sessions are
 * server-side rows rather than self-contained tokens.
 */
export async function destroyAllSessions(userId) {
  await sql`DELETE FROM sessions WHERE user_id = ${userId}`;
}
