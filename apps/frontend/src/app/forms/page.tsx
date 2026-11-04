"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createCase } from "@/api/cases-api";
import { useCases, useForms } from "@/api/queries";
import FormsTableRow, { FORMS_TABLE_GRID } from "@/components/forms/FormsTableRow";
import { ButtonLink } from "@/components/ui/Button";
import Kbd from "@/components/ui/Kbd";
import Notice from "@/components/ui/Notice";
import PageContainer from "@/components/ui/PageContainer";
import { FORM_GROUP_DOT_CLASSES, FORM_GROUP_ORDER, getFormGroup } from "@/config/form-groups";
import { useHotkeys } from "@/hooks/useHotkeys";

const ALL_GROUPS = "All";
const NO_ACTIVE_ROW = -1;

/** Every form, grouped by stream: search, filter by group, see its size and use, open its fields or start a case. */
export default function FormsPage() {
  const router = useRouter();
  const { data: loadedForms, isLoading } = useForms();
  const { data: loadedCases } = useCases();
  const [searchText, setSearchText] = useState("");
  const [chosenGroup, setChosenGroup] = useState(ALL_GROUPS);
  const [activeRowIndex, setActiveRowIndex] = useState(NO_ACTIVE_ROW);
  const [startingFormId, setStartingFormId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const forms = useMemo(() => loadedForms || [], [loadedForms]);
  const caseCountByFormId = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const caseSummary of loadedCases || []) counts[caseSummary.formId] = (counts[caseSummary.formId] || 0) + 1;
    return counts;
  }, [loadedCases]);
  const searchWords = searchText.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const shownForms = forms
    .filter((form) => chosenGroup === ALL_GROUPS || getFormGroup(form) === chosenGroup)
    .filter((form) => searchWords.every((searchWord) =>
      `${form.label} ${form.purpose} ${form.keyFields.join(" ")} ${form.blankFileName} ${getFormGroup(form)}`.toLowerCase().includes(searchWord)))
    .sort((firstForm, secondForm) => FORM_GROUP_ORDER.indexOf(getFormGroup(firstForm)) - FORM_GROUP_ORDER.indexOf(getFormGroup(secondForm)));

  useEffect(() => setActiveRowIndex(searchText.trim() ? 0 : NO_ACTIVE_ROW), [searchText, chosenGroup]);
  useEffect(() => { document.querySelector(`[data-row="${activeRowIndex}"]`)?.scrollIntoView({ block: "nearest" }); }, [activeRowIndex]);
  const moveActiveRow = (rowStep: number) => setActiveRowIndex((rowIndex) => Math.max(0, Math.min(shownForms.length - 1, rowIndex + rowStep)));
  const handleOpenActiveRow = () => { if (shownForms[activeRowIndex]) router.push(`/forms/${shownForms[activeRowIndex].formId}`); };
  useHotkeys({ "/": () => searchInputRef.current?.focus(), j: () => moveActiveRow(1), k: () => moveActiveRow(-1),
    ArrowDown: () => moveActiveRow(1), ArrowUp: () => moveActiveRow(-1), Enter: handleOpenActiveRow });

  async function handleStartCase(formId: string) {
    setStartingFormId(formId);
    setStartError(null);
    try {
      const createdCase = await createCase(formId);
      router.push(`/cases/${createdCase.id}/documents`);
    } catch (error) {
      setStartError((error as Error).message);
      setStartingFormId(null);
    }
  }

  const renderGroupButton = (groupName: string, formCount: number) => (
    <button key={groupName} type="button" onClick={() => setChosenGroup(groupName)} aria-pressed={chosenGroup === groupName}
      className={`flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs transition-colors duration-150 ${chosenGroup === groupName ? "bg-ink text-white" : "text-muted hover:bg-canvas hover:text-ink"}`}>
      {groupName !== ALL_GROUPS ? <span className={`h-1.5 w-1.5 rounded-full ${FORM_GROUP_DOT_CLASSES[groupName]}`} aria-hidden /> : null}
      {groupName}<span className={`tabular-nums ${chosenGroup === groupName ? "text-white/60" : "text-muted/70"}`}>{formCount}</span>
    </button>
  );

  return (
    <PageContainer title="Forms" description="Where each field goes, which are required, and the Excel template for a batch."
      actions={<ButtonLink href="/forms/new" variant="primary" size="small">+ Add a form</ButtonLink>}>
      <div className="mx-auto flex h-full max-w-[1400px] flex-col gap-3">
        {startError ? <Notice tone="error">{startError}</Notice> : null}
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-white">
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
            <label className="flex h-8 w-64 max-w-full items-center gap-1.5 rounded-lg border border-line bg-canvas/60 px-2.5 transition-colors focus-within:border-ink/30 focus-within:bg-white">
              <span className="text-xs text-muted" aria-hidden>⌕</span>
              <input ref={searchInputRef} value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search name, field or PDF"
                onKeyDown={(event) => { if (event.key === "Escape") { setSearchText(""); event.currentTarget.blur(); } if (event.key === "ArrowDown") { event.preventDefault(); event.currentTarget.blur(); setActiveRowIndex(0); } }}
                className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted" aria-label="Search forms" />
              {searchText ? <button type="button" onClick={() => setSearchText("")} className="text-xs text-muted hover:text-ink" aria-label="Clear search">✕</button> : <Kbd>/</Kbd>}
            </label>
            <div className="flex flex-wrap items-center gap-0.5">
              {renderGroupButton(ALL_GROUPS, forms.length)}
              {FORM_GROUP_ORDER.filter((groupName) => forms.some((form) => getFormGroup(form) === groupName))
                .map((groupName) => renderGroupButton(groupName, forms.filter((form) => getFormGroup(form) === groupName).length))}
            </div>
            <span className="ml-auto text-[11px] tabular-nums text-muted">{shownForms.length} of {forms.length}</span>
          </div>
          <div className={`${FORMS_TABLE_GRID} border-b border-line bg-canvas/70 px-3 py-1.5 text-[11px] font-medium text-muted`}>
            <span>Form</span><span>Key fields</span><span>Fields</span><span>Pages</span><span>Cases</span><span />
          </div>
          <div className="min-h-0 flex-1 overflow-auto">
            {isLoading ? [0, 1, 2, 3, 4].map((placeholderIndex) => <div key={placeholderIndex} className="mx-3 my-3 h-7 animate-pulse rounded bg-canvas" />) : null}
            {!isLoading && !shownForms.length ? <p className="p-8 text-center text-xs text-muted">No form matches “{searchText}”.</p> : null}
            {shownForms.map((form, rowIndex) => {
              const groupName = getFormGroup(form);
              const isFirstOfGroup = chosenGroup === ALL_GROUPS && (rowIndex === 0 || getFormGroup(shownForms[rowIndex - 1]) !== groupName);
              return (
                <div key={form.formId}>
                  {isFirstOfGroup ? (
                    <div className="sticky top-0 z-10 flex items-center gap-1.5 border-b border-line bg-canvas/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted backdrop-blur">
                      <span className={`h-1.5 w-1.5 rounded-full ${FORM_GROUP_DOT_CLASSES[groupName]}`} aria-hidden />{groupName}
                    </div>
                  ) : null}
                  <FormsTableRow form={form} rowIndex={rowIndex} caseCount={caseCountByFormId[form.formId] || 0} isActive={rowIndex === activeRowIndex}
                    isStartingCase={startingFormId === form.formId} onHover={() => setActiveRowIndex(rowIndex)} onStartCase={() => handleStartCase(form.formId)} />
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 border-t border-line bg-canvas/50 px-3 py-1 text-[10px] text-muted">
            <span className="flex items-center gap-1"><Kbd>J</Kbd><Kbd>K</Kbd> move</span>
            <span className="flex items-center gap-1"><Kbd>↵</Kbd> open fields</span>
            <span className="flex items-center gap-1"><Kbd>/</Kbd> search</span>
            <span className="ml-auto">Hover a form for its actions</span>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
