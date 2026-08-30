import { NextResponse } from "next/server";
import { DB_READY } from "@/lib/db";
import {
  getSession,
  needsRefresh,
  refreshSession,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/session";

/**
 * GET /api/auth/me — who is signed in, and are they Pro?
 *
 * The endpoint the header and account page read to render signed-in state. Also
 * where sessions are extended, so someone who keeps using the site is never
 * signed out from under themselves.
 */

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/** Signed out is a success, not an error — it is the common case. */
function anonymous() {
  return NextResponse.json({ success: true, user: null }, { headers: NO_STORE });
}

export async function GET(request) {
  if (!DB_READY) return anonymous();

  try {
    const session = await getSession(request);
    if (!session) return anonymous();

    const pro = Boolean(session.proUntil && session.proUntil.getTime() > Date.now());

    const response = NextResponse.json(
      {
        success: true,
        user: {
          email: session.email,
          name: session.name,
          imageUrl: session.imageUrl,
          hasPassword: session.hasPassword,
          pro,
          proUntil: pro ? session.proUntil.toISOString() : null,
        },
      },
      { headers: NO_STORE }
    );

    // Slide the window forward for someone clearly still around, but only near
    // its end — otherwise this writes to the database on every page view.
    if (needsRefresh(session)) {
      try {
        await refreshSession(session.token);
        response.cookies.set(SESSION_COOKIE, session.token, sessionCookieOptions());
      } catch {
        // A failed extension is harmless; the session is still valid today.
      }
    }

    return response;
  } catch (error) {
    console.error("session lookup failed:", error);
    return anonymous();
  }
}
