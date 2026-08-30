-- Simply Humanize — schema for accounts, payments, and Pro entitlements.
--
-- Safe to run more than once: every statement is IF NOT EXISTS. Apply with
-- `npm run db:migrate`, or paste into the Neon SQL editor.
--
-- Design notes worth knowing before you change anything here:
--
--   * Free users never touch this database. Anonymous metering stays in the
--     signed cookie (lib/quotaCookie.js), so an unauthenticated visit costs
--     zero queries. Rows appear only once someone signs up.
--   * Money is stored in the currency's smallest unit as an integer
--     (900 = $9.00). Never use a float for a payment amount.
--   * Entitlements are append-only. A renewal inserts a new row rather than
--     extending an old one, so the payment history stays auditable and a
--     refund can revoke one purchase without erasing the rest.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Accounts ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email          text        NOT NULL,
  -- Lowercased at write time in lib/users.js. A functional unique index below
  -- enforces it, which avoids depending on the citext extension.
  name           text,
  image_url      text,
  -- NULL for Google-only accounts: there is no password to verify, and a NULL
  -- here is what makes password login correctly impossible for them.
  password_hash  text,
  email_verified boolean     NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email));

-- OAuth identities. Separate from users so one person can later attach Google
-- to an account they originally created with a password.
CREATE TABLE IF NOT EXISTS oauth_accounts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider          text        NOT NULL,
  provider_user_id  text        NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_user_id)
);

CREATE INDEX IF NOT EXISTS oauth_accounts_user_idx ON oauth_accounts (user_id);

-- Server-side sessions rather than a self-contained token.
--
-- The cookie carries only an opaque id, so signing out, a password change, or
-- a compromised device can be revoked immediately by deleting the row. A
-- stateless JWT cannot be withdrawn before it expires, which is the wrong
-- trade-off when the token is what unlocks paid access.
CREATE TABLE IF NOT EXISTS sessions (
  id          text PRIMARY KEY,          -- sha256 of the cookie's random token
  user_id     uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  user_agent  text,
  ip_hash     text
);

CREATE INDEX IF NOT EXISTS sessions_user_idx    ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions (expires_at);

-- ─── Payments ────────────────────────────────────────────────────────────────

-- One row per Razorpay order, created before the user is sent to checkout and
-- updated when payment is confirmed.
--
-- `razorpay_payment_id` is UNIQUE and that is load-bearing: the success
-- redirect and the webhook both try to fulfil the same payment, and this index
-- is what makes the second one a no-op instead of a double grant.
CREATE TABLE IF NOT EXISTS payments (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  razorpay_order_id    text        NOT NULL UNIQUE,
  razorpay_payment_id  text        UNIQUE,
  amount               integer     NOT NULL,   -- smallest currency unit
  currency             text        NOT NULL,
  plan_id              text        NOT NULL,
  status               text        NOT NULL DEFAULT 'created',
                                               -- created | paid | failed | refunded
  created_at           timestamptz NOT NULL DEFAULT now(),
  paid_at              timestamptz
);

CREATE INDEX IF NOT EXISTS payments_user_idx   ON payments (user_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments (status);

-- ─── Entitlements ────────────────────────────────────────────────────────────

-- What a payment actually bought: a window of Pro access.
--
-- Access is "any live row for this user", so stacked purchases work naturally —
-- buying again before expiry adds a second row and lib/entitlement.js reports
-- the furthest expiry of the two.
CREATE TABLE IF NOT EXISTS entitlements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_id  uuid        REFERENCES payments(id) ON DELETE SET NULL,
  plan_id     text        NOT NULL,
  starts_at   timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz NOT NULL,
  revoked_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- The exact shape of the "is this user Pro right now" lookup.
CREATE INDEX IF NOT EXISTS entitlements_active_idx
  ON entitlements (user_id, expires_at DESC)
  WHERE revoked_at IS NULL;

-- One entitlement per payment. Belt and braces alongside the payment_id unique
-- index above: even if two fulfilment paths race past the status check, the
-- second INSERT cannot create a duplicate grant.
CREATE UNIQUE INDEX IF NOT EXISTS entitlements_payment_idx
  ON entitlements (payment_id)
  WHERE payment_id IS NOT NULL;
