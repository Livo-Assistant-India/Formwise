# NEXT-CHAT — read this first

Handoff for a new chat. It says what the project is, the rules, how a form is added, and what is next.
Update the **Progress** table and **Next up** at the end of every chat.

## The project

**Formwise** (this folder, `C:\zzz\demo\Fromwise`): fills a client's PDF forms from their KYC documents
(Aadhaar, PAN, passport; local OCR) plus an Excel row for everything a document can't give (amounts, bank, dates).
Single case or a batch (one Excel row per client, one folder of documents per client).

The client is **360 ONE** (wealth firm). The demo is over: we are now building every form they listed.
That is 400+ forms in three streams, so the work is split across chats:
- **Offshore VCC**: forms in `C:\zzz\demo\VCC` (not in git).
- **Offshore GIFT City**: the user will add these next to `VCC`.
- **NFT**: 58 service-request types. No forms or field lists received yet.

Field-by-field sources for VCC come from `VCC & Gift City Form Details.xlsx`, one sheet per form. Ask the user
for it if it isn't next to the VCC folder. Volumes are in `NFT Prefill Forms Volume.xlsx`.

Run it: `pnpm install`, then `pnpm demo` (backend on http://127.0.0.1:4500, frontend on http://127.0.0.1:3000).
For testing, run the backend alone with `node src/server.js` from `apps/backend`. Restart it after any change:
form files are read at start.

## Rules (from the user, never break)

- **Never guess. Verify before saying something works.** Fill a test case and look at the rendered page.
- Follow the client's sheet for every field's source.
  - If the sheet leaves a source empty, make the field `typed` (Excel) and list it under Open questions.
  - If the sheet says "check" or is unclear, do the same: decide nothing on your own.
- Privacy:
  - Aadhaar: last 4 digits only.
  - PAN: memory only, never written to disk.
  - Never commit client data. `data/` and `output/` are gitignored.
- Do not commit or push unless asked. Never add Co-Authored-By or any attribution.
- Files stay under 200 lines. Follow `NAMING-CONVENTIONS.md`.
- No cloud OCR or AI services.
- Don't delete anything outside the project.
- Write code with the Edit/Write tools, not long inline shell scripts.
- The user is not deep in tech and wants short, plain answers.
  - No long paragraphs in the UI.
  - Make things easier for their team, never harder.

## How a form is added (the pattern used for forms 1–5)

1. Copy the blank PDF into `data/Blank Forms/`.
   - If it has built-in fill boxes (IRS forms), first remove the widgets with PyMuPDF and save the copy.
     See how `Form W-9.pdf` was made: `page.delete_widget`, then use each widget's rect as the position.
2. Measure: `python -I tools/form-building/measure.py "<pdf>" 1,2,3 --draw`.
   - It prints every text line (x, top, baseline) and every drawn line or box. Top-left origin, points.
   - For underscore blanks and ☐ boxes, read the character positions (rawdict). `make_topups.py` shows how.
3. Make `apps/backend/src/forms/<form-id>/` with five files. Copy the closest existing form:
   - `form-configuration.js`: blank path, `signatureBoxes`, `tickboxes` (`options` + `boxesByOption`).
   - `field-positions.json`:
     - `x`, `y` = text baseline; `maxWidth`.
     - `type: "multiline"` with `maxY` for boxes that hold several lines.
     - `combs: [[x, width, boxCount], …]` for one-character-per-box fields (W-9 SSN).
   - `field-sources.json`: where each value comes from. The `_about` there explains `document.X|transform`,
     `typed`, `default.X`, `copy.X`, `today` and `tick`.
   - `form-rules.json`: label, detection phrases, review sections.
   - `required-fields.json`.
4. Register it in `apps/backend/src/forms/form-registry.js` (import, `FORM_IDS`, `FORM_DEFINITIONS`).
5. Test it:
   - Restart the backend.
   - `node tools/form-building/try_form.mjs <form-id> values.json out.pdf`. The values JSON maps field
     keys to test values, plus `client_reference`.
   - Render the result: `pdftoppm -r 80 -png out.pdf x`, or crop it with PyMuPDF.
   - Look at every filled spot.
   - Delete the test case afterwards with `DELETE /api/cases/<id>`.
6. Update the Progress table below.

Forms with the same layout (one per fund) can be generated from one script: `tools/form-building/make_topups.py`.

## Frontend notes (UI pass, 2026-11-04)

- Layout: left sidebar (`components/layouts/AppSidebar.tsx`). It folds by itself below 1280px; `[` toggles it.
  Its state lives on `<html data-sidebar>` and is set before first paint in `app/layout.tsx`. Use the `collapsed:`
  Tailwind variant for folded styles.
- Data: read lists through `api/queries.ts` (`useForms`, `useCases`, `useCase`, …). They share an in-memory cache
  (`api/query-cache.ts`), so pages don't refetch on every visit. Any POST/PUT/DELETE marks the cache stale.
- Connection: `api/connection-state.ts` + `ConnectionStatus` show a floating notice when the server is down and
  refetch on reconnect.
- Form groups (VCC / US tax / NFT) come from `group` in each `form-rules.json`; names and colours are in
  `config/form-groups.ts`.
- Keys: C new case, B new batch, F add form, / search, J/K or arrows move, Enter opens. Enter only acts on a row
  the user moved to.
- No layout shift: keep fixed heights on bars that change content (e.g. `FieldDetailBar`), and check new pages at
  1024px wide (= 150% zoom).

## Progress

| # | Form | Form id | Status |
|---|------|---------|--------|
| – | Global Bond Fund – Series II Subscription (Non-US) | `global-bond-fund-subscription` | Done (demo, from their filled sample) |
| – | W-8BEN (individual) | `w8ben` | Done (demo) |
| – | CAMS Nomination, CRN Broking & Demat Nomination | `cams-nomination`, `crn-broking-demat` | Done (demo, NFT) |
| 1 | VCC Common Redemption Form | `vcc-redemption` | Done, verified |
| 2 | W-9 (US) | `w9` | Done, verified |
| 3 | GBF Series II Additional Subscription (top-up) | `vcc-topup-global-bond-fund` | Done, verified |
| 4 | Global Investment Fund 2 Additional Subscription | `vcc-topup-global-investment-fund-2` | Done, verified |
| 5 | International Opportunities Fund Additional Subscription | `vcc-topup-international-opportunities-fund` | Done, verified |

**Still to do, VCC** (files in `C:\zzz\demo\VCC`):
- Subscription Agreement (Non-US):
  - Global Investment Fund 2 (63 pages)
  - Growth Strategy Fund (65 pages)
  - International Opportunities Fund (65 pages)
  - Check that the existing Global Bond Fund form matches their new 63-page file dated 04.07.25.
- Subscription Agreement (US):
  - Global Bond Fund (125 pages)
  - India Equity Fund (121 pages). Not in their form list: ask whether it's in scope.
- W-8BEN: compare their `W8BEN.pdf` with our blank. Their file may be a newer revision.
- W-8BEN-E (`W8BEN_Entity.pdf`, 8 pages, entities).
- Joint-holder pages:
  - GIF 2 Joint Holder Declaration; Growth Strategy and IOF "Additional Declaration" (14 pages each).
  - GBF `Joint holder additional pages.zip` (opt-in, PEP, Singapore tax, self-certification).
- Investor Profiler: their template is an Excel (`Copy of Investor Profile Template.xlsx`), not a PDF, so it
  needs an Excel output instead of PDF filling.
- No files received yet:
  - Dynamic Equity Allocator Fund (subscription and top-up)
  - Growth Strategy Fund top-up

**Then:** GIFT City forms (the user will add them), then NFT once 360 ONE sends forms and field lists.

## Next up

1. Subscription Agreement (Non-US) for Global Investment Fund 2. Compare it page by page with the GBF one
   (`forms/global-bond-fund-subscription`): the sheet's field pages are 16, 26, 27, 50, 59–62, but each fund's
   pages can shift.
2. Then Growth Strategy Fund and International Opportunities Fund the same way.

## Open questions for 360 ONE (don't decide these yourself)

- Redemption: "Name(s) in which the shares are registered" and its "Address" say **check** in the sheet. They
  are copied from the print name and mailing address for now.
- Redemption and top-ups: bank fields say "KYC – Bank Document". The app doesn't read bank documents yet, so
  they come from the Excel.
- W-9:
  - The sheet has no source for address, city/state/ZIP or SSN, so they are typed for now.
  - The tax classification boxes (line 3a) aren't in the sheet, so they're left empty.
  - The SSN is stored like other typed values (on disk). Ask whether it must be memory-only like PAN.
- Top-ups, page 4: "From the Account of <Subscriber Name>" is written on the line under that instruction.
  Confirm the placement.
- From the data-request PDF:
  - GIFT City field sheets are missing.
  - It's unclear whether the Dubai CIF form is in scope.
  - There are two Investor Profile versions.
