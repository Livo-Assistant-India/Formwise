// Writes the VCC "Additional Declaration - To be signed by the Joint Investor" form folders (14 pages, filled for the
// joint investor). The Growth Strategy and International Opportunities blanks have the same layout (text and boxes
// measured identical on every page; only the fund name in the footer differs), so one page set serves both (FUNDS).
// The pages are copies of subscription pages 25-28, 54 and 57-65, so field keys, sources and tick options are the
// GSF subscription's (same Excel columns, same KYC sources). The page size differs (Letter, not A4), so every
// position was measured on this blank. Change this file, not its output.
// usage (from the repo root): node tools/form-building/make_vcc_joint_investor.mjs [form-id]
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const FORMS = "apps/backend/src/forms/vcc";
const VCC_FILES = "../VCC";
const SOURCE_FILE_NAME = "Additional Declaration – To be signed by the Joint Investor.pdf";

const FUNDS = [
  { formId: "growth-strategy-fund-joint-investor", fundName: "360 ONE Growth Strategy Fund",
    label: "Growth Strategy Fund – Joint investor declaration", shortLabel: "GSF joint investor",
    blankFileName: "360 ONE Growth Strategy Fund - Joint Investor Declaration.pdf" },
  { formId: "international-opportunities-fund-joint-investor", fundName: "360 ONE International Opportunities Fund",
    label: "International Opportunities Fund – Joint investor declaration", shortLabel: "IOF joint investor",
    blankFileName: "360 ONE International Opportunities Fund - Joint Investor Declaration.pdf" },
];

// [key, page, x, y (text baseline), maxWidth, fontSize, source, extra]
const FIELD_ROWS = [
  // Page 3 (printed 27): account holder identification. Values sit on the underscore lines (x 322-498).
  ["surname", 3, 324, 147.6, 172, 10, "document.name|surname|upper"],
  ["title", 3, 324, 165.3, 172, 10, "typed"],
  ["given_name", 3, 324, 183.2, 172, 10, "document.name|givenName|upper"],
  ["middle_name", 3, 324, 201.2, 172, 10, "document.name|middleNames|upper"],
  ["residence_address_line1", 3, 324, 249.8, 174, 8, "document.address|withoutCareOf|addressLine1|upper"],
  ["residence_address_line2", 3, 324, 267.8, 174, 8, "document.address|withoutCareOf|addressLine2|upper"],
  ["residence_country", 3, 324, 285.6, 172, 10, "document.country|upper"],
  ["pincode", 3, 324, 303.5, 172, 10, "document.pincode"],
  ["mailing_address_line1", 3, 324, 357.1, 174, 8, "typed"],
  ["mailing_address_line2", 3, 324, 375.1, 174, 8, "typed"],
  ["mailing_country", 3, 324, 392.9, 172, 10, "typed"],
  ["mailing_postcode", 3, 324, 410.7, 172, 10, "typed"],
  ["dob", 3, 324, 441.1, 172, 10, "document.dob"],
  ["us_tin", 3, 130, 559.8, 210, 10, "typed"],
  // Page 4 (printed 28): tax residency table (columns x 134 / 270.6 / 392.6 / 518, rows 220-240-262-283).
  ["tax_residence_country", 4, 137, 233.5, 130, 10, "copy.residence_country"],
  ["tax_reference_type", 4, 274, 233.5, 115, 10, "default.PAN"],
  ["tax_reference_number", 4, 396, 233.5, 118, 10, "document.pan"],
  ["tax_residence_country_2", 4, 137, 254.6, 130, 10, "typed"],
  ["tax_reference_type_2", 4, 274, 254.6, 115, 10, "typed"],
  ["tax_reference_number_2", 4, 396, 254.6, 118, 10, "typed"],
  ["tax_residence_country_3", 4, 137, 276, 130, 10, "typed"],
  ["tax_reference_type_3", 4, 274, 276, 115, 10, "typed"],
  ["tax_reference_number_3", 4, 396, 276, 118, 10, "typed"],
  ["tin_unavailable_reason", 4, 95, 317.8, 380, 9, "typed"],
  ["subscriber_name", 4, 190, 602.6, 214, 10, "document.name|upper"],
  ["form_date", 4, 190, 637.1, 214, 10, "today"],
  ["signing_capacity", 4, 190, 710.1, 214, 10, "typed"],
  // Page 5 (printed 54): accredited investor acknowledgement and consent (values after the ":" at x 231-236).
  ["subscriber_name_p54", 5, 241, 513.6, 290, 10, "copy.subscriber_name"],
  ["authorised_signatory_name_p54", 5, 241, 540.7, 290, 10, "typed"],
  ["authorised_signatory_designation_p54", 5, 241, 567.8, 290, 10, "typed"],
  ["form_date_p54", 5, 168, 677.9, 120, 10, "copy.form_date"],
  // Page 6 (printed 57): Singapore tax status, beneficial owner details (rules at y 373 / 407-442, x 209-503).
  ["beneficial_owner_name", 6, 212, 371, 288, 9, "typed"],
  ["beneficial_owner_address", 6, 212, 405.4, 288, 9, "typed", { type: "multiline", maxY: 440 }],
  // Page 8 (printed 59): associate details (blank space under the question, no printed line).
  ["associate_name", 8, 111, 400, 395, 10, "typed"],
  ["associate_ownership_percent", 8, 184, 463.8, 200, 10, "typed"],
  // Page 12 (printed 63): Part II matters (rule at y 690.4).
  ["tax_offence_part2_matters", 12, 78, 687.6, 470, 9, "typed"],
  // Page 13 (printed 64): tax offences questionnaire signed (rules at y 473.6 / 497 / 520.4 / 566.4 from x 289).
  ["form_date_p64", 13, 292, 471.6, 66, 10, "copy.form_date"],
  ["subscriber_name_p64", 13, 292, 495, 236, 10, "copy.subscriber_name"],
  ["authorised_signatory_name_p64", 13, 292, 518.4, 236, 10, "typed"],
  ["authorised_signatory_designation_p64", 13, 292, 564.4, 236, 10, "typed"],
  // Page 14 (printed 65): PEP details on the dotted lines, then name and date.
  ["pep_details_1", 14, 78, 515.4, 425, 9, "typed"],
  ["pep_details_2", 14, 78, 538.2, 425, 9, "typed"],
  ["pep_details_3", 14, 78, 561, 425, 9, "typed"],
  ["pep_details_4", 14, 78, 583.8, 425, 9, "typed"],
  ["subscriber_name_p65", 14, 106, 631.2, 250, 10, "copy.subscriber_name"],
  ["form_date_p65", 14, 102, 687.7, 120, 10, "copy.form_date"],
];

// Tick boxes are drawn squares (not ☐ text): x = left edge, y = bottom edge of the square, measured from the drawings.
const SQUARE = { w: 6.6, h: 7.4 };
const YES_NO_X = { questionnaire: { Yes: 473.04, No: 520.2 }, singapore: { Yes: 110.52, No: 210.6 } };
const yesNo = (key, page, bottomY, columns, extra = {}) => ({ key, page, ...SQUARE, ...extra, options: ["Yes", "No"],
  boxesByOption: { Yes: [{ x: columns.Yes, y: bottomY - 0.5 }], No: [{ x: columns.No, y: bottomY - 0.5 }] } });
const column = (key, page, x, bottomYByOption, size, extra = {}) => ({ key, page, ...size, ...extra, options: Object.keys(bottomYByOption),
  boxesByOption: Object.fromEntries(Object.entries(bottomYByOption).map(([option, bottomY]) => [option, [{ x, y: bottomY - 0.5 }]])) });

const TICKBOXES = [
  column("us_tax_status", 3, 128.28, { "U.S. citizen or resident": 519.12, "Born in the U.S., citizenship given up": 579.72,
    "Not a U.S. citizen or resident": 610.32 }, SQUARE),
  column("beneficial_owner", 6, 103.92, { Yes: 325.56, No: 341.4 }, { w: 6.24, h: 7 }),
  column("singapore_tax_status", 6, 77.28, { "Not tax resident in Singapore and not a citizen": 565.08,
    "Tax resident in Singapore and/or a citizen": 633.0 }, { w: 5.9, h: 6.8 }),
  column("sg_entity_category", 7, 77.28, { "(a) Not tax resident in Singapore": 131.04, "(b) Approved person - Section 13O / 13OA": 284.4,
    "(c) Approved person - Section 13U": 330.84, "(d) Approved trust - Section 13D": 377.28, "(e) Designated person": 423.72,
    "(f) None of these": 448.32 }, SQUARE, { isOptional: true }),
  yesNo("sg_entity_q1_tax_resident", 7, 543.24, YES_NO_X.singapore, { isOptional: true }),
  yesNo("sg_entity_q2", 7, 649.68, YES_NO_X.singapore, { isOptional: true }),
  yesNo("sg_entity_q3", 8, 158.52, YES_NO_X.singapore, { isOptional: true }),
  yesNo("sg_entity_q4", 8, 264.96, YES_NO_X.singapore, { isOptional: true }),
  yesNo("sg_entity_q5", 8, 335.04, YES_NO_X.singapore, { isOptional: true }),
  ...[["1a", 11, 516.12], ["1b", 11, 551.28], ["1c", 11, 576.12], ["1d", 11, 611.28], ["1e", 11, 669.36],
    ["1f", 12, 113.16], ["1g", 12, 159.72], ["2a", 12, 230.16], ["2b", 12, 265.44], ["2c", 12, 300.48], ["2d", 12, 335.76],
    ["2e", 12, 382.44], ["3", 12, 463.56]]
    .map(([question, page, bottomY]) => yesNo(`tax_offence_${question}`, page, bottomY, YES_NO_X.questionnaire, { isOptional: false })),
  yesNo("tax_offence_part2", 12, 618.6, YES_NO_X.questionnaire, { isOptional: true }),
  column("pep_status", 14, 76.9, { Yes: 437.4, No: 460.2 }, { w: 5.2, h: 6.2 }),
];

const SIGNATURE_BOXES = [
  { page: 4, x: 190, y: 545, w: 200, h: 23, signer: "subscriber", label: "Joint investor – tax self-certification" },
  { page: 5, x: 110, y: 598, w: 160, h: 30, signer: "subscriber", label: "Joint investor – accredited investor consent" },
  { page: 13, x: 78, y: 395, w: 210, h: 42, signer: "subscriber", label: "Joint investor – tax offences questionnaire" },
  { page: 14, x: 78, y: 637, w: 182, h: 26, signer: "subscriber", label: "Joint investor – PEP self-certification" },
];

const REQUIRED_FIELDS = ["subscriber_name", "surname", "given_name", "residence_country", "dob", "tax_reference_number",
  "us_tax_status", "pep_status", "beneficial_owner", "singapore_tax_status",
  ...["1a", "1b", "1c", "1d", "1e", "1f", "1g", "2a", "2b", "2c", "2d", "2e", "3"].map((question) => `tax_offence_${question}`)];

const REVIEW_SECTIONS = [
  { key: "p3", label: "Page 3 · Account holder (KYC)", fields: ["title", "surname", "given_name", "middle_name",
    "residence_address_line1", "residence_address_line2", "residence_country", "pincode", "dob", "us_tax_status",
    "mailing_address_line1", "mailing_address_line2", "mailing_country", "mailing_postcode", "us_tin"] },
  { key: "p4", label: "Page 4 · Tax residency (KYC)", fields: ["tax_residence_country", "tax_reference_type", "tax_reference_number",
    "tax_residence_country_2", "tax_reference_type_2", "tax_reference_number_2", "tax_residence_country_3",
    "tax_reference_type_3", "tax_reference_number_3", "tin_unavailable_reason", "subscriber_name", "form_date", "signing_capacity"] },
  { key: "p5", label: "Page 5 · Accredited investor consent", fields: ["subscriber_name_p54", "form_date_p54",
    "authorised_signatory_name_p54", "authorised_signatory_designation_p54"] },
  { key: "p6", label: "Page 6 · Singapore tax status", fields: ["beneficial_owner", "singapore_tax_status", "beneficial_owner_name",
    "beneficial_owner_address"] },
  { key: "p7", label: "Pages 7-8 · Singapore tax (non-individual owner)", fields: ["sg_entity_category", "sg_entity_q1_tax_resident",
    "sg_entity_q2", "sg_entity_q3", "sg_entity_q4", "sg_entity_q5", "associate_name", "associate_ownership_percent"] },
  { key: "p11", label: "Page 11 · Tax offences 1(a)-(e)", fields: ["tax_offence_1a", "tax_offence_1b", "tax_offence_1c",
    "tax_offence_1d", "tax_offence_1e"] },
  { key: "p12", label: "Page 12 · Tax offences 1(f)-3, Part II", fields: ["tax_offence_1f", "tax_offence_1g", "tax_offence_2a",
    "tax_offence_2b", "tax_offence_2c", "tax_offence_2d", "tax_offence_2e", "tax_offence_3", "tax_offence_part2",
    "tax_offence_part2_matters"] },
  { key: "p13", label: "Page 13 · Tax offences signed", fields: ["subscriber_name_p64", "form_date_p64",
    "authorised_signatory_name_p64", "authorised_signatory_designation_p64"] },
  { key: "p14", label: "Page 14 · Politically exposed person", fields: ["pep_status", "subscriber_name_p65", "form_date_p65",
    "pep_details_1", "pep_details_2", "pep_details_3", "pep_details_4"] },
];

const SOURCES_ABOUT = "Form field -> where its value comes from. \"document.X\" = X read from the joint investor's KYC documents (see ../document-data-dictionary.json); \"|surname\" etc. = the part of it this box wants; \"typed\" = from the batch Excel or the review screen; \"default.X\" = usually X, the Excel can change it; \"copy.X\" = same as field X unless typed separately; \"today\" = today's date; \"tick\" = a tick box, answered per client in the Excel (never assumed). Keys and sources are the GSF subscription's (same pages).";

function writeFund(fund) {
  const folder = path.join(FORMS, fund.formId);
  const writeJson = (fileName, content) => writeFileSync(path.join(folder, fileName), JSON.stringify(content, null, 2) + "\n");
  mkdirSync(folder, { recursive: true });
  copyFileSync(path.join(VCC_FILES, fund.fundName, SOURCE_FILE_NAME), path.join("data/Blank Forms", fund.blankFileName));

  const fields = FIELD_ROWS.map(([key, page, x, y, maxWidth, fontSize, _source, extra]) =>
    ({ key, nominee: null, page, x, y, fontSize, type: "text", maxWidth, ...extra }));
  writeJson("field-positions.json", { _about: `Where each value is written on the blank ${fund.fundName} Additional Declaration (Joint Investor), 14 Letter pages. Made by tools/form-building/make_vcc_joint_investor.mjs.`,
    formId: fund.formId, title: `${fund.fundName} - Joint Investor Declaration`, fields });

  const fieldSources = Object.fromEntries([...FIELD_ROWS.map(([key, , , , , , source]) => [key, source]),
    ...TICKBOXES.map((tickbox) => [tickbox.key, "tick"])]);
  writeJson("field-sources.json", { _about: SOURCES_ABOUT, fieldSources });
  writeJson("required-fields.json", { _about: "Fields that must be filled before a case can be confirmed. Changed from the Form setup screen.", requiredFields: REQUIRED_FIELDS });

  writeJson("form-rules.json", {
    _about: "Form-level rules: how the form is recognised, which tab it saves to. One person (the joint investor, i.e. the second applicant) - their KYC documents fill the identity fields, the Excel fills the rest.",
    formId: fund.formId, group: "VCC", label: fund.label, shortLabel: fund.shortLabel,
    purpose: "Joint investor's own declarations · non-US investors", blankFileName: fund.blankFileName,
    keyFields: ["Joint investor name", "Date of birth", "Tax reference number"], sheetTabName: fund.shortLabel,
    detectionPhrases: [fund.fundName, "ANNEX 3", "Individual Tax Residency Self-Certification"],
    supportedNomineeCount: 1, personLabel: "Joint investor",
    identityType: { scope: "shared", tickboxField: null, numberField: null, optionByIdentityKind: {}, numberFieldByIdentityKind: {} },
    reviewSections: REVIEW_SECTIONS,
  });

  writeJson("form-configuration.json", {
    _about: `${fund.fundName} - Additional Declaration to be signed by the Joint Investor, 14 pages (subscription pages 25-28, 54, 57-65). Made by tools/form-building/make_vcc_joint_investor.mjs; every spot measured on this blank. Every tick box is its own question with no assumed answer.`,
    id: fund.formId, title: `${fund.fundName} - Joint Investor Declaration`, labels: [], blankFileName: fund.blankFileName,
    nomineeHeaderRe: null, tickboxRule: "usual", ignoredBlanks: [], signatureBoxes: SIGNATURE_BOXES, tickboxes: TICKBOXES,
  });
  console.log(`wrote ${folder}: ${fields.length} fields, ${TICKBOXES.length} tick boxes, ${SIGNATURE_BOXES.length} signatures`);
}

const onlyFormId = process.argv[2];
for (const fund of FUNDS) if (!onlyFormId || fund.formId === onlyFormId) writeFund(fund);

// Joint-holder role + joint_holder_ keys (shared with the other joint generators).
const { applyJointHolderRole } = await import("./joint-holder-keys.mjs");
applyJointHolderRole(FUNDS.filter((fund) => !onlyFormId || fund.formId === onlyFormId).map((fund) => fund.formId));
