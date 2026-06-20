"use client";

import { useEffect, useRef, useState } from "react";

const MIN_LENGTH = 50;
const MAX_LENGTH = 20_000;

/**
 * Deliberately AI-sounding sample passages so users can try the tool without
 * sourcing text elsewhere. Each is written with the tell-tale markers of AI
 * output (clichés, uniform rhythm, formulaic transitions) so the before/after
 * contrast is clear. Clicking the sample button cycles through them.
 */
const SAMPLE_TEXTS = [
  `In today's fast-paced digital landscape, remote work has become increasingly prevalent across numerous industries. It is important to note that effective time management plays a crucial role in maximizing productivity. Furthermore, leveraging the right tools can significantly enhance collaboration among team members. By establishing clear boundaries and maintaining a structured routine, individuals can navigate the challenges of working from home. In conclusion, remote work offers a multitude of benefits, provided that one implements the appropriate strategies to stay focused and engaged.`,

  `Search engine optimization is a fundamental component of any successful digital marketing strategy. In order to improve your website's visibility, it is essential to focus on creating high-quality, relevant content that resonates with your target audience. Additionally, optimizing your meta tags, headings, and keywords can greatly impact your search rankings. Moreover, building a robust network of backlinks serves to establish authority and credibility. Ultimately, a comprehensive SEO approach will drive organic traffic and foster long-term growth for your online presence.`,

  `Maintaining a healthy lifestyle is of paramount importance in our modern society. It is widely acknowledged that regular physical activity, combined with a balanced diet, contributes significantly to overall well-being. Furthermore, adequate sleep and effective stress management are crucial factors that should not be overlooked. By making conscious choices and adopting sustainable habits, individuals can enhance their quality of life. In essence, prioritizing one's health is an investment that yields invaluable returns in the long run.`,
];

/**
 * @param {{
 *   onResult: (result: { humanizedText: string; metadata: import('../lib/types.js').Stage1Metadata }) => void;
 *   onLoadingChange: (loading: boolean) => void;
 *   isLoading: boolean;
 * }} props
 */
export default function HumanizerForm({ onResult, onLoadingChange, isLoading }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const sampleIndexRef = useRef(0);

  // One-time hand-off from the AI detector ("Humanize it" CTA): pre-fill the box.
  useEffect(() => {
    try {
      const prefill = sessionStorage.getItem("humanize_prefill");
      if (prefill) {
        setText(prefill);
        sessionStorage.removeItem("humanize_prefill");
      }
    } catch {}
  }, []);

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isOverLimit = charCount > MAX_LENGTH;
  const isTooShort = charCount > 0 && charCount < MIN_LENGTH;
  const canSubmit = charCount >= MIN_LENGTH && !isOverLimit && !isLoading;

  /** @param {React.ChangeEvent<HTMLTextAreaElement>} e */
  function handleChange(e) {
    setText(e.target.value);
    if (error) setError("");
  }

  /** Fill the textarea with a sample AI passage; cycles on repeat clicks. */
  function loadSample() {
    if (isLoading) return;
    setText(SAMPLE_TEXTS[sampleIndexRef.current % SAMPLE_TEXTS.length]);
    sampleIndexRef.current += 1;
    if (error) setError("");
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setError("");
    onLoadingChange(true);

    try {
      const response = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error ?? "An unexpected error occurred.");
        return;
      }

      onResult({ humanizedText: data.humanizedText, metadata: data.metadata });
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      onLoadingChange(false);
    }
  }

  /** Allow Ctrl+Enter / Cmd+Enter to submit */
  /** @param {React.KeyboardEvent<HTMLTextAreaElement>} e */
  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden h-full">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-500" />
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            AI Generated Content
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadSample}
            disabled={isLoading}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold
              text-white shadow-md shadow-violet-500/30
              bg-gradient-to-r from-violet-600 to-indigo-600
              hover:from-violet-700 hover:to-indigo-700 hover:scale-105 active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2
              ${charCount === 0 && !isLoading ? "animate-attention" : ""}`}
          >
            <SparkleIcon />
            Try a sample
          </button>
          <span className="hidden sm:inline text-xs text-slate-400 dark:text-slate-500">
            Ctrl+Enter to submit
          </span>
        </div>
      </div>

      {/* Textarea */}
      <div className="flex-1 relative">
        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Paste your AI-generated content here..."
          className={`w-full h-full min-h-[300px] sm:min-h-[500px] resize-none p-5 text-sm leading-relaxed
            bg-transparent text-slate-700 dark:text-slate-300
            placeholder:text-slate-300 dark:placeholder:text-slate-600
            focus:outline-none transition-colors
            disabled:opacity-60 disabled:cursor-not-allowed
            ${isOverLimit ? "text-rose-600 dark:text-rose-400" : ""}`}
        />
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 px-4 py-3">
            <AlertIcon className="text-rose-500 mt-0.5 shrink-0" />
            <p className="text-xs text-rose-700 dark:text-rose-300">{error}</p>
          </div>
        )}

        {/* Counters + button row */}
        <div className="flex items-center justify-between gap-4">
          {/* Counters */}
          <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
            <span>
              <span
                className={
                  isOverLimit
                    ? "text-rose-500 font-semibold"
                    : isTooShort
                    ? "text-amber-500"
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
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span>{wordCount.toLocaleString()} words</span>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
              transition-all duration-150 active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed
              bg-violet-600 hover:bg-violet-700 active:bg-violet-800
              text-white shadow-sm shadow-violet-500/20
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            {isLoading ? (
              <>
                <SpinnerIcon />
                Humanizing...
              </>
            ) : (
              <>
                <WandIcon />
                Humanize Content
              </>
            )}
          </button>
        </div>

        {/* Hint when text is too short */}
        {isTooShort && !error && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Please enter at least {MIN_LENGTH} characters.
          </p>
        )}
      </div>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17l-1.9-5.1L4.5 10l5.6-1.4L12 3z" />
      <path d="M19 15l.7 2.1L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.9L19 15z" />
    </svg>
  );
}

function WandIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M17.8 6.2 19 5M3 21l9-9M12.2 6.2 11 5" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

/** @param {{ className?: string }} props */
function AlertIcon({ className = "" }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
