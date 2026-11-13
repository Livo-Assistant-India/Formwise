// Writes the SBI Global Thematic Advantage Fund (IFSC) application form - SBI Funds International's 68-page set:
// individual application (pages 3-9), non-individual application (10-16, left blank: this form is for individuals),
// Schedule I capital commitment (23), FME contribution waiver (24), Contribution Agreement (25-65) and Annexure A
// (66-67). Vector pages, measured with scan_boxes.py (threshold 235) and the underscore positions of the text.
// Sources follow the GIFT feeder forms: the first holder's name, date of birth, PAN and permanent address come from the
// KYC documents, everything else is typed (Excel); the second holder's fields are typed; tick boxes are answered per
// client, never assumed. Change this file, never the generated folder.
// usage (from the repo root): node tools/form-building/make_gift_sbi_application.mjs
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { comb, multiline, text, tick } from "./gift-feeder-application-pages.mjs";

const FORM_ID = "gift-sbi-gtaf-application";
const FUND_NAME = "SBI Global Thematic Advantage Fund (IFSC)";
const SOURCE_PDF = "../GIFT/SBI Global Thematic Advantage Fund/4)viii) SBIGTAF_ApplnForm_Aug-26.pdf";
const BLANK_FILE_NAME = "SBI Global Thematic Advantage Fund - Application Form.pdf";
const FOLDER = `apps/backend/src/forms/gift-city/${FORM_ID}`;
const NAME_PITCH = 13.9, ADDRESS_PITCH = 14.32;

/** Page 4: general information - first holder, second holder, mode of holding, addresses, contact, commitment. */
function generalInformationPage() {
  const s = { section: "applicant" }, j = { section: "second-holder" }, c = { section: "contact" };
  const holder = (prefix, nameBottom, panLeft, panPitch, idY, source) => {
    const p = prefix ? `${prefix}_` : "", section = prefix ? j : s;
    return [
      comb(`${p}${prefix ? "name" : "subscriber_name"}`, 4, nameBottom, 80.0, 35, source.name, { pitch: 13.91, keepAll: true, ...section }),
      comb(`${p}aliases`, 4, nameBottom + 16.3, 94.0, 34, "typed", { pitch: NAME_PITCH, keepAll: true, ...section }),
      comb(`${p}dob`, 4, nameBottom + 32.7, 80.0, 8, source.dob, { pitch: 13.88, ...section }),
      tick(`${p}gender`, 4, 11.6, { Male: [288.7, nameBottom + 21.0], Female: [345.0, nameBottom + 21.0], Other: [401.3, nameBottom + 21.0] }, section),
      comb(`${p}ckyc_number`, 4, nameBottom + 49.0, 149.7, 30, "typed", { pitch: NAME_PITCH, ...section }),
      comb(`${p}tax_reference_number`, 4, panLeft[0], panLeft[1], 10, source.pan, { pitch: panPitch, ...section }),
      text(`${p}id_passport`, 4, 131, idY, 110, source.passport, { fontSize: 7, ...section }),
      text(`${p}nationality`, 4, 295, idY, 88, "typed", { fontSize: 7, ...section }),
      text(`${p}legal_domicile`, 4, 462, idY, 96, "typed", { fontSize: 7, ...section }),
    ];
  };
  const typedPerson = { name: "typed", dob: "typed", pan: "typed", passport: "typed" };
  const documentPerson = { name: "document.name|upper", dob: "document.dob", pan: "document.pan", passport: "document.passport" };
  const address = (prefix, top, sources) => [
    comb(`${prefix}_address_line1`, 4, top, 122.7, 31, sources.line1, { pitch: ADDRESS_PITCH, keepAll: true, ...c }),
    comb(`${prefix}_address_line2`, 4, top + 11.7, 122.7, 31, sources.line2, { pitch: ADDRESS_PITCH, keepAll: true, ...c }),
    comb(`${prefix}_city`, 4, top + 35.4, 51.0, 17, sources.city, { pitch: 14.34, keepAll: true, ...c }),
    comb(`${prefix}_state`, 4, top + 35.4, 329.0, 16, sources.state, { pitch: 14.31, keepAll: true, ...c }),
    comb(`${prefix}_postcode`, 4, top + 53.0, 79.7, 13, sources.postcode, { pitch: 14.33, ...c }),
    comb(`${prefix}_country`, 4, top + 53.0, 311.3, 17, sources.country, { pitch: 14.32, keepAll: true, ...c }),
  ];
  return [
    tick("applicant_type", 4, 8.5, { Individual: [219.3, 33.7], Minor: [282.7, 33.7] }, s),
    comb("folio_no", 4, 67.3, 149.7, 30, "typed", { pitch: NAME_PITCH, ...s }),
    ...holder("", 103.0, [169.7, 70.0], 14.33, 184.4, documentPerson),
    text("joint_holder_relationship", 4, 412, 206.4, 88, "typed", { fontSize: 7, ...j }),
    ...holder("joint_holder", 229.7, [299.0, 71.3], 14.3, 313.9, typedPerson),
    tick("mode_of_holding", 4, 8.6, { Single: [167.3, 447.7], Joint: [257.3, 447.7], "Anyone or survivor": [334.3, 447.7], "POA holder": [449.7, 447.7] }, s),
    // Correspondence address first (typed), then the permanent address (KYC documents).
    ...address("mailing", 505.3, { line1: "typed", line2: "typed", city: "typed", state: "typed", postcode: "typed", country: "typed" }),
    ...address("residence", 598.0, { line1: "document.street|addressLine1|upper", line2: "document.street|addressLine2|upper",
      city: "document.city|upper", state: "document.state|upper", postcode: "document.pincode", country: "document.country|upper" }),
    comb("landline", 4, 691.7, 177.3, 28, "typed", { pitch: 13.91, ...c }),
    comb("mobile", 4, 713.7, 67.7, 12, "typed", { pitch: 13.88, ...c }),
    comb("office_phone", 4, 713.7, 318.0, 12, "typed", { pitch: 13.89, ...c }),
    comb("email", 4, 735.7, 67.7, 35, "typed", { pitch: NAME_PITCH, keepAll: true, ...c }),
    comb("alternate_email", 4, 757.7, 81.7, 34, "typed", { pitch: NAME_PITCH, keepAll: true, ...c }),
    text("capital_commitment_usd", 4, 159, 790.6, 400, "typed", { section: "investment" }),
    text("capital_commitment_usd_words", 4, 159, 804.6, 400, "typed", { fontSize: 7, section: "investment" }),
  ];
}

const OCCUPATION_ROWS = ["Private Sector Service", "Public Sector Service", "Government Service", "Business", "Professional"];
const OCCUPATION_RIGHT = ["Agriculturist", "Retired", "Housewife", "Student", "Forex Dealer"];
const ROW_TOPS = [513.3, 524.0, 534.3, 545.0, 555.7];

/** Page 5: contribution, nomination, bank account and the KYC table (first column = first holder, second = second holder). */
/** Page 3: distributor and RM table (row baselines 767 and 790). */
function distributorTable() {
  const d = { fontSize: 7, section: "distributor" };
  return [
    text("distributor_name", 3, 91, 767, 130, "typed", d), text("distributor_code", 3, 226, 767, 73, "typed", d),
    text("distributor_email", 3, 304, 767, 128, "typed", d), text("distributor_contact_number", 3, 437, 767, 128, "typed", d),
    text("rm_name", 3, 91, 790, 130, "typed", d), text("rm_email", 3, 304, 790, 128, "typed", d),
    text("rm_contact_number", 3, 437, 790, 128, "typed", d),
  ];
}

function contributionAndBankPage() {
  const i = { section: "investment" }, b = { section: "bank" }, k = { section: "kyc" }, j = { section: "second-holder" };
  const kycColumn = (prefix, leftX, rightX, section) => {
    const p = prefix ? `${prefix}_` : "";
    const occupation = Object.fromEntries([
      ...OCCUPATION_ROWS.map((option, index) => [option, [leftX, ROW_TOPS[index]]]),
      ...OCCUPATION_RIGHT.map((option, index) => [option, [rightX, ROW_TOPS[index]]])]);
    return [
      tick(`${p}occupation`, 5, 7, occupation, section),
      tick(`${p}gross_annual_income_range`, 5, 7, { "Below $10,000": [leftX, 584.0], "$10,000 to $50,000": [leftX, 594.3],
        "$50,000 to $100,000": [leftX, 605.0], "Above $100,000": [leftX, 615.3] }, section),
      tick(`${p}pep_status`, 5, 7, { "Not a PEP": [leftX, 629.3], "PEP": [leftX, 639.7], "Related to a PEP": [leftX, 650.3] }, section),
      text(`${p}employer_name`, 5, leftX, 671, 152, "typed", { fontSize: 6.5, ...section }),
      text(`${p}designation`, 5, leftX, 687, 152, "typed", { fontSize: 6.5, ...section }),
      text(`${p}place_of_work`, 5, leftX, 703, 152, "typed", { fontSize: 6.5, ...section }),
      text(`${p}business_name`, 5, leftX, 718.5, 152, "typed", { fontSize: 6.5, ...section }),
      text(`${p}business_nature`, 5, leftX, 733, 152, "typed", { fontSize: 6.5, ...section }),
    ];
  };
  return [
    tick("investment_option", 5, 8.6, { SWIFT: [306.7, 25.0] }, i),
    comb("remitting_bank_line1", 5, 70.7, 122.7, 31, "typed", { pitch: ADDRESS_PITCH, keepAll: true, ...i }),
    comb("remitting_bank_line2", 5, 82.3, 122.7, 31, "typed", { pitch: ADDRESS_PITCH, keepAll: true, ...i }),
    text("subscription_amount", 5, 162, 97.3, 400, "typed", i),
    text("subscription_amount_words", 5, 162, 111.6, 400, "typed", { fontSize: 7, ...i }),
    // Nominee table (rows 192.8-233.0 and 233.0-273.2): name & address, date of birth, guardian, allocation %, relationship.
    ...[[1, 192.8], [2, 233.0]].flatMap(([n, top]) => [
      multiline(`nominee_${n}_name_address`, 5, 85, top + 9, 173, top + 38, "typed", { fontSize: 6.5, section: "nomination" }),
      text(`nominee_${n}_dob`, 5, 263, top + 23, 63, "typed", { fontSize: 7, section: "nomination" }),
      multiline(`nominee_${n}_guardian`, 5, 331, top + 9, 85, top + 38, "typed", { fontSize: 6.5, section: "nomination" }),
      text(`nominee_${n}_share_pct`, 5, 421, top + 23, 55, "typed", { fontSize: 7, section: "nomination" }),
      text(`nominee_${n}_relationship`, 5, 481, top + 23, 84, "typed", { fontSize: 7, section: "nomination" })]),
    tick("wish_to_nominate", 5, 11.8, { "Wish to nominate": [28.7, 140.3], "Do not wish to nominate": [150.3, 140.3] }, { section: "nomination" }),
    comb("account_number", 5, 377.3, 121.3, 16, "typed", { pitch: 13.9, ...b }),
    comb("account_type", 5, 377.3, 413.3, 11, "typed", { pitch: 13.91, keepAll: true, ...b }),
    comb("iban", 5, 395.3, 121.3, 32, "typed", { pitch: 13.91, ...b }),
    comb("bank_name", 5, 413.3, 121.3, 32, "typed", { pitch: 13.91, keepAll: true, ...b }),
    comb("bank_city", 5, 432.7, 51.0, 17, "typed", { pitch: 14.34, keepAll: true, ...b }),
    comb("bank_state", 5, 432.7, 329.0, 16, "typed", { pitch: 14.31, keepAll: true, ...b }),
    comb("bank_postcode", 5, 450.3, 85.0, 13, "typed", { pitch: 14.33, ...b }),
    comb("bank_country", 5, 450.3, 316.7, 17, "typed", { pitch: 14.31, keepAll: true, ...b }),
    comb("swift_code", 5, 468.3, 106.3, 13, "typed", { pitch: 14.34, ...b }),
    comb("account_currency", 5, 468.3, 360.7, 14, "typed", { pitch: 14.33, keepAll: true, ...b }),
    ...kycColumn("", 88.3, 183.3, k),
    text("occupation_other", 5, 183, 574.6, 55, "typed", { fontSize: 6, ...k }),
    ...kycColumn("joint_holder", 249.0, 344.0, j),
    text("joint_holder_occupation_other", 5, 343, 574.6, 55, "typed", { fontSize: 6, ...j }),
  ];
}

/** Page 6 (funds, place, date) and page 7 (FATCA & CRS for individuals). */
function declarationAndFatcaPages() {
  const k = { section: "kyc" }, f = { section: "fatca" }, j = { section: "second-holder" };
  const countryColumn = (prefix, x, section) => {
    const p = prefix ? `${prefix}_` : "";
    return [
      text(`${p}country_of_birth`, 7, x, 100, 118, "typed", { fontSize: 7, ...section }),
      text(`${p}citizenship_country`, 7, x, 124, 118, "typed", { fontSize: 7, ...section }),
      text(`${p}tax_residence_country`, 7, x, 147.5, 118, "typed", { fontSize: 7, ...section }),
      text(`${p}us_person`, 7, x, 171, 118, "typed", { fontSize: 7, ...section }),
    ];
  };
  return [
    multiline("origin_of_funds", 6, 90, 62, 152, 100, "typed", { fontSize: 7, ...k }),
    multiline("source_of_wealth", 6, 90, 120, 152, 156, "typed", { fontSize: 7, ...k }),
    multiline("joint_holder_origin_of_funds", 6, 249, 62, 154, 100, "typed", { fontSize: 7, ...j }),
    multiline("joint_holder_source_of_wealth", 6, 249, 120, 154, 156, "typed", { fontSize: 7, ...j }),
    text("place", 6, 57, 775, 124, "typed", { section: "signed" }),
    comb("form_date", 6, 798.3, 54.0, 8, "today", { pitch: 13.88, section: "signed" }),
    ...countryColumn("", 173, f),
    ...countryColumn("joint_holder", 297, j),
    ...[1, 2, 3].flatMap((row) => [
      text(`foreign_tax_identification_number_${row}`, 7, 211, 276 + (row - 1) * 46.3, 350, "typed", { fontSize: 7, ...f }),
      text(`foreign_tax_country_${row}`, 7, 211, 299 + (row - 1) * 46.3, 350, "typed", { fontSize: 7, ...f }),
    ]),
    text("citizenship_relinquishment_reason", 7, 362, 463.8, 196, "typed", { fontSize: 6, ...f }),
    text("subscriber_name_p7", 7, 82, 741.5, 150, "copy.subscriber_name", { fontSize: 7, ...f }),
    text("joint_holder_name_p7", 7, 239, 741.5, 154, "copy.joint_holder_name", { fontSize: 7, ...j }),
    comb("form_date_p7", 7, 768.7, 84.7, 8, "copy.form_date", { pitch: 13.91, ...f }),
  ];
}

/** Schedule I (page 23), FME contribution waiver (24), agreement date (27), Annexure A (66-67). */
function agreementPages() {
  const s = { section: "schedule" }, w = { section: "waiver" }, a = { section: "agreement" }, x = { section: "annexure-a" };
  return [
    text("subscriber_name_p23", 23, 33, 102, 205, "copy.subscriber_name", s),
    multiline("subscriber_address_p23", 23, 33, 157, 205, 182, "document.address|withoutCareOf|upper", { fontSize: 7, ...s }),
    text("mailing_address_line1_p23", 23, 33, 211, 205, "copy.mailing_address_line1", { fontSize: 7, ...s }),
    text("mailing_address_line2_p23", 23, 33, 221, 205, "copy.mailing_address_line2", { fontSize: 7, ...s }),
    text("mobile_p23", 23, 33, 266, 205, "copy.mobile", s),
    text("fax", 23, 33, 321, 205, "typed", s),
    text("email_p23", 23, 33, 375, 205, "copy.email", s),
    text("capital_commitment_usd_p23", 23, 268, 88, 115, "copy.capital_commitment_usd", s),
    multiline("capital_commitment_usd_words_p23", 23, 247, 179, 148, 217, "copy.capital_commitment_usd_words", { fontSize: 8, ...s }),
    text("class_of_units", 23, 410, 101, 90, "typed", s),
    text("investor_name_p23", 23, 133, 582, 186, "copy.subscriber_name", s),
    text("subscriber_name_p24", 24, 102, 252.8, 408, "copy.subscriber_name", w),
    text("capital_commitment_usd_p24", 24, 194, 278.1, 150, "copy.capital_commitment_usd", w),
    text("first_holder_name_p24", 24, 74, 402.8, 190, "copy.subscriber_name", w),
    text("joint_holder_name_p24", 24, 326, 402.8, 195, "copy.joint_holder_name", w),
    text("agreement_execution_day", 27, 58, 158.2, 150, "typed", a),
    text("agreement_execution_month", 27, 251, 158.2, 114, "typed", a),
    text("agreement_execution_year", 27, 384, 158.2, 48, "typed", a),
    text("subscriber_name_p65", 65, 73, 649.5, 130, "copy.subscriber_name", a),
    text("subscriber_name_p66", 66, 172, 132, 238, "copy.subscriber_name", { fontSize: 9, ...x }),
    text("subscriber_address_p66", 66, 74, 168, 478, "document.address|withoutCareOf|upper", { fontSize: 7, ...x }),
    text("capital_commitment_usd_p66", 66, 408, 204, 36, "copy.capital_commitment_usd", x),
    text("capital_commitment_usd_words_p66", 66, 74, 222, 56, "copy.capital_commitment_usd_words", { fontSize: 6, ...x }),
    text("class_of_units_p66", 66, 382, 271.2, 35, "copy.class_of_units", x),
    text("mailing_address_line1_p67", 67, 74, 483.3, 478, "copy.mailing_address_line1", x),
    text("mailing_address_line2_p67", 67, 74, 503.3, 478, "copy.mailing_address_line2", x),
    text("email_p67", 67, 113, 549.7, 168, "copy.email", x),
    text("mobile_p67", 67, 135, 576.1, 152, "copy.mobile", x),
  ];
}

/** A signature box sitting on a printed signature line (x0-x1 at baseline y). */
const onLine = (page, [x0, x1, y], signer, label) => ({ page, x: x0, y: Math.round((y - 24) * 10) / 10, w: Math.round((x1 - x0) * 10) / 10, h: 24, signer, label });

const SIGNATURE_BOXES = [
  { page: 6, x: 29, y: 697, w: 178, h: 44, signer: "subscriber", label: "Application - first holder" },
  { page: 6, x: 208, y: 697, w: 178, h: 44, signer: "joint_holder", label: "Application - second holder" },
  { page: 7, x: 80, y: 704, w: 154, h: 22, signer: "subscriber", label: "FATCA & CRS - first holder" },
  { page: 7, x: 237, y: 704, w: 157, h: 22, signer: "joint_holder", label: "FATCA & CRS - second holder" },
  { page: 23, x: 29, y: 469, w: 170, h: 52, signer: "subscriber", label: "Schedule I - contributor" },
  onLine(24, [72.0, 264.6, 497.6], "subscriber", "FME contribution waiver - first holder"),
  onLine(24, [324.1, 522.2, 497.6], "joint_holder", "FME contribution waiver - second holder"),
  onLine(65, [71.5, 204.8, 572.7], "subscriber", "Contribution Agreement - contributor"),
];

const IGNORED_BLANKS = [
  { page: 4, y: 340.0, why: "Relationship to minor: only when the first holder is a minor (guardian block)" },
  { page: 4, y: 690.0, why: "\"[STD /ISD Code]\" is a label, not a blank" },
  { page: 5, y: 575.6, why: "Guardian's \"Others (Please specify)\": only when the first holder is a minor" },
  ...[115.9, 138.0].map((y) => ({ page: 12, y, why: "Non-individual application (pages 10-16): this form is for individuals" })),
  ...[700.2, 734.4].map((y) => ({ page: 13, y, why: "Non-individual application (pages 10-16): this form is for individuals" })),
  { page: 23, y: 616.7, why: "Name of authorised signatory: for a non-individual investor" },
  { page: 24, y: 616.0, why: "Name & designation of the authorised signatory: for a non-individual investor" },
  ...[138.3, 155.9, 173.6, 191.3, 209.0, 226.6, 244.3, 262.0, 279.6, 297.3, 315.0, 332.6, 350.3, 368.0, 385.6, 403.3, 421.0, 438.7, 456.3, 474.0, 491.7, 509.3, 527.0, 544.7]
    .map((y) => ({ page: 26, y, why: "Table of contents of the Contribution Agreement (dotted leaders)" })),
  { page: 27, y: 57.9, why: "\"[To be Stamped]\" is an instruction" },
  ...[163.5, 242.7, 374.7, 453.9].map((y) => ({ page: 65, y, why: "Signed by the Trustee / FME" })),
  { page: 66, y: 151.5, why: "First part of the address bracket: the address is written on the full line under it" },
  { page: 66, y: 346.2, why: "Total expense ratio tick column: follows the class of units - open question" },
  { page: 67, y: 114.2, why: "Set-up fee tick column: follows the class of units - open question" },
  { page: 67, y: 524.8, why: "Third mailing-address line: the Excel gives two (city, state and country are on page 3)" },
];

const SECTIONS = [["applicant", "First holder (KYC + Excel)"], ["second-holder", "Second holder (Excel)"], ["contact", "Addresses and contact"],
  ["distributor", "Distributor (Excel)"], ["investment", "Capital commitment and contribution (Excel)"], ["nomination", "Nomination"], ["bank", "Bank account (Excel)"],
  ["kyc", "KYC details (Excel)"], ["signed", "Declaration signed"], ["fatca", "FATCA & CRS"], ["schedule", "Schedule I"],
  ["waiver", "FME contribution waiver"], ["agreement", "Contribution Agreement date (Excel)"], ["annexure-a", "Annexure A: key details"]];

const REQUIRED_FIELDS = ["subscriber_name", "dob", "tax_reference_number", "gender", "mobile", "email", "capital_commitment_usd",
  "class_of_units", "account_number", "bank_name", "swift_code", "pep_status", "wish_to_nominate", "place"];

function main() {
  const fields = [...distributorTable(), ...generalInformationPage(), ...contributionAndBankPage(), ...declarationAndFatcaPages(), ...agreementPages()];
  const duplicateKeys = fields.map((field) => field.key).filter((key, index, keys) => keys.indexOf(key) !== index);
  if (duplicateKeys.length) throw new Error(`duplicate keys ${duplicateKeys.join(", ")}`);
  const textFields = fields.filter((field) => !field.tickbox), tickboxes = fields.filter((field) => field.tickbox);
  mkdirSync(FOLDER, { recursive: true });
  copyFileSync(SOURCE_PDF, path.join("data/Blank Forms", BLANK_FILE_NAME));
  const writeJson = (fileName, content) => writeFileSync(path.join(FOLDER, fileName), JSON.stringify(content, null, 2) + "\n");

  writeJson("field-positions.json", { _about: `Where each value is written on the blank ${FUND_NAME} application form, 68 pages. Made by tools/form-building/make_gift_sbi_application.mjs.`,
    formId: FORM_ID, title: `${FUND_NAME} - Application Form`,
    fields: textFields.map(({ source, section, ...field }) => ({ key: field.key, nominee: null, ...field })) });
  writeJson("field-sources.json", {
    _about: "Form field -> where its value comes from. \"document.X\" = X read from the first holder's KYC documents (see ../document-data-dictionary.json); \"|upper\" etc. = the part or form of it this box wants; \"typed\" = from the batch Excel or the review screen; \"copy.X\" = same as field X unless typed separately; \"today\" = today's date; \"tick\" = a tick box, answered per client in the Excel (never assumed). joint_holder_* = the second holder (typed). No GIFT City field sheet exists yet: sources follow the GIFT feeder subscription forms.",
    fieldSources: Object.fromEntries(fields.map((field) => [field.key, field.tickbox ? "tick" : field.source])) });
  writeJson("required-fields.json", { _about: "Fields that must be filled before a case can be confirmed. Changed from the Form setup screen.", requiredFields: REQUIRED_FIELDS });
  writeJson("form-rules.json", {
    _about: "Form-level rules: how the form is recognised, which tab it saves to. One person (the first holder) - their KYC documents fill the identity fields, the Excel fills the rest; the second holder's fields are typed.",
    formId: FORM_ID, group: "GIFT City", label: "GIFT – SBI Global Thematic Advantage – Application", shortLabel: "GIFT SBI GTAF application",
    purpose: "New investment · application form and contribution agreement", blankFileName: BLANK_FILE_NAME,
    keyFields: ["Applicant name", "Capital commitment", "Bank account"], sheetTabName: "GIFT SBI GTAF application",
    detectionPhrases: ["SBI Global Thematic Advantage Fund", "GENERAL INFORMATION"], supportedNomineeCount: 1, personLabel: "Applicant",
    identityType: { scope: "shared", tickboxField: null, numberField: null, optionByIdentityKind: {}, numberFieldByIdentityKind: {} },
    reviewSections: SECTIONS.map(([key, title]) => {
      const sectionFields = fields.filter((field) => field.section === key);
      const pages = [...new Set(sectionFields.map((field) => field.page))].sort((first, second) => first - second);
      const pageWords = pages.length > 1 ? `Pages ${pages[0]}-${pages[pages.length - 1]}` : `Page ${pages[0]}`;
      return { key, label: `${pageWords} · ${title}`, fields: sectionFields.map((field) => field.key) };
    }) });
  writeJson("form-configuration.json", {
    _about: `${FUND_NAME} application form, 68 pages. Made by tools/form-building/make_gift_sbi_application.mjs. Every tick box is its own question with no assumed answer.`,
    id: FORM_ID, title: `${FUND_NAME} - Application Form`, labels: [], signatureBoxes: SIGNATURE_BOXES,
    tickboxes: tickboxes.map(({ tickbox, section, ...tickboxSpec }) => tickboxSpec),
    blankFileName: BLANK_FILE_NAME, nomineeHeaderRe: null, tickboxRule: "usual", ignoredBlanks: IGNORED_BLANKS });
  console.log(`wrote ${FOLDER}: ${textFields.length} fields, ${tickboxes.length} tick boxes, ${SIGNATURE_BOXES.length} signatures`);
}

main();
