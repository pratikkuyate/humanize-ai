export default function robots() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://simplyhumanize.com").replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
      },
      // Explicitly welcome AI-search crawlers — being citable in ChatGPT,
      // Claude, Perplexity, and Gemini answers is its own traffic channel.
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-Web",
          "anthropic-ai",
          "PerplexityBot",
          "Perplexity-User",
          "Google-Extended",
        ],
        allow: "/",
        disallow: "/api/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
