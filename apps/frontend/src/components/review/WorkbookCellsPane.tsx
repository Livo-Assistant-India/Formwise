"use client";
import type { ReactNode } from "react";
import { formatFieldLabel } from "@prefill/shared";
import StatusState from "@/components/ui/StatusState";
import type { CaseField } from "@/types/cases";

interface WorkbookCellsPaneProps {
  /** Every field of a form filled into an Excel template (each has its sheet + cell). */
  fields: CaseField[];
  /** The value in effect for a field: typed now, a saved correction, or what the fill produced. */
  getFieldValue: (caseField: CaseField) => string | null;
  selectedFieldKey: string | null;
  onSelectField: (fieldKey: string) => void;
  headerActions?: ReactNode;
}

/** "C21" -> [21, 3]: row, then column, so cells list top to bottom as in the template. */
function toCellOrder(cellAddress = "") {
  const match = /^([A-Z]+)(\d+)$/.exec(cellAddress);
  if (!match) return [Number.MAX_SAFE_INTEGER, 0];
  const columnNumber = [...match[1]].reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0);
  return [Number(match[2]), columnNumber];
}

/** The filled Excel as a list of cells (sheet, cell, field, value) - an Excel template has no page image to show.
 * Click a row to edit that field. */
export default function WorkbookCellsPane({ fields, getFieldValue, selectedFieldKey, onSelectField, headerActions }: WorkbookCellsPaneProps) {
  const cellFields = fields.filter((caseField) => caseField.cell).sort((first, second) => {
    const [firstRow, firstColumn] = toCellOrder(first.cell);
    const [secondRow, secondColumn] = toCellOrder(second.cell);
    return (first.page ?? 0) - (second.page ?? 0) || firstRow - secondRow || firstColumn - secondColumn;
  });
  const filledCount = cellFields.filter((caseField) => getFieldValue(caseField)).length;
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-11 shrink-0 items-center gap-2 whitespace-nowrap border-b border-line bg-white px-3 text-xs text-muted">
        {headerActions}
        <span className="ml-auto rounded-full bg-canvas px-2 py-0.5">{filledCount} of {cellFields.length} cells filled</span>
      </div>
      {cellFields.length ? (
        <div className="min-h-0 flex-1 overflow-auto bg-white">
          <table className="w-full table-fixed text-left text-xs">
            <thead className="sticky top-0 bg-canvas text-[11px] text-muted">
              <tr>
                <th className="w-24 px-3 py-1.5 font-medium">Sheet</th>
                <th className="w-12 py-1.5 font-medium">Cell</th>
                <th className="w-[38%] py-1.5 font-medium">Field</th>
                <th className="py-1.5 pr-3 font-medium">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {cellFields.map((caseField) => {
                const cellValue = getFieldValue(caseField);
                const isSelected = caseField.field === selectedFieldKey;
                return (
                  <tr key={caseField.field} onClick={() => onSelectField(caseField.field)}
                    className={`cursor-pointer ${isSelected ? "bg-brand-50" : "hover:bg-canvas"}`}>
                    <td className="truncate px-3 py-1.5 text-muted" title={caseField.sheet}>{caseField.sheet}</td>
                    <td className="py-1.5 font-mono tabular-nums text-muted">{caseField.cell}</td>
                    <td className="truncate py-1.5 pr-2 font-medium" title={formatFieldLabel(caseField.field)}>{formatFieldLabel(caseField.field)}</td>
                    <td className={`truncate py-1.5 pr-3 text-[13px] ${cellValue ? "" : "text-muted"}`} title={cellValue || undefined}>{cellValue || "empty"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <StatusState title="No cells to fill" message="This form has no cells set up yet - check Form setup." />
      )}
    </div>
  );
}
