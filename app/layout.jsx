import "./globals.css";

export const metadata = {
  title: "Humanizer AI — Transform AI Text into Natural Writing",
  description:
    "Paste AI-generated content and get a more natural, readable, human-edited version. Improve readability, flow, tone, and sentence variety.",
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
