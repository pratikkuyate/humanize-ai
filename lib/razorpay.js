import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Razorpay integration — orders, and the two signature checks that decide
 * whether money actually arrived.
 *
 * Talks to the REST API over fetch rather than through the `razorpay` npm SDK.
 * The surface used here is three endpoints and two HMACs; the SDK would add a
 * dependency and a Node-only HTTP client for no gain.
 *
 * Server-only. RAZORPAY_KEY_SECRET must never reach the browser — it is both
 * the API password and the key that every signature below is verified with, so
 * leaking it would let anyone forge a "payment succeeded" callback.
 */

const API = "https://api.razorpay.com/v1";

const KEY_ID = process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

/** True when orders can actually be created. */
export const RAZORPAY_READY = Boolean(KEY_ID && KEY_SECRET);

function authHeader() {
  return `Basic ${Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64")}`;
}

/**
 * Constant-time string compare for signatures.
 *
 * A plain `===` on a signature leaks, through timing, how many leading bytes a
 * guess got right — which is enough to forge one byte at a time.
 */
function safeEqual(a, b) {
  const left = Buffer.from(String(a ?? ""), "utf8");
  const right = Buffer.from(String(b ?? ""), "utf8");
  if (left.length !== right.length || left.length === 0) return false;
  return timingSafeEqual(left, right);
}

/**
 * Create an order. This reserves an amount with Razorpay; no money moves until
 * the user completes checkout in the browser.
 *
 * The amount is passed from the server's own constants and never from the
 * client. If the browser could name its own price, it would pay $0.01 for a
 * month of Pro.
 *
 * @param {{ amountMinor: number, currency: string, receipt: string,
 *           notes?: Record<string, string> }} input
 * @returns {Promise<{ id: string, amount: number, currency: string, status: string }>}
 */
export async function createOrder({ amountMinor, currency, receipt, notes }) {
  if (!RAZORPAY_READY) {
    throw new Error("Razorpay is not configured — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }

  const response = await fetch(`${API}/orders`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountMinor,
      currency,
      // Razorpay caps receipts at 40 characters and rejects the whole order if
      // it is longer, which is an unhelpful way to discover the limit.
      receipt: receipt.slice(0, 40),
      notes: notes ?? {},
      payment_capture: 1,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const reason = data?.error?.description ?? `HTTP ${response.status}`;
    throw new Error(`Razorpay order creation failed: ${reason}`);
  }

  return data;
}

/** Fetch a payment, to confirm its real status straight from Razorpay. */
export async function fetchPayment(paymentId) {
  const response = await fetch(`${API}/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: authHeader() },
  });

  if (!response.ok) {
    throw new Error(`Razorpay payment lookup failed: HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Verify the signature Razorpay Checkout hands back to the browser on success.
 *
 * This is the whole security model of the success redirect. The browser reports
 * "I paid, here is the payment id" — and only this HMAC, computed with a secret
 * the browser has never seen, distinguishes that from someone typing the same
 * fields into the endpoint by hand.
 *
 * @param {{ orderId: string, paymentId: string, signature: string }} input
 */
export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  if (!KEY_SECRET || !orderId || !paymentId || !signature) return false;

  const expected = createHmac("sha256", KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return safeEqual(expected, signature);
}

/**
 * Verify a webhook, which is signed with the webhook secret over the raw body.
 *
 * The body must be the exact bytes received. Parsing to JSON and re-stringifying
 * changes key order and whitespace, and the signature then never matches — the
 * usual reason a Razorpay webhook "randomly" fails to validate.
 *
 * @param {string} rawBody
 * @param {string | null} signature
 */
export function verifyWebhookSignature(rawBody, signature) {
  if (!WEBHOOK_SECRET || !signature) return false;

  const expected = createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}

export const WEBHOOK_CONFIGURED = Boolean(WEBHOOK_SECRET);
