/* Function plotter — multi-fn, roots, extrema, trace */
const Graph = {
  chart: null,
  range: 10,
  colors: ['#c9a227', '#3dbbff', '#34d399'],
  lastFns: ['sin(x)'],
  mode: 'cartesian', // cartesian | polar
  traceX: null,

  init(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',
      data: { datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 200 },
        interaction: { mode: 'nearest', intersect: false, axis: 'x' },
        onHover: (evt, els) => {
          if (!els.length || !this.chart) return;
          const x = this.chart.scales.x.getValueForPixel(evt.x);
          if (isFinite(x)) {
            this.traceX = x;
            this.updateMeta(this.traceInfo(x));
          }
        },
        scales: {
          x: {
            type: 'linear',
            title: { display: true, text: 'x', color: '#8a8780' },
            grid: { color: 'rgba(128,128,128,0.12)' },
            ticks: { color: '#8a8780' }
          },
          y: {
            title: { display: true, text: 'y', color: '#8a8780' },
            grid: { color: 'rgba(128,128,128,0.12)' },
            ticks: { color: '#8a8780' }
          }
        },
        plugins: {
          legend: { display: true, labels: { color: '#8a8780', boxWidth: 12, font: { size: 11 } } },
          tooltip: {
            backgroundColor: '#1c1c20',
            titleColor: '#c9a227',
            bodyColor: '#f2f0ea',
            borderColor: 'rgba(201,162,39,0.3)',
            borderWidth: 1,
            callbacks: {
              title: (items) => items[0] ? 'x = ' + Number(items[0].parsed.x).toFixed(4) : '',
              label: (item) => item.dataset.label + ' = ' + Number(item.parsed.y).toFixed(6)
            }
          }
        }
      }
    });
  },

  evalY(fnStr, x) {
    try {
      const y = math.evaluate(fnStr, { x, pi: Math.PI, e: Math.E, i: math.complex(0, 1) });
      if (typeof y === 'number') return y;
      if (y && typeof y.re === 'number') return y.re; // plot real part of complex
      if (y && typeof y.toNumber === 'function') return y.toNumber();
      return NaN;
    } catch { return NaN; }
  },

  sample(fnStr) {
    const points = [];
    const step = (this.range * 2) / 500;
    for (let x = -this.range; x <= this.range; x += step) {
      const yn = this.evalY(fnStr, x);
      if (isFinite(yn) && Math.abs(yn) < 1e7) points.push({ x, y: yn });
    }
    return points;
  },

  samplePolar(fnStr) {
    // r = f(theta), plot as x=r cos θ, y=r sin θ
    const points = [];
    for (let t = 0; t <= Math.PI * 2; t += 0.02) {
      try {
        const r = this.evalY(fnStr.replace(/\bt\b/g, 'x').replace(/\btheta\b/g, 'x'), t);
        if (isFinite(r)) points.push({ x: r * Math.cos(t), y: r * Math.sin(t) });
      } catch { /* skip */ }
    }
    return points;
  },

  plot(fnStr, fn2, fn3) {
    if (!this.chart) return;
    const fns = [fnStr, fn2, fn3].map(s => (s || '').trim()).filter(Boolean);
    if (!fns.length) fns.push('sin(x)');
    this.lastFns = fns;
    this.chart.data.datasets = fns.map((fn, i) => ({
      label: fn,
      data: this.mode === 'polar' ? this.samplePolar(fn) : this.sample(fn),
      borderColor: this.colors[i % this.colors.length],
      backgroundColor: this.colors[i % this.colors.length] + '14',
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.05,
      fill: i === 0 && this.mode !== 'polar'
    }));
    if (this.mode === 'cartesian') {
      this.chart.options.scales.x.min = -this.range;
      this.chart.options.scales.x.max = this.range;
    } else {
      delete this.chart.options.scales.x.min;
      delete this.chart.options.scales.x.max;
    }
    this.chart.update();
    this.updateMeta();
  },

  findRoots(fnStr, samples = 800) {
    const roots = [];
    const step = (this.range * 2) / samples;
    let prevX = -this.range, prevY = null;
    for (let x = -this.range; x <= this.range; x += step) {
      const y = this.evalY(fnStr, x);
      if (prevY !== null && isFinite(prevY) && isFinite(y)) {
        if (prevY === 0) roots.push(prevX);
        else if (prevY * y < 0) roots.push(prevX - prevY * (x - prevX) / (y - prevY));
      }
      prevX = x; prevY = y;
    }
    const uniq = [];
    roots.forEach(r => { if (!uniq.some(u => Math.abs(u - r) < step * 2)) uniq.push(r); });
    return uniq.slice(0, 12);
  },

  /** Local min/max via derivative sign change (numeric) */
  findExtrema(fnStr, samples = 600) {
    const mins = [], maxs = [];
    const step = (this.range * 2) / samples;
    let prevD = null, prevX = -this.range;
    for (let x = -this.range + step; x <= this.range; x += step) {
      const y1 = this.evalY(fnStr, x - step);
      const y2 = this.evalY(fnStr, x);
      if (!isFinite(y1) || !isFinite(y2)) { prevD = null; continue; }
      const d = (y2 - y1) / step;
      if (prevD !== null && isFinite(prevD)) {
        if (prevD > 0 && d < 0) maxs.push({ x: prevX, y: this.evalY(fnStr, prevX) });
        if (prevD < 0 && d > 0) mins.push({ x: prevX, y: this.evalY(fnStr, prevX) });
      }
      prevD = d; prevX = x;
    }
    return { mins: mins.slice(0, 8), maxs: maxs.slice(0, 8) };
  },

  traceInfo(x) {
    if (!this.lastFns.length) return '';
    const parts = this.lastFns.map(fn => {
      const y = this.evalY(fn, x);
      return isFinite(y) ? `${fn}=${y.toFixed(5)}` : `${fn}=—`;
    });
    return `Trace x=${x.toFixed(4)} · ${parts.join(' · ')}`;
  },

  showRoots() {
    const fn = this.lastFns[0];
    if (!fn) return [];
    const roots = this.findRoots(fn);
    this.updateMeta(roots.length
      ? `Roots of ${fn}: ${roots.map(r => r.toFixed(4)).join(', ')}`
      : `No roots for ${fn} in ±${this.range}`);
    return roots;
  },

  showExtrema() {
    const fn = this.lastFns[0];
    if (!fn) return;
    const { mins, maxs } = this.findExtrema(fn);
    const fmt = (arr, label) => arr.length
      ? `${label}: ${arr.map(p => `(${p.x.toFixed(3)}, ${p.y.toFixed(3)})`).join(' ')}`
      : `${label}: none`;
    this.updateMeta(`${fn} · ${fmt(maxs, 'Max')} · ${fmt(mins, 'Min')}`);
  },

  updateMeta(extra = '') {
    const el = document.getElementById('graphMeta');
    if (!el) return;
    el.textContent = extra || `Range ±${this.range.toFixed(1)} · ${this.lastFns.length} fn · ${this.mode}`;
  },

  zoomIn() { this.range = Math.max(0.5, this.range * 0.7); this.plot(...this.lastFns); },
  zoomOut() { this.range = Math.min(200, this.range * 1.4); this.plot(...this.lastFns); },
  reset() { this.range = 10; this.plot(...this.lastFns); },
  save() {
    if (!this.chart) return;
    const a = document.createElement('a');
    a.download = `lumina-graph-${Date.now()}.png`;
    a.href = this.chart.toBase64Image();
    a.click();
  },
  setMode(m) {
    this.mode = m === 'polar' ? 'polar' : 'cartesian';
    this.plot(...this.lastFns);
  }
};
