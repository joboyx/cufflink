/**
 * @jest-environment node
 */
/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { inflateSync } from 'node:zlib';
import { ICON_SOURCES, renderIconPng } from '../scripts/render-icons.cjs';

const ICON_DIR = join(__dirname, '..', 'public', 'icon');

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const SIZES = Object.keys(ICON_SOURCES).map(Number);

// Largest difference allowed per premultiplied channel. The rasterizer can round a little
// differently on another CPU; a missed regeneration after an SVG change differs far more.
const TOLERANCE = 3;

interface DecodedPng {
  width: number;
  height: number;
  /** Premultiplied RGBA, 4 bytes per pixel, row by row. */
  rgba: Uint8Array;
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) {
    return a;
  }
  return pb <= pc ? b : c;
}

// Decodes an 8-bit RGBA, non-interlaced PNG: the only kind that the icon script writes.
function decodePng(bytes: Buffer): DecodedPng {
  expect([...bytes.subarray(0, 8)]).toEqual(PNG_SIGNATURE);
  let offset = 8;
  let width = 0;
  let height = 0;
  const data: Buffer[] = [];
  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    const body = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      // Bit depth 8, color type 6 (RGBA), no interlace.
      expect([body[8], body[9], body[12]]).toEqual([8, 6, 0]);
    } else if (type === 'IDAT') {
      data.push(body);
    }
    offset += 12 + length;
  }

  const raw = inflateSync(Buffer.concat(data));
  const stride = width * 4;
  const rgba = new Uint8Array(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    for (let x = 0; x < stride; x++) {
      const value = raw[y * (stride + 1) + 1 + x];
      const left = x >= 4 ? rgba[y * stride + x - 4] : 0;
      const up = y > 0 ? rgba[(y - 1) * stride + x] : 0;
      const upLeft = x >= 4 && y > 0 ? rgba[(y - 1) * stride + x - 4] : 0;
      const predictors = [0, left, up, (left + up) >> 1, paeth(left, up, upLeft)];
      rgba[y * stride + x] = (value + predictors[filter]) & 0xff;
    }
  }

  // Premultiply, so that the color of a nearly see-through pixel does not count.
  for (let i = 0; i < rgba.length; i += 4) {
    const alpha = rgba[i + 3];
    for (let c = 0; c < 3; c++) {
      rgba[i + c] = Math.round((rgba[i + c] * alpha) / 255);
    }
  }
  return { width, height, rgba };
}

function largestChannelDifference(a: Uint8Array, b: Uint8Array): number {
  let largest = 0;
  for (let i = 0; i < a.length; i++) {
    largest = Math.max(largest, Math.abs(a[i] - b[i]));
  }
  return largest;
}

describe('extension icons', () => {
  it.each(SIZES)('public/icon/%i.png has the width and height of its name', (size) => {
    const committed = decodePng(readFileSync(join(ICON_DIR, `${size}.png`)));
    expect({ width: committed.width, height: committed.height }).toEqual({
      width: size,
      height: size,
    });
  });

  it.each(SIZES)(
    'public/icon/%i.png matches a fresh render of its SVG (run `npm run icons`)',
    (size) => {
      const committed = decodePng(readFileSync(join(ICON_DIR, `${size}.png`)));
      const rendered = decodePng(renderIconPng(size));
      expect(rendered.rgba).toHaveLength(committed.rgba.length);
      expect(largestChannelDifference(rendered.rgba, committed.rgba)).toBeLessThanOrEqual(
        TOLERANCE,
      );
    },
  );
});
