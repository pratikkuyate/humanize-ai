import { sql, one } from "./db.js";

/**
 * The `payments` table: every write path in one place.
 *
 * A row is created before the user is sent to Razorpay and updated once payment
 * is confirmed. Recording the order up front is what lets a later webhook be
 * matched to a real user — Razorpay's callback identifies an order, not a
 * session, so without this row there would be nobody to grant access to.
 *
 * Server-only.
 */

/** @returns {Promise<{ id: string }>} */
export async function recordOrder({ userId, orderId, amount, currency, planId }) {
  return one(sql`
    INSERT INTO payments (user_id, razorpay_order_id, amount, currency, plan_id, status)
    VALUES (${userId}, ${orderId}, ${amount}, ${currency}, ${planId}, 'created')
    RETURNING id
  `);
}

export async function findByOrderId(orderId) {
  return one(sql`
    SELECT id, user_id, razorpay_order_id, razorpay_payment_id,
           amount, currency, plan_id, status
    FROM payments
    WHERE razorpay_order_id = ${orderId}
  `);
}

/**
 * Mark an order paid.
 *
 * The `status = 'created'` guard makes this the idempotency point for the whole
 * fulfilment path. The browser redirect and the webhook both arrive for the same
 * payment, often within a second of each other; whichever lands second updates
 * zero rows and learns from the empty result that it has nothing to do.
 *
 * @returns {Promise<{ id: string, user_id: string, plan_id: string } | null>}
 *          the row when this call is the one that transitioned it, else null
 */
export async function markPaid({ orderId, paymentId }) {
  return one(sql`
    UPDATE payments
    SET status = 'paid', razorpay_payment_id = ${paymentId}, paid_at = now()
    WHERE razorpay_order_id = ${orderId} AND status = 'created'
    RETURNING id, user_id, plan_id
  `);
}

export async function markFailed(orderId) {
  await sql`
    UPDATE payments SET status = 'failed'
    WHERE razorpay_order_id = ${orderId} AND status = 'created'
  `;
}

export async function markRefunded(paymentId) {
  return one(sql`
    UPDATE payments SET status = 'refunded'
    WHERE razorpay_payment_id = ${paymentId} AND status = 'paid'
    RETURNING id, user_id
  `);
}
