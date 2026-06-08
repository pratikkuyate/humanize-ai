"use client";

/**
 * @param {{ metadata: import('../lib/types.js').Stage1Metadata | null }} props
 */
export default function StatsPanel({ metadata }) {
  if (!metadata) return null;

  const { sentenceCount, averageSentenceLength, burstiness, frequentWords } =
    metadata;

  /**
   * Describes the burstiness score in plain English.
   * @param {number} score
   * @returns {{ label: string; color: string }}
   */
  function burstinessLabel(score) {
    if (score >= 0.4) return { label: "Excellent", color: "text-emerald-600 dark:text-emerald-400" };
    if (score >= 0.1) return { label: "Good", color: "text-sky-600 dark:text-sky-400" };
    if (score >= -0.2) return { label: "Moderate", color: "text-amber-600 dark:text-amber-400" };
    return { label: "Uniform", color: "text-rose-600 dark:text-rose-400" };
  }

  const burst = burstinessLabel(burstiness);

  const stats = [
    {
      label: "Sentences",
      value: sentenceCount.toLocaleString(),
      description: "Total sentence count",
    },
    {
      label: "Avg. Length",
      value: `${averageSentenceLength}w`,
      description: "Average words per sentence",
    },
    {
      label: "Burstiness",
      value: burstiness.toFixed(2),
      description: "Sentence-length rhythm score",
      badge: burst,
    },
  ];

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
        Stage 1 Analysis
      </h3>

      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, description, badge }) => (
          <div key={label} className="text-center space-y-0.5">
            <p
              className="text-2xl font-bold text-slate-800 dark:text-slate-100 tabular-nums"
              title={description}
            >
              {value}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
            {badge && (
              <p className={`text-xs font-medium ${badge.color}`}>{badge.label}</p>
            )}
          </div>
        ))}
      </div>

      {frequentWords.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">
            Overused words detected:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {frequentWords.map((word) => (
              <span
                key={word}
                className="px-2 py-0.5 rounded-full text-xs bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
