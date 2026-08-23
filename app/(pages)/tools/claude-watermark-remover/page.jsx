import dynamic from "next/dynamic";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import WatermarkRemoverTool from "@/components/WatermarkRemoverTool";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com").replace(/\/$/, "");
const pagePath = "/tools/claude-watermark-remover";
const pageUrl = `${siteUrl}${pagePath}`;

const HumanizerTool = dynamic(() => import("@/components/HumanizerTool"), {
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="h-[428px] sm:h-[628px] rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="h-[448px] rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>
  ),
});

export const metadata = {
  title: "Claude Watermark Remover — Free & Instant",
  description:
    "Free Claude watermark remover. Strip the hidden Unicode characters Claude leaves in copied text — narrow no-break spaces, zero-width joiners, tag characters — in one click. Runs in your browser. No sign-up.",
  keywords: [
    "claude watermark remover",
    "remove claude watermark",
    "claude ai watermark",
    "claude invisible characters",
    "remove hidden characters from claude text",
    "claude watermark removal tool",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Claude Watermark Remover — Free & Instant",
    description:
      "Strip the hidden Unicode characters Claude leaves in copied text — narrow no-break spaces, zero-width joiners, tag characters — in one click. Free, private, no sign-up.",
    url: pageUrl,
    type: "website",
    siteName: "Simply Humanize",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Claude Watermark Remover — Free Online Tool" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude Watermark Remover — Free & Instant",
    description:
      "Strip the hidden Unicode characters Claude leaves in copied text in one click. Free, private, no sign-up.",
    images: ["/opengraph-image"],
  },
};

/** The markers the remover looks for, shown as a reference table. */
const markers = [
  {
    code: "U+202F",
    name: "Narrow no-break space",
    where: "Wrapped around em dashes in almost every Claude paragraph",
    risk: "The single most common Claude watermark character",
  },
  {
    code: "U+200B",
    name: "Zero-width space",
    where: "Between words or after sentence-ending punctuation",
    risk: "Breaks search, word counts, and string matching",
  },
  {
    code: "U+00A0",
    name: "No-break space",
    where: "Between numbers, units, and names",
    risk: "Wrecks line wrapping and CSV imports",
  },
  {
    code: "U+200D",
    name: "Zero-width joiner",
    where: "Occasionally between characters mid-word",
    risk: "Invisible, but survives copy-paste everywhere",
  },
  {
    code: "U+FEFF",
    name: "Zero-width no-break space (BOM)",
    where: "At the very start of a copied block",
    risk: "Corrupts file headers and JSON parsing",
  },
  {
    code: "U+E0000–E007F",
    name: "Unicode tag characters",
    where: "Anywhere; renders as absolutely nothing",
    risk: "Can encode arbitrary hidden data in plain text",
  },
];

const faqs = [
  {
    q: "How can I tell if text was written by Claude?",
    a: "Check it for hidden characters. Anthropic has not shipped a statistical or cryptographic watermark that identifies Claude as the author of a passage, so there is nothing to decode. What you can look for are the Unicode characters that ride along with copied output, most commonly the narrow no-break space (U+202F) that Claude places around em dashes. These are formatting artifacts, not a deliberate tracking signature, but they are a reliable fingerprint all the same because almost nobody types them by hand.",
  },
  {
    q: "Is this tool free?",
    a: "Yes — completely free, with no account, no sign-up, and no usage limit. The whole scan runs in your browser with JavaScript, so it costs nothing to operate and there is no reason to gate it.",
  },
  {
    q: "Is my text uploaded anywhere when I remove the Claude watermark?",
    a: "No. The watermark removal runs entirely on your device. Your text is never sent to a server, never logged, and never stored. You can disconnect from the internet after the page loads and the remover still works.",
  },
  {
    q: "What hidden characters does Claude leave in text?",
    a: "The most frequent by far is U+202F, the narrow no-break space, which appears on both sides of Claude's em dashes. Others show up less often: the zero-width space (U+200B), the no-break space (U+00A0), the zero-width joiner (U+200D), the byte-order mark (U+FEFF), the soft hyphen (U+00AD), and characters from the Unicode Tags block (U+E0000–U+E007F), which are completely invisible and can carry hidden data. This tool checks for all of them.",
  },
  {
    q: "Will removing the Claude watermark make text undetectable by AI detectors?",
    a: "No, and any tool promising that is overselling. Stripping hidden characters removes the copy-paste fingerprint, but AI detectors score writing style — sentence-length uniformity, cliché density, hedging, formulaic transitions — not Unicode. To change what a detector sees you have to change how the writing reads. That is what the humanizer further down this page does, and even then no tool can guarantee any particular detector score.",
  },
  {
    q: "Does removing hidden characters change my writing?",
    a: "Not the words. Invisible characters are deleted and unusual spaces become normal spaces, so the visible text is identical. The optional typography setting goes one step further and converts em dashes, curly quotes, and the ellipsis glyph to plain ASCII — that does change punctuation, so turn it off if you want to keep Claude's typography exactly as written.",
  },
  {
    q: "Why does hidden-character removal matter?",
    a: "Because the characters break things quietly. A zero-width space inside a variable name produces a syntax error no linter can explain. A no-break space in a spreadsheet cell fails an exact-match lookup. A narrow no-break space in a CMS renders as a stray box in some fonts. And in an applicant tracking system, non-standard whitespace can cause keyword matching to miss entirely.",
  },
  {
    q: "Does this work on ChatGPT and Gemini output too?",
    a: "Yes. The hidden characters are not unique to Claude — ChatGPT and Gemini emit the same narrow no-break spaces and zero-width characters, so the same remover cleans their output just as well. The tool does not care which model produced the text.",
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

function buildHowToSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to remove the Claude watermark from text",
    description:
      "Strip the hidden Unicode characters Claude leaves in copied output using a free browser-based Claude watermark remover.",
    totalTime: "PT1M",
    supply: [{ "@type": "HowToSupply", name: "Text copied from Claude" }],
    tool: [{ "@type": "HowToTool", name: "Simply Humanize Claude Watermark Remover" }],
    step: [
      {
        "@type": "HowToStep",
        name: "Paste your Claude text",
        text: "Copy the output straight out of Claude and paste it into the box above. Copying from the chat window is what carries the hidden characters across, so paste the raw text rather than retyping it.",
        url: `${pageUrl}#tool`,
      },
      {
        "@type": "HowToStep",
        name: "Run the watermark remover",
        text: "Click Remove watermark. The scan runs locally in your browser and lists every hidden character it found, with a count for each one.",
        url: `${pageUrl}#tool`,
      },
      {
        "@type": "HowToStep",
        name: "Review what was found",
        text: "Check the breakdown to see which markers your text carried — narrow no-break spaces, zero-width characters, or Unicode tag characters — so you know what was actually in it.",
        url: `${pageUrl}#tool`,
      },
      {
        "@type": "HowToStep",
        name: "Copy the clean text",
        text: "Click Copy to put the cleaned version on your clipboard. The visible wording is unchanged; only the hidden characters are gone.",
        url: `${pageUrl}#tool`,
      },
    ],
  };
}

function buildAppSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Claude Watermark Remover",
    url: pageUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires JavaScript",
    description:
      "Free browser-based Claude watermark remover that strips hidden Unicode characters — narrow no-break spaces, zero-width characters, and Unicode tag characters — from text copied out of Claude.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Removes hidden Unicode characters from Claude output",
      "Detects Unicode tag characters that can carry hidden data",
      "Optional AI typography normalization",
      "Runs entirely in the browser — nothing is uploaded",
      "No sign-up or account required",
    ],
    isAccessibleForFree: true,
    publisher: { "@type": "Organization", name: "Simply Humanize", url: siteUrl },
  };
}

export default function ClaudeWatermarkRemoverPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildHowToSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildAppSchema()) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-violet-50 to-white dark:from-slate-900 dark:to-slate-950 py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            crumbs={[
              { label: "Home", href: "/" },
              { label: "Tools", href: "/tools" },
              { label: "Claude Watermark Remover" },
            ]}
          />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            Claude Watermark Remover
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            Paste text copied out of Claude and this free Claude watermark remover
            strips the hidden Unicode characters it carries — the narrow no-break
            spaces around every em dash, zero-width characters, and the invisible
            tag characters that can hide data inside plain text. Your wording stays
            exactly as written. It runs entirely in your browser: nothing is
            uploaded, and there is no sign-up.
          </p>
        </div>
      </section>

      {/* Tool */}
      <section
        id="tool"
        className="py-10 sm:py-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 scroll-mt-20"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-4">
            Remove the Claude watermark — instant, in your browser
          </p>
          <WatermarkRemoverTool />
        </div>
      </section>

      {/* Body */}
      <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Answer-first block — the question everyone actually arrives with. */}
          <div className="mb-10 rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
              Does Claude watermark its text?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              <strong className="text-slate-800 dark:text-slate-200">
                Not as a cryptographic signature.
              </strong>{" "}
              Anthropic has not shipped a statistical watermark that proves Claude
              wrote a given passage. But Claude output does carry a consistent set of
              hidden Unicode characters — above all the narrow no-break space
              (U+202F) sitting on both sides of its em dashes. Nobody types that
              character by hand, so it works as a fingerprint whether or not it was
              ever intended as one. That is exactly what this tool takes out.
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
              What the &ldquo;Claude watermark&rdquo; actually is
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              The Claude watermark is not one thing — it is two layers, and they need
              different fixes. The first layer is invisible characters that survive
              copy-paste into any editor, CMS, or document. The second is visible
              typography and phrasing habits. This tool handles the first layer
              completely and the punctuation half of the second; the{" "}
              <Link
                href="#humanize"
                className="text-violet-600 dark:text-violet-400 hover:underline font-medium"
              >
                humanizer further down the page
              </Link>{" "}
              handles the rest.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Here are the characters the remover scans for, what they look like in
              practice, and why each one matters:
            </p>

            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full min-w-[560px] text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 dark:border-slate-700">
                    <th className="text-left py-2 pr-4 font-semibold text-slate-700 dark:text-slate-200">
                      Character
                    </th>
                    <th className="text-left py-2 pr-4 font-semibold text-slate-700 dark:text-slate-200">
                      Where it shows up
                    </th>
                    <th className="text-left py-2 font-semibold text-slate-700 dark:text-slate-200">
                      Why it matters
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {markers.map((m) => (
                    <tr
                      key={m.code}
                      className="border-b border-slate-200 dark:border-slate-800 align-top"
                    >
                      <td className="py-3 pr-4">
                        <span className="font-mono text-xs text-violet-600 dark:text-violet-400 block">
                          {m.code}
                        </span>
                        <span className="text-slate-600 dark:text-slate-300 text-xs">{m.name}</span>
                      </td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                        {m.where}
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                        {m.risk}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
              How to remove the Claude watermark
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Four steps, about a minute, nothing to install:
            </p>
            <ol className="list-decimal pl-6 space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Paste your Claude text.</strong>{" "}
                Copy it straight out of the Claude chat window into the box above.
                Copying is what carries the hidden characters across — retyping the
                text by hand would leave them behind anyway.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Click Remove watermark.</strong>{" "}
                The scan runs locally and finishes instantly, however long your text
                is.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Read the breakdown.</strong>{" "}
                You get a count of every marker found, grouped by type, so you can see
                what was actually hiding in your text rather than just trusting a
                green checkmark.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Copy the clean text.</strong>{" "}
                The visible wording is byte-for-byte what you pasted. Only the hidden
                characters are gone.
              </li>
            </ol>
          </div>

          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Where Claude&rsquo;s hidden characters cause real problems
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Most people go looking for this tool because something broke and the
              cause was invisible. The usual suspects:
            </p>
            <ul className="space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Code that will not run</strong>{" "}
                — a zero-width space pasted into a variable name or a string produces
                a syntax error that looks impossible, because the offending character
                takes up no space on screen.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Spreadsheets and CSVs</strong>{" "}
                — a no-break space inside a cell silently fails every exact-match
                lookup, and the cell looks completely normal.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">CMS and email rendering</strong>{" "}
                — narrow no-break spaces render as stray boxes or odd gaps in fonts
                that lack the glyph, so published pages look subtly broken.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Applicant tracking systems</strong>{" "}
                — non-standard whitespace in a résumé can break the keyword matching
                that decides whether a human ever sees it.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Search and word counts</strong>{" "}
                — Ctrl+F stops finding phrases, and word counts drift, because the
                text is not made of the characters it appears to be made of.
              </li>
            </ul>
          </div>

          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Removing hidden characters is only half the job
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Stripping hidden characters fixes what the text is made of. It does not
              change how the text reads — and the way Claude writes is a far louder
              signal than any invisible character. Claude hedges constantly
              (&ldquo;It&rsquo;s worth noting that,&rdquo; &ldquo;That said,&rdquo;
              &ldquo;Importantly&rdquo;), balances both sides of arguments you never
              asked it to balance, and builds paragraphs in methodical, evenly
              measured sentences. Strip every hidden character and that rhythm is
              still there on the page.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              So if your goal is text that reads as genuinely human rather than merely
              clean, run it through the humanizer below after removing the watermark.
              It rewrites for the patterns that actually give AI writing away: uniform
              sentence length, stock transitions, hedging, and stiff vocabulary. You
              can also check the result with our{" "}
              <Link
                href="/tools/ai-content-detector"
                className="text-violet-600 dark:text-violet-400 hover:underline font-medium"
              >
                free AI content detector
              </Link>{" "}
              to see which patterns remain.
            </p>
          </div>
        </article>
      </section>

      {/* Humanizer — the second half of the job */}
      <section
        id="humanize"
        className="py-12 sm:py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-3">
              Step two — optional
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
              Now humanize the writing itself
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Paste your cleaned text here to rewrite Claude&rsquo;s style fingerprint
              — the hedging, the even sentence rhythm, the formulaic transitions —
              while keeping your meaning intact. Free, no sign-up, same as the
              watermark remover above.
            </p>
          </div>
          <HumanizerTool />
        </div>
      </section>

      {/* FAQ + closing */}
      <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Is removing the Claude watermark legitimate?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              For the overwhelming majority of uses, yes — you are removing formatting
              artifacts from your own text so it works properly in code, spreadsheets,
              and content systems. That is ordinary text hygiene, not evasion. Where
              it stops being straightforward is context: if you are submitting work
              under a policy that requires you to disclose AI assistance, stripping
              characters does not change what that policy asks of you. Follow the
              rules you have agreed to. We are also{" "}
              <Link
                href="/blog/why-we-dont-promise-100-human-score"
                className="text-violet-600 dark:text-violet-400 hover:underline font-medium"
              >
                on record about not promising undetectability
              </Link>{" "}
              — no tool can honestly guarantee it.
            </p>
          </div>

          <div className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Claude watermark remover — frequently asked questions
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

          {/* Related */}
          <div className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Related tools and reading
            </h2>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed">
              <li>
                <Link
                  href="/humanize-claude-text"
                  className="text-violet-600 dark:text-violet-400 hover:underline font-medium"
                >
                  Humanize Claude text
                </Link>{" "}
                — the full rewrite tool for Claude output, with a breakdown of Claude&rsquo;s
                writing tells.
              </li>
              <li>
                <Link
                  href="/tools/ai-content-detector"
                  className="text-violet-600 dark:text-violet-400 hover:underline font-medium"
                >
                  Free AI content detector
                </Link>{" "}
                — score any passage for the six writing patterns that give AI away.
              </li>
              <li>
                <Link
                  href="/blog/chatgpt-em-dashes"
                  className="text-violet-600 dark:text-violet-400 hover:underline font-medium"
                >
                  Why AI models use so many em dashes
                </Link>{" "}
                — the mechanics behind the punctuation half of the watermark.
              </li>
              <li>
                <Link
                  href="/blog/words-chatgpt-overuses"
                  className="text-violet-600 dark:text-violet-400 hover:underline font-medium"
                >
                  Words AI models overuse
                </Link>{" "}
                — the vocabulary fingerprint no character-stripper can touch.
              </li>
              <li>
                <Link
                  href="/blog/how-to-humanize-ai-text"
                  className="text-violet-600 dark:text-violet-400 hover:underline font-medium"
                >
                  How to humanize AI text
                </Link>{" "}
                — the manual editing checklist, if you would rather do it by hand.
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
            <Link
              href="#tool"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-sm"
            >
              Remove the Claude watermark — it&rsquo;s free →
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
