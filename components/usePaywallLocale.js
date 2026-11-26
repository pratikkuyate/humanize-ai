"use client";

import { useSyncExternalStore } from "react";
import { PAYWALL_LANGS } from "@/lib/paywallText";

/**
 * Which language the paywall (preview, upgrade dialog, pass picker, checkout)
 * speaks: "en", "fr", "pt", "es" or "de".
 *
 * In order:
 *   1. The page's language prefix — /fr, /pt, /es, /de. These localized landing
 *      pages bring most paying-intent traffic, so they decide first. The choice
 *      is remembered for the tab (sessionStorage) because the upgrade path
 *      leaves them: signup and the account page live at unprefixed URLs.
 *   2. The language remembered from step 1 earlier in this tab.
 *   3. The browser's language, so a Spanish speaker who lands on an English
 *      page still gets a Spanish paywall.
 *   4. English.
 *
 * The rest of each page keeps its own language; only the paywall follows this.
 */

const STORAGE_KEY = "sh_paywall_lang";

function fromPath() {
  const first = window.location.pathname.split("/")[1] ?? "";
  return PAYWALL_LANGS.includes(first) && first !== "en" ? first : null;
}

function detect() {
  const pathLang = fromPath();
  if (pathLang) {
    try {
      sessionStorage.setItem(STORAGE_KEY, pathLang);
    } catch {}
    return pathLang;
  }

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored && PAYWALL_LANGS.includes(stored)) return stored;
  } catch {}

  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of preferred) {
    const base = String(tag ?? "").toLowerCase().split("-")[0];
    if (PAYWALL_LANGS.includes(base)) return base;
  }

  return "en";
}

// Client-side navigations between pages do not fire an event worth tracking
// here: the paywall components mount when they are needed and read the
// language then.
const subscribe = () => () => {};
const serverSnapshot = () => "en";

/** @returns {"en" | "fr" | "pt" | "es" | "de"} */
export function usePaywallLocale() {
  return /** @type {any} */ (useSyncExternalStore(subscribe, detect, serverSnapshot));
}
