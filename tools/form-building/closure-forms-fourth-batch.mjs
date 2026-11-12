// The last account-closure forms, written by make_closure_forms.mjs (same shape as its FORMS). Word files are first
// turned into PDF blanks by convert_word_blanks.ps1; make_closure_blanks.py then blanks the sample firm name out of the
// partnership resolution. Non-individual forms have no KYC person: every value comes from the Excel.
//   hdfc-poa-revocation-bank-demat   HDFC Bank + demat POA revocation letter (AMC PMS / Consult & Alpha)
//   advisory-termination-notice      Notice of termination of the 360 ONE investment advisory agreement (company)
//   hdfc-dormant-removal             HDFC Bank "removal of dormant & no debit" letter
//   board-resolution-bank-closure    Board resolution - HDFC Bank account closure (company; the Bank folder's copy has the same wording)
//   board-resolution-demat-closure   Board resolution - demat account closure (company)
//   partnership-resolution-bank-closure  Partners' resolution - HDFC Bank account closure (partnership firm)
//   hdfc-deaf-claim-non-individual   HDFC Bank unclaimed deposits (RBI DEAF) request letter for non-individuals
//   hdfc-rekyc-non-individual        HDFC Bank dormancy removal + re-KYC customer updation form for non-individuals
//                                    (pages 1-2 filled; the extended CKYC / FATCA / controlling-person annexures,
//                                    pages 3-8, depend on the entity's structure and are left to the RM - open question)
import { comb, text, tick } from "./gift-feeder-application-pages.mjs";

const NAME = "document.name|upper";
const sign = (page, x, y, w, h, signer, label) => ({ page, x, y, w, h, signer, label });
/** A signature box sitting on a printed signature line (x0-x1 at baseline y). */
const onLine = (page, [x0, x1, y], signer, label) => sign(page, x0, Math.round((y - 24) * 10) / 10, Math.round((x1 - x0) * 10) / 10, 24, signer, label);
const entity = (key = "entity_name") => ({ key, source: "typed" });

/** The three company board resolutions share one wording; only the positions move. p = measured spots. */
function boardResolution(formId, label, shortLabel, purpose, blankFileName, detection, p) {
  return {
    formId, label, shortLabel, purpose, pages: 1, prebuiltBlank: true, blankFileName, detectionPhrases: detection,
    keyFields: ["Company", "Account number", "Directors"],
    fields: (s = { section: "resolution" }) => [
      text("entity_name", 1, p.company[0], p.company[1], p.company[2], "typed", { fontSize: 6.5, ...s }),
      text("meeting_date", 1, p.dated[0], p.dated[1], p.dated[2], "typed", { fontSize: 7.5, ...s }),
      text("account_number", 1, p.account[0], p.account[1], p.account[2], "typed", { fontSize: 7.5, ...s }),
      text("director_1_name", 1, p.director1[0], p.director1[1], p.director1[2], "typed", { fontSize: 7, ...s }),
      text("director_2_name", 1, p.director2[0], p.director2[1], p.director2[2], "typed", { fontSize: 7, ...s }),
      text("entity_name_signed", 1, p.signedFor[0], p.signedFor[1], p.signedFor[2], "copy.entity_name", { fontSize: 7.5, ...s }),
    ],
    signatureBoxes: [sign(1, 112, p.signY - 16, 140, 18, "director", "Director 1"), sign(1, 292, p.signY - 16, 140, 18, "director", "Director 2")],
    ignoredBlanks: [],
    sections: [["resolution", "Resolution (Excel)"]],
    requiredFields: ["entity_name", "account_number", "director_1_name"],
  };
}

export const FOURTH_BATCH = [
  {
    formId: "hdfc-poa-revocation-bank-demat", label: "Power of attorney revocation – HDFC Bank account and demat", shortLabel: "HDFC bank + demat POA revocation",
    purpose: "Revoke the POA given on an HDFC Bank account and demat account", pages: 1, prebuiltBlank: true,
    blankFileName: "HDFC Bank and Demat POA Revocation Letter.pdf", detectionPhrases: ["Request for Revocation of Power of Attorney", "Demat Account No"],
    keyFields: ["Bank account number", "Demat account number"],
    fields: (s = { section: "account" }) => [
      text("branch_name", 1, 92, 123.2, 88, "typed", { fontSize: 7.5, ...s }),
      text("branch_address", 1, 92, 137, 88, "typed", { fontSize: 7, ...s }),
      text("form_date", 1, 446, 166, 80, "today", s),
      text("bank_account_number", 1, 293, 247.4, 124, "typed", s),
      text("demat_account_number", 1, 300, 261.2, 124, "typed", s),
      text("poa_holder_name", 1, 114, 316.4, 168, "typed", { fontSize: 7.5, ...s }),
      text("first_holder_name", 1, 196, 455, 150, NAME, { fontSize: 7.5, ...s }),
    ],
    signatureBoxes: [onLine(1, [90.0, 192.0, 457.0], "subscriber", "Client (all account holders sign)")],
    ignoredBlanks: [],
    sections: [["account", "Accounts (Excel)"]],
    requiredFields: ["first_holder_name", "bank_account_number"],
  },
  {
    formId: "advisory-termination-notice", label: "Notice of termination – 360 ONE investment advisory (company)", shortLabel: "Advisory termination notice",
    purpose: "Terminate the investment advisory services agreement", pages: 1, prebuiltBlank: true,
    blankFileName: "360 ONE Advisory Notice of Termination.pdf", detectionPhrases: ["Sub: Notice of Termination", "Investment Advisory Services Agreement"],
    keyFields: ["Company", "Agreement date", "Effective date"],
    fields: (s = { section: "notice" }) => [
      text("form_date", 1, 77, 118.9, 100, "today", s),
      text("agreement_date", 1, 415, 272.2, 76, "typed", { fontSize: 7.5, ...s }),
      text("entity_name", 1, 393, 285.1, 86, "typed", { fontSize: 7, ...s }),
      text("termination_effective_date", 1, 332, 323.7, 98, "typed", { fontSize: 7.5, ...s }),
      text("entity_name_signed", 1, 138, 426.9, 64, "copy.entity_name", { fontSize: 6.5, ...s }),
    ],
    signatureBoxes: [onLine(1, [43.2, 157.4, 481.5], "authorised_signatory", "For and on behalf of the company")],
    ignoredBlanks: [],
    sections: [["notice", "Termination notice (Excel)"]],
    requiredFields: ["entity_name", "agreement_date", "termination_effective_date"],
  },
  {
    formId: "hdfc-dormant-removal", label: "Removal of dormant & no-debit – HDFC Bank (letter)", shortLabel: "HDFC dormant removal",
    purpose: "Ask HDFC Bank to remove the dormant / no-debit flag", pages: 1, prebuiltBlank: true,
    blankFileName: "HDFC Bank Dormant Removal Letter.pdf", detectionPhrases: ["Removal of Dormant & No Debit"],
    keyFields: ["Account number"],
    fields: (s = { section: "account" }) => [
      text("form_date", 1, 100, 104.9, 100, "today", s),
      text("first_holder_name", 1, 99, 238.7, 95, NAME, { fontSize: 7.5, ...s }),
      text("account_number", 1, 115, 283.7, 80, "typed", { fontSize: 7.5, ...s }),
      text("account_holder_name", 1, 111, 306.1, 80, "copy.first_holder_name", { fontSize: 7, ...s }),
    ],
    signatureBoxes: [onLine(1, [72.0, 148.8, 466.6], "subscriber", "Account holder")],
    ignoredBlanks: [],
    sections: [["account", "Account (Excel)"]],
    requiredFields: ["first_holder_name", "account_number"],
  },
  boardResolution("board-resolution-bank-closure", "Board resolution – HDFC Bank account closure (company)", "Board resolution - bank closure",
    "Company board resolution to close an HDFC Bank account", "Board Resolution - HDFC Bank Account Closure.pdf",
    ["Board resolution format for HDFC bank", "bearing account no.--"],
    { company: [421, 126.4, 68], dated: [116, 136.2, 46], account: [386, 167.4, 92], director1: [216, 206.2, 40], director2: [289, 206.2, 50],
      signedFor: [105, 255.1, 105], signY: 276.7 }),
  boardResolution("board-resolution-demat-closure", "Board resolution – demat account closure (company)", "Board resolution - demat closure",
    "Company board resolution to close a demat account", "Board Resolution - Demat Account Closure.pdf",
    ["Board resolution format for Demat", "Demat Account which was opened"],
    { company: [455, 107, 42], dated: [118, 116.8, 38], account: [406, 146.1, 72], director1: [225, 195, 39], director2: [291, 195, 31],
      signedFor: [106, 253.6, 86], signY: 294.3 }),
  {
    formId: "partnership-resolution-bank-closure", label: "Partners' resolution – HDFC Bank account closure (partnership firm)", shortLabel: "Partnership resolution - bank closure",
    purpose: "Partnership firm resolutions to close the HDFC Bank account (page 1) and the demat account (page 2)", pages: 2, prebuiltBlank: true,
    blankFileName: "Partnership Resolution - HDFC Bank Account Closure.pdf", detectionPhrases: ["MEETING OF BOARD OF PARTNERS", "REGISTERED OFFICE OF THE PARTNERSHIP"],
    keyFields: ["Firm", "Account number", "Partners"],
    fields: (s = { section: "resolution" }) => [
      text("entity_name", 1, 240, 82, 200, "typed", { fontSize: 10, ...s }),
      text("entity_name_meeting", 1, 164, 119.6, 44, "copy.entity_name", { fontSize: 6, ...s }),
      text("registered_office_address", 1, 135, 132.5, 288, "typed", { fontSize: 7.5, ...s }),
      text("account_number", 1, 92, 183.8, 80, "typed", { fontSize: 7.5, ...s }),
      text("partner_1_name", 1, 259, 222.8, 55, "typed", { fontSize: 7, ...s }),
      text("partner_2_name", 1, 362, 222.8, 72, "typed", { fontSize: 7, ...s }),
      text("entity_name_signed", 1, 111, 288.8, 200, "copy.entity_name", s),
      text("entity_name_p2", 2, 107, 139.1, 54, "copy.entity_name", { fontSize: 6.5, section: "demat" }),
      text("meeting_date", 2, 246, 139.1, 60, "typed", { fontSize: 7, section: "demat" }),
      text("registered_office_address_p2", 2, 138, 152, 288, "copy.registered_office_address", { fontSize: 7.5, section: "demat" }),
      text("demat_account_number", 2, 229, 197.3, 98, "typed", { fontSize: 7.5, section: "demat" }),
      text("partner_1_name_p2", 2, 261, 236, 62, "copy.partner_1_name", { fontSize: 7, section: "demat" }),
      text("partner_2_name_p2", 2, 374, 236, 58, "copy.partner_2_name", { fontSize: 7, section: "demat" }),
      text("entity_name_signed_p2", 2, 111, 324.8, 200, "copy.entity_name", { section: "demat" }),
    ],
    signatureBoxes: [onLine(1, [90.0, 224.6, 354.8], "partner", "Partner 1"), onLine(1, [275.3, 393.7, 354.8], "partner", "Partner 2"),
      onLine(1, [410.5, 508.5, 354.8], "partner", "Partner 3"), onLine(2, [90.0, 224.6, 390.7], "partner", "Partner 1 (demat)"),
      onLine(2, [275.3, 393.7, 390.7], "partner", "Partner 2 (demat)"), onLine(2, [410.5, 508.5, 390.7], "partner", "Partner 3 (demat)")],
    ignoredBlanks: [],
    sections: [["resolution", "Bank account resolution (Excel)"], ["demat", "Demat account resolution (Excel)"]],
    requiredFields: ["entity_name", "account_number", "partner_1_name"],
  },
  {
    formId: "hdfc-deaf-claim-non-individual", label: "Unclaimed deposits (RBI DEAF) request – HDFC Bank (non-individual)", shortLabel: "HDFC DEAF claim (non-individual)",
    purpose: "A company / firm claims an unclaimed deposit moved to DEAF", pages: 2, sourcePdf: "Non-Individual/Bank/rbi-deaf-request-letter-form.pdf",
    blankFileName: "HDFC Bank Unclaimed Deposits Request Letter - Non-Individual.pdf", detectionPhrases: ["RBI DEAF Request Letter", "Unclaimed Deposits: Common Claim Application Form"],
    keyFields: ["Entity", "Account number", "Refund mode"],
    fields: (s = { section: "claim" }, c = { section: "claimant" }) => [
      text("bank_name", 1, 109, 119.8, 88, "typed", { fontSize: 7.5, ...s }),
      text("branch_name", 1, 118, 133.7, 80, "typed", { fontSize: 7.5, ...s }),
      text("udrn_number", 1, 316, 107.1, 228, "typed", s),
      text("entity_address_line1", 1, 250, 122.9, 294, "typed", { fontSize: 7.5, ...s }),
      text("entity_address_line2", 1, 205, 138.6, 252, "typed", { fontSize: 7.5, ...s }),
      text("pincode", 1, 482, 138.6, 62, "typed", s),
      text("mobile", 1, 252, 154.6, 155, "typed", s),
      text("email", 1, 443, 154.6, 102, "typed", { fontSize: 7, ...s }),
      text("form_date", 1, 235, 170.7, 100, "today", s),
      text("entity_name", 1, 213, 269.5, 228, "typed", s),
      text("account_number", 1, 156, 297.1, 216, "typed", s),
      text("unable_to_operate_reason", 1, 269, 324.6, 250, "typed", { fontSize: 7.5, ...s }),
      tick("kyc_documents_status", 1, 9, { "Are submitting KYC documents": [213.5, 346.6], "Have submitted KYC documents": [304.5, 346.6] }, s),
      tick("refund_mode", 1, 6.5, { "Transfer to existing HDFC Bank account": [94.6, 731.6], "Demand draft / NEFT": [94.6, 743.9] }, c),
      text("refund_account_number", 1, 326, 737, 188, "typed", c),
      text("authorised_signatory_1_name", 2, 76, 105, 330, "typed", c),
      text("authorised_signatory_2_name", 2, 76, 160, 330, "typed", c),
    ],
    signatureBoxes: [sign(2, 413, 77, 134, 49, "authorised_signatory", "Claimant 1"), sign(2, 413, 128, 134, 55, "authorised_signatory", "Claimant 2")],
    ignoredBlanks: [694.1, 708.1].map((y) => ({ page: 2, y, why: "Customer acknowledgement slip: filled by the bank official" })),
    sections: [["claim", "Entity and account (Excel)"], ["claimant", "Refund and claimants (Excel)"]],
    requiredFields: ["entity_name", "account_number", "refund_mode"],
  },
  {
    formId: "hdfc-rekyc-non-individual", label: "Dormancy removal & re-KYC – HDFC Bank (non-individuals)", shortLabel: "HDFC re-KYC (non-individual)",
    purpose: "Reactivate a company / firm account and update its KYC", pages: 8,
    sourcePdf: "Non-Individual/Bank/dormant-activation-and-rekyc-updation-form-for-non-individuals.pdf",
    blankFileName: "HDFC Bank Re-KYC Customer Updation Form - Non-Individual.pdf", detectionPhrases: ["CUSTOMER UPDATION FORM FOR RE KYC - NON-INDIVIDUALS"],
    keyFields: ["Customer ID", "Entity PAN", "Account number"],
    fields: (e = { section: "entity" }, m = { section: "mailing" }, r = { section: "registered" }, b = { section: "business" }) => {
      const address = (prefix, top, section) => [
        comb(`${prefix}_address_line1`, 1, top, 93.3, 35, "typed", { pitch: 14.17, keepAll: true, ...section }),
        comb(`${prefix}_address_line2`, 1, top + 14.4, 93.3, 35, "typed", { pitch: 14.17, keepAll: true, ...section }),
        comb(`${prefix}_landmark`, 1, top + 28.4, 93.3, 35, "typed", { pitch: 14.17, keepAll: true, ...section }),
        comb(`${prefix}_city`, 1, top + 42.7, 93.3, 20, "typed", { pitch: 14.17, keepAll: true, ...section }),
        comb(`${prefix}_pincode`, 1, top + 42.7, 447.7, 6, "typed", { pitch: 14.17, ...section }),
        comb(`${prefix}_state`, 1, top + 57.0, 93.3, 18, "typed", { pitch: 14.17, keepAll: true, ...section }),
        comb(`${prefix}_country`, 1, top + 57.0, 405.0, 13, "typed", { pitch: 14.18, keepAll: true, ...section }),
      ];
      const row = (top, xs, labels) => Object.fromEntries(labels.map((label, index) => [label, [xs[index], top]]));
      return [
        comb("customer_id", 1, 105.7, 93.3, 10, "typed", { pitch: 14.17, ...e }),
        comb("form_date", 1, 105.7, 476.0, 8, "today", { pitch: 14.16, ...e }),
        comb("proprietor_customer_id", 1, 128.0, 93.3, 10, "typed", { pitch: 14.17, ...e }),
        comb("proprietor_pan", 1, 128.0, 320.0, 10, "typed", { pitch: 14.17, ...e }),
        comb("proprietor_name_prefix", 1, 151.3, 93.3, 4, "typed", { pitch: 14.18, keepAll: true, ...e }),
        comb("proprietor_name", 1, 151.3, 221.0, 20, "typed", { pitch: 14.16, keepAll: true, ...e }),
        comb("entity_name", 1, 179.7, 93.3, 35, "typed", { pitch: 14.17, keepAll: true, ...e }),
        comb("entity_pan", 1, 194.0, 221.0, 10, "typed", { pitch: 14.17, ...e }),
        text("account_number", 1, 222, 214.6, 260, "typed", e),
        tick("mailing_address_change", 1, 11.3, { "No change in mailing address": [24.7, 250.0], "Change mailing / contact details as below": [364.0, 238.3] }, m),
        ...address("mailing", 284.3, m),
        comb("mobile", 1, 383.7, 93.3, 10, "typed", { pitch: 14.17, ...m }),
        comb("email", 1, 398.0, 93.3, 35, "typed", { pitch: 14.17, keepAll: true, ...m }),
        tick("registered_address_same_as_mailing", 1, 11.3, { "Same as mailing address": [364.0, 432.0] }, r),
        ...address("registered", 465.3, r),
        tick("registered_address_type", 1, 11.6, { Owned: [119.7, 528.0], "Rented / leased": [289.0, 528.0] }, r),
        tick("entity_type", 1, 11.5, {
          ...row(589.7, [24.3, 112.3, 192.3, 306.3, 522.0], ["Proprietorship", "Partnership", "Limited Liability Partnership", "Public / Private Limited / OPC", "HUF"]),
          ...row(611.3, [24.3, 112.3, 192.3, 306.3, 421.0, 522.0], ["Government", "Bank", "Societies", "Insurance", "Self Help Group", "Foreign Bodies"]),
          ...row(632.7, [24.3, 112.3, 306.3, 421.0, 522.0], ["Clubs", "Non-Government Organisation", "Mutual Fund", "Association", "Trust"]) }, b),
        comb("date_of_incorporation", 2, 174.3, 92.7, 8, "typed", { pitch: 14.12, ...b }),
        text("annual_turnover", 2, 402, 172.3, 180, "typed", b),
        text("annual_turnover_words", 2, 399, 186.9, 184, "typed", { fontSize: 7.5, ...b }),
        text("place", 2, 60, 642, 170, "typed", { section: "signed" }),
        text("form_date_signed", 2, 52, 662, 100, "copy.form_date", { section: "signed" }),
      ];
    },
    signatureBoxes: [onLine(2, [103.1, 229.1, 600.1], "authorised_signatory", "Authorised signatory 1"),
      onLine(2, [279.1, 405.1, 600.1], "authorised_signatory", "Authorised signatory 2"), onLine(2, [455.2, 581.1, 600.1], "authorised_signatory", "Authorised signatory 3")],
    ignoredBlanks: [[3, [157.6, 538.3, 607.1]], [4, [124.2, 211.1, 222.1, 288.8, 735.0]], [5, [65.5, 79.5, 96.8, 116.3, 132.1, 311.6, 354.3, 372.1, 816.2, 817.6]],
      [6, [108.8, 122.8, 142.0, 332.4, 384.7, 451.9, 709.2]],
      [8, [127.5, 138.3, 148.2, 165.5, 169.9, 175.8, 180.4, 186.1, 190.7, 197.0, 201.0, 207.3, 211.3, 217.6, 221.8, 237.9, 242.3, 259.5, 264.1, 299.3,
        309.8, 320.1, 330.4, 340.7, 351.2, 371.7, 393.4, 576.8, 730.8]]]
      .flatMap(([page, ys]) => ys.map((y) => ({ page, y, why: "Extended CKYC / FATCA / authorised-signatory / controlling-person annexure (pages 3-8): entity-specific, filled by the RM - open question" }))),
    sections: [["entity", "Entity (Excel)"], ["mailing", "Mailing address and contact (Excel)"], ["registered", "Registered office (Excel)"],
      ["business", "Entity type and business (Excel)"], ["signed", "Declaration signed"]],
    requiredFields: ["customer_id", "entity_name", "entity_pan", "account_number"],
  },
];
