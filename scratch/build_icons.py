# scratch/build_icons.py
import zlib, struct, math, os

# 1. Read binary mask from user's original image media_1788443929777.png
with open(r'C:\Users\mohds\.gemini\antigravity\brain\b8b22405-3eb6-4a2d-81bc-cc2de9acf91a\.user_uploaded\media_1788443929777.png', 'rb') as f:
    data = f.read()

pos = 8
idat = bytearray()
while pos < len(data):
    length = struct.unpack('>I', data[pos:pos+4])[0]
    chunk_type = data[pos+4:pos+8]
    if chunk_type == b'IDAT':
        idat.extend(data[pos+8:pos+8+length])
    pos += 12 + length

raw = zlib.decompress(idat)
src_w, src_h = 166, 176
stride = 1 + src_w * 4

src_pixels = []
prev_line = bytearray(src_w * 4)
for y in range(src_h):
    filter_type = raw[y * stride]
    line = bytearray(raw[y * stride + 1 : (y + 1) * stride])
    recon = bytearray(src_w * 4)
    for x in range(src_w * 4):
        a = recon[x - 4] if x >= 4 else 0
        b = prev_line[x]
        c = prev_line[x - 4] if x >= 4 else 0
        if filter_type == 0: val = line[x]
        elif filter_type == 1: val = (line[x] + a) & 0xff
        elif filter_type == 2: val = (line[x] + b) & 0xff
        elif filter_type == 3: val = (line[x] + (a + b) // 2) & 0xff
        elif filter_type == 4:
            p = a + b - c
            pa = abs(p - a)
            pb = abs(p - b)
            pc = abs(p - c)
            pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
            val = (line[x] + pr) & 0xff
        recon[x] = val
    prev_line = recon
    src_pixels.append([recon[x*4] for x in range(src_w)])

# Crop to tight bounding box of the logo
min_x, max_x, min_y, max_y = src_w, 0, src_h, 0
for y in range(src_h):
    for x in range(src_w):
        if src_pixels[y][x] > 80:
            min_x = min(min_x, x)
            max_x = max(max_x, x)
            min_y = min(min_y, y)
            max_y = max(max_y, y)

bbox_w = max_x - min_x + 1
bbox_h = max_y - min_y + 1
print(f'Logo BBox: {bbox_w}x{bbox_h} at ({min_x}, {min_y})')

def write_png(filename, width, height, rgba_data):
    def chunk(chunk_type, data):
        return (
            struct.pack('>I', len(data)) +
            chunk_type +
            data +
            struct.pack('>I', zlib.crc32(chunk_type + data) & 0xffffffff)
        )

    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        start = y * width * 4
        raw.extend(rgba_data[start : start + width * 4])

    idat = chunk(b'IDAT', zlib.compress(bytes(raw), 9))
    iend = chunk(b'IEND', b'')

    with open(filename, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n' + ihdr + idat + iend)

# Primary Blue RGB
PB_R, PB_G, PB_B = 0x25, 0x63, 0xEB

def render_icon(target_size, padding_ratio=0.18, with_bg=True, corner_radius_ratio=0.22):
    w, h = target_size, target_size
    rgba = bytearray(w * h * 4)

    inner_size = w * (1.0 - 2 * padding_ratio)
    scale = inner_size / max(bbox_w, bbox_h)
    draw_w = bbox_w * scale
    draw_h = bbox_h * scale
    offset_x = (w - draw_w) / 2.0
    offset_y = (h - draw_h) / 2.0

    corner_radius = w * corner_radius_ratio

    for y in range(h):
        for x in range(w):
            idx = (y * w + x) * 4

            # Check rounded corner squircle mask
            inside_card = True
            alpha_card = 1.0
            if with_bg:
                # Distance to corner
                cx = min(max(x, corner_radius), w - 1 - corner_radius)
                cy = min(max(y, corner_radius), h - 1 - corner_radius)
                dist = math.hypot(x - cx, y - cy)
                if dist > corner_radius:
                    alpha_card = max(0.0, min(1.0, corner_radius + 1.0 - dist))
                    if alpha_card == 0:
                        inside_card = False

            if not inside_card:
                rgba[idx:idx+4] = (0, 0, 0, 0)
                continue

            # Check logo mapping (bilinear interpolation)
            src_xf = min_x + (x - offset_x) / scale
            src_yf = min_y + (y - offset_y) / scale

            logo_val = 0.0
            if 0 <= src_xf < src_w - 1 and 0 <= src_yf < src_h - 1:
                x0, y0 = int(src_xf), int(src_yf)
                fx, fy = src_xf - x0, src_yf - y0
                v00 = src_pixels[y0][x0]
                v10 = src_pixels[y0][x0+1]
                v01 = src_pixels[y0+1][x0]
                v11 = src_pixels[y0+1][x0+1]
                logo_val = ((v00 * (1-fx) + v10 * fx) * (1-fy) + (v01 * (1-fx) + v11 * fx) * fy) / 255.0

            if with_bg:
                # White background with subtle top-to-bottom clean Apple gradient
                bg_val = 255
                # Logo in Primary Blue
                r = int(bg_val * (1.0 - logo_val) + PB_R * logo_val)
                g = int(bg_val * (1.0 - logo_val) + PB_G * logo_val)
                b = int(bg_val * (1.0 - logo_val) + PB_B * logo_val)
                a = int(255 * alpha_card)
                rgba[idx:idx+4] = (r, g, b, a)
            else:
                # Transparent background, just blue logo
                r = PB_R
                g = PB_G
                b = PB_B
                a = int(255 * logo_val)
                rgba[idx:idx+4] = (r, g, b, a)

    return rgba

os.makedirs('public', exist_ok=True)

# Generate all standard platform sizes
print('Generating public/icon-16x16.png...')
write_png('public/icon-16x16.png', 16, 16, render_icon(16, padding_ratio=0.10, with_bg=True, corner_radius_ratio=0.20))

print('Generating public/icon-32x32.png...')
write_png('public/icon-32x32.png', 32, 32, render_icon(32, padding_ratio=0.12, with_bg=True, corner_radius_ratio=0.22))

print('Generating public/apple-touch-icon.png (180x180)...')
write_png('public/apple-touch-icon.png', 180, 180, render_icon(180, padding_ratio=0.18, with_bg=True, corner_radius_ratio=0.22))

print('Generating public/icon-192x192.png (Android / PWA)...')
write_png('public/icon-192x192.png', 192, 192, render_icon(192, padding_ratio=0.18, with_bg=True, corner_radius_ratio=0.22))

print('Generating public/icon-512x512.png (Desktop / Android / PWA)...')
write_png('public/icon-512x512.png', 512, 512, render_icon(512, padding_ratio=0.18, with_bg=True, corner_radius_ratio=0.22))

# Also write a standard multi-size favicon.ico containing the 32x32 PNG
with open('public/icon-32x32.png', 'rb') as f:
    png_32 = f.read()

# ICO Header
ico_header = struct.pack('<HHH', 0, 1, 1) # reserved, type 1 (ico), 1 image
# ICONDIRENTRY: width, height, colors, reserved, planes, bpp, size, offset
ico_entry = struct.pack('<BBBBHHII', 32, 32, 0, 0, 1, 32, len(png_32), 6 + 16)
with open('public/favicon.ico', 'wb') as f:
    f.write(ico_header + ico_entry + png_32)
print('Generated public/favicon.ico')

# Also write SVG vector icon
svg_vector = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <rect width="100" height="100" rx="22" fill="#FFFFFF" />
  <rect width="100" height="100" rx="22" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="1.5" />
  <path d="M 77.47,42.64 L 82.0,46.6 L 59.91,59.63 L 58.21,59.63 L 50.28,53.4 L 41.79,59.63 L 40.09,59.63 L 18.0,46.6 L 28.19,39.81 L 49.15,52.27 L 49.15,26.78 L 28.19,39.24 L 25.93,38.67 L 19.7,33.01 L 41.22,19.42 L 42.92,19.42 L 49.15,25.08 L 50.85,25.08 L 55.38,20.55 L 58.78,19.42 L 80.3,32.44 L 74.07,38.67 L 71.24,39.24 L 50.85,26.78 L 50.85,52.27 L 71.81,39.81 Z M 36.69,59.06 L 41.22,61.89 L 49.15,56.8 L 49.15,80.58 L 28.19,68.12 L 28.19,54.53 Z M 50.85,77.75 L 50.85,56.23 L 59.35,61.89 L 71.81,54.53 L 71.81,68.12 L 51.98,80.58 L 50.85,80.58 Z" fill="#2563EB" fill-rule="evenodd" />
</svg>'''

with open('public/icon.svg', 'w') as f:
    f.write(svg_vector)
print('Generated public/icon.svg')
