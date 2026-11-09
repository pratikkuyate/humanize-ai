import { ResetPasswordForm } from "@/components/PasswordResetForms";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com";

/**
 * Where the emailed reset link lands. The token is in the URL fragment and is
 * read client-side; `no-referrer` is a second guard so the page URL never
 * leaves in a Referer header.
 */
export const metadata = {
  title: "Choose a New Password",
  description: "Set a new password for your Simply Humanize account.",
  alternates: { canonical: `${siteUrl}/reset-password` },
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ResetPasswordPage() {
  return (
    <div className="bg-white dark:bg-slate-900 min-h-[70vh] flex items-center justify-center px-4 py-16">
      <ResetPasswordForm />
    </div>
  );
}
