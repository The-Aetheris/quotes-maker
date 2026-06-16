# 🎨 Quotes Maker

CLI tool to generate beautiful quote images for social media. Built with KonvaJS + skia-canvas.

## Features

- **Solid & gradient backgrounds** (linear + radial)
- **Text alignment** — left / center / right (both text-align and text block position)
- **Auto text color contrast** — white on dark, black on light
- **Custom fonts** — any system font
- **Watermark** — small caption text at bottom center
- **High-res export** — 2160×2160px (2x) by default
- **Zero system dependencies** — skia-canvas ships pre-built binaries

## Install

```bash
git clone git@github.com:The-Aetheris/quotes-maker.git
cd quotes-maker
npm install
```

## Usage

```bash
# Basic solid background
node src/cli.js -t "Stay hungry, stay foolish" --bg-color "#1a1a2e"

# Gradient + watermark
node src/cli.js -t "The secret of getting ahead is getting started." \
  --bg-gradient "#0f0c29,#302b63,#24243e" \
  -w "Xenna"

# Left-aligned, positioned left
node src/cli.js -t "Code is poetry" \
  --bg-gradient "#0f0c29,#302b63,#24243e" \
  --align left --position left

# Radial gradient with custom font
node src/cli.js -t "Simplicity is the ultimate sophistication" \
  --bg-gradient "#ff6b6b,#feca57" \
  --bg-gradient-type radial \
  --font Georgia --font-style italic
```

## CLI Options

| Flag | Short | Default | Description |
|---|---|---|---|
| `--text` | `-t` | — | Quote text (required) |
| `--bg-color` | | — | Solid background color (hex) |
| `--bg-gradient` | | — | Gradient colors: `"#hex1,#hex2[,#hex3]"` |
| `--bg-gradient-type` | | `linear` | `linear` or `radial` |
| `--text-color` | | auto | Text color (auto-contrast if not set) |
| `--align` | | `center` | Text align in box: `left` \| `center` \| `right` |
| `--position` | | `center` | Text block position: `left` \| `center` \| `right` |
| `--font` | | `Helvetica` | Font family |
| `--font-size` | | `56` | Font size in px |
| `--font-style` | | `bold` | `normal` \| `bold` \| `italic` \| `italic bold` |
| `--line-height` | | `1.4` | Line height multiplier |
| `--padding` | | `120` | Padding from edges in px |
| `--watermark` | `-w` | — | Small caption at bottom center |
| `--output` | `-o` | `~/Pictures/quotes` | Output directory or filepath |
| `--filename` | | auto | Custom filename (without extension) |
| `--pixel-ratio` | | `2` | Resolution multiplier (2 = 2160×2160) |
| `--help` | `-h` | | Show help |

## Tech Stack

- **[KonvaJS](https://konvajs.org/)** — 2D canvas library (Stage → Layer → Rect + Text)
- **[skia-canvas](https://github.com/samizdatco/skia-canvas)** — Node.js canvas backend (Google Skia)
- **Node.js** — ESM modules, no browser needed

## Project Structure

```
quotes-maker/
├── src/
│   ├── cli.js          # CLI entry point (argparse, I/O)
│   └── renderer.js     # Core render logic (Konva + export)
├── output/             # Generated images (gitignored)
├── package.json
└── .gitignore
```

## License

MIT © Athalla Rizky
