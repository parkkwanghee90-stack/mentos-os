#!/usr/bin/env python3
"""내신 자동화 1단계: 시험지 PDF → 페이지 PNG (pypdf 분할 + macOS sips 렌더; poppler 불필요).
사용: python3 scripts/naesin/pdf_to_png.py <input.pdf> <out_dir>
"""
import os, sys, subprocess
from pypdf import PdfReader, PdfWriter

def main():
    if len(sys.argv) < 3:
        print("usage: pdf_to_png.py <input.pdf> <out_dir>"); sys.exit(1)
    pdf, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    r = PdfReader(pdf, strict=False)
    n = len(r.pages)
    made = 0
    for i in range(n):
        sp = os.path.join(out, f"p{i+1:02d}.pdf")
        w = PdfWriter(); w.add_page(r.pages[i])
        with open(sp, "wb") as f: w.write(f)
        png = sp.replace(".pdf", ".png")
        subprocess.run(["sips", "-s", "format", "png", sp, "--out", png],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        os.remove(sp)
        if os.path.exists(png): made += 1
    print(f"PAGES={made}")

if __name__ == "__main__":
    main()
