import { notFound } from "next/navigation";
import Link from "next/link";
import { posts, getPostBySlug, clusters, author, readingTimeMinutes } from "@/lib/posts";
import Breadcrumbs from "@/components/Breadcrumbs";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com").replace(/\/$/, "");

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const url = `${siteUrl}/blog/${post.slug}`;
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url,
      type: "article",
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      authors: [author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
    },
  };
}

function formatDate(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Renders a plain string with [label](href) links and **bold** spans.
 * Internal hrefs (starting with "/") use next/link; anything else is a plain anchor.
 * @param {string} text
 */
function renderInline(text) {
  const parts = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[1] !== undefined) {
      const href = match[2];
      const cls =
        "text-violet-600 dark:text-violet-400 font-medium underline decoration-violet-300 dark:decoration-violet-700 underline-offset-2 hover:decoration-2";
      parts.push(
        href.startsWith("/") ? (
          <Link key={key++} href={href} className={cls}>
            {match[1]}
          </Link>
        ) : (
          <a key={key++} href={href} className={cls} target="_blank" rel="noopener noreferrer">
            {match[1]}
          </a>
        )
      );
    } else {
      parts.push(
        <strong key={key++} className="font-semibold text-slate-800 dark:text-slate-100">
          {match[3]}
        </strong>
      );
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

/** Strip inline markdown for schema text fields. */
function plainText(text) {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");
}

function buildJsonLd(post) {
  const url = `${siteUrl}/blog/${post.slug}`;
  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    author: { "@type": "Organization", name: author.name, url: `${siteUrl}${author.url}` },
    publisher: { "@type": "Organization", name: "Simply Humanize", url: siteUrl },
  };
  if (!post.faqs?.length) return [blogPosting];
  return [
    blogPosting,
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: plainText(f.a) },
      })),
    },
  ];
}

function Block({ block }) {
  if (block.p) {
    return <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{renderInline(block.p)}</p>;
  }
  if (block.h3) {
    return (
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-3">{block.h3}</h3>
    );
  }
  if (block.list) {
    return (
      <ul className="list-disc pl-6 space-y-2 mb-4 text-slate-600 dark:text-slate-300 leading-relaxed">
        {block.list.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>
    );
  }
  if (block.table) {
    return (
      <div className="overflow-x-auto mb-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800">
              {block.table.headers.map((h) => (
                <th key={h} className="px-4 py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.table.rows.map((row, i) => (
              <tr key={i} className="border-t border-slate-200 dark:border-slate-700">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2.5 text-slate-600 dark:text-slate-300 align-top">
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return null;
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const cluster = clusters[post.cluster];
  const related = (post.related ?? [])
    .map((s) => getPostBySlug(s))
    .filter(Boolean)
    .slice(0, 3);

  return (
    <>
      {buildJsonLd(post).map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Hero */}
      <section className="bg-gradient-to-b from-violet-50 to-white dark:from-slate-900 dark:to-slate-950 py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            crumbs={[
              { label: "Home", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: post.title },
            ]}
          />
          <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-3">
            {cluster.label}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-5">
            {post.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            By {author.name} · Updated {formatDate(post.dateModified)} · {readingTimeMinutes(post)} min read
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-950">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* TL;DR — speakable summary */}
          <div className="mb-10 rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 p-5">
            <p className="text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider mb-2">
              TL;DR
            </p>
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{post.tldr}</p>
          </div>

          {post.sections.map((section) => (
            <div key={section.heading} className="mb-10">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
                {section.heading}
              </h2>
              {section.blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </div>
          ))}

          {/* FAQ */}
          {post.faqs?.length > 0 && (
            <div className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-800">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {post.faqs.map((faq) => (
                  <div key={faq.q}>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">{faq.q}</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                      {renderInline(faq.a)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related posts */}
          {related.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Keep reading</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/blog/${r.slug}`}
                    className="group rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-violet-400 dark:hover:border-violet-500 transition-colors"
                  >
                    <p className="text-xs text-violet-600 dark:text-violet-400 mb-1">
                      {clusters[r.cluster].label}
                    </p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {r.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-sm"
            >
              Humanize your text free →
            </Link>
            <Link
              href="/tools/ai-content-detector"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:border-violet-400 dark:hover:border-violet-500 transition-colors"
            >
              Check text for AI patterns
            </Link>
          </div>
        </article>
      </section>
    </>
  );
}
