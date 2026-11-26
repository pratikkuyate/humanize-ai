"use client";

import { useSyncExternalStore } from "react";
import { CURRENCY_COOKIE, DEFAULT_CURRENCY, normalizeCurrency } from "@/lib/currency";

/**
 * The currency this visitor sees prices in: "EUR" in the euro area, else "USD".
 *
 * Read from the cookie proxy.js sets from the visitor's country. It is a
 * display hint only — the checkout server prices the order from the request
 * itself — so a missing or edited cookie can at worst show the other price
 * list, never charge a different amount than Razorpay's window states.
 *
 * Server render and the first client render use USD, so statically rendered
 * pages hydrate without a mismatch; euro visitors switch to € immediately after.
 */

function readCookie() {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CURRENCY_COOKIE}=([^;]+)`));
    return normalizeCurrency(match ? decodeURIComponent(match[1]) : DEFAULT_CURRENCY);
  } catch {
    return DEFAULT_CURRENCY;
  }
}

// The cookie does not change while a page is open, so there is nothing to
// subscribe to; useSyncExternalStore is used for its server/client snapshot split.
const subscribe = () => () => {};
const serverSnapshot = () => DEFAULT_CURRENCY;

/** @returns {"USD" | "EUR"} */
export function useCurrency() {
  return useSyncExternalStore(subscribe, readCookie, serverSnapshot);
}
