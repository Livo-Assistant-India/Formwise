// Writes the Ashoka WhiteOak Global Emerging Markets ex India GIFT Fund application form (76 pages): application for
// individuals (pages 5-9), accredited investor declaration (17-18), Contribution Agreement (19-72), Annexure A (73) and
// the FME commitment waiver (74). The source PDF is an editable form; make_gift_whiteoak_blank.py removed its widgets
// and recorded their rects (gift-whiteoak-widgets.json). Single-line spots below use those rects; the printed
// one-character boxes were measured with scan_boxes.py (threshold 235). Sources follow the GIFT feeder forms: the first
// holder's name, date of birth, PAN and address from the KYC documents, everything else typed (Excel); the second
// holder is typed; tick boxes are answered per client, never assumed. Change this file, never the generated folder.
// usage (from the repo root): python -I tools/form-building/make_gift_whiteoak_blank.py, then
//                             node tools/form-building/make_gift_whiteoak_application.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { comb, multiline, text, tick } from "./gift-feeder-application-pages.mjs";

const FORM_ID = "gift-whiteoak-em-application";
const FUND_NAME = "Ashoka WhiteOak Global Emerging Markets ex India GIFT Fund";
const BLANK_FILE_NAME = "WhiteOak Global EM ex India GIFT Fund - Application Form.pdf";
const FOLDER = `apps/backend/src/forms/gift-city/${FORM_ID}`;

/** A value written inside a widget's rect [x0, top, x1, bottom], on its bottom line. */
function inRect(key, page, [x0, top, x1, bottom], source, { fontSize, section } = {}) {
  return text(key, page, x0 + 2, Math.round((bottom - 3.5) * 10) / 10, Math.round(x1 - x0 - 4), source, { fontSize: fontSize || (bottom - top < 13 ? 7 : 8), section });
}

/** Page 5: distributor, first holder, contact, status, occupation, income and PEP. */
function firstHolderPage() {
  const d = { section: "distributor" }, s = { section: "applicant" }, c = { section: "contact" }, k = { section: "kyc" };
  const cell = (key, x0, x1) => multiline(key, 5, x0 + 3, 124, x1 - x0 - 6, 156, "typed", { fontSize: 7, ...d });
  const row = (top) => (x) => [x, top];
  const occupation = (first, second, xs) => ({
    "Private Sector": [xs[0], first], "Public Sector": [xs[1], first], "Government Service": [xs[2], first], Business: [xs[3], first],
    Student: [xs[4], first], Retired: [xs[5], first], Professional: [xs[6], second], Agriculturist: [xs[7], second],
    "House Wife": [xs[8], second], "Forex Dealer": [xs[9], second], Others: [xs[10], second] });
  const at = row(456.5);
  return [
    cell("distributor_name_code", 23.5, 161.1), cell("rm_name_contact", 161.1, 298.5), cell("rm_email", 298.5, 436.1), cell("distributor_email", 436.1, 573.6),
    comb("subscriber_name", 5, 216.3, 77.7, 35, "document.name|upper", { pitch: 14.14, keepAll: true, ...s }),
    comb("tax_reference_number", 5, 236.0, 78.0, 10, "document.pan", { pitch: 14.17, ...s }),
    comb("ckyc_number", 5, 234.3, 374.7, 14, "typed", { pitch: 14.16, ...s }),
    comb("dob", 5, 256.0, 78.0, 8, "document.dob", { pitch: 14.16, ...s }),
    comb("std_code", 5, 384.3, 113.0, 8, "typed", { pitch: 14.12, ...c }),
    comb("mobile", 5, 384.3, 311.7, 12, "typed", { pitch: 14.13, ...c }),
    comb("landline", 5, 404.3, 113.0, 8, "typed", { pitch: 14.12, ...c }),
    comb("office_phone", 5, 402.7, 311.7, 12, "typed", { pitch: 14.13, ...c }),
    comb("email", 5, 423.3, 76.0, 35, "typed", { pitch: 14.13, keepAll: true, ...c }),
    comb("alternate_email", 5, 441.3, 76.0, 35, "typed", { pitch: 14.13, keepAll: true, ...c }),
    tick("residential_status", 5, 14.9, { RI: at(134.1), NRI: [217.1, 457.5], Company: [290.8, 457.5], Minor: [393.3, 457.5], Trust: [520.3, 457.5],
      "FPI / FII": [134.1, 477.0], "Partnership LLP": [216.2, 477.0], Others: [325.3, 477.0] }, s),
    inRect("residential_status_other", 5, [443.0, 474.7, 569.5, 488.4], "typed", s),
    tick("occupation", 5, 14.9, occupation(498.4, 518.9, [132.8, 216.2, 290.8, 392.9, 453.1, 522.1, 132.8, 215.3, 290.8, 363.2, 437.0]), k),
    inRect("occupation_other", 5, [531.2, 517.0, 573.4, 530.3], "typed", { fontSize: 6, ...k }),
    comb("place_of_work", 5, 569.0, 160.3, 29, "typed", { pitch: 14.16, keepAll: true, ...k }),
    comb("employer_name", 5, 589.7, 160.3, 29, "typed", { pitch: 14.16, keepAll: true, ...k }),
    comb("business_nature", 5, 618.7, 160.3, 29, "typed", { pitch: 14.16, keepAll: true, ...k }),
    comb("business_location", 5, 636.0, 160.3, 29, "typed", { pitch: 14.16, keepAll: true, ...k }),
    comb("business_countries", 5, 650.3, 160.3, 29, "typed", { pitch: 14.16, keepAll: true, ...k }),
    comb("business_countries_line2", 5, 664.7, 160.3, 29, "typed", { pitch: 14.16, keepAll: true, ...k }),
    tick("gross_annual_income_range", 5, 14.9, { "Below 1 million": [134.9, 669.4], "1 to 5 million": [219.6, 668.9],
      "5 to 10 million": [296.4, 668.9], "10 million and above": [372.2, 669.4] }, k),
    tick("pep_status", 5, 14.9, { "I am PEP": [49.9, 744.2], "I am related to a PEP": [49.9, 761.3], "Not applicable": [49.4, 778.3] }, k),
  ];
}

/** Page 6: second holder, mode of holding, FATCA & CRS. */
function secondHolderAndFatcaPage() {
  const j = { section: "second-holder" }, h = { section: "holding" }, f = { section: "fatca" };
  const tinRow = (prefix, top, bottom, reasonTops) => {
    const p = prefix ? `${prefix}_` : "", section = prefix ? j : f;
    return [
      inRect(`${p}foreign_tax_country_1`, 6, [114.5, top, 227.5, bottom], "typed", { fontSize: 7, ...section }),
      inRect(`${p}foreign_tax_identification_number_1`, 6, [227.5, top, 340.3, bottom], "typed", { fontSize: 7, ...section }),
      inRect(`${p}foreign_tax_identification_type_1`, 6, [340.3, top, 453.4, bottom], "typed", { fontSize: 7, ...section }),
      tick(`${p}tin_unavailable_reason`, 6, 8, { "A - country does not issue TINs": [489.3, reasonTops[0]],
        "B - no TIN required": [522.9, reasonTops[1]], "C - other reason": [552.0, reasonTops[2]] }, section),
    ];
  };
  return [
    inRect("joint_holder_relationship", 6, [407.8, 89.8, 570.5, 103.5], "typed", j),
    comb("joint_holder_name", 6, 125.3, 79.7, 35, "typed", { pitch: 14.09, keepAll: true, ...j }),
    comb("joint_holder_tax_reference_number", 6, 145.7, 78.0, 10, "typed", { pitch: 14.13, ...j }),
    comb("joint_holder_ckyc_number", 6, 145.7, 374.3, 14, "typed", { pitch: 14.14, ...j }),
    comb("joint_holder_dob", 6, 166.0, 80.7, 8, "typed", { pitch: 14.16, ...j }),
    tick("joint_holder_residential_status", 6, 14.5, { RI: [138.2, 169.2], NRI: [220.7, 170.7] }, j),
    tick("joint_holder_occupation", 6, 14.5, {
      "Private Sector": [137.2, 189.7], "Public Sector": [220.7, 189.2], "Government Service": [295.7, 189.2], Business: [398.1, 190.2],
      Student: [459.1, 189.7], Retired: [526.1, 191.7], Professional: [137.2, 208.7], Agriculturist: [220.2, 209.2],
      "House Wife": [295.2, 209.2], "Forex Dealer": [369.6, 209.2], Others: [441.6, 208.7] }, j),
    inRect("joint_holder_occupation_other", 6, [535.9, 207.9, 577.0, 221.5], "typed", { fontSize: 6, ...j }),
    tick("mode_of_holding", 6, 14, { Single: [219.7, 237.2], Joint: [295.7, 237.7], "Anyone or survivor": [369.1, 237.7] }, h),
    inRect("joint_holding_percentage", 6, [277.9, 253.5, 323.5, 267.1], "typed", h),
    comb("joint_holder_mobile", 6, 313.0, 81.3, 12, "typed", { pitch: 14.14, ...j }),
    comb("joint_holder_email", 6, 333.7, 79.7, 35, "typed", { pitch: 14.13, keepAll: true, ...j }),
    tick("joint_holder_pep_status", 6, 14.5, { "I am PEP": [147.7, 342.1], "I am related to a PEP": [272.2, 342.1], "Not applicable": [439.1, 342.1] }, j),
    tick("joint_holder_gross_annual_income_range", 6, 14, { "Below 1 million": [149.7, 361.1], "1 to 5 million": [244.2, 361.1],
      "5 to 10 million": [333.1, 361.1], "10 million and above": [439.6, 362.1] }, j),
    inRect("place_of_birth", 6, [116.9, 464.4, 226.3, 480.7], "typed", { fontSize: 7, ...f }),
    inRect("country_of_birth", 6, [226.3, 465.1, 339.1, 480.7], "typed", { fontSize: 7, ...f }),
    tick("citizenship", 6, 8.5, { "U.S.": [344.9, 469.6], Others: [392.6, 470.3] }, f),
    inRect("citizenship_country", 6, [467.8, 466.2, 541.5, 479.6], "typed", { fontSize: 6, ...f }),
    inRect("joint_holder_place_of_birth", 6, [116.9, 480.7, 226.3, 496.6], "typed", { fontSize: 7, ...j }),
    inRect("joint_holder_country_of_birth", 6, [226.3, 480.7, 339.1, 496.6], "typed", { fontSize: 7, ...j }),
    tick("joint_holder_citizenship", 6, 8.5, { "U.S.": [345.3, 485.4], Others: [393.8, 485.4] }, j),
    inRect("joint_holder_citizenship_country", 6, [468.8, 481.7, 542.7, 494.7], "typed", { fontSize: 6, ...j }),
    ...tinRow("", 571.2, 591.1, [578.0, 577.8, 577.6]),
    ...tinRow("joint_holder", 591.1, 609.1, [597.6, 597.1, 597.5]),
    inRect("tin_reason_c_details", 6, [213.6, 671.5, 564.2, 682.6], "typed", { fontSize: 7, ...f }),
    tick("address_type", 6, 8.5, { Residential: [37.4, 717.0], "Registered office": [87.9, 717.9], Business: [159.8, 718.9] }, f),
    tick("joint_holder_address_type", 6, 8, { Residential: [215.0, 716.1], "Registered office": [267.8, 716.7], Business: [340.6, 716.7] }, j),
  ];
}

/** Pages 7-9: nomination choice, investment, bank, mailing address and the signed declaration. */
function investmentAndDeclarationPages() {
  const i = { section: "investment" }, b = { section: "bank" }, m = { section: "contact" }, g = { section: "signed" };
  return [
    inRect("subscriber_name_p7", 7, [142.6, 76.1, 536.7, 103.5], "copy.subscriber_name", { section: "nomination" }),
    tick("wish_to_nominate", 7, 15, { "Wish to nominate": [68.4, 108.0], "Do not wish to nominate": [185.3, 108.0] }, { section: "nomination" }),
    // Nominee 1 (first column), as 360 ONE's filled sample does: name, share, date of birth, relationship, address, zip code, mobile.
    inRect("nominee_1_name", 7, [155.7, 196.2, 282.7, 224.7], "typed", { section: "nomination" }),
    inRect("nominee_1_share_pct", 7, [173.7, 230.7, 212.7, 247.7], "typed", { section: "nomination" }),
    inRect("nominee_1_dob", 7, [155.8, 252.7, 282.5, 279.9], "typed", { section: "nomination" }),
    tick("nominee_1_relationship", 7, 9.5, { Spouse: [159.8, 283.8], Father: [159.8, 297.9], Mother: [159.8, 310.3], Daughter: [159.8, 323.8],
      Son: [159.8, 336.3], Others: [159.3, 348.6] }, { section: "nomination" }),
    inRect("nominee_1_relationship_other", 7, [179.1, 359.3, 277.7, 371.8], "typed", { section: "nomination" }),
    multiline("nominee_1_address", 7, 158, 520, 122, 587, "typed", { fontSize: 7, section: "nomination" }),
    inRect("nominee_1_zip_code", 7, [205.7, 590.6, 281.7, 609.5], "typed", { section: "nomination" }),
    inRect("nominee_1_mobile", 7, [156.2, 625.5, 278.7, 644.0], "typed", { section: "nomination" }),
    inRect("class_of_units", 8, [372.8, 124.0, 549.7, 143.9], "typed", i),
    inRect("capital_commitment_usd", 8, [74.2, 161.5, 291.1, 183.4], "typed", i),
    inRect("contribution_amount_usd", 8, [373.0, 162.9, 548.4, 184.2], "typed", i),
    inRect("payment_reference", 8, [74.2, 200.0, 291.4, 221.6], "typed", i),
    inRect("drawn_on_bank_date", 8, [373.0, 197.0, 547.0, 215.5], "typed", i),
    // Bank rows: one character per cell between printed tick marks (14.2pt apart), measured from the pixels.
    comb("account_number", 8, 296.6, 111.0, 16, "typed", { pitch: 14.2, ...b }),
    comb("account_type", 8, 296.6, 408.0, 11, "typed", { pitch: 14.2, keepAll: true, ...b }),
    comb("bank_name", 8, 315.0, 111.0, 32, "typed", { pitch: 14.2, keepAll: true, ...b }),
    comb("bank_city", 8, 333.2, 39.8, 19, "typed", { pitch: 14.2, keepAll: true, ...b }),
    comb("bank_state", 8, 333.0, 337.2, 16, "typed", { pitch: 14.2, keepAll: true, ...b }),
    comb("bank_postcode", 8, 350.6, 68.0, 13, "typed", { pitch: 14.2, ...b }),
    comb("bank_country", 8, 350.7, 295.0, 19, "typed", { pitch: 14.2, keepAll: true, ...b }),
    comb("swift_code", 8, 368.7, 68.0, 13, "typed", { pitch: 14.2, ...b }),
    comb("mailing_address_line1", 8, 444.3, 121.3, 31, "document.street|addressLine1|upper", { pitch: 14.14, keepAll: true, ...m }),
    comb("mailing_address_line2", 8, 461.0, 121.3, 31, "document.street|addressLine2|upper", { pitch: 14.15, keepAll: true, ...m }),
    comb("mailing_city", 8, 481.7, 36.3, 19, "document.city|upper", { pitch: 14.14, keepAll: true, ...m }),
    comb("mailing_state", 8, 481.7, 333.3, 16, "document.state|upper", { pitch: 14.15, keepAll: true, ...m }),
    comb("mailing_postcode", 8, 499.3, 64.7, 13, "document.pincode", { pitch: 14.15, ...m }),
    comb("mailing_country", 8, 499.3, 291.0, 19, "document.country|upper", { pitch: 14.14, keepAll: true, ...m }),
    inRect("ppm_date", 8, [461.7, 788.7, 542.1, 801.4], "typed", { fontSize: 7, ...g }),
    inRect("subscriber_name_p9", 9, [14.2, 655.1, 197.6, 680.3], "copy.subscriber_name", g),
    inRect("joint_holder_name_p9", 9, [197.6, 655.1, 381.2, 680.3], "copy.joint_holder_name", g),
    inRect("place", 9, [38.8, 737.3, 174.4, 750.9], "typed", g),
    comb("form_date", 9, 773.3, 37.7, 8, "today", { pitch: 14.16, ...g }),
  ];
}

/** Pages 17-18 (accredited investor), 21 (agreement date), 73 (Annexure A) and 74 (FME waiver). */
function declarationAndAgreementPages() {
  const a = { section: "accredited" }, g = { section: "agreement" }, x = { section: "annexure-a" };
  const bracket = (key, page, x0, baseline, width, source, options = {}) => text(key, page, x0 + 2, baseline - 1.5, width - 4, source, { section: "annexure-a", ...options });
  return [
    inRect("subscriber_name_p17", 17, [140.9, 127.4, 398.7, 142.9], "copy.subscriber_name", a),
    multiline("subscriber_address_p17", 17, 45, 152.5, 510, 163, "document.address|withoutCareOf|upper", { fontSize: 7, ...a }),
    tick("accredited_investor_category", 17, 7.9, {
      "Individual - income criteria": [[69.2, 366.3], [234.2, 366.6]], "Individual - net assets criteria": [[69.2, 366.3], [398.2, 366.6]] }, a),
    tick("accredited_joint_investment", 17, 7.9, { "Parent(s) and child(ren)": [63.6, 577.1], Spouses: [63.6, 609.4] }, a),
    tick("accredited_documentation", 17, 7.9, {
      "Net worth certificate (last 6 months)": [[69.7, 663.5], [315.3, 663.1]], "Income proof (salary slip or other)": [[69.7, 663.5], [311.6, 111.1, 18]] }, a),
    inRect("subscriber_name_p18", 18, [58.5, 650.8, 464.5, 667.0], "copy.subscriber_name", a),
    inRect("signatory_designation_p18", 18, [152.2, 669.6, 464.5, 685.9], "typed", a),
    inRect("form_date_p18", 18, [53.4, 690.5, 166.7, 704.6], "copy.form_date", a),
    text("agreement_execution_day", 21, 106, 182, 30, "typed", g),
    // Annexure A's yellow brackets are 40pt: name, address and amount in words go on the free line under each.
    text("subscriber_name_p73", 73, 100, 197, 150, "copy.subscriber_name", { fontSize: 9, ...x }),
    text("subscriber_address_p73", 73, 255, 197, 268, "document.address|withoutCareOf|upper", { fontSize: 6.5, ...x }),
    bracket("capital_commitment_usd_p73", 73, 413.9, 234.0, 40.3, "copy.capital_commitment_usd"),
    text("capital_commitment_usd_words", 73, 100, 259, 420, "typed", { fontSize: 7.5, ...x }),
    bracket("class_of_units_p73", 73, 364.1, 297.2, 40.4, "copy.class_of_units"),
    bracket("management_fee_percent", 73, 100.3, 360.5, 40.4, "typed"),
    bracket("management_fee_percent_words", 73, 155.4, 360.5, 44, "typed", { fontSize: 6 }),
    bracket("placement_cost", 73, 100.3, 411.1, 40.4, "typed"),
    bracket("operating_expenses", 73, 100.3, 461.6, 40.4, "typed"),
    bracket("setup_expenses", 73, 100.3, 512.3, 40.4, "typed"),
    text("mailing_address_line1_p73", 73, 102, 624.7, 410, "copy.mailing_address_line1", x),
    text("mailing_address_line2_p73", 73, 102, 637.3, 410, "copy.mailing_address_line2", x),
    text("email_p73", 73, 138, 662.5, 168, "copy.email", x),
    text("mobile_p73", 73, 158, 684.4, 152, "copy.mobile", x),
    text("landline_p73", 73, 158, 697, 152, "copy.landline", x),
    text("form_date_p74", 74, 100, 143.2, 80, "copy.form_date", { fontSize: 7, section: "waiver" }),
  ];
}

/** A signature box sitting on a printed signature line (x0-x1 at baseline y). */
const onLine = (page, [x0, x1, y], signer, label) => ({ page, x: x0, y: Math.round((y - 24) * 10) / 10, w: Math.round((x1 - x0) * 10) / 10, h: 24, signer, label });

const SIGNATURE_BOXES = [
  { page: 9, x: 15, y: 683, w: 182, h: 34, signer: "subscriber", label: "Application - first holder" },
  { page: 9, x: 198, y: 683, w: 183, h: 34, signer: "joint_holder", label: "Application - second holder" },
  { page: 18, x: 40, y: 590, w: 220, h: 40, signer: "subscriber", label: "Accredited investor declaration" },
  onLine(72, [107.4, 195.5, 537.6], "subscriber", "Contribution Agreement - contributor"),
  onLine(73, [95.3, 227.6, 761.5], "subscriber", "Annexure A - contributor"),
  onLine(74, [72.0, 182.2, 554.3], "subscriber", "FME commitment waiver"),
];

const IGNORED = [
  [5, 270.0, "Guardian / contact person for an entity: relationship to minor - only for a minor or an entity"],
  [6, 508, "Guardian's citizenship (\"Others, please specify\"): only when the first holder is a minor"],
  ...[418, 440, 470, 500].map((y) => [7, y, "Nominee identity proof numbers: not given in 360 ONE's filled sample - open question"]),
  ...[107.5, 120.1, 132.8, 145.5, 158.0, 170.8, 183.4, 196.1, 208.7, 221.3, 234.0, 246.6, 259.3, 271.9, 284.7, 297.2, 309.8, 322.6, 335.2,
    347.9, 360.5, 373.1, 385.8, 398.4, 411.1, 423.7].map((y) => [20, y, "Table of contents of the Contribution Agreement (dotted leaders)"]),
  ...[150, 183].map((y) => [18, y, "Body corporate documentation: for a non-individual investor"]),
  ...[183.4, 246.6, 360.5, 423.7].map((y) => [72, y, "Signed by the Trustee / FME"]),
  [72, 600.8, "Witness to the contributor's signature (\"In the presence of\")"],
  [73, 170.8, "\"Mr./Mrs./Messers [___]\": the 40pt bracket has no room; the name is written on the free line under it"],
  [73, 183.4, "\"office at [___]\": the 40pt bracket has no room; the address is written on the free line under it"],
  [73, 246.6, "\"Dollars [___]\": the 40pt bracket has no room; the amount in words is written on the free line under it"],
  [73, 651.4, "Third mailing-address line: the Excel gives two (city, state and country are on page 8)"],
  ...[132.8, 234.0, 360.5].map((y) => [75, y, "Deed of Adherence: only when units are transferred to a new contributor"]),
  ...[271.9, 309.8, 335.3].map((y) => [76, y, "Deed of Adherence: only when units are transferred to a new contributor"]),
];

const SECTIONS = [["distributor", "Distributor / RM (Excel)"], ["applicant", "First holder (KYC + Excel)"], ["contact", "Contact and mailing address"],
  ["kyc", "KYC details (Excel)"], ["second-holder", "Second holder (Excel)"], ["holding", "Mode of holding"], ["fatca", "FATCA & CRS (Excel)"],
  ["nomination", "Nomination"], ["investment", "Investment (Excel)"], ["bank", "Bank account (Excel)"], ["signed", "Declaration signed"],
  ["accredited", "Accredited investor declaration"], ["agreement", "Contribution Agreement date (Excel)"], ["annexure-a", "Annexure A: key details"],
  ["waiver", "FME commitment waiver"]];

const REQUIRED_FIELDS = ["subscriber_name", "dob", "tax_reference_number", "residential_status", "mobile", "email", "capital_commitment_usd",
  "class_of_units", "account_number", "bank_name", "swift_code", "pep_status", "wish_to_nominate", "place"];

function main() {
  const fields = [...firstHolderPage(), ...secondHolderAndFatcaPage(), ...investmentAndDeclarationPages(), ...declarationAndAgreementPages()];
  const duplicateKeys = fields.map((field) => field.key).filter((key, index, keys) => keys.indexOf(key) !== index);
  if (duplicateKeys.length) throw new Error(`duplicate keys ${duplicateKeys.join(", ")}`);
  const textFields = fields.filter((field) => !field.tickbox), tickboxes = fields.filter((field) => field.tickbox);
  mkdirSync(FOLDER, { recursive: true });
  const writeJson = (fileName, content) => writeFileSync(path.join(FOLDER, fileName), JSON.stringify(content, null, 2) + "\n");
  writeJson("field-positions.json", { _about: `Where each value is written on the blank ${FUND_NAME} application form (widgets removed), 76 pages. Made by tools/form-building/make_gift_whiteoak_application.mjs.`,
    formId: FORM_ID, title: `${FUND_NAME} - Application Form`,
    fields: textFields.map(({ source, section, ...field }) => ({ key: field.key, nominee: null, ...field })) });
  writeJson("field-sources.json", {
    _about: "Form field -> where its value comes from. \"document.X\" = X read from the first holder's KYC documents (see ../document-data-dictionary.json); \"|upper\" etc. = the part or form of it this box wants; \"typed\" = from the batch Excel or the review screen; \"copy.X\" = same as field X unless typed separately; \"today\" = today's date; \"tick\" = a tick box, answered per client in the Excel (never assumed). joint_holder_* = the second holder (typed). No GIFT City field sheet exists yet: sources follow the GIFT feeder subscription forms.",
    fieldSources: Object.fromEntries(fields.map((field) => [field.key, field.tickbox ? "tick" : field.source])) });
  writeJson("required-fields.json", { _about: "Fields that must be filled before a case can be confirmed. Changed from the Form setup screen.", requiredFields: REQUIRED_FIELDS });
  writeJson("form-rules.json", {
    _about: "Form-level rules: how the form is recognised, which tab it saves to. One person (the first holder) - their KYC documents fill the identity fields, the Excel fills the rest; the second holder's fields are typed.",
    formId: FORM_ID, group: "GIFT City", label: "GIFT – WhiteOak Global EM ex India – Application", shortLabel: "GIFT WhiteOak EM application",
    purpose: "New investment · application form and contribution agreement", blankFileName: BLANK_FILE_NAME,
    keyFields: ["Applicant name", "Capital commitment", "Bank account"], sheetTabName: "GIFT WhiteOak EM application",
    detectionPhrases: ["APPLICATION FORM FOR INDIVIDUALS", "Ashoka WhiteOak Capital Management (GIFT) LLP"], supportedNomineeCount: 1, personLabel: "Applicant",
    identityType: { scope: "shared", tickboxField: null, numberField: null, optionByIdentityKind: {}, numberFieldByIdentityKind: {} },
    reviewSections: SECTIONS.map(([key, title]) => {
      const sectionFields = fields.filter((field) => field.section === key);
      const pages = [...new Set(sectionFields.map((field) => field.page))].sort((first, second) => first - second);
      const pageWords = pages.length > 1 ? `Pages ${pages[0]}-${pages[pages.length - 1]}` : `Page ${pages[0]}`;
      return { key, label: `${pageWords} · ${title}`, fields: sectionFields.map((field) => field.key) };
    }) });
  writeJson("form-configuration.json", {
    _about: `${FUND_NAME} application form, 76 pages (widgets removed). Made by tools/form-building/make_gift_whiteoak_application.mjs. Every tick box is its own question with no assumed answer.`,
    id: FORM_ID, title: `${FUND_NAME} - Application Form`, labels: [], signatureBoxes: SIGNATURE_BOXES,
    tickboxes: tickboxes.map(({ tickbox, section, ...tickboxSpec }) => tickboxSpec),
    blankFileName: BLANK_FILE_NAME, nomineeHeaderRe: null, tickboxRule: "usual",
    ignoredBlanks: IGNORED.map(([page, y, why]) => ({ page, y, why })) });
  console.log(`wrote ${FOLDER}: ${textFields.length} fields, ${tickboxes.length} tick boxes, ${SIGNATURE_BOXES.length} signatures`);
}

main();
