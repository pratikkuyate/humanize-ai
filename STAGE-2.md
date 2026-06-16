# STAGE 2 — Next Steps After C1–C4 + Use-Case Pages

> Follow-up to [SEO-AUDIT.md](SEO-AUDIT.md). This captures what's already done and the
> recommended next steps now that the launch-blockers and the use-case layer are shipped.

## Status — what's complete

You've knocked out the launch-blockers (C1–C4) and the use-case layer (§6a of the audit).
Confirmed in code:

- **Brand unified to "Simply Humanize"** — [SiteHeader.jsx:22](components/SiteHeader.jsx#L22)
- **Dynamic use-case template** at
  [app/(pages)/ai-humanizer-for/[useCase]/page.jsx](<app/(pages)/ai-humanizer-for/[useCase]/page.jsx>),
  data-driven from [lib/useCases.js](lib/useCases.js), with genuinely unique ≥600-word copy
  + per-page FAQs (not doorway pages ✅)
- **Sitemap now maps over the registry** — [sitemap.js:36-41](app/sitemap.js#L36-L41) (fixes T12)

So Phase 1 / Week 2 of the roadmap is essentially done. The gap that now matters most is
**discoverability** of those pages, plus adding the next page-type.

---

## Next step: make those pages discoverable, then add the next page-type

### 1. Internal linking + nav (T8 + CRO6) — do this first

It's blocking the value of what you just built. The use-case pages are currently only reachable
via the sitemap. The header ([SiteHeader.jsx:30-35](components/SiteHeader.jsx#L30-L35)) still has
just the static "3-Stage Pipeline" badge and **no nav links**, and the homepage "Who Uses an AI
Humanizer" section is static text that doesn't link out. Google passes authority and discovers
pages through internal links — a sitemap alone is weak.

- Add a "Use Cases" nav item (dropdown or a `/use-cases` hub page) to the header.
- Turn each audience block in the homepage section into a link to its
  `/ai-humanizer-for/[slug]` page with descriptive anchor text.
- Each use-case page should link back to the homepage tool and across to 2–3 sibling use-case pages.

High-impact / low-effort. Unlocks the SEO value of pages already shipped.

### 2. Model-source pages (§6b / C5) — next page-type, same template pattern

Metadata already targets "humanize ChatGPT/Claude/Gemini text" but no pages exist. Build
`/humanize-chatgpt-text`, `/humanize-claude-text`, `/humanize-gemini-text` using the exact
registry + template approach already proven out for use-cases. Lowest-effort net-new traffic
because the infrastructure is already there.

### 3. AI content detector link magnet (§7)

The scoring primitives already exist in [lib/stage1Processor.js](lib/stage1Processor.js). This is
the single best backlink earner and the most-searched companion query.

---

## Suggested order

1. Internal linking + header nav (days, not weeks)
2. 3 model pages via the existing template
3. Begin blog clusters A/B/H (15–20 posts) for indexable surface area
4. AI content detector tool
5. Social proof + email capture (CRO1 / CRO3)

---

## Open verification item

Not visible in code: confirm `NEXT_PUBLIC_SITE_URL=https://simplyhumanize.com` is set in
**Vercel's** environment variables (Production + Preview), not just in `.env.local`. That's the
real C1 fix and is easy to miss. Verify live with view-source on any page → canonical, OG, and
JSON-LD should all show `https://simplyhumanize.com` (no localhost).
