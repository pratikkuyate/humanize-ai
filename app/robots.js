export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: '/api/',
      },
    ],
    sitemap: 'https://humanize-ai-chi.vercel.app/sitemap.xml',
    host: 'https://humanize-ai-chi.vercel.app',
  };
}
