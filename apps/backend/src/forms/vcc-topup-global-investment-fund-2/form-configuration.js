// 360 ONE Global Investment Fund 2 - Additional Subscription (top-up) form, 4 pages. Written by the VCC top-up generator: positions
// are measured from the blank's underscore lines and series tick boxes.
import path from "node:path";
import { BLANK_FORMS_DIRECTORY } from "../../config/paths-config.js";

export const VCC_TOPUP_GLOBAL_INVESTMENT_FUND_2_FORM_CONFIGURATION = {
  id: "vcc-topup-global-investment-fund-2",
  title: "360 ONE Global Investment Fund 2 - Additional Subscription",
  blankFormPath: path.join(BLANK_FORMS_DIRECTORY, "360 ONE Global Investment Fund 2 - Additional Subscription.pdf"),
  nomineeHeaderRe: /(?!)/,
  labels: [],
  // Page 1 "Investor Signature" line and page 3 "For individuals" signature line.
  signatureBoxes: [
    { page: 1, x: 384, y: 289, w: 178, h: 16, signer: "subscriber", label: "Investor signature" },
    { page: 3, x: 175, y: 196, w: 175, h: 19, signer: "subscriber", label: "Subscriber signature" },
  ],
  tickboxes: [{"key": "series", "page": 1, "w": 9.0, "h": 9.96, "options": ["Series A", "Series B", "Series C", "Series D", "Series E"], "boxesByOption": {"Series A": [{"x": 297.0, "y": 375.4}], "Series B": [{"x": 297.0, "y": 400.4}], "Series C": [{"x": 297.0, "y": 427.7}], "Series D": [{"x": 297.0, "y": 455.1}], "Series E": [{"x": 297.0, "y": 482.5}]}}],
};
