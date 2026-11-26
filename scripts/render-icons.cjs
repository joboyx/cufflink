/**
 * Renders the extension icons from the SVG logo in `assets/`.
 *
 * `scripts/generate-icons.mjs` writes these PNGs to `public/icon/`, and `test/icons.test.ts`
 * renders them again to check that the committed PNGs match the SVGs. This is a CommonJS
 * module so that both the Node script and the Jest test can load it.
 */
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { Resvg } = require('@resvg/resvg-js');

/**
 * Folder that holds the SVG logo sources.
 */
const ASSETS_DIR = join(__dirname, '..', 'assets');

/**
 * Icon size in pixels → the SVG file in `assets/` that it renders from.
 *
 * The 16 and 32 px toolbar icons come from `icon-small.svg`, a simpler drawing that stays
 * clear at toolbar size. The 48 and 128 px icons come from the full logo, `icon.svg`.
 */
const ICON_SOURCES = Object.freeze({
  16: 'icon-small.svg',
  32: 'icon-small.svg',
  48: 'icon.svg',
  128: 'icon.svg',
});

/**
 * Renders the icon of one size to a square PNG.
 *
 * @param {number} size Width and height of the PNG in pixels; a key of `ICON_SOURCES`.
 * @returns {Buffer} The PNG bytes (8-bit RGBA).
 */
function renderIconPng(size) {
  const file = ICON_SOURCES[size];
  if (!file) {
    throw new Error(`No icon source for size ${size}`);
  }
  const svg = readFileSync(join(ASSETS_DIR, file), 'utf8');
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  return resvg.render().asPng();
}

exports.ICON_SOURCES = ICON_SOURCES;
exports.renderIconPng = renderIconPng;
