export type DocumentStatus = "processing" | "done" | "unrecognized" | "error";

export interface CaseDocument {
  id: string;
  originalName: string;
  status: DocumentStatus;
  message: string | null;
  documentType: string | null;
  documentTypeLabel: string | null;
  hasQrCode: boolean;
  assignedNominee: number;
  assignedBy: string | null;
  isAssignedManually: boolean;
  identityNumber: string | null;
  personName: string | null;
  folderName: string | null;
  readFieldLabels: string[];
  /** What was read, to check on screen: e.g. { label: "Date of birth", value: "17/03/2004" }. Aadhaar: last 4 only. */
  readValues: { label: string; value: string }[];
}

export interface CaseSummary {
  id: string;
  formId: string;
  batchId: string | null;
  createdAt: string;
  /** From the Excel, else read from the client's documents; null until either exists. */
  clientName: string | null;
  isFilled: boolean;
  sheetImport?: { fileName: string; rowNumber: number; clientReference: string | null } | null;
  confirmedAt: string | null;
  documents: CaseDocument[];
}

export type FieldStatus = "ok" | "low_confidence" | "needs_review" | "not_provided" | "not_applicable" | "invalid";

export interface FieldDecision {
  kind: "corrected" | "skipped";
  value: string | null;
  decidedAt?: string;
}

export interface CaseField {
  field: string;
  page: number | null;
  value: string | null;
  status: FieldStatus;
  reason: string | null;
  source_file: string | null;
  source_doc?: string;
  ocr_confidence: number | null;
  isTickbox: boolean;
  options?: string[];
  option_chosen?: string | null;
  boxes: [number, number, number, number][];
  decision: FieldDecision | null;
  /** A form filled into an Excel template: the sheet and cell this value is written to (no page boxes). */
  sheet?: string;
  cell?: string;
}

export interface CaseFieldsView {
  caseId: string;
  formId: string;
  label: string;
  /** "xlsx": the filled form is a copy of an Excel template - the review shows its cells and downloads the .xlsx. */
  outputType?: "pdf" | "xlsx";
  pageCount: number;
  fields: CaseField[];
}

export interface UploadResult {
  filename: string;
  isAccepted: boolean;
  reason?: string;
  documentId?: string;
}

export interface ConfirmResult {
  caseId: string;
  savedFieldCount: number;
  notStoredFields: string[];
  sheetTabName: string;
  sheetRowNumber: number;
  areScansDeleted: boolean;
}

export interface SheetRowSummary {
  rowNumber: number;
  clientReference: string | null;
  displayName: string | null;
  filledCount: number;
}

export interface SheetImportResult {
  needsRowChoice: boolean;
  sheetName: string;
  sheetRows?: SheetRowSummary[];
  rowNumber?: number;
  clientReference?: string | null;
  appliedFieldCount?: number;
  panFieldsKeptInMemory?: string[];
  unknownHeadings?: string[];
  duplicateFields?: string[];
  documentWins?: { field: string; sheetValue: string; documentValue: string; documentLabel: string }[];
  keptCorrections?: string[];
  invalidValues?: { field: string; value: string; reason: string }[];
  unmatchedOptions?: { field: string; value: string; allowed: string[] }[];
  mappedToOthers?: { field: string; value: string }[];
  aadhaarCutToLast4?: string[];
  cellWarnings?: { field: string; warning: string }[];
}
