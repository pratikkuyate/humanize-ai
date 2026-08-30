import { NextResponse } from "next/server";
import { GOOGLE_READY, authorizationUrl, createState, safeNext } from "@/lib/google";

/**
 * GET /api/auth/google — start the Google sign-in flow.
 *
 * Redirects to Google's consent screen with a signed `state`, and drops that
 * same state in a short-lived cookie. The callback requires the two to match,
 * which is what proves the response came back to the browser that started the
 * flow rather than being fed in by someone else.
 */

export const dynamic = "force-dynamic";

export const GOOGLE_STATE_COOKIE = "sh_oauth_state";

export async function GET(request) {
  const url = new URL(request.url);

  if (!GOOGLE_READY) {
    return NextResponse.redirect(new URL("/login?error=google_unavailable", url.origin));
  }

  const next = safeNext(url.searchParams.get("next"));
  const state = createState(next);

  const response = NextResponse.redirect(authorizationUrl(state, request));

  response.cookies.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Lax so the cookie survives Google's cross-site redirect back to us.
    // Under Strict the callback would arrive without it and every sign-in
    // would fail the CSRF check.
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  return response;
}
