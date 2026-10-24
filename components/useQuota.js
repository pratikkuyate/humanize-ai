"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Client-side view of the free-tier quota for one tool.
 *
 * The humanizer spends its attempt inside /api/humanize, because that is the
 * call with real cost behind it. The form must NOT also call `consume()` or
 * every run would be charged twice — it passes the `quota` object from the
 * humanize response to `apply()` instead. `consume()` is kept for any future
 * metered tool that has no server call of its own.
 *
 * The detector and watermark remover are deliberately unmetered and do not use
 * this hook — see METERED_TOOLS in lib/freeTier.js.
 *
 * @param {"humanize"} tool
 */
export function useQuota(tool) {
  /** @type {[null | { remaining: number, limit: number, resetAt?: string, metered: boolean }, Function]} */
  const [quota, setQuota] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/quota?tool=${tool}`);
        const data = await res.json();
        if (!cancelled && data?.success) setQuota(data);
      } catch {
        // Quota display is non-essential; leaving it null just hides the badge.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tool]);

  /** Spend an attempt. Returns true when the caller may proceed. */
  const consume = useCallback(async () => {
    try {
      const res = await fetch("/api/quota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool }),
      });
      const data = await res.json();
      setQuota(data);
      return { allowed: res.ok && data.allowed !== false, data };
    } catch {
      // Fail open, matching the server's behaviour when KV is unreachable.
      return { allowed: true, data: null };
    }
  }, [tool]);

  /** Apply a quota object returned by another endpoint. */
  const apply = useCallback((next) => {
    if (next) setQuota(next);
  }, []);

  return { quota, consume, apply };
}
