/* Scientific helpers — math.js, units, fractions, complex, matrices */
const Sci = {
  UNIT_MAP: {
    km: 'km', m: 'm', cm: 'cm', mm: 'mm', mi: 'mile', mile: 'mile', miles: 'mile',
    yd: 'yard', ft: 'foot', foot: 'foot', feet: 'foot', in: 'inch', inch: 'inch',
    kg: 'kg', g: 'g', mg: 'mg', lb: 'lbm', lbs: 'lbm', oz: 'oz',
    c: 'degC', f: 'degF', k: 'K', celsius: 'degC', fahrenheit: 'degF', kelvin: 'K',
    l: 'l', ml: 'ml', gal: 'gal',
    mph: 'mi/h', kph: 'km/h', 'km/h': 'km/h', 'm/s': 'm/s', knot: 'knot',
    s: 's', min: 'minute', h: 'hour', hr: 'hour', d: 'day',
    j: 'J', w: 'W', pa: 'Pa', n: 'N',
  },

  lastError: null,

  resolveUnit(u) {
    return this.UNIT_MAP[String(u).toLowerCase().replace(/°/g, '')] || u;
  },

  normalizeUnits(expr) {
    let e = String(expr);
    e = e.replace(/(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*([a-zA-Z°]+)\s+(?:to|in)\s+([a-zA-Z°]+)/gi,
      (_, num, from, to) => `unit(${num} ${this.resolveUnit(from)}, ${this.resolveUnit(to)})`);
    return e;
  },

  /** Parse matrix syntax [[1,2],[3,4]] or [1,2;3,4] */
  normalizeMatrix(expr) {
    return String(expr).replace(/\[([^\[\]]+);([^\]]+)\]/g, (_, a, b) => {
      const row = (s) => '[' + s.split(/[, ]+/).filter(Boolean).join(',') + ']';
      return '[' + row(a) + ',' + row(b) + ']';
    });
  },

  eval(expr) {
    this.lastError = null;
    try {
      let e = String(expr)
        .replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
        .replace(/π/g, 'pi').replace(/\bANS\b/gi, 'ans')
        .replace(/\bi\b/g, 'i');
      e = this.normalizeUnits(e);
      e = this.normalizeMatrix(e);

      e = e.replace(/unit\(([^,]+),\s*([^)]+)\)/g, (_, val, target) => {
        try {
          const v = math.evaluate(val.trim());
          if (v && typeof v.to === 'function') return String(v.to(target.trim()).toNumber());
        } catch (_) {}
        return `unit(${val}, ${target})`;
      });

      const scope = {
        pi: Math.PI,
        e: Math.E,
        i: math.complex(0, 1),
        ans: (typeof window !== 'undefined' && window.__luminaAns) || 0,
        unit: (value, target) => {
          try {
            if (value && typeof value.to === 'function') return value.to(target).toNumber();
            return Number(value);
          } catch { return NaN; }
        }
      };

      const result = math.evaluate(e, scope);
      return result;
    } catch (err) {
      this.lastError = err.message || String(err);
      return NaN;
    }
  },

  toDisplayNumber(result) {
    if (result === null || result === undefined) return { value: NaN, display: 'Error' };
    if (typeof result === 'number') {
      return { value: result, display: this.format(result) };
    }
    // Complex
    if (result && typeof result.re === 'number' && typeof result.im === 'number') {
      const re = result.re, im = result.im;
      let display;
      if (Math.abs(im) < 1e-12) display = this.format(re);
      else if (Math.abs(re) < 1e-12) display = this.format(im) + 'i';
      else display = this.format(re) + (im >= 0 ? '+' : '') + this.format(im) + 'i';
      return { value: re, display, complex: result };
    }
    // Matrix / array
    if (result && (result.isMatrix || Array.isArray(result))) {
      try {
        const arr = result.toArray ? result.toArray() : result;
        return { value: NaN, display: math.format(arr, { precision: 8 }), matrix: true };
      } catch {
        return { value: NaN, display: String(result) };
      }
    }
    if (result && typeof result.toNumber === 'function') {
      try {
        const n = result.toNumber();
        return { value: n, display: this.format(n) };
      } catch {
        return { value: NaN, display: math.format(result) };
      }
    }
    const n = Number(result);
    return { value: n, display: this.format(n) };
  },

  evalDetailed(expr) {
    try {
      const unitMatch = String(expr).match(/(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*([a-zA-Z°]+)\s+(?:to|in)\s+([a-zA-Z°]+)/i);
      if (unitMatch) {
        const from = this.resolveUnit(unitMatch[2]);
        const to = this.resolveUnit(unitMatch[3]);
        const v = math.evaluate(`${unitMatch[1]} ${from}`);
        const n = v.to(to).toNumber();
        return { value: n, display: this.format(n) + ' ' + to };
      }
      const raw = this.eval(expr);
      if (raw !== raw && this.lastError) {
        return { value: NaN, display: 'Error', error: this.lastError };
      }
      return this.toDisplayNumber(raw);
    } catch (e) {
      this.lastError = e.message;
      return { value: NaN, display: 'Error', error: e.message };
    }
  },

  format(n, mode = 'NORM') {
    if (n === null || n === undefined || Number.isNaN(n)) return 'Error';
    if (!isFinite(n)) return n > 0 ? '∞' : '-∞';
    if (Object.is(n, -0)) return '0';
    if (mode === 'SCI') return n.toExponential(8).replace(/\.?0+e/, 'e');
    if (mode === 'ENG') {
      if (n === 0) return '0';
      const exp = Math.floor(Math.log10(Math.abs(n)) / 3) * 3;
      return parseFloat((n / Math.pow(10, exp)).toPrecision(10)) + 'e' + exp;
    }
    if (mode === 'FRAC') {
      const fr = this.toFraction(n);
      if (fr) return fr;
    }
    if (Math.abs(n) !== 0 && (Math.abs(n) < 1e-9 || Math.abs(n) >= 1e12)) {
      return n.toExponential(8).replace(/\.?0+e/, 'e');
    }
    return String(parseFloat(n.toPrecision(14)));
  },

  toFraction(x, maxDen = 10000) {
    if (!isFinite(x) || Math.abs(x) > 1e9) return null;
    const sign = x < 0 ? '-' : '';
    x = Math.abs(x);
    if (Math.abs(x - Math.round(x)) < 1e-12) return sign + String(Math.round(x));
    let a = Math.floor(x), h1 = 1, k1 = 0, h = a, k = 1, frac = x - a;
    for (let i = 0; i < 20; i++) {
      if (frac < 1e-15) break;
      frac = 1 / frac; a = Math.floor(frac);
      const h2 = h1; h1 = h; h = h2 + a * h;
      const k2 = k1; k1 = k; k = k2 + a * k;
      if (k > maxDen) break;
      if (Math.abs(x - h / k) < 1e-12) break;
      frac -= a;
    }
    if (k === 0) return null;
    if (k === 1) return sign + String(h);
    return sign + h + '/' + k;
  },

  factorial(n) {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n > 170) return Infinity;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  },

  toRad(val, mode) { return mode === 'DEG' ? (val * Math.PI) / 180 : val; },
  fromRad(val, mode) { return mode === 'DEG' ? (val * 180) / Math.PI : val; },

  CONSTANTS: {
    c: { value: 299792458, label: 'c (speed of light)' },
    G: { value: 6.6743e-11, label: 'G (gravity)' },
    h: { value: 6.62607015e-34, label: 'h (Planck)' },
    k: { value: 1.380649e-23, label: 'k (Boltzmann)' },
    NA: { value: 6.02214076e23, label: 'NA (Avogadro)' },
    e0: { value: 8.8541878128e-12, label: 'ε₀' },
    me: { value: 9.1093837e-31, label: 'me' },
    mp: { value: 1.67262192e-27, label: 'mp' },
    R: { value: 8.314462618, label: 'R (gas)' },
    g: { value: 9.80665, label: 'g (Earth)' },
  },

  /** Calculus helpers via math.js */
  derivative(expr, variable = 'x') {
    try {
      return math.derivative(expr, variable).toString();
    } catch (e) {
      this.lastError = e.message;
      return null;
    }
  },

  simplify(expr) {
    try {
      return math.simplify(expr).toString();
    } catch (e) {
      this.lastError = e.message;
      return null;
    }
  }
};
