"use client";
import Link from "next/link";
import Kbd from "@/components/ui/Kbd";
import type { BatchListEntry } from "@/types/batches";
import { formatDateTime, formatRelative } from "@/utils/format-date";

interface RecentBatchesListProps {
  batches: BatchListEntry[];
  formLabels: Record<string, string>;
  isLoading: boolean;
}

/** Started batches, newest first, one compact row each: the Excel, how many clients, which forms. */
export default function RecentBatchesList({ batches, formLabels, isLoading }: RecentBatchesListProps) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        <h2 className="text-[13px] font-semibold">Batches <span className="font-normal tabular-nums text-muted">{batches.length}</span></h2>
        <Link href="/batches/new" className="ml-auto flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50">
          + New <Kbd>B</Kbd>
        </Link>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {isLoading ? [0, 1, 2].map((placeholderIndex) => <div key={placeholderIndex} className="mx-3 my-3 h-7 animate-pulse rounded bg-canvas" />)
          : !batches.length ? <p className="p-8 text-center text-xs text-muted">No batches yet. Press B to start one.</p> : null}
        {!isLoading && batches.map((batchEntry) => {
          const startedAt = batchEntry.startedAt || batchEntry.createdAt;
          return (
            <Link key={batchEntry.id} href={`/batches/${batchEntry.id}`}
              className="group relative block border-b border-line/70 px-3 py-2 transition-colors duration-100 hover:bg-canvas">
              <span className="absolute inset-y-0 left-0 w-0.5 bg-brand-500 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
              <div className="flex items-center gap-2 text-[13px]">
                <span className="text-xs text-emerald-700" aria-hidden>▤</span>
                <span className="min-w-0 flex-1 truncate font-medium" title={batchEntry.sheetFileName}>{batchEntry.sheetFileName}</span>
                <span className="shrink-0 text-[11px] tabular-nums text-muted" title={formatDateTime(startedAt)}>{formatRelative(startedAt)}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 pl-5 text-[11px] text-muted">
                <span className="shrink-0 tabular-nums">{batchEntry.clientCount} client{batchEntry.clientCount === 1 ? "" : "s"}</span>
                <span aria-hidden>·</span>
                <span className="truncate">{batchEntry.formIds.map((formId) => formLabels[formId] || formId).join(", ")}</span>
                <span className="ml-auto text-muted opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden>›</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
