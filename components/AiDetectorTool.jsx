"use client";

import { useState } from "react";
import Link from "next/link";
import { scoreText } from "@/lib/aiScore";

const MAX_LENGTH = 20_000;

/**
 * Sample passages so users can try the detector instantly. The first is written
 * with classic AI tells (uniform rhythm, clichés, formulaic transitions); the
 * second is deliberately human (varied sentences, direct voice) for contrast.
 */
const SAMPLE_TEXTS = [
  `In today's fast-paced digital landscape, remote work has become increasingly prevalent across numerous industries. It is important to note that effective time management plays a crucial role in maximizing productivity. Furthermore, leveraging the right tools can significantly enhance collaboration among team members. By establishing clear boundaries and maintaining a structured routine, individuals can navigate the challenges of working from home. In conclusion, remote work offers a multitude of benefits, provided that one implements the appropriate strategies to stay focused and engaged.`,

  `I switched to working from home three years ago. Honestly? The first month was rough. I'd roll out of bed at 8:55 for a 9:00 call, still half-asleep, coffee in hand. What fixed it wasn't some productivity app. It was a walk. Twenty minutes around the block before I open my laptop, every single day. Sounds small. It changed everything. Now I actually log off at six instead of drifting until midnight.`,
];

/** strength (0=human, 1=AI) → tailwind color classes */
function strengthColor(strength) {
  if (strength >= 0.67) return "bg-rose-500";
  if (strength >= 0.34) return "bg-amber-500";
  return "bg-emerald-500";
}

function scoreTone(score) {
  if (score >= 70)
    return {
      ring: "text-rose-500",
      text: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/40",
      border: "border-rose-200 dark:border-rose-800",
    };
  if (score >= 40)
    return {
      ring: "text-amber-500",
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-800",
    };
  return {
    ring: "text-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
  };
}

export default function AiDetectorTool() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const sampleIndex = useState(() => ({ i: 0 }))[0];

  const charCount = text.length;
  const isOverLimit = charCount > MAX_LENGTH;
  const canAnalyze = text.trim().length > 0 && !isOverLimit;

  function handleAnalyze() {
    if (!canAnalyze) return;
    setResult(scoreText(text));
  }

  function loadSample() {
    setText(SAMPLE_TEXTS[sampleIndex.i % SAMPLE_TEXTS.length]);
    sampleIndex.i += 1;
    setResult(null);
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleAnalyze();
    }
  }

  const tone = result && !result.tooShort ? scoreTone(result.score) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Input card */}
      <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Your text
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadSample}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-md shadow-violet-500/30 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 hover:scale-105 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            >
              Try a sample
            </button>
            <span className="hidden sm:inline text-xs text-slate-400 dark:text-slate-500">
              Ctrl+Enter
            </span>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste text to check for AI writing patterns. Nothing is uploaded — analysis runs entirely in your browser."
          className={`w-full min-h-[300px] sm:min-h-[420px] resize-none p-5 text-sm leading-relaxed bg-transparent text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none ${
            isOverLimit ? "text-rose-600 dark:text-rose-400" : ""
          }`}
        />

        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            <span
              className={
                isOverLimit
                  ? "text-rose-500 font-semibold"
                  : "text-slate-600 dark:text-slate-400"
              }
            >
              {charCount.toLocaleString()}
            </span>
            <span className="text-slate-300 dark:text-slate-600">
              /{MAX_LENGTH.toLocaleString()}
            </span>{" "}
            chars
          </span>
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white shadow-sm shadow-violet-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            Analyze text
          </button>
        </div>
      </div>

      {/* Results card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm min-h-[300px] sm:min-h-[420px]">
        {!result && (
          <div className="h-full flex flex-col items-center justify-center text-center py-16">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-500">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">
              Paste your text and click <strong className="text-slate-600 dark:text-slate-300">Analyze text</strong> to see an AI-pattern breakdown.
            </p>
          </div>
        )}

        {result && result.tooShort && (
          <div className="h-full flex flex-col items-center justify-center text-center py-16">
            <p className="text-sm text-amber-600 dark:text-amber-400 max-w-xs">
              Add at least ~40 words for a meaningful result. Short snippets don't
              carry enough signal to analyze reliably.
            </p>
          </div>
        )}

        {result && !result.tooShort && (
          <div>
            {/* Score header */}
            <div className={`flex items-center gap-4 rounded-xl border ${tone.border} ${tone.bg} p-4`}>
              <div className="relative shrink-0">
                <svg width="64" height="64" viewBox="0 0 36 36" className="-rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" className="text-slate-200 dark:text-slate-700" stroke="currentColor" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    className={tone.ring}
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${(result.score / 100) * 97.4} 97.4`}
                  />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${tone.text} tabular-nums`}>
                  {result.score}
                </span>
              </div>
              <div>
                <p className={`text-sm font-bold ${tone.text}`}>{result.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  AI-pattern score · {result.wordCount.toLocaleString()} words, {result.sentenceCount} sentences
                </p>
              </div>
            </div>

            {/* Signal breakdown */}
            <div className="mt-5 space-y-3">
              {result.signals.map((sig) => (
                <div key={sig.key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-600 dark:text-slate-300" title={sig.hint}>
                      {sig.label}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 tabular-nums">{sig.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${strengthColor(sig.strength)}`}
                      style={{ width: `${Math.max(3, Math.round(sig.strength * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Funnel CTA */}
            {result.score >= 40 && (
              <Link
                href="/#tool"
                onClick={() => {
                  try {
                    sessionStorage.setItem("humanize_prefill", text);
                  } catch {}
                }}
                className="mt-5 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-sm"
              >
                Reads as AI? Humanize it free →
              </Link>
            )}

            {/* Honest disclaimer */}
            <p className="mt-4 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
              This is a transparent writing-style heuristic, not a verdict on
              authorship. It flags patterns common in AI text — it is not affiliated
              with GPTZero, Turnitin, or other detectors, which use different methods.
              Use it to improve your writing, not to prove who wrote something.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
