/* Function plotter using Chart.js — multi-function + roots */
const Graph = {
  chart: null,
  range: 10,
  colors: ['#c9a227', '#3dbbff', '#34d399'],
  lastFns: ['sin(x)'],

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
        animation: { duration: 280 },
        interaction: { mode: 'index', intersect: false },
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
          legend: {
            display: true,
            labels: { color: '#8a8780', boxWidth: 12, font: { size: 11 } }
          },
          tooltip: {
            backgroundColor: '#1c1c20',
            titleColor: '#c9a227',
            bodyColor: '#f2f0ea',
            borderColor: 'rgba(201,162,39,0.3)',
            borderWidth: 1
          }
        }
      }
    });
  },

  sample(fnStr) {
    const points = [];
    const step = (this.range * 2) / 500;
    for (let x = -this.range; x <= this.range; x += step) {
      try {
        const y = math.evaluate(fnStr, { x, pi: Math.PI, e: Math.E });
        const yn = typeof y === 'number' ? y : (y?.toNumber?.() ?? NaN);
        if (isFinite(yn) && Math.abs(yn) < 1e7) points.push({ x, y: yn });
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
      data: this.sample(fn),
      borderColor: this.colors[i % this.colors.length],
      backgroundColor: this.colors[i % this.colors.length] + '14',
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.05,
      fill: i === 0
    }));
    this.chart.options.scales.x.min = -this.range;
    this.chart.options.scales.x.max = this.range;
    this.chart.update();
    this.updateMeta();
  },

  findRoots(fnStr, samples = 800) {
    const roots = [];
    const step = (this.range * 2) / samples;
    let prevX = -this.range;
    let prevY = null;
    for (let x = -this.range; x <= this.range; x += step) {
      let y;
      try {
        y = math.evaluate(fnStr, { x, pi: Math.PI, e: Math.E });
        y = typeof y === 'number' ? y : (y?.toNumber?.() ?? NaN);
      } catch { y = NaN; }
      if (prevY !== null && isFinite(prevY) && isFinite(y)) {
        if (prevY === 0) roots.push(prevX);
        else if (prevY * y < 0) {
          // linear interpolate
          const r = prevX - prevY * (x - prevX) / (y - prevY);
          roots.push(r);
        }
      }
      prevX = x;
      prevY = y;
    }
    // unique-ish
    const uniq = [];
    roots.forEach(r => {
      if (!uniq.some(u => Math.abs(u - r) < step * 2)) uniq.push(r);
    });
    return uniq.slice(0, 12);
  },

  updateMeta(extra = '') {
    const el = document.getElementById('graphMeta');
    if (!el) return;
    el.textContent = extra || `Range ±${this.range.toFixed(1)} · ${this.lastFns.length} function(s)`;
  },

  showRoots() {
    const fn = this.lastFns[0];
    if (!fn) return;
    const roots = this.findRoots(fn);
    const txt = roots.length
      ? `Roots of ${fn}: ${roots.map(r => r.toFixed(4)).join(', ')}`
      : `No roots found for ${fn} in ±${this.range}`;
    this.updateMeta(txt);
    return roots;
  },

  zoomIn() {
    this.range = Math.max(0.5, this.range * 0.7);
    this.plot(...this.lastFns);
  },
  zoomOut() {
    this.range = Math.min(200, this.range * 1.4);
    this.plot(...this.lastFns);
  },
  reset() {
    this.range = 10;
    this.plot(...this.lastFns);
  },
  save() {
    if (!this.chart) return;
    const link = document.createElement('a');
    link.download = `lumina-graph-${Date.now()}.png`;
    link.href = this.chart.toBase64Image();
    link.click();
  }
};
