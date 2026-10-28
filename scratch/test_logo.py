# scratch/test_logo.py
import zlib, struct

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
w, h = 166, 176
stride = 1 + w * 4

pixels = []
prev_line = bytearray(w * 4)
for y in range(h):
    filter_type = raw[y * stride]
    line = bytearray(raw[y * stride + 1 : (y + 1) * stride])
    recon = bytearray(w * 4)
    for x in range(w * 4):
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
    pixels.append([1 if recon[x*4] > 128 else 0 for x in range(w)])

# Find all boundary segments exactly
# Output SVG path consisting of horizontal runs or clean polygons
rects = []
for y in range(h):
    in_run = False
    start_x = 0
    for x in range(w):
        if pixels[y][x]:
            if not in_run:
                in_run = True
                start_x = x
        else:
            if in_run:
                in_run = False
                rects.append((start_x, y, x - start_x, 1))
    if in_run:
        rects.append((start_x, y, w - start_x, 1))

# Merge vertical runs into larger rects
merged = []
# Group by (x, width)
by_xw = {}
for x, y, rw, rh in rects:
    by_xw.setdefault((x, rw), []).append(y)

for (x, rw), ys in by_xw.items():
    # find contiguous runs of ys
    ys.sort()
    y_start = ys[0]
    prev_y = ys[0]
    for y in ys[1:]:
        if y == prev_y + 1:
            prev_y = y
        else:
            merged.append((x, y_start, rw, prev_y - y_start + 1))
            y_start = y
            prev_y = y
    merged.append((x, y_start, rw, prev_y - y_start + 1))

print(f'Compressed {len(rects)} pixel rows into {len(merged)} rects')

# Write SVG
svg_parts = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 166 176" width="166" height="176">'
]
for x, y, rw, rh in merged:
    svg_parts.append(f'  <rect x="{x}" y="{y}" width="{rw}" height="{rh}" fill="#2563EB" />')
svg_parts.append('</svg>')

with open('scratch/exact_logo.svg', 'w') as f:
    f.write('\n'.join(svg_parts))

print('Saved scratch/exact_logo.svg!')
