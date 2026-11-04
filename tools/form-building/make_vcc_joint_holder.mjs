// Writes the GIF 2 Joint Holder Declaration form folder (14 pages, US Letter). Its pages are the GIF 2 subscription's
// pages 24-27, 50 and 54-62 re-set on a smaller page, so field keys, sources and tick-box options are taken from the
// subscription form (same Excel columns, same KYC sources) and every position below was measured on this blank.
// Change this file, not its output.  usage (from the repo root): node tools/form-building/make_vcc_joint_holder.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const FORMS = "apps/backend/src/forms/vcc";
const SUBSCRIPTION_FOLDER = path.join(FORMS, "global-investment-fund-2-subscription");
const FORM_ID = "global-investment-fund-2-joint-holder";
const BLANK_FILE_NAME = "360 ONE Global Investment Fund 2 - Joint Holder Declaration.pdf";
const TITLE = "360 ONE Global Investment Fund 2 - Joint Holder Declaration";

// Joint holder page -> subscription page with the same text (matched by text, see the report).
const SUBSCRIPTION_PAGE_BY_PAGE = { 1: 24, 2: 25, 3: 26, 4: 27, 5: 50, 6: 54, 7: 55, 8: 56, 9: 57, 10: 58, 11: 59, 12: 60, 13: 61, 14: 62 };

// Text sits 3.7pt above an underscore run's baseline (as on the subscription form).
const ON_LINE = (baseline) => Math.round((baseline - 3.7) * 100) / 100;
const text = (key, page, x, y, maxWidth, fontSize = 10, extra = {}) => ({ key, nominee: null, page, x, y, fontSize, type: "text", maxWidth, ...extra });

const FIELDS = [
  // Page 3 - Section 1 (underscore runs x 322.4-498.0) and Section 2 (a) U.S. TIN line.
  text("surname", 3, 324.5, ON_LINE(149.3), 172),
  text("title", 3, 324.5, ON_LINE(167.0), 172),
  text("given_name", 3, 324.5, ON_LINE(184.9), 172),
  text("middle_name", 3, 324.5, ON_LINE(202.9), 172),
  text("residence_address_line1", 3, 324.5, ON_LINE(251.5), 172, 8),
  text("residence_address_line2", 3, 324.5, ON_LINE(269.5), 172, 8),
  text("residence_country", 3, 324.5, ON_LINE(287.3), 172),
  text("pincode", 3, 324.5, ON_LINE(305.2), 172),
  text("mailing_address_line1", 3, 324.5, ON_LINE(358.8), 172, 8),
  text("mailing_address_line2", 3, 324.5, ON_LINE(376.8), 172, 8),
  text("mailing_country", 3, 324.5, ON_LINE(394.6), 172),
  text("mailing_postcode", 3, 324.5, ON_LINE(412.4), 172),
  text("dob", 3, 324.5, ON_LINE(442.8), 172),
  text("us_tin", 3, 130, ON_LINE(561.5), 214),
  // Page 4 - Section 3 table (columns 93.7|134.0|270.6|392.6|517.9, rows end at 240.4, 261.6, 283.0) and Section 4.
  text("tax_residence_country", 4, 136.8, 236.8, 130),
  text("tax_reference_type", 4, 273.2, 236.8, 116),
  text("tax_reference_number", 4, 395.4, 236.8, 120),
  text("tax_residence_country_2", 4, 136.8, 258.0, 130),
  text("tax_reference_type_2", 4, 273.2, 258.0, 116),
  text("tax_reference_number_2", 4, 395.4, 258.0, 120),
  text("tax_residence_country_3", 4, 136.8, 279.4, 130),
  text("tax_reference_type_3", 4, 273.2, 279.4, 116),
  text("tax_reference_number_3", 4, 395.4, 279.4, 120),
  text("tin_unavailable_reason", 4, 95.5, ON_LINE(319.6), 378, 9),
  text("subscriber_name", 4, 189.5, ON_LINE(604.3), 214),
  text("form_date", 4, 189.5, ON_LINE(638.8), 214),
  text("signing_capacity", 4, 189.5, ON_LINE(711.8), 214),
  // Page 5 - Opt-in: "Client Name" cell (x 283.7-516.2), then "Name:" and "Date:" labels.
  text("subscriber_name_p5", 5, 288, 188.9, 225, 10, { alsoAt: [{ page: 5, x: 107, y: 554.0, maxWidth: 200 }] }),
  text("form_date_p5", 5, 103, 610.8, 150),
  // Page 6 - beneficial owner lines (x 209.3-503.0 at 373.2; 407.3, 430.0, 441.6). Address at 10pt: baselines 406.5, 417.5, 428.5 sit on the 407.3 and 430.0 rules.
  text("beneficial_owner_name", 6, 212, 370, 288, 9),
  text("beneficial_owner_address", 6, 212, 406.5, 288, 10, { type: "multiline", maxY: 441 }),
  // Page 8 - no printed lines: below "full name of the associate:" and after "beneficial owner:".
  text("associate_name", 8, 110, 401, 420),
  text("associate_ownership_percent", 8, 183, 463.8, 200),
  // Page 12 - Part II "which matter(s)" line (y 690.4, x 75.6-552.1).
  text("tax_offence_part2_matters", 12, 78, 687, 470, 9),
  // Page 13 - lines at 439.2 (x 289.2-357.1), 462.6, 486.0, 532.0 (x 289.2-530.4).
  text("form_date_p13", 13, 291.5, 436, 64),
  text("subscriber_name_p13", 13, 291.5, 459, 236),
  text("authorised_signatory_name_p13", 13, 291.5, 482.5, 236),
  text("authorised_signatory_designation_p13", 13, 291.5, 528.5, 236),
  // Page 14 - PEP dotted lines (baselines 517.2, 540.0, 562.8, 585.6), "Name:" and "Date:".
  text("pep_details_1", 14, 78, 513.2, 425, 9),
  text("pep_details_2", 14, 78, 536.0, 425, 9),
  text("pep_details_3", 14, 78, 558.8, 425, 9),
  text("pep_details_4", 14, 78, 581.6, 425, 9),
  text("subscriber_name_p14", 14, 107, 631.2, 250),
  text("form_date_p14", 14, 103, 687.8, 150),
];

// Every box on this blank is a drawn square; [x0, y0] is its top-left, size its side. The tick is centred on it.
const BOX_SIZE_BY_PAGE = { 3: 6.6, 6: 6.0, 7: 6.6, 8: 6.6, 11: 6.6, 12: 6.6, 14: 4.3 };
const TICK_SIZE = (boxSize) => (boxSize > 5 ? 8 : 6);
const TICKBOXES = [
  { key: "us_tax_status", page: 3, boxes: [[128.28, 512.52], [128.28, 573.12], [128.28, 603.72]] },
  { key: "beneficial_owner", page: 6, boxes: [[103.92, 319.32], [103.92, 335.16]] },
  { key: "singapore_tax_status", page: 6, boxes: [[77.28, 559.08], [77.28, 627.0]] },
  { key: "sg_entity_category", page: 7, boxes: [[77.28, 124.44], [77.28, 277.8], [77.28, 324.24], [77.28, 370.68], [77.28, 417.12], [77.28, 441.72]] },
  { key: "sg_entity_q1_tax_resident", page: 7, boxes: [[110.52, 536.64], [210.6, 536.64]] },
  { key: "sg_entity_q2", page: 7, boxes: [[110.52, 643.08], [210.6, 643.08]] },
  { key: "sg_entity_q3", page: 8, boxes: [[110.52, 151.92], [210.6, 151.92]] },
  { key: "sg_entity_q4", page: 8, boxes: [[110.52, 258.36], [210.6, 258.36]] },
  { key: "sg_entity_q5", page: 8, boxes: [[110.52, 328.44], [210.6, 328.44]] },
  ...["1a", "1b", "1c", "1d", "1e"].map((question, index) => ({ key: `tax_offence_${question}`, page: 11,
    boxes: [[473.04, [509.52, 544.68, 569.52, 604.68, 662.76][index]], [520.2, [509.52, 544.68, 569.52, 604.68, 662.76][index]]] })),
  ...["1f", "1g", "2a", "2b", "2c", "2d", "2e", "3", "part2"].map((question, index) => ({ key: `tax_offence_${question}`, page: 12,
    boxes: [[473.04, [106.56, 153.12, 223.56, 258.84, 293.88, 329.16, 375.84, 456.96, 612.0][index]],
      [520.2, [106.56, 153.12, 223.56, 258.84, 293.88, 329.16, 375.84, 456.96, 612.0][index]]] })),
  { key: "pep_status", page: 14, boxes: [[77.28, 433.08], [77.28, 455.88]] },
];

const SIGNATURE_BOXES = [
  { page: 4, x: 190, y: 543, w: 200, h: 24, signer: "subscriber", label: "Joint holder – tax self-certification" },
  { page: 5, x: 78, y: 562, w: 180, h: 24, signer: "subscriber", label: "Joint holder – opt-in confirmation" },
  { page: 13, x: 80, y: 352, w: 205, h: 50, signer: "subscriber", label: "Joint holder – tax offences questionnaire" },
  { page: 14, x: 78, y: 639, w: 180, h: 24, signer: "subscriber", label: "Joint holder – PEP self-certification" },
];

// Fields whose subscription key changes here: page copies follow this form's pages.
const SOURCE_KEY_BY_FIELD = {
  subscriber_name_p5: "subscriber_name_p50", subscriber_name_p13: "subscriber_name_p61", subscriber_name_p14: "subscriber_name_p62",
  form_date_p5: "form_date_p50", form_date_p13: "form_date_p61", form_date_p14: "form_date_p62",
  authorised_signatory_name_p13: "authorised_signatory_name_p61", authorised_signatory_designation_p13: "authorised_signatory_designation_p61",
};

const REVIEW_SECTIONS = [
  { key: "p3", label: "Page 3 · Joint holder identification (KYC)", fields: ["title", "surname", "given_name", "middle_name",
    "residence_address_line1", "residence_address_line2", "residence_country", "pincode", "dob", "us_tax_status",
    "mailing_address_line1", "mailing_address_line2", "mailing_country", "mailing_postcode", "us_tin"] },
  { key: "p4", label: "Page 4 · Tax residency, signed (KYC)", fields: ["tax_residence_country", "tax_reference_type",
    "tax_reference_number", "tax_residence_country_2", "tax_reference_type_2", "tax_reference_number_2", "tax_residence_country_3",
    "tax_reference_type_3", "tax_reference_number_3", "tin_unavailable_reason", "subscriber_name", "form_date", "signing_capacity"] },
  { key: "p5", label: "Page 5 · Accredited investor opt-in", fields: ["subscriber_name_p5", "form_date_p5"] },
  { key: "p6", label: "Page 6 · Singapore tax status", fields: ["beneficial_owner", "beneficial_owner_name", "beneficial_owner_address", "singapore_tax_status"] },
  { key: "p7", label: "Pages 7-8 · Singapore tax (non-individual owner)", fields: ["sg_entity_category", "sg_entity_q1_tax_resident",
    "sg_entity_q2", "sg_entity_q3", "sg_entity_q4", "sg_entity_q5", "associate_name", "associate_ownership_percent"] },
  { key: "p11", label: "Page 11 · Tax offences 1(a)-(e)", fields: ["tax_offence_1a", "tax_offence_1b", "tax_offence_1c", "tax_offence_1d", "tax_offence_1e"] },
  { key: "p12", label: "Page 12 · Tax offences 1(f)-3, Part II", fields: ["tax_offence_1f", "tax_offence_1g", "tax_offence_2a",
    "tax_offence_2b", "tax_offence_2c", "tax_offence_2d", "tax_offence_2e", "tax_offence_3", "tax_offence_part2", "tax_offence_part2_matters"] },
  { key: "p13", label: "Page 13 · Tax offences signed", fields: ["form_date_p13", "subscriber_name_p13", "authorised_signatory_name_p13", "authorised_signatory_designation_p13"] },
  { key: "p14", label: "Page 14 · Politically exposed person", fields: ["pep_status", "pep_details_1", "pep_details_2", "pep_details_3", "pep_details_4", "subscriber_name_p14", "form_date_p14"] },
];

const REQUIRED_FIELDS = ["subscriber_name", "surname", "given_name", "residence_country", "dob", "tax_reference_number", "us_tax_status",
  "beneficial_owner", "singapore_tax_status", ...["1a", "1b", "1c", "1d", "1e", "1f", "1g", "2a", "2b", "2c", "2d", "2e", "3"].map((question) => `tax_offence_${question}`),
  "pep_status"];

const roundNumber = (number) => Math.round(number * 100) / 100;
const readSubscriptionJson = (fileName) => JSON.parse(readFileSync(path.join(SUBSCRIPTION_FOLDER, fileName), "utf-8"));
const folder = path.join(FORMS, FORM_ID);
const writeJson = (fileName, content) => writeFileSync(path.join(folder, fileName), JSON.stringify(content, null, 2) + "\n");
mkdirSync(folder, { recursive: true });

const subscriptionConfiguration = readSubscriptionJson("form-configuration.json");
const subscriptionSources = readSubscriptionJson("field-sources.json").fieldSources;
const toSubscriptionKey = (fieldKey) => SOURCE_KEY_BY_FIELD[fieldKey] || fieldKey;
const toThisFormKey = (subscriptionKey) => Object.keys(SOURCE_KEY_BY_FIELD).find((fieldKey) => SOURCE_KEY_BY_FIELD[fieldKey] === subscriptionKey) || subscriptionKey;

const tickboxes = TICKBOXES.map(({ key, page, boxes }) => {
  const subscriptionTickbox = subscriptionConfiguration.tickboxes.find((tickbox) => tickbox.key === key);
  if (!subscriptionTickbox) throw new Error(`tick box ${key} is not on the subscription form`);
  if (subscriptionTickbox.options.length !== boxes.length) throw new Error(`${key}: ${boxes.length} boxes for ${subscriptionTickbox.options.length} options`);
  const boxSize = BOX_SIZE_BY_PAGE[page];
  const tickSize = TICK_SIZE(boxSize);
  // drawCheckmark spans x+0.1w..x+0.9w and y-0.7h..y+0.15h: shift so the tick's centre is the box's centre.
  const toTickSpot = ([boxX, boxY]) => ({ x: roundNumber(boxX + boxSize / 2 - tickSize / 2), y: roundNumber(boxY + boxSize / 2 + tickSize * 0.275) });
  const { boxesByOption: _subscriptionBoxes, page: _subscriptionPage, w: _width, h: _height, ...rest } = subscriptionTickbox;
  return { ...rest, key, page, w: tickSize, h: tickSize,
    boxesByOption: Object.fromEntries(subscriptionTickbox.options.map((option, index) => [option, [toTickSpot(boxes[index])]])) };
});

const fieldSources = {};
for (const fieldKey of [...FIELDS.map((field) => field.key), ...tickboxes.map((tickbox) => tickbox.key)]) {
  const source = subscriptionSources[toSubscriptionKey(fieldKey)];
  if (!source) throw new Error(`${fieldKey}: no source on the subscription form`);
  // Page copies point at the first time the value is printed here (page 4), not at the subscription's page 16.
  fieldSources[fieldKey] = source.replace(/^copy\.(.+)$/, (_match, copiedKey) => `copy.${toThisFormKey(copiedKey)}`);
}

writeJson("field-positions.json", { _about: `Where each value is written on the blank ${TITLE}, 14 pages (US Letter). Made by tools/form-building/make_vcc_joint_holder.mjs; every position measured on this blank.`,
  formId: FORM_ID, title: TITLE, fields: FIELDS });
writeJson("field-sources.json", { _about: "Form field -> where its value comes from. \"document.X\" = X read from the joint holder's KYC documents (see ../document-data-dictionary.json); \"typed\" = from the batch Excel or the review screen; \"default.X\" = usually X, the Excel can change it; \"copy.X\" = same as field X unless typed separately; \"today\" = today's date; \"tick\" = a tick box, answered per client in the Excel (never assumed). Keys and sources are the GIF 2 subscription form's, so the Excel columns match.",
  fieldSources });
writeJson("required-fields.json", { _about: "Fields that must be filled before a case can be confirmed. Changed from the Form setup screen.", requiredFields: REQUIRED_FIELDS });
writeJson("form-rules.json", { _about: "Form-level rules. One person (the joint holder, i.e. the second applicant of a GIF 2 subscription) - their KYC documents fill the identity fields, the Excel fills the rest.",
  formId: FORM_ID, group: "VCC", label: "Global Investment Fund 2 – Joint holder declaration", shortLabel: "GIF 2 joint holder",
  purpose: "Second applicant's declarations · joint GIF 2 subscription", blankFileName: BLANK_FILE_NAME,
  keyFields: ["Subscriber name", "Date of birth", "Tax reference number"], sheetTabName: "GIF 2 joint holder",
  detectionPhrases: ["360 ONE Global Investment Fund 2", "Individual Tax Residency Self-Certification"],
  supportedNomineeCount: 1, personLabel: "Joint holder",
  identityType: { scope: "shared", tickboxField: null, numberField: null, optionByIdentityKind: {}, numberFieldByIdentityKind: {} },
  reviewSections: REVIEW_SECTIONS });
writeJson("form-configuration.json", { _about: `${TITLE}, 14 pages: the GIF 2 subscription's pages ${Object.values(SUBSCRIPTION_PAGE_BY_PAGE).join(", ")} for the joint holder. Made by tools/form-building/make_vcc_joint_holder.mjs. Every tick box is its own question with no assumed answer.`,
  id: FORM_ID, title: TITLE, labels: [], signatureBoxes: SIGNATURE_BOXES, tickboxes, blankFileName: BLANK_FILE_NAME,
  nomineeHeaderRe: subscriptionConfiguration.nomineeHeaderRe, tickboxRule: "usual", ignoredBlanks: [] });
console.log(`wrote ${folder}: ${FIELDS.length} fields, ${tickboxes.length} tick boxes, ${SIGNATURE_BOXES.length} signature boxes`);

// Joint-holder role + joint_holder_ keys (shared with the other joint generators).
const { applyJointHolderRole } = await import("./joint-holder-keys.mjs");
applyJointHolderRole([FORM_ID]);
