"use client";

import { useRef, useState } from "react";
import HumanizerForm from "@/components/HumanizerForm";
import HumanizedOutput from "@/components/HumanizedOutput";
import StatsPanel from "@/components/StatsPanel";

export default function HumanizerTool() {
  /** @type {[string | null, React.Dispatch<React.SetStateAction<string | null>>]} */
  const [humanizedText, setHumanizedText] = useState(null);

  /** @type {[import('../lib/types.js').Stage1Metadata | null, React.Dispatch<any>]} */
  const [metadata, setMetadata] = useState(null);

  /** @type {[import('./HumanizedOutput.jsx').PartialResult | null, React.Dispatch<any>]} */
  const [partial, setPartial] = useState(null);

  // The form owns the upgrade dialog; the output's unlock button opens it here.
  const formRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  // Word count of the run in flight, so the loading screen can warn about long documents.
  const [loadingWords, setLoadingWords] = useState(0);

  /** @param {boolean} loading @param {number} [words] */
  function handleLoadingChange(loading, words = 0) {
    setIsLoading(loading);
    if (loading) setLoadingWords(words);
  }

  /** @param {{ humanizedText: string; metadata: import('../lib/types.js').Stage1Metadata; partial: any }} result */
  function handleResult(result) {
    setHumanizedText(result.humanizedText);
    setMetadata(result.metadata);
    setPartial(result.partial);
  }

  function handleClear() {
    setHumanizedText(null);
    setMetadata(null);
    setPartial(null);
  }

  return (
    <div>
      {/* On desktop both cards share one height, sized to fit under the header
          and hero, so the Humanize button and the unlock prompt are on screen
          without scrolling the page. Long text scrolls inside each card. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)] gap-6 lg:h-[clamp(360px,calc(100svh-20rem),640px)]">
        <HumanizerForm
          ref={formRef}
          onResult={handleResult}
          onLoadingChange={handleLoadingChange}
          isLoading={isLoading}
        />

        <HumanizedOutput
          humanizedText={humanizedText}
          partial={partial}
          onUnlock={() => formRef.current?.openUpgrade()}
          isLoading={isLoading}
          loadingWords={loadingWords}
          onClear={handleClear}
        />
      </div>

      {metadata && (
        <div className="mt-6 lg:w-[calc(50%-0.75rem)]">
          <StatsPanel metadata={metadata} />
        </div>
      )}

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
