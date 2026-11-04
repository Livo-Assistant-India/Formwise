"use client";
import { useEffect, useRef, useState } from "react";
import Kbd from "@/components/ui/Kbd";
import { FORM_GROUP_DOT_CLASSES, FORM_GROUP_ORDER, getFormGroup } from "@/config/form-groups";
import { useHotkeys } from "@/hooks/useHotkeys";
import type { FormSummary } from "@/types/forms";

const ALL_GROUPS = "All";
const NO_ACTIVE_ROW = -1;

interface FormPickerProps {
  forms: FormSummary[];
  isDisabled: boolean;
  isLoading: boolean;
  onPick: (formId: string) => void;
}

/** Every form in one dense list, grouped by stream. Type to filter, arrows to move, Enter to start. */
export default function FormPicker({ forms, isDisabled, isLoading, onPick }: FormPickerProps) {
  const [searchText, setSearchText] = useState("");
  const [chosenGroup, setChosenGroup] = useState(ALL_GROUPS);
  // Nothing is active until the user types or uses the arrows, so a stray Enter never starts a case.
  const [activeRowIndex, setActiveRowIndex] = useState(NO_ACTIVE_ROW);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const groupsWithForms = FORM_GROUP_ORDER.filter((groupName) => forms.some((form) => getFormGroup(form) === groupName));
  const searchWords = searchText.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const shownForms = forms
    .filter((form) => chosenGroup === ALL_GROUPS || getFormGroup(form) === chosenGroup)
    .filter((form) => searchWords.every((searchWord) =>
      `${form.label} ${form.shortLabel} ${form.purpose} ${form.keyFields.join(" ")} ${getFormGroup(form)}`.toLowerCase().includes(searchWord)))
    .sort((firstForm, secondForm) => FORM_GROUP_ORDER.indexOf(getFormGroup(firstForm)) - FORM_GROUP_ORDER.indexOf(getFormGroup(secondForm)));

  useEffect(() => { searchInputRef.current?.focus(); }, []);
  useEffect(() => setActiveRowIndex(searchText.trim() ? 0 : NO_ACTIVE_ROW), [searchText, chosenGroup]);
  useEffect(() => { listRef.current?.querySelector(`[data-row="${activeRowIndex}"]`)?.scrollIntoView({ block: "nearest" }); }, [activeRowIndex]);
  const moveActiveRow = (rowStep: number) => setActiveRowIndex((rowIndex) => Math.max(0, Math.min(shownForms.length - 1, rowIndex + rowStep)));
  const handlePickActiveRow = () => {
    const activeForm = shownForms[activeRowIndex];
    if (activeRowIndex !== NO_ACTIVE_ROW && activeForm && !isDisabled) onPick(activeForm.formId);
  };
  useHotkeys({ "/": () => searchInputRef.current?.focus(), ArrowDown: () => moveActiveRow(1), ArrowUp: () => moveActiveRow(-1),
    j: () => moveActiveRow(1), k: () => moveActiveRow(-1), Enter: handlePickActiveRow });

  const renderGroupButton = (groupName: string, formCount: number) => {
    const isChosen = chosenGroup === groupName;
    return (
      <button key={groupName} type="button" onClick={() => setChosenGroup(groupName)} aria-pressed={isChosen}
        className={`flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs transition-colors duration-150 ${isChosen ? "bg-ink text-white" : "text-muted hover:bg-canvas hover:text-ink"}`}>
        {groupName !== ALL_GROUPS ? <span className={`h-1.5 w-1.5 rounded-full ${FORM_GROUP_DOT_CLASSES[groupName]}`} aria-hidden /> : null}
        {groupName}<span className={`tabular-nums ${isChosen ? "text-white/60" : "text-muted/70"}`}>{formCount}</span>
      </button>
    );
  };

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
        <label className="flex h-8 w-72 max-w-full items-center gap-1.5 rounded-lg border border-line bg-canvas/60 px-2.5 transition-colors focus-within:border-ink/30 focus-within:bg-white">
          <span className="text-xs text-muted" aria-hidden>⌕</span>
          <input ref={searchInputRef} value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search forms - fund, W-8BEN, nomination…"
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); moveActiveRow(event.key === "ArrowDown" ? 1 : -1); }
              if (event.key === "Enter") handlePickActiveRow();
              if (event.key === "Escape") setSearchText("");
            }}
            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted" aria-label="Search forms" />
          {searchText ? <button type="button" onClick={() => setSearchText("")} className="text-xs text-muted hover:text-ink" aria-label="Clear search">✕</button> : <Kbd>/</Kbd>}
        </label>
        <div className="flex flex-wrap items-center gap-0.5">
          {renderGroupButton(ALL_GROUPS, forms.length)}
          {groupsWithForms.map((groupName) => renderGroupButton(groupName, forms.filter((form) => getFormGroup(form) === groupName).length))}
        </div>
        <span className="ml-auto text-[11px] tabular-nums text-muted">{shownForms.length} form{shownForms.length === 1 ? "" : "s"}</span>
      </div>
      <div ref={listRef} className="min-h-0 flex-1 overflow-auto" role="listbox" aria-label="Forms">
        {isLoading ? [0, 1, 2, 3, 4].map((placeholderIndex) => <div key={placeholderIndex} className="mx-3 my-3 h-6 animate-pulse rounded bg-canvas" />) : null}
        {!isLoading && !shownForms.length ? <p className="p-8 text-center text-xs text-muted">No form matches “{searchText}”. Try a fund name, or upload the blank PDF below.</p> : null}
        {shownForms.map((form, rowIndex) => {
          const groupName = getFormGroup(form);
          const isFirstOfGroup = chosenGroup === ALL_GROUPS && (rowIndex === 0 || getFormGroup(shownForms[rowIndex - 1]) !== groupName);
          const isActive = rowIndex === activeRowIndex;
          return (
            <div key={form.formId}>
              {isFirstOfGroup ? (
                <div className="sticky top-0 z-10 flex items-center gap-1.5 border-b border-line bg-canvas/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted backdrop-blur">
                  <span className={`h-1.5 w-1.5 rounded-full ${FORM_GROUP_DOT_CLASSES[groupName]}`} aria-hidden />{groupName}
                </div>
              ) : null}
              <button type="button" role="option" aria-selected={isActive} data-row={rowIndex} disabled={isDisabled}
                onMouseEnter={() => setActiveRowIndex(rowIndex)} onClick={() => onPick(form.formId)}
                className={`group relative grid w-full grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] items-center gap-4 border-b border-line/70 px-3 py-2 text-left transition-colors duration-100 disabled:opacity-50 ${isActive ? "bg-canvas" : ""}`}>
                <span className={`absolute inset-y-0 left-0 w-0.5 bg-brand-500 transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`} aria-hidden />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium">{form.label}</span>
                  <span className="block truncate text-[11px] text-muted">{form.purpose}</span>
                </span>
                <span className="flex h-5 min-w-0 flex-wrap gap-1 overflow-hidden">
                  {form.keyFields.map((keyField) => <span key={keyField} className="truncate rounded bg-canvas px-1.5 py-px text-[10px] text-muted ring-1 ring-line/70">{keyField}</span>)}
                </span>
                <span className={`flex items-center gap-1.5 text-[11px] font-medium transition-[opacity,transform] duration-150 ${isActive ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0"}`}>
                  Start <Kbd>↵</Kbd>
                </span>
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 border-t border-line bg-canvas/50 px-3 py-1 text-[10px] text-muted">
        <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> move</span>
        <span className="flex items-center gap-1"><Kbd>↵</Kbd> start case</span>
        <span className="flex items-center gap-1"><Kbd>Esc</Kbd> clear</span>
      </div>
    </section>
  );
}
