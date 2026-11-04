// What the frontend may see about a case and its documents: status and labels of what was read - never the
// saved file path, and never a full ID number except the reviewer's own PAN view (PAN is shown in full by
// request; Aadhaar never is).
import { DOC_TYPE_LABELS } from "../../services/documents/classify-document-service.js";
import { getIdentityRecord } from "../../services/documents/identity-number-store-service.js";

/** Labels only (no values) of what was read from one document. */
function listReadFieldLabels(caseDocument) {
  const identityRecord = getIdentityRecord(caseDocument.id) || {};
  const readLabels = [];
  if (caseDocument.foundName || caseDocument.holderName || identityRecord.name) readLabels.push("Name");
  if (caseDocument.foundDob || caseDocument.holderDob || identityRecord.dob) readLabels.push("Date of birth");
  if (caseDocument.foundAddress || identityRecord.address) readLabels.push("Address");
  if (caseDocument.foundLast4) readLabels.push("Aadhaar last 4");
  if (identityRecord.panNumber) readLabels.push("PAN number");
  if (identityRecord.passportNumber) readLabels.push("Passport number");
  if (identityRecord.dlNumber) readLabels.push("Licence number");
  return readLabels;
}

const ID_NUMBER_LABELS = { pan: "PAN", passport: "Passport no.", driving_licence: "Licence no." };

/** The values read from one document, to check on the documents screen. Aadhaar: last 4 digits only, never more.
 * PAN / passport / licence numbers are shown in full (identity-number-store-service keeps them on this machine). */
function listReadValues(caseDocument) {
  const identityRecord = getIdentityRecord(caseDocument.id) || {};
  const idNumber = identityRecord.panNumber || identityRecord.passportNumber || identityRecord.dlNumber || caseDocument.panMaskedNumber || null;
  const readValues = [
    ["Name", caseDocument.foundName || caseDocument.holderName || identityRecord.name],
    ["Date of birth", caseDocument.foundDob || caseDocument.holderDob || identityRecord.dob],
    ["Address", caseDocument.foundAddress || identityRecord.address],
    ["Aadhaar", caseDocument.foundLast4 ? `XXXX XXXX ${caseDocument.foundLast4}` : null],
    [ID_NUMBER_LABELS[caseDocument.docType] || "ID no.", idNumber],
  ];
  return readValues.filter(([, value]) => value).map(([label, value]) => ({ label, value: String(value) }));
}

export function toDocumentSummary(caseDocument) {
  const identityRecord = getIdentityRecord(caseDocument.id);
  return {
    id: caseDocument.id, originalName: caseDocument.originalName, status: caseDocument.status, message: caseDocument.message,
    documentType: caseDocument.docType, documentTypeLabel: caseDocument.docType ? DOC_TYPE_LABELS[caseDocument.docType] : null,
    hasQrCode: Boolean(caseDocument.qrFound), assignedNominee: caseDocument.assignedNominee,
    assignedBy: caseDocument.assignedBy || null, isAssignedManually: Boolean(caseDocument.assignedManually),
    identityNumber: identityRecord?.panNumber || identityRecord?.passportNumber || identityRecord?.dlNumber || caseDocument.panMaskedNumber || null,
    personName: caseDocument.foundName || caseDocument.holderName || identityRecord?.name || null,
    folderName: caseDocument.folderName || null,
    readFieldLabels: listReadFieldLabels(caseDocument),
    readValues: listReadValues(caseDocument),
  };
}

const CLIENT_NAME_KEYS = ["subscriber_name", "investor_name", "applicant_name", "name_n1"];

/** Who the case is for: the name typed in the Excel, else the name read from the client's documents. */
function findClientName(caseEntry) {
  const typedName = CLIENT_NAME_KEYS.map((fieldKey) => caseEntry.typedValues?.[fieldKey]).find(Boolean);
  if (typedName) return String(typedName);
  return caseEntry.documents.map((caseDocument) => caseDocument.foundName || caseDocument.holderName).find(Boolean) || null;
}

export function toCaseSummary(caseEntry) {
  return {
    id: caseEntry.id, formId: caseEntry.formId, batchId: caseEntry.batchId || null, createdAt: caseEntry.createdAt, clientName: findClientName(caseEntry),
    isFilled: Boolean(caseEntry.isFilled), confirmedAt: caseEntry.confirmedAt || null,
    // Which Excel row fills the non-document fields (file name and row only - never the values).
    sheetImport: caseEntry.sheetImport ? { fileName: caseEntry.sheetImport.fileName, rowNumber: caseEntry.sheetImport.rowNumber, clientReference: caseEntry.sheetImport.clientReference || null } : null,
    documents: caseEntry.documents.map(toDocumentSummary),
  };
}
