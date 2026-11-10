# NEXT-CHAT — read this first

Handoff for a new chat. It says what the project is, the rules, how a form is added, and what is next.
Update the **Progress** table and **Next up** at the end of every chat, and tick the boxes in
`FORMS-CHECKLIST.md` (one row per form, six checks each).

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
  - PAN / passport / licence numbers: shown and filled in full (it's 360 ONE's internal tool and reviewers must
    check them). Kept on this machine in `data/identity-numbers.json` (gitignored), never sent to the Google Sheet,
    cleared when a case is saved or deleted. Changed by the user on 2026-11-04.
  - Never commit client data. `data/` and `output/` are gitignored.
- Do not commit or push unless asked. Never add Co-Authored-By or any attribution.
- Code files: aim for 400 lines, never over 600. JSON mapping files have no limit. Follow `NAMING-CONVENTIONS.md`.
- No cloud OCR or AI services.
- Don't delete anything outside the project.
- Write code with the Edit/Write tools, not long inline shell scripts.
- The user is not deep in tech and wants short, plain answers.
  - No long paragraphs in the UI.
  - Make things easier for their team, never harder.

## How a form is added

Every form is **data only**: a folder `apps/backend/src/forms/<stream>/<form-id>/` with five JSON files. The app finds
it by itself (no registry edit, no code). Streams: `vcc`, `us-tax`, `nft`, `gift-city`, `added` (made on the
"Add a form" screen). Form ids must be unique across all streams.

| File | What it holds |
|------|---------------|
| `form-configuration.json` | `blankFileName`, `signatureBoxes`, `tickboxes` (`options` + `boxesByOption`), `tickboxRule` (`usual` for almost every form) |
| `field-positions.json` | `x`, `y` = text baseline, top-left origin, PDF points; `maxWidth`; `type: "multiline"` + `maxY`; `combs` for one-character boxes; `alsoAt` to print the same value elsewhere |
| `field-sources.json` | where each value comes from (`document.X`, `typed`, `default.X`, `copy.X`, `today`, `tick`) |
| `form-rules.json` | `group`, `label`, `shortLabel`, `purpose`, detection phrases, review sections |
| `required-fields.json` | fields that must be filled before saving |

Steps:
1. Copy the blank PDF into `data/Blank Forms/`. If it has built-in fill boxes (IRS forms), remove the widgets with
   PyMuPDF first and use each widget's rect as the position (see how `Form W-9.pdf` was made).
2. Measure: `python -I tools/form-building/measure.py "<pdf>" 1,2,3 --draw` (every text line and drawn box).
   For scanned pages, or boxes drawn as loose lines, use `python -I tools/form-building/scan_boxes.py "<pdf>" 4,5 235`
   (finds combs and tick boxes from the pixels; 235 = threshold for light grey borders).
3. Make the folder. For a family of near-identical forms, write or extend a generator instead of hand-copying:
   - `tools/form-building/make_topups.py`: VCC top-ups.
   - `tools/form-building/make_vcc_subscriptions.mjs`: every VCC subscription (GBF, GIF 2, GSF, IOF) from the template
     in `tools/form-building/vcc-subscription-base/`, with a page map (pages matched by text) and re-measured positions
     where a page moved. A new fund = one more FUNDS block.
   Change the generator, not its output: re-running it overwrites the folder.
4. `pnpm check-forms`: every form must say `ok` (blank exists, every spot inside a real page, every field has a
   source, required fields and review sections point at real fields).
5. Test it: restart the backend, `node tools/form-building/try_form.mjs <form-id> values.json out.pdf`, render
   every page with fields and look; then make a case in the app (documents + Excel) and check Review + the PDF.
   Delete test cases afterwards.
6. `pnpm check-forms --compare` must show only the changes you meant; then `pnpm check-forms --snapshot` to
   record the new golden files (`apps/backend/src/tasks/form-snapshots/`, committed).
7. Tick the boxes in `FORMS-CHECKLIST.md`, then stop and let the user test.

An **Excel form** (Investor Profiler) sets `"outputType": "xlsx"` in form-configuration.json; its field-positions give
`sheet` + `cell` instead of x/y, and the filled file is a copy of the template (`services/fill/fill-xlsx-service.js`).
Review and Form setup list its cells instead of page images. It is skipped by "Drop a blank PDF".

Only a truly special form needs code: a new `tickboxRule` in `forms/form-registry.js` (today only the two NFT
nomination forms have one).

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

## Joint holders, recognition (04 Nov)

- A form for someone other than the investor sets `"personRole": "joint_holder"` in form-rules.json and its keys get a
  `joint_holder_` prefix (tools/form-building/joint-holder-keys.mjs, called by every joint generator). Batches share
  documents per person; a joint holder's documents go in the client folder's "Joint holder" subfolder.
- Rules, labels and Excel examples ignore the prefix via `toPlainFieldKey` (packages/shared/src/field-validation.js).
- "Drop a blank PDF" compares against every form's own blank (rare words weigh most); check-forms fails if a blank is
  not recognised as its own form. No detection phrases to maintain.
- A form whose sources use no `document.*` is Excel-only: the documents screen lets it go on once the Excel is in.

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
| 6 | Global Investment Fund 2 Subscription Agreement (Non-US), 63 pages | `global-investment-fund-2-subscription` | Built, test-filled, UI-tested; waiting for the user's test |
| 7 | Growth Strategy Fund Subscription Agreement (Non-US), 65 pages | `growth-strategy-fund-subscription` | Built, test-filled, UI-tested; waiting for the user's test |

**Still to do, VCC** (files in `C:\zzz\demo\VCC`):
- Subscription Agreement (Non-US):
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

Work one form at a time: build it fully, then STOP so the user can test it. Only move on once they say it works.

1. International Opportunities Fund subscription, the same way as GIF 2 and Growth Strategy (add a block to FUNDS):
   `tools/form-building/make_vcc_subscriptions.mjs` makes a form from the GBF one with a page map (pages matched by
   text) plus positions re-measured where a page's layout moved. Copy it per fund.

## Open questions for 360 ONE (don't decide these yourself)

- Product requirement (Tushar, 23 Oct), not a form: store investor-level data once captured and reuse it for later
  forms of the same investor. Not built yet.
- See FORMS-CHECKLIST.md notes for the per-form open questions (joint-holder keys, 5.3 table, detection, W-8BEN-E).

- CRN demat: "NRN No." is now an optional typed field; ask 360 ONE where it should come from.
- GIF 2 and Growth Strategy subscriptions: built from the GBF form's sources, because `VCC & Gift City Form Details.xlsx` was not
  on disk. Check every source against the sheet's GIF 2 tab when the user shares it again. Page 50 (Opt-In
  Confirmation, different from GBF's page 54) fills Client Name and Name from the subscriber name, and Date = today.

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
