// Fills a copy of an Excel template - a form whose configuration says "outputType": "xlsx" (e.g. 360 ONE's Investor
// Profile). Each field's value goes into its sheet + cell from field-positions.json; the template's own formatting
// (fonts, fills, borders, merged boxes, number formats) is kept. The same job fillTextFields does for a PDF, with
// result records of the same shape: no page boxes (bbox / lines are null), plus the sheet and cell written.
import path from "node:path";
import ExcelJS from "exceljs";
import { statusFor } from "../pdf/pdf-drawing-helpers.js";

const NUMBER_TEXT_PATTERN = /^-?\d+(\.\d+)?$/;
const TEXT_NUMBER_FORMATS = new Set(["General", "@"]);

/** The option a value means: exact, else ignoring case and punctuation ("yes" -> "Yes"). null when none - never a guess. */
function matchCellOption(options, value) {
  const normalizeOptionText = (text) => String(text).toLowerCase().replace(/[^a-z0-9]/g, "");
  return options.find((option) => option === value)
    || options.find((option) => normalizeOptionText(option) === normalizeOptionText(value)) || null;
}

/** A cell the template formats as a number ("#,##0") gets a real number, so Excel shows it the template's way;
 * everything else (dates included) is written as the text the reviewer saw. */
function toCellValue(cell, valueText) {
  const numberFormat = cell.numFmt || "General";
  const isNumberCell = !TEXT_NUMBER_FORMATS.has(numberFormat) && /[0#]/.test(numberFormat) && !/[dmy]/i.test(numberFormat);
  const plainNumberText = valueText.replace(/,/g, "").trim();
  return isNumberCell && NUMBER_TEXT_PATTERN.test(plainNumberText) ? Number(plainNumberText) : valueText;
}

/**
 * Write every mapping.fields entry into a fresh copy of formConfiguration.blankFormPath (an .xlsx), calling
 * `getValue(field, label) -> {value, confidence, sourceFile, skipReason, notApplicable, notProvided, copiedFrom}`.
 * A field with "options" writes the matching option (a value that matches none is left out and flagged); one with
 * "appendToTemplateText" writes after the text already in its cell.
 * Returns { workbook, results } - the caller saves the workbook and the results JSON itself.
 */
export async function fillWorkbookCells(formConfiguration, mapping, getValue) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(formConfiguration.blankFormPath);
  const results = [];
  for (const field of mapping.fields) {
    const label = `${field.key}${field.nominee != null ? `_n${field.nominee}` : ""}`;
    const fieldValue = (await getValue(field, label)) || {};
    const { value = null, confidence = null, sourceFile = null, skipReason = null, notApplicable = false, notProvided = false, copiedFrom = null } = fieldValue;
    const worksheet = workbook.getWorksheet(field.sheet);
    if (!worksheet) throw new Error(`${field.key}: no sheet "${field.sheet}" in ${path.basename(formConfiguration.blankFormPath)}`);
    const cell = worksheet.getCell(field.cell);

    let writtenValue = value;
    let optionDetails = {};
    let optionProblem = null;
    if (field.options) {
      const chosenOption = value == null || value === "" ? null : matchCellOption(field.options, value);
      optionDetails = { options: field.options, option_chosen: chosenOption };
      if (value != null && value !== "" && !chosenOption) optionProblem = `"${value}" is not one of: ${field.options.join(" / ")} - pick one`;
      writtenValue = chosenOption;
    }
    if (writtenValue != null && writtenValue !== "") {
      // "appendToTemplateText": the box already holds a printed prompt ("If yes please provide details: ") - keep it.
      const templateText = field.appendToTemplateText && typeof cell.value === "string" ? cell.value : "";
      cell.value = templateText ? `${templateText}${writtenValue}` : toCellValue(cell, String(writtenValue));
      // Long text wraps inside its (merged) box, starting at the top; the cell's other formatting stays as it was.
      if (field.type === "multiline") cell.style = { ...cell.style, alignment: { ...cell.style.alignment, wrapText: true, vertical: "top" } };
    }

    const { status, reason } = optionProblem
      ? { status: "needs_review", reason: optionProblem }
      : statusFor({ value, truncated: false, confidence, skipReason, notApplicable, notProvided });
    results.push({
      field: label, page: field.page, bbox: null, lines: null, value, source: field.source,
      source_file: sourceFile, ocr_confidence: confidence, status, reason, sheet: field.sheet, cell: field.cell, ...optionDetails,
      ...(copiedFrom ? { copied_from: copiedFrom } : {}),
    });
  }
  return { workbook, results };
}
