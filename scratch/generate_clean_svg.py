# scratch/generate_clean_svg.py
import zlib, struct, math

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

# Trace boundary segments
edges = set()
for y in range(h):
    for x in range(w):
        if pixels[y][x]:
            if y == 0 or not pixels[y-1][x]: edges.add(((x, y), (x+1, y)))
            if x == w-1 or not pixels[y][x+1]: edges.add(((x+1, y), (x+1, y+1)))
            if y == h-1 or not pixels[y+1][x]: edges.add(((x+1, y+1), (x, y+1)))
            if x == 0 or not pixels[y][x-1]: edges.add(((x, y+1), (x, y)))

loops = []
while edges:
    edge = edges.pop()
    loop = [edge[0], edge[1]]
    while True:
        curr = loop[-1]
        next_edge = None
        for e in edges:
            if e[0] == curr:
                next_edge = e
                break
        if next_edge:
            edges.remove(next_edge)
            if next_edge[1] == loop[0]:
                break
            loop.append(next_edge[1])
        else:
            break
    if len(loop) > 10:
        loops.append(loop)

def point_line_dist(pt, start, end):
    if start == end:
        return math.hypot(pt[0]-start[0], pt[1]-start[1])
    n = abs((end[1]-start[1])*pt[0] - (end[0]-start[0])*pt[1] + end[0]*start[1] - end[1]*start[0])
    d = math.hypot(end[1]-start[1], end[0]-start[0])
    return n / d

def rdp(points, epsilon):
    if len(points) < 3:
        return points
    dmax = 0
    index = 0
    for i in range(1, len(points) - 1):
        d = point_line_dist(points[i], points[0], points[-1])
        if d > dmax:
            index = i
            dmax = d
    if dmax > epsilon:
        res1 = rdp(points[:index+1], epsilon)
        res2 = rdp(points[index:], epsilon)
        return res1[:-1] + res2
    else:
        return [points[0], points[-1]]

# Let's test with epsilon = 1.0, 1.5, 2.0
for eps in [1.0, 1.4, 2.0]:
    paths = []
    for l in loops:
        simp = rdp(l + [l[0]], eps)
        d = 'M ' + ' L '.join(f'{pt[0]},{pt[1]}' for pt in simp[:-1]) + ' Z'
        paths.append(d)
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 166 176" width="166" height="176">
  <rect width="166" height="176" fill="#000000" />
  <path d="{' '.join(paths)}" fill="#2563EB" fill-rule="evenodd" />
</svg>'''
    with open(f'scratch/logo_eps_{eps}.svg', 'w') as f:
        f.write(svg)
    print(f'Eps {eps}: {sum(len(rdp(l + [l[0]], eps)) for l in loops)} total vertices')
