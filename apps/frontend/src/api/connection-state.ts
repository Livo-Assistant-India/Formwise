"use client";
// Is the server reachable? Every request reports here (http-client.ts). While it is down a light /health check runs
// every few seconds, and the moment it answers again everything on screen refetches.
import { useSyncExternalStore } from "react";
import { invalidateQueries } from "./query-cache";

export const CONNECTION_STATES = { ONLINE: "online", SERVER_DOWN: "server-down", NO_NETWORK: "no-network" } as const;
export type ConnectionState = (typeof CONNECTION_STATES)[keyof typeof CONNECTION_STATES];

const RETRY_INTERVAL_MILLISECONDS = 4000;
let currentConnectionState: ConnectionState = CONNECTION_STATES.ONLINE;
let retryTimer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

const isBrowserOffline = () => typeof navigator !== "undefined" && !navigator.onLine;

function setConnectionState(nextConnectionState: ConnectionState) {
  if (nextConnectionState === currentConnectionState) return;
  const wasDisconnected = currentConnectionState !== CONNECTION_STATES.ONLINE;
  currentConnectionState = nextConnectionState;
  listeners.forEach((listener) => listener());
  if (nextConnectionState === CONNECTION_STATES.ONLINE) {
    if (retryTimer) clearInterval(retryTimer);
    retryTimer = null;
    if (wasDisconnected) invalidateQueries();
  } else if (!retryTimer) {
    retryTimer = setInterval(checkServerConnection, RETRY_INTERVAL_MILLISECONDS);
  }
}

async function checkServerConnection() {
  if (isBrowserOffline()) return setConnectionState(CONNECTION_STATES.NO_NETWORK);
  const { buildApiUrl } = await import("./http-client");
  try {
    const healthResponse = await fetch(buildApiUrl("/health"), { cache: "no-store" });
    setConnectionState(healthResponse.ok ? CONNECTION_STATES.ONLINE : CONNECTION_STATES.SERVER_DOWN);
  } catch {
    setConnectionState(CONNECTION_STATES.SERVER_DOWN);
  }
}

export const reportRequestSucceeded = () => setConnectionState(CONNECTION_STATES.ONLINE);
export const reportRequestFailed = () => setConnectionState(isBrowserOffline() ? CONNECTION_STATES.NO_NETWORK : CONNECTION_STATES.SERVER_DOWN);
export const retryConnectionNow = () => checkServerConnection();

if (typeof window !== "undefined") {
  window.addEventListener("offline", () => setConnectionState(CONNECTION_STATES.NO_NETWORK));
  window.addEventListener("online", () => checkServerConnection());
}

export function useConnectionState(): ConnectionState {
  return useSyncExternalStore(
    (handleChange) => { listeners.add(handleChange); return () => listeners.delete(handleChange); },
    () => currentConnectionState, () => CONNECTION_STATES.ONLINE);
}
