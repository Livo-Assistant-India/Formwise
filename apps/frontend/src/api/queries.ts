"use client";
// Cached reads used across pages. Every page that needs the forms / cases / batches lists uses these, so the data is
// fetched once and shared (see query-cache.ts).
import { useMemo } from "react";
import { fetchBatch, fetchBatches } from "./batches-api";
import { fetchCase, fetchCases } from "./cases-api";
import { fetchForms } from "./forms-api";
import { useQuery } from "./query-cache";

export const useForms = () => useQuery("forms", fetchForms);
export const useCases = () => useQuery("cases", fetchCases);
export const useBatches = () => useQuery("batches", fetchBatches);
export const useCase = (caseId: string | null) => useQuery(caseId ? `case:${caseId}` : null, () => fetchCase(caseId!));
export const useBatch = (batchId: string | null) => useQuery(batchId ? `batch:${batchId}` : null, () => fetchBatch(batchId!));

/** formId -> its short name, for tables. */
export function useFormLabels(): Record<string, string> {
  const { data: forms } = useForms();
  return useMemo(() => Object.fromEntries((forms || []).map((form) => [form.formId, form.shortLabel || form.label])), [forms]);
}
