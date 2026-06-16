---
name: quotes-maker
description: "Generate beautiful quote images for social media. Use when the user wants to create, design, or export quote graphics with backgrounds, text alignment, and watermark. Handles all styling decisions interactively — asks the user about fonts, colors, and layout preferences."
version: 1.0.0
author: The Aetheris
license: MIT
platforms: [macos]
metadata:
  hermes:
    tags: [quotes, image, generator, social-media, creative, content]
    related_skills: []
---

# Quotes Maker

Generate beautiful quote images (1080×1080 @ 2x = 2160×2160px PNG) for social media. The tool lives at `~/development/quotes-maker/` and runs as a Node.js CLI.

## When to Use

- User wants to create a quote image / quote card
- User wants to generate social media content from a quote, saying, or phrase
- User says "buat quote", "generate quote image", "quote card", "buat quotes"

## ⚠️ Important: Always Ask the User

**This skill is designed for non-technical users.** Before generating, you MUST ask the user about their preferences using the `clarify` tool. Ask these questions (combine into ONE `clarify` call with multiple choices where possible):

### Required Question: Quote Text
If the user hasn't provided the quote text yet, ask for it first.

### Style Questions (ask via `clarify`)

Ask the user to choose from these options. Present them as a single multi-part question or sequential questions:

**1. Background Style**
Ask the user to pick:
- **Dark elegant** — `#1a1a2e` (solid dark navy)
- **Dark gradient** — `#0f0c29,#302b63,#24243e` (3-color dark purple gradient)
- **Warm gradient** — `#ff6b6b,#feca57,#ff9ff3` (warm pink-yellow radial)
- **Custom** — ask for hex color(s)

**2. Font Choice**
Ask the user to pick a vibe:
- **Clean & modern** → `Helvetica` (default)
- **Elegant serif** → `Georgia`
- **Classic editorial** → `Times`
- **Rounded friendly** → `Avenir Next`
- **Monospace tech** → `Menlo`

**3. Text Alignment** (how text sits in the image)
- **Center** (default — most common for quotes)
- **Left** (modern editorial feel)
- **Right** (unconventional, artistic)

**4. Watermark**
Ask: "Mau ada watermark/caption kecil di bawah? (contoh: nama brand, username)" — if yes, get the text.

**5. Font Style**
- **Bold** (default — strong impact)
- **Normal** (cleaner, lighter)
- **Italic** (elegant, literary feel)

### Simplified Flow for Frequent Users

If the user says "quick mode" or "default aja" or seems impatient, skip all questions and use defaults:
- Background: dark gradient `#0f0c29,#302b63,#24243e`
- Font: Helvetica Bold
- Align: center
- Watermark: none (unless they've mentioned one before)

## How to Generate

### Command Pattern

```bash
cd ~/development/quotes-maker && node src/cli.js \
  -t "QUOTE_TEXT_HERE" \
  --bg-gradient "#0f0c29,#302b63,#24243e" \
  --align center \
  --font Helvetica \
  --font-style bold \
  --font-size 56 \
  -w "WATERMARK_TEXT" \
  -o "OUTPUT_PATH"
```

### Quick Reference — All Options

| Flag | Short | What it does | Example |
|---|---|---|---|
| `--text` | `-t` | The quote text | `-t "Stay hungry, stay foolish"` |
| `--bg-color` | | Solid background (hex) | `--bg-color "#1a1a2e"` |
| `--bg-gradient` | | Gradient bg (comma-sep hex) | `--bg-gradient "#0f0c29,#302b63"` |
| `--bg-gradient-type` | | `linear` (default) or `radial` | `--bg-gradient-type radial` |
| `--align` | | Text align: `left`/`center`/`right` | `--align left` |
| `--position` | | Text block: `left`/`center`/`right` | `--position left` |
| `--font` | | Font family name | `--font Georgia` |
| `--font-style` | | `bold`/`normal`/`italic` | `--font-style italic` |
| `--font-size` | | Size in px (default: 56) | `--font-size 64` |
| `--line-height` | | Line spacing (default: 1.4) | `--line-height 1.6` |
| `--text-color` | | Override auto text color | `--text-color "#ffd700"` |
| `--watermark` | `-w` | Small caption at bottom | `-w "Naaza"` |
| `--output` | `-o` | Output dir or filepath | `-o ~/Pictures/quotes/` |
| `--filename` | | Custom filename | `--filename my-quote` |
| `--padding` | | Edge padding (default: 120) | `--padding 160` |
| `--pixel-ratio` | | Resolution multiplier | `--pixel-ratio 3` |
| `--help` | `-h` | Show all options | |

### Available Fonts (macOS System)

All tested and working:
- `Helvetica` — clean sans-serif (default)
- `Arial` — universal sans-serif
- `Georgia` — elegant serif
- `Times` — classic newspaper serif
- `Palatino` — warm readable serif
- `Optima` — elegant display serif
- `Avenir` / `Avenir Next` — rounded modern sans
- `Courier` — typewriter mono
- `Menlo` — code/tech mono
- `SF Pro` — Apple system font
- `New York` — Apple serif

### Output

Default output: `~/Pictures/quotes/quote-YYYYMMDD-HHMMSS.png`
Custom: pass `-o /path/to/dir/` or `-o /full/path/to/file.png`

The generated image is **2160×2160px** (2x retina of 1080×1080 base canvas) — perfect for Instagram, Twitter, Facebook.

## Delivering the Image to the User

After generating, ALWAYS deliver the image to the user by including in your response:

```
MEDIA:/Users/athallarizky/Pictures/quotes/quote-XXXXXXXX-XXXXXX.png
```

Use the actual output path from the CLI output. The image will be sent as a native photo in the chat.

## Common Pitfalls

1. **Missing quote text** — Always ensure you have the quote before running. If user says "buat quote tentang X", ask them for the exact text, don't make one up.

2. **Gradient too subtle** — If using custom gradient colors that are very close (e.g., `#1a1a2e,#16213e`), the gradient won't be visible. Use colors with more contrast.

3. **Font not found** — If a font name is wrong, skia-canvas silently falls back to a default. Stick to the fonts listed above.

4. **Long quotes** — Very long quotes may overflow. The tool auto-wraps text, but if a quote is extremely long, suggest increasing `--padding` or decreasing `--font-size`.

5. **Output path doesn't exist** — The tool creates directories automatically, so this shouldn't fail. But always verify the output path in the CLI result.

6. **Always verify the image** — After generating, send the image to the user (via `MEDIA:`) so they can confirm it looks right before posting.

## Verification Checklist

- [ ] Quote text is correct and complete
- [ ] Background style matches user preference
- [ ] Font and alignment match user choice
- [ ] Watermark text is correct (if requested)
- [ ] Image delivered to user via `MEDIA:` path
- [ ] User confirmed the result looks good

## Examples

### Example 1: Default dark gradient, centered
```bash
cd ~/development/quotes-maker && node src/cli.js \
  -t "The secret of getting ahead is getting started." \
  --bg-gradient "#0f0c29,#302b63,#24243e" \
  -w "Naaza"
```

### Example 2: Elegant serif, left-aligned
```bash
cd ~/development/quotes-maker && node src/cli.js \
  -t "Simplicity is the ultimate sophistication." \
  --bg-gradient "#0f0c29,#302b63,#24243e" \
  --align left \
  --font Georgia \
  --font-style italic \
  --font-size 52
```

### Example 3: Solid background, bold and clean
```bash
cd ~/development/quotes-maker && node src/cli.js \
  -t "Done is better than perfect." \
  --bg-color "#2d3436" \
  --align center \
  --font "Avenir Next" \
  --font-style bold \
  --font-size 64
```
