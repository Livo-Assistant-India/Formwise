// Which dropped file belongs to which client: a folder anywhere in the file's path whose name is the client's
// reference ("C-002") - or the client's name ("Arjun Iyer") - claims it. Everything below that folder is kept
// ("Nominee 2/pan.jpg") so the server can still group by nominee folder.
// Joint-holder forms read the joint holder's documents: the client folder's "Joint holder" subfolder (any subfolder
// whose name starts with "joint"). A row with only joint-holder forms uses the client folder itself.
import type { BatchClient } from "@/types/batches";

const JOINT_HOLDER_ROLE = "joint_holder";
const isJointHolderFolder = (folderName: string) => normalizeFolderName(folderName).startsWith("joint");

export const MAXIMUM_DOCUMENTS_PER_CLIENT = 15;

export interface ClientFiles {
  files: File[];
  relativePaths: string[];
  skippedCount: number;
}

export interface FolderMatch {
  filesByCaseId: Map<string, ClientFiles>;
  unmatchedPaths: string[];
}

/** Files picked for one client by hand ("+ Add files" on its row) join whatever its folder gave it. */
export function addPickedFiles(folderMatch: FolderMatch, pickedFilesByCaseId: Map<string, File[]>): FolderMatch {
  const filesByCaseId = new Map(folderMatch.filesByCaseId);
  for (const [caseId, pickedFiles] of pickedFilesByCaseId) {
    const current = filesByCaseId.get(caseId) || { files: [], relativePaths: [], skippedCount: 0 };
    const room = Math.max(0, MAXIMUM_DOCUMENTS_PER_CLIENT - current.files.length);
    filesByCaseId.set(caseId, {
      files: [...current.files, ...pickedFiles.slice(0, room)], relativePaths: [...current.relativePaths, ...pickedFiles.slice(0, room).map((file) => file.name)],
      skippedCount: current.skippedCount + Math.max(0, pickedFiles.length - room),
    });
  }
  return { ...folderMatch, filesByCaseId };
}

const normalizeFolderName = (folderName: string) => folderName.toLowerCase().replace(/[^a-z0-9]/g, "");

export function matchClientFolders(allClients: BatchClient[], files: File[], relativePaths: string[]): FolderMatch {
  // The client folder belongs to each row's investor forms - or, in a row with only joint-holder forms, to those.
  const rowsWithInvestor = new Set(allClients.filter((client) => client.personRole !== JOINT_HOLDER_ROLE).map((client) => client.rowNumber));
  const clients = allClients.filter((client) => client.personRole !== JOINT_HOLDER_ROLE || !rowsWithInvestor.has(client.rowNumber));
  const jointCaseIdByRow = new Map(allClients.filter((client) => client.personRole === JOINT_HOLDER_ROLE && rowsWithInvestor.has(client.rowNumber))
    .map((client) => [client.rowNumber, client.caseId]));
  const rowByCaseId = new Map(allClients.map((client) => [client.caseId, client.rowNumber]));
  // A reference used by several rows can't pick one of them - those rows get their documents by hand.
  const referenceCounts = new Map<string, number>();
  for (const client of clients) {
    const reference = normalizeFolderName(client.clientReference || "");
    if (reference) referenceCounts.set(reference, (referenceCounts.get(reference) || 0) + 1);
  }
  const caseIdByFolderName = new Map<string, string>();
  for (const client of clients) {
    const reference = normalizeFolderName(client.clientReference || "");
    if (reference && referenceCounts.get(reference) === 1) caseIdByFolderName.set(reference, client.caseId);
  }
  // A folder named after a person only counts when exactly one client has that name.
  const nameCounts = new Map<string, number>();
  for (const client of clients) {
    const displayName = normalizeFolderName(client.displayName || "");
    if (displayName) nameCounts.set(displayName, (nameCounts.get(displayName) || 0) + 1);
  }
  for (const client of clients) {
    const displayName = normalizeFolderName(client.displayName || "");
    if (displayName && nameCounts.get(displayName) === 1 && !caseIdByFolderName.has(displayName)) caseIdByFolderName.set(displayName, client.caseId);
  }

  const filesByCaseId = new Map<string, ClientFiles>();
  const unmatchedPaths: string[] = [];
  files.forEach((file, fileIndex) => {
    const pathParts = (relativePaths[fileIndex] || file.name).split("/").filter(Boolean);
    const folderParts = pathParts.slice(0, -1);
    const matchIndex = folderParts.findIndex((folderName) => caseIdByFolderName.has(normalizeFolderName(folderName)));
    if (matchIndex < 0) { unmatchedPaths.push(pathParts.join("/")); return; }
    let caseId = caseIdByFolderName.get(normalizeFolderName(folderParts[matchIndex]))!;
    let keptPathStart = matchIndex + 1;
    const jointFolderIndex = folderParts.findIndex((folderName, index) => index > matchIndex && isJointHolderFolder(folderName));
    if (jointFolderIndex >= 0) {
      // The joint holder's documents: never mixed into the investor's. No joint-holder form in this row -> unmatched.
      const isJointOnlyRow = !rowsWithInvestor.has(rowByCaseId.get(caseId)!);
      const jointCaseId = isJointOnlyRow ? caseId : jointCaseIdByRow.get(rowByCaseId.get(caseId)!);
      if (!jointCaseId) { unmatchedPaths.push(pathParts.join("/")); return; }
      caseId = jointCaseId;
      keptPathStart = jointFolderIndex + 1;
    }
    const clientFiles = filesByCaseId.get(caseId) || { files: [], relativePaths: [], skippedCount: 0 };
    if (clientFiles.files.length >= MAXIMUM_DOCUMENTS_PER_CLIENT) clientFiles.skippedCount += 1;
    else {
      clientFiles.files.push(file);
      clientFiles.relativePaths.push(pathParts.slice(keptPathStart).join("/"));
    }
    filesByCaseId.set(caseId, clientFiles);
  });
  return { filesByCaseId, unmatchedPaths };
}
