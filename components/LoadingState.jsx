"use client";

import { useEffect, useState } from "react";
import { LONG_DOCUMENT_WORDS } from "@/lib/freeTier";

// A normal run finishes well inside this; past it, reassure rather than leave
// a spinner that looks stuck.
const SLOW_RUN_SECONDS = 45;

/** @param {number} seconds */
function formatElapsed(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** @param {{ words?: number }} props */
export default function LoadingState({ words = 0 }) {
  const [elapsed, setElapsed] = useState(0);
  const isLong = words > LONG_DOCUMENT_WORDS;
  // Approximate: the server packs whole paragraphs, so the real count can differ by one.
  const sections = Math.ceil(words / LONG_DOCUMENT_WORDS);

  useEffect(() => {
    const startedAt = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  // Closing the tab mid-run throws away minutes of work, and the run still
  // counts. Ask the browser to confirm first.
  useEffect(() => {
    if (!isLong) return;
    /** @param {BeforeUnloadEvent} e */
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isLong]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-4 py-12 px-6">
      {/* Animated spinner */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-600 animate-spin" />
      </div>

      <div className="text-center space-y-1">
        <p className="text-slate-700 dark:text-slate-300 font-medium text-sm">
          {isLong ? "Humanizing a long document..." : "Humanizing your content..."}
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-xs">
          {isLong
            ? `${words.toLocaleString()} words, processed in about ${sections} sections`
            : "Running 3-stage rewrite pipeline"}
        </p>
      </div>

      {isLong ? (
        <div className="max-w-xs rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900 px-4 py-3 text-center">
          <p className="text-xs text-violet-700 dark:text-violet-300">
            This can take a few minutes. Keep this tab open — your result will appear here
            when every section is done.
          </p>
        </div>
      ) : (
        elapsed >= SLOW_RUN_SECONDS && (
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs">
            Taking a little longer than usual. Still working — no need to resubmit.
          </p>
        )
      )}

      {/* Animated progress dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-violet-500 opacity-40 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>

      <p className="text-xs tabular-nums text-slate-400 dark:text-slate-500" aria-live="off">
        Elapsed {formatElapsed(elapsed)}
      </p>
    </div>
  );
}
