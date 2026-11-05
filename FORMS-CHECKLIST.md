# Forms checklist

One line per form. Tick a box only after doing it, never in advance. A form is **Done** only when every box is ticked.
`NEXT-CHAT.md` has how a form is built; this file only tracks where each form stands.

**Checks, in order**
1. **Built**: folder in `apps/backend/src/forms/<id>/` + entry in `form-registry.js`.
2. **Every blank covered**: `pnpm check-forms` passes (every underscore line, ☐ box and dotted line has a field, or
   is listed in `ignoredBlanks` with the reason), and empty table cells were checked by eye.
3. **Test fill**: every field and tick filled through the API, every page with fields rendered and looked at.
4. **UI test**: case made in the app (documents + Excel), review screen and final PDF checked.
5. **Sheet check**: every field's source matches its tab in `VCC & Gift City Form Details.xlsx`.
6. **User OK**: the user tested it and said it works. Only then start the next form.

Legend: ✅ done · ⏳ in progress · ⬜ not started · ❓ waiting on the user or 360 ONE

## VCC (files in `C:\zzz\demo\VCC`)

| Form | Form id | Built | Blanks | Test fill | UI test | Sheet | User OK |
|------|---------|:-----:|:------:|:---------:|:-------:|:-----:|:-------:|
| Global Bond Fund II – Subscription (Non-US) | `global-bond-fund-subscription` | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ |
| Global Bond Fund II – Top-up | `vcc-topup-global-bond-fund` | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ |
| Global Investment Fund 2 – Subscription (Non-US) | `global-investment-fund-2-subscription` | ✅ | ✅ | ✅ | ✅ | ❓ | ❓ |
| Global Investment Fund 2 – Top-up | `vcc-topup-global-investment-fund-2` | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ |
| International Opportunities Fund – Top-up | `vcc-topup-international-opportunities-fund` | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ |
| VCC – Redemption | `vcc-redemption` | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ |
| W-9 | `w9` | ✅ | ✅ | ✅ | ✅ | ✅ | ⬜ |
| W-8BEN – Individual | `w8ben` | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ |
| Growth Strategy Fund – Subscription (Non-US) | `growth-strategy-fund-subscription` | ✅ | ✅ | ✅ | ✅ | ❓ | ❓ |
| International Opportunities Fund – Subscription (Non-US) | `international-opportunities-fund-subscription` | ✅ | ✅ | ✅ | ✅ | ❓ | ❓ |
| Global Bond Fund II – Subscription (US), 125 pages | `global-bond-fund-us-subscription` | ✅ | ✅ | ✅ | ⬜ | ❓ | ❓ |
| India Equity Fund – Subscription (US), 121 pages | `india-equity-fund-us-subscription` | ✅ | ✅ | ✅ | ⬜ | ❓ | ❓ |
| W-8BEN-E (entities) | `w8ben-e` | ✅ | ✅ | ✅ | ✅ | ❓ | ❓ |
| GIF 2 Joint Holder Declaration | `global-investment-fund-2-joint-holder` | ✅ | ✅ | ✅ | ✅ | ❓ | ❓ |
| Growth Strategy Fund – Additional Declaration (joint) | `growth-strategy-fund-joint-investor` | ✅ | ✅ | ✅ | ✅ | ❓ | ❓ |
| IOF – Additional Declaration (joint) | `international-opportunities-fund-joint-investor` | ✅ | ✅ | ✅ | ✅ | ❓ | ❓ |
| GBF joint holder – Opt-in | `global-bond-fund-joint-opt-in` | ✅ | ✅ | ✅ | ✅ | ❓ | ❓ |
| GBF joint holder – PEP declaration | `global-bond-fund-joint-pep` | ✅ | ✅ | ✅ | ✅ | ❓ | ❓ |
| GBF joint holder – Singapore tax | `global-bond-fund-joint-singapore-tax` | ✅ | ✅ | ✅ | ✅ | ❓ | ❓ |
| GBF joint holder – Self-certification | `global-bond-fund-joint-self-certification` | ✅ | ✅ | ✅ | ✅ | ❓ | ❓ |
| Investor Profiler (Excel output, not a PDF) | `investor-profile` | ✅ | ✅ | ✅ | ⬜ | ❓ | ❓ |
| Dynamic Equity Allocator Fund – Subscription and Top-up | – | ❓ | | | | | |
| Growth Strategy Fund – Top-up | – | ❓ | | | | | |

Notes:
- GBF subscription and W-8BEN were built for the demo from 360 ONE's filled samples. Their blanks were not
  scanned against the full checklist yet, and the GBF form must be compared with their new 63-page file (04.07.25).
- GIF 2 and Growth Strategy subscriptions: sources copied from the GBF form because the field sheet was not on
  disk. Check them against the sheet's tabs when it is back.
- The blank check (2026-11-04) found gaps in forms built earlier, now covered: top-ups' page 3 "For entities"
  signatories (2 names + 2 signatures, optional), Redemption's "Investor Initial" on every page, CRN's "NRN No."
  (optional typed field). Confirm with 360 ONE where NRN No. should come from.
- India Equity Fund (US): in scope (Mayur, 04 Nov: only GBF Series II and India Equity Fund are open to US investors).
- 360 ONE still owes: the mandatory fields per form, and the document priority per KYC field (e.g. address from
  Aadhaar first, then a utility bill). Until then "required" fields are our best reading of each form.
- Joint holder / joint investor forms (decided 04 Nov): their fields are `joint_holder_…` (one Excel row carries the
  investor and the joint holder), and in a batch they read the client folder's "Joint holder" subfolder, never the
  investor's documents (form-rules `"personRole": "joint_holder"`).
- GBF subscription rebuilt (05 Nov) on 360 ONE's current file (04.07.25, 63 pages). All four VCC subscriptions are now
  generated from one template, tools/form-building/vcc-subscription-base/ (the old 65-page GBF mapping).
- Investor Profiler (05 Nov): fills a copy of their Excel template cell by cell (`outputType: "xlsx"`). Only name, address,
  date of birth and passport come from documents; everything else is typed until the field sheet is back. Form setup lists
  its cells instead of page boxes. Test fill checked cell by cell; the in-app test with documents is still to do.
- US subscriptions (05 Nov): both made by tools/form-building/make_vcc_us_subscriptions.mjs (GBF US measured, IEF US by page
  map). Open with 360 ONE: blanks missing boxes (GBF Annex 3 B1-B3, Annex 5 J9, CFIUS 3.5); FATCA "regularly traded" box
  comes pre-ticked on the blank; initials vs ticks on "initial one" items; whether K-1 consent (GBF p118) is signed by
  default; telephone uses the Indian mobile check; no US tabs in the field sheet, so non-KYC fields are typed.
- Dynamic Equity Allocator Fund, Growth Strategy Fund top-up: no files received yet.

## GIFT City

Forms are in 360 ONE's emails of 04 Nov (Mayur). Redemption and Top-up are ONE common form each for every GIFT fund.

| Form | Form id | Built | Blanks | Test fill | UI test | Sheet | User OK |
|------|---------|:-----:|:------:|:---------:|:-------:|:-----:|:-------:|
| (waiting for the user to add the GIFT City forms next to `VCC`) | | ❓ | | | | | |

## NFT (58 service-request types)

| Form | Form id | Built | Blanks | Test fill | UI test | Sheet | User OK |
|------|---------|:-----:|:------:|:---------:|:-------:|:-----:|:-------:|
| CAMS Mutual Fund – Nomination | `cams-nomination` | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ |
| Broking & Demat – Nomination | `crn-broking-demat` | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ |
| The other NFT forms (waiting for 360 ONE's forms and field lists) | | ❓ | | | | | |
