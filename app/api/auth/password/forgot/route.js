import { NextResponse, after } from "next/server";
import { DB_READY } from "@/lib/db";
import { isValidEmail, normalizeEmail } from "@/lib/users";
import { requestPasswordReset } from "@/lib/passwordReset";

/**
 * POST /api/auth/password/forgot — email a password reset link.
 *
 * Body: { email }
 *
 * Always answers the same way for a well-formed address, account or not, so the
 * form cannot tell anyone whether an address is registered. The lookup and the
 * send happen in `after()`, once the response is on its way, so response
 * timing does not give it away either.
 */

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export async function POST(request) {
  if (!DB_READY) {
    return NextResponse.json(
      { success: false, error: "Accounts are not available right now." },
      { status: 503, headers: NO_STORE }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON in request body." },
      { status: 400, headers: NO_STORE }
    );
  }

  const email = normalizeEmail(body?.email);
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { success: false, error: "Enter a valid email address." },
      { status: 400, headers: NO_STORE }
    );
  }

  after(async () => {
    try {
      await requestPasswordReset(email);
    } catch (error) {
      console.error("password reset request failed:", error);
    }
  });

  return NextResponse.json({ success: true }, { headers: NO_STORE });
}
