import { FREE_ATTEMPTS, FREE_MAX_WORDS } from "./freeTier.js";

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

export const CURRENCY = "USD";

/**
 * Build one pass.
 *
 * `amountMinor` is the charge in the currency's smallest unit (cents for USD).
 * Razorpay's API takes amounts this way, and it is the only figure the server
 * should ever do arithmetic on. Deriving it from `priceUsd` means the displayed
 * price and the charged price cannot drift apart.
 */
function definePass({ id, name, days, priceUsd }) {
  return {
    id,
    name,
    days,
    priceUsd,
    amountMinor: Math.round(priceUsd * 100),
    priceDisplay: `$${priceUsd}`,
  };
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
 * `priceUsd`; to change a length, add a new id.
 */
export const PASSES = {
  [WEEK_PLAN_ID]: definePass({ id: WEEK_PLAN_ID, name: "Week pass", days: 7, priceUsd: 4 }),
  [PRO_PLAN_ID]: definePass({ id: PRO_PLAN_ID, name: "Pro", days: 30, priceUsd: 9 }),
};

/** Passes in display order, shortest first. */
export const PASS_LIST = [PASSES[WEEK_PLAN_ID], PASSES[PRO_PLAN_ID]];

/** The cheapest pass — what "from $X" copy quotes. */
export const CHEAPEST_PASS = PASS_LIST.reduce((a, b) => (b.priceUsd < a.priceUsd ? b : a));

/** The pass for an id, or null if the id is not one we sell. */
export function getPass(planId) {
  return typeof planId === "string" && Object.hasOwn(PASSES, planId) ? PASSES[planId] : null;
}

/** What every pass includes, whatever its length. */
export const PASS_FEATURES = [
  "Unlimited humanizer runs — no daily cap",
  "No word limit per run",
  "One-time payment, nothing auto-renews",
];

/** "$4 for 7 days" */
export function passPriceLabel(pass) {
  return `${pass.priceDisplay} for ${pass.days} days`;
}

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
      `Best value: about $${(PRO_PRICE_USD / PASS_DAYS).toFixed(2)} a day`,
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
