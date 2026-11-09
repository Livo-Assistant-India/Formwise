// Writes the ABSL Emerging Market Equity Fund (GIFT) application form for individuals: 5 JSON files in
// apps/backend/src/forms/gift-city/gift-absl-em-equity-individual/. Positions were measured on the blank with
// tools/form-building/boxes.py and measure.py (top-left origin, y = text baseline).
// usage: node tools/form-building/make_absl_individual.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FORM_ID = "gift-absl-em-equity-individual";
const TITLE = "ABSL Emerging Market Equity Fund - Application Form for Individuals";
const BLANK = "ABSL Emerging Market Equity Fund - Application Form for Individuals.pdf";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const FOLDER = path.join(ROOT, "apps/backend/src/forms/gift-city", FORM_ID);

const fields = [];
const sources = {};
const tickboxes = [];

/** A text field. */
function text(key, source, page, x, y, maxWidth, extra = {}) {
  fields.push({ key, nominee: null, page, x, y, fontSize: extra.fontSize || 9, type: "text", maxWidth, ...extra });
  sources[key] = source;
}

/** One character per printed box: groups = [[left x, group width, box count], ...]. */
function boxes(key, source, page, y, groups, { keepAll = false, fontSize = 8 } = {}) {
  fields.push({ key, nominee: null, page, x: groups[0][0], y, fontSize, type: "text", combs: groups, ...(keepAll ? { combKeepAll: true } : {}) });
  sources[key] = source;
}

/** Tick boxes. One common size (9 x 9) centred in each printed box; the engine takes y = the box's bottom edge. */
const TICK = 9;
const onLargeBox = (x, y, page) => ({ x: +(x + (11.4 - TICK) / 2).toFixed(1), y: +(y + 10.7 - (10.7 - TICK) / 2).toFixed(1), ...(page ? { page } : {}) });
const onSmallBox = (x, y, page) => ({ x: +(x + (7 - TICK) / 2).toFixed(1), y: +(y + 7 + (TICK - 7) / 2).toFixed(1), ...(page ? { page } : {}) });
function tick(key, page, boxesByOption, { optional = false } = {}) {
  tickboxes.push({ key, page, w: TICK, h: TICK, options: Object.keys(boxesByOption), boxesByOption, ...(optional ? { isOptional: true } : {}) });
  sources[key] = "tick";
}

// ---------- Page 9: distributor, existing unitholder, general information, holders, addresses, contact ----------
boxes("distributor_name", "typed", 9, 103, [[124.9, 440.0, 30]], { keepAll: true });
boxes("distributor_code", "typed", 9, 124, [[81.9, 190.7, 13]], { keepAll: true });
text("distributor_email", "typed", 9, 413, 124, 147);
text("distributor_rm_name", "typed", 9, 97, 145, 228);
text("distributor_rm_contact", "typed", 9, 434, 145, 126);
text("rm_name", "typed", 9, 53, 176.5, 272);
text("rm_branch", "typed", 9, 367, 176.5, 193);
text("rm_email", "typed", 9, 53, 196.3, 272);
text("rm_contact", "typed", 9, 383, 196.3, 177);
boxes("existing_unitholder_name", "typed", 9, 242.3, [[46.4, 440.1, 30]], { keepAll: true });
boxes("folio_no", "typed", 9, 259.5, [[52.1, 176.1, 12]], { keepAll: true });
tick("investor_category", 9, { Individual: [onLargeBox(183.3, 273.3)], Minor: [onLargeBox(269.9, 274.3)], Others: [onLargeBox(339.4, 274.3)] });
text("investor_category_other", "typed", 9, 480, 280.5, 92);
tick("residential_status", 9, {
  "Resident Indian": [onLargeBox(91.1, 291.9), onSmallBox(121.3, 310.6, 17)],
  "Non-Resident Indian": [onLargeBox(180.8, 291.9), onSmallBox(263.6, 310.6, 17)],
  "Foreign National": [onLargeBox(289.0, 291.9), onSmallBox(121.3, 321.3, 17)],
});
tick("holding_mode", 9, { Single: [onLargeBox(192.7, 311.9)], Joint: [onLargeBox(320.8, 311.9)], "Anyone or Survivor": [onLargeBox(438.4, 311.9)] });
boxes("subscriber_name", "document.name|upper", 9, 354.8, [[64.9, 507.0, 34]], { keepAll: true, fontSize: 9 });
boxes("dob", "document.dob", 9, 375, [[64.9, 91.9, 8]]);
tick("gender", 9, {
  Male: [onLargeBox(210.4, 366.5), onSmallBox(121.4, 264.4, 17)],
  Female: [onLargeBox(265.9, 366.5), onSmallBox(263.4, 264.4, 17)],
  Other: [onLargeBox(325.3, 366.5), onSmallBox(347.6, 264.4, 17)],
});
text("id_pan", "document.pan", 9, 53, 395.5, 130);
text("ckyc_number", "typed", 9, 295, 395.5, 272);
boxes("second_holder_name", "typed", 9, 435.5, [[64.9, 507.0, 34]], { keepAll: true, fontSize: 9 });
boxes("second_holder_dob", "typed", 9, 455.8, [[64.9, 91.9, 8]]);
tick("second_holder_gender", 9, { Male: [onLargeBox(210.4, 447.2)], Female: [onLargeBox(265.9, 447.2)], Other: [onLargeBox(325.3, 447.2)] }, { optional: true });
text("second_holder_pan", "typed", 9, 53, 476, 130);
text("second_holder_ckyc_number", "typed", 9, 295, 476, 272);
boxes("guardian_name", "typed", 9, 517.3, [[64.9, 507.0, 34]], { keepAll: true, fontSize: 9 });
text("guardian_relationship", "typed", 9, 318, 495.5, 120);
text("guardian_pan", "typed", 9, 53, 558.4, 130);
text("correspondence_street", "document.street|upper", 9, 100, 592.5, 468);
text("city", "document.city|upper", 9, 39, 615.5, 233);
text("state", "document.state|upper", 9, 315, 615.5, 253);
text("pincode", "document.pincode", 9, 69, 638, 203);
text("country", "document.country|upper", 9, 323, 638, 245);
tick("permanent_address_same", 9, { "Same as correspondence": [onLargeBox(272.0, 649.2)] }, { optional: true });
text("permanent_street", "typed", 9, 100, 678, 468);
text("permanent_city", "typed", 9, 39, 701, 233);
text("permanent_state", "typed", 9, 315, 701, 253);
text("permanent_pincode", "typed", 9, 69, 723.5, 203);
text("permanent_country", "typed", 9, 323, 723.5, 245);
boxes("mobile", "typed", 9, 759.8, [[348.9, 176.1, 12]]);
boxes("email", "typed", 9, 802, [[52.0, 473.0, 33]], { keepAll: true });

// ---------- Page 10: KYC details of the first holder, investment, bank ----------
const LARGE = (x, y) => [onLargeBox(x, y)];
tick("gross_annual_income", 10, { "Below 1 Lakh": LARGE(130.3, 41.3), "1-5 Lakh": LARGE(205.7, 41.3), "5-10 Lakh": LARGE(275.2, 41.3), "Above 10 Lakh": LARGE(369.4, 41.3) });
tick("occupation", 10, {
  "Private Sector": LARGE(130.3, 58.7), "Public Sector": LARGE(205.7, 58.7), "Government Service": LARGE(275.2, 58.7),
  Business: LARGE(369.4, 58.7), Student: LARGE(434.0, 58.7), Retired: LARGE(488.3, 58.7), Professional: LARGE(130.3, 75.9),
  Agriculturist: LARGE(205.7, 75.9), "House-Wife": LARGE(275.2, 75.9), "Forex Dealer": LARGE(369.4, 75.9), Others: LARGE(434.0, 75.9),
});
text("occupation_other", "typed", 10, 511, 83, 62, { fontSize: 8 });
text("place_of_work", "typed", 10, 138, 117.4, 432);
text("employer_name", "typed", 10, 86, 132.7, 484);
text("business_nature", "typed", 10, 88, 164.9, 482);
text("business_location", "typed", 10, 93, 180.2, 477);
text("business_countries", "typed", 10, 287, 197.4, 285);
tick("pep_status", 10, { "Politically Exposed Person": LARGE(130.3, 207.1), "Related to Politically Exposed Person": LARGE(275.2, 207.1), "Not Applicable": LARGE(462.2, 207.1) });
tick("source_of_funds", 10, {
  Savings: LARGE(130.3, 224.9), Salary: LARGE(275.2, 225.1), "Business Income": LARGE(462.2, 225.4), "Gift / Inheritance": LARGE(130.3, 242.6),
  Loan: LARGE(275.2, 243.0), "Investment Earnings": LARGE(462.2, 243.0), Others: LARGE(130.3, 260.3),
});
text("source_of_funds_other", "typed", 10, 226, 268, 132, { fontSize: 8 });
text("source_of_wealth", "typed", 10, 80, 284.5, 356);
tick("plan_class", 10, {
  "Direct Plan Class A": [{ x: 154.8, y: 659.5 }],
  "Regular Plan Class B": [{ x: 333.1, y: 659.5 }],
});
text("subscription_amount", "typed", 10, 184, 676, 390);
text("subscription_amount_words", "typed", 10, 184, 692, 390);
boxes("account_number", "typed", 10, 712.5, [[100.7, 283.5, 18]], { keepAll: true });
text("account_type", "typed", 10, 444, 712.3, 128);
text("bank_name", "typed", 10, 104, 731.8, 468);
text("bank_city", "typed", 10, 64, 751.8, 155);
text("bank_state", "typed", 10, 260, 751.8, 312);
text("bank_postcode", "typed", 10, 64, 771.4, 155);
text("bank_country", "typed", 10, 260, 771.4, 312);
text("ifsc_code", "typed", 10, 64, 792.5, 212);
text("swift_code", "typed", 10, 348, 792.5, 224);

// ---------- Page 11: payout bank account, nomination choice ----------
tick("payout_bank_same", 11, { "Same as above": [onLargeBox(23.0, 51.7)] }, { optional: true });
boxes("payout_account_number", "typed", 11, 75, [[102.2, 283.4, 18]], { keepAll: true });
text("payout_account_type", "typed", 11, 445, 74.8, 128);
text("payout_bank_name", "typed", 11, 105, 94.2, 468);
text("payout_bank_city", "typed", 11, 66, 114.2, 154);
text("payout_bank_state", "typed", 11, 262, 114, 312);
text("payout_bank_postcode", "typed", 11, 66, 133.8, 154);
text("payout_bank_country", "typed", 11, 262, 134.5, 312);
text("payout_ifsc_code", "typed", 11, 66, 155, 212);
text("payout_swift_code", "typed", 11, 350, 155.4, 224);
tick("wish_to_nominate", 11, { "Wish to nominate": [onLargeBox(23.0, 190.0)], "Do not wish to nominate": [onLargeBox(165.1, 190.0)] });

// ---------- Page 12 (declarations), 13 (FATCA / CRS), 15 (NRI declaration): place and date ----------
text("place", "typed", 12, 86, 727.5, 330, { alsoAt: [{ page: 15, x: 86, y: 490.5, fontSize: 9, maxWidth: 330 }] });
boxes("form_date", "today", 12, 743.5, [[83.1, 91.9, 8]]);
boxes("form_date_p15", "copy.form_date", 15, 506.5, [[83.1, 91.9, 8]]);
text("place_of_birth", "typed", 13, 156, 74, 205);
text("country_of_birth", "typed", 13, 156, 89.2, 205);
text("citizenship_country", "typed", 13, 156, 104.6, 205);
text("tax_residence_country", "copy.country", 13, 156, 120.7, 205);
text("us_person", "typed", 13, 156, 136, 205);
text("second_holder_place_of_birth", "typed", 13, 369, 74, 205);
text("second_holder_country_of_birth", "typed", 13, 369, 89.2, 205);
text("second_holder_citizenship_country", "typed", 13, 369, 104.6, 205);
text("second_holder_tax_residence_country", "typed", 13, 369, 120.7, 205);
text("second_holder_us_person", "typed", 13, 369, 136, 205);
text("fatca_tin", "typed", 13, 156, 230.1, 205);
text("fatca_tin_issuing_country", "typed", 13, 156, 249.4, 205);
text("subscriber_name_p13", "copy.subscriber_name", 13, 48, 536.4, 300);
text("form_date_p13", "copy.form_date", 13, 45, 554.6, 120);

// ---------- Pages 17-18: Central KYC Registry form ----------
boxes("title", "typed", 17, 199.5, [[121.1, 32.9, 3]], { keepAll: true, fontSize: 7.5 });
boxes("given_name", "document.name|givenName|upper", 17, 199.5, [[165.0, 132.0, 12]], { keepAll: true, fontSize: 7.5 });
boxes("middle_name", "document.name|middleNames|upper", 17, 199.5, [[308.0, 131.9, 12]], { keepAll: true, fontSize: 7.5 });
boxes("surname", "document.name|surname|upper", 17, 199.5, [[450.9, 131.6, 12]], { keepAll: true, fontSize: 7.5 });
// Father / spouse and mother: first, middle and last name each in its own group of 12 boxes (typed).
for (const [person, y] of [["father_spouse", 227.3], ["mother", 241.3]]) {
  boxes(`${person}_first_name`, "typed", 17, y, [[165.0, 132.0, 12]], { keepAll: true, fontSize: 7.5 });
  boxes(`${person}_middle_name`, "typed", 17, y, [[308.0, 131.9, 12]], { keepAll: true, fontSize: 7.5 });
  boxes(`${person}_last_name`, "typed", 17, y, [[450.9, 131.6, 12]], { keepAll: true, fontSize: 7.5 });
}
boxes("dob_p17", "copy.dob", 17, 256, [[121.1, 22.1, 2], [154.0, 21.9, 2], [186.7, 44.1, 4]], { fontSize: 7.5 });
const SMALL = (x, y) => [onSmallBox(x, y)];
tick("marital_status", 17, { Married: SMALL(121.4, 279.0), Unmarried: SMALL(263.6, 279.0), Others: SMALL(347.6, 279.0) });
tick("citizenship", 17, { "IN - Indian": SMALL(121.4, 293.4), Others: SMALL(263.8, 293.3) });
boxes("citizenship_country_code", "typed", 17, 299.5, [[401.8, 22.0, 2]], { fontSize: 7.5 });
boxes("place_of_birth_p17", "copy.place_of_birth", 17, 459.7, [[121.1, 131.7, 12]], { keepAll: true, fontSize: 7.5 });
tick("proof_of_identity", 17, { Passport: SMALL(13.3, 511.5), "PAN Card": SMALL(13.3, 540.6) });
boxes("id_passport", "document.passport", 17, 519.2, [[121.1, 87.7, 8]], { fontSize: 7.5 });
boxes("id_pan_p17", "copy.id_pan", 17, 547.2, [[121.1, 109.7, 10]], { fontSize: 7.5 });
tick("address_type", 17, {
  "Residential / Business": SMALL(98.2, 675.7), Residential: SMALL(225.3, 675.7), Business: SMALL(325.4, 675.7),
  "Registered Office": SMALL(411.4, 675.7), Unspecified: SMALL(523.5, 675.7),
});
tick("proof_of_address", 17, {
  Passport: SMALL(98.2, 689.7), "Driving Licence": SMALL(225.3, 689.7), "UID (Aadhaar)": SMALL(325.4, 689.7),
  "Voter Identity Card": SMALL(98.2, 699.7), "NREGA Job Card": SMALL(225.3, 699.7), Others: SMALL(325.4, 699.7),
});
boxes("residence_address_line1", "document.address|withoutCareOf|addressLine1|upper", 17, 737.4, [[63.0, 516.3, 47]], { keepAll: true, fontSize: 7.5 });
boxes("residence_address_line2", "document.address|withoutCareOf|addressLine2|upper", 17, 750.1, [[63.0, 516.3, 47]], { keepAll: true, fontSize: 7.5 });
boxes("city_p17", "copy.city", 17, 763.4, [[469.4, 109.8, 10]], { keepAll: true, fontSize: 7.5 });
boxes("district", "copy.city", 17, 776.4, [[63.4, 109.8, 10]], { keepAll: true, fontSize: 7.5 });
boxes("pincode_p17", "copy.pincode", 17, 776.3, [[260.7, 65.9, 6]], { fontSize: 7.5 });
boxes("state_code", "typed", 17, 776.3, [[415.8, 22.0, 2]], { fontSize: 7.5 });
boxes("country_code", "typed", 17, 776.4, [[557.4, 22.0, 2]], { fontSize: 7.5 });
tick("correspondence_address_same", 18, { "Same as current address": SMALL(18.4, 30.4) }, { optional: true });
boxes("mobile_p18", "copy.mobile", 18, 220.1, [[442.8, 21.9, 2], [473.8, 110.0, 10]], { fontSize: 7.5 });
boxes("email_p18", "copy.email", 18, 233.2, [[264.1, 319.1, 29]], { keepAll: true, fontSize: 7.5 });
boxes("form_date_p18", "copy.form_date", 18, 595.3, [[49.3, 22.1, 2], [82.2, 21.9, 2], [115.0, 44.0, 4]], { fontSize: 7.5 });
boxes("place_p18", "copy.place", 18, 594.3, [[227.3, 131.7, 12]], { keepAll: true, fontSize: 7.5 });

// ---------- Form files ----------
const configuration = {
  _about: "ABSL Emerging Market Equity Fund (GIFT IFSC) application form for individuals, 20 pages; written by tools/form-building/make_absl_individual.mjs. Pages 1-8 are scheme information, terms and the checklist; 9-13 the application, declarations and FATCA/CRS; 15 the NRI declaration; 16 the non-PAN declaration (only for investors without a PAN, left blank); 17-18 the CKYC form; 19-20 instructions.",
  id: FORM_ID, title: TITLE, labels: [],
  signatureBoxes: [
    { page: 12, x: 20, y: 683, w: 180, h: 24, signer: "subscriber", label: "First holder signature" },
    { page: 13, x: 70, y: 503, w: 300, h: 14, signer: "subscriber", label: "FATCA / CRS signature" },
    { page: 15, x: 18, y: 422, w: 185, h: 50, signer: "subscriber", label: "NRI declaration - first holder" },
    { page: 18, x: 430, y: 556, w: 150, h: 34, signer: "subscriber", label: "CKYC applicant signature" },
  ],
  tickboxes,
  ignoredBlanks: [
    { page: 15, y: 330, why: "\"We have contacted ____\": only if the investor approached someone; written by hand" },
    { page: 16, y: 111, why: "Non-PAN declaration: only for non-residents without a PAN" },
    { page: 16, y: 149, why: "Non-PAN declaration: only for non-residents without a PAN" },
    { page: 16, y: 315, why: "Non-PAN declaration: only for non-residents without a PAN" },
  ],
  blankFileName: BLANK, nomineeHeaderRe: null, tickboxRule: "usual",
};

const section = (key, label, keys) => ({ key, label, fields: keys });
const rules = {
  _about: "Form-level rules. One investor (first holder); second holder, guardian, distributor and bank details come from the Excel.",
  formId: FORM_ID, group: "GIFT City", label: "GIFT – ABSL Emerging Market Equity Fund – Individual application", shortLabel: "ABSL EM individual",
  purpose: "New investment · individual investors", blankFileName: BLANK,
  keyFields: ["Investor name", "PAN", "Investment amount", "Plan"], sheetTabName: "ABSL EM individual",
  detectionPhrases: ["ABSL Emerging Market Equity Fund", "Application Form for Individuals"],
  supportedNomineeCount: 1, personLabel: "Investor",
  identityType: { scope: "shared", tickboxField: null, numberField: null, optionByIdentityKind: {}, numberFieldByIdentityKind: {} },
  reviewSections: [
    section("investor", "Page 9 · Investor", ["investor_category", "investor_category_other", "residential_status", "holding_mode", "subscriber_name", "dob", "gender", "id_pan", "ckyc_number"]),
    section("address", "Page 9 · Address and contact", ["correspondence_street", "city", "state", "pincode", "country", "permanent_address_same", "permanent_street", "permanent_city", "permanent_state", "permanent_pincode", "permanent_country", "mobile", "email"]),
    section("joint", "Page 9 · Second holder and guardian", ["second_holder_name", "second_holder_dob", "second_holder_gender", "second_holder_pan", "second_holder_ckyc_number", "guardian_name", "guardian_relationship", "guardian_pan"]),
    section("distributor", "Page 9 · Distributor, RM, existing folio", ["distributor_name", "distributor_code", "distributor_email", "distributor_rm_name", "distributor_rm_contact", "rm_name", "rm_branch", "rm_email", "rm_contact", "existing_unitholder_name", "folio_no"]),
    section("kyc", "Page 10 · KYC details", ["gross_annual_income", "occupation", "occupation_other", "place_of_work", "employer_name", "business_nature", "business_location", "business_countries", "pep_status", "source_of_funds", "source_of_funds_other", "source_of_wealth"]),
    section("investment", "Page 10 · Investment and bank", ["plan_class", "subscription_amount", "subscription_amount_words", "account_number", "account_type", "bank_name", "bank_city", "bank_state", "bank_postcode", "bank_country", "ifsc_code", "swift_code"]),
    section("payout", "Page 11 · Payout bank and nomination", ["payout_bank_same", "payout_account_number", "payout_account_type", "payout_bank_name", "payout_bank_city", "payout_bank_state", "payout_bank_postcode", "payout_bank_country", "payout_ifsc_code", "payout_swift_code", "wish_to_nominate"]),
    section("fatca", "Pages 12-15 · FATCA / CRS, place and date", ["place_of_birth", "country_of_birth", "citizenship_country", "tax_residence_country", "us_person", "second_holder_place_of_birth", "second_holder_country_of_birth", "second_holder_citizenship_country", "second_holder_tax_residence_country", "second_holder_us_person", "fatca_tin", "fatca_tin_issuing_country", "subscriber_name_p13", "place", "form_date", "form_date_p13", "form_date_p15"]),
    section("ckyc", "Pages 17-18 · CKYC form", ["title", "given_name", "middle_name", "surname", "father_spouse_first_name", "father_spouse_middle_name", "father_spouse_last_name", "mother_first_name", "mother_middle_name", "mother_last_name", "dob_p17", "marital_status", "citizenship", "citizenship_country_code", "place_of_birth_p17", "proof_of_identity", "id_passport", "id_pan_p17", "address_type", "proof_of_address", "residence_address_line1", "residence_address_line2", "city_p17", "district", "pincode_p17", "state_code", "country_code", "correspondence_address_same", "mobile_p18", "email_p18", "form_date_p18", "place_p18"]),
  ],
};

const write = (name, data) => writeFileSync(path.join(FOLDER, name), `${JSON.stringify(data, null, 2)}\n`);
mkdirSync(FOLDER, { recursive: true });
write("form-configuration.json", configuration);
write("field-positions.json", { _about: "Where each value is written on the blank (top-left origin, y = baseline). combs = one character per printed box. Written by make_absl_individual.mjs.", formId: FORM_ID, title: TITLE, fields });
write("field-sources.json", { _about: "No GIFT City field sheet: sources follow the VCC subscription forms (name, DOB, PAN, passport and address from KYC documents; everything else typed in the Excel). Written by make_absl_individual.mjs.", fieldSources: sources });
write("form-rules.json", rules);
write("required-fields.json", { _about: "Fields that must be filled before a case can be confirmed.", requiredFields: ["subscriber_name", "id_pan", "residential_status", "plan_class", "subscription_amount"] });
console.log(`${FORM_ID}: ${fields.length} fields, ${tickboxes.length} tick boxes`);
