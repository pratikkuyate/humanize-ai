import { FREE_ATTEMPTS, FREE_MAX_WORDS } from "./freeTier.js";

/**
 * Plan definitions. Single source of truth for the pricing page, the upgrade
 * prompt shown when a free quota runs out, the checkout call, and the Offer
 * structured data.
 *
 * The billing model is a one-time 30-day pass, not a subscription. Nothing
 * auto-renews and there is no mandate to cancel — which is why the copy below
 * says "30 days of unlimited access" rather than "per month, cancel any time".
 * Those two are not interchangeable wording: advertising a cancellable
 * subscription while charging a one-off payment is the kind of mismatch that
 * generates chargebacks.
 */

export const PRO_PLAN_ID = "pro-30";

/** Length of the pass, in days. Also the window grantPass() writes. */
export const PASS_DAYS = 30;

export const CURRENCY = "USD";
export const PRO_PRICE_USD = 9;
export const PRO_PRICE_DISPLAY = "$9";

/**
 * The charge, in the currency's smallest unit — cents for USD.
 *
 * Razorpay's API takes amounts this way, and it is the only representation the
 * server should ever do arithmetic on. Deriving it here from PRO_PRICE_USD
 * means the displayed price and the charged price cannot drift apart.
 */
export const PRO_PRICE_MINOR = PRO_PRICE_USD * 100;

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
      `${FREE_ATTEMPTS} runs a day on each tool`,
      `Up to ${FREE_MAX_WORDS.toLocaleString()} words per run`,
      "AI humanizer, AI detector, and Claude watermark remover",
      "No sign-up and no credit card",
      "Nothing you paste is stored",
    ],
  },
  {
    id: PRO_PLAN_ID,
    name: "Pro",
    price: PRO_PRICE_DISPLAY,
    cadence: `for ${PASS_DAYS} days`,
    tagline: "No limits for a month. One payment — nothing auto-renews.",
    cta: CHECKOUT_READY ? "Get Pro" : "Get early access",
    ctaHref: CHECKOUT_READY ? "/account" : "/contact",
    highlight: true,
    features: [
      "Unlimited runs — no daily cap",
      "No word limit per run",
      "All three tools, fully unlocked",
      "Priority processing",
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
      "Unlimited access to the Simply Humanize AI humanizer, AI content detector, and Claude watermark remover.",
    brand: { "@type": "Brand", name: "Simply Humanize" },
    offers: [
      {
        "@type": "Offer",
        name: "Free",
        price: "0",
        priceCurrency: CURRENCY,
        availability: "https://schema.org/InStock",
        url: `${siteUrl}/pricing`,
        description: `${FREE_ATTEMPTS} runs a day, up to ${FREE_MAX_WORDS.toLocaleString()} words per run, no account required.`,
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: String(PRO_PRICE_USD),
        priceCurrency: CURRENCY,
        availability: "https://schema.org/InStock",
        url: `${siteUrl}/pricing`,
        description: `${PASS_DAYS} days of unlimited runs with no daily cap and no word limit. One-time payment.`,
      },
    ],
  };
}
