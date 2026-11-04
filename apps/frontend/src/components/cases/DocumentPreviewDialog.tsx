"use client";
import { getDocumentViewUrl } from "@/api/cases-api";
import Dialog from "@/components/ui/Dialog";
import type { CaseDocument } from "@/types/cases";

interface DocumentPreviewDialogProps {
  caseId: string;
  /** The document to show; null keeps the popup closed. */
  caseDocument: CaseDocument | null;
  /** Defaults to the document's type and file name. */
  title?: string;
  onClose: () => void;
}

/** One uploaded document in a popup (shared by the documents and review screens), with what was read from it beside
 * the image. Served by the local API only; a PDF shows in the browser's own viewer. */
export default function DocumentPreviewDialog({ caseId, caseDocument, title, onClose }: DocumentPreviewDialogProps) {
  const documentUrl = caseDocument ? getDocumentViewUrl(caseId, caseDocument.id) : null;
  const isPdf = Boolean(caseDocument && /\.pdf$/i.test(caseDocument.originalName));
  const readValues = caseDocument?.readValues || [];
  return (
    <Dialog title={title || (caseDocument ? `${caseDocument.documentTypeLabel || "Document"} · ${caseDocument.originalName}` : "")} isOpen={Boolean(caseDocument)} onClose={onClose} width="large">
      {documentUrl ? (
        <div className="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          {isPdf
            ? <iframe src={documentUrl} title="Uploaded document" className="h-[60vh] w-full rounded border border-line" />
            // eslint-disable-next-line @next/next/no-img-element -- served by the local API
            : <img src={documentUrl} alt="Uploaded document" className="max-h-[60vh] w-full rounded border border-line bg-canvas object-contain" />}
          <dl className="grid content-start grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[12px]">
            {readValues.length ? readValues.map((readValue) => (
              <div key={readValue.label} className="contents">
                <dt className="text-muted">{readValue.label}</dt>
                <dd className="break-words font-medium">{readValue.value}</dd>
              </div>
            )) : <p className="col-span-2 text-muted">Nothing was read from this file.</p>}
          </dl>
        </div>
      ) : null}
      <p className="mt-2 text-[11px] text-muted">
        <a href={documentUrl || undefined} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">Open full size ↗</a>
        {" "}· shown from this machine only.
      </p>
    </Dialog>
  );
}
