"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";

/**
 * The two halves of password reset: asking for a link, and using it.
 * Styled to match AuthForm.
 */

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition";

const buttonClass =
  "w-full rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed transition";

const linkClass = "font-medium text-violet-600 dark:text-violet-400 hover:underline";

function ErrorBox({ children }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-300"
    >
      {children}
    </p>
  );
}

/** Step 1: enter your email, get a link. */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data?.error ?? "Something went wrong. Please try again.");
      } else {
        track("password_reset_request");
        setSent(true);
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        Reset your password
      </h1>

      {sent ? (
        <div className="mt-6 space-y-4">
          <p className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-3 text-sm text-emerald-800 dark:text-emerald-300">
            If an account exists for <strong>{email}</strong>, we&rsquo;ve emailed it a link to
            choose a new password. The link expires in 30 minutes.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nothing after a few minutes? Check your spam folder, or{" "}
            <button type="button" onClick={() => setSent(false)} className={linkClass}>
              try again
            </button>
            .
          </p>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Enter the email you signed up with and we&rsquo;ll send you a link to choose a new
            password.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>

            {error && <ErrorBox>{error}</ErrorBox>}

            <button type="submit" disabled={submitting} className={buttonClass}>
              {submitting ? "Sending…" : "Send reset link"}
            </button>
          </form>
        </>
      )}

      <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
        Remembered it?{" "}
        <Link href="/login" className={linkClass}>
          Sign in
        </Link>
      </p>
    </div>
  );
}

/** Step 2: arrive from the email, choose a new password. */
export function ResetPasswordForm() {
  // undefined = not read yet; "" = no token in the link.
  const [token, setToken] = useState(undefined);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // The token arrives in the fragment (#token=…), which never reaches a server.
  // Read it once, then remove it from the address bar so it does not linger in
  // history or get copied along with the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    setToken(params.get("token") ?? "");
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      track("password_reset_complete");
      setDone(true);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (token === undefined) return <div className="w-full max-w-md h-72" />;

  return (
    <div className="w-full max-w-md">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        Choose a new password
      </h1>

      {done ? (
        <div className="mt-6 space-y-4">
          <p className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-3 text-sm text-emerald-800 dark:text-emerald-300">
            Your password has been changed and you&rsquo;re signed in. Any other devices were
            signed out.
          </p>
          <a href="/account" className={`${buttonClass} inline-block text-center`}>
            Go to your account →
          </a>
        </div>
      ) : !token ? (
        <div className="mt-6">
          <ErrorBox>
            This reset link is incomplete. Open the link from your email again, or request a new
            one.
          </ErrorBox>
          <p className="mt-6 text-sm">
            <Link href="/forgot-password" className={linkClass}>
              Request a new link →
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              New password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className={inputClass}
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Confirm new password
            </label>
            <input
              id="confirm"
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>

          {error && (
            <ErrorBox>
              {error}{" "}
              {error.includes("Request a new one") && (
                <Link href="/forgot-password" className="underline">
                  Request a new link
                </Link>
              )}
            </ErrorBox>
          )}

          <button type="submit" disabled={submitting} className={buttonClass}>
            {submitting ? "Saving…" : "Save new password"}
          </button>
        </form>
      )}
    </div>
  );
}
