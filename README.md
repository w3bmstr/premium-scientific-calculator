# Lumina — Precision Calculator

Premium multi-mode calculator: scientific, financial, programmer, graphing, conversions, and formula library.

## Features

- **CAS-style expression line** — editable, undo/redo (`Ctrl+Z` / `Ctrl+Y`), clearer errors  
- **Scientific** — DEG/RAD, complex `i`, matrices `[[1,2],[3,4]]`, d/dx, simplify, fractions, ENG/SCI  
- **Units** — e.g. `5 km to mi`, `32 f to c`  
- **Finance** — loan/mortgage **amortization tables**, balance chart, **Print/PDF** reports  
- **Graph** — multi-function, **trace**, **roots**, **extrema**, polar mode, PNG export  
- **Voice input** & **image OCR** (Tesseract CDN)  
- **Backup / restore** full state as JSON (“sync via file”)  
- **PWA** — installable, offline cache  
- **Design** — 12 skins, density, high contrast  
- **Tools catalog** — 220+ specialized calculators with search, favorites, recent, copy & send-to-calc (finance, health, math, date, home, auto, science, education, business, fun)  

## Run locally

```bash
# any static server (required for PWA / install)
npx serve .
# or
python3 -m http.server 8080
```

Open `http://localhost:8080` → use **Install app** when the browser offers it.

**Single file:** open `Lumina-Calculator.html` (no server needed for basic use).

## Tests

```bash
npm i mathjs
node tests.js
```

## GitHub Pages

1. Push this folder as the repo root (`lumina-calculator`).  
2. Settings → Pages → Deploy from `main` / root.  
3. Visit `https://<user>.github.io/<repo>/` and install as PWA (HTTPS required).

## Stack

HTML, CSS, JS · math.js · Chart.js · Tesseract.js (OCR) · LocalStorage · Frankfurter (FX)

## License

MIT
