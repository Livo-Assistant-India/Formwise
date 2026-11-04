"use client";
import Link from "next/link";
import { getBatchTemplateUrl } from "@/api/forms-api";
import type { FormSummary } from "@/types/forms";

/** Columns shared by the header and every row, so they always line up. */
export const FORMS_TABLE_GRID = "grid grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_7rem_3.5rem_3.5rem_15rem] items-center gap-4";

interface FormsTableRowProps {
  form: FormSummary;
  rowIndex: number;
  caseCount: number;
  isActive: boolean;
  isStartingCase: boolean;
  onHover: () => void;
  onStartCase: () => void;
}

/** One form: name and purpose, key fields, size (fields, required share, pages), cases using it, and actions. The
 * actions sit in a fixed-width column and only fade in, so hovering never moves anything. */
export default function FormsTableRow({ form, rowIndex, caseCount, isActive, isStartingCase, onHover, onStartCase }: FormsTableRowProps) {
  const fieldCount = form.fieldCount ?? 0;
  const requiredFieldCount = form.requiredFieldCount ?? 0;
  const requiredShare = fieldCount ? requiredFieldCount / fieldCount : 0;
  const actionClasses = "inline-flex h-7 items-center rounded-md px-2 text-[11px] font-medium transition-colors duration-150";
  return (
    <div data-row={rowIndex} onMouseEnter={onHover}
      className={`group relative ${FORMS_TABLE_GRID} border-b border-line/70 px-3 py-2 transition-colors duration-100 ${isActive ? "bg-canvas" : ""}`}>
      <span className={`absolute inset-y-0 left-0 w-0.5 bg-brand-500 transition-opacity duration-150 ${isActive ? "opacity-100" : "opacity-0"}`} aria-hidden />
      <Link href={`/forms/${form.formId}`} className="min-w-0" title={`${form.label}\n${form.blankFileName}`}>
        <span className="block truncate text-[13px] font-medium">{form.label}</span>
        <span className="block truncate text-[11px] text-muted">{form.purpose}</span>
      </Link>
      <span className="flex h-5 min-w-0 flex-wrap gap-1 overflow-hidden">
        {form.keyFields.map((keyField) => <span key={keyField} className="truncate rounded bg-canvas px-1.5 py-px text-[10px] text-muted ring-1 ring-line/70">{keyField}</span>)}
      </span>
      <span className="min-w-0" title={`${fieldCount} fields, ${requiredFieldCount} must be filled before saving`}>
        <span className="block text-[12px] tabular-nums">{fieldCount} <span className="text-muted">· {requiredFieldCount} req.</span></span>
        <span className="mt-1 block h-1 overflow-hidden rounded-full bg-line/70" aria-hidden>
          <span className="block h-full rounded-full bg-brand-500/80" style={{ width: `${requiredShare * 100}%` }} />
        </span>
      </span>
      <span className="text-[12px] tabular-nums text-muted" title="Pages something is written on">{form.writtenPageCount ?? "–"}</span>
      <span className={`text-[12px] tabular-nums ${caseCount ? "text-ink" : "text-muted/60"}`} title="Cases using this form">{caseCount}</span>
      <span className={`flex justify-end gap-1 transition-opacity duration-150 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"}`}>
        <button type="button" onClick={onStartCase} disabled={isStartingCase}
          className={`${actionClasses} text-brand-700 hover:bg-brand-50 disabled:opacity-50`}>{isStartingCase ? "Starting…" : "+ New case"}</button>
        <a href={getBatchTemplateUrl(form.formId)} className={`${actionClasses} text-muted hover:bg-white hover:text-ink`} title="Excel template for a batch of this form">Excel</a>
        <Link href={`/forms/${form.formId}`} className={`${actionClasses} bg-ink text-white hover:bg-black`}>Fields →</Link>
      </span>
    </div>
  );
}
