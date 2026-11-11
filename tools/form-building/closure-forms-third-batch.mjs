// The third five NFT closure / bank-service forms, written by make_closure_forms.mjs (same shape as its FORMS).
// Four are Word files: convert_word_blanks.ps1 turns them into PDF blanks first (prebuiltBlank: true).
//   distribution-poa-closure    360 ONE Distribution POA account closure letter (Caliber "Common Closure Form")
//   advisory-poa-closure        360 ONE Advisory POA account closure letter (Caliber "Advisory closure form")
//   pms-portfolio-managers-closure  360 ONE Portfolio Managers PMS closure form (Consult & Alpha / HSBC / IndusInd)
//   hdfc-poa-revocation         HDFC Bank power-of-attorney revocation letter
//   hdfc-deaf-claim             HDFC Bank unclaimed deposits (RBI DEAF) common claim application (3 pages)
import { comb, text, tick } from "./gift-feeder-application-pages.mjs";

const NAME = "document.name|upper";
const sign = (page, x, y, w, h, signer, label) => ({ page, x, y, w, h, signer, label });
/** A signature box sitting on a printed signature line (x0-x1 at baseline y). */
const onLine = (page, [x0, x1, y], signer, label) => sign(page, x0, Math.round((y - 24) * 10) / 10, Math.round((x1 - x0) * 10) / 10, 24, signer, label);

/** The three linked-account blocks (bank, demat, broking) of the two POA closure letters, values after the ":" at x 216. */
function linkedAccounts(rows, section, printedNames = {}) {
  const at = (key, y, source = "typed") => text(key, 1, 230, y, 300, source, section);
  return [
    ...(printedNames.bank ? [] : [at("bank_name", rows.bank[0])]),
    at("bank_account_holder_name", rows.bank[1], "copy.first_holder_name"),
    at("bank_account_number", rows.bank[2]),
    ...(printedNames.dp ? [] : [at("demat_dp_name", rows.demat[0])]),
    at("demat_account_holder_name", rows.demat[1], "copy.first_holder_name"),
    at("demat_account_number", rows.demat[2]),
    ...(printedNames.dp ? [] : [at("broking_dp_name", rows.broking[0])]),
    at("broking_account_holder_name", rows.broking[1], "copy.first_holder_name"),
    at("broking_account_number", rows.broking[2]),
  ];
}

export const THIRD_BATCH = [
  {
    formId: "distribution-poa-closure", label: "POA account closure – 360 ONE Distribution", shortLabel: "Distribution POA closure",
    purpose: "Close a distribution POA account and its linked bank / demat / broking accounts", pages: 1, prebuiltBlank: true,
    blankFileName: "360 ONE Distribution POA Closure Letter.pdf", detectionPhrases: ["Closure of Distribution POA account"],
    keyFields: ["Bank account", "Demat account", "Broking account"],
    fields: (s = { section: "accounts" }) => [
      text("form_date", 1, 532, 82.4, 60, "today", { fontSize: 7.5, ...s }),
      text("reference", 1, 102, 178.9, 300, "typed", s),
      text("first_holder_name", 1, 72, 621, 140, NAME, { fontSize: 8, ...s }),
      ...linkedAccounts({ bank: [344.2, 359.1, 372.9], demat: [400.4, 414.2, 428.0], broking: [454.9, 468.7, 482.5] }, s),
    ],
    signatureBoxes: [onLine(1, [72.0, 170.0, 609.5], "subscriber", "First holder"), onLine(1, [399.0, 496.9, 609.5], "joint_holder", "Second holder")],
    ignoredBlanks: [],
    sections: [["accounts", "Linked accounts to close (Excel)"]],
    requiredFields: ["first_holder_name", "bank_account_number"],
  },
  {
    formId: "advisory-poa-closure", label: "POA account closure – 360 ONE Advisory", shortLabel: "Advisory POA closure",
    purpose: "Close an advisory POA account and its linked bank / demat / broking accounts", pages: 1, prebuiltBlank: true,
    blankFileName: "360 ONE Advisory POA Closure Letter.pdf", detectionPhrases: ["Closure of Advisory POA account"],
    keyFields: ["Bank account", "Demat account", "Broking account"],
    fields: (s = { section: "accounts" }) => [
      text("form_date", 1, 532, 82.4, 60, "today", { fontSize: 7.5, ...s }),
      text("reference_1", 1, 98, 191.2, 77, "typed", { fontSize: 7.5, ...s }),
      text("reference_2", 1, 189, 191.2, 204, "typed", { fontSize: 7.5, ...s }),
      text("first_holder_name", 1, 404, 260.4, 118, NAME, { fontSize: 7.5, ...s }),
      ...linkedAccounts({ bank: [385.6, 400.2, 415.0], demat: [444.5, 458.1, 472.9], broking: [508.4, 522.1, 536.8] }, s, { bank: true, dp: true }),
    ],
    signatureBoxes: [onLine(1, [72.0, 216.3, 687.9], "subscriber", "Account holder")],
    ignoredBlanks: [],
    sections: [["accounts", "Linked accounts to close (Excel)"]],
    requiredFields: ["first_holder_name", "bank_account_number"],
  },
  {
    formId: "pms-portfolio-managers-closure", label: "Account closure – 360 ONE Portfolio Managers PMS", shortLabel: "Portfolio Managers PMS closure",
    purpose: "Close a 360 ONE Portfolio Managers PMS account (Consult & Alpha / HSBC / IndusInd)", pages: 3, prebuiltBlank: true,
    blankFileName: "360 ONE Portfolio Managers PMS Closure Form.pdf", detectionPhrases: ["360 One Portfolio Managers Limited", "PMS Account Closure Form"],
    keyFields: ["Client name", "WS code", "Reason"],
    fields: (s = { section: "account" }, d = { section: "demat" }, h = { section: "holders" }, a = { section: "acknowledgement" }) => [
      text("form_date", 1, 100, 112.9, 120, "today", s),
      text("ws_code", 1, 415, 204.9, 100, "typed", s),
      text("first_holder_name", 1, 146, 274.4, 300, NAME, s),
      text("scheme_name", 1, 148, 298.5, 300, "typed", s),
      text("dp_id", 1, 140, 322.7, 115, "typed", s),
      text("client_id", 1, 290, 322.7, 160, "typed", s),
      text("custody_code", 1, 146, 368.8, 90, "typed", s),
      text("account_number", 1, 138, 446.7, 250, "typed", s),
      tick("settlement_mode", 1, 7.5, { "Issue cheque for the portfolio value": [[72.6, 552.2, 1]], "Transfer securities to my demat account": [[72.6, 131.7, 2]] }, s),
      text("target_dp_name", 2, 218, 215.5, 340, "typed", d),
      comb("target_dp_id", 2, 244, 214.5, 8, "typed", { pitch: 13.29, ...d }),
      comb("target_client_id", 2, 244, 439.5, 9, "typed", { pitch: 13.37, ...d }),
      text("closure_reason", 2, 271, 296.5, 286, "typed", { section: "reason" }),
      text("first_holder_name_p2", 2, 138, 454, 178, "copy.first_holder_name", { fontSize: 7.5, ...h }),
      text("second_holder_name", 2, 322, 454, 129, "typed", { fontSize: 7.5, ...h }),
      text("third_holder_name", 2, 456, 454, 102, "typed", { fontSize: 7, ...h }),
      text("form_date_acknowledgement", 3, 432, 127.2, 90, "copy.form_date", a),
      comb("pms_account_number", 3, 192.3, 164.7, 9, "typed", { pitch: 32.29, ...a }),
      text("first_holder_name_acknowledgement", 3, 168, 204, 288, "copy.first_holder_name", { fontSize: 7.5, ...a }),
      text("closure_reason_acknowledgement", 3, 168, 219.5, 288, "copy.closure_reason", { fontSize: 7, ...a }),
    ],
    signatureBoxes: [sign(2, 135, 464, 183, 48, "subscriber", "First holder"), sign(2, 320, 464, 133, 48, "joint_holder", "Second holder"),
      sign(2, 454, 464, 105, 48, "third_holder", "Third holder")],
    ignoredBlanks: [],
    sections: [["account", "PMS account and settlement (Excel)"], ["demat", "Demat account for transfer (Excel)"], ["reason", "Reason for closure (Excel)"],
      ["holders", "Account holders"], ["acknowledgement", "Acknowledgement receipt"]],
    requiredFields: ["first_holder_name", "scheme_name", "settlement_mode", "closure_reason"],
  },
  {
    formId: "hdfc-poa-revocation", label: "Power of attorney revocation – HDFC Bank", shortLabel: "HDFC POA revocation",
    purpose: "Revoke the POA given to 360 ONE Distribution on an HDFC Bank account", pages: 1, prebuiltBlank: true,
    blankFileName: "HDFC Bank POA Revocation Letter.pdf", detectionPhrases: ["Request for Revocation of Power of Attorney"],
    keyFields: ["Bank account number"],
    fields: (s = { section: "account" }) => [
      text("form_date", 1, 450, 82.3, 90, "today", s),
      text("account_number", 1, 292, 261.2, 170, "typed", s),
      text("first_holder_name", 1, 90, 492, 145, NAME, { fontSize: 8, ...s }),
      text("second_holder_name", 1, 356, 492, 145, "typed", { fontSize: 8, ...s }),
    ],
    signatureBoxes: [onLine(1, [90.0, 234.3, 479.8], "subscriber", "Account holder"), onLine(1, [355.9, 500.0, 479.8], "joint_holder", "Joint account holder")],
    ignoredBlanks: [],
    sections: [["account", "Bank account (Excel)"]],
    requiredFields: ["first_holder_name", "account_number"],
  },
  {
    formId: "hdfc-deaf-claim", label: "Unclaimed deposits (RBI DEAF) claim – HDFC Bank", shortLabel: "HDFC DEAF claim",
    purpose: "Claim an unclaimed deposit / reactivate an account moved to DEAF", pages: 3,
    sourcePdf: "Individual/Bank/1RBI DEAF Unclaimed Annexure_LATEST june2026.pdf",
    blankFileName: "HDFC Bank Unclaimed Deposits Claim Form.pdf", detectionPhrases: ["Unclaimed Deposits: Common Claim Application Form"],
    keyFields: ["Account number", "UDRN", "Refund mode"],
    fields: (s = { section: "claim" }, c = { section: "claimant" }) => [
      text("branch_name", 1, 82, 128.4, 150, "typed", s),
      text("form_date", 1, 70, 142.5, 100, "today", s),
      text("first_holder_name", 1, 102, 183.2, 172, NAME, { fontSize: 7.5, ...s }),
      text("udrn_number", 1, 391, 183.2, 138, "typed", s),
      text("customer_names", 1, 172, 285.6, 352, "copy.first_holder_name", s),
      text("customer_address_line1", 1, 139, 315.6, 390, "document.address|withoutCareOf|addressLine1|upper", { fontSize: 7.5, ...s }),
      text("customer_address_line2", 1, 52, 343.3, 380, "document.address|withoutCareOf|addressLine2|upper", { fontSize: 7.5, ...s }),
      text("pincode", 1, 438, 343.3, 90, "document.pincode", s),
      text("mobile", 1, 104, 373.2, 128, "typed", s),
      text("email", 1, 268, 373.2, 258, "typed", s),
      text("account_number", 1, 180, 432.1, 324, "typed", s),
      text("unable_to_operate_reason", 1, 52, 488.4, 325, "typed", s),
      tick("kyc_documents_status", 1, 11, { "Are submitting KYC documents": [183, 507.3], "Have submitted KYC documents": [291.5, 507.6] }, s),
      tick("customer_deceased", 2, 11, { Yes: [212.5, 75.8], No: [276.5, 75.5] }, s),
      tick("refund_mode", 2, 11, { "Transfer to existing HDFC Bank account": [58, 290.3], "Demand draft / NEFT": [58, 302.7] }, c),
      text("refund_account_number", 2, 304, 297.7, 178, "typed", c),
      text("first_holder_name_claimant", 2, 43, 349, 330, "copy.first_holder_name", c),
      text("second_holder_name", 2, 43, 374.5, 330, "typed", c),
    ],
    signatureBoxes: [sign(2, 377, 333, 179, 25, "subscriber", "Claimant 1"), sign(2, 377, 358, 179, 25, "joint_holder", "Claimant 2")],
    ignoredBlanks: [[3, 446.1], [3, 459.9]].map(([page, y]) => ({ page, y, why: "Customer acknowledgement slip: filled by the bank official" })),
    sections: [["claim", "Customer and account (KYC + Excel)"], ["claimant", "Refund and claimants (Excel)"]],
    requiredFields: ["first_holder_name", "account_number", "refund_mode"],
  },
];
