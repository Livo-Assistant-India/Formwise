// check-forms for a form filled into an Excel template ("outputType": "xlsx"), in place of the PDF-only checks:
// every mapped sheet + cell exists (the top-left cell of a merged box, its sheet's number as "page", used once),
// and every input cell of the template has a field - unless the form lists it in "ignoredCells" with the reason.
// An input cell is an empty cell drawn as a box (borders on all four sides) or filled yellow, as 360 ONE marks them.
import ExcelJS from "exceljs";

const CELL_ADDRESS_PATTERN = /^[A-Z]{1,3}[1-9]\d*$/;
const INPUT_FILL_COLOURS = new Set(["FFFFFF00"]);
const BORDER_SIDES = ["left", "right", "top", "bottom"];

const toCellId = (sheetName, cellAddress) => `${sheetName}!${cellAddress}`;
const isMergedInside = (cell) => cell.isMerged && cell.master.address !== cell.address;

function isInputCell(cell) {
  if (isMergedInside(cell) || (cell.value != null && cell.value !== "")) return false;
  const isBoxed = BORDER_SIDES.every((side) => cell.border?.[side]?.style);
  const isMarkedYellow = cell.fill?.type === "pattern" && INPUT_FILL_COLOURS.has(cell.fill.fgColor?.argb);
  return isBoxed || isMarkedYellow;
}

/** The nearest printed text to the left of a cell on its row - what a problem line quotes to find the box. */
function findRowLabel(worksheet, cell) {
  for (let columnNumber = cell.col - 1; columnNumber >= 1; columnNumber -= 1) {
    const labelText = worksheet.getRow(cell.row).getCell(columnNumber).text;
    if (labelText?.trim()) return labelText.trim().slice(0, 40);
  }
  return "";
}

/** Problem lines (empty = all good) for a workbook form's mapped cells and the template's input cells. */
export async function checkWorkbookCells(formConfiguration, positions) {
  const problems = [];
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(formConfiguration.blankFormPath);
  const sheetNumbers = new Map(workbook.worksheets.map((worksheet, sheetIndex) => [worksheet.name, sheetIndex + 1]));
  const coveredCellIds = new Set();

  for (const field of positions.fields) {
    const worksheet = workbook.getWorksheet(field.sheet);
    if (!worksheet) { problems.push(`field ${field.key}: sheet "${field.sheet}" does not exist`); continue; }
    if (!CELL_ADDRESS_PATTERN.test(field.cell || "")) { problems.push(`field ${field.key}: "${field.cell}" is not a cell address`); continue; }
    if (field.page !== sheetNumbers.get(field.sheet)) problems.push(`field ${field.key}: page ${field.page}, but "${field.sheet}" is sheet ${sheetNumbers.get(field.sheet)}`);
    const cell = worksheet.getCell(field.cell);
    if (isMergedInside(cell)) problems.push(`field ${field.key}: ${field.cell} is inside the merged box ${cell.master.address} - use ${cell.master.address}`);
    const cellId = toCellId(field.sheet, field.cell);
    if (coveredCellIds.has(cellId)) problems.push(`field ${field.key}: ${cellId} is already used by another field`);
    coveredCellIds.add(cellId);
  }
  for (const ignoredCell of formConfiguration.ignoredCells || []) {
    if (!ignoredCell.reason) problems.push(`ignored cell ${toCellId(ignoredCell.sheet, ignoredCell.cell)} has no reason`);
    if (!workbook.getWorksheet(ignoredCell.sheet)) problems.push(`ignored cell: sheet "${ignoredCell.sheet}" does not exist`);
    coveredCellIds.add(toCellId(ignoredCell.sheet, ignoredCell.cell));
  }

  for (const worksheet of workbook.worksheets) {
    for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
      for (let columnNumber = 1; columnNumber <= worksheet.columnCount; columnNumber += 1) {
        const cell = worksheet.getRow(rowNumber).getCell(columnNumber);
        if (!isInputCell(cell) || coveredCellIds.has(toCellId(worksheet.name, cell.address))) continue;
        problems.push(`input cell not covered: ${toCellId(worksheet.name, cell.address)} (row label "${findRowLabel(worksheet, cell)}")`);
      }
    }
  }
  return problems;
}
