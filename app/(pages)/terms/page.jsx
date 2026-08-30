import Link from "next/link";
import { H2, H3, P, UL } from "@/components/ProseHelpers";
import Breadcrumbs from "@/components/Breadcrumbs";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com";

export const metadata = {
  title: "Terms of Service",
  description:
    "Simply Humanize terms of service. Understand the rules for using our free AI text humanizer tool powered by Google Gemini.",
  alternates: { canonical: `${siteUrl}/terms` },
  openGraph: {
    title: "Terms of Service — Simply Humanize",
    description:
      "Read our terms of service. Understand the rules for using the Simply Humanize free AI text humanizer tool.",
    url: `${siteUrl}/terms`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service — Simply Humanize",
    description:
      "Read our terms of service. Understand the rules for using the Simply Humanize free AI text humanizer tool.",
  },
};

export default function TermsPage() {
  return (
    <div className="bg-white dark:bg-slate-900 py-12 sm:py-16">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]} />
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-10">
          Last updated: June 2025
        </p>

        <H2>Acceptance of Terms</H2>
        <P>
          By accessing or using Simply Humanize, you agree to be bound by these Terms of Service. If
          you do not agree, please do not use the service.
        </P>

        <H2>The Service</H2>
        <P>
          Simply Humanize is a web-based tool that rewrites AI-generated text into natural,
          human-sounding writing using the Google Gemini API. A free plan is available with no
          account and no payment, subject to a daily limit on runs and a limit on the length of each
          run. Neither plan carries a guarantee of uptime, availability, or service level.
        </P>

        <H2>Accounts</H2>
        <P>
          An account is required only to purchase Pro. You are responsible for keeping your password
          secure and for activity that takes place under your account. Tell us promptly if you
          believe someone else has access to it. We may suspend or close an account that breaches
          the Acceptable Use section below.
        </P>

        <H2>Pro Passes, Payment, and Refunds</H2>
        <P>
          Pro is sold as a one-time pass granting a fixed number of days of access from the moment
          payment is confirmed. It is <strong>not</strong> a subscription: nothing renews
          automatically, no card details are stored for future charges, and there is nothing to
          cancel. When the pass expires your account returns to the free plan. Buying another pass
          while one is still running adds its days to the end of the current one.
        </P>
        <P>
          Payments are processed by Razorpay. Prices are shown inclusive of the stated currency and
          may change for future purchases, though a change never affects a pass you have already
          bought.
        </P>
        <P>
          If a pass fails to activate after you have been charged, or the service is materially
          unavailable for a sustained part of your pass, contact us and we will restore the access
          or refund you. Beyond that, because access begins immediately on payment, passes are
          otherwise non-refundable once used. Nothing here limits any refund rights you have under
          the consumer law that applies to you.
        </P>
        <P>
          &ldquo;Unlimited&rdquo; on the Pro plan means we do not apply a daily run cap or a
          per-run word limit to ordinary human use of the tools. It does not extend to automated,
          scripted, or resold use, or to volumes far outside normal individual use. If usage on an
          account reaches that point we will contact you before taking any action.
        </P>

        <H2>Acceptable Use</H2>
        <P>You agree not to use Simply Humanize to:</P>
        <UL
          items={[
            "Submit content that is illegal, defamatory, harassing, or infringes on third-party intellectual property rights.",
            "Attempt to reverse-engineer, scrape, or abuse the service or its underlying API.",
            "Circumvent any rate limits or access controls, or share account credentials to extend paid access beyond one person.",
            "Submit malware, malicious code, or content designed to disrupt the service.",
          ]}
        />
        <P>
          You are solely responsible for the content you submit and any use you make of the output.
        </P>

        <H2>Intellectual Property</H2>
        <H3>Your content</H3>
        <P>
          You retain full ownership of any text you submit to Simply Humanize. We make no claim over
          your input or the rewritten output returned to you.
        </P>
        <H3>Our property</H3>
        <P>
          The Simply Humanize brand, logo, website design, and underlying software are our property and
          may not be reproduced or used without permission.
        </P>

        <H2>AI Output Disclaimer</H2>
        <P>
          Simply Humanize rewrites text using a large language model. The output is generated
          automatically and may contain inaccuracies, omissions, or unintended changes in meaning.
          You are responsible for reviewing all output before publishing or using it. We do not
          guarantee that rewritten content will bypass AI detection tools or be factually accurate.
        </P>

        <H2>Academic and Professional Integrity</H2>
        <P>
          You are solely responsible for complying with the policies of your academic institution,
          employer, or any other organization regarding the use of AI-generated or AI-assisted
          content. We neither encourage nor condone misrepresentation of AI-assisted work.
        </P>

        <H2>No Warranties</H2>
        <P>
          The service is provided "as is" and "as available" without warranties of any kind, either
          express or implied, including but not limited to warranties of merchantability, fitness for
          a particular purpose, or non-infringement.
        </P>

        <H2>Limitation of Liability</H2>
        <P>
          To the fullest extent permitted by law, Simply Humanize shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages arising from your use of, or
          inability to use, the service.
        </P>

        <H2>Changes to These Terms</H2>
        <P>
          We may update these terms at any time. The "Last updated" date at the top of this page
          reflects when changes were last made. Your continued use of the service after changes
          constitutes your acceptance of the updated terms.
        </P>

        <H2>Governing Law</H2>
        <P>
          These terms are governed by applicable law. Any disputes shall be resolved in the
          appropriate courts of competent jurisdiction.
        </P>

        <H2>Contact</H2>
        <P>
          Questions about these terms?{" "}
          <Link
            href="/contact"
            className="text-violet-600 dark:text-violet-400 hover:underline"
          >
            Get in touch with us.
          </Link>
        </P>
      </article>
    </div>
  );
}
