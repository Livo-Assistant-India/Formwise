"use client";
import FileDropZone from "@/components/ui/FileDropZone";

// .xlsx / .csv are the client's Excel (non-document values) - the page hands them to "Fill from Excel".
const DOCUMENT_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".xlsx", ".csv"];
const MAXIMUM_FILES_PER_UPLOAD = 15;

interface DocumentDropZoneProps {
  onFilesChosen: (documentFiles: File[], relativePaths: string[]) => void;
  isDisabled?: boolean;
}

/** Identity documents: up to 15 PDF/JPG/PNG files, loose or in folders (one folder per person helps grouping). */
export default function DocumentDropZone({ onFilesChosen, isDisabled = false }: DocumentDropZoneProps) {
  return (
    <FileDropZone allowedExtensions={DOCUMENT_EXTENSIONS} isMultiple isFolderAllowed maximumFileCount={MAXIMUM_FILES_PER_UPLOAD} isDisabled={isDisabled}
      title="Drop ID documents or a folder" buttonLabel="Choose files" onFilesChosen={onFilesChosen}
      hint={<>
        <span className="flex flex-wrap justify-center gap-1">
          {["Aadhaar", "PAN", "Passport", "Driving licence", "Client Excel"].map((kind) => (
            <span key={kind} className="rounded bg-canvas px-1.5 py-px ring-1 ring-line/70">{kind}</span>
          ))}
        </span>
        <span className="mt-1.5 block">PDF, JPG, PNG, XLSX · up to 15 files · 15 MB each</span>
        <span className="block">Several people? Files are sorted by the name on them.</span>
      </>} />
  );
}
