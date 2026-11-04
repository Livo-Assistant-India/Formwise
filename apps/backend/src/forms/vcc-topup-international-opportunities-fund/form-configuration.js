// 360 ONE International Opportunities Fund - Additional Subscription (top-up) form, 4 pages. Written by the VCC top-up generator: positions
// are measured from the blank's underscore lines and series tick boxes.
import path from "node:path";
import { BLANK_FORMS_DIRECTORY } from "../../config/paths-config.js";

export const VCC_TOPUP_INTERNATIONAL_OPPORTUNITIES_FUND_FORM_CONFIGURATION = {
  id: "vcc-topup-international-opportunities-fund",
  title: "360 ONE International Opportunities Fund - Additional Subscription",
  blankFormPath: path.join(BLANK_FORMS_DIRECTORY, "360 ONE International Opportunities Fund - Additional Subscription.pdf"),
  nomineeHeaderRe: /(?!)/,
  labels: [],
  // Page 1 "Investor Signature" line and page 3 "For individuals" signature line.
  signatureBoxes: [
    { page: 1, x: 384, y: 289, w: 178, h: 16, signer: "subscriber", label: "Investor signature" },
    { page: 3, x: 175, y: 196, w: 175, h: 19, signer: "subscriber", label: "Subscriber signature" },
  ],
  tickboxes: [],
};
