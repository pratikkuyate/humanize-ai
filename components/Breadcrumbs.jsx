import Link from "next/link";

export default function Breadcrumbs({ crumbs }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 flex-wrap text-xs text-slate-400 dark:text-slate-500 mb-6"
    >
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden="true">/</span>}
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-slate-600 dark:text-slate-300">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
