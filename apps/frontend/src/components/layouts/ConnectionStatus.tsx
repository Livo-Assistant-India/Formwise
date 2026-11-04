"use client";
import { CONNECTION_STATES, retryConnectionNow, useConnectionState } from "@/api/connection-state";

const DISCONNECTED_MESSAGES = {
  [CONNECTION_STATES.SERVER_DOWN]: { title: "Can't reach the server", detail: "Your work is safe. Retrying every few seconds." },
  [CONNECTION_STATES.NO_NETWORK]: { title: "You're offline", detail: "Check the network. We'll reconnect by ourselves." },
};

/** A dot in the sidebar (green = connected) and, only while disconnected, a floating notice at the bottom of the
 * screen. It floats over the page, so nothing on the page moves when it appears or goes away. */
export default function ConnectionStatus() {
  const connectionState = useConnectionState();
  const isOnline = connectionState === CONNECTION_STATES.ONLINE;
  const disconnectedMessage = connectionState === CONNECTION_STATES.ONLINE ? null : DISCONNECTED_MESSAGES[connectionState];
  return (
    <>
      <div className="flex h-6 items-center gap-2 px-2 text-[11px] text-white/50 collapsed:justify-center"
        title={disconnectedMessage ? disconnectedMessage.title : "Connected to the server"}>
        <span className="relative grid h-2 w-2 place-items-center" aria-hidden>
          {!isOnline ? <span className="absolute h-2 w-2 animate-ping rounded-full bg-red-400/70" /> : null}
          <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-emerald-400" : "bg-red-400"}`} />
        </span>
        <span className="collapsed:hidden">{isOnline ? "Connected" : "Disconnected"}</span>
      </div>
      <div role="status" aria-live="polite"
        className={`pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transition-[opacity,transform] duration-200 ease-out ${
          disconnectedMessage ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
        <div className={`flex items-center gap-3 rounded-xl bg-ink px-4 py-2.5 text-white shadow-lg ring-1 ring-white/10 ${disconnectedMessage ? "pointer-events-auto" : ""}`}>
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-red-400" aria-hidden />
          <span className="text-[12px]"><b className="font-semibold">{disconnectedMessage?.title || "Connected"}</b>
            <span className="ml-1.5 text-white/60">{disconnectedMessage?.detail}</span></span>
          <button type="button" onClick={retryConnectionNow} tabIndex={disconnectedMessage ? 0 : -1}
            className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-medium transition-colors hover:bg-white/20">Retry now</button>
        </div>
      </div>
    </>
  );
}
