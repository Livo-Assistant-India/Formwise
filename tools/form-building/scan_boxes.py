"""Find the printed boxes of a SCANNED page from its pixels: comb rows (equal cells side by side), tick boxes and wide
input boxes, in PDF points (top-left origin). For vector pages use boxes.py instead.
A box is an enclosed white area: white pixel runs are joined row to row, and areas that touch the page edge or are too
big are dropped. Prints rows sorted top to bottom, with the nearest OCR text to the left as a label.
usage: python -I scan_boxes.py file.pdf 4,5 [dark threshold, default 170; raise it for light grey borders]"""
import sys
import numpy
import pymupdf

sys.stdout.reconfigure(encoding="utf-8")
ZOOM = 3
DARK_BELOW = int(sys.argv[3]) if len(sys.argv) > 3 else 170


def white_areas(gray):
    """Bounding boxes (x0, y0, x1, y1 in pixels) of 4-connected white areas, by joining white runs of adjacent rows."""
    height, width = gray.shape
    parent = []

    def find(index):
        while parent[index] != index:
            parent[index] = parent[parent[index]]
            index = parent[index]
        return index

    boxes = []
    previous_runs = []
    for y in range(height):
        row = gray[y] >= DARK_BELOW
        padded = numpy.concatenate(([False], row, [False]))
        changes = numpy.flatnonzero(padded[1:] != padded[:-1])
        runs = []
        for start, end in zip(changes[0::2], changes[1::2]):
            index = len(parent)
            parent.append(index)
            boxes.append([start, y, end - 1, y])
            for previous_start, previous_end, previous_index in previous_runs:
                if previous_start <= end - 1 and start <= previous_end:
                    root_a, root_b = find(index), find(previous_index)
                    if root_a != root_b:
                        parent[root_b] = root_a
            runs.append((start, end - 1, index))
        previous_runs = runs
    merged = {}
    for index, (x0, y0, x1, y1) in enumerate(boxes):
        root = find(index)
        if root in merged:
            box = merged[root]
            box[0], box[1], box[2], box[3] = min(box[0], x0), min(box[1], y0), max(box[2], x1), max(box[3], y1)
        else:
            merged[root] = [x0, y0, x1, y1]
    return list(merged.values())


def label_left_of(page, x, top, bottom):
    best = None
    for word in page.get_text("words"):
        if word[2] <= x + 1 and word[1] < bottom and word[3] > top:
            if best is None or word[2] > best[2]:
                best = word
    return best[4] if best else ""


def main():
    path, pages = sys.argv[1], [int(p) for p in sys.argv[2].split(",")]
    doc = pymupdf.open(path)
    for page_number in pages:
        page = doc[page_number - 1]
        pix = page.get_pixmap(matrix=pymupdf.Matrix(ZOOM, ZOOM), colorspace=pymupdf.csGRAY)
        gray = numpy.frombuffer(pix.samples, dtype=numpy.uint8).reshape(pix.height, pix.width)
        cells = []
        for x0, y0, x1, y1 in white_areas(gray):
            if x0 == 0 or y0 == 0 or x1 >= pix.width - 1 or y1 >= pix.height - 1:
                continue
            w, h = (x1 - x0 + 1) / ZOOM, (y1 - y0 + 1) / ZOOM
            if 4 <= h <= 30 and 4 <= w <= 560 and w * h > 20:
                # Box outline = the white inside plus one border pixel each side.
                cells.append((round((x0 - 1) / ZOOM, 1), round((y0 - 1) / ZOOM, 1), round((x1 + 2) / ZOOM, 1), round((y1 + 2) / ZOOM, 1)))
        cells.sort(key=lambda c: (round(c[3]), c[0]))
        print(f"===== page {page_number}")
        rows = []
        for cell in cells:
            if rows and abs(rows[-1][-1][3] - cell[3]) <= 1.5:
                rows[-1].append(cell)
            else:
                rows.append([cell])
        for row in rows:
            row.sort(key=lambda c: c[0])
            groups, current = [], [row[0]]
            for cell in row[1:]:
                previous = current[-1]
                same_size = abs((cell[2] - cell[0]) - (previous[2] - previous[0])) <= 1.6
                touching = cell[0] - previous[2] <= 2.5
                if same_size and touching and (cell[2] - cell[0]) < 20:
                    current.append(cell)
                else:
                    groups.append(current)
                    current = [cell]
            groups.append(current)
            parts = []
            for group in groups:
                x0, top, x1, bottom = group[0][0], min(c[1] for c in group), group[-1][2], max(c[3] for c in group)
                label = label_left_of(page, x0, top, bottom)[:16]
                if len(group) >= 3:
                    parts.append(f"COMB {len(group)} x{x0}-{x1} pitch {round((x1 - x0) / len(group), 2)} [{label}]")
                elif x1 - x0 < 13 and bottom - top < 13:
                    parts.append(f"tick x{x0} size {round(x1 - x0, 1)} [{label}]")
                else:
                    parts.append(f"box x{x0}-{x1} [{label}]")
            print(f"bottom {round(row[0][3], 1):6.1f} top {round(min(c[1] for c in row), 1):6.1f} | " + " | ".join(parts))


main()
