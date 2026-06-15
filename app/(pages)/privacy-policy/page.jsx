import Link from "next/link";
import { H2, H3, P, UL } from "@/components/ProseHelpers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata = {
  title: "Privacy Policy",
  description:
    "Read the Humanizer AI privacy policy. Learn how we handle your text, what data we collect, and your rights when using our free AI text humanizer.",
  alternates: { canonical: `${siteUrl}/privacy-policy` },
  openGraph: {
    title: "Privacy Policy — Simply Humanize",
    description:
      "Read our privacy policy. Learn how Simply Humanize handles your text, what data we collect, and your rights.",
    url: `${siteUrl}/privacy-policy`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy — Simply Humanize",
    description:
      "Read our privacy policy. Learn how Simply Humanize handles your text, what data we collect, and your rights.",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white dark:bg-slate-900 py-12 sm:py-16">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-10">
          Last updated: June 2025
        </p>

        <H2>Overview</H2>
        <P>
          Simply Humanize is built to be simple and private by design. This policy explains what happens
          to the text you submit and how we operate the service. We do not require an account, we do
          not sell your data, and we do not retain the text you paste into the tool.
        </P>

        <H2>Information We Process</H2>
        <H3>Text you submit</H3>
        <P>
          When you submit text to be humanized, it is sent to the Google Gemini API for rewriting.
          We do not store your submitted text on our servers after the response is returned. The text
          exists only in transit and in your browser session.
        </P>

        <H3>Server logs</H3>
        <P>
          Like all web services, our hosting infrastructure automatically records standard server
          log data — IP address, browser type, the page URL requested, and timestamp. This
          information is used solely for security monitoring and performance analysis. We do not sell
          or share it with advertisers or third parties.
        </P>

        <H2>How Your Text Is Used</H2>
        <UL
          items={[
            "Your text is processed via the Google Gemini API under Google's terms of service.",
            "We do not retain submitted text after your session ends.",
            "We do not use your text to train our own models.",
            "We do not sell, share, or publish any text you submit.",
          ]}
        />

        <H2>No Accounts, No Profiles</H2>
        <P>
          No registration is required to use Simply Humanize. We do not collect your name, email
          address, or any payment information on the free tier. We do not build profiles of users.
        </P>

        <H2>Cookies</H2>
        <P>
          We do not use advertising or tracking cookies. The site may set minimal functional cookies
          required for basic operation (e.g., session state). We do not use third-party advertising
          networks or cross-site tracking.
        </P>

        <H2>Third-Party Services</H2>
        <UL
          items={[
            <>
              <strong>Google Gemini API</strong> — used to process and rewrite your submitted text.
              See{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 dark:text-violet-400 hover:underline"
              >
                Google's Privacy Policy
              </a>{" "}
              for how Google handles API data.
            </>,
            <strong>Hosting infrastructure</strong>,
          ]}
        />

        <H2>Data Retention</H2>
        <P>
          Submitted text is not retained. Standard server logs are retained for up to 30 days for
          security purposes, then deleted.
        </P>

        <H2>Children's Privacy</H2>
        <P>
          Simply Humanize is not directed at children under 13. We do not knowingly collect personal
          information from children.
        </P>

        <H2>Changes to This Policy</H2>
        <P>
          We may update this policy from time to time. The "Last updated" date at the top of this
          page reflects when changes were last made. Continued use of the service after changes
          constitutes acceptance of the updated policy.
        </P>

        <H2>Contact</H2>
        <P>
          Questions about this privacy policy?{" "}
          <Link
            href="/contact"
            className="text-violet-600 dark:text-violet-400 hover:underline"
          >
            Reach out to us
          </Link>
          .
        </P>
      </article>
    </div>
  );
}
