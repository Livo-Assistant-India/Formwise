// Writes every VCC Subscription Agreement (Non-US) form folder from the Global Bond Fund one. Each fund's agreement
// is the same document with some pages moved or changed: field pages were matched to the GBF ones by their text, and
// anything that moved was measured on that fund's own blank (FUNDS below). Change this file, not its output.
// usage (from the repo root): node tools/form-building/make_vcc_subscriptions.mjs [form-id]
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const FORMS = "apps/backend/src/forms/vcc";
const BASE_FOLDER = path.join(FORMS, "global-bond-fund-subscription");
const VCC_FILES = "../VCC";

// pageMap: GBF page -> this fund's page (missing = same number). pageShifts: y moves (pt) for everything on a page.
// droppedKeys: GBF fields this fund's blank does not have. series: tick boxes (baselines) or typed lines (positions).
const FUNDS = [
  {
    formId: "global-investment-fund-2-subscription", fundName: "360 ONE Global Investment Fund 2", pageCount: 63,
    label: "Global Investment Fund 2 – Subscription", shortLabel: "GIF 2 subscription",
    blankFileName: "360 ONE Global Investment Fund 2 - Subscription.pdf",
    sourcePdf: "360 ONE Global Investment Fund 2/360 ONE Global Investment Fund 2 - Subscription Agreement (Non-US) - 06.10.25.pdf",
    pageMap: { 16: 15, 17: 16, 27: 26, 28: 27, 31: 30, 32: 31, 33: 32, 34: 33, 35: 34, 36: 35, 37: 36, 38: 37, 39: 38,
      41: 40, 54: 50, 57: 54, 58: 55, 59: 56, 62: 59, 63: 60, 64: 61, 65: 62 },
    // Page 50 is an "Opt-In Confirmation Form" (GBF page 54 is "Acknowledgement and Consent"): no signatory lines.
    droppedKeys: ["authorised_signatory_name_p50", "authorised_signatory_designation_p50"],
    pageShifts: { 61: -36.6 },
    positionOverrides: {
      subscription_amount: { y: 376.44 }, initial_sales_charge: { y: 548.2 },
      subscriber_name_p15: { y: 719.0 }, form_date_p15: { y: 744.0 }, place: { y: 755.3 },
      subscriber_name_p50: { x: 280, y: 200.8, maxWidth: 236, alsoAt: [{ page: 50, x: 88, y: 589, maxWidth: 200 }] },
      form_date_p50: { x: 82, y: 649.4 },
    },
    series: { type: "ticks", baselines: { "Series A": 448.4, "Series B": 466.6, "Series C": 484.7, "Series D": 503.0, "Series E": 521.2 } },
    signatureOverrides: { 2: { y: 662 }, 15: { y: 679 }, 50: { x: 54, y: 596, w: 196, h: 22, label: "Opt-in confirmation" } },
    sectionRenames: { "Accredited investor consent": "Accredited investor opt-in" },
    wireNote: { page: 17, y: 583 },
  },
  {
    formId: "growth-strategy-fund-subscription", fundName: "360 ONE Growth Strategy Fund", pageCount: 65,
    label: "Growth Strategy Fund – Subscription", shortLabel: "GSF subscription",
    blankFileName: "360 ONE Growth Strategy Fund - Subscription.pdf",
    sourcePdf: "360 ONE Growth Strategy Fund/360 ONE Growth Strategy Fund - Subscription Agreement (Non-U.S.)  - 1.10.26.pdf",
    pageMap: {}, droppedKeys: [],
    // Page 16's signature block sits 32.4pt higher (shorter clause text above it).
    pageShifts: { 16: -32.4 },
    positionOverrides: {},
    // "Series/ Sub-Series: ____" and "ISIN: ____" are typed lines, not tick boxes.
    series: { type: "typed", fields: [
      { key: "series", page: 2, x: 337, y: 435.3, maxWidth: 48, fontSize: 9 },
      { key: "isin", page: 2, x: 281, y: 453.6, maxWidth: 102, fontSize: 9 },
    ] },
    signatureOverrides: {},
    sectionRenames: {},
    wireNote: { page: 18, y: 560 },
  },
];

const roundNumber = (number) => Math.round(number * 100) / 100;

function writeFund(fund) {
  const folder = path.join(FORMS, fund.formId);
  const toFundPage = (gbfPage) => {
    const fundPage = fund.pageMap[gbfPage] ?? gbfPage;
    if (fundPage > fund.pageCount) throw new Error(`${fund.formId}: GBF page ${gbfPage} -> ${fundPage} is past the last page`);
    return fundPage;
  };
  const renameKey = (fieldKey) => fieldKey.replace(/_p(\d+)$/, (_match, gbfPage) => `_p${toFundPage(Number(gbfPage))}`);
  const droppedKeys = new Set(fund.droppedKeys);
  const isKept = (fieldKey) => !droppedKeys.has(fieldKey);
  const shiftY = (page, y) => roundNumber(y + (fund.pageShifts[page] || 0));
  const readBaseJson = (fileName) => JSON.parse(readFileSync(path.join(BASE_FOLDER, fileName), "utf-8"));
  const writeJson = (fileName, content) => writeFileSync(path.join(folder, fileName), JSON.stringify(content, null, 2) + "\n");
  const remapPageLabel = (label) => Object.entries(fund.sectionRenames).reduce((renamed, [from, to]) => renamed.replace(from, to), label
    .replace(/Pages (\d+)-(\d+)/, (_match, first, last) => `Pages ${toFundPage(Number(first))}-${toFundPage(Number(last))}`)
    .replace(/Page (\d+)/, (_match, gbfPage) => `Page ${toFundPage(Number(gbfPage))}`));
  const isTypedSeries = fund.series.type === "typed";

  mkdirSync(folder, { recursive: true });
  copyFileSync(path.join(VCC_FILES, fund.sourcePdf), path.join("data/Blank Forms", fund.blankFileName));

  const baseConfiguration = readBaseJson("form-configuration.json");
  const fields = readBaseJson("field-positions.json").fields
    .map((field) => ({ ...field, key: renameKey(field.key), page: toFundPage(field.page),
      ...(field.alsoAt ? { alsoAt: field.alsoAt.map((repeat) => ({ ...repeat, page: toFundPage(repeat.page) })) } : {}) }))
    .filter((field) => isKept(field.key))
    .map((field) => ({ ...field, y: shiftY(field.page, field.y), ...fund.positionOverrides[field.key] }));
  if (isTypedSeries) for (const seriesField of fund.series.fields) fields.push({ nominee: null, type: "text", ...seriesField });
  writeJson("field-positions.json", { _about: `Where each value is written on the blank ${fund.fundName} Subscription Agreement (Non-US), ${fund.pageCount} pages. Made by tools/form-building/make_vcc_subscriptions.mjs from the GBF form.`, formId: fund.formId, title: `${fund.fundName} - Subscription`, fields });

  const baseSources = readBaseJson("field-sources.json");
  const fieldSources = Object.fromEntries(Object.entries(baseSources.fieldSources)
    .map(([fieldKey, source]) => [renameKey(fieldKey), source.replace(/^copy\.(.+)$/, (_match, copiedKey) => `copy.${renameKey(copiedKey)}`)])
    .filter(([fieldKey]) => isKept(fieldKey)));
  if (isTypedSeries) for (const seriesField of fund.series.fields) fieldSources[seriesField.key] = "typed";
  writeJson("field-sources.json", { _about: baseSources._about, fieldSources });

  const baseRequired = readBaseJson("required-fields.json");
  writeJson("required-fields.json", { _about: baseRequired._about, requiredFields: baseRequired.requiredFields.map(renameKey).filter(isKept) });

  const baseRules = readBaseJson("form-rules.json");
  writeJson("form-rules.json", { ...baseRules, formId: fund.formId, label: fund.label, shortLabel: fund.shortLabel,
    blankFileName: fund.blankFileName, sheetTabName: fund.shortLabel, detectionPhrases: [fund.fundName, "Subscription Agreement for"],
    reviewSections: baseRules.reviewSections.map((section) => {
      const sectionFields = section.fields.map(renameKey).filter(isKept);
      if (isTypedSeries && sectionFields.includes("series")) sectionFields.splice(sectionFields.indexOf("series") + 1, 0, "isin");
      return { ...section, label: remapPageLabel(section.label), fields: sectionFields };
    }) });

  const signatureBoxes = baseConfiguration.signatureBoxes.map((box) => {
    const page = toFundPage(box.page);
    return { ...box, page, y: shiftY(page, box.y), ...fund.signatureOverrides[page] };
  });
  const tickboxes = baseConfiguration.tickboxes
    .filter((tickbox) => !(isTypedSeries && tickbox.key === "series"))
    .map((tickbox) => (tickbox.key === "series"
      ? { ...tickbox, page: 2, options: Object.keys(fund.series.baselines),
        boxesByOption: Object.fromEntries(Object.entries(fund.series.baselines).map(([option, y]) => [option, [{ x: 275.81, y }]])) }
      : { ...tickbox, page: toFundPage(tickbox.page),
        boxesByOption: Object.fromEntries(Object.entries(tickbox.boxesByOption).map(([option, boxes]) =>
          [option, boxes.map((box) => ({ ...box, y: shiftY(toFundPage(tickbox.page), box.y) }))])) }));
  writeJson("form-configuration.json", { ...baseConfiguration,
    _about: `${fund.fundName} - Subscription Agreement (Non-US), ${fund.pageCount} pages. Made by tools/form-building/make_vcc_subscriptions.mjs from the GBF form; changed pages measured on this blank. Every tick box is its own question with no assumed answer.`,
    id: fund.formId, title: `${fund.fundName} - Subscription`, blankFileName: fund.blankFileName, signatureBoxes, tickboxes,
    ignoredBlanks: [{ ...fund.wireNote, why: baseConfiguration.ignoredBlanks[0].why }] });

  console.log(`wrote ${folder}: ${fields.length} fields, ${tickboxes.length} tick boxes, ${signatureBoxes.length} signatures`);
}

const onlyFormId = process.argv[2];
for (const fund of FUNDS) if (!onlyFormId || fund.formId === onlyFormId) writeFund(fund);
