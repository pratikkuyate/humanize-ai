import dynamic from "next/dynamic";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import EmDashRemoverTool from "@/components/EmDashRemoverTool";
import { renderInline, plainText } from "@/components/InlineText";
import { EM_DASH_STYLES } from "@/lib/emDash";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com").replace(/\/$/, "");
const pagePath = "/tools/em-dash-remover";
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
  title: "Em Dash Remover — Replace AI Em Dashes Free",
  description:
    "Free em dash remover. Replace the em dashes in ChatGPT, Claude or Gemini text with commas, parentheses, periods or hyphens. Runs in your browser, no sign-up.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Em Dash Remover — Replace AI Em Dashes Free",
    description:
      "Replace every em dash with commas, parentheses, periods or hyphens in one click. Free, private, no sign-up.",
    url: pageUrl,
    type: "website",
    siteName: "Simply Humanize",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Em Dash Remover — Free Online Tool" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Em Dash Remover — Replace AI Em Dashes Free",
    description: "Replace every em dash with ordinary punctuation in one click. Free, private, no sign-up.",
    images: ["/opengraph-image"],
  },
};

const faqs = [
  {
    q: "Is the em dash remover free?",
    a: "Yes. It runs entirely in your browser, so there is no account, no sign-up and no usage limit.",
  },
  {
    q: "Is my text uploaded anywhere?",
    a: "No. The replacement happens locally in JavaScript. Your text never leaves your device, and the tool keeps working if you go offline after the page loads.",
  },
  {
    q: "Will removing em dashes stop my text being flagged as AI?",
    a: "Not on its own, and no tool can honestly promise that. The em dash is one visible habit among many; detectors and readers also notice uniform sentence length, stock vocabulary and formulaic transitions. Use the [AI content detector](/tools/ai-content-detector) to see which patterns remain, and the [humanizer](/#tool) if you want those rewritten too.",
  },
  {
    q: "Which replacement should I choose?",
    a: "Commas are the safest default: they work for a single dash and for a pair around an aside. Choose parentheses when the aside is genuinely secondary, periods when you want shorter sentences, and a spaced hyphen if you like the dash rhythm but need plain keyboard characters.",
  },
  {
    q: "Does it change number ranges like 2019–2024?",
    a: "No. Ranges use an en dash with no spaces, which the tool leaves alone. It only treats spaced en dashes ( – ) and double hyphens (--) as em dashes, and you can switch that off.",
  },
  {
    q: "Does it remove the hidden spaces around Claude's em dashes?",
    a: "Yes. Any narrow no-break, thin or hair spaces hugging a dash are removed along with it. For hidden characters elsewhere in the text, use the [invisible character remover](/tools/invisible-character-remover).",
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
    name: "Em Dash Remover",
    url: pageUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires JavaScript",
    description:
      "Free browser-based tool that replaces em dashes in AI-generated text with commas, parentheses, periods or spaced hyphens.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Four replacement styles: commas, parentheses, periods, spaced hyphen",
      "Detects paired dashes around an aside",
      "Optionally catches spaced en dashes and double hyphens; leaves number ranges alone",
      "Runs entirely in the browser — nothing is uploaded",
      "No sign-up or account required",
    ],
    isAccessibleForFree: true,
    publisher: { "@type": "Organization", name: "Simply Humanize", url: siteUrl },
  };
}

const linkClass = "text-violet-600 dark:text-violet-400 hover:underline font-medium";

export default function EmDashRemoverPage() {
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
              { label: "Em Dash Remover" },
            ]}
          />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            Em Dash Remover
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            Paste text from ChatGPT, Claude or Gemini and replace every em dash with
            ordinary punctuation: commas, parentheses, periods or a plain hyphen. The
            sentence keeps its pause; it just stops looking machine-written. Free, no
            sign-up, and it runs entirely in your browser.
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
            Remove em dashes — instant, in your browser
          </p>
          <EmDashRemoverTool />
        </div>
      </section>

      {/* Body */}
      <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
              Why do AI tools use so many em dashes?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
              Language models learn from edited, published prose, where the em dash is
              common, and the dash is a convenient way to bolt an extra clause onto a
              sentence without deciding how it relates to the rest. The result is
              several dashes per paragraph, far more than most people type, which is
              why readers now treat them as a tell. We cover the mechanics in{" "}
              <Link href="/blog/chatgpt-em-dashes" className={linkClass}>
                why ChatGPT uses so many em dashes
              </Link>
              .
            </p>
          </div>

          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Which replacement should you pick?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              An em dash does one of two jobs: a single dash marks a pause or a
              turn, and a pair of dashes encloses an aside. Each style handles those
              jobs a little differently.
            </p>
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full min-w-[520px] text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 dark:border-slate-700">
                    <th className="text-left py-2 pr-4 font-semibold text-slate-700 dark:text-slate-200">Style</th>
                    <th className="text-left py-2 pr-4 font-semibold text-slate-700 dark:text-slate-200">Example</th>
                    <th className="text-left py-2 font-semibold text-slate-700 dark:text-slate-200">Best for</th>
                  </tr>
                </thead>
                <tbody>
                  {EM_DASH_STYLES.map((s) => (
                    <tr key={s.id} className="border-b border-slate-200 dark:border-slate-800 align-top">
                      <td className="py-3 pr-4 font-medium text-slate-700 dark:text-slate-200">{s.label}</td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{s.example}</td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">{s.hint}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
              What gets replaced, and what is left alone
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Replaced:</strong> every em dash (—),
                with or without spaces, including the narrow no-break spaces Claude puts around it.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Replaced if you choose:</strong> spaced
                en dashes ( – ) and double hyphens (--), which people and some apps type in place of an em dash.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Left alone:</strong> number and date
                ranges such as 2019–2024, hyphenated words, and command-line flags like --help.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Tidied:</strong> a dash next to other
                punctuation is dropped rather than doubled, so you never get &ldquo;,,&rdquo; or &ldquo;, .&rdquo;.
                A dash at the start of a line becomes a list hyphen.
              </li>
            </ul>
          </div>

          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Does removing em dashes make AI text sound human?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              It removes the most visible tell, but only one. The deeper patterns are
              even sentence length, stock vocabulary, and transitions like
              &ldquo;moreover&rdquo; and &ldquo;in today&rsquo;s fast-paced world&rdquo;. Run
              the result through the{" "}
              <Link href="/tools/ai-content-detector" className={linkClass}>
                AI content detector
              </Link>{" "}
              to see what is left, or check the list of{" "}
              <Link href="/blog/words-chatgpt-overuses" className={linkClass}>
                words ChatGPT overuses
              </Link>
              . If you would rather not edit by hand, the humanizer below rewrites
              for rhythm and vocabulary while keeping your meaning.
            </p>
          </div>
        </article>
      </section>

      {/* Humanizer — the rest of the job */}
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
              Now humanize the rest of the writing
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Dashes fixed? Paste the text here to vary sentence rhythm, replace
              templated transitions and cut filler, with your meaning kept intact.
            </p>
          </div>
          <HumanizerTool />
        </div>
      </section>

      {/* FAQ + closing */}
      <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Em dash remover — frequently asked questions
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
                <Link href="/humanize-chatgpt-text" className={linkClass}>
                  Humanize ChatGPT text
                </Link>{" "}
                — the full rewrite for ChatGPT drafts, not just the punctuation.
              </li>
              <li>
                <Link href="/tools/invisible-character-remover" className={linkClass}>
                  Invisible character remover
                </Link>{" "}
                — strip zero-width spaces and other hidden characters from pasted text.
              </li>
              <li>
                <Link href="/tools/claude-watermark-remover" className={linkClass}>
                  Claude watermark remover
                </Link>{" "}
                — the hidden characters and typography Claude output carries.
              </li>
              <li>
                <Link href="/blog/the-case-for-short-sentences" className={linkClass}>
                  The case for short sentences
                </Link>{" "}
                — why the period is often the better replacement.
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
            <Link
              href="#tool"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-sm"
            >
              Remove em dashes — it&rsquo;s free →
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
