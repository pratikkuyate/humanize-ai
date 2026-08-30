import { sql, one } from "./db.js";
import { PRO_PLAN_ID, PASS_DAYS } from "./pricing.js";

/**
 * Pro access: granting it after a payment, and answering "is this user Pro?".
 *
 * Access is a window, not a flag. A purchase inserts a row covering the next
 * PASS_DAYS days and the user is Pro while any un-revoked row is still live.
 * Buying again before expiry stacks: the new window starts where the old one
 * ends, so nobody loses days by renewing early.
 *
 * Server-only.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Grant a pass for a completed payment.
 *
 * Idempotent, and that matters more here than anywhere else in the codebase:
 * the success redirect and the Razorpay webhook both race to fulfil the same
 * payment, and they will frequently both arrive. The unique index on
 * entitlements(payment_id) makes the loser a no-op rather than a second free
 * month.
 *
 * @param {{ userId: string, paymentId: string, planId?: string }} input
 * @returns {Promise<{ expiresAt: Date, alreadyGranted: boolean }>}
 */
export async function grantPass({ userId, paymentId, planId = PRO_PLAN_ID }) {
  // Start from the user's current expiry if they still have time left, so an
  // early renewal adds to the balance instead of resetting it.
  const current = await one(sql`
    SELECT max(expires_at) AS pro_until
    FROM entitlements
    WHERE user_id = ${userId} AND revoked_at IS NULL AND expires_at > now()
  `);

  const startsAt = current?.pro_until ? new Date(current.pro_until) : new Date();
  const expiresAt = new Date(startsAt.getTime() + PASS_DAYS * DAY_MS);

  const rows = await sql`
    INSERT INTO entitlements (user_id, payment_id, plan_id, starts_at, expires_at)
    VALUES (
      ${userId}, ${paymentId}, ${planId},
      ${startsAt.toISOString()}, ${expiresAt.toISOString()}
    )
    ON CONFLICT (payment_id) WHERE payment_id IS NOT NULL DO NOTHING
    RETURNING expires_at
  `;

  if (rows.length === 0) {
    // Another path already fulfilled this payment. Report its window, not ours.
    const existing = await one(sql`
      SELECT expires_at FROM entitlements WHERE payment_id = ${paymentId}
    `);
    return {
      expiresAt: existing ? new Date(existing.expires_at) : expiresAt,
      alreadyGranted: true,
    };
  }

  return { expiresAt: new Date(rows[0].expires_at), alreadyGranted: false };
}

/**
 * When a user's Pro access runs out, or null if they have none.
 *
 * @param {string} userId
 * @returns {Promise<Date | null>}
 */
export async function proUntil(userId) {
  const row = await one(sql`
    SELECT max(expires_at) AS pro_until
    FROM entitlements
    WHERE user_id = ${userId} AND revoked_at IS NULL AND expires_at > now()
  `);
  return row?.pro_until ? new Date(row.pro_until) : null;
}

/**
 * Withdraw the access a payment bought. Call this when refunding, so the refund
 * and the loss of access happen together rather than a month apart.
 *
 * @param {string} paymentId
 */
export async function revokeForPayment(paymentId) {
  await sql`
    UPDATE entitlements
    SET revoked_at = now()
    WHERE payment_id = ${paymentId} AND revoked_at IS NULL
  `;
}

/** Purchase history for the account page. */
export async function listPayments(userId, limit = 20) {
  return sql`
    SELECT razorpay_order_id, razorpay_payment_id, amount, currency,
           plan_id, status, created_at, paid_at
    FROM payments
    WHERE user_id = ${userId} AND status <> 'created'
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
}
