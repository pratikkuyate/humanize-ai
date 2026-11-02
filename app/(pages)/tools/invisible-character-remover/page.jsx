import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import WatermarkRemoverTool from "@/components/WatermarkRemoverTool";
import { ExternalLink, renderInline, plainText } from "@/components/InlineText";
import { KNOWN_CHAR_COUNT } from "@/lib/watermarkChars";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com").replace(/\/$/, "");
const pagePath = "/tools/invisible-character-remover";
const pageUrl = `${siteUrl}${pagePath}`;

export const metadata = {
  title: "Zero-Width & Invisible Character Remover",
  description:
    "Free invisible character remover. Find and strip zero-width spaces, no-break spaces, BOMs, direction marks and hidden tag characters from any text. Runs in your browser.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Invisible Character Remover — Free & Private",
    description:
      "Find and strip zero-width spaces, BOMs, direction marks and hidden tag characters from any text. Runs in your browser, no sign-up.",
    url: pageUrl,
    type: "website",
    siteName: "Simply Humanize",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Invisible Character Remover — Free Online Tool" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Invisible Character Remover — Free & Private",
    description: "Find and strip zero-width spaces and other hidden characters from any text. Free, no sign-up.",
    images: ["/opengraph-image"],
  },
};

/** The characters people most often find, shown as a reference table. */
const characters = [
  {
    code: "U+200B",
    ref: "https://en.wikipedia.org/wiki/Zero-width_space",
    name: "Zero-width space",
    from: "Web pages, CMS editors, messaging apps",
    problem: "Splits a word invisibly, so search, find-and-replace and spell check miss it",
  },
  {
    code: "U+FEFF",
    ref: "https://en.wikipedia.org/wiki/Byte_order_mark",
    name: "Byte order mark (BOM)",
    from: "Files saved by some Windows editors and exports",
    problem: "Breaks CSV headers, JSON parsing and the first line of scripts",
  },
  {
    code: "U+00A0",
    ref: "https://en.wikipedia.org/wiki/Non-breaking_space",
    name: "No-break space",
    from: "Word, Google Docs, HTML &nbsp;, PDFs",
    problem: "Looks like a space but fails exact matches, form validation and code",
  },
  {
    code: "U+202F",
    ref: "https://en.wikipedia.org/wiki/Non-breaking_space",
    name: "Narrow no-break space",
    from: "AI chat output (often around em dashes), French typography",
    problem: "Same as above; also a recognisable fingerprint of pasted AI output",
  },
  {
    code: "U+200E / U+200F",
    ref: "https://en.wikipedia.org/wiki/Implicit_directional_marks",
    name: "Left-to-right / right-to-left marks",
    from: "Mixed-language text, phone keyboards, copied URLs",
    problem: "Can reorder how text displays; a known trick for disguising code and links",
  },
  {
    code: "U+00AD",
    ref: "https://en.wikipedia.org/wiki/Soft_hyphen",
    name: "Soft hyphen",
    from: "PDFs, e-books, justified layouts",
    problem: "Invisible until a line breaks, then a stray hyphen appears",
  },
  {
    code: "U+E0000–E007F",
    ref: "https://en.wikipedia.org/wiki/Tags_(Unicode_block)",
    name: "Unicode tag characters",
    from: "Deliberately inserted text",
    problem: "Render as nothing at all, so they can carry hidden messages or instructions",
  },
];

const faqs = [
  {
    q: "Is the invisible character remover free?",
    a: "Yes. It runs entirely in your browser, so there is no account, no sign-up and no usage limit.",
  },
  {
    q: "Is my text uploaded anywhere?",
    a: "No. The scan is plain JavaScript running on your device. Your text is never sent to a server, and the tool keeps working if you go offline after the page loads.",
  },
  {
    q: "Does ChatGPT add hidden characters or a watermark to its text?",
    a: "Text copied from AI chat tools can contain unusual characters such as narrow no-break spaces, and some people have read those as a watermark. OpenAI has not described them as one. Either way, they are ordinary Unicode characters and this tool removes them. Google's [SynthID](/blog/does-gemini-watermark-text) for Gemini is different: it is a statistical pattern in word choice, not a character, so no character remover can take it out.",
  },
  {
    q: "Will removing hidden characters stop text being detected as AI?",
    a: "No. AI detectors look at writing patterns (sentence rhythm, vocabulary, structure), not at invisible characters. Removing them fixes formatting problems; it does not change how the writing reads. The [AI content detector](/tools/ai-content-detector) shows which patterns are actually there.",
  },
  {
    q: "Will it break my emoji or non-English text?",
    a: "No. A zero-width joiner that holds an emoji sequence together (such as a family emoji) is kept, and so is a zero-width non-joiner used for correct spelling in scripts like Persian or Hindi. Only stray characters are removed.",
  },
  {
    q: "What does the 'normalize typography' option do?",
    a: "It is off by default here. Turn it on to also convert curly quotes, em dashes and the single ellipsis character to plain ASCII. If you only want to replace em dashes, with a choice of commas, parentheses or periods, use the [em dash remover](/tools/em-dash-remover).",
  },
];

function buildFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: plainText(f.a) },
    })),
  };
}

function buildAppSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Invisible Character Remover",
    url: pageUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires JavaScript",
    description:
      "Free browser-based tool that finds and removes zero-width spaces, no-break spaces, byte order marks, direction marks and Unicode tag characters from text.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      `Checks for ${KNOWN_CHAR_COUNT} hidden characters, including the full Unicode Tags block`,
      "Lists every character found, with its code point and count",
      "Keeps emoji joiners and script-required non-joiners intact",
      "Runs entirely in the browser — nothing is uploaded",
      "No sign-up or account required",
    ],
    isAccessibleForFree: true,
    publisher: { "@type": "Organization", name: "Simply Humanize", url: siteUrl },
  };
}

const linkClass = "text-violet-600 dark:text-violet-400 hover:underline font-medium";

export default function InvisibleCharacterRemoverPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema()) }}
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
              { label: "Invisible Character Remover" },
            ]}
          />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            Invisible Character Remover
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            Paste any text to find and strip the characters you can&rsquo;t see:
            zero-width spaces, no-break spaces, byte order marks, direction marks and
            hidden Unicode tag characters. You get a list of exactly what was found,
            and your wording stays as written. Free, no sign-up, and nothing leaves
            your browser.
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
            Remove invisible characters — instant, in your browser
          </p>
          <WatermarkRemoverTool variant="generic" />
        </div>
      </section>

      {/* Body */}
      <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
              What are invisible characters?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              They are real Unicode characters that take up no visible space, or look
              exactly like an ordinary space. Most have legitimate jobs in
              typesetting and in languages written right to left. The trouble starts
              when they ride along in copied text: a word that looks identical no
              longer matches in search, a spreadsheet lookup fails, or code throws an
              error on a line that looks fine.
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
              The hidden characters this tool finds
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              The scan checks {KNOWN_CHAR_COUNT.toLocaleString()} characters in total.
              These are the ones that turn up most often:
            </p>
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full min-w-[600px] text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 dark:border-slate-700">
                    <th className="text-left py-2 pr-4 font-semibold text-slate-700 dark:text-slate-200">Character</th>
                    <th className="text-left py-2 pr-4 font-semibold text-slate-700 dark:text-slate-200">Usually comes from</th>
                    <th className="text-left py-2 font-semibold text-slate-700 dark:text-slate-200">Problem it causes</th>
                  </tr>
                </thead>
                <tbody>
                  {characters.map((c) => (
                    <tr key={c.code} className="border-b border-slate-200 dark:border-slate-800 align-top">
                      <td className="py-3 pr-4">
                        <span className="font-mono text-xs text-violet-600 dark:text-violet-400 block">
                          <ExternalLink href={c.ref}>{c.code}</ExternalLink>
                        </span>
                        <span className="text-slate-600 dark:text-slate-300 text-xs">{c.name}</span>
                      </td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{c.from}</td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">{c.problem}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
              When to use an invisible character remover
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Before pasting into a CMS or form:</strong>{" "}
                stray characters end up in URLs, slugs and meta descriptions.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">When find, search or a formula fails:</strong>{" "}
                a zero-width space inside a word is the usual culprit.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Before using text in code or data:</strong>{" "}
                BOMs and no-break spaces break CSV headers, JSON and variable names.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">When text comes from an AI chat:</strong>{" "}
                output copied from ChatGPT, Claude and similar tools can carry unusual spaces. For Claude
                specifically, see the{" "}
                <Link href="/tools/claude-watermark-remover" className={linkClass}>
                  Claude watermark remover
                </Link>
                .
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">When a message might hide instructions:</strong>{" "}
                Unicode tag characters can smuggle text that people can&rsquo;t see but software, including
                AI models, can read. The scan flags every one.
              </li>
            </ul>
          </div>

          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
              What removing hidden characters won&rsquo;t do
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              It won&rsquo;t change how your writing reads, and it won&rsquo;t change an AI
              detector&rsquo;s score: detectors measure writing patterns, not invisible
              characters. If text sounds machine-written, the{" "}
              <Link href="/tools/ai-content-detector" className={linkClass}>
                AI content detector
              </Link>{" "}
              shows why, and the{" "}
              <Link href="/#tool" className={linkClass}>
                humanizer
              </Link>{" "}
              rewrites it. We explain why we{" "}
              <Link href="/blog/why-we-dont-promise-100-human-score" className={linkClass}>
                don&rsquo;t promise undetectable text
              </Link>
              .
            </p>
          </div>

          <div className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Invisible character remover — frequently asked questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">{faq.q}</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                    {renderInline(faq.a)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Related tools and reading
            </h2>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed">
              <li>
                <Link href="/tools/em-dash-remover" className={linkClass}>
                  Em dash remover
                </Link>{" "}
                — replace AI em dashes with commas, parentheses or periods.
              </li>
              <li>
                <Link href="/tools/claude-watermark-remover" className={linkClass}>
                  Claude watermark remover
                </Link>{" "}
                — what the &ldquo;Claude watermark&rdquo; actually is, and how to remove it.
              </li>
              <li>
                <Link href="/blog/does-gemini-watermark-text" className={linkClass}>
                  Does Gemini watermark text?
                </Link>{" "}
                — SynthID explained, and why it is not a hidden character.
              </li>
              <li>
                <Link href="/blog/ai-checker-that-doesnt-store-data" className={linkClass}>
                  AI checkers that don&rsquo;t store your data
                </Link>{" "}
                — how to tell whether a tool really runs in your browser.
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
            <Link
              href="#tool"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-sm"
            >
              Remove invisible characters — it&rsquo;s free →
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
