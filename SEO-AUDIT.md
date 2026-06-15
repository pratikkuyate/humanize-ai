# SEO, Performance & Growth Audit — Humanizer AI (simplyhumanize.com)

> Full technical-SEO, performance, Core-Web-Vitals and SaaS-growth audit of this codebase.
> Every finding is tied to actual code (file + line). Deliverable = audit + roadmap (no code changed).

## Context

This audits the `humanize-ai-main` codebase — a Next.js 16 (App Router) AI-humanizer tool. The
product today is a **single indexable content page** (the homepage) plus four utility pages
(about/contact/privacy/terms), an `/api/humanize` route running a 3-call Google Gemini pipeline, and
**no blog, no use-case pages, no programmatic pages, no auth, and no pricing**. Hosting is **Vercel**;
production domain is **https://simplyhumanize.com**; paid tiers are **planned** (not yet built).

> **Caveat on numbers:** keyword volumes/rankings can't be pulled from inside the repo. All
> traffic/volume figures are **labelled industry estimates** to prioritize effort, not measured data.
> Validate in Ahrefs/Semrush/GSC before committing budget.

---

## 1. Executive Summary

**The codebase is technically clean and unusually well-built for an early-stage tool** — system
fonts (zero font cost), no raster images, static homepage, `content-visibility` on long content, a
solid JSON-LD set, and security headers. The on-page SEO of the *one* page that exists is strong.

**But the site has one page of organic surface area.** The single biggest constraint on reaching
10k → 100k monthly visitors is not a technical bug — it's that **there is almost nothing to index**.
The sitemap ([app/sitemap.js](app/sitemap.js)) lists 5 URLs, 4 of which are legal/utility pages.

**Three things will actively sabotage launch if shipped as-is:**

1. **`NEXT_PUBLIC_SITE_URL=http://localhost:3000`** ([.env.local](.env.local#L1)) — every canonical,
   sitemap entry, OG image URL and JSON-LD URL is derived from this. If it ships, Google sees
   `localhost` everywhere. And `new URL(process.env.NEXT_PUBLIC_SITE_URL)`
   ([app/layout.jsx:7](app/layout.jsx#L7)) **throws and breaks the build** if the var is missing in
   prod.
2. **Brand/domain mismatch** — code brand is "Humanizer AI", contact email is `hello@humanizerai.net`
   ([app/(pages)/contact/page.jsx:28](app/(pages)/contact/page.jsx#L28)), domain is
   `simplyhumanize.com`. Three identities dilute brand-entity SEO and confuse users.
3. **The core tool may not run** — model ID `gemini-3.1-flash-lite`
   ([lib/gemini.js:17](lib/gemini.js#L17)) contradicts the file's own "valid model IDs" comment
   ([lib/gemini.js:15-16](lib/gemini.js#L15-L16)); combined with 3 sequential calls
   ([lib/gemini.js:119-121](lib/gemini.js#L119-L121)) and `MAX_RETRIES=0`
   ([lib/gemini.js:18](lib/gemini.js#L18)), the tool risks API errors and Vercel function timeouts.
   A broken tool = 0% conversion regardless of traffic.

**The opportunity:** the homepage already contains the *seed content* for an entire programmatic
layer. The "Who Uses an AI Humanizer" section
([app/page.jsx:687-800](app/page.jsx#L687-L800)) describes Students, Bloggers, Content Writers,
Marketers, SEO Pros, Agencies, Businesses — each is a ready-made landing page. The metadata targets
"humanize ChatGPT/Claude/Gemini text" ([app/layout.jsx:14-25](app/layout.jsx#L14-L25)) but **no
dedicated pages exist for those queries.** Harvesting this is the fastest path to traffic.

**Verdict:** Fix the 3 launch-blockers this week. Then the growth game is 100% a **content &
page-architecture** game, not a technical one.

---

## 2. Critical SEO Issues (fix before/at launch)

| # | Issue | File | Severity | SEO impact |
|---|-------|------|----------|-----------|
| C1 | Site URL = localhost | [.env.local:1](.env.local#L1) | 🔴 Critical | Canonicals, sitemap, OG, JSON-LD all point to localhost → de-indexing / wrong indexing |
| C2 | `new URL(undefined)` build crash | [app/layout.jsx:7](app/layout.jsx#L7) | 🔴 Critical | Build fails in prod if env unset; no fallback |
| C3 | Brand/domain/email mismatch | [contact/page.jsx:28](app/(pages)/contact/page.jsx#L28), [app/page.jsx:187-201](app/page.jsx#L187-L201) | 🔴 Critical | Weak brand entity, confused SERP/knowledge signals |
| C4 | Core tool reliability (model + timeout) | [lib/gemini.js:17-18](lib/gemini.js#L17-L18), [119-121](lib/gemini.js#L119-L121) | 🔴 Critical | Tool failure → 0 conversions from any traffic |
| C5 | Only 1 indexable content page | [app/sitemap.js](app/sitemap.js) | 🔴 Critical | Hard ceiling on impressions/keywords |
| C6 | API key visible in working tree | [.env.local:2](.env.local#L2) | 🟠 High (security) | Rotate if ever shared/screenshared; confirm `.env.local` stays gitignored |

### C1 — Production site URL points to localhost
**Fix:** In the **Vercel project → Settings → Environment Variables**, set
`NEXT_PUBLIC_SITE_URL=https://simplyhumanize.com` for Production (and Preview). Do **not** rely on
`.env.local` (it's local only). Drop the trailing slash to avoid `//` in derived URLs.

### C2 — Guard `metadataBase`
**Fix in [app/layout.jsx:7](app/layout.jsx#L7):**
```js
metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com"),
```
Apply the same fallback to every `const siteUrl = process.env.NEXT_PUBLIC_SITE_URL` (homepage +
all 4 subpages + sitemap + robots). With `metadataBase` set, page canonicals can be **relative**
(`alternates: { canonical: "/" }`, `"/about"`, …) instead of string-concatenating `siteUrl`.

### C3 — Pick one brand identity
Decide: is the brand **"Simply Humanize"** (matches domain) or **"Humanizer AI"** (matches code)?
Then make these consistent: `metadata.title/template` & `openGraph.siteName`
([app/layout.jsx:8-45](app/layout.jsx#L8-L45)), all JSON-LD `name`
([app/page.jsx:164,187,197](app/page.jsx#L164)), [app/manifest.js:3-4](app/manifest.js#L3-L4),
[opengraph-image.jsx:46-57](app/opengraph-image.jsx#L46-L57), footer
([SiteFooter.jsx:15](components/SiteFooter.jsx#L15)), and the contact email domain
([contact/page.jsx:28](app/(pages)/contact/page.jsx#L28) → use `@simplyhumanize.com`).

### C4 — Make the tool reliable (conversion-critical)
- Verify `MODEL_ID` against the **current** Gemini API; the in-file comment already warns invented
  IDs 404. Use a confirmed-available model.
- Add `export const maxDuration = 60;` (and `runtime` if needed) to
  [app/api/humanize/route.js](app/api/humanize/route.js) — Vercel **Hobby caps at ~10s**, which 3
  sequential LLM calls will blow through on medium/long inputs → 504 → user bounce.
- Set `MAX_RETRIES` ≥ 1 with backoff ([lib/gemini.js:18](lib/gemini.js#L18)); current `0` means a
  single 429 on Gemini free tier fails the request.
- Consider streaming the final stage to the client to fix the "results in seconds" promise
  ([app/page.jsx:614-621](app/page.jsx#L614-L621)) vs the real 3-call latency.

### C5 / C6 — see §6 (programmatic) and rotate the key if it was ever shared.

---

## 3. Technical SEO Findings (detailed)

### What's already correct (keep)
- **Metadata foundation** is strong: title template, description, robots directives, OG, Twitter,
  icons, Bing verification ([app/layout.jsx:6-72](app/layout.jsx#L6-L72)).
- **Per-page metadata + canonical** on homepage and all 4 subpages (e.g.
  [app/page.jsx:17-46](app/page.jsx#L17-L46), [about/page.jsx:6-11](app/(pages)/about/page.jsx#L6-L11)).
- **JSON-LD set:** SoftwareApplication, FAQPage, WebSite, Organization, BreadcrumbList
  ([app/page.jsx:151-239](app/page.jsx#L151-L239)).
- **robots.js** ([app/robots.js](app/robots.js)) disallows `/api/`, references the sitemap.
- **manifest.js** ([app/manifest.js](app/manifest.js)) and **dynamic edge OG image**
  ([app/opengraph-image.jsx](app/opengraph-image.jsx)).
- **Heading hierarchy:** exactly one `<h1>` ([app/page.jsx:250](app/page.jsx#L250)), clean H2/H3 via
  [ProseHelpers.jsx](components/ProseHelpers.jsx); ~5,000 words of keyword-rich content.

### Issues to fix

| ID | Finding | Severity | File | Fix |
|----|---------|----------|------|-----|
| T1 | Subpages have **no per-page OG/Twitter** — social cards fall back to generic | 🟠 | [about](app/(pages)/about/page.jsx#L6-L11)/contact/privacy/terms | Add `openGraph`/`twitter` blocks (or confirm Next's title fallback) per page |
| T2 | **BreadcrumbList only has "Home"**; subpages have no breadcrumb schema or UI | 🟡 | [app/page.jsx:204-215](app/page.jsx#L204-L215) | Add full breadcrumb trail + visible breadcrumb component on every non-home page |
| T3 | **No Article/WebPage schema** anywhere (blocks Article rich results once blog exists) | 🟡 | n/a | Add `Article`/`WebPage`/`HowTo` JSON-LD to content pages as they're built |
| T4 | SoftwareApplication has **no `aggregateRating`** (star rich-result eligible) | 🟡 | [app/page.jsx:161-182](app/page.jsx#L161-L182) | Add `aggregateRating` **only with real, collected ratings** — never fabricate |
| T5 | `<Script>`/`<Analytics>`/`<SpeedInsights>` are **siblings of `<body>`** inside `<html>` (invalid HTML) | 🟡 | [app/layout.jsx:80-95](app/layout.jsx#L80-L95) | Move them inside `<body>` |
| T6 | **Three analytics stacks** (Vercel Analytics + Speed Insights + GA4) | 🟢 | [app/layout.jsx:81-94](app/layout.jsx#L81-L94) | Drop GA4 or Vercel Analytics; keep one product-analytics + Speed Insights |
| T7 | **No `not-found.jsx`** → default soft-404 UX | 🟢 | n/a | Add `app/not-found.jsx` with links back to tool |
| T8 | **Internal linking is near-zero** — long-form links only to `#tool` | 🟠 | [app/page.jsx:293,317,957](app/page.jsx#L293) | Add contextual links once use-case/blog pages exist (see §5) |
| T9 | `keywords` meta is dead weight (Google ignores) | 🟢 | [app/layout.jsx:14-25](app/layout.jsx#L14-L25) | Harmless; can remove |
| T10 | `robots.js` `host` field is non-standard (Yandex-only) | 🟢 | [app/robots.js:12](app/robots.js#L12) | Harmless; optional remove |
| T11 | **No `generateViewport`/`theme-color` meta** (Next 16 prefers separate viewport export) | 🟢 | [app/layout.jsx](app/layout.jsx) | Add `export const viewport = { themeColor: "#6366f1" }` |
| T12 | Sitemap is **static/hardcoded** — won't scale to programmatic pages | 🟠 | [app/sitemap.js](app/sitemap.js) | Convert to generate entries from the page/content registry (see §6) |

**Crawlability/indexability:** robots correctly allows all and disallows `/api/`; no accidental
`noindex`. Once C1 is fixed, crawlability is fine. **Pagination/redirects/broken links:** none exist
yet (single-page site) — the redirect decision to make is **www vs non-www canonical host** (pick
`https://simplyhumanize.com`, 301 the other).

---

## 4. Performance & Core Web Vitals Findings

### Strengths (don't "optimize" these — they're already optimal)
- **System font stack** ([globals.css:18-20](app/globals.css#L18-L20)) → no web-font download, no
  font-swap CLS, no `next/font` needed.
- **No raster images** — inline SVG logo, dynamic edge OG → zero image-optimization debt.
- **Homepage is statically rendered** (Server Component, env inlined at build) → excellent TTFB/LCP.
- **`content-visibility: auto`** on the long article ([app/page.jsx:267](app/page.jsx#L267)) → skips
  off-screen render work.
- **`next/dynamic`** for the tool ([app/page.jsx:6-13](app/page.jsx#L6-L13)) keeps interactive JS off
  the critical path while content stays SSR'd.
- `next.config.js` sets security headers + `poweredByHeader:false` + sitemap/robots cache headers.

### Issues

| ID | Metric | Finding | File | Fix / expected gain |
|----|--------|---------|------|--------------------|
| P1 | **CLS** | Dynamic-import skeleton is `h-[440px]` but the real form is `min-h-[500px]` + StatsPanel + chips → shift on load | [app/page.jsx:9-10](app/page.jsx#L9-L10) vs [HumanizerForm.jsx:90](components/HumanizerForm.jsx#L90) | Match skeleton height to rendered tool; reserve space for chips. Gain: CLS → ~0 |
| P2 | **INP** | `setText` + word/char split runs on **every keystroke** up to 20,000 chars | [HumanizerForm.jsx:19-23](components/HumanizerForm.jsx#L19-L23) | Debounce/`useDeferredValue` for counters. Gain: smoother typing INP on large inputs |
| P3 | **TBT** | 3 analytics scripts add main-thread JS | [app/layout.jsx:81-94](app/layout.jsx#L81-L94) | Consolidate to one (T6). Gain: lower TBT/INP |
| P4 | **API latency** | 3 sequential Gemini calls; "results in seconds" promise at risk | [lib/gemini.js:119-121](lib/gemini.js#L119-L121) | Stream final stage / collapse stages / parallelize where possible; add `maxDuration` |
| P5 | **`containIntrinsicSize`** | Estimated `0 9000px` may mis-reserve space | [app/page.jsx:267](app/page.jsx#L267) | Tune to actual rendered height to avoid scroll-jump |

**Next.js opportunities:** Homepage is already SSG (ideal). The 4 utility pages are static. **ISR**
isn't needed yet — it becomes relevant for the **programmatic & blog pages** in §6 (use
`generateStaticParams` + ISR `revalidate` for use-case pages; statically pre-render blog from
MDX/CMS). **Bundle:** dependencies are minimal (`@google/genai` is server-only via the route, so it
won't ship to the client). No tree-shaking or unused-dep problems found. **Edge:** OG image already
runs on edge ([opengraph-image.jsx:3](app/opengraph-image.jsx#L3)); keep the humanize route on Node
(LLM SDK + longer `maxDuration`).

---

## 5. Content Opportunities (Blog Strategy — 100+ topics)

Structure as **content clusters** (hub-and-spoke): each cluster has a pillar page that links to all
spokes, and every spoke links up to the pillar and across to the tool. This is the internal-linking
fix for T8.

**Cluster hubs (pillar pages):** `/humanize-ai-text` (or homepage), `/ai-detection`,
`/ai-writing`, `/seo-ai-content`, `/glossary`.

### Cluster A — AI Humanizing core (informational, TOFU/MOFU)
1. What is an AI humanizer? (definition pillar)
2. How to humanize AI text (step-by-step)
3. How to make ChatGPT sound more human
4. Why does AI writing sound robotic?
5. AI text vs human text: how to tell the difference
6. What is "burstiness" in writing? *(you already compute it — [stage1Processor.js:296](lib/stage1Processor.js#L296))*
7. What is perplexity in AI text detection?
8. Words that make text sound AI-generated *(seed from [stage1Processor.js:6-52](lib/stage1Processor.js#L6-L52))*
9. AI writing clichés to avoid (the "delve/leverage/in today's world" list)
10. How to add a human tone to AI content
11. How to vary sentence length for natural writing
12. Active vs passive voice in AI content
13. How to remove hedging language from writing
14. How to write at a grade 7–9 reading level
15. Flesch-Kincaid readability explained

### Cluster B — AI detection (high-intent, MOFU/BOFU)
16. Can AI-generated text be detected?
17. How do AI detectors work?
18. Are AI detectors accurate? (false positives)
19. How to pass AI detection ethically
20. Turnitin AI detection: what students should know
21. GPTZero explained
22. Originality.ai review
23. Why human writing gets flagged as AI
24. AI detection in academic settings
25. Does Google penalize AI content? (E-E-A-T reality)

### Cluster C — AI writing how-tos (TOFU, high volume)
26. Best ChatGPT prompts for writing
27. How to write a blog post with ChatGPT
28. How to edit AI-generated content
29. ChatGPT for essays: a responsible guide
30. How to fact-check AI content
31. How to keep brand voice with AI
32. AI content workflow for teams
33. How to scale content with AI
34. Best AI writing tools (roundup)
35. ChatGPT vs Claude vs Gemini for writing
36. How to rewrite AI content to sound natural
37. How to summarize with AI without sounding robotic
38. How to write product descriptions with AI
39. How to write emails with AI that don't sound automated
40. How to write LinkedIn posts with AI

### Cluster D — Use-case / audience (converts to programmatic pages, §6)
41. AI humanizer for students *(seed: [app/page.jsx:695-709](app/page.jsx#L695-L709))*
42. AI humanizer for bloggers *(seed: 711-723)*
43. AI humanizer for content writers *(seed: 725-736)*
44. AI humanizer for marketers *(seed: 738-749)*
45. AI humanizer for SEO professionals *(seed: 751-765)*
46. AI humanizer for agencies *(seed: 767-779)*
47. AI humanizer for businesses *(seed: 781-793)*
48. AI humanizer for academic writing
49. AI humanizer for copywriters
50. AI humanizer for email marketing
51. AI humanizer for social media managers
52. AI humanizer for ecommerce product pages
53. AI humanizer for nonprofits
54. AI humanizer for real estate listings
55. AI humanizer for resume/cover letters

### Cluster E — SEO + AI content (MOFU, attracts links)
56. Does AI content rank on Google?
57. Google Helpful Content Update + AI explained
58. E-E-A-T for AI-assisted content
59. How to make AI content SEO-friendly
60. Will humanizing AI content keep my keywords? *(seed FAQ: [app/page.jsx:120-123](app/page.jsx#L120-L123))*
61. AI content + internal linking strategy
62. Programmatic SEO with AI (meta — link magnet)
63. How AI content affects bounce rate & dwell time
64. AI content disclosure: do you need it?
65. Content decay and AI refreshes

### Cluster F — Comparisons / alternatives (BOFU, high commercial intent)
66. Best AI humanizers (comparison pillar)
67. [Competitor A] alternative
68. [Competitor B] alternative
69. AI humanizer vs paraphrasing tool *(seed: [app/page.jsx:85-88](app/page.jsx#L85-L88))*
70. AI humanizer vs Grammarly
71. AI humanizer vs Quillbot
72. Free vs paid AI humanizers
73. Best free AI humanizer (no sign-up)
74. Undetectable AI vs [competitor]
75. AI humanizer Chrome extensions compared

### Cluster G — Academic / student (huge seasonal volume; handle ethically)
76. Is using an AI humanizer cheating?
77. AI policies at universities (overview)
78. How to use AI responsibly for assignments
79. How to paraphrase sources correctly
80. Avoiding accidental plagiarism with AI
81. How to cite AI tools
82. AI for research vs AI for writing
83. Study tools that don't break academic integrity
84. How professors detect AI essays
85. Ethical AI use for thesis writing

### Cluster H — Model-specific (matches your existing keyword targets)
86. How to humanize ChatGPT text
87. How to humanize Claude text
88. How to humanize Gemini text
89. How to humanize Copilot text
90. How to humanize Jasper output
91. ChatGPT writing patterns to remove
92. Claude writing style: how it differs
93. Gemini content: common tells
94. How to humanize GPT-4 output
95. How to humanize DeepSeek/other-model text

### Cluster I — Tone / style (long-tail, evergreen)
96. How to make writing sound more casual
97. How to make writing sound more professional
98. How to make writing sound friendlier
99. How to write with a confident tone
100. How to write in an academic tone
101. How to find your writing voice
102. How to make corporate writing less stiff
103. How to write conversationally

**Internal-linking rule:** every blog post links (a) up to its cluster pillar, (b) to 2–3 sibling
posts, (c) to the most relevant use-case page (§6), and (d) to the tool with descriptive anchor text
("humanize your AI text"). Pillars link down to all spokes.

---

## 6. Programmatic SEO Opportunities

These are the **highest-leverage** pages because the homepage already contains seed copy for most of
them. Recommended URL pattern: **flat, exact-match slugs** (better than nested for these head terms).

### 6a. Use-case landing pages — `/ai-humanizer-for-[audience]`
Build a single template (`app/ai-humanizer-for/[useCase]/page.jsx` + `generateStaticParams` + ISR),
data-driven from a registry, then auto-add each to the sitemap (fixes T12).

| URL | Target keyword | Intent | Est. monthly volume* | Seed in repo |
|-----|----------------|--------|----------------------|--------------|
| /ai-humanizer-for-students | "ai humanizer for students" | Commercial | High | [page.jsx:695-709](app/page.jsx#L695-L709) |
| /ai-humanizer-for-bloggers | "ai humanizer for bloggers" | Commercial | Med | [page.jsx:711-723](app/page.jsx#L711-L723) |
| /ai-humanizer-for-seo-writers | "ai humanizer for seo" | Commercial | Med | [page.jsx:751-765](app/page.jsx#L751-L765) |
| /ai-humanizer-for-marketing-agencies | "ai humanizer for agencies" | Commercial | Med | [page.jsx:767-779](app/page.jsx#L767-L779) |
| /ai-humanizer-for-copywriters | "ai humanizer copywriting" | Commercial | Low-Med | [page.jsx:725-736](app/page.jsx#L725-L736) |
| /ai-humanizer-for-academic-writing | "humanize academic writing" | Commercial | Med | new |
| /ai-humanizer-for-linkedin | "humanize linkedin posts" | Commercial | Med | new |
| /ai-humanizer-for-essays | "humanize ai essay" | Commercial | High | new |
| /ai-humanizer-for-email | "humanize ai email" | Commercial | Low-Med | [page.jsx:738-749](app/page.jsx#L738-L749) |

\*Qualitative buckets — validate with a keyword tool.

**Template content sections (each page):** H1 with exact keyword → 1-line value prop → **embedded
tool** (reuse `HumanizerTool`) → "Why [audience] use a humanizer" → 3–4 audience-specific benefits →
mini use-case walkthrough → audience-specific FAQ (unique Q&As, FAQPage schema) → CTA → breadcrumb.
**Each page needs genuinely unique body copy** (≥600 words) or Google treats them as doorway pages.

### 6b. Model-source pages — `/humanize-[model]-text`
You already *target* these keywords in metadata but have **no pages** for them.

| URL | Target keyword | Intent |
|-----|----------------|--------|
| /humanize-chatgpt-text | "humanize chatgpt text" | Commercial |
| /humanize-claude-text | "humanize claude text" | Commercial |
| /humanize-gemini-text | "humanize gemini text" | Commercial |
| /humanize-gpt4-text | "humanize gpt text" | Commercial |
| /humanize-copilot-text | "humanize copilot text" | Low |

Sections: H1 + tool embed + "[Model]'s writing tells" (specific patterns) + before/after example +
FAQ + CTA.

### 6c. Free-tool / link-magnet pages — `/tools/[tool]` (see §7)
### 6d. Comparison / alternative pages — `/[competitor]-alternative`, `/compare/[a]-vs-[b]` (see §5 Cluster F)
### 6e. Glossary — `/glossary/[term]` (burstiness, perplexity, E-E-A-T, AI detection, etc.)

**Sitemap impact:** going from 5 → ~40 quality URLs in phase 1, ~150+ with blog. Convert
[app/sitemap.js](app/sitemap.js) to map over the page registries.

---

## 7. Backlink / Link-Magnet Opportunities

Free, embeddable utilities earn links far better than a tool behind expectation of payment. You
**already have the analysis engine** for several of these in
[lib/stage1Processor.js](lib/stage1Processor.js) — reuse it.

| Tool (URL) | What it does | Built from | Linkability | Traffic |
|------------|-------------|-----------|-------------|---------|
| `/tools/ai-content-detector` | Score text's "AI-ness" (burstiness, uniformity, cliché density) | [stage1Processor.js:268-356](lib/stage1Processor.js#L268-L356) | ⭐⭐⭐⭐⭐ | High |
| `/tools/readability-checker` | Flesch-Kincaid grade + reading level | new (simple algo) | ⭐⭐⭐⭐ | High |
| `/tools/burstiness-checker` | Sentence-length variance visualizer | [stage1Processor.js:296-304](lib/stage1Processor.js#L296-L304) | ⭐⭐⭐⭐ | Med (uniquely yours) |
| `/tools/ai-cliche-finder` | Highlights AI clichés in pasted text | [stage1Processor.js:6-52](lib/stage1Processor.js#L6-L52) | ⭐⭐⭐⭐ | Med |
| `/tools/word-counter` | Word/char/sentence/reading-time | [HumanizerForm.jsx:19-20](components/HumanizerForm.jsx#L19-L20) | ⭐⭐⭐ | Very high (commodity) |
| `/tools/passive-voice-checker` | Flags passive constructions | [stage1Processor.js:159](lib/stage1Processor.js#L159) | ⭐⭐⭐ | Med |
| `/tools/tone-analyzer` | Detects/labels tone | new | ⭐⭐⭐⭐ | Med |

**Outreach angles:** (1) "We analyzed N samples of AI text" data study (you have research seeds in
[research.txt](research.txt)) — pitch to marketing/SEO blogs; (2) free embeddable widget with a
backlink; (3) HARO/journalist responses on AI-detection accuracy; (4) listicle inclusion ("best free
AI tools"); (5) university writing-center resource pages (for the ethical-use content). The **AI
content detector** is the single best link magnet — it's the most-searched companion query and you
already have the scoring primitives.

---

## 8. Conversion Rate Optimization

Note: **paid tiers are planned**, so the copy promising "paid plans / higher limits / batch /
priority speed" ([app/page.jsx:62,127,620](app/page.jsx#L62)) is *aspirational*, not false — but
until the pricing page ships, add a "Pro — coming soon, join waitlist" capture so that intent isn't
wasted.

### Findings
| ID | Area | Finding | File | Recommendation |
|----|------|---------|------|----------------|
| CRO1 | Trust | **No visible social proof** — copy says "thousands of writers" ([page.jsx:948](app/page.jsx#L948)) but nothing on screen | [app/page.jsx](app/page.jsx) | Add real usage counter / testimonials / logos / star rating (then wire T4 schema) |
| CRO2 | Funnel | **No pricing page / signup / waitlist** despite planned paid tiers | n/a | Build `/pricing` + email/waitlist capture; add nav link |
| CRO3 | Lead capture | **No email capture anywhere** | n/a | Add a lightweight "get notified / free SEO checklist" opt-in (also a link-magnet lead) |
| CRO4 | Output UX | Result is plain text; no "humanize again / try another tone / download" | [HumanizedOutput.jsx:104-108](components/HumanizedOutput.jsx#L104-L108) | Add re-run, tone toggle, before/after diff → more engagement & repeat use |
| CRO5 | Tool friction | Style/tone selection is described in copy but **not in the form** | [HumanizerForm.jsx](components/HumanizerForm.jsx) | Add the tone selector the copy promises ([page.jsx:633-640](app/page.jsx#L633-L640)) |
| CRO6 | Header nav | Header has logo + a static "3-Stage Pipeline" badge, **no nav links** | [SiteHeader.jsx:30-35](components/SiteHeader.jsx#L30-L35) | Add nav (Tools, Use cases, Blog, Pricing) once pages exist |
| CRO7 | Above-fold | Strong hero, tool above the fold ✅ | [app/page.jsx:245-262](app/page.jsx#L245-L262) | Keep; A/B test H1 variants |

### A/B test backlog
- H1: "Free AI Humanizer" vs "Make AI Text Undetectably Human" vs benefit-led.
- CTA label: "Humanize Content" vs "Humanize Free →".
- Social proof present vs absent (expect biggest lift).
- Tone selector visible vs hidden.

---

## 9. Competitor SEO Analysis Framework

Analyze these **categories** (fill in named competitors via Ahrefs "also rank for"):

| Category | Examples to research | What to steal |
|----------|---------------------|---------------|
| Direct AI humanizers | Undetectable.ai, Humbot, HIX/Bypass, StealthGPT, WriteHuman | Their `/ai-humanizer-for-*` + `/humanize-*-text` page sets; aggregateRating usage |
| AI detectors | GPTZero, Originality.ai, Copyleaks | Detector-tool link magnets; "is X accurate" content |
| Paraphrasers/writing | Quillbot, Grammarly, Wordtune | Glossary + tool-hub internal linking; freemium funnel |
| General AI-writing blogs | Surfer, Jasper blog | Pillar/cluster structure; comparison content |

For each competitor capture: (1) top organic keywords, (2) their programmatic page templates, (3)
referring domains to their free tools, (4) content gaps they *haven't* covered (your wedge). Your
differentiators to lean on: **truly free + no sign-up**, **3-stage pipeline transparency**, and the
**burstiness/analysis stats** ([StatsPanel.jsx](components/StatsPanel.jsx)) competitors don't expose.

---

## 10. AI-Humanizer-Specific SEO Strategy & Growth Roadmap

**Page-type targets:** landing (homepage ✅), use-case (§6a), tool-source (§6b), free-tool/resource
(§7), glossary (§6e), comparison (§6f), blog (§5).

### Roadmap to traffic milestones (estimates — validate)

**Phase 1 → ~10k/mo (Months 1–3): foundation + harvest existing intent**
- Fix all §2 critical issues (C1–C6) — *non-negotiable, week 1.*
- Ship 9 use-case pages (§6a) + 3 model pages (§6b) from the homepage seed content.
- Ship the **AI content detector** link magnet (§7).
- Publish 15–20 cluster-A/B/H blog posts.
- Submit sitemap to GSC + Bing; fix internal linking (T8).
- Add social proof + email capture (CRO1, CRO3).

**Phase 2 → ~50k/mo (Months 4–6): content velocity + links**
- 40–60 more blog posts (clusters C–G); complete pillar pages.
- 3–4 more free tools (readability, word counter, cliché finder).
- Launch comparison/alternative pages (Cluster F) for commercial intent.
- Active link building: data study from [research.txt](research.txt), HARO, widget embeds.
- Ship `/pricing` + waitlist; begin free→paid funnel (CRO2).

**Phase 3 → ~100k/mo (Months 7–12): scale + authority**
- Programmatic depth: every audience × model permutation that has real volume.
- Localization/translation if data supports (FAQ already claims multi-language).
- Refresh decaying content; double down on pages ranking #5–15 (striking distance).
- Digital PR for referring domains; pursue glossary/tool citations.

---

## 11. Priority Matrix

**🔴 High impact / Low effort (do first)**
- C1 set prod `NEXT_PUBLIC_SITE_URL`; C2 metadataBase fallback.
- C4 verify Gemini model + add `maxDuration` + retries.
- P1 fix skeleton-height CLS; T5 move scripts into `<body>`.
- 9 use-case pages from existing seed copy (§6a).
- Social proof + email capture (CRO1, CRO3).

**🟠 High impact / High effort**
- C5/§6 full programmatic layer + dynamic sitemap (T12).
- Blog cluster build-out (§5).
- AI content detector link magnet (§7).
- C3 brand unification.

**🟡 Medium**
- T1 subpage OG; T2/T3 breadcrumb + Article schema; T4 aggregateRating (real data).
- CRO4/CRO5 output UX + tone selector; CRO6 header nav.

**🟢 Low**
- T6 consolidate analytics; T7 not-found page; T9/T10/T11 cleanup; P2 debounce counters.

---

## 12. 30-Day & 90-Day Action Plans + Growth Potential

### 30-Day plan
- **Week 1:** C1, C2, C4, C6 (rotate key), C3 brand decision. Deploy. Verify live canonicals/sitemap
  in GSC; confirm tool works end-to-end.
- **Week 2:** Build use-case page **template** + ship 4 pages (students, bloggers, SEO, essays);
  dynamic sitemap. Fix P1/T5/T8.
- **Week 3:** Ship 3 model pages (`/humanize-chatgpt|claude|gemini-text`); add social proof + email
  capture; T1 subpage OG.
- **Week 4:** Ship AI content detector tool; publish 6–8 blog posts (clusters A/B); add breadcrumbs
  (T2).

### 90-Day plan
- **Month 2:** 5 more use-case pages; 2 more free tools; 20+ blog posts; pillar pages; begin
  outreach (data study).
- **Month 3:** Comparison/alternative pages; `/pricing` + waitlist; 20+ more posts; glossary;
  striking-distance optimization from GSC.

### Estimated growth potential (illustrative, not guaranteed)
- Today: ~1 indexable content page → near-zero non-brand organic ceiling.
- After 30 days (≈20 pages, fixes live): **first non-brand impressions; ~0.5–2k/mo** as pages index.
- After 90 days (≈60–80 pages + links): **~5–15k/mo** if execution + content quality hold.
- 6–12 months on this trajectory: **50k–100k/mo is achievable** for this niche, *contingent on*
  content quality, backlink acquisition, and the tool actually working reliably. The technical
  foundation here supports it; the gating factor is content/page volume + links, not code.

---

## Verification (how to validate the fixes once implemented later)
1. **Build/env:** `next build` succeeds with prod env; view-source on every page → canonical, OG,
   JSON-LD all show `https://simplyhumanize.com` (no localhost).
2. **Rich results:** run each page through Google Rich Results Test + Schema validator (FAQ,
   SoftwareApplication, Breadcrumb, Article).
3. **Indexing:** submit `sitemap.xml` in GSC; confirm new programmatic/blog URLs are discovered and
   indexed; check Coverage for soft-404s.
4. **CWV:** Lighthouse + PageSpeed Insights on homepage and a programmatic page; confirm CLS≈0,
   good LCP/INP; watch Vercel Speed Insights field data.
5. **Tool reliability:** load-test `/api/humanize` with a ~2,000-word input on Vercel; confirm no
   504 timeout and a successful humanized response.
6. **Tracking:** confirm only the chosen analytics stack fires; events for tool-use and CTA clicks.
