import { sql, one } from "./db.js";
import { hashPassword } from "./password.js";

/**
 * User records. Every write path for the `users` and `oauth_accounts` tables
 * lives here so the normalisation rules are applied in exactly one place.
 *
 * Server-only.
 */

/**
 * Email is stored as typed but matched lowercased.
 *
 * The local part of an address is technically case-sensitive per RFC 5321, but
 * no mail provider people actually use treats it that way, and honouring the RFC
 * would let one person register Bob@ and bob@ as separate accounts — then be
 * unable to explain why their password does not work. The unique index in
 * db/schema.sql is on lower(email) to match.
 */
export function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

/** Deliberately permissive: real validation is whether mail arrives. */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

export async function findUserByEmail(email) {
  return one(sql`
    SELECT id, email, name, image_url, password_hash, email_verified
    FROM users
    WHERE lower(email) = ${normalizeEmail(email)}
  `);
}

export async function findUserById(id) {
  return one(sql`
    SELECT id, email, name, image_url, password_hash, email_verified
    FROM users
    WHERE id = ${id}
  `);
}

/**
 * Create an email + password account.
 *
 * Returns null when the address is already taken. That is detected by the unique
 * index rather than a prior SELECT, because a check-then-insert can be beaten by
 * two simultaneous signups for the same address.
 *
 * @returns {Promise<{ id: string, email: string, name: string | null } | null>}
 */
export async function createUserWithPassword({ email, password, name }) {
  const passwordHash = await hashPassword(password);

  const rows = await sql`
    INSERT INTO users (email, name, password_hash)
    VALUES (${normalizeEmail(email)}, ${name?.trim() || null}, ${passwordHash})
    ON CONFLICT (lower(email)) DO NOTHING
    RETURNING id, email, name
  `;

  return rows[0] ?? null;
}

/**
 * Resolve a Google identity to a local user, creating or linking as needed.
 *
 * Three cases, in order:
 *
 *   1. This Google id is already linked  → sign that user in.
 *   2. The email matches an existing account → link Google to it. This is the
 *      case worth being deliberate about: someone signed up with a password,
 *      later clicks "Continue with Google", and expects to land in the account
 *      they already have rather than a confusing empty duplicate. Linking on a
 *      Google-verified email is safe because Google has proven control of the
 *      address; we refuse to link an unverified one below.
 *   3. Neither → create a fresh account with no password. `password_hash` stays
 *      NULL, which is what makes password login impossible for it.
 *
 * @param {{ providerUserId: string, email: string, name?: string,
 *           picture?: string, emailVerified: boolean }} profile
 */
export async function findOrCreateGoogleUser(profile) {
  const email = normalizeEmail(profile.email);

  const linked = await one(sql`
    SELECT u.id, u.email, u.name
    FROM oauth_accounts a
    JOIN users u ON u.id = a.user_id
    WHERE a.provider = 'google' AND a.provider_user_id = ${profile.providerUserId}
  `);

  if (linked) {
    // Keep the display name and avatar fresh, but never overwrite a name the
    // user set here with a blank one from Google.
    await sql`
      UPDATE users
      SET name       = COALESCE(NULLIF(${profile.name ?? ""}, ''), name),
          image_url  = COALESCE(NULLIF(${profile.picture ?? ""}, ''), image_url),
          updated_at = now()
      WHERE id = ${linked.id}
    `;
    return linked;
  }

  const existing = await findUserByEmail(email);

  if (existing) {
    // Only link when Google says the address is verified. Without that check,
    // an attacker with an unverified Google account bearing someone else's
    // address could take over their account by "signing in with Google".
    if (!profile.emailVerified) {
      throw new Error("UNVERIFIED_GOOGLE_EMAIL");
    }

    await sql`
      INSERT INTO oauth_accounts (user_id, provider, provider_user_id)
      VALUES (${existing.id}, 'google', ${profile.providerUserId})
      ON CONFLICT (provider, provider_user_id) DO NOTHING
    `;

    await sql`
      UPDATE users
      SET image_url  = COALESCE(image_url, NULLIF(${profile.picture ?? ""}, '')),
          name       = COALESCE(name, NULLIF(${profile.name ?? ""}, '')),
          -- Google has verified the address, so trust it over our own flag.
          email_verified = true,
          updated_at = now()
      WHERE id = ${existing.id}
    `;

    return { id: existing.id, email: existing.email, name: existing.name };
  }

  const created = await one(sql`
    INSERT INTO users (email, name, image_url, email_verified)
    VALUES (
      ${email},
      ${profile.name?.trim() || null},
      ${profile.picture || null},
      ${Boolean(profile.emailVerified)}
    )
    RETURNING id, email, name
  `);

  await sql`
    INSERT INTO oauth_accounts (user_id, provider, provider_user_id)
    VALUES (${created.id}, 'google', ${profile.providerUserId})
    ON CONFLICT (provider, provider_user_id) DO NOTHING
  `;

  return created;
}
