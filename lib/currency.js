/**
 * Which currency a visitor pays in, and how a price is written down.
 *
 * Two currencies: EUR for visitors in countries that use the euro, USD for
 * everyone else. Razorpay accepts both on this account (confirmed 2026-11-26)
 * and settles to us in INR either way.
 *
 * The visitor's country comes from Vercel's `x-vercel-ip-country` header, and
 * from nothing the browser controls:
 *   - proxy.js turns it into the `sh_currency` cookie, which the UI reads so
 *     every price on screen agrees;
 *   - the checkout order route reads the header again itself, so the amount
 *     charged never depends on a cookie someone could edit.
 * Both use currencyForCountry() below, so the price shown and the price
 * charged come from the same rule.
 *
 * Safe for the browser and the server: no secrets, no Node APIs.
 */

/** The base currency: SEO copy, structured data, and every non-euro visitor. */
export const DEFAULT_CURRENCY = "USD";

/** Every currency a pass can be sold in. */
export const CURRENCIES = /** @type {const} */ (["USD", "EUR"]);

/** Cookie that carries the visitor's currency to client components. */
export const CURRENCY_COOKIE = "sh_currency";

/**
 * Countries that use the euro, as ISO 3166-1 alpha-2 codes.
 *
 * The 21 euro-area members (Bulgaria joined on 1 January 2026), plus the
 * microstates and territories that use the euro as their currency.
 */
const EURO_COUNTRIES = new Set([
  // Euro area
  "AT", "BE", "BG", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR",
  "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK",
  // Use the euro without being euro-area members
  "AD", "MC", "SM", "VA", "ME", "XK",
  // French overseas departments and regions sometimes reported separately
  "GF", "GP", "MQ", "RE", "YT", "PM", "BL", "MF",
]);

/**
 * The currency for a two-letter country code. Unknown or missing → USD.
 *
 * @param {string | null | undefined} country
 * @returns {"USD" | "EUR"}
 */
export function currencyForCountry(country) {
  const code = String(country ?? "").trim().toUpperCase();
  return EURO_COUNTRIES.has(code) ? "EUR" : "USD";
}

/**
 * Narrow any string to a currency we sell in, else the default. For values
 * read from cookies, which a visitor can edit.
 *
 * @param {unknown} value
 * @returns {"USD" | "EUR"}
 */
export function normalizeCurrency(value) {
  return CURRENCIES.includes(/** @type {any} */ (value)) ? /** @type {any} */ (value) : DEFAULT_CURRENCY;
}

/** BCP 47 tags used for number formatting, per paywall language. */
const NUMBER_LOCALES = {
  en: "en-US",
  fr: "fr-FR",
  pt: "pt-BR",
  es: "es-ES",
  de: "de-DE",
};

/**
 * Write an amount as a price: "$4", "€4.99", "4,99 €".
 *
 * USD is always written the American way ("$4"), whatever the language: a
 * French reader seeing "4 $US" would read it as an odd foreign price, and the
 * dollar is only shown to visitors outside the euro area anyway. EUR follows
 * the reader's language, so a French visitor sees "4,99 €".
 *
 * Whole amounts drop their decimals ("$9", not "$9.00"); `alwaysCents` keeps
 * them for figures that are rarely whole, like a price per day.
 *
 * @param {number} amount  in major units (4.99, not 499)
 * @param {string} currency
 * @param {string} [lang]  paywall language: en | fr | pt | es | de
 * @param {{ alwaysCents?: boolean }} [options]
 */
export function formatMoney(amount, currency, lang = "en", options = {}) {
  const locale = currency === "USD" ? "en-US" : NUMBER_LOCALES[lang] ?? "en-US";
  const whole = Number.isInteger(amount) && !options.alwaysCents;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Intl without full locale data (some older runtimes): a plain fallback.
    const symbol = currency === "EUR" ? "€" : "$";
    return `${symbol}${whole ? amount : amount.toFixed(2)}`;
  }
}

/** The number-formatting locale for a paywall language, e.g. word counts. */
export function numberLocale(lang = "en") {
  return NUMBER_LOCALES[lang] ?? "en-US";
}
