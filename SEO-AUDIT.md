# Simply Humanize — Growth, SEO & Product Audit

**Date:** 2026-07-14 · **Scope:** full codebase at this commit + market research · **Goal:** 100,000+ monthly organic visitors

> **How to read this document**
> - Every finding references the actual file where it lives. Paths are relative to the repo root.
> - Priorities: **P0** = do now, blocks growth · **P1** = high impact, next 30 days · **P2** = 1–3 months · **P3** = nice to have.
> - Keyword volume/difficulty figures are **directional estimates** from market observation, not tool exports. Validate the top candidates in Google Keyword Planner / Search Console before committing writer time.
> - Items marked ✅ were **already fixed in this session** (sitemap lastmod, IndexNow key, robots AI-crawler rules, breadcrumb JSON-LD, llms.txt tools links).

**The one-paragraph verdict:** The foundation is unusually good for a site this size — clean metadata, canonical URLs, FAQ/SoftwareApplication schema, `llms.txt`, IndexNow automation, static generation, an honest editorial voice, and a genuinely differentiated transparent AI detector. The problem is *surface area*: 17 indexable pages cannot reach 100k monthly visitors in this market. Competitors (Humbot, BypassGPT, HIX) each run hundreds of landing pages plus content hubs with 100+ posts. The second problem is *integrity drift*: the homepage FAQ and `llms.txt` promise features (writing styles, paid plans, batch processing, multi-language) that the product doesn't have — that mismatch is both a conversion killer and a "helpful content" risk. The third problem is *monetization*: there is no pricing page, no accounts, and an unprotected API that anyone can drain. Fix the honesty gap, scale the two programmatic page systems you already built, add a blog, and put a quota + pricing surface in place — in that order.

---

## Part 1 — SEO Audit

### 1.1 Priority table

| # | Issue | Where | Priority | Est. impact |
|---|-------|-------|----------|-------------|
| 1 | Only 17 indexable pages — content surface too small for the keyword universe | whole site | **P0** | Blocks the 100k goal outright |
| 2 | No blog/content hub at all | no `app/blog/` route | **P0** | Competitors get 30–60% of traffic from blogs |
| 3 | Marketing copy promises features that don't exist (styles, paid plans, batch, languages) | `app/page.jsx` FAQs, `public/llms.txt` | **P0** | Trust + Google helpful-content risk; kills conversions |
| 4 | `/api/humanize` unauthenticated, no rate limit — quota drain will take the free tool (your #1 SEO asset) offline | `app/api/humanize/route.js` | **P0** | An outage of the tool = pogo-sticking = ranking loss |
| 5 | ✅ IndexNow keyLocation 404 — every submission silently rejected | `scripts/indexnow.mjs` + `public/` | **P0** | Fixed: Bing/Yandex now accept pings |
| 6 | ✅ Sitemap `lastModified: new Date()` on every build — crawlers learn to ignore lastmod | `app/sitemap.js` | **P1** | Fixed: stable per-page dates |
| 7 | Header nav doesn't link the 3 model pages (footer-only) — weak internal linking to money pages | `components/SiteHeader.jsx` | **P1** | Crawl priority + CTR from nav |
| 8 | No pricing page — "free vs paid" is the highest-intent query pattern in this niche | no route | **P1** | Captures `simply humanize pricing`, enables CRO |
| 9 | Zero content images site-wide — no image SEO, no visual snippets, weaker time-on-page | all pages | **P1** | Before/after screenshots earn image-pack + Discover traffic |
| 10 | Organization schema has no `sameAs`; Twitter `@humanizerai` in metadata likely unowned | `app/page.jsx:195`, `app/layout.jsx:57` | **P1** | Entity SEO for AI search; wrong handle misattributes brand |
| 11 | ✅ Breadcrumb JSON-LD missing on `/use-cases`, `/tools`, `/about`, `/contact` | `components/Breadcrumbs.jsx` | **P2** | Fixed: component now emits `BreadcrumbList` everywhere |
| 12 | `/tools` hub is thin (~150 words, 2 cards) | `app/(pages)/tools/page.jsx` | **P2** | Beef up to a real hub as tools ship |
| 13 | Keyword overlap: `/ai-humanizer-for/students` vs `/ai-humanizer-for/essays` both chase "humanize essay" variants | `lib/useCases.js` | **P2** | Assign one primary keyword per page (see 1.4) |
| 14 | No Google Search Console verification token in metadata (only Bing `msvalidate.01`) | `app/layout.jsx:67–71` | **P2** | Confirm GSC is verified via DNS; if not, add token |
| 15 | Detector page has no `WebApplication`/`SoftwareApplication` schema of its own | `app/(pages)/tools/ai-content-detector/page.jsx` | **P2** | Tool-rich results + AI-search citability |
| 16 | `runtime = 'edge'` on OG image disables static generation (build warns) | `app/opengraph-image.jsx:3` | **P3** | Remove the line; Node runtime pre-renders it |
| 17 | No hreflang / localization (only relevant once non-English pages exist) | — | **P3** | Prereq for the by-language page family (Part 11) |
| 18 | Manifest icon is SVG-only; no 192/512 PNG maskable icons | `app/manifest.js` | **P3** | PWA installability polish |

### 1.2 What is already right (don't break these)

- **Metadata**: root `metadataBase`, title template, OG + Twitter cards on every page, self-referencing canonicals everywhere (`app/layout.jsx`, each `page.jsx`).
- **Schema**: `FAQPage` + `SoftwareApplication` + `WebSite` + `Organization` on the homepage; `FAQPage` on all template pages. Note: since 2023 Google only shows FAQ *rich results* for authoritative gov/health sites — keep the schema anyway, it feeds AI search engines and entity understanding.
- **Rendering**: every marketing page is statically generated (verified in the build output) — crawlers get full HTML, no JS required. This is a real advantage for AI crawlers, most of which don't execute JavaScript.
- **`llms.txt`** exists and is well-written — almost no competitor has one.
- **Homepage content**: ~5,000 words, correct H1→H2→H3 hierarchy, 19 FAQs, comparison table, anchor CTAs. This page can rank; it just needs siblings.
- **Perf hygiene**: system font stack, `content-visibility: auto` on the long article (`app/page.jsx:268`), dynamically imported tool with layout-stable skeletons, security headers in `next.config.js`.

### 1.3 Fixes applied in this session (details)

1. **IndexNow** — `scripts/indexnow.mjs` submits `keyLocation: https://simplyhumanize.com/c582fa0fc6164535be121b054a3b0ab8.txt`, but the repo only contained `public/d8d9d31ae2e5427f99eed044f2c79310.txt`. The key URL returned 404, so **every submission since launch was rejected**. The file is now `public/c582fa0fc6164535be121b054a3b0ab8.txt`. After the next deploy, run `npm run indexnow` and expect HTTP 200/202.
2. **Sitemap lastmod** — every URL reported `new Date()` at build time, i.e. "everything changed today" on every deploy. Crawlers treat a lastmod that always changes as noise. Each entry in `lib/useCases.js` / `lib/aiModels.js` now carries `lastUpdated: "YYYY-MM-DD"`, and `app/sitemap.js` keeps a dated map for static pages. **Bump a date only when that page's content genuinely changes.** The base URL now also strips a trailing slash (same normalization `app/robots.js` uses), so a `NEXT_PUBLIC_SITE_URL` ending in `/` can no longer emit `https://site.com//about`.
3. **robots.txt** — now explicitly allows `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-Web`, `anthropic-ai`, `PerplexityBot`, `Perplexity-User`, and `Google-Extended` (still blocking `/api/`). The wildcard already permitted them, but explicit rules survive future wildcard tightening and document intent.
4. **Breadcrumb schema** — `components/Breadcrumbs.jsx` now emits `BreadcrumbList` JSON-LD derived from the same `crumbs` prop that renders the visual trail, so schema and UI can never drift. The three hand-rolled `buildBreadcrumbSchema()` copies and the homepage's single-item breadcrumb block were removed. Net effect: `/use-cases`, `/tools`, `/about`, `/contact`, `/privacy-policy`, `/terms` gained breadcrumb schema for free.
5. **`llms.txt`** — added the `## Free tools` section linking `/tools` and `/tools/ai-content-detector` (previously invisible to AI crawlers reading the file).

### 1.4 Remaining issues, explained

**The content-integrity gap (issue #3) — fix before scaling anything.**
`app/page.jsx` FAQ answers state: *"pick a writing style if you want a specific tone (casual, professional, friendly)"*, *"Paid plans add higher word limits, batch processing, more style options, and priority speed"*, *"paid plans include additional data handling commitments"*, and *"Support for major languages like Spanish, French, German, and Portuguese is available."* `public/llms.txt` repeats all of it. But `components/HumanizerForm.jsx` has no style selector, there is no pricing page, no accounts, no batch mode, and the pipeline (`lib/prompts.js`) is English-pattern-only. Two ways out — pick one per claim:
- *Build it*: the style selector is ~1 day of work (a `<select>` whose value maps to a tone instruction appended in `buildStage2Prompt`) and is also your best UX upgrade (Part 4).
- *Cut the claim*: edit the FAQ answers and `llms.txt` to describe only what exists.
Why it matters: users who look for the promised style picker and can't find it bounce; reviewers writing "best AI humanizer" listicles (your biggest backlink source, see Part 10) will note the discrepancy; and Google's helpful-content system specifically targets pages whose content misrepresents the product experience.

**Internal linking (issue #7).** The three model pages are your most commercial URLs (`/humanize-chatgpt-text` alone targets a head term with real volume) but they're linked only from the footer and one FAQ answer. Add a "Humanize" dropdown (or plain links) in `components/SiteHeader.jsx`: ChatGPT · Claude · Gemini · All use cases. Header links carry more internal PageRank and get crawled first.

**Cannibalization map (issue #13).** Assign and enforce one primary keyword per URL; adjust titles/H1s so they stop competing:

| URL | Primary keyword (own it) | Avoid |
|-----|--------------------------|-------|
| `/` | ai humanizer, humanize ai text | model/use-case modifiers |
| `/humanize-chatgpt-text` | humanize chatgpt text | generic "ai humanizer" in title |
| `/ai-humanizer-for/students` | ai humanizer for students | "essay" phrasing in title/H1 |
| `/ai-humanizer-for/essays` | humanize essay / essay humanizer | "students" phrasing in title/H1 |
| `/tools/ai-content-detector` | free ai content detector | "checker" (save for a future page) |

**Image SEO (issue #9).** The site ships zero `<img>` elements. Minimum viable: (a) a real product screenshot on the homepage below the hero (raises time-on-page and gives listicle authors an asset to embed — with a backlink), (b) one before/after comparison graphic per model page, (c) OG images per template family instead of the single generic one (Next.js supports `opengraph-image.jsx` per route segment). All via `next/image` with descriptive alt text, e.g. `alt="Side-by-side comparison: ChatGPT output vs humanized version with sentence-length variation highlighted"`.

**Entity/verification (issues #10, #14).** Create the actual X/Twitter profile (or delete `twitter.site`/`twitter.creator` from `app/layout.jsx` — pointing at an unowned handle invites impersonation), plus a LinkedIn company page and a GitHub org if you'll open-source the detector (Part 10). Then add them to the Organization schema in `app/page.jsx` as `sameAs: [...]`. Confirm Google Search Console is verified (DNS or add a `google-site-verification` token next to the existing Bing one).

---

## Part 2 — Landing Page Strategy (111 pages)

You already built the machinery for this: `lib/aiModels.js` + `components/ModelPageTemplate.jsx` and `lib/useCases.js` + `app/(pages)/ai-humanizer-for/[useCase]/page.jsx`. Scaling = adding data-file entries, **not** new code. Rules that keep this safe (see Part 11 for the full quality bar): every page gets ≥800 words of genuinely specific copy, unique FAQs, the embedded tool, and a hand-written "what's distinctive about this input type" section. Ship in batches of 5–10/week, not 100 at once.

Volume/difficulty are directional estimates (Low ≈ beatable with on-page quality alone; Med ≈ needs internal links + some backlinks; High ≈ needs domain authority). Intent codes: **T** = transactional/tool-seeking, **I** = informational, **C** = commercial-investigation.

### Family A — Humanize by AI model (extend `lib/aiModels.js`, 20 pages)

Why this family ranks: "humanize [model] text" queries have exact-match intent, low competition outside the top 3 models, and your template already demonstrates the format Google is rewarding for the ChatGPT variant. Each page must name the model's *actual* stylistic tells (as the existing three do) — that specificity is the ranking edge.

| Keyword | Intent | Diff. | Est. vol/mo | Slug |
|---|---|---|---|---|
| humanize grok text | T | Low | 500–1k | `/humanize-grok-text` |
| humanize deepseek text | T | Low | 1k–3k | `/humanize-deepseek-text` |
| humanize copilot text | T | Low | 500–1k | `/humanize-copilot-text` |
| humanize llama text | T | Low | 200–500 | `/humanize-llama-text` |
| humanize perplexity text | T | Low | 200–500 | `/humanize-perplexity-text` |
| humanize mistral text | T | Low | 100–300 | `/humanize-mistral-text` |
| humanize qwen text | T | Low | 100–300 | `/humanize-qwen-text` |
| humanize kimi text | T | Low | 100–300 | `/humanize-kimi-text` |
| humanize jasper content | T | Low | 200–500 | `/humanize-jasper-text` |
| humanize copy.ai content | T | Low | 200–500 | `/humanize-copy-ai-text` |
| humanize writesonic content | T | Low | 100–300 | `/humanize-writesonic-text` |
| humanize rytr content | T | Low | 100–300 | `/humanize-rytr-text` |
| humanize notion ai text | T | Low | 200–500 | `/humanize-notion-ai-text` |
| humanize wordtune text | T | Low | 100–300 | `/humanize-wordtune-text` |
| humanize gpt-4o text | T | Low-Med | 500–1k | `/humanize-gpt-4o-text` |
| humanize gpt-5 text | T | Med | 1k–5k | `/humanize-gpt-5-text` |
| humanize meta ai text | T | Low | 200–500 | `/humanize-meta-ai-text` |
| humanize character ai text | T | Low | 300–800 | `/humanize-character-ai-text` |
| humanize bing/copilot chat text | T | Low | 100–300 | `/humanize-bing-chat-text` |
| humanize quillbot output | T | Low-Med | 300–800 | `/humanize-quillbot-text` |

### Family B — Humanize by document type (new `lib/documentTypes.js` + `/humanize/[docType]` route, 32 pages)

Why this family ranks: these are the highest-volume mid-tail queries in the niche ("humanize my essay" class), searchers convert instantly on an embedded tool, and most competitors only cover essay/email. Reuse the use-case template; the data file needs `docType`-specific sections (what AI tells look like *in a cover letter*, etc.).

| Keyword | Intent | Diff. | Est. vol/mo | Slug |
|---|---|---|---|---|
| humanize essay / essay humanizer | T | Med-High | 10k–30k | `/humanize/essay` *(or keep `/ai-humanizer-for/essays` as canonical — don't create both)* |
| humanize assignment | T | Med | 2k–5k | `/humanize/assignment` |
| humanize email | T | Med | 2k–5k | `/humanize/email` |
| humanize blog post | T | Low-Med | 1k–3k | `/humanize/blog-post` |
| humanize linkedin post | T | Low-Med | 1k–3k | `/humanize/linkedin-post` |
| humanize resume | T | Med | 2k–5k | `/humanize/resume` |
| humanize cover letter | T | Med | 3k–8k | `/humanize/cover-letter` |
| humanize research paper | T | Med | 1k–3k | `/humanize/research-paper` |
| humanize thesis | T | Low-Med | 500–1k | `/humanize/thesis` |
| humanize dissertation | T | Low-Med | 500–1k | `/humanize/dissertation` |
| humanize personal statement | T | Med | 1k–3k | `/humanize/personal-statement` |
| humanize college essay | T | Med | 2k–5k | `/humanize/college-essay` |
| humanize scholarship essay | T | Low | 300–800 | `/humanize/scholarship-essay` |
| humanize statement of purpose (SOP) | T | Low-Med | 500–1k | `/humanize/statement-of-purpose` |
| humanize lab report | T | Low | 300–800 | `/humanize/lab-report` |
| humanize discussion post | T | Low | 500–1k | `/humanize/discussion-post` |
| humanize literature review | T | Low | 200–500 | `/humanize/literature-review` |
| humanize report | T | Low-Med | 500–1k | `/humanize/report` |
| humanize product description | T | Low | 500–1k | `/humanize/product-description` |
| humanize newsletter | T | Low | 200–500 | `/humanize/newsletter` |
| humanize press release | T | Low | 200–500 | `/humanize/press-release` |
| humanize case study | T | Low | 200–500 | `/humanize/case-study` |
| humanize white paper | T | Low | 100–300 | `/humanize/white-paper` |
| humanize speech | T | Low-Med | 500–1k | `/humanize/speech` |
| humanize youtube script | T | Low-Med | 500–1k | `/humanize/youtube-script` |
| humanize podcast script | T | Low | 100–300 | `/humanize/podcast-script` |
| humanize ad copy | T | Low | 200–500 | `/humanize/ad-copy` |
| humanize social media post | T | Low-Med | 500–1k | `/humanize/social-media-post` |
| humanize instagram caption | T | Low | 300–800 | `/humanize/instagram-caption` |
| humanize bio / about me | T | Low | 300–800 | `/humanize/bio` |
| humanize review | T | Low | 200–500 | `/humanize/review` |
| humanize recommendation letter | T | Low | 200–500 | `/humanize/recommendation-letter` |

### Family C — Humanize by profession/audience (extend `lib/useCases.js`, 15 pages)

Why this family ranks: your 8 existing pages prove the pattern; these audiences search with profession-qualified queries and nobody targets them specifically. Each needs profession-authentic workflow copy (what a nurse actually writes: charting summaries, patient education handouts…).

| Keyword | Intent | Diff. | Est. vol/mo | Slug |
|---|---|---|---|---|
| ai humanizer for teachers | T | Low | 300–800 | `/ai-humanizer-for/teachers` |
| ai humanizer for researchers | T | Low | 200–500 | `/ai-humanizer-for/researchers` |
| ai humanizer for nurses | T | Low | 100–300 | `/ai-humanizer-for/nurses` |
| ai humanizer for lawyers | T | Low | 100–300 | `/ai-humanizer-for/lawyers` |
| ai humanizer for real estate agents | T | Low | 100–300 | `/ai-humanizer-for/real-estate-agents` |
| ai humanizer for recruiters / HR | T | Low | 100–300 | `/ai-humanizer-for/recruiters` |
| ai humanizer for job seekers | T | Low-Med | 300–800 | `/ai-humanizer-for/job-seekers` |
| ai humanizer for developers | T | Low | 100–300 | `/ai-humanizer-for/developers` |
| ai humanizer for journalists | T | Low | 100–300 | `/ai-humanizer-for/journalists` |
| ai humanizer for authors / novelists | T | Low | 200–500 | `/ai-humanizer-for/authors` |
| ai humanizer for copywriters | T | Low | 200–500 | `/ai-humanizer-for/copywriters` |
| ai humanizer for ecommerce | T | Low | 100–300 | `/ai-humanizer-for/ecommerce` |
| ai humanizer for customer support | T | Low | 100–300 | `/ai-humanizer-for/customer-support` |
| ai humanizer for youtubers | T | Low | 200–500 | `/ai-humanizer-for/youtubers` |
| ai humanizer for grad students | T | Low | 200–500 | `/ai-humanizer-for/graduate-students` |

### Family D — Humanize by language (12 pages — **prerequisite: verify pipeline quality first**)

Why this family ranks: "humanizar texto ia" (ES), "humaniser texte ia" (FR) etc. have strong volume with far weaker competition than English. **Do not ship until the pipeline actually handles the language** — `lib/prompts.js` rules (em-dash bans, Anglo-Saxon word lists) are English-specific and would need per-language prompt variants. Ship page + localized prompt together, with hreflang.

| Keyword (localized) | Intent | Diff. | Est. vol/mo | Slug |
|---|---|---|---|---|
| humanizar texto ia (Spanish) | T | Med | 5k–15k | `/es` or `/humanize-ai-text-spanish` |
| humaniser texte ia (French) | T | Low-Med | 2k–5k | `/fr` |
| ki text menschlich machen (German) | T | Low-Med | 1k–3k | `/de` |
| humanizar texto de ia (Portuguese) | T | Low-Med | 2k–5k | `/pt` |
| umanizzare testo ai (Italian) | T | Low | 500–1k | `/it` |
| ai tekst menselijk maken (Dutch) | T | Low | 200–500 | `/nl` |
| humanize ai text hindi | T | Low | 500–1k | `/hi` |
| humanize ai text arabic | T | Low-Med | 1k–3k | `/ar` |
| humanize ai text indonesian | T | Low | 500–1k | `/id` |
| humanize ai text turkish | T | Low | 300–800 | `/tr` |
| humanize ai text japanese | T | Low-Med | 500–1k | `/ja` |
| humanize ai text tagalog/filipino | T | Low | 500–1k | `/fil` |

### Family E — Detector-education pages (10 pages)

Why this family ranks: enormous search demand around specific detectors ("does turnitin detect chatgpt" class). Framing matters: your brand's stated position (`lib/useCases.js` students FAQ: *"We don't make guarantees about AI detection outcomes"*) is honest — keep it. These pages explain **how each detector works, its false-positive record, and how to write naturally** — with the humanizer as the honest CTA. That framing also earns links from educators, which "bypass" pages never do.

| Keyword | Intent | Diff. | Est. vol/mo | Slug |
|---|---|---|---|---|
| how does turnitin detect ai | I | Med | 10k–30k | `/detectors/turnitin` |
| gptzero accuracy / how gptzero works | I | Med | 5k–15k | `/detectors/gptzero` |
| originality.ai accuracy | I | Low-Med | 1k–3k | `/detectors/originality-ai` |
| copyleaks ai detector accuracy | I | Low-Med | 1k–3k | `/detectors/copyleaks` |
| zerogpt accuracy | I | Low-Med | 2k–5k | `/detectors/zerogpt` |
| winston ai detector review | C | Low | 500–1k | `/detectors/winston-ai` |
| quillbot ai detector accuracy | I | Low | 500–1k | `/detectors/quillbot` |
| canvas ai detection | I | Low-Med | 2k–5k | `/detectors/canvas` |
| google ai content detection (does Google penalize AI content) | I | Med | 5k–15k | `/detectors/google` |
| ai detector false positives | I | Low-Med | 1k–3k | `/detectors/false-positives` |

### Family F — Comparison & alternatives pages (12 pages)

Why this family ranks: bottom-funnel, high-converting, and competitors aggressively do this to *you* (BypassGPT runs a whole `/alternatives/` directory). Requirement: honest hands-on comparisons with screenshots — thin "X vs Y" templates get filtered.

| Keyword | Intent | Diff. | Est. vol/mo | Slug |
|---|---|---|---|---|
| undetectable ai alternative | C | Med | 1k–3k | `/alternatives/undetectable-ai` |
| writehuman alternative | C | Low-Med | 500–1k | `/alternatives/writehuman` |
| humbot alternative | C | Low | 300–800 | `/alternatives/humbot` |
| stealthwriter alternative | C | Low | 300–800 | `/alternatives/stealthwriter` |
| bypassgpt alternative | C | Low | 200–500 | `/alternatives/bypassgpt` |
| hix bypass alternative | C | Low | 200–500 | `/alternatives/hix-bypass` |
| quillbot ai humanizer alternative | C | Med | 500–1k | `/alternatives/quillbot` |
| free undetectable ai alternative | C | Low-Med | 500–1k | `/alternatives/free` |
| best ai humanizer (hub listicle) | C | High | 10k–30k | `/best-ai-humanizer` |
| best free ai humanizer | C | Med-High | 5k–15k | `/best-free-ai-humanizer` |
| ai humanizer for students comparison | C | Low-Med | 300–800 | `/best-ai-humanizer-for-students` |
| simply humanize vs undetectable ai | C | Low | brand | `/compare/simply-humanize-vs-undetectable-ai` |

### Family G — Free micro-tools (10 pages; each is a landing page *and* a backlink magnet)

Why this family ranks: you already proved the model with `/tools/ai-content-detector` — client-side, free, no sign-up, transparent. Each tool below reuses `lib/aiScore.js` internals (the regex/burstiness machinery already exists) for ~1–2 days of work apiece, targets a standalone query, and earns "free tool" links (Part 10).

| Keyword | Intent | Diff. | Est. vol/mo | Slug |
|---|---|---|---|---|
| em dash remover / remove em dashes from ai text | T | Low | 1k–3k | `/tools/em-dash-remover` |
| ai cliché finder ("delve" checker) | T | Low | 300–800 | `/tools/ai-cliche-finder` |
| burstiness checker / sentence length analyzer | T | Low | 300–800 | `/tools/sentence-length-analyzer` |
| passive voice checker | T | Med | 3k–8k | `/tools/passive-voice-checker` |
| readability checker (Flesch-Kincaid) | T | Med | 5k–15k | `/tools/readability-checker` |
| word counter | T | High (huge vol) | 100k+ | `/tools/word-counter` |
| character counter | T | High | 50k+ | `/tools/character-counter` |
| paragraph rewriter (free) | T | Med | 5k–15k | `/tools/paragraph-rewriter` |
| sentence rewriter (free) | T | Med | 5k–15k | `/tools/sentence-rewriter` |
| chatgpt word checker (words chatgpt overuses) | T/I | Low | 500–1k | `/tools/chatgpt-word-checker` |

**Sequencing recommendation:** A (weeks 1–3, pure data-file work) → B core 10 (essay/email/cover-letter/resume/assignment/LinkedIn/personal-statement/college-essay/blog-post/research-paper) → G quick wins (em-dash remover + cliché finder reuse existing code) → E → F → C → D last (needs pipeline work).

---

## Part 3 — Blog Strategy (200 posts)

**Setup:** add `app/blog/[slug]/page.jsx` + `app/blog/page.jsx` (paginated index), MDX or a `lib/posts` data layer, `Article` JSON-LD, author byline with a real person + bio page (E-E-A-T), and add the blog to `app/sitemap.js` + `llms.txt`. Publish 2–3/week; every post embeds the tool or detector where natural and internally links to the matching landing page from Part 2.

**Prioritization inside each cluster:** start with rows marked ★ (best volume-to-difficulty ratio). Difficulty/volume are directional; validate before writing. All topics below are evergreen unless marked (refresh annually).

### Cluster 1 — AI writing patterns (25) — builds topical authority nothing else can

| # | Title | Keyword | Intent | Diff. | Est. traffic/mo |
|---|-------|---------|--------|-------|-----------------|
| 1★ | Words ChatGPT Overuses: The Complete List (2026) | words chatgpt overuses / chatgpt words | I | Low | 3k–8k |
| 2★ | Why Does ChatGPT Use So Many Em Dashes? | chatgpt em dash | I | Low | 2k–5k |
| 3★ | "Delve," "Tapestry," "Crucial": Why AI Loves These Words | delve ai word | I | Low | 1k–3k |
| 4 | What Is Burstiness in Writing (and Why AI Text Has None) | burstiness writing | I | Low | 1k–3k |
| 5 | What Is Perplexity in AI Text Detection? | perplexity ai detection | I | Low | 1k–3k |
| 6★ | How to Tell If Something Was Written by AI: 12 Signs | how to tell if something is written by ai | I | Med | 5k–15k |
| 7 | Why AI Writing All Sounds the Same (the Statistical Reason) | why does ai writing sound the same | I | Low | 500–1k |
| 8 | ChatGPT vs Claude vs Gemini: Writing Style Differences | chatgpt vs claude writing style | I | Low | 500–1k |
| 9 | The "In Conclusion" Problem: How AI Ends Every Essay | ai conclusion phrases | I | Low | 300–800 |
| 10 | Hedging Language: The AI Tell Nobody Talks About | hedging language ai | I | Low | 200–500 |
| 11 | What Human Writing Has That AI Writing Doesn't | human vs ai writing | I | Med | 1k–3k |
| 12 | Sentence Length Variation: The Single Strongest Human Signal | sentence length variation | I | Low | 500–1k |
| 13 | Why AI Text Reads "Flat": Rhythm, Explained | ai text sounds robotic | I | Low | 500–1k |
| 14 | The Rule of Three: How AI Overuses Parallel Lists | ai writing patterns | I | Low | 500–1k |
| 15 | 50 AI Clichés to Cut From Your Writing Today | ai cliches list | I | Low | 1k–3k |
| 16 | GPT-5 Writing Style: What Changed From GPT-4 (refresh) | gpt-5 writing style | I | Low | 500–1k |
| 17 | Claude's Writing Style: Strengths, Tells, and Fixes | claude writing style | I | Low | 500–1k |
| 18 | Gemini's Writing Style: What Gives It Away | gemini writing style | I | Low | 300–800 |
| 19 | Passive Voice and AI: Why Models Default to It | passive voice ai writing | I | Low | 200–500 |
| 20 | Why AI Can't Write a Good Joke (and What That Teaches Us) | can ai be funny | I | Low | 300–800 |
| 21 | Nominalization: The Grammar Habit That Screams "AI" | nominalization writing | I | Low | 200–500 |
| 22 | Function Words: The Hidden Fingerprint of Human Writing | function words writing | I | Low | 100–300 |
| 23 | How AI Transitions Differ From Human Transitions | transition words ai | I | Low | 200–500 |
| 24 | The Uncanny Valley of AI Writing | uncanny valley ai writing | I | Low | 200–500 |
| 25 | Do Different Languages Have Different AI Tells? | ai detection other languages | I | Low | 100–300 |

### Cluster 2 — AI detectors (25) — highest search demand in the niche

| # | Title | Keyword | Intent | Diff. | Est. traffic/mo |
|---|-------|---------|--------|-------|-----------------|
| 26★ | Does Turnitin Detect ChatGPT? What Students Should Know (2026) | does turnitin detect chatgpt | I | Med | 20k–50k |
| 27★ | How Accurate Is GPTZero? We Tested 100 Samples | gptzero accuracy | I | Med | 5k–15k |
| 28★ | AI Detector False Positives: Why Human Writing Gets Flagged | ai detector false positive | I | Med | 3k–8k |
| 29 | How Do AI Detectors Work? (Plain-English Explanation) | how do ai detectors work | I | Med | 5k–15k |
| 30 | Are AI Detectors Accurate? The Honest Answer | are ai detectors accurate | I | Med | 5k–15k |
| 31 | Turnitin AI Score: What the Percentage Actually Means | turnitin ai score meaning | I | Med | 3k–8k |
| 32 | What Is a "Good" AI Detection Score? | ai detection score | I | Low-Med | 1k–3k |
| 33 | Falsely Accused of Using AI? What to Do Next | falsely accused of using ai | I | Med | 3k–8k |
| 34 | Does Canvas Detect ChatGPT? | does canvas detect chatgpt | I | Low-Med | 2k–5k |
| 35 | Does Google Docs Detect AI Writing? | does google docs detect ai | I | Low | 1k–3k |
| 36 | Does Grammarly Count as AI? (Teachers' New Dilemma) | does grammarly count as ai | I | Low-Med | 2k–5k |
| 37 | ZeroGPT vs GPTZero: They're Different Tools | zerogpt vs gptzero | I | Low | 1k–3k |
| 38 | Copyleaks AI Detector Review: Accuracy Test | copyleaks review | C | Low-Med | 500–1k |
| 39 | Originality.ai Review: Tested on 50 Articles | originality ai review | C | Low-Med | 500–1k |
| 40 | Winston AI Review | winston ai review | C | Low | 300–800 |
| 41 | Why AI Detectors Flag Non-Native English Speakers | ai detector non native speakers | I | Low | 500–1k |
| 42 | Do AI Detectors Work on Paraphrased Text? | ai detector paraphrased text | I | Low | 500–1k |
| 43 | Can Professors Actually Tell You Used ChatGPT? | can professors tell chatgpt | I | Med | 3k–8k |
| 44 | The Constitution Fails AI Detectors (What That Proves) | constitution ai detector | I | Low | 300–800 |
| 45 | Free vs Paid AI Detectors: Is Accuracy Different? | free ai detector | C | Med | 2k–5k |
| 46 | Does LinkedIn Detect AI-Generated Posts? | linkedin ai detection | I | Low | 300–800 |
| 47 | Do Employers Check Cover Letters for AI? | do employers check for ai | I | Low-Med | 1k–3k |
| 48 | AI Detection in Publishing: What Editors Actually Do | ai detection publishing | I | Low | 200–500 |
| 49 | Amazon KDP and AI Content: The Real Rules | amazon kdp ai content | I | Low-Med | 1k–3k |
| 50 | The History (and Death?) of OpenAI's Own AI Detector | openai ai detector | I | Low | 300–800 |

### Cluster 3 — How-to guides (25) — converts directly into tool usage

| # | Title | Keyword | Intent | Diff. | Est. traffic/mo |
|---|-------|---------|--------|-------|-----------------|
| 51★ | How to Humanize AI Text: The Complete Guide (2026) | how to humanize ai text | I/T | Med | 5k–15k |
| 52★ | How to Make ChatGPT Sound More Human (Prompts + Editing) | make chatgpt sound human | I | Med | 5k–15k |
| 53★ | How to Make AI Text Undetectable — the Honest Version | make ai text undetectable | I/T | High | 10k–30k |
| 54 | How to Humanize AI Text for Free (3 Methods) | humanize ai text free | T | Med | 3k–8k |
| 55 | How to Rewrite AI Content Manually (Editor's Checklist) | rewrite ai content | I | Low-Med | 1k–3k |
| 56 | ChatGPT Prompts That Produce More Human Writing | chatgpt prompts human writing | I | Med | 2k–5k |
| 57 | How to Add Your Voice Back to an AI Draft | ai draft editing | I | Low | 300–800 |
| 58 | How to Humanize AI Text Without Changing the Meaning | humanize without changing meaning | I | Low | 300–800 |
| 59 | How to Fix Robotic-Sounding Emails | email sounds robotic | I | Low | 500–1k |
| 60 | How to Use AI for First Drafts (Without Publishing AI Slop) | ai first draft workflow | I | Low | 500–1k |
| 61 | The 15-Minute Humanizing Pass: A Repeatable Editing Routine | ai editing checklist | I | Low | 300–800 |
| 62 | How to Vary Sentence Length (With Before/After Examples) | how to vary sentence length | I | Low | 1k–3k |
| 63 | How to Remove Em Dashes From AI Text (Fast) | remove em dashes ai | I/T | Low | 1k–3k |
| 64 | How to Humanize AI Text on Your Phone | humanize ai text mobile | T | Low | 200–500 |
| 65 | How to Humanize Long Documents (3,000+ Words) | humanize long text | T | Low | 300–800 |
| 66 | Humanize AI Text in Google Docs: Workflow Guide | humanize ai google docs | I | Low | 300–800 |
| 67 | How to Keep Keywords While Rewriting AI Content | rewrite content keep keywords | I | Low | 300–800 |
| 68 | How to Write Like a Human Again (After a Year of AI) | write like a human | I | Low | 500–1k |
| 69 | Paraphrasing vs Humanizing: Which Do You Need? | paraphrasing vs humanizing | I | Low | 300–800 |
| 70 | How to Humanize AI Translations | humanize ai translation | I | Low | 200–500 |
| 71 | How to Give ChatGPT a Style Guide That Sticks | chatgpt style guide | I | Low-Med | 1k–3k |
| 72 | Fixing AI's "Wikipedia Voice" in Product Copy | ai product copy | I | Low | 200–500 |
| 73 | How to Humanize Technical Writing Without Dumbing It Down | humanize technical writing | I | Low | 200–500 |
| 74 | Editing AI Output: What to Keep, What to Kill | editing ai output | I | Low | 300–800 |
| 75 | The Read-Aloud Test: The Oldest Humanizing Trick | read aloud editing | I | Low | 100–300 |

### Cluster 4 — Comparisons & listicles (25) — bottom-funnel, earns and intercepts brand searches

| # | Title | Keyword | Intent | Diff. | Est. traffic/mo |
|---|-------|---------|--------|-------|-----------------|
| 76★ | Best AI Humanizers in 2026: 12 Tools Tested Honestly (refresh) | best ai humanizer | C | High | 10k–30k |
| 77★ | Best Free AI Humanizers (Actually Free, Tested) (refresh) | best free ai humanizer | C | Med-High | 5k–15k |
| 78 | Undetectable AI Review: Worth $14.99/Month? | undetectable ai review | C | Med | 3k–8k |
| 79 | WriteHuman Review: Hands-On Test | writehuman review | C | Med | 1k–3k |
| 80 | Humbot Review | humbot review | C | Low-Med | 500–1k |
| 81 | StealthWriter Review | stealthwriter review | C | Low-Med | 500–1k |
| 82 | BypassGPT Review | bypassgpt review | C | Low-Med | 500–1k |
| 83 | HIX Bypass Review | hix bypass review | C | Low-Med | 500–1k |
| 84 | Quillbot Humanizer vs Dedicated Humanizers | quillbot humanizer review | C | Med | 1k–3k |
| 85 | Undetectable AI vs WriteHuman: Head-to-Head | undetectable ai vs writehuman | C | Low-Med | 500–1k |
| 86 | Free vs Paid AI Humanizers: When to Upgrade | free vs paid ai humanizer | C | Low | 300–800 |
| 87 | Best AI Humanizer for Students (Budget Ranking) | best ai humanizer for students | C | Med | 2k–5k |
| 88 | Best AI Humanizer for Essays | best ai humanizer essays | C | Med | 1k–3k |
| 89 | Best AI Humanizer APIs for Developers | ai humanizer api | C | Low-Med | 500–1k |
| 90 | Best AI Humanizer Chrome Extensions | ai humanizer chrome extension | C | Low-Med | 500–1k |
| 91 | 7 Undetectable AI Alternatives (Cheaper or Free) | undetectable ai alternatives | C | Med | 1k–3k |
| 92 | ChatGPT Can't Humanize Itself: We Tested It | chatgpt humanize itself | I | Low | 300–800 |
| 93 | AI Humanizer vs Human Editor: Cost & Quality Compared | ai humanizer vs editor | I | Low | 200–500 |
| 94 | AI Humanizer vs Paraphrasing Tool: What's the Difference? | ai humanizer vs paraphraser | I | Low-Med | 500–1k |
| 95 | Grammarly vs AI Humanizers: Different Jobs | grammarly vs ai humanizer | C | Low | 300–800 |
| 96 | The Cheapest Way to Humanize 50k Words a Month | bulk ai humanizing | C | Low | 100–300 |
| 97 | Do "Unlimited" AI Humanizers Really Exist? | unlimited ai humanizer | C | Low | 300–800 |
| 98 | AI Humanizer Pricing Compared: 10 Tools (refresh) | ai humanizer pricing | C | Low-Med | 500–1k |
| 99 | Walter Writes / Phrasly / Twixify: The Newcomers Reviewed | (brand queries) | C | Low | 300–800 |
| 100 | Why We Don't Promise "100% Human Score" (And Who Does) | 100 human score | I | Low | 200–500 |

### Cluster 5 — Students & academic integrity (25) — huge volume, handle with your existing honest framing

| # | Title | Keyword | Intent | Diff. | Est. traffic/mo |
|---|-------|---------|--------|-------|-----------------|
| 101★ | Is Using ChatGPT Cheating? A Straight Answer for Students | is using chatgpt cheating | I | Med | 5k–15k |
| 102★ | How to Use AI for Homework Without Breaking the Rules | ai for homework | I | Med | 3k–8k |
| 103 | University AI Policies in 2026: What's Actually Allowed (refresh) | university ai policy | I | Low-Med | 1k–3k |
| 104 | How to Cite ChatGPT (APA, MLA, Chicago) | how to cite chatgpt | I | Med | 5k–15k |
| 105 | Can You Use ChatGPT for College Essays? | chatgpt college essay | I | Med | 3k–8k |
| 106 | What Happens If Turnitin Flags Your Paper | turnitin flagged my paper | I | Med | 2k–5k |
| 107 | How to Prove You Didn't Use AI | how to prove you didn't use ai | I | Med | 2k–5k |
| 108 | Google Docs Version History: Your Best AI Defense | google docs version history proof | I | Low | 500–1k |
| 109 | Is It Cheating to Use Grammarly? Where Schools Draw Lines | is grammarly cheating | I | Low-Med | 2k–5k |
| 110 | AI Disclosure Statements: Templates for Students | ai disclosure statement | I | Low | 500–1k |
| 111 | How Professors Detect AI (Beyond Detectors) | how professors detect ai | I | Low-Med | 1k–3k |
| 112 | Using AI to Study vs Using AI to Submit | ai study tools ethics | I | Low | 300–800 |
| 113 | The Non-Native Speaker's Guide to AI Accusations | non native speaker ai accusation | I | Low | 300–800 |
| 114 | Should You Admit to Using ChatGPT? | admit using chatgpt | I | Low | 500–1k |
| 115 | How to Write a Personal Statement AI Can't Write | personal statement ai | I | Low-Med | 1k–3k |
| 116 | Scholarship Essays and AI: Rules by Major Providers | scholarship essay ai rules | I | Low | 300–800 |
| 117 | ChatGPT for Research: What It Gets Wrong | chatgpt for research | I | Med | 2k–5k |
| 118 | How to Paraphrase Without Plagiarizing | how to paraphrase without plagiarizing | I | Med | 5k–15k |
| 119 | Plagiarism vs AI Detection: Two Different Checks | plagiarism vs ai detection | I | Low | 500–1k |
| 120 | The Ethics of AI Humanizers: Our Actual Position | ai humanizer ethical | I | Low | 300–800 |
| 121 | AI in Grad School: Thesis and Dissertation Rules | ai thesis rules | I | Low | 300–800 |
| 122 | High School vs College AI Rules: What Changes | high school ai policy | I | Low | 300–800 |
| 123 | Teachers: How to Design AI-Resistant Assignments | ai resistant assignments | I | Low-Med | 1k–3k |
| 124 | Teachers: A Fair Process for Suspected AI Use | suspected ai use process | I | Low | 300–800 |
| 125 | The Student AI Toolkit: What's Safe, What's Risky | student ai tools | I | Low-Med | 500–1k |

### Cluster 6 — SEO & AI content (25) — reaches your marketer/agency buyer persona

| # | Title | Keyword | Intent | Diff. | Est. traffic/mo |
|---|-------|---------|--------|-------|-----------------|
| 126★ | Does Google Penalize AI Content? (2026 Evidence) (refresh) | does google penalize ai content | I | Med-High | 10k–30k |
| 127★ | AI Content and SEO: What Actually Ranks Now | ai content seo | I | Med | 5k–15k |
| 128 | Google's Helpful Content System, Explained for AI Users | helpful content update ai | I | Med | 2k–5k |
| 129 | How to Use AI for SEO Content the Right Way | ai for seo content | I | Med | 3k–8k |
| 130 | AI Content Detection by Google: Myth vs Reality | google detect ai content | I | Med | 3k–8k |
| 131 | Scaled Content Abuse: What Google's Policy Really Bans | scaled content abuse | I | Low-Med | 1k–3k |
| 132 | Should You Humanize AI Content Before Publishing? (Data) | humanize before publishing | I | Low | 500–1k |
| 133 | E-E-A-T and AI Content: Adding Experience Signals | eeat ai content | I | Med | 1k–3k |
| 134 | Programmatic SEO with AI: Quality Bar That Survives Updates | programmatic seo ai | I | Med | 1k–3k |
| 135 | AI Content Workflows for Agencies (Template Included) | ai content workflow | I | Low-Med | 500–1k |
| 136 | How to Audit Old AI Content After a Core Update | ai content audit | I | Low | 300–800 |
| 137 | Time on Page and AI Text: An Engagement Study | engagement ai content | I | Low | 200–500 |
| 138 | AI Product Descriptions That Don't Kill Conversions | ai product descriptions | I | Med | 2k–5k |
| 139 | Should Your Blog Disclose AI Use? | ai disclosure blog | I | Low | 300–800 |
| 140 | GEO: Ranking in ChatGPT, Perplexity & AI Overviews | generative engine optimization | I | Med | 3k–8k |
| 141 | How AI Overviews Changed Click-Through (What to Do) | ai overviews ctr | I | Med | 2k–5k |
| 142 | llms.txt: What It Is and Whether You Need One | llms.txt | I | Low-Med | 1k–3k |
| 143 | Getting Cited by ChatGPT: What We've Learned | get cited by chatgpt | I | Low-Med | 500–1k |
| 144 | AI Content at Scale: Case Study of 100 Pages | ai content case study | I | Low | 200–500 |
| 145 | Keyword Preservation When Rewriting Content | rewrite content seo | I | Low | 300–800 |
| 146 | Content Refreshes with AI: A Safe Workflow | content refresh ai | I | Low | 300–800 |
| 147 | Duplicate Content Risk in AI Writing | ai duplicate content | I | Low | 300–800 |
| 148 | Anchor Text & Internal Linking for Programmatic Pages | internal linking programmatic | I | Low | 200–500 |
| 149 | Why "AI Detection Proof" Content Farms Keep Dying | ai content farm | I | Low | 200–500 |
| 150 | The Future of SEO Writing Jobs in the AI Era | seo writing jobs ai | I | Low-Med | 1k–3k |

### Cluster 7 — Statistics & original research (15) — pure link-bait; journalists cite these (see Part 10)

| # | Title | Keyword | Intent | Diff. | Est. traffic/mo |
|---|-------|---------|--------|-------|-----------------|
| 151★ | AI Writing Statistics 2026: Adoption, Detection, Trust (refresh) | ai writing statistics | I | Med | 3k–8k |
| 152★ | AI Detector Accuracy Study: 6 Tools × 500 Samples (original) | ai detector accuracy study | I | Med | 2k–5k |
| 153 | What % of Web Content Is AI-Generated? (refresh) | percentage of content ai generated | I | Med | 2k–5k |
| 154 | ChatGPT Usage Statistics Among Students (refresh) | chatgpt student statistics | I | Med | 2k–5k |
| 155 | AI Plagiarism Statistics in Higher Ed (refresh) | ai plagiarism statistics | I | Low-Med | 1k–3k |
| 156 | The Most Common AI Words: Frequency Analysis (original data from your pipeline) | most common ai words | I | Low | 1k–3k |
| 157 | Em Dash Usage Before and After ChatGPT (original) | em dash chatgpt data | I | Low | 500–1k |
| 158 | False Positive Rates by Detector (original) | ai detector false positive rate | I | Low-Med | 1k–3k |
| 159 | How Many Job Applications Are AI-Written? (refresh) | ai job applications statistics | I | Low-Med | 500–1k |
| 160 | AI Content Marketing Statistics (refresh) | ai content marketing statistics | I | Med | 1k–3k |
| 161 | Do Readers Trust AI Content? Survey Data (refresh) | readers trust ai content | I | Low | 500–1k |
| 162 | Average Sentence Length: Human vs AI (your Stage-1 data, original) | average sentence length ai | I | Low | 300–800 |
| 163 | The Cost of AI Detection False Accusations (case compilation) | ai false accusation cases | I | Low | 300–800 |
| 164 | AI Writing Tool Market Size & Growth (refresh) | ai writing market size | I | Low-Med | 500–1k |
| 165 | Which Professions Use AI Writing Most? (refresh) | professions using ai | I | Low | 300–800 |

### Cluster 8 — Professional & business writing (25) — feeds Family B/C landing pages

| # | Title | Keyword | Intent | Diff. | Est. traffic/mo |
|---|-------|---------|--------|-------|-----------------|
| 166★ | AI Cover Letters: Do Recruiters Notice? (With Fixes) | ai cover letter recruiters | I | Low-Med | 1k–3k |
| 167★ | How to Make an AI-Written Resume Sound Like You | ai resume humanize | I | Low-Med | 1k–3k |
| 168 | ChatGPT LinkedIn Posts: Why They All Look Identical | chatgpt linkedin posts | I | Low-Med | 1k–3k |
| 169 | AI Email Etiquette: When Automation Shows | ai email etiquette | I | Low | 500–1k |
| 170 | Writing Cold Emails with AI That Get Replies | ai cold email | I | Med | 2k–5k |
| 171 | AI for Proposals: Win Rate Do's and Don'ts | ai proposals | I | Low | 300–800 |
| 172 | Customer Support Replies: Warmth at Scale with AI | ai customer support replies | I | Low | 300–800 |
| 173 | AI Newsletters That Don't Feel Automated | ai newsletter writing | I | Low | 300–800 |
| 174 | Real Estate Listings: Fixing AI Sameness | ai real estate listings | I | Low | 300–800 |
| 175 | AI Press Releases: What Journalists Delete on Sight | ai press release | I | Low | 200–500 |
| 176 | Law Firm Content and AI: Compliance + Voice | ai legal writing | I | Low | 200–500 |
| 177 | Healthcare Content and AI: Trust Requirements | ai healthcare content | I | Low | 200–500 |
| 178 | AI Case Studies That Sound Credible | ai case study writing | I | Low | 200–500 |
| 179 | Fixing AI Voice in UX Microcopy | ai ux writing | I | Low | 100–300 |
| 180 | The Agency Playbook: AI Drafting + Human Voice at Scale | agency ai content playbook | I | Low | 300–800 |
| 181 | Ghostwriting with AI: Keeping the Client's Voice | ai ghostwriting | I | Low-Med | 500–1k |
| 182 | AI Bios That Don't Say "Passionate Professional" | ai bio writing | I | Low | 300–800 |
| 183 | Slide Decks & Speeches: Humanizing AI Talking Points | ai speech writing | I | Low | 300–800 |
| 184 | AI Job Descriptions That Attract Instead of Repel | ai job descriptions | I | Low-Med | 500–1k |
| 185 | Performance Reviews with AI: The Line Between Help and Harm | ai performance reviews | I | Low | 300–800 |
| 186 | Fundraising & Grant Writing with AI Assistance | ai grant writing | I | Low-Med | 500–1k |
| 187 | AI White Papers: Authority Without the Robot Voice | ai white paper | I | Low | 100–300 |
| 188 | Etsy/Amazon Seller Copy: Standing Out When Everyone Uses AI | ai ecommerce copy | I | Low | 300–800 |
| 189 | YouTube Scripts: Why AI Pacing Fails on Camera | ai youtube script | I | Low-Med | 500–1k |
| 190 | Podcast Show Notes with AI: A Fast Humanizing Pass | ai podcast show notes | I | Low | 100–300 |

### Cluster 9 — Writing craft evergreen (10) — pure authority + internal-link glue

| # | Title | Keyword | Intent | Diff. | Est. traffic/mo |
|---|-------|---------|--------|-------|-----------------|
| 191 | What Makes Writing Sound Human? The Craft Fundamentals | what makes writing sound human | I | Low | 500–1k |
| 192 | Voice in Writing: What It Is and How to Find Yours | voice in writing | I | Med | 2k–5k |
| 193 | Show, Don't Tell — in the Age of AI Drafts | show don't tell | I | Med | 3k–8k |
| 194 | Concrete vs Abstract Language (Why Specificity Wins) | concrete language writing | I | Low | 500–1k |
| 195 | Flesch-Kincaid Explained: Reading Level for Web Writing | flesch kincaid | I | Med | 3k–8k |
| 196 | The Case for Short Sentences | short sentences writing | I | Low | 500–1k |
| 197 | How Great Editors Edit: A Process You Can Steal | how editors edit | I | Low | 300–800 |
| 198 | Writing Rhythm: The Musicality of Good Prose | writing rhythm | I | Low | 300–800 |
| 199 | Plain Language Principles (Government-Grade Clarity) | plain language writing | I | Low-Med | 1k–3k |
| 200 | Why Reading Your Writing Aloud Still Beats Every Tool | read writing aloud | I | Low | 200–500 |

**Cluster math at maturity (18–24 months, directional):** if 60% of posts reach page 1 for their primary term at conservative CTRs, the blog alone contributes **40k–70k visits/mo**; landing pages (Part 2) contribute **30k–50k**; the free tools family compounds on top. That's the realistic path to 100k.

---

## Part 4 — Feature Audit

Scores 1–5 (5 = best). Effort assumes one developer familiar with this codebase.

| Feature | Effort | SEO value | User value | Monetization | Verdict |
|---|---|---|---|---|---|
| **Tone/style selector** (casual, professional, academic…) | 1–2 days | 3 | **5** | 4 (styles behind Pro tier later) | **Build first.** Marketing already promises it (`app/page.jsx` FAQ). Implementation: a style param in `HumanizerForm` → `POST /api/humanize` → appended tone rule in `buildStage2Prompt` (`lib/prompts.js`). |
| **Output AI-score loop** (auto-run `lib/aiScore.js` on the humanized output, show before/after score) | 1 day | 3 | **5** | 3 | **Build second.** The code already exists client-side; this is the "proof it worked" moment no cheap competitor shows honestly. Renders in `HumanizedOutput.jsx`. |
| **Re-run / variations button** ("Get another version") | 0.5 day | 1 | 4 | 3 (variations quota) | FAQ already claims re-running works; make it one click instead of re-submitting. |
| **Server-backed AI Detector v2** (keep the transparent heuristic + add an LLM judge) | 3–5 days | **5** | 4 | 4 | "AI detector" queries dwarf "AI humanizer" queries. Your transparent-signals angle is a real differentiator vs black boxes. |
| **Paragraph rewriter** (standalone page, same pipeline, paragraph-level) | 1–2 days | **5** | 3 | 3 | Huge standalone query class; mostly a new prompt + page. |
| **Sentence rewriter** | 1–2 days | 4 | 3 | 3 | Same pattern, smaller queries. |
| **Summarizer** | 2–3 days | 4 | 3 | 3 | High volume, high competition; do after rewriters. |
| **Grammar checker** | 1–2 weeks | 4 | 3 | 2 | Massive queries but Grammarly/QuillBot own them; only worth it as a free client-side lite tool. |
| **Readability scorer** (Flesch-Kincaid etc.) | 1–2 days | 3 | 3 | 1 | Trivially extends `lib/aiScore.js` stats; good link magnet. |
| **Chrome extension** (humanize selection in any textbox) | 1–2 weeks | 3 | 4 | **5** | Distribution channel + Chrome Web Store SEO; requires accounts/quota first. |
| **API for developers** (`/api/v1/humanize` with keys) | 1 week (after auth) | 2 | 3 | **5** | Competitors charge $0.5–2/1k words for this. Needs billing. |
| **Word/character counter tools** | 0.5 day each | 4 (volume) | 2 | 1 | Pure SEO surface; only worth it because they're nearly free to build. |
| **Plagiarism checker** | weeks + licensing | 3 | 3 | 3 | Requires third-party index (Copyleaks API etc.) — defer. |
| **Citation generator** | 1 week | 3 | 2 | 1 | Off-brand; crowded (Scribbr, MyBib). Skip unless chasing student cluster hard. |
| **AI writing assistant / SEO optimizer suites** | months | 2 | 2 | 3 | Scope creep; you win by being the best at one thing first. Skip for now. |

**Recommended build order:** style selector → output score loop → re-run button → em-dash remover + cliché finder (from Part 2G) → detector v2 → paragraph/sentence rewriter → accounts+quota → pricing → API/extension.

---

## Part 5 — User Experience Review

**What's already good:** the tool is above the fold on every landing page; sample-text button (`HumanizerForm.jsx`) removes the "I have nothing to paste" blocker; Ctrl+Enter submit; side-by-side layout with sticky output (`HumanizerTool.jsx`); honest error copy; dark mode; layout-stable loading skeletons; detector→humanizer handoff via `sessionStorage` prefill (`HumanizerForm.jsx:35–43`).

Friction list, ordered by conversion impact:

1. **The wait is silent.** Three sequential Gemini calls (`lib/gemini.js:117–119`) mean 10–30s in `LoadingState` with no progress signal. Users assume it's hung and leave. Fix: stage-by-stage progress ("Analyzing patterns… Rewriting… Final polish…") emitted via streaming/SSE, or at minimum an animated 3-step indicator timed to typical stage durations. This is the single biggest UX lever.
2. **No output score = no "aha" moment.** The user can't see that the text improved. Show the `lib/aiScore.js` before/after delta next to the output (pairs with Part 4 item 2).
3. **Promised controls are missing.** FAQ says styles exist; the form has none. Either ship the selector or cut the claim (Part 1.4).
4. **No re-run affordance.** After output, the only actions are Copy/Clear (`HumanizedOutput.jsx`). Add "↻ Try another version" and "Check score".
5. **Mobile nav gaps.** `SiteHeader.jsx` hides About on mobile and has no menu for model pages at any width; the "3-Stage Pipeline" badge takes prime header space but means nothing to a first-time visitor — replace with a "Humanize free →" anchor CTA on subpages.
6. **Accessibility.** Textareas have no programmatic label (`aria-label="Paste AI-generated text"` on `HumanizerForm.jsx` / `AiDetectorTool.jsx`); decorative SVGs lack `aria-hidden="true"`; `text-slate-400` on white is ~3.5:1 contrast (below AA for small text); no `aria-live` region announcing when output arrives — screen-reader users get silence after clicking Humanize.
7. **No word-limit clarity.** The form enforces 50–20,000 chars but marketing copy talks about "word limits". Pick one unit and show it consistently.
8. **No fetch timeout/abort.** `HumanizerForm.jsx` `fetch` has no `AbortController`; a hung request spins forever. Add a 90s timeout with a friendly retry message.

---

## Part 6 — Performance Audit

**Already strong:** all marketing pages are SSG (build output confirms); no web fonts (system stack); no images to optimize; `content-visibility: auto` on the 5k-word homepage article; tool code-split via `next/dynamic`; `poweredByHeader: false` + cache headers for sitemap/robots in `next.config.js`.

Findings:

1. **API latency dominates everything** (P0 for perceived perf). Three serial LLM round-trips ≈ 10–30s. Options, in order of leverage:
   - **Merge Stage 2.5 + Stage 3** into one prompt (`lib/prompts.js`) — the self-critique checklist and the polish pass overlap heavily (both hunt em-dashes, transitions, long sentences). One fewer round-trip ≈ 30–40% latency cut for near-zero quality cost. Test on 20 samples before/after with `lib/aiScore.js` as the judge.
   - **Stream the final stage** to the client (SSE) so first tokens appear in ~2–4s.
   - Set `thinkingConfig`/output limits appropriately for `gemini-3.1-flash-lite` and consider the non-lite flash for Stage 2 only if quality demands it.
2. **Retry logic is dead code.** `MAX_RETRIES = 0` in `lib/gemini.js:16` means the 429/503 backoff never runs. Either set it to 1–2 (with the free-tier 60s window in mind) or delete the branch.
3. **Duplicate analytics.** `app/layout.jsx` loads GA4 (gtag), Vercel Analytics, *and* Speed Insights — three beacons. Keep GA4 + one Vercel product, or gate Speed Insights to preview deployments.
4. **Edge runtime on the OG image** (`app/opengraph-image.jsx:3`) triggers the build warning "edge runtime… disables static generation". Delete `export const runtime = 'edge'`; the image then pre-renders once at build.
5. **Bundle**: fine today (no heavy deps in `package.json`). Watch out when adding a blog: prefer MDX compiled at build, not a client markdown renderer.
6. **Caching**: `/api/humanize` responses are user-specific (correctly uncached). Add `Cache-Control: public, max-age=3600, stale-while-revalidate=86400` for `/llms.txt` in `next.config.js` alongside the existing sitemap/robots entries.
7. **No abuse control = a performance issue too**: one hostile script exhausts the Gemini free-tier quota and every real user gets 429s (`route.js` surfaces them as "rate-limited, try again"). See Part 13 🔥#4.

---

## Part 7 — Conversion Rate Optimization

Current funnel reality: **there is only one step** (visitor → tool use). No email capture, no accounts, no pricing — so "User → Registered → Paid" cannot be optimized until those exist. Sequence:

**Stage 1 (now) — Visitor → Activated user**
- Progress indicator + output score (Part 5 #1–2) — activation is "saw a convincingly better output," so make the improvement visible.
- Add a lightweight social-proof strip under the hero (`app/page.jsx`): real cumulative counter ("X texts humanized this week" from a simple KV counter), not invented testimonials. The current copy *"Thousands of writers… already use this"* (`app/page.jsx:991`) is an unverifiable claim — replace with the real number once tracked.
- Replace the gmail address on `/contact` with `hello@simplyhumanize.com` (Google Workspace or a forwarder) — a `@gmail.com` support address undercuts every trust signal on the page (`app/(pages)/contact/page.jsx:39`).

**Stage 2 (weeks 2–6) — Activated → Known (email)**
- Gate nothing core; capture email for *extras*: "Email me my result + the humanizing checklist" checkbox on the output card; exit-intent offer of the "50 AI clichés" PDF (from blog post #15); newsletter box on blog posts. Target: 2–4% of activated users.
- Add a `/newsletter` page and a weekly "AI writing patterns" digest — this list later launches the paid tier.

**Stage 3 (months 2–4) — Known → Registered → Paid**
- Accounts (NextAuth or Clerk) with a **daily free quota** (e.g., 3 humanizations or 1,500 words/day — competitors' free tiers are one-time 250–300 words, so a *recurring* free quota is both generous and rate-limits abuse).
- Pricing page (`/pricing`) even before billing works ("Pro coming soon — join the waitlist" converts intent into the email list). Anchor: competitors charge **$9.99–$14.99/mo entry** (Humbot $9.99/50k words, Undetectable $14.99/10k, WriteHuman $12/48k). A **$8–10/mo** launch price with monthly word quota + styles + priority speed undercuts all of them.
- Paid triggers: quota-reached modal with the day's before/after scores ("You improved 4 texts today — Pro removes the limit"), long-text truncation upsell (>20k chars), style selector's premium styles.
- FAQs and `llms.txt` then become *true* — the paid plans they describe will exist.

**Landing-page section additions (in `app/page.jsx` order):** hero → tool → **social-proof strip** → **before/after example with scores** (static, curated) → how it works → **pricing teaser** → use cases → comparison table → FAQ → final CTA. The two bolded sections are missing today.

---

## Part 8 — Competitor Analysis

Snapshot from July 2026 market research (sources at the end of this document; verify pricing before citing publicly — it changes quarterly).

| Competitor | Entry price | Free tier | Notable features you lack | Notable weakness you can exploit |
|---|---|---|---|---|
| **Undetectable AI** | $14.99/mo (10k words) | one-time ~250 words | Full suite (detector, essay writer, SEO writer, job-app bot), aggressive affiliate program | Priciest entry; "bypass" branding repels educators/press; strongest mode paywalled |
| **WriteHuman** | $12/mo (80 req × 600 words) | few short requests | Built-in multi-detector check (GPTZero/ZeroGPT/Copyleaks), voice preservation reputation | Hard request caps; little educational content |
| **Humbot** | $9.99/mo (50k words) | trial | 50+ languages, multiple output variations, readability grade, big content hub (`humbot.ai/hub`) | Quality reviews mixed at low tier; hub content is thin listicles |
| **StealthWriter** | ~$20/mo | limited daily | Multiple "engines" (Ninja/Ghost), inline alternative suggestions per sentence | Detector-bypass positioning; UI complexity |
| **BypassGPT** | ~$12/mo | 80–150 words | Huge programmatic `/alternatives/` + `/vs/` page network | Pure bypass branding; thin pages vulnerable to updates |
| **HIX Bypass** | bundled with HIX.AI | ~20 credits/300 words | Rides a large multi-tool platform + content machine | Humanizer is a side product; generic voice |
| **Humanize AI (humanizeai.io/.pro)** | varies | limited | Exact-match domains, "unlimited free" claims | Quality complaints; unsustainable free promises they walk back |
| **QuillBot Humanizer** | free w/ QuillBot Premium upsell | generous | Massive domain authority, brand trust, suite integration | Humanizer is shallow (paraphraser re-skin); can't specialize |

**Strategic positioning that wins:** every major competitor leads with *"bypass AI detectors, guaranteed 100% human score."* You already refuse to make that claim (`app/page.jsx` FAQ #7, `lib/aiModels.js` FAQs) — lean into it as **the honest humanizer**: transparent detector, published methodology, no bypass guarantees, education-first content. That positioning (a) earns links from teachers, journalists, and universities that bypass tools can never get, (b) survives the inevitable regulatory/press backlash against bypass marketing, and (c) matches Google's helpful-content incentives. You will lose some "bypass turnitin" traffic — that traffic converts poorly and churns instantly anyway.

**Feature-gap priorities from this table:** multi-variation output (Humbot has it — your re-run button covers 80% of it), readability grade on output (trivial — `lib/aiScore.js` extension), multi-detector orientation (frame as "here's what each signal means", not "guaranteed pass"), languages (Family D, later).

---

## Part 9 — AI Search Optimization (ChatGPT, Perplexity, Gemini, Claude)

Already ahead of the market: static HTML (AI crawlers mostly don't run JS), `llms.txt` (now including the tools), FAQ schema everywhere, honest factual copy that models can safely quote, and (as of this session) explicit crawler allowances in `app/robots.js`.

To do:

1. **Citable numbers.** AI answers quote *specific figures with sources*. Cluster 7 (statistics posts) exists mostly for this: pages like "AI detector false-positive rates: study of 500 samples" get cited by ChatGPT/Perplexity answers about detector reliability, and each citation is brand exposure. Publish methodology + raw data tables (models prefer citing pages with tables).
2. **Question-shaped H2/H3s.** The use-case/model page sections (`lib/useCases.js`, `lib/aiModels.js`) use statement headings ("The Elaboration Pattern in Claude Output"). Add question variants where natural ("Why does Claude over-explain?") — generative engines match question intent literally.
3. **Entity consolidation.** Create the real social profiles, add `sameAs` to the Organization schema, keep name usage consistent ("Simply Humanize", never "SimplyHumanize"), and add a `Person` author entity once the blog launches. Gemini/Claude ground brand claims in entity graphs.
4. **`llms-full.txt` (optional).** A longer companion file with the full FAQ text inline — cheap to generate from the same data files at build time.
5. **Per-page speakable summaries.** Add a 40–60 word "TL;DR" box at the top of each blog post — models lift these nearly verbatim, with attribution.
6. **Monitor AI referrals.** GA4 (`app/layout.jsx` gtag) referral reports for `chat.openai.com`, `perplexity.ai`, `gemini.google.com` — measure whether the above works.

---

## Part 10 — Backlink Strategy (free/low-cost first)

1. **The transparent detector is your best link asset.** Black-box detectors get criticized; yours shows its six signals (`/tools/ai-content-detector`). Pitch it to: teacher-resource roundups, journalism-tool lists, university writing-center resource pages (they link to *honest* tools, never bypass tools — your positioning is the unlock). Template outreach: "free, private, runs in-browser, explains its reasoning, never accuses."
2. **Open-source the scoring engine.** Publish `lib/aiScore.js` as a small MIT GitHub repo + npm package (`ai-pattern-score`). GitHub → dev blog links, npm page link, "awesome" list inclusions. The repo README links back to the live tool.
3. **Original statistics pages** (Cluster 7). "AI writing statistics 2026" and detector-accuracy studies are what journalists cite when writing about AI in education. Two well-researched stat pages typically out-earn 50 guest posts.
4. **Free micro-tools** (Family G). Em-dash remover and ChatGPT-word checker are meme-adjacent (the em-dash discourse is permanent on X/LinkedIn) — shareable, embeddable, linkable.
5. **Directories & listings** (one afternoon, all free): Product Hunt launch, AlternativeTo, Futurepedia + major AI tool directories, There's An AI For That, SaaSHub, Uneed, G2/Capterra profiles. Expect nofollow-heavy but real referral traffic + brand queries.
6. **HARO/Connectively + journalist requests** on AI-in-education stories — respond as "founder of an AI humanizer that refuses to promise detector bypass" (a quotable stance).
7. **Guest posts** only where the audience matches (writing/SEO/edtech blogs); pitch data from #3, not generic tips.
8. **Comparison-page reciprocity.** Reviewers writing "best AI humanizer" listicles (Medium's Freelancer's Hub, kripeshadwani.com, 310creative.com — see sources) accept tool submissions; a free-forever tier with no sign-up is exactly what listicle authors love to include.

---

## Part 11 — Programmatic SEO Plan

You already run two safe programmatic systems (models, use cases). Scale rules:

**Architecture:** one data module per family (`lib/documentTypes.js`, `lib/detectors.js`, `lib/languages.js`, `lib/alternatives.js`) + one template route each, exactly mirroring `app/(pages)/ai-humanizer-for/[useCase]/page.jsx` (with `generateStaticParams`, per-entry `lastUpdated`, canonical, FAQ schema). Add each family to `app/sitemap.js` and `scripts/indexnow.mjs` the way `useCases`/`aiModels` are imported today, and a hub page per family (like `/use-cases`) linked from the footer.

**The quality bar that keeps this out of "scaled content abuse" territory:**
- ≥800 words of *family-specific* analysis per page — the existing model pages are the gold standard: they name real, verifiable stylistic tells per model. A page that could be generated by find-and-replace on a sibling page is below the bar; don't ship it.
- Unique FAQs per page (5+), unique meta title/description, distinct H2 set.
- Embedded working tool on every page (you do this already — it's the anti-thin-content insurance: the page *does* something).
- Ship 5–10/week and watch Search Console impressions per batch; pause if a batch doesn't get impressions within 3–4 weeks.
- Interlink: each page links its hub, 3 siblings (the template already does this), and 1–2 relevant blog posts; blog posts link back.

**Do not build:** city/geo pages ("AI humanizer in Texas"), auto-translated pages without native review, or combinatorial cross-products ("humanize ChatGPT essays for nurses") — pure cannibalization + thin-content risk.

**Ceiling estimate:** Families A–G ≈ 110 pages; blog ≈ 200; total ≈ 330 URLs. That's the right order of magnitude for this niche — BypassGPT-style thousands-of-pages networks are exactly what recent core updates keep demoting.

---

## Part 12 — Code Quality Review

**Architecture (good):** clean separation of data (`lib/*.js`) / templates (`components/*Template*`) / routes; deterministic Stage 1 preprocessing before LLM calls is a genuinely smart cost/quality design; JSDoc typing with `jsconfig.json` gives partial type safety; prompts are versioned in code, not scattered strings.

Issues, ordered:

1. **Not a git repository.** The working directory has no `.git`. This is the highest-risk item in the whole document — one bad save loses work, and none of the roadmap is reviewable. `git init`, commit, push to a private GitHub repo today. (Also unlocks CI and Vercel preview deployments.)
2. **Unprotected API** (`app/api/humanize/route.js`). No rate limit, no origin check, no bot friction. Minimum viable: per-IP sliding-window limit (Upstash Ratelimit or Vercel KV, ~30 lines) + optional Cloudflare Turnstile on the form. This protects the Gemini quota that keeps your #1 acquisition asset alive.
3. **Error handling classifies by message string** (`route.js:68`: `message.includes("429")`) even though `lib/gemini.js:93` already attaches `httpStatus` to the thrown error. Use `err.httpStatus === 429`. Also: delete the debug `console.log('error', err)` at `route.js:64`, and don't send *"Add GEMINI_API_KEY to .env.local"* to end users (`route.js:85`) — log it server-side, return a generic 503.
4. **Dead retry config**: `MAX_RETRIES = 0` (`lib/gemini.js:16`). Decide: enable (1–2 retries) or remove the branch.
5. **Duplication to consolidate** (drift risk):
   - `AI_CLICHES`/hedging/transition regexes exist twice (`lib/stage1Processor.js`, `lib/aiScore.js` — the latter's header comment admits it's mirrored). Extract `lib/textSignals.js` (pure, client-safe) and import from both.
   - `SAMPLE_TEXTS[0]` duplicated in `HumanizerForm.jsx` and `AiDetectorTool.jsx` → `lib/sampleTexts.js`.
   - The `dynamic(() => import("@/components/HumanizerTool"), { loading: … })` block with hardcoded skeleton heights appears in 3 files (`app/page.jsx`, `[useCase]/page.jsx`, `ModelPageTemplate.jsx`) → export a single `HumanizerToolLazy`.
   - `const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || …` is re-declared in ~10 files with inconsistent trailing-slash handling → `lib/siteConfig.js` with one normalized export.
6. **No tests.** Highest-value first targets: `Stage1Preprocessor.process()` (pure, deterministic — snapshot tests on the sample texts), `scoreText()` (fixture texts with expected score bands), and the `/api/humanize` validation branches. Vitest fits this stack in an afternoon.
7. **Client fetch robustness**: add `AbortController` timeout in `HumanizerForm.jsx`; guard `response.json()` for non-JSON 5xx bodies (currently throws into the generic catch, which mislabels server errors as "Network error").
8. **TypeScript**: the JSDoc discipline is decent; a gradual TS migration (rename `lib/` files first, `checkJs` already close) pays off when accounts/billing arrive. P2, not urgent.
9. **Logging/observability**: `console.*` only. Before launch of paid plans, add structured logs on the API route (duration per stage, input size, status) — you cannot tune the pipeline you can't measure. Vercel's log drains or a simple Axiom/Logtail integration suffices.

---

## Part 13 — Priority Roadmap

### 🔥 High impact — do immediately (weeks 1–2)

| # | Action | Difficulty | SEO impact | Traffic impact | Conversion impact |
|---|--------|-----------|------------|----------------|-------------------|
| 1 | `git init` + GitHub + Vercel previews | Trivial | — | — | — (risk removal) |
| 2 | Resolve the honesty gap: ship the **style selector** (1–2 days) and fix remaining untrue FAQ/llms.txt claims | Low | Medium (helpful-content risk removed) | — | **High** |
| 3 | Deploy the fixes from this session; verify sitemap/robots/schema in production; run `npm run indexnow` (expect 200) and confirm in Bing Webmaster Tools | Trivial | Medium (Bing/AI-search indexing unblocked) | +Bing/Copilot discovery | — |
| 4 | Rate-limit `/api/humanize` (Upstash/KV) + fix error handling (P12 #2–3) | Low | Indirect (uptime) | — | Protects activation |
| 5 | Header nav links to model pages; replace "3-Stage Pipeline" badge with CTA | Trivial | Medium | +internal-link equity | Low-Med |
| 6 | Output before/after AI score + progress stages + re-run button (Parts 4–5) | Medium | Low | — | **High** (activation) |
| 7 | Launch blog scaffold + first 4 posts (#1, #2, #26, #51) | Medium | **High** | Compounds from month 2 | Medium |

### ⚡ Medium impact — next 30–90 days

| # | Action | Difficulty | SEO impact | Traffic impact | Conversion impact |
|---|--------|-----------|------------|----------------|-------------------|
| 8 | Family A: +17 model pages (data-file entries only) | Low | High | +5k–15k/mo by month 4–6 | Medium |
| 9 | Family B: document-type route + first 10 pages (essay, cover letter, email, resume…) | Medium | **High** | +10k–25k/mo by month 6 | Medium |
| 10 | Free tools: em-dash remover, cliché finder, readability checker (reuse `lib/aiScore.js`) | Low-Med | High | +3k–10k/mo + backlinks | Low |
| 11 | Blog cadence 2–3/week through clusters 1–3 & 5 | Medium (writing) | **High** | The main engine to 100k | Medium |
| 12 | Email capture (result-by-email, cliché-list PDF, newsletter) | Low | — | — | **High** (builds launch list) |
| 13 | Real social profiles + `sameAs` + fix/claim Twitter handle | Trivial | Medium (entity) | — | Low |
| 14 | Merge pipeline stages 2.5+3, add streaming (Part 6 #1) | Medium | Low | — | **High** (perceived speed) |
| 15 | Product screenshots + per-family OG images + homepage before/after section | Low | Medium (image SEO) | +image/Discover | Medium |
| 16 | Detector v2 + detector-education pages (Family E) | Medium | High | +5k–15k/mo | Medium |
| 17 | Directory submissions + Product Hunt launch + open-source `ai-pattern-score` | Low | Medium (links) | Referral spikes | Low |

### 💡 Nice to have — months 3–9

| # | Action | Difficulty | SEO impact | Traffic impact | Conversion impact |
|---|--------|-----------|------------|----------------|-------------------|
| 18 | Accounts + daily free quota + `/pricing` + billing ($8–10/mo Pro) | High | Low | — | **Creates revenue** |
| 19 | Families C & F (professions, alternatives/vs pages) | Medium | Medium-High | +5k–15k/mo | Medium (F is bottom-funnel) |
| 20 | Original-research stats pages (Cluster 7) + HARO pitching | Medium | High (links) | Citation/AI-search traffic | Low |
| 21 | Family D languages + localized prompts + hreflang | High | High long-term | +10k–30k/mo eventually | Medium |
| 22 | Chrome extension + public API | High | Medium | New channels | High (Pro driver) |
| 23 | Vitest suite, TS migration, structured logging | Medium | — | — | — (velocity/safety) |
| 24 | Word/character counter high-volume tools | Low | Medium | High vol, low intent | Low |

**Directional trajectory if executed in order:** month 3 ≈ 5–10k visits/mo (landing-page families indexing, first blog wins), month 6 ≈ 25–40k (blog compounding + tools linking), month 12–18 ≈ 100k+ (topical authority established, stats pages earning citations, bottom-funnel families converting). The two failure modes to avoid: shipping pages below the Part 11 quality bar (rankings cap out, updates claw back gains) and leaving the honesty gap open (conversion + trust ceiling).

---

## Sources (market research, July 2026)

- [SupWriter — AI Humanizer Pricing Compared: 8 Tools in 2026](https://supwriter.com/blog/ai-humanizer-pricing-comparison-2026)
- [Freelancer's Hub (Medium) — I Re-Tested 30+ AI Humanizers in 2026](https://medium.com/freelancers-hub/i-tried-7-ai-humanizers-heres-the-best-tool-to-bypass-ai-detectors-628590da5ccf)
- [310 Creative — Best AI Humanizer Tools in 2026](https://www.310creative.com/blog/best-ai-humanizer-tools)
- [Humbot — Best AI Humanizers 2026 (hub example)](https://humbot.ai/hub/humanize-ai/best-ai-humanizers)
- [BypassGPT — StealthWriter Alternatives (programmatic pattern example)](https://www.bypassgpt.ai/alternatives/best-stealthwriter-alternatives)
- [WriteHuman](https://writehuman.ai/) · [QuillBot AI Humanizer](https://quillbot.com/ai-humanizer) · [HIX Bypass](https://hixbypass.com/) · [StealthWriter](https://stealthwriter.ai/)
- [Kripesh Adwani — 11 Best AI Humanizer Tools (2026)](https://kripeshadwani.com/best-ai-humanizers/)
- [GPTinf — StealthWriter Alternatives](https://www.gptinf.com/blog/p-7-stealthwriter-alternatives-for-bypassing-ai-detection-in-2025)

*Pricing and free-tier limits move quarterly; re-verify before quoting them on public comparison pages.*






