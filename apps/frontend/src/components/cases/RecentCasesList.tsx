"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { CaseFilter } from "@/components/home/StageTiles";
import Kbd from "@/components/ui/Kbd";
import { useHotkeys } from "@/hooks/useHotkeys";
import type { CaseSummary } from "@/types/cases";
import { formatDateTime, formatRelative } from "@/utils/format-date";

export type CaseStage = "review" | "documents" | "saved";

export function getCaseStage(caseSummary: CaseSummary): CaseStage {
  if (caseSummary.confirmedAt) return "saved";
  return caseSummary.isFilled ? "review" : "documents";
}

const STAGE_DETAILS: Record<CaseStage, { label: string; dotClasses: string; textClasses: string; action: string; href: (caseId: string) => string }> = {
  review: { label: "In review", dotClasses: "bg-amber-500", textClasses: "text-amber-800", action: "Review", href: (caseId) => `/cases/${caseId}/review` },
  documents: { label: "Documents", dotClasses: "bg-stone-400", textClasses: "text-muted", action: "Add documents", href: (caseId) => `/cases/${caseId}/documents` },
  saved: { label: "Saved", dotClasses: "bg-emerald-500", textClasses: "text-emerald-800", action: "Open", href: (caseId) => `/cases/${caseId}/confirm` },
};
const STAGE_ORDER: Record<CaseStage, number> = { review: 0, documents: 1, saved: 2 };
type SortKey = "client" | "form" | "documents" | "created" | "status";
const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "client", label: "Client" }, { key: "form", label: "Form" }, { key: "documents", label: "Docs" },
  { key: "created", label: "Created" }, { key: "status", label: "Status" },
];
const NO_ACTIVE_ROW = -1;
const GRID = "grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_3rem_5.5rem_7.5rem_1.25rem] items-center gap-3";

interface RecentCasesListProps {
  cases: CaseSummary[];
  formLabels: Record<string, string>;
  isLoading: boolean;
  caseFilter: CaseFilter;
}

/** Every case: search with "/", sort by any column, move with J/K or arrows, open with Enter. */
export default function RecentCasesList({ cases, formLabels, isLoading, caseFilter }: RecentCasesListProps) {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<{ key: SortKey; isDescending: boolean }>({ key: "created", isDescending: true });
  const [activeRowIndex, setActiveRowIndex] = useState(NO_ACTIVE_ROW);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const getFormLabel = (caseSummary: CaseSummary) => formLabels[caseSummary.formId] || caseSummary.formId;
  const getSortValue: Record<SortKey, (caseSummary: CaseSummary) => string | number> = {
    client: (caseSummary) => (caseSummary.clientName || "~").toLowerCase(),
    form: (caseSummary) => getFormLabel(caseSummary).toLowerCase(),
    documents: (caseSummary) => caseSummary.documents.length,
    created: (caseSummary) => caseSummary.createdAt,
    status: (caseSummary) => STAGE_ORDER[getCaseStage(caseSummary)],
  };
  const searchQuery = searchText.trim().toLowerCase();
  const shownCases = cases
    .filter((caseSummary) => (caseFilter === "all" || getCaseStage(caseSummary) === caseFilter)
      && (!searchQuery || `${caseSummary.clientName || ""} ${getFormLabel(caseSummary)}`.toLowerCase().includes(searchQuery)))
    .sort((firstCase, secondCase) => {
      const [firstValue, secondValue] = [getSortValue[sortOrder.key](firstCase), getSortValue[sortOrder.key](secondCase)];
      const comparison = firstValue < secondValue ? -1 : firstValue > secondValue ? 1 : 0;
      return sortOrder.isDescending ? -comparison : comparison;
    });

  useEffect(() => setActiveRowIndex(NO_ACTIVE_ROW), [caseFilter, searchQuery]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-row="${activeRowIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeRowIndex]);
  const moveActiveRow = (rowStep: number) => setActiveRowIndex((rowIndex) => Math.max(0, Math.min(shownCases.length - 1, rowIndex + rowStep)));
  const handleOpenActiveRow = () => {
    const activeCase = shownCases[activeRowIndex];
    if (activeCase) router.push(STAGE_DETAILS[getCaseStage(activeCase)].href(activeCase.id));
  };
  useHotkeys({ "/": () => searchInputRef.current?.focus(), j: () => moveActiveRow(1), k: () => moveActiveRow(-1),
    ArrowDown: () => moveActiveRow(1), ArrowUp: () => moveActiveRow(-1), Enter: handleOpenActiveRow });
  const handleSortBy = (key: SortKey) => setSortOrder((currentOrder) => ({ key, isDescending: currentOrder.key === key ? !currentOrder.isDescending : key === "created" }));

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        <h2 className="text-[13px] font-semibold">Cases <span className="font-normal tabular-nums text-muted">{shownCases.length}{shownCases.length !== cases.length ? ` of ${cases.length}` : ""}</span></h2>
        <label className="group ml-auto flex h-7 w-56 items-center gap-1.5 rounded-lg border border-line bg-canvas/60 px-2 transition-colors focus-within:border-ink/30 focus-within:bg-white">
          <span className="text-xs text-muted" aria-hidden>⌕</span>
          <input ref={searchInputRef} value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search client or form"
            onKeyDown={(event) => { if (event.key === "Escape") { setSearchText(""); event.currentTarget.blur(); } if (event.key === "Enter" || event.key === "ArrowDown") { event.currentTarget.blur(); setActiveRowIndex(0); } }}
            className="min-w-0 flex-1 bg-transparent text-xs outline-none focus-visible:outline-none placeholder:text-muted" aria-label="Search cases" />
          {searchText ? <button type="button" onClick={() => setSearchText("")} className="text-xs text-muted hover:text-ink" aria-label="Clear search">✕</button> : <Kbd>/</Kbd>}
        </label>
      </div>
      <div className={`${GRID} border-b border-line bg-canvas/70 px-3 py-1 text-[11px] font-medium text-muted`}>
        {COLUMNS.map((column) => (
          <button key={column.key} type="button" onClick={() => handleSortBy(column.key)}
            className={`flex items-center gap-1 text-left transition-colors hover:text-ink ${sortOrder.key === column.key ? "text-ink" : ""}`}>
            {column.label}
            <span className={`text-[9px] transition-opacity ${sortOrder.key === column.key ? "opacity-100" : "opacity-0"}`} aria-hidden>{sortOrder.isDescending ? "▼" : "▲"}</span>
          </button>
        ))}
        <span />
      </div>
      <div ref={listRef} className="min-h-0 flex-1 overflow-auto">
        {isLoading ? [0, 1, 2, 3].map((placeholderIndex) => <div key={placeholderIndex} className="mx-3 my-2.5 h-4 animate-pulse rounded bg-canvas" />)
          : !shownCases.length ? <p className="p-8 text-center text-xs text-muted">{cases.length ? "No case matches. Press Esc in search to clear." : "No cases yet. Press C for a new case or B for a batch."}</p> : null}
        {!isLoading && shownCases.map((caseSummary, rowIndex) => {
          const stage = STAGE_DETAILS[getCaseStage(caseSummary)];
          const isActive = rowIndex === activeRowIndex;
          return (
            <Link key={caseSummary.id} href={stage.href(caseSummary.id)} data-row={rowIndex} onMouseEnter={() => setActiveRowIndex(rowIndex)} title={`${stage.action}: ${caseSummary.clientName || "case"}`}
              className={`group relative ${GRID} border-b border-line/70 px-3 py-[7px] text-[13px] transition-colors duration-100 ${isActive ? "bg-canvas" : ""}`}>
              <span className={`absolute inset-y-0 left-0 w-0.5 bg-brand-500 transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`} aria-hidden />
              <span className="flex min-w-0 items-center gap-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-canvas text-[9px] font-semibold text-muted ring-1 ring-line" aria-hidden>
                  {(caseSummary.clientName || "?").split(" ").map((namePart) => namePart[0]).slice(0, 2).join("")}
                </span>
                <span className="truncate font-medium">{caseSummary.clientName || <span className="font-normal italic text-muted">Not read yet</span>}</span>
                {caseSummary.batchId ? <span className="shrink-0 rounded bg-brand-50 px-1 text-[10px] text-brand-700">batch</span> : null}
              </span>
              <span className="truncate text-xs text-muted" title={getFormLabel(caseSummary)}>{getFormLabel(caseSummary)}</span>
              <span className={`text-xs tabular-nums ${caseSummary.documents.length ? "text-ink" : "text-muted/60"}`}>{caseSummary.documents.length}</span>
              <span className="text-xs tabular-nums text-muted" title={formatDateTime(caseSummary.createdAt)}>{formatRelative(caseSummary.createdAt)}</span>
              <span className={`flex items-center gap-1.5 text-xs font-medium ${stage.textClasses}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${stage.dotClasses}`} aria-hidden />
                {stage.label}
              </span>
              <span className={`text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ink ${isActive ? "text-ink" : ""}`} aria-hidden>›</span>
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-3 border-t border-line bg-canvas/50 px-3 py-1 text-[10px] text-muted">
        <span className="flex items-center gap-1"><Kbd>J</Kbd><Kbd>K</Kbd> move</span>
        <span className="flex items-center gap-1"><Kbd>↵</Kbd> open</span>
        <span className="flex items-center gap-1"><Kbd>/</Kbd> search</span>
        <span className="ml-auto">Click a column to sort</span>
      </div>
    </section>
  );
}
