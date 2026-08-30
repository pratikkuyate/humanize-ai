import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";
import { GOOGLE_READY } from "@/lib/google";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com";

/**
 * Sign-in page.
 *
 * `noindex` on purpose. An account page has no search value, and letting Google
 * index it splits crawl budget away from the tool and content pages that do the
 * ranking work.
 */
export const metadata = {
  title: "Sign In",
  description: "Sign in to your Simply Humanize account to manage your plan.",
  alternates: { canonical: `${siteUrl}/login` },
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <div className="bg-white dark:bg-slate-900 min-h-[70vh] flex items-center justify-center px-4 py-16">
      {/* useSearchParams needs a Suspense boundary or the whole route opts out
          of static rendering at build time. */}
      <Suspense fallback={<div className="w-full max-w-md h-96" />}>
        <AuthForm mode="login" googleEnabled={GOOGLE_READY} />
      </Suspense>
    </div>
  );
}
