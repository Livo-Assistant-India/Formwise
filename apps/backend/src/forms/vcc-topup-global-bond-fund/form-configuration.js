// 360 ONE Global Bond Fund - Series II - Additional Subscription (top-up) form, 4 pages. Written by the VCC top-up generator: positions
// are measured from the blank's underscore lines and series tick boxes.
import path from "node:path";
import { BLANK_FORMS_DIRECTORY } from "../../config/paths-config.js";

export const VCC_TOPUP_GLOBAL_BOND_FUND_FORM_CONFIGURATION = {
  id: "vcc-topup-global-bond-fund",
  title: "360 ONE Global Bond Fund - Series II - Additional Subscription",
  blankFormPath: path.join(BLANK_FORMS_DIRECTORY, "360 ONE Global Bond Fund - Series II - Additional Subscription.pdf"),
  nomineeHeaderRe: /(?!)/,
  labels: [],
  // Page 1 "Investor Signature" line and page 3 "For individuals" signature line.
  signatureBoxes: [
    { page: 1, x: 384, y: 289, w: 178, h: 16, signer: "subscriber", label: "Investor signature" },
    { page: 3, x: 175, y: 196, w: 175, h: 19, signer: "subscriber", label: "Subscriber signature" },
  ],
  tickboxes: [{"key": "series", "page": 1, "w": 7.0, "h": 11.3, "options": ["Series A (ISIN SGXZ51510022)", "Series B (ISIN SGXZ73357493)"], "boxesByOption": {"Series A (ISIN SGXZ51510022)": [{"x": 499.7, "y": 373.9}], "Series B (ISIN SGXZ73357493)": [{"x": 499.5, "y": 401.7}]}}],
};
