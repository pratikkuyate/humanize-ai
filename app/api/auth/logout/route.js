import { NextResponse } from "next/server";
import {
  readSessionToken,
  destroySession,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/session";

/**
 * POST /api/auth/logout — end the current session.
 *
 * Deletes the server-side row as well as clearing the cookie. Clearing only the
 * cookie would leave a token that still works wherever it had been captured.
 */

export const dynamic = "force-dynamic";

export async function POST(request) {
  const token = readSessionToken(request);

  try {
    await destroySession(token);
  } catch (error) {
    // Still clear the cookie. The user asked to be signed out, and a database
    // we cannot reach should not leave them apparently still signed in.
    console.error("logout cleanup failed:", error);
  }

  const response = NextResponse.json(
    { success: true },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );

  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(0), maxAge: 0 });
  return response;
}
