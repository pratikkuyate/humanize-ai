"use client";

import { useState } from "react";
import HumanizerForm from "@/components/HumanizerForm";
import HumanizedOutput from "@/components/HumanizedOutput";
import StatsPanel from "@/components/StatsPanel";

export default function HumanizerTool() {
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
    <div>
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
    </div>
  );
}
