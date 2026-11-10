// Application pages (1-24) of the 360 ONE India Diversified Fund forms (CAT III AIF, 76 pages, vector PDF).
// Pages 4-11 match the Global Real Assets set (gift-gra-application-pages.mjs; compared pixel by pixel, under 2.6%
// different). Three pages are added after page 13, so the investor profile moves from page 14 to 17 and the nomination
// from 21 to 24 (same layout):
//   14  FME contribution waiver letter: date, first and second holder sign.
//   15  Letter on the nominee/omnibus investor's letter head: only for nominee/omnibus investors, left blank.
//   16  Declaration by investor (section 10(4D) tax status): date, place, first and second holder sign.
// Used by make_gift_feeder_subscriptions.mjs.
import { GRA_APPLICATION_IGNORED_BLANKS, GRA_APPLICATION_SIGNATURE_BOXES, listGraApplicationFields } from "./gift-gra-application-pages.mjs";
import { comb, text } from "./gift-feeder-application-pages.mjs";

const PAGE_SHIFT = 3;
const SHIFTED_FROM_PAGE = 14;

/** Moves a field of the investor profile / nomination 3 pages on, renaming "_p14" / "_p21" keys to the new page. */
function shiftField(field) {
  if (field.page < SHIFTED_FROM_PAGE) return field;
  const page = field.page + PAGE_SHIFT;
  const key = field.key.replace(/_p(\d+)$/, (match, oldPage) => `_p${Number(oldPage) + PAGE_SHIFT}`);
  return { ...field, key, page };
}

/** Pages 14 and 16: the waiver letter and the tax declaration, dated and placed like the application. */
function waiverAndTaxDeclarationPages() {
  const w = { section: "signed" };
  return [
    comb("form_date_p14", 14, 139.1, 53.1, 8, "copy.form_date", { pitch: 14.4, ...w }),
    text("form_date_p16", 16, 100, 662.2, 120, "copy.form_date", w),
    text("place_p16", 16, 104, 687.5, 160, "copy.place", w),
  ];
}

export function listIdfApplicationFields() {
  return [...listGraApplicationFields().map(shiftField), ...waiverAndTaxDeclarationPages()];
}

/** A signature box sitting on a printed signature line (x0-x1 at baseline y). */
const onLine = (page, [x0, x1, y], signer, label) => ({ page, x: x0, y: Math.round((y - 24) * 10) / 10, w: Math.round((x1 - x0) * 10) / 10, h: 24, signer, label });

export const IDF_APPLICATION_SIGNATURE_BOXES = [
  ...GRA_APPLICATION_SIGNATURE_BOXES.map((box) => (box.page >= SHIFTED_FROM_PAGE ? { ...box, page: box.page + PAGE_SHIFT } : box)),
  onLine(14, [31.3, 155.8, 430.7], "subscriber", "FME contribution waiver - first holder"),
  onLine(14, [229.1, 353.7, 430.7], "joint_holder", "FME contribution waiver - second holder"),
  onLine(16, [68.9, 193.4, 776.3], "subscriber", "Declaration by investor - first holder"),
  onLine(16, [266.7, 391.2, 776.3], "joint_holder", "Declaration by investor - second holder"),
];

export const IDF_APPLICATION_IGNORED_BLANKS = [
  ...GRA_APPLICATION_IGNORED_BLANKS.map((blank) => (blank.page >= SHIFTED_FROM_PAGE ? { ...blank, page: blank.page + PAGE_SHIFT } : blank)),
  ...[380, 459, 488, 512, 534, 567].map((y) => ({ page: 6, y, why: "Section 7 FATCA & CRS for non-individuals (entities) only" })),
  ...[235.9, 249.0, 696.4, 748.7, 768.8].map((y) => ({ page: 15, y, why: "Letter on the nominee/omnibus investor's letter head: only for nominee/omnibus investors" })),
];
