"use client";

import { useState } from "react";
import { removeWatermark, KNOWN_CHAR_COUNT } from "@/lib/watermarkChars";
import { countWords } from "@/lib/wordCount";
import { track, wordBucket } from "@/lib/analytics";

/**
 * A short passage laced with the markers Claude output actually carries: narrow
 * no-break spaces around the em dash, a zero-width space, curly quotes, and one
 * character from the Unicode Tags block.
 *
 * Every marker is written as an escape sequence on purpose — a literal invisible
 * character here would be silently eaten by an editor or a lint --fix pass, and
 * the sample would quietly stop demonstrating anything.
 */
const SAMPLE_TEXT =
  "It\u2019s worth noting that this paragraph\u202F\u2014\u202Flike most Claude " +
  "output\u202F\u2014\u202Fcarries markers you can\u2019t see.\u200B There\u2019s a " +
  "narrow no-break space hugging each em dash, a zero-width space after that " +
  "last sentence,\u200B and a \u201Ctag\u201D character riding along at the " +
  "end.\u{E0041} Paste your own text to check it\u2026";

/**
 * The same problem from any source: a zero-width space inside a word (the
 * classic "why won't find/search match" bug), a BOM, a no-break space, a
 * direction mark, and a hidden tag character.
 */
const GENERIC_SAMPLE_TEXT =
  "This para\u200bgraph looks normal, but \u201cfind\u201d won\u2019t match " +
  "the word \u201cparagraph\u201d.\ufeff It also hides a no-break\u00a0space, " +
  "a left-to-right mark\u200e, and a tag character.\u{E0041} Paste your own " +
  "text to see what it carries.";

/**
 * Wording per page. "claude" is the Claude watermark remover; "generic" is the
 * invisible character remover, which only strips hidden characters by default
 * because people arriving there want nothing else changed.
 */
const VARIANTS = {
  claude: {
    sample: SAMPLE_TEXT,
    heading: "Paste Claude text",
    inputLabel: "Text to remove the Claude watermark from",
    placeholder:
      "Paste text copied out of Claude. The scan runs entirely in your browser \u2014 nothing is uploaded.",
    button: "Remove watermark",
    noneFound: "No watermark characters found",
    trackEvent: "watermark_clean",
    trackTool: "clean",
    normalizeByDefault: true,
  },
  generic: {
    sample: GENERIC_SAMPLE_TEXT,
    heading: "Paste your text",
    inputLabel: "Text to remove invisible characters from",
    placeholder:
      "Paste text from anywhere: ChatGPT, Word, a PDF, a website. The scan runs entirely in your browser \u2014 nothing is uploaded.",
    button: "Remove invisible characters",
    noneFound: "No invisible characters found",
    trackEvent: "invisible_clean",
    trackTool: "invisible",
    normalizeByDefault: false,
  },
};

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

const GROUP_LABEL = {
  invisible: "Invisible",
  spacing: "Hidden space",
  typography: "Typography",
};

const GROUP_STYLE = {
  invisible:
    "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  spacing:
    "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  typography:
    "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800",
};

/** @param {{ variant?: keyof typeof VARIANTS }} props */
export default function WatermarkRemoverTool({ variant = "claude" }) {
  const copy = VARIANTS[variant];
  const [text, setText] = useState("");
  const [normalizeTypography, setNormalizeTypography] = useState(copy.normalizeByDefault);

  /** @type {[ReturnType<typeof removeWatermark> | null, React.Dispatch<any>]} */
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const charCount = text.length;
  const wordCount = countWords(text);
  // Unmetered and uncapped: the scan runs locally and costs nothing, which is
  // what the page's "no usage limit" promise rests on.
  const canClean = text.trim().length > 0;

  function handleClean() {
    if (!canClean) return;
    setResult(removeWatermark(text, { normalizeTypography }));
    setCopied(false);
    track(copy.trackEvent, { words: wordBucket(wordCount), typography: normalizeTypography });
  }

  /** @param {boolean} next */
  function handleToggleTypography(next) {
    setNormalizeTypography(next);
    // Keep the visible result honest about the setting that produced it.
    if (result) setResult(removeWatermark(text, { normalizeTypography: next }));
  }

  function loadSample() {
    setText(copy.sample);
    setResult(null);
    setCopied(false);
    track("sample_loaded", { tool: copy.trackTool });
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
      handleClean();
    }
  }

  async function handleCopy() {
    if (!result?.cleaned) return;
    track("output_copied", { tool: copy.trackTool });
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

  const totalFound = result ? result.hiddenCount + result.typographyCount : 0;
  const isClean = result && totalFound === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Input */}
      <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {copy.heading}
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

        <label htmlFor="watermark-input" className="sr-only">
          {copy.inputLabel}
        </label>
        <textarea
          id="watermark-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={copy.placeholder}
          className="w-full min-h-[260px] sm:min-h-[360px] resize-none p-5 text-sm leading-relaxed bg-transparent text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none"
        />

        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={normalizeTypography}
              onChange={(e) => handleToggleTypography(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-violet-600 cursor-pointer"
            />
            <span className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Also normalize AI typography
              <span className="text-slate-400 dark:text-slate-500">
                {" "}
                — em dashes, curly quotes, and the ellipsis glyph become plain ASCII.
              </span>
            </span>
          </label>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            <span className="text-slate-600 dark:text-slate-400">
              {wordCount.toLocaleString()}
            </span>{" "}
            words
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
              onClick={handleClean}
              disabled={!canClean}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-95 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {copy.button}
            </button>
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                result ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
              }`}
            />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Clean text</h2>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!result?.cleaned}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95"
            title="Copy clean text to clipboard"
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
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="text-slate-400 dark:text-slate-500"
              >
                <path d="M12 3a9 9 0 1 0 9 9" />
                <path d="M21 3l-9 9" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
              Your cleaned text appears here
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
              The scan checks for {KNOWN_CHAR_COUNT.toLocaleString()} hidden characters,
              including every character in the Unicode Tags block.
            </p>
          </div>
        ) : (
          <>
            {/* Scan summary */}
            <div
              className={`px-5 py-4 border-b border-slate-100 dark:border-slate-800 ${
                isClean ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-rose-50 dark:bg-rose-950/30"
              }`}
            >
              <p
                className={`text-sm font-bold ${
                  isClean
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-rose-700 dark:text-rose-400"
                }`}
              >
                {isClean
                  ? copy.noneFound
                  : `${totalFound.toLocaleString()} marker${totalFound === 1 ? "" : "s"} removed`}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isClean
                  ? "This text carries none of the hidden characters or typography markers we check for."
                  : `${result.hiddenCount.toLocaleString()} hidden character${
                      result.hiddenCount === 1 ? "" : "s"
                    }${
                      normalizeTypography
                        ? ` and ${result.typographyCount.toLocaleString()} typography marker${
                            result.typographyCount === 1 ? "" : "s"
                          }`
                        : ""
                    }.`}
              </p>
            </div>

            {/* Findings */}
            {result.findings.length > 0 && (
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 max-h-44 overflow-y-auto">
                <ul className="space-y-2">
                  {result.findings.map((f) => (
                    <li key={f.code} className="flex items-center gap-2.5 text-xs">
                      <span
                        className={`shrink-0 px-1.5 py-0.5 rounded border text-[10px] font-semibold ${
                          GROUP_STYLE[f.group]
                        }`}
                      >
                        {GROUP_LABEL[f.group]}
                      </span>
                      <span className="font-mono text-slate-500 dark:text-slate-400 shrink-0">
                        {f.code}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 truncate">{f.name}</span>
                      <span className="ml-auto shrink-0 font-semibold text-slate-500 dark:text-slate-400">
                        &times;{f.count.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words overflow-y-auto max-h-[360px]">
              {result.cleaned}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
