"use client";

import { useEffect, useRef, useState } from "react";
import LoadingState from "./LoadingState";
import { track } from "@/lib/analytics";
import { PRO_PRICE_DISPLAY, PASS_DAYS } from "@/lib/pricing";

/**
 * What /api/humanize returns when only part of the text was humanized: a
 * preview after the free runs ran out, or the first FREE_MAX_WORDS words of a
 * longer document. `lockedText` is the user's own untouched remainder.
 *
 * @typedef {{
 *   reason: "preview" | "limit";
 *   humanizedWords: number;
 *   totalWords: number;
 *   lockedWords: number;
 *   lockedText: string;
 * }} PartialResult
 */

/**
 * @param {{
 *   humanizedText: string | null;
 *   partial?: PartialResult | null;
 *   isLoading: boolean;
 *   loadingWords?: number;
 *   onClear: () => void;
 *   onUnlock?: () => void;
 * }} props
 */
export default function HumanizedOutput({
  humanizedText,
  partial = null,
  isLoading,
  loadingWords = 0,
  onClear,
  onUnlock,
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!humanizedText) return;
    // The activation signal: a run good enough to take away.
    track("output_copied", { tool: "humanize" });
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

  const isLocked = Boolean(humanizedText && partial && partial.lockedWords > 0);

  // On phones the cards stack, so the output sits below the fold. Bring it into
  // view when a run starts and when its result lands; on desktop both cards are
  // already on screen and the page must not jump.
  const cardRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  useEffect(() => {
    if (!isLoading && !humanizedText) return;
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [isLoading, humanizedText]);

  return (
    <div
      ref={cardRef}
      className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden h-full max-h-[85svh] lg:max-h-none scroll-mt-20"
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Humanized Content
          </h2>
          {humanizedText && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {wordCount.toLocaleString()} words
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
                Copied!
              </>
            ) : (
              <>
                <CopyIcon />
                Copy
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
            Clear
          </button>
        </div>
      </div>

      {/* Body — scrolls inside the card, so the card itself never outgrows the screen */}
      <div className="flex-1 min-h-0 relative overflow-auto">
        {isLoading ? (
          <LoadingState words={loadingWords} />
        ) : humanizedText ? (
          <div className="p-5">
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {humanizedText}
            </p>
            {isLocked && <LockedRemainder partial={partial} />}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] lg:min-h-0 text-center px-8 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
              <SparkleIcon />
            </div>
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
              Your humanized content will appear here
            </p>
            <p className="text-xs text-slate-300 dark:text-slate-600 max-w-xs">
              Paste AI-generated text on the left and click{" "}
              <span className="text-violet-500 font-medium">Humanize Content</span> to
              begin.
            </p>
          </div>
        )}
      </div>

      {/* Pinned under the scrolling body, so it is visible however long the
          humanized part is. */}
      {isLocked && !isLoading && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-violet-100 dark:border-violet-900 bg-violet-50/70 dark:bg-violet-950/30">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {partial.humanizedWords.toLocaleString()} of {partial.totalWords.toLocaleString()}{" "}
              words humanized.
            </p>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
              Pro finishes this text, and gives you unlimited runs with no word limit for{" "}
              {PASS_DAYS} days.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              track("preview_unlock_click", { reason: partial.reason });
              onUnlock?.();
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            Get Pro: {PRO_PRICE_DISPLAY} for {PASS_DAYS} days →
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * The part of the text that was not humanized, blurred, under the humanized
 * part. The unlock prompt itself is pinned to the card's footer.
 *
 * The blur is presentation only and hides nothing secret: it is the user's own
 * original text. The humanized version of it does not exist yet — the server
 * only ever humanized the visible part — which is why Copy above takes just the
 * humanized text.
 *
 * @param {{ partial: PartialResult }} props
 */
function LockedRemainder({ partial }) {
  return (
    <div className="relative mt-1">
      <p
        aria-hidden="true"
        className="max-h-56 overflow-hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap blur-[5px] select-none pointer-events-none"
      >
        {partial.lockedText}
      </p>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />
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
