"""Writes the three VCC Additional Subscription (top-up) form folders. Positions measured from each blank
(underscore runs and tick-box glyphs/squares); the three share one layout apart from page 1's series block, the
page-1 date line and the page-4 note."""
import json, shutil, os
ROOT = "C:/zzz/demo/Fromwise/apps/backend/src/forms/vcc/"
BLANKS = "C:/zzz/demo/Fromwise/data/Blank Forms/"
VCC = "C:/zzz/demo/VCC/"

FORMS = [
    dict(id="vcc-topup-global-bond-fund", const="VCC_TOPUP_GLOBAL_BOND_FUND", fund="360 ONE Global Bond Fund - Series II",
         short="GBF top-up", label="Global Bond Fund II – Top-up", source="360 ONE Global Bond Fund Series - II/360 ONE Global Bond Fund - Series II - Additional Subscription Agreement - 04.07.25.pdf",
         dateY=681.2, noteY=578.2, series="ticks",
         seriesBoxes={"Series A (ISIN SGXZ51510022)": (499.7, 373.9), "Series B (ISIN SGXZ73357493)": (499.5, 401.7)}, box=(7.0, 11.3)),
    dict(id="vcc-topup-global-investment-fund-2", const="VCC_TOPUP_GLOBAL_INVESTMENT_FUND_2", fund="360 ONE Global Investment Fund 2",
         short="GIF 2 top-up", label="Global Investment Fund 2 – Top-up", source="360 ONE Global Investment Fund 2/360 ONE Global Investment Fund 2 - Additional Subscription Agreement (Non-US) - 06.10.25.pdf",
         dateY=681.2, noteY=578.2, series="ticks",
         seriesBoxes={f"Series {s}": (297.0, y) for s, y in zip("ABCDE", (375.4, 400.4, 427.7, 455.1, 482.5))}, box=(9.0, 9.96)),
    dict(id="vcc-topup-international-opportunities-fund", const="VCC_TOPUP_INTERNATIONAL_OPPORTUNITIES_FUND", fund="360 ONE International Opportunities Fund",
         short="IOF top-up", label="International Opportunities Fund – Top-up", source="360 ONE International Opportunities Fund/360 ONE International Opportunities Fund - Additional Subscription Agreement.pdf",
         dateY=667.8, noteY=539.7, series="typed"),
]

def text(key, page, x, y, width, size=10):
    return dict(key=key, nominee=None, page=page, x=x, y=y, fontSize=size, type="text", maxWidth=width)

for form in FORMS:
    folder = ROOT + form["id"]
    os.makedirs(folder, exist_ok=True)
    blank = f"{form['fund']} - Additional Subscription.pdf"
    shutil.copyfile(VCC + form["source"], BLANKS + blank)

    fields = [
        text("initial_sales_charge", 1, 386, 237.5, 20, 9),
        text("form_date", 1, 113, form["dateY"] - 2, 74),
        text("subscriber_name", 2, 183, 537, 330),
        text("topup_amount_usd", 2, 266, 590.5, 248),
        text("application_date", 2, 300, 644.5, 216),
        text("funds_wired_date", 2, 172, 685, 100),
        text("contact_person", 3, 219, 80.5, 216),
        text("contact_email", 3, 214, 107.5, 222),
        text("subscriber_name_p3", 3, 178, 240, 168),
        text("subscriber_name_p4", 4, 88, form["noteY"] + 15, 430),
    ]
    sources = {
        "initial_sales_charge": "typed", "form_date": "today", "subscriber_name": "document.name|upper",
        "topup_amount_usd": "typed", "application_date": "typed", "funds_wired_date": "typed",
        "contact_person": "typed", "contact_email": "typed",
        "subscriber_name_p3": "copy.subscriber_name", "subscriber_name_p4": "copy.subscriber_name",
    }
    page1 = ["initial_sales_charge", "series", "form_date"]
    tickboxes = []
    if form["series"] == "ticks":
        sources["series"] = "tick"
        w, h = form["box"]
        tickboxes.append(dict(key="series", page=1, w=w, h=h, options=list(form["seriesBoxes"]),
                              boxesByOption={o: [dict(x=x, y=y)] for o, (x, y) in form["seriesBoxes"].items()}))
    else:
        sources["series"] = "typed"
        sources["isin"] = "typed"
        fields += [text("series", 1, 378, 385.5, 68, 9), text("isin", 1, 320, 415.5, 126, 9)]
        page1 = ["initial_sales_charge", "series", "isin", "form_date"]

    json.dump({"_about": f"Where each value is written on the blank {form['fund']} Additional Subscription Form (top-left origin, y = baseline), measured from its underscore lines.",
               "formId": form["id"], "title": f"{form['fund']} - Additional Subscription", "fields": fields},
              open(folder + "/field-positions.json", "w", encoding="utf-8"), indent=2)
    json.dump({"_about": "Sources follow the 'Top Up Form' sheet of VCC & Gift City Form Details.xlsx: subscriber name from KYC (passport) / original subscription; everything the RM provides is typed (Excel); the date is today. subscriber_name_p4 = the payment-instruction line 'From the Account of <Subscriber Name>', written under it.",
               "fieldSources": sources}, open(folder + "/field-sources.json", "w", encoding="utf-8"), indent=2)
    json.dump({"_about": "Fields that must be filled before a case can be confirmed.",
               "requiredFields": ["subscriber_name", "series", "topup_amount_usd", "application_date"]},
              open(folder + "/required-fields.json", "w", encoding="utf-8"), indent=2)
    json.dump({
        "_about": "Form-level rules. One person (the subscriber) - KYC gives the name, the Excel the top-up details.",
        "formId": form["id"], "group": "VCC", "label": form["label"], "shortLabel": form["short"],
        "purpose": "Add money to an existing investment",
        "blankFileName": blank, "keyFields": ["Subscriber name", "Top-up amount", "Series"], "sheetTabName": form["short"],
        "detectionPhrases": ["Additional Subscription Form for Sub-Fund", form["fund"].replace("360 ONE ", "")],
        "supportedNomineeCount": 1, "personLabel": "Subscriber",
        "identityType": {"scope": "shared", "tickboxField": None, "numberField": None, "optionByIdentityKind": {}, "numberFieldByIdentityKind": {}},
        "reviewSections": [
            {"key": "p1", "label": "Page 1 · Investment", "fields": page1},
            {"key": "p2", "label": "Page 2 · Subscription details", "fields": ["subscriber_name", "topup_amount_usd", "application_date", "funds_wired_date"]},
            {"key": "p3", "label": "Page 3 · Contact and signatory", "fields": ["contact_person", "contact_email", "subscriber_name_p3"]},
            {"key": "p4", "label": "Page 4 · Payment instructions", "fields": ["subscriber_name_p4"]},
        ],
    }, open(folder + "/form-rules.json", "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    json.dump({
        "_about": f"{form['fund']} - Additional Subscription (top-up) form, 4 pages. Written by make_topups.py: positions are measured from the blank's underscore lines and series tick boxes.",
        "id": form["id"], "title": f"{form['fund']} - Additional Subscription", "labels": [],
        # Page 1 "Investor Signature" line and page 3 "For individuals" signature line.
        "signatureBoxes": [
            {"page": 1, "x": 384, "y": 289, "w": 178, "h": 16, "signer": "subscriber", "label": "Investor signature"},
            {"page": 3, "x": 175, "y": 196, "w": 175, "h": 19, "signer": "subscriber", "label": "Subscriber signature"},
        ],
        "tickboxes": tickboxes, "blankFileName": blank, "nomineeHeaderRe": None, "tickboxRule": "usual",
    }, open(folder + "/form-configuration.json", "w", encoding="utf-8"), indent=2)
    print("wrote", form["id"])
