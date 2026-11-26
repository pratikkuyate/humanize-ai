"use client";

import { PASS_LIST, PRO_PLAN_ID } from "@/lib/pricing";
import { usePaywall } from "@/components/usePaywall";

/**
 * Choose between the Pro passes (7 days or 30 days), as two radio cards.
 *
 * The 30-day card carries the per-day figure and a "Best value" tag, so the
 * cheaper week pass reads as the easy first step and the month as the better
 * deal next to it.
 *
 * Prices are in the visitor's currency (€ in the euro area, else $) and the
 * labels in the paywall language — see usePaywall().
 *
 * @param {{
 *   value: string,
 *   onChange: (planId: string) => void,
 *   name?: string,
 * }} props
 */
export default function PassPicker({ value, onChange, name = "pass" }) {
  const { t, price, perDay } = usePaywall();

  return (
    <div role="radiogroup" aria-label={t.choosePass} className="grid grid-cols-2 gap-3">
      {PASS_LIST.map((pass) => {
        const selected = pass.id === value;
        const bestValue = pass.id === PRO_PLAN_ID;

        return (
          <label
            key={pass.id}
            className={`relative cursor-pointer rounded-xl border-2 px-3 pt-4 pb-3 text-center transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-violet-500 has-[:focus-visible]:ring-offset-2 ${
              selected
                ? "border-violet-600 bg-violet-50 dark:bg-violet-950/40 dark:border-violet-500"
                : "border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={pass.id}
              checked={selected}
              onChange={() => onChange(pass.id)}
              className="sr-only"
            />
            {bestValue && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                {t.bestValue}
              </span>
            )}
            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.days(pass.days)}
            </span>
            <span className="mt-0.5 block text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {price(pass)}
            </span>
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">
              {t.perDay(perDay(pass))}
            </span>
          </label>
        );
      })}
    </div>
  );
}
