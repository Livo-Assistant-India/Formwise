"""Builds the WhiteOak GIFT application blank: the editable PDF with its 466 fill-in widgets removed (the app writes on
the page itself), and records every widget of the application pages (5-9, 17-18) in gift-whiteoak-widgets.json:
page, field name, type, rect (PDF points, top-left origin) and the on-state of check boxes / radio buttons. The form's
spots are then set in make_gift_whiteoak_application.mjs from these rects.
usage (from the repo root): python -I tools/form-building/make_gift_whiteoak_blank.py"""
import json, os
import pymupdf

SOURCE = "../GIFT/White Oak Emerging Markets ex India (GIFT Fund)/Editable ASHOKA WHITEOAK GLOBAL EMERGING MARKETS EX INDIA GIFT FUND 01052026.pdf"
BLANK = "data/Blank Forms/WhiteOak Global EM ex India GIFT Fund - Application Form.pdf"
HERE = os.path.dirname(os.path.abspath(__file__))
APPLICATION_PAGES = {5, 6, 7, 8, 9, 17, 18}

doc = pymupdf.open(SOURCE)
widgets = []
for page in doc:
    for widget in list(page.widgets()):
        if page.number + 1 in APPLICATION_PAGES:
            rect = widget.rect
            on_state = widget.on_state() if widget.field_type in (pymupdf.PDF_WIDGET_TYPE_CHECKBOX, pymupdf.PDF_WIDGET_TYPE_RADIOBUTTON) else None
            widgets.append({"page": page.number + 1, "name": widget.field_name, "type": widget.field_type_string, "on": on_state,
                            "rect": [round(rect.x0, 1), round(rect.y0, 1), round(rect.x1, 1), round(rect.y1, 1)]})
        page.delete_widget(widget)
doc.save(BLANK, garbage=3, deflate=True)
with open(os.path.join(HERE, "gift-whiteoak-widgets.json"), "w", encoding="utf-8") as file:
    json.dump(widgets, file, indent=1)
print(f"blank written ({doc.page_count} pages), {len(widgets)} application widgets recorded")
