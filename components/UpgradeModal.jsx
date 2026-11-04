"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { proPlan, PRO_PRICE_DISPLAY, PASS_DAYS, CHECKOUT_READY, upgradeHref } from "@/lib/pricing";
import { track } from "@/lib/analytics";
import { useAuth } from "@/components/useAuth";
import CheckoutButton from "@/components/CheckoutButton";

/**
 * The upgrade dialog shown the moment someone runs out of free runs.
 *
 * Rendered through a portal onto document.body on purpose: every tool lives
 * inside a card with `overflow-hidden`, and a transformed ancestor would clip a
 * fixed-position child painted inside that tree.
 *
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   quota?: { limit?: number, resetAt?: string } | null;
 *   message?: string | null;
 *   onUpgraded?: () => void;
 *   onLeave?: () => void;
 * }} props
 *
 * The CTA depends on who is looking:
 *   - signed in → Razorpay opens right here, and `onUpgraded` lets the tool
 *     unlock in place, with the user's text still in the box;
 *   - signed out → straight to signup, then checkout opens on arrival. `onLeave`
 *     runs first so the caller can keep the text for when they come back.
 */
export default function UpgradeModal({ open, ...props }) {
  // Only mount the dialog when it is open, so its auth lookup runs when someone
  // actually hits the limit — not on every page view of every tool page.
  if (!open) return null;
  return <UpgradeDialog {...props} />;
}

function UpgradeDialog({ onClose, quota, message, onUpgraded, onLeave }) {
  const closeRef = useRef(null);
  const { user, loading } = useAuth();
  const payHere = CHECKOUT_READY && !loading && Boolean(user);

  // Mounted only while open, so this reports one view per opening.
  useEffect(() => {
    track("upgrade_modal_view");
    // Move focus into the dialog so keyboard and screen-reader users land here.
    // Once, on open: the effect below re-runs on every parent render (callers
    // pass an inline onClose), and re-focusing there could pull focus out of
    // the Razorpay window mid-payment.
    closeRef.current?.focus();
  }, []);

  // Escape to dismiss, and hold the background still while the dialog is up.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  // Portals need a document, which does not exist during the server render.
  if (typeof document === "undefined") return null;

  const resets = quota?.resetAt ? new Date(quota.resetAt) : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-default"
      />

      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-[fadeIn_120ms_ease-out]">
        {/* Close */}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="px-6 pt-7 pb-6 text-center border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-violet-50 to-white dark:from-violet-950/30 dark:to-slate-900">
          <div className="w-11 h-11 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/25 mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>

          <h2
            id="upgrade-modal-title"
            className="text-lg font-bold text-slate-900 dark:text-white"
          >
            You&rsquo;ve hit your free limit
          </h2>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {message ?? "Remove the limits and keep going."}
          </p>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {PRO_PRICE_DISPLAY}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              for {PASS_DAYS} days
            </span>
          </div>

          <ul className="mt-5 space-y-2.5">
            {proPlan?.features.map((feature) => (
              <li
                key={feature}
                className="flex gap-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="shrink-0 mt-0.5 text-violet-600 dark:text-violet-400"
                  aria-hidden="true"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          {payHere ? (
            <div className="mt-6">
              <CheckoutButton
                source="modal"
                label={`${proPlan.cta} →`}
                onSuccess={() => onUpgraded?.()}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          ) : (
            <Link
              // While auth is still loading this link is also right for a
              // signed-in user: signup forwards them straight to checkout.
              href={CHECKOUT_READY ? upgradeHref("modal") : proPlan.ctaHref}
              onClick={() => {
                track("upgrade_click", { source: "modal" });
                onLeave?.();
              }}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-sm"
            >
              {proPlan.cta} →
            </Link>
          )}

          <Link
            href="/pricing"
            onClick={() => onLeave?.()}
            className="mt-2.5 w-full inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            Compare plans
          </Link>

          {resets && (
            <p className="mt-4 text-center text-[11px] text-slate-400 dark:text-slate-500">
              Or wait — your free runs come back{" "}
              <time dateTime={resets.toISOString()}>
                {resets.toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </time>
              .
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
