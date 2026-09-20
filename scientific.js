/* Scientific helpers — math.js + unit-aware expressions */
const Sci = {
  // Common unit aliases → math.js unit names
  UNIT_MAP: {
    km: 'km', m: 'm', cm: 'cm', mm: 'mm', mi: 'mile', mile: 'mile', miles: 'mile',
    yd: 'yard', yard: 'yard', ft: 'foot', foot: 'foot', feet: 'foot', in: 'inch', inch: 'inch',
    kg: 'kg', g: 'g', mg: 'mg', lb: 'lbm', lbs: 'lbm', oz: 'oz',
    c: 'degC', f: 'degF', k: 'K', celsius: 'degC', fahrenheit: 'degF', kelvin: 'K',
    l: 'l', ml: 'ml', gal: 'gal', qt: 'quart',
    mph: 'mi/h', kph: 'km/h', 'km/h': 'km/h', 'm/s': 'm/s', knot: 'knot',
    s: 's', sec: 's', min: 'minute', h: 'hour', hr: 'hour', d: 'day', day: 'day',
    j: 'J', kj: 'kJ', cal: 'cal', w: 'W', kw: 'kW',
    pa: 'Pa', kpa: 'kPa', bar: 'bar', psi: 'psi',
    n: 'N',
  },

  normalizeUnits(expr) {
    let e = String(expr);
    // "5 km to mi" / "5km to miles" / "32 f to c"
    e = e.replace(/(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*([a-zA-Z°µ/%²³]+)\s+to\s+([a-zA-Z°µ/%²³]+)/gi,
      (_, num, from, to) => {
        const f = this.resolveUnit(from);
        const t = this.resolveUnit(to);
        return `unit(${num} ${f}, ${t})`;
      });
    // "5 km in mi"
    e = e.replace(/(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*([a-zA-Z°µ/%²³]+)\s+in\s+([a-zA-Z°µ/%²³]+)/gi,
      (_, num, from, to) => {
        const f = this.resolveUnit(from);
        const t = this.resolveUnit(to);
        return `unit(${num} ${f}, ${t})`;
      });
    return e;
  },

  resolveUnit(u) {
    const key = String(u).toLowerCase().replace(/°/g, '');
    return this.UNIT_MAP[key] || u;
  },

  eval(expr) {
    try {
      let e = String(expr)
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/π/g, 'pi')
        .replace(/\bANS\b/gi, 'ans');

      e = this.normalizeUnits(e);

      const scope = {
        pi: Math.PI,
        e: Math.E,
        ans: (typeof window !== 'undefined' && window.__luminaAns) || 0,
        // unit(valueWithUnit, targetUnit) helper
        unit: (value, target) => {
          try {
            if (value && typeof value.to === 'function') {
              return value.to(target).toNumber();
            }
            // value may already be a number if math parsed differently
            return Number(value);
          } catch {
            return NaN;
          }
        }
      };

      // Prefer math.js unit conversion when expression looks like "5 km to mi"
      // After normalize: unit(5 km, mile) — math.evaluate needs proper unit syntax
      e = e.replace(/unit\(([^,]+),\s*([^)]+)\)/g, (_, val, target) => {
        // Use math.evaluate on the unit expression directly
        try {
          const v = math.evaluate(val.trim());
          if (v && typeof v.to === 'function') {
            return String(v.to(target.trim()).toNumber());
          }
        } catch (_) {}
        return `unit(${val}, ${target})`;
      });

      const result = math.evaluate(e, scope);
      if (result && typeof result.toNumber === 'function' && result.units) {
        // Leave pure unit results as numbers in base if possible
        try { return result.toNumber(); } catch { return Number(result); }
      }
      if (typeof result === 'number' && isFinite(result)) return result;
      if (result && typeof result.toNumber === 'function') return result.toNumber();
      return Number(result);
    } catch (err) {
      return NaN;
    }
  },

  /** Evaluate and return { value, display } for unit-aware answers */
  evalDetailed(expr) {
    try {
      let e = String(expr)
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/π/g, 'pi')
        .replace(/\bANS\b/gi, 'ans');

      const unitMatch = e.match(/(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*([a-zA-Z°]+)\s+(?:to|in)\s+([a-zA-Z°]+)/i);
      if (unitMatch) {
        const num = unitMatch[1];
        const from = this.resolveUnit(unitMatch[2]);
        const to = this.resolveUnit(unitMatch[3]);
        const v = math.evaluate(`${num} ${from}`);
        const converted = v.to(to);
        const n = converted.toNumber();
        return { value: n, display: this.format(n) + ' ' + to };
      }

      const value = this.eval(expr);
      return { value, display: this.format(value) };
    } catch {
      return { value: NaN, display: 'Error' };
    }
  },

  format(n, mode = 'NORM') {
    if (n === null || n === undefined || Number.isNaN(n)) return 'Error';
    if (!isFinite(n)) return n > 0 ? '∞' : '-∞';
    if (Object.is(n, -0)) return '0';

    if (mode === 'SCI') {
      return n.toExponential(8).replace(/\.?0+e/, 'e');
    }
    if (mode === 'ENG') {
      if (n === 0) return '0';
      const exp = Math.floor(Math.log10(Math.abs(n)) / 3) * 3;
      const m = n / Math.pow(10, exp);
      const ms = parseFloat(m.toPrecision(10));
      return ms + 'e' + exp;
    }
    if (mode === 'FRAC') {
      const fr = this.toFraction(n);
      if (fr) return fr;
    }

    if (Math.abs(n) !== 0 && (Math.abs(n) < 1e-9 || Math.abs(n) >= 1e12)) {
      return n.toExponential(8).replace(/\.?0+e/, 'e');
    }
    const s = parseFloat(n.toPrecision(14));
    return String(s);
  },

  /** Best-effort simple fraction via continued fractions */
  toFraction(x, maxDen = 10000) {
    if (!isFinite(x) || Math.abs(x) > 1e9) return null;
    const sign = x < 0 ? '-' : '';
    x = Math.abs(x);
    if (Math.abs(x - Math.round(x)) < 1e-12) return sign + String(Math.round(x));
    let a = Math.floor(x);
    let h1 = 1, k1 = 0, h = a, k = 1;
    let frac = x - a;
    for (let i = 0; i < 20; i++) {
      if (frac < 1e-15) break;
      frac = 1 / frac;
      a = Math.floor(frac);
      const h2 = h1; h1 = h; h = h2 + a * h;
      const k2 = k1; k1 = k; k = k2 + a * k;
      if (k > maxDen) break;
      if (Math.abs(x - h / k) < 1e-12) break;
      frac = frac - a;
    }
    if (k === 0) return null;
    if (k === 1) return sign + String(h);
    return sign + h + '/' + k;
  },

  CONSTANTS: {
    c: { value: 299792458, label: 'c (speed of light m/s)' },
    G: { value: 6.6743e-11, label: 'G (gravity)' },
    h: { value: 6.62607015e-34, label: 'h (Planck)' },
    k: { value: 1.380649e-23, label: 'k (Boltzmann)' },
    NA: { value: 6.02214076e23, label: 'NA (Avogadro)' },
    e0: { value: 8.8541878128e-12, label: 'ε₀' },
    me: { value: 9.1093837e-31, label: 'me (electron mass)' },
    mp: { value: 1.67262192e-27, label: 'mp (proton mass)' },
    R: { value: 8.314462618, label: 'R (gas constant)' },
    g: { value: 9.80665, label: 'g (gravity m/s²)' },
  },


  factorial(n) {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n > 170) return Infinity;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  },

  toRad(val, mode) {
    return mode === 'DEG' ? (val * Math.PI) / 180 : val;
  },

  fromRad(val, mode) {
    return mode === 'DEG' ? (val * 180) / Math.PI : val;
  }
};
