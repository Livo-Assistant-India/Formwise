"use client";
import { formatFieldLabel } from "@prefill/shared";
import type { FormMappingItem } from "@/types/forms";

interface WorkbookMappingTableProps {
  mappingItems: FormMappingItem[];
  requiredFields: Set<string>;
  selectedKey: string | null;
  onSelectKey: (fieldKey: string) => void;
}

/** "C21" -> [21, 3]: row, then column, so cells list top to bottom as in the template. */
function toCellOrder(cellAddress = "") {
  const match = /^([A-Z]+)(\d+)$/.exec(cellAddress);
  if (!match) return [Number.MAX_SAFE_INTEGER, 0];
  return [Number(match[2]), [...match[1]].reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0)];
}

/** Form setup for an Excel form: there is no page image, so every cell it fills is listed (sheet, cell, field, source). */
export default function WorkbookMappingTable({ mappingItems, requiredFields, selectedKey, onSelectKey }: WorkbookMappingTableProps) {
  const sortedItems = [...mappingItems].sort((first, second) => {
    const [firstRow, firstColumn] = toCellOrder(first.cell);
    const [secondRow, secondColumn] = toCellOrder(second.cell);
    return first.page - second.page || firstRow - secondRow || firstColumn - secondColumn;
  });
  return (
    <div className="h-full overflow-auto rounded border border-line bg-white">
      <table className="w-full table-fixed text-left text-xs">
        <thead className="sticky top-0 bg-canvas text-[11px] text-muted">
          <tr>
            <th className="w-28 px-3 py-1.5 font-medium">Sheet</th>
            <th className="w-14 py-1.5 font-medium">Cell</th>
            <th className="w-[38%] py-1.5 font-medium">Field</th>
            <th className="py-1.5 pr-3 font-medium">Comes from</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {sortedItems.map((mappingItem) => {
            const isRequired = requiredFields.has(mappingItem.key);
            return (
              <tr key={mappingItem.id} onClick={() => onSelectKey(mappingItem.key)}
                className={`cursor-pointer ${mappingItem.key === selectedKey ? "bg-brand-50" : "hover:bg-canvas"}`}>
                <td className="truncate px-3 py-1.5 text-muted" title={mappingItem.sheet}>{mappingItem.sheet}</td>
                <td className="py-1.5 font-mono tabular-nums text-muted">{mappingItem.cell}</td>
                <td className="truncate py-1.5 pr-2 font-medium" title={formatFieldLabel(mappingItem.key)}>
                  <span className={`mr-1.5 inline-block h-2 w-2 rounded-sm ${isRequired ? "bg-red-500" : "bg-brand-500"}`} />
                  {formatFieldLabel(mappingItem.key)}
                </td>
                <td className="truncate py-1.5 pr-3 text-muted" title={mappingItem.source}>{mappingItem.source}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
