import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Google Sign-In over the plain OAuth 2.0 authorization-code flow.
 *
 * Written out rather than pulled from a library because the whole flow is two
 * redirects and one token exchange, and an auth dependency would be far more
 * code than this to audit.
 *
 * Server-only.
 */

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";

/** True when Google sign-in can be offered. The UI hides the button otherwise. */
export const GOOGLE_READY = Boolean(CLIENT_ID && CLIENT_SECRET);

/**
 * The origin a request actually arrived on.
 *
 * Behind Vercel's proxy `request.url` can carry an internal host, so the
 * forwarded headers win when present.
 */
function originFrom(request) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  if (host) {
    const proto =
      request.headers.get("x-forwarded-proto") ??
      (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
    return `${proto}://${host}`;
  }

  try {
    return new URL(request.url).origin;
  } catch {
    return "";
  }
}

/**
 * Where Google sends the user back. Must match a Console entry exactly.
 *
 * Derived from the incoming request rather than from NEXT_PUBLIC_SITE_URL,
 * because that variable names the *canonical* site — so running on localhost
 * against a production-shaped env file sent Google the deployed URL and every
 * local sign-in died with `redirect_uri_mismatch`. Following the actual host
 * means localhost, previews, and production each work with no env juggling.
 *
 * Deriving a redirect target from a request header would normally deserve
 * suspicion, since the Host header is caller-controlled. It is safe here
 * precisely because we are not the one enforcing it: Google only honours a URI
 * that appears in the client's registered list, so a forged host produces the
 * same mismatch error rather than a redirect anywhere useful.
 *
 * @param {Request} [request] omit only where no request exists; falls back to
 *   the configured site URL.
 */
export function redirectUri(request) {
  const base = (
    (request && originFrom(request)) ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");

  return `${base}/api/auth/google/callback`;
}

function secret() {
  return process.env.QUOTA_SALT || "simply-humanize-unsigned-fallback";
}

/**
 * The `state` parameter, which is the CSRF defence for the whole flow.
 *
 * Without it, an attacker can send a victim a callback URL carrying the
 * attacker's own authorization code, and the victim silently ends up signed
 * into the attacker's account — where anything they then do is visible to its
 * owner.
 *
 * Rather than storing pending states server-side, the value is self-verifying:
 * random nonce + expiry + intended landing path, HMAC-signed. The cookie set
 * alongside it is what proves the callback belongs to the browser that started
 * the flow.
 *
 * @param {string} next path to land on after sign-in
 */
export function createState(next = "/account") {
  const payload = Buffer.from(
    JSON.stringify({
      n: randomBytes(16).toString("base64url"),
      // 10 minutes is far longer than a sign-in takes and short enough that a
      // leaked state is useless by the time it is found.
      exp: Date.now() + 10 * 60 * 1000,
      next: safeNext(next),
    }),
    "utf8"
  ).toString("base64url");

  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

/**
 * @param {string} state
 * @returns {{ next: string } | null} null when forged, malformed, or expired
 */
export function readState(state) {
  if (!state) return null;

  const [payload, signature] = String(state).split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(
    createHmac("sha256", secret()).update(payload).digest("base64url")
  );
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof parsed?.exp !== "number" || Date.now() > parsed.exp) return null;
    return { next: safeNext(parsed.next) };
  } catch {
    return null;
  }
}

/**
 * Constrain the post-login redirect to a path on this site.
 *
 * `?next=` is attacker-controllable, so without this the sign-in page becomes an
 * open redirect: a link that genuinely signs the user in and then drops them on
 * a lookalike site, carrying all the trust of having started on the real domain.
 * `//evil.com` is rejected too — browsers read it as protocol-relative and it
 * would leave the site just as effectively as a full URL.
 */
export function safeNext(next) {
  const value = String(next ?? "");
  if (!value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

/**
 * Build the URL that starts the flow.
 *
 * @param {string} state
 * @param {Request} [request] used to derive the redirect URI
 */
export function authorizationUrl(state, request) {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri(request),
    response_type: "code",
    scope: "openid email profile",
    state,
    // Always show the picker: without it, someone signed into several Google
    // accounts is silently assigned whichever one Google considers default.
    prompt: "select_account",
  });

  return `${AUTH_ENDPOINT}?${params}`;
}

/**
 * Swap the authorization code for tokens, then read the profile.
 *
 * The userinfo endpoint is used rather than decoding the id_token locally: the
 * token arrived over a direct, authenticated, TLS-pinned call to Google, so a
 * second Google-signed round trip is more trustworthy than hand-rolled JWT
 * verification here.
 *
 * Google requires the redirect_uri here to be byte-identical to the one sent when
 * the flow started, so the same request-derived value must reach both.
 *
 * @param {string} code
 * @param {Request} [request] used to derive the redirect URI
 * @returns {Promise<{ providerUserId: string, email: string, name?: string,
 *                     picture?: string, emailVerified: boolean }>}
 */
export async function exchangeCode(code, request) {
  const tokenResponse = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: redirectUri(request),
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenResponse.json().catch(() => ({}));

  if (!tokenResponse.ok || !tokens.access_token) {
    throw new Error(
      `Google token exchange failed: ${tokens?.error_description ?? tokenResponse.status}`
    );
  }

  const profileResponse = await fetch(USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!profileResponse.ok) {
    throw new Error(`Google profile lookup failed: HTTP ${profileResponse.status}`);
  }

  const profile = await profileResponse.json();

  if (!profile.sub || !profile.email) {
    throw new Error("Google returned a profile without a subject or email.");
  }

  return {
    providerUserId: profile.sub,
    email: profile.email,
    name: profile.name,
    picture: profile.picture,
    emailVerified: Boolean(profile.email_verified),
  };
}
