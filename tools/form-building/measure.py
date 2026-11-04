"""Print text lines (with bbox, top-left origin, points) and drawn lines/boxes for chosen pages of a PDF.
usage: python measure.py file.pdf 1,2,3 [--draw]"""
import sys, pymupdf
sys.stdout.reconfigure(encoding="utf-8")
path, pages = sys.argv[1], [int(p) for p in sys.argv[2].split(",")]
draw = "--draw" in sys.argv
doc = pymupdf.open(path)
for n in pages:
    page = doc[n - 1]
    print(f"===== page {n}  size {page.rect.width:.1f} x {page.rect.height:.1f}")
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            text = "".join(s["text"] for s in line["spans"]).strip()
            if not text: continue
            x0, y0, x1, y1 = line["bbox"]
            base = line["spans"][0]["origin"][1]
            size = line["spans"][0]["size"]
            print(f"T x{x0:6.1f}-{x1:6.1f} top{y0:6.1f} base{base:6.1f} sz{size:4.1f} | {text[:110]}")
    if draw:
        for d in page.get_drawings():
            for item in d["items"]:
                if item[0] == "l":
                    a, b = item[1], item[2]
                    if abs(a.y - b.y) < 0.6 and abs(a.x - b.x) > 20: print(f"H y{a.y:6.1f} x{min(a.x,b.x):6.1f}-{max(a.x,b.x):6.1f}")
                    elif abs(a.x - b.x) < 0.6 and abs(a.y - b.y) > 8: print(f"V x{a.x:6.1f} y{min(a.y,b.y):6.1f}-{max(a.y,b.y):6.1f}")
                elif item[0] == "re":
                    r = item[1]
                    if r.width > 20 and r.height < 1.5: print(f"H y{r.y0:6.1f} x{r.x0:6.1f}-{r.x1:6.1f} (rect)")
                    elif r.height > 8 and r.width < 1.5: print(f"V x{r.x0:6.1f} y{r.y0:6.1f}-{r.y1:6.1f} (rect)")
                    elif r.width > 5 and r.height > 5: print(f"R x{r.x0:6.1f} y{r.y0:6.1f} w{r.width:5.1f} h{r.height:5.1f}")
