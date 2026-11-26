import { FREE_ATTEMPTS, FREE_MAX_WORDS } from "./freeTier.js";
import { PASSES, WEEK_PLAN_ID, PRO_PLAN_ID } from "./pricing.js";

/**
 * The pricing page FAQ, built from prices passed in already formatted.
 *
 * Built twice with different prices:
 *   - on the server in USD, for the FAQPage structured data search engines read;
 *   - in the browser in the visitor's currency, for the questions people see
 *     (components/LocalPrice.jsx, PricingFaqList).
 * Same wording both times, so the visible text and the schema only ever differ
 * in the currency.
 *
 * @param {{ weekPrice: string, proPrice: string, weekPerDay: string, proPerDay: string }} p
 * @returns {{ q: string, a: string }[]}
 */
export function buildPricingFaqs({ weekPrice, proPrice, weekPerDay, proPerDay }) {
  const week = PASSES[WEEK_PLAN_ID];
  const pro = PASSES[PRO_PLAN_ID];

  return [
    {
      q: "Is there a free plan?",
      a: `Yes, and it does not expire. You get ${FREE_ATTEMPTS} humanizer runs a day with up to ${FREE_MAX_WORDS.toLocaleString("en-US")} words per run. The AI detector and the Claude watermark remover run in your browser and have no usage limit at all. No account and no card required.`,
    },
    {
      q: "What does a Pro pass get me?",
      a: `Unlimited humanizer runs with no daily cap and no per-run word limit, for as long as the pass lasts: ${week.days} days for ${weekPrice}, or ${pro.days} days for ${proPrice}. Both passes include exactly the same features. Either one is a one-time payment, not a subscription.`,
    },
    {
      q: `Which pass should I pick, ${week.days} days or ${pro.days}?`,
      a: `If you have one essay or report to finish, the ${week.days}-day pass covers it. If you write every week, the ${pro.days}-day pass costs about ${proPerDay} a day against about ${weekPerDay} for the week pass, so it is the better deal.`,
    },
    {
      q: "Do I need an account to use the free plan?",
      a: "No. The free plan works straight from the page with nothing to sign up for, and your daily runs are tracked on your own device. An account is only needed for Pro, so that your access follows you across devices.",
    },
    {
      q: "What happens when I hit the daily limit?",
      a: "The humanizer pauses and shows you the upgrade option. The AI detector and watermark remover keep working. Your free runs come back automatically the next day, so you can wait it out at no cost if you would rather not subscribe.",
    },
    {
      q: "Is my text stored?",
      a: "No. The AI detector and the Claude watermark remover run entirely in your browser, so that text never leaves your device at all. Text sent to the humanizer is processed to generate your result and is not retained afterwards.",
    },
    {
      q: "Does it renew automatically?",
      a: `No. Each pass is a one-time payment that gives you ${week.days} or ${pro.days} days of unlimited access, so there is nothing to cancel and no card kept on file. When the pass runs out you simply drop back to the free plan, and you can buy another pass whenever you want. Buying early adds the days to the end of your current pass rather than replacing it.`,
    },
  ];
}
