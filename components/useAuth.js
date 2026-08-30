"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Signed-in state for client components.
 *
 * Reads /api/auth/me once on mount. Deliberately not a context provider: the
 * header and the account page are the only consumers, they mount at different
 * times, and the endpoint is a single indexed lookup — a provider would add
 * wiring for no measurable gain.
 *
 * `user` is null both while loading and when signed out, so check `loading`
 * before rendering a signed-out state, or the header will flash "Sign in" at
 * someone who is already signed in.
 *
 * @returns {{
 *   user: object | null,
 *   loading: boolean,
 *   refresh: () => Promise<void>,
 *   signOut: () => Promise<void>,
 * }}
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await response.json();
      setUser(data?.user ?? null);
    } catch {
      // Offline or a failed request is indistinguishable from signed out here,
      // and treating it as signed out is the safe direction: it shows a sign-in
      // link rather than a broken account menu.
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await response.json();
        // Guard against a state update after unmount, which React warns about
        // and which would leak this component on fast navigations.
        if (active) setUser(data?.user ?? null);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      // A full reload rather than a router refresh: quota state, the header,
      // and any server-rendered Pro badge all derive from the cookie that just
      // disappeared, and reloading is the one way to be sure none of it is stale.
      window.location.href = "/";
    }
  }, []);

  return { user, loading, refresh, signOut };
}
