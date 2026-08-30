import { NextResponse } from "next/server";
import { DB_READY } from "@/lib/db";
import { exchangeCode, readState, safeNext, GOOGLE_READY } from "@/lib/google";
import { findOrCreateGoogleUser } from "@/lib/users";
import { createSession, sessionCookieOptions, SESSION_COOKIE } from "@/lib/session";
import { GOOGLE_STATE_COOKIE } from "../route";

/**
 * GET /api/auth/google/callback — where Google returns the user.
 *
 * Every failure path lands back on /login with a short error code rather than
 * rendering a stack trace: this URL is reachable by anyone, and the details of
 * why an OAuth exchange failed are not something to publish.
 */

export const dynamic = "force-dynamic";

function backToLogin(origin, error) {
  return NextResponse.redirect(new URL(`/login?error=${error}`, origin));
}

export async function GET(request) {
  const url = new URL(request.url);
  const { origin } = url;

  if (!GOOGLE_READY || !DB_READY) return backToLogin(origin, "google_unavailable");

  // Google reports user-side failures here — most often the consent screen
  // being dismissed, which is a cancellation rather than an error.
  const googleError = url.searchParams.get("error");
  if (googleError) {
    return NextResponse.redirect(
      new URL(googleError === "access_denied" ? "/login" : "/login?error=google_failed", origin)
    );
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) return backToLogin(origin, "google_failed");

  // Both halves of the CSRF check: the state must carry our own signature, and
  // it must equal the copy held by this browser. Either alone is insufficient —
  // a signed state can be replayed at a victim, and a cookie comparison alone
  // could be satisfied by a value the attacker set.
  const cookieState = request.cookies.get(GOOGLE_STATE_COOKIE)?.value;
  const parsed = readState(state);

  if (!parsed || !cookieState || cookieState !== state) {
    return backToLogin(origin, "google_state");
  }

  try {
    // Same request, so this rebuilds the identical redirect_uri Google saw.
    const profile = await exchangeCode(code, request);
    const user = await findOrCreateGoogleUser(profile);
    const token = await createSession(user.id, request);

    const response = NextResponse.redirect(new URL(safeNext(parsed.next), origin));
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    // The state cookie has done its job; leaving it behind serves no purpose.
    response.cookies.set(GOOGLE_STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    if (error?.message === "UNVERIFIED_GOOGLE_EMAIL") {
      return backToLogin(origin, "google_unverified");
    }
    console.error("Google callback failed:", error);
    return backToLogin(origin, "google_failed");
  }
}
