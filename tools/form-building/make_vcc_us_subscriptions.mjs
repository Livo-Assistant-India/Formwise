// Writes the two VCC Subscription Agreement (US) forms - Global Bond Fund Series II (125 pages) and India Equity Fund
// (121 pages) - from ONE field list, so a page the two share has the same keys (and Excel columns) in both forms.
// Every spot is measured on the GBF US blank (PyMuPDF). The IEF form takes the same spot through IEF_PAGES (the page
// and the y shift where that GBF page sits in the IEF agreement); pages only one fund has carry "only". Keys of pages
// that match the Non-US template (tools/form-building/vcc-subscription-base/) are the template's keys and sources.
// Change this file, never the generated folders.   usage (from the repo root): node tools/form-building/make_vcc_us_subscriptions.mjs
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const FORMS = "apps/backend/src/forms/vcc";
const VCC_FILES = "../VCC";
const GLYPH = { w: 7, h: 7 };          // ☐ / ❑ character: its square is 7pt, left = glyph x + 0.8, bottom = baseline (measured on the render)
const roundNumber = (number) => Math.round(number * 100) / 100;

// ---- item builders (GBF coordinates unless "only: ief") ----
/** Text on a printed line: lineY = the line, x0-x1 = its length. */
const line = (key, page, lineY, x0, x1, extra = {}) => ({ type: "field", key, page, x: x0 + 2, y: roundNumber(lineY - 2.5), maxWidth: roundNumber(x1 - x0 - 4), fontSize: 9, ...extra });
/** Text on an underscore run "_____": baseline = the run's text baseline. */
const run = (key, page, baseline, x0, x1, extra = {}) => ({ type: "field", key, page, x: x0 + 2, y: roundNumber(baseline - 1.5), maxWidth: roundNumber(x1 - x0 - 4), fontSize: 9, ...extra });
/** Text at a point (box or after a printed label). */
const at = (key, page, x, y, maxWidth, extra = {}) => ({ type: "field", key, page, x, y, maxWidth, fontSize: 9, ...extra });
/** A tick box question: options = [label, x, y, page?]; size = the box drawn. */
const tick = (key, page, size, options, extra = {}) => ({ type: "tick", key, page, ...size, options, ...extra });
const glyph = (label, x, baseline, page) => [label, roundNumber(x + 0.8), roundNumber(baseline - 1.15), page];
/** A drawn square: x0, top, side -> tick inside it (y = top + 0.85 side). */
const square = (label, x0, top, side, page) => [label, x0, roundNumber(top + 0.85 * side), page];
/** A tick on an underscore / short line (x0-x1): the tick sits in the middle of the line. */
const onRun = (label, x0, x1, baseline, page) => [label, roundNumber((x0 + x1) / 2 - 4.5), roundNumber(baseline - 0.5), page];
const SQUARE_9 = { w: 9.2, h: 9.2 };
const RUN_TICK = { w: 9, h: 9 };
const OPTIONAL = { isOptional: true };
const sign = (label, page, x, y, w, h, signer = "subscriber", extra = {}) => ({ type: "sign", label, page, x, y, w, h, signer, ...extra });
const yesNo = (key, page, yesX, noX, y, size, extra) => tick(key, page, size, size === GLYPH ? [glyph("Yes", yesX, y), glyph("No", noX, y)] : [["Yes", yesX, y], ["No", noX, y]], extra);
const ticked = (key, page, x, y, size = SQUARE_9, extra = {}) => tick(key, page, size, [size === GLYPH ? glyph("Ticked", x, y) : ["Ticked", x, y]], { isOptional: true, ...extra });
const copyOf = (fieldKey) => ({ source: `copy.${fieldKey}` });
const REQUIRED = { required: true };
const NAME_UPPER = { source: "document.name|upper", required: true };

const US_PERSON_CATEGORIES = [["Natural person resident in the U.S.", 237.0, 215.4], ["U.S. partnership or corporation", 285.3, 248.2],
  ["Estate with a U.S. executor or administrator", 321.5, 281.0], ["Trust with a U.S. trustee", 381.9, 324.6],
  ["U.S. agency or branch of a foreign entity", 430.2, 368.3], ["Non-discretionary account for a U.S. Person", 454.4, 390.2],
  ["Discretionary account held by a U.S. dealer or fiduciary", 490.6, 422.9], ["Non-U.S. entity formed by a U.S. Person to invest", 551.0, 466.6]];
const FORM_PF_TYPES = [["Individual that is a United States person", 281.6], ["Individual that is not a United States person", 316.5], ["Broker-dealer", 351.5],
  ["Insurance company", 369.0], ["Registered investment company", 386.6], ["Private fund", 404.0], ["Non-profit", 421.5],
  ["Pension plan (not governmental)", 439.0], ["Banking or thrift institution", 456.5], ["State or municipal government entity", 474.1],
  ["State or municipal governmental pension plan", 491.5], ["Sovereign wealth fund or foreign official institution", 509.0],
  ["Non-U.S. person, beneficial ownership unknown", 526.5], ["Other", 567.1]];

// ---- the field list, by review section ----
const SECTIONS = [
  { key: "applicant", title: "Applicant particulars (KYC + Excel)", items: [
    line("subscriber_name", 3, 227.1, 206.4, 522.9, NAME_UPPER),
    line("applicant_alias", 3, 273.5, 206.4, 522.9),
    tick("applicant_type", 3, GLYPH, [glyph("Individual (natural person)", 211.9, 319.4), glyph("Entity (legal person / arrangement)", 211.9, 332.6)], REQUIRED),
    line("entity_type", 3, 358.4, 348.3, 522.9),
    line("authorised_signatory_name", 3, 416.3, 334.3, 522.9),
    line("authorised_signatory_designation", 3, 451.4, 334.3, 522.9),
    line("nationality", 3, 474.9, 206.4, 522.9),
    line("dob", 3, 532.9, 206.4, 364.6, { source: "document.dob", required: true, alsoAt: [{ page: 93, x: 317.1, y: 464.6, maxWidth: 200 }] }),
    line("passport_or_id_number", 3, 590.8, 206.4, 364.6, { source: "document.passport" }),
    line("ssn_or_tax_id_number", 3, 637.4, 206.4, 364.6),
    line("occupation", 3, 661.1, 206.4, 522.9),
    line("source_of_funds", 3, 696.1, 206.4, 522.9),
    line("residence_address_line1", 3, 719.6, 206.4, 522.9, { source: "document.address|withoutCareOf|addressLine1|upper", alsoAt: [{ page: 93, x: 317.1, y: 262.9, maxWidth: 200 }] }),
    line("residence_address_line2", 3, 743.1, 206.4, 522.9, { source: "document.address|withoutCareOf|addressLine2|upper", alsoAt: [{ page: 93, x: 317.1, y: 281.9, maxWidth: 200 }] }),
    { ...line("residence_address_line3", 4, 259.2, 206.4, 522.9), only: "ief" },
    line("correspondence_address_line_1", 4, 118.1, 206.4, 522.9), line("correspondence_address_line_2", 4, 141.6, 206.4, 522.9),
    line("correspondence_address_line_3", 4, 165.3, 206.4, 522.9),
    line("mobile", 4, 188.9, 206.4, 364.6, REQUIRED), line("fax", 4, 212.4, 206.4, 364.6), line("email", 4, 236.1, 206.4, 522.9, REQUIRED),
  ] },
  { key: "joint", title: "Joint applicant (joint applications only)", items: [
    line("joint_holder_name", 5, 165.0, 206.4, 522.9), line("joint_holder_applicant_alias", 5, 211.5, 206.4, 522.9),
    tick("joint_holder_applicant_type", 5, GLYPH, [glyph("Individual (natural person)", 211.9, 257.3), glyph("Entity (legal person / arrangement)", 211.9, 270.6)], OPTIONAL),
    line("joint_holder_entity_type", 5, 296.3, 348.3, 522.9),
    line("joint_holder_authorised_signatory_name", 5, 354.4, 334.3, 522.9), line("joint_holder_authorised_signatory_designation", 5, 389.3, 334.3, 522.9),
    line("joint_holder_nationality", 5, 412.8, 206.4, 522.9), line("joint_holder_dob", 5, 470.9, 206.4, 364.6),
    line("joint_holder_passport_or_id_number", 5, 528.9, 206.4, 364.6), line("joint_holder_ssn_or_tax_id_number", 5, 575.3, 206.4, 364.6),
    line("joint_holder_occupation", 5, 599.0, 206.4, 522.9), line("joint_holder_source_of_funds", 5, 634.1, 206.4, 522.9),
    line("joint_holder_residence_address_line1", 5, 657.7, 206.4, 522.9), line("joint_holder_residence_address_line2", 5, 681.1, 206.4, 522.9),
    line("joint_holder_residence_address_line3", 5, 704.6, 206.4, 522.9),
    line("joint_holder_correspondence_address_line_1", 6, 83.5, 206.4, 522.9), line("joint_holder_correspondence_address_line_2", 6, 107.2, 206.4, 522.9),
    line("joint_holder_correspondence_address_line_3", 6, 130.8, 206.4, 522.9),
    line("joint_holder_mobile", 6, 154.3, 206.4, 364.6), line("joint_holder_fax", 6, 178.0, 206.4, 364.6), line("joint_holder_email", 6, 201.6, 206.4, 522.9),
  ] },
  { key: "subscription", title: "Subscription and bank (Excel)", items: [
    { ...at("subscription_amount", 7, 349, 107, 168, REQUIRED), only: "gbf" },
    { ...at("series", 7, 349, 143.5, 168, REQUIRED), only: "gbf" },
    { ...at("series", 7, 349, 108, 168, REQUIRED), only: "ief" },
    { ...at("subscription_amount", 7, 349, 158, 168, REQUIRED), only: "ief" },
    { ...at("subscription_fee", 7, 349, 199, 168), only: "ief" },
    { ...at("total_subscription_monies", 7, 349, 234, 168), only: "ief" },
    line("wiring_bank_name", 7, 344.1, 257.2, 525.5), line("wiring_bank_branch", 7, 367.5, 257.2, 525.5),
    line("wiring_bank_account_number", 7, 391.0, 257.2, 525.5), line("wiring_bank_routing_details", 7, 414.5, 257.2, 525.5),
    line("wiring_bank_routing_details_line_2", 7, 438.0, 256.5, 525.5),
    { ...sign("Bank account confirmation", 7, 108, 516, 155, 26), only: "gbf" },
    { ...sign("Bank account confirmation", 7, 108, 608, 155, 26), only: "ief" },
    { ...at("subscriber_name_bank_confirmation", 7, 165, 572, 300, copyOf("subscriber_name")), only: "gbf" },
    { ...at("subscriber_name_bank_confirmation", 7, 158, 654.9, 300, copyOf("subscriber_name")), only: "ief" },
    tick("wiring_bank_in_fatf_country", 7, GLYPH, [glyph("Yes", 143.2, 689.4), glyph("No", 143.2, 702.6)], REQUIRED),
    tick("applicant_customer_of_wiring_bank", 7, GLYPH, [glyph("Yes", 143.2, 750.5), glyph("No", 143.2, 763.8)], OPTIONAL),
    line("correspondent_bank_name", 8, 142.9, 257.2, 525.5), line("correspondent_swift_code", 8, 166.6, 257.2, 525.5),
    line("bank_name", 8, 201.6, 257.2, 525.5, REQUIRED), line("swift_code", 8, 225.4, 257.2, 525.5, REQUIRED),
    line("account_name", 8, 260.4, 257.2, 525.5, { ...copyOf("subscriber_name"), required: true }),
    line("account_number", 8, 284.1, 257.2, 525.5, REQUIRED), line("account_currency", 8, 307.7, 256.5, 525.5),
    tick("joint_instructions", 8, GLYPH, [glyph("Any of the joint applicants", 72, 467.0), glyph("All of the joint applicants", 72, 511.3)], OPTIONAL),
  ] },
  { key: "signature", title: "Signature of applicant", items: [
    line("subscriber_name_signature_page", 9, 209.3, 202.6, 522.9, copyOf("subscriber_name")),
    line("authorised_signatory_name_signature_page", 9, 246.1, 202.6, 522.9, copyOf("authorised_signatory_name")),
    line("authorised_signatory_designation_signature_page", 9, 283.6, 202.6, 522.9, copyOf("authorised_signatory_designation")),
    sign("Subscription agreement signed", 9, 72, 338, 163, 27),
    line("form_date", 9, 400.8, 127.7, 235, { source: "today", required: true }),
  ] },
  { key: "ira", title: "IRA / directed trustee (only if it applies)", items: [
    { ...sign("IRA owner / directing individual", 10, 96, 311, 214, 25, "ira_investor"), only: "ief" },
    { ...line("ira_owner_print_name", 10, 372.5, 94.8, 312), only: "ief" },
    { ...line("ira_custodian_name_address_line_1", 10, 444.0, 94.8, 312), only: "ief" },
    { ...line("ira_custodian_name_address_line_2", 10, 468.5, 94.8, 312), only: "ief" },
    { ...line("ira_custodian_name_address_line_3", 10, 493.0, 94.8, 312), only: "ief" },
    { ...line("ira_account_reference_number", 10, 540.5, 94.8, 312), only: "ief" },
    { ...sign("IRA applicant signature", 10, 96, 563, 214, 25, "ira_investor"), only: "ief" },
    { ...sign("IRA custodian (authorised signatory)", 10, 90, 655, 214, 25, "custodian"), only: "ief" },
    { ...line("ira_custodian_signatory_name_title", 10, 716.5, 88.6, 306.3), only: "ief" },
  ] },
  { key: "singapore-investor", title: "Annex 3 · Accredited / institutional investor (Singapore)", items: [
    { ...tick("singapore_investor_status", 53, GLYPH, [
      glyph("A1(a) Individual: net personal assets over S$2 million", 528.3, 260.5), glyph("A1(b) Individual: net financial assets over S$1 million", 528.3, 307.1),
      glyph("A1(c) Individual: income of S$300,000 or more", 525.3, 470.1), glyph("A2 Corporation: net assets over S$10 million", 528.3, 517.4),
      glyph("A3 Entity: net assets over S$10 million", 528.3, 117.9, 54), glyph("A4 Partnership of accredited investors", 528.3, 152.8, 54),
      glyph("A5 Corporation owned by accredited investors", 528.3, 199.3, 54), glyph("A6 Joint account with an accredited investor", 528.3, 234.3, 54),
      glyph("A7 Trustee of a trust", 528.3, 269.3, 54),
      ...SINGAPORE_INSTITUTIONAL_OPTIONS("gbf")], REQUIRED), only: "gbf" },
    { ...tick("singapore_investor_status", 58, GLYPH, [
      glyph("A1(a) Individual: net personal assets over S$2 million", 494.9, 261.3), glyph("A1(b) Individual: net financial assets over S$1 million", 494.9, 307.8),
      glyph("A1(c) Individual: income of S$300,000 or more", 494.9, 459.3), glyph("A2 Corporation: net assets over S$10 million", 494.9, 505.9),
      glyph("A3 Entity: net assets over S$10 million", 494.9, 82.8, 59), glyph("A4 Partnership of accredited investors", 494.9, 117.9, 59),
      glyph("A5 Corporation owned by accredited investors", 494.9, 164.3, 59), glyph("A6 Joint account with an accredited investor", 494.9, 199.3, 59),
      glyph("A7(a) Trust: all beneficiaries accredited", 494.9, 257.8, 59), glyph("A7(b) Trust: all settlors accredited", 494.9, 292.8, 59),
      glyph("A7(c) Trust: subject matter over $10 million", 494.9, 398.3, 59),
      glyph("B1 Government of Singapore", 494.7, 452.8, 59), glyph("B2 Statutory board", 494.7, 478.1, 59),
      glyph("B3(a) Government-owned entity managing its own funds", 494.7, 627.7, 59), glyph("B3(b) Government-owned entity managing government funds", 494.7, 653.0, 59),
      glyph("B3(c) Government-owned entity managing other government funds", 494.7, 699.5, 59),
      ...SINGAPORE_INSTITUTIONAL_OPTIONS("ief")], REQUIRED), only: "ief" },
    { ...line("statutory_board_specified_line_1", 54, 555.1, 240.1, 469.1), ief: { page: 59, y: 521.8 - 2.5 } },
    { ...line("statutory_board_specified_line_2", 54, 575.0, 240.1, 469.1), ief: { page: 59, y: 541.9 - 2.5 } },
    { ...line("statutory_board_specified_line_3", 54, 595.0, 240.1, 469.1), ief: { page: 59, y: 561.8 - 2.5 } },
    { ...line("multilateral_agency_specified_line_1", 55, 340.6, 240.1, 473.9), ief: { page: 60, y: 305.7 - 2.5 } },
    { ...line("multilateral_agency_specified_line_2", 55, 360.6, 240.1, 473.9), ief: { page: 60, y: 325.6 - 2.5 } },
    { ...line("multilateral_agency_specified_line_3", 55, 380.7, 240.1, 473.9), ief: { page: 60, y: 345.6 - 2.5 } },
  ] },
  { key: "accredited-consent", title: "Annex 4 · Accredited investor consent", items: [
    line("subscriber_name_accredited_consent", 61, 504.5, 202.6, 522.9, copyOf("subscriber_name")),
    line("authorised_signatory_name_accredited_consent", 61, 541.3, 202.6, 522.9, copyOf("authorised_signatory_name")),
    line("authorised_signatory_designation_accredited_consent", 61, 578.8, 202.6, 522.9, copyOf("authorised_signatory_designation")),
    sign("Accredited investor consent", 61, 72, 635, 163, 26),
    line("form_date_accredited_consent", 61, 696.0, 127.7, 235, copyOf("form_date")),
  ] },
  { key: "us-accredited", title: "Annex 5 · Accredited investor (US Regulation D)", items: [
    tick("us_accredited_investor_category", 62, RUN_TICK, [
      onRun("A1 Individual: net worth over $1,000,000", 108, 144, 198.4), onRun("A2 Individual: income over $200,000 ($300,000 joint)", 108, 144, 233.5),
      onRun("A3 Holds a Series 7, 82 or 65 licence", 108, 144, 303), onRun("A4 Knowledgeable employee of the Fund", 108, 144, 360.9),
      onRun("A5 Spouse of a knowledgeable employee", 108, 144, 384.4), onRun("B1 Entity: total assets over $5,000,000", 108, 144, 454.4),
      onRun("B2 Entity: every equity owner accredited", 108, 144, 501),
      onRun("C1 Family office", 108, 146.8, 140.8, 63), onRun("C2 Family client of a family office", 108, 146.8, 233.3, 63),
      onRun("D1 ERISA plan, decision by a plan fiduciary", 108, 144, 304.4, 63), onRun("D2 ERISA plan: total assets over $5,000,000", 108, 144, 374, 63),
      onRun("D3 State plan: total assets over $5,000,000", 108, 144, 408.9, 63), onRun("E IRA, Keogh or self-directed plan", 108, 144, 501.9, 63),
      onRun("F 501(c)(3) organisation", 108, 144, 652.5, 63), onRun("G1 Trust: total assets over $5,000,000", 108, 144, 722.4, 63),
      onRun("G2 Bank or savings institution as trust fiduciary", 108, 144, 141.4, 64), onRun("G3 Revocable trust, grantors accredited", 108, 144, 210.9, 64),
      onRun("H Bank or savings and loan association", 108, 144, 292.4, 64), onRun("I Insurance company", 108, 144, 362.5, 64),
      onRun("J1 Director, officer or general partner of the Fund", 108, 144, 420.9, 64), onRun("J2 Registered broker or dealer", 108, 144, 456, 64),
      onRun("J3 Registered investment adviser", 108, 146.8, 489.8, 64), onRun("J4 Exempt reporting adviser", 108, 146.8, 524.9, 64),
      onRun("J5 Registered investment company", 108, 146.8, 559.9, 64), onRun("J6 Business development company", 108, 144, 595.9, 64),
      onRun("J7 Small Business Investment Company", 108, 144, 630.5, 64), onRun("J8 Rural Business Investment Company", 108, 144, 676.9, 64)], REQUIRED),
    run("plan_fiduciary_name", 63, 348.4, 232.7, 404.9),
  ] },
  { key: "us-person", title: "U.S. person status", items: [
    { ...tick("us_person_status", 65, GLYPH, [glyph("A. U.S. Person", 135, 188.7), glyph("B. Not a U.S. Person (non-U.S. branch or agency)", 135, 623.3),
      glyph("C. Not a U.S. Person (non-U.S. employee benefit plan)", 135, 695.9), glyph("D. Not a U.S. Person (no category applies)", 135, 81.8, 66)], REQUIRED), only: "gbf" },
    { ...tick("us_person_status", 73, GLYPH, [glyph("A. U.S. Person", 135, 171.1), glyph("B. Not a U.S. Person (non-U.S. branch or agency)", 135, 533.3),
      glyph("C. Not a U.S. Person (non-U.S. employee benefit plan)", 135, 598.9), glyph("D. Not a U.S. Person (no category applies)", 135, 654.6)], REQUIRED), only: "ief" },
    { ...tick("us_person_category", 65, GLYPH, US_PERSON_CATEGORIES.map(([label, gbfY]) => glyph(label, 108, gbfY)), OPTIONAL), only: "gbf" },
    { ...tick("us_person_category", 73, GLYPH, US_PERSON_CATEGORIES.map(([label, , iefY]) => glyph(label, 108, iefY)), OPTIONAL), only: "ief" },
    { ...line("subscriber_name_us_person_status", 66, 131.1, 288, 504.1, copyOf("subscriber_name")), ief: { page: 73, y: 689.5 - 2.5 } },
    { ...sign("U.S. person status", 66, 305, 168, 195, 22), only: "gbf" },
    { ...sign("U.S. person status", 73, 304, 699, 195, 22), only: "ief" },
    { ...line("us_person_status_signer_name", 66, 215.7, 323.1, 432.1, copyOf("subscriber_name")), ief: { page: 73, x: 321.8, y: 744.1 - 2.5 } },
    { ...line("us_person_status_signer_title", 66, 239.8, 376.1, 468.1, copyOf("authorised_signatory_designation")), ief: { page: 73, x: 369.8, y: 765.9 - 2.5 } },
  ] },
  { key: "benefit-plan", title: "Benefit plan investor / ERISA (US)", items: [
    { ...line("benefit_plan_organisation_initial", 67, 167.4, 104.1, 140.1), ief: { page: 84, x: 156.8, y: 200 } },
    { ...run("benefit_plan_country_of_organisation", 67, 200.9, 177.4, 494.1), ief: { page: 84, x: 226.1, y: 245.8, maxWidth: 257 } },
    { ...run("benefit_plan_principal_place_of_business", 67, 223.8, 361.6, 489.4), ief: { page: 84, x: 408.4, y: 268.9, maxWidth: 107 } },
    { ...line("beneficial_owner_residence_initial", 67, 247.9, 103.8, 139.8), ief: { page: 84, x: 156.8, y: 291.9 } },
    { ...run("beneficial_owner_individual_residence", 67, 281.3, 181.5, 414.8), ief: { page: 84, x: 279.4, y: 326.4, maxWidth: 229 } },
    { ...tick("benefit_plan_investor_status", 67, SQUARE_9, [square("Not a Benefit Plan Investor", 145.1, 319.1, 9.2), square("Benefit Plan Investor", 140.7, 422.6, 9.2)], REQUIRED), only: "gbf" },
    { ...tick("benefit_plan_investor_status", 84, RUN_TICK, [onRun("Benefit Plan Investor", 172.2, 211.1, 350.8), onRun("Not a Benefit Plan Investor", 230.8, 269.7, 350.8)], REQUIRED), only: "ief" },
    { ...tick("benefit_plan_investor_type", 67, SQUARE_9, [square("ERISA plan (ERISA)", 217.1, 457.1, 9.2), square("IRA, Keogh or other plan (E-IRC)", 217.1, 537.5, 9.2),
      square("Entity holding plan assets (E-25%+)", 217.1, 572.1, 9.2)], OPTIONAL), only: "gbf" },
    { ...tick("benefit_plan_investor_type", 84, SQUARE_9, [square("ERISA plan (ERISA)", 181.1, 389.1, 9.2), square("IRA, Keogh or other plan (E-IRC)", 181.1, 458.6, 9.2),
      square("Entity holding plan assets (E-25%+)", 181.1, 493.6, 9.2)], OPTIONAL), only: "ief" },
    { ...tick("plan_assets_percentage", 67, SQUARE_9, PERCENT_OPTIONS([176.7, 253.1, 325.1, 397.1, 469.2], 721.7, 733.1), OPTIONAL), only: "gbf" },
    { ...run("plan_assets_maximum_percent", 84, 618.2, 386.4, 430.7), only: "ief" },
    { ...tick("benefit_plan_equity_interest", 85, SQUARE_9, [square("Less than 25% held by Benefit Plan Investors", 181.1, 131.5, 9.2),
      square("25% or more held by Benefit Plan Investors", 181.1, 224.1, 9.2)], OPTIONAL), only: "ief" },
    { ...run("benefit_plan_equity_percent", 85, 301.4, 204.5, 226.8), only: "ief" },
    { ...tick("insurance_company_general_account", 68, SQUARE_9, [square("No plan assets in the general account", 181.1, 176.5, 9.2),
      square("Part of the general account is plan assets", 181.1, 234.0, 9.2)], OPTIONAL), ief: { page: 85, dy: 233.6 } },
    { ...tick("insurance_plan_assets_percentage", 68, SQUARE_9, PERCENT_OPTIONS([154.1, 217.1, 289.1, 361.1, 433.2], 303.0, 314.6), OPTIONAL), only: "gbf" },
    { ...run("insurance_plan_assets_maximum_percent", 85, 522.4, 166.2, 188.4), only: "ief" },
    { ...tick("control_person_affiliate", 68, RUN_TICK, [onRun("Yes", 169.5, 202.8, 518.3), onRun("No", 417.1, 455.9, 518.3)], OPTIONAL),
      ief: { page: 85, options: [onRun("Yes", 241.5, 274.9, 719.4), onRun("No", 453.1, 492.0, 719.4)] } },
    { ...tick("guaranteed_leveraged_product", 85, RUN_TICK, [onRun("Is", 176.9, 199.1, 742.9), onRun("Is not", 218.4, 240.6, 742.9)], REQUIRED), only: "ief" },
    { ...run("leveraged_product_description", 86, 81.4, 400.6, 528.4), only: "ief" },
    { ...run("leveraged_product_description_line_2", 86, 104.4, 144, 521.9), only: "ief" },
    { ...tick("government_entity", 68, RUN_TICK, [onRun("Is", 171.9, 210.7, 541.4), onRun("Is not", 230.2, 269.0, 541.4)], REQUIRED),
      ief: { page: 86, options: [onRun("Is", 171.8, 210.7, 162.9), onRun("Is not", 230.2, 268.9, 162.9)] } },
    { ...run("government_entity_name", 68, 587.3, 72, 505.4), ief: { page: 86, y: 215.8, maxWidth: 296 } },
    { ...run("controlling_government_entity_name", 86, 283.4, 72, 372), only: "ief" },
    { ...line("pay_to_play_initial", 68, 645.9, 154.8, 190.8), ief: { page: 86, x: 191.1, y: 390.4, maxWidth: 23 } },
    { ...run("pay_to_play_other_laws", 69, 138.9, 144, 521.9), ief: { page: 86, x: 74, y: 484.9, maxWidth: 374 } },
    { ...tick("registered_fund", 86, RUN_TICK, [onRun("Is", 172.5, 211.3, 525.4), onRun("Is not", 231.5, 270.3, 525.4)], REQUIRED), only: "ief" },
    { ...yesNo("bank_holding_company_act", 87, ...squareYesNo(209.3, 254.4, 73.1), SQUARE_9, REQUIRED), only: "ief" },
    { ...yesNo("freedom_of_information_act", 69, ...squareYesNo(209.3, 254.4, 211.7), SQUARE_9, REQUIRED), ief: { page: 87, dy: 350 } },
    { ...run("foia_laws_details_line_1", 69, 265.9, 108, 519.2), ief: { page: 87, x: 146, y: 637.8, maxWidth: 374 } },
    { ...run("foia_laws_details_line_2", 69, 277.5, 108, 519.2), ief: { page: 87, x: 146, y: 649.4, maxWidth: 374 } },
    { ...run("foia_laws_details_line_3", 69, 288.9, 108, 519.2), ief: { page: 87, x: 146, y: 660.9, maxWidth: 358 } },
    { ...yesNo("fund_of_funds", 69, ...squareYesNo(209.3, 254.4, 326.7), SQUARE_9, REQUIRED), ief: { page: 86, options: [square("Yes", 209.3, 131.1, 9.2), square("No", 251.7, 131.1, 9.2)] } },
    { ...tick("rule_506d_group", 69, RUN_TICK, [onRun("Is", 168.6, 190.8, 369.4), onRun("Is not", 207.3, 246.2, 369.4)], REQUIRED),
      ief: { page: 87, options: [onRun("Is", 244.9, 267.0, 696.9), onRun("Is not", 283.8, 322.6, 696.9)] } },
    { ...tick("voting_trust_arrangement", 69, RUN_TICK, [onRun("Does", 489.9, 523.2, 404.0), onRun("Does not", 139.2, 178.0, 415.5)], REQUIRED),
      ief: { page: 87, options: [onRun("Does", 121.6, 154.9, 742.9), onRun("Does not", 188.3, 227.2, 742.9)] } },
    { ...run("rule_506d_group_names", 69, 518.9, 108, 480.4), ief: { page: 88, y: 141.9 } },
    { ...run("voting_trust_agreements", 69, 564.9, 108, 480.4), ief: { page: 88, y: 184.9 } },
    { ...yesNo("other_beneficial_interest", 69, ...squareYesNo(199.4, 244.5, 706.2), SQUARE_9, REQUIRED), ief: { page: 88, options: [square("Yes", 202.1, 356.1, 9.2), square("No", 241.7, 356.1, 9.2)] } },
    { ...run("account_party_entity_name", 70, 265.3, 300.9, 478.6), ief: { page: 88, y: 568.4 } },
    { ...sign("Account party (entity)", 70, 316, 276, 160, 23, "entity"), ief: { page: 88, y: 601 } },
    { ...run("account_party_signatory_name_title", 70, 345.9, 300.9, 478.6), only: "gbf" },
  ] },
  { key: "bad-actor", title: "Bad actor questionnaire", items: [
    ...[["bad_actor_felony_conviction", 71, 192.6], ["bad_actor_court_injunction", 71, 307.6], ["bad_actor_state_regulator_order", 71, 445.6],
      ["bad_actor_fraud_order", 71, 537.5], ["bad_actor_sec_disciplinary_order", 71, 664.1], ["bad_actor_sec_cease_and_desist", 72, 107.5],
      ["bad_actor_sro_suspension", 72, 176.5], ["bad_actor_stop_order", 72, 257.1], ["bad_actor_usps_false_representation", 72, 326.1]]
      .map(([key, page, top]) => yesNo(key, page, ...squareYesNo(468.7, 500.3, top), SQUARE_9, REQUIRED)),
    ...[380.3, 391.8, 403.4, 414.9].map((baseline, index) => run(`bad_actor_details_line_${index + 1}`, 72, baseline, 72, 492.1)),
  ] },
  { key: "new-issues", title: "Annex 9 · New issues (FINRA 5130 / 5131)", items: NEW_ISSUES_ITEMS() },
  { key: "singapore-tax", title: "Singapore tax status", items: [
    tick("beneficial_owner", 80, GLYPH, [glyph("Yes", 100.3, 384.9), glyph("No", 100.3, 406.1)], REQUIRED),
    line("beneficial_owner_name", 80, 448.5, 213.3, 525.5), line("beneficial_owner_address", 80, 486.3, 213.3, 525.5),
    line("beneficial_owner_address_line_2", 80, 511.6, 213.3, 525.5), line("beneficial_owner_address_line_3", 80, 537.0, 213.3, 525.5),
    tick("singapore_tax_status", 81, { w: 5.6, h: 5.6 }, [square("Not tax resident in Singapore and not a citizen", 72.6, 176.1, 5.6), square("Tax resident in Singapore and/or a citizen", 72.6, 248.8, 5.6)], REQUIRED),
    tick("sg_entity_category", 81, GLYPH, [glyph("(a) Not tax resident in Singapore", 72, 393.5), glyph("(b) Approved person - Section 13O / 13OA", 72, 552.4),
      glyph("(c) Approved person - Section 13U", 72, 599.6), glyph("(d) Approved trust - Section 13D", 72, 646.9), glyph("(e) Designated person", 72, 694.2),
      glyph("(f) None of these", 72, 720.2)], OPTIONAL),
    ...[["sg_entity_q1_tax_resident", 142.7], ["sg_entity_q2", 275.9], ["sg_entity_q3", 397.7], ["sg_entity_q4", 508.0], ["sg_entity_q5", 581.2]]
      .map(([key, baseline]) => yesNo(key, 82, ...[107.4, 213.8, baseline], GLYPH, OPTIONAL)),
    line("associate_name", 82, 657.9, 107.4, 525.8), line("associate_ownership_percent", 82, 742.7, 106.7, 525.8),
  ] },
  { key: "tax-offences", title: "Designated tax offences", items: [
    ...[["tax_offence_1a", 86, 520.4], ["tax_offence_1b", 86, 556.4], ["tax_offence_1c", 86, 582.7], ["tax_offence_1d", 86, 618.7], ["tax_offence_1e", 86, 689.1],
      ["tax_offence_1f", 87, 82.8], ["tax_offence_1g", 87, 130.3], ["tax_offence_2a", 87, 202.3], ["tax_offence_2b", 87, 238.3], ["tax_offence_2c", 87, 274.4],
      ["tax_offence_2d", 87, 310.4], ["tax_offence_2e", 87, 357.9], ["tax_offence_3", 87, 462.8]]
      .map(([key, page, baseline]) => yesNo(key, page, 455.1, 500.9, baseline, GLYPH, REQUIRED)),
    yesNo("tax_offence_part2", 87, 455.1, 500.9, 629.3, GLYPH, OPTIONAL),
    line("tax_offence_part2_matters", 87, 702.1, 71.1, 532.8),
    sign("Tax offences questionnaire", 88, 74, 411, 210, 26),
    line("form_date_tax_offences", 88, 472.5, 286.2, 353.5, copyOf("form_date")),
    line("subscriber_name_tax_offences", 88, 496.0, 286.2, 523.4, copyOf("subscriber_name")),
    line("authorised_signatory_name_tax_offences", 88, 519.5, 286.2, 523.4, copyOf("authorised_signatory_name")),
    line("authorised_signatory_designation_tax_offences", 88, 565.5, 286.2, 523.4, copyOf("authorised_signatory_designation")),
  ] },
  { key: "individual-tax", title: "FATCA / CRS · individual (KYC)", items: [
    run("surname", 93, 155.8, 315.1, 520.6, { source: "document.name|surname|upper", required: true }), run("title", 93, 174.9, 315.1, 520.6),
    run("given_name", 93, 193.8, 315.1, 520.6, { source: "document.name|givenName|upper", required: true }),
    run("middle_name", 93, 212.8, 315.1, 520.6, { source: "document.name|middleNames|upper" }),
    run("residence_country", 93, 302.5, 315.1, 520.6, { source: "document.country|upper", required: true }),
    run("pincode", 93, 321.4, 315.1, 520.6, { source: "document.pincode" }),
    run("mailing_address_line1", 93, 377.2, 315.1, 520.6), run("mailing_address_line2", 93, 396.2, 315.1, 520.6),
    run("mailing_country", 93, 415.2, 315.1, 520.6), run("mailing_postcode", 93, 434.2, 315.1, 520.6),
    tick("us_tax_status", 93, GLYPH, [glyph("U.S. citizen or resident", 108, 545.0), glyph("Born in the U.S., citizenship given up", 108, 609.3),
      glyph("Not a U.S. citizen or resident", 108, 641.6)], REQUIRED),
    run("us_tin", 93, 590.2, 108, 363.6),
    ...[1, 2, 3].flatMap((row) => {
      const suffix = row === 1 ? "" : `_${row}`;
      const baseline = [255.7, 278.2, 301.1][row - 1];
      return [at(`tax_residence_country${suffix}`, 94, 118, baseline, 139, row === 1 ? copyOf("residence_country") : {}),
        at(`tax_reference_type${suffix}`, 94, 263, baseline, 124, row === 1 ? { source: "default.PAN" } : {}),
        at(`tax_reference_number${suffix}`, 94, 393, baseline, 127, row === 1 ? { source: "document.pan", required: true } : {})];
    }),
    run("tin_unavailable_reason", 94, 344.7, 72, 522.1),
    sign("Tax self-certification", 94, 173, 571, 250, 25),
    run("subscriber_name_tax_self_certification", 94, 630.9, 171.3, 426.9, copyOf("subscriber_name")),
    run("form_date_tax_self_certification", 94, 665.5, 171.3, 426.9, copyOf("form_date")),
    run("signing_capacity", 94, 755.4, 171.3, 426.9),
  ] },
  { key: "entity-tax", title: "FATCA / CRS · entity (entities only)", items: ENTITY_TAX_ITEMS() },
  { key: "controlling-person", title: "FATCA / CRS · controlling person (entities only)", items: CONTROLLING_PERSON_ITEMS() },
  { key: "k1-consent", title: "Schedule K-1 electronic delivery consent", items: [
    { ...sign("Schedule K-1 electronic consent (optional)", 118, 316, 356, 136, 23, "k1_consent"), only: "gbf" },
    { ...run("subscriber_name_k1_consent", 118, 414.9, 315.1, 453.9, copyOf("subscriber_name")), only: "gbf" },
    { ...run("form_date_k1_consent", 118, 437.8, 315.1, 453.9, copyOf("form_date")), only: "gbf" },
  ] },
  { key: "cfius", title: "Annex 16 · CFIUS questionnaire", items: [
    ...[["cfius_foreign_national", 224.3], ["cfius_foreign_government", 270.7], ["cfius_foreign_entity", 351.8], ["cfius_foreign_controlled_entity", 432.8],
      ["cfius_us_national_under_foreign_control", 571.9]].map(([key, top]) => ({ ...yesNo(key, 122, ...squareYesNo(446.7, 497.1, top), SQUARE_9, REQUIRED), only: "gbf" })),
    { ...yesNo("cfius_non_us_limited_partner", 123, ...squareYesNo(451.3, 501.7, 73.1), SQUARE_9, REQUIRED), only: "gbf" },
    ...[["cfius_additional_foreign_national", 354.5], ["cfius_additional_foreign_government", 391.4], ["cfius_additional_foreign_entity", 428.1],
      ["cfius_additional_foreign_controlled_us_national", 476.5], ["cfius_additional_foreign_controlled_entity", 524.7], ["cfius_additional_not_a_foreign_person", 607.5]]
      .map(([key, baseline]) => ({ ...ticked(key, 123, 59.2, baseline, GLYPH), only: "gbf" })),
    { ...tick("cfius_additional_non_us_limited_partner", 123, GLYPH, [glyph("Yes", 59.2, 655.9), glyph("No", 95.5, 82.8, 124)], OPTIONAL), only: "gbf" },
    { ...tick("bad_actor_disqualification", 124, GLYPH, [glyph("Yes", 59.2, 258.1), glyph("No", 59.2, 282.9)], REQUIRED), only: "gbf" },
  ] },
  { key: "further-representations", title: "Annex 3A · Further representations", items: [
    { ...line("subscriber_name_further_representations", 62, 125.5, 185.2, 522.9, copyOf("subscriber_name")), only: "ief" },
    { ...ticked("aml_verification_acknowledged", 62, 72, 193.8, GLYPH, { isOptional: false, required: true }), only: "ief" },
    { ...ticked("natural_person_own_behalf", 62, 72, 326.6, GLYPH), only: "ief" },
    { ...ticked("designated_body_declaration", 62, 72, 378.9, GLYPH), only: "ief" },
    { ...line("designated_body_licence_description", 62, 401.0, 206.4, 522.9), only: "ief" },
    { ...line("designated_body_regulator", 62, 447.4, 206.4, 522.9), only: "ief" },
    { ...line("designated_body_jurisdiction", 62, 470.9, 206.4, 522.9), only: "ief" },
    { ...ticked("corporate_applicant_declaration", 62, 72, 590.2, GLYPH), only: "ief" },
    { ...line("corporate_incorporation_date", 62, 612.2, 206.4, 320.2), only: "ief" },
    { ...line("corporate_incorporation_country", 62, 647.3, 206.4, 522.9), only: "ief" },
    ...[1, 2, 3].flatMap((director) => ["name", "residential_address_line_1", "residential_address_line_2", "business_address_line_1",
      "business_address_line_2", "occupation", "dob"].map((part, index) => ({
      ...line(`director_${director}_${part}`, 63, roundNumber(104.2 + 180.6 * (director - 1) + 25.8 * index), 228.3, part === "dob" ? 341.5 : 522.9), only: "ief" }))),
  ] },
  { key: "form-pf", title: "Annex 6 · Form PF investor type", items: [
    { ...tick("form_pf_capacity", 72, SQUARE_9, [square("Acting for a beneficial owner (trustee, agent or nominee)", 109.1, 150.6, 9.2),
      square("Acting on its own behalf", 109.1, 191.1, 9.2)], REQUIRED), only: "ief" },
    { ...tick("form_pf_investor_type", 72, { w: 5.6, h: 6.3 }, FORM_PF_TYPES.map(([label, imageTop]) => [label, 83.8, roundNumber(imageTop + 2.5 + 0.85 * 6.3)]), REQUIRED), only: "ief" },
    { ...run("form_pf_us_individual_dob", 72, 307.8, 165, 242.7), only: "ief" },
    { ...run("form_pf_non_us_individual_dob", 72, 342.9, 162.2, 206.6), only: "ief" },
    { ...run("form_pf_country_of_birth", 72, 342.9, 281.6, 342.7), only: "ief" },
    { ...run("form_pf_country_of_citizenship", 72, 342.9, 443.2, 509.9), only: "ief" },
    { ...run("form_pf_other_type", 72, 575.9, 206.1, 500.6), only: "ief" },
  ] },
  { key: "pep", title: "Politically exposed person", items: [
    tick("pep_status", 125, { w: 4.5, h: 4.5 }, [square("Yes", 72.7, 451.9, 4.5), square("No", 72.7, 475.5, 4.5)], REQUIRED),
    ...[538.5, 562.0, 585.5, 609.3].map((baseline, index) => ({ ...run(`pep_details_${index + 1}`, 125, baseline, 74.5, 521.7), ...(index === 3 ? { only: "gbf" } : {}) })),
    at("subscriber_name_pep", 125, 106, 657.7, 300, copyOf("subscriber_name")),
    sign("PEP self-certification", 125, 74, 693, 190, 24),
    at("form_date_pep", 125, 100, 757.8, 150, copyOf("form_date")),
  ] },
];

// ---- helpers used in SECTIONS (function declarations are hoisted) ----
function squareYesNo(yesX, noX, top) { return [yesX, noX, roundNumber(top + 0.85 * 9.2)]; }
function PERCENT_OPTIONS(columnXs, topRow1, topRow2) {
  return [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((percent, index) => square(`${percent}%`, columnXs[index % 5], index < 5 ? topRow1 : topRow2, 9.2));
}
function SINGAPORE_INSTITUTIONAL_OPTIONS(fund) {
  // [label, GBF page, GBF baseline, IEF page, IEF baseline]; x 494.7 on both.
  const rows = [["B4 Government-owned entity", 55, 117.9, 60, 82.8], ["B5 Central bank outside Singapore", 55, 199.8, 60, 164.8],
    ["B6 Central government outside Singapore", 55, 225.1, 60, 190.1], ["B7 Agency of a foreign central government", 55, 250.5, 60, 215.4],
    ["B8 Multilateral agency or supranational body", 55, 285.4, 60, 250.5], ["B9 Licensed bank (Singapore)", 55, 411.4, 60, 376.5],
    ["B10 Merchant bank", 55, 436.7, 60, 401.7], ["B11 Finance company", 55, 471.8, 60, 436.7], ["B12 Insurance company or society", 55, 506.7, 60, 462.1],
    ["B13 Trust company", 55, 541.8, 60, 497.1], ["B14(a) CMS licence: dealing in capital markets products", 55, 590.6, 60, 545.8],
    ["B14(b) CMS licence: advising on corporate finance", 55, 615.9, 60, 571.2], ["B14(c) CMS licence: fund management", 55, 641.1, 60, 596.5],
    ["B14(d) CMS licence: REIT management", 55, 666.5, 60, 621.8], ["B14(e) CMS licence: product financing", 55, 691.8, 60, 647.1],
    ["B14(f) CMS licence: credit rating services", 55, 717.1, 60, 672.3], ["B14(g) CMS licence: custodial services", 55, 742.4, 60, 697.7],
    ["B15 Approved exchange", 56, 82.8, 60, 723.0], ["B16 Recognised market operator", 56, 108.1, 60, 748.3], ["B17 Approved clearing house", 56, 133.5, 61, 82.8],
    ["B18 Recognised clearing house", 56, 158.8, 61, 108.1], ["B19 Licensed trade repository", 56, 184.0, 61, 133.5],
    ["B20 Licensed foreign trade repository", 56, 209.3, 61, 158.8], ["B21 Approved holding company", 56, 234.6, 61, 184.0],
    ["B22 Depository (Section 81SF)", 56, 259.9, 61, 209.3], ["B23 Regulated foreign financial entity or trust", 56, 285.3, 61, 234.6],
    ["B24 Pension fund or collective investment scheme", 56, 400.7, 61, 338.7], ["B25 Dealer in bonds with accredited / expert investors", 56, 435.8, 61, 373.6],
    ["B26 Designated market-maker", 56, 470.7, 61, 408.6], ["B27 Headquarters company or finance and treasury centre", 56, 505.7, 61, 443.7],
    ["B28 Fund manager for up to 30 qualified investors", 56, 598.3, 61, 536.1], ["B29 Lloyd's service company", 56, 633.3, 61, 571.2],
    ["B30 Corporation owned by institutional investors", 56, 679.8, 61, 617.6], ["B31 Partnership of institutional investors", 56, 714.8, 61, 652.7]];
  return rows.map(([label, gbfPage, gbfY, iefPage, iefY]) => (fund === "gbf" ? glyph(label, 494.7, gbfY, gbfPage) : glyph(label, 494.7, iefY, iefPage)));
}

function NEW_ISSUES_ITEMS() {
  // Annex 9, GBF only: every box is "check all that apply" -> one optional tick each. Squares 9.2pt at x 78.5.
  const box = (key, page, top, x = 78.5) => ({ ...ticked(`new_issues_${key}`, page, x, roundNumber(top + 0.85 * 9.2)), only: "gbf" });
  const subItem = (key, page, baseline) => ({ ...tick(`new_issues_${key}`, page, RUN_TICK, [onRun("Ticked", 136.3, 158.5, baseline)], OPTIONAL), only: "gbf" });
  const text = (field) => ({ ...field, only: "gbf" });
  return [
    box("restricted_person_election", 73, 389.6, 73.1),
    box("restricted_broker_dealer", 73, 530.1), box("restricted_broker_dealer_personnel", 73, 553.6), box("restricted_broker_dealer_agent", 74, 73.1),
    box("restricted_family_of_broker_dealer_personnel", 74, 108.1), box("restricted_finder_or_fiduciary", 74, 166.1), box("restricted_portfolio_manager", 74, 200.5),
    box("restricted_family_of_portfolio_manager", 74, 258.1), box("restricted_broker_dealer_owner_schedule_a", 74, 293.1),
    box("restricted_broker_dealer_owner_10_percent", 74, 351.2), box("restricted_family_of_broker_dealer_owner", 74, 432.0),
    box("restricted_account_with_beneficial_interest", 74, 490.1), box("unrestricted_none_apply", 75, 73.1),
    box("covered_public_company_officer", 75, 271.6),
    text(line("new_issues_public_company_names_line_1", 75, 350.4, 135.1, 495.2)), text(line("new_issues_public_company_names_line_2", 75, 374.0, 135.1, 495.2)),
    box("covered_non_public_company_officer", 75, 388.1),
    text(line("new_issues_covered_non_public_company_names_line_1", 75, 501.4, 135.1, 495.2)), text(line("new_issues_covered_non_public_company_names_line_2", 75, 525.0, 135.1, 495.2)),
    box("covered_supported_person", 75, 539.1),
    text(line("new_issues_covered_company_names_line_1", 75, 595.0, 135.1, 495.2)), text(line("new_issues_covered_company_names_line_2", 75, 618.4, 135.1, 495.2)),
    box("covered_account_beneficial_interest", 76, 73.1), box("covered_private_fund", 76, 108.1), box("covered_no_restricted_party_interest", 76, 177.6),
    box("covered_exempted_entity", 76, 212.5),
    ...[470.9, 494.3, 517.9].flatMap((baseline, index) => [text(run(`new_issues_entity_investor_company_${index + 1}`, 76, baseline, 77.4, 255.1)),
      text(run(`new_issues_entity_investor_interest_${index + 1}`, 76, baseline, 313.5, 446.9))]),
    box("exempt_public_company", 77, 189.6), box("exempt_registered_investment_company", 77, 259.1), box("exempt_foreign_investment_company", 77, 282.6),
    subItem("exempt_foreign_investment_company_listed", 77, 314.3), subItem("exempt_foreign_investment_company_no_5_percent_owner", 77, 349.4),
    subItem("exempt_foreign_investment_company_not_formed_for_restricted", 77, 407.3),
    box("exempt_erisa_plan", 77, 434.1), box("exempt_charitable_organisation", 77, 469.1), box("exempt_common_trust_fund", 77, 492.7),
    subItem("exempt_common_trust_fund_1000_accounts", 77, 535.9), subItem("exempt_common_trust_fund_no_restricted_limit", 77, 559.4),
    box("exempt_insurance_account", 77, 586.1),
    subItem("exempt_insurance_account_1000_policyholders", 77, 617.8), subItem("exempt_insurance_account_no_restricted_limit", 77, 664.4),
    box("exempt_state_benefit_plan", 77, 714.1), box("exempt_church_plan", 78, 73.1), box("exempt_foreign_retirement_plan", 78, 96.6),
    subItem("exempt_foreign_retirement_plan_10000_participants", 78, 139.8), subItem("exempt_foreign_retirement_plan_non_discriminatory", 78, 174.9),
    subItem("exempt_foreign_retirement_plan_fiduciary_trustees", 78, 221.3), subItem("exempt_foreign_retirement_plan_not_broker_dealer_sponsored", 78, 267.9),
    box("exempt_5130_account", 78, 306.6),
    subItem("exempt_5130_account_below_10_percent", 78, 361.4), subItem("exempt_5130_account_limits_participation", 78, 396.4),
    text(run("new_issues_restricted_persons_percent", 78, 442.8, 247.1, 275.0)),
    box("exempt_5131_account", 78, 551.1),
    subItem("exempt_5131_account_below_25_percent", 78, 605.8), subItem("exempt_5131_account_limits_participation", 78, 652.4),
    text(run("new_issues_covered_parties_percent", 79, 92.9, 480.8, 508.5)),
    ...[290.5, 313.8, 337.4].flatMap((baseline, index) => [text(run(`new_issues_exempt_covered_company_${index + 1}`, 79, baseline, 77.4, 255.1)),
      text(run(`new_issues_exempt_covered_company_interest_${index + 1}`, 79, baseline, 324.8, 458.1))]),
  ];
}

function ENTITY_TAX_ITEMS() {
  const entityBox = (key, page, x, baseline) => ticked(key, page, x, baseline, GLYPH);
  const squareBox = (key, page, x, top, side) => ticked(key, page, x, roundNumber(top + 0.85 * side), { w: side, h: side });
  const tableRow = (prefix, page, baseline, columns) => columns.map(([key, x0, x1]) => at(`${prefix}${key}`, page, x0 + 3, baseline, roundNumber(x1 - x0 - 6)));
  return [
    run("entity_legal_name", 97, 140.9, 72, 345), run("entity_country_of_incorporation", 97, 140.9, 355.6, 522.1),
    run("entity_address_street", 97, 214.7, 72, 425), run("entity_address_city", 97, 214.7, 432.1, 522.1),
    run("entity_address_state", 97, 251.7, 72, 305), run("entity_address_postcode", 97, 251.7, 313, 425), run("entity_address_country", 97, 251.7, 433.7, 522.1),
    line("entity_mailing_street", 97, 326.3, 72, 425), line("entity_mailing_city", 97, 326.3, 432.1, 524.9),
    run("entity_mailing_state", 97, 362.3, 72, 305), run("entity_mailing_postcode", 97, 362.3, 313, 425), run("entity_mailing_country", 97, 362.3, 433.7, 522.1),
    entityBox("entity_specified_us_person", 98, 108, 143.1), run("entity_us_tin", 98, 159.4, 254.8, 521.4),
    entityBox("entity_us_person_not_specified", 98, 108, 178.3), run("entity_us_exemption", 98, 192.0, 110.8, 377.4),
    entityBox("entity_fi_singapore_or_iga", 98, 108, 330.4), entityBox("entity_fi_registered_deemed_compliant", 98, 108, 343.7),
    entityBox("entity_fi_participating", 98, 108, 357.0), run("entity_giin", 98, 411.0, 90, 323.3),
    entityBox("entity_fi_sponsored", 98, 108, 465.5), run("sponsoring_entity_name", 98, 510.8, 254.8, 432.5), run("sponsoring_entity_giin", 98, 529.9, 252.1, 429.7),
    entityBox("entity_fi_trustee_documented_trust", 98, 108, 548.8), run("trustee_name", 98, 581.1, 206.7, 384.4), run("trustee_giin", 98, 600.1, 206.7, 384.4),
    entityBox("entity_fi_certified_deemed_compliant", 98, 108, 619.1),
    run("entity_non_reporting_exemption", 99, 101.8, 108, 508.1), entityBox("entity_fi_non_participating", 99, 108, 120.9),
    entityBox("entity_exempt_beneficial_owner", 99, 90, 185.4), run("exempt_beneficial_owner_status", 99, 204.7, 92.8, 292.7),
    entityBox("entity_active_nffe", 99, 90, 223.7), run("direct_reporting_nffe_giin", 99, 262.0, 144, 338.5),
    run("nffe_sponsoring_entity_name", 99, 313.0, 288, 443.6), run("nffe_sponsoring_entity_giin", 99, 332.1, 288, 443.6),
    entityBox("entity_passive_nffe", 99, 90, 363.2),
    ...[474.5, 505.0, 535.6].map((baseline, index) => at(`passive_nffe_controlling_person_${index + 1}`, 99, 117, baseline, 362)),
    ...[253.5, 277.2, 301.0].flatMap((baseline, index) => tableRow("entity_", 100, baseline, [[`tax_residence_country_${index + 1}`, 77.9, 257.6],
      [`tax_reference_type_${index + 1}`, 258.0, 383.6], [`tax_reference_number_${index + 1}`, 384.1, 545.5]])),
    run("entity_tin_unavailable_reason", 100, 334.6, 72, 522.1),
    squareBox("crs_entity_is_fi", 100, 109.1, 408.4, 9.2), squareBox("crs_reporting_fi", 100, 127.1, 456.4, 9.2), squareBox("crs_non_reporting_fi", 100, 127.1, 482.7, 9.2),
    tick("crs_non_reporting_fi_type", 100, SQUARE_9, [["Governmental Entity", 522.3], ["International Organization", 535.6], ["Central Bank", 548.9],
      ["Broad Participation Retirement Fund", 562.3], ["Narrow Participation Retirement Fund", 575.6], ["Pension Fund of a Governmental Entity / Intl. Org. / Central Bank", 588.9],
      ["Exempt Collective Investment Vehicle", 615.2], ["Trust whose trustee reports all required information", 628.5], ["Qualified Credit Card Issuer", 654.8],
      ["Other Entity defined under domestic law", 667.9]].map(([label, top]) => square(label, 163.1, top, 9.2)), OPTIONAL),
    run("entity_other_type", 100, 715.7, 162, 478.6),
    squareBox("crs_fi_non_participating_jurisdiction", 101, 127.1, 116.9, 5.8),
    tick("crs_npj_fi_type", 101, SQUARE_9, [square("(a) Investment Entity managed by another FI", 181.1, 165.4, 9.2), square("(b) Other Investment Entity", 181.1, 389.2, 9.2),
      square("(c) Other Financial Institution", 181.1, 402.4, 9.2)], OPTIONAL),
    ...[288.0, 318.5, 349.0].map((baseline, index) => at(`npj_controlling_person_${index + 1}`, 101, 138, baseline, 362)),
    entityBox("entity_active_nfe_crs", 101, 108, 450.0), run("stock_exchange_name", 101, 527.5, 145.7, 345.6),
    run("regularly_traded_corporation_name", 101, 584.5, 142.9, 515.3),
    ticked("entity_active_nfe_regularly_traded", 101, 126.5, 494.7, GLYPH),
    entityBox("entity_active_nfe_governmental", 101, 125.9, 599.9), entityBox("entity_active_nfe_other", 101, 125.9, 629.0),
    { ...entityBox("entity_passive_nfe_crs", 102, 108, 82.4), ief: { page: 105, dy: 573 } },
    ...[184.0, 214.6, 245.1].map((baseline, index) => ({ ...at(`crs_passive_nfe_controlling_person_${index + 1}`, 102, 135, baseline, 362), ief: { page: 106, dy: -45 } })),
    sign("Entity authorised signatory 1", 103, 172, 176, 64, 21, "entity"), sign("Entity authorised signatory 2", 103, 424, 176, 80, 21, "entity"),
    run("entity_signatory_1_title", 103, 233.7, 134.7, 240.3), run("entity_signatory_2_title", 103, 233.7, 386.8, 503.4),
    run("entity_signatory_1_date", 103, 271.6, 158.7, 236.3), run("entity_signatory_2_date", 103, 271.6, 410.7, 505.1),
  ];
}

function CONTROLLING_PERSON_ITEMS() {
  const rowKeys = [["cp_surname", 164.4], ["cp_given_name", 184.9], ["cp_middle_name", 202.9], ["cp_address_line1", 258.6], ["cp_address_line2", 276.4],
    ["cp_country", 294.4], ["cp_postcode", 312.4], ["cp_mailing_line1", 383.7], ["cp_mailing_line2", 401.3], ["cp_mailing_country", 419.3],
    ["cp_mailing_postcode", 437.3], ["cp_dob", 475.1], ["cp_entity_name_1", 563.6], ["cp_entity_name_2", 581.3], ["cp_entity_name_3", 599.1]];
  const typeRows = [["a. Legal person - control by ownership", 159.4, 197.2], ["b. Legal person - control by other means", 197.2, 235.0],
    ["c. Legal person - senior managing official", 235.0, 272.8], ["d. Trust - settlor", 272.8, 297.4], ["e. Trust - trustee", 297.4, 321.9],
    ["f. Trust - protector", 321.9, 346.5], ["g. Trust - beneficiary", 346.5, 371.1], ["h. Trust - other", 371.1, 395.6],
    ["i. Legal arrangement - settlor-equivalent", 395.6, 433.4], ["j. Legal arrangement - trustee-equivalent", 433.4, 471.2],
    ["k. Legal arrangement - protector-equivalent", 471.2, 509.0], ["l. Legal arrangement - beneficiary-equivalent", 509.0, 546.8],
    ["m. Legal arrangement - other-equivalent", 546.8, 584.6]];
  return [
    ...rowKeys.map(([key, baseline]) => run(key, 104, baseline, 315.1, 520.6)),
    tick("controlling_person_us_status", 105, GLYPH, [glyph("U.S. citizen or resident", 108, 139.6), glyph("Born in the U.S., citizenship given up", 108, 203.9),
      glyph("Not a U.S. citizen or resident", 108, 236.2)], OPTIONAL),
    run("cp_us_tin", 105, 184.9, 108, 363.6),
    ...[509.0, 531.4, 554.3].flatMap((baseline, index) => [at(`cp_tax_residence_country_${index + 1}`, 105, 116, baseline, 150),
      at(`cp_tax_reference_type_${index + 1}`, 105, 272.5, baseline, 110), at(`cp_tax_reference_number_${index + 1}`, 105, 389, baseline, 131)]),
    run("cp_tin_unavailable_reason", 105, 615.2, 72, 522.1),
    ...[[1, 396.4], [2, 448.1], [3, 498.2]].map(([entity, centerX]) => tick(`controlling_person_type_entity_${entity}`, 106, RUN_TICK,
      typeRows.map(([label, top, bottom]) => [label, roundNumber(centerX - 4.5), roundNumber((top + bottom) / 2 + 4.5)]), OPTIONAL)),
    sign("Controlling person", 107, 183, 325, 230, 23, "controlling_person"),
    run("cp_print_name", 107, 392.0, 181, 414.3), run("cp_signed_date", 107, 434.9, 180, 413.3), run("cp_signing_capacity", 107, 549.4, 144, 377.3),
  ];
}

// ---- where each GBF page sits in the IEF agreement: [from GBF y, IEF page, y shift] (measured by matching the pages' text) ----
const IEF_PAGES = {
  3: [[0, 3, 186.0], [570, 4, -507.4]], 4: [[0, 4, 176.3]], 5: [[0, 5, 19.5], [550, 5, 20.0]], 6: [[0, 6, 0]],
  7: [[0, 7, 102.5], [680, 7, 63.5], [740, 8, -633.2]], 8: [[0, 8, 72.6], [440, 8, 45.1]], 9: [[0, 9, 0]],
  61: [[0, 68, 0], [450, 68, 11.5]], 62: [[0, 69, 11.5], [530, 69, 0]], 63: [[0, 70, 0]], 64: [[0, 71, 0]],
  71: [[0, 89, -4.5]], 72: [[0, 90, 0]], 80: [[0, 74, 0]], 81: [[0, 75, 0]], 82: [[0, 76, 0]],
  86: [[0, 81, -7.2]], 87: [[0, 82, -7.2]], 88: [[0, 83, -7.2]],
  93: [[0, 97, 0]], 94: [[0, 98, 0]], 97: [[0, 101, 0]], 98: [[0, 102, 0]], 99: [[0, 103, 0]], 100: [[0, 104, 0]], 101: [[0, 105, 0]],
  103: [[0, 107, 0]], 104: [[0, 108, 0]], 105: [[0, 109, 0]], 106: [[0, 110, 0]], 107: [[0, 111, 0]],
  125: [[0, 121, 0], [620, 121, -28.9]],
};

const FUND_ONLY_BLANKS = (checklistPage, fundOnlyPage) => [
  { page: 6, y: 225, why: "Spare empty line under the joint applicant's Email, with no label" },
  { page: checklistPage, y: 100, why: "Checklist tick column (supporting documents and annexes): a reminder list for whoever assembles the pack, not investor data" },
  { page: fundOnlyPage, y: 160, why: "\"To be completed by the Fund only\": the Fund's own acceptance and signature" },
];
const FUNDS = [
  { id: "gbf", formId: "global-bond-fund-us-subscription", fundName: "360 ONE Global Bond Fund - Series II", pageCount: 125,
    label: "Global Bond Fund II – Subscription (US)", shortLabel: "GBF US subscription",
    blankFileName: "360 ONE Global Bond Fund - Series II - Subscription (US).pdf",
    sourcePdf: "360 ONE Global Bond Fund Series - II/360 ONE Global Bond Fund - Series II - Subscription Agreement (US) - 10.11.25.pdf",
    detectionPhrases: ["360 ONE GLOBAL BOND FUND – SERIES II", "SUBSCRIPTION AGREEMENT FOR U.S. INVESTORS"], ignoredBlanks: FUND_ONLY_BLANKS(12, 13) },
  { id: "ief", formId: "india-equity-fund-us-subscription", fundName: "360 ONE India Equity Fund", pageCount: 121,
    label: "India Equity Fund – Subscription (US)", shortLabel: "IEF US subscription",
    blankFileName: "360 ONE India Equity Fund - Subscription (US).pdf",
    sourcePdf: "360 ONE India Equity Fund - Subscription Agreement (U.S.) - 06.05.2025.pdf",
    detectionPhrases: ["360 ONE INDIA EQUITY FUND", "SUBSCRIPTION AGREEMENT"], ignoredBlanks: FUND_ONLY_BLANKS(11, 12) },
];

/** The item as it sits on this fund's blank (null = not on this blank). */
function placeItem(item, fund) {
  if (item.only && item.only !== fund.id) return null;
  if (fund.id === "gbf" || item.only === "ief") return item;
  const moveSpot = (page, y) => {
    const regions = IEF_PAGES[page];
    if (!regions) throw new Error(`${item.key || item.label}: GBF page ${page} has no IEF page in IEF_PAGES`);
    const [, iefPage, shift] = regions.filter(([fromY]) => y >= fromY).pop();
    return { page: iefPage, y: roundNumber(y + shift) };
  };
  const override = item.ief || {};
  if (item.type === "tick") {
    const options = override.options || item.options.map(([label, x, y, page]) => {
      if (override.dy !== undefined) return [label, x, roundNumber(y + override.dy), override.page];
      const moved = moveSpot(page || item.page, y);
      return [label, x, moved.y, moved.page];
    });
    const page = override.page || options[0][3] || item.page;
    return { ...item, page, options: options.map(([label, x, y, optionPage]) => [label, x, y, optionPage || page]) };
  }
  if (override.page) {
    const { dy, ...position } = override;
    return { ...item, ...position, y: dy !== undefined ? roundNumber(item.y + dy) : (position.y ?? item.y) };
  }
  const moved = moveSpot(item.page, item.type === "sign" ? item.y + item.h : item.y);
  const alsoAt = item.alsoAt?.map((repeat) => ({ ...repeat, ...moveSpot(repeat.page, repeat.y) }));
  return { ...item, page: moved.page, y: roundNumber(moved.y - (item.type === "sign" ? item.h : 0)), ...(alsoAt ? { alsoAt } : {}) };
}

function writeFund(fund) {
  const folder = path.join(FORMS, fund.formId);
  mkdirSync(folder, { recursive: true });
  copyFileSync(path.join(VCC_FILES, fund.sourcePdf), path.join("data/Blank Forms", fund.blankFileName));
  const writeJson = (fileName, content) => writeFileSync(path.join(folder, fileName), JSON.stringify(content, null, 2) + "\n");
  const fields = [], tickboxes = [], signatureBoxes = [], fieldSources = {}, requiredFields = [], reviewSections = [];
  for (const section of SECTIONS) {
    const sectionKeys = [];
    const placedItems = section.items.map((item) => placeItem(item, fund)).filter(Boolean);
    for (const item of placedItems) {
      if (item.type === "sign") { signatureBoxes.push({ page: item.page, x: item.x, y: item.y, w: item.w, h: item.h, signer: item.signer, label: item.label }); continue; }
      if (fieldSources[item.key]) throw new Error(`${fund.formId}: key ${item.key} used twice`);
      fieldSources[item.key] = item.source || (item.type === "tick" ? "tick" : "typed");
      if (item.required) requiredFields.push(item.key);
      sectionKeys.push(item.key);
      if (item.type === "tick") {
        tickboxes.push({ key: item.key, page: item.page, w: item.w, h: item.h, ...(item.isOptional ? { isOptional: true } : {}),
          options: item.options.map(([label]) => label),
          boxesByOption: Object.fromEntries(item.options.map(([label, x, y, page]) => [label, [{ ...(page && page !== item.page ? { page } : {}), x, y }]])) });
      } else {
        const { key, page, x, y, fontSize, maxWidth, alsoAt } = item;
        fields.push({ key, nominee: null, page, x, y, fontSize, type: "text", maxWidth, ...(alsoAt ? { alsoAt } : {}) });
      }
    }
    if (!sectionKeys.length) continue;
    const pages = placedItems.flatMap((item) => [item.page, ...(item.options || []).map((option) => option[3] || item.page)]);
    const firstPage = Math.min(...pages), lastPage = Math.max(...pages);
    reviewSections.push({ key: section.key, label: `${firstPage === lastPage ? `Page ${firstPage}` : `Pages ${firstPage}-${lastPage}`} · ${section.title}`, fields: sectionKeys });
  }
  for (const [fieldKey, source] of Object.entries(fieldSources)) {
    const copiedKey = /^copy\.(.+)$/.exec(source)?.[1];
    if (copiedKey && !fieldSources[copiedKey]) throw new Error(`${fund.formId}: ${fieldKey} copies missing ${copiedKey}`);
  }
  const title = `${fund.fundName} - Subscription (US)`;
  writeJson("field-positions.json", { _about: `Where each value is written on the blank ${fund.fundName} Subscription Agreement (US), ${fund.pageCount} pages: x, y = text baseline, top-left origin, points. Made by tools/form-building/make_vcc_us_subscriptions.mjs.`, formId: fund.formId, title, fields });
  writeJson("field-sources.json", { _about: "Form field -> where its value comes from. \"document.X\" = X read from the subscriber's KYC documents; \"typed\" = from the batch Excel or the review screen; \"default.X\" = usually X; \"copy.X\" = same as field X unless typed separately; \"today\" = today's date; \"tick\" = a tick box, answered per client in the Excel (never assumed).", fieldSources });
  writeJson("required-fields.json", { _about: "Fields that must be filled before a case can be confirmed. Our reading of the form until 360 ONE sends its mandatory list.", requiredFields });
  writeJson("form-rules.json", { _about: "Form-level rules. One person (the subscriber): KYC documents fill the identity fields, the Excel fills the rest. Joint applicant fields (joint_holder_...) come from the Excel.",
    formId: fund.formId, group: "VCC", label: fund.label, shortLabel: fund.shortLabel, purpose: "New investment · US investors", blankFileName: fund.blankFileName,
    keyFields: ["Subscription amount", "Subscriber name", "Bank account"], sheetTabName: fund.shortLabel, detectionPhrases: fund.detectionPhrases,
    supportedNomineeCount: 1, personLabel: "Subscriber",
    identityType: { scope: "shared", tickboxField: null, numberField: null, optionByIdentityKind: {}, numberFieldByIdentityKind: {} }, reviewSections });
  writeJson("form-configuration.json", { _about: `${title}, ${fund.pageCount} pages. Made by tools/form-building/make_vcc_us_subscriptions.mjs. Tick boxes: x = box left; y = the ☐ glyph's baseline, or top + 0.85 x side for drawn squares, or the middle of an underscore blank ("initial one" / "check" lines). Every tick box is its own question with no assumed answer; "isOptional" ones apply only to some investors (entities, joint applications, IRAs).`,
    id: fund.formId, title, blankFileName: fund.blankFileName, labels: [], signatureBoxes, tickboxes, tickboxRule: "usual", ignoredBlanks: fund.ignoredBlanks });
  console.log(`wrote ${folder}: ${fields.length} fields, ${tickboxes.length} tick boxes, ${signatureBoxes.length} signatures, ${requiredFields.length} required`);
}

for (const fund of FUNDS) writeFund(fund);
