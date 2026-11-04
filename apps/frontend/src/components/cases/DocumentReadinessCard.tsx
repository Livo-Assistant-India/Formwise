"use client";
import Button from "@/components/ui/Button";
import type { CaseDocument, CaseSummary } from "@/types/cases";

interface ReadinessItem {
  label: string;
  isFound: boolean;
  /** Where it was found (file names), or what to add when it is missing. */
  detail: string;
}

/** Which details the read documents gave: a check per detail and the files it came from. */
function buildReadinessItems(readDocuments: CaseDocument[], documentDetails?: string[]): ReadinessItem[] {
  const filesWith = (isMatch: (caseDocument: CaseDocument) => boolean) => readDocuments.filter(isMatch).map((caseDocument) => caseDocument.originalName);
  const fromLabel = (readLabel: string) => filesWith((caseDocument) => caseDocument.readFieldLabels.includes(readLabel));
  const checks: [string, string, string[], string][] = [
    ["name", "Name", fromLabel("Name"), "Add an Aadhaar, PAN or passport"],
    ["dob", "Date of birth", fromLabel("Date of birth"), "Add an Aadhaar, PAN or passport"],
    ["address", "Address", fromLabel("Address"), "Add the Aadhaar back side or a passport"],
    ["idNumber", "PAN / ID number", filesWith((caseDocument) => caseDocument.documentType === "pan" || Boolean(caseDocument.identityNumber)), "Add a PAN card, passport or licence"],
  ];
  // Only the details this form actually reads from documents (unknown = all four).
  return checks
    .filter(([detail]) => !documentDetails || documentDetails.includes(detail))
    .map(([, label, fileNames, missingHint]) => ({ label, isFound: fileNames.length > 0, detail: fileNames.length ? fileNames.join(", ") : missingHint }));
}

interface DocumentReadinessCardProps {
  caseDocuments: CaseDocument[];
  sheetImport: CaseSummary["sheetImport"];
  isRemovingSheet: boolean;
  /** False for a form filled only from the Excel: no identity details to look for. */
  needsDocuments?: boolean;
  /** The identity details the form reads from documents ("name", "dob", "address", "idNumber"). */
  documentDetails?: string[];
  onAddExcel: () => void;
  onRemoveExcel: () => void;
}

/** "Ready for review?" at a glance: documents read so far, each detail they gave (or what to add), and the Excel. */
export default function DocumentReadinessCard({ caseDocuments, sheetImport, isRemovingSheet, needsDocuments = true, documentDetails, onAddExcel, onRemoveExcel }: DocumentReadinessCardProps) {
  const readDocuments = caseDocuments.filter((caseDocument) => caseDocument.status === "done");
  const readingCount = caseDocuments.filter((caseDocument) => caseDocument.status === "processing").length;
  const failedCount = caseDocuments.length - readDocuments.length - readingCount;
  const readinessItems = needsDocuments ? buildReadinessItems(readDocuments, documentDetails) : [];
  const foundCount = readinessItems.filter((readinessItem) => readinessItem.isFound).length;
  const missingCount = readinessItems.length - foundCount;
  const isEverythingIn = !readingCount && !missingCount && Boolean(sheetImport);
  const readShare = caseDocuments.length ? readDocuments.length / caseDocuments.length : 0;

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-white">
      <header className="border-b border-line px-3 py-2">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[13px] font-semibold">Ready for review?</h2>
          <span className="ml-auto text-[11px] tabular-nums text-muted">
            {caseDocuments.length ? `${readDocuments.length} of ${caseDocuments.length} read` : "No documents yet"}
            {readingCount ? ` · reading ${readingCount}` : ""}{failedCount ? ` · ${failedCount} not read` : ""}
          </span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line/70" aria-hidden>
          <div className={`h-full rounded-full transition-[width] duration-500 ease-out ${readingCount ? "animate-pulse bg-brand-500" : "bg-emerald-500"}`}
            style={{ width: `${readShare * 100}%` }} />
        </div>
      </header>
      <ul className="divide-y divide-line/70">
        {readinessItems.map((readinessItem) => (
          <li key={readinessItem.label} className="flex items-center gap-2.5 px-3 py-1.5" title={readinessItem.detail}>
            <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] font-bold transition-colors duration-200 ${
              readinessItem.isFound ? "bg-emerald-500 text-white" : "bg-canvas text-muted ring-1 ring-line"}`} aria-hidden>{readinessItem.isFound ? "✓" : ""}</span>
            <span className="w-28 shrink-0 text-[12px] font-medium">{readinessItem.label}</span>
            <span className={`min-w-0 flex-1 truncate text-[11px] ${readinessItem.isFound ? "text-muted" : "text-amber-700"}`}>{readinessItem.detail}</span>
          </li>
        ))}
        {/* Wraps the buttons onto their own line when the column is narrow, instead of cutting them off. */}
        <li className="flex flex-wrap items-center gap-x-2.5 gap-y-1 px-3 py-1.5">
          <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] font-bold ${sheetImport ? "bg-emerald-500 text-white" : "bg-canvas text-muted ring-1 ring-line"}`} aria-hidden>{sheetImport ? "✓" : ""}</span>
          <span className="w-28 shrink-0 text-[12px] font-medium">Client Excel</span>
          <span className="min-w-[7rem] flex-1 truncate text-[11px] text-muted" title={sheetImport?.fileName}>
            {sheetImport ? `${sheetImport.fileName} · row ${sheetImport.rowNumber}${sheetImport.clientReference ? ` · ${sheetImport.clientReference}` : ""}` : "Bank, amount and contact stay empty without it"}
          </span>
          <span className="ml-auto flex shrink-0 gap-1">
            {sheetImport ? <Button size="small" variant="ghost" disabled={isRemovingSheet} onClick={onRemoveExcel}>{isRemovingSheet ? "Removing…" : "Remove"}</Button> : null}
            <Button size="small" onClick={onAddExcel}>{sheetImport ? "Change" : "Add Excel"}</Button>
          </span>
        </li>
      </ul>
      <footer className={`px-3 py-1.5 text-[11px] ${isEverythingIn ? "bg-emerald-50 text-emerald-800" : "bg-canvas/60 text-muted"}`}>
        {!needsDocuments ? (sheetImport ? "Everything is in. Continue to review." : "This form is filled from the Excel only. Add it to continue.")
          : readingCount ? "Reading… each detail ticks itself as it is found."
          : missingCount ? `${missingCount} detail${missingCount === 1 ? "" : "s"} missing. You can still continue and type ${missingCount === 1 ? "it" : "them"} on the review screen.`
            : isEverythingIn ? "Everything is in. Continue to review."
              : "All identity details found. Add the client Excel for bank, amount and contact."}
      </footer>
    </section>
  );
}
