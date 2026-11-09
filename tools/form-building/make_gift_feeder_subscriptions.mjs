// Writes the three GIFT City subscription forms - 360 ONE's "Application Form & Documentation Set" for the Dynamic
// Equity Allocator Fund GIFT Feeder, the Growth Strategy GIFT Fund and the International Opportunities Fund GIFT Feeder
// (83 pages each). Pages 1-21 (application form, FATCA, investor profile, nomination) are the same in all three and
// come from gift-feeder-application-pages.mjs. The Memorandum, Contribution Agreement and its annexures (pages 22-83)
// are worded and laid out differently per fund, so their spots were measured on each fund's own blank (FUNDS below).
// Sources follow the VCC subscription forms (global-bond-fund-subscription): name, date of birth, PAN and address from
// the KYC documents, everything else typed (Excel); tick boxes are answered per client, never assumed.
// Change this file or the application-pages module, never the generated folders.
// usage (from the repo root): node tools/form-building/make_gift_feeder_subscriptions.mjs [form-id]
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { APPLICATION_IGNORED_BLANKS, APPLICATION_SECTIONS, APPLICATION_SIGNATURE_BOXES, listApplicationFields, multiline, text, tick } from "./gift-feeder-application-pages.mjs";

const FORMS = "apps/backend/src/forms/gift-city";
const GIFT_FILES = "../GIFT";

/** Page 25: the agreement's table of contents (dotted leaders, not blanks). */
const TABLE_OF_CONTENTS = (ys) => ys.map((y) => [25, y, "Table of contents of the Contribution Agreement (dotted leaders)"]);

const FUNDS = [
  {
    formId: "gift-dynamic-equity-allocator-subscription", fundName: "360 ONE Dynamic Equity Allocator Fund GIFT Feeder",
    label: "GIFT – Dynamic Equity Allocator Fund – Subscription", shortLabel: "GIFT Dynamic Equity Allocator subscription",
    blankFileName: "360 ONE Dynamic Equity Allocator Fund GIFT Feeder - Application Form.pdf",
    sourcePdf: "360 ONE DYNAMIC EQUITY ALLOCATOR FUND GIFT FEEDER/Application Form & Documentation Set_360 ONE Dynamic Equity Allocator Fund GIFT Feeder.pdf",
    memorandumName: { page: 22, x: 160, y: 770.5, maxWidth: 138 },
    notice: { page: 23, signatureLine: [72, 160, 403.6], distributor: [363, 402.8, 88], name: [157, 478.6, 104], date: [101, 504, 102], place: [104, 529.3, 158] },
    executionDate: { page: 26, day: [90, 192.8, 22], month: [158, 192.8, 23] },
    contributorSignatureLine: { page: 75, line: [107.4, 195.5, 461.0] },
    annexureA: { page: 76, name: [226, 132.8, 300], address: [192, 170.7, 335, 186], amount: [419, 214.2, 32], amountWords: [139, 244.8, 380],
      unitClass: [403, 277.5, 16], mailing: [401.9, 423.0, 444.1], email: [137, 475.6, 170], telephone1: [162, 503.2, 152], telephone2: [162, 528.5, 152],
      signatureLine: [72, 231.6, 605.1] },
    annexureBSignatureLines: { page: 77, first: [72, 171.1, 349.6], second: [292.1, 407.5, 349.6] },
    accredited: {
      name: { page: 80, x: 176, y: 119.3, maxWidth: 288 }, incomeYear: { page: 80, x: 264, y: 374.1, maxWidth: 80 },
      categoryBoxes: { page: 80, y: 348.8, individualX: 113.4, incomeX: 225.4, netAssetsX: 381.1 },
      jointBoxes: { page: 81, x: 108.0, parentChildY: 107.6, spousesY: 158.1, size: 5.6 },
      certificateBoxes: { page: 82, y: 396.7, natureX: 131.6, documentX: 262.8 },
      additionalBoxes: { page: 82, y: 640.4, natureX: 131.6, documentX: 262.8 }, additionalText: { page: 82, x: 283, y: 653.1, maxWidth: 200 },
      final: { page: 83, signatureLine: [72, 176.6, 537.6], nameY: 562, dateY: 612.6 },
    },
    agreementIgnoredBlanks: [
      ...TABLE_OF_CONTENTS([110,124,139,154,168,183,198,212,227,241,256,271,285,300,315,329,344,359,373,388,403,417,432,447,461]),
      [76, 152, "\"Mr./Mrs./Messers [______]\": the bracket has no room; the name is written after the heading - open question"],
      [22, 771.3, "Copy No: numbered by 360 ONE"],
      ...[170.7, 221.2, 321.9, 372.6, 524.2].map((y) => [75, y, "Signed by the Trustee / FME / witnesses"]),
      [77, 208.4, "Annexure B consent (FME commitment exemption): the [______] placeholders have no room to write in - open question"],
      ...[132.8, 183.3, 234.0, 259.3].map((y) => [78, y, "Deed of Adherence: only when units are transferred to a new contributor"]),
      ...[347.9, 398.4, 474.3, 499.5, 600.8, 701.9].map((y) => [79, y, "Deed of Adherence: only when units are transferred to a new contributor"]),
      [83, 474.3, "\"For and on behalf of ___\": for a non-individual investor"],
    ],
  },
  {
    formId: "gift-growth-strategy-subscription", fundName: "360 ONE Growth Strategy GIFT Fund",
    label: "GIFT – Growth Strategy Fund – Subscription", shortLabel: "GIFT Growth Strategy subscription",
    blankFileName: "360 ONE Growth Strategy GIFT Fund - Application Form.pdf",
    sourcePdf: "360 ONE Growth Strategy Fund GIFT Fund/Application Form & Documentation Set_360 ONE Growth Strategy GIFT Fund.pdf",
    // "Name of Investor [_____]" leaves 25pt: the name goes on the free line just under the brackets.
    memorandumName: { page: 22, x: 128, y: 674, maxWidth: 260 },
    notice: { page: 23, signatureLine: [72, 198.5, 339.8], distributor: [313, 338, 172], name: [157, 395, 104], date: [104, 407.5, 158], place: [104, 420.2, 158] },
    executionDate: { page: 26, day: [109, 181.6, 21], month: [171.5, 181.6, 21] },
    contributorSignatureLine: { page: 75, line: [107.5, 195.5, 499.7] },
    annexureA: { page: 76, name: [225, 132.8, 300], address: [192, 170.8, 330, 186], amount: [418, 220.6, 32], amountWords: [139, 244.9, 380],
      unitClass: [402, 284, 16], mailing: [410.3, 423.0, 435.7], email: [137, 473.6, 170], telephone1: [162, 511.6, 152], telephone2: [162, 536.8, 152],
      signatureLine: [72, 231.4, 626.2] },
    // Annexure B's "[●]" placeholders are not blanks (nothing to cover) - see the open questions.
    annexureBSignatureLines: { page: 77, first: [72, 171.0, 340.6], second: [291.8, 407.2, 340.6] },
    accredited: {
      name: { page: 80, x: 176, y: 119.4, maxWidth: 288 }, incomeYear: { page: 80, x: 255, y: 386.8, maxWidth: 80 },
      categoryBoxes: { page: 80, y: 361.4, individualX: 113.4, incomeX: 216.1, netAssetsX: 381.2 },
      jointBoxes: { page: 81, x: 108.0, parentChildY: 158.6, spousesY: 209.2, size: 5.6 },
      certificateBoxes: { page: 82, y: 477.0, natureX: 131.7, documentX: 262.8 },
      additionalBoxes: { page: 83, y: 82.6, natureX: 131.7, documentX: 262.8 }, additionalText: { page: 83, x: 283, y: 95.4, maxWidth: 200 },
      final: { page: 83, signatureLine: [72, 176.4, 640.7], nameY: 665.1, dateY: 690.4 },
    },
    agreementIgnoredBlanks: [
      ...TABLE_OF_CONTENTS([106,119,132,144,157,170,182,195,208,220,233,246,258,271,284,296,309,322,334,347,359,372,398,411,424,436]),
      ...[183.4, 246.7, 347.9, 411.1, 563.0].map((y) => [75, y, "Signed by the Trustee / FME / witnesses"]),
      ...[132.8, 183.4, 234.1, 259.3].map((y) => [78, y, "Deed of Adherence: only when units are transferred to a new contributor"]),
      ...[335.2, 385.8, 461.7, 487.1, 588.2, 689.4].map((y) => [79, y, "Deed of Adherence: only when units are transferred to a new contributor"]),
      [83, 577.4, "\"For and on behalf of ___\": for a non-individual investor"],
    ],
  },
  {
    formId: "gift-international-opportunities-subscription", fundName: "360 ONE International Opportunities Fund GIFT Feeder",
    label: "GIFT – International Opportunities Fund – Subscription", shortLabel: "GIFT International Opportunities subscription",
    blankFileName: "360 ONE International Opportunities Fund GIFT Feeder - Application Form.pdf",
    sourcePdf: "360 ONE International Opportunities Fund GIFT Feeder/Application Form & Documentation Set_360 ONE International Opportunities Fund GIFT Feeder.pdf",
    memorandumName: { page: 22, x: 175, y: 730.2, maxWidth: 128 },
    notice: { page: 23, signatureLine: [72, 198.5, 368.5], distributor: [313, 366.7, 172], name: [157, 424, 104], date: [104, 438.6, 158], place: [104, 453.3, 158] },
    executionDate: { page: 26, day: [170, 215, 32], month: [237, 215, 55] },
    contributorSignatureLine: { page: 75, line: [107.4, 199.6, 594.1] },
    // IOF's Annexure A has long brackets: name, address and amounts go inside them.
    annexureA: { page: 76, name: [193, 148.8, 198], address: [106, 175.3, 336, null], amount: [409, 328.8, 72], amountWords: [173, 342, 84],
      unitClass: [420, 381.7, 32], mailing: [574.8, 590.6, 606.5], email: [347, 633, 176], telephone1: [364, 667.5, 159], telephone2: [364, 688.6, 159],
      signatureLine: [74.9, 224.4, 731.9] },
    annexureBSignatureLines: null, // no Annexure B in this blank
    accredited: {
      name: { page: 79, x: 179, y: 159.8, maxWidth: 300 }, incomeYear: { page: 79, x: 256, y: 466.2, maxWidth: 83 },
      categoryBoxes: { page: 79, y: 439.8, individualX: 112.3, incomeX: 216.1, netAssetsX: 381.2 },
      jointBoxes: { page: 80, x: 108.0, parentChildY: 297.0, spousesY: 349.9, size: 5.9 },
      certificateBoxes: { page: 81, y: 696.5, natureX: 131.7, documentX: 266.7 },
      additionalBoxes: { page: 82, y: 338.0, natureX: 131.7, documentX: 266.7 }, additionalText: { page: 82, x: 287, y: 351.2, maxWidth: 208 },
      final: { page: 83, signatureLine: [72, 181.3, 255.4], nameY: 281.1, dateY: 307.5 },
    },
    agreementIgnoredBlanks: [
      ...TABLE_OF_CONTENTS([144,158,171,184,197,211,224,237,250,263,277,290,303,316,330,343,356,369,382,396,409,422,435,449,462,475,488]),
      [22, 730.8, "Copy No: numbered by 360 ONE"],
      ...[223.7, 289.8, 408.9, 475.0, 660.2].map((y) => [75, y, "Signed by the Trustee / FME / witnesses"]),
      ...[162.9, 268.6, 295.1, 400.8].map((y) => [77, y, "Deed of Adherence: only when units are transferred to a new contributor"]),
      [78, 560.2, "Deed of Adherence: only when units are transferred to a new contributor"],
      [83, 189.3, "\"For and on behalf of ___\": for a non-individual investor"],
    ],
  },
];

const AGREEMENT_SECTIONS = [["memorandum", "Memorandum acknowledged"], ["agreement", "Contribution Agreement date (Excel)"],
  ["annexure-a", "Annexure A: key details"], ["accredited", "Accredited investor declaration"]];

/** The Memorandum, Contribution Agreement, Annexure A and Exhibit B spots of one fund. */
function listAgreementFields(fund) {
  const { memorandumName: m, notice: n, executionDate: e, annexureA: a, accredited: c } = fund;
  const at = (key, page, [x, y, maxWidth], source, options) => text(`${key}_p${page}`, page, x, y, maxWidth, source, options);
  const memo = { section: "memorandum" }, annex = { section: "annexure-a" }, accr = { section: "accredited" };
  const annexureFields = [
    at("subscriber_name", a.page, a.name, "copy.subscriber_name", { fontSize: 9, ...annex }),
    a.address[3] ? multiline(`subscriber_address_p${a.page}`, a.page, a.address[0], a.address[1], a.address[2], a.address[3], "copy.subscriber_address", { fontSize: 7, ...annex })
      : at("subscriber_address", a.page, a.address, "copy.subscriber_address", { fontSize: 8, ...annex }),
    at("subscription_amount", a.page, a.amount, "copy.subscription_amount", { fontSize: 8, ...annex }),
    at("subscription_amount_words", a.page, a.amountWords, "copy.subscription_amount_words", { fontSize: 6.5, ...annex }),
    at("class_of_units", a.page, a.unitClass, "copy.class_of_units", { fontSize: 8, ...annex }),
    ...a.mailing.map((y, index) => at(`mailing_address_line${index + 1}`, a.page, [101, y, 418], `copy.mailing_address_line${index + 1}`, annex)),
    at("email", a.page, a.email, "copy.email", annex),
    at("mobile", a.page, a.telephone1, "copy.mobile", annex),
    at("landline", a.page, a.telephone2, "copy.landline", annex),
  ];
  const boxesAt = (boxes, page, y) => boxes.map((x) => [x, y - 6.6 * 0.8, page]);
  const category = c.categoryBoxes, joint = c.jointBoxes, certificate = c.certificateBoxes, additional = c.additionalBoxes;
  const accreditedFields = [
    at("subscriber_name", c.name.page, [c.name.x, c.name.y, c.name.maxWidth], "copy.subscriber_name", { fontSize: 9, ...accr }),
    tick("accredited_investor_category", category.page, 6.6, {
      "Individual - income criteria": boxesAt([category.individualX, category.incomeX], category.page, category.y),
      "Individual - net assets criteria": boxesAt([category.individualX, category.netAssetsX], category.page, category.y) }, accr),
    text("accredited_income_financial_year", c.incomeYear.page, c.incomeYear.x, c.incomeYear.y, c.incomeYear.maxWidth, "typed", accr),
    tick("accredited_joint_investment", joint.page, joint.size, {
      "Parent(s) and child(ren)": [joint.x, joint.parentChildY - joint.size * 0.8], Spouses: [joint.x, joint.spousesY - joint.size * 0.8] }, accr),
    tick("accredited_documentation", certificate.page, 6.6, {
      "Certificate (last 6 months)": boxesAt([certificate.natureX, certificate.documentX], certificate.page, certificate.y),
      "Additional documentation": boxesAt([additional.natureX, additional.documentX], additional.page, additional.y) }, accr),
    text("accredited_additional_documentation", c.additionalText.page, c.additionalText.x, c.additionalText.y, c.additionalText.maxWidth, "typed", accr),
    at("subscriber_name", c.final.page, [108, c.final.nameY, 200], "copy.subscriber_name", accr),
    at("form_date", c.final.page, [104, c.final.dateY, 120], "copy.form_date", accr),
  ];
  return [
    at("subscriber_name", m.page, [m.x, m.y, m.maxWidth], "copy.subscriber_name", { fontSize: 9, ...memo }),
    at("distributor_name", n.page, n.distributor, "copy.distributor_name", memo),
    at("subscriber_name", n.page, n.name, "copy.subscriber_name", memo),
    at("form_date", n.page, n.date, "copy.form_date", memo),
    at("place", n.page, n.place, "copy.place", memo),
    text("agreement_execution_day", e.page, ...e.day, "typed", { section: "agreement" }),
    text("agreement_execution_month", e.page, ...e.month, "typed", { section: "agreement" }),
    ...annexureFields, ...accreditedFields,
  ];
}

/** A signature box sitting on a printed signature line (x0-x1 at baseline y). */
const onLine = (page, [x0, x1, y], signer, label) => ({ page, x: x0, y: Math.round((y - 24) * 10) / 10, w: Math.round((x1 - x0) * 10) / 10, h: 24, signer, label });

function listAgreementSignatureBoxes(fund) {
  const { notice, contributorSignatureLine, annexureA, annexureBSignatureLines: annexureB, accredited } = fund;
  return [
    onLine(notice.page, notice.signatureLine, "subscriber", "Memorandum - important notice"),
    onLine(contributorSignatureLine.page, contributorSignatureLine.line, "subscriber", "Contribution Agreement - contributor"),
    onLine(annexureA.page, annexureA.signatureLine, "subscriber", "Annexure A - contributor"),
    ...(annexureB ? [onLine(annexureB.page, annexureB.first, "subscriber", "Annexure B - first contributor"),
      onLine(annexureB.page, annexureB.second, "joint_holder", "Annexure B - second contributor")] : []),
    onLine(accredited.final.page, accredited.final.signatureLine, "subscriber", "Accredited investor declaration"),
  ];
}

const REQUIRED_FIELDS = ["subscriber_name", "dob", "tax_reference_number", "gender", "residential_status", "mobile", "email",
  "account_name", "account_number", "bank_name", "swift_code", "subscription_amount", "class_of_units", "pep_status",
  "tax_resident_outside_india", "wish_to_nominate", "place"];

function listReviewSections(fields) {
  return [...APPLICATION_SECTIONS, ...AGREEMENT_SECTIONS].map(([sectionKey, title]) => {
    const sectionFields = fields.filter((field) => field.section === sectionKey);
    const pages = [...new Set(sectionFields.flatMap((field) => [field.page, ...Object.values(field.boxesByOption || {}).flat().map((box) => box.page || field.page)]))].sort((a, b) => a - b);
    const pageWords = pages.length > 1 ? `Pages ${pages[0]}-${pages[pages.length - 1]}` : `Page ${pages[0]}`;
    return { key: sectionKey, label: `${pageWords} · ${title}`, fields: sectionFields.map((field) => field.key) };
  });
}

function writeFund(fund) {
  const folder = path.join(FORMS, fund.formId);
  const writeJson = (fileName, content) => writeFileSync(path.join(folder, fileName), JSON.stringify(content, null, 2) + "\n");
  mkdirSync(folder, { recursive: true });
  copyFileSync(path.join(GIFT_FILES, fund.sourcePdf), path.join("data/Blank Forms", fund.blankFileName));

  const allFields = [...listApplicationFields(), ...listAgreementFields(fund)];
  const duplicateKeys = allFields.map((field) => field.key).filter((key, index, keys) => keys.indexOf(key) !== index);
  if (duplicateKeys.length) throw new Error(`${fund.formId}: duplicate keys ${duplicateKeys.join(", ")}`);
  const textFields = allFields.filter((field) => !field.tickbox);
  const tickboxes = allFields.filter((field) => field.tickbox);

  writeJson("field-positions.json", { _about: `Where each value is written on the blank ${fund.fundName} Application Form & Documentation Set, 83 pages. Made by tools/form-building/make_gift_feeder_subscriptions.mjs.`,
    formId: fund.formId, title: `${fund.fundName} - Application Form`,
    fields: textFields.map(({ source, section, ...field }) => ({ key: field.key, nominee: null, ...field })) });

  writeJson("field-sources.json", {
    _about: "Form field -> where its value comes from. \"document.X\" = X read from the applicant's KYC documents (see ../document-data-dictionary.json); \"|upper\" etc. = the part or form of it this box wants; \"typed\" = from the batch Excel or the review screen; \"copy.X\" = same as field X unless typed separately; \"today\" = today's date; \"tick\" = a tick box, answered per client in the Excel (never assumed). joint_holder_* = the second applicant (typed). No GIFT City field sheet exists yet: sources follow the VCC subscription forms.",
    fieldSources: Object.fromEntries(allFields.map((field) => [field.key, field.tickbox ? "tick" : field.source])) });

  writeJson("required-fields.json", { _about: "Fields that must be filled before a case can be confirmed. Changed from the Form setup screen.", requiredFields: REQUIRED_FIELDS });

  writeJson("form-rules.json", {
    _about: "Form-level rules: how the form is recognised, which tab it saves to. One person (the first applicant) - their KYC documents fill the identity fields, the Excel fills the rest; the second applicant's fields are typed.",
    formId: fund.formId, group: "GIFT City", label: fund.label, shortLabel: fund.shortLabel,
    purpose: "New investment · application form and contribution agreement", blankFileName: fund.blankFileName,
    keyFields: ["Applicant name", "Subscription amount", "Bank account"], sheetTabName: fund.shortLabel,
    detectionPhrases: [fund.fundName, "Application Form for First Applicant"], supportedNomineeCount: 1, personLabel: "Applicant",
    identityType: { scope: "shared", tickboxField: null, numberField: null, optionByIdentityKind: {}, numberFieldByIdentityKind: {} },
    reviewSections: listReviewSections(allFields) });

  const signatureBoxes = [...APPLICATION_SIGNATURE_BOXES, ...listAgreementSignatureBoxes(fund)];
  const ignoredBlanks = [...APPLICATION_IGNORED_BLANKS, ...fund.agreementIgnoredBlanks.map(([page, y, why]) => ({ page, y, why }))];
  writeJson("form-configuration.json", {
    _about: `${fund.fundName} - Application Form & Documentation Set, 83 pages. Made by tools/form-building/make_gift_feeder_subscriptions.mjs; pages 1-21 shared by the three GIFT feeder funds, pages 22-83 measured on this blank. Every tick box is its own question with no assumed answer.`,
    id: fund.formId, title: `${fund.fundName} - Application Form`, labels: [], signatureBoxes,
    tickboxes: tickboxes.map(({ tickbox, section, ...tickboxSpec }) => tickboxSpec),
    blankFileName: fund.blankFileName, nomineeHeaderRe: null, tickboxRule: "usual", ignoredBlanks });

  console.log(`wrote ${folder}: ${textFields.length} fields, ${tickboxes.length} tick boxes, ${signatureBoxes.length} signatures`);
}

const onlyFormId = process.argv[2];
for (const fund of FUNDS) if (!onlyFormId || fund.formId === onlyFormId) writeFund(fund);
