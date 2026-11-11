// The second five NFT closure / bank-service forms, written by make_closure_forms.mjs (same shape as its FORMS):
//   hdfc-aadhaar-consent        HDFC Bank Aadhaar e-KYC consent letter (non-DBT customers)
//   hdfc-rekyc-dormant-activation  HDFC Bank dormant activation + re-KYC for resident individuals (page 1 is a scan)
//   iifl-demat-closure          IIFL Capital account closure request (trading / demat)
//   hdfc-pis-cancellation       HDFC Bank PIS permission cancellation letter (NR accounts; scan stored rotated - its
//                               blank is redrawn upright by make_closure_blanks.py, page 2 is for the bank official)
//   hsbc-pms-closure            HSBC (UBS format) letter closing the accounts opened for PMS investments
// Spots measured with blanks/boxes/scan_boxes and the printed underlines; Wingdings "r" boxes on IIFL.
import { comb, multiline, text, tick } from "./gift-feeder-application-pages.mjs";

const NAME = "document.name|upper";
const sign = (page, x, y, w, h, signer, label) => ({ page, x, y, w, h, signer, label });
/** A signature box sitting on a printed signature line (x0-x1 at baseline y). */
const onLine = (page, [x0, x1, y], signer, label) => sign(page, x0, Math.round((y - 24) * 10) / 10, Math.round((x1 - x0) * 10) / 10, 24, signer, label);
/** Wingdings "r" box glyph at x with glyph top: the drawn square sits ~0.5pt in and 1.5pt down. */
const glyphBox = (x, top) => [x + 0.5, top + 1.5];

const HOLDER_NAMES = (page, y, xs, widths, options = {}) => [
  text("first_holder_name", page, xs[0], y, widths[0], NAME, options),
  text("second_holder_name", page, xs[1], y, widths[1], "typed", options),
  text("third_holder_name", page, xs[2], y, widths[2], "typed", options),
];

export const SECOND_BATCH = [
  {
    formId: "hdfc-aadhaar-consent", label: "Aadhaar e-KYC consent – HDFC Bank", shortLabel: "HDFC Aadhaar consent",
    purpose: "Customer consent to use Aadhaar / e-KYC", pages: 1, sourcePdf: "Individual/Bank/Aadhar Consent Letter_HDFC Bank Ac.pdf",
    blankFileName: "HDFC Bank Aadhaar Consent Letter.pdf", detectionPhrases: ["APPLICATION FOR ACCOUNT OPENING USING AADHAAR"],
    keyFields: ["Customer name", "Branch"],
    fields: (s = { section: "consent" }) => [
      text("branch_name", 1, 146, 118.6, 150, "typed", s),
      text("first_holder_name", 1, 124, 539.3, 210, NAME, s),
      text("form_date", 1, 77, 558, 58, "today", { fontSize: 7.5, ...s }),
    ],
    signatureBoxes: [sign(1, 386, 517, 155, 24, "subscriber", "Customer")],
    ignoredBlanks: [],
    sections: [["consent", "Consent letter"]],
    requiredFields: ["first_holder_name", "branch_name"],
  },
  {
    formId: "hdfc-rekyc-dormant-activation", label: "Dormant activation & re-KYC – HDFC Bank (resident individuals)", shortLabel: "HDFC re-KYC dormant activation",
    purpose: "Reactivate a dormant account and update KYC", pages: 2, sourcePdf: "Individual/Bank/ReKYC-cum-dormant activation.pdf",
    blankFileName: "HDFC Bank ReKYC cum Dormant Activation Form.pdf", detectionPhrases: ["EXTENDED KYC", "AADHAAR CONSENT DECLARATION"],
    keyFields: ["Customer ID", "Account number", "PAN"],
    fields: (p = { section: "personal" }, o = { section: "occupation" }, m = { section: "mailing" }, a = { section: "permanent" }, k = { section: "extended-kyc" }) => {
      const row = (top, xs, labels) => Object.fromEntries(labels.map((label, index) => [label, [xs[index], top]]));
      const address = (prefix, flatBottom, sources) => [
        comb(`${prefix}_address_line1`, 1, flatBottom, 56.0, 35, sources.line1, { pitch: 14.19, keepAll: true, ...sources.section }),
        comb(`${prefix}_address_line2`, 1, flatBottom + 14.4, 56.0, 35, sources.line2, { pitch: 14.19, keepAll: true, ...sources.section }),
        comb(`${prefix}_landmark`, 1, flatBottom + 28.4, 56.0, 35, "typed", { pitch: 14.19, keepAll: true, ...sources.section }),
        comb(`${prefix}_city`, 1, flatBottom + 42.4, 56.0, 19, sources.city, { pitch: 14.19, keepAll: true, ...sources.section }),
        comb(`${prefix}_pincode`, 1, flatBottom + 42.4, 368.0, 6, sources.pincode, { pitch: 14.22, ...sources.section }),
        comb(`${prefix}_state`, 1, flatBottom + 56.7, 56.0, 19, sources.state, { pitch: 14.19, keepAll: true, ...sources.section }),
        comb(`${prefix}_country`, 1, flatBottom + 56.7, 368.0, 13, sources.country, { pitch: 14.21, keepAll: true, ...sources.section }),
      ];
      return [
        comb("customer_id", 1, 154.0, 69.0, 10, "typed", { pitch: 14.2, ...p }),
        comb("account_number", 1, 154.0, 292.3, 14, "typed", { pitch: 14.19, ...p }),
        comb("name_prefix", 1, 190.7, 13.3, 4, "typed", { pitch: 14.35, keepAll: true, ...p }),
        comb("first_holder_name", 1, 190.7, 83.3, 35, NAME, { pitch: 14.19, keepAll: true, ...p }),
        comb("pan", 1, 205.0, 196.7, 10, "document.pan", { pitch: 14.23, ...p }),
        tick("occupation", 1, 9.7, row(243.7, [62.0, 123.0, 189.0, 249.7, 315.0, 372.7, 438.7, 498.3],
          ["Salaried", "Self-employed", "Retired", "Self-employed professional", "Student", "Housewife", "Politician", "Others"]), o),
        tick("employer_type", 1, 9.7, row(265.0, [62.0, 123.0, 189.0, 249.7, 315.0, 372.7, 438.7, 498.3],
          ["Private Limited", "Proprietorship", "Public sector", "Multinational", "Partnership", "Public Limited", "Government", "Others"]), o),
        tick("source_of_funds", 1, 9.7, row(400.0, [62.0, 106.3, 184.7, 245.7, 306.3], ["Salary", "Agriculture", "Business income", "Investment income", "Others"]), o),
        tick("gross_annual_income_range", 1, 9.7, {
          ...row(421.3, [62.0, 107.0, 184.7, 245.7, 306.3, 369.7, 429.7, 487.3],
            ["< 50,000", "50,000 - 1 Lac", "1 - 3 Lac", "3 - 5 Lac", "5 - 7.5 Lac", "7.5 - 10 Lac", "10 - 15 Lac", "> 15.25 Lac"]),
          ...row(433.7, [62.0, 184.7, 245.7], ["> 25.50 Lac", "> 50 Lac - 1 Cr", "> 1 Cr"]) }, o),
        tick("residence_type", 1, 9.7, row(453.0, [62.0, 123.0, 184.7, 245.7], ["Owned", "Rental / Leased", "Ancestral / Family", "Company provided"]), o),
        ...address("mailing", 532.3, { line1: "typed", line2: "typed", city: "typed", pincode: "typed", state: "typed", country: "typed", section: m }),
        text("email", 1, 58, 614, 492, "typed", m),
        comb("mobile", 1, 631.7, 197.7, 10, "typed", { pitch: 14.23, ...m }),
        ...address("residence", 679.3, { line1: "document.street|addressLine1|upper", line2: "document.street|addressLine2|upper",
          city: "document.city|upper", pincode: "document.pincode", state: "document.state|upper", country: "document.country|upper", section: a }),
        tick("tax_resident_outside_india", 2, 8.6, { "Yes - tax resident outside India": [323.7, 72.9] }, k),
        text("maiden_name", 2, 137, 66, 175, "typed", k),
        text("father_name", 2, 137, 98, 175, "typed", k),
        text("spouse_name", 2, 137, 120, 175, "typed", k),
        tick("marital_status", 2, 8.7, { Married: [136.5, 133.9], Unmarried: [187.5, 134.1], Others: [253.1, 134.8] }, k),
        tick("identity_document_type", 2, 8.7, { Passport: [136.6, 151.9], "Driving licence": [136.6, 164.9], "Aadhaar card / letter": [136.6, 177.6],
          "Election / Voter's ID": [136.6, 189.6], "NREGA card": [241.1, 189.5], "NPR letter": [136.6, 202.1] }, k),
        text("identity_document_number", 2, 137, 234, 175, "typed", k),
        tick("residential_status", 2, 8.7, { "Resident individual": [136.5, 252.3], "Non-resident Indian": [220.4, 252.5],
          "Foreign national": [136.5, 266.1], "Person of Indian origin": [220.5, 265.9] }, k),
        tick("address_proof_type", 2, 8.7, { Passport: [137.9, 338.7], "Driving licence": [137.9, 351.1], "Aadhaar card / letter": [137.8, 364.3],
          "Election / Voter's ID": [138.0, 376.4], "NREGA card": [232.1, 376.4], "NPR letter": [137.8, 388.5] }, k),
        text("address_proof_number", 2, 137, 414, 175, "typed", k),
        text("nationality", 2, 137, 485, 175, "typed", k),
      ];
    },
    signatureBoxes: [sign(2, 364, 677, 204, 39, "subscriber", "Applicant signature")],
    ignoredBlanks: [[332.9, "Visa expiry date: only for NRI / foreign nationals"], [743.7, "For bank use"], [761.3, "For bank use"],
      [778.3, "For bank use"], [794.2, "For bank use"], [844.3, "Customer acknowledgement copy: filled by the bank"]].map(([y, why]) => ({ page: 2, y, why })),
    sections: [["personal", "Customer (KYC + Excel)"], ["occupation", "Occupation and income (Excel)"], ["mailing", "Mailing address and contact (Excel)"],
      ["permanent", "Permanent address (KYC)"], ["extended-kyc", "Extended KYC (Excel)"]],
    requiredFields: ["customer_id", "account_number", "first_holder_name", "father_name"],
  },
  {
    formId: "iifl-demat-closure", label: "Account closure – IIFL Capital trading / demat", shortLabel: "IIFL closure",
    purpose: "Close an IIFL trading / demat account", pages: 1, sourcePdf: "Individual/Demat/IIFL Closure.pdf",
    blankFileName: "IIFL Capital Account Closure Form.pdf", detectionPhrases: ["IIFL Capital Services Limited", "ACCOUNT CLOSURE REQUEST FORM"],
    keyFields: ["Login ID", "Client ID", "Reason"],
    fields: (s = { section: "account" }, h = { section: "holders" }, b = { section: "balances" }, a = { section: "acknowledgement" }) => [
      tick("closure_initiated_by", 1, 7, { BO: glyphBox(282.1, 84.5), DP: glyphBox(305.8, 84.5), CDSL: glyphBox(329.4, 84.5), NSDL: glyphBox(363.2, 84.5) }, s),
      tick("closure_for", 1, 7, { "Only trading account": glyphBox(87.8, 121.1), "Only demat account": glyphBox(168.4, 121.1), Both: glyphBox(244.0, 121.1) }, s),
      tick("segment", 1, 7, { "Cash & F&O": glyphBox(71.0, 135.8), Currency: glyphBox(131.4, 135.8), Commodities: glyphBox(180.5, 135.8), "NSEL Spot": glyphBox(247.0, 135.8) }, s),
      comb("login_id", 1, 166.7, 65.3, 8, "typed", { pitch: 22.0, ...s }),
      comb("form_date", 1, 170.8, 479.5, 8, "today", { pitch: 11.34, ...s }),
      tick("cdsl_dp_id", 1, 7, { "12044700": glyphBox(80.5, 176.1), "13014400": glyphBox(136.6, 176.1) }, s),
      tick("nsdl_dp_id", 1, 7, { IN302269: glyphBox(304.3, 175.6), IN300394: glyphBox(356.7, 175.6), IN301557: glyphBox(409.2, 175.6),
        IN301926: glyphBox(461.6, 175.6), IN302470: glyphBox(514.1, 175.6) }, s),
      comb("cdsl_client_id", 1, 207.7, 88.0, 8, "typed", { pitch: 19.12, ...s }),
      comb("nsdl_client_id", 1, 207.7, 317.3, 8, "typed", { pitch: 19.12, ...s }),
      ...HOLDER_NAMES(1, 0, [163, 163, 163], [190, 190, 190], h).map((field, index) => ({ ...field, y: [266, 283, 300][index] })),
      multiline("correspondence_address", 1, 154, 315.5, 198, 333, "document.address|withoutCareOf|upper", { fontSize: 6.5, ...h }),
      text("city", 1, 53, 349.9, 80, "document.city|upper", { fontSize: 7, ...h }),
      text("state", 1, 162, 349.9, 110, "document.state|upper", { fontSize: 7, ...h }),
      text("pincode", 1, 294, 349.9, 60, "document.pincode", { fontSize: 7, ...h }),
      text("closure_reason", 1, 172, 379.8, 395, "typed", { section: "reason" }),
      tick("balance_remaining", 1, 8.5, { "Partly rematerialised and partly transferred": [34.9, 404.5], Rematerialised: [354.5, 404.5],
        "Transferred to another account": [34.9, 418.6], "Not applicable": [354.5, 418.6] }, b),
      comb("target_dp_id", 1, 446.7, 63.7, 8, "typed", { pitch: 25.75, ...b }),
      comb("target_client_id", 1, 446.7, 339.0, 8, "typed", { pitch: 25.75, ...b }),
      tick("balance_present", 1, 8.5, { "Ear-marked": [34.0, 462.5], Pledged: [102.0, 462.5], "Pending for dematerialisation": [148.1, 462.5],
        Frozen: [282.3, 462.5], "Pending for rematerialisation": [324.4, 462.5], "Lock-in": [458.1, 462.5] }, b),
      text("first_holder_name_signed", 1, 100, 530, 152, "copy.first_holder_name", { fontSize: 7, ...h }),
      text("second_holder_name_signed", 1, 258, 530, 152, "copy.second_holder_name", { fontSize: 7, ...h }),
      text("third_holder_name_signed", 1, 416, 530, 152, "copy.third_holder_name", { fontSize: 7, ...h }),
      text("mobile", 1, 148, 712, 92, "typed", h),
      text("rm_contact_number", 1, 404, 712, 165, "typed", h),
      comb("form_date_acknowledgement", 1, 818.0, 479.5, 8, "copy.form_date", { pitch: 11.34, ...a }),
      comb("client_id_acknowledgement", 1, 841.3, 444.0, 8, "copy.nsdl_client_id", { pitch: 16.5, ...a }),
      text("first_holder_name_acknowledgement", 1, 128, 851.5, 445, "copy.first_holder_name", { fontSize: 7, ...a }),
      text("second_holder_name_acknowledgement", 1, 128, 865, 445, "copy.second_holder_name", { fontSize: 7, ...a }),
      text("third_holder_name_acknowledgement", 1, 128, 878.5, 445, "copy.third_holder_name", { fontSize: 7, ...a }),
      text("closure_reason_acknowledgement", 1, 128, 891.8, 445, "copy.closure_reason", { fontSize: 7, ...a }),
    ],
    signatureBoxes: [sign(1, 97, 539, 157, 54, "subscriber", "First / sole holder"), sign(1, 255, 539, 157, 54, "joint_holder", "Second holder"),
      sign(1, 413, 539, 157, 54, "third_holder", "Third holder")],
    ignoredBlanks: [{ page: 1, y: 628.4, why: "\"[DIS]\" in the instructions is not a blank" }],
    sections: [["account", "Closure request (Excel)"], ["holders", "Account holders"], ["reason", "Reason for closure (Excel)"],
      ["balances", "Remaining balances (Excel)"], ["acknowledgement", "Acknowledgement receipt"]],
    requiredFields: ["first_holder_name", "closure_for", "closure_reason"],
  },
  {
    formId: "hdfc-pis-cancellation", label: "PIS permission cancellation – HDFC Bank (NR accounts)", shortLabel: "HDFC PIS cancellation",
    purpose: "Cancel a PIS permission and close the PIS savings account", pages: 2, prebuiltBlank: true,
    blankFileName: "HDFC Bank PIS Permission Cancellation Letter.pdf", detectionPhrases: ["Cancellation of my PIS permission"],
    keyFields: ["PIS permission no", "PIS account no"],
    fields: (s = { section: "pis" }, h = { section: "holders" }) => [
      text("form_date", 1, 92, 79, 120, "today", s),
      text("branch_name", 1, 61, 128, 74, "typed", { fontSize: 7, ...s }),
      text("pis_permission_number", 1, 263, 204.5, 178, "typed", s),
      text("pis_savings_account_number", 1, 253, 229.5, 100, "typed", s),
      tick("pis_cancellation_reason", 1, 9, { "Changed residential status to Resident Indian": [62, 348],
        "Do not intend to trade shares in the secondary market": [62, 373], "Transferring the PIS permission to another bank": [62, 397.5] }, s),
      text("transfer_bank_name", 1, 260, 404, 88, "typed", { fontSize: 7, ...s }),
      ...[449.5, 461.8, 474.2].map((y, index) => text(`transfer_bank_address_line${index + 1}`, 1, 71, y, 272, "typed", { fontSize: 7.5, ...s })),
      text("mobile", 1, 145, 487.5, 88, "typed", s),
      text("email", 1, 307, 490.5, 157, "typed", s),
      text("non_pis_savings_account_number", 1, 262, 526.5, 82, "typed", s),
      text("first_holder_name", 1, 84, 683, 106, NAME, { fontSize: 7.5, ...h }),
      text("second_holder_name", 1, 212, 684, 126, "typed", { fontSize: 7.5, ...h }),
      text("third_holder_name", 1, 348, 685.5, 120, "typed", { fontSize: 7.5, ...h }),
    ],
    signatureBoxes: [onLine(1, [51, 183, 648], "subscriber", "1st account holder"), onLine(1, [205, 331, 650], "joint_holder", "2nd account holder"),
      onLine(1, [346, 466, 652], "third_holder", "3rd account holder")],
    ignoredBlanks: [],
    sections: [["pis", "PIS permission and accounts (Excel)"], ["holders", "Account holders"]],
    requiredFields: ["first_holder_name", "pis_permission_number", "pis_savings_account_number"],
  },
  {
    formId: "hsbc-pms-closure", label: "Account closure – HSBC PMS accounts (UBS format)", shortLabel: "HSBC PMS closure",
    purpose: "Close the HSBC cash, custody, NSDL and PIS accounts opened for PMS", pages: 1, sourcePdf: "Individual/PMS/HSBC PMS/UBS CLOSURE FORMAT.pdf",
    blankFileName: "HSBC PMS Accounts Closure Letter.pdf", detectionPhrases: ["Hongkong And Shanghai Banking Corporation", "opened for the purpose of investments through PMS"],
    keyFields: ["Cash account", "Custody account", "NSDL account"],
    fields: (s = { section: "accounts" }, h = { section: "holders" }) => [
      text("form_date", 1, 125, 140.7, 120, "today", s),
      text("cash_account_number", 1, 236, 233.2, 164, "typed", s),
      text("custody_account_number", 1, 236, 274.7, 164, "typed", s),
      text("nsdl_account_number", 1, 236, 302.3, 164, "typed", s),
      text("pis_permission_number", 1, 236, 329.9, 164, "typed", s),
      text("pis_permission_date", 1, 439, 329.9, 70, "typed", s),
      ...HOLDER_NAMES(1, 454, [92, 236, 380], [122, 122, 122], h),
    ],
    signatureBoxes: [onLine(1, [90, 210, 414.2], "subscriber", "Account holder 1"), onLine(1, [234.1, 354, 414.2], "joint_holder", "Account holder 2"),
      onLine(1, [378.1, 498.1, 414.2], "third_holder", "Account holder 3")],
    ignoredBlanks: [],
    sections: [["accounts", "Accounts to close (Excel)"], ["holders", "Account holders"]],
    requiredFields: ["first_holder_name", "cash_account_number"],
  },
];
