// 360 ONE Alternatives VCC - Common Redemption Form (3 pages, same form for every VCC fund). Text positions are
// measured from the blank's own labels and table cells; tick boxes are its ☐ glyphs (x, y = glyph baseline).
import path from "node:path";
import { BLANK_FORMS_DIRECTORY } from "../../config/paths-config.js";

export const VCC_REDEMPTION_FORM_CONFIGURATION = {
  id: "vcc-redemption",
  title: "360 ONE Alternatives VCC - Redemption Request",
  blankFormPath: path.join(BLANK_FORMS_DIRECTORY, "360 ONE Alternatives VCC - Common Redemption Form.pdf"),
  nomineeHeaderRe: /(?!)/,
  labels: [],
  // Blank space under "Signature of Shareholder/ Authorized Signatory" (page 3).
  signatureBoxes: [{ page: 3, x: 72, y: 596, w: 190, h: 32, signer: "subscriber", label: "Shareholder's signature" }],
  tickboxes: [
    {
      key: "redemption_type", page: 2, w: 8.6, h: 9.96, options: ["Full (100%)", "Partial"],
      boxesByOption: { "Full (100%)": [{ x: 196.9, y: 297.8 }], Partial: [{ x: 196.9, y: 325.5 }] },
    },
  ],
};
