import Link from "next/link";

const pageLinks = [
  { label: "Use Cases", href: "/use-cases" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms" },
];

const toolLinks = [
  { label: "AI Content Detector", href: "/tools/ai-content-detector" },
  { label: "AI Text Humanizer", href: "/#tool" },
  { label: "All Free Tools", href: "/tools" },
];

const modelLinks = [
  { label: "Humanize ChatGPT text", href: "/humanize-chatgpt-text" },
  { label: "Humanize Claude text", href: "/humanize-claude-text" },
  { label: "Humanize Gemini text", href: "/humanize-gemini-text" },
];

const linkClass =
  "text-xs text-slate-400 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-8 sm:justify-between">

          {/* Brand */}
          <div className="shrink-0">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Simply Humanize
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Writing enhancement and editing tool
            </p>
          </div>

          {/* Pages */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Pages
            </p>
            <nav className="flex flex-col gap-1.5">
              {pageLinks.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Free tools */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Free tools
            </p>
            <nav className="flex flex-col gap-1.5">
              {toolLinks.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Humanize by AI tool */}
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Humanize by AI tool
            </p>
            <nav className="flex flex-col gap-1.5">
              {modelLinks.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

        </div>
      </div>
    </footer>
  );
}
