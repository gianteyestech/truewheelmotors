import os
import math
from PIL import Image, ImageDraw, ImageFont

def create_bold_logo():
    # Crisp vector SVG
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 400" width="100%" height="100%">
  <defs>
    <!-- Royal Blue Rich Gradient -->
    <linearGradient id="royalBlueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#103B75" />
      <stop offset="35%" stop-color="#1652A2" />
      <stop offset="70%" stop-color="#1E65BF" />
      <stop offset="100%" stop-color="#124382" />
    </linearGradient>

    <!-- Warm Metallic Gold Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E5C158" />
      <stop offset="50%" stop-color="#D4AF37" />
      <stop offset="100%" stop-color="#AA820A" />
    </linearGradient>

    <!-- Subtle Drop Shadow for Depth -->
    <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#0F2D59" flood-opacity="0.10" />
    </filter>

    <style>
      .brand-name {
        font-family: 'Cinzel', 'Playfair Display', 'Georgia', serif;
        font-weight: 800;
        font-size: 46px;
        letter-spacing: 5px;
        fill: #14498C;
        text-anchor: middle;
      }
      .brand-tagline {
        font-family: 'Playfair Display', 'Georgia', serif;
        font-style: italic;
        font-size: 17.5px;
        font-weight: 600;
        letter-spacing: 2.2px;
        fill: #475569;
        text-anchor: middle;
      }
    </style>
  </defs>

  <g id="logo-mark" filter="url(#logoShadow)">
    <!-- ==========================================
         CAR SILHOUETTE - BOLD, CATCHY, SPORTY
         ========================================== -->
    <!-- Rear lower lip -->
    <path d="M 240 206 L 275 206" 
          fill="none" 
          stroke="url(#royalBlueGrad)" 
          stroke-width="15" 
          stroke-linecap="round" />

    <!-- Main Aerodynamic Body Contour -->
    <!-- Rear bumper -> Rear decklid -> C-Pillar -> Roof -> Windshield -> Hood -> Front nose -> Front bumper -->
    <path d="M 245 206 
             C 240 178, 255 158, 290 144 
             C 325 130, 360 98, 415 84 
             C 455 74, 500 76, 540 92 
             C 575 106, 610 134, 650 148 
             C 690 162, 722 178, 722 206" 
          fill="none" 
          stroke="url(#royalBlueGrad)" 
          stroke-width="16" 
          stroke-linecap="round" 
          stroke-linejoin="round" />

    <!-- Front lower lip -->
    <path d="M 685 206 L 722 206" 
          fill="none" 
          stroke="url(#royalBlueGrad)" 
          stroke-width="15" 
          stroke-linecap="round" />

    <!-- Inner Aerodynamic Speed Curve (Roofline Double Stroke) -->
    <path d="M 382 108 
             C 440 88, 495 90, 538 108" 
          fill="none" 
          stroke="url(#royalBlueGrad)" 
          stroke-width="11" 
          stroke-linecap="round" />

    <!-- ==========================================
         WHEELS: BOLD ROYAL BLUE RIMS & GOLD HUBS
         ========================================== -->
    <!-- Rear Wheel (Left) -->
    <g id="wheel-rear">
      <circle cx="330" cy="206" r="37" fill="none" stroke="url(#royalBlueGrad)" stroke-width="15" />
      <circle cx="330" cy="206" r="16" fill="url(#goldGrad)" stroke="#B89324" stroke-width="2.5" />
      <circle cx="330" cy="206" r="4.5" fill="#FFFFFF" />
    </g>

    <!-- Front Wheel (Right) -->
    <g id="wheel-front">
      <circle cx="636" cy="206" r="37" fill="none" stroke="url(#royalBlueGrad)" stroke-width="15" />
      <circle cx="636" cy="206" r="16" fill="url(#goldGrad)" stroke="#B89324" stroke-width="2.5" />
      <circle cx="636" cy="206" r="4.5" fill="#FFFFFF" />
    </g>

    <!-- ==========================================
         GROUND HORIZON ARC (METALLIC GOLD)
         ========================================== -->
    <path d="M 215 244 
             Q 480 264, 745 244" 
          fill="none" 
          stroke="url(#goldGrad)" 
          stroke-width="7" 
          stroke-linecap="round" />
  </g>

  <!-- ==========================================
       BRAND TYPOGRAPHY: PRESTIGIOUS & CRISP
       ========================================== -->
  <text x="480" y="320" class="brand-name">
    TRUE WHEEL MOTORS
  </text>

  <text x="480" y="356" class="brand-tagline">
    Driven From Japan, Delivered With Trust
  </text>
</svg>
'''
    with open("d:/GET-PROJECTS/truewheelmotors/public/assets/real-logo-bold.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)
    print("Vector SVG written to public/assets/real-logo-bold.svg")

    # High-Res 4x Supersampled Antialiased PNG rendering
    scale = 4
    W, H = 920 * scale, 400 * scale
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    blue_main = (22, 82, 162, 255)
    gold_main = (212, 175, 55, 255)
    gold_dark = (180, 140, 20, 255)
    text_slate = (71, 85, 105, 255)

    def draw_thick_line(p1, p2, width, color):
        draw.line([p1, p2], fill=color, width=width)
        r = width // 2
        draw.ellipse([p1[0]-r, p1[1]-r, p1[0]+r, p1[1]+r], fill=color)
        draw.ellipse([p2[0]-r, p2[1]-r, p2[0]+r, p2[1]+r], fill=color)

    def draw_bezier(p0, p1, p2, p3, width, color, steps=120):
        prev = p0
        r = width // 2
        draw.ellipse([p0[0]-r, p0[1]-r, p0[0]+r, p0[1]+r], fill=color)
        for i in range(1, steps + 1):
            t = i / steps
            u = 1 - t
            x = u**3 * p0[0] + 3 * u**2 * t * p1[0] + 3 * u * t**2 * p2[0] + t**3 * p3[0]
            y = u**3 * p0[1] + 3 * u**2 * t * p1[1] + 3 * u * t**2 * p2[1] + t**3 * p3[1]
            curr = (x, y)
            draw.line([prev, curr], fill=color, width=width)
            draw.ellipse([x-r, y-r, x+r, y+r], fill=color)
            prev = curr

    def draw_quadratic(p0, p1, p2, width, color, steps=80):
        prev = p0
        r = width // 2
        draw.ellipse([p0[0]-r, p0[1]-r, p0[0]+r, p0[1]+r], fill=color)
        for i in range(1, steps + 1):
            t = i / steps
            u = 1 - t
            x = u**2 * p0[0] + 2 * u * t * p1[0] + t**2 * p2[0]
            y = u**2 * p0[1] + 2 * u * t * p1[1] + t**2 * p2[1]
            curr = (x, y)
            draw.line([prev, curr], fill=color, width=width)
            draw.ellipse([x-r, y-r, x+r, y+r], fill=color)
            prev = curr

    # Ground Horizon Arc (Metallic Gold)
    draw_quadratic((215*scale, 244*scale), (480*scale, 264*scale), (745*scale, 244*scale), int(7*scale), gold_main)

    # Lower rear bumper lip
    draw_thick_line((240*scale, 206*scale), (275*scale, 206*scale), int(15*scale), blue_main)
    # Lower front bumper lip
    draw_thick_line((685*scale, 206*scale), (722*scale, 206*scale), int(15*scale), blue_main)

    # Sweeping Sports Car Silhouette (3 seamless connected segments)
    # 1. Rear bumper up through fastback decklid to roofline start:
    draw_bezier((245*scale, 206*scale), (240*scale, 178*scale), (255*scale, 158*scale), (290*scale, 144*scale), int(16*scale), blue_main)
    # 2. C-pillar up across roofline to windshield top:
    draw_bezier((290*scale, 144*scale), (345*scale, 110*scale), (415*scale, 74*scale), (490*scale, 74*scale), int(16*scale), blue_main)
    # 3. Roof across windshield and sleek hood to front bumper:
    draw_bezier((490*scale, 74*scale), (560*scale, 74*scale), (630*scale, 134*scale), (722*scale, 206*scale), int(16*scale), blue_main)

    # Inner roof accent line
    draw_quadratic((382*scale, 108*scale), (460*scale, 88*scale), (538*scale, 108*scale), int(11*scale), blue_main)

    # Wheels (Bold Blue Rims + Gold Hubs + White Center Dots)
    def draw_wheel(cx, cy):
        r_outer = 37 * scale
        w_rim = 15 * scale
        for dr in range(-w_rim//2, w_rim//2 + 1):
            draw.ellipse([(cx-r_outer-dr, cy-r_outer-dr), (cx+r_outer+dr, cy+r_outer+dr)], outline=blue_main, width=1)
        r_hub = 16 * scale
        draw.ellipse([(cx-r_hub, cy-r_hub), (cx+r_hub, cy+r_hub)], fill=gold_main, outline=gold_dark, width=int(2.5*scale))
        r_pin = int(4.5 * scale)
        draw.ellipse([(cx-r_pin, cy-r_pin), (cx+r_pin, cy+r_pin)], fill=(255, 255, 255, 255))

    draw_wheel(330*scale, 206*scale)
    draw_wheel(636*scale, 206*scale)

    # Typography using Windows Georgia Bold and Times Italic
    try:
        font_title = ImageFont.truetype("C:/Windows/Fonts/georgiab.ttf", int(46 * scale))
        font_tagline = ImageFont.truetype("C:/Windows/Fonts/timesi.ttf", int(21 * scale))
    except Exception:
        font_title = ImageFont.load_default()
        font_tagline = ImageFont.load_default()

    title_text = "TRUE WHEEL MOTORS"
    tagline_text = "Driven From Japan, Delivered With Trust"

    # Title with letter spacing
    spacing_title = int(5 * scale)
    chars = list(title_text)
    char_widths = [draw.textbbox((0, 0), c, font=font_title)[2] for c in chars]
    total_title_w = sum(char_widths) + spacing_title * (len(chars) - 1)
    x_curr = (W - total_title_w) / 2
    y_title = int(296 * scale)

    for i, c in enumerate(chars):
        draw.text((x_curr, y_title), c, font=font_title, fill=blue_main)
        x_curr += char_widths[i] + spacing_title

    # Tagline
    tagline_bbox = draw.textbbox((0, 0), tagline_text, font=font_tagline)
    tagline_w = tagline_bbox[2] - tagline_bbox[0]
    draw.text(((W - tagline_w) / 2, int(346 * scale)), tagline_text, font=font_tagline, fill=text_slate)

    final_img = img.resize((920, 400), Image.Resampling.LANCZOS)
    
    final_img.save("d:/GET-PROJECTS/truewheelmotors/public/assets/real-logo-bold.png")
    final_img.save("d:/GET-PROJECTS/truewheelmotors/public/assets/real-logo-transparent.png")
    print("Saved transparent bold logo PNGs")

    white_bg = Image.new("RGBA", (920, 400), (255, 255, 255, 255))
    white_bg.paste(final_img, (0, 0), final_img)
    white_bg.convert("RGB").save("d:/GET-PROJECTS/truewheelmotors/public/assets/real-logo.png")
    print("Saved real-logo.png with white background")

if __name__ == "__main__":
    create_bold_logo()
