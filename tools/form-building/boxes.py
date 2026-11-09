"""Group the drawn rectangles of chosen pages: comb rows (equal cells side by side), tick boxes, wide input boxes.
usage: python -I boxes.py file.pdf 9,10"""
import sys, pymupdf
sys.stdout.reconfigure(encoding="utf-8")
path, pages = sys.argv[1], [int(p) for p in sys.argv[2].split(",")]
doc = pymupdf.open(path)


def label_left_of(page, rect):
    """Nearest text on the same line to the left of the rect."""
    best = None
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            text = "".join(s["text"] for s in line["spans"]).strip()
            x0, y0, x1, y1 = line["bbox"]
            if not text or x1 > rect.x0 + 2 or abs((y0 + y1) / 2 - (rect.y0 + rect.y1) / 2) > 7: continue
            if best is None or x1 > best[0]: best = (x1, text)
    return best[1][:40] if best else ""


def label_right_of(page, rect):
    best = None
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            text = "".join(s["text"] for s in line["spans"]).strip()
            x0, y0, x1, y1 = line["bbox"]
            if not text or x0 < rect.x1 - 2 or abs((y0 + y1) / 2 - (rect.y0 + rect.y1) / 2) > 7: continue
            if best is None or x0 < best[0]: best = (x0, text)
    return best[1][:40] if best else ""


for n in pages:
    page = doc[n - 1]
    rects = []
    for d in page.get_drawings():
        for item in d["items"]:
            if item[0] == "re":
                r = item[1]
                if r.width > 4 and r.height > 4: rects.append(pymupdf.Rect(r))
            elif item[0] == "qu":
                r = item[1].rect
                if r.width > 4 and r.height > 4: rects.append(pymupdf.Rect(r))
    # dedupe
    unique = []
    for r in rects:
        if not any(abs(r.x0 - u.x0) < 1 and abs(r.y0 - u.y0) < 1 and abs(r.x1 - u.x1) < 1 and abs(r.y1 - u.y1) < 1 for u in unique): unique.append(r)
    unique = [r for r in unique if r.width < 560]
    unique.sort(key=lambda r: (round(r.y0), r.x0))
    print(f"===== page {n}")
    used = set()
    for i, r in enumerate(unique):
        if i in used: continue
        # comb: same y/height, width < 16, neighbours touching
        if r.width < 16 and r.height < 18:
            row = [i]
            for j in range(i + 1, len(unique)):
                s = unique[j]
                last = unique[row[-1]]
                if s.width < 16 and abs(s.y0 - r.y0) < 1.2 and abs(s.height - r.height) < 1.5 and -1 <= s.x0 - last.x1 < 4: row.append(j)
            if len(row) >= 2:
                used.update(row)
                last = unique[row[-1]]
                print(f"COMB y{r.y0:6.1f}-{r.y1:6.1f} x{r.x0:6.1f}-{last.x1:6.1f} n{len(row):3d} pitch{(last.x1 - r.x0) / len(row):5.2f} | {label_left_of(page, r)}")
                continue
            used.add(i)
            print(f"TICK x{r.x0:6.1f} y{r.y0:6.1f} w{r.width:4.1f} h{r.height:4.1f} | {label_left_of(page, r)} || {label_right_of(page, r)}")
            continue
        used.add(i)
        print(f"BOX  x{r.x0:6.1f}-{r.x1:6.1f} y{r.y0:6.1f}-{r.y1:6.1f} | {label_left_of(page, r)}")
