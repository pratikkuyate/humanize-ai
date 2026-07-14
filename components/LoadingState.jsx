"use client";

/**
 * @param {{ title?: string; subtitle?: string }} props
 */
export default function LoadingState({
  title = "Humanizing your content...",
  subtitle = "Running 3-stage rewrite pipeline",
} = {}) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-4 py-12">
      {/* Animated spinner */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-600 animate-spin" />
      </div>

      <div className="text-center space-y-1">
        <p className="text-slate-700 dark:text-slate-300 font-medium text-sm">
          {title}
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-xs">
          {subtitle}
        </p>
      </div>

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
    </div>
  );
}
