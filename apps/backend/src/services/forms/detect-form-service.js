// Which known blank form (if any) an uploaded PDF is. Every form's own blank PDF is the reference: the uploaded file's
// words (first pages) are compared with each blank's, and the closest one wins - if it is clearly closer than the
// runner-up. Words are weighted by how rare they are across all blanks, so a word every VCC form has ("VCC") counts
// for almost nothing and a fund's own name ("Growth", "Bond") decides between near-identical forms. Nothing to
// maintain per form, so it keeps working at hundreds of forms (title phrases
// alone could not: every VCC form starts with the same company name). Uploaded bytes are never written to disk.
import { readFile } from "node:fs/promises";
import { getFormDefinition, isWorkbookForm, listFormIds } from "../../forms/form-registry.js";

const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

const COMPARED_PAGE_COUNT = 3;
const MINIMUM_WORD_LENGTH = 3;
const MINIMUM_SIMILARITY = 0.6;
// Near-identical forms (one per fund) differ only by a few rare words, so the winning lead can be small but must be clear.
const MINIMUM_LEAD_OVER_RUNNER_UP = 0.01;
const SAME_PAGE_COUNT_BONUS = 0.05;
const blankFingerprintsByPath = new Map(); // blank PDF path -> fingerprint, computed once per server run

/** { pageCount, words }: the distinct words (lower case, 3+ letters/digits) of the first pages. */
async function readFingerprint(pdfBytes) {
  const pdfDocument = await pdfjs.getDocument({ data: new Uint8Array(pdfBytes), isEvalSupported: false }).promise;
  try {
    const words = new Set();
    for (let pageNumber = 1; pageNumber <= Math.min(COMPARED_PAGE_COUNT, pdfDocument.numPages); pageNumber += 1) {
      const textContent = await (await pdfDocument.getPage(pageNumber)).getTextContent();
      const pageText = textContent.items.map((textItem) => textItem.str).join(" ").toLowerCase();
      for (const word of pageText.match(/[a-z0-9]+/g) || []) if (word.length >= MINIMUM_WORD_LENGTH) words.add(word);
    }
    return { pageCount: pdfDocument.numPages, words };
  } finally {
    await pdfDocument.destroy();
  }
}

async function getBlankFingerprint(blankFormPath) {
  if (!blankFingerprintsByPath.has(blankFormPath)) {
    blankFingerprintsByPath.set(blankFormPath, readFile(blankFormPath).then(readFingerprint).catch(() => null));
  }
  return blankFingerprintsByPath.get(blankFormPath);
}

/** How rare each word is among all blanks: log(blank count / blanks having the word). A word on every blank weighs 0. */
function buildWordWeights(blankFingerprints) {
  const blankCountByWord = new Map();
  for (const blank of blankFingerprints) for (const word of blank.words) blankCountByWord.set(word, (blankCountByWord.get(word) || 0) + 1);
  return (word) => Math.log((blankFingerprints.length + 1) / ((blankCountByWord.get(word) || 0) + 1));
}

/** Weighted shared words / weighted all words (0..1), plus a small bonus when the page counts match. */
function compareFingerprints(uploaded, blank, getWordWeight) {
  let sharedWeight = 0;
  let allWeight = 0;
  for (const word of new Set([...uploaded.words, ...blank.words])) {
    const wordWeight = getWordWeight(word);
    allWeight += wordWeight;
    if (uploaded.words.has(word) && blank.words.has(word)) sharedWeight += wordWeight;
  }
  const wordSimilarity = allWeight ? sharedWeight / allWeight : 0;
  return wordSimilarity + (uploaded.pageCount === blank.pageCount ? SAME_PAGE_COUNT_BONUS : 0);
}

/** Every form ranked by similarity to the uploaded PDF, best first: [{ formId, similarity }]. */
export async function rankFormsBySimilarity(pdfBytes) {
  const uploaded = await readFingerprint(pdfBytes);
  const blanks = [];
  for (const formId of listFormIds()) {
    const { formConfiguration } = getFormDefinition(formId);
    if (isWorkbookForm(formConfiguration)) continue; // an Excel template is never a dropped PDF
    const blank = await getBlankFingerprint(formConfiguration.blankFormPath);
    if (blank) blanks.push({ formId, blank });
  }
  const getWordWeight = buildWordWeights(blanks.map(({ blank }) => blank));
  const ranking = blanks.map(({ formId, blank }) => ({ formId, similarity: compareFingerprints(uploaded, blank, getWordWeight) }));
  return ranking.sort((first, second) => second.similarity - first.similarity);
}

/** The matching form id, or null when no form is a clear match (or the file isn't a readable PDF). */
export async function detectFormId(pdfBytes) {
  let ranking;
  try {
    ranking = await rankFormsBySimilarity(pdfBytes);
  } catch {
    return null;
  }
  const [best, runnerUp] = ranking;
  if (!best || best.similarity < MINIMUM_SIMILARITY) return null;
  if (runnerUp && best.similarity - runnerUp.similarity < MINIMUM_LEAD_OVER_RUNNER_UP) return null;
  return best.formId;
}
