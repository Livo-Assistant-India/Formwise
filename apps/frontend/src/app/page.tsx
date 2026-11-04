"use client";
import { useState } from "react";
import { useBatches, useCases, useFormLabels } from "@/api/queries";
import RecentBatchesList from "@/components/batches/RecentBatchesList";
import RecentCasesList, { getCaseStage } from "@/components/cases/RecentCasesList";
import HomeToolbar from "@/components/home/HomeToolbar";
import StageTiles, { type CaseFilter } from "@/components/home/StageTiles";

/** Home: start something (buttons or C / B / F), see the counts, find and open any case or batch. */
export default function HomePage() {
  const { data: allCases, isLoading: areCasesLoading, error: casesError } = useCases();
  const { data: allBatches, isLoading: areBatchesLoading, error: batchesError } = useBatches();
  const formLabels = useFormLabels();
  const [caseFilter, setCaseFilter] = useState<CaseFilter>("all");
  const cases = allCases || [];
  const batches = (allBatches || []).filter((batchEntry) => batchEntry.startedAt);
  // Never show "none yet" when the list simply could not be loaded: keep the placeholders until it arrives.
  const isLoading = areCasesLoading || areBatchesLoading || (!allCases && Boolean(casesError)) || (!allBatches && Boolean(batchesError));
  const countOf = (stage: CaseFilter) => (stage === "all" ? cases.length : cases.filter((caseSummary) => getCaseStage(caseSummary) === stage).length);
  const counts = { all: countOf("all"), review: countOf("review"), documents: countOf("documents"), saved: countOf("saved") };

  return (
    <div className="mx-auto flex h-full max-w-[1600px] flex-col gap-3 p-4">
      <HomeToolbar />
      <StageTiles counts={counts} batchCount={batches.length} activeFilter={caseFilter} onSelect={setCaseFilter} isLoading={isLoading} />
      <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[minmax(0,2.2fr)_minmax(18rem,1fr)] max-xl:grid-rows-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <RecentCasesList cases={cases} formLabels={formLabels} isLoading={isLoading} caseFilter={caseFilter} />
        <RecentBatchesList batches={batches} formLabels={formLabels} isLoading={isLoading} />
      </div>
    </div>
  );
}
