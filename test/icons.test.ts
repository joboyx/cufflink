/**
 * @jest-environment node
 */
/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ICON_DIR = join(__dirname, '..', 'public', 'icon');

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function pngSize(file: string): { width: number; height: number } {
  const bytes = readFileSync(join(ICON_DIR, file));
  expect([...bytes.subarray(0, 8)]).toEqual(PNG_SIGNATURE);
  expect(bytes.toString('ascii', 12, 16)).toBe('IHDR');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

describe('extension icons', () => {
  it.each([16, 32, 48, 128])('public/icon/%i.png has the width and height of its name', (size) => {
    expect(pngSize(`${size}.png`)).toEqual({ width: size, height: size });
  });
});
