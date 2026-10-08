# Simply Humanize: External Linking and Citation Audit

**Date:** 2026-10-08 · **Scope:** full codebase + live verification of every recommended destination · **Status:** report only; no code changed

> Companion to [SEO-AUDIT.md](SEO-AUDIT.md) and [STAGE-2.md](STAGE-2.md).

**Verification key:** ✅ fetched and confirmed live and relevant · 🔎 the site blocks bots (403 or cookie wall), so it was confirmed through search results; open it once in a browser before adding · ⚠️ not verified, don't add yet

---

## 1. Executive summary

**Current external linking strategy: there isn't one.** The 17 blog posts (~20k words), 3 model pages, 8 use‑case pages, 4 language pages and 2 tool pages contain **zero editorial outbound links**. The only user‑facing external links are two on the privacy policy. Yet the content names its sources everywhere ("a 2023 Stanford study", "Vanderbilt publicly disabled…", "a spec at llmstxt.org", "Search Central published its guidance") without linking any of them. That makes it look like the site is hiding its evidence, which is the opposite of the transparency the brand promises.

**Good news on implementation.** The blog renderer already supports `[label](https://…)` links with `target="_blank" rel="noopener noreferrer"` ([blog/[slug]/page.jsx:62-75](<app/(pages)/blog/[slug]/page.jsx#L62-L75>)), so most post citations are data‑only edits. The model, use‑case and language templates render `body` as plain strings, so linking there needs a small shared‑component change.

**Sourcing the claims surfaced 5 accuracy problems.** Adding citations without fixing these would expose them to readers:

1. **Turnitin's "<1% false positive" claim is conditional.** It applies to *documents with 20%+ AI writing*, and Turnitin puts its sentence‑level rate at about 4%. The post presents it unconditionally.
2. **The Google spam policy is misquoted.** The post quotes *"regardless of how it's created"*; Google's actual text is *"no matter how it's created."*
3. **The llms.txt post is out of date.** In May 2026 Google published an official guide saying you don't need "AI text files" to appear in AI Search. Separately, Lighthouse 13.3 added an llms.txt audit. The post mentions neither.
4. **The paraphrasing post contradicts published research.** Krishna et al. (NeurIPS 2023) found strong paraphrasing dropped DetectGPT's accuracy from 70.3% to 4.6%. The post says paraphrased AI text "still reads (and scores) as AI."
5. **Bounce rate, time on page and scroll depth are presented as Google ranking signals** on the homepage and on the SEO‑writers and bloggers pages. Google's documentation says no such thing. It refers only to "aggregated and anonymised interaction data."

**Several issues matter more than outbound links** (section 3): `/tools` is a duplicate of the detector page with a cross‑canonical, the product claims features it doesn't have, and the privacy and analytics disclosures are inaccurate.

---

## 2. Site inventory

- **Stack:** Next.js 16 App Router, React 19, Tailwind 4. Everything is statically generated. Page metadata uses the Metadata API, and JSON‑LD is inlined per page.
- **Content model:** blog posts live in [lib/posts/](lib/posts/) as JS objects (inline markdown links supported). Model, use‑case and language pages come from [lib/aiModels.js](lib/aiModels.js), [lib/useCases.js](lib/useCases.js) and [lib/languages.js](lib/languages.js) (plain strings).
- **Indexable (in the sitemap):** `/`, `/pricing`, `/about`, `/contact`, `/privacy-policy`, `/terms`, `/use-cases`, `/tools`, 2 tools, 8 use cases, 3 model pages, 4 language pages, `/blog` and 17 posts.
- **Noindex (correctly):** `/account`, `/login`, `/signup`. `/api/` is disallowed in robots.
- **Duplicate:** `/tools`, which canonicalizes to `/tools/ai-content-detector` (details below).

---

## 3. Issues more important than outbound links (fix first)

| # | Issue | Evidence | Why it outranks linking |
|---|---|---|---|
| X1 | **`/tools` hub is a copy of the detector page** with `canonical: /tools/ai-content-detector` | [tools/page.jsx:20](<app/(pages)/tools/page.jsx#L20>); `diff` shows it is the detector page minus one schema block | The header nav, footer "All Free Tools" link, breadcrumbs, sitemap and `llms.txt` all point to a "hub" that is really a duplicate. The watermark remover can't be reached from it. Google will ignore the sitemap URL. |
| X2 | **Features claimed that don't exist** | Homepage FAQs and copy promise writing styles (casual, professional…), batch processing, "paid plans include additional data handling commitments". `softwareJsonLd.featureList` says "Multiple writing styles". `llms.txt` says "Selectable writing styles". [HumanizerForm.jsx](components/HumanizerForm.jsx) has no style selector, and there's no batch mode. | Same "integrity gap" the July audit flagged as P0. It's still open. It's a helpful‑content risk and the first thing a reviewer or linker would notice. |
| X3 | **Stale About page** | [about/page.jsx](<app/(pages)/about/page.jsx>): "No account needed. No data stored." "No subscription, no account." | Accounts, Pro and server logs now exist. The About page is a trust/E‑E‑A‑T page, and it contradicts the privacy policy. |
| X4 | **Privacy claims vs. the Gemini API tier** | Homepage: text is "not used to train public models". The Gemini API Additional Terms (✅) say that on **unpaid** services Google uses submitted content "to provide, improve, and develop Google products" and "human reviewers may read" it. | Only true if you're on a paid tier. Confirm which one you use. |
| X5 | **Analytics not disclosed** | GA4 (gtag), Microsoft Clarity and Vercel Analytics run in [app/layout.jsx](app/layout.jsx). The privacy policy says "We do not use advertising or tracking cookies" and never mentions analytics. | Clarity sets `_clck`/`_clsk` and has **enforced consent signals for EEA/UK/CH since Oct 31, 2025** (✅ Microsoft Learn). This is a compliance and trust issue. |
| X6 | **Sitemap `lastModified` regression** | [sitemap.js](app/sitemap.js) uses `new Date()` for every non‑blog URL, even though `useCases` entries have `lastUpdated` | The July audit said this was fixed. Now every deploy tells crawlers every page changed. |
| X7 | **Stale model versions** | ChatGPT page says GPT‑3.5/4/4o; Claude page says Claude 3/3.5 Sonnet; Gemini page says 1.5/2.0 (also in `llms.txt`). The Gemini API docs currently advertise Gemini 3.8 Flash (✅). | In Oct 2026 this reads as abandoned content on the money pages. |
| X8 | **Weak author entity** | Every post is by "Simply Humanize Team" (`@type: Organization`). There's no `sameAs`, and the `@humanizerai` Twitter handle is unverified. | Named, accountable authors do more for E‑E‑A‑T than any outbound link. |
| X9 | **Duplicate `BreadcrumbList`** on the detector page | The [Breadcrumbs](components/Breadcrumbs.jsx) component emits one, and the page builds another | Minor, but easy to clean up. |
| X10 | **Stale robots AI user‑agents** | [robots.js](app/robots.js) lists `Claude-Web` and `anthropic-ai`. Anthropic's current docs (✅) list `ClaudeBot`, `Claude-User` and `Claude-SearchBot`. | Harmless while the wildcard allows everything, but the documented intent is wrong. |

---

## 4. Unsourced or inaccurate claims (fix wording; don't just add links)

| Page | Claim | Recommendation |
|---|---|---|
| [does-turnitin-detect-chatgpt](lib/posts/does-turnitin-detect-chatgpt.js) | "document-level false positive rate below 1%" | Add "for documents with 20%+ AI writing" and the ~4% sentence‑level rate, then cite (T1). |
| [does-google-penalize-ai-content](lib/posts/does-google-penalize-ai-content.js) | *"regardless of how it's created"* | Change to *"no matter how it's created"* (G2). |
| same | "publicized deindexings of sites openly bragging about mass‑generated AI content farms" | ⚠️ No source verified. Cite a specific case or soften. |
| [what-is-llms-txt](lib/posts/what-is-llms-txt.js) | "no major AI vendor has formally committed…"; "Google has indicated it doesn't use it" | Update with Google's May 2026 guide and Lighthouse 13.3 (L4/L5). Third‑party reports say Anthropic recommends llms.txt in "Writing for Agents"; ⚠️ unverified, so check before adding. llmstxt.org shows a v2 (Aug 10, 2026), so re‑check the format section against it. |
| [ai-humanizer-vs-paraphrasing-tool](lib/posts/ai-humanizer-vs-paraphrasing-tool.js) | Paraphrased text "still reads (and scores) as AI"; "perplexity‑based detectors like Turnitin's" | Narrow the first claim to *synonym‑swap* paraphrasers and acknowledge the research (P2). Turnitin doesn't publicly describe its detector as perplexity‑based, so drop that label. |
| [ai-detector-false-positives](lib/posts/ai-detector-false-positives.js) | "independent testing routinely finds real‑world false‑positive rates well above the marketing number" | Weber‑Wulff et al. found tools "neither accurate nor reliable", but they skewed toward **false negatives**. Reword to "independent evaluations found detectors neither accurate nor reliable, and far worse on non‑native writing" and cite F3 and F4. The "neurodivergent writers" claim is ⚠️ unsourced, so soften or source it. |
| Homepage | "what linguists call 'burstiness'" | That's detector‑industry usage, not linguistics. Change to "what AI‑detection tools call burstiness". |
| Homepage, SEO‑writers and bloggers pages | Time on page, bounce rate and scroll depth "are signals search engines pay attention to" / "factor into Google's assessment" | Replace with Google's own wording: it uses "aggregated and anonymised interaction data to assess whether search results are relevant" (✅ How Search Works), and cite it. |
| Homepage | "grade 7–9 reading level — the sweet spot where most successful web content lives"; "Thousands of writers… already use this"; "Many users find rankings improve" | ⚠️ No source found for any of these. Soften them or back them with your own data. |
| Detector page and [most-common-ai-words](lib/posts/most-common-ai-words.js) | Sentence‑length uniformity is "the single strongest AI tell" / "strongest statistical divider" | Reword to "the signal we weight most heavily" unless you publish data. `research.txt` has numbers but no provenance. |
| [ChatGPT page](lib/aiModels.js) | "detection tools are calibrated primarily on ChatGPT output because it makes up the majority of AI‑generated text" | ⚠️ Unsourced. Remove or soften. |
| [Gemini page](lib/aiModels.js) | "trained on a massive corpus that skews toward Google's own content" | ⚠️ Speculation. Remove. |
| [Watermark remover](<app/(pages)/tools/claude-watermark-remover/page.jsx>) | U+202F appears "around em dashes in almost every Claude paragraph"; "ChatGPT and Gemini emit the same" characters | ⚠️ Couldn't verify. This is the page's core claim, so publish a small test with a stated methodology (see P3‑1). |
| Homepage FAQ | "check the supported languages list" | No such list exists. Link to `/es`, `/fr`, `/de` and `/pt`, or rephrase. |
| Homepage vs. blog | Manual editing "30–60 minutes per article" vs. "15–30 minutes per 1,000 words" | Make the two consistent. |

---

## 5. Page‑by‑page linking opportunities

"Edit" means an existing sentence can be updated; "New" means new copy is needed.

### /blog/does-turnitin-detect-chatgpt (*Does Turnitin Detect ChatGPT?*)

| ID | Where / existing text | Anchor → destination | Type · ✓ · Priority · Edit |
|---|---|---|---|
| T1 | "How Accurate…": "Turnitin has publicly claimed a document‑level false positive rate below 1%…" | "publicly claimed" → `https://www.turnitin.com/blog/understanding-false-positives-within-our-ai-writing-detection-capabilities` | Vendor's own documentation · 🔎 · **High** · Edit + correct |
| T2 | "Vanderbilt University publicly disabled Turnitin's AI detector" | "publicly disabled Turnitin's AI detector" → `https://www.vanderbilt.edu/brightspace/2023/08/16/guidance-on-ai-detection-and-why-were-disabling-turnitins-ai-detector/` | University · ✅ · **High** · Edit |
| T3 | "OpenAI shut down its own AI‑text classifier in July 2023" | "shut down its own AI‑text classifier" → `https://openai.com/index/new-ai-classifier-for-indicating-ai-written-text/` | Official · 🔎 · **High** · Edit |
| T4 | Bottom line: "the way its own documentation says instructors should" | "its own documentation" → Turnitin "How to prepare for and discuss the possibility of false positives" (found at turnitin.co.uk/blog/…; confirm the .com path) | Vendor documentation · 🔎 · Medium · Edit |
| T5 | "Write in Google Docs or Word with version history on" | "version history" → `https://support.google.com/docs/answer/190843` | Official help · ✅ · Low · Edit |

How T1 would read after the edit: *"Turnitin has [publicly claimed](…) a document‑level false positive rate below 1% — but that figure applies to documents scoring 20% AI or higher, and the company puts its sentence‑level rate closer to 4%."*

### /blog/ai-detector-false-positives (*AI Detector False Positives*)

| ID | Where / existing text | Anchor → destination | Type · ✓ · Priority · Edit |
|---|---|---|---|
| F1 | "GPTZero and similar tools famously scored the **U.S. Constitution** as likely AI‑generated" | "famously scored the U.S. Constitution" → `https://arstechnica.com/information-technology/2023/07/why-ai-detectors-think-the-us-constitution-was-written-by-ai/` | Industry publication · 🔎 (title confirmed in index; check exact path) · **High** · Edit |
| F2 | "**OpenAI discontinued its own AI‑text classifier**" | → OpenAI classifier post (same as T3) | Official · 🔎 · **High** · Edit |
| F3 | "A 2023 Stanford study found…" (and the FAQ "widely cited 2023 Stanford study") | "A 2023 Stanford study" → `https://arxiv.org/abs/2304.02819` (lay summary: `https://hai.stanford.edu/news/ai-detectors-biased-against-non-native-english-writers` ✅, which reports 61.22% of TOEFL essays misclassified) | Research paper · ✅ · **High** · Edit |
| F4 | "independent testing routinely finds…" (reword per section 4) | "neither accurate nor reliable" → `https://doi.org/10.1007/s40979-023-00146-z` | Peer‑reviewed · 🔎 · **High** · Edit |
| F5 | "Base‑Rate Math": "institutions like Vanderbilt disabled…" | "Vanderbilt" → Vanderbilt notice (T2). It makes the same argument: 1% of 75,000 papers is about 750 false flags. | University · ✅ · Medium · Edit |
| F6 | "AI detectors don't know who wrote a text." | "AI detectors" → `https://en.wikipedia.org/wiki/Artificial_intelligence_content_detection` | Wikipedia · ✅ (updated Oct 7, 2026) · Low · Edit |

### /blog/does-google-penalize-ai-content

| ID | Where / existing text | Anchor → destination | Type · ✓ · Priority · Edit |
|---|---|---|---|
| G1 | "Search Central published its guidance on AI‑generated content" | "its guidance on AI‑generated content" → `https://developers.google.com/search/blog/2023/02/google-search-and-ai-content` | Official · ✅ · **High** · Edit |
| G2 | "worded it to cover such content *'regardless of how it's created'*" | Fix the quote, then link "scaled content abuse" → `https://developers.google.com/search/docs/essentials/spam-policies` (confirm the section anchor in a browser) | Official · ✅ · **High** · Edit + fix |
| G3 | "March 2024: the scaled content abuse spam policy" | "March 2024" → `https://developers.google.com/search/blog/2024/03/core-update-spam-policies` | Official · ✅ (confirms "automation, human efforts, or some combination"; check the helpful‑content‑merge detail on the page) · Medium · Edit |
| G4 | "what E‑E‑A‑T's 'experience' leg means in practice" | "E‑E‑A‑T" → `https://developers.google.com/search/docs/fundamentals/creating-helpful-content` | Official · ✅ · **High** · Edit |
| G5 | Checklist: "Verify every factual claim. Models fabricate fluently." | "Models fabricate fluently" → `https://developers.google.com/search/docs/fundamentals/using-gen-ai-content` (Google tells publishers to fact‑check AI output) | Official · ✅ · Medium · Edit |

### /blog/what-is-llms-txt

| ID | Where / existing text | Anchor → destination | Type · ✓ · Priority · Edit |
|---|---|---|---|
| L1 | "with a spec at llmstxt.org" (body and FAQ) | "llmstxt.org" → `https://llmstxt.org/` | Specification · ✅ · **High** · Edit (an unlinked domain mention looks evasive) |
| L2 | "The proposal came from Jeremy Howard of Answer.AI in September 2024" | "The proposal" → `https://www.answer.ai/posts/2024-09-03-llmstxt.html` | Primary source · ✅ · Medium · Edit |
| L3 | "OpenAI, Anthropic, Google… document their crawlers' behavior around robots.txt" | `https://developers.openai.com/api/docs/bots` ✅ · `https://support.claude.com/en/articles/8896518` ✅ · `https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers` ✅ (Perplexity ⚠️ not checked) | Official · Medium · Edit |
| L4 | FAQ: "Google has indicated it doesn't use it" | "Google's official guidance" → `https://developers.google.com/search/docs/fundamentals/ai-optimization-guide` (its "Mythbusting" section says you don't need "AI text files" to appear in Search) | Official · ✅ · **High** · Edit + update |
| L5 | New sentence in "Who Actually Reads It" | "Lighthouse's experimental agentic‑browsing audit" → `https://developer.chrome.com/docs/lighthouse/agentic-browsing` | Official · ✅ (marked experimental) · Medium · New |

L4 and L5 together give the post an honest, current position: *Google Search says skip it; Chrome's Lighthouse checks for it; the file is cheap.* That balance is a citable angle in its own right.

### /blog/words-chatgpt-overuses and /blog/most-common-ai-words

| ID | Where / existing text | Anchor → destination | Type · ✓ · Priority · Edit |
|---|---|---|---|
| W1 | "researchers tracking academic abstracts documented that 'delve'… multiplied severalfold" | "researchers tracking academic abstracts" → `https://doi.org/10.1126/sciadv.adt3813` (Kobak et al., *Science Advances* 2025; open version `https://arxiv.org/abs/2406.07016` ✅) | Peer‑reviewed · 🔎/✅ · **High** · Edit. Don't add a specific multiplier until the full text has been checked. |
| W2 | "reinforcement learning rewards answers that sound confident" | "reinforcement learning" → `https://en.wikipedia.org/wiki/Reinforcement_learning_from_human_feedback` | Wikipedia · ✅ · Medium · Edit |
| W3 | "Large language models generate text one token at a time" | "Large language models" → `https://en.wikipedia.org/wiki/Large_language_model` | Wikipedia · ✅ · Low · Edit |
| M1 | most-common-ai-words: "the documented post‑2022 spike of 'delve' in academic abstracts" | "documented" → Kobak (W1) | Peer‑reviewed · Medium · Edit |

### /blog/chatgpt-em-dashes

| ID | Where / existing text | Anchor → destination | Type · ✓ · Priority · Edit |
|---|---|---|---|
| E1 | "Somewhere around 2024, the em dash… became evidence" | "became evidence" → `https://en.wikipedia.org/wiki/Dash` ("Usage in AI‑generated text" section; confirm the anchor) | Wikipedia · ✅ · Medium · Edit. Wikipedia dates the discourse to April 2025, so consider "2024–2025". |
| E2 | "Fine‑tuning for punch. Human raters reward writing…" | "Human raters" → `https://arxiv.org/abs/2203.02155` (InstructGPT) | Research paper · ✅ · Medium · Edit. Supports the mechanism only, not dash frequency, so word the sentence carefully. |

### /blog/ai-humanizer-vs-paraphrasing-tool

| ID | Where / existing text | Anchor → destination | Type · ✓ · Priority · Edit |
|---|---|---|---|
| P2 | "Why Paraphrased AI Text Still Reads as AI" | "research on paraphrasing attacks" → `https://arxiv.org/abs/2303.13408` (Krishna et al.) and `https://arxiv.org/abs/2303.11156` (Sadasivan et al.) | Research · ✅ · **High** (accuracy) · New sentence |
| P1 | "QuillBot is the category‑defining example" | **Recommend no link.** QuillBot sells an AI Humanizer (🔎), so it's a direct competitor. The mention alone serves readers. | — |

How P2 could read: *"Synonym‑swap paraphrasers leave sentence structure and rhythm untouched. Research shows heavier, discourse‑level paraphrasing can collapse detector accuracy ([Krishna et al., 2023](…)) — which says more about detector fragility than about writing quality."*

Trade‑off: honest, but on a humanizer site it can read as evasion guidance. Keep the framing on detector unreliability, and put the citation in this post and the "100% score" post, not on the tool pages.

### /blog/why-we-dont-promise-100-human-score

| ID | Where / existing text | Anchor → destination | Type · ✓ · Priority · Edit |
|---|---|---|---|
| N1 | "**Detectors disagree with each other.**" | "Detectors disagree" → Weber‑Wulff (F4); all 14 tools tested scored below 80% accuracy | Peer‑reviewed · 🔎 · **High** · Edit |
| N2 | "**The whole premise is probabilistic.**" | → Sadasivan et al. (P2) | Research · ✅ · Medium · Edit |

### /blog/how-to-use-ai-for-homework and /blog/is-using-chatgpt-cheating

| ID | Where / existing text | Anchor → destination | Type · ✓ · Priority · Edit |
|---|---|---|---|
| H1 | "**Fake citations.** Models invent plausible‑looking sources" | "invent plausible‑looking sources" → `https://doi.org/10.1038/s41598-023-41032-5` (Walters & Wilder 2023: 55% of GPT‑3.5 citations and 18% of GPT‑4 citations fabricated) | Peer‑reviewed · 🔎 · **High** · Edit (adding the figures needs a new clause) |
| H2 | "Verify every reference against a real database." | "a real database" → `https://scholar.google.com/` | Complementary tool · ✅ · Medium · Edit |
| H3 | Disclosure template paragraph | "MLA" → `https://style.mla.org/citing-generative-ai/` ✅; "APA" → `https://apastyle.apa.org/blog/how-to-cite-chatgpt` 🔎 | Official style guides · Medium · New sentence |
| C4 | Cheating FAQ: "several have disabled AI detection over false positives" | → Vanderbilt (T2) | University · ✅ · Medium · Edit |
| H4/C3 | "work in Google Docs or Word with version history on" | → Google Docs help (T5) | Official · ✅ · Low · Edit |
| C1 | "most universities now delegate the decision to individual instructors" | ⚠️ No source found. Soften or find one. | — |

### Other posts

- **[make-chatgpt-sound-more-human](lib/posts/make-chatgpt-sound-more-human.js)**, S1: "Fine‑tuning with human feedback rewards answers…" → InstructGPT (✅, Medium). S2: "A human‑sounding hallucination" → `https://en.wikipedia.org/wiki/Hallucination_(artificial_intelligence)` (✅, Low).
- **[make-ai-resume-sound-like-you](lib/posts/make-ai-resume-sound-like-you.js)**, R1: "ATS (applicant tracking systems)" → `https://en.wikipedia.org/wiki/Applicant_tracking_system` (✅, Low–Medium).
- **No external links recommended** for *the-case-for-short-sentences*, *what-makes-writing-sound-human*, *ai-cover-letters* and *how-to-humanize-ai-text*. These are craft and opinion pieces; links there would be padding. The cover‑letter claim that "some [employers] do" run detectors is ⚠️ unsourced, so soften it.

### Homepage (/)

| ID | Where / existing text | Anchor → destination | Type · ✓ · Priority · Edit |
|---|---|---|---|
| HP4 | "SEO Professionals": "Google's helpful content guidance has been clear" | "helpful content guidance" → Google helpful content doc (G4) | Official · ✅ · **High** · Edit, and fix the engagement claim |
| HP3 | "Readability Improvement": "readability tests like Flesch‑Kincaid" | "Flesch‑Kincaid" → `https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests` | Wikipedia · ✅ · Medium · Edit |
| HP5 | FAQ "Does humanized content rank better on Google?" | Rewrite with `https://www.google.com/search/howsearchworks/how-search-works/ranking-results/` wording | Official · ✅ · Medium · Edit (FAQ link rendering needed) |
| HP1 | "Large language models have habits." | → LLM Wikipedia (W3) | Wikipedia · ✅ · Low · Edit |

Keep the homepage to two or three outbound links; it's a tool page. Its bigger opportunity is internal links (section 9).

### /tools/ai-content-detector

| ID | Where / existing text | Anchor → destination | Type · ✓ · Priority · Edit |
|---|---|---|---|
| D1 | "How accurate is an AI detector?" | Add 1–2 sentences citing Weber‑Wulff (F4), Liang (F3) and the OpenAI classifier (T3) | Research and official · **High** · New |
| D2 | FAQ "Does this work the same way as GPTZero or Turnitin?" | "Commercial detectors" → AI content detection Wikipedia (F6) | Wikipedia · ✅ · Medium · Edit |

How D1 could read: *"…not this one, and not the commercial ones either. A peer‑reviewed test of 14 detectors found them ['neither accurate nor reliable'](…); Stanford researchers found detectors [misclassified 61% of non‑native English essays](…) as AI; and OpenAI [withdrew its own classifier](…) for low accuracy."*

This is the page most likely to earn links; cited evidence there does the most good.

### /tools/claude-watermark-remover

| ID | Where / existing text | Anchor → destination | Type · ✓ · Priority · Edit |
|---|---|---|---|
| WM1 | "Anthropic has not shipped a statistical watermark" | "statistical watermark" → `https://arxiv.org/abs/2301.10226` (Kirchenbauer et al., ICML 2023) | Research · ✅ · Medium · Edit |
| WM2 | Marker table code cells | U+202F → `https://en.wikipedia.org/wiki/Non-breaking_space` ✅ · U+200B → `https://en.wikipedia.org/wiki/Zero-width_space` ✅ · U+E0000–E007F → `https://en.wikipedia.org/wiki/Tags_(Unicode_block)` ✅ | Wikipedia · Medium · Edit |
| WM3 | "Can encode arbitrary hidden data in plain text" | "hidden data" → `https://embracethered.com/blog/posts/2024/hiding-and-finding-text-with-unicode-tags/` (the ASCII‑smuggling research) | Security research · ✅ · Medium · Edit |
| WM4 | FAQ "Does this work on ChatGPT and Gemini output too?" | New: Gemini app text carries Google's **SynthID** statistical watermark, which hidden‑character removal doesn't touch → `https://deepmind.google/technologies/synthid/` ✅ (paper: `https://doi.org/10.1038/s41586-024-08025-4` 🔎) | Official · Medium · New. An honest limit, and it differentiates the page from competitors. |

### Model pages (/humanize-chatgpt-text, /humanize-claude-text, /humanize-gemini-text)

- **MP1:** link the official product on first mention (Low; needs the template change). Claude → `https://claude.com/product/overview` ✅ (`anthropic.com/claude` 301s there). ChatGPT `https://chatgpt.com/` and Gemini `https://gemini.google.com/` are ⚠️ unchecked. This helps entity disambiguation more than ranking.
- **MP5 (Gemini page):** add one honest sentence on SynthID (WM4 link). Medium.
- First fix freshness and the unsourced claims (X7, section 4). That matters far more than any link here.

### Use‑case pages

- **UC1** (/ai-humanizer-for/seo-writers and /bloggers): "Google's helpful content guidance…" → Google helpful content doc, **once per page**. **High**. Replace the bounce‑rate FAQ claim ([useCases.js:165](lib/useCases.js#L165)) with Google's actual "interaction data" wording.
- **UC2** (/students): APA/MLA AI‑citation guides. Medium.
- No external links recommended on the agencies, businesses, marketers, content‑writers or essays pages.

### Trust pages

- **AB1, /about:** "We send it to the Google Gemini API" → `https://ai.google.dev/gemini-api/docs` (✅, Medium). This is a transparency link, but fix X3 first.
- **PP1, /privacy-policy:** the Gemini API bullet links Google's *general* privacy policy, which (✅) doesn't cover API data. Replace or add `https://ai.google.dev/gemini-api/terms` (✅). **High**.
- **PP2, /privacy-policy:** add an analytics section disclosing GA4, Clarity and Vercel Analytics, with links to each provider's privacy and consent docs (Clarity consent: `https://learn.microsoft.com/en-us/clarity/setup-and-installation/consent-mode` ✅; Google and Vercel ⚠️ unchecked). **High**.
- **No external links needed** on /pricing, /contact, /terms, /blog or /use-cases.

---

## 6. Complementary tools vs. competitors

| Tool | URL | What it is | Relationship | ✓ | Recommendation |
|---|---|---|---|---|---|
| Google Scholar | scholar.google.com | Scholarly search engine | Complementary, not a competitor | ✅ | **Link** (H2), for checking citations |
| Google Docs version history | support.google.com/docs/answer/190843 | Proof of the writing process | Complementary | ✅ | **Link** (T5/H4) |
| Hemingway Editor | hemingwayapp.com | Readability editor; now also sells a paraphrasing tool | Partial competitor | ✅ | Optional, Low. Only if you add a "readability tools" section. |
| LanguageTool | languagetool.org | Open‑source grammar checker with an AI paraphraser | Partial competitor | ✅ | Optional, Low. Fits the "language polishing" yellow‑zone advice. |
| Grammarly | grammarly.com | Grammar and AI writing suite | Likely a competitor (it may sell a humanizer or detector) | ⚠️ | Mention only; don't link until checked |
| QuillBot | quillbot.com | Paraphraser, **AI Humanizer**, detector | **Direct competitor** | 🔎 | Mention only |
| GPTZero | gptzero.me | AI detector | Competes with your detector | ✅ | No direct link; reach it through the Ars Technica citation |
| Turnitin | turnitin.com | Institutional detector | Neutral | 🔎 | Link only to its **own disclosures** (T1/T4), never to product pages |

The strategic trade‑off is that editorial links to competitors pass no "authority" away in any meaningful sense. The real cost is sending a user with commercial intent to an alternative at the moment they're deciding. So link neutral, authoritative sources and tools that don't compete. Name competitors where the comparison helps the reader, but leave them unlinked.

---

## 7. Wikipedia references (all ✅ live)

Use these as supplementary explanations, not as SEO boosters. At most one or two per page.

- Artificial intelligence content detection: F6, D2
- Reinforcement learning from human feedback: W2
- Large language model: W3, HP1
- Dash (AI‑usage section): E1
- Flesch–Kincaid readability tests: HP3
- Applicant tracking system: R1
- Hallucination (artificial intelligence): S2
- Non‑breaking space, Zero‑width space, Tags (Unicode block): WM2

**Considered and rejected:** Natural language processing, Machine learning, Artificial intelligence, Computational linguistics, Plagiarism detection, Search engine optimization. Nothing on the site discusses these concepts closely enough to justify a link. Perplexity is accurate but only tangential (the article doesn't cover detection), so it was skipped.

---

## 8. Existing outbound links

| Link | Location | Status | Action |
|---|---|---|---|
| `https://policies.google.com/privacy` | Privacy policy | ✅ Live, but the **wrong document** for API data handling | Add or replace with the Gemini API Additional Terms (PP1) |
| `https://razorpay.com/privacy/` | Privacy policy | ✅ Live (version effective Feb 23, 2026) | Keep |
| gtag and Razorpay checkout scripts | Layout, checkout | Functional, not editorial | Disclose in the privacy policy (PP2) |

No broken or spammy outbound links, because there are almost none. The problems are internal: the `/tools` duplicate (X1), the non‑existent "supported languages list", and two **unlinked internal mentions**. The words‑chatgpt‑overuses FAQ says "on our Claude and Gemini pages", and the how‑to‑humanize FAQ says "our humanizer‑vs‑paraphraser post"; neither is linked.

---

## 9. Internal linking opportunities (same topics)

1. **Homepage FAQs to posts.** "undetectable" → `/blog/why-we-dont-promise-100-human-score`; "paraphrasing" → `/blog/ai-humanizer-vs-paraphrasing-tool`; "rank on Google" → `/blog/does-google-penalize-ai-content`; "prompting" → `/blog/make-chatgpt-sound-more-human`; "delve/crucial" → `/blog/words-chatgpt-overuses`. The homepage links `/blog` only once today.
2. **Detector page to posts.** Link `/blog/most-common-ai-words` ("the exact pattern list this tool runs", which is your transparency differentiator) and `/blog/ai-detector-false-positives`.
3. **Model pages to posts.** ChatGPT page → words‑chatgpt‑overuses, chatgpt‑em‑dashes, make‑chatgpt‑sound‑more‑human.
4. **Use‑case pages to posts.** Students → is‑using‑chatgpt‑cheating, how‑to‑use‑ai‑for‑homework, does‑turnitin; SEO writers → does‑google‑penalize; content writers → how‑to‑humanize.
5. **Fix the two unlinked mentions** from section 8.
6. **Rebuild `/tools` as a real hub** that links both tools (X1).

---

## 10. Linking strategy and implementation design

- **Placement:** in‑sentence citations on the noun phrase that names the source ("a 2023 Stanford study", "Vanderbilt"). Avoid "click here" and repeated exact‑match anchors. Link each source once per page. Aim for roughly 3–6 external links per 1,000 words, and only where a claim needs one.
- **`rel` attributes:** keep editorial citations followed (no `nofollow`). The renderer's `target="_blank" rel="noopener noreferrer"` follows the stated rule. One trade‑off: `noreferrer` strips the Referer header, so cited sites (journalists, researchers you may later pitch) won't see Simply Humanize in their referral reports. If outreach matters, `rel="noopener"` alone is safe. Use `rel="sponsored"` for any future affiliate link.
- **Sources block:** add an optional `sources: [{label, url, publisher, date}]` field to the `BlogPost` typedef in [lib/posts/index.js](lib/posts/index.js). Render it as a short "Sources" list after the FAQ and emit it as `citation` on the `BlogPosting` JSON‑LD. Readers and AI answer engines can then check the evidence without opening each inline link.
- **Template reuse:** move `renderInline` and `plainText` from [blog/[slug]/page.jsx](<app/(pages)/blog/[slug]/page.jsx>) into a shared component. Use it in [ModelPageTemplate.jsx](components/ModelPageTemplate.jsx), the use‑case and language templates, and the homepage FAQ rendering. Keep `plainText` for the JSON‑LD.
- **Dates:** bump `dateModified` only on posts where the substance changed (the corrections in section 4), not for link‑only edits.
- **`llms.txt`:** update it in the same pass (styles claim, model versions).

---

## 11. Domain authority vs. real SEO gains

- **DA/DR (Moz, Ahrefs)** are third‑party estimates computed from *your inbound* links. Outbound links don't raise them, and Google doesn't use them.
- **Google's page‑quality evaluation** looks at helpfulness and E‑E‑A‑T signals. Citing primary sources supports *trustworthiness* in the way the helpful‑content documentation describes, but there's no evidence that outbound links are a direct ranking factor.
- **Topical authority** comes from depth and coverage across a cluster, plus internal linking. Citations make that depth checkable.
- **Backlinks** are what actually move authority. You earn them by being the best citable source: original data, transparent methods, accurate claims. A detector page that cites the literature and publishes its own method is far more linkable than one that asserts.
- **Outcomes** (rankings, impressions, clicks, conversions) are what to measure in Search Console and GA. Expect the citation work to show up indirectly, through link acquisition, AI‑answer citations and trust/conversion, not as a direct ranking jump.

---

## 12. Prioritized roadmap

**Priority 1 (high impact: do first)**

1. X1 rebuild the `/tools` hub; X2 remove or implement the phantom features (FAQs, schema `featureList`, `llms.txt`); X3 update the About page; X4/X5 fix the privacy claims, Gemini tier and analytics disclosure (PP1, PP2).
2. Accuracy corrections from section 4: the Turnitin condition, the Google misquote, the llms.txt update, the paraphrasing nuance, the engagement‑signal claims.
3. Citations: T1–T3, F1–F4, G1, G2, G4, L1, L4, W1, N1, H1, D1, UC1, HP4.

**Priority 2 (content improvements)**

4. The shared inline‑link component (templates + homepage FAQ) and the sources block with `citation` JSON‑LD.
5. Medium links: T4, F5, G3, G5, L2, L3, L5, W2, M1, E1, E2, P2, N2, H2, H3, C4, S1, R1, HP3, HP5, D2, WM1–WM4, MP5, UC2, AB1.
6. Every internal link from section 9; X6 sitemap dates; X7 model freshness; X10 robots user‑agents; X9 schema dedupe.

**Priority 3 (future opportunities)**

- **P3‑1, original research (the best backlink lever):** (a) a dated Claude/ChatGPT/Gemini hidden‑character study with sample size and method, which substantiates the watermark page's core claim; (b) a "same text, N detectors" disagreement study backing the "100% score" post.
- **P3‑2:** open‑source the detector's pattern list and scoring weights on GitHub, link it from `/blog/most-common-ai-words`, and add the org to `sameAs`.
- **P3‑3:** named authors with bio pages and `Person` schema (X8).
- **P3‑4:** a curated "AI detection evidence" resource page collecting the studies above; it can earn education‑sector links.
- **P3‑5:** native‑language authority references on the ES/FR/DE/PT pages (e.g., national style authorities). ⚠️ Not researched yet.

---

## 13. Summary table

| Page | Suggested anchor text | Destination URL | Link category | Priority | Reason |
|---|---|---|---|---|---|
| /blog/does-turnitin-detect-chatgpt | publicly claimed | turnitin.com/blog/understanding-false-positives-within-our-ai-writing-detection-capabilities | Vendor documentation | High | Sources the <1% claim and corrects its 20% condition |
| /blog/does-turnitin-detect-chatgpt | publicly disabled Turnitin's AI detector | vanderbilt.edu/brightspace/2023/08/16/guidance-on-ai-detection-and-why-were-disabling-turnitins-ai-detector/ | University | High | Primary source for a named claim |
| /blog/does-turnitin-detect-chatgpt | shut down its own AI‑text classifier | openai.com/index/new-ai-classifier-for-indicating-ai-written-text/ | Official | High | Primary source for "low rate of accuracy" |
| /blog/does-turnitin-detect-chatgpt | its own documentation | Turnitin "how to prepare for… false positives" (confirm .com path) | Vendor documentation | Medium | Supports "conversation, not verdict" |
| /blog/does-turnitin-detect-chatgpt | version history | support.google.com/docs/answer/190843 | Official help | Low | Actionable instructions |
| /blog/ai-detector-false-positives | famously scored the U.S. Constitution | arstechnica.com/…/why-ai-detectors-think-the-us-constitution-was-written-by-ai/ | Industry publication | High | Sources the headline example |
| /blog/ai-detector-false-positives | OpenAI discontinued its own AI‑text classifier | openai.com/index/new-ai-classifier-for-indicating-ai-written-text/ | Official | High | Primary source |
| /blog/ai-detector-false-positives | A 2023 Stanford study | arxiv.org/abs/2304.02819 | Research paper | High | The post's "canonical citation" is currently uncited |
| /blog/ai-detector-false-positives | neither accurate nor reliable | doi.org/10.1007/s40979-023-00146-z | Peer‑reviewed | High | Replaces an overstated claim with a sourced one |
| /blog/ai-detector-false-positives | Vanderbilt | vanderbilt.edu/brightspace/… (as above) | University | Medium | Same base‑rate argument (750 of 75,000) |
| /blog/ai-detector-false-positives | AI detectors | en.wikipedia.org/wiki/Artificial_intelligence_content_detection | Wikipedia | Low | Background explainer |
| /blog/does-google-penalize-ai-content | its guidance on AI‑generated content | developers.google.com/search/blog/2023/02/google-search-and-ai-content | Official | High | Primary source for the core thesis |
| /blog/does-google-penalize-ai-content | scaled content abuse | developers.google.com/search/docs/essentials/spam-policies | Official | High | Sources (and fixes) a misquote |
| /blog/does-google-penalize-ai-content | March 2024 | developers.google.com/search/blog/2024/03/core-update-spam-policies | Official | Medium | Dates the policy change |
| /blog/does-google-penalize-ai-content | E‑E‑A‑T | developers.google.com/search/docs/fundamentals/creating-helpful-content | Official | High | Defines a term the post relies on |
| /blog/does-google-penalize-ai-content | Models fabricate fluently | developers.google.com/search/docs/fundamentals/using-gen-ai-content | Official | Medium | Google's own fact‑check guidance |
| /blog/what-is-llms-txt | llmstxt.org | llmstxt.org | Specification | High | Unlinked domain mention |
| /blog/what-is-llms-txt | The proposal | answer.ai/posts/2024-09-03-llmstxt.html | Primary source | Medium | Original announcement |
| /blog/what-is-llms-txt | document their crawlers' behavior | developers.openai.com/api/docs/bots · support.claude.com/en/articles/8896518 · developers.google.com/search/docs/crawling-indexing/google-common-crawlers | Official | Medium | Substantiates a vendor claim |
| /blog/what-is-llms-txt | Google's official guidance | developers.google.com/search/docs/fundamentals/ai-optimization-guide | Official | High | Updates an outdated claim |
| /blog/what-is-llms-txt | Lighthouse's experimental agentic‑browsing audit | developer.chrome.com/docs/lighthouse/agentic-browsing | Official | Medium | Balanced, current counterpoint |
| /blog/words-chatgpt-overuses | researchers tracking academic abstracts | doi.org/10.1126/sciadv.adt3813 | Peer‑reviewed | High | Sources the "delve" claim |
| /blog/words-chatgpt-overuses | reinforcement learning | en.wikipedia.org/wiki/Reinforcement_learning_from_human_feedback | Wikipedia | Medium | Explains the mechanism |
| /blog/words-chatgpt-overuses | Large language models | en.wikipedia.org/wiki/Large_language_model | Wikipedia | Low | Background |
| /blog/most-common-ai-words | documented | doi.org/10.1126/sciadv.adt3813 | Peer‑reviewed | Medium | Same claim, different page |
| /blog/chatgpt-em-dashes | became evidence | en.wikipedia.org/wiki/Dash | Wikipedia | Medium | Documents the em‑dash discourse |
| /blog/chatgpt-em-dashes | Human raters | arxiv.org/abs/2203.02155 | Research paper | Medium | Fine‑tuning mechanism |
| /blog/ai-humanizer-vs-paraphrasing-tool | research on paraphrasing attacks | arxiv.org/abs/2303.13408 · arxiv.org/abs/2303.11156 | Research | High | Corrects a claim research contradicts |
| /blog/why-we-dont-promise-100-human-score | Detectors disagree | doi.org/10.1007/s40979-023-00146-z | Peer‑reviewed | High | Evidence for the post's thesis |
| /blog/why-we-dont-promise-100-human-score | The whole premise is probabilistic | arxiv.org/abs/2303.11156 | Research | Medium | Limits of detection |
| /blog/how-to-use-ai-for-homework | invent plausible‑looking sources | doi.org/10.1038/s41598-023-41032-5 | Peer‑reviewed | High | Quantifies the fake‑citation risk |
| /blog/how-to-use-ai-for-homework | a real database | scholar.google.com | Complementary tool | Medium | Actionable verification |
| /blog/how-to-use-ai-for-homework | MLA / APA | style.mla.org/citing-generative-ai/ · apastyle.apa.org/blog/how-to-cite-chatgpt | Style guides | Medium | Supports the disclosure advice |
| /blog/is-using-chatgpt-cheating | several have disabled AI detection | vanderbilt.edu/brightspace/… | University | Medium | Sources the FAQ claim |
| /blog/make-chatgpt-sound-more-human | Fine‑tuning with human feedback | arxiv.org/abs/2203.02155 | Research paper | Medium | Mechanism |
| /blog/make-chatgpt-sound-more-human | hallucination | en.wikipedia.org/wiki/Hallucination_(artificial_intelligence) | Wikipedia | Low | Concept |
| /blog/make-ai-resume-sound-like-you | applicant tracking systems | en.wikipedia.org/wiki/Applicant_tracking_system | Wikipedia | Low | Concept |
| / | helpful content guidance | developers.google.com/search/docs/fundamentals/creating-helpful-content | Official | High | Sources a claim; fixes overreach |
| / | Flesch‑Kincaid | en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests | Wikipedia | Medium | Names a metric the page uses |
| / (FAQ) | interaction data | google.com/search/howsearchworks/how-search-works/ranking-results/ | Official | Medium | Accurate replacement for the bounce‑rate claim |
| /tools/ai-content-detector | neither accurate nor reliable / misclassified 61% / withdrew its own classifier | doi.org/10.1007/s40979-023-00146-z · hai.stanford.edu/news/ai-detectors-biased-against-non-native-english-writers · openai.com/index/new-ai-classifier-… | Research and official | High | The most link‑worthy page needs evidence |
| /tools/ai-content-detector | Commercial detectors | en.wikipedia.org/wiki/Artificial_intelligence_content_detection | Wikipedia | Medium | Context |
| /tools/claude-watermark-remover | statistical watermark | arxiv.org/abs/2301.10226 | Research | Medium | Defines what a real watermark is |
| /tools/claude-watermark-remover | U+202F / U+200B / Tags block | en.wikipedia.org/wiki/Non-breaking_space · …/Zero-width_space · …/Tags_(Unicode_block) | Wikipedia | Medium | Technical reference |
| /tools/claude-watermark-remover | hidden data | embracethered.com/blog/posts/2024/hiding-and-finding-text-with-unicode-tags/ | Security research | Medium | Sources the risk claim |
| /tools/claude-watermark-remover · /humanize-gemini-text | SynthID | deepmind.google/technologies/synthid/ | Official | Medium | Honest limit; differentiation |
| /humanize-claude-text | Claude | claude.com/product/overview | Official product | Low | Entity disambiguation |
| /ai-humanizer-for/seo-writers, /bloggers | helpful content guidance | developers.google.com/search/docs/fundamentals/creating-helpful-content | Official | High | Sources a claim; fixes overreach |
| /ai-humanizer-for/students | APA / MLA AI citation | apastyle.apa.org/blog/how-to-cite-chatgpt · style.mla.org/citing-generative-ai/ | Style guides | Medium | Practical disclosure help |
| /about | Google Gemini API | ai.google.dev/gemini-api/docs | Official | Medium | Transparency |
| /privacy-policy | Gemini API Additional Terms | ai.google.dev/gemini-api/terms | Official | High | The correct governing document |
| /privacy-policy | Clarity consent mode (+ GA4, Vercel) | learn.microsoft.com/en-us/clarity/setup-and-installation/consent-mode | Official | High | Disclosure and compliance |

---

## Open questions before implementation

1. Is the Gemini API key on a **paid** tier? (Determines whether "not used to train public models" can stay.)
2. Build the style selector, or cut the style and batch claims?
3. Which priorities to implement: everything, P1 only, or specific IDs?

---

## Sources (verification)

- [Vanderbilt: disabling Turnitin's AI detector](https://www.vanderbilt.edu/brightspace/2023/08/16/guidance-on-ai-detection-and-why-were-disabling-turnitins-ai-detector/)
- [Search Engine Land: OpenAI classifier no longer available](https://searchengineland.com/openai-ai-classifier-no-longer-available-429912)
- [Turnitin: false positives (UK mirror)](https://www.turnitin.co.uk/blog/understanding-false-positives-within-our-ai-writing-detection-capabilities)
- [Turnitin: sentence-level false positive rate](https://www.turnitin.ca/blog/understanding-the-false-positive-rate-for-sentences-of-our-ai-writing-detection-capability)
- [Liang et al., GPT detectors are biased against non-native English writers](https://arxiv.org/abs/2304.02819)
- [Stanford HAI summary](https://hai.stanford.edu/news/ai-detectors-biased-against-non-native-english-writers)
- [Weber-Wulff et al. (arXiv)](https://arxiv.org/abs/2306.15666v1)
- [Krishna et al., Paraphrasing evades detectors](https://arxiv.org/abs/2303.13408)
- [Sadasivan et al., Can AI-Generated Text be Reliably Detected?](https://arxiv.org/abs/2303.11156)
- [Kobak et al., Delving into LLM-assisted writing](https://arxiv.org/abs/2406.07016)
- [Ars Technica article (via index)](https://spencergreenhalgh.com/work/2023-07-14-i-dont)
- [llmstxt.org](https://llmstxt.org/)
- [Answer.AI llms.txt proposal](https://www.answer.ai/posts/2024-09-03-llmstxt.html)
- [Google: AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google Search Central blog, May 2026](https://developers.google.com/search/blog/2026/05/a-new-resource-for-optimizing)
- [Search Engine Journal: Google's llms.txt guidance depends on the product](https://www.searchenginejournal.com/googles-llms-txt-guidance-depends-on-which-product-you-ask)
- [Lighthouse agentic browsing](https://developer.chrome.com/docs/lighthouse/agentic-browsing)
- [Google: AI-generated content guidance (Feb 2023)](https://developers.google.com/search/blog/2023/02/google-search-and-ai-content)
- [Google: spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Google: March 2024 core update and spam policies](https://developers.google.com/search/blog/2024/03/core-update-spam-policies)
- [Google: creating helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google: using gen-AI content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content)
- [Google: How Search Works, ranking results](https://www.google.com/search/howsearchworks/how-search-works/ranking-results/)
- [InstructGPT paper](https://arxiv.org/abs/2203.02155)
- [Kirchenbauer et al., A Watermark for LLMs](https://arxiv.org/abs/2301.10226)
- [Google DeepMind SynthID](https://deepmind.google/technologies/synthid/)
- [SynthID-Text paper (PMC)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11499265/)
- [Embrace The Red: Unicode tags / ASCII smuggling](https://embracethered.com/blog/posts/2024/hiding-and-finding-text-with-unicode-tags/)
- [Gemini API Additional Terms](https://ai.google.dev/gemini-api/terms)
- [Gemini API docs](https://ai.google.dev/gemini-api/docs)
- [OpenAI crawlers](https://developers.openai.com/api/docs/bots)
- [Anthropic crawlers](https://support.claude.com/en/articles/8896518)
- [Google common crawlers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)
- [Microsoft Clarity consent](https://learn.microsoft.com/en-us/clarity/cookie-consent)
- [MLA: citing generative AI](https://style.mla.org/citing-generative-ai/)
- [APA: how to cite ChatGPT (via index)](https://lssc.libanswers.com/faq/397584)
- [UNESCO: guidance for generative AI in education](https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research)
- [Google Docs version history help](https://support.google.com/docs/answer/190843)
- [Google Scholar](https://scholar.google.com/intl/en/scholar/about.html)
- [Hemingway Editor](https://hemingwayapp.com/)
- [LanguageTool](https://languagetool.org/)
- [GPTZero](https://gptzero.me/)
- [QuillBot (via Scribbr comparison)](https://scribbr.com/ai-tools/best-ai-humanizer)
- [Walters & Wilder (via index)](https://www.ischools.org/post/news-feature-citation-accuracy-in-chatgpt)
- Wikipedia: [AI content detection](https://en.wikipedia.org/wiki/Artificial_intelligence_content_detection) · [RLHF](https://en.wikipedia.org/wiki/Reinforcement_learning_from_human_feedback) · [Large language model](https://en.wikipedia.org/wiki/Large_language_model) · [Dash](https://en.wikipedia.org/wiki/Dash) · [Flesch–Kincaid](https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests) · [Applicant tracking system](https://en.wikipedia.org/wiki/Applicant_tracking_system) · [Hallucination (AI)](https://en.wikipedia.org/wiki/Hallucination_(artificial_intelligence)) · [Non-breaking space](https://en.wikipedia.org/wiki/Non-breaking_space) · [Zero-width space](https://en.wikipedia.org/wiki/Zero-width_space) · [Tags (Unicode block)](https://en.wikipedia.org/wiki/Tags_(Unicode_block))
- [Razorpay privacy policy](https://razorpay.com/privacy/)
- [Google privacy policy](https://policies.google.com/privacy)
