// The review screen's view of one case: every field with its value, status, page boxes and latest decision.
// Aadhaar is only ever the last 4 digits; it is shown as "XXXX XXXX 1234".
import { readFile } from "node:fs/promises";
import { fetchPageSizes, toPageFractionBox } from "../pdf/page-size-service.js";
import { fetchLatestDecisionsByField } from "../storage/decision-log-service.js";
import { fetchFormRules } from "../forms/form-files-service.js";
import { getFormDefinition, isWorkbookForm, OUTPUT_TYPES } from "../../forms/form-registry.js";

const AADHAAR_FIELD_PATTERN = /^(id_aadhaar_last4|id_details|id_number)/;

function maskAadhaarValue(fieldRecord) {
  if (fieldRecord.value != null && AADHAAR_FIELD_PATTERN.test(fieldRecord.field) && /^\d{4}$/.test(fieldRecord.value)) {
    return { ...fieldRecord, value: `XXXX XXXX ${fieldRecord.value}` };
  }
  return fieldRecord;
}

function toDecisionView(decisionRow) {
  return decisionRow ? { kind: decisionRow.decision, who: decisionRow.who, value: decisionRow.value, decidedAt: decisionRow.timestamp } : null;
}

/** resultsPath/pdfPath: the first fill's, or the regenerated ones. An Excel-template form has no PDF: its fields
 * carry sheet + cell instead of page boxes, and outputType "xlsx" tells the screen to show them as a table. */
export async function buildCaseFieldsView(caseEntry, { resultsPath, pdfPath }) {
  const fieldRecords = JSON.parse(await readFile(resultsPath, "utf-8"));
  const latestDecisions = await fetchLatestDecisionsByField(caseEntry.id);
  const isWorkbook = isWorkbookForm(getFormDefinition(caseEntry.formId).formConfiguration);
  const pageSizes = isWorkbook ? [] : await fetchPageSizes(pdfPath);
  const { label } = await fetchFormRules(caseEntry.formId);
  const fields = fieldRecords.map((fieldRecord) => {
    const pageSize = fieldRecord.page ? pageSizes[fieldRecord.page - 1] : null;
    const lineRects = fieldRecord.lines?.length ? fieldRecord.lines : fieldRecord.bbox ? [fieldRecord.bbox] : [];
    return maskAadhaarValue({
      ...fieldRecord,
      isTickbox: "option_chosen" in fieldRecord,
      boxes: lineRects.map((rect) => toPageFractionBox(rect, pageSize)).filter(Boolean),
      decision: toDecisionView(latestDecisions[fieldRecord.field]),
    });
  });
  const pageCount = isWorkbook ? Math.max(1, ...fieldRecords.map((fieldRecord) => fieldRecord.page || 1)) : pageSizes.length;
  return { caseId: caseEntry.id, formId: caseEntry.formId, label, outputType: isWorkbook ? OUTPUT_TYPES.XLSX : OUTPUT_TYPES.PDF, pageCount, fields };
}
