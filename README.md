# Lumina — Precision Calculator

Premium scientific, financial, programmer, graphing, and conversion calculator with a luxury glass UI.

![Version](https://img.shields.io/badge/version-1.2-gold)

## Features

- **Basic** — arithmetic, %, memory (MC/MR/M+/M−), ANS, undo/redo
- **Scientific** — trig (DEG/RAD), hyperbolic, logs, powers, roots, factorial, π, e
- **Finance** — compound interest, loan, mortgage, ROI, P/L, tax
- **Programmer** — DEC/HEX/OCT/BIN, AND/OR/XOR/NOT, shifts
- **Graph** — up to 3 functions, zoom, roots, PNG export
- **Convert** — length, weight, temp, **live currency**, speed, time
- **Formulas** — physics, finance, stats, engineering one-taps
- **Units in expressions** — e.g. `5 km to mi`, `32 f to c`
- **Notation** — NORM / SCI / ENG / FRAC (fractions)
- **Physical constants** — c, G, h, and more
- **Undo/Redo** — full history stack
- **Export** — history as JSON or CSV
- **Design** — 12 skins, corners, density, high contrast, notation modes
- **PWA** — installable, offline cache (serve over HTTPS/localhost)

## Quick start

### Single file
Open `Lumina-Calculator.html` in any modern browser.

### Full project (PWA)
```bash
npx serve .
# or
python3 -m http.server 8080
```
Then open the URL and optionally “Install app”.

## Shortcuts

| Key | Action |
|-----|--------|
| `Enter` / `=` | Evaluate |
| `Esc` | All clear |
| `Backspace` | Delete |
| `Ctrl/Cmd+Z` | Undo |
| `Ctrl/Cmd+Y` or `Ctrl/Cmd+Shift+Z` | Redo |

## Stack

HTML · CSS · JavaScript · [math.js](https://mathjs.org) · [Chart.js](https://www.chartjs.org) · LocalStorage · Frankfurter API (currency)

## Folder structure (flat — no subfolders)

```
lumina-calculator/
├── index.html                 # main app (modular)
├── Lumina-Calculator.html     # all-in-one single file
├── style.css
├── calculator.js
├── scientific.js
├── financial.js
├── formulas.js
├── graph.js
├── storage.js
├── manifest.json
├── sw.js
├── icon-192.png
├── icon-512.png
└── README.md
```

## License

MIT — use freely.
