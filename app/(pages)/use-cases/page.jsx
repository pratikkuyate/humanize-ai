import Link from "next/link";
import { useCases } from "@/lib/useCases";
import Breadcrumbs from "@/components/Breadcrumbs";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com";

export const metadata = {
  title: "AI Humanizer Use Cases — Who Uses Simply Humanize",
  description:
    "Discover how students, bloggers, content writers, marketers, SEO professionals, agencies, and businesses use Simply Humanize to turn AI-generated text into natural human writing.",
  alternates: { canonical: `${siteUrl}/use-cases` },
  openGraph: {
    title: "AI Humanizer Use Cases — Who Uses Simply Humanize",
    description:
      "Explore how different people use Simply Humanize — from students humanizing essays to agencies scaling content production without losing quality.",
    url: `${siteUrl}/use-cases`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Humanizer Use Cases — Who Uses Simply Humanize",
    description:
      "From students to agencies — see how Simply Humanize helps every kind of writer produce natural, human-sounding content at AI speed.",
  },
};

export default function UseCasesHubPage() {
  return (
    <div className="bg-white dark:bg-slate-900 py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="max-w-3xl mb-12">
          <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Use Cases" }]} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Who Uses an AI Text Humanizer?
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            AI writes fast. Every type of writer has learned that. The gap AI leaves behind is
            voice — output that is technically correct but rhythmically flat, generic in tone, and
            recognizably machine-made. Simply Humanize is the step that closes that gap. Here is
            how different people put it to work.
          </p>
        </div>

        {/* Use-case cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {useCases.map((uc) => (
            <Link
              key={uc.slug}
              href={`/ai-humanizer-for/${uc.slug}`}
              className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-5 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all"
            >
              <h2 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-300 mb-2 transition-colors">
                {uc.h1}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                {uc.hero}
              </p>
              <span className="inline-block mt-3 text-sm font-medium text-violet-600 dark:text-violet-400 group-hover:underline">
                Learn more →
              </span>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 pt-10 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg">
            Whatever you write, Simply Humanize gives the human layer back — in seconds.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-sm"
          >
            Try Simply Humanize free — no sign-up →
          </Link>
        </div>
      </div>
    </div>
  );
}
