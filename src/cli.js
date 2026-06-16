#!/usr/bin/env node

/**
 * Quotes Maker — CLI Interface
 *
 * Usage:
 *   node src/cli.js --text "Your quote here" [options]
 *
 * Examples:
 *   # Solid background, centered text
 *   quotes-maker --text "Stay hungry, stay foolish" --bg-color "#1a1a2e"
 *
 *   # Gradient background, left-aligned, positioned left
 *   quotes-maker -t "Code is poetry" --bg-gradient "#0f0c29,#302b63,#24243e" --align left --position left
 *
 *   # Custom font and output path
 *   quotes-maker -t "Less is more" --font "Georgia" --size 64 --output ~/Pictures/quotes/
 */

import { renderQuote, saveImage, generateFilename } from './renderer.js';
import { parseArgs } from 'node:util';
import { join } from 'node:path';
import { homedir } from 'node:os';

/** Expand ~ in file paths */
function expandPath(p) {
  if (!p) return p;
  if (p.startsWith('~/')) return join(homedir(), p.slice(2));
  if (p === '~') return homedir();
  return p;
}

// ─── Parse CLI Args ───────────────────────────────────────────

const { values, positionals } = parseArgs({
  options: {
    // Text input
    'text': { type: 'string', short: 't' },
    'text-file': { type: 'string' }, // read quote from a file

    // Background
    'bg-color': { type: 'string' },
    'bg-gradient': { type: 'string' },
    'bg-gradient-type': { type: 'string', default: 'linear' }, // linear | radial

    // Text styling
    'text-color': { type: 'string' },
    'align': { type: 'string', default: 'center' }, // left | center | right (text-align in box)
    'position': { type: 'string', default: 'center' }, // left | center | right (text block on canvas)
    'font': { type: 'string', default: 'Helvetica' },
    'font-size': { type: 'string', default: '56' }, // parsed to int below
    'font-style': { type: 'string', default: 'bold' }, // normal | bold | italic | italic bold
    'line-height': { type: 'string', default: '1.4' },

    // Layout
    'padding': { type: 'string', default: '120' },
    'size': { type: 'string', default: '1080' }, // canvas size (square)

    // Output
    'output': { type: 'string', short: 'o' },
    'filename': { type: 'string' },
    'format': { type: 'string', default: 'png' }, // png | jpeg
    'pixel-ratio': { type: 'string', default: '2' }, // export resolution multiplier

    // Watermark
    'watermark': { type: 'string', short: 'w' }, // e.g., "Xenna"

    // Meta
    'help': { type: 'boolean', short: 'h' },
    'quiet': { type: 'boolean', short: 'q' },
  },
  allowPositionals: true,
  strict: false,
});

// ─── Help ─────────────────────────────────────────────────────

if (values.help) {
  console.log(`
  🎨 Quotes Maker — Generate beautiful quote images

  USAGE
    quotes-maker --text "Your quote" [options]
    quotes-maker -t "Your quote" [options]

  BACKGROUND
    --bg-color <hex>           Solid background color (e.g., "#1a1a2e")
    --bg-gradient <hex1,hex2>  Gradient colors (e.g., "#0f0c29,#302b63")
    --bg-gradient-type <type>  "linear" (default) or "radial"

  TEXT
    --text-color <hex>         Text color (auto-contrast if not set)
    --align <type>             Text align: "left" | "center" (default) | "right"
    --position <type>          Text block position: "left" | "center" (default) | "right"
    --font <name>              Font family (default: Helvetica)
    --font-size <px>           Font size in px (default: 56)
    --font-style <style>       "normal" | "bold" (default) | "italic" | "italic bold"
    --line-height <n>          Line height multiplier (default: 1.4)

  LAYOUT
    --padding <px>             Padding from edges (default: 120)
    --size <px>                Canvas size, square (default: 1080)

  OUTPUT
    --output <path>            Output directory or full filepath
    --filename <name>          Custom filename (without extension)
    --format <type>            "png" (default) | "jpeg"
    --pixel-ratio <n>          Resolution multiplier (default: 2 = 2160×2160)

  WATERMARK
    --watermark <text>         Small caption text at bottom center (e.g., "Xenna")
    -w <text>                  Short flag for --watermark

  EXAMPLES
    # Quick solid bg
    quotes-maker -t "Stay hungry, stay foolish" --bg-color "#1a1a2e"

    # Gradient + left align + left position
    quotes-maker -t "Code is poetry" \\
      --bg-gradient "#0f0c29,#302b63,#24243e" \\
      --align left --position left \\
      --font Georgia --font-size 64

    # Output to specific path
    quotes-maker -t "Less is more" -o ~/Pictures/quote.png
  `);
  process.exit(0);
}

// ─── Resolve Text Input ───────────────────────────────────────

let text = values.text;

if (!text && values['text-file']) {
  const { readFileSync } = await import('node:fs');
  text = readFileSync(expandPath(values['text-file']), 'utf-8').trim();
}

if (!text && positionals.length > 0) {
  text = positionals.join(' ');
}

if (!text) {
  console.error('❌ Error: No text provided. Use --text "Your quote" or --text-file <path>');
  process.exit(1);
}

// ─── Resolve Output Path ──────────────────────────────────────

const defaultOutputDir = join(homedir(), 'Pictures', 'quotes');
let outputPath = values.output
  ? expandPath(values.output)
  : defaultOutputDir;

// If output doesn't end with .png/.jpg, treat as directory
const isFile = /\.(png|jpg|jpeg)$/i.test(outputPath);
let filepath;

if (isFile) {
  filepath = outputPath;
} else {
  const filename = values.filename
    ? `${values.filename}.png`
    : generateFilename();
  filepath = join(outputPath, filename);
}

// ─── Render ───────────────────────────────────────────────────

try {
  const result = renderQuote({
    text,
    bgColor: values['bg-color'],
    bgGradient: values['bg-gradient'],
    bgGradientType: values['bg-gradient-type'],
    textColor: values['text-color'],
    align: values.align,
    position: values.position,
    fontFamily: values.font,
    fontSize: parseInt(values['font-size'], 10),
    fontStyle: values['font-style'],
    lineHeight: parseFloat(values['line-height']),
    padding: parseInt(values.padding, 10),
    pixelRatio: parseInt(values['pixel-ratio'], 10),
    watermark: values.watermark || null,
  });

  saveImage(result.buffer, filepath);

  if (!values.quiet) {
    console.log(`✅ Quote image saved: ${filepath}`);
    console.log(`   Size: ${result.width}×${result.height}px (${(result.buffer.length / 1024).toFixed(0)} KB)`);
  }
} catch (err) {
  console.error(`❌ Render failed: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
}
