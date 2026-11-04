import { getBatchTemplateUrl, getCombinedBatchTemplateUrl } from "@/api/forms-api";
import { FORM_GROUP_ORDER, getFormGroup } from "@/config/form-groups";
import type { FormSummary } from "@/types/forms";

interface BatchFormChooserProps {
  forms: FormSummary[];
  chosenFormIds: string[];
  isDisabled: boolean;
  onChange: (chosenFormIds: string[]) => void;
}

/** Tick one form, or several to fill each client's forms from one Excel. At least one stays ticked. */
export default function BatchFormChooser({ forms, chosenFormIds, isDisabled, onChange }: BatchFormChooserProps) {
  const toggleForm = (formId: string) => {
    const isChosen = chosenFormIds.includes(formId);
    if (isChosen && chosenFormIds.length === 1) return;
    // Keep the forms in list order, so the first ticked form is always the same one (its case gets the documents).
    onChange(forms.map((form) => form.formId).filter((candidateId) => (candidateId === formId ? !isChosen : chosenFormIds.includes(candidateId))));
  };
  const templateUrl = chosenFormIds.length > 1 ? getCombinedBatchTemplateUrl(chosenFormIds) : chosenFormIds[0] ? getBatchTemplateUrl(chosenFormIds[0]) : null;
  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-line bg-white" role="group" aria-label="Forms">
        {FORM_GROUP_ORDER.map((groupName) => {
          const groupForms = forms.filter((form) => getFormGroup(form) === groupName);
          if (!groupForms.length) return null;
          return (
            <div key={groupName}>
              <div className="border-b border-line bg-canvas/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">{groupName}</div>
              {groupForms.map((form) => {
                const isChosen = chosenFormIds.includes(form.formId);
                return (
                  <button key={form.formId} type="button" role="checkbox" aria-checked={isChosen} disabled={isDisabled} onClick={() => toggleForm(form.formId)}
                    className={`flex w-full items-center gap-2.5 border-b border-line/60 px-2.5 py-1.5 text-left text-xs transition-colors duration-100 last:border-b-0 disabled:opacity-60 ${isChosen ? "bg-brand-50/60" : "hover:bg-canvas"}`}>
                    <span className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded border text-[9px] leading-none transition-colors ${isChosen ? "border-brand-500 bg-brand-500 text-white" : "border-ink/25 bg-white"}`}>{isChosen ? "✓" : ""}</span>
                    <span className={`min-w-0 flex-1 truncate ${isChosen ? "font-medium text-ink" : "text-ink/80"}`} title={form.purpose}>{form.label}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs text-muted">
        {chosenFormIds.length > 1 ? "Each client gets every ticked form, from one Excel. " : "Tick more than one to fill several forms per client. "}
        {templateUrl ? <a href={templateUrl} className="text-brand-600 hover:underline">{chosenFormIds.length > 1 ? "Combined Excel template" : "Excel template"}</a> : null}
      </p>
    </div>
  );
}
