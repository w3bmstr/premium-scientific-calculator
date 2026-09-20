/* Formula library — physics, finance, stats, engineering */
const Formulas = {
  physics: [
    { id: 'ke', name: 'Kinetic Energy', expr: '½mv²', desc: 'Energy of motion',
      fields: [{ k: 'm', l: 'Mass (kg)' }, { k: 'v', l: 'Velocity (m/s)' }],
      calc: ({ m, v }) => 0.5 * m * v * v, unit: 'J' },
    { id: 'pe', name: 'Potential Energy', expr: 'mgh', desc: 'Gravitational PE',
      fields: [{ k: 'm', l: 'Mass (kg)' }, { k: 'g', l: 'g (m/s²)', d: 9.81 }, { k: 'h', l: 'Height (m)' }],
      calc: ({ m, g, h }) => m * g * h, unit: 'J' },
    { id: 'fma', name: 'Newton II', expr: 'F = ma', desc: 'Force',
      fields: [{ k: 'm', l: 'Mass (kg)' }, { k: 'a', l: 'Acceleration (m/s²)' }],
      calc: ({ m, a }) => m * a, unit: 'N' },
    { id: 'ohm', name: 'Ohm’s Law', expr: 'V = IR', desc: 'Voltage',
      fields: [{ k: 'i', l: 'Current (A)' }, { k: 'r', l: 'Resistance (Ω)' }],
      calc: ({ i, r }) => i * r, unit: 'V' },
    { id: 'wave', name: 'Wave Speed', expr: 'v = fλ', desc: 'Speed of a wave',
      fields: [{ k: 'f', l: 'Frequency (Hz)' }, { k: 'l', l: 'Wavelength (m)' }],
      calc: ({ f, l }) => f * l, unit: 'm/s' },
    { id: 'einstein', name: 'Mass–Energy', expr: 'E = mc²', desc: 'Rest energy',
      fields: [{ k: 'm', l: 'Mass (kg)' }],
      calc: ({ m }) => m * 299792458 * 299792458, unit: 'J' },
  ],
  finance: [
    { id: 'simple', name: 'Simple Interest', expr: 'I = Prt', desc: 'Interest only',
      fields: [{ k: 'p', l: 'Principal' }, { k: 'r', l: 'Rate (decimal)' }, { k: 't', l: 'Time (years)' }],
      calc: ({ p, r, t }) => p * r * t, unit: '' },
    { id: 'cagr', name: 'CAGR', expr: '(End/Start)^(1/n)−1', desc: 'Compound annual growth',
      fields: [{ k: 'start', l: 'Start value' }, { k: 'end', l: 'End value' }, { k: 'n', l: 'Years' }],
      calc: ({ start, end, n }) => Math.pow(end / start, 1 / n) - 1, unit: ' (×100 for %)' },
    { id: 'pv', name: 'Present Value', expr: 'FV / (1+r)^n', desc: 'Discount future cash',
      fields: [{ k: 'fv', l: 'Future value' }, { k: 'r', l: 'Rate (decimal)' }, { k: 'n', l: 'Periods' }],
      calc: ({ fv, r, n }) => fv / Math.pow(1 + r, n), unit: '' },
    { id: 'rule72', name: 'Rule of 72', expr: '72 / rate%', desc: 'Years to double',
      fields: [{ k: 'rate', l: 'Annual rate %' }],
      calc: ({ rate }) => 72 / rate, unit: ' years' },
  ],
  stats: [
    { id: 'mean', name: 'Mean (average)', expr: 'Σx / n', desc: 'Comma-separated values',
      fields: [{ k: 'vals', l: 'Values (e.g. 2,4,6,8)', type: 'text' }],
      calc: ({ vals }) => {
        const a = String(vals).split(/[,\s]+/).map(Number).filter(x => !isNaN(x));
        return a.reduce((s, x) => s + x, 0) / a.length;
      }, unit: '' },
    { id: 'stdev', name: 'Sample Std Dev', expr: 's', desc: 'Comma-separated values',
      fields: [{ k: 'vals', l: 'Values', type: 'text' }],
      calc: ({ vals }) => {
        const a = String(vals).split(/[,\s]+/).map(Number).filter(x => !isNaN(x));
        const m = a.reduce((s, x) => s + x, 0) / a.length;
        const v = a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1);
        return Math.sqrt(v);
      }, unit: '' },
    { id: 'zscore', name: 'Z-Score', expr: '(x−μ)/σ', desc: 'Standard score',
      fields: [{ k: 'x', l: 'Value x' }, { k: 'mu', l: 'Mean μ' }, { k: 'sigma', l: 'Std dev σ' }],
      calc: ({ x, mu, sigma }) => (x - mu) / sigma, unit: '' },
    { id: 'pct', name: 'Percentile rank', expr: 'approx', desc: 'Value in list',
      fields: [{ k: 'vals', l: 'Values', type: 'text' }, { k: 'x', l: 'Target value' }],
      calc: ({ vals, x }) => {
        const a = String(vals).split(/[,\s]+/).map(Number).filter(v => !isNaN(v)).sort((p, q) => p - q);
        const below = a.filter(v => v < x).length;
        return (below / a.length) * 100;
      }, unit: '%' },
  ],
  engineering: [
    { id: 'stress', name: 'Stress', expr: 'σ = F/A', desc: 'Force over area',
      fields: [{ k: 'f', l: 'Force (N)' }, { k: 'a', l: 'Area (m²)' }],
      calc: ({ f, a }) => f / a, unit: 'Pa' },
    { id: 'strain', name: 'Strain', expr: 'ΔL / L', desc: 'Deformation ratio',
      fields: [{ k: 'dl', l: 'ΔL (m)' }, { k: 'l', l: 'Original L (m)' }],
      calc: ({ dl, l }) => dl / l, unit: '' },
    { id: 'rpm', name: 'Angular velocity', expr: 'ω = 2πn/60', desc: 'From RPM',
      fields: [{ k: 'n', l: 'RPM' }],
      calc: ({ n }) => 2 * Math.PI * n / 60, unit: 'rad/s' },
    { id: 'beam', name: 'Simple beam stress', expr: 'σ = My/I', desc: 'Bending stress',
      fields: [{ k: 'm', l: 'Moment M (N·m)' }, { k: 'y', l: 'Distance y (m)' }, { k: 'i', l: 'I (m⁴)' }],
      calc: ({ m, y, i }) => (m * y) / i, unit: 'Pa' },
  ],

  list(cat) {
    return this[cat] || [];
  }
};
