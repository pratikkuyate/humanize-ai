# CONVERSION PLAN — Free → Paid

> Companion to [PRICING-PLAN.md](PRICING-PLAN.md) and [PAYMENTS-SETUP.md](PAYMENTS-SETUP.md).
> Written 2026-11-03. **Status: plan only — no code changed yet.**

## Where we are

~3,000 users, 3 paying = **0.1% conversion**. Typical freemium writing tools convert
1–4% of active users.

Open question: are the 3,000 **signed-up accounts** or **anonymous visitors**? The
free tier needs no account. If they're accounts, the email work in Phase 5 matters
much more, because we can contact all of them right away.

## What's holding conversions back

1. **The free tier covers what most people need.** Free users get 3 runs a day at up to
   7,000 words per run ([lib/freeTier.js](lib/freeTier.js)). A student essay or blog
   post is 500–1,500 words, so most users never reach the paywall.
2. **The site tells people they don't need to pay.** The pricing FAQ says *"you can wait
   it out at no cost"* ([pricing/page.jsx](<app/(pages)/pricing/page.jsx>)), and the
   limit resets every 24 hours.
3. **Pro is just "more of the same."** Its features are unlimited runs, no word cap, and
   stacking days ([lib/pricing.js](lib/pricing.js)). If someone isn't hitting the limit,
   none of that matters to them.
4. **There's one price, it's in USD, and it's paid up front.** The only option is $9 for
   a 30-day pass. That's a large first purchase for students, and probably even larger
   if a lot of the traffic is from India (we use Razorpay).
5. **We can't email anyone.** No email provider is connected, so signups who leave never
   hear from us again. There's also no password reset.
6. **The upgrade button adds a step.** It goes to `/account` instead of opening checkout
   directly, and every extra step loses buyers.
7. **Some pages still say there's no usage limit.** 16 pages still advertise this
   ([PRICING-PLAN.md §6](PRICING-PLAN.md)), which makes the paywall feel like a
   bait-and-switch.

---

## Phase 1 — Measure first (week 1)

The funnel events already exist in [lib/analytics.js](lib/analytics.js). In GA4, pull
counts for the last 30 days for:

```
humanize_success → quota_hit → upgrade_modal_view → upgrade_click → checkout_start → purchase
```

Also check:

- **Country split:** this decides whether we need INR pricing.
- **Word count per run (`words` parameter / `wordBucket`):** this shows where the limits
  should sit. See "Seeing word buckets in GA4" below.
- **Clarity recordings filtered to `upgrade_modal_view`:** these show what people do when
  they hit the paywall.

The numbers point to the fix:

- If `quota_hit` is tiny, the free tier is too generous (very likely). Do Phase 2.
- If `upgrade_click` is high but `purchase` is low, the price or checkout is the
  problem. Do Phases 3 and 4.

### Seeing word buckets in GA4

`wordBucket()` is sent as the `words` parameter on `humanize_submit`,
`humanize_success`, `humanize_error`, `detector_run`, `emdash_replace`, and the
watermark remover's event. The values are ranges: `<250`, `250-499`, `500-999`,
`1000-1999`, `2000-3999` and `4000+`. Clarity only receives event names, so the word
buckets are only visible in GA4.

1. **Register the dimension:** go to GA4 **Admin → Data display → Custom definitions →
   Create custom dimension**. Set the name to `Word bucket`, scope to **Event**, and the
   event parameter to `words`.
2. **Build the report** (24–48 hours later): go to **Explore → Blank exploration**. Add
   the **Event name** and **Word bucket** dimensions and the **Event count** metric, put
   Word bucket in Rows, and filter Event name = `humanize_success`.
3. **Check it right away:** open **Admin → DebugView** or **Realtime**, run the humanizer
   on the live site, and click the event to see `words`.

GA4 custom dimensions only collect data from the day you create them. Past events
won't appear in the report, so register it now.

---

## Phase 2 — Tighten the free tier (weeks 2–3)

> **Status (2026-11-04): shipped, except the run window.**
> - Word cap lowered from 7,000 to **1,000** per run (`FREE_MAX_WORDS`).
> - Going over the cap now opens the upgrade modal (new `word_limit_hit` event)
>   instead of silently disabling the button.
> - "Or wait" line removed from the modal; "wait it out" removed from the
>   pricing FAQ and both API messages.
> - Marketing copy left as it was by decision; only places that state the word
>   limit changed (pricing page and Offer schema via `FREE_MAX_WORDS`, llms.txt,
>   one blog FAQ).
> - Fixed: `useQuota` had no `refresh`, so a user who paid inside the modal
>   was still treated as free until they reloaded.
> - **Not done, by decision:** runs stay a rolling daily allowance.

These have the biggest effect:

- **Lower the word cap to about 300–500 words per run.** The output is the demo: people
  see the result on a short text and pay to process the whole document.
- **Make runs a weekly or lifetime allowance instead of daily**, for example 5 runs a
  week (`QUOTA_WINDOW_SECONDS` in [lib/freeTier.js](lib/freeTier.js)). Or give
  logged-out users 3 lifetime runs and signed-in users 5 more. Signups matter because we
  can follow up with them later (Phase 5).
- **Remove the "wait it out" wording** from the pricing FAQ and finish
  [PRICING-PLAN.md §6](PRICING-PLAN.md) so the copy is honest everywhere.
- **Leave the detector and watermark remover unlimited.** They bring in traffic and links.

## Phase 3 — Fix packaging and price (weeks 2–4)

- **Add a cheap first purchase:** a 7-day pass at about $3–4. Students buy around
  deadlines, not by the month.
- **Use local pricing:** INR for Indian visitors (for example ₹149 a week and ₹399 a
  month). Razorpay handles INR natively.
- **Keep the 30-day pass and add a 90-day pass** at a discount for repeat buyers.
- Show the plans as 3 tiers with the middle one marked "Most popular" (anchoring).

## Phase 4 — Make the paywall moment work better

> **Status (2026-11-04): partial result shipped.**
> - Out of runs → one 150-word preview a day (`PREVIEW_WORDS`, `FREE_PREVIEWS`),
>   the rest blurred behind "X of Y words humanized. Unlock the rest for $9".
>   After that preview, the upgrade popup as before.
> - Over 1,000 words with runs left → the first 1,000 words humanized (uses a
>   run), the rest blurred behind the same unlock prompt.
> - The server only ever humanizes the visible part; the blur is the user's own text.
> - After payment the full text runs automatically, both in place and after
>   the signup/checkout detour.
> - New events: `preview_shown`, `preview_unlock_click`. `quota_hit` still fires
>   when the runs run out, so the funnel stays comparable.

- **Show part of the result:** humanize the first ~150 words, then blur the rest behind
  "Unlock full result — $X". People see quality before they pay.
- **Show a before/after detector score:** "AI score 92% → 8%" makes the value obvious.
  The detector is already built ([lib/aiScore.js](lib/aiScore.js)).
- **Open checkout straight from the modal,** with signup inline, so `/account` isn't a
  separate step ([components/UpgradeModal.jsx](components/UpgradeModal.jsx)).
- **Show free runs left from the first run** ("2 of 3 free runs left"), so the limit isn't
  a surprise.

## Phase 5 — Lifecycle email (weeks 3–5)

Connect an email provider such as Resend or Postmark. That also fixes password reset.
Then set up:

- A welcome email when someone signs up.
- An "out of runs" email 1 hour after `quota_hit`, with a discount code valid for
  24 hours.
- A "your pass expires in 3 days" email to get repeat purchases.
- Receipts, which also build trust.

## Phase 6 — Give Pro features of its own (ongoing)

Ideas that cost very little to add:

- Tone and style options (academic, casual, professional).
- Run history and saved documents.
- A "Re-humanize until score < X" button.
- Bulk or file upload (.docx).
- Priority access to the faster model.

## Phase 7 — Trust

- Testimonials, a usage counter ("X documents humanized") and before/after examples on
  the pricing page.
- A clear refund promise ("Not happy? Full refund within 7 days"). For a $3–9 product it
  costs little and removes doubt.

---

## Targets

| Metric | Now | 60-day target |
|---|---|---|
| Paid conversion | 0.1% (3) | 1–2% (30–60 payers) |
| `quota_hit` / active users | unknown | 25%+ |
| `upgrade_click` → `purchase` | unknown | 15%+ |

Change one big thing at a time, starting with the word cap, and compare a week of data
before and after each change.
