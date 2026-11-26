import { FREE_ATTEMPTS, FREE_MAX_WORDS } from "./freeTier.js";
import { DEFAULT_CURRENCY, normalizeCurrency } from "./currency.js";

/**
 * Plan definitions. Single source of truth for the pricing page, the upgrade
 * prompt shown when a free quota runs out, the checkout call, and the Offer
 * structured data.
 *
 * The billing model is a one-time pass, not a subscription. Nothing
 * auto-renews and there is no mandate to cancel — which is why the copy below
 * says "30 days of unlimited access" rather than "per month, cancel any time".
 * Those two are not interchangeable wording: advertising a cancellable
 * subscription while charging a one-off payment is the kind of mismatch that
 * generates chargebacks.
 */

/**
 * The base currency. Used for SEO copy and structured data, and charged to
 * every visitor outside the euro area. Euro visitors pay the `EUR` price of a
 * pass instead — see passPrice() and lib/currency.js.
 */
export const CURRENCY = DEFAULT_CURRENCY;

/**
 * Build one pass.
 *
 * `prices` holds the price per currency in major units ({ USD: 4, EUR: 4.99 }).
 * These are fixed, chosen prices — not exchange-rate conversions — so a euro
 * visitor sees €4.99 rather than €3.71.
 *
 * `amountMinor`, `priceUsd` and `priceDisplay` are the USD price, kept for the
 * SEO copy, the Offer schema, and older callers. Anything a visitor sees or
 * pays should go through passPrice() instead, which honours their currency.
 */
function definePass({ id, name, days, prices }) {
  return {
    id,
    name,
    days,
    prices,
    priceUsd: prices.USD,
    amountMinor: Math.round(prices.USD * 100),
    priceDisplay: `$${prices.USD}`,
  };
}

/**
 * What a pass costs in a currency.
 *
 * `amountMinor` (cents) is what the server sends to Razorpay; `amount` (major
 * units) is for display. Both come from the same table entry, so the price on
 * screen and the price charged cannot drift apart. An unknown currency falls
 * back to USD.
 *
 * @param {{ prices: Record<string, number> }} pass
 * @param {string} [currency]
 * @returns {{ currency: "USD" | "EUR", amount: number, amountMinor: number }}
 */
export function passPrice(pass, currency = DEFAULT_CURRENCY) {
  const code = normalizeCurrency(currency);
  const amount = pass.prices[code] ?? pass.prices[DEFAULT_CURRENCY];
  return { currency: code, amount, amountMinor: Math.round(amount * 100) };
}

/** The cheap first purchase: a week, for someone with one deadline. */
export const WEEK_PLAN_ID = "pro-7";
/** The original 30-day pass, and the default wherever a plan is not named. */
export const PRO_PLAN_ID = "pro-30";

/**
 * Every pass on sale, keyed by plan id.
 *
 * The server prices an order by looking its plan id up here and nowhere else —
 * the browser names a plan, never an amount. The id is stored on the payment
 * row, which is how the webhook (which knows only an order id) grants the right
 * number of days.
 *
 * Ids are permanent once a sale has used them, because a past payment's
 * plan_id is looked up here to decide its length. To change a price, change
 * `prices`; to change a length, add a new id. Every pass must have a price in
 * every currency listed in CURRENCIES (lib/currency.js).
 */
export const PASSES = {
  [WEEK_PLAN_ID]: definePass({
    id: WEEK_PLAN_ID,
    name: "Week pass",
    days: 7,
    prices: { USD: 4, EUR: 4.99 },
  }),
  [PRO_PLAN_ID]: definePass({
    id: PRO_PLAN_ID,
    name: "Pro",
    days: 30,
    prices: { USD: 9, EUR: 9.99 },
  }),
};

/** Passes in display order, shortest first. */
export const PASS_LIST = [PASSES[WEEK_PLAN_ID], PASSES[PRO_PLAN_ID]];

/** The cheapest pass in USD — what the SEO "from $X" copy quotes. */
export const CHEAPEST_PASS = PASS_LIST.reduce((a, b) => (b.priceUsd < a.priceUsd ? b : a));

/**
 * The cheapest pass in a currency — what "from …" copy shown to a visitor
 * quotes. Usually the week pass, but computed so a future price change cannot
 * leave the copy quoting the wrong one.
 *
 * @param {string} [currency]
 */
export function cheapestPassIn(currency = DEFAULT_CURRENCY) {
  return PASS_LIST.reduce((a, b) =>
    passPrice(b, currency).amount < passPrice(a, currency).amount ? b : a
  );
}

/** The pass for an id, or null if the id is not one we sell. */
export function getPass(planId) {
  return typeof planId === "string" && Object.hasOwn(PASSES, planId) ? PASSES[planId] : null;
}

// What every pass includes, and "$4 for 7 days"-style labels, now live in
// lib/paywallText.js (per language) and components/usePaywall.js (per currency).

/*
 * The 30-day pass under its original names. "Pro, $9, 30 days" is still the
 * headline plan, and PASS_DAYS is also the fallback length for a payment row
 * whose plan id is not recognised.
 */
export const PASS_DAYS = PASSES[PRO_PLAN_ID].days;
export const PRO_PRICE_USD = PASSES[PRO_PLAN_ID].priceUsd;
export const PRO_PRICE_DISPLAY = PASSES[PRO_PLAN_ID].priceDisplay;
export const PRO_PRICE_MINOR = PASSES[PRO_PLAN_ID].amountMinor;

/**
 * Checkout is live whenever Razorpay is configured.
 *
 * This replaces the old NEXT_PUBLIC_CHECKOUT_URL switch. That variable existed
 * because there was no way to deliver what a purchase would sell; accounts and
 * entitlements now exist, so the gate is simply whether the keys are present.
 * The public key id is the only half that reaches the browser — Razorpay
 * publishes it in the checkout widget by design. The secret never leaves the
 * server.
 */
export const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";

/** True once a real checkout is configured. Drives the CTA wording. */
export const CHECKOUT_READY = RAZORPAY_KEY_ID.trim().length > 0;

/**
 * The account page with checkout set to open on arrival.
 *
 * `buy` names the pass AccountPanel should start Razorpay for as soon as the
 * user is signed in, so nobody has to choose a second time. `src` records which
 * upgrade prompt they came from, for the checkout analytics events.
 *
 * @param {string} source e.g. "modal", "pricing"
 * @param {string} [planId] defaults to the 30-day pass
 */
export function buyPath(source, planId = PRO_PLAN_ID) {
  return `/account?buy=${encodeURIComponent(planId)}&src=${encodeURIComponent(source)}`;
}

/**
 * Where an upgrade CTA should send someone who may not be signed in.
 *
 * Signup rather than login: almost everyone reaching an upgrade prompt is a new
 * visitor, and landing them on "Welcome back" was a wrong turn. The signup form
 * links to login with the same `next`, and skips itself for anyone already
 * signed in.
 *
 * @param {string} source
 * @param {string} [planId]
 */
export function upgradeHref(source, planId = PRO_PLAN_ID) {
  return `/signup?next=${encodeURIComponent(buyPath(source, planId))}`;
}

const week = PASSES[WEEK_PLAN_ID];

/**
 * Placeholder in a plan's feature list for "Best value: about $0.30 a day".
 *
 * The figure depends on the visitor's currency, which a server-rendered list
 * cannot know, so the pricing page swaps this token for a client component
 * (PassPerDayFeature) that works it out in the browser.
 */
export const PER_DAY_FEATURE = "__per_day__";

export const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    tagline: "Everything you need to try it properly. No account, no card.",
    cta: "Start writing",
    ctaHref: "/#tool",
    highlight: false,
    features: [
      `${FREE_ATTEMPTS} humanizer runs a day`,
      `Up to ${FREE_MAX_WORDS.toLocaleString()} words per run`,
      "AI detector and Claude watermark remover — unlimited",
      "No sign-up and no credit card",
      "Nothing you paste is stored",
    ],
  },
  {
    id: WEEK_PLAN_ID,
    name: week.name,
    price: week.priceDisplay,
    cadence: `for ${week.days} days`,
    tagline: "Everything in Pro for the week your deadline is due. One payment.",
    cta: CHECKOUT_READY ? "Get the week pass" : "Get early access",
    ctaHref: CHECKOUT_READY ? upgradeHref("pricing", WEEK_PLAN_ID) : "/contact",
    highlight: false,
    features: [
      "Unlimited humanizer runs — no daily cap",
      "No word limit per run",
      `${week.days} days of access from the moment you pay`,
      "One-time payment, no subscription",
    ],
  },
  {
    id: PRO_PLAN_ID,
    name: "Pro",
    price: PRO_PRICE_DISPLAY,
    cadence: `for ${PASS_DAYS} days`,
    tagline: "No limits for a month. One payment — nothing auto-renews.",
    cta: CHECKOUT_READY ? "Get Pro" : "Get early access",
    ctaHref: CHECKOUT_READY ? upgradeHref("pricing") : "/contact",
    highlight: true,
    features: [
      "Unlimited humanizer runs — no daily cap",
      "No word limit per run",
      PER_DAY_FEATURE,
      "Renew early and the extra days stack",
      "One-time payment, no subscription",
    ],
  },
];

/**
 * The Pro plan on its own.
 *
 * Exported so callers never look it up by a hardcoded id. The upgrade modal
 * previously did `plans.find((p) => p.id === "pro")`, which silently became
 * `undefined` the moment PRO_PLAN_ID changed — a crash at first render rather
 * than anywhere near the edit that caused it.
 */
export const proPlan = plans.find((plan) => plan.id === PRO_PLAN_ID);

/** Product + Offer schema for the pricing page. */
export function buildPricingSchema(siteUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Simply Humanize Pro",
    description:
      "Unlimited access to the Simply Humanize AI humanizer: no daily run cap and no per-run word limit.",
    brand: { "@type": "Brand", name: "Simply Humanize" },
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: CURRENCY,
        availability: "https://schema.org/InStock",
        url: `${siteUrl}/pricing`,
        description: `${FREE_ATTEMPTS} humanizer runs a day, up to ${FREE_MAX_WORDS.toLocaleString()} words per run, no account required. The AI detector and watermark remover are unlimited.`,
      },
      ...PASS_LIST.map((pass) => ({
        "@type": "Offer",
        name: pass.id === PRO_PLAN_ID ? "Pro" : `Pro — ${pass.name}`,
        price: String(pass.priceUsd),
        priceCurrency: CURRENCY,
        availability: "https://schema.org/InStock",
        url: `${siteUrl}/pricing`,
        description: `${pass.days} days of unlimited humanizer runs with no daily cap and no word limit. One-time payment.`,
      })),
    ],
  };
}
