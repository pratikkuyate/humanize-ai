import { NextResponse } from "next/server";
import { DB_READY } from "@/lib/db";
import { getSession } from "@/lib/session";
import { verifyPaymentSignature, fetchPayment } from "@/lib/razorpay";
import { findByOrderId, markPaid } from "@/lib/payments";
import { grantPass } from "@/lib/entitlement";
import { PASS_DAYS } from "@/lib/pricing";

/**
 * POST /api/checkout/verify — confirm a payment the browser just completed and
 * unlock Pro immediately.
 *
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *
 * This is the fast path, not the authoritative one. The webhook is what
 * guarantees fulfilment if the user closes the tab mid-redirect; this exists so
 * that in the normal case Pro is live before the success screen renders,
 * instead of some seconds later when the webhook lands.
 *
 * Both paths converge on markPaid(), whose status guard makes the second
 * arrival a no-op.
 */

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

function fail(error, status) {
  return NextResponse.json({ success: false, error }, { status, headers: NO_STORE });
}

export async function POST(request) {
  if (!DB_READY) return fail("Checkout is not available right now.", 503);

  const session = await getSession(request);
  if (!session) return fail("Sign in to complete your purchase.", 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid JSON in request body.", 400);
  }

  const orderId = String(body?.razorpay_order_id ?? "");
  const paymentId = String(body?.razorpay_payment_id ?? "");
  const signature = String(body?.razorpay_signature ?? "");

  if (!orderId || !paymentId || !signature) {
    return fail("Incomplete payment details.", 400);
  }

  // The one check that separates a real payment from someone posting plausible
  // ids by hand. Computed with a secret the browser has never seen.
  if (!verifyPaymentSignature({ orderId, paymentId, signature })) {
    console.warn("rejected payment with bad signature:", orderId);
    return fail("We could not verify this payment. Contact support if you were charged.", 400);
  }

  const payment = await findByOrderId(orderId);

  if (!payment) return fail("Unknown order.", 404);

  // The signature proves the payment is real; this proves it is *theirs*. A
  // valid signature from someone else's completed order must not unlock the
  // account that happens to be posting it.
  if (payment.user_id !== session.userId) {
    console.warn("order/user mismatch on verify:", orderId);
    return fail("This order belongs to a different account.", 403);
  }

  try {
    const transitioned = await markPaid({ orderId, paymentId });

    if (!transitioned) {
      // The webhook got here first, which is a success, not a conflict.
      return NextResponse.json(
        {
          success: true,
          alreadyProcessed: true,
          proUntil: session.proUntil?.toISOString() ?? null,
        },
        { headers: NO_STORE }
      );
    }

    const { expiresAt } = await grantPass({
      userId: payment.user_id,
      paymentId: payment.id,
      planId: payment.plan_id,
    });

    return NextResponse.json(
      { success: true, proUntil: expiresAt.toISOString(), passDays: PASS_DAYS },
      { headers: NO_STORE }
    );
  } catch (error) {
    console.error("payment verification failed:", error, { orderId });

    // Ask Razorpay directly what happened, so the reply can distinguish "your
    // money is safe, we will finish this shortly" from a genuine failure. The
    // webhook will still complete fulfilment either way.
    try {
      const remote = await fetchPayment(paymentId);
      if (remote?.status === "captured") {
        return NextResponse.json(
          {
            success: false,
            error:
              "Your payment went through, but activation is still finishing. Refresh your account page in a moment.",
            pending: true,
          },
          { status: 202, headers: NO_STORE }
        );
      }
    } catch {
      // Fall through to the generic message below.
    }

    return fail("Could not confirm your payment. Contact support if you were charged.", 500);
  }
}
