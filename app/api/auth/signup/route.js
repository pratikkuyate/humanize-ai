import { NextResponse } from "next/server";
import { DB_READY } from "@/lib/db";
import {
  createUserWithPassword,
  findUserByEmail,
  isValidEmail,
  normalizeEmail,
} from "@/lib/users";
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from "@/lib/password";
import { createSession, sessionCookieOptions, SESSION_COOKIE } from "@/lib/session";

/**
 * POST /api/auth/signup — create an email + password account and sign in.
 *
 * Body: { email, password, name? }
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

  const email = normalizeEmail(body?.email);
  const password = String(body?.password ?? "");
  const name = typeof body?.name === "string" ? body.name.slice(0, 100) : null;

  if (!isValidEmail(email)) return fail("Enter a valid email address.");

  if (password.length < MIN_PASSWORD_LENGTH) {
    return fail(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return fail(`Password must be under ${MAX_PASSWORD_LENGTH} characters.`);
  }

  try {
    const user = await createUserWithPassword({ email, password, name });

    if (!user) {
      // The address is taken. This does disclose that an account exists — an
      // unavoidable trade, since a signup form that silently accepted a
      // duplicate would leave the real owner's account unreachable and this
      // user confused. The login form is the one that stays deliberately vague.
      const existing = await findUserByEmail(email);

      if (existing && !existing.password_hash) {
        return fail(
          "This email is already registered through Google. Use Continue with Google to sign in.",
          409
        );
      }

      return fail("An account with this email already exists. Try signing in instead.", 409);
    }

    const token = await createSession(user.id, request);

    const response = NextResponse.json(
      { success: true, user: { email: user.email, name: user.name } },
      { headers: NO_STORE }
    );
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("signup failed:", error);
    return fail("Could not create your account. Please try again.", 500);
  }
}
