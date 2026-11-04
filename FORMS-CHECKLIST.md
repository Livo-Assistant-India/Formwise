# Forms checklist

One line per form. Tick a box only after doing it, never in advance. A form is **Done** only when every box is ticked.
`NEXT-CHAT.md` has how a form is built; this file only tracks where each form stands.

**Checks, in order**
1. **Built**: folder in `apps/backend/src/forms/<id>/` + entry in `form-registry.js`.
2. **Every blank covered**: every underscore line, ☐ box, empty cell and signature spot on the blank PDF has a
   field, or is confirmed to be printed text (e.g. the fund's own bank details).
3. **Test fill**: every field and tick filled through the API, every page with fields rendered and looked at.
4. **UI test**: case made in the app (documents + Excel), review screen and final PDF checked.
5. **Sheet check**: every field's source matches its tab in `VCC & Gift City Form Details.xlsx`.
6. **User OK**: the user tested it and said it works. Only then start the next form.

Legend: ✅ done · ⏳ in progress · ⬜ not started · ❓ waiting on the user or 360 ONE

## VCC (files in `C:\zzz\demo\VCC`)

| Form | Form id | Built | Blanks | Test fill | UI test | Sheet | User OK |
|------|---------|:-----:|:------:|:---------:|:-------:|:-----:|:-------:|
| Global Bond Fund II – Subscription (Non-US) | `global-bond-fund-subscription` | ✅ | ⬜ | ✅ | ✅ | ⬜ | ⬜ |
| Global Bond Fund II – Top-up | `vcc-topup-global-bond-fund` | ✅ | ✅ | ✅ | ⬜ | ✅ | ⬜ |
| Global Investment Fund 2 – Subscription (Non-US) | `global-investment-fund-2-subscription` | ✅ | ✅ | ✅ | ✅ | ❓ | ❓ |
| Global Investment Fund 2 – Top-up | `vcc-topup-global-investment-fund-2` | ✅ | ✅ | ✅ | ⬜ | ✅ | ⬜ |
| International Opportunities Fund – Top-up | `vcc-topup-international-opportunities-fund` | ✅ | ✅ | ✅ | ⬜ | ✅ | ⬜ |
| VCC – Redemption | `vcc-redemption` | ✅ | ✅ | ✅ | ⬜ | ✅ | ⬜ |
| W-9 | `w9` | ✅ | ✅ | ✅ | ⬜ | ✅ | ⬜ |
| W-8BEN – Individual | `w8ben` | ✅ | ⬜ | ✅ | ✅ | ⬜ | ⬜ |
| Growth Strategy Fund – Subscription (Non-US) | – | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| International Opportunities Fund – Subscription (Non-US) | – | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Global Bond Fund II – Subscription (US), 125 pages | – | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| India Equity Fund – Subscription (US), 121 pages | – | ❓ | | | | | |
| W-8BEN-E (entities) | – | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| GIF 2 Joint Holder Declaration | – | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Growth Strategy Fund – Additional Declaration (joint) | – | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| IOF – Additional Declaration (joint) | – | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| GBF joint holder pages (zip) | – | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Investor Profiler (Excel output, not a PDF) | – | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Dynamic Equity Allocator Fund – Subscription and Top-up | – | ❓ | | | | | |
| Growth Strategy Fund – Top-up | – | ❓ | | | | | |

Notes:
- GBF subscription and W-8BEN were built for the demo from 360 ONE's filled samples. Their blanks were not
  scanned against the full checklist yet, and the GBF form must be compared with their new 63-page file (04.07.25).
- GIF 2 subscription: sources copied from the GBF form because the field sheet was not on disk. Check them
  against the sheet's GIF 2 tab when it is back.
- India Equity Fund (US): not in 360 ONE's form list. Ask whether it is in scope.
- Dynamic Equity Allocator Fund, Growth Strategy Fund top-up: no files received yet.

## GIFT City

| Form | Form id | Built | Blanks | Test fill | UI test | Sheet | User OK |
|------|---------|:-----:|:------:|:---------:|:-------:|:-----:|:-------:|
| (waiting for the user to add the GIFT City forms next to `VCC`) | | ❓ | | | | | |

## NFT (58 service-request types)

| Form | Form id | Built | Blanks | Test fill | UI test | Sheet | User OK |
|------|---------|:-----:|:------:|:---------:|:-------:|:-----:|:-------:|
| CAMS Mutual Fund – Nomination | `cams-nomination` | ✅ | ⬜ | ✅ | ✅ | ⬜ | ⬜ |
| Broking & Demat – Nomination | `crn-broking-demat` | ✅ | ⬜ | ✅ | ✅ | ⬜ | ⬜ |
| The other NFT forms (waiting for 360 ONE's forms and field lists) | | ❓ | | | | | |
