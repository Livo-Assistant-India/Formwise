"""Builds the 360 ONE New Perspective Fund blank. 360 ONE sent this form only as a filled sample (a staff member's own
details typed in with a PDF editor). The editor stored everything it added as one overlay Form XObject per page: a
wrapper the page draws once, holding only the typed values (text in plain Arial) and the tick marks (short black
strokes). Those overlays are emptied; the form's own content is never touched. Nothing typed is read or kept.
An XObject counts as an overlay only if every leaf inside it is Arial text or a short stroke - anything else is left.
The sample lives outside the project (C:\\zzz\\demo\\GIFT Fund); only the cleaned blank goes to data\\Blank Forms.
usage (from the repo root): python -I tools/form-building/make_gift_npf_blank.py"""
import re
import pymupdf

SOURCE = "../GIFT Fund/Application Form & Documentation Set_360 ONE New Perspective Fund.pdf"
BLANK = "data/Blank Forms/360 ONE New Perspective Fund - Application Form.pdf"


def font_base_names(document, xref):
    """Font resource name -> base font name, from this XObject's own Resources."""
    names = {}
    fonts = document.xref_get_key(xref, "Resources/Font")
    if fonts[0] == "dict":
        for name, ref in re.findall(r"/(\w+)\s+(\d+) 0 R", fonts[1]):
            # Drop the subset prefix ("UEDXBA+Arial" -> "Arial").
            names[name] = document.xref_get_key(int(ref), "BaseFont")[1].lstrip("/").split("+")[-1]
    return names


def children(document, xref):
    """XObject xrefs drawn by this XObject."""
    xobjects = document.xref_get_key(xref, "Resources/XObject")
    return [int(ref) for _, ref in re.findall(r"/(\w+)\s+(\d+) 0 R", xobjects[1])] if xobjects[0] == "dict" else []


def is_overlay(document, xref, depth=0, inherited=None):
    """True when everything this XObject draws is typed Arial text or a short tick stroke. Fonts missing from an
    XObject's own Resources are looked up in its parents'."""
    if depth > 6:
        return False
    stream = document.xref_stream(xref).decode("latin-1")
    kids = children(document, xref)
    bases = {**(inherited or {}), **font_base_names(document, xref)}
    has_text = "Tj" in stream or "TJ" in stream
    if has_text:
        used = set(re.findall(r"/(\w+)\s+[\d.]+\s+Tf", stream))
        if not used or any(not bases.get(name, "").startswith("Arial") or bases.get(name, "").startswith("ArialMT") for name in used):
            return False
    elif not kids:
        # A drawing leaf: must be a short stroked mark (a tick), not a box, line or image.
        if len(stream) > 160 or " re" in stream or "Do" in stream or not re.search(r"\bS\b", stream):
            return False
    return all(is_overlay(document, kid, depth + 1, bases) for kid in kids) and (has_text or kids or len(stream) <= 160)


def page_fonts(page):
    """The page's own font resources (name -> base font), inherited by the XObjects it draws."""
    return {font[4]: font[3].split("+")[-1] for font in page.get_fonts(full=True)}


document = pymupdf.open(SOURCE)
emptied = []
for page in document:
    for xref, name, invoker, bbox in page.get_xobjects():
        if invoker == 0 and children(document, xref) and is_overlay(document, xref, inherited=page_fonts(page)):
            document.update_stream(xref, b"")
            emptied.append((page.number + 1, name))
document.save(BLANK, garbage=3, deflate=True)
print(f"{BLANK}: emptied {len(emptied)} typed-value overlays on pages {sorted({page for page, _ in emptied})}")
