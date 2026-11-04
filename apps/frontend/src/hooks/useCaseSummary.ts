"use client";
import { useCallback, useEffect } from "react";
import { useCase } from "@/api/queries";
import { invalidateQueries } from "@/api/query-cache";

const POLL_INTERVAL_MILLISECONDS = 1200;

/** The case and its documents (cached, so going back to a case shows it at once), re-fetched every ~1s while any
 * document is still being read. */
export function useCaseSummary(caseId: string) {
  const { data: caseSummary, error, refresh } = useCase(caseId);
  const reloadCase = useCallback(async () => { await refresh(); }, [refresh]);

  // Once a document gives the client's name, lists showing this case (Home, the sidebar) refresh too.
  const clientName = caseSummary?.clientName;
  useEffect(() => { if (clientName) invalidateQueries("cases"); }, [clientName]);

  const isAnyDocumentProcessing = Boolean(caseSummary?.documents.some((caseDocument) => caseDocument.status === "processing"));
  useEffect(() => {
    if (!isAnyDocumentProcessing) return;
    const pollTimer = setInterval(reloadCase, POLL_INTERVAL_MILLISECONDS);
    return () => clearInterval(pollTimer);
  }, [isAnyDocumentProcessing, reloadCase]);

  return { caseSummary: caseSummary ?? null, loadError: error?.message ?? null, reloadCase, isAnyDocumentProcessing };
}
