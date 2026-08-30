import { NextResponse } from "next/server";
import { DB_READY } from "@/lib/db";
import { findUserByEmail, normalizeEmail } from "@/lib/users";
import { verifyPassword, hashPassword } from "@/lib/password";
import { createSession, sessionCookieOptions, SESSION_COOKIE } from "@/lib/session";

/**
 * POST /api/auth/login — exchange email + password for a session.
 *
 * Body: { email, password }
 */

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/**
 * One message for every failure, on purpose.
 *
 * Distinguishing "no such account" from "wrong password" turns the login form
 * into a way to test whether any given address is registered here.
 */
const INVALID = "Email or password is incorrect.";

function fail(error, status) {
  return NextResponse.json({ success: false, error }, { status, headers: NO_STORE });
}

export async function POST(request) {
  if (!DB_READY) return fail("Accounts are not available right now.", 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid JSON in request body.", 400);
  }

  const email = normalizeEmail(body?.email);
  const password = String(body?.password ?? "");

  if (!email || !password) return fail(INVALID, 401);

  try {
    const user = await findUserByEmail(email);

    // Hash anyway when there is no account, so a miss costs the same ~120ms as
    // a hit. Returning instantly would let someone enumerate registered
    // addresses purely by response time, defeating the shared message above.
    if (!user?.password_hash) {
      await hashPassword(password);
      return fail(INVALID, 401);
    }

    if (!(await verifyPassword(password, user.password_hash))) {
      return fail(INVALID, 401);
    }

    const token = await createSession(user.id, request);

    const response = NextResponse.json(
      { success: true, user: { email: user.email, name: user.name } },
      { headers: NO_STORE }
    );
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("login failed:", error);
    return fail("Could not sign you in. Please try again.", 500);
  }
}
