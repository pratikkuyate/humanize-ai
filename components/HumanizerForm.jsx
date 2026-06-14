"use client";

import { useState } from "react";

const MIN_LENGTH = 50;
const MAX_LENGTH = 20_000;

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
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Ctrl+Enter to submit
        </span>
      </div>

      {/* Textarea */}
      <div className="flex-1 relative">
        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Paste your AI-generated content here..."
          className={`w-full h-full min-h-[500px] resize-none p-5 text-sm leading-relaxed
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
