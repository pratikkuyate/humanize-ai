import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";
import { GOOGLE_READY } from "@/lib/google";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com";

export const metadata = {
  title: "Create an Account",
  description:
    "Create a Simply Humanize account to go Pro. The free tools work without one.",
  alternates: { canonical: `${siteUrl}/signup` },
  robots: { index: false, follow: true },
};

export default function SignupPage() {
  return (
    <div className="bg-white dark:bg-slate-900 min-h-[70vh] flex items-center justify-center px-4 py-16">
      <Suspense fallback={<div className="w-full max-w-md h-96" />}>
        <AuthForm mode="signup" googleEnabled={GOOGLE_READY} />
      </Suspense>
    </div>
  );
}
