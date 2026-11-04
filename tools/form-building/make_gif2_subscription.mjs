// Writes the 360 ONE Global Investment Fund 2 Subscription Agreement (Non-US) form folder from the Global Bond Fund
// one. The two agreements are the same document with pages moved: every field page was matched by its text, and
// pages whose layout differs were measured on the GIF 2 blank (see PAGE_MAP, POSITION_OVERRIDES).
// usage (from the repo root): node tools/form-building/make_gif2_subscription.mjs
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const FORMS = "apps/backend/src/forms/vcc";
const BASE_FOLDER = path.join(FORMS, "global-bond-fund-subscription");
const FORM_ID = "global-investment-fund-2-subscription";
const FOLDER = path.join(FORMS, FORM_ID);
const BLANK_FILE_NAME = "360 ONE Global Investment Fund 2 - Subscription.pdf";
const SOURCE_PDF = "../VCC/360 ONE Global Investment Fund 2/360 ONE Global Investment Fund 2 - Subscription Agreement (Non-US) - 06.10.25.pdf";

// GBF page -> GIF 2 page. Matched by page text; every page here has the same line positions unless overridden below.
const PAGE_MAP = { 2: 2, 16: 15, 17: 16, 27: 26, 28: 27, 31: 30, 32: 31, 33: 32, 34: 33, 35: 34, 36: 35, 37: 36, 38: 37, 39: 38,
  41: 40, 54: 50, 57: 54, 58: 55, 59: 56, 62: 59, 63: 60, 64: 61, 65: 62 };
const toGifPage = (gbfPage) => {
  if (!(gbfPage in PAGE_MAP)) throw new Error(`GBF page ${gbfPage} has no GIF 2 page`);
  return PAGE_MAP[gbfPage];
};
const renameKey = (fieldKey) => fieldKey.replace(/_p(\d+)$/, (_match, gbfPage) => `_p${toGifPage(Number(gbfPage))}`);

// GBF page 54 ("Acknowledgement and Consent") is a different page in GIF 2 (page 50, "Opt-In Confirmation Form"):
// it has Client Name, Name, Signature and Date only - no authorised-signatory lines.
const DROPPED_KEYS = new Set(["authorised_signatory_name_p50", "authorised_signatory_designation_p50"]);
// Measured on the GIF 2 blank (baseline y, top-left origin). Page 61 is GBF page 64 moved up 36.6pt.
const PAGE_61_SHIFT = -36.6;
const POSITION_OVERRIDES = {
  subscription_amount: { y: 376.44 },
  initial_sales_charge: { y: 548.2 },
  subscriber_name_p15: { y: 719.0 },
  form_date_p15: { y: 744.0 },
  place: { y: 755.3 },
  subscriber_name_p50: { x: 280, y: 200.8, maxWidth: 236, alsoAt: [{ page: 50, x: 88, y: 589, maxWidth: 200 }] },
  form_date_p50: { x: 82, y: 649.4 },
};
const SERIES_BASELINES = { "Series A": 448.4, "Series B": 466.6, "Series C": 484.7, "Series D": 503.0, "Series E": 521.2 };
const SIGNATURE_OVERRIDES = {
  2: { y: 662 },
  15: { y: 679 },
  50: { x: 54, y: 596, w: 196, h: 22, label: "Opt-in confirmation" },
  61: { y: 400 + PAGE_61_SHIFT },
};

const readBaseJson = (fileName) => JSON.parse(readFileSync(path.join(BASE_FOLDER, fileName), "utf-8"));
const BASE_CONFIGURATION = readBaseJson("form-configuration.json");
const writeJson = (fileName, content) => writeFileSync(path.join(FOLDER, fileName), JSON.stringify(content, null, 2) + "\n");
const remapPageLabel = (label) => label
  .replace(/Pages (\d+)-(\d+)/, (_match, first, last) => `Pages ${toGifPage(Number(first))}-${toGifPage(Number(last))}`)
  .replace(/Page (\d+)/, (_match, gbfPage) => `Page ${toGifPage(Number(gbfPage))}`)
  .replace("Accredited investor consent", "Accredited investor opt-in");

mkdirSync(FOLDER, { recursive: true });
copyFileSync(SOURCE_PDF, path.join("data/Blank Forms", BLANK_FILE_NAME));

const basePositions = readBaseJson("field-positions.json");
const fields = basePositions.fields
  .map((field) => ({ ...field, key: renameKey(field.key), page: toGifPage(field.page),
    ...(field.alsoAt ? { alsoAt: field.alsoAt.map((repeat) => ({ ...repeat, page: toGifPage(repeat.page) })) } : {}) }))
  .filter((field) => !DROPPED_KEYS.has(field.key))
  .map((field) => ({ ...field, ...(field.page === 61 ? { y: Math.round((field.y + PAGE_61_SHIFT) * 100) / 100 } : {}), ...POSITION_OVERRIDES[field.key] }));
writeJson("field-positions.json", { _about: "Where each value is written on the blank GIF 2 Subscription Agreement (Non-US), 63 pages. Made by tools/form-building/make_gif2_subscription.mjs from the GBF form (same document, pages moved).", formId: FORM_ID, title: "360 ONE Global Investment Fund 2 - Subscription", fields });

const baseSources = readBaseJson("field-sources.json");
const fieldSources = Object.fromEntries(Object.entries(baseSources.fieldSources)
  .map(([fieldKey, source]) => [renameKey(fieldKey), source.replace(/^copy\.(.+)$/, (_match, copiedKey) => `copy.${renameKey(copiedKey)}`)])
  .filter(([fieldKey]) => !DROPPED_KEYS.has(fieldKey)));
writeJson("field-sources.json", { _about: baseSources._about, fieldSources });

const baseRequired = readBaseJson("required-fields.json");
writeJson("required-fields.json", { _about: baseRequired._about, requiredFields: baseRequired.requiredFields.map(renameKey).filter((fieldKey) => !DROPPED_KEYS.has(fieldKey)) });

const baseRules = readBaseJson("form-rules.json");
writeJson("form-rules.json", { ...baseRules, formId: FORM_ID, label: "Global Investment Fund 2 – Subscription", shortLabel: "GIF 2 subscription",
  blankFileName: BLANK_FILE_NAME, sheetTabName: "GIF 2 subscription",
  detectionPhrases: ["360 ONE Global Investment Fund 2", "Subscription Agreement for"],
  reviewSections: baseRules.reviewSections.map((section) => ({ ...section, label: remapPageLabel(section.label),
    fields: section.fields.map(renameKey).filter((fieldKey) => !DROPPED_KEYS.has(fieldKey)) })) });

const signatureBoxes = BASE_CONFIGURATION.signatureBoxes.map((box) => {
  const page = toGifPage(box.page);
  return { ...box, page, ...SIGNATURE_OVERRIDES[page] };
});
const tickboxes = BASE_CONFIGURATION.tickboxes.map((tickbox) => (tickbox.key === "series"
  ? { ...tickbox, page: 2, options: Object.keys(SERIES_BASELINES),
    boxesByOption: Object.fromEntries(Object.entries(SERIES_BASELINES).map(([option, y]) => [option, [{ x: 275.81, y }]])) }
  : { ...tickbox, page: toGifPage(tickbox.page) }));
writeJson("form-configuration.json", { ...BASE_CONFIGURATION,
  _about: "360 ONE Global Investment Fund 2 - Subscription Agreement (Non-US), 63 pages. Made by tools/form-building/make_gif2_subscription.mjs from the GBF form: same boxes, pages moved, Series A-E and changed pages measured on this blank. Every tick box is its own question with no assumed answer.",
  id: FORM_ID, title: "360 ONE Global Investment Fund 2 - Subscription", blankFileName: BLANK_FILE_NAME, signatureBoxes, tickboxes });

console.log(`wrote ${FOLDER}: ${fields.length} fields, ${tickboxes.length} tick boxes, ${signatureBoxes.length} signatures`);
