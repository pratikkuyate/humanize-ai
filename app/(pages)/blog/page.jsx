import Link from "next/link";
import { posts, clusters, readingTimeMinutes } from "@/lib/posts";
import Breadcrumbs from "@/components/Breadcrumbs";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com").replace(/\/$/, "");

export const metadata = {
  title: "Blog — AI Writing Patterns, Detectors & Humanizing Guides",
  description:
    "Honest, hands-on writing about AI text: the patterns that give it away, how detectors really work, and practical guides to making AI-assisted drafts sound like you.",
  alternates: { canonical: `${siteUrl}/blog` },
  openGraph: {
    title: "Blog — AI Writing Patterns, Detectors & Humanizing Guides",
    description:
      "Honest, hands-on writing about AI text: the patterns that give it away, how detectors really work, and practical guides to making AI-assisted drafts sound like you.",
    url: `${siteUrl}/blog`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — AI Writing Patterns, Detectors & Humanizing Guides",
    description:
      "Honest, hands-on writing about AI text: the patterns that give it away, how detectors really work, and practical guides to making AI-assisted drafts sound like you.",
  },
};

function buildBlogJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Simply Humanize Blog",
    url: `${siteUrl}/blog`,
    description: metadata.description,
    publisher: { "@type": "Organization", name: "Simply Humanize", url: siteUrl },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${siteUrl}/blog/${p.slug}`,
      datePublished: p.datePublished,
      dateModified: p.dateModified,
    })),
  };
}

function formatDate(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function BlogIndexPage() {
  const clusterKeys = Object.keys(clusters).filter((key) =>
    posts.some((p) => p.cluster === key)
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBlogJsonLd()) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-violet-50 to-white dark:from-slate-900 dark:to-slate-950 py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs crumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            The Simply Humanize Blog
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            Honest writing about AI writing: the patterns that give machine text away, how detectors
            actually work (and fail), and practical guides to making AI-assisted drafts sound like you.
            No bypass promises — just the mechanics, explained.
          </p>
        </div>
      </section>

      {/* Posts by cluster */}
      <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {clusterKeys.map((key) => {
            const clusterPosts = posts.filter((p) => p.cluster === key);
            return (
              <div key={key}>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {clusters[key].label}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                  {clusters[key].description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {clusterPosts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 hover:border-violet-400 dark:hover:border-violet-500 transition-colors"
                    >
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors mb-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                        {post.metaDescription}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {formatDate(post.datePublished)} · {readingTimeMinutes(post)} min read
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
