import { NextResponse } from "next/server";
import { CURRENCY_COOKIE } from "@/lib/currency";
import { currencyFromRequest } from "@/lib/geo";

/**
 * Next.js 16 proxy (formerly "middleware"): runs before every page request.
 *
 * Its one job is to tell the browser which currency to show prices in. The
 * visitor's country comes from Vercel's geo header; lib/currency.js turns it
 * into EUR or USD; the answer goes into the `sh_currency` cookie, which the
 * price components read (components/useCurrency.js).
 *
 * The cookie only drives what is displayed. The checkout order route works
 * out the currency from the same header on its own, so editing the cookie
 * changes nothing about what anyone is charged.
 *
 * The cookie is written only when it is missing or wrong (first visit, or the
 * visitor's country changed), so most responses carry no Set-Cookie at all.
 */
export function proxy(request) {
  const currency = currencyFromRequest(request);
  const response = NextResponse.next();

  if (request.cookies.get(CURRENCY_COOKIE)?.value !== currency) {
    response.cookies.set(CURRENCY_COOKIE, currency, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      // Readable by client components on purpose: it is a display hint, not a
      // secret, and the server never trusts it for pricing.
      httpOnly: false,
    });
  }

  return response;
}

export const config = {
  // Pages only. API routes read the header themselves; static files, images
  // and Next.js internals need no cookie.
  matcher: ["/((?!api/|_next/static|_next/image|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
