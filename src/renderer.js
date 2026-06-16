/**
 * Quotes Maker — Core Renderer
 * Handles Konva Stage composition and PNG export via skia-canvas backend.
 */

import 'konva/skia-backend';
import Konva from 'konva';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { join, dirname as pathDirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathDirname(__filename);

// ─── Constants ────────────────────────────────────────────────
const CANVAS_SIZE = 1080;
const PADDING = 120; // default padding from canvas edges

// ─── Color Utilities ──────────────────────────────────────────

/**
 * Parse hex color to {r, g, b} object.
 * @param {string} hex - e.g., "#1a1a2e" or "1a1a2e"
 * @returns {{r: number, g: number, b: number}}
 */
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

/**
 * Calculate relative luminance of a color (0-1).
 * Used to determine if text should be light or dark.
 * @param {string} hex
 * @returns {number}
 */
function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Pick contrasting text color (black or white) based on background luminance.
 * @param {string} bgColorHex
 * @returns {string} "#ffffff" or "#000000"
 */
function autoTextColor(bgColorHex) {
  return luminance(bgColorHex) > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Parse gradient string like "#1a1a2e,#16213e" into Konva color stops.
 * @param {string} gradientStr
 * @returns {Array<number|string>} Konva color stops array
 */
function parseGradientStops(gradientStr) {
  const colors = gradientStr.split(',').map((c) => c.trim());
  const stops = [];
  colors.forEach((color, i) => {
    stops.push(i / (colors.length - 1));
    stops.push(color);
  });
  return stops;
}

// ─── Position Helpers ─────────────────────────────────────────

/**
 * Calculate text block X/Y position on canvas based on --position flag.
 * @param {string} position - "left" | "center" | "right"
 * @param {number} textWidth - the bounding box width for text
 * @returns {{x: number, y: number}}
 */
function calculateTextPosition(position, textWidth) {
  const positions = {
    left: { x: PADDING, y: CANVAS_SIZE / 2 - textWidth / 2 },
    center: { x: (CANVAS_SIZE - textWidth) / 2, y: CANVAS_SIZE / 2 - textWidth / 4 },
    right: { x: CANVAS_SIZE - textWidth - PADDING, y: CANVAS_SIZE / 2 - textWidth / 2 },
  };
  return positions[position] || positions.center;
}

// ─── Main Render Function ─────────────────────────────────────

/**
 * Render a quote image and export as PNG.
 *
 * @param {Object} options
 * @param {string} options.text - The quote text
 * @param {string} [options.bgColor] - Solid background color (hex)
 * @param {string} [options.bgGradient] - Gradient colors "hex1,hex2[,hex3]"
 * @param {string} [options.bgGradientType] - "linear" | "radial" (default: linear)
 * @param {string} [options.textColor] - Text color (auto if not provided)
 * @param {string} [options.align] - Text align within box: "left" | "center" | "right"
 * @param {string} [options.position] - Text block position: "left" | "center" | "right"
 * @param {string} [options.fontFamily] - Font family name
 * @param {number} [options.fontSize] - Font size in px
 * @param {string} [options.fontStyle] - "normal" | "bold" | "italic" | "italic bold"
 * @param {number} [options.lineHeight] - Line height multiplier (default: 1.4)
 * @param {number} [options.padding] - Padding from edges (default: 120)
 * @param {number} [options.pixelRatio] - Export resolution multiplier (default: 2)
 * @returns {Promise<{buffer: Buffer, width: number, height: number}>}
 */
export function renderQuote(options) {
  const {
    text,
    bgColor,
    bgGradient,
    bgGradientType = 'linear',
    textColor,
    align = 'center',
    position = 'center',
    fontFamily = 'Helvetica',
    fontSize = 56,
    fontStyle = 'bold',
    lineHeight = 1.4,
    padding = PADDING,
    pixelRatio = 2,
    watermark = null,
  } = options;

  // Determine effective background color for text contrast
  const effectiveBgColor = bgColor || (bgGradient ? bgGradient.split(',')[0].trim() : '#1a1a2e');
  const effectiveTextColor = textColor || autoTextColor(effectiveBgColor);

  // Calculate text bounding box width (canvas width minus padding on both sides)
  const textWidth = CANVAS_SIZE - padding * 2;

  // Create stage
  const stage = new Konva.Stage({ width: CANVAS_SIZE, height: CANVAS_SIZE });
  const layer = new Konva.Layer();

  // ─── Background ────────────────────────────────────
  let bg;
  if (bgGradient) {
    const stops = parseGradientStops(bgGradient);
    if (bgGradientType === 'radial') {
      bg = new Konva.Rect({
        x: 0,
        y: 0,
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        fillRadialGradientStartPoint: { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 },
        fillRadialGradientEndPoint: { x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2, radius: CANVAS_SIZE / 1.2 },
        fillRadialGradientColorStops: stops,
      });
    } else {
      bg = new Konva.Rect({
        x: 0,
        y: 0,
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        fillLinearGradientStartPoint: { x: 0, y: 0 },
        fillLinearGradientEndPoint: { x: CANVAS_SIZE, y: CANVAS_SIZE },
        fillLinearGradientColorStops: stops,
      });
    }
  } else {
    bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      fill: effectiveBgColor,
    });
  }
  layer.add(bg);

  // ─── Quote Text ────────────────────────────────────
  const pos = calculateTextPosition(position, textWidth);

  const quoteText = new Konva.Text({
    x: pos.x,
    y: CANVAS_SIZE / 2 - 100, // rough vertical center, text height varies
    text,
    fontSize,
    fontFamily,
    fontStyle,
    fill: effectiveTextColor,
    align, // text-align within bounding box
    width: textWidth,
    lineHeight,
    wrap: 'word',
  });

  // Vertically center the text block by measuring its height
  const textHeight = quoteText.height();
  quoteText.y((CANVAS_SIZE - textHeight) / 2);

  layer.add(quoteText);

  // ─── Watermark ─────────────────────────────────────
  if (options.watermark) {
    const watermark = new Konva.Text({
      x: 0,
      y: CANVAS_SIZE - 100, // 100px from bottom
      text: options.watermark,
      fontSize: 28,
      fontFamily: fontFamily,
      fontStyle: 'normal',
      fill: effectiveTextColor,
      opacity: 0.5,
      align: 'center',
      width: CANVAS_SIZE, // full width so center actually centers
      lineHeight: 1,
    });
    layer.add(watermark);
  }
  stage.add(layer);

  // ─── Export ────────────────────────────────────────
  const dataURL = stage.toDataURL({
    mimeType: 'image/png',
    pixelRatio,
    quality: 1,
  });

  const buffer = Buffer.from(dataURL.split(',')[1], 'base64');

  // Cleanup
  stage.destroy();

  return {
    buffer,
    width: CANVAS_SIZE * pixelRatio,
    height: CANVAS_SIZE * pixelRatio,
  };
}

/**
 * Save buffer to file, creating directories if needed.
 * @param {Buffer} buffer
 * @param {string} filepath
 */
export function saveImage(buffer, filepath) {
  mkdirSync(dirname(filepath), { recursive: true });
  writeFileSync(filepath, buffer);
}

/**
 * Generate a timestamped filename.
 * @param {string} [prefix='quote']
 * @returns {string} e.g., "quote-20260616-143022.png"
 */
export function generateFilename(prefix = 'quote') {
  const now = new Date();
  const ts = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  return `${prefix}-${ts}.png`;
}
