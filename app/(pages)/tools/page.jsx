import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com";

export const metadata = {
  title: "Free AI Writing Tools",
  description:
    "Free AI writing tools from Simply Humanize — an AI content detector and AI text humanizer. No sign-up, no limits. Check your text for AI patterns, then humanize it in seconds.",
  alternates: { canonical: `${siteUrl}/tools` },
  openGraph: {
    title: "Free AI Writing Tools — Simply Humanize",
    description:
      "An AI content detector and AI text humanizer. Free, no sign-up. Check your text for AI patterns, then humanize it.",
    url: `${siteUrl}/tools`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Writing Tools — Simply Humanize",
    description:
      "An AI content detector and AI text humanizer. Free, no sign-up.",
  },
};

const tools = [
  {
    name: "AI Content Detector",
    href: "/tools/ai-content-detector",
    blurb:
      "Paste text and instantly see the AI writing patterns it carries — sentence uniformity, clichés, hedging, and more. Runs in your browser, nothing uploaded.",
    cta: "Open detector",
    live: true,
  },
  {
    name: "AI Text Humanizer",
    href: "/#tool",
    blurb:
      "Rewrite AI-generated text into natural, human-sounding writing with our 3-stage pipeline. Free, no account, results in seconds.",
    cta: "Open humanizer",
    live: true,
  },
];

export default function ToolsHubPage() {
  return (
    <div className="bg-white dark:bg-slate-900 py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Tools" }]} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Free AI Writing Tools
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            A small set of genuinely free tools for working with AI-generated text —
            no sign-up, no limits, no catch. Check your writing for AI patterns, then
            fix them in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all"
            >
              <h2 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-300 mb-2 transition-colors">
                {tool.name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {tool.blurb}
              </p>
              <span className="inline-block mt-3 text-sm font-medium text-violet-600 dark:text-violet-400 group-hover:underline">
                {tool.cta} →
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-sm text-slate-400 dark:text-slate-500">
          More free tools (readability checker, AI cliché finder, word counter) are
          on the way.
        </p>
      </div>
    </div>
  );
}
