import { useCases } from "@/lib/useCases";
import { aiModels } from "@/lib/aiModels";
import { languages } from "@/lib/languages";

// Stable per-page dates: bump an entry ONLY when that page's content genuinely
// changes. A lastmod that changes on every deploy teaches crawlers to ignore it.
const STATIC_DATES = {
  "/": "2026-07-14", // hreflang alternates added
  "/about": "2026-07-13",
  "/contact": "2026-07-13",
  "/privacy-policy": "2026-07-13",
  "/terms": "2026-07-13",
  "/use-cases": "2026-07-13",
  "/tools": "2026-07-13",
  "/tools/ai-content-detector": "2026-07-13",
};

export default function sitemap() {
  // Strip a trailing slash so a NEXT_PUBLIC_SITE_URL ending in "/" can't
  // produce "https://site.com//about" (same normalization as app/robots.js).
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com").replace(/\/$/, "");

  return [
    {
      url: `${baseUrl}/`,
      lastModified: STATIC_DATES["/"],
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: STATIC_DATES["/about"],
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: STATIC_DATES["/contact"],
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: STATIC_DATES["/privacy-policy"],
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: STATIC_DATES["/terms"],
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/use-cases`,
      lastModified: STATIC_DATES["/use-cases"],
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: STATIC_DATES["/tools"],
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/tools/ai-content-detector`,
      lastModified: STATIC_DATES["/tools/ai-content-detector"],
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...useCases.map((uc) => ({
      url: `${baseUrl}/ai-humanizer-for/${uc.slug}`,
      lastModified: uc.lastUpdated,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
    ...aiModels.map((m) => ({
      url: `${baseUrl}${m.urlPath}`,
      lastModified: m.lastUpdated,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
    ...languages.map((l) => ({
      url: `${baseUrl}/${l.slug}`,
      lastModified: l.lastUpdated,
      changeFrequency: "monthly",
      priority: 0.8,
    })),
  ];
}
