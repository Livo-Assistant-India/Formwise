// IRS Form W-9 (Rev. March 2024), for U.S. persons. The blank is the IRS form with its fill-in boxes removed;
// positions come from those boxes. The SSN goes one digit per printed box (combs).
import path from "node:path";
import { BLANK_FORMS_DIRECTORY } from "../../config/paths-config.js";

export const W9_FORM_CONFIGURATION = {
  id: "w9",
  title: "Form W-9",
  blankFormPath: path.join(BLANK_FORMS_DIRECTORY, "Form W-9.pdf"),
  nomineeHeaderRe: /(?!)/,
  labels: [],
  // "Signature of U.S. person" (Sign Here row, page 1).
  signatureBoxes: [{ page: 1, x: 124, y: 577, w: 250, h: 20, signer: "subscriber", label: "U.S. person's signature" }],
  tickboxes: [],
};
