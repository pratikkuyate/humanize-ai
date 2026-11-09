import { sql, one } from "./db.js";
import { passDaysFor } from "./entitlement.js";
import { sendEmail, emailLayout, emailButton, escapeHtml, SITE_URL } from "./email.js";

/**
 * The purchase receipt email.
 *
 * Both fulfilment paths — the browser verify call and the Razorpay webhook —
 * call sendReceiptOnce() for the same payment, often within a second of each
 * other. The conditional UPDATE on `receipt_sent_at` lets exactly one of them
 * send. If sending fails the claim is released, so whichever path arrives next
 * (or a webhook redelivery) tries again.
 *
 * Server-only.
 */

/** "$4.00 USD" from 400 + "USD". Every currency we sell has 2 decimal places. */
function formatAmount(minor, currency) {
  const value = (minor / 100).toFixed(2);
  return currency === "USD" ? `$${value} USD` : `${value} ${currency}`;
}

/** Dates are shown in UTC and labelled as such: the server does not know the buyer's zone. */
function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Send the receipt for a paid payment, unless one has already gone out.
 *
 * Never throws: a receipt is a courtesy, and a failure here must not turn a
 * successful payment into an error for the user or a webhook retry loop.
 *
 * @param {string} paymentRowId payments.id (our uuid, not Razorpay's id)
 */
export async function sendReceiptOnce(paymentRowId) {
  let claimed = null;

  try {
    claimed = await one(sql`
      UPDATE payments
      SET receipt_sent_at = now()
      WHERE id = ${paymentRowId}
        AND status = 'paid'
        AND receipt_sent_at IS NULL
      RETURNING id
    `);
    if (!claimed) return;

    const row = await one(sql`
      SELECT
        p.razorpay_payment_id, p.amount, p.currency, p.plan_id, p.paid_at,
        u.email, u.name,
        (
          SELECT max(e.expires_at) FROM entitlements e
          WHERE e.user_id = u.id AND e.revoked_at IS NULL AND e.expires_at > now()
        ) AS pro_until
      FROM payments p
      JOIN users u ON u.id = p.user_id
      WHERE p.id = ${paymentRowId}
    `);
    if (!row) return;

    const days = passDaysFor(row.plan_id);
    const passName = `Pro — ${days}-day pass`;
    const amount = formatAmount(row.amount, row.currency);
    const paidOn = formatDate(row.paid_at ?? new Date());
    // The live expiry across all passes, so a stacked renewal shows its real end date.
    const until = row.pro_until ? `${formatDate(row.pro_until)} (UTC)` : null;
    const greeting = row.name ? `Hi ${row.name},` : "Hi,";
    const startUrl = `${SITE_URL}/#tool`;

    const lines = [
      ["Item", passName],
      ["Amount paid", amount],
      ["Date", paidOn],
      ["Payment ID", row.razorpay_payment_id ?? "—"],
      ...(until ? [["Pro active until", until]] : []),
    ];

    await sendEmail({
      to: row.email,
      subject: `Your receipt: ${passName} (${amount})`,
      idempotencyKey: `receipt-${paymentRowId}`,
      text: [
        greeting,
        "",
        `Thanks for buying a ${passName}. Pro is active on your account: unlimited humanizer runs, no daily cap and no word limit.`,
        "",
        ...lines.map(([label, value]) => `${label}: ${value}`),
        "",
        "This was a one-time payment. Nothing renews automatically.",
        "",
        `Start humanizing: ${startUrl}`,
        "",
        "Questions about this payment? Just reply to this email.",
      ].join("\n"),
      html: emailLayout({
        preheader: `${passName}, ${amount}.${until ? ` Pro is active until ${until}.` : ""}`,
        body: `
          <p style="margin:0 0 12px;">${escapeHtml(greeting)}</p>
          <p style="margin:0 0 20px;">Thanks for buying a <strong>${escapeHtml(passName)}</strong>. Pro is active on your account: unlimited humanizer runs, no daily cap and no word limit.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0;font-size:14px;">
            ${lines
              .map(
                ([label, value]) =>
                  `<tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;">${escapeHtml(label)}</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#0f172a;">${escapeHtml(value)}</td></tr>`
              )
              .join("")}
          </table>
          <p style="margin:16px 0 0;font-size:13px;color:#64748b;">This was a one-time payment. Nothing renews automatically.</p>
          ${emailButton(startUrl, "Start humanizing")}
          <p style="margin:0;font-size:13px;color:#64748b;">Questions about this payment? Just reply to this email.</p>`,
      }),
    });
  } catch (error) {
    console.error("receipt email failed:", error, { paymentRowId });
    // Release the claim so the other fulfilment path, or a webhook redelivery,
    // can try again.
    if (claimed) {
      await sql`UPDATE payments SET receipt_sent_at = NULL WHERE id = ${paymentRowId}`.catch(
        () => {}
      );
    }
  }
}
