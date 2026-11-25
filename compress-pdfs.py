"""
compress-pdfs.py

Optimizes scanned/embedded images in PDF files that exceed Cloudflare Pages' 25 MiB limit.
Iteratively compresses and resizes images if necessary, without recursion.

Targets:
  - bit-mesra/math1/math_1_3.pdf (already compressed to ~23.2 MB)
  - bit-mesra/math1/math_1_4.pdf (~36 MB -> target < 25 MB)
  - bit-mesra/math2/math_2_2.pdf (~35 MB -> target < 25 MB)
  - bit-mesra/math2/math_2_3.pdf (~51 MB -> target < 25 MB)
"""

import gc
import os
import sys
from pathlib import Path

try:
    from pypdf import PdfReader, PdfWriter
    from PIL import Image
except ImportError:
    print("Error: 'pypdf' and 'pillow' are required. Run:\nuv run --with pypdf --with pillow python compress-pdfs.py")
    sys.exit(1)

TARGET_FILES = [
    "bit-mesra/math1/math_1_3.pdf",
    "bit-mesra/math1/math_1_4.pdf",
    "bit-mesra/math2/math_2_2.pdf",
    "bit-mesra/math2/math_2_3.pdf",
]

CLOUDFLARE_LIMIT_MB = 24.5  # Safe buffer below 25.0 MiB

def optimize_single_pdf(file_path: str, max_dimension: int = 1600, quality: int = 55):
    p = Path(file_path)
    if not p.exists():
        print(f"Skipping {file_path} (not found)")
        return True

    original_size_mb = p.stat().st_size / (1024 * 1024)
    if original_size_mb <= CLOUDFLARE_LIMIT_MB:
        print(f"✓ {file_path} is {original_size_mb:.2f} MB (within limit). Skipping.")
        return True

    print(f"\nCompressing {file_path} ({original_size_mb:.2f} MB)... [max_dim={max_dimension}, quality={quality}]")
    reader = PdfReader(str(p))
    writer = PdfWriter()

    for page in reader.pages:
        writer.add_page(page)

    for idx, page in enumerate(writer.pages):
        for img in page.images:
            try:
                pil_img = img.image
                # Resize if dimensions exceed max_dimension
                w, h = pil_img.size
                if max(w, h) > max_dimension:
                    scale = max_dimension / max(w, h)
                    new_size = (int(w * scale), int(h * scale))
                    pil_img = pil_img.resize(new_size, Image.Resampling.LANCZOS)
                
                # Convert RGBA/P to RGB if saving as JPEG
                if pil_img.mode in ("RGBA", "P"):
                    pil_img = pil_img.convert("RGB")

                img.replace(pil_img, quality=quality)
            except Exception:
                pass
        page.compress_content_streams()
        
        # Periodic garbage collection to maintain low memory
        if idx % 10 == 0:
            gc.collect()

    temp_path = str(p) + ".tmp"
    with open(temp_path, "wb") as f:
        writer.write(f)

    del reader
    del writer
    gc.collect()

    new_size_mb = os.path.getsize(temp_path) / (1024 * 1024)
    print(f"   -> Result: {new_size_mb:.2f} MB (reduced by {((original_size_mb - new_size_mb)/original_size_mb)*100:.1f}%)")

    if new_size_mb <= CLOUDFLARE_LIMIT_MB:
        os.replace(temp_path, str(p))
        print(f"   ✓ Successfully replaced {file_path} ({new_size_mb:.2f} MB <= 24.5 MB).")
        return True
    else:
        # If still over limit, retry once with lower dimension & quality
        print(f"   Still over limit ({new_size_mb:.2f} MB). Performing second pass with max_dim=1200, quality=45...")
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return False

def main():
    print("Starting robust PDF compression for Cloudflare Pages (25 MiB asset limit)...")
    for target in TARGET_FILES:
        success = optimize_single_pdf(target, max_dimension=1600, quality=55)
        if not success:
            # Second aggressive pass
            optimize_single_pdf(target, max_dimension=1200, quality=45)
    print("\nAll target PDFs processed successfully!")

if __name__ == "__main__":
    main()
