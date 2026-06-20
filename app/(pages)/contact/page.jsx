import { H2, P, UL } from "@/components/ProseHelpers";
import Breadcrumbs from "@/components/Breadcrumbs";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com";

export const metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Humanizer AI team. We welcome questions, feedback, bug reports, and partnership inquiries.",
  alternates: { canonical: `${siteUrl}/contact` },
  openGraph: {
    title: "Contact Simply Humanize",
    description:
      "Get in touch with the Simply Humanize team. We welcome questions, feedback, bug reports, and partnership inquiries.",
    url: `${siteUrl}/contact`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Simply Humanize",
    description:
      "Get in touch with the Simply Humanize team. We welcome questions, feedback, bug reports, and partnership inquiries.",
  },
};

export default function ContactPage() {
  return (
    <div className="bg-white dark:bg-slate-900 py-12 sm:py-16">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Contact Us
        </h1>
        <P>We're a small team. The best way to reach us is by email — we read everything and reply personally.</P>

        <div className="my-8 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Email us at</p>
          <a
            href="mailto:simplyhumanize@gmail.com"
            className="text-lg font-medium text-violet-700 dark:text-violet-300 hover:underline break-all"
          >
            simplyhumanize@gmail.com
          </a>
        </div>

        <H2>What to Include</H2>
        <P>To help us respond faster, let us know the nature of your message:</P>
        <UL
          items={[
            "Bug report — describe what happened, what you expected, and your browser/OS",
            "Feedback — tell us what's working or what could be better",
            "Partnership or integration inquiry",
            "Press or media request",
          ]}
        />

        <H2>Response Time</H2>
        <P>We aim to respond within 2 business days. We appreciate your patience.</P>
      </article>
    </div>
  );
}
