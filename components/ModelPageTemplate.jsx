import dynamic from "next/dynamic";
import Link from "next/link";
import { aiModels } from "@/lib/aiModels";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com";

const HumanizerTool = dynamic(() => import("@/components/HumanizerTool"), {
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="h-[428px] sm:h-[628px] rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      <div className="h-[448px] rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>
  ),
});

function buildFaqSchema(model) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: model.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

function buildBreadcrumbSchema(model) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: model.h1,
        item: `${siteUrl}${model.urlPath}`,
      },
    ],
  };
}

export default function ModelPageTemplate({ model }) {
  const siblings = aiModels.filter((m) => m.slug !== model.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(model)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbSchema(model)) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-violet-50 to-white dark:from-slate-900 dark:to-slate-950 py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-slate-400 dark:text-slate-500 mb-6">
            <Link href="/" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-600 dark:text-slate-300">{model.h1}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            {model.h1}
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            {model.hero}
          </p>
        </div>
      </section>

      {/* Embedded tool */}
      <section className="py-10 sm:py-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-4">
            Paste your {model.name} output below — free, no sign-up
          </p>
          <HumanizerTool />
        </div>
      </section>

      {/* Body content */}
      <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {model.sections.map((section) => (
            <div key={section.heading} className="mb-10">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
                {section.heading}
              </h2>
              {section.body && (
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {section.body}
                </p>
              )}
              {section.steps && (
                <ol className="mt-3 space-y-3 list-none">
                  {section.steps.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-sm font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-0.5">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ))}

          {/* FAQ */}
          <div className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {model.faqs.map((faq) => (
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

          {/* Also humanize — sibling model links */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
              Also humanize
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {siblings.map((s) => (
                <Link
                  key={s.slug}
                  href={s.urlPath}
                  className="group rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-violet-400 dark:hover:border-violet-500 transition-colors"
                >
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {s.h1}
                  </p>
                  <p className="text-violet-600 dark:text-violet-400 mt-1 text-xs">
                    Humanize {s.name} text →
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-sm"
            >
              Try Simply Humanize — it's free →
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:border-violet-400 dark:hover:border-violet-500 transition-colors"
            >
              Learn how it works
            </Link>
          </div>
        </article>
      </section>
    </>
  );
}
