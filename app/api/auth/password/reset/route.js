import { NextResponse } from "next/server";
import { DB_READY } from "@/lib/db";
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from "@/lib/password";
import { resetPassword } from "@/lib/passwordReset";
import { createSession, sessionCookieOptions, SESSION_COOKIE } from "@/lib/session";

/**
 * POST /api/auth/password/reset — set a new password with an emailed token.
 *
 * Body: { token, password }
 *
 * On success, every existing session for the account is signed out and a fresh
 * one is started for this browser, so the user lands signed in.
 */

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

function fail(error, status = 400) {
  return NextResponse.json({ success: false, error }, { status, headers: NO_STORE });
}

export async function POST(request) {
  if (!DB_READY) return fail("Accounts are not available right now.", 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid JSON in request body.");
  }

  const token = typeof body?.token === "string" ? body.token.slice(0, 200) : "";
  const password = String(body?.password ?? "");

  if (password.length < MIN_PASSWORD_LENGTH) {
    return fail(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return fail(`Password must be under ${MAX_PASSWORD_LENGTH} characters.`);
  }

  try {
    const userId = await resetPassword(token, password);

    if (!userId) {
      return fail("This reset link is invalid, expired, or already used. Request a new one.", 400);
    }

    const sessionToken = await createSession(userId, request);
    const response = NextResponse.json({ success: true }, { headers: NO_STORE });
    response.cookies.set(SESSION_COOKIE, sessionToken, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("password reset failed:", error);
    return fail("Could not reset your password. Please try again.", 500);
  }
}
