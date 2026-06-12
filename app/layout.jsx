import "./globals.css";

export const metadata = {
  title: {
    default: "AI Humanizer — Humanize AI Text Free | Humanizer AI",
    template: "%s | Humanizer AI",
  },
  description:
    "Humanize AI text online free with instant results. Turn ChatGPT, Claude & Gemini output into natural, human-sounding writing in one click. No sign-up.",
};

/**
 * @param {{ children: React.ReactNode }} props
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
