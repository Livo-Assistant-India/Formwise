// The application pages (1-21) of 360 ONE's GIFT City "Application Form & Documentation Set": the same pages, at the
// same places, in the Dynamic Equity Allocator, Growth Strategy and International Opportunities blanks (compared
// pixel by pixel: only the fund name in titles, the remittance table on page 5 and some wording on pages 7, 10 and 21
// differ). Measured on the Dynamic Equity Allocator blank; pages 5 and 8-21 are scans, measured from their pixels.
// Used by make_gift_feeder_subscriptions.mjs. Every field carries its source; tick boxes carry their options.

const COMB_PITCH = 12.76;

/** One character per printed box: boxes from boxTop to boxBottom, the first box starting at leftX. */
export function comb(key, page, boxBottom, leftX, boxCount, source, { keepAll = false, pitch = COMB_PITCH, section, fontSize = 8 } = {}) {
  return { key, page, x: leftX, y: Math.round((boxBottom - 3.6) * 100) / 100, fontSize, type: "text",
    combs: [[leftX, Math.round(boxCount * pitch * 100) / 100, boxCount]], ...(keepAll ? { combKeepAll: true } : {}), source, section };
}

/** A value written on a line or inside a box, from x at baseline y. */
export function text(key, page, x, y, maxWidth, source, { fontSize = 8, section } = {}) {
  return { key, page, x, y, fontSize, type: "text", maxWidth, source, section };
}

/** A value that wraps onto more lines, from baseline y down to maxY. */
export function multiline(key, page, x, y, maxWidth, maxY, source, { fontSize = 7, section } = {}) {
  return { key, page, x, y, fontSize, type: "multiline", maxWidth, maxY, source, section };
}

/** A question answered by ticking one box. boxes: { option: [x, boxTop] or [[x, boxTop, page?], ...] }. */
export function tick(key, page, size, boxesByOption, { section } = {}) {
  const toBox = ([x, boxTop, boxPage]) => ({ x, y: Math.round((boxTop + size * 0.8) * 100) / 100, ...(boxPage ? { page: boxPage } : {}) });
  return { tickbox: true, key, page, w: size, h: size, options: Object.keys(boxesByOption), section,
    boxesByOption: Object.fromEntries(Object.entries(boxesByOption).map(([option, boxes]) =>
      [option, Array.isArray(boxes[0]) ? boxes.map(toBox) : [toBox(boxes)]])) };
}

const OCCUPATION_OPTIONS = (firstRowTop, secondRowTop, columnXs) => ({
  Professional: [columnXs[0], firstRowTop], Business: [columnXs[1], firstRowTop], "Private Sector Service": [columnXs[2], firstRowTop],
  "Public Sector Service": [columnXs[3], firstRowTop], "Government Service": [columnXs[4], firstRowTop], "Self Employed": [columnXs[5], firstRowTop],
  Retired: [columnXs[0], secondRowTop], Housewife: [columnXs[1], secondRowTop], Student: [columnXs[2], secondRowTop],
  Agriculturist: [columnXs[3], secondRowTop], Others: [columnXs[4], secondRowTop],
});
const INCOME_OPTIONS = (top, xs) => ({ "Below 1 million": [xs[0], top], "1 to 5 million": [xs[1], top], "5 to 10 million": [xs[2], top], "10 million and above": [xs[3], top] });
const PEP_OPTIONS = (top) => ({ "I am PEP": [35.2, top], "I am related to a PEP": [95.5, top], "Not applicable": [180.5, top] });
const NO_PAN_DOCUMENT_OPTIONS = (top, xs) => ({ Passport: [xs[0], top], "Election ID card": [xs[1], top], "Government ID": [xs[2], top], UIDAI: [xs[3], top], Others: [xs[4], top] });
const ADDRESS_TYPE_OPTIONS = (top, xs) => ({ Residential: [xs[0], top], Business: [xs[1], top], "Registered office": [xs[2], top] });

/** Page 2 of the form (PDF page 4) and its scanned twin for the second applicant (PDF page 8, rows moved up). */
function firstApplicantPage() {
  const s = { section: "applicant" };
  return [
    tick("gender", 4, 8.5, { Male: [126.0, 139.5], Female: [155.0, 139.5], Others: [192.2, 139.5], "Non-individual": [227.3, 139.5] }, s),
    comb("subscriber_name", 4, 167.4, 35.9, 41, "document.name|upper", { keepAll: true, ...s }),
    comb("dob", 4, 182.4, 150.7, 8, "document.dob", s),
    tick("citizenship", 4, 8.5, { Indian: [150.4, 184.6], Others: [219.6, 184.6] }, s),
    text("citizenship_country", 4, 285, 188, 84, "typed", { fontSize: 7, ...s }),
    text("citizenship_country_code", 4, 416, 188, 44, "typed", { fontSize: 7, ...s }),
    tick("residential_status", 4, 8.5, { Resident: [150.4, 196.1], "Non-resident": [199.6, 196.1], "Foreign national": [263.7, 196.1], "Person of Indian origin": [342.3, 196.1] }, s),
    tick("minor_status", 4, 8.5, { "Minor through guardian": [150.4, 209.5] }, s),
    comb("tax_reference_number", 4, 233.6, 150.7, 24, "document.pan", s),
    // "Registered Office Address" (first row) is for non-individuals; an individual's address starts on "Building/ Street/ Locality".
    comb("residence_address_line1", 4, 268.2, 150.7, 24, "document.street|addressLine1|upper", { keepAll: true, ...s }),
    comb("residence_address_line2", 4, 285.6, 35.9, 33, "document.street|addressLine2|upper", { keepAll: true, ...s }),
    comb("city", 4, 302.9, 35.9, 20, "document.city|upper", { keepAll: true, ...s }),
    comb("pincode", 4, 302.9, 380.3, 6, "document.pincode", s),
    comb("residence_country", 4, 320.2, 61.4, 31, "document.country|upper", { keepAll: true, ...s }),
    tick("correspondence_same_as_residence", 4, 8.5, { "Same as above": [229.3, 321.9] }, s),
    comb("mailing_address_line1", 4, 344.8, 112.4, 35, "typed", { keepAll: true, ...s }),
    comb("mailing_address_line2", 4, 360.7, 35.9, 41, "typed", { keepAll: true, ...s }),
    comb("mailing_address_line3", 4, 376.6, 35.9, 28, "typed", { keepAll: true, ...s }),
    comb("mailing_postcode", 4, 376.6, 482.3, 6, "typed", s),
    comb("mailing_country", 4, 392.5, 61.4, 39, "typed", { keepAll: true, ...s }),
    comb("landline", 4, 440.3, 431.3, 10, "typed", s),
    comb("mobile", 4, 456.2, 74.1, 13, "typed", s),
    comb("fax", 4, 456.2, 431.3, 10, "typed", s),
    comb("email", 4, 473.5, 74.1, 38, "typed", { keepAll: true, ...s }),
    tick("occupation", 4, 8.5, OCCUPATION_OPTIONS(710.7, 725.2, [35.8, 114.2, 182.7, 292.1, 398.6, 502.7]), s),
    text("occupation_other", 4, 437, 726.8, 112, "typed", { fontSize: 7, ...s }),
    text("employer_name", 4, 152, 758.3, 404, "typed", s),
    text("place_of_work", 4, 152, 775.3, 404, "typed", s),
  ];
}

function secondApplicantPages() {
  const s = { section: "second-applicant" };
  return [
    tick("joint_holder_gender", 8, 8.5, { Male: [126.0, 125.8], Female: [155.0, 125.8], Others: [192.0, 125.8], "Non-individual": [227.2, 125.8] }, s),
    comb("joint_holder_name", 8, 153.9, 35.8, 41, "typed", { keepAll: true, ...s }),
    comb("joint_holder_dob", 8, 168.9, 150.5, 8, "typed", s),
    tick("joint_holder_citizenship", 8, 8.5, { Indian: [150.2, 170.6], Others: [219.2, 170.6] }, s),
    text("joint_holder_citizenship_country", 8, 285, 178.8, 84, "typed", { fontSize: 7, ...s }),
    text("joint_holder_citizenship_country_code", 8, 416, 178.8, 44, "typed", { fontSize: 7, ...s }),
    tick("joint_holder_residential_status", 8, 8.5, { Resident: [150.2, 180.6], "Non-resident": [199.5, 180.6], "Foreign national": [263.5, 180.6], "Person of Indian origin": [342.2, 180.6] }, s),
    comb("joint_holder_tax_reference_number", 8, 206.0, 150.5, 24, "typed", s),
    comb("joint_holder_residence_address_line1", 8, 240.7, 150.5, 24, "typed", { keepAll: true, ...s }),
    comb("joint_holder_residence_address_line2", 8, 258.0, 35.8, 33, "typed", { keepAll: true, ...s }),
    comb("joint_holder_city", 8, 275.2, 35.8, 20, "typed", { keepAll: true, ...s }),
    comb("joint_holder_pincode", 8, 275.2, 380.4, 6, "typed", s),
    comb("joint_holder_residence_country", 8, 292.7, 61.2, 31, "typed", { keepAll: true, ...s }),
    comb("joint_holder_mobile", 8, 428.0, 74.1, 13, "typed", s),
    comb("joint_holder_email", 8, 446.2, 74.0, 38, "typed", { keepAll: true, ...s }),
    tick("joint_holder_occupation", 8, 8.5, OCCUPATION_OPTIONS(514.4, 529.0, [35.5, 114.0, 182.5, 291.8, 398.5, 502.5]), s),
    text("joint_holder_occupation_other", 8, 437, 535.2, 108, "typed", { fontSize: 7, ...s }),
    tick("joint_holder_gross_annual_income_range", 8, 8.5, INCOME_OPTIONS(648.3, [149.2, 209.5, 262.0, 319.0]), s),
    tick("joint_holder_pep_status", 8, 8.5, PEP_OPTIONS(742.8), s),
    // Page 9: the second applicant's FATCA & CRS declaration.
    tick("joint_holder_address_type", 9, 8.5, ADDRESS_TYPE_OPTIONS(94.0, [106.4, 158.6, 206.9]), s),
    comb("joint_holder_nationality", 9, 119.5, 82.5, 16, "typed", { keepAll: true, ...s }),
    comb("joint_holder_place_of_birth", 9, 119.5, 350.4, 16, "typed", { keepAll: true, ...s }),
    comb("joint_holder_country_of_birth", 9, 135.8, 82.5, 16, "typed", { keepAll: true, ...s }),
    comb("joint_holder_country_of_birth_code", 9, 135.8, 388.8, 13, "typed", { keepAll: true, ...s }),
    comb("joint_holder_father_name", 9, 153.5, 120.8, 34, "typed", { keepAll: true, ...s }),
    tick("joint_holder_identity_document_if_no_pan", 9, 8.5, NO_PAN_DOCUMENT_OPTIONS(157.2, [177.1, 223.2, 292.0, 357.5, 394.0]), s),
    text("joint_holder_identity_document_other", 9, 432, 163.8, 110, "typed", { fontSize: 7, ...s }),
    comb("joint_holder_identity_document_number", 9, 183.2, 108.2, 35, "typed", s),
    tick("joint_holder_tax_resident_outside_india", 9, 8.5, { Yes: [278.6, 187.2], No: [303.0, 187.2] }, s),
    // Page 10: the second applicant signs on the same day and place as the first.
    text("place_p10", 10, 245, 525.3, 125, "copy.place", { section: "second-applicant-signed" }),
    comb("form_date_p10", 10, 550.6, 240.5, 8, "copy.form_date", { pitch: 14.34, section: "second-applicant-signed" }),
  ];
}

function kycAndBankPage() {
  const k = { section: "kyc" }, b = { section: "bank" }, i = { section: "investment" };
  return [
    text("business_nature", 5, 152, 112.3, 404, "typed", k),
    text("business_location", 5, 152, 129.5, 404, "typed", k),
    text("business_countries", 5, 152, 146.5, 404, "typed", k),
    tick("gross_annual_income_range", 5, 8.5, INCOME_OPTIONS(153.6, [149.2, 209.5, 262.2, 319.2]), k),
    text("net_worth_usd", 5, 152, 176.3, 404, "typed", k),
    text("net_worth_usd_words", 5, 152, 193.3, 404, "typed", k),
    comb("net_worth_date", 5, 213.4, 149.4, 8, "typed", k),
    tick("pep_status", 5, 8.5, PEP_OPTIONS(248.5), k),
    comb("account_name", 5, 337.6, 95.5, 36, "copy.subscriber_name", { keepAll: true, ...b }),
    comb("account_number", 5, 354.5, 95.5, 36, "typed", b),
    comb("bank_name", 5, 371.6, 95.5, 36, "typed", { keepAll: true, ...b }),
    comb("swift_code", 5, 388.7, 133.6, 33, "typed", b),
    comb("bank_address", 5, 405.5, 95.5, 36, "typed", { keepAll: true, ...b }),
    comb("bank_address_line2", 5, 422.5, 31.5, 41, "typed", { keepAll: true, ...b }),
    comb("bank_state", 5, 439.5, 57.5, 18, "typed", { keepAll: true, ...b }),
    comb("bank_country", 5, 439.5, 325.4, 18, "typed", { keepAll: true, ...b }),
    comb("correspondent_bank_name", 5, 456.7, 95.8, 36, "typed", { keepAll: true, ...b }),
    comb("correspondent_swift_code", 5, 471.7, 146.8, 32, "typed", b),
    comb("subscription_amount", 5, 521.5, 197.8, 28, "typed", { keepAll: true, ...i }),
    comb("subscription_amount_words", 5, 535.8, 197.8, 28, "typed", { keepAll: true, fontSize: 7, ...i }),
    text("placement_fee_percent", 5, 84, 555, 66, "typed", { fontSize: 7, ...i }),
    text("class_of_units", 5, 129, 567.6, 46, "typed", { fontSize: 7, ...i }),
    // Distributor / placement agent table (one row under the headings).
    text("distributor_code", 5, 34, 803, 73, "typed", { fontSize: 7, section: "distributor" }),
    text("distributor_name", 5, 112, 803, 73, "typed", { fontSize: 7, section: "distributor" }),
    text("distributor_rm_name", 5, 190, 803, 78, "typed", { fontSize: 7, section: "distributor" }),
    text("distributor_contact_number", 5, 273.5, 803, 73, "typed", { fontSize: 7, section: "distributor" }),
    text("distributor_email", 5, 352, 803, 200, "typed", { fontSize: 7, section: "distributor" }),
  ];
}

function fatcaPage() {
  const f = { section: "fatca" }, h = { section: "holding" };
  const foreignTaxRows = [230.6, 241.0, 251.4].flatMap((y, index) => [
    text(`foreign_tax_country_${index + 1}`, 6, 67, y, 106, "typed", { fontSize: 7, ...f }),
    text(`foreign_tax_identification_number_${index + 1}`, 6, 178, y, 136, "typed", { fontSize: 7, ...f }),
    text(`foreign_tax_identification_type_${index + 1}`, 6, 319, y, 238, "typed", { fontSize: 7, ...f }),
  ]);
  return [
    tick("address_type", 6, 8.5, ADDRESS_TYPE_OPTIONS(95.0, [111.3, 163.4, 211.8]), f),
    comb("nationality", 6, 120.5, 87.2, 16, "typed", { keepAll: true, ...f }),
    comb("place_of_birth", 6, 120.5, 354.8, 16, "typed", { keepAll: true, ...f }),
    comb("country_of_birth", 6, 137.5, 87.2, 16, "typed", { keepAll: true, ...f }),
    comb("country_of_birth_code", 6, 137.5, 393.4, 13, "typed", { keepAll: true, ...f }),
    comb("father_name", 6, 154.5, 125.5, 34, "typed", { keepAll: true, ...f }),
    tick("identity_document_if_no_pan", 6, 8.5, NO_PAN_DOCUMENT_OPTIONS(158.7, [181.8, 227.8, 296.7, 362.2, 398.7]), f),
    text("identity_document_other", 6, 437, 164.6, 116, "typed", { fontSize: 7, ...f }),
    comb("identity_document_number", 6, 184.2, 112.7, 35, "typed", f),
    tick("tax_resident_outside_india", 6, 8.5, { Yes: [283.2, 188.5], No: [307.6, 188.5] }, f),
    ...foreignTaxRows,
    tick("first_second_holder_relationship", 6, 8.6, {
      "Husband - Wife": [195.1, 330.9], "Wife - Husband": [275.0, 330.9], "Father - Son": [354.8, 330.9], "Son - Father": [434.7, 330.9],
      "Father - Daughter": [514.6, 330.9], "Daughter - Father": [195.1, 362.7], "Mother - Son": [275.0, 362.7], "Son - Mother": [354.8, 362.7],
      "Mother - Daughter": [434.7, 362.7], "Daughter - Mother": [514.6, 362.7] }, h),
    tick("mode_of_holding", 6, 8.6, { Single: [207.8, 378.6], Joint: [342.1, 378.6], "Anyone or survivor": [447.8, 378.6] }, h),
    text("place", 7, 245, 704, 125, "typed", { section: "signed" }),
    comb("form_date", 7, 729.2, 240.5, 8, "today", { pitch: 14.34, section: "signed" }),
  ];
}

function investorProfilePage() {
  const p = { section: "profile" };
  return [
    text("subscriber_name_p14", 14, 126, 155, 130, "copy.subscriber_name", { fontSize: 7, ...p }),
    text("gender_p14", 14, 368, 155, 50, "copy.gender", { fontSize: 7, ...p }),
    text("dob_p14", 14, 368, 175.6, 50, "copy.dob", { fontSize: 7, ...p }),
    multiline("subscriber_address", 14, 423, 163.5, 124, 177, "document.address|withoutCareOf|upper", { fontSize: 6, ...p }),
    text("id_passport", 14, 126, 186, 130, "document.passport", { fontSize: 7, ...p }),
    text("telephone", 14, 368, 196.4, 179, "typed", { fontSize: 7, ...p }),
    text("nationality_p14", 14, 126, 206.4, 130, "copy.nationality", { fontSize: 7, ...p }),
    text("email_p14", 14, 368, 206.4, 179, "copy.email", { fontSize: 7, ...p }),
    multiline("client_profile", 14, 58, 236.5, 488, 258, "typed", p),
    ...[308.4, 318.7, 329.0].map((y, index) => text(`qualification_${index + 1}`, 14, 126, y, 420, "typed", { fontSize: 7, ...p })),
    ...[359.2, 369.5, 379.8].map((y, index) => text(`work_experience_${index + 1}`, 14, 126, y, 420, "typed", { fontSize: 7, ...p })),
    ...[410.4, 420.7].map((y, index) => text(`honorary_position_${index + 1}`, 14, 126, y, 420, "typed", { fontSize: 7, ...p })),
    text("capital_market_experience_years", 14, 262, 441, 100, "typed", { fontSize: 7, ...p }),
    multiline("source_of_funds", 14, 58, 492, 488, 513, "typed", p),
    text("net_worth_usd_p14", 14, 126, 537, 130, "copy.net_worth_usd", { fontSize: 7, ...p }),
    text("gross_annual_income", 14, 126, 558.5, 420, "typed", { fontSize: 7, ...p }),
    multiline("wealth_details", 14, 126, 575.5, 420, 592, "typed", p),
    tick("regulatory_action", 14, 8, { Yes: [443, 654.5], No: [495.5, 654.5] }, p),
    multiline("regulatory_action_details", 14, 158, 683.4, 388, 694, "typed", p),
    text("rm_name", 14, 425, 733.6, 120, "typed", { fontSize: 7, ...p }),
    text("rm_email", 14, 425, 743.8, 120, "typed", { fontSize: 7, ...p }),
    text("rm_contact_number", 14, 425, 754, 120, "typed", { fontSize: 7, ...p }),
  ];
}

function nominationPage() {
  const n = { section: "nomination" };
  return [
    tick("wish_to_nominate", 21, 8.7, { "Do not wish to nominate": [115.2, 95.0], "Wish to nominate": [269.5, 95.0] }, n),
    text("place_p21", 21, 55, 605.5, 100, "copy.place", n),
    comb("form_date_p21", 21, 623.0, 54.8, 8, "copy.form_date", { pitch: 14.41, ...n }),
  ];
}

export function listApplicationFields() {
  return [...firstApplicantPage(), ...kycAndBankPage(), ...fatcaPage(), ...secondApplicantPages(), ...investorProfilePage(), ...nominationPage()];
}

export const APPLICATION_SIGNATURE_BOXES = [
  { page: 7, x: 31.1, y: 654.2, w: 165.7, h: 86.6, signer: "subscriber", label: "First applicant's declaration" },
  { page: 10, x: 31.1, y: 475.8, w: 165.9, h: 86.4, signer: "joint_holder", label: "Second applicant's declaration" },
  { page: 14, x: 55.5, y: 725.5, w: 203, h: 32.3, signer: "subscriber", label: "Investor profile (specimen signature)" },
  { page: 21, x: 444.5, y: 505.5, w: 110.5, h: 56.5, signer: "subscriber", label: "Nomination - first applicant" },
  { page: 21, x: 444.5, y: 565.8, w: 110.5, h: 56.7, signer: "joint_holder", label: "Nomination - second applicant" },
];

/** Printed blanks on the application pages that are deliberately not filled. */
export const APPLICATION_IGNORED_BLANKS = [
  { page: 5, y: 745.7, why: "Remittance purpose for the investor's bank wire (\"Fund, ___ for subscription of ___\"), text for the bank" },
  { page: 5, y: 757.7, why: "Remittance purpose for the investor's bank wire (\"in Class of Units ___\"), text for the bank" },
  ...[148.2, 167.9, 187.6, 253.8, 293.1, 626.0].map((y) => ({ page: 11, y, why: "No PAN declaration: only for a non-resident investor without a PAN (the PAN is filled on page 2)" })),
  { page: 6, y: 543, why: "Section 7 FATCA exemption code: for non-individual investors only" },
];

/** Review sections in page order; "{page}" becomes the page number(s) of the section's fields. */
export const APPLICATION_SECTIONS = [
  ["applicant", "Applicant (KYC + Excel)"], ["kyc", "KYC details (Excel)"], ["bank", "Bank account (Excel)"],
  ["investment", "Investment (Excel)"], ["distributor", "Distributor (Excel)"], ["fatca", "FATCA & CRS (Excel)"],
  ["holding", "Joint holding (Excel)"], ["signed", "Declaration signed"], ["second-applicant", "Second applicant (Excel)"],
  ["second-applicant-signed", "Second applicant signed"], ["profile", "Investor profile"], ["nomination", "Nomination"],
];
