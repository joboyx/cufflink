/**
 * Icon size in pixels → the SVG file in `assets/` that it renders from.
 */
export declare const ICON_SOURCES: Readonly<Record<16 | 32 | 48 | 128, string>>;

/**
 * Renders the icon of one size to a square PNG (8-bit RGBA).
 */
export declare function renderIconPng(size: number): Buffer;
