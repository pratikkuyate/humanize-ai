import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  plans,
  buildPricingSchema,
  PRO_PRICE_DISPLAY,
  CHECKOUT_READY,
  PASS_DAYS,
} from "@/lib/pricing";
import { FREE_ATTEMPTS, FREE_MAX_WORDS } from "@/lib/freeTier";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com").replace(/\/$/, "");
const pageUrl = `${siteUrl}/pricing`;

export const metadata = {
  title: `Pricing — Unlimited AI Humanizing for ${PRO_PRICE_DISPLAY}`,
  description: `Simply Humanize pricing. Free forever with ${FREE_ATTEMPTS} runs a day and no sign-up, or go unlimited for ${PRO_PRICE_DISPLAY} — ${PASS_DAYS} days with no daily cap, no word limit, all three tools.`,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: `Pricing — Unlimited AI Humanizing for ${PRO_PRICE_DISPLAY}`,
    description: `Free forever with ${FREE_ATTEMPTS} runs a day, or ${PASS_DAYS} days unlimited for ${PRO_PRICE_DISPLAY}.`,
    url: pageUrl,
    type: "website",
    siteName: "Simply Humanize",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Simply Humanize pricing" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Pricing — Unlimited AI Humanizing for ${PRO_PRICE_DISPLAY}`,
    description: `Free forever, or ${PASS_DAYS} days unlimited for ${PRO_PRICE_DISPLAY}.`,
    images: ["/opengraph-image"],
  },
};

const faqs = [
  {
    q: "Is there a free plan?",
    a: `Yes, and it does not expire. You get ${FREE_ATTEMPTS} runs a day on each tool — the humanizer, the AI detector, and the Claude watermark remover — with up to ${FREE_MAX_WORDS.toLocaleString()} words per run. No account and no card required.`,
  },
  {
    q: `What does ${PRO_PRICE_DISPLAY} get me?`,
    a: `Unlimited runs for ${PASS_DAYS} days. No daily cap and no word limit on any of the three tools, plus priority processing when demand is high. It is a one-time payment, not a subscription.`,
  },
  {
    q: "Do I need an account to use the free plan?",
    a: "No. The free plan works straight from the page with nothing to sign up for, and your daily runs are tracked on your own device. An account is only needed for Pro, so that your access follows you across devices.",
  },
  {
    q: "What happens when I hit the daily limit?",
    a: "The tool pauses and shows you the upgrade option. Your free runs come back automatically the next day, so you can wait it out at no cost if you would rather not subscribe.",
  },
  {
    q: "Is my text stored?",
    a: "No. The AI detector and the Claude watermark remover run entirely in your browser, so that text never leaves your device at all. Text sent to the humanizer is processed to generate your result and is not retained afterwards.",
  },
  {
    q: "Does it renew automatically?",
    a: `No. Pro is a one-time payment that gives you ${PASS_DAYS} days of unlimited access, so there is nothing to cancel and no card kept on file. When the ${PASS_DAYS} days are up you simply drop back to the free plan, and you can buy another pass whenever you want. Buying early adds the days to the end of your current pass rather than replacing it.`,
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

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="shrink-0 mt-0.5"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildPricingSchema(siteUrl)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema()) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-violet-50 to-white dark:from-slate-900 dark:to-slate-950 py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Pricing" }]} />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            Simple pricing
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            Start free with no account and no card. When {FREE_ATTEMPTS} runs a day
            stops being enough, {PRO_PRICE_DISPLAY} removes the limits entirely for{" "}
            {PASS_DAYS} days — one payment, nothing to cancel.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-12 sm:py-16 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border p-6 sm:p-8 flex flex-col h-full ${
                  plan.highlight
                    ? "border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/20 shadow-lg shadow-violet-500/10"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-6 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm">
                    No limits
                  </span>
                )}

                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {plan.name}
                </h2>

                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {plan.cadence}
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {plan.tagline}
                </p>

                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex gap-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
                    >
                      <span
                        className={
                          plan.highlight
                            ? "text-violet-600 dark:text-violet-400"
                            : "text-emerald-500"
                        }
                      >
                        <CheckIcon />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={`mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                    plan.highlight
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-sm"
                      : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-400 dark:hover:border-violet-500"
                  }`}
                >
                  {plan.cta} →
                </Link>
              </div>
            ))}
          </div>

          {!CHECKOUT_READY && (
            <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
              Pro is opening soon — tell us you want it and we&rsquo;ll get you in first.
            </p>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Pricing questions
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

          <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Still deciding? The free plan is genuinely usable — no account, no card,
              and it never expires.{" "}
              <Link
                href="/#tool"
                className="text-violet-600 dark:text-violet-400 hover:underline font-medium"
              >
                Try the humanizer
              </Link>{" "}
              and see what you think first.
            </p>
          </div>
        </article>
      </section>
    </>
  );
}
