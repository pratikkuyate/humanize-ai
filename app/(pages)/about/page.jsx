import Link from "next/link";
import { H2, P } from "@/components/ProseHelpers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata = {
  title: "About Humanizer AI",
  description:
    "Learn about Humanizer AI — a free tool that rewrites AI-generated text from ChatGPT, Claude, and Gemini into natural, human-sounding writing.",
  alternates: { canonical: `${siteUrl}/about` },
  openGraph: {
    title: "About Simply Humanize",
    description:
      "Learn about Simply Humanize — a free tool that rewrites AI-generated text from ChatGPT, Claude, and Gemini into natural, human-sounding writing.",
    url: `${siteUrl}/about`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Simply Humanize",
    description:
      "Learn about Simply Humanize — a free tool that rewrites AI-generated text from ChatGPT, Claude, and Gemini into natural, human-sounding writing.",
  },
};

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-slate-900 py-12 sm:py-16">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-10">
          About Simply Humanize
        </h1>

        <H2>Why We Built This</H2>
        <P>
          AI writing tools got very good at generating content. They didn't get good at sounding
          human. The sentences are grammatically correct but rhythmically flat — predictable pacing,
          overused phrases, no natural variation. Simply Humanize exists to fix that missing step.
        </P>

        <H2>The 3-Stage Pipeline</H2>
        <P>
          Most rewriters swap synonyms. We don't. Simply Humanize runs submitted text through a
          three-stage process: first analyzing structure and tone, then rewriting for natural rhythm
          and voice, then polishing for flow and coherence. The result reads like a person wrote it
          — because the process mirrors how a skilled editor thinks.
        </P>

        <H2>How It Works</H2>
        <P>
          You paste AI-generated text into the tool. We send it to the Google Gemini API with
          humanization-focused instructions. The rewritten text comes back in seconds — ready to
          copy, edit, or publish. No account needed. No data stored.
        </P>

        <H2>What We Believe</H2>
        <P>
          AI is a writing tool, not a replacement for voice. Humanizing your content isn't cheating
          — it's editing. Every good writer revises; Simply Humanize gives you a head start. We also
          believe in transparency: we tell you exactly what the tool does and doesn't do, and we
          don't make promises about AI detection bypass or factual accuracy.
        </P>

        <H2>Free to Use</H2>
        <P>
          Simply Humanize is free. No subscription, no account, no credit card. Paste your text and
          get results instantly.
        </P>

        <div className="mt-10">
          <Link
            href="/#tool"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-sm"
          >
            Try it now — it's free
          </Link>
        </div>
      </article>
    </div>
  );
}
