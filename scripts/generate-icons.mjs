/**
 * Writes the extension icons to `public/icon/` from the SVG logo in `assets/`.
 *
 * The render code and the size → SVG map are in `scripts/render-icons.cjs`, which the icon
 * test also uses to check that the committed PNGs match the SVGs.
 *
 * Run `npm run icons` after a change to either SVG, and commit the PNGs.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ICON_SOURCES, renderIconPng } from './render-icons.cjs';

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icon');

mkdirSync(OUT_DIR, { recursive: true });
for (const size of Object.keys(ICON_SOURCES)) {
  writeFileSync(join(OUT_DIR, `${size}.png`), renderIconPng(Number(size)));
}
