"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/useAuth";
import CheckoutButton from "@/components/CheckoutButton";
import { PRO_PRICE_DISPLAY, PASS_DAYS } from "@/lib/pricing";
import { FREE_ATTEMPTS } from "@/lib/freeTier";

/**
 * The signed-in account view: current plan, and the way to buy or extend Pro.
 *
 * @param {{ checkoutReady: boolean }} props
 */

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Whole days remaining, rounded up — "0 days left" on a live pass reads wrong. */
function daysLeft(iso) {
  if (!iso) return 0;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export default function AccountPanel({ checkoutReady }) {
  const { user, loading, refresh, signOut } = useAuth();
  const [justUpgraded, setJustUpgraded] = useState(false);

  // Send anyone signed out to the login page. Done client-side because this
  // panel is what knows the auth state; the page around it stays static.
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login?next=/account";
    }
  }, [loading, user]);

  const onPurchased = useCallback(async () => {
    setJustUpgraded(true);
    // Re-read the session so the panel switches to its Pro state without a
    // reload. The entitlement row already exists by the time verify responds.
    await refresh();
  }, [refresh]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4" aria-busy="true">
        <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  // The redirect above is already in flight.
  if (!user) return null;

  const isPro = Boolean(user.pro);
  const expiry = formatDate(user.proUntil);
  const remaining = daysLeft(user.proUntil);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {user.name ? `Hi, ${user.name}` : "Your account"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
        </div>

        <button
          type="button"
          onClick={signOut}
          className="shrink-0 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          Sign out
        </button>
      </div>

      {justUpgraded && (
        <p className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">
          You are Pro. All three tools are unlocked — no daily cap, no word limit.
        </p>
      )}

      <section
        className={`rounded-2xl border p-6 ${
          isPro
            ? "border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40"
            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {isPro ? "Pro" : "Free"}
          </h2>
          {isPro && (
            <span className="inline-flex items-center rounded-full bg-violet-600 px-2.5 py-0.5 text-xs font-semibold text-white">
              Active
            </span>
          )}
        </div>

        {isPro ? (
          <>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Unlimited runs on every tool. Your pass runs until{" "}
              <strong className="text-slate-900 dark:text-white">{expiry}</strong> —{" "}
              {remaining} {remaining === 1 ? "day" : "days"} left.
            </p>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              Nothing renews automatically. Buy another pass whenever you want more time — days
              are added to the end of your current pass, so you never lose any by extending early.
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {FREE_ATTEMPTS} runs a day on each tool. Go Pro for {PRO_PRICE_DISPLAY} to remove the
            daily cap and the per-run word limit for {PASS_DAYS} days.
          </p>
        )}

        <div className="mt-5">
          {checkoutReady ? (
            <CheckoutButton
              onSuccess={onPurchased}
              label={
                isPro
                  ? `Add another ${PASS_DAYS} days — ${PRO_PRICE_DISPLAY}`
                  : `Get Pro — ${PRO_PRICE_DISPLAY} for ${PASS_DAYS} days`
              }
            />
          ) : (
            <p className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2.5 text-sm text-amber-800 dark:text-amber-300">
              Checkout is not switched on yet. See{" "}
              <Link href="/pricing" className="underline">
                pricing
              </Link>{" "}
              or{" "}
              <Link href="/contact" className="underline">
                get in touch
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Questions about billing?{" "}
        <Link href="/contact" className="font-medium text-violet-600 dark:text-violet-400 hover:underline">
          Contact us
        </Link>
        .
      </p>
    </div>
  );
}
