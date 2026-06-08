"use client";

import { useState } from "react";
import HumanizerForm from "@/components/HumanizerForm";
import HumanizedOutput from "@/components/HumanizedOutput";
import StatsPanel from "@/components/StatsPanel";

export default function Home() {
  /** @type {[string | null, React.Dispatch<React.SetStateAction<string | null>>]} */
  const [humanizedText, setHumanizedText] = useState(null);

  /** @type {[import('../lib/types.js').Stage1Metadata | null, React.Dispatch<any>]} */
  const [metadata, setMetadata] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  /** @param {{ humanizedText: string; metadata: import('../lib/types.js').Stage1Metadata }} result */
  function handleResult(result) {
    setHumanizedText(result.humanizedText);
    setMetadata(result.metadata);
  }

  function handleClear() {
    setHumanizedText(null);
    setMetadata(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <LogoIcon />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-none">
                Humanizer AI
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-none mt-0.5 hidden sm:block">
                Transform AI-generated text into natural, readable content.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              3-Stage Pipeline
            </span>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950 dark:to-indigo-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 mb-4">
          <SparkleIcon />
          Powered by Gemini 2.0 Flash
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Write Like a Human, Not a Machine
        </h2>
        <p className="text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Improve readability, flow, tone, and sentence variety in any AI-generated draft — in
          seconds.
        </p>
      </section>

      {/* Main two-column editor */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            <HumanizerForm
              onResult={handleResult}
              onLoadingChange={setIsLoading}
              isLoading={isLoading}
            />
            <StatsPanel metadata={metadata} />
          </div>

          {/* Right column */}
          <div className="lg:sticky lg:top-24">
            <HumanizedOutput
              humanizedText={humanizedText}
              isLoading={isLoading}
              onClear={handleClear}
            />
          </div>
        </div>

        {/* Feature chips */}
        {!humanizedText && !isLoading && (
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {[
              "Sentence variety",
              "Natural flow",
              "Tone improvement",
              "Repetition removal",
              "Rhythm & pacing",
              "Editorial polish",
            ].map((feature) => (
              <span
                key={feature}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 shadow-sm"
              >
                {feature}
              </span>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-center">
          <p className="text-xs text-slate-400 dark:text-slate-600">
            Humanizer AI — Writing enhancement and editing tool
          </p>
        </div>
      </footer>
    </div>
  );
}

function LogoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 17l.75 2.25L8 20l-2.25.75L5 23l-.75-2.25L2 20l2.25-.75L5 17z" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
    </svg>
  );
}
