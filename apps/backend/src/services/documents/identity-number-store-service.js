// Full PAN / passport / driving-licence numbers read from a client's cards, and PAN values typed into an import
// sheet. Kept in memory for speed and saved to data/identity-numbers.json (gitignored, on this machine only) so they
// survive a restart: reviewers must see the full number to check it against the card, and the form needs it filled.
// Never sent to the Google Sheet, a log line or git. Cleared per document on remove, and per case on delete.
// Aadhaar is never stored here: only its last 4 digits are kept, on the document itself.
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DATA_DIRECTORY } from "../../config/paths-config.js";

const STORE_FILE_PATH = path.join(DATA_DIRECTORY, "identity-numbers.json");

function loadStore() {
  try {
    const { identityRecords = {}, typedPanValues = {} } = JSON.parse(readFileSync(STORE_FILE_PATH, "utf-8"));
    return { identityRecordsByDocumentId: new Map(Object.entries(identityRecords)), typedPanValuesByCaseId: new Map(Object.entries(typedPanValues)) };
  } catch {
    return { identityRecordsByDocumentId: new Map(), typedPanValuesByCaseId: new Map() };
  }
}

const { identityRecordsByDocumentId, typedPanValuesByCaseId } = loadStore(); // documentId -> { panNumber, … }; caseId -> { fieldKey: PAN }

/** Write the whole store (small) to a temporary file, then swap it in, so a crash never leaves half a file. */
function saveStore() {
  const temporaryPath = `${STORE_FILE_PATH}.tmp`;
  writeFileSync(temporaryPath, JSON.stringify({
    identityRecords: Object.fromEntries(identityRecordsByDocumentId),
    typedPanValues: Object.fromEntries(typedPanValuesByCaseId),
  }));
  renameSync(temporaryPath, STORE_FILE_PATH);
}

export function storeIdentityRecord(documentId, identityRecord) {
  identityRecordsByDocumentId.set(documentId, identityRecord);
  saveStore();
}

export function getIdentityRecord(documentId) {
  return identityRecordsByDocumentId.get(documentId) || null;
}

export function deleteIdentityRecord(documentId) {
  if (identityRecordsByDocumentId.delete(documentId)) saveStore();
}

export function storeTypedPanValues(caseId, panValues) {
  if (Object.keys(panValues).length) typedPanValuesByCaseId.set(caseId, { ...panValues });
  else typedPanValuesByCaseId.delete(caseId);
  saveStore();
}

export function getTypedPanValues(caseId) {
  return typedPanValuesByCaseId.get(caseId) || {};
}

export function deleteTypedPanValues(caseId) {
  if (typedPanValuesByCaseId.delete(caseId)) saveStore();
}
