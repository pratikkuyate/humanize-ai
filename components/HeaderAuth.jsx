"use client";

import Link from "next/link";
import { useAuth } from "@/components/useAuth";

/**
 * The account corner of the site header.
 *
 * Renders nothing at all while loading. The alternative — showing "Sign in"
 * optimistically — means every signed-in user watches it flip to their account
 * link a moment after the page settles, which reads as a bug. An empty slot of
 * fixed width is quieter, and the header is a sticky element where layout shift
 * is especially visible.
 */
export default function HeaderAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return <span className="w-16" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors px-2 py-1"
      >
        Sign in
      </Link>
    );
  }

  return (
    <Link
      href="/account"
      className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 py-1 pl-1 pr-3 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
      title={user.email}
    >
      {user.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- a Google avatar
        // on an external domain; next/image would need a remotePatterns entry
        // for a 24px decoration.
        <img
          src={user.imageUrl}
          alt=""
          width={24}
          height={24}
          className="h-6 w-6 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-[11px] font-bold text-white">
          {(user.name || user.email || "?").charAt(0).toUpperCase()}
        </span>
      )}

      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
        {user.pro ? "Pro" : "Account"}
      </span>
    </Link>
  );
}
