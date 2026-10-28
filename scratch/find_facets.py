# scratch/find_facets.py
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

# Find critical points on the left half (x <= 81):
# 1. Back flap top corner:
back_flap_pts = [(x, y) for y in range(h) for x in range(w) if pixels[y][x] and x <= 80 and y <= 77]
# Let's find top-most, left-most, right-most, bottom-most
print("Back-left flap:")
print("  top:", min(back_flap_pts, key=lambda p: p[1]))
print("  bottom:", max(back_flap_pts, key=lambda p: p[1]))
print("  left:", min(back_flap_pts, key=lambda p: p[0]))
print("  right:", max(back_flap_pts, key=lambda p: p[0]))

# 2. Front flap:
front_flap_pts = [(x, y) for y in range(h) for x in range(w) if pixels[y][x] and x <= 80 and 70 <= y <= 113]
print("\nFront-left flap:")
print("  top:", min(front_flap_pts, key=lambda p: p[1]))
print("  bottom:", max(front_flap_pts, key=lambda p: p[1]))
print("  left:", min(front_flap_pts, key=lambda p: p[0]))
print("  right:", max(front_flap_pts, key=lambda p: p[0]))

# 3. Left wall:
left_wall_pts = [(x, y) for y in range(h) for x in range(w) if pixels[y][x] and x <= 80 and y >= 103]
print("\nLeft wall:")
print("  top:", min(left_wall_pts, key=lambda p: p[1]))
print("  bottom:", max(left_wall_pts, key=lambda p: p[1]))
print("  left:", min(left_wall_pts, key=lambda p: p[0]))
print("  right:", max(left_wall_pts, key=lambda p: p[0]))
