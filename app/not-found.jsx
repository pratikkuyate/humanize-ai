import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist. Head back to the Simply Humanize AI text humanizer tool.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-md">
          <p className="text-8xl font-extrabold text-violet-500 mb-4">404</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Page not found
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            The page you're looking for doesn't exist or may have been moved.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-sm"
          >
            Back to the humanizer tool →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
