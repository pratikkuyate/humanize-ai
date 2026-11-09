import { ForgotPasswordForm } from "@/components/PasswordResetForms";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com";

export const metadata = {
  title: "Reset Your Password",
  description: "Get a link to reset your Simply Humanize password.",
  alternates: { canonical: `${siteUrl}/forgot-password` },
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return (
    <div className="bg-white dark:bg-slate-900 min-h-[70vh] flex items-center justify-center px-4 py-16">
      <ForgotPasswordForm />
    </div>
  );
}
