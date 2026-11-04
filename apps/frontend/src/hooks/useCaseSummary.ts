"use client";
import { useCallback, useEffect } from "react";
import { useCase } from "@/api/queries";

const POLL_INTERVAL_MILLISECONDS = 1200;

/** The case and its documents (cached, so going back to a case shows it at once), re-fetched every ~1s while any
 * document is still being read. */
export function useCaseSummary(caseId: string) {
  const { data: caseSummary, error, refresh } = useCase(caseId);
  const reloadCase = useCallback(async () => { await refresh(); }, [refresh]);

  const isAnyDocumentProcessing = Boolean(caseSummary?.documents.some((caseDocument) => caseDocument.status === "processing"));
  useEffect(() => {
    if (!isAnyDocumentProcessing) return;
    const pollTimer = setInterval(reloadCase, POLL_INTERVAL_MILLISECONDS);
    return () => clearInterval(pollTimer);
  }, [isAnyDocumentProcessing, reloadCase]);

  return { caseSummary: caseSummary ?? null, loadError: error?.message ?? null, reloadCase, isAnyDocumentProcessing };
}
