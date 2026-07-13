import Link from "next/link";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com").replace(/\/$/, "");

/**
 * @param {Array<{ label: string; href?: string }>} crumbs
 */
function buildBreadcrumbJsonLd(crumbs) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => {
      /** @type {Record<string, unknown>} */
      const listItem = {
        "@type": "ListItem",
        position: i + 1,
        name: crumb.label,
      };
      // The last crumb is the current page — schema.org allows omitting `item`.
      if (crumb.href) {
        listItem.item = crumb.href === "/" ? `${siteUrl}/` : `${siteUrl}${crumb.href}`;
      }
      return listItem;
    }),
  };
}

/** @param {{ crumbs: Array<{ label: string; href?: string }> }} props */
export default function Breadcrumbs({ crumbs }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(crumbs)) }}
      />
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
    </>
  );
}
