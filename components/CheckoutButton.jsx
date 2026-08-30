"use client";

import { useCallback, useState } from "react";
import { PRO_PRICE_DISPLAY, PASS_DAYS } from "@/lib/pricing";

/**
 * Razorpay checkout, start to finish.
 *
 * The sequence is: ask our server to open an order, hand that order id to
 * Razorpay's widget, then post what the widget returns back to our server to be
 * verified. Three round trips, and the third is the one that matters — the
 * widget's success callback is just a browser saying it paid, and only the
 * signature check on our server can tell that apart from a forgery.
 *
 * The widget script is loaded on click rather than on page load, so the pricing
 * page costs nothing extra for the majority of visitors who never open checkout.
 *
 * @param {{
 *   onSuccess?: (info: { proUntil: string | null }) => void,
 *   className?: string,
 *   label?: string,
 * }} props
 */

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/** Load Razorpay's widget once, reusing it on later clicks. */
function loadRazorpay() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    // A previous click may have started the load already; reuse that element
    // rather than injecting a second copy of the script.
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);

    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutButton({ onSuccess, className, label }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const start = useCallback(async () => {
    setError(null);
    setNotice(null);
    setBusy(true);

    try {
      const ready = await loadRazorpay();
      if (!ready) {
        setError("Could not load the payment window. Check your connection or any ad blocker.");
        setBusy(false);
        return;
      }

      const orderResponse = await fetch("/api/checkout/order", { method: "POST" });
      const order = await orderResponse.json();

      if (!orderResponse.ok || !order.success) {
        if (orderResponse.status === 401) {
          window.location.href = "/login?next=/account";
          return;
        }
        setError(order?.error ?? "Could not start checkout. Please try again.");
        setBusy(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Simply Humanize",
        description: `Pro — ${order.passDays} days of unlimited access`,
        prefill: {
          email: order.email ?? "",
          name: order.name ?? "",
        },

        // Do not ask for a phone number.
        //
        // Razorpay shows a mandatory contact field by default; `hidden.contact`
        // turns it optional and takes it off the form. We have no phone number
        // to prefill and no use for one — the pass is granted to the account,
        // and the receipt goes to the email Razorpay already has. Every extra
        // required field on a checkout form costs conversions.
        //
        // Note this is Razorpay's own supported flag, not a CSS hack: the
        // payment still completes without a contact value.
        hidden: { contact: true },

        theme: { color: "#7c3aed" },

        // Fires when the user dismisses the widget without paying. Without it
        // the button would stay in its loading state forever.
        modal: {
          ondismiss: () => {
            setBusy(false);
            setNotice("Checkout closed — you have not been charged.");
          },
        },

        handler: async (result) => {
          try {
            const verifyResponse = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: result.razorpay_order_id,
                razorpay_payment_id: result.razorpay_payment_id,
                razorpay_signature: result.razorpay_signature,
              }),
            });

            const verified = await verifyResponse.json();

            if (verified.success) {
              onSuccess?.({ proUntil: verified.proUntil ?? null });
              setBusy(false);
              return;
            }

            // 202 means the charge succeeded but activation is still settling.
            // The webhook will finish it, so this must not read as a failure —
            // telling a paying customer their payment failed is how refund
            // requests and chargebacks start.
            if (verifyResponse.status === 202 || verified.pending) {
              setNotice(verified.error);
            } else {
              setError(verified?.error ?? "We could not confirm your payment.");
            }
          } catch {
            setNotice(
              "Your payment went through but we could not confirm it here. Refresh this page in a moment, or contact us if Pro is still not active."
            );
          } finally {
            setBusy(false);
          }
        },
      });

      // A failed payment leaves the widget open for a retry, so there is nothing
      // to reset here — just surface why it failed.
      razorpay.on("payment.failed", (event) => {
        setError(event?.error?.description ?? "The payment did not go through.");
      });

      razorpay.open();
    } catch (err) {
      console.error("checkout failed:", err);
      setError("Something went wrong starting checkout. Please try again.");
      setBusy(false);
    }
  }, [onSuccess]);

  return (
    <div>
      <button
        type="button"
        onClick={start}
        disabled={busy}
        className={
          className ??
          "w-full rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed transition"
        }
      >
        {busy ? "Opening checkout…" : (label ?? `Get Pro — ${PRO_PRICE_DISPLAY} for ${PASS_DAYS} days`)}
      </button>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-300"
        >
          {error}
        </p>
      )}

      {notice && (
        <p className="mt-3 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2.5 text-sm text-amber-800 dark:text-amber-300">
          {notice}
        </p>
      )}
    </div>
  );
}
