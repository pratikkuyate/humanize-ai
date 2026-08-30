# PRICING PLAN — Free-Tier Metering Implementation Plan

> Companion to [SEO-AUDIT.md](SEO-AUDIT.md) and [STAGE-2.md](STAGE-2.md). Written 2026-08-23.
>
> **Status: Phases 1–3 are implemented.** Metering (Phases 1–2) shipped earlier.
> **Phase 3 — accounts, payments, and fulfilment — is now built** and the build is
> clean; it needs credentials before it can run. See
> [PAYMENTS-SETUP.md](PAYMENTS-SETUP.md) for the configuration checklist and §11
> below for what was built and how it differs from the plan.
>
> Phase 0 (copy + structured-data honesty pass, §6) is **still NOT done and still
> blocks deploy** — 16 pages continue to advertise "no usage limit". The pricing
> page, terms, privacy policy, and llms.txt were corrected as part of Phase 3,
> but the 16 pages listed in §6 were not touched.

## Decisions locked

| Decision | Choice |
|---|---|
| Tools gated | All three (humanizer, detector, watermark remover) |
| Enforcement | Two drivers: signed cookie (default, zero-cost) or IP via Upstash/Vercel KV |
| Free limit | Word-based cap + 3 attempts |

## Open questions

1. ~~Free word cap per request?~~ **Answered: 7,000 words.** Shipped in
   [lib/freeTier.js](lib/freeTier.js).
2. ~~3 attempts?~~ **Answered: 3, without logging in.** Shipped.
3. **3 attempts per what window?** Still unanswered. Implemented as a **rolling 24 hours**
   — see the reasoning in [lib/freeTier.js](lib/freeTier.js). One constant
   (`QUOTA_WINDOW_SECONDS`) changes it; `0` makes it a lifetime cap.
4. ~~Paid tier limits and price points?~~ **Answered: $9 USD for a 30-day pass**,
   unlimited runs, no per-run word cap beyond the shared `MAX_CHARACTERS` guard.
5. ~~Payment processor?~~ **Answered: Razorpay**, with accounts in Neon Postgres.
   Stripe was never used. See §11.

---

## 1. The consequence of gating all three tools

This was flagged before the decision and is restated here so it is on the record, not
to relitigate it.

The detector ([lib/aiScore.js](lib/aiScore.js)) and watermark remover
([lib/watermarkChars.js](lib/watermarkChars.js)) currently compute **entirely in the
browser**. That is not incidental — it is the product claim, repeated on every tool page
and embedded in `FAQPage` structured data:

> "The entire analysis runs locally in your browser using JavaScript. Your text is never
> sent to a server, never logged, and never stored. **You can disconnect from the internet
> after the page loads and it still works.**"
> — [ai-content-detector/page.jsx](<app/(pages)/tools/ai-content-detector/page.jsx>)

There are two ways to gate them, and they trade off differently:

### Option A — move computation server-side

New `/api/detect` and `/api/clean` routes; the client posts text and receives results.

- ✅ Real enforcement. Cannot be bypassed without an account/IP change.
- ❌ Every privacy claim above becomes false and must be rewritten.
- ❌ Adds compute + bandwidth. The watermark remover accepts 50,000 characters —
  that now crosses the wire on every run.
- ❌ Loses the "works offline, nothing uploaded" differentiator that makes these
  pages backlink magnets in the first place.

### Option B — quota ping, computation stays local (recommended for these two)

The client asks `/api/quota` for permission, then computes locally on approval. The
**text itself never leaves the browser**.

- ✅ Every privacy claim stays literally true. No rewrite needed on that axis.
- ✅ Zero compute and bandwidth cost.
- ✅ Still gates all three tools, satisfying the decision above.
- ❌ Soft enforcement — bypassable by blocking one request or patching the bundle.
  Stops casual overuse, not a determined user.

**Recommendation:** Option B for the two client-side tools, Option A for the humanizer
(already server-side, real Gemini cost, worth hard-enforcing). If hard enforcement on all
three is required, it is Option A everywhere and the privacy rewrite becomes mandatory
rather than optional.

---

## 2. Quota layer

### 2.0 Two drivers, one interface — SHIPPED

[lib/quota.js](lib/quota.js) picks a driver at startup and every caller is agnostic to
which one is live:

| | `cookie` (default) | `redis` |
|---|---|---|
| Active when | no KV credentials set | `UPSTASH_REDIS_REST_URL` + token present |
| Counts per | device (signed HttpOnly cookie) | IP address |
| Cost | nothing, no account | nothing on Upstash's free tier |
| Reset by | clearing cookies, private window | VPN, mobile data |

Adding Upstash credentials later switches drivers with **no code change** — routes and UI
call `peekQuota` / `consumeQuota` / `refundQuota` / `applyQuota` either way.

Cookie state lives in [lib/quotaCookie.js](lib/quotaCookie.js): one HttpOnly, `SameSite=Lax`,
HMAC-signed cookie holding `{bucket, counts}` for all three tools. A stale bucket, a bad
signature, and a malformed value all degrade to "fresh visitor" rather than erroring.

**Note on what signing buys.** It stops someone editing the count, but a forged or deleted
cookie just resets them — identical to clearing cookies. Neither driver is a security
boundary; both are prompts to sign up. Real enforcement arrives with accounts in Phase 3.

### 2.1 Optional dependency

### 2.1 Dependency

`@upstash/redis` is installed but only used when credentials exist. With no env vars at
all the site runs on the cookie driver.

```
QUOTA_SALT=                   # random 32-byte hex — signs cookies, hashes IPs
UPSTASH_REDIS_REST_URL=       # optional: switches to IP-based metering
UPSTASH_REDIS_REST_TOKEN=     # optional
```

Upstash's free tier is 500K commands/month with no card, which at ~1.2 commands per visit
covers roughly 400K monthly pageviews.

### 2.2 New file — `lib/quota.js`

Responsibilities:

- **Resolve client IP.** On Vercel, `request.headers.get("x-forwarded-for")` and take
  the *first* comma-separated entry. Everything after it is proxy-appended and spoofable.
- **Hash it.** A raw IP is personal data under GDPR. Store
  `sha256(ip + process.env.QUOTA_SALT)`, never the address itself. This also means a
  salt rotation wipes all quotas — treat the salt as permanent config.
- **Count atomically.** `INCR` then `EXPIRE` on first write, or use
  `@upstash/ratelimit`'s fixed-window helper, which does this in one round trip.
- **Key shape:** `q:{tool}:{ipHash}:{YYYY-MM-DD}` — the date suffix gives free daily
  reset via TTL, no cleanup job.

```js
// sketch
export async function checkQuota(request, tool) {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  if (!ip) return { allowed: true, remaining: FREE_ATTEMPTS };   // fail open
  const key = `q:${tool}:${hashIp(ip)}:${today()}`;
  const used = await redis.incr(key);
  if (used === 1) await redis.expire(key, 60 * 60 * 24);
  return { allowed: used <= FREE_ATTEMPTS, remaining: Math.max(0, FREE_ATTEMPTS - used), used };
}
```

### 2.3 Fail-open vs fail-closed

If Upstash is unreachable, does the tool run or refuse? **Recommend fail-open** — a KV
outage silently breaking your headline tool costs more than a few ungated requests. This
is a business call; flag if you want the opposite.

### 2.4 Exclude crawlers

Googlebot, Bingbot, and the AI crawlers you explicitly welcome in
[app/robots.js](app/robots.js) must not consume quota or receive 429s. Check
`user-agent` before counting. A 429 served to Googlebot is a crawl-health signal you
do not want.

---

## 3. Word limit

### 3.1 One shared counter — this is the important part

The limit currently lives in **two places that must agree**:
[HumanizerForm.jsx:6](components/HumanizerForm.jsx#L6) (the visible counter) and
[route.js:5](app/api/humanize/route.js#L5) (the actual enforcement). If the client counts
words differently from the server, users type up to the visible limit and get rejected —
the worst possible failure mode for a conversion funnel.

Create `lib/wordCount.js` exporting a single `countWords(text)` imported by both.

### 3.2 The CJK gotcha

The obvious implementation is wrong for some languages:

```js
text.trim().split(/\s+/).filter(Boolean).length   // returns 1 for Chinese text
```

Your `/es /fr /de /pt` pages are all space-delimited so this is safe today, but if the
language set ever grows to Chinese, Japanese, or Thai, a whole document counts as one
word and the paywall silently never applies. `Intl.Segmenter` with
`granularity: "word"` handles this correctly and is supported in all current browsers
and Node 18+.

### 3.3 Changes

- Replace `MAX_LENGTH` (chars) with `MAX_WORDS` in
  [route.js](app/api/humanize/route.js) and [HumanizerForm.jsx](components/HumanizerForm.jsx).
- Keep a generous absolute character ceiling as an abuse guard — word counting a 10 MB
  paste is itself a DoS vector.
- `MIN_LENGTH = 50` chars stays as-is.

---

## 4. API changes

| Route | Change |
|---|---|
| `app/api/humanize/route.js` | Quota check before the Gemini call; word limit replaces char limit; return `429` with `remaining` + `resetAt` |
| `app/api/quota/route.js` | **New.** Takes `{ tool }`, no text. Returns `{ allowed, remaining, resetAt }` |
| All | Emit `X-RateLimit-Remaining` and `X-RateLimit-Reset` headers |

Return a structured 429 body so the UI can render an upgrade prompt rather than a
generic error:

```json
{ "success": false, "error": "quota_exceeded", "remaining": 0, "resetAt": "2026-08-24T00:00:00Z" }
```

---

## 5. UI changes

- **Remaining-attempts indicator** on all three tools ("2 of 3 free runs left today").
- **429 state** → upgrade prompt, not a red error toast. This is the conversion moment;
  it deserves real design.
- [HumanizerForm.jsx](components/HumanizerForm.jsx) character counter becomes a word counter.
- Both client tools gain a pre-flight `/api/quota` call and a loading state they do not
  currently have (they are instant today).

---

## 6. Copy + structured data rewrite — ships in the SAME deploy

**16 of 36 pages currently emit `FAQPage` structured data asserting free / no-signup /
no-usage-limit.** Google requires structured data to match the page and not mislead;
shipping a paywall while these stay live risks rich-result loss across all of them.

Verified list:

```
index.html                          "Is using an AI humanizer free?"
humanize-chatgpt-text.html          "Is it free to humanize ChatGPT text?"
humanize-claude-text.html           "Is it free to humanize Claude text?"
humanize-gemini-text.html           "Is it free to humanize Gemini text?"
tools.html                          "Is this AI detector free?"
tools/ai-content-detector.html      "Is this AI detector free?"
tools/claude-watermark-remover.html "Is this tool free?"
ai-humanizer-for/agencies.html      "Is Simply Humanize free for agency teams?"
ai-humanizer-for/bloggers.html      "Is Simply Humanize free for bloggers?"
ai-humanizer-for/businesses.html    "Is Simply Humanize free for business use?"
ai-humanizer-for/content-writers.html
ai-humanizer-for/essays.html
ai-humanizer-for/marketers.html
ai-humanizer-for/seo-writers.html
ai-humanizer-for/students.html
blog/how-to-humanize-ai-text.html   "Can I humanize AI text for free?"
```

Source files to edit (the FAQ text is data-driven, so this is fewer edits than pages):

- [lib/aiModels.js](lib/aiModels.js) — 3 model pages
- [lib/useCases.js](lib/useCases.js) — 8 use-case pages
- [lib/languages.js](lib/languages.js) — check the 4 language pages for the same claims
- [app/page.jsx](app/page.jsx) — homepage FAQ
- [app/(pages)/tools/ai-content-detector/page.jsx](<app/(pages)/tools/ai-content-detector/page.jsx>)
- [app/(pages)/tools/claude-watermark-remover/page.jsx](<app/(pages)/tools/claude-watermark-remover/page.jsx>)
- [app/(pages)/tools/page.jsx](<app/(pages)/tools/page.jsx>) — **note: this is a
  duplicate of the detector page, a pre-existing bug (see §8)**
- [lib/posts/how-to-humanize-ai-text.js](lib/posts/how-to-humanize-ai-text.js)
- [app/layout.jsx](app/layout.jsx), [app/manifest.js](app/manifest.js),
  [app/opengraph-image.jsx](app/opengraph-image.jsx) — "No sign-up." in metadata/OG

New honest framing: *"Free to try — 3 runs a day, no sign-up required."* That keeps the
no-account hook (which is the real conversion driver) while being accurate.

### 6.1 `public/llms.txt`

Already describes paid plans that do not exist:

> "Free tier with a generous per-request word limit; paid plans add higher limits, batch
> processing, more styles, and priority speed."

This becomes *partly* true but still needs correcting to match the actual tiers. It is the
file ChatGPT, Claude, and Perplexity read when citing you — wrong pricing there propagates
into AI answers.

### 6.2 Privacy policy

[privacy-policy/page.jsx](<app/(pages)/privacy-policy/page.jsx>) already discloses IP
collection in server logs, so the base is covered. But storing a hashed IP in a KV store
for **quota enforcement** is a distinct processing purpose and retention period — add a
line. If Option A is chosen for the client tools, the "we do not store your submitted
text" section needs review too.

---

## 7. Risks with IP-based metering

- **Shared / NAT'd IPs.** One university, library, office, or co-working space shares a
  single public IP. Three attempts for the entire building. This hits your *students*
  and *agencies* segments — two of your eight use-case pages — hardest.
- **Trivial reset.** Mobile data toggle, VPN, or incognito on a different network. IP
  metering is a speed bump, not a wall.
- **IPv6.** Rotates per-connection on many carriers. Consider bucketing to the /64
  prefix rather than the full address.
- **Crawler quota burn** — see §2.4.

None of these are blockers; they are the known cost of IP metering without accounts. If
enforcement needs to be real, accounts are the only answer, and that is a much larger build.

---

## 8. Pre-existing bug this work will collide with

[app/(pages)/tools/page.jsx](<app/(pages)/tools/page.jsx>) is a copy-paste duplicate of
the detector page — same H1, same body, and its canonical points at
`/tools/ai-content-detector`. Introduced in commit `47d5afb`. It appears in the §6 rewrite
list twice for that reason. Worth fixing into a real tools directory while touching these
files anyway.

---

## 9. Suggested sequencing

| Phase | Work | Ships |
|---|---|---|
| **0** | Copy + schema honesty pass (§6). Reword to "3 free runs a day" *before* enforcement exists. | Can ship immediately, independently |
| **1** | `lib/quota.js`, `lib/wordCount.js`, gate the humanizer, word limit, 429 UI | Core metering |
| **2** | Client-tool gating via `/api/quota` (Option B) | Completes "all three" |
| **3** | Pricing page, Stripe, accounts | Monetization |

Phase 0 first is deliberate: it removes the false-claim risk immediately and lets you
watch conversion-intent signals before any paywall exists. Phases 1 and 2 can then ship
without a scramble to fix copy.


---

## 10. Pricing page — shipped, with one deliberate gap

Live at [/pricing](<app/(pages)/pricing/page.jsx>), driven by
[lib/pricing.js](lib/pricing.js). Free ($0, 3 runs a day) beside Pro ($9/month,
unlimited). `Product` + two `Offer` schema objects, its own `FAQPage`, wired into the
header, footer, sitemap, llms.txt, and IndexNow. The quota-exhausted panel in every tool
now shows the $9 price with an upgrade CTA.

### 10.1 Why the button does not say "Buy now" yet

**There is no way to deliver what the button would sell.** Quota is keyed to a cookie (or
an IP), not to an account. Nothing exists that could recognise a paying customer and lift
their limits — so a working checkout would take money and change nothing for the buyer.
That is a chargeback and a trust problem, not a missing feature.

So the CTA is driven by `NEXT_PUBLIC_CHECKOUT_URL`:

| `NEXT_PUBLIC_CHECKOUT_URL` | Button | Goes to |
|---|---|---|
| unset (current) | "Get early access" | `/contact` |
| set | "Buy now" | that URL |

**Do not set that variable until fulfilment exists.** It is the switch that turns a
waitlist into a live checkout.

### 10.2 What fulfilment needs

The smallest honest version, no full auth required:

1. Stripe Payment Link (no backend code) with a success redirect to `/activate`.
2. A webhook or session-verification route that confirms the payment with Stripe.
3. On success, issue a signed `pro` cookie — same HMAC approach as
   [lib/quotaCookie.js](lib/quotaCookie.js) — and have `eligible()` in
   [lib/quota.js](lib/quota.js) return unmetered for it.

That is roughly a day's work and gets you paid subscribers without building accounts.
Its weakness is that a cookie is per-device, so a subscriber switching machines loses
access — which is the point at which real accounts stop being optional.

### 10.3 "No limits" is a promise with a cost attached

Pro is advertised as unlimited runs and no word cap. The humanizer runs a three-stage
Gemini pipeline, so one subscriber scripting 7,000-word requests can spend well past $9
of tokens in a month. Before taking real money, consider either a fair-use line in the
[terms](<app/(pages)/terms/page.jsx>) or a generous-but-finite cap (say 100 runs a day)
that no honest user would ever reach.


---

## 11. Phase 3 as built — accounts, Razorpay, Neon

Built 2026-08-29. Three decisions moved away from what §10 assumed, each for a
stated reason.

| §10 assumed | Built | Why |
|---|---|---|
| Stripe Payment Link | **Razorpay**, orders API + webhook | The account that exists |
| A signed `pro` cookie, no accounts | **Real accounts in Neon** — email/password and Google sign-in | §10.2 called the cookie's per-device weakness "the point at which real accounts stop being optional". With a database available, that point had arrived |
| $9/month subscription | **$9 one-time, 30-day pass** | No recurring mandate to set up, nothing to cancel, and no RBI e-mandate complexity. The copy was corrected to match |

### What enforces Pro

`proStatus()` in [lib/quota.js](lib/quota.js). Every metered route already called
`peekQuota` / `consumeQuota` / `refundQuota`, and all three now short-circuit to
unmetered for a live pass — so no route needed restructuring except the
humanizer, where the free word cap had to move after the Pro check.

A signed-out visitor never touches the database: the session cookie is checked
before any query, so anonymous traffic — which is nearly all of it — costs
exactly what it did before.

### Auth was hand-rolled, not `next-auth`

Auth.js v5 is still beta on Next 16, and the flows needed here are two redirects,
one token exchange, and a session table. scrypt from `node:crypto` handles
passwords, which also avoids a native build step on Vercel. One new dependency
total (`@neondatabase/serverless`).

### Fulfilment is deliberately doubled

`/api/checkout/verify` (fast, browser redirect) and `/api/webhooks/razorpay`
(reliable, retried by Razorpay) both fulfil the same payment. `markPaid()` only
transitions a row still in `created`, and a unique index on
`entitlements(payment_id)` backs that up — so the second arrival is a no-op
rather than a second free month. This is tested by re-sending the event from the
Razorpay dashboard; see PAYMENTS-SETUP.md §5.

### §10.3 answered

"No limits" is now bounded in two ways: `MAX_CHARACTERS` (120,000) still applies
to Pro as an abuse guard, and the [terms](<app/(pages)/terms/page.jsx>) now carry
a fair-use clause excluding automated, scripted, or resold use. Neither affects
an honest user.

### Still open

- **Password reset.** There is no email provider wired up, so a user who forgets
  a password has no self-service recovery. Google sign-in sidesteps it; email
  signups do not. This is the largest remaining gap.
- **Email receipts.** Razorpay sends its own payment confirmation; we send
  nothing.
- **Account deletion** is by request rather than self-service, as the privacy
  policy now states.
- **§6's 16 pages** still advertise no usage limit.
