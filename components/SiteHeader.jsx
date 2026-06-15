import Link from "next/link";

function LogoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 17l.75 2.25L8 20l-2.25.75L5 23l-.75-2.25L2 20l2.25-.75L5 17z" />
    </svg>
  );
}

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <LogoIcon />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900 dark:text-white leading-none">
              Simply Humanize
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-none mt-0.5 hidden sm:block">
              Transform AI-generated text into natural, readable content.
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            3-Stage Pipeline
          </span>
        </div>
      </div>
    </header>
  );
}
