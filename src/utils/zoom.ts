import { ZoomLevel } from '../types';

/**
 * The whole interface is authored in `rem` sized Tailwind utilities, so scaling
 * the root font size scales the entire app exactly like the browser's own zoom
 * (Ctrl + / Ctrl -). These constants describe the layout the design is built on.
 */

/** Root font size (px) the design is authored against. */
export const BASE_FONT_SIZE = 16;

/** Widest content container (`max-w-5xl` = 64rem) in px. */
export const BASE_CONTENT_WIDTH = 1024;

/** Height (px) the full test screen needs at 100% (test card + virtual keyboard). */
export const BASE_CONTENT_HEIGHT = 760;

/** Breathing room kept on both sides of the window, in px at 100%. */
export const WINDOW_GUTTER = 48;

/** Share of the window height the interface is allowed to occupy. */
export const VERTICAL_FILL_RATIO = 0.97;

export const MIN_ZOOM_SCALE = 1;
export const MAX_ZOOM_SCALE = 1.5;

export interface ZoomPreset {
  value: ZoomLevel;
  label: string;
}

export const ZOOM_PRESETS: ZoomPreset[] = [
  { value: 'auto', label: 'Auto' },
  { value: 100, label: '100%' },
  { value: 110, label: '110%' },
  { value: 125, label: '125%' },
  { value: 150, label: '150%' },
  { value: 175, label: '175%' },
  { value: 200, label: '200%' },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Largest scale at which the interface still fits inside the window, so the test
 * fills the screen instead of sitting tiny in the middle of a large monitor.
 * Never scales below 100% - smaller windows keep today's layout untouched.
 */
export const computeFitScale = (viewportWidth: number, viewportHeight: number): number => {
  if (!viewportWidth || !viewportHeight) return MIN_ZOOM_SCALE;

  const widthFit = (viewportWidth - WINDOW_GUTTER) / BASE_CONTENT_WIDTH;
  const heightFit = (viewportHeight * VERTICAL_FILL_RATIO) / BASE_CONTENT_HEIGHT;

  return clamp(Math.min(widthFit, heightFit), MIN_ZOOM_SCALE, MAX_ZOOM_SCALE);
};

/** Effective scale for the saved zoom preference (a multiplier, e.g. 1.25 = 125%). */
export const resolveZoomScale = (
  zoom: ZoomLevel,
  viewportWidth: number,
  viewportHeight: number
): number => {
  if (zoom === 'auto') return computeFitScale(viewportWidth, viewportHeight);
  return clamp(zoom / 100, 0.5, 3);
};
