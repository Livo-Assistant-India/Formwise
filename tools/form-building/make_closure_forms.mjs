// Writes five NFT account-closure forms from "C:\zzz\demo\Account Closure Forms" (one per blank PDF):
//   hdfc-bank-account-closure      HDFC Bank savings/current account closure (page 1; page 2 is for the bank official)
//   hdfc-demat-account-closure     HDFC Bank CDSL & NSDL demat closure, Ver 1.02 Oct 2021 (scan; custody address printed)
//   broking-demat-closure          360 ONE Distribution Services broking & demat account closure (labels are drawn shapes)
//   pms-account-closure            360 ONE Asset Management PMS account closure (AMC PMS, 2 pages)
//   hdfc-dormant-activation        HDFC Bank covering letter for dormant account activation (Annexure C)
// Spots were measured with boxes.py / scan_boxes.py and the drawn underlines. Sources: the first holder's name from the
// KYC documents, everything else typed (Excel); other holders typed; tick boxes are answered per client, never assumed.
// Change this file, never the generated folders.
// More forms: closure-forms-second/third/fourth-batch.mjs. usage (from the repo root): convert_word_blanks.ps1,
// python -I tools/form-building/make_closure_blanks.py,
// then node tools/form-building/make_closure_forms.mjs [form-id]
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { comb, multiline, text, tick } from "./gift-feeder-application-pages.mjs";
import { SECOND_BATCH } from "./closure-forms-second-batch.mjs";
import { THIRD_BATCH } from "./closure-forms-third-batch.mjs";
import { FOURTH_BATCH } from "./closure-forms-fourth-batch.mjs";

const SOURCE_FOLDER = "../Account Closure Forms";
const NAME = "document.name|upper";

/** A date written one digit per box in DD / MM / YYYY groups: groups = [[left x, width, box count], ...]. */
const dateBoxes = (key, page, boxBottom, groups, source, section) =>
  ({ key, page, x: groups[0][0], y: Math.round((boxBottom - 3.6) * 100) / 100, fontSize: 8, type: "text", combs: groups, source, section });

/** A signature box covering a cell or sitting on a printed line. */
const sign = (page, x, y, w, h, signer, label) => ({ page, x, y, w, h, signer, label });

const FORMS = [
  {
    formId: "hdfc-bank-account-closure", label: "Account closure – HDFC Bank account", shortLabel: "HDFC Bank closure",
    purpose: "Close a savings / current account", pages: 2, sourcePdf: "Individual/Bank/HDFC Bank Closure form.pdf",
    blankFileName: "HDFC Bank Account Closure Form.pdf", detectionPhrases: ["SAVINGS/CURRENT ACCOUNT CLOSURE FORM"],
    keyFields: ["Account number", "Pay proceeds by", "Reason"],
    fields: (s = { section: "account" }, h = { section: "holders" }) => [
      dateBoxes("form_date", 1, 101.4, [[104.4, 27.4, 2], [143.4, 27.4, 2], [182.0, 57.5, 4]], "today", s.section),
      comb("account_number", 1, 101.4, 363.8, 14, "typed", { pitch: 15.02, ...s }),
      tick("pay_proceeds_by", 1, 5.8, { Cash: [58.8, 176.9], "Manager's cheque / DD": [103.0, 176.9], "Credit to account": [221.1, 176.2] }, s),
      text("credit_account_number", 1, 312, 181.5, 276, "typed", s),
      text("unused_cheques_from", 1, 114, 251, 204, "typed", s),
      text("unused_cheques_to", 1, 350, 251, 236, "typed", s),
      text("debit_card_number_1", 1, 84, 285.7, 234, "typed", s),
      text("debit_card_number_2", 1, 350, 285.7, 236, "typed", s),
      text("first_holder_name", 1, 135, 341, 222, NAME, { fontSize: 9, ...h }),
      text("second_holder_name", 1, 135, 362.4, 222, "typed", { fontSize: 9, ...h }),
      text("third_holder_name", 1, 135, 383.8, 222, "typed", { fontSize: 9, ...h }),
      tick("closure_reason", 1, 8.5, Object.fromEntries([
        ["1 - Branch/ATM of other bank is suitably located", 487.5], ["2 - Product deficiency", 505.9], ["3 - Facility no longer required", 532.9],
        ["4 - Unhappy with service", 558.4], ["5 - Corporate salary account - employer changed", 578.2], ["6 - Service charges / AQB", 596.6],
        ["7 - Incorrect product assurance", 615.1], ["8 - Transferred to a non-HDFC Bank branch location", 633.5],
        ["9 - Upgrading / consolidating bank account", 662.5], ["10 - Account wrongly opened", 694.4], ["11 - Change of status NRI / resident", 715.7],
        ["12 - Legal / regulatory / KYC / AML", 737.0], ["13 - Customer deceased", 758.2], ["14 - Tatkal account - initial pay-in returned", 779.5],
      ].map(([option, top]) => [option, [108.2, top]])), { section: "reason" }),
    ],
    signatureBoxes: [sign(1, 362.1, 325.6, 230.3, 21.4, "subscriber", "Applicant 1"), sign(1, 362.1, 347.0, 230.3, 21.4, "joint_holder", "Applicant 2"),
      sign(1, 362.1, 368.4, 230.3, 21.4, "third_holder", "Applicant 3")],
    ignoredBlanks: [301, 317, 333, 387, 403, 419, 435, 451, 467, 541, 616, 629, 685, 711, 725, 740, 754, 783]
      .map((y) => ({ page: 2, y, why: "Page 2 \"To be filled in by a bank official\"" })),
    sections: [["account", "Account and payout (Excel)"], ["holders", "Account holders"], ["reason", "Reason for closure (Excel)"]],
    requiredFields: ["account_number", "first_holder_name", "pay_proceeds_by", "closure_reason"],
  },
  {
    formId: "hdfc-demat-account-closure", label: "Account closure – HDFC Bank demat (CDSL / NSDL)", shortLabel: "HDFC demat closure",
    purpose: "Close a demat account held with HDFC Bank", pages: 1, sourcePdf: "Individual/Demat/3.HDFC Demat-NSDL-CDSL_closure form_REVISED1.pdf",
    blankFileName: "HDFC Bank Demat Account Closure Form.pdf", detectionPhrases: ["Account Closure Request form - CDSL & NSDL"],
    keyFields: ["DP ID", "Client ID", "Reason"],
    fields: (s = { section: "account" }, h = { section: "holders" }, b = { section: "balances" }, a = { section: "acknowledgement" }) => [
      tick("closure_initiated_by", 1, 9, { BO: [255.7, 54.0], DP: [279.7, 54.0], CDSL: [304.0, 54.0], NSDL: [340.3, 54.0] }, s),
      comb("form_date", 1, 65.0, 468.7, 8, "today", { pitch: 12.04, ...s }),
      comb("dp_id", 1, 223.3, 119.0, 8, "typed", { pitch: 12.04, ...s }),
      comb("client_id", 1, 223.3, 251.3, 8, "typed", { pitch: 12.17, ...s }),
      comb("first_holder_name", 1, 237.3, 119.0, 37, NAME, { pitch: 12.05, keepAll: true, ...h }),
      comb("second_holder_name", 1, 250.7, 119.0, 37, "typed", { pitch: 12.05, keepAll: true, ...h }),
      comb("third_holder_name", 1, 266.3, 119.0, 37, "typed", { pitch: 12.05, keepAll: true, ...h }),
      comb("mobile", 1, 336.7, 420.7, 12, "typed", { pitch: 12.02, ...h }),
      text("closure_reason", 1, 178, 348.5, 365, "typed", { section: "reason" }),
      tick("closure_option", 1, 9, { "A - No balances in this account": [89.7, 361.7], "B (NSDL) - Transfer the balances": [81.7, 381.3],
        "C (NSDL) - Rematerialise / reconvert": [194.3, 485.7] }, b),
      tick("nsdl_transfer_to", 1, 9, { "Any other account": [209.7, 381.3], "My own account": [209.7, 393.7] }, b),
      tick("cdsl_balance_remaining", 1, 9, { "Partly rematerialised and partly transferred": [178.0, 413.3], Rematerialised: [395.0, 413.3],
        "Transferred to another account": [178.0, 425.7], "Not applicable": [395.0, 425.7] }, b),
      tick("cdsl_balance_present", 1, 9, { "Ear-marked": [174.0, 441.7], Pledged: [230.7, 441.7], Frozen: [274.3, 441.7], "Lock-in": [316.0, 441.7],
        "Pending for dematerialisation": [358.3, 441.7], "Pending for rematerialisation": [464.0, 441.7] }, b),
      tick("target_depository", 1, 9, { NSDL: [178.0, 456.7], CDSL: [226.7, 456.7] }, b),
      comb("target_dp_id", 1, 467.3, 284.7, 8, "typed", { pitch: 12.08, ...b }),
      comb("target_client_id", 1, 467.3, 417.3, 8, "typed", { pitch: 12.05, ...b }),
      tick("delivery_instruction_slips", 1, 9, { "Surrendered / destroyed all unutilised slips": [50.7, 512.7], "Exhausted all slips / misplaced": [314.0, 511.0] }, b),
      tick("shifting_confirmation", 1, 9, { "Confirmed - all transactions authentic": [290.0, 531.7] }, b),
      text("first_holder_name_signed", 1, 68, 636, 100, "copy.first_holder_name", { fontSize: 7, ...h }),
      text("second_holder_name_signed", 1, 228, 636, 96, "copy.second_holder_name", { fontSize: 7, ...h }),
      text("third_holder_name_signed", 1, 372, 636, 96, "copy.third_holder_name", { fontSize: 7, ...h }),
      comb("form_date_acknowledgement", 1, 714.7, 432.7, 8, "copy.form_date", { pitch: 12.04, ...a }),
      comb("dp_id_acknowledgement", 1, 733.3, 119.0, 8, "copy.dp_id", { pitch: 12.04, ...a }),
      comb("client_id_acknowledgement", 1, 733.3, 251.3, 8, "copy.client_id", { pitch: 12.17, ...a }),
      comb("first_holder_name_acknowledgement", 1, 746.3, 119.0, 21, "copy.first_holder_name", { pitch: 12.08, keepAll: true, ...a }),
      comb("second_holder_name_acknowledgement", 1, 757.7, 119.0, 21, "copy.second_holder_name", { pitch: 12.08, keepAll: true, ...a }),
      comb("third_holder_name_acknowledgement", 1, 770.3, 119.0, 21, "copy.third_holder_name", { pitch: 12.08, keepAll: true, ...a }),
    ],
    signatureBoxes: [sign(1, 60, 548, 136, 78, "subscriber", "First / sole holder"), sign(1, 202, 548, 134, 78, "joint_holder", "Second holder"),
      sign(1, 345, 548, 135, 78, "third_holder", "Third holder")],
    ignoredBlanks: [],
    sections: [["account", "Closure request (Excel)"], ["holders", "Account holders"], ["reason", "Reason for closure (Excel)"],
      ["balances", "Balances and declarations (Excel)"], ["acknowledgement", "Acknowledgement receipt"]],
    requiredFields: ["dp_id", "client_id", "first_holder_name", "closure_reason"],
  },
  {
    formId: "broking-demat-closure", label: "Account closure – 360 ONE broking & demat", shortLabel: "360 ONE broking & demat closure",
    purpose: "Close a 360 ONE trading / demat account", pages: 1, sourcePdf: "Individual/PMS/AMC PMS/Closure Broking_Demat_360 One.pdf",
    blankFileName: "360 ONE Broking and Demat Account Closure Form.pdf", detectionPhrases: ["ACCOUNT CLOSURE REQUEST FORM", "360 ONE DISTRIBUTION SERVICES"],
    keyFields: ["Login ID", "NSDL client ID", "Reason"],
    fields: (s = { section: "account" }, h = { section: "holders" }, b = { section: "balances" }, a = { section: "acknowledgement" }) => [
      tick("closure_initiated_by", 1, 5.3, { BO: [256.0, 63.0], DP: [281.0, 63.0], CDSL: [305.3, 63.0], NSDL: [339.7, 63.0], Comtrack: [375.3, 63.0], Comris: [424.0, 63.0] }, s),
      tick("closure_for", 1, 5.3, { "Only trading account": [94.7, 85.7], "Only demat account": [173.7, 85.7], Both: [249.0, 85.7],
        "Commodity trading": [95.0, 99.0], Comtrack: [187.3, 99.0], Comris: [242.0, 99.0] }, s),
      comb("form_date", 1, 116.8, 479.5, 8, "today", { pitch: 11.34, ...s }),
      text("login_id", 1, 106, 116, 112, "typed", s),
      tick("trading_segment", 1, 8.5, { Equity: [306.0, 109.7], Commodity: [349.7, 109.7] }, s),
      text("cdsl_bo_id_suffix", 1, 182, 133.5, 118, "typed", s),
      text("nsdl_client_id", 1, 394, 133.5, 82, "typed", s),
      text("comtrack_id_suffix", 1, 166, 149, 112, "typed", s),
      text("comris_id_suffix", 1, 414, 149, 118, "typed", s),
      text("first_holder_name", 1, 156, 206, 196, NAME, h),
      text("second_holder_name", 1, 156, 223, 196, "typed", h),
      text("third_holder_name", 1, 156, 240, 196, "typed", h),
      multiline("correspondence_address", 1, 31, 265.5, 320, 274, "document.address|withoutCareOf|upper", { fontSize: 7, ...h }),
      text("city", 1, 52, 290, 92, "document.city|upper", { fontSize: 7, ...h }),
      text("state", 1, 168, 290, 92, "document.state|upper", { fontSize: 7, ...h }),
      text("pincode", 1, 298, 290, 55, "document.pincode", { fontSize: 7, ...h }),
      text("closure_reason", 1, 172, 319.5, 395, "typed", { section: "reason" }),
      tick("balance_remaining", 1, 8.5, { "Partly rematerialised and partly transferred": [34.9, 344.5], Rematerialised: [354.5, 344.5],
        "Transferred to another account": [34.9, 358.7], "Not applicable": [354.5, 358.7] }, b),
      comb("target_dp_id", 1, 386.7, 63.7, 8, "typed", { pitch: 25.75, ...b }),
      comb("target_client_id", 1, 386.7, 339.0, 8, "typed", { pitch: 25.75, ...b }),
      tick("balance_present", 1, 8.5, { "Ear-marked": [34.0, 402.6], Pledged: [102.0, 402.6], "Pending for dematerialisation": [148.1, 402.6],
        Frozen: [282.3, 402.6], "Pending for rematerialisation": [324.4, 402.6], "Lock-in": [458.1, 402.6] }, b),
      text("first_holder_name_signed", 1, 100, 470, 152, "copy.first_holder_name", { fontSize: 7, ...h }),
      text("second_holder_name_signed", 1, 258, 470, 152, "copy.second_holder_name", { fontSize: 7, ...h }),
      text("third_holder_name_signed", 1, 416, 470, 152, "copy.third_holder_name", { fontSize: 7, ...h }),
      comb("form_date_acknowledgement", 1, 726.8, 479.5, 8, "copy.form_date", { pitch: 11.34, ...a }),
      comb("nsdl_client_id_acknowledgement", 1, 750.0, 355.7, 8, "copy.nsdl_client_id", { pitch: 27.54, ...a }),
      text("first_holder_name_acknowledgement", 1, 128, 760.2, 445, "copy.first_holder_name", { fontSize: 7, ...a }),
      text("second_holder_name_acknowledgement", 1, 128, 773.5, 445, "copy.second_holder_name", { fontSize: 7, ...a }),
      text("third_holder_name_acknowledgement", 1, 128, 786.8, 445, "copy.third_holder_name", { fontSize: 7, ...a }),
      text("closure_reason_acknowledgement", 1, 128, 800.5, 445, "copy.closure_reason", { fontSize: 7, ...a }),
    ],
    signatureBoxes: [sign(1, 97, 479, 157, 46, "subscriber", "First / sole holder"), sign(1, 255, 479, 157, 46, "joint_holder", "Second holder"),
      sign(1, 413, 479, 157, 46, "third_holder", "Third holder")],
    ignoredBlanks: [],
    sections: [["account", "Closure request (Excel)"], ["holders", "Account holders"], ["reason", "Reason for closure (Excel)"],
      ["balances", "Remaining balances (Excel)"], ["acknowledgement", "Acknowledgement receipt"]],
    requiredFields: ["first_holder_name", "closure_for", "closure_reason"],
  },
  {
    formId: "pms-account-closure", label: "Account closure – 360 ONE PMS (AMC)", shortLabel: "PMS closure",
    purpose: "Close a discretionary / non-discretionary PMS account", pages: 2, sourcePdf: "Individual/PMS/AMC PMS/AMC PMS Account closure form_Revised_v2.pdf",
    blankFileName: "360 ONE AMC PMS Account Closure Form.pdf", detectionPhrases: ["PMS Account Closure Form"],
    keyFields: ["Client name", "Scheme", "Reason"],
    fields: (s = { section: "account" }, d = { section: "demat" }, h = { section: "holders" }, a = { section: "acknowledgement" }) => [
      text("form_date", 1, 60, 190.6, 120, "today", s),
      text("pms_agreement_date", 1, 398, 315.2, 36, "typed", { fontSize: 6.5, ...s }),
      text("first_holder_name", 1, 172, 354, 324, NAME, s),
      text("scheme_name", 1, 172, 370, 324, "typed", s),
      text("dp_id", 1, 172, 386, 114, "typed", s),
      text("client_id", 1, 349, 386, 148, "typed", s),
      text("custody_code", 1, 172, 418, 324, "typed", s),
      text("bank_name", 1, 172, 450, 296, "typed", s),
      text("account_number", 1, 172, 466, 324, "typed", s),
      tick("settlement_mode", 1, 8, { "Issue cheque for the portfolio value": [[35.5, 556.5, 1]], "Transfer securities to my demat account": [[35.0, 191.5, 2]] }, s),
      text("target_dp_name", 2, 94, 266, 458, "typed", d),
      text("target_dp_id", 2, 94, 282, 192, "typed", d),
      text("target_client_id", 2, 349, 282, 204, "typed", d),
      multiline("closure_reason", 2, 38, 321, 515, 345, "typed", { fontSize: 8, section: "reason" }),
      text("first_holder_name_p2", 2, 101, 455.5, 148, "copy.first_holder_name", { fontSize: 7.5, ...h }),
      text("second_holder_name", 2, 254, 455.5, 146, "typed", { fontSize: 7.5, ...h }),
      text("third_holder_name", 2, 406, 455.5, 146, "typed", { fontSize: 7.5, ...h }),
      text("form_date_acknowledgement", 2, 372, 621.1, 90, "copy.form_date", a),
      comb("pms_account_number", 2, 658.7, 123.0, 9, "typed", { pitch: 23.15, ...a }),
      text("first_holder_name_acknowledgement", 2, 126, 670.5, 435, "copy.first_holder_name", { fontSize: 7.5, ...a }),
      text("closure_reason_acknowledgement", 2, 126, 685.8, 435, "copy.closure_reason", { fontSize: 7, ...a }),
    ],
    signatureBoxes: [sign(2, 99, 462, 151, 46, "subscriber", "First holder"), sign(2, 251, 462, 151, 46, "joint_holder", "Second holder"),
      sign(2, 404, 462, 150, 46, "third_holder", "Third holder")],
    ignoredBlanks: [],
    sections: [["account", "PMS account and settlement (Excel)"], ["demat", "Demat account for transfer (Excel)"], ["reason", "Reason for closure (Excel)"],
      ["holders", "Account holders"], ["acknowledgement", "Acknowledgement receipt"]],
    requiredFields: ["first_holder_name", "scheme_name", "settlement_mode", "closure_reason"],
  },
  {
    formId: "hdfc-dormant-activation", label: "Dormant account activation – HDFC Bank (covering letter)", shortLabel: "HDFC dormant activation",
    purpose: "Reactivate a dormant bank account", pages: 1, sourcePdf: "Individual/Bank/DORMANT ACTIVATION-BANK.pdf",
    blankFileName: "HDFC Bank Dormant Activation Letter.pdf", detectionPhrases: ["COVERING LETTER FOR DORMANT ACTIVATION"],
    keyFields: ["Account number", "Branch", "Reason"],
    fields: (s = { section: "account" }, h = { section: "holders" }) => [
      text("form_date", 1, 164, 127.5, 120, "today", s),
      text("branch_name", 1, 136, 180.5, 86, "typed", { fontSize: 8, ...s }),
      text("account_number", 1, 222, 312, 172, "typed", s),
      text("dormancy_reason", 1, 136, 352.5, 386, "typed", s),
      text("first_holder_name", 1, 140, 474.2, 150, NAME, { fontSize: 8, ...h }),
      text("second_holder_name", 1, 328, 474.2, 118, "typed", { fontSize: 8, ...h }),
      text("third_holder_name", 1, 481, 474.2, 90, "typed", { fontSize: 7, ...h }),
    ],
    signatureBoxes: [sign(1, 87.8, 405, 117.1, 27, "subscriber", "1st holder"), sign(1, 250.6, 405, 127.3, 27, "joint_holder", "2nd holder"),
      sign(1, 403.4, 405, 127.4, 27, "third_holder", "3rd holder")],
    ignoredBlanks: [],
    sections: [["account", "Account (Excel)"], ["holders", "Account holders"]],
    requiredFields: ["account_number", "first_holder_name", "branch_name"],
  },
];

function writeForm(form) {
  const folder = path.join("apps/backend/src/forms/nft", form.formId);
  const writeJson = (fileName, content) => writeFileSync(path.join(folder, fileName), JSON.stringify(content, null, 2) + "\n");
  mkdirSync(folder, { recursive: true });
  // A prebuilt blank (e.g. the rotated PIS scan) is made by make_closure_blanks.py instead of copied.
  if (!form.prebuiltBlank) copyFileSync(path.join(SOURCE_FOLDER, form.sourcePdf), path.join("data/Blank Forms", form.blankFileName));
  const fields = form.fields();
  const duplicateKeys = fields.map((field) => field.key).filter((key, index, keys) => keys.indexOf(key) !== index);
  if (duplicateKeys.length) throw new Error(`${form.formId}: duplicate keys ${duplicateKeys.join(", ")}`);
  const textFields = fields.filter((field) => !field.tickbox), tickboxes = fields.filter((field) => field.tickbox);
  writeJson("field-positions.json", { _about: `Where each value is written on the blank ${form.label} (${form.pages} page${form.pages > 1 ? "s" : ""}). Made by tools/form-building/make_closure_forms.mjs.`,
    formId: form.formId, title: form.label, fields: textFields.map(({ source, section, ...field }) => ({ key: field.key, nominee: null, ...field })) });
  writeJson("field-sources.json", {
    _about: "Form field -> where its value comes from. \"document.X\" = X read from the first holder's KYC documents (see ../document-data-dictionary.json); \"|upper\" etc. = the part or form of it this box wants; \"typed\" = from the batch Excel or the review screen; \"copy.X\" = same as field X unless typed separately; \"today\" = today's date; \"tick\" = a tick box, answered per client in the Excel (never assumed). No field sheet exists for account closure forms yet.",
    fieldSources: Object.fromEntries(fields.map((field) => [field.key, field.tickbox ? "tick" : field.source])) });
  writeJson("required-fields.json", { _about: "Fields that must be filled before a case can be confirmed. Changed from the Form setup screen.", requiredFields: form.requiredFields });
  writeJson("form-rules.json", {
    _about: "Form-level rules: how the form is recognised, which tab it saves to. One person (the first holder) - their KYC documents fill the name, the Excel fills the rest.",
    formId: form.formId, group: "NFT", label: form.label, shortLabel: form.shortLabel, purpose: form.purpose, blankFileName: form.blankFileName,
    keyFields: form.keyFields, sheetTabName: form.shortLabel, detectionPhrases: form.detectionPhrases, supportedNomineeCount: 1, personLabel: "Account holder",
    identityType: { scope: "shared", tickboxField: null, numberField: null, optionByIdentityKind: {}, numberFieldByIdentityKind: {} },
    reviewSections: form.sections.map(([key, title]) => {
      const sectionFields = fields.filter((field) => field.section === key);
      const pages = [...new Set(sectionFields.flatMap((field) => [field.page, ...Object.values(field.boxesByOption || {}).flat().map((box) => box.page || field.page)]))].sort((x, y) => x - y);
      const pageWords = pages.length > 1 ? `Pages ${pages[0]}-${pages[pages.length - 1]}` : `Page ${pages[0]}`;
      return { key, label: `${pageWords} · ${title}`, fields: sectionFields.map((field) => field.key) };
    }) });
  writeJson("form-configuration.json", {
    _about: `${form.label}. Made by tools/form-building/make_closure_forms.mjs. Every tick box is its own question with no assumed answer.`,
    id: form.formId, title: form.label, labels: [], signatureBoxes: form.signatureBoxes,
    tickboxes: tickboxes.map(({ tickbox, section, ...tickboxSpec }) => tickboxSpec),
    blankFileName: form.blankFileName, nomineeHeaderRe: null, tickboxRule: "usual", ignoredBlanks: form.ignoredBlanks });
  console.log(`wrote ${folder}: ${textFields.length} fields, ${tickboxes.length} tick boxes, ${form.signatureBoxes.length} signatures`);
}

const onlyFormId = process.argv[2];
for (const form of [...FORMS, ...SECOND_BATCH, ...THIRD_BATCH, ...FOURTH_BATCH]) if (!onlyFormId || form.formId === onlyFormId) writeForm(form);
