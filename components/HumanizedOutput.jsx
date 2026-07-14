"use client";

import { useState } from "react";
import LoadingState from "./LoadingState";

/** English defaults; language pages override via the `ui` prop. */
const DEFAULT_UI = {
  header: "Humanized Content",
  wordsLabel: "words",
  copy: "Copy",
  copied: "Copied!",
  clear: "Clear",
  emptyTitle: "Your humanized content will appear here",
  // emptyBody stays null for English so the richer JSX default below renders.
  emptyBody: null,
  loadingTitle: undefined,
  loadingSubtitle: undefined,
};

/**
 * @param {{
 *   humanizedText: string | null;
 *   isLoading: boolean;
 *   onClear: () => void;
 *   ui?: Partial<typeof DEFAULT_UI>;
 * }} props
 */
export default function HumanizedOutput({ humanizedText, isLoading, onClear, ui }) {
  const [copied, setCopied] = useState(false);
  const t = { ...DEFAULT_UI, ...ui };

  async function handleCopy() {
    if (!humanizedText) return;
    try {
      await navigator.clipboard.writeText(humanizedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments where clipboard API is restricted.
      // position:fixed + left:-9999px keeps the element out of the layout flow
      // so appendChild/select don't trigger a visible forced reflow.
      const el = document.createElement("textarea");
      el.value = humanizedText;
      el.setAttribute("readonly", "");
      el.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const wordCount = humanizedText
    ? humanizedText.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden h-full">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t.header}
          </h2>
          {humanizedText && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {wordCount.toLocaleString()} {t.wordsLabel}
            </span>
          )}
        </div>

        {/* Action buttons — only visible when there's content */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            disabled={!humanizedText || isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              disabled:opacity-40 disabled:cursor-not-allowed
              bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300
              hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <CheckIcon />
                {t.copied}
              </>
            ) : (
              <>
                <CopyIcon />
                {t.copy}
              </>
            )}
          </button>

          <button
            onClick={onClear}
            disabled={!humanizedText || isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              disabled:opacity-40 disabled:cursor-not-allowed
              bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300
              hover:bg-rose-50 dark:hover:bg-rose-950 hover:text-rose-600 dark:hover:text-rose-400
              active:scale-95"
            title="Clear output"
          >
            <TrashIcon />
            {t.clear}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 relative overflow-auto">
        {isLoading ? (
          <LoadingState title={t.loadingTitle} subtitle={t.loadingSubtitle} />
        ) : humanizedText ? (
          <div className="p-5">
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {humanizedText}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-8 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
              <SparkleIcon />
            </div>
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
              {t.emptyTitle}
            </p>
            {t.emptyBody ? (
              <p className="text-xs text-slate-300 dark:text-slate-600 max-w-xs">
                {t.emptyBody}
              </p>
            ) : (
              <p className="text-xs text-slate-300 dark:text-slate-600 max-w-xs">
                Paste AI-generated text on the left and click{" "}
                <span className="text-violet-500 font-medium">Humanize Content</span> to
                begin.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-slate-300 dark:text-slate-600"
    >
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 17l.75 2.25L8 20l-2.25.75L5 23l-.75-2.25L2 20l2.25-.75L5 17z" />
      <path d="M19 3l.5 1.5L21 5l-1.5.5L19 7l-.5-1.5L17 5l1.5-.5L19 3z" />
    </svg>
  );
}
