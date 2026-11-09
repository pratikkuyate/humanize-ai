/**
 * Transactional email through Resend's REST API.
 *
 * fetch rather than the `resend` npm SDK, for the same reason lib/razorpay.js
 * skips Razorpay's: one endpoint does not justify a dependency.
 *
 * Without RESEND_API_KEY the email is printed to the server console instead of
 * sent. That keeps password reset testable on localhost with no account. In
 * production a missing key is logged as an error, and the email body (which may
 * hold a reset link) is not printed.
 *
 * Server-only. RESEND_API_KEY can send mail as your domain and must never get a
 * NEXT_PUBLIC_ prefix.
 */

const API_KEY = process.env.RESEND_API_KEY ?? "";

/**
 * The From address. Its domain must be verified in Resend (DNS records), or
 * Resend rejects the send. Resend's shared `onboarding@resend.dev` works for
 * testing but only delivers to the Resend account owner's own address.
 */
const FROM = process.env.EMAIL_FROM ?? "Simply Humanize <onboarding@resend.dev>";

/** Where replies go. Receipts get questions, and a no-reply address loses them. */
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? "";

export const EMAIL_READY = API_KEY.length > 0;

/** The public site origin, for links inside emails. Never derived from the request. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com").replace(
  /\/$/,
  ""
);

/**
 * Send one email.
 *
 * Throws on failure so the caller decides what a failure means: a receipt
 * releases its claim for a retry; a reset request just logs it.
 *
 * @param {{
 *   to: string,
 *   subject: string,
 *   html: string,
 *   text: string,
 *   idempotencyKey?: string,
 * }} message
 */
export async function sendEmail({ to, subject, html, text, idempotencyKey }) {
  if (!EMAIL_READY) {
    if (process.env.NODE_ENV === "production") {
      console.error(`email not sent (RESEND_API_KEY unset): "${subject}"`);
      return { skipped: true };
    }
    console.info(
      `\n──── email (not sent: RESEND_API_KEY unset) ────\nTo: ${to}\nSubject: ${subject}\n\n${text}\n────────────────────────────────────────────────\n`
    );
    return { skipped: true };
  }

  const headers = {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };
  // Resend drops a repeat send carrying the same key, which guards against a
  // retry after a timeout whose first attempt actually went through.
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers,
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject,
      html,
      text,
      ...(REPLY_TO ? { reply_to: REPLY_TO } : {}),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`Resend send failed: ${data?.message ?? `HTTP ${response.status}`}`);
  }

  return { id: data.id };
}

/** Escape text for an HTML email. Names and emails here are user-supplied. */
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Wrap body HTML in the shared email layout.
 *
 * Table layout and inline styles only: Gmail strips <style> blocks in some
 * clients, and Outlook ignores most modern CSS.
 *
 * @param {{ preheader: string, body: string }} parts
 */
export function emailLayout({ preheader, body }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;">
      <tr><td style="padding:28px 32px 8px;font-size:18px;font-weight:700;color:#6d28d9;">Simply Humanize</td></tr>
      <tr><td style="padding:8px 32px 32px;font-size:15px;line-height:1.6;color:#334155;">${body}</td></tr>
    </table>
    <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;">
      <a href="${SITE_URL}" style="color:#94a3b8;">${escapeHtml(SITE_URL.replace(/^https?:\/\//, ""))}</a>
    </p>
  </td></tr>
</table>
</body>
</html>`;
}

/** A violet call-to-action button for emailLayout bodies. */
export function emailButton(href, label) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="border-radius:8px;background:#7c3aed;">
<a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${escapeHtml(label)}</a>
</td></tr></table>`;
}
