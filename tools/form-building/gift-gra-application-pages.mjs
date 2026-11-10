// Application pages 4-7 of the 360 ONE Global Real Assets Fund "Application Form & Documentation Set" (71 pages).
// Its pages 8-21 match the GIFT feeder sets (gift-feeder-application-pages.mjs), but pages 4-7 are laid out
// differently: no "Minor Status" row and no guardian block, so the KYC details move up onto page 4, bank / investment /
// distributor and the individual FATCA declaration share page 5, and page 6 holds the joint-holding table with five
// relationships. All four are scans: measured from their pixels with scan_boxes.py (threshold 235).
// Used by make_gift_feeder_subscriptions.mjs.
import {
  ADDRESS_TYPE_OPTIONS, APPLICATION_IGNORED_BLANKS, APPLICATION_SIGNATURE_BOXES, INCOME_OPTIONS, NO_PAN_DOCUMENT_OPTIONS,
  OCCUPATION_OPTIONS, PEP_OPTIONS, comb, investorProfilePage, nominationPage, secondApplicantPages, text, tick,
} from "./gift-feeder-application-pages.mjs";

/** Page 4: the first applicant and their KYC details. */
function applicantAndKycPage() {
  const s = { section: "applicant" }, k = { section: "kyc" };
  return [
    tick("gender", 4, 8.4, { Male: [126.0, 126.0], Female: [155.0, 126.0], Others: [192.3, 126.0], "Non-individual": [227.3, 126.0] }, s),
    comb("subscriber_name", 4, 153.7, 36.3, 41, "document.name|upper", { keepAll: true, ...s }),
    comb("dob", 4, 168.7, 151.0, 8, "document.dob", s),
    tick("citizenship", 4, 8.3, { Indian: [150.7, 171.0], Others: [219.7, 171.0] }, s),
    text("citizenship_country", 4, 285, 177.6, 84, "typed", { fontSize: 7, ...s }),
    text("citizenship_country_code", 4, 416, 177.6, 44, "typed", { fontSize: 7, ...s }),
    tick("residential_status", 4, 8.4, { Resident: [150.3, 181.0], "Non-resident": [199.7, 181.0], "Foreign national": [263.7, 181.0], "Person of Indian origin": [342.3, 181.0] }, s),
    comb("tax_reference_number", 4, 205.7, 151.0, 24, "document.pan", s),
    // "Registered Office Address" (first row) is for non-individuals; an individual's address starts on "Building/ Street/ Locality".
    comb("residence_address_line1", 4, 240.3, 151.0, 24, "document.street|addressLine1|upper", { keepAll: true, ...s }),
    comb("residence_address_line2", 4, 258.0, 36.3, 33, "document.street|addressLine2|upper", { keepAll: true, ...s }),
    comb("city", 4, 275.3, 36.3, 20, "document.city|upper", { keepAll: true, ...s }),
    comb("pincode", 4, 275.3, 380.7, 6, "document.pincode", s),
    comb("residence_country", 4, 292.7, 61.7, 31, "document.country|upper", { keepAll: true, ...s }),
    tick("correspondence_same_as_residence", 4, 8.4, { "Same as above": [229.3, 294.3] }, s),
    comb("mailing_address_line1", 4, 317.3, 112.7, 35, "typed", { keepAll: true, ...s }),
    comb("mailing_address_line2", 4, 333.0, 36.3, 41, "typed", { keepAll: true, ...s }),
    comb("mailing_address_line3", 4, 348.7, 36.3, 28, "typed", { keepAll: true, ...s }),
    comb("mailing_postcode", 4, 348.7, 482.7, 6, "typed", s),
    comb("mailing_country", 4, 365.0, 61.3, 39, "typed", { keepAll: true, ...s }),
    comb("landline", 4, 412.7, 431.3, 10, "typed", s),
    comb("mobile", 4, 428.7, 74.3, 13, "typed", s),
    comb("fax", 4, 428.7, 431.3, 10, "typed", s),
    comb("email", 4, 445.7, 74.3, 38, "typed", { keepAll: true, ...s }),
    tick("occupation", 4, 8.5, OCCUPATION_OPTIONS(514.7, 529.0, [35.7, 114.3, 182.7, 292.0, 398.7, 502.7]), s),
    text("occupation_other", 4, 437, 533.5, 112, "typed", { fontSize: 7, ...s }),
    text("employer_name", 4, 152, 561.5, 404, "typed", s),
    text("place_of_work", 4, 152, 578.5, 404, "typed", s),
    text("business_nature", 4, 152, 606.5, 404, "typed", k),
    text("business_location", 4, 152, 623.2, 404, "typed", k),
    text("business_countries", 4, 152, 640.5, 404, "typed", k),
    tick("gross_annual_income_range", 4, 8.5, INCOME_OPTIONS(648.7, [149.3, 209.7, 262.3, 319.3]), k),
    text("net_worth_usd", 4, 152, 670.2, 404, "typed", k),
    text("net_worth_usd_words", 4, 152, 687.2, 404, "typed", k),
    comb("net_worth_date", 4, 707.7, 149.7, 8, "typed", k),
    tick("pep_status", 4, 8.4, PEP_OPTIONS(743.0), k),
  ];
}

/** Page 5: bank account, investment, distributor and the individual FATCA & CRS declaration. */
function bankAndFatcaPage() {
  const b = { section: "bank" }, i = { section: "investment" }, d = { section: "distributor" }, f = { section: "fatca" };
  const foreignTaxRows = [738.2, 748.5, 759.2].flatMap((y, index) => [
    text(`foreign_tax_country_${index + 1}`, 5, 63.5, y, 104, "typed", { fontSize: 7, ...f }),
    text(`foreign_tax_identification_number_${index + 1}`, 5, 174, y, 135, "typed", { fontSize: 7, ...f }),
    text(`foreign_tax_identification_type_${index + 1}`, 5, 315, y, 237, "typed", { fontSize: 7, ...f }),
  ]);
  return [
    comb("account_name", 5, 104.3, 96.0, 36, "copy.subscriber_name", { keepAll: true, ...b }),
    comb("account_number", 5, 121.3, 95.7, 36, "typed", b),
    comb("bank_name", 5, 138.3, 95.7, 36, "typed", { keepAll: true, ...b }),
    comb("swift_code", 5, 155.7, 134.3, 33, "typed", b),
    comb("bank_address", 5, 172.7, 96.0, 36, "typed", { keepAll: true, ...b }),
    comb("bank_address_line2", 5, 189.3, 32.0, 41, "typed", { keepAll: true, ...b }),
    comb("bank_state", 5, 206.7, 57.7, 18, "typed", { keepAll: true, ...b }),
    comb("bank_country", 5, 206.7, 325.7, 18, "typed", { keepAll: true, ...b }),
    comb("correspondent_bank_name", 5, 224.0, 96.0, 36, "typed", { keepAll: true, ...b }),
    comb("correspondent_swift_code", 5, 238.7, 147.0, 32, "typed", b),
    comb("subscription_amount", 5, 287.3, 198.0, 28, "typed", { keepAll: true, ...i }),
    comb("subscription_amount_words", 5, 302.7, 198.0, 28, "typed", { keepAll: true, fontSize: 7, ...i }),
    text("placement_fee_percent", 5, 86, 320.6, 60, "typed", { fontSize: 7, ...i }),
    text("class_of_units", 5, 131, 333.3, 46, "typed", { fontSize: 7, ...i }),
    // Distributor / placement agent table (one row under the headings).
    text("distributor_code", 5, 34, 570, 73, "typed", { fontSize: 7, ...d }),
    text("distributor_name", 5, 112, 570, 73, "typed", { fontSize: 7, ...d }),
    text("distributor_rm_name", 5, 190.5, 570, 78, "typed", { fontSize: 7, ...d }),
    text("distributor_contact_number", 5, 273.5, 570, 73, "typed", { fontSize: 7, ...d }),
    text("distributor_email", 5, 352, 570, 200, "typed", { fontSize: 7, ...d }),
    tick("address_type", 5, 8.5, ADDRESS_TYPE_OPTIONS(603.0, [106.7, 159.0, 207.3]), f),
    comb("nationality", 5, 628.7, 82.7, 16, "typed", { keepAll: true, ...f }),
    comb("place_of_birth", 5, 628.7, 350.3, 16, "typed", { keepAll: true, ...f }),
    comb("country_of_birth", 5, 645.7, 82.7, 16, "typed", { keepAll: true, ...f }),
    comb("country_of_birth_code", 5, 645.7, 389.0, 13, "typed", { keepAll: true, ...f }),
    comb("father_name", 5, 662.7, 121.0, 34, "typed", { keepAll: true, ...f }),
    tick("identity_document_if_no_pan", 5, 8.5, NO_PAN_DOCUMENT_OPTIONS(667.0, [177.3, 223.3, 292.3, 357.7, 394.3]), f),
    text("identity_document_other", 5, 433, 672.5, 118, "typed", { fontSize: 7, ...f }),
    comb("identity_document_number", 5, 692.3, 108.3, 35, "typed", f),
    tick("tax_resident_outside_india", 5, 8.5, { Yes: [278.7, 696.7], No: [303.0, 696.7] }, f),
    ...foreignTaxRows,
  ];
}

/** Page 6: joint holding (five relationships); page 7: the first applicant signs. */
function holdingAndSignedPages() {
  const h = { section: "holding" };
  return [
    tick("first_second_holder_relationship", 6, 8.6, {
      "Husband - Wife": [190.7, 126.3], "Father - Son": [270.3, 126.3], "Father - Daughter": [350.3, 126.3],
      "Mother - Son": [430.3, 126.3], "Mother - Daughter": [510.0, 126.3] }, h),
    tick("mode_of_holding", 6, 8.6, { Single: [203.3, 142.0], Joint: [337.7, 142.0], "Anyone or survivor": [443.3, 142.0] }, h),
    text("place", 7, 243, 524.5, 108, "typed", { section: "signed" }),
    comb("form_date", 7, 550.7, 240.7, 8, "today", { pitch: 14.33, section: "signed" }),
  ];
}

export function listGraApplicationFields() {
  return [...applicantAndKycPage(), ...bankAndFatcaPage(), ...holdingAndSignedPages(), ...secondApplicantPages(), ...investorProfilePage(), ...nominationPage()];
}

/** Same as the feeder sets, except the first applicant's declaration box on page 7. */
export const GRA_APPLICATION_SIGNATURE_BOXES = [
  { page: 7, x: 33, y: 476, w: 164, h: 85.5, signer: "subscriber", label: "First applicant's declaration" },
  ...APPLICATION_SIGNATURE_BOXES.filter((box) => box.page !== 7),
];

/** Printed blanks on pages 4-7 that are deliberately not filled, plus the shared ones from pages 8-21. */
export const GRA_APPLICATION_IGNORED_BLANKS = [
  { page: 5, y: 510.4, why: "Remittance purpose for the investor's bank wire (\"Fund, Account ___ for subscription of ___\"), text for the bank" },
  { page: 5, y: 524.2, why: "Remittance purpose for the investor's bank wire (\"in Class of Units ___\"), text for the bank" },
  { page: 6, y: 315.3, why: "Section 7 FATCA & CRS for non-individuals (entities) only" },
  ...APPLICATION_IGNORED_BLANKS.filter((blank) => blank.page > 7),
];
