/** @type {import("./index.js").BlogPost} */
export default {
  slug: "what-is-llms-txt",
  cluster: "seo-ai-content",
  title: "llms.txt: What It Is and Whether You Need One",
  metaTitle: "llms.txt: What It Is and Whether You Need One",
  metaDescription:
    "llms.txt is a proposed standard for describing your site to AI systems in one markdown file. How the format works, who actually reads it, how we built ours, and an honest verdict on whether you need one.",
  keyword: "llms.txt",
  datePublished: "2026-07-15",
  dateModified: "2026-07-15",
  tldr:
    "llms.txt is a markdown file at your site root that describes your site for AI systems: a summary, key facts, and annotated links. Proposed by Jeremy Howard in September 2024, it costs about an hour to make. No major AI vendor formally guarantees to read it, but agents and AI dev tools increasingly do. We run one; for the cost, it's cheap insurance in an AI-mediated web.",
  sections: [
    {
      heading: "What llms.txt Is",
      blocks: [
        {
          p: "llms.txt is a plain markdown file served at `/llms.txt` that gives AI systems a curated, compact description of your site: what it is, the facts that matter, and where the important pages are. Think of the gap it fills: robots.txt tells crawlers what they *may* read, sitemaps tell them what *exists*, but nothing tells a language model what your site *is* — in a form that fits comfortably in a context window instead of requiring it to parse your nav, cookies banner, and footer soup.",
        },
        {
          p: "The proposal came from Jeremy Howard of Answer.AI in September 2024, with a spec at llmstxt.org. Uptake started with developer-documentation sites — docs platforms began generating it automatically, and AI companies published llms.txt files for their own docs — then spread outward from there.",
        },
      ],
    },
    {
      heading: "The Format, in One Minute",
      blocks: [
        {
          p: "The spec is deliberately minimal — it's just structured markdown:",
        },
        {
          list: [
            "**An H1** with the site or project name. The only required element.",
            "**A blockquote summary** — a few sentences saying what the site is and does.",
            "**Free-form detail** — key facts, capabilities, caveats. The things you'd want an AI answering questions about you to get right.",
            "**H2-delimited link sections** — annotated lists like `## Main pages` or `## Free tools`, each link with a one-line description.",
            "**An `## Optional` section** — links an AI can skip when context is tight.",
          ],
        },
        {
          p: "A companion convention, `llms-full.txt`, inlines the full text content rather than linking out — useful for docs sites, overkill for most others.",
        },
      ],
    },
    {
      heading: "Who Actually Reads It (The Honest Part)",
      blocks: [
        {
          p: "Here's what llms.txt advocacy tends to skip: **no major AI vendor has formally committed to consuming it.** OpenAI, Anthropic, Google, and Perplexity document their crawlers' behavior around robots.txt — not llms.txt. There is no ranking boost, no guaranteed citation, no official registry. Anyone selling llms.txt as \"SEO for AI\" with certain returns is ahead of the evidence.",
        },
        {
          p: "What does exist: AI coding assistants and answer engines fetch it opportunistically when asked about a site; agent frameworks check for it as a convention; docs tooling standardized on it. The realistic model is that llms.txt is what it looks like — a low-cost convention with growing informal adoption, not a standard with enforcement. You publish it for the growing minority of systems that look, because the cost is nearly zero.",
        },
      ],
    },
    {
      heading: "Why We Run One Anyway",
      blocks: [
        {
          p: "You can read ours at [simplyhumanize.com/llms.txt](/llms.txt) — it's the working example this post is based on. It cost about an hour: name and summary up top, a key-facts list (what the tool does, what's free, how data is handled), then annotated sections for the main pages, the [free tools](/tools), model-specific pages, and use cases.",
        },
        {
          p: "The reasoning is straightforward. More of our visitors' questions get answered inside ChatGPT, Perplexity, and AI Overviews every quarter, and when an AI describes this site we'd rather it paraphrase our own accurate summary than reconstruct us from fragments. An hour of curation against the risk of being described wrong by systems millions of people trust is a trade we'd take at ten times the price. That it also documents the site cleanly for any future agent integration is a free bonus.",
        },
      ],
    },
    {
      heading: "How to Write Yours",
      blocks: [
        {
          list: [
            "Start from the question \"what should an AI get right about us?\" — facts, not marketing. Models quote claims; make yours verifiable.",
            "Write the H1, a three-to-five line blockquote summary, and a short key-facts list.",
            "Add link sections in priority order, one line of description per link. Curate — this is your site's highlight reel, not a sitemap dump.",
            "Serve it as UTF-8 markdown at `/llms.txt`, and keep it in sync when pages ship or claims change. A stale llms.txt teaches AIs outdated facts about you.",
            "Keep it honest. Ours describes only features that exist — an llms.txt that oversells is a misinformation feed with your name on it.",
          ],
        },
      ],
    },
    {
      heading: "Verdict: Do You Need One?",
      blocks: [
        {
          p: "Need? No — nothing breaks without it. Should a content site, tool site, or docs site spend the hour? Almost certainly yes: near-zero cost, plausible and growing upside, and full control over the canonical description of your own site. Just hold the claim at its honest size. llms.txt won't rank you in AI search by itself — being [genuinely useful and citable](/blog/does-google-penalize-ai-content) does that. It makes sure that when the machines do talk about you, they have your version of the story.",
        },
      ],
    },
  ],
  faqs: [
    {
      q: "Is llms.txt an official standard?",
      a: "No. It's a community proposal from Jeremy Howard (Answer.AI, September 2024) with a spec at llmstxt.org. Adoption is real but informal — mostly docs platforms, AI dev tools, and agents — with no formal commitment from the major AI crawler operators.",
    },
    {
      q: "What's the difference between llms.txt and robots.txt?",
      a: "robots.txt controls crawler access — what may be fetched. llms.txt provides understanding — a curated markdown summary of what your site is, for AI systems to consume. They're complementary; ours sits alongside a robots.txt that explicitly allows the major AI crawlers.",
    },
    {
      q: "Does llms.txt improve rankings in Google or ChatGPT?",
      a: "There's no evidence of a direct ranking effect anywhere, and Google has indicated it doesn't use it. The realistic benefit is accuracy and citability: systems that do fetch it describe your site in your own verified terms.",
    },
    {
      q: "What's llms-full.txt?",
      a: "A companion convention that inlines full page content instead of linking to it, so an AI can load everything in one fetch. It suits documentation sites; for most marketing or content sites the standard linked llms.txt is enough.",
    },
  ],
  related: ["does-google-penalize-ai-content", "how-to-humanize-ai-text", "most-common-ai-words"],
};
