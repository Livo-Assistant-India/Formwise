"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createCase } from "@/api/cases-api";
import { detectForm } from "@/api/forms-api";
import { useForms } from "@/api/queries";
import CaseStepper from "@/components/cases/CaseStepper";
import FormPicker from "@/components/forms/FormPicker";
import Notice from "@/components/ui/Notice";
import PageContainer from "@/components/ui/PageContainer";

/** Step 1 of a case: pick the form from the list, or drop its blank PDF and it is recognised. */
export default function NewCasePage() {
  const router = useRouter();
  const blankFormInput = useRef<HTMLInputElement>(null);
  const { data: forms, isLoading, error: formsError } = useForms();
  const [actionError, setErrorMessage] = useState<string | null>(null);
  const errorMessage = actionError || formsError?.message || null;
  const [isWorking, setIsWorking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  async function run(task: () => Promise<string>) {
    setIsWorking(true);
    setErrorMessage(null);
    try {
      const formId = await task();
      const createdCase = await createCase(formId);
      router.push(`/cases/${createdCase.id}/documents`);
    } catch (error) {
      setErrorMessage((error as Error).message);
      setIsWorking(false);
    }
  }
  const startCase = (formId: string) => run(async () => formId);
  const recognise = (file: File | undefined) => { if (file) run(async () => (await detectForm(file)).formId); };

  return (
    <PageContainer title="Pick a form" description="Search or use the arrow keys. Not listed? Drop its blank PDF below."
      actions={<CaseStepper currentStep="form" />}>
      <div className="mx-auto flex h-full max-w-[1200px] flex-col gap-3">
        {errorMessage ? <Notice tone="error">{errorMessage}</Notice> : null}
        <FormPicker forms={forms || []} isDisabled={isWorking} isLoading={isLoading} onPick={startCase} />
        <button type="button" disabled={isWorking} onClick={() => blankFormInput.current?.click()}
          onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => { event.preventDefault(); setIsDragging(false); recognise(event.dataTransfer.files[0]); }}
          className={`flex shrink-0 items-center gap-3 rounded-xl border border-dashed px-4 py-2.5 text-left transition-colors duration-150 disabled:opacity-60 ${
            isDragging ? "border-brand-500 bg-brand-50" : "border-line bg-white/60 hover:border-ink/30 hover:bg-white"}`}>
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-canvas text-sm text-muted ring-1 ring-line" aria-hidden>⇪</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium">{isWorking ? "Starting…" : isDragging ? "Drop to recognise" : "Drop a blank form PDF, or click to choose"}</span>
            <span className="block text-[11px] text-muted">We read only its title to find the form. The file is not saved.</span>
          </span>
        </button>
        <input ref={blankFormInput} type="file" accept="application/pdf" hidden
          onChange={(event) => { recognise(event.target.files?.[0]); event.target.value = ""; }} />
      </div>
    </PageContainer>
  );
}
