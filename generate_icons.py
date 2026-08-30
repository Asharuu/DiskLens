import os
import sys
import math
from PIL import Image, ImageDraw

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

def create_disklens_icon(size=256):
    """Creates a futuristic high-tech lens + disk icon for DiskLens."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    margin = size * 0.05
    center = size / 2

    # 1. Background circle with smooth dark gradient / indigo fill
    for r in range(int(size/2 - margin), 0, -1):
        ratio = r / (size/2 - margin)
        # Deep Indigo to Cyber Purple gradient
        red = int(30 + (99 - 30) * (1 - ratio))
        green = int(27 + (102 - 27) * (1 - ratio))
        blue = int(75 + (241 - 75) * (1 - ratio))
        alpha = 255
        draw.ellipse([center - r, center - r, center + r, center + r], fill=(red, green, blue, alpha))

    # 2. Glowing Outer Ring (Glass border)
    ring_radius = int(size/2 - margin)
    draw.ellipse(
        [center - ring_radius, center - ring_radius, center + ring_radius, center + ring_radius],
        outline=(129, 140, 248, 230),
        width=int(size * 0.03)
    )

    # 3. Storage Pie / Doughnut Ring inside Lens
    inner_r_out = size * 0.32
    inner_r_in = size * 0.20
    box_outer = [center - inner_r_out, center - inner_r_out, center + inner_r_out, center + inner_r_out]

    # Sector 1: Cyan / Indigo used space (0 to 240 deg)
    draw.pieslice(box_outer, start=-90, end=150, fill=(99, 102, 241, 255))
    # Sector 2: Emerald free space (150 to 270 deg)
    draw.pieslice(box_outer, start=150, end=270, fill=(16, 185, 129, 255))

    # Cut out center to create doughnut
    draw.ellipse([center - inner_r_in, center - inner_r_in, center + inner_r_in, center + inner_r_in], fill=(20, 24, 50, 255))

    # Center glowing core dot
    core_r = size * 0.08
    draw.ellipse([center - core_r, center - core_r, center + core_r, center + core_r], fill=(245, 158, 11, 255))

    # 4. Magnifying Lens Handle (Bottom-Right)
    handle_width = int(size * 0.06)
    start_x = center + size * 0.25
    start_y = center + size * 0.25
    end_x = size - margin
    end_y = size - margin

    draw.line([(start_x, start_y), (end_x, end_y)], fill=(129, 140, 248, 255), width=handle_width)
    draw.ellipse([end_x - handle_width/2, end_y - handle_width/2, end_x + handle_width/2, end_y + handle_width/2], fill=(129, 140, 248, 255))

    return img

def main():
    root_dir = "D:\\Proyek\\disklens"
    frontend_public = os.path.join(root_dir, "frontend", "public")
    os.makedirs(frontend_public, exist_ok=True)

    img256 = create_disklens_icon(256)
    
    # Save PNGs
    img256.save(os.path.join(root_dir, "disklens.png"))
    img256.save(os.path.join(frontend_public, "disklens.png"))
    
    # Multi-resolution ICO for Windows & Favicon
    ico_sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
    img256.save(os.path.join(root_dir, "disklens.ico"), format="ICO", sizes=ico_sizes)
    img256.save(os.path.join(frontend_public, "favicon.ico"), format="ICO", sizes=ico_sizes)

    # Also generate crisp modern SVG favicon
    svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="50%" stop-color="#312e81" />
      <stop offset="100%" stop-color="#4f46e5" />
    </linearGradient>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818cf8" />
      <stop offset="100%" stop-color="#c084fc" />
    </linearGradient>
  </defs>
  <circle cx="128" cy="128" r="116" fill="url(#bgGrad)" stroke="url(#ringGrad)" stroke-width="8" />
  <!-- Donut Chart -->
  <path d="M 128 48 A 80 80 0 1 1 58 168 L 86 152 A 48 48 0 1 0 128 80 Z" fill="#6366f1" />
  <path d="M 58 168 A 80 80 0 0 1 128 48 L 128 80 A 48 48 0 0 0 86 152 Z" fill="#10b981" />
  <!-- Core -->
  <circle cx="128" cy="128" r="24" fill="#0f172a" stroke="#818cf8" stroke-width="4" />
  <circle cx="128" cy="128" r="10" fill="#f59e0b" />
  <!-- Lens Glass Handle -->
  <line x1="184" y1="184" x2="232" y2="232" stroke="#818cf8" stroke-width="16" stroke-linecap="round" />
</svg>"""

    with open(os.path.join(frontend_public, "favicon.svg"), "w", encoding="utf-8") as f:
        f.write(svg_content)

    print("✅ Icons generated successfully:")
    print("  •", os.path.join(root_dir, "disklens.ico"))
    print("  •", os.path.join(frontend_public, "favicon.ico"))
    print("  •", os.path.join(frontend_public, "favicon.svg"))

if __name__ == "__main__":
    main()
