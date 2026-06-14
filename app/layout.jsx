import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "AI Humanizer — Humanize AI Text Free | Humanizer AI",
    template: "%s | Humanizer AI",
  },
  description:
    "Humanize AI text online free with instant results. Turn ChatGPT, Claude & Gemini output into natural, human-sounding writing in one click. No sign-up.",
  keywords: [
    "AI humanizer",
    "humanize AI text",
    "AI text humanizer",
    "humanize ChatGPT text",
    "humanize Claude text",
    "AI to human text converter",
    "bypass AI detection",
    "make AI text human",
    "AI writing humanizer",
    "free AI humanizer",
  ],
  authors: [{ name: "Humanizer AI", url: process.env.NEXT_PUBLIC_SITE_URL }],
  creator: "Humanizer AI",
  publisher: "Humanizer AI",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Humanizer AI",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Humanizer AI — Turn AI Text Into Natural Human Writing Free",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@humanizerai",
    creator: "@humanizerai",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  category: "technology",
  verification: {
    other: {
      "msvalidate.01": "E34583B052A0EA4D5C1A62E0FAF8A855",
    },
  },
};

/**
 * @param {{ children: React.ReactNode }} props
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-GZEF2PGXC2"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-GZEF2PGXC2');
        `}
      </Script>
    </html>
  );
}
