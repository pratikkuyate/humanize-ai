import { useCases } from "@/lib/useCases";
import { aiModels } from "@/lib/aiModels";
import { languages } from "@/lib/languages";
import { posts } from "@/lib/posts";

/**
 * Last real content change per static page (YYYY-MM-DD). Bump a date only when
 * that page's content genuinely changes — a lastmod that moves on every deploy
 * teaches crawlers to ignore it.
 */
const staticPages = [
  { path: "/", lastUpdated: "2026-11-02", changeFrequency: "weekly", priority: 1 },
  { path: "/pricing", lastUpdated: "2026-11-02", changeFrequency: "monthly", priority: 0.9 },
  { path: "/about", lastUpdated: "2026-11-02", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", lastUpdated: "2026-11-02", changeFrequency: "monthly", priority: 0.4 },
  { path: "/privacy-policy", lastUpdated: "2026-11-02", changeFrequency: "monthly", priority: 0.3 },
  { path: "/terms", lastUpdated: "2026-11-02", changeFrequency: "monthly", priority: 0.3 },
  { path: "/use-cases", lastUpdated: "2026-11-02", changeFrequency: "monthly", priority: 0.6 },
  { path: "/tools", lastUpdated: "2026-11-02", changeFrequency: "monthly", priority: 0.6 },
  { path: "/tools/ai-content-detector", lastUpdated: "2026-11-02", changeFrequency: "monthly", priority: 0.8 },
  { path: "/tools/claude-watermark-remover", lastUpdated: "2026-11-02", changeFrequency: "monthly", priority: 0.8 },
];

export default function sitemap() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com").replace(/\/$/, "");
  return [
    ...staticPages.map((p) => ({
      url: `${baseUrl}${p.path}`,
      lastModified: new Date(p.lastUpdated),
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    ...useCases.map((uc) => ({
      url: `${baseUrl}/ai-humanizer-for/${uc.slug}`,
      lastModified: new Date(uc.lastUpdated),
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
    ...aiModels.map((m) => ({
      url: `${baseUrl}${m.urlPath}`,
      lastModified: new Date(m.lastUpdated),
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
    ...languages.map((l) => ({
      url: `${baseUrl}/${l.slug}`,
      lastModified: new Date(l.lastUpdated),
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(
        posts.reduce((max, p) => (p.dateModified > max ? p.dateModified : max), "2026-07-15")
      ),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...posts.map((p) => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: new Date(p.dateModified),
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
  ];
}
