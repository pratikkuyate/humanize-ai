import dynamic from "next/dynamic";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com";

const AiDetectorTool = dynamic(() => import("@/components/AiDetectorTool"), {
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="h-[400px] sm:h-[520px] rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="h-[400px] sm:h-[520px] rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>
  ),
});

export const metadata = {
  title: "Free AI Content Detector — No Sign-Up",
  description:
    "Free AI content detector. Paste your text and instantly see the AI writing patterns it carries — sentence-length uniformity, clichés, hedging, and more. Runs entirely in your browser. No sign-up, nothing uploaded.",
  alternates: { canonical: `${siteUrl}/tools/ai-content-detector` },
  openGraph: {
    title: "Free AI Content Detector — No Sign-Up",
    description:
      "Paste text and instantly see its AI writing patterns. Runs in your browser — free, private, no sign-up.",
    url: `${siteUrl}/tools/ai-content-detector`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Content Detector — No Sign-Up",
    description:
      "Paste text and instantly see its AI writing patterns. Free, private, no sign-up.",
  },
};

const faqs = [
  {
    q: "Is this AI detector free?",
    a: "Yes — completely free with no account, no sign-up, and no usage limit. The analysis runs in your browser, so there's no cost to run it and no reason to gate it.",
  },
  {
    q: "Is my text stored or uploaded anywhere?",
    a: "No. The entire analysis runs locally in your browser using JavaScript. Your text is never sent to a server, never logged, and never stored. You can disconnect from the internet after the page loads and it still works.",
  },
  {
    q: "Does this work the same way as GPTZero or Turnitin?",
    a: "No, and it doesn't claim to. Commercial detectors use trained machine-learning models on large datasets. This tool is a transparent rule-based heuristic that measures specific writing patterns common in AI text — sentence-length uniformity, cliché density, hedging, passive voice, and repeated openers. It tells you why text reads as AI, which those tools usually don't.",
  },
  {
    q: "Can AI detectors be wrong?",
    a: "Yes — all of them, including this one. AI-pattern signals overlap with formal human writing, so a careful academic or technical writer can score high while lightly-edited AI can score low. Treat any AI detector result as a signal about writing style, never as proof of authorship. Never make an accusation based on a detector score alone.",
  },
  {
    q: "What score should I worry about?",
    a: "Roughly: under 40 reads as mostly human, 40–69 shows mixed signals (often lightly-edited AI), and 70+ carries strong AI patterns. These are guidelines, not hard thresholds. The per-signal breakdown is more useful than the headline number — it shows exactly what to fix.",
  },
];

function buildFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export default function AiContentDetectorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema()) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-violet-50 to-white dark:from-slate-900 dark:to-slate-950 py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs crumbs={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "AI Content Detector" },
          ]} />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            Free AI Content Detector
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            Paste any text and instantly see the AI writing patterns it carries —
            sentence-length uniformity, clichés, hedging, passive voice, and more.
            It runs entirely in your browser: free, private, and no sign-up. Nothing
            you paste is ever uploaded or stored.
          </p>
        </div>
      </section>

      {/* Tool */}
      <section className="py-10 sm:py-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-4">
            Check your text — instant, in your browser
          </p>
          <AiDetectorTool />
        </div>
      </section>

      {/* Body */}
      <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
              How this AI detector works
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Most AI text shares a set of measurable habits. This detector scores
              six of them and combines them into a single 0–100 AI-pattern score.
              Unlike a black-box detector, it shows you exactly which patterns it
              found, so the result is something you can act on rather than just a
              number to worry about. Everything is computed locally with JavaScript
              the moment you click Analyze — there's no API call, no waiting, and no
              text leaving your device.
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
              What each signal means
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              The headline score is a blend; the breakdown is where the insight is.
              Here's what each signal measures and why it points toward AI:
            </p>
            <ul className="space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed">
              <li><strong className="text-slate-800 dark:text-slate-200">Sentence-length variation (burstiness)</strong> — Humans mix short punchy sentences with long winding ones. AI tends to produce sentences of similar length. Low variation is the single strongest AI tell, which is why it carries the most weight.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">AI cliché density</strong> — Phrases like "delve into," "in today's world," "it's worth noting," and "a multitude of" appear far more often in machine output than in natural writing.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Formal transitions</strong> — Over-reliance on "furthermore," "moreover," and "consequently" is a hallmark of templated, generated prose.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Hedging language</strong> — Vague qualifiers such as "somewhat," "potentially," and "seems to" make writing mealy-mouthed in a distinctly AI way.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Passive voice</strong> — Heavy passive construction reads as impersonal and is more common in generated text.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Repeated sentence openers</strong> — Starting many sentences with the same word is a pattern humans rarely fall into but models often do.</li>
            </ul>
          </div>

          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
              How accurate is an AI detector?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Honestly: no AI detector is reliable enough to act on alone — not this
              one, and not the commercial ones either. The patterns that signal AI
              also show up in careful, formal human writing, so false positives are
              real and unavoidable. A meticulous academic can score high; lightly
              edited AI can score low. That's why this tool is built to be
              transparent rather than authoritative: it shows you the specific
              patterns it found so you can improve the writing, not to label anyone a
              cheater. Never make an accusation based on any detector's score.
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
              What to do if your text scores high
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              A high score means the writing carries mechanical patterns — not that
              the ideas are bad. The fix is editing for rhythm and voice: vary your
              sentence lengths, cut the clichés and filler transitions, replace
              hedging with direct statements, and add specifics only you would write.
              If you'd rather not do that pass by hand, our{" "}
              <Link href="/#tool" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">
                free AI humanizer
              </Link>{" "}
              rewrites for exactly these patterns in seconds — then paste the result
              back here to see the score drop.
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

          {/* CTA */}
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
            <Link
              href="/#tool"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-sm"
            >
              Humanize AI text — it's free →
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:border-violet-400 dark:hover:border-violet-500 transition-colors"
            >
              See all free tools
            </Link>
          </div>
        </article>
      </section>
    </>
  );
}
