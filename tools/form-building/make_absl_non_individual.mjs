// Writes the ABSL Emerging Market Equity Fund (GIFT) application form for non-individuals (companies, trusts, LLPs…):
// 5 JSON files in apps/backend/src/forms/gift-city/gift-absl-em-equity-non-individual/. Positions were measured on the
// blank with tools/form-building/boxes.py and measure.py (top-left origin, y = text baseline).
// The entity's own details come from the Excel; the KYC documents are the authorised signatory's (Annexure A2).
// usage: node tools/form-building/make_absl_non_individual.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FORM_ID = "gift-absl-em-equity-non-individual";
const TITLE = "ABSL Emerging Market Equity Fund - Application Form for Non Individuals";
const BLANK = "ABSL Emerging Market Equity Fund - Non Individual Application.pdf";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const FOLDER = path.join(ROOT, "apps/backend/src/forms/gift-city", FORM_ID);

const fields = [];
const sources = {};
const tickboxes = [];

/** A one-line text field. */
function text(key, source, page, x, y, maxWidth, extra = {}) {
  fields.push({ key, nominee: null, page, x, y, fontSize: extra.fontSize || 8, type: "text", maxWidth, ...extra });
  sources[key] = source;
}

/** Text that may wrap inside a table cell (down to maxY). */
function cell(key, source, page, x, y, maxWidth, maxY, fontSize = 7) {
  fields.push({ key, nominee: null, page, x, y, fontSize, type: "multiline", maxWidth, maxY });
  sources[key] = source;
}

/** One character per printed box: groups = [[left x, group width, box count], ...], all on one row. */
function boxes(key, source, page, y, groups, { keepAll = false, fontSize = 8 } = {}) {
  fields.push({ key, nominee: null, page, x: groups[0][0], y, fontSize, type: "text", combs: groups, ...(keepAll ? { combKeepAll: true } : {}) });
  sources[key] = source;
}

/** A tick placed in the middle of a printed box (left, top, width, height). The engine draws the tick from
 * y - 0.7 h to y + 0.15 h, so y = box middle + 0.275 h centres it. */
function onBox(left, top, width, height, page) {
  const size = Math.min(9, height - 1);
  return { x: +(left + (width - size) / 2).toFixed(1), y: +(top + height / 2 + 0.275 * size).toFixed(1), ...(page ? { page } : {}), size };
}
function tick(key, page, boxesByOption, { optional = false, always = false } = {}) {
  const firstBox = Object.values(boxesByOption)[0][0];
  const size = firstBox.size;
  const cleanBoxes = Object.fromEntries(Object.entries(boxesByOption).map(([option, optionBoxes]) => [option, optionBoxes.map(({ size: unused, ...box }) => box)]));
  // An always-ticked box has one fixed place (x, y) and no options, like the W-8BEN's certification box.
  const tickbox = always
    ? { key, page, w: size, h: size, x: firstBox.x, y: firstBox.y, isAlwaysTicked: true }
    : { key, page, w: size, h: size, options: Object.keys(boxesByOption), boxesByOption: cleanBoxes };
  if (optional) tickbox.isOptional = true;
  tickboxes.push(tickbox);
  sources[key] = "tick";
}
const large = (left, top) => onBox(left, top, 11.4, 10.7);
const medium = (left, top) => onBox(left, top, 10.1, 9.5);
const fatcaBox = (left, top) => onBox(left, top, 8.1, 7.7);
const small = (left, top) => onBox(left, top, 7.2, 7.2);

// ---------- Page 9: distributor, existing unitholder, general information, entity, addresses, contact ----------
boxes("distributor_name", "typed", 9, 103.1, [[124.9, 440.0, 30]], { keepAll: true });
boxes("distributor_code", "typed", 9, 124.1, [[81.9, 190.7, 13]], { keepAll: true });
text("distributor_email", "typed", 9, 413, 124.3, 147);
text("distributor_rm_name", "typed", 9, 96, 145.2, 230);
text("distributor_rm_contact", "typed", 9, 433, 145.2, 128);
text("rm_name", "typed", 9, 52, 176.9, 274);
text("rm_branch", "typed", 9, 366.5, 176.9, 194);
text("rm_email", "typed", 9, 52, 196.7, 274);
text("rm_contact", "typed", 9, 382.5, 196.7, 178);
boxes("existing_unitholder_name", "typed", 9, 250.5, [[46.4, 440.1, 30]], { keepAll: true });
boxes("folio_no", "typed", 9, 267.8, [[52.1, 176.1, 12]], { keepAll: true });
tick("investor_category", 9, { "Non Individual": [large(183.3, 291.3)] }, { always: true });
tick("entity_constitution", 9, {
  "Partnership LLP": [large(21.1, 309.9)], Company: [large(110.8, 309.9)],
  "Bank / Insurance Company / Pension Fund / Provident Fund": [large(179.7, 309.9)], Others: [large(21.1, 328.6)],
});
text("entity_constitution_other", "typed", 9, 117, 335, 370);
boxes("entity_legal_name", "typed", 9, 357.2, [[94.7, 477.2, 32]], { keepAll: true, fontSize: 9 });
boxes("entity_incorporation_date", "typed", 9, 374.3, [[125.0, 91.9, 8]]);
text("entity_registration_number", "typed", 9, 78.5, 393.3, 490);
text("entity_pan", "typed", 9, 55.5, 414.4, 132);
text("entity_ckyc_number", "typed", 9, 294.5, 414.4, 274);
text("entity_address_street", "typed", 9, 99.5, 448.1, 469, { fontSize: 7.5 });
text("entity_address_city", "typed", 9, 38.5, 471.1, 235);
text("entity_address_state", "typed", 9, 314.5, 471.1, 254);
text("entity_address_postcode", "typed", 9, 68.5, 493.6, 205);
text("entity_address_country", "typed", 9, 322.5, 493.6, 246);
text("entity_mailing_street", "typed", 9, 99.5, 526.5, 469, { fontSize: 7.5 });
text("entity_mailing_city", "typed", 9, 38.5, 549.5, 235);
text("entity_mailing_state", "typed", 9, 314.5, 549.5, 254);
text("entity_mailing_postcode", "typed", 9, 68.5, 571.9, 205);
text("entity_mailing_country", "typed", 9, 322.5, 571.9, 246);
boxes("contact_person_name", "typed", 9, 604.4, [[52.8, 519.1, 35]], { keepAll: true });
text("contact_person_address", "typed", 9, 55.5, 625.3, 299, { fontSize: 7 });
text("contact_person_designation", "typed", 9, 409.5, 625.3, 160);
text("contact_person_pan", "typed", 9, 55.5, 646.5, 132);
text("contact_person_ckyc_number", "typed", 9, 294.5, 646.5, 274);
text("telephone", "typed", 9, 55.5, 667.1, 132);
text("mobile", "typed", 9, 225.5, 667.1, 129);
text("fax", "typed", 9, 382.5, 667.1, 186);
text("email", "typed", 9, 55.5, 689.1, 232);
text("alternate_email", "typed", 9, 341.5, 689.1, 227);
boxes("poa_holder_name", "typed", 9, 710.1, [[113.1, 458.8, 31]], { keepAll: true });
text("poa_holder_pan", "typed", 9, 55.5, 730.9, 132);
text("poa_holder_ckyc_number", "typed", 9, 294.5, 730.9, 274);
tick("pep_status", 9, { "I am PEP": [onBox(21.4, 755.3, 10.7, 10.7)], "I am related to a PEP": [onBox(83.1, 755.3, 10.7, 10.7)], "Not applicable": [onBox(183.6, 755.3, 10.7, 10.7)] });

// ---------- Page 10: investment and bank accounts ----------
tick("plan_class", 10, { "Direct Plan Class A": [medium(154.2, 39.6)], "Regular Plan Class B": [medium(332.5, 39.6)] });
text("subscription_amount", "typed", 10, 184, 65.6, 390, { fontSize: 9 });
text("subscription_amount_words", "typed", 10, 184, 81.8, 390);
boxes("account_number", "typed", 10, 100.8, [[100.1, 283.4, 18]]);
text("account_type", "typed", 10, 443, 100.9, 130);
text("bank_name", "typed", 10, 103, 120.4, 470);
text("bank_city", "typed", 10, 63, 140.4, 156);
text("bank_state", "typed", 10, 259, 140.2, 314);
text("bank_postcode", "typed", 10, 63, 160.1, 156);
text("bank_country", "typed", 10, 259, 160.6, 313);
text("ifsc_code", "typed", 10, 63, 181.2, 213);
text("swift_code", "typed", 10, 347, 181.6, 225);
tick("payout_bank_same", 10, { "Same as above": [large(18.8, 249.0)] }, { optional: true });
boxes("payout_account_number", "typed", 10, 274.5, [[100.8, 283.4, 18]]);
text("payout_account_type", "typed", 10, 443.5, 274.5, 130);
text("payout_bank_name", "typed", 10, 103.5, 294, 470);
text("payout_bank_city", "typed", 10, 63.5, 314, 156);
text("payout_bank_state", "typed", 10, 259.5, 313.9, 314);
text("payout_bank_postcode", "typed", 10, 63.5, 333.6, 156);
text("payout_bank_country", "typed", 10, 259.5, 334.2, 313);
text("payout_ifsc_code", "typed", 10, 63.5, 354.7, 213);
text("payout_swift_code", "typed", 10, 347.5, 355.2, 225);

// ---------- Page 11: declarations - place and date (signatures with seal by hand) ----------
text("place", "typed", 11, 82, 650.3, 333, { fontSize: 9, alsoAt: [{ page: 14, x: 85, y: 517, fontSize: 9, maxWidth: 333 }] });
boxes("form_date", "today", 11, 665.9, [[80.4, 91.9, 8]]);

// ---------- Page 12: ultimate beneficial owners (UBO 1 / SMO, UBO 2, UBO 3) ----------
const UBO_COLUMNS = [[146, 116], [267.5, 140], [413.5, 162]];
const UBO_ROWS = [
  ["name", 247.3], ["father_name", 266.5], ["gender", 285.7], ["dob", 304.9], ["place_of_birth", 324.1], ["occupation", 343.3],
  ["tax_residence_country", 362.5], ["ownership_percent", 381.7], ["tax_identification_number", 400.9], ["identity_document_type", 420.1],
];
UBO_COLUMNS.forEach(([columnX, columnWidth], columnIndex) => {
  for (const [rowName, baseline] of UBO_ROWS) text(`ubo_${columnIndex + 1}_${rowName}`, "typed", 12, columnX, baseline, columnWidth, { fontSize: 7.5 });
});

// ---------- Page 13: FATCA / CRS declaration for entities ----------
boxes("entity_pan_p13", "copy.entity_pan", 13, 71.6, [[64.8, 113.4, 10]]);
boxes("entity_incorporation_date_p13", "copy.entity_incorporation_date", 13, 73.4, [[447.9, 122.5, 8]]);
text("entity_legal_name_p13", "copy.entity_legal_name", 13, 64, 90.6, 508);
tick("kyc_address_type", 13, {
  Residential: [medium(182.7, 101.5)], "Residential / Business": [medium(266.7, 101.5)],
  Business: [medium(397.6, 101.5)], "Registered Office": [medium(496.3, 101.5)],
});
text("entity_place_of_incorporation", "typed", 13, 165.5, 126.2, 214);
text("entity_country_of_incorporation", "typed", 13, 479, 126.2, 98, { fontSize: 7.5 });
tick("gross_annual_income", 13, {
  "Below 1 million": [medium(182.7, 135.6)], "1 to 5 million": [medium(266.7, 135.6)],
  "5 to 10 million": [medium(397.6, 135.6)], "10 million and above": [medium(493.9, 135.6)],
});
text("net_worth_usd_million", "typed", 13, 165.5, 161.6, 214);
boxes("net_worth_date", "typed", 13, 161.2, [[447.9, 122.5, 8]]);
tick("entity_restricted_services", 13, {
  "Foreign Exchange / Money Changer Services": [medium(174.8, 170.5)], "Money Laundering / Pawning": [medium(411.3, 170.5)],
  "Gaming / Gambling / Lottery Services": [medium(174.8, 183.5)],
}, { optional: true });
tick("entity_tax_resident_outside_india", 13, { Yes: [medium(218.4, 202.9)], No: [medium(263.4, 202.9)] });
[295, 325.7, 356.4].forEach((baseline, rowIndex) => {
  const rowNumber = rowIndex + 1;
  text(`entity_tax_residence_country_${rowNumber}`, "typed", 13, 39, baseline, 205);
  text(`entity_tax_reference_number_${rowNumber}`, "typed", 13, 250, baseline, 168);
  text(`entity_tax_reference_type_${rowNumber}`, "typed", 13, 424.5, baseline, 151);
});
text("entity_us_exemption", "typed", 13, 510, 386.5, 68);
tick("fatca_part_b_status", 13, { "Financial institution": [fatcaBox(24.0, 423.4)], "Direct reporting NFFE": [fatcaBox(24.0, 444.7)] }, { optional: true });
text("entity_giin", "typed", 13, 202, 444, 366);
text("sponsoring_entity_name", "typed", 13, 204, 492.6, 372);
tick("giin_not_available_reason", 13, {
  "Applied for": [fatcaBox(202.2, 517.3)], "Not required to apply for": [fatcaBox(202.2, 530.2)],
  "Not obtained - Non-participating FFI": [fatcaBox(202.2, 542.8)],
}, { optional: true });
text("giin_exemption_subcategory_code", "typed", 13, 400, 535.6, 174);
tick("listed_company", 13, { No: [fatcaBox(202.2, 582.7)], Yes: [fatcaBox(202.2, 595.6)] }, { optional: true });
text("stock_exchange_name", "typed", 13, 300, 617.8, 268);
tick("related_entity_of_listed_company", 13, { No: [fatcaBox(202.2, 630.2)], Yes: [fatcaBox(202.2, 643.1)] }, { optional: true });
text("listed_company_name", "typed", 13, 300, 659.2, 270);
tick("listed_company_relation", 13, { Subsidiary: [fatcaBox(267.4, 663.8)], Controlled: [fatcaBox(320.5, 663.8)] }, { optional: true });
text("related_entity_stock_exchange_name", "typed", 13, 300, 678.2, 268);
tick("active_nfe", 13, { No: [fatcaBox(202.2, 687.2)], Yes: [fatcaBox(202.2, 700.1)] }, { optional: true });
text("active_nfe_subcategory", "typed", 13, 346, 718.5, 68);
tick("passive_nfe", 13, { No: [fatcaBox(202.2, 728.2)], Yes: [fatcaBox(202.2, 741.1)] }, { optional: true });
text("passive_nfe_nature_of_business", "typed", 13, 330, 747, 238);

// ---------- Page 14: controlling persons of a passive NFE (rows 1-3), place and date ----------
const CONTROLLING_PERSON_COLUMNS = ["name", "tax_identification_number", "place_of_birth", "tax_residence_country", "occupation_type",
  "nationality", "father_name", "dob", "gender"];
[[92.2, 125.5], [125.5, 156.9], [156.9, 190.1]].forEach(([rowTop, rowBottom], rowIndex) => {
  CONTROLLING_PERSON_COLUMNS.forEach((columnName, columnIndex) => {
    const columnLeft = 31.5 + columnIndex * 60.67;
    cell(`controlling_person_${rowIndex + 1}_${columnName}`, "typed", 14, +(columnLeft + 2).toFixed(1), rowTop + 9, 56.5, rowBottom - 2);
  });
});
boxes("form_date_p14", "copy.form_date", 14, 532.6, [[83.4, 91.9, 8]]);

// ---------- Page 15: non-PAN declaration (only for an entity without a PAN) ----------
// The short "I/ We, ____ is/ are non-resident" gap (113 pt) cannot hold an entity name: left for the hand (ignoredBlanks).
text("non_pan_declarant_name", "typed", 15, 42, 325.6, 343, {
  alsoAt: [{ page: 15, x: 311, y: 232.2, fontSize: 8, maxWidth: 258 }, { page: 15, x: 102, y: 365.2, fontSize: 8, maxWidth: 468 }],
});
text("non_pan_tax_residence_country", "typed", 15, 131, 159.6, 63);
text("non_pan_email", "typed", 15, 311, 247.7, 258);
text("non_pan_contact_number", "typed", 15, 311, 263.2, 258);
text("non_pan_address", "typed", 15, 311, 278.7, 258, { fontSize: 7 });
text("non_pan_tax_identification_number", "typed", 15, 311, 294.2, 258);
text("non_pan_unique_identification_number", "typed", 15, 311, 309.7, 258);
text("non_pan_place", "typed", 15, 102, 396.2, 468);
text("non_pan_date", "typed", 15, 102, 411.7, 468);

// ---------- Page 16: CKYC form for the legal entity ----------
boxes("entity_legal_name_p16", "copy.entity_legal_name", 16, 186.9, [[27.7, 530.1, 44]], { keepAll: true });
boxes("entity_constitution_code", "typed", 16, 218.5, [[140.8, 12.1, 1]]);
boxes("entity_incorporation_date_p16", "copy.entity_incorporation_date", 16, 234.5, [[140.8, 91.9, 8]]);
boxes("business_commencement_date", "typed", 16, 234.5, [[464.4, 91.9, 8]]);
boxes("entity_place_of_incorporation_p16", "copy.entity_place_of_incorporation", 16, 250.7, [[140.8, 120.2, 10]], { keepAll: true });
boxes("entity_incorporation_country_code", "typed", 16, 250.7, [[389.0, 24.1, 2]]);
boxes("tin_issuing_country_code", "typed", 16, 250.7, [[532.1, 24.2, 2]]);
boxes("entity_pan_p16", "copy.entity_pan", 16, 266.1, [[140.8, 120.2, 10]]);
text("entity_tin_gst_number", "typed", 16, 143, 280.7, 260);
boxes("entity_ckyc_address_line_1", "typed", 16, 422.9, [[26.7, 541.5, 45]], { keepAll: true });
boxes("entity_ckyc_address_line_2", "typed", 16, 438.5, [[26.9, 541.5, 45]], { keepAll: true });
boxes("entity_address_city_p16", "copy.entity_address_city", 16, 454.8, [[447.7, 120.6, 10]], { keepAll: true });
boxes("entity_address_district", "typed", 16, 471.8, [[51.7, 144.2, 12]], { keepAll: true });
boxes("entity_address_postcode_p16", "copy.entity_address_postcode", 16, 471.8, [[265.7, 72.1, 6]]);
boxes("entity_address_state_code", "typed", 16, 471.9, [[420.1, 23.9, 2]]);
boxes("entity_address_country_code", "typed", 16, 471.9, [[544.2, 23.9, 2]]);
boxes("india_address_line_1", "typed", 16, 507.2, [[26.7, 541.5, 45]], { keepAll: true });
boxes("india_address_line_2", "typed", 16, 522.9, [[26.9, 541.5, 45]], { keepAll: true });
boxes("india_address_city", "typed", 16, 539.1, [[447.7, 120.6, 10]], { keepAll: true });
boxes("india_address_district", "typed", 16, 556.1, [[51.7, 144.2, 12]], { keepAll: true });
boxes("india_address_pincode", "typed", 16, 556.1, [[265.7, 72.1, 6]]);
boxes("india_address_state_code", "typed", 16, 556.2, [[420.1, 23.9, 2]]);
boxes("india_address_country_code", "typed", 16, 556.2, [[544.2, 23.9, 2]]);
boxes("telephone_p16", "copy.telephone", 16, 595.9, [[57.4, 48.0, 4], [112.4, 96.3, 8]]);
boxes("fax_p16", "copy.fax", 16, 595.9, [[244.6, 48.0, 4], [299.6, 96.4, 8]]);
boxes("mobile_p16", "copy.mobile", 16, 612.2, [[53.4, 144.7, 12]]);
boxes("email_p16", "copy.email", 16, 612.2, [[255.4, 288.8, 24]], { keepAll: true, fontSize: 7.5 });
boxes("alternate_email_p16", "copy.alternate_email", 16, 627.4, [[255.3, 288.8, 24]], { keepAll: true, fontSize: 7.5 });
boxes("number_of_related_persons", "typed", 16, 648.6, [[306.2, 20.3, 2]]);

// ---------- Page 17: CKYC declaration - date and place ----------
boxes("form_date_p17", "copy.form_date", 17, 147.4, [[57.5, 92.0, 8]]);
boxes("place_p17", "copy.place", 17, 148.4, [[206.1, 149.0, 13]], { keepAll: true });

// ---------- Page 22: CKYC related person (Annexure A2) - the authorised signatory, from their KYC documents ----------
tick("related_person_type", 22, {
  Director: [small(102.7, 214.1)], Promoter: [small(151.4, 213.1)], Karta: [small(198.1, 215.7)], Trustee: [small(235.9, 214.7)],
  Partner: [small(280.0, 214.7)], "Court Appointment Official": [small(325.9, 215.7)], Proprietor: [small(427.5, 215.4)],
  Beneficiary: [small(102.7, 227.0)], "Authorised Signatory": [small(151.4, 227.0)], "Beneficial Owner": [small(228.1, 228.6)],
  "Power of Attorney Holder": [small(295.9, 228.6)], Other: [small(397.5, 228.6)],
});
text("related_person_din", "typed", 22, 142, 248, 154);
boxes("related_person_prefix", "typed", 22, 291.8, [[24.2, 36.1, 3]], { keepAll: true });
boxes("related_person_first_name", "document.name|givenName|upper", 22, 291.8, [[77.7, 180.9, 15]], { keepAll: true });
boxes("related_person_middle_name", "document.name|middleNames|upper", 22, 291.8, [[258.6, 205.0, 17]], { keepAll: true });
boxes("related_person_last_name", "document.name|surname|upper", 22, 291.8, [[463.6, 96.3, 8]], { keepAll: true });
boxes("related_person_father_spouse_name", "typed", 22, 327.3, [[77.7, 482.2, 40]], { keepAll: true });
boxes("related_person_dob", "document.dob", 22, 362.4, [[77.8, 91.9, 8]]);
tick("related_person_gender", 22, { Male: [small(131.6, 370.1)], Female: [small(220.4, 370.1)], Transgender: [small(318.6, 370.8)] });
tick("related_person_nationality", 22, { Indian: [small(131.6, 380.3)], Other: [small(220.4, 380.3)] });
boxes("related_person_pan", "document.pan", 22, 399.9, [[77.7, 120.2, 10]]);
tick("related_person_identity_proof", 22, {
  Passport: [small(24.2, 439.6)], "Voter ID card": [small(24.2, 454.8)], "Driving licence": [small(24.2, 471.5)],
  "NREGA job card": [small(24.2, 486.4)], "National Population Register letter": [small(24.2, 503.0)],
  "Proof of possession of Aadhaar": [small(24.2, 517.4)], "E-KYC authentication": [small(24.2, 530.9)],
  "Offline verification of Aadhaar": [small(24.2, 544.8)],
});
boxes("related_person_passport", "document.passport", 22, 446.8, [[105.7, 96.2, 8]], { keepAll: true });
boxes("related_person_driving_licence", "document.dl", 22, 477.7, [[105.7, 180.5, 15]]);
boxes("related_person_address_line_1", "document.address|withoutCareOf|addressLine1|upper", 22, 574.7, [[24.7, 541.5, 45]], { keepAll: true });
boxes("related_person_address_line_2", "document.address|withoutCareOf|addressLine2|upper", 22, 590.4, [[24.9, 541.5, 45]], { keepAll: true });
boxes("related_person_city", "document.city|upper", 22, 606.6, [[445.7, 120.5, 10]], { keepAll: true });
boxes("related_person_district", "typed", 22, 623.6, [[49.6, 144.3, 12]], { keepAll: true });
boxes("related_person_pincode", "document.pincode", 22, 623.6, [[263.6, 72.1, 6]]);
boxes("related_person_state_code", "typed", 22, 623.7, [[418.0, 23.9, 2]]);
boxes("related_person_country_code", "typed", 22, 623.7, [[542.2, 23.9, 2]]);
tick("related_person_current_address_same", 22, { "Same as above": [small(24.5, 655.3)] }, { optional: true });

// ---------- Page 23: related person contact, declaration date and place ----------
boxes("related_person_mobile", "typed", 23, 133.9, [[422.1, 24.1, 2], [450.2, 120.5, 10]]);
boxes("related_person_email", "typed", 23, 150.2, [[62.6, 288.8, 24]], { keepAll: true, fontSize: 7.5 });
boxes("form_date_p23", "copy.form_date", 23, 237.3, [[57.5, 92.0, 8]]);
boxes("place_p23", "copy.place", 23, 238.3, [[206.1, 149.0, 13]], { keepAll: true });

// ---------- Form files ----------
const SEAL_BOX_HEIGHT = 70.3;
const configuration = {
  _about: "ABSL Emerging Market Equity Fund (GIFT IFSC) application form for non-individuals, 23 pages; written by tools/form-building/make_absl_non_individual.mjs. Pages 1-8: scheme information, terms, guidelines and checklist; 9-11 application, investment, bank, declarations; 12 UBO declaration; 13-14 FATCA/CRS for entities; 15 non-PAN declaration (typed, only if the entity has no PAN); 16-17 CKYC form for the entity; 18 and 21 code lists and instructions; 19-20 CKYC Annexure A1 (related person of an individual: guardian / assignee) left blank; 22-23 CKYC Annexure A2 (related person of the entity: the authorised signatory, from their KYC documents).",
  id: FORM_ID, title: TITLE, labels: [],
  signatureBoxes: [
    { page: 11, x: 15, y: 565, w: 186, h: SEAL_BOX_HEIGHT - 1, signer: "entity", label: "Authorised signatory 1 (with seal)" },
    { page: 11, x: 203, y: 565, w: 182, h: SEAL_BOX_HEIGHT - 1, signer: "entity", label: "Authorised signatory 2 (with seal)" },
    { page: 11, x: 387, y: 565, w: 188, h: SEAL_BOX_HEIGHT - 1, signer: "entity", label: "Authorised signatory 3 (with seal)" },
    { page: 14, x: 18, y: 432, w: 186, h: SEAL_BOX_HEIGHT - 1, signer: "entity", label: "FATCA / CRS - authorised signatory 1" },
    { page: 14, x: 206, y: 432, w: 182, h: SEAL_BOX_HEIGHT - 1, signer: "entity", label: "FATCA / CRS - authorised signatory 2" },
    { page: 14, x: 390, y: 432, w: 188, h: SEAL_BOX_HEIGHT - 1, signer: "entity", label: "FATCA / CRS - authorised signatory 3" },
    { page: 17, x: 420, y: 90, w: 146, h: 56, signer: "entity", label: "CKYC - authorised person(s)" },
    { page: 23, x: 420, y: 180, w: 146, h: 56, signer: "entity", label: "CKYC related person - applicant" },
  ],
  tickboxes,
  ignoredBlanks: [
    { page: 15, y: 113, why: "Non-PAN \"I/ We, ____ is/ are non-resident\": too short for an entity name, which is printed in the table and the declaration below" },
    { page: 9, y: 300, why: "\"Others (e.g. OCI)\" in the individual / minor / others row: this form is for non-individuals" },
  ],
  blankFileName: BLANK, nomineeHeaderRe: null, tickboxRule: "usual",
};

const section = (key, label, keys) => ({ key, label, fields: keys });
const keysStartingWith = (prefix) => Object.keys(sources).filter((key) => key.startsWith(prefix));
const rules = {
  _about: "Form-level rules. The investor is an entity: its details come from the Excel. The KYC documents are the authorised signatory's (CKYC related person, page 22).",
  formId: FORM_ID, group: "GIFT City", label: "GIFT – ABSL Emerging Market Equity Fund – Non-individual application", shortLabel: "ABSL EM non-individual",
  purpose: "New investment · companies, trusts and other entities", blankFileName: BLANK,
  keyFields: ["Entity name", "Entity PAN", "Investment amount", "Plan"], sheetTabName: "ABSL EM non-individual",
  detectionPhrases: ["ABSL Emerging Market Equity Fund", "Application Form for Non Individuals"],
  supportedNomineeCount: 1, personLabel: "Authorised signatory",
  identityType: { scope: "shared", tickboxField: null, numberField: null, optionByIdentityKind: {}, numberFieldByIdentityKind: {} },
  reviewSections: [
    section("entity", "Page 9 · Entity", ["investor_category", "entity_constitution", "entity_constitution_other", "entity_legal_name", "entity_incorporation_date", "entity_registration_number", "entity_pan", "entity_ckyc_number"]),
    section("address", "Page 9 · Addresses", [...keysStartingWith("entity_address_").filter((key) => !key.endsWith("_p16")), ...keysStartingWith("entity_mailing_")]),
    section("contact", "Page 9 · Contact person, POA, PEP", [...keysStartingWith("contact_person_"), "telephone", "mobile", "fax", "email", "alternate_email", ...keysStartingWith("poa_holder_"), "pep_status"]),
    section("distributor", "Page 9 · Distributor, RM, existing folio", ["distributor_name", "distributor_code", "distributor_email", "distributor_rm_name", "distributor_rm_contact", "rm_name", "rm_branch", "rm_email", "rm_contact", "existing_unitholder_name", "folio_no"]),
    section("investment", "Page 10 · Investment and bank", ["plan_class", "subscription_amount", "subscription_amount_words", "account_number", "account_type", "bank_name", "bank_city", "bank_state", "bank_postcode", "bank_country", "ifsc_code", "swift_code"]),
    section("payout", "Page 10 · Payout bank", keysStartingWith("payout_")),
    section("signature", "Pages 11, 14, 17, 23 · Place and date", ["place", "form_date", "form_date_p14", "form_date_p17", "place_p17", "form_date_p23", "place_p23"]),
    section("ubo", "Page 12 · Beneficial owners", keysStartingWith("ubo_")),
    section("fatca", "Page 13 · FATCA / CRS", ["entity_pan_p13", "entity_incorporation_date_p13", "entity_legal_name_p13", "kyc_address_type", "entity_place_of_incorporation", "entity_country_of_incorporation", "gross_annual_income", "net_worth_usd_million", "net_worth_date", "entity_restricted_services", "entity_tax_resident_outside_india", ...keysStartingWith("entity_tax_"), "entity_us_exemption"]),
    section("fatca-parts", "Page 13 · FATCA parts B and C", ["fatca_part_b_status", "entity_giin", "sponsoring_entity_name", "giin_not_available_reason", "giin_exemption_subcategory_code", "listed_company", "stock_exchange_name", "related_entity_of_listed_company", "listed_company_name", "listed_company_relation", "related_entity_stock_exchange_name", "active_nfe", "active_nfe_subcategory", "passive_nfe", "passive_nfe_nature_of_business"]),
    section("controlling", "Page 14 · Controlling persons (passive NFE)", keysStartingWith("controlling_person_")),
    section("non-pan", "Page 15 · Non-PAN declaration (only without a PAN)", keysStartingWith("non_pan_")),
    section("ckyc", "Page 16 · CKYC entity", ["entity_legal_name_p16", "entity_constitution_code", "entity_incorporation_date_p16", "business_commencement_date", "entity_place_of_incorporation_p16", "entity_incorporation_country_code", "tin_issuing_country_code", "entity_pan_p16", "entity_tin_gst_number", "entity_ckyc_address_line_1", "entity_ckyc_address_line_2", "entity_address_city_p16", "entity_address_district", "entity_address_postcode_p16", "entity_address_state_code", "entity_address_country_code", ...keysStartingWith("india_address_"), "telephone_p16", "fax_p16", "mobile_p16", "email_p16", "alternate_email_p16", "number_of_related_persons"]),
    section("related-person", "Pages 22-23 · Authorised signatory (KYC)", keysStartingWith("related_person_")),
  ],
};

// Every field in exactly one review section (a key listed twice by the filters above is kept in its first section).
const listedKeys = new Set();
for (const reviewSection of rules.reviewSections) {
  reviewSection.fields = reviewSection.fields.filter((key) => !listedKeys.has(key) && listedKeys.add(key));
}
const unlistedKeys = Object.keys(sources).filter((key) => !listedKeys.has(key));
if (unlistedKeys.length) throw new Error(`fields in no review section: ${unlistedKeys.join(", ")}`);

const write = (name, data) => writeFileSync(path.join(FOLDER, name), `${JSON.stringify(data, null, 2)}\n`);
mkdirSync(FOLDER, { recursive: true });
write("form-configuration.json", configuration);
write("field-positions.json", { _about: "Where each value is written on the blank (top-left origin, y = baseline). combs = one character per printed box. Written by make_absl_non_individual.mjs.", formId: FORM_ID, title: TITLE, fields });
write("field-sources.json", { _about: "No GIFT City field sheet: sources follow the VCC subscription forms. The entity's details are typed in the Excel; the authorised signatory's name, date of birth, PAN, passport, licence and address (CKYC related person, page 22) come from their KYC documents. Copies (\"copy.X\") repeat a value on later pages. Written by make_absl_non_individual.mjs.", fieldSources: sources });
write("form-rules.json", rules);
write("required-fields.json", { _about: "Fields that must be filled before a case can be confirmed.", requiredFields: ["entity_legal_name", "entity_constitution", "entity_pan", "plan_class", "subscription_amount", "account_number", "bank_name", "swift_code", "related_person_first_name", "related_person_last_name"] });
console.log(`${FORM_ID}: ${fields.length} fields, ${tickboxes.length} tick boxes`);
