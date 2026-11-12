"""Builds closure-form blanks that cannot be copied as they are. The PIS cancellation letter is a scan stored with
/Rotate 270: the app writes in the page's own (unrotated) coordinates, so the pages are redrawn upright onto plain
portrait pages first. make_closure_forms.mjs then measures and fills this upright copy.
usage (from the repo root): python -I tools/form-building/make_closure_blanks.py"""
import pymupdf

UPRIGHT = [
    ("../Account Closure Forms/Individual/Bank/2.2Cancellation of PIS Permission letter (Applicable only for NR Acs).pdf",
     "data/Blank Forms/HDFC Bank PIS Permission Cancellation Letter.pdf"),
]
# The scan has no text, so "Drop a blank PDF" could not recognise it. An invisible text layer with the letter's own
# wording (like an OCR layer) is laid where those lines are printed: (page, x, baseline y, text).
HIDDEN_TEXT = {
    "data/Blank Forms/HDFC Bank PIS Permission Cancellation Letter.pdf": [
        (1, 75, 205, "Cancellation of my PIS permission no"),
        (1, 115, 230, "Closure of PIS Savings account no."),
        (1, 52, 262, "I /We wish to cancel, above PIS permission held with you, as I do not intend to purchase and sale the shares in secondary market."),
        (1, 52, 300, "I /We confirm that I will not transact in the secondary market unless I obtain the specific PIS permission"),
        (1, 52, 610, "Please cancel the Sweep in and Sweepout facility linked to this PIS account."),
        (2, 60, 70, "TO BE FILLED IN BY A BANK OFFICIAL"),
    ],
}

# Sample client data printed in a template (converted from Word by convert_word_blanks.ps1): blanked out of the copy.
REDACT = {
    "data/Blank Forms/Partnership Resolution - HDFC Bank Account Closure.pdf": ["JUVAS SOLUTIONS LLP"],
}

for blank_path, phrases in REDACT.items():
    document = pymupdf.open(blank_path)
    found = 0
    for page in document:
        for phrase in phrases:
            for rect in page.search_for(phrase):
                page.add_redact_annot(rect, fill=(1, 1, 1))
                found += 1
        page.apply_redactions()
    document.save(blank_path, incremental=True, encryption=pymupdf.PDF_ENCRYPT_KEEP)
    print(f"{blank_path}: {found} sample text spots blanked")

for source_path, blank_path in UPRIGHT:
    source = pymupdf.open(source_path)
    upright = pymupdf.open()
    for page in source:
        # page.rect is the visible (rotated) size; a pixmap is rendered the way the page is seen, so it is already upright.
        target = upright.new_page(width=page.rect.width, height=page.rect.height)
        target.insert_image(target.rect, pixmap=page.get_pixmap(dpi=200, colorspace=pymupdf.csGRAY))
    for page_number, x, y, words in HIDDEN_TEXT.get(blank_path, []):
        upright[page_number - 1].insert_text((x, y), words, fontsize=9, render_mode=3)  # render mode 3 = invisible
    upright.save(blank_path, garbage=3, deflate=True)
    print(f"{blank_path}: {upright.page_count} upright pages, rotation {[p.rotation for p in upright]}")
