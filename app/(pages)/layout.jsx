import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

/** @param {{ children: React.ReactNode }} props */
export default function PagesLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
