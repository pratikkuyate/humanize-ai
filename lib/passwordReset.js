import { createHash, randomBytes } from "node:crypto";
import { sql, one } from "./db.js";
import { findUserByEmail } from "./users.js";
import { hashPassword } from "./password.js";
import { destroyAllSessions } from "./session.js";
import { sendEmail, emailLayout, emailButton, escapeHtml, SITE_URL } from "./email.js";

/**
 * Password reset by emailed link.
 *
 * The link carries a random 256-bit token in the URL fragment (`#token=`), not
 * the query string. Browsers never send a fragment to the server or in the
 * Referer header, so the token stays out of access logs and away from the
 * analytics scripts on the page. The database keeps only its SHA-256, the same
 * approach as sessions in lib/session.js.
 *
 * Server-only.
 */

/** How long a reset link works. Long enough to find the email, short enough to go stale fast. */
const TOKEN_MINUTES = 30;

/** At most one email per account in this window. Stops double-clicks sending two. */
const MIN_GAP_SECONDS = 60;

/** And at most this many per hour, so the form cannot flood someone's inbox. */
const MAX_PER_HOUR = 5;

function digest(token) {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Handle a "forgot password" request. Sends a reset link if an account exists.
 *
 * Returns nothing on purpose: the API answers the same way whether or not the
 * account exists, so the form cannot be used to find out who has an account.
 * The route runs this after responding (see `after()` in the route), so the
 * time an email takes to send does not reveal it either.
 *
 * Google-only accounts get a link too. Clicking it proves control of the
 * address, which is all a password needs, and it lets someone who lost access
 * to their Google login still reach their pass.
 *
 * @param {string} email
 */
export async function requestPasswordReset(email) {
  const user = await findUserByEmail(email);
  if (!user) return;

  const recent = await one(sql`
    SELECT
      count(*)::int AS last_hour,
      max(created_at) AS latest
    FROM password_resets
    WHERE user_id = ${user.id} AND created_at > now() - interval '1 hour'
  `);

  if (recent.last_hour >= MAX_PER_HOUR) return;
  if (recent.latest && Date.now() - new Date(recent.latest).getTime() < MIN_GAP_SECONDS * 1000) {
    return;
  }

  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + TOKEN_MINUTES * 60 * 1000);

  await sql`
    INSERT INTO password_resets (user_id, token_hash, expires_at)
    VALUES (${user.id}, ${digest(token)}, ${expires.toISOString()})
  `;

  const link = `${SITE_URL}/reset-password#token=${token}`;
  const greeting = user.name ? `Hi ${user.name},` : "Hi,";
  const action = user.password_hash ? "reset your password" : "set a password";

  await sendEmail({
    to: user.email,
    subject: "Reset your Simply Humanize password",
    text: [
      greeting,
      "",
      `Someone asked to ${action} for your Simply Humanize account. Use this link to choose a new one:`,
      "",
      link,
      "",
      `The link works once and expires in ${TOKEN_MINUTES} minutes.`,
      "",
      "If you didn't ask for this, ignore this email. Your password won't change.",
    ].join("\n"),
    html: emailLayout({
      preheader: `Choose a new password. The link expires in ${TOKEN_MINUTES} minutes.`,
      body: `
        <p style="margin:0 0 12px;">${escapeHtml(greeting)}</p>
        <p style="margin:0;">Someone asked to ${action} for your Simply Humanize account. Click below to choose a new one.</p>
        ${emailButton(link, "Choose a new password")}
        <p style="margin:0 0 12px;font-size:13px;color:#64748b;">The link works once and expires in ${TOKEN_MINUTES} minutes. If the button doesn't work, paste this into your browser:<br><span style="word-break:break-all;">${escapeHtml(link)}</span></p>
        <p style="margin:0;font-size:13px;color:#64748b;">If you didn't ask for this, ignore this email. Your password won't change.</p>`,
    }),
  });
}

/**
 * Use a reset token to set a new password.
 *
 * The token is claimed with one conditional UPDATE, so two requests racing with
 * the same link cannot both succeed. On success every other token for the user
 * is voided and every session is signed out — if someone else knew the old
 * password, this is the moment they lose access.
 *
 * Also marks the email verified: following the link proved control of it.
 *
 * @param {string} token
 * @param {string} newPassword already length-checked by the caller
 * @returns {Promise<string | null>} the user id, or null if the link is invalid,
 *          expired or already used
 */
export async function resetPassword(token, newPassword) {
  if (!token) return null;

  const claimed = await one(sql`
    UPDATE password_resets
    SET used_at = now()
    WHERE token_hash = ${digest(token)}
      AND used_at IS NULL
      AND expires_at > now()
    RETURNING user_id
  `);

  if (!claimed) return null;

  const passwordHash = await hashPassword(newPassword);

  await sql`
    UPDATE users
    SET password_hash = ${passwordHash},
        email_verified = true,
        updated_at = now()
    WHERE id = ${claimed.user_id}
  `;

  await sql`
    UPDATE password_resets SET used_at = now()
    WHERE user_id = ${claimed.user_id} AND used_at IS NULL
  `;

  await destroyAllSessions(claimed.user_id);

  return claimed.user_id;
}
