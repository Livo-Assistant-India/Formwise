"use client";
import { useState } from "react";
import { DOCUMENT_DRAG_TYPE } from "@/components/cases/NomineeDocumentGroup";
import type { CaseDocument } from "@/types/cases";

function DocumentStatusLabel({ caseDocument }: { caseDocument: CaseDocument }) {
  if (caseDocument.status === "processing") return <span className="animate-pulse text-[11px] text-muted">Reading…</span>;
  if (caseDocument.status === "done") return null;
  return <span className="text-[11px] text-amber-700">{caseDocument.message || "Problem reading this file"}</span>;
}

interface DocumentCardProps {
  caseDocument: CaseDocument;
  onAssign: (nomineeNumber: number) => void;
  /** People this form has (3 nominees; 1 on a subscription form - then there is nowhere to move to). */
  nomineeCount?: number;
  /** The uploaded file itself, shown as a thumbnail. */
  viewUrl?: string;
  /** Opens the file in the shared document popup. */
  onPreview: () => void;
  onRemove: () => void;
}

/** A thumbnail of the file that opens the preview popup; a PDF or unreadable image shows its file type instead. */
function DocumentThumbnail({ viewUrl, fileName, onPreview }: { viewUrl?: string; fileName: string; onPreview: () => void }) {
  const [hasImageFailed, setHasImageFailed] = useState(false);
  const isImageFile = /\.(jpe?g|png)$/i.test(fileName);
  return (
    <button type="button" onClick={onPreview} disabled={!viewUrl} title={`Preview ${fileName}`}
      className="group/thumbnail relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-md bg-canvas ring-1 ring-line transition-[transform,box-shadow] duration-150 hover:shadow-md hover:ring-ink/30 active:scale-95 disabled:cursor-default">
      {viewUrl && isImageFile && !hasImageFailed
        // eslint-disable-next-line @next/next/no-img-element -- a local API image, shown small
        ? <img src={viewUrl} alt="" loading="lazy" className="h-full w-full object-cover" onError={() => setHasImageFailed(true)} />
        : <span className="text-[10px] font-semibold uppercase text-muted">{fileName.split(".").pop()}</span>}
      {viewUrl ? <span className="absolute inset-0 grid place-items-center bg-ink/45 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover/thumbnail:opacity-100" aria-hidden>View</span> : null}
    </button>
  );
}

/** One uploaded file and the values read from it, to check at a glance. Drag it onto another nominee, or use "Move". */
export default function DocumentCard({ caseDocument, onAssign, onRemove, onPreview, nomineeCount = 3, viewUrl }: DocumentCardProps) {
  const isRead = caseDocument.status === "done";
  const canMove = isRead && nomineeCount > 1;
  return (
    <div draggable={canMove} onDragStart={(event) => { event.dataTransfer.setData(DOCUMENT_DRAG_TYPE, caseDocument.id); event.dataTransfer.effectAllowed = "move"; }}
      className={`group flex items-start gap-2.5 rounded-lg border border-line bg-white p-2 transition-colors duration-150 hover:border-ink/20 ${canMove ? "cursor-grab active:cursor-grabbing" : ""}`}>
      {canMove ? <span aria-hidden className="mt-5 select-none text-muted/60 group-hover:text-muted">⋮⋮</span> : null}
      <DocumentThumbnail viewUrl={isRead ? viewUrl : undefined} fileName={caseDocument.originalName} onPreview={onPreview} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-medium">{caseDocument.originalName}</span>
          {caseDocument.documentTypeLabel ? <span className="shrink-0 rounded-full bg-canvas px-2 py-px text-[11px] text-muted">{caseDocument.documentTypeLabel}</span> : null}
          <DocumentStatusLabel caseDocument={caseDocument} />
          {caseDocument.assignedBy && canMove ? <span className="truncate text-[11px] text-muted/80">· {caseDocument.assignedBy}</span> : null}
        </div>
        {isRead ? (
          caseDocument.readValues?.length ? (
            // Label / value pairs: everything read from the file, checkable without opening it. Address spans the row.
            <dl className="mt-1 grid grid-cols-[auto_minmax(0,1fr)] gap-x-2.5 gap-y-0.5 text-[11.5px] lg:grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
              {caseDocument.readValues.map((readValue) => (
                <div key={readValue.label} className="contents">
                  <dt className="text-muted">{readValue.label}</dt>
                  <dd className={`truncate font-medium tabular-nums ${readValue.label === "Address" ? "lg:col-span-3" : ""}`} title={readValue.value}>{readValue.value}</dd>
                </div>
              ))}
            </dl>
          ) : <p className="mt-1 text-[11px] text-amber-700">Nothing readable found. Try a sharper, closer photo.</p>
        ) : null}
      </div>
      {canMove ? (
        <select aria-label={`Move ${caseDocument.originalName} to another nominee`} value="" onChange={(event) => onAssign(Number(event.target.value))}
          className="h-7 shrink-0 cursor-pointer rounded-full border border-transparent bg-transparent px-2 text-xs text-muted opacity-0 hover:border-line hover:text-ink focus:opacity-100 group-hover:opacity-100">
          <option value="" disabled hidden>Move</option>
          {Array.from({ length: nomineeCount }, (_unused, index) => index + 1).filter((nomineeNumber) => nomineeNumber !== caseDocument.assignedNominee)
            .map((nomineeNumber) => <option key={nomineeNumber} value={nomineeNumber}>To Nominee {nomineeNumber}</option>)}
        </select>
      ) : null}
      <button type="button" aria-label={`Remove ${caseDocument.originalName}`} title="Remove" onClick={onRemove}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted opacity-0 transition-colors hover:bg-red-50 hover:text-red-700 focus:opacity-100 group-hover:opacity-100">✕</button>
    </div>
  );
}
