"""Builds the W-8BEN-E blank (widgets removed) and the five JSON files from the IRS form's own widgets."""
import json, os
import pymupdf as fitz

SOURCE = "C:/zzz/demo/VCC/W8BEN_Entity.pdf"
ROOT = "C:/zzz/demo/Fromwise"
BLANK = ROOT + "/data/Blank Forms/Form W-8BEN-E.pdf"
FOLDER = ROOT + "/apps/backend/src/forms/us-tax/w8ben-e"
HERE = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(os.path.join(HERE, "w8ben-e-widgets.json")))

def r(i): return W[i]["rect"]
def pg(i): return W[i]["page"]

# ---- text fields: (key, widget index, source, section) ----
TEXT = [
    ("entity_name", 0, "typed", "part1"),
    ("country_of_incorporation", 1, "typed", "part1"),
    ("disregarded_entity_name", 2, "typed", "part1"),
    ("permanent_address", 50, "typed", "part1"),
    ("permanent_city_state_postal_code", 51, "typed", "part1"),
    ("permanent_country", 52, "typed", "part1"),
    ("mailing_address", 53, "typed", "part1"),
    ("mailing_city_state_postal_code", 54, "typed", "part1"),
    ("mailing_country", 55, "typed", "part1"),
    ("us_tin", 56, "typed", "part1"),
    ("giin", 57, "typed", "part1"),
    ("foreign_tin", 58, "typed", "part1"),
    ("reference_numbers", 60, "typed", "part1"),
    ("disregarded_entity_address", 66, "typed", "part2"),
    ("disregarded_entity_city_state_postal_code", 67, "typed", "part2"),
    ("disregarded_entity_country", 68, "typed", "part2"),
    ("disregarded_entity_giin", 69, "typed", "part2"),
    ("treaty_country", 71, "typed", "part3"),
    ("limitation_on_benefits_other_article", 84, "typed", "part3"),
    ("special_rates_article", 86, "typed", "part3"),
    ("special_rates_withholding_rate", 87, "typed", "part3"),
    ("special_rates_income_type", 88, "typed", "part3"),
    ("special_rates_conditions_line_1", 89, "typed", "part3"),
    ("special_rates_conditions_line_2", 90, "typed", "part3"),
    ("special_rates_conditions_line_3", 91, "typed", "part3"),
    ("sponsored_ffi_sponsoring_entity_name", 92, "typed", "part4"),
    ("closely_held_vehicle_sponsoring_entity_name", 97, "typed", "part7"),
    ("iga_partner_jurisdiction", 109, "typed", "part12"),
    ("iga_treated_as", 112, "typed", "part12"),
    ("trustee_or_sponsor_name", 113, "typed", "part12"),
    ("startup_formation_date", 129, "typed", "part19"),
    ("liquidation_or_bankruptcy_filing_date", 131, "typed", "part20"),
    ("determination_letter_date", 133, "typed", "part21"),
    ("securities_exchange_name", 136, "typed", "part23"),
    ("publicly_traded_affiliate_name", 138, "typed", "part23"),
    ("affiliate_securities_market_name", 139, "typed", "part23"),
    ("direct_reporting_sponsoring_entity_name", 146, "typed", "part28"),
]
for row in range(9):
    base = 148 + row * 3
    for col, name in enumerate(["name", "address", "tin"]):
        TEXT.append((f"substantial_us_owner_{row + 1}_{name}", base + col, "typed", "part29"))
TEXT += [
    ("signer_name", 177, "typed", "part30"),
    ("form_date", 178, "today|monthFirst", "part30"),
]

# ---- tick boxes: (key, [(option, widget index)], section, required) ----
TICK = [
    ("chapter_3_status", [("Corporation", 3), ("Partnership", 4), ("Simple trust", 5), ("Tax-exempt organization", 6),
        ("Complex trust", 7), ("Foreign Government - Controlled Entity", 8), ("Central Bank of Issue", 9),
        ("Private foundation", 10), ("Estate", 11), ("Foreign Government - Integral Part", 12), ("Grantor trust", 13),
        ("Disregarded entity", 14), ("International organization", 15)], "part1", True),
    ("hybrid_making_treaty_claim", [("Yes", 16), ("No", 17)], "part1", False),
    ("chapter_4_status", [
        ("Nonparticipating FFI", 18), ("Participating FFI", 19), ("Reporting Model 1 FFI", 20),
        ("Reporting Model 2 FFI", 21), ("Registered deemed-compliant FFI", 22), ("Sponsored FFI", 23),
        ("Certified deemed-compliant nonregistering local bank", 24),
        ("Certified deemed-compliant FFI with only low-value accounts", 25),
        ("Certified deemed-compliant sponsored, closely held investment vehicle", 26),
        ("Certified deemed-compliant limited life debt investment entity", 27),
        ("Certain investment entities that do not maintain financial accounts", 28),
        ("Owner-documented FFI", 29), ("Restricted distributor", 30), ("Nonreporting IGA FFI", 31),
        ("Foreign government, government of a U.S. possession, or foreign central bank of issue", 32),
        ("International organization", 33), ("Exempt retirement plans", 34),
        ("Entity wholly owned by exempt beneficial owners", 35), ("Territory financial institution", 36),
        ("Excepted nonfinancial group entity", 37), ("Excepted nonfinancial start-up company", 38),
        ("Excepted nonfinancial entity in liquidation or bankruptcy", 39), ("501(c) organization", 40),
        ("Nonprofit organization", 41), ("Publicly traded NFFE or NFFE affiliate of a publicly traded corporation", 42),
        ("Excepted territory NFFE", 43), ("Active NFFE", 44), ("Passive NFFE", 45),
        ("Excepted inter-affiliate FFI", 46), ("Direct reporting NFFE", 47),
        ("Sponsored direct reporting NFFE", 48), ("Account that is not a financial account", 49)], "part1", True),
    ("foreign_tin_not_legally_required", [("Yes", 59)], "part1", False),
    ("disregarded_entity_chapter_4_status", [("Branch treated as nonparticipating FFI", 61), ("Participating FFI", 62),
        ("Reporting Model 1 FFI", 63), ("Reporting Model 2 FFI", 64), ("U.S. Branch", 65)], "part2", False),
    ("treaty_resident_certified", [("Yes", 70)], "part3", False),
    ("treaty_limitation_on_benefits_certified", [("Yes", 72)], "part3", False),
    ("limitation_on_benefits_type", [("Government", 73), ("Tax-exempt pension trust or pension fund", 74),
        ("Other tax-exempt organization", 75), ("Publicly traded corporation", 76),
        ("Subsidiary of a publicly traded corporation", 77), ("Company that meets the ownership and base erosion test", 78),
        ("Company that meets the derivative benefits test", 79),
        ("Company with an item of income that meets active trade or business test", 80),
        ("Favorable discretionary determination by the U.S. competent authority received", 81),
        ("No LOB article in treaty", 82), ("Other", 83)], "part3", False),
    ("treaty_qualified_resident_status_certified", [("Yes", 85)], "part3", False),
    ("sponsored_ffi_certification", [("Investment entity (box 1)", 93), ("Controlled foreign corporation (box 2)", 94)], "part4", False),
    ("nonregistering_local_bank_certified", [("Yes", 95)], "part5", False),
    ("low_value_accounts_ffi_certified", [("Yes", 96)], "part6", False),
    ("closely_held_vehicle_certified", [("Yes", 98)], "part7", False),
    ("limited_life_debt_entity_certified", [("Yes", 99)], "part8", False),
    ("no_financial_accounts_entity_certified", [("Yes", 100)], "part9", False),
    ("owner_documented_ffi_certified", [("Yes", 101)], "part10", False),
    ("owner_documented_ffi_documents", [("Owner reporting statement (24b)", 102), ("Auditor's letter (24c)", 103)], "part10", False),
    ("owner_documented_trust_certified", [("Yes", 104)], "part10", False),
    ("restricted_distributor_certified", [("Yes", 105)], "part11", False),
    ("restricted_distributor_agreement", [("Has been and is bound by agreement (25b)", 106),
        ("Is currently bound by agreement (25c)", 107)], "part11", False),
    ("nonreporting_iga_ffi_certified", [("Yes", 108)], "part12", False),
    ("iga_model", [("Model 1 IGA", 110), ("Model 2 IGA", 111)], "part12", False),
    ("trustee_location", [("U.S.", 114), ("Foreign", 115)], "part12", False),
    ("foreign_government_certified", [("Yes", 116)], "part13", False),
    ("international_organization_certification", [("Section 7701(a)(18) organization (28a)", 117),
        ("Comprised of foreign governments (28b)", 118)], "part14", False),
    ("exempt_retirement_plan_certification", [("Treaty-qualified retirement fund (29a)", 119),
        ("Broad participation retirement fund (29b)", 120), ("Narrow participation retirement fund (29c)", 121),
        ("Fund formed under a section 401(a)-type plan (29d)", 122),
        ("Investment entity for retirement funds (29e)", 123),
        ("Fund set up by an exempt beneficial owner (29f)", 124)], "part15", False),
    ("wholly_owned_by_exempt_owners_certified", [("Yes", 125)], "part16", False),
    ("territory_financial_institution_certified", [("Yes", 126)], "part17", False),
    ("nonfinancial_group_entity_certified", [("Yes", 127)], "part18", False),
    ("nonfinancial_startup_certified", [("Yes", 128)], "part19", False),
    ("liquidation_or_bankruptcy_certified", [("Yes", 130)], "part20", False),
    ("organization_501c_certified", [("Yes", 132)], "part21", False),
    ("nonprofit_organization_certified", [("Yes", 134)], "part22", False),
    ("publicly_traded_nffe_certification", [("Publicly traded corporation (37a)", 135),
        ("Affiliate of a publicly traded corporation (37b)", 137)], "part23", False),
    ("excepted_territory_nffe_certified", [("Yes", 140)], "part24", False),
    ("active_nffe_certified", [("Yes", 141)], "part25", False),
    ("passive_nffe_certified", [("Yes", 142)], "part26", False),
    ("passive_nffe_us_owners", [("No substantial U.S. owners (40b)", 143),
        ("Substantial U.S. owners listed in Part XXIX (40c)", 144)], "part26", False),
    ("inter_affiliate_ffi_certified", [("Yes", 145)], "part27", False),
    ("sponsored_direct_reporting_nffe_certified", [("Yes", 147)], "part28", False),
]

SECTIONS = [
    ("part1", "Part I · Identification of beneficial owner"),
    ("part2", "Part II · Disregarded entity or branch receiving payment"),
    ("part3", "Part III · Claim of tax treaty benefits"),
    ("part4", "Part IV · Sponsored FFI"),
    ("part5", "Part V · Certified deemed-compliant nonregistering local bank"),
    ("part6", "Part VI · Certified deemed-compliant FFI with only low-value accounts"),
    ("part7", "Part VII · Certified deemed-compliant sponsored, closely held investment vehicle"),
    ("part8", "Part VIII · Certified deemed-compliant limited life debt investment entity"),
    ("part9", "Part IX · Investment entities that do not maintain financial accounts"),
    ("part10", "Part X · Owner-documented FFI"),
    ("part11", "Part XI · Restricted distributor"),
    ("part12", "Part XII · Nonreporting IGA FFI"),
    ("part13", "Part XIII · Foreign government or central bank of issue"),
    ("part14", "Part XIV · International organization"),
    ("part15", "Part XV · Exempt retirement plans"),
    ("part16", "Part XVI · Entity wholly owned by exempt beneficial owners"),
    ("part17", "Part XVII · Territory financial institution"),
    ("part18", "Part XVIII · Excepted nonfinancial group entity"),
    ("part19", "Part XIX · Excepted nonfinancial start-up company"),
    ("part20", "Part XX · Excepted nonfinancial entity in liquidation or bankruptcy"),
    ("part21", "Part XXI · 501(c) organization"),
    ("part22", "Part XXII · Nonprofit organization"),
    ("part23", "Part XXIII · Publicly traded NFFE or affiliate"),
    ("part24", "Part XXIV · Excepted territory NFFE"),
    ("part25", "Part XXV · Active NFFE"),
    ("part26", "Part XXVI · Passive NFFE"),
    ("part27", "Part XXVII · Excepted inter-affiliate FFI"),
    ("part28", "Part XXVIII · Sponsored direct reporting NFFE"),
    ("part29", "Part XXIX · Substantial U.S. owners of passive NFFE"),
    ("part30", "Part XXX · Certification"),
]

TALL_CELL = 20  # Part XXIX cells are 24 pt high: centre the text instead of sitting on the bottom line


def position(key, i):
    x0, y0, x1, y1 = r(i)
    baseline = y1 - 2 if (y1 - y0) < TALL_CELL else round(y0 + (y1 - y0) / 2 + 3, 1)
    return {"key": key, "nominee": None, "page": pg(i), "x": round(x0 + 2, 1), "y": round(baseline, 1),
            "fontSize": 9, "type": "text", "maxWidth": round(x1 - x0 - 4, 1)}


def write(name, data):
    with open(os.path.join(FOLDER, name), "w", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def main():
    doc = fitz.open(SOURCE)
    for page in doc:
        for widget in list(page.widgets()):
            page.delete_widget(widget)
    os.makedirs(os.path.dirname(BLANK), exist_ok=True)
    doc.save(BLANK, garbage=3, deflate=True)
    os.makedirs(FOLDER, exist_ok=True)

    fields = [position(k, i) for k, i, _, _ in TEXT]
    write("field-positions.json", {
        "_about": "Where each text field is written on the blank IRS Form W-8BEN-E (Rev. October 2021): positions from the form's own fill-in boxes (removed from the blank).",
        "formId": "w8ben-e", "title": "Form W-8BEN-E", "fields": fields})

    tickboxes = [{"key": "certify_capacity", "page": pg(175), "w": 8, "h": 8, "x": r(175)[0], "y": r(175)[3], "isAlwaysTicked": True}]
    for key, options, _, required in TICK:
        first = options[0][1]
        box = {"key": key, "page": pg(first), "w": 8, "h": 8}
        if not required:
            box["isOptional"] = True
        box["options"] = [o for o, _ in options]
        box["boxesByOption"] = {}
        for o, i in options:
            spot = {"x": r(i)[0], "y": r(i)[3]}
            if pg(i) != pg(first):
                spot["page"] = pg(i)
            box["boxesByOption"][o] = [spot]
        tickboxes.append(box)
    sx0, sy0, sx1, sy1 = r(176)
    write("form-configuration.json", {
        "_about": "IRS Form W-8BEN-E (Rev. October 2021), for non-US entities. The blank is the IRS form with its fill-in boxes removed; positions come from those boxes. Only Part I and the certification are always needed; every other Part is ticked only if it applies to the entity.",
        "id": "w8ben-e", "title": "Form W-8BEN-E", "labels": [],
        "signatureBoxes": [{"page": pg(176), "x": sx0, "y": sy0, "w": round(sx1 - sx0, 1), "h": round(sy1 - sy0, 1),
                            "signer": "entity", "label": "Signature of individual authorized to sign for the entity"}],
        "tickboxes": tickboxes, "blankFileName": "Form W-8BEN-E.pdf", "nomineeHeaderRe": None, "tickboxRule": "usual"})

    sources = {k: s for k, _, s, _ in TEXT}
    sources["certify_capacity"] = "tick"
    for key, *_ in TICK:
        sources[key] = "tick"
    write("field-sources.json", {
        "_about": "Same conventions as the other forms' field-sources.json. Everything about the entity comes from the Excel (typed); tick boxes from the Excel or review screen. US dates are month first (|monthFirst).",
        "fieldSources": sources})

    by_section = {s: [] for s, _ in SECTIONS}
    for k, _, _, s in TEXT:
        by_section[s].append(k)
    for k, _, s, _ in TICK:
        by_section[s].append(k)
    by_section["part30"].insert(0, "certify_capacity")
    write("form-rules.json", {
        "_about": "Form-level rules. One entity (the beneficial owner) - everything comes from the Excel; the reviewer can change it.",
        "formId": "w8ben-e", "group": "US tax", "label": "W-8BEN-E – Entity", "shortLabel": "W-8BEN-E",
        "purpose": "Tax form for non-US entities", "blankFileName": "Form W-8BEN-E.pdf",
        "keyFields": ["Entity name", "Country of incorporation", "Chapter 3 status", "Chapter 4 status"],
        "sheetTabName": "W-8BEN-E", "detectionPhrases": ["W-8BEN-E", "(Entities)"],
        "supportedNomineeCount": 1, "personLabel": "Entity",
        "identityType": {"scope": "shared", "tickboxField": None, "numberField": None,
                         "optionByIdentityKind": {}, "numberFieldByIdentityKind": {}},
        "reviewSections": [{"key": s, "label": label, "fields": by_section[s]} for s, label in SECTIONS]})

    write("required-fields.json", {
        "_about": "Fields that must be filled before a case can be confirmed: the mandatory Part I lines and the certification.",
        "requiredFields": ["entity_name", "country_of_incorporation", "chapter_3_status", "chapter_4_status",
                           "permanent_address", "permanent_city_state_postal_code", "permanent_country",
                           "signer_name", "form_date"]})
    print(len(fields), "fields,", len(tickboxes), "tick boxes")



if __name__ == "__main__":
    main()
