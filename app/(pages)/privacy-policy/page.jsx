import Link from "next/link";
import { H2, H3, P, UL } from "@/components/ProseHelpers";
import Breadcrumbs from "@/components/Breadcrumbs";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Read the Simply Humanize privacy policy. Learn how we handle your text, what data we collect, and your rights when using our free AI text humanizer.",
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
        <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />
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

        <H3>Account details</H3>
        <P>
          You do not need an account to use Simply Humanize. Every tool on the free plan works with
          no registration at all, and if you never create an account we hold none of the information
          in this section.
        </P>
        <P>
          If you do create one, we store your email address, an optional display name, and a
          cryptographic hash of your password — never the password itself. If you sign in with
          Google we store your Google account identifier, your email address, and your name and
          profile picture as Google supplies them. We also record which sessions are signed in, so
          that you can be signed out, along with the browser identifier and a one-way hash of the IP
          address each session was created from.
        </P>

        <H3>Payments</H3>
        <P>
          Payments are processed by Razorpay. Your card or banking details are entered directly with
          Razorpay and never reach our servers — we cannot see them and do not store them. What we
          keep is a record of each purchase: the Razorpay order and payment identifiers, the amount
          and currency, and when it was paid, so that we can honour the access you bought and answer
          billing questions.
        </P>

        <H2>No Profiles or Advertising</H2>
        <P>
          We do not build behavioural profiles, and we do not sell or share your information with
          advertisers. Account data is used to sign you in, to give you the access you have paid
          for, and to respond if you contact us — nothing else.
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
            <>
              <strong>Razorpay</strong> — processes payments for Pro. Card and banking details are
              handled entirely by Razorpay. See{" "}
              <a
                href="https://razorpay.com/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 dark:text-violet-400 hover:underline"
              >
                Razorpay's Privacy Policy
              </a>
              .
            </>,
            <>
              <strong>Google Sign-In</strong> — optional. Used only if you choose to sign in with
              Google, and only to confirm your identity and email address.
            </>,
            <>
              <strong>Neon</strong> — the managed database where account and purchase records are
              stored.
            </>,
            <strong>Hosting infrastructure</strong>,
          ]}
        />

        <H2>Data Retention</H2>
        <P>
          Submitted text is not retained. Standard server logs are retained for up to 30 days for
          security purposes, then deleted.
        </P>
        <P>
          Account details are kept for as long as your account exists. Sign-in sessions expire
          automatically and are removed when they do, or immediately when you sign out. Records of
          completed payments are kept for as long as tax and accounting rules require, even after an
          account is closed. Free-plan usage counts are held in a cookie on your own device, or as a
          one-way hash with no name or address attached, and reset on their own each day.
        </P>
        <P>
          To delete your account and the data attached to it, email us and we will action it.
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
