import { currencyForCountry } from "./currency.js";

/**
 * The visitor's country and currency, from the request.
 *
 * Vercel sets `x-vercel-ip-country` on every request it serves (two-letter ISO
 * code, from the client IP). Off Vercel — `next dev` on a laptop — the header
 * is absent and everyone is treated as outside the euro area, unless
 * PRICING_COUNTRY is set:
 *
 *   PRICING_COUNTRY=FR npm run dev     # see and pay euro prices locally
 *
 * The override is ignored in production, so it can never change what real
 * visitors are charged.
 *
 * Server-only in practice (it reads request headers), but holds no secrets.
 */

/**
 * @param {{ headers: Headers }} request
 * @returns {string} two-letter country code, or "" when unknown
 */
export function countryFromRequest(request) {
  if (process.env.NODE_ENV !== "production" && process.env.PRICING_COUNTRY) {
    return process.env.PRICING_COUNTRY.trim().toUpperCase();
  }
  return (request.headers.get("x-vercel-ip-country") ?? "").trim().toUpperCase();
}

/**
 * @param {{ headers: Headers }} request
 * @returns {"USD" | "EUR"}
 */
export function currencyFromRequest(request) {
  return currencyForCountry(countryFromRequest(request));
}
