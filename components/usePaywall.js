"use client";

import { useMemo } from "react";
import { useCurrency } from "@/components/useCurrency";
import { usePaywallLocale } from "@/components/usePaywallLocale";
import { getPaywallText } from "@/lib/paywallText";
import { formatMoney, numberLocale } from "@/lib/currency";
import { passPrice, cheapestPassIn } from "@/lib/pricing";

/**
 * Everything a paywall component needs to speak the visitor's language and
 * quote their currency, in one hook:
 *
 *   const { t, price, perDay, cheapest, num } = usePaywall();
 *   t.unlockCta(price(pass), pass.days)   // "Débloquer Pro — 9,99 € pour 30 jours"
 *
 * - `t`        strings for the paywall language (lib/paywallText.js)
 * - `price`    a pass's price, formatted: "$9", "9,99 €"
 * - `perDay`   a pass's price per day, formatted: "$0.30", "0,33 €"
 * - `cheapest` the cheapest pass in this visitor's currency
 * - `num`      a plain number formatted for the language: "1 000" in French
 */
export function usePaywall() {
  const lang = usePaywallLocale();
  const currency = useCurrency();

  return useMemo(() => {
    const t = getPaywallText(lang);
    const price = (pass) => formatMoney(passPrice(pass, currency).amount, currency, lang);
    const perDay = (pass) =>
      formatMoney(passPrice(pass, currency).amount / pass.days, currency, lang, {
        alwaysCents: true,
      });
    const num = (n) => Number(n).toLocaleString(numberLocale(lang));

    return { lang, currency, t, price, perDay, num, cheapest: cheapestPassIn(currency) };
  }, [lang, currency]);
}
