# scratch/make_pngs.py
# Pure python PNG generator using zlib and struct (zero external dependencies)
import zlib, struct, math, os

def write_png(filename, width, height, rgba_data):
    def chunk(chunk_type, data):
        return (
            struct.pack('>I', len(data)) +
            chunk_type +
            data +
            struct.pack('>I', zlib.crc32(chunk_type + data) & 0xffffffff)
        )

    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr = chunk(b'IHDR', ihdr_data)

    # IDAT (filter type 0 for each row)
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        start = y * width * 4
        raw.extend(rgba_data[start : start + width * 4])

    idat = chunk(b'IDAT', zlib.compress(bytes(raw), 9))
    iend = chunk(b'IEND', b'')

    png_bytes = b'\x89PNG\r\n\x1a\n' + ihdr + idat + iend
    with open(filename, 'wb') as f:
        f.write(png_bytes)

print('write_png helper defined')
