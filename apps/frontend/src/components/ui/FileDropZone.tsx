"use client";
import { useRef, useState, type ReactNode } from "react";
import { readDroppedFiles, readInputFiles, type ChosenFile } from "@/utils/read-dropped-files";
import Button from "./Button";

interface FileDropZoneProps {
  /** Allowed extensions, e.g. [".xlsx", ".csv"]. Dropped files are checked too (a drop ignores the picker filter). */
  allowedExtensions: string[];
  isMultiple?: boolean;
  /** Also accept whole folders (drop or "Choose folder"); each file keeps its folder path. */
  isFolderAllowed?: boolean;
  /** One "Choose folder" button only: pick the folder of client folders once and every file inside comes in. */
  isFolderOnly?: boolean;
  maximumFileCount?: number;
  title: string;
  hint?: ReactNode;
  buttonLabel?: string;
  isDisabled?: boolean;
  isCompact?: boolean;
  onFilesChosen: (chosenFiles: File[], relativePaths: string[]) => void;
}

const hasAllowedExtension = (chosenFile: File, allowedExtensions: string[]) =>
  allowedExtensions.some((extension) => chosenFile.name.toLowerCase().endsWith(extension.toLowerCase()));

/** Drag-and-drop area with a "Choose" button; rejects wrong file types and extra files with a clear message. */
export default function FileDropZone(props: FileDropZoneProps) {
  const { allowedExtensions, isMultiple = false, isFolderAllowed = false, isFolderOnly = false, maximumFileCount = isMultiple ? 10 : 1, title, hint, buttonLabel = "Choose file", isDisabled = false, isCompact = false, onFilesChosen } = props;
  const fileInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0); // dragenter/leave fire for every child element - count them so the highlight doesn't flicker
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);
  const [isQuietMessage, setIsQuietMessage] = useState(false);

  const handleFiles = (allFiles: ChosenFile[]) => {
    if (!allFiles.length || isDisabled) return;
    const allowedFiles = allFiles.filter((chosenFile) => hasAllowedExtension(chosenFile.file, allowedExtensions));
    const rejectedFiles = allFiles.filter((chosenFile) => !allowedFiles.includes(chosenFile));
    const rejectedNames = rejectedFiles.map((chosenFile) => chosenFile.file.name);
    // Inside a chosen folder, a note or readme next to the documents is expected - ignored quietly, not a warning.
    const isOnlyFolderExtras = rejectedFiles.length > 0 && rejectedFiles.every((chosenFile) => chosenFile.relativePath.includes("/"));
    const acceptedFiles = allowedFiles.slice(0, maximumFileCount);
    const messages = [];
    if (isOnlyFolderExtras) messages.push(`Not documents, left out: ${rejectedNames.slice(0, 5).join(", ")}${rejectedNames.length > 5 ? ` and ${rejectedNames.length - 5} more` : ""}`);
    else if (rejectedNames.length) messages.push(`Skipped (only ${allowedExtensions.join(", ")}): ${rejectedNames.slice(0, 5).join(", ")}${rejectedNames.length > 5 ? ` and ${rejectedNames.length - 5} more` : ""}`);
    if (allowedFiles.length > maximumFileCount) messages.push(maximumFileCount === 1 ? `Only one file at a time - using ${acceptedFiles[0].file.name}` : `Only ${maximumFileCount} files at a time - the rest were skipped`);
    if (!allowedFiles.length && !rejectedNames.length) messages.push("That folder is empty");
    setRejectionMessage(messages.length ? messages.join(". ") : null);
    setIsQuietMessage(isOnlyFolderExtras && messages.length === 1);
    if (acceptedFiles.length) onFilesChosen(acceptedFiles.map((chosenFile) => chosenFile.file), acceptedFiles.map((chosenFile) => chosenFile.relativePath));
  };

  return (
    // flex column: stretched by a grid (Add a form), the drop area fills it; elsewhere it keeps its own height.
    <div className="flex flex-col">
      <div
        onDragEnter={(event) => { event.preventDefault(); dragDepth.current += 1; setIsDraggingOver(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => { dragDepth.current = Math.max(0, dragDepth.current - 1); if (!dragDepth.current) setIsDraggingOver(false); }}
        onDrop={(event) => {
          event.preventDefault(); dragDepth.current = 0; setIsDraggingOver(false);
          if (isFolderAllowed) readDroppedFiles(event.dataTransfer).then(handleFiles, () => setRejectionMessage("Could not read that folder - choose the files instead"));
          else handleFiles(readInputFiles(event.dataTransfer.files));
        }}
        className={`group flex flex-1 flex-col justify-center rounded-xl border border-dashed text-center transition-[border-color,background-color,transform] duration-150 ${isCompact ? "px-4 py-4" : "px-5 py-6"} ${isDisabled ? "opacity-60" : ""} ${
          isDraggingOver ? "scale-[1.01] border-brand-500 bg-brand-50" : "border-ink/20 bg-white hover:border-ink/40"}`}
      >
        <span className={`mx-auto mb-2 grid h-9 w-9 place-items-center rounded-lg ring-1 transition-colors ${isDraggingOver ? "bg-brand-500 text-white ring-brand-500" : "bg-canvas text-muted ring-line group-hover:text-ink"}`} aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" /></svg>
        </span>
        <p className="text-[13px] font-semibold">{isDraggingOver ? "Drop to upload" : title}</p>
        {hint ? <div className="mt-1 text-[11px] text-muted">{hint}</div> : null}
        <div className="mt-3 flex justify-center gap-1.5">
          {isFolderOnly ? <Button size="small" variant="primary" disabled={isDisabled} onClick={() => folderInput.current?.click()}>Choose folder</Button>
            : <Button size="small" variant="primary" disabled={isDisabled} onClick={() => fileInput.current?.click()}>{buttonLabel}</Button>}
          {isFolderAllowed && !isFolderOnly ? <Button size="small" disabled={isDisabled} onClick={() => folderInput.current?.click()}>Choose folder</Button> : null}
        </div>
        <input ref={fileInput} type="file" accept={allowedExtensions.join(",")} multiple={isMultiple} hidden
          onChange={(event) => { handleFiles(readInputFiles(event.target.files)); event.target.value = ""; }} />
        {isFolderAllowed ? (
          <input ref={folderInput} type="file" hidden multiple {...{ webkitdirectory: "" }}
            onChange={(event) => { handleFiles(readInputFiles(event.target.files)); event.target.value = ""; }} />
        ) : null}
      </div>
      {rejectionMessage ? <p className={`mt-2 text-xs ${isQuietMessage ? "text-muted" : "text-amber-800"}`}>{rejectionMessage}</p> : null}
    </div>
  );
}
