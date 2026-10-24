import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { FREE_ATTEMPTS } from "@/lib/freeTier";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com").replace(/\/$/, "");
const pageUrl = `${siteUrl}/tools`;

/**
 * The free-tools hub.
 *
 * This page used to be a copy of the AI detector page with its canonical
 * pointing at /tools/ai-content-detector — while also being listed in the
 * sitemap. Google reads that as "submitted URL not selected as canonical" and
 * the site was left with no hub at all. It is now its own page, self-canonical,
 * whose job is to link every tool and explain when to use each one.
 *
 * Adding a tool: append it to `tools` below; the cards, ItemList schema, and
 * internal links all follow from that one entry.
 */

const tools = [
  {
    name: "AI Content Detector",
    href: "/tools/ai-content-detector",
    summary:
      "Paste any text and see the AI writing patterns it carries — sentence-length uniformity, clichés, formal transitions, hedging, passive voice, repeated openers — with a breakdown of exactly which signals fired.",
    when: "Use it before you submit or publish, to find the passages that read as machine-written.",
    badge: "Unlimited · in your browser",
  },
  {
    name: "Claude Watermark Remover",
    href: "/tools/claude-watermark-remover",
    summary:
      "Strip the hidden Unicode characters that come along when you copy text out of Claude — narrow no-break spaces, zero-width characters, tag characters — and optionally normalize AI typography like em dashes and curly quotes.",
    when: "Use it on anything you paste from Claude into a document, CMS, or form.",
    badge: "Unlimited · in your browser",
  },
  {
    name: "AI Humanizer",
    href: "/#tool",
    summary:
      "Rewrite AI-generated text so it reads like a person wrote it. A three-stage pipeline varies sentence rhythm, replaces templated transitions, and cuts filler while keeping your meaning and keywords.",
    when: "Use it when the detector shows strong AI patterns and you would rather not edit by hand.",
    badge: `Free · ${FREE_ATTEMPTS} runs a day`,
  },
];

export const metadata = {
  title: "Free AI Writing Tools — Detector, Watermark Remover & Humanizer",
  description:
    "Free AI writing tools from Simply Humanize: an AI content detector that explains its score, a Claude watermark remover, and an AI humanizer. The detector and remover run in your browser with no usage limit and no sign-up.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free AI Writing Tools — Simply Humanize",
    description:
      "An AI content detector that explains its score, a Claude watermark remover, and an AI humanizer. Free, no sign-up.",
    url: pageUrl,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Writing Tools — Simply Humanize",
    description:
      "An AI content detector that explains its score, a Claude watermark remover, and an AI humanizer. Free, no sign-up.",
  },
};

const faqs = [
  {
    q: "Are these tools really free?",
    a: `Yes. The AI Content Detector and the Claude Watermark Remover run entirely in your browser, so they cost nothing to operate and have no usage limit. The AI Humanizer is free for ${FREE_ATTEMPTS} runs a day; Pro removes that cap if you need more.`,
  },
  {
    q: "Do I need an account?",
    a: "No. Every tool works straight from the page. An account is only needed if you buy Pro.",
  },
  {
    q: "Is my text uploaded anywhere?",
    a: "Not by the detector or the watermark remover — both run locally with JavaScript and never send your text to a server. The humanizer has to send your text to process it; it is used to generate your result and is not stored afterwards.",
  },
  {
    q: "Which tool should I start with?",
    a: "Start with the AI Content Detector. It shows which patterns make your text read as AI. If the score is high, run the text through the humanizer, then check it again to see what changed.",
  },
];

function buildSchema() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Free AI writing tools",
      itemListElement: tools.map((tool, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: tool.name,
        url: tool.href.startsWith("/#") ? `${siteUrl}/` : `${siteUrl}${tool.href}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];
}

export default function ToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSchema()) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-violet-50 to-white dark:from-slate-900 dark:to-slate-950 py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Tools" }]} />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            Free AI Writing Tools
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            Check text for AI writing patterns, clean the hidden characters AI tools leave behind,
            and rewrite what still reads as machine-made. No sign-up. The detector and the
            watermark remover run entirely in your browser, with no usage limit.
          </p>
        </div>
      </section>

      {/* Tool cards */}
      <section className="py-10 sm:py-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-md transition-all"
            >
              <span className="self-start rounded-full bg-violet-50 dark:bg-violet-950/40 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700 dark:text-violet-300 mb-4">
                {tool.badge}
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {tool.name}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                {tool.summary}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
                {tool.when}
              </p>
              <span className="mt-auto text-sm font-semibold text-violet-600 dark:text-violet-400">
                Open {tool.name} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Body */}
      <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
              How the tools fit together
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Most people use them in order. Paste a draft into the{" "}
              <Link href="/tools/ai-content-detector" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">
                AI content detector
              </Link>{" "}
              to see which patterns make it read as AI. If you copied it out of Claude, run it
              through the{" "}
              <Link href="/tools/claude-watermark-remover" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">
                Claude watermark remover
              </Link>{" "}
              so no invisible characters travel with it. If the score is still high, the{" "}
              <Link href="/#tool" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">
                AI humanizer
              </Link>{" "}
              rewrites for exactly those patterns. Then paste the result back into the detector to
              see what changed.
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
              What these tools don&rsquo;t do
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              None of them can prove who wrote a piece of text, and none of them guarantees a
              particular score on GPTZero, Turnitin, or any other detector. Our detector is a
              transparent writing-style heuristic: useful for improving writing, not for making
              accusations. For the longer version, read{" "}
              <Link href="/blog/ai-detector-false-positives" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">
                why AI detectors get it wrong
              </Link>
              .
            </p>
          </div>

          {/* FAQ */}
          <div className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                    {faq.q}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
