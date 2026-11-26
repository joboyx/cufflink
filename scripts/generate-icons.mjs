/**
 * Renders the extension icons in `public/icon/` from the SVG logo in `assets/`.
 *
 * The 16 and 32 px toolbar icons come from `assets/icon-small.svg`, a simpler drawing with a
 * thicker rim and a larger slot, so that the two links stay clear at toolbar size. The 48 and
 * 128 px icons come from the full logo, `assets/icon.svg`.
 *
 * Run `node scripts/generate-icons.mjs` after a change to either SVG, and commit the PNGs.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = join(ROOT, 'assets');
const OUT_DIR = join(ROOT, 'public', 'icon');

// Icon size in pixels → the SVG source that it renders from.
const SOURCES = {
  16: 'icon-small.svg',
  32: 'icon-small.svg',
  48: 'icon.svg',
  128: 'icon.svg',
};

/**
 * Renders one SVG file to a square PNG.
 *
 * @param {string} file SVG file name in `assets/`.
 * @param {number} size Width and height of the PNG in pixels.
 * @returns {Buffer} The PNG bytes.
 */
function renderPng(file, size) {
  const svg = readFileSync(join(ASSETS, file), 'utf8');
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  return resvg.render().asPng();
}

mkdirSync(OUT_DIR, { recursive: true });
for (const [size, file] of Object.entries(SOURCES)) {
  writeFileSync(join(OUT_DIR, `${size}.png`), renderPng(file, Number(size)));
}
