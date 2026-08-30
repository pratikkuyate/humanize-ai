import AccountPanel from "@/components/AccountPanel";
import { CHECKOUT_READY } from "@/lib/pricing";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com";

export const metadata = {
  title: "Your Account",
  description: "Manage your Simply Humanize plan.",
  alternates: { canonical: `${siteUrl}/account` },
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div className="bg-white dark:bg-slate-900 py-12 sm:py-16 min-h-[70vh]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <AccountPanel checkoutReady={CHECKOUT_READY} />
      </div>
    </div>
  );
}
