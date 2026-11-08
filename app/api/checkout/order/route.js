import { NextResponse } from "next/server";
import { DB_READY } from "@/lib/db";
import { getSession } from "@/lib/session";
import { createOrder, RAZORPAY_READY } from "@/lib/razorpay";
import { recordOrder } from "@/lib/payments";
import { PRO_PLAN_ID, CURRENCY, RAZORPAY_KEY_ID, getPass } from "@/lib/pricing";

/**
 * POST /api/checkout/order — open a Razorpay order for the signed-in user.
 *
 * Body (optional): { planId: "pro-7" | "pro-30" }. Defaults to the 30-day pass.
 *
 * No money moves here. This reserves an amount with Razorpay and returns the
 * order id that the checkout widget in the browser needs.
 *
 * Note what the request body does NOT contain: an amount. The browser names a
 * plan, and the price is looked up from the server's own PASSES table, because
 * a client-supplied amount is a client-supplied price. An unknown plan id is
 * rejected rather than quietly defaulted, so a typo can never sell the wrong
 * pass.
 */

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

function fail(error, status) {
  return NextResponse.json({ success: false, error }, { status, headers: NO_STORE });
}

export async function POST(request) {
  if (!DB_READY || !RAZORPAY_READY) {
    return fail("Checkout is not available right now.", 503);
  }

  const session = await getSession(request);

  // Purchases are tied to an account, since the account is what the pass is
  // granted to. Buying while signed out would leave nothing to attach it to.
  if (!session) return fail("Sign in to continue to checkout.", 401);

  // An empty or missing body is the 30-day pass, which keeps any older client
  // that posts nothing working.
  const body = await request.json().catch(() => null);
  const pass = getPass(body?.planId ?? PRO_PLAN_ID);
  if (!pass) return fail("Unknown plan.", 400);

  // Buying again while still Pro is allowed and not a mistake: grantPass()
  // extends from the current expiry rather than overwriting it, so an early
  // renewal loses no days.

  try {
    const order = await createOrder({
      amountMinor: pass.amountMinor,
      currency: CURRENCY,
      // Razorpay caps receipts at 40 chars, so use a short unique-enough stamp
      // rather than the user id and a timestamp.
      receipt: `sh_${Date.now().toString(36)}`,
      notes: {
        user_id: session.userId,
        email: session.email,
        plan_id: pass.id,
      },
    });

    await recordOrder({
      userId: session.userId,
      orderId: order.id,
      amount: pass.amountMinor,
      currency: CURRENCY,
      planId: pass.id,
    });

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        amount: pass.amountMinor,
        currency: CURRENCY,
        keyId: RAZORPAY_KEY_ID,
        planId: pass.id,
        passDays: pass.days,
        email: session.email,
        name: session.name,
      },
      { headers: NO_STORE }
    );
  } catch (error) {
    console.error("order creation failed:", error);
    return fail("Could not start checkout. Please try again.", 502);
  }
}
