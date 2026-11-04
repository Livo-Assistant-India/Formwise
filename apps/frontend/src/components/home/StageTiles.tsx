"use client";
import type { CaseStage } from "@/components/cases/RecentCasesList";

export type CaseFilter = "all" | CaseStage;

interface StageTilesProps {
  counts: Record<CaseFilter, number>;
  batchCount: number;
  activeFilter: CaseFilter;
  onSelect: (filter: CaseFilter) => void;
  isLoading: boolean;
}

const TILES: { filter: CaseFilter; label: string; dotClasses: string; hint: string }[] = [
  { filter: "all", label: "All cases", dotClasses: "bg-ink", hint: "Every case" },
  { filter: "review", label: "In review", dotClasses: "bg-amber-500", hint: "Filled - waiting for someone to check" },
  { filter: "documents", label: "Need documents", dotClasses: "bg-stone-400", hint: "No documents read yet" },
  { filter: "saved", label: "Saved", dotClasses: "bg-emerald-500", hint: "Checked and saved" },
];

/** The case counts, one tile per stage. Clicking a tile filters the table below; clicking it again clears it. */
export default function StageTiles({ counts, batchCount, activeFilter, onSelect, isLoading }: StageTilesProps) {
  const totalCaseCount = Math.max(counts.all, 1);
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-line bg-white sm:grid-cols-5">
      {TILES.map((tile, tileIndex) => {
        const isActive = activeFilter === tile.filter;
        const shareOfAllCases = tile.filter === "all" ? 1 : counts[tile.filter] / totalCaseCount;
        return (
          <button key={tile.filter} type="button" title={tile.hint} aria-pressed={isActive}
            onClick={() => onSelect(isActive && tile.filter !== "all" ? "all" : tile.filter)}
            className={`group relative px-3.5 py-2.5 text-left transition-colors duration-150 ${tileIndex > 0 ? "border-l border-line" : ""} ${isActive ? "bg-canvas" : "hover:bg-canvas/60"}`}>
            <span className="flex items-center gap-1.5 text-[11px] text-muted">
              <span className={`h-1.5 w-1.5 rounded-full ${tile.dotClasses}`} aria-hidden />{tile.label}
            </span>
            <span className="mt-0.5 block text-xl font-semibold tabular-nums leading-tight">{isLoading ? "–" : counts[tile.filter]}</span>
            {/* share of all cases, as a hairline bar along the bottom */}
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-line/60" aria-hidden>
              <span className={`block h-full transition-[width] duration-500 ease-out ${isActive ? "bg-brand-500" : tile.dotClasses}`}
                style={{ width: isLoading ? 0 : `${shareOfAllCases * 100}%` }} />
            </span>
          </button>
        );
      })}
      <div className="border-l border-line px-3.5 py-2.5 max-sm:col-span-2 max-sm:border-t">
        <span className="flex items-center gap-1.5 text-[11px] text-muted"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />Batches</span>
        <span className="mt-0.5 block text-xl font-semibold tabular-nums leading-tight">{isLoading ? "–" : batchCount}</span>
      </div>
    </div>
  );
}
