"use client";

import { useState } from "react";
import { replaceEmDashes, EM_DASH_STYLES } from "@/lib/emDash";
import { countWords } from "@/lib/wordCount";
import { track, wordBucket } from "@/lib/analytics";

/**
 * A short passage with the dash habits AI output actually has: a paired aside,
 * a single dramatic pause, narrow no-break spaces hugging one dash, and a
 * hand-typed double hyphen. Escapes keep editors from normalizing the sample.
 */
const SAMPLE_TEXT =
  "Writing with AI is fast—but the drafts all sound the same. The fix " +
  "— and it’s a simple one — is to edit for rhythm. Most readers " +
  "never notice a single dash — they notice six in one paragraph. " +
  "Old habits -- like typing two hyphens -- count too.";

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
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function EmDashRemoverTool() {
  const [text, setText] = useState("");
  /** @type {[import("@/lib/emDash").EmDashStyle, React.Dispatch<any>]} */
  const [style, setStyle] = useState("comma");
  const [includeLookalikes, setIncludeLookalikes] = useState(true);

  /** @type {[ReturnType<typeof replaceEmDashes> | null, React.Dispatch<any>]} */
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const wordCount = countWords(text);
  // Unmetered: the replacement runs locally and costs nothing.
  const canRun = text.trim().length > 0;

  function handleRun() {
    if (!canRun) return;
    setResult(replaceEmDashes(text, { style, includeLookalikes }));
    setCopied(false);
    track("emdash_replace", { words: wordBucket(wordCount), style, lookalikes: includeLookalikes });
  }

  /** @param {{ style?: any, includeLookalikes?: boolean }} next */
  function rerun(next) {
    // Keep the visible result honest about the settings that produced it.
    if (result) setResult(replaceEmDashes(text, { style, includeLookalikes, ...next }));
  }

  function loadSample() {
    setText(SAMPLE_TEXT);
    setResult(null);
    setCopied(false);
    track("sample_loaded", { tool: "emdash" });
  }

  function handleClear() {
    setText("");
    setResult(null);
    setCopied(false);
  }

  /** @param {React.KeyboardEvent<HTMLTextAreaElement>} e */
  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRun();
    }
  }

  async function handleCopy() {
    if (!result?.cleaned) return;
    track("output_copied", { tool: "emdash" });
    try {
      await navigator.clipboard.writeText(result.cleaned);
    } catch {
      // Fallback for environments where the clipboard API is restricted.
      const el = document.createElement("textarea");
      el.value = result.cleaned;
      el.setAttribute("readonly", "");
      el.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const activeStyle = EM_DASH_STYLES.find((s) => s.id === style);
  const isClean = result && result.count === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Input */}
      <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Paste your text</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadSample}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-md shadow-violet-500/30 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 hover:scale-105 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            >
              Try a sample
            </button>
            <span className="hidden sm:inline text-xs text-slate-400 dark:text-slate-500">Ctrl+Enter</span>
          </div>
        </div>

        <label htmlFor="emdash-input" className="sr-only">
          Text to remove em dashes from
        </label>
        <textarea
          id="emdash-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste text from ChatGPT, Claude, Gemini or anywhere else. Everything runs in your browser — nothing is uploaded."
          className="w-full min-h-[220px] sm:min-h-[300px] resize-none p-5 text-sm leading-relaxed bg-transparent text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none"
        />

        {/* Replacement style */}
        <fieldset className="px-5 py-4 border-t border-slate-100 dark:border-slate-800">
          <legend className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
            Replace each em dash with
          </legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {EM_DASH_STYLES.map((s) => (
              <label
                key={s.id}
                className={`cursor-pointer text-center px-2 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  style === s.id
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-violet-300 dark:hover:border-violet-700"
                }`}
              >
                <input
                  type="radio"
                  name="emdash-style"
                  value={s.id}
                  checked={style === s.id}
                  onChange={() => {
                    setStyle(s.id);
                    rerun({ style: s.id });
                  }}
                  className="sr-only"
                />
                {s.label}
              </label>
            ))}
          </div>
          {activeStyle && (
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              <span className="text-slate-600 dark:text-slate-300">{activeStyle.example}</span>{" "}
              — {activeStyle.hint}
            </p>
          )}
        </fieldset>

        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeLookalikes}
              onChange={(e) => {
                setIncludeLookalikes(e.target.checked);
                rerun({ includeLookalikes: e.target.checked });
              }}
              className="mt-0.5 w-4 h-4 rounded accent-violet-600 cursor-pointer"
            />
            <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Also replace dashes typed as em dashes
              <span className="text-slate-400 dark:text-slate-500">
                {" "}
                — spaced en dashes ( – ) and double hyphens (--). Number ranges like 2019–2024 are left alone.
              </span>
            </span>
          </label>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            <span className="text-slate-600 dark:text-slate-400">{wordCount.toLocaleString()}</span> words
          </span>
          <div className="flex gap-2">
            {text && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={handleRun}
              disabled={!canRun}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-95 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              Remove em dashes
            </button>
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${result ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`} />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Text without em dashes</h2>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!result?.cleaned}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95"
            title="Copy text to clipboard"
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
        </div>

        {!result ? (
          <div className="flex flex-col items-center justify-center text-center px-8 py-16 min-h-[260px] sm:min-h-[360px]">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-xl font-bold text-slate-400 dark:text-slate-500">
              —
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
              Your text appears here, dash-free
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
              Pick how each dash should be replaced. Switching styles updates the result instantly.
            </p>
          </div>
        ) : (
          <>
            <div
              className={`px-5 py-4 border-b border-slate-100 dark:border-slate-800 ${
                isClean ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-violet-50 dark:bg-violet-950/30"
              }`}
            >
              <p
                className={`text-sm font-bold ${
                  isClean ? "text-emerald-700 dark:text-emerald-400" : "text-violet-700 dark:text-violet-300"
                }`}
              >
                {isClean
                  ? "No em dashes found"
                  : `${result.count.toLocaleString()} dash${result.count === 1 ? "" : "es"} replaced`}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isClean
                  ? "This text has no em dashes to replace."
                  : [
                      `${result.emDashCount.toLocaleString()} em dash${result.emDashCount === 1 ? "" : "es"}`,
                      result.lookalikeCount > 0
                        ? `${result.lookalikeCount.toLocaleString()} typed look-alike${result.lookalikeCount === 1 ? "" : "s"}`
                        : null,
                      result.pairCount > 0
                        ? `${result.pairCount.toLocaleString()} paired aside${result.pairCount === 1 ? "" : "s"} put in parentheses`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
              </p>
            </div>

            <div className="p-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words overflow-y-auto max-h-[420px]">
              {result.cleaned}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
