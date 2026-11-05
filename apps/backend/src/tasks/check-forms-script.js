// Checks every form in one go, so a change to the shared engine or to one form's files can't quietly break another.
//   pnpm check-forms               sanity checks only
//   pnpm check-forms --snapshot    also record each form's resolved setup + where every value lands (golden files)
//   pnpm check-forms --compare     also compare against the recorded snapshots and list every difference
// Sanity checks per form: blank PDF exists; every field, tick box and signature box is on a real page and inside
// it; every field has a source and every source a field; required fields, review sections and copy.X sources point
// at real fields; every blank on the PDF (underscore line, ☐ box, dotted line) has a field near it, unless the form
// lists it in "ignoredBlanks" with the reason (e.g. a wire-transfer instruction); the blank, dropped on "Pick a form", is
// recognised as this form (not a near-identical one). A form filled into an Excel template ("outputType": "xlsx") skips
// the PDF-only checks and instead checks its sheet/cell mapping (check-workbook-form-helpers.js). Exit code 1 when
// anything fails.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument } from "pdf-lib";

import { getFormDefinition, isWorkbookForm, listFormIds } from "../forms/form-registry.js";
import * as formFiles from "../services/forms/form-files-service.js";
import { fillTextFields } from "../services/pdf/fill-pdf-service.js";
import { extractTextItems } from "../services/pdf/pdf-text-service.js";
import { detectFormId } from "../services/forms/detect-form-service.js";
import { checkWorkbookCells } from "./check-workbook-form-helpers.js";

// Golden files: committed, so any change to what lands on a form shows up in review.
const SNAPSHOT_DIRECTORY = path.join(path.dirname(fileURLToPath(import.meta.url)), "form-snapshots");

const mode = process.argv.includes("--snapshot") ? "snapshot" : process.argv.includes("--compare") ? "compare" : "check";
const toBaseKey = (fieldKey) => fieldKey.replace(/_n\d+$/, "");
const roundNumber = (number) => Math.round(number * 100) / 100;

/** Everything about a form that decides what lands where, with paths reduced to file names (machine-independent). */
function describeConfiguration(formConfiguration) {
  const { blankFormPath, nomineeHeaderRe, ...rest } = formConfiguration;
  return { ...rest, blankFileName: path.basename(blankFormPath), nomineeHeaderRe: String(nomineeHeaderRe) };
}

/** Every field has a source and every source a field; required fields, review sections and copy.X point at real fields. */
function checkFieldReferences(positions, formConfiguration, fieldSources, formRules) {
  const problems = [];
  const fieldKeys = new Set([...positions.fields.map((field) => field.key), ...formConfiguration.tickboxes.map((tickbox) => tickbox.key)]);
  for (const fieldKey of fieldKeys) if (!(fieldKey in fieldSources)) problems.push(`field ${fieldKey} has no source`);
  for (const [fieldKey, source] of Object.entries(fieldSources)) {
    if (!fieldKeys.has(fieldKey)) problems.push(`source for ${fieldKey}, but no such field`);
    const copiedKey = /^copy\.(.+)$/.exec(source)?.[1];
    if (copiedKey && !fieldKeys.has(copiedKey)) problems.push(`${fieldKey} copies ${copiedKey}, which does not exist`);
  }
  for (const fieldKey of formRules.requiredFields) if (!fieldKeys.has(toBaseKey(fieldKey))) problems.push(`required field ${fieldKey} does not exist`);
  for (const section of formRules.reviewSections || []) {
    for (const fieldKey of section.fields) if (!fieldKeys.has(toBaseKey(fieldKey))) problems.push(`review section "${section.label}" lists unknown field ${fieldKey}`);
  }
  return problems;
}

async function checkForm(formId) {
  const problems = [];
  const { formConfiguration } = getFormDefinition(formId);
  const positions = await formFiles.fetchFieldPositions(formId);
  const fieldSources = await formFiles.fetchFieldSources(formId);
  const formRules = await formFiles.fetchFormRules(formId);
  const isWorkbook = isWorkbookForm(formConfiguration);
  if (!existsSync(formConfiguration.blankFormPath)) return { problems: [`blank ${isWorkbook ? "Excel template" : "PDF"} missing: ${formConfiguration.blankFormPath}`] };
  if (isWorkbook) {
    problems.push(...await checkWorkbookCells(formConfiguration, positions));
    problems.push(...checkFieldReferences(positions, formConfiguration, fieldSources, formRules));
    return { problems, snapshot: { formId, configuration: describeConfiguration(formConfiguration), positions, fieldSources, formRules } };
  }
  const blankDocument = await PDFDocument.load(readFileSync(formConfiguration.blankFormPath));
  const pageSizes = blankDocument.getPages().map((page) => page.getSize());

  const checkSpot = (what, page, x, y) => {
    const pageSize = pageSizes[page - 1];
    if (!pageSize) problems.push(`${what}: page ${page} does not exist (blank has ${pageSizes.length})`);
    else if (x < 0 || y < 0 || x > pageSize.width || y > pageSize.height) problems.push(`${what}: (${x}, ${y}) is outside page ${page}`);
  };
  for (const field of positions.fields) {
    checkSpot(`field ${field.key}`, field.page, field.x, field.y);
    for (const repeat of field.alsoAt || []) checkSpot(`field ${field.key} (repeat)`, repeat.page, repeat.x, repeat.y);
  }
  for (const tickbox of formConfiguration.tickboxes) {
    for (const [option, boxes] of Object.entries(tickbox.boxesByOption || {})) {
      for (const box of boxes) checkSpot(`tick ${tickbox.key} "${option}"`, box.page || tickbox.page, box.x, box.y);
    }
  }
  for (const signatureBox of formConfiguration.signatureBoxes || []) checkSpot(`signature "${signatureBox.label}"`, signatureBox.page, signatureBox.x, signatureBox.y);

  problems.push(...checkFieldReferences(positions, formConfiguration, fieldSources, formRules));

  // Every blank printed on the PDF must have a field, tick box or signature box on its line.
  const BLANK_PATTERN = /_{4,}|☐|\.{8,}/;
  const spotsByPage = {};
  const addSpot = (page, y, tolerance) => (spotsByPage[page] ||= []).push({ y, tolerance });
  for (const field of positions.fields) {
    addSpot(field.page, field.y, 14);
    for (const repeat of field.alsoAt || []) addSpot(repeat.page, repeat.y, 14);
    if (field.maxY) addSpot(field.page, field.maxY, 14);
  }
  for (const tickbox of formConfiguration.tickboxes) {
    for (const boxes of Object.values(tickbox.boxesByOption || {})) for (const box of boxes) addSpot(box.page || tickbox.page, box.y, 14);
    for (const optionY of Object.values(tickbox.optionY || {})) addSpot(tickbox.page, optionY, 14);
  }
  for (const signatureBox of formConfiguration.signatureBoxes || []) addSpot(signatureBox.page, signatureBox.y + signatureBox.h, 25);
  const ignoredBlanks = formConfiguration.ignoredBlanks || [];
  for (const textItem of await extractTextItems(formConfiguration.blankFormPath)) {
    if (!BLANK_PATTERN.test(textItem.text)) continue;
    const isCovered = (spotsByPage[textItem.page] || []).some((spot) => Math.abs(spot.y - textItem.y) <= spot.tolerance)
      || ignoredBlanks.some((ignored) => ignored.page === textItem.page && Math.abs(ignored.y - textItem.y) <= 6);
    if (!isCovered) problems.push(`blank not covered: page ${textItem.page}, y ${Math.round(textItem.y)}: "${textItem.text.trim().slice(0, 50)}"`);
  }

  const detectedFormId = await detectFormId(readFileSync(formConfiguration.blankFormPath));
  if (detectedFormId !== formId) problems.push(`its blank PDF is recognised as ${detectedFormId || "no form"} - recognition must pick this form`);

  // Where every value lands when each field gets a sample value - what the engine actually draws.
  const { results } = await fillTextFields(formConfiguration, positions, async (field) => ({ value: `SAMPLE ${field.key}`.slice(0, 40) }));
  const drawnSpots = results.map((result) => ({ field: result.field, page: result.page,
    lines: (result.lines || []).map((line) => [roundNumber(line.x), roundNumber(line.y), roundNumber(line.width), roundNumber(line.height)]) }));
  const snapshot = { formId, pageCount: pageSizes.length, configuration: describeConfiguration(formConfiguration), positions, fieldSources, formRules, drawnSpots };
  return { problems, snapshot };
}

/** Lists the paths where two JSON values differ, e.g. "positions.fields.12.y: 376.44 -> 378". */
function listDifferences(expected, actual, at = "") {
  if (JSON.stringify(expected) === JSON.stringify(actual)) return [];
  if (expected && actual && typeof expected === "object" && typeof actual === "object") {
    const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
    return [...keys].flatMap((key) => listDifferences(expected[key], actual[key], at ? `${at}.${key}` : key));
  }
  return [`${at}: ${JSON.stringify(expected)?.slice(0, 80)} -> ${JSON.stringify(actual)?.slice(0, 80)}`];
}

let failedFormCount = 0;
mkdirSync(SNAPSHOT_DIRECTORY, { recursive: true });
for (const formId of listFormIds().sort()) {
  const { problems, snapshot } = await checkForm(formId);
  const snapshotPath = path.join(SNAPSHOT_DIRECTORY, `${formId}.json`);
  if (snapshot && mode === "snapshot") writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 1) + "\n");
  if (snapshot && mode === "compare") {
    if (!existsSync(snapshotPath)) problems.push("no snapshot recorded yet (run with --snapshot)");
    else problems.push(...listDifferences(JSON.parse(readFileSync(snapshotPath, "utf-8")), JSON.parse(JSON.stringify(snapshot))).map((difference) => `changed ${difference}`));
  }
  if (problems.length) failedFormCount += 1;
  console.log(`${problems.length ? "FAIL" : "ok  "} ${formId}${problems.length ? ` (${problems.length})` : ""}`);
  for (const problem of problems.slice(0, 15)) console.log(`       - ${problem}`);
  if (problems.length > 15) console.log(`       … and ${problems.length - 15} more`);
}
console.log(`\n${listFormIds().length} forms, ${failedFormCount} with problems${mode === "snapshot" ? " · snapshots written" : ""}`);
process.exit(failedFormCount ? 1 : 0);
