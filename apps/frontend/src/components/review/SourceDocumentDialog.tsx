"use client";
import { formatFieldLabel } from "@prefill/shared";
import DocumentPreviewDialog from "@/components/cases/DocumentPreviewDialog";
import type { CaseDocument, CaseField } from "@/types/cases";

interface SourceDocumentDialogProps {
  caseId: string;
  caseField: CaseField | null;
  caseDocuments: CaseDocument[];
  onClose: () => void;
}

/** The uploaded document a value was read from - the shared document popup, titled with the field. */
export default function SourceDocumentDialog({ caseId, caseField, caseDocuments, onClose }: SourceDocumentDialogProps) {
  const sourceDocument = caseDocuments.find((caseDocument) => caseDocument.id === caseField?.source_doc) || null;
  const title = caseField && sourceDocument ? `${formatFieldLabel(caseField.field)} · ${sourceDocument.documentTypeLabel || "document"}` : undefined;
  return <DocumentPreviewDialog caseId={caseId} caseDocument={caseField ? sourceDocument : null} title={title} onClose={onClose} />;
}
