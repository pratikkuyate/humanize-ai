# Payments Setup — Neon + Razorpay + Google Sign-In

Everything in the code is built and building clean. What remains is configuration:
five services need credentials pasted into `.env.local`, and one SQL file needs
running. This is that checklist, in the order that lets you test as you go.

Until credentials exist the site behaves exactly as it did before — free tools
work, the Google button hides itself, and the pricing CTA stays "Get early
access". Nothing here is a half-deployed state.

---

## 1. `QUOTA_SALT` (30 seconds)

One secret signs the quota cookie, the OAuth state, and the IP hashes. Generate:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste into `.env.local` as `QUOTA_SALT=`.

> Treat it as permanent. Rotating it signs everyone out and resets every quota.

---

## 2. Neon (5 minutes)

1. Neon dashboard → your project → **Connection Details**.
2. Copy the **Pooled connection** string (it contains `-pooler`). Pooled, not
   direct — serverless functions open a connection per invocation and the
   direct endpoint will exhaust its limit under any real traffic.
3. `.env.local`:

   ```
   DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```

4. Create the tables:

   ```bash
   npm run db:migrate
   ```

   Expect `Schema applied — N statements OK.` It is idempotent, so re-running it
   after any schema change is safe.

At this point sign-up and sign-in work with email and password. Test it:
`npm run dev`, then visit `/signup`.

---

## 3. Google Sign-In (10 minutes)

Google moved OAuth configuration out of *APIs & Services* into a section called
**Google Auth Platform**. The old menu path still redirects there, but every
tutorial written before the change describes screens that no longer exist. The
direct URLs below are more stable than the menu, so use them.

### 3.1 Branding — <https://console.cloud.google.com/auth/branding>

Create or select a project first, then set the app name (`Simply Humanize`), a
user support email, and a developer contact email.

Skip the logo. Uploading one triggers Google's brand verification, which takes
weeks and is not needed here.

### 3.2 Audience — <https://console.cloud.google.com/auth/audience>

Choose **External**. (*Internal* exists only for Workspace orgs and would limit
sign-in to your own domain.)

You start in **Testing**, where only listed test users can sign in — everyone
else sees "app is blocked". Add your own address under **Test users** to test,
then **Publish app** before launch. With only the scopes below, publishing is
instant and needs no Google review.

### 3.3 Data Access — <https://console.cloud.google.com/auth/scopes>

Add exactly these three, matching what [lib/google.js](lib/google.js) requests:

```
openid
.../auth/userinfo.email
.../auth/userinfo.profile
```

All three are non-sensitive, which is what keeps the project out of the
verification queue. Adding more scopes is what triggers review.

### 3.4 Clients — <https://console.cloud.google.com/auth/clients>

**Create client** → type **Web application**.

Under **Authorised redirect URIs**, add one per environment you will use:

```
http://localhost:3000/api/auth/google/callback
https://humanize-ai-chi.vercel.app/api/auth/google/callback
https://simplyhumanize.com/api/auth/google/callback
```

Leave **Authorised JavaScript origins** empty — this is a server-side redirect
flow and does not use it.

On **Create**, copy the secret immediately; it is shown in full only once.

```
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
```

The "Continue with Google" button appears on `/login` and `/signup` as soon as
both are set, and hides itself again if either is missing.

### 3.5 Failure modes worth knowing in advance

**`redirect_uri_mismatch`.** Google compares the URI literally — a trailing
slash, `http` vs `https`, or a stray `www.` is a mismatch. The error page names
the URI it actually received; paste that into the client's allowed list.

**Localhost redirects to production.** `redirectUri()` builds the callback URL
from `NEXT_PUBLIC_SITE_URL`, and `.env.local` currently points at the Vercel
deployment — so local sign-in will try to bounce there. Set
`NEXT_PUBLIC_SITE_URL=http://localhost:3000` while developing. (`http://` is
permitted by Google for localhost only.)

**Vercel preview deployments cannot use Google sign-in.** Preview URLs are
generated per deploy and Google allows no wildcards. Test on localhost or the
production domain.

---

## 4. Razorpay (15 minutes)

### 4.1 International payments — CURRENTLY BLOCKING

**Status as of 2026-08-29: not enabled. USD payments fail.**

Confirmed by testing: the order is created successfully (a `created / USD / 900`
row appears in `payments`), and Razorpay then refuses the charge with
*"International cards are not supported."* The account can open USD orders but
cannot settle them.

**Decision taken:** keep the $9 USD price and apply to Razorpay for
International Payments activation, rather than repricing in INR.

Request it at **Dashboard → Account & Settings → Configuration → International
Payments**. Approval is manual, takes days to weeks, and Razorpay assesses the
business and its website. Exact requirements vary by account — the dashboard
will list what yours needs.

The site already carries the pages this kind of review normally looks for:
[pricing](<app/(pages)/pricing/page.jsx>), [terms](<app/(pages)/terms/page.jsx>)
including an explicit refund policy, a
[privacy policy](<app/(pages)/privacy-policy/page.jsx>), and
[contact](<app/(pages)/contact/page.jsx>).

#### Until it is approved: leave the checkout switch off in production

`CHECKOUT_READY` in [lib/pricing.js](lib/pricing.js) is derived from
`NEXT_PUBLIC_RAZORPAY_KEY_ID`. **Do not set that variable in Vercel yet.**

| `NEXT_PUBLIC_RAZORPAY_KEY_ID` in production | Pricing CTA | Goes to |
|---|---|---|
| unset (**correct for now**) | "Get early access" | `/contact` |
| set | "Get Pro" | `/account` → live checkout |

Set it in production and real visitors reach a checkout that takes them through
Razorpay and then fails — the worst version of this problem, because it looks
like your site is broken rather than not yet selling. Keep it set locally so you
can keep testing; just do not add it to the Vercel environment until activation
clears.

#### Switching to INR instead, if approval stalls

Three constants in [lib/pricing.js](lib/pricing.js) — `CURRENCY`,
`PRO_PRICE_USD`, `PRO_PRICE_DISPLAY` — plus the price wording on the pricing
page, upgrade modal, and `llms.txt`. Everything downstream, including the Offer
schema and the Razorpay order amount, reads from those.

### 4.2 API keys

**Settings → API Keys → Generate**. Use `rzp_test_*` keys until you have tested
a full purchase.

```
RAZORPAY_KEY_ID=rzp_test_xxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
```

The key id appears twice deliberately: the `NEXT_PUBLIC_` copy is what the
checkout widget needs in the browser, and Razorpay publishes it there by design.

> **The secret must never get a `NEXT_PUBLIC_` prefix.** It is both the API
> password and the key every payment signature is verified against — published
> in the browser bundle, anyone could forge a "payment succeeded" callback and
> grant themselves Pro.

### 4.3 Webhook

**Settings → Webhooks → Add New Webhook.**

- URL: `https://simplyhumanize.com/api/webhooks/razorpay`
- Active events: `payment.captured`, `payment.failed`, `refund.processed`
- Secret: invent one, and copy it — Razorpay shows it only once.

```
RAZORPAY_WEBHOOK_SECRET=xxxx
```

The webhook is not optional decoration. The browser redirect after payment is
the *fast* path; the webhook is the *reliable* one. Without it, a customer who
closes the tab during the redirect is charged and never granted access.

Webhooks cannot reach `localhost`. To test locally, tunnel:

```bash
npx localtunnel --port 3000     # or ngrok http 3000
```

and point a second, test webhook at the tunnel URL.

---

## 5. Test a real purchase

With test keys set:

1. `npm run dev`, sign up at `/signup`.
2. Go to `/account` → **Get Pro**.
3. Use a [Razorpay test card](https://razorpay.com/docs/payments/payments/test-card-details/)
   — `4111 1111 1111 1111`, any future expiry, any CVV.
4. The panel should flip to **Pro — Active** with an expiry 30 days out, and the
   header badge should read **Pro**.

Verify it end to end in the database:

```sql
SELECT u.email, p.status, p.amount, p.currency, e.expires_at
FROM users u
JOIN payments p     ON p.user_id = u.id
LEFT JOIN entitlements e ON e.payment_id = p.id
ORDER BY p.created_at DESC LIMIT 5;
```

You want `status = 'paid'` and a non-null `expires_at`. Then confirm the quota
lift is real: run the humanizer four times. The fourth must succeed, where a
free account is refused at the fourth.

### Confirm double-fulfilment is impossible

The redirect and the webhook both fulfil the same payment, and they will often
both arrive. Re-send the `payment.captured` event from the Razorpay dashboard
after a successful purchase — the entitlement count must **not** change:

```sql
SELECT payment_id, count(*) FROM entitlements GROUP BY payment_id HAVING count(*) > 1;
```

Zero rows is the pass condition.

---

## 6. Going live

- [ ] Swap `rzp_test_*` keys for live keys, and add the live webhook.
- [ ] Set every variable in the Vercel project's environment settings too —
      `.env.local` is not deployed.
- [ ] Publish the Google OAuth consent screen out of *Testing*.
- [ ] Re-run `npm run db:migrate` against the production database.
- [ ] Make one real purchase with a real card, then refund it from the Razorpay
      dashboard and confirm access is withdrawn (the `refund.processed` webhook
      calls `revokeForPayment`).

---

## How the pieces fit

```
Browser                    Our server                  Razorpay        Neon
   │                            │                          │             │
   │ POST /api/checkout/order   │                          │             │
   ├───────────────────────────►│  create order ──────────►│             │
   │                            │  ◄──────── order_id      │             │
   │                            ├─ INSERT payments (created) ───────────►│
   │ ◄─── order_id, key_id ─────┤                          │             │
   │                            │                          │             │
   │ Razorpay checkout widget ──────────────────────────►  │             │
   │ ◄─── payment_id + signature ───────────────────────── │             │
   │                            │                          │             │
   │ POST /api/checkout/verify  │                          │             │
   ├───────────────────────────►│ verify HMAC              │             │
   │                            ├─ UPDATE payments → paid ──────────────►│
   │                            ├─ INSERT entitlement ──────────────────►│
   │ ◄─── pro until <date> ─────┤                          │             │
   │                            │                          │             │
   │                            │ ◄─ webhook payment.captured             │
   │                            ├─ markPaid() matches 0 rows → no-op ────►│
```

The last line is the whole idempotency story: `markPaid` only transitions a row
whose status is still `created`, so whichever of the two paths arrives second
does nothing.

**Where Pro is actually enforced:** `proStatus()` in [lib/quota.js](lib/quota.js),
which every metered route already calls. A signed-out visitor never reaches the
database — the session cookie is checked first, so anonymous traffic costs no
queries.
