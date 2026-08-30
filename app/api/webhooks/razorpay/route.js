import { NextResponse } from "next/server";
import { DB_READY } from "@/lib/db";
import { verifyWebhookSignature, WEBHOOK_CONFIGURED } from "@/lib/razorpay";
import { markPaid, markFailed, markRefunded } from "@/lib/payments";
import { grantPass, revokeForPayment } from "@/lib/entitlement";

/**
 * POST /api/webhooks/razorpay — the authoritative fulfilment path.
 *
 * The browser redirect in /api/checkout/verify is faster but not reliable: the
 * user can close the tab, lose signal, or have the redirect eaten by a payment
 * app returning to the wrong place. This endpoint is what guarantees that money
 * taken always results in access granted, because Razorpay retries it until it
 * gets a 2xx.
 *
 * That retry behaviour drives two rules here:
 *
 *   1. Every handler must be idempotent — the same event will arrive again.
 *   2. Return 200 for anything already handled or not of interest. A non-2xx
 *      tells Razorpay to retry, so using error codes for "I don't care about
 *      this event" would earn an endless redelivery loop.
 *
 * Configure in the Razorpay dashboard (Settings → Webhooks) with the events
 * payment.captured, payment.failed, and refund.processed, pointing at
 * https://<your-domain>/api/webhooks/razorpay
 */

export const dynamic = "force-dynamic";

/** Acknowledge without acting. Keeps Razorpay from retrying. */
function ack(note) {
  return NextResponse.json({ received: true, note });
}

export async function POST(request) {
  // The signature covers the exact bytes received. Parsing to JSON and
  // re-serialising changes whitespace and key order, and the HMAC then never
  // matches — the usual reason a Razorpay webhook "randomly" fails to verify.
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!WEBHOOK_CONFIGURED) {
    console.error("razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is unset");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  if (!verifyWebhookSignature(raw, signature)) {
    // Unsigned or forged. 400 rather than 200 — this is not a delivery we want
    // acknowledged, and a real Razorpay event will always be signed.
    console.warn("rejected razorpay webhook with invalid signature");
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (!DB_READY) {
    // Retry later rather than acknowledge — the event is genuine and we simply
    // cannot record it right now.
    return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
  }

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Malformed payload." }, { status: 400 });
  }

  const type = event?.event;
  const entity = event?.payload?.payment?.entity;

  try {
    switch (type) {
      case "payment.captured": {
        const orderId = entity?.order_id;
        const paymentId = entity?.id;
        if (!orderId || !paymentId) return ack("missing order or payment id");

        const transitioned = await markPaid({ orderId, paymentId });

        if (!transitioned) {
          // Already fulfilled — either by the browser redirect or by an earlier
          // delivery of this same event. Nothing to do.
          return ack("already fulfilled");
        }

        await grantPass({
          userId: transitioned.user_id,
          paymentId: transitioned.id,
          planId: transitioned.plan_id,
        });

        console.log("pro granted via webhook for order", orderId);
        return ack("granted");
      }

      case "payment.failed": {
        const orderId = entity?.order_id;
        if (orderId) await markFailed(orderId);
        return ack("marked failed");
      }

      case "refund.created":
      case "refund.processed": {
        // On refund events the payment id lives under the refund entity.
        const paymentId =
          event?.payload?.refund?.entity?.payment_id ?? entity?.id ?? null;
        if (!paymentId) return ack("missing payment id");

        const refunded = await markRefunded(paymentId);

        // Withdraw the access the payment bought. Without this a refunded
        // customer keeps a month of Pro they are no longer paying for.
        if (refunded) await revokeForPayment(refunded.id);

        return ack(refunded ? "refunded and revoked" : "no matching payment");
      }

      default:
        // Razorpay sends more event types than we subscribe to, and the set
        // grows over time. Acknowledge anything unrecognised.
        return ack(`ignored ${type ?? "unknown"}`);
    }
  } catch (error) {
    console.error("razorpay webhook handler failed:", error, { type });
    // 500 so Razorpay retries. Every handler above is idempotent, so a retry of
    // a partially applied event is safe.
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }
}
