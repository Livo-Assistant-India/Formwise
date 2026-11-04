// Writes the four Global Bond Fund - Series II joint holder forms (opt-in, PEP declaration, Singapore tax
// questionnaire, individual self-certification). Each is a copy of pages of the fund's subscription agreement, filled
// for the joint holder. Their text and every line position match the GIF 2 subscription pages (pageMap below; only
// the fund name in the footer differs), so fields, tick boxes and signature boxes are taken from that form unchanged.
// The joint holder is the one person on each form: their documents fill the name, the Excel the rest.
// Blanks: copied by hand from "VCC/360 ONE Global Bond Fund Series - II/Joint holder additional pages.zip".
// detectionPhrases: as pdfjs reads page 1 (it splits "OPT-IN" into "OPT - IN"; checked with detect-form-service).
// usage (from the repo root): node tools/form-building/make_gbf_joint_holder.mjs [form-id]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const FORMS = "apps/backend/src/forms/vcc";
const BASE_FOLDER = path.join(FORMS, "global-investment-fund-2-subscription");
const FUND_NAME = "360 ONE Global Bond Fund - Series II";

// pageMap: GIF 2 subscription page -> this form's page. keyRenames: page-suffixed copies that become this form's own
// field (the main name and date live on another page of the subscription). sourceOverrides: the new main fields.
const NAME_AND_DATE_SOURCES = { subscriber_name: "document.name|upper", form_date: "today" };
const JOINT_FORMS = [
  {
    formId: "global-bond-fund-joint-opt-in", label: "Global Bond Fund II – Joint holder opt-in", shortLabel: "GBF joint opt-in",
    purpose: "Joint holder · accredited investor opt-in", blankName: "Opt-in confirmation form", pageCount: 1,
    detectionPhrases: ["OPT - IN CONFIRMATION FORM", "Global Bond Fund – Series II"],
    pageMap: { 50: 1 },
    keyRenames: { subscriber_name_p50: "subscriber_name", form_date_p50: "form_date" },
  },
  {
    formId: "global-bond-fund-joint-pep", label: "Global Bond Fund II – Joint holder PEP declaration", shortLabel: "GBF joint PEP",
    purpose: "Joint holder · politically exposed person", blankName: "PEP declaration", pageCount: 1,
    detectionPhrases: ["Politically Exposed Person", "Global Bond Fund – Series II"],
    pageMap: { 62: 1 },
    keyRenames: { subscriber_name_p62: "subscriber_name", form_date_p62: "form_date" },
  },
  {
    formId: "global-bond-fund-joint-singapore-tax", label: "Global Bond Fund II – Joint holder Singapore tax", shortLabel: "GBF joint Singapore tax",
    purpose: "Joint holder · Singapore tax + tax offences", blankName: "Singapore tax questionnaire", pageCount: 8,
    detectionPhrases: ["SINGAPORE TAX STATUS QUESTIONNAIRE", "Global Bond Fund – Series II"],
    pageMap: { 54: 1, 55: 2, 56: 3, 57: 4, 58: 5, 59: 6, 60: 7, 61: 8 },
    keyRenames: { subscriber_name_p61: "subscriber_name", form_date_p61: "form_date",
      authorised_signatory_name_p61: "authorised_signatory_name", authorised_signatory_designation_p61: "authorised_signatory_designation" },
  },
  {
    formId: "global-bond-fund-joint-self-certification", label: "Global Bond Fund II – Joint holder self-certification", shortLabel: "GBF joint self-certification",
    purpose: "Joint holder · FATCA / CRS individual", blankName: "Individual self certification", pageCount: 4,
    detectionPhrases: ["ANNEX 3 PART 1 (A)", "Global Bond Fund – Series II"],
    pageMap: { 24: 1, 25: 2, 26: 3, 27: 4 },
    keyRenames: { subscriber_name_p27: "subscriber_name", form_date_p27: "form_date" },
  },
];

function writeJointForm(jointForm) {
  const folder = path.join(FORMS, jointForm.formId);
  const blankFileName = `${FUND_NAME} - Joint ${jointForm.blankName}.pdf`;
  const isOnThesePages = (gbfPage) => gbfPage in jointForm.pageMap;
  const toJointPage = (basePage) => jointForm.pageMap[basePage];
  const renameKey = (fieldKey) => jointForm.keyRenames[fieldKey] || fieldKey;
  const renamePageLabel = (label) => label
    .replace(/Pages (\d+)-(\d+)/, (_match, first, last) => `Pages ${toJointPage(Number(first))}-${toJointPage(Number(last))}`)
    .replace(/Page (\d+)/, (_match, basePage) => `Page ${toJointPage(Number(basePage))}`);
  const readBaseJson = (fileName) => JSON.parse(readFileSync(path.join(BASE_FOLDER, fileName), "utf-8"));
  const writeJson = (fileName, content) => writeFileSync(path.join(folder, fileName), JSON.stringify(content, null, 2) + "\n");
  mkdirSync(folder, { recursive: true });

  const baseFields = readBaseJson("field-positions.json").fields.filter((field) => isOnThesePages(field.page));
  const fields = baseFields
    .map((field) => ({ ...field, key: renameKey(field.key), page: toJointPage(field.page),
      ...(field.alsoAt ? { alsoAt: field.alsoAt.map((repeat) => ({ ...repeat, page: toJointPage(repeat.page) })) } : {}) }));
  writeJson("field-positions.json", { _about: `Where each value is written on the blank ${FUND_NAME} joint holder ${jointForm.blankName} (${jointForm.pageCount} page${jointForm.pageCount > 1 ? "s" : ""}). Made by tools/form-building/make_gbf_joint_holder.mjs from the GIF 2 subscription pages it copies.`,
    formId: jointForm.formId, title: `${FUND_NAME} - Joint holder ${jointForm.blankName}`, fields });

  const baseConfiguration = readBaseJson("form-configuration.json");
  const tickboxes = baseConfiguration.tickboxes.filter((tickbox) => isOnThesePages(tickbox.page))
    .map((tickbox) => ({ ...tickbox, page: toJointPage(tickbox.page) }));
  const signatureBoxes = baseConfiguration.signatureBoxes.filter((box) => isOnThesePages(box.page))
    .map((box) => ({ ...box, page: toJointPage(box.page), label: `Joint holder - ${box.label}` }));
  writeJson("form-configuration.json", { ...baseConfiguration,
    _about: `${FUND_NAME} - joint holder ${jointForm.blankName}. Copy of the subscription agreement's pages for the joint holder (second applicant); positions are the GIF 2 subscription ones (same page layout). Every tick box is its own question with no assumed answer.`,
    id: jointForm.formId, title: `${FUND_NAME} - Joint holder ${jointForm.blankName}`, blankFileName, signatureBoxes, tickboxes, ignoredBlanks: [] });

  // Keys of the base form that sit on these pages (before renaming): only these are taken from its sources/sections.
  const baseKeys = new Set([...baseFields.map((field) => field.key), ...tickboxes.map((tickbox) => tickbox.key)]);
  const fieldKeys = new Set([...baseKeys].map(renameKey));
  const baseSources = readBaseJson("field-sources.json");
  const fieldSources = Object.fromEntries(Object.entries(baseSources.fieldSources)
    .filter(([fieldKey]) => baseKeys.has(fieldKey))
    .map(([fieldKey, source]) => [renameKey(fieldKey), NAME_AND_DATE_SOURCES[renameKey(fieldKey)] || source]));
  writeJson("field-sources.json", { _about: baseSources._about.replace("the subscriber's KYC documents", "the joint holder's KYC documents"), fieldSources });

  const baseRequired = readBaseJson("required-fields.json");
  writeJson("required-fields.json", { _about: baseRequired._about, requiredFields: baseRequired.requiredFields.filter((fieldKey) => fieldKeys.has(fieldKey)) });
  // subscriber_name is required in the base form (page 17); here it is the joint holder's name on this form's own page.

  const baseRules = readBaseJson("form-rules.json");
  const reviewSections = baseRules.reviewSections
    .map((section) => ({ ...section, fields: section.fields.filter((fieldKey) => baseKeys.has(fieldKey)).map(renameKey) }))
    .filter((section) => section.fields.length)
    .map((section) => ({ ...section, label: renamePageLabel(section.label) }));
  writeJson("form-rules.json", { ...baseRules,
    _about: "Form-level rules: how the form is recognised, which tab it saves to. One person (the joint holder) - their KYC documents fill the identity fields, the Excel fills the rest.",
    formId: jointForm.formId, group: "VCC", label: jointForm.label, shortLabel: jointForm.shortLabel, purpose: jointForm.purpose,
    blankFileName, keyFields: ["Joint holder name"], sheetTabName: jointForm.shortLabel.slice(0, 31),
    detectionPhrases: jointForm.detectionPhrases, supportedNomineeCount: 1, personLabel: "Joint holder", reviewSections });

  console.log(`wrote ${folder}: ${fields.length} fields, ${tickboxes.length} tick boxes, ${signatureBoxes.length} signatures`);
}

const onlyFormId = process.argv[2];
for (const jointForm of JOINT_FORMS) if (!onlyFormId || jointForm.formId === onlyFormId) writeJointForm(jointForm);

// Joint-holder role + joint_holder_ keys (shared with the other joint generators).
const { applyJointHolderRole } = await import("./joint-holder-keys.mjs");
applyJointHolderRole(JOINT_FORMS.filter((jointForm) => !onlyFormId || jointForm.formId === onlyFormId).map((jointForm) => jointForm.formId));
