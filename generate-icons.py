import struct, zlib, math, os

def make_png(w, h, pixels):
    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        return c + struct.pack('>I', zlib.crc32(c[4:]) & 0xffffffff)
    raw = bytearray()
    for row in pixels:
        raw.append(0)
        for val in row:
            raw.append(val)
    compressed = zlib.compress(bytes(raw))
    header = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)
    sig = b'\x89PNG\r\n\x1a\n'
    return sig + chunk(b'IHDR', header) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')

os.makedirs('icons', exist_ok=True)

sizes = [72, 96, 128, 144, 152, 192, 384, 512]

for size in sizes:
    pixels = []
    cx = size // 2
    cy = size // 2
    r_outer = size // 2 - 2
    corner_r = int(size * 0.18)

    for y in range(size):
        row = []
        for x in range(size):
            dx = x - cx
            dy = y - cy
            dist = math.sqrt(dx*dx + dy*dy)

            # Rounded rect corner check
            in_shape = True
            corners = [
                (corner_r,        corner_r),
                (size - corner_r, corner_r),
                (corner_r,        size - corner_r),
                (size - corner_r, size - corner_r),
            ]
            if x < corner_r and y < corner_r:
                in_shape = math.sqrt((x - corner_r)**2 + (y - corner_r)**2) <= corner_r
            elif x > size - corner_r and y < corner_r:
                in_shape = math.sqrt((x - (size - corner_r))**2 + (y - corner_r)**2) <= corner_r
            elif x < corner_r and y > size - corner_r:
                in_shape = math.sqrt((x - corner_r)**2 + (y - (size - corner_r))**2) <= corner_r
            elif x > size - corner_r and y > size - corner_r:
                in_shape = math.sqrt((x - (size - corner_r))**2 + (y - (size - corner_r))**2) <= corner_r

            if not in_shape:
                row += [0, 0, 0]
                continue

            # Dark background gradient
            t = min(1.0, dist / max(1, r_outer))
            bg_r = int(26 * (1 - t) + 5 * t)
            bg_g = int(13 * (1 - t) + 5 * t)
            bg_b = int(46 * (1 - t) + 15 * t)

            # Glow toward center
            glow_t = max(0.0, 1.0 - dist / max(1, r_outer * 0.7))
            bg_r = min(255, bg_r + int(40 * glow_t))
            bg_b = min(255, bg_b + int(60 * glow_t))

            # Pink border ring
            border_w = max(2, size // 50)
            ring_dist = abs(dist - (r_outer - border_w))
            if ring_dist < border_w and dist < r_outer:
                row += [247, 37, 133]
                continue

            # Sword parameters
            sword_len = r_outer * 0.82
            sword_w   = max(2, size // 28)

            # Sword 1 rotated -45 deg
            cos45 = math.cos(math.pi / 4)
            sin45 = math.sin(math.pi / 4)
            rx1 =  dx * cos45 + dy * sin45
            ry1 = -dx * sin45 + dy * cos45
            on_sword1 = abs(ry1) < sword_w and abs(rx1) < sword_len

            # Sword 2 rotated +45 deg
            rx2 =  dx * cos45 - dy * sin45
            ry2 =  dx * sin45 + dy * cos45
            on_sword2 = abs(ry2) < sword_w and abs(rx2) < sword_len

            # Center diamond gem
            gem_r = max(3, size // 18)
            on_gem = (abs(dx) + abs(dy)) < gem_r

            if on_gem:
                # Gold gem
                row += [255, 215, 0]
            elif on_sword1 or on_sword2:
                ref_x = rx1 if on_sword1 else rx2
                t2 = ref_x / max(1, sword_len)

                # Cyan to white to purple gradient along blade
                if t2 < 0:
                    blend = -t2
                    sr = int(76  + (255 - 76)  * blend)
                    sg = int(201 + (255 - 201) * blend)
                    sb = int(240 + (255 - 240) * blend)
                else:
                    blend = t2
                    sr = int(255 + (155 - 255) * blend)
                    sg = int(255 + (93  - 255) * blend)
                    sb = int(255 + (229 - 255) * blend)

                # Guard cross bar (pink stripe)
                is_guard = (on_sword1 and abs(rx1) < sword_w * 2) or (on_sword2 and abs(rx2) < sword_w * 2)
                if is_guard:
                    row += [247, 37, 133]
                else:
                    row += [min(255, max(0, sr)), min(255, max(0, sg)), min(255, max(0, sb))]
            else:
                row += [bg_r, bg_g, bg_b]

        pixels.append(row)

    data = make_png(size, size, pixels)
    fname = f'icons/icon-{size}.png'
    with open(fname, 'wb') as f:
        f.write(data)
    print(f'  created {fname}  ({len(data)} bytes)')

# Screenshot placeholder (gradient banner)
sw, sh = 1280, 720
pixels = []
for y in range(sh):
    row = []
    for x in range(sw):
        tx = x / sw
        ty = y / sh
        r2 = int(5  + 25 * tx + 10 * ty)
        g2 = int(5  + 8  * tx)
        b2 = int(15 + 35 * tx + 15 * ty)
        row += [min(255, r2), min(255, g2), min(255, b2)]
    pixels.append(row)

with open('icons/screenshot-wide.png', 'wb') as f:
    f.write(make_png(sw, sh, pixels))
print('  created icons/screenshot-wide.png')
print('')
print('All icons generated successfully!')
