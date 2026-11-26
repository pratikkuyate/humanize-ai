"use client";

import { useCurrency } from "@/components/useCurrency";
import { formatMoney } from "@/lib/currency";
import { getPass, passPrice, WEEK_PLAN_ID, PRO_PLAN_ID } from "@/lib/pricing";
import { buildPricingFaqs } from "@/lib/pricingFaq";

/**
 * Prices on English, server-rendered pages (the pricing page), in the
 * visitor's currency.
 *
 * The page around these is static and rendered once for everyone, in USD. These
 * small client pieces re-render in the browser with the visitor's currency, so
 * a visitor in France reads €9.99 where the static HTML said $9. Search engines
 * and the structured data keep seeing USD.
 *
 * Written in English number style ("€9.99"), matching the page's language. The
 * paywall components, which follow the visitor's language, use usePaywall().
 */

function usePassAmounts(passId) {
  const currency = useCurrency();
  const pass = getPass(passId);
  const { amount } = passPrice(pass, currency);
  return {
    price: formatMoney(amount, currency, "en"),
    perDay: formatMoney(amount / pass.days, currency, "en", { alwaysCents: true }),
  };
}

/** "$9" or "€9.99" */
export function PassPrice({ passId }) {
  return usePassAmounts(passId).price;
}

/** "Best value: about $0.30 a day" / "…about €0.33 a day" */
export function PassPerDayFeature({ passId }) {
  return `Best value: about ${usePassAmounts(passId).perDay} a day`;
}

/** The pricing FAQ, with every price in the visitor's currency. */
export function PricingFaqList() {
  const week = usePassAmounts(WEEK_PLAN_ID);
  const pro = usePassAmounts(PRO_PLAN_ID);
  const faqs = buildPricingFaqs({
    weekPrice: week.price,
    proPrice: pro.price,
    weekPerDay: week.perDay,
    proPerDay: pro.perDay,
  });

  return (
    <div className="space-y-6">
      {faqs.map((faq) => (
        <div key={faq.q}>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">{faq.q}</h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
            {faq.a}
          </p>
        </div>
      ))}
    </div>
  );
}
