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
| 360 ONE Redemption – Global USD (common) | `gift-redemption-global-usd` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| 360 ONE Top-up on Commitment – Global USD (common) | `gift-topup-global-usd` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| White Oak EM ex India – Redemption | `gift-whiteoak-em-redemption` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| White Oak EM ex India – Top-up (Amendment) | `gift-whiteoak-em-topup` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| SBI Global Thematic Advantage – Additional Capital Commitment | `gift-sbi-gtaf-additional-commitment` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| ABSL EM Equity – Application (Individual), 20 pages | `gift-absl-em-equity-individual` | ✅ | ✅ | ✅ | ⬜ | ❓ | ⬜ |
| ABSL EM Equity – Application (Non-individual), 23 pages | `gift-absl-em-equity-non-individual` | ✅ | ✅ | ✅ | ⬜ | ❓ | ⬜ |
| Dynamic Equity Allocator GIFT Feeder – Subscription, 83 pages | `gift-dynamic-equity-allocator-subscription` | ✅ | ✅ | ✅ | ⬜ | ❓ | ⬜ |
| Growth Strategy GIFT – Subscription, 83 pages | `gift-growth-strategy-subscription` | ✅ | ✅ | ✅ | ⬜ | ❓ | ⬜ |
| International Opportunities GIFT Feeder – Subscription, 83 pages | `gift-international-opportunities-subscription` | ✅ | ✅ | ✅ | ⬜ | ❓ | ⬜ |
| Global Real Assets – Subscription, 71 pages | `gift-global-real-assets-subscription` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| India Diversified (CAT III) – Subscription, 76 pages | `gift-india-diversified-subscription` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| SBI Global Thematic Advantage – Application, 68 pages | `gift-sbi-gtaf-application` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| WhiteOak Global EM ex India – Application, 76 pages | `gift-whiteoak-em-application` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |

GIFT City notes (files in `C:\zzz\demo\GIFT`, 09 Nov):
- No GIFT City field sheet: name from KYC (upper case), dates = today, everything else typed (Excel). Confirm every source.
- Scheme name is typed on the common forms: fixed per fund, or typed?
- Amounts in words are typed: should the app write them from the number?
- Second/third holders: names typed, signatures not stamped. Joint holders in scope?
- 360 ONE Redemption: "Amount (USD)" ticks both the figures and the words box.
- White Oak Redemption: unlabelled box left of "Amount (USD)" is left empty — what goes there?
- White Oak Top-up: which amendment row does a new top-up go in? Should the revised totals be calculated?
- SBI: Contribution Agreement date, unit class and total commitment are typed. "Class ___" space is short.
- Application sets (10 Nov): nominee details tables are not filled (only "wish / do not wish to nominate"), as on the
  feeder forms. Guardian (minor) and non-individual sections are left blank.
- India Diversified: its accredited-investor tables have no tick boxes, so no category is ticked. Annexure A amount
  line has a second blank ("(USD/GBP) ___") left empty.
- SBI application: the "Please tick" columns for total expense and set-up fee (Annexure A) follow the unit class; left
  blank for now.
- WhiteOak application: the management fee, placement cost, operating and set-up expense brackets (Annexure A) are
  typed per case; ask if they are fixed per fund. Landline has 8 boxes after a separate STD code.

## NFT (58 service-request types)

| Form | Form id | Built | Blanks | Test fill | UI test | Sheet | User OK |
|------|---------|:-----:|:------:|:---------:|:-------:|:-----:|:-------:|
| CAMS Mutual Fund – Nomination | `cams-nomination` | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ |
| Broking & Demat – Nomination | `crn-broking-demat` | ✅ | ✅ | ✅ | ✅ | ⬜ | ⬜ |
| Account closure – HDFC Bank account | `hdfc-bank-account-closure` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| Account closure – HDFC Bank demat (CDSL / NSDL) | `hdfc-demat-account-closure` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| Account closure – 360 ONE broking & demat | `broking-demat-closure` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| Account closure – 360 ONE PMS (AMC) | `pms-account-closure` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| Dormant account activation – HDFC Bank (letter) | `hdfc-dormant-activation` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| Aadhaar e-KYC consent – HDFC Bank | `hdfc-aadhaar-consent` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| Dormant activation & re-KYC – HDFC Bank (resident individuals) | `hdfc-rekyc-dormant-activation` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| Account closure – IIFL Capital trading / demat | `iifl-demat-closure` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| PIS permission cancellation – HDFC Bank (NR accounts) | `hdfc-pis-cancellation` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| Account closure – HSBC PMS accounts (UBS format) | `hsbc-pms-closure` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| POA account closure – 360 ONE Distribution (Word) | `distribution-poa-closure` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| POA account closure – 360 ONE Advisory (Word) | `advisory-poa-closure` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| Account closure – 360 ONE Portfolio Managers PMS (Word) | `pms-portfolio-managers-closure` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| Power of attorney revocation – HDFC Bank (Word) | `hdfc-poa-revocation` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| Unclaimed deposits (RBI DEAF) claim – HDFC Bank | `hdfc-deaf-claim` | ✅ | ✅ | ✅ | ✅ | ❓ | ⬜ |
| Account closure: still to do – RBI DEAF request letter (non-individual), non-individual dormant re-KYC (8 p), board resolutions ×4, PoA revocation (bank + demat), Notice of Termination – Advisory, Dormant Removal letters ×3 (Word) | | ⬜ | | | | | |
| The other NFT forms (waiting for 360 ONE's forms and field lists) | | ❓ | | | | | |

Account closure notes (10 Nov): files in `C:\zzz\demo\Account Closure Forms`; the same form often repeats across the
Individual / Non-Individual and Bank / PMS / Demat folders (identical text). Built from `tools/form-building/make_closure_forms.mjs`.
- HDFC demat closure: built on REVISED1 (Ver 1.02 Oct 2021, a scan); the custodian's address is printed on it.
- No field sheet for closure forms: first holder's name from KYC, everything else from the Excel.
- "Demat Closure form.pdf" (Demat folder) is the same file as the 360 ONE broking & demat closure (pixel-identical);
  IndusInd "Closure Broking PMS" differs by 0.5% - check before building it as a separate form.
- PIS cancellation letter is a rotated scan with no text: its blank is redrawn upright with a hidden text layer by
  `tools/form-building/make_closure_blanks.py` (run it before make_closure_forms.mjs).
- Word forms: `tools/form-building/convert_word_blanks.ps1` (Microsoft Word) turns them into PDF blanks first.
- UI test of the second and third five was run through the app's API (Chrome extension disconnected): upload, Excel import,
  fill and PDF checked; the Review screen itself was not opened for these five.
