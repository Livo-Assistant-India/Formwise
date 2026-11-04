import Link from "next/link";

const CASE_STEPS = [
  { key: "form", label: "Form" },
  { key: "documents", label: "Documents" },
  { key: "review", label: "Review" },
  { key: "confirm", label: "Save" },
] as const;

export type CaseStepKey = (typeof CASE_STEPS)[number]["key"];

/** Steps already passed are links back (with a tick); the current one is highlighted. */
export default function CaseStepper({ currentStep, caseId }: { currentStep: CaseStepKey; caseId?: string }) {
  const currentIndex = CASE_STEPS.findIndex((step) => step.key === currentStep);
  return (
    <ol className="flex items-center rounded-lg bg-canvas p-0.5 text-[11px] ring-1 ring-line" aria-label="Steps">
      {CASE_STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const href = step.key === "form" ? "/cases/new" : caseId ? `/cases/${caseId}/${step.key}` : null;
        const label = (
          <span className={`flex h-6 items-center gap-1.5 rounded-md px-2 transition-colors duration-150 ${
            isCurrent ? "bg-white font-semibold text-ink shadow-sm ring-1 ring-line" : isDone ? "text-ink hover:bg-white/70" : "text-muted"}`}>
            <span className={`grid h-4 w-4 place-items-center rounded-full text-[9px] font-bold ${
              isCurrent ? "bg-brand-500 text-white" : isDone ? "bg-emerald-500 text-white" : "bg-line text-muted"}`}>{isDone ? "✓" : index + 1}</span>
            {step.label}
          </span>
        );
        return (
          <li key={step.key} aria-current={isCurrent ? "step" : undefined}>
            {isDone && href ? <Link href={href}>{label}</Link> : label}
          </li>
        );
      })}
    </ol>
  );
}
