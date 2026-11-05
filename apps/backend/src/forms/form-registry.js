// Every form the app can fill, found by itself: a form is a folder forms/<stream>/<form-id>/ holding five data files
// (form-configuration.json, field-positions.json, field-sources.json, form-rules.json, required-fields.json).
// Adding a form = adding its folder; no code changes. Streams: vcc, us-tax, nft, gift-city, added (made on the
// "Add a form" screen). A form's tick-box logic is named in its configuration ("tickboxRule"); almost every form
// uses "usual" (the answer comes from the Excel or the reviewer). See NEXT-CHAT.md for how to build a form.
import path from "node:path";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { BLANK_FORMS_DIRECTORY, FORMS_DIRECTORY } from "../config/paths-config.js";
import { applyCrnBrokingDematTickboxes, applyCamsNominationTickboxes, applyOptionTickboxes } from "../services/forms/tickbox-rules-service.js";

export const FORM_STREAMS = { VCC: "vcc", US_TAX: "us-tax", NFT: "nft", GIFT_CITY: "gift-city", ADDED: "added" };
// What a filled form is: a PDF (almost every form; no "outputType" in its configuration) or a copy of an Excel
// template filled cell by cell ("outputType": "xlsx", field-positions.json gives sheet + cell instead of x/y).
export const OUTPUT_TYPES = { PDF: "pdf", XLSX: "xlsx" };
const CONFIGURATION_FILE_NAME = "form-configuration.json";
const NEVER_MATCHES = /(?!)/;

/** How a form's tick boxes are decided. Named in form-configuration.json; add a rule here only for truly special forms. */
const TICKBOX_RULES = {
  usual: (pages, formConfiguration, tickboxContext) => applyOptionTickboxes(pages, formConfiguration, { overrides: tickboxContext.overrides }),
  "crn-broking-demat": (pages, formConfiguration, tickboxContext) => applyCrnBrokingDematTickboxes(pages, formConfiguration, {
    anyNomineeAadhaarLast4: tickboxContext.anyNomineeAadhaarLast4, idType: tickboxContext.idTypes[1], overrides: tickboxContext.overrides,
  }),
  "cams-nomination": (pages, formConfiguration, tickboxContext) => applyCamsNominationTickboxes(pages, formConfiguration, {
    idTypes: tickboxContext.idTypes, overrides: tickboxContext.overrides,
  }),
};

/** Printed-label finders are stored as pattern text in JSON; turn them back into regular expressions. */
const toPattern = (patternText) => (patternText ? new RegExp(patternText) : undefined);

function readFormDefinition(formDirectory) {
  const configurationPath = path.join(formDirectory, CONFIGURATION_FILE_NAME);
  if (!existsSync(configurationPath)) return null;
  const { _about: _ignoredAbout, blankFileName, nomineeHeaderRe, labels = [], tickboxRule = "usual", ...configuration } = JSON.parse(readFileSync(configurationPath, "utf-8"));
  if (!TICKBOX_RULES[tickboxRule]) throw new Error(`${configurationPath}: unknown tickboxRule "${tickboxRule}"`);
  if (configuration.outputType && !Object.values(OUTPUT_TYPES).includes(configuration.outputType)) {
    throw new Error(`${configurationPath}: unknown outputType "${configuration.outputType}"`);
  }
  return {
    directory: formDirectory,
    formConfiguration: {
      ...configuration,
      signatureBoxes: configuration.signatureBoxes || [],
      tickboxes: configuration.tickboxes || [],
      blankFormPath: path.join(BLANK_FORMS_DIRECTORY, blankFileName),
      nomineeHeaderRe: nomineeHeaderRe ? new RegExp(nomineeHeaderRe) : NEVER_MATCHES,
      labels: labels.map((label) => ({ ...label, re: toPattern(label.re), cont: toPattern(label.cont) })),
    },
    applyTickboxes: TICKBOX_RULES[tickboxRule],
  };
}

const FORM_DEFINITIONS = {};
const listSubfolders = (directory) => (existsSync(directory) ? readdirSync(directory, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name) : []);
for (const stream of listSubfolders(FORMS_DIRECTORY)) {
  for (const formId of listSubfolders(path.join(FORMS_DIRECTORY, stream))) {
    if (FORM_DEFINITIONS[formId]) throw new Error(`form id "${formId}" is used twice (in ${stream} and elsewhere) - ids must be unique`);
    const definition = readFormDefinition(path.join(FORMS_DIRECTORY, stream, formId));
    if (definition) FORM_DEFINITIONS[formId] = definition;
  }
}

/** Adds (or reloads) a form made on the "Add a form" screen, so it is usable at once without a restart. */
export function registerGeneratedForm(formId) {
  const definition = readFormDefinition(path.join(FORMS_DIRECTORY, FORM_STREAMS.ADDED, formId));
  if (!definition) throw new Error(`no generated form "${formId}"`);
  FORM_DEFINITIONS[formId] = definition;
}

export function listFormIds() {
  return Object.keys(FORM_DEFINITIONS);
}

/** True for a form filled into an Excel template instead of a PDF. */
export const isWorkbookForm = (formConfiguration) => formConfiguration.outputType === OUTPUT_TYPES.XLSX;

/** null for an unknown id - callers answer 404. */
export function getFormDefinition(formId) {
  const definition = FORM_DEFINITIONS[formId];
  if (!definition) return null;
  return { formId, ...definition };
}
