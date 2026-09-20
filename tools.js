/* Lumina Tools Catalog — specialized calculators */
const Tools = {
  categories: [
    { id: 'finance', name: 'Finance' },
    { id: 'health', name: 'Health' },
    { id: 'math', name: 'Math' },
    { id: 'datetime', name: 'Date & Time' },
    { id: 'convert', name: 'Converters' },
    { id: 'home', name: 'Home & Build' },
    { id: 'auto', name: 'Auto & Travel' },
    { id: 'science', name: 'Science' },
    { id: 'edu', name: 'Education' },
    { id: 'biz', name: 'Business' },
    { id: 'life', name: 'Everyday' },
    { id: 'fun', name: 'Fun' },
  ],

  list: [],

  byCategory(cat) {
    return this.list.filter(t => t.cat === cat);
  },

  get(id) {
    return this.list.find(t => t.id === id);
  },

  register(tool) {
    this.list.push(tool);
  }
};

function num(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }
function fmt(n, d = 2) {
  if (!isFinite(n)) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: 0 });
}

/* ── Finance ── */
Tools.register({
  id: 'loan', cat: 'finance', name: 'Loan Payment',
  desc: 'Monthly payment, total interest',
  fields: [
    { k: 'amount', l: 'Loan amount', d: 25000 },
    { k: 'rate', l: 'APR %', d: 6.5 },
    { k: 'years', l: 'Years', d: 5 },
  ],
  run: ({ amount, rate, years }) => {
    const r = Finance.loan(amount, rate, years);
    if (!r) return 'Invalid inputs';
    return `Payment: $${fmt(r.payment)}/mo\nTotal: $${fmt(r.total)}\nInterest: $${fmt(r.interest)}`;
  }
});

Tools.register({
  id: 'mortgage', cat: 'finance', name: 'Mortgage',
  desc: 'Payment with down payment',
  fields: [
    { k: 'price', l: 'Home price', d: 400000 },
    { k: 'down', l: 'Down payment', d: 80000 },
    { k: 'rate', l: 'Rate %', d: 6.75 },
    { k: 'years', l: 'Years', d: 30 },
  ],
  run: ({ price, down, rate, years }) => {
    const r = Finance.mortgage(price, down, rate, years);
    if (!r) return 'Invalid inputs';
    return `Loan: $${fmt(r.loanAmount)}\nPayment: $${fmt(r.payment)}/mo\nInterest: $${fmt(r.interest)}`;
  }
});

Tools.register({
  id: 'auto-loan', cat: 'finance', name: 'Auto Loan',
  desc: 'Car payment estimator',
  fields: [
    { k: 'price', l: 'Vehicle price', d: 32000 },
    { k: 'down', l: 'Down / trade', d: 4000 },
    { k: 'rate', l: 'APR %', d: 7.2 },
    { k: 'years', l: 'Years', d: 5 },
  ],
  run: ({ price, down, rate, years }) => {
    const r = Finance.loan(num(price) - num(down), rate, years);
    if (!r) return 'Invalid';
    return `Monthly: $${fmt(r.payment)}\nTotal interest: $${fmt(r.interest)}`;
  }
});

Tools.register({
  id: 'compound', cat: 'finance', name: 'Compound Interest',
  desc: 'Growth with compounding',
  fields: [
    { k: 'p', l: 'Principal', d: 10000 },
    { k: 'rate', l: 'Annual %', d: 7 },
    { k: 'years', l: 'Years', d: 10 },
    { k: 'n', l: 'Compounds/year', d: 12 },
  ],
  run: ({ p, rate, years, n }) => {
    const r = Finance.compound(p, rate, years, n);
    if (!r) return 'Invalid';
    return `Future value: $${fmt(r.amount)}\nInterest: $${fmt(r.interest)}`;
  }
});

Tools.register({
  id: 'investment', cat: 'finance', name: 'Investment + Contributions',
  desc: 'Compound with monthly deposits',
  fields: [
    { k: 'p', l: 'Starting amount', d: 5000 },
    { k: 'monthly', l: 'Monthly contribution', d: 300 },
    { k: 'rate', l: 'Annual return %', d: 8 },
    { k: 'years', l: 'Years', d: 20 },
  ],
  run: ({ p, monthly, rate, years }) => {
    const r = num(rate) / 100 / 12;
    const months = num(years) * 12;
    let bal = num(p);
    for (let i = 0; i < months; i++) {
      bal = bal * (1 + r) + num(monthly);
    }
    const contributed = num(p) + num(monthly) * months;
    return `Final value: $${fmt(bal)}\nContributed: $${fmt(contributed)}\nGrowth: $${fmt(bal - contributed)}`;
  }
});

Tools.register({
  id: 'roi', cat: 'finance', name: 'ROI',
  desc: 'Return on investment',
  fields: [
    { k: 'cost', l: 'Cost', d: 10000 },
    { k: 'gain', l: 'Final value', d: 14500 },
  ],
  run: ({ cost, gain }) => {
    const r = Finance.roi(cost, gain);
    if (!r) return 'Invalid';
    return `Gain: $${fmt(r.gain)}\nROI: ${fmt(r.pct)}%`;
  }
});

Tools.register({
  id: 'tip', cat: 'finance', name: 'Tip & Split',
  desc: 'Tip and split the bill',
  fields: [
    { k: 'bill', l: 'Bill amount', d: 86.5 },
    { k: 'pct', l: 'Tip %', d: 18 },
    { k: 'people', l: 'People', d: 4 },
  ],
  run: ({ bill, pct, people }) => {
    const tip = num(bill) * num(pct) / 100;
    const total = num(bill) + tip;
    const each = total / Math.max(1, num(people));
    return `Tip: $${fmt(tip)}\nTotal: $${fmt(total)}\nEach: $${fmt(each)}`;
  }
});

Tools.register({
  id: 'discount', cat: 'finance', name: 'Discount',
  desc: 'Sale price and savings',
  fields: [
    { k: 'price', l: 'Original price', d: 120 },
    { k: 'pct', l: 'Discount %', d: 25 },
  ],
  run: ({ price, pct }) => {
    const save = num(price) * num(pct) / 100;
    return `You save: $${fmt(save)}\nSale price: $${fmt(num(price) - save)}`;
  }
});

Tools.register({
  id: 'sales-tax', cat: 'finance', name: 'Sales Tax',
  desc: 'Tax and total',
  fields: [
    { k: 'price', l: 'Price', d: 49.99 },
    { k: 'rate', l: 'Tax %', d: 8.25 },
  ],
  run: ({ price, rate }) => {
    const tax = num(price) * num(rate) / 100;
    return `Tax: $${fmt(tax)}\nTotal: $${fmt(num(price) + tax)}`;
  }
});

Tools.register({
  id: 'salary', cat: 'finance', name: 'Salary Converter',
  desc: 'Hourly ↔ annual',
  fields: [
    { k: 'amount', l: 'Amount', d: 30 },
    { k: 'hours', l: 'Hours/week', d: 40 },
    { k: 'mode', l: 'Input is (hourly=1 annual=2)', d: 1 },
  ],
  run: ({ amount, hours, mode }) => {
    const h = Math.max(1, num(hours));
    if (num(mode) === 2) {
      const annual = num(amount);
      return `Hourly: $${fmt(annual / (h * 52))}\nMonthly: $${fmt(annual / 12)}\nWeekly: $${fmt(annual / 52)}`;
    }
    const hourly = num(amount);
    const annual = hourly * h * 52;
    return `Annual: $${fmt(annual)}\nMonthly: $${fmt(annual / 12)}\nWeekly: $${fmt(hourly * h)}`;
  }
});

Tools.register({
  id: 'inflation', cat: 'finance', name: 'Inflation',
  desc: 'Future purchasing power',
  fields: [
    { k: 'amount', l: 'Amount today', d: 1000 },
    { k: 'rate', l: 'Inflation %/yr', d: 3 },
    { k: 'years', l: 'Years', d: 10 },
  ],
  run: ({ amount, rate, years }) => {
    const future = num(amount) * Math.pow(1 + num(rate) / 100, num(years));
    return `$${fmt(num(amount))} in ${years}y ≈ $${fmt(future)} future dollars\nBuying power left: $${fmt(num(amount) / Math.pow(1 + num(rate) / 100, num(years)))} today's $`;
  }
});

Tools.register({
  id: 'break-even', cat: 'finance', name: 'Break-Even',
  desc: 'Units to cover costs',
  fields: [
    { k: 'fixed', l: 'Fixed costs', d: 5000 },
    { k: 'price', l: 'Price/unit', d: 40 },
    { k: 'variable', l: 'Variable cost/unit', d: 15 },
  ],
  run: ({ fixed, price, variable }) => {
    const margin = num(price) - num(variable);
    if (margin <= 0) return 'Price must exceed variable cost';
    const units = num(fixed) / margin;
    return `Break-even: ${fmt(units, 1)} units\nRevenue at BE: $${fmt(units * num(price))}`;
  }
});

Tools.register({
  id: 'markup', cat: 'finance', name: 'Markup / Margin',
  desc: 'From cost to sell price',
  fields: [
    { k: 'cost', l: 'Cost', d: 50 },
    { k: 'markup', l: 'Markup %', d: 40 },
  ],
  run: ({ cost, markup }) => {
    const sell = num(cost) * (1 + num(markup) / 100);
    const profit = sell - num(cost);
    const margin = profit / sell * 100;
    return `Sell: $${fmt(sell)}\nProfit: $${fmt(profit)}\nMargin: ${fmt(margin)}%`;
  }
});

Tools.register({
  id: 'retirement', cat: 'finance', name: 'Retirement Savings',
  desc: 'Nest egg projection',
  fields: [
    { k: 'p', l: 'Current savings', d: 50000 },
    { k: 'monthly', l: 'Monthly save', d: 500 },
    { k: 'rate', l: 'Return %/yr', d: 7 },
    { k: 'years', l: 'Years to retire', d: 25 },
  ],
  run: ({ p, monthly, rate, years }) => {
    const r = num(rate) / 100 / 12;
    const m = num(years) * 12;
    let bal = num(p);
    for (let i = 0; i < m; i++) bal = bal * (1 + r) + num(monthly);
    return `Projected: $${fmt(bal)}\nMonthly income @4%: $${fmt(bal * 0.04 / 12)}`;
  }
});

/* ── Health ── */
Tools.register({
  id: 'bmi', cat: 'health', name: 'BMI',
  desc: 'Body mass index',
  fields: [
    { k: 'kg', l: 'Weight (kg) — or 0 if using lb', d: 75 },
    { k: 'cm', l: 'Height (cm) — or 0 if using in', d: 175 },
    { k: 'lb', l: 'Weight (lb) optional', d: 0 },
    { k: 'inches', l: 'Height (inches) optional', d: 0 },
  ],
  run: ({ kg, cm, lb, inches }) => {
    let w = num(kg), h = num(cm) / 100;
    if (num(lb) > 0) w = num(lb) * 0.453592;
    if (num(inches) > 0) h = num(inches) * 0.0254;
    if (h <= 0) return 'Need height';
    const bmi = w / (h * h);
    let cat = 'Obese';
    if (bmi < 18.5) cat = 'Underweight';
    else if (bmi < 25) cat = 'Normal';
    else if (bmi < 30) cat = 'Overweight';
    return `BMI: ${fmt(bmi, 1)}\nCategory: ${cat}`;
  }
});

Tools.register({
  id: 'bmr', cat: 'health', name: 'BMR (Mifflin)',
  desc: 'Basal metabolic rate',
  fields: [
    { k: 'kg', l: 'Weight kg', d: 75 },
    { k: 'cm', l: 'Height cm', d: 175 },
    { k: 'age', l: 'Age', d: 30 },
    { k: 'sex', l: 'Sex (1=male 0=female)', d: 1 },
  ],
  run: ({ kg, cm, age, sex }) => {
    const s = num(sex) >= 1 ? 5 : -161;
    const bmr = 10 * num(kg) + 6.25 * num(cm) - 5 * num(age) + s;
    return `BMR: ${fmt(bmr, 0)} kcal/day`;
  }
});

Tools.register({
  id: 'tdee', cat: 'health', name: 'TDEE',
  desc: 'Daily energy expenditure',
  fields: [
    { k: 'kg', l: 'Weight kg', d: 75 },
    { k: 'cm', l: 'Height cm', d: 175 },
    { k: 'age', l: 'Age', d: 30 },
    { k: 'sex', l: 'Sex (1=male 0=female)', d: 1 },
    { k: 'act', l: 'Activity (1.2–1.9)', d: 1.55 },
  ],
  run: ({ kg, cm, age, sex, act }) => {
    const s = num(sex) >= 1 ? 5 : -161;
    const bmr = 10 * num(kg) + 6.25 * num(cm) - 5 * num(age) + s;
    const tdee = bmr * num(act);
    return `BMR: ${fmt(bmr, 0)}\nTDEE: ${fmt(tdee, 0)} kcal/day\nCut −500: ${fmt(tdee - 500, 0)}\nBulk +300: ${fmt(tdee + 300, 0)}`;
  }
});

Tools.register({
  id: 'protein', cat: 'health', name: 'Protein Target',
  desc: 'Daily protein grams',
  fields: [
    { k: 'kg', l: 'Body weight kg', d: 75 },
    { k: 'mult', l: 'g per kg (1.6–2.2)', d: 1.8 },
  ],
  run: ({ kg, mult }) => `Target: ${fmt(num(kg) * num(mult), 0)} g protein/day`
});

Tools.register({
  id: 'water', cat: 'health', name: 'Water Intake',
  desc: 'Daily water estimate',
  fields: [
    { k: 'kg', l: 'Weight kg', d: 75 },
    { k: 'act', l: 'Extra for exercise (ml)', d: 500 },
  ],
  run: ({ kg, act }) => {
    const base = num(kg) * 35;
    return `About ${fmt(base + num(act), 0)} ml/day (${fmt((base + num(act)) / 1000, 2)} L)`;
  }
});

Tools.register({
  id: 'hr-zones', cat: 'health', name: 'Heart Rate Zones',
  desc: 'Training zones from age',
  fields: [
    { k: 'age', l: 'Age', d: 30 },
    { k: 'rest', l: 'Resting HR (optional)', d: 60 },
  ],
  run: ({ age, rest }) => {
    const max = 220 - num(age);
    const z = (lo, hi) => `${Math.round(max * lo)}–${Math.round(max * hi)} bpm`;
    return `Max HR ≈ ${max}\nZone 2 (easy): ${z(0.6, 0.7)}\nZone 3: ${z(0.7, 0.8)}\nZone 4: ${z(0.8, 0.9)}\nZone 5: ${z(0.9, 1.0)}`;
  }
});

Tools.register({
  id: 'pace', cat: 'health', name: 'Running Pace',
  desc: 'Pace from distance & time',
  fields: [
    { k: 'km', l: 'Distance km', d: 5 },
    { k: 'min', l: 'Time minutes', d: 28 },
  ],
  run: ({ km, min }) => {
    const pace = num(min) / Math.max(0.01, num(km));
    const mm = Math.floor(pace);
    const ss = Math.round((pace - mm) * 60);
    return `Pace: ${mm}:${String(ss).padStart(2, '0')} /km\nSpeed: ${fmt(60 / pace, 2)} km/h`;
  }
});

/* ── Math ── */
Tools.register({
  id: 'percent', cat: 'math', name: 'Percentage',
  desc: 'X% of Y, and more',
  fields: [
    { k: 'x', l: 'X', d: 20 },
    { k: 'y', l: 'Y', d: 150 },
  ],
  run: ({ x, y }) => {
    return `${x}% of ${y} = ${fmt(num(y) * num(x) / 100)}\n${x} is ${fmt(num(x) / num(y) * 100)}% of ${y}\nChange ${x}→${y}: ${fmt((num(y) - num(x)) / num(x) * 100)}%`;
  }
});

Tools.register({
  id: 'fraction', cat: 'math', name: 'Fraction Ops',
  desc: 'a/b ? c/d',
  fields: [
    { k: 'a', l: 'a (num1)', d: 1 },
    { k: 'b', l: 'b (den1)', d: 2 },
    { k: 'c', l: 'c (num2)', d: 1 },
    { k: 'd', l: 'd (den2)', d: 3 },
    { k: 'op', l: 'Op 1+ 2− 3× 4÷', d: 1 },
  ],
  run: ({ a, b, c, d, op }) => {
    const A = num(a) / num(b), B = num(c) / num(d);
    let r;
    switch (num(op)) {
      case 2: r = A - B; break;
      case 3: r = A * B; break;
      case 4: r = A / B; break;
      default: r = A + B;
    }
    return `Decimal: ${fmt(r, 8)}\nFraction approx: ${Sci.toFraction ? Sci.toFraction(r) : r}`;
  }
});

Tools.register({
  id: 'avg', cat: 'math', name: 'Mean / Median / Mode',
  desc: 'Comma-separated numbers',
  fields: [{ k: 'vals', l: 'Values e.g. 2,4,4,6,8', type: 'text', d: '2,4,4,6,8' }],
  run: ({ vals }) => {
    const a = String(vals).split(/[,\s]+/).map(Number).filter(x => !isNaN(x)).sort((x, y) => x - y);
    if (!a.length) return 'No numbers';
    const mean = a.reduce((s, x) => s + x, 0) / a.length;
    const mid = a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
    const freq = {};
    a.forEach(x => freq[x] = (freq[x] || 0) + 1);
    const maxF = Math.max(...Object.values(freq));
    const modes = Object.keys(freq).filter(k => freq[k] === maxF).join(', ');
    const variance = a.reduce((s, x) => s + (x - mean) ** 2, 0) / a.length;
    return `n=${a.length}\nMean: ${fmt(mean, 4)}\nMedian: ${fmt(mid, 4)}\nMode: ${modes}\nStdDev(pop): ${fmt(Math.sqrt(variance), 4)}\nRange: ${fmt(a[a.length - 1] - a[0])}`;
  }
});

Tools.register({
  id: 'prime', cat: 'math', name: 'Prime Check',
  desc: 'Is n prime?',
  fields: [{ k: 'n', l: 'Number', d: 97 }],
  run: ({ n }) => {
    const N = Math.floor(num(n));
    if (N < 2) return `${N} is not prime`;
    for (let i = 2; i * i <= N; i++) if (N % i === 0) return `${N} is not prime (÷${i})`;
    return `${N} is prime`;
  }
});

Tools.register({
  id: 'lcm-gcd', cat: 'math', name: 'LCM & GCD',
  desc: 'Two integers',
  fields: [
    { k: 'a', l: 'A', d: 12 },
    { k: 'b', l: 'B', d: 18 },
  ],
  run: ({ a, b }) => {
    let x = Math.abs(Math.floor(num(a))), y = Math.abs(Math.floor(num(b)));
    const g = (p, q) => q === 0 ? p : g(q, p % q);
    const gcd = g(x, y);
    const lcm = x && y ? Math.abs(x * y) / gcd : 0;
    return `GCD: ${gcd}\nLCM: ${lcm}`;
  }
});

Tools.register({
  id: 'quadratic', cat: 'math', name: 'Quadratic Solver',
  desc: 'ax² + bx + c = 0',
  fields: [
    { k: 'a', l: 'a', d: 1 },
    { k: 'b', l: 'b', d: -3 },
    { k: 'c', l: 'c', d: 2 },
  ],
  run: ({ a, b, c }) => {
    const A = num(a), B = num(b), C = num(c);
    const d = B * B - 4 * A * C;
    if (Math.abs(A) < 1e-15) return 'Not quadratic (a≈0)';
    if (d > 0) {
      const s = Math.sqrt(d);
      return `Two real roots\nx₁ = ${fmt((-B + s) / (2 * A), 6)}\nx₂ = ${fmt((-B - s) / (2 * A), 6)}`;
    }
    if (d === 0) return `One root: ${fmt(-B / (2 * A), 6)}`;
    const s = Math.sqrt(-d);
    return `Complex roots\n${fmt(-B / (2 * A), 4)} ± ${fmt(s / (2 * A), 4)}i`;
  }
});

Tools.register({
  id: 'perm-comb', cat: 'math', name: 'Permutations / Combinations',
  desc: 'nPr and nCr',
  fields: [
    { k: 'n', l: 'n', d: 10 },
    { k: 'r', l: 'r', d: 3 },
  ],
  run: ({ n, r }) => {
    const N = Math.floor(num(n)), R = Math.floor(num(r));
    const fact = (x) => { let p = 1; for (let i = 2; i <= x; i++) p *= i; return p; };
    if (R > N || N < 0 || R < 0) return 'Invalid n,r';
    const nPr = fact(N) / fact(N - R);
    const nCr = nPr / fact(R);
    return `P(${N},${R}) = ${fmt(nPr, 0)}\nC(${N},${R}) = ${fmt(nCr, 0)}`;
  }
});

/* ── Date & time ── */
Tools.register({
  id: 'age', cat: 'datetime', name: 'Age Calculator',
  desc: 'Years, months, days from birth',
  fields: [{ k: 'dob', l: 'Birth date (YYYY-MM-DD)', type: 'text', d: '1990-06-15' }],
  run: ({ dob }) => {
    const b = new Date(dob);
    if (isNaN(b)) return 'Invalid date';
    const now = new Date();
    let y = now.getFullYear() - b.getFullYear();
    let m = now.getMonth() - b.getMonth();
    let d = now.getDate() - b.getDate();
    if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    const days = Math.floor((now - b) / 86400000);
    return `Age: ${y} years, ${m} months, ${d} days\nTotal days: ${days}`;
  }
});

Tools.register({
  id: 'date-diff', cat: 'datetime', name: 'Days Between Dates',
  desc: 'Difference between two dates',
  fields: [
    { k: 'a', l: 'Start (YYYY-MM-DD)', type: 'text', d: '2026-01-01' },
    { k: 'b', l: 'End (YYYY-MM-DD)', type: 'text', d: '2026-12-31' },
  ],
  run: ({ a, b }) => {
    const d1 = new Date(a), d2 = new Date(b);
    if (isNaN(d1) || isNaN(d2)) return 'Invalid date';
    const days = Math.round((d2 - d1) / 86400000);
    return `${days} days\n≈ ${fmt(days / 7, 1)} weeks\n≈ ${fmt(days / 30.44, 1)} months`;
  }
});

Tools.register({
  id: 'hours', cat: 'datetime', name: 'Hours Worked',
  desc: 'End − start (24h HH:MM)',
  fields: [
    { k: 'start', l: 'Start HH:MM', type: 'text', d: '09:00' },
    { k: 'end', l: 'End HH:MM', type: 'text', d: '17:30' },
    { k: 'break', l: 'Break minutes', d: 30 },
  ],
  run: ({ start, end, break: br }) => {
    const parse = (s) => {
      const [h, m] = String(s).split(':').map(Number);
      return h * 60 + (m || 0);
    };
    let mins = parse(end) - parse(start) - num(br);
    if (mins < 0) mins += 24 * 60;
    return `${fmt(mins / 60, 2)} hours (${mins} minutes)`;
  }
});

/* ── Converters extras ── */
Tools.register({
  id: 'shoe', cat: 'convert', name: 'Shoe Size (approx)',
  desc: 'US men → EU / UK',
  fields: [{ k: 'us', l: 'US men size', d: 10 }],
  run: ({ us }) => {
    const eu = num(us) * 1.27 + 17.5; // rough
    const uk = num(us) - 0.5;
    return `US ${us}\n≈ EU ${fmt(eu, 0)}\n≈ UK ${fmt(uk, 1)}\n(approximate)`;
  }
});

Tools.register({
  id: 'cooking', cat: 'convert', name: 'Cooking Volume',
  desc: 'Cups ↔ ml',
  fields: [
    { k: 'cups', l: 'Cups', d: 1 },
  ],
  run: ({ cups }) => {
    const ml = num(cups) * 236.588;
    return `${cups} cup(s) = ${fmt(ml, 1)} ml = ${fmt(ml / 15, 1)} Tbsp = ${fmt(ml / 5, 1)} tsp`;
  }
});

Tools.register({
  id: 'data-size', cat: 'convert', name: 'Data Size',
  desc: 'GB ↔ bytes etc',
  fields: [
    { k: 'gb', l: 'Gigabytes', d: 1 },
  ],
  run: ({ gb }) => {
    const bytes = num(gb) * 1e9;
    return `${gb} GB ≈\n${fmt(bytes, 0)} bytes\n${fmt(bytes / 1e6, 2)} MB\n${fmt(num(gb) * 8, 2)} Gb (gigabits)`;
  }
});

/* ── Home ── */
Tools.register({
  id: 'concrete', cat: 'home', name: 'Concrete Volume',
  desc: 'Slab L×W×D',
  fields: [
    { k: 'l', l: 'Length (ft)', d: 10 },
    { k: 'w', l: 'Width (ft)', d: 12 },
    { k: 'd', l: 'Depth (inches)', d: 4 },
  ],
  run: ({ l, w, d }) => {
    const cuFt = num(l) * num(w) * (num(d) / 12);
    const cuYd = cuFt / 27;
    const bags80 = cuYd * 45; // rough 80lb bags
    return `${fmt(cuFt, 2)} ft³\n${fmt(cuYd, 2)} yd³\n≈ ${fmt(bags80, 0)} bags (80 lb, rough)`;
  }
});

Tools.register({
  id: 'paint', cat: 'home', name: 'Paint Coverage',
  desc: 'Gallons needed',
  fields: [
    { k: 'sqft', l: 'Wall area sq ft', d: 400 },
    { k: 'coats', l: 'Coats', d: 2 },
    { k: 'cov', l: 'Coverage sqft/gal', d: 350 },
  ],
  run: ({ sqft, coats, cov }) => {
    const gal = (num(sqft) * num(coats)) / Math.max(1, num(cov));
    return `Need ≈ ${fmt(gal, 2)} gallons`;
  }
});

Tools.register({
  id: 'sqft', cat: 'home', name: 'Room Area',
  desc: 'Rectangle area',
  fields: [
    { k: 'l', l: 'Length', d: 12 },
    { k: 'w', l: 'Width', d: 10 },
  ],
  run: ({ l, w }) => `Area: ${fmt(num(l) * num(w), 2)} sq units\nPerimeter: ${fmt(2 * (num(l) + num(w)), 2)}`
});

/* ── Auto ── */
Tools.register({
  id: 'fuel', cat: 'auto', name: 'Fuel Cost',
  desc: 'Trip fuel cost',
  fields: [
    { k: 'miles', l: 'Distance (miles)', d: 320 },
    { k: 'mpg', l: 'MPG', d: 28 },
    { k: 'price', l: '$/gallon', d: 3.6 },
  ],
  run: ({ miles, mpg, price }) => {
    const gal = num(miles) / Math.max(0.1, num(mpg));
    return `Fuel: ${fmt(gal, 2)} gal\nCost: $${fmt(gal * num(price))}`;
  }
});

Tools.register({
  id: 'tire', cat: 'auto', name: 'Tire Size',
  desc: 'e.g. 225/45R17',
  fields: [
    { k: 'w', l: 'Width mm', d: 225 },
    { k: 'ar', l: 'Aspect %', d: 45 },
    { k: 'r', l: 'Rim inches', d: 17 },
  ],
  run: ({ w, ar, r }) => {
    const sidewall = num(w) * num(ar) / 100;
    const diamMm = sidewall * 2 + num(r) * 25.4;
    const circ = Math.PI * diamMm;
    return `Diameter: ${fmt(diamMm, 1)} mm (${fmt(diamMm / 25.4, 2)} in)\nCircumference: ${fmt(circ, 1)} mm`;
  }
});

/* ── Science ── */
Tools.register({
  id: 'ohm', cat: 'science', name: "Ohm's Law",
  desc: 'V = IR',
  fields: [
    { k: 'v', l: 'Volts (0=solve)', d: 12 },
    { k: 'i', l: 'Amps (0=solve)', d: 0 },
    { k: 'r', l: 'Ohms (0=solve)', d: 4 },
  ],
  run: ({ v, i, r }) => {
    let V = num(v), I = num(i), R = num(r);
    if (!V && I && R) V = I * R;
    else if (!I && V && R) I = V / R;
    else if (!R && V && I) R = V / I;
    else if (V && I && R) return `Check: V=${fmt(I * R)} (given V=${fmt(V)})`;
    return `V = ${fmt(V)} V\nI = ${fmt(I)} A\nR = ${fmt(R)} Ω\nP = ${fmt(V * I)} W`;
  }
});

Tools.register({
  id: 'ke', cat: 'science', name: 'Kinetic Energy',
  desc: '½mv²',
  fields: [
    { k: 'm', l: 'Mass kg', d: 10 },
    { k: 'v', l: 'Velocity m/s', d: 5 },
  ],
  run: ({ m, v }) => `KE = ${fmt(0.5 * num(m) * num(v) * num(v))} J`
});

Tools.register({
  id: 'speed-dist-time', cat: 'science', name: 'Speed / Distance / Time',
  desc: 'Enter any two (0 = solve)',
  fields: [
    { k: 's', l: 'Speed', d: 60 },
    { k: 'd', l: 'Distance', d: 120 },
    { k: 't', l: 'Time', d: 0 },
  ],
  run: ({ s, d, t }) => {
    let S = num(s), D = num(d), T = num(t);
    if (!T && S && D) T = D / S;
    else if (!D && S && T) D = S * T;
    else if (!S && D && T) S = D / T;
    return `Speed: ${fmt(S)}\nDistance: ${fmt(D)}\nTime: ${fmt(T)}`;
  }
});

/* ── Education ── */
Tools.register({
  id: 'gpa', cat: 'edu', name: 'GPA (4.0 scale)',
  desc: 'Comma grades A=4…F=0 with credits',
  fields: [
    { k: 'grades', l: 'Grade points e.g. 4,3.7,3', type: 'text', d: '4,3.7,3,3.3' },
    { k: 'credits', l: 'Credits e.g. 3,3,4,3', type: 'text', d: '3,3,4,3' },
  ],
  run: ({ grades, credits }) => {
    const g = String(grades).split(/[,\s]+/).map(Number);
    const c = String(credits).split(/[,\s]+/).map(Number);
    let pts = 0, cr = 0;
    for (let i = 0; i < g.length; i++) {
      const ci = c[i] || 1;
      pts += g[i] * ci; cr += ci;
    }
    return cr ? `GPA: ${fmt(pts / cr, 3)} (${cr} credits)` : 'No data';
  }
});

Tools.register({
  id: 'final-grade', cat: 'edu', name: 'Final Grade Needed',
  desc: 'Score needed on final',
  fields: [
    { k: 'current', l: 'Current average %', d: 85 },
    { k: 'want', l: 'Desired overall %', d: 90 },
    { k: 'weight', l: 'Final weight %', d: 30 },
  ],
  run: ({ current, want, weight }) => {
    const w = num(weight) / 100;
    const need = (num(want) - num(current) * (1 - w)) / w;
    return `Need ${fmt(need, 1)}% on the final`;
  }
});

/* ── Business ── */
Tools.register({
  id: 'cpm', cat: 'biz', name: 'CPM Ads',
  desc: 'Cost per 1000 impressions',
  fields: [
    { k: 'cost', l: 'Ad cost $', d: 500 },
    { k: 'impr', l: 'Impressions', d: 250000 },
  ],
  run: ({ cost, impr }) => `CPM = $${fmt(num(cost) / (num(impr) / 1000))}`
});

Tools.register({
  id: 'clv', cat: 'biz', name: 'Customer LTV (simple)',
  desc: 'Value × frequency × life',
  fields: [
    { k: 'avg', l: 'Avg order $', d: 50 },
    { k: 'freq', l: 'Orders/year', d: 4 },
    { k: 'years', l: 'Years as customer', d: 3 },
  ],
  run: ({ avg, freq, years }) => `LTV ≈ $${fmt(num(avg) * num(freq) * num(years))}`
});

/* ── Everyday ── */
Tools.register({
  id: 'pct-off', cat: 'life', name: 'Unit Price Compare',
  desc: 'Price per unit',
  fields: [
    { k: 'price', l: 'Price', d: 6.99 },
    { k: 'qty', l: 'Quantity (oz/count)', d: 16 },
  ],
  run: ({ price, qty }) => `$${fmt(num(price) / num(qty), 4)} per unit`
});

Tools.register({
  id: 'electricity', cat: 'life', name: 'Electricity Cost',
  desc: 'Appliance cost',
  fields: [
    { k: 'watts', l: 'Watts', d: 1500 },
    { k: 'hours', l: 'Hours/day', d: 3 },
    { k: 'rate', l: '$/kWh', d: 0.14 },
    { k: 'days', l: 'Days', d: 30 },
  ],
  run: ({ watts, hours, rate, days }) => {
    const kwh = num(watts) / 1000 * num(hours) * num(days);
    return `${fmt(kwh, 2)} kWh\nCost: $${fmt(kwh * num(rate))}`;
  }
});

/* ── Fun ── */
Tools.register({
  id: 'love', cat: 'fun', name: 'Love Calculator',
  desc: 'Name compatibility (fun only)',
  fields: [
    { k: 'a', l: 'Name 1', type: 'text', d: 'Alex' },
    { k: 'b', l: 'Name 2', type: 'text', d: 'Sam' },
  ],
  run: ({ a, b }) => {
    const s = (String(a) + String(b)).toLowerCase();
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    const pct = h % 51 + 50; // 50–100
    return `${a} + ${b} = ${pct}% match\n(For entertainment only 💙)`;
  }
});

Tools.register({
  id: 'random', cat: 'fun', name: 'Random Number',
  desc: 'Inclusive range',
  fields: [
    { k: 'min', l: 'Min', d: 1 },
    { k: 'max', l: 'Max', d: 100 },
  ],
  run: ({ min, max }) => {
    const lo = Math.ceil(num(min)), hi = Math.floor(num(max));
    const n = Math.floor(Math.random() * (hi - lo + 1)) + lo;
    return `Random: ${n}`;
  }
});


/* ── More finance ── */
Tools.register({
  id: 'debt-payoff', cat: 'finance', name: 'Debt Payoff',
  desc: 'Months to clear debt with fixed payment',
  fields: [
    { k: 'balance', l: 'Balance', d: 8000 },
    { k: 'rate', l: 'APR %', d: 19.9 },
    { k: 'pay', l: 'Monthly payment', d: 250 },
  ],
  run: ({ balance, rate, pay }) => {
    let bal = num(balance), r = num(rate) / 100 / 12, pmt = num(pay), m = 0, interest = 0;
    if (pmt <= bal * r) return 'Payment too low — balance never falls';
    while (bal > 0.01 && m < 600) {
      const int = bal * r;
      interest += int;
      bal = bal + int - pmt;
      m++;
    }
    return m >= 600 ? 'Over 50 years — increase payment'
      : `Paid off in ${m} months (${fmt(m / 12, 1)} years)\nTotal interest: $${fmt(interest)}`;
  }
});

Tools.register({
  id: 'mortgage-extra', cat: 'finance', name: 'Extra Mortgage Payment',
  desc: 'Savings from extra monthly principal',
  fields: [
    { k: 'balance', l: 'Balance', d: 300000 },
    { k: 'rate', l: 'Rate %', d: 6.5 },
    { k: 'years', l: 'Years left', d: 28 },
    { k: 'extra', l: 'Extra $/mo', d: 200 },
  ],
  run: ({ balance, rate, years, extra }) => {
    const base = Finance.loan(balance, rate, years);
    if (!base) return 'Invalid';
    const r = num(rate) / 100 / 12;
    let bal = num(balance), m = 0, interest = 0;
    const pmt = base.payment + num(extra);
    while (bal > 0.01 && m < 600) {
      const int = bal * r;
      interest += int;
      bal = Math.max(0, bal + int - pmt);
      m++;
    }
    const saved = base.interest - interest;
    const monthsSaved = base.months - m;
    return `With extra $${fmt(num(extra))}/mo:\nPayoff: ${m} months (save ${monthsSaved} mo)\nInterest: $${fmt(interest)}\nInterest saved: $${fmt(saved)}`;
  }
});

Tools.register({
  id: 'down-payment', cat: 'finance', name: 'Down Payment',
  desc: 'Cash needed at different %',
  fields: [
    { k: 'price', l: 'Home price', d: 450000 },
    { k: 'pct', l: 'Down %', d: 20 },
  ],
  run: ({ price, pct }) => {
    const down = num(price) * num(pct) / 100;
    return `Down payment: $${fmt(down)}\nLoan amount: $${fmt(num(price) - down)}\nAt 5%: $${fmt(num(price) * 0.05)}\nAt 10%: $${fmt(num(price) * 0.1)}\nAt 20%: $${fmt(num(price) * 0.2)}`;
  }
});

Tools.register({
  id: 'simple-interest', cat: 'finance', name: 'Simple Interest',
  desc: 'I = Prt',
  fields: [
    { k: 'p', l: 'Principal', d: 10000 },
    { k: 'rate', l: 'Rate %/yr', d: 5 },
    { k: 'years', l: 'Years', d: 3 },
  ],
  run: ({ p, rate, years }) => {
    const i = num(p) * num(rate) / 100 * num(years);
    return `Interest: $${fmt(i)}\nTotal: $${fmt(num(p) + i)}`;
  }
});

Tools.register({
  id: 'vat', cat: 'finance', name: 'VAT / GST',
  desc: 'Add or extract tax',
  fields: [
    { k: 'amount', l: 'Amount', d: 100 },
    { k: 'rate', l: 'Tax %', d: 20 },
    { k: 'mode', l: '1=add tax 2=extract from gross', d: 1 },
  ],
  run: ({ amount, rate, mode }) => {
    const a = num(amount), r = num(rate) / 100;
    if (num(mode) === 2) {
      const net = a / (1 + r);
      return `Net: $${fmt(net)}\nTax: $${fmt(a - net)}\nGross: $${fmt(a)}`;
    }
    const tax = a * r;
    return `Net: $${fmt(a)}\nTax: $${fmt(tax)}\nGross: $${fmt(a + tax)}`;
  }
});

Tools.register({
  id: 'credit-card', cat: 'finance', name: 'Credit Card Interest',
  desc: 'Rough monthly interest on balance',
  fields: [
    { k: 'bal', l: 'Balance', d: 2500 },
    { k: 'apr', l: 'APR %', d: 22.9 },
  ],
  run: ({ bal, apr }) => {
    const monthly = num(bal) * num(apr) / 100 / 12;
    return `Est. interest this month: $${fmt(monthly)}\nYearly if balance stays: $${fmt(monthly * 12)}`;
  }
});

/* ── More health ── */
Tools.register({
  id: 'body-fat-navy', cat: 'health', name: 'Body Fat % (Navy)',
  desc: 'US Navy estimate',
  fields: [
    { k: 'sex', l: 'Sex (1=male 0=female)', d: 1 },
    { k: 'h', l: 'Height cm', d: 175 },
    { k: 'neck', l: 'Neck cm', d: 38 },
    { k: 'waist', l: 'Waist cm', d: 85 },
    { k: 'hip', l: 'Hip cm (women)', d: 95 },
  ],
  run: ({ sex, h, neck, waist, hip }) => {
    // log10 formula
    const log10 = (x) => Math.log(x) / Math.LN10;
    let bf;
    if (num(sex) >= 1) {
      bf = 495 / (1.0324 - 0.19077 * log10(num(waist) - num(neck)) + 0.15456 * log10(num(h))) - 450;
    } else {
      bf = 495 / (1.29579 - 0.35004 * log10(num(waist) + num(hip) - num(neck)) + 0.22100 * log10(num(h))) - 450;
    }
    return `Body fat ≈ ${fmt(bf, 1)}%\n(Navy method estimate)`;
  }
});

Tools.register({
  id: 'ideal-weight', cat: 'health', name: 'Ideal Weight (Devine)',
  desc: 'Height-based ideal weight',
  fields: [
    { k: 'sex', l: 'Sex (1=male 0=female)', d: 1 },
    { k: 'cm', l: 'Height cm', d: 175 },
  ],
  run: ({ sex, cm }) => {
    const inches = num(cm) / 2.54;
    const over5 = Math.max(0, inches - 60);
    const kg = num(sex) >= 1 ? 50 + 2.3 * over5 : 45.5 + 2.3 * over5;
    return `Ideal (Devine): ${fmt(kg, 1)} kg (${fmt(kg * 2.205, 1)} lb)`;
  }
});

Tools.register({
  id: 'calorie-deficit', cat: 'health', name: 'Calorie Deficit Plan',
  desc: 'Days to lose weight at deficit',
  fields: [
    { k: 'lose_kg', l: 'Kg to lose', d: 5 },
    { k: 'deficit', l: 'Daily deficit kcal', d: 500 },
  ],
  run: ({ lose_kg, deficit }) => {
    const kcal = num(lose_kg) * 7700;
    const days = kcal / Math.max(1, num(deficit));
    return `≈ ${fmt(days, 0)} days (${fmt(days / 7, 1)} weeks)\nat ${deficit} kcal/day deficit`;
  }
});

Tools.register({
  id: 'one-rep-max', cat: 'health', name: 'One Rep Max',
  desc: 'Epley estimate',
  fields: [
    { k: 'weight', l: 'Weight lifted', d: 100 },
    { k: 'reps', l: 'Reps', d: 5 },
  ],
  run: ({ weight, reps }) => {
    const r = num(reps);
    if (r < 1) return 'Invalid reps';
    const orm = num(weight) * (1 + r / 30);
    return `Est. 1RM: ${fmt(orm, 1)}\n90%: ${fmt(orm * 0.9, 1)}\n80%: ${fmt(orm * 0.8, 1)}\n70%: ${fmt(orm * 0.7, 1)}`;
  }
});

Tools.register({
  id: 'bac', cat: 'health', name: 'BAC Estimate',
  desc: 'Rough Widmark — not legal advice',
  fields: [
    { k: 'drinks', l: 'Standard drinks', d: 3 },
    { k: 'kg', l: 'Weight kg', d: 75 },
    { k: 'sex', l: 'Sex (1=male 0=female)', d: 1 },
    { k: 'hours', l: 'Hours drinking', d: 2 },
  ],
  run: ({ drinks, kg, sex, hours }) => {
    const r = num(sex) >= 1 ? 0.68 : 0.55;
    const alcohol = num(drinks) * 14; // grams
    let bac = (alcohol / (num(kg) * 1000 * r)) * 100 - 0.015 * num(hours);
    bac = Math.max(0, bac);
    return `Est. BAC ≈ ${fmt(bac, 3)}%\n(Estimate only — do not drive)`;
  }
});

/* ── Pregnancy ── */
Tools.register({
  id: 'due-date', cat: 'health', name: 'Pregnancy Due Date',
  desc: 'From LMP (Naegele)',
  fields: [{ k: 'lmp', l: 'LMP date YYYY-MM-DD', type: 'text', d: '2026-01-15' }],
  run: ({ lmp }) => {
    const d = new Date(lmp);
    if (isNaN(d)) return 'Invalid date';
    const due = new Date(d);
    due.setDate(due.getDate() + 280);
    const now = new Date();
    const weeks = Math.floor((now - d) / (7 * 86400000));
    return `Due date: ${due.toISOString().slice(0, 10)}\n≈ Week ${Math.max(0, weeks)} now\n(Estimate — confirm with clinician)`;
  }
});

Tools.register({
  id: 'ovulation', cat: 'health', name: 'Ovulation Window',
  desc: 'From cycle length',
  fields: [
    { k: 'lmp', l: 'Last period start YYYY-MM-DD', type: 'text', d: '2026-03-01' },
    { k: 'cycle', l: 'Cycle length days', d: 28 },
  ],
  run: ({ lmp, cycle }) => {
    const d = new Date(lmp);
    if (isNaN(d)) return 'Invalid date';
    const ov = new Date(d);
    ov.setDate(ov.getDate() + num(cycle) - 14);
    const fertileStart = new Date(ov); fertileStart.setDate(ov.getDate() - 5);
    const fertileEnd = new Date(ov); fertileEnd.setDate(ov.getDate() + 1);
    return `Est. ovulation: ${ov.toISOString().slice(0, 10)}\nFertile window: ${fertileStart.toISOString().slice(0, 10)} → ${fertileEnd.toISOString().slice(0, 10)}`;
  }
});

/* ── Pets ── */
Tools.register({
  id: 'dog-age', cat: 'life', name: 'Dog Age',
  desc: 'Rough human-year equivalent',
  fields: [
    { k: 'years', l: 'Dog years', d: 5 },
    { k: 'size', l: 'Size 1=small 2=med 3=large', d: 2 },
  ],
  run: ({ years, size }) => {
    const y = num(years);
    // simplified
    let human = y <= 1 ? 15 * y : y <= 2 ? 15 + 9 * (y - 1) : 24 + (y - 2) * (num(size) >= 3 ? 7 : 5);
    return `≈ ${fmt(human, 0)} human years\n(Rule-of-thumb only)`;
  }
});

Tools.register({
  id: 'cat-age', cat: 'life', name: 'Cat Age',
  desc: 'Rough human-year equivalent',
  fields: [{ k: 'years', l: 'Cat years', d: 4 }],
  run: ({ years }) => {
    const y = num(years);
    const human = y <= 1 ? 15 : y <= 2 ? 24 : 24 + (y - 2) * 4;
    return `≈ ${fmt(human, 0)} human years`;
  }
});

/* ── More math ── */
Tools.register({
  id: 'ratio', cat: 'math', name: 'Ratio / Proportion',
  desc: 'a:b = c:x solve x',
  fields: [
    { k: 'a', l: 'a', d: 2 },
    { k: 'b', l: 'b', d: 5 },
    { k: 'c', l: 'c', d: 6 },
  ],
  run: ({ a, b, c }) => {
    const x = num(b) * num(c) / Math.max(1e-12, num(a));
    return `${a}:${b} = ${c}:${fmt(x, 4)}\nx = ${fmt(x, 4)}`;
  }
});

Tools.register({
  id: 'exponent', cat: 'math', name: 'Exponent / Root',
  desc: 'a^b and root',
  fields: [
    { k: 'a', l: 'Base', d: 2 },
    { k: 'b', l: 'Exponent', d: 10 },
    { k: 'root', l: 'Root index (e.g. 2)', d: 2 },
  ],
  run: ({ a, b, root }) => {
    const pow = Math.pow(num(a), num(b));
    const rt = Math.pow(num(a), 1 / num(root));
    return `${a}^${b} = ${fmt(pow, 6)}\n${root}√${a} = ${fmt(rt, 6)}`;
  }
});

Tools.register({
  id: 'log', cat: 'math', name: 'Logarithm',
  desc: 'log base b of x',
  fields: [
    { k: 'x', l: 'x', d: 1000 },
    { k: 'base', l: 'Base (10 or e≈2.718)', d: 10 },
  ],
  run: ({ x, base }) => {
    const b = num(base);
    const res = Math.log(num(x)) / Math.log(b);
    return `log_${b}(${x}) = ${fmt(res, 6)}\nln(${x}) = ${fmt(Math.log(num(x)), 6)}`;
  }
});

/* ── Engineering / net ── */
Tools.register({
  id: 'subnet', cat: 'science', name: 'Subnet (simple)',
  desc: 'Hosts from CIDR /prefix',
  fields: [
    { k: 'prefix', l: 'CIDR prefix 0–32', d: 24 },
  ],
  run: ({ prefix }) => {
    const p = Math.min(32, Math.max(0, Math.floor(num(prefix))));
    const hostBits = 32 - p;
    const total = Math.pow(2, hostBits);
    const usable = hostBits >= 2 ? total - 2 : total;
    return `/${p}\nAddresses: ${total}\nUsable hosts: ${usable}\nMask bits: ${p}`;
  }
});

Tools.register({
  id: 'resistor-series', cat: 'science', name: 'Resistors Series/Parallel',
  desc: 'Two resistors',
  fields: [
    { k: 'r1', l: 'R1 Ω', d: 100 },
    { k: 'r2', l: 'R2 Ω', d: 220 },
  ],
  run: ({ r1, r2 }) => {
    const s = num(r1) + num(r2);
    const p = 1 / (1 / num(r1) + 1 / num(r2));
    return `Series: ${fmt(s)} Ω\nParallel: ${fmt(p)} Ω`;
  }
});

Tools.register({
  id: 'download-time', cat: 'science', name: 'Download Time',
  desc: 'File size vs speed',
  fields: [
    { k: 'mb', l: 'File size MB', d: 1500 },
    { k: 'mbps', l: 'Speed Mbps', d: 100 },
  ],
  run: ({ mb, mbps }) => {
    const sec = (num(mb) * 8) / Math.max(0.001, num(mbps));
    return `${fmt(sec, 1)} s\n${fmt(sec / 60, 2)} min\n${fmt(sec / 3600, 2)} hr`;
  }
});

/* ── Date extras ── */
Tools.register({
  id: 'add-days', cat: 'datetime', name: 'Date ± Days',
  desc: 'Add or subtract days',
  fields: [
    { k: 'date', l: 'Start YYYY-MM-DD', type: 'text', d: '2026-09-20' },
    { k: 'days', l: 'Days (+/−)', d: 30 },
  ],
  run: ({ date, days }) => {
    const d = new Date(date);
    if (isNaN(d)) return 'Invalid date';
    d.setDate(d.getDate() + Math.floor(num(days)));
    return `Result: ${d.toISOString().slice(0, 10)}`;
  }
});

Tools.register({
  id: 'business-days', cat: 'datetime', name: 'Business Days',
  desc: 'Weekdays between dates',
  fields: [
    { k: 'a', l: 'Start YYYY-MM-DD', type: 'text', d: '2026-09-01' },
    { k: 'b', l: 'End YYYY-MM-DD', type: 'text', d: '2026-09-30' },
  ],
  run: ({ a, b }) => {
    let d1 = new Date(a), d2 = new Date(b);
    if (isNaN(d1) || isNaN(d2)) return 'Invalid';
    if (d1 > d2) [d1, d2] = [d2, d1];
    let n = 0;
    const cur = new Date(d1);
    while (cur <= d2) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) n++;
      cur.setDate(cur.getDate() + 1);
    }
    return `${n} business days (excludes Sat/Sun)`;
  }
});

/* ── Fun / generators ── */
Tools.register({
  id: 'password', cat: 'fun', name: 'Password Generator',
  desc: 'Random password',
  fields: [
    { k: 'len', l: 'Length', d: 16 },
    { k: 'sym', l: 'Symbols 1=yes 0=no', d: 1 },
  ],
  run: ({ len, sym }) => {
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const digits = '23456789';
    const symbols = '!@#$%&*+-?=';
    let chars = lower + upper + digits + (num(sym) ? symbols : '');
    let out = '';
    const L = Math.min(64, Math.max(4, Math.floor(num(len))));
    for (let i = 0; i < L; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }
});

Tools.register({
  id: 'roman', cat: 'convert', name: 'Roman Numerals',
  desc: 'Number → Roman',
  fields: [{ k: 'n', l: 'Number 1–3999', d: 2026 }],
  run: ({ n }) => {
    let numv = Math.min(3999, Math.max(1, Math.floor(num(n))));
    const map = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
    let s = '';
    for (const [v, sym] of map) {
      while (numv >= v) { s += sym; numv -= v; }
    }
    return s;
  }
});

Tools.register({
  id: 'zodiac', cat: 'fun', name: 'Zodiac Sign',
  desc: 'From birth month/day',
  fields: [
    { k: 'month', l: 'Month 1–12', d: 6 },
    { k: 'day', l: 'Day', d: 15 },
  ],
  run: ({ month, day }) => {
    const m = num(month), d = num(day);
    const signs = [
      [1,20,'Capricorn'],[2,19,'Aquarius'],[3,20,'Pisces'],[4,20,'Aries'],
      [5,21,'Taurus'],[6,21,'Gemini'],[7,22,'Cancer'],[8,23,'Leo'],
      [9,23,'Virgo'],[10,23,'Libra'],[11,22,'Scorpio'],[12,22,'Sagittarius'],[12,32,'Capricorn']
    ];
    let sign = 'Capricorn';
    for (let i = 0; i < signs.length - 1; i++) {
      const [m1, d1, s1] = signs[i];
      const [m2, d2] = signs[i + 1];
      if (m === m1 && d >= d1 || m === m2 && d < d2 && m1 !== m2 || (m > m1 && m < m2)) {
        // simpler approach:
      }
    }
    // clean approach
    const table = [
      ['Capricorn', 1, 19], ['Aquarius', 2, 18], ['Pisces', 3, 20], ['Aries', 4, 19],
      ['Taurus', 5, 20], ['Gemini', 6, 20], ['Cancer', 7, 22], ['Leo', 8, 22],
      ['Virgo', 9, 22], ['Libra', 10, 22], ['Scorpio', 11, 21], ['Sagittarius', 12, 21], ['Capricorn', 12, 31]
    ];
    sign = 'Capricorn';
    for (const [name, mo, da] of table) {
      if (m < mo || (m === mo && d <= da)) { sign = name; break; }
    }
    return `Sun sign: ${sign}`;
  }
});

Tools.register({
  id: 'refinance', cat: 'finance', name: 'Mortgage Refinance',
  desc: 'Compare old vs new rate',
  fields: [{k:'bal',l:'Balance',d:280000},{k:'oldRate',l:'Current rate %',d:7.2},{k:'newRate',l:'New rate %',d:6.1},{k:'years',l:'Years left',d:25},{k:'cost',l:'Closing costs',d:3000}],
  run: ({ bal, oldRate, newRate, years, cost }) => {
    const oldL=Finance.loan(bal,oldRate,years),neu=Finance.loan(bal,newRate,years);
  if(!oldL||!neu)return 'Invalid';
  const save=(oldL.payment-neu.payment)*neu.months-num(cost);
  return `Old pay $${fmt(oldL.payment)} → New $${fmt(neu.payment)}/mo\nMonthly save $${fmt(oldL.payment-neu.payment)}\nNet save over term (after costs): $${fmt(save)}`;
  }
});

Tools.register({
  id: 'rent-vs-buy', cat: 'finance', name: 'Rent vs Buy',
  desc: 'Simple 5-year cash compare',
  fields: [{k:'rent',l:'Monthly rent',d:2000},{k:'price',l:'Home price',d:400000},{k:'downPct',l:'Down %',d:20},{k:'rate',l:'Mortgage %',d:6.5},{k:'years',l:'Compare years',d:5}],
  run: ({ rent, price, downPct, rate, years }) => {
    const down=num(price)*num(downPct)/100;
  const m=Finance.loan(num(price)-down,rate,30);
  if(!m)return 'Invalid';
  const rentTot=num(rent)*12*num(years);
  const buyTot=down+m.payment*12*num(years);
  return `Rent ${years}y: $${fmt(rentTot)}\nBuy cash out (down+payments): $${fmt(buyTot)}\nMortgage pay: $${fmt(m.payment)}/mo\n(Ignores tax, maintenance, appreciation)`;
  }
});

Tools.register({
  id: 'npv', cat: 'finance', name: 'NPV',
  desc: 'Net present value of cash flows',
  fields: [{k:'rate',l:'Discount rate %',d:8},{k:'flows',l:'Cash flows year0,year1,...',type:'text',d:'-10000,3000,3000,3000,3000'}],
  run: ({ rate, flows }) => {
    const r=num(rate)/100;
  const f=String(flows).split(/[,\s]+/).map(Number).filter(x=>!isNaN(x));
  let npv=0;
  f.forEach((cf,t)=>{npv+=cf/Math.pow(1+r,t);});
  return `NPV: $${fmt(npv)}`;
  }
});

Tools.register({
  id: 'paycheck', cat: 'finance', name: 'Paycheck Estimate',
  desc: 'Rough US-style net',
  fields: [{k:'gross',l:'Gross pay (period)',d:3000},{k:'fed',l:'Fed tax %',d:12},{k:'state',l:'State tax %',d:5},{k:'fica',l:'FICA %',d:7.65}],
  run: ({ gross, fed, state, fica }) => {
    const g=num(gross);
  const tax=g*(num(fed)+num(state)+num(fica))/100;
  return `Gross: $${fmt(g)}\nEst. taxes: $${fmt(tax)}\nNet: $${fmt(g-tax)}\n(Estimate only)`;
  }
});

Tools.register({
  id: 'overtime', cat: 'finance', name: 'Overtime Pay',
  desc: 'Regular + OT',
  fields: [{k:'rate',l:'Hourly rate',d:25},{k:'reg',l:'Regular hours',d:40},{k:'ot',l:'OT hours',d:8},{k:'mult',l:'OT multiplier',d:1.5}],
  run: ({ rate, reg, ot, mult }) => {
    const regPay = num(rate)*num(reg), otPay = num(rate)*num(mult)*num(ot);
    return `Regular: $${fmt(regPay)}\nOvertime: $${fmt(otPay)}\nTotal: $${fmt(regPay+otPay)}`;
  }
});

Tools.register({
  id: 'commission', cat: 'finance', name: 'Commission',
  desc: 'Sales commission',
  fields: [{k:'sales',l:'Sales $',d:50000},{k:'pct',l:'Commission %',d:8}],
  run: ({ sales, pct }) => {
    return `Commission: $${fmt(num(sales)*num(pct)/100)}`;
  }
});

Tools.register({
  id: 'dti', cat: 'finance', name: 'Debt-to-Income',
  desc: 'DTI ratio',
  fields: [{k:'debt',l:'Monthly debt payments',d:1500},{k:'income',l:'Gross monthly income',d:6000}],
  run: ({ debt, income }) => {
    const dti=num(debt)/Math.max(1,num(income))*100;
  return `DTI: ${fmt(dti)}%\n${dti<36?'Typically acceptable':'May be high for lenders'}`;
  }
});

Tools.register({
  id: 'net-worth', cat: 'finance', name: 'Net Worth',
  desc: 'Assets − liabilities',
  fields: [{k:'assets',l:'Total assets',d:350000},{k:'debt',l:'Total debts',d:180000}],
  run: ({ assets, debt }) => {
    return `Net worth: $${fmt(num(assets)-num(debt))}`;
  }
});

Tools.register({
  id: 'savings-goal', cat: 'finance', name: 'Savings Goal',
  desc: 'Months to reach goal',
  fields: [{k:'goal',l:'Goal $',d:10000},{k:'have',l:'Already saved',d:2000},{k:'monthly',l:'Monthly save',d:400}],
  run: ({ goal, have, monthly }) => {
    const need=num(goal)-num(have);
  if(need<=0)return 'Goal already met';
  const m=need/Math.max(1,num(monthly));
  return `${fmt(m,1)} months (${fmt(m/12,1)} years)`;
  }
});

Tools.register({
  id: 'stock-return', cat: 'finance', name: 'Stock Return',
  desc: 'Gain with dividends',
  fields: [{k:'buy',l:'Buy price',d:100},{k:'sell',l:'Sell price',d:130},{k:'div',l:'Dividends total',d:5},{k:'shares',l:'Shares',d:10}],
  run: ({ buy, sell, div, shares }) => {
    const gain=(num(sell)-num(buy))*num(shares)+num(div);
  const pct=gain/(num(buy)*num(shares))*100;
  return `Profit: $${fmt(gain)}\nReturn: ${fmt(pct)}%`;
  }
});

Tools.register({
  id: 'lean-mass', cat: 'health', name: 'Lean Body Mass',
  desc: 'Boer formula',
  fields: [{k:'sex',l:'Sex 1=male 0=female',d:1},{k:'kg',l:'Weight kg',d:75},{k:'cm',l:'Height cm',d:175}],
  run: ({ sex, kg, cm }) => {
    let lbm=num(sex)>=1?0.407*num(kg)+0.267*num(cm)-19.2:0.252*num(kg)+0.473*num(cm)-48.3;
  return `Lean mass ≈ ${fmt(lbm,1)} kg\nFat mass ≈ ${fmt(num(kg)-lbm,1)} kg`;
  }
});

Tools.register({
  id: 'whr', cat: 'health', name: 'Waist-Hip Ratio',
  desc: 'Health risk indicator',
  fields: [{k:'waist',l:'Waist cm',d:85},{k:'hip',l:'Hip cm',d:95},{k:'sex',l:'Sex 1=male 0=female',d:1}],
  run: ({ waist, hip, sex }) => {
    const r=num(waist)/num(hip);
  const risk=num(sex)>=1?(r>0.9?'Higher':'Lower'):(r>0.85?'Higher':'Lower');
  return `WHR: ${fmt(r,2)}\nRisk band: ${risk}`;
  }
});

Tools.register({
  id: 'bsa', cat: 'health', name: 'Body Surface Area',
  desc: 'Mosteller',
  fields: [{k:'kg',l:'Weight kg',d:75},{k:'cm',l:'Height cm',d:175}],
  run: ({ kg, cm }) => {
    const bsa=Math.sqrt(num(cm)*num(kg)/3600);
  return `BSA ≈ ${fmt(bsa,2)} m²`;
  }
});

Tools.register({
  id: 'macro', cat: 'health', name: 'Macro Split',
  desc: 'Protein/carbs/fat grams',
  fields: [{k:'kcal',l:'Daily kcal',d:2200},{k:'p',l:'Protein %',d:30},{k:'c',l:'Carbs %',d:40},{k:'f',l:'Fat %',d:30}],
  run: ({ kcal, p, c, f }) => {
    const k=num(kcal);
  return `Protein: ${fmt(k*num(p)/100/4,0)} g\nCarbs: ${fmt(k*num(c)/100/4,0)} g\nFat: ${fmt(k*num(f)/100/9,0)} g`;
  }
});

Tools.register({
  id: 'fasting', cat: 'health', name: 'Intermittent Fasting Window',
  desc: 'Eating window',
  fields: [{k:'fast',l:'Fast hours',d:16}],
  run: ({ fast }) => {
    const eat=24-num(fast);
  return `${fast}:${eat} schedule\nFast ${fast}h · Eat ${eat}h`;
  }
});

Tools.register({
  id: 'decimal-frac', cat: 'math', name: 'Decimal ↔ Fraction',
  desc: 'Convert decimal',
  fields: [{k:'x',l:'Decimal',d:0.375}],
  run: ({ x }) => {
    return Sci.toFraction?Sci.toFraction(num(x))||String(x):String(x);
  }
});

Tools.register({
  id: 'mean-only', cat: 'math', name: 'Weighted Average',
  desc: 'values,weights',
  fields: [{k:'vals',l:'Values',type:'text',d:'80,90,70'},{k:'weights',l:'Weights',type:'text',d:'1,1,2'}],
  run: ({ vals, weights }) => {
    const v=String(vals).split(/[,\s]+/).map(Number);
    const w=String(weights).split(/[,\s]+/).map(Number);
    let s=0,tw=0;
    v.forEach((x,i)=>{const wi=w[i]||1;s+=x*wi;tw+=wi;});
    return tw?`Weighted avg: ${fmt(s/tw,4)}`:'No data';
  }
});

Tools.register({
  id: 'zscore', cat: 'math', name: 'Z-Score',
  desc: '(x−μ)/σ',
  fields: [{k:'x',l:'x',d:85},{k:'mu',l:'Mean μ',d:70},{k:'sig',l:'Std σ',d:10}],
  run: ({ x, mu, sig }) => {
    return `z = ${fmt((num(x)-num(mu))/num(sig),4)}`;
  }
});

Tools.register({
  id: 'binomial', cat: 'math', name: 'Binomial Probability',
  desc: 'P(X=k)',
  fields: [{k:'n',l:'Trials n',d:10},{k:'k',l:'Successes k',d:3},{k:'p',l:'p success',d:0.5}],
  run: ({ n, k, p }) => {
    const N=Math.floor(num(n)),K=Math.floor(num(k)),P=num(p);
  const fact=x=>{let r=1;for(let i=2;i<=x;i++)r*=i;return r;};
  const c=fact(N)/(fact(K)*fact(N-K));
  const prob=c*Math.pow(P,K)*Math.pow(1-P,N-K);
  return `P(X=${K}) = ${fmt(prob,6)}`;
  }
});

Tools.register({
  id: 'sample-size', cat: 'math', name: 'Sample Size',
  desc: 'Rough proportion SS',
  fields: [{k:'conf',l:'Z (1.96≈95%)',d:1.96},{k:'p',l:'Expected p',d:0.5},{k:'e',l:'Margin of error',d:0.05}],
  run: ({ conf, p, e }) => {
    const n=num(conf)*num(conf)*num(p)*(1-num(p))/(num(e)*num(e));
  return `n ≈ ${fmt(Math.ceil(n),0)}`;
  }
});

Tools.register({
  id: 'roman-decode', cat: 'convert', name: 'Roman → Number',
  desc: 'Parse Roman',
  fields: [{k:'s',l:'Roman',type:'text',d:'MMXXVI'}],
  run: ({ s }) => {
    const map={M:1000,D:500,C:100,L:50,X:10,V:5,I:1};
    const str=String(s).toUpperCase();
    let n=0;
    for(let i=0;i<str.length;i++){
      const v=map[str[i]]||0, next=map[str[i+1]]||0;
      n+=v<next?-v:v;
    }
    return String(n);
  }
});

Tools.register({
  id: 'hex-dec', cat: 'convert', name: 'Hex ↔ Decimal',
  desc: 'Convert base',
  fields: [{k:'v',l:'Value',type:'text',d:'FF'},{k:'mode',l:'1=hex→dec 2=dec→hex',d:1}],
  run: ({ v, mode }) => {
    if(num(mode)===2)return Number(v).toString(16).toUpperCase();
  return String(parseInt(String(v),16));
  }
});

Tools.register({
  id: 'temp-batch', cat: 'convert', name: 'Temperature Batch',
  desc: 'C F K together',
  fields: [{k:'c',l:'Celsius',d:22}],
  run: ({ c }) => {
    const C=num(c),f=C*9/5+32,k=C+273.15;
    return `${fmt(C,1)}°C = ${fmt(f,1)}°F = ${fmt(k,1)} K`;
  }
});

Tools.register({
  id: 'flooring', cat: 'home', name: 'Flooring Cost',
  desc: 'Area × price',
  fields: [{k:'l',l:'Length ft',d:12},{k:'w',l:'Width ft',d:10},{k:'price',l:'$/sqft',d:3.5},{k:'waste',l:'Waste %',d:10}],
  run: ({ l, w, price, waste }) => {
    const area=num(l)*num(w)*(1+num(waste)/100);
  return `${fmt(area,1)} sqft needed\nCost: $${fmt(area*num(price))}`;
  }
});

Tools.register({
  id: 'fence', cat: 'home', name: 'Fence Length',
  desc: 'Perimeter estimate',
  fields: [{k:'l',l:'Length ft',d:50},{k:'w',l:'Width ft',d:30},{k:'gates',l:'Gate openings ft',d:4}],
  run: ({ l, w, gates }) => {
    const p=2*(num(l)+num(w))-num(gates);
  return `Fence run ≈ ${fmt(p,1)} ft`;
  }
});

Tools.register({
  id: 'roofing', cat: 'home', name: 'Roofing Squares',
  desc: 'Squares + waste',
  fields: [{k:'area',l:'Roof area sqft',d:1800},{k:'pitch',l:'Pitch factor 1.0–1.4',d:1.15},{k:'waste',l:'Waste %',d:10}],
  run: ({ area, pitch, waste }) => {
    const sq=num(area)*num(pitch)*(1+num(waste)/100)/100;
  return `${fmt(sq,2)} squares`;
  }
});

Tools.register({
  id: 'stairs', cat: 'home', name: 'Stair Rise/Run',
  desc: 'Step count',
  fields: [{k:'total',l:'Total rise inches',d:108},{k:'rise',l:'Target rise/step in',d:7}],
  run: ({ total, rise }) => {
    const steps=Math.round(num(total)/num(rise));
  const actual=num(total)/steps;
  return `${steps} steps\nActual rise: ${fmt(actual,2)} in`;
  }
});

Tools.register({
  id: 'gravel', cat: 'home', name: 'Gravel Volume',
  desc: 'L×W×D',
  fields: [{k:'l',l:'Length ft',d:20},{k:'w',l:'Width ft',d:10},{k:'d',l:'Depth inches',d:4}],
  run: ({ l, w, d }) => {
    const yd=num(l)*num(w)*(num(d)/12)/27;
  return `${fmt(yd,2)} cubic yards`;
  }
});

Tools.register({
  id: 'mpg', cat: 'auto', name: 'MPG / Fuel Economy',
  desc: 'Miles per gallon',
  fields: [{k:'miles',l:'Miles driven',d:350},{k:'gallons',l:'Gallons used',d:12}],
  run: ({ miles, gallons }) => {
    const mpg=num(miles)/num(gallons);
  return `${fmt(mpg,1)} MPG\n${fmt(235.215/mpg,1)} L/100km`;
  }
});

Tools.register({
  id: 'ev-charge', cat: 'auto', name: 'EV Charge Cost',
  desc: 'kWh cost',
  fields: [{k:'kwh',l:'kWh added',d:40},{k:'rate',l:'$/kWh',d:0.16}],
  run: ({ kwh, rate }) => {
    return `Cost: $${fmt(num(kwh)*num(rate))}`;
  }
});

Tools.register({
  id: 'lease', cat: 'auto', name: 'Lease Payment',
  desc: 'Simple lease est.',
  fields: [{k:'cap',l:'Cap cost',d:35000},{k:'resid',l:'Residual %',d:55},{k:'money',l:'Money factor',d:0.0025},{k:'months',l:'Term months',d:36}],
  run: ({ cap, resid, money, months }) => {
    const residual=num(cap)*num(resid)/100;
  const dep=(num(cap)-residual)/num(months);
  const finance=(num(cap)+residual)*num(money);
  return `Est. payment: $${fmt(dep+finance)}/mo`;
  }
});

Tools.register({
  id: 'molarity', cat: 'science', name: 'Molarity',
  desc: 'moles / liters',
  fields: [{k:'moles',l:'Moles solute',d:0.5},{k:'liters',l:'Liters solution',d:2}],
  run: ({ moles, liters }) => {
    return `Molarity: ${fmt(num(moles)/num(liters),4)} M`;
  }
});

Tools.register({
  id: 'ph', cat: 'science', name: 'pH from [H+]',
  desc: 'pH = −log10',
  fields: [{k:'h',l:'[H+] mol/L',d:0.0001}],
  run: ({ h }) => {
    return `pH = ${fmt(-Math.log10(num(h)),2)}`;
  }
});

Tools.register({
  id: 'density', cat: 'science', name: 'Density',
  desc: 'm/V',
  fields: [{k:'m',l:'Mass',d:100},{k:'v',l:'Volume',d:50}],
  run: ({ m, v }) => {
    return `Density: ${fmt(num(m)/num(v),4)}`;
  }
});

Tools.register({
  id: 'force', cat: 'science', name: 'Force F=ma',
  desc: 'Newton II',
  fields: [{k:'m',l:'Mass kg',d:10},{k:'a',l:'Accel m/s²',d:9.81}],
  run: ({ m, a }) => {
    return `F = ${fmt(num(m)*num(a))} N`;
  }
});

Tools.register({
  id: 'momentum', cat: 'science', name: 'Momentum',
  desc: 'p=mv',
  fields: [{k:'m',l:'Mass kg',d:5},{k:'v',l:'Velocity m/s',d:3}],
  run: ({ m, v }) => {
    return `p = ${fmt(num(m)*num(v))} kg·m/s`;
  }
});

Tools.register({
  id: 'pressure', cat: 'science', name: 'Pressure',
  desc: 'F/A',
  fields: [{k:'f',l:'Force N',d:100},{k:'a',l:'Area m²',d:0.01}],
  run: ({ f, a }) => {
    return `P = ${fmt(num(f)/num(a))} Pa`;
  }
});

Tools.register({
  id: 'power-elec', cat: 'science', name: 'Electrical Power',
  desc: 'P=VI',
  fields: [{k:'v',l:'Volts',d:120},{k:'i',l:'Amps',d:10}],
  run: ({ v, i }) => {
    return `P = ${fmt(num(v)*num(i))} W = ${fmt(num(v)*num(i)/1000,3)} kW`;
  }
});

Tools.register({
  id: 'attendance', cat: 'edu', name: 'Attendance %',
  desc: 'Present / total',
  fields: [{k:'present',l:'Days present',d:42},{k:'total',l:'Total days',d:45}],
  run: ({ present, total }) => {
    return `${fmt(num(present)/num(total)*100,1)}% attendance`;
  }
});

Tools.register({
  id: 'study-hours', cat: 'edu', name: 'Study Hours Plan',
  desc: 'Hours per course',
  fields: [{k:'credits',l:'Credit hours',d:15},{k:'mult',l:'Hours per credit',d:2}],
  run: ({ credits, mult }) => {
    return `${fmt(num(credits)*num(mult),0)} study hours/week recommended`;
  }
});

Tools.register({
  id: 'cac', cat: 'biz', name: 'Customer Acquisition Cost',
  desc: 'Spend / customers',
  fields: [{k:'spend',l:'Marketing spend',d:10000},{k:'cust',l:'New customers',d:50}],
  run: ({ spend, cust }) => {
    return `CAC: $${fmt(num(spend)/num(cust))}`;
  }
});

Tools.register({
  id: 'gross-profit', cat: 'biz', name: 'Gross Profit',
  desc: 'Revenue − COGS',
  fields: [{k:'rev',l:'Revenue',d:100000},{k:'cogs',l:'COGS',d:60000}],
  run: ({ rev, cogs }) => {
    const gp=num(rev)-num(cogs);
  return `Gross profit: $${fmt(gp)}\nMargin: ${fmt(gp/num(rev)*100)}%`;
  }
});

Tools.register({
  id: 'inventory-turns', cat: 'biz', name: 'Inventory Turnover',
  desc: 'COGS / inventory',
  fields: [{k:'cogs',l:'COGS',d:500000},{k:'inv',l:'Avg inventory',d:100000}],
  run: ({ cogs, inv }) => {
    return `Turns: ${fmt(num(cogs)/num(inv),2)}× / year`;
  }
});

Tools.register({
  id: 'tip-split', cat: 'life', name: 'Bill Split Equal',
  desc: 'Even split',
  fields: [{k:'total',l:'Total',d:120},{k:'n',l:'People',d:3}],
  run: ({ total, n }) => {
    return `Each pays $${fmt(num(total)/Math.max(1,num(n)))}`;
  }
});

Tools.register({
  id: 'sleep', cat: 'life', name: 'Sleep Cycles',
  desc: '90-min cycles',
  fields: [{k:'wake',l:'Wake time HH:MM',type:'text',d:'07:00'},{k:'cycles',l:'Cycles (5–6)',d:5}],
  run: ({ wake, cycles }) => {
    const [h,m]=String(wake).split(':').map(Number);
  let mins=h*60+m-num(cycles)*90-15;
  if(mins<0)mins+=24*60;
  const hh=Math.floor(mins/60)%24, mm=mins%60;
  return `Try sleeping at ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}\n(${cycles} cycles + 15m fall-asleep)`;
  }
});

Tools.register({
  id: 'countdown', cat: 'life', name: 'Countdown Days',
  desc: 'Days until date',
  fields: [{k:'date',l:'Target YYYY-MM-DD',type:'text',d:'2026-12-25'}],
  run: ({ date }) => {
    const t=new Date(date), now=new Date();
  if(isNaN(t))return 'Invalid';
  const days=Math.ceil((t-now)/86400000);
  return days>=0?`${days} days remaining`:`${-days} days ago`;
  }
});

Tools.register({
  id: 'wind-chill', cat: 'life', name: 'Wind Chill',
  desc: 'US formula °F',
  fields: [{k:'t',l:'Temp °F',d:20},{k:'v',l:'Wind mph',d:15}],
  run: ({ t, v }) => {
    const T=num(t),V=num(v);
  if(T>50||V<3)return 'Formula for ≤50°F and ≥3 mph';
  const wc=35.74+0.6215*T-35.75*Math.pow(V,0.16)+0.4275*T*Math.pow(V,0.16);
  return `Wind chill: ${fmt(wc,1)}°F`;
  }
});

Tools.register({
  id: 'heat-index', cat: 'life', name: 'Heat Index',
  desc: 'Approx °F',
  fields: [{k:'t',l:'Temp °F',d:92},{k:'rh',l:'Humidity %',d:60}],
  run: ({ t, rh }) => {
    const T=num(t),R=num(rh);
  const HI=-42.379+2.04901523*T+10.14333127*R-0.22475541*T*R-6.83783e-3*T*T-5.481717e-2*R*R+1.22874e-3*T*T*R+8.5282e-4*T*R*R-1.99e-6*T*T*R*R;
  return `Heat index ≈ ${fmt(HI,1)}°F`;
  }
});

Tools.register({
  id: 'uuid', cat: 'fun', name: 'Random UUID-like',
  desc: 'Pseudo UUID',
  fields: [],
  run: () => {
    const h=()=>Math.floor(Math.random()*16).toString(16);
  let s='';
  for(let i=0;i<32;i++)s+=h();
  return s.slice(0,8)+'-'+s.slice(8,12)+'-4'+s.slice(13,16)+'-a'+s.slice(17,20)+'-'+s.slice(20,32);
  }
});

Tools.register({
  id: 'dice', cat: 'fun', name: 'Dice Roller',
  desc: 'NdM',
  fields: [{k:'n',l:'Number of dice',d:2},{k:'sides',l:'Sides',d:6}],
  run: ({ n, sides }) => {
    const N=Math.min(20,Math.max(1,Math.floor(num(n))));
  const S=Math.max(2,Math.floor(num(sides)));
  const rolls=[];
  let sum=0;
  for(let i=0;i<N;i++){const r=1+Math.floor(Math.random()*S);rolls.push(r);sum+=r;}
  return `Rolls: ${rolls.join(', ')}\nSum: ${sum}`;
  }
});

Tools.register({
  id: 'coin', cat: 'fun', name: 'Coin Flip',
  desc: 'Heads or tails',
  fields: [{k:'n',l:'Flips',d:1}],
  run: ({ n }) => {
    const N=Math.min(50,Math.max(1,Math.floor(num(n))));
  const r=[];
  for(let i=0;i<N;i++)r.push(Math.random()<0.5?'H':'T');
  return r.join(' ');
  }
});

Tools.register({
  id: 'crypto-pnl', cat: 'finance', name: 'Crypto P&L',
  desc: 'Buy/sell profit',
  fields: [{k:'buy',l:'Buy price',d:40000},{k:'sell',l:'Sell price',d:52000},{k:'qty',l:'Quantity',d:0.5},{k:'feePct',l:'Fee % total',d:0.2}],
  run: ({ buy, sell, qty, feePct }) => {
    const gross=(num(sell)-num(buy))*num(qty);
  const fees=(num(buy)+num(sell))*num(qty)*num(feePct)/100;
  return `Gross: $${fmt(gross)}\nFees: $${fmt(fees)}\nNet: $${fmt(gross-fees)}`;
  }
});


/* ── Remaining catalog (batch) ── */
Tools.register({
  id: 'fire', cat: 'finance', name: 'FIRE Number',
  desc: '25× annual expenses rule',
  fields: [{ k: 'expenses', l: 'Annual expenses $', d: 40000 }],
  run: ({ expenses }) => {
    const n = num(expenses) * 25;
    return `FIRE target (4% rule): $${fmt(n)}\nMonthly passive @4%: $${fmt(n * 0.04 / 12)}`;
  }
});

Tools.register({
  id: '401k', cat: 'finance', name: '401(k) Growth',
  desc: 'With match & contributions',
  fields: [
    { k: 'bal', l: 'Current balance', d: 25000 },
    { k: 'contrib', l: 'Your $/year', d: 8000 },
    { k: 'match', l: 'Employer match $/year', d: 4000 },
    { k: 'rate', l: 'Return %/yr', d: 7 },
    { k: 'years', l: 'Years', d: 20 },
  ],
  run: ({ bal, contrib, match, rate, years }) => {
    let b = num(bal); const r = num(rate) / 100;
    for (let y = 0; y < num(years); y++) b = b * (1 + r) + num(contrib) + num(match);
    return `Projected: $${fmt(b)}\nYou put in: $${fmt(num(bal) + num(contrib) * num(years))}`;
  }
});

Tools.register({
  id: 'irr-approx', cat: 'finance', name: 'IRR Approx (2-cashflow)',
  desc: 'Simple 2-period IRR',
  fields: [
    { k: 'invest', l: 'Initial outlay (positive)', d: 10000 },
    { k: 'return', l: 'Final value', d: 15000 },
    { k: 'years', l: 'Years', d: 3 },
  ],
  run: ({ invest, return: ret, years }) => {
    const irr = Math.pow(num(ret) / num(invest), 1 / num(years)) - 1;
    return `Approx IRR: ${fmt(irr * 100)}%/yr`;
  }
});

Tools.register({
  id: 'roas', cat: 'biz', name: 'ROAS',
  desc: 'Return on ad spend',
  fields: [
    { k: 'rev', l: 'Revenue from ads', d: 25000 },
    { k: 'spend', l: 'Ad spend', d: 5000 },
  ],
  run: ({ rev, spend }) => `ROAS: ${fmt(num(rev) / num(spend), 2)}×\nROI: ${fmt((num(rev) - num(spend)) / num(spend) * 100)}%`
});

Tools.register({
  id: 'cpc', cat: 'biz', name: 'CPC',
  desc: 'Cost per click',
  fields: [
    { k: 'cost', l: 'Ad cost', d: 500 },
    { k: 'clicks', l: 'Clicks', d: 1200 },
  ],
  run: ({ cost, clicks }) => `CPC: $${fmt(num(cost) / num(clicks), 3)}`
});

Tools.register({
  id: 'cpa', cat: 'biz', name: 'CPA',
  desc: 'Cost per acquisition',
  fields: [
    { k: 'cost', l: 'Spend', d: 2000 },
    { k: 'acq', l: 'Acquisitions', d: 40 },
  ],
  run: ({ cost, acq }) => `CPA: $${fmt(num(cost) / num(acq))}`
});

Tools.register({
  id: 'rule72', cat: 'finance', name: 'Rule of 72',
  desc: 'Years to double',
  fields: [{ k: 'rate', l: 'Annual return %', d: 8 }],
  run: ({ rate }) => `Doubles in ≈ ${fmt(72 / num(rate), 1)} years`
});

Tools.register({
  id: 'cap-rate', cat: 'finance', name: 'Cap Rate',
  desc: 'NOI / property value',
  fields: [
    { k: 'noi', l: 'Annual NOI', d: 24000 },
    { k: 'value', l: 'Property value', d: 400000 },
  ],
  run: ({ noi, value }) => `Cap rate: ${fmt(num(noi) / num(value) * 100)}%`
});

Tools.register({
  id: 'rental-yield', cat: 'finance', name: 'Rental Yield',
  desc: 'Annual rent / price',
  fields: [
    { k: 'rent', l: 'Monthly rent', d: 2200 },
    { k: 'price', l: 'Property price', d: 350000 },
  ],
  run: ({ rent, price }) => {
    const y = num(rent) * 12 / num(price) * 100;
    return `Gross yield: ${fmt(y)}%`;
  }
});

Tools.register({
  id: 'closing-cost', cat: 'finance', name: 'Closing Cost Est.',
  desc: '% of price',
  fields: [
    { k: 'price', l: 'Price', d: 400000 },
    { k: 'pct', l: 'Closing %', d: 3 },
  ],
  run: ({ price, pct }) => `Est. closing: $${fmt(num(price) * num(pct) / 100)}`
});

Tools.register({
  id: 'property-tax', cat: 'finance', name: 'Property Tax',
  desc: 'Assessed × rate',
  fields: [
    { k: 'assessed', l: 'Assessed value', d: 380000 },
    { k: 'rate', l: 'Tax rate %', d: 1.2 },
  ],
  run: ({ assessed, rate }) => {
    const y = num(assessed) * num(rate) / 100;
    return `Annual: $${fmt(y)}\nMonthly escrow: $${fmt(y / 12)}`;
  }
});

Tools.register({
  id: 'keto-macros', cat: 'health', name: 'Keto Macro Split',
  desc: 'High fat default split',
  fields: [{ k: 'kcal', l: 'Daily kcal', d: 2000 }],
  run: ({ kcal }) => {
    const k = num(kcal);
    return `Fat 70%: ${fmt(k * 0.7 / 9, 0)} g\nProtein 25%: ${fmt(k * 0.25 / 4, 0)} g\nCarbs 5%: ${fmt(k * 0.05 / 4, 0)} g`;
  }
});

Tools.register({
  id: 'pregnancy-weight', cat: 'health', name: 'Pregnancy Weight Gain',
  desc: 'IOM guideline range (normal BMI)',
  fields: [
    { k: 'week', l: 'Gestational week', d: 20 },
    { k: 'bmi', l: 'Pre-pregnancy BMI', d: 22 },
  ],
  run: ({ week, bmi }) => {
    // simplified total gain targets
    let min = 25, max = 35; // lb normal
    if (num(bmi) < 18.5) { min = 28; max = 40; }
    else if (num(bmi) >= 25 && num(bmi) < 30) { min = 15; max = 25; }
    else if (num(bmi) >= 30) { min = 11; max = 20; }
    const frac = Math.min(1, Math.max(0, (num(week) - 12) / 28));
    return `Full-term gain guide: ${min}–${max} lb\nBy week ${week}: ~${fmt(min * frac, 1)}–${fmt(max * frac, 1)} lb\n(Informational only)`;
  }
});

Tools.register({
  id: 'vo2-cooper', cat: 'health', name: 'VO2max (Cooper)',
  desc: 'From 12-min run distance',
  fields: [{ k: 'meters', l: 'Distance in 12 min (m)', d: 2500 }],
  run: ({ meters }) => {
    const vo2 = (num(meters) - 504.9) / 44.73;
    return `Est. VO2max: ${fmt(vo2, 1)} ml/kg/min`;
  }
});

Tools.register({
  id: 'target-hr', cat: 'health', name: 'Target HR (Karvonen)',
  desc: 'Training HR with resting',
  fields: [
    { k: 'age', l: 'Age', d: 30 },
    { k: 'rest', l: 'Resting HR', d: 60 },
    { k: 'int', l: 'Intensity %', d: 70 },
  ],
  run: ({ age, rest, int: intensity }) => {
    const max = 220 - num(age);
    const thr = (max - num(rest)) * num(intensity) / 100 + num(rest);
    return `Target HR: ${fmt(thr, 0)} bpm`;
  }
});

Tools.register({
  id: 'matrix-2x2', cat: 'math', name: '2×2 Matrix Det/Inv',
  desc: 'Determinant & inverse',
  fields: [
    { k: 'a', l: 'a', d: 1 }, { k: 'b', l: 'b', d: 2 },
    { k: 'c', l: 'c', d: 3 }, { k: 'd', l: 'd', d: 4 },
  ],
  run: ({ a, b, c, d }) => {
    const A = num(a), B = num(b), C = num(c), D = num(d);
    const det = A * D - B * C;
    if (Math.abs(det) < 1e-12) return `Det = 0 (not invertible)`;
    return `Det = ${fmt(det, 6)}\nInverse:\n[${fmt(D / det, 4)}  ${fmt(-B / det, 4)}]\n[${fmt(-C / det, 4)}  ${fmt(A / det, 4)}]`;
  }
});

Tools.register({
  id: 'percent-change', cat: 'math', name: 'Percent Change',
  desc: 'Old → new',
  fields: [
    { k: 'old', l: 'Old value', d: 80 },
    { k: 'neu', l: 'New value', d: 100 },
  ],
  run: ({ old, neu }) => {
    const pct = (num(neu) - num(old)) / num(old) * 100;
    return `${pct >= 0 ? 'Increase' : 'Decrease'}: ${fmt(Math.abs(pct))}%`;
  }
});

Tools.register({
  id: 'pythagoras', cat: 'math', name: 'Pythagoras',
  desc: 'Right triangle',
  fields: [
    { k: 'a', l: 'a (0=solve)', d: 3 },
    { k: 'b', l: 'b (0=solve)', d: 4 },
    { k: 'c', l: 'c hypotenuse (0=solve)', d: 0 },
  ],
  run: ({ a, b, c }) => {
    let A = num(a), B = num(b), C = num(c);
    if (!C && A && B) C = Math.sqrt(A * A + B * B);
    else if (!A && B && C) A = Math.sqrt(C * C - B * B);
    else if (!B && A && C) B = Math.sqrt(C * C - A * A);
    return `a=${fmt(A, 4)}  b=${fmt(B, 4)}  c=${fmt(C, 4)}`;
  }
});

Tools.register({
  id: 'area-circle', cat: 'math', name: 'Circle Area/Circ',
  desc: 'From radius',
  fields: [{ k: 'r', l: 'Radius', d: 5 }],
  run: ({ r }) => `Area: ${fmt(Math.PI * num(r) * num(r), 4)}\nCircumference: ${fmt(2 * Math.PI * num(r), 4)}`
});

Tools.register({
  id: 'volume-cyl', cat: 'math', name: 'Cylinder Volume',
  desc: 'πr²h',
  fields: [
    { k: 'r', l: 'Radius', d: 3 },
    { k: 'h', l: 'Height', d: 10 },
  ],
  run: ({ r, h }) => `Volume: ${fmt(Math.PI * num(r) * num(r) * num(h), 4)}`
});

Tools.register({
  id: 'grade-weighted', cat: 'edu', name: 'Weighted Grade',
  desc: 'scores & weights %',
  fields: [
    { k: 'scores', l: 'Scores e.g. 90,80,70', type: 'text', d: '90,85,78' },
    { k: 'weights', l: 'Weights % e.g. 20,30,50', type: 'text', d: '20,30,50' },
  ],
  run: ({ scores, weights }) => {
    const s = String(scores).split(/[,\s]+/).map(Number);
    const w = String(weights).split(/[,\s]+/).map(Number);
    let tot = 0, tw = 0;
    s.forEach((x, i) => { const wi = w[i] || 0; tot += x * wi; tw += wi; });
    if (Math.abs(tw - 100) > 1) return `Weighted: ${fmt(tot / Math.max(tw, 1), 2)} (weights sum ${tw}, usually 100)`;
    return `Course grade: ${fmt(tot / 100, 2)}%`;
  }
});

Tools.register({
  id: 'wallpaper', cat: 'home', name: 'Wallpaper Rolls',
  desc: 'Rough roll count',
  fields: [
    { k: 'sqft', l: 'Wall area sqft', d: 400 },
    { k: 'roll', l: 'Sqft per roll', d: 30 },
    { k: 'waste', l: 'Waste %', d: 15 },
  ],
  run: ({ sqft, roll, waste }) => {
    const need = num(sqft) * (1 + num(waste) / 100) / num(roll);
    return `≈ ${fmt(Math.ceil(need), 0)} rolls`;
  }
});

Tools.register({
  id: 'drywall', cat: 'home', name: 'Drywall Sheets',
  desc: '4×8 sheets',
  fields: [
    { k: 'sqft', l: 'Area sqft', d: 500 },
    { k: 'waste', l: 'Waste %', d: 10 },
  ],
  run: ({ sqft, waste }) => {
    const sheets = num(sqft) * (1 + num(waste) / 100) / 32;
    return `≈ ${fmt(Math.ceil(sheets), 0)} sheets (4×8)`;
  }
});

Tools.register({
  id: 'tile', cat: 'home', name: 'Tile Count',
  desc: 'Floor tiles needed',
  fields: [
    { k: 'room', l: 'Room sqft', d: 120 },
    { k: 'tile', l: 'Tile sqft each', d: 1 },
    { k: 'waste', l: 'Waste %', d: 10 },
  ],
  run: ({ room, tile, waste }) => {
    const n = num(room) * (1 + num(waste) / 100) / Math.max(0.01, num(tile));
    return `≈ ${fmt(Math.ceil(n), 0)} tiles`;
  }
});

Tools.register({
  id: 'insulation', cat: 'home', name: 'Insulation Batts',
  desc: 'Sqft coverage',
  fields: [
    { k: 'sqft', l: 'Area sqft', d: 1000 },
    { k: 'pack', l: 'Sqft per pack', d: 88 },
  ],
  run: ({ sqft, pack }) => `≈ ${fmt(Math.ceil(num(sqft) / num(pack)), 0)} packs`
});

Tools.register({
  id: 'velocity', cat: 'science', name: 'Velocity',
  desc: 'v = d/t',
  fields: [
    { k: 'd', l: 'Distance', d: 100 },
    { k: 't', l: 'Time', d: 9.5 },
  ],
  run: ({ d, t }) => `v = ${fmt(num(d) / num(t), 4)}`
});

Tools.register({
  id: 'acceleration', cat: 'science', name: 'Acceleration',
  desc: 'a = Δv/t',
  fields: [
    { k: 'dv', l: 'Δ velocity', d: 20 },
    { k: 't', l: 'Time', d: 4 },
  ],
  run: ({ dv, t }) => `a = ${fmt(num(dv) / num(t), 4)}`
});

Tools.register({
  id: 'current-ohm', cat: 'science', name: 'Current I=V/R',
  desc: 'Ohm current',
  fields: [
    { k: 'v', l: 'Volts', d: 12 },
    { k: 'r', l: 'Ohms', d: 4 },
  ],
  run: ({ v, r }) => `I = ${fmt(num(v) / num(r), 4)} A`
});

Tools.register({
  id: 'capacitor-energy', cat: 'science', name: 'Capacitor Energy',
  desc: 'E = ½CV²',
  fields: [
    { k: 'c', l: 'Farads', d: 0.001 },
    { k: 'v', l: 'Volts', d: 12 },
  ],
  run: ({ c, v }) => `E = ${fmt(0.5 * num(c) * num(v) * num(v), 6)} J`
});

Tools.register({
  id: 'bandwidth-time', cat: 'science', name: 'Bandwidth Transfer',
  desc: 'Time to transfer data',
  fields: [
    { k: 'gb', l: 'Data GB', d: 10 },
    { k: 'mbps', l: 'Mbps', d: 50 },
  ],
  run: ({ gb, mbps }) => {
    const sec = num(gb) * 8000 / num(mbps);
    return `${fmt(sec, 1)} s · ${fmt(sec / 60, 2)} min`;
  }
});

Tools.register({
  id: 'dilution', cat: 'science', name: 'Dilution C1V1=C2V2',
  desc: 'Solve for V1',
  fields: [
    { k: 'c1', l: 'C1 stock', d: 10 },
    { k: 'c2', l: 'C2 desired', d: 1 },
    { k: 'v2', l: 'V2 final volume', d: 100 },
  ],
  run: ({ c1, c2, v2 }) => {
    const v1 = num(c2) * num(v2) / num(c1);
    return `Use V1 = ${fmt(v1, 4)} of stock\nAdd ${fmt(num(v2) - v1, 4)} diluent`;
  }
});

Tools.register({
  id: 'mole', cat: 'science', name: 'Moles from Mass',
  desc: 'n = m/M',
  fields: [
    { k: 'mass', l: 'Mass g', d: 18 },
    { k: 'molar', l: 'Molar mass g/mol', d: 18 },
  ],
  run: ({ mass, molar }) => `n = ${fmt(num(mass) / num(molar), 6)} mol`
});

Tools.register({
  id: 'recipe-scale', cat: 'life', name: 'Recipe Scaler',
  desc: 'Scale ingredient amounts',
  fields: [
    { k: 'orig', l: 'Original servings', d: 4 },
    { k: 'want', l: 'Desired servings', d: 10 },
    { k: 'amount', l: 'Ingredient amount', d: 2 },
  ],
  run: ({ orig, want, amount }) => `Use ${fmt(num(amount) * num(want) / num(orig), 3)} (same units)`
});

Tools.register({
  id: 'carbon', cat: 'life', name: 'Carbon Footprint (travel)',
  desc: 'Rough kg CO₂ from km',
  fields: [
    { k: 'km', l: 'Distance km', d: 500 },
    { k: 'mode', l: '1=car 2=bus 3=plane', d: 1 },
  ],
  run: ({ km, mode }) => {
    const f = { 1: 0.17, 2: 0.09, 3: 0.25 }[Math.floor(num(mode))] || 0.17;
    return `≈ ${fmt(num(km) * f, 1)} kg CO₂\n(Very approximate)`;
  }
});

Tools.register({
  id: 'solar', cat: 'life', name: 'Solar Panel Estimate',
  desc: 'Panels for daily kWh',
  fields: [
    { k: 'kwh', l: 'Daily kWh needed', d: 20 },
    { k: 'sun', l: 'Peak sun hours', d: 4.5 },
    { k: 'watt', l: 'Panel watts', d: 400 },
  ],
  run: ({ kwh, sun, watt }) => {
    const needW = num(kwh) * 1000 / num(sun);
    const panels = Math.ceil(needW / num(watt));
    return `Array ≈ ${fmt(needW, 0)} W\n≈ ${panels} × ${watt}W panels`;
  }
});

Tools.register({
  id: 'chinese-zodiac', cat: 'fun', name: 'Chinese Zodiac',
  desc: 'From birth year',
  fields: [{ k: 'year', l: 'Birth year', d: 1990 }],
  run: ({ year }) => {
    const animals = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];
    const i = (Math.floor(num(year)) - 4) % 12;
    const idx = i < 0 ? i + 12 : i;
    return `${animals[idx]}`;
  }
});

Tools.register({
  id: 'day-of-week', cat: 'datetime', name: 'Day of Week',
  desc: 'What day was a date?',
  fields: [{ k: 'date', l: 'YYYY-MM-DD', type: 'text', d: '2026-09-20' }],
  run: ({ date }) => {
    const d = new Date(date);
    if (isNaN(d)) return 'Invalid';
    return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
});

Tools.register({
  id: 'leap-year', cat: 'datetime', name: 'Leap Year?',
  desc: 'Check year',
  fields: [{ k: 'year', l: 'Year', d: 2028 }],
  run: ({ year }) => {
    const y = Math.floor(num(year));
    const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    return leap ? `${y} is a leap year` : `${y} is not a leap year`;
  }
});

Tools.register({
  id: 'hash-simple', cat: 'fun', name: 'Simple String Hash',
  desc: 'djb2 hash (not crypto)',
  fields: [{ k: 'text', l: 'Text', type: 'text', d: 'hello' }],
  run: ({ text }) => {
    let h = 5381;
    const s = String(text);
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h) + s.charCodeAt(i);
    return `djb2: ${(h >>> 0).toString(16)}`;
  }
});

Tools.register({
  id: 'xp-level', cat: 'fun', name: 'XP to Level',
  desc: 'Simple RPG curve',
  fields: [
    { k: 'level', l: 'Target level', d: 10 },
    { k: 'base', l: 'Base XP', d: 100 },
  ],
  run: ({ level, base }) => {
    let total = 0;
    for (let L = 1; L < num(level); L++) total += num(base) * L;
    return `XP to reach L${level}: ${fmt(total, 0)}`;
  }
});

Tools.register({
  id: 'area-convert', cat: 'convert', name: 'Area Converter',
  desc: 'm² ↔ ft²',
  fields: [{ k: 'm2', l: 'Square meters', d: 50 }],
  run: ({ m2 }) => `${fmt(num(m2), 2)} m² = ${fmt(num(m2) * 10.7639, 2)} ft² = ${fmt(num(m2) / 10000, 4)} ha`
});

Tools.register({
  id: 'volume-convert', cat: 'convert', name: 'Volume Converter',
  desc: 'Liters ↔ gallons',
  fields: [{ k: 'l', l: 'Liters', d: 10 }],
  run: ({ l }) => `${fmt(num(l), 2)} L = ${fmt(num(l) * 0.264172, 2)} US gal = ${fmt(num(l) * 1000, 0)} ml`
});

Tools.register({
  id: 'pressure-convert', cat: 'convert', name: 'Pressure Converter',
  desc: 'psi ↔ kPa ↔ bar',
  fields: [{ k: 'psi', l: 'psi', d: 32 }],
  run: ({ psi }) => {
    const p = num(psi);
    return `${fmt(p)} psi = ${fmt(p * 6.89476, 2)} kPa = ${fmt(p * 0.0689476, 3)} bar`;
  }
});

Tools.register({
  id: 'timezone-offset', cat: 'datetime', name: 'Time Zone Offset',
  desc: 'Add hours to time',
  fields: [
    { k: 'time', l: 'Time HH:MM', type: 'text', d: '14:30' },
    { k: 'offset', l: 'Hours offset (+/−)', d: -5 },
  ],
  run: ({ time, offset }) => {
    const [h, m] = String(time).split(':').map(Number);
    let mins = h * 60 + m + num(offset) * 60;
    mins = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
    return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  }
});

Tools.register({
  id: 'ring-size', cat: 'convert', name: 'Ring Size (approx)',
  desc: 'US ↔ diameter mm',
  fields: [{ k: 'us', l: 'US size', d: 7 }],
  run: ({ us }) => {
    const diam = 11.63 + 0.8128 * num(us); // approx
    return `US ${us} ≈ ${fmt(diam, 2)} mm diameter\nCircumference ≈ ${fmt(diam * Math.PI, 2)} mm`;
  }
});

Tools.register({
  id: 'aspect-ratio', cat: 'convert', name: 'Aspect Ratio',
  desc: 'Simplify W:H',
  fields: [
    { k: 'w', l: 'Width', d: 1920 },
    { k: 'h', l: 'Height', d: 1080 },
  ],
  run: ({ w, h }) => {
    let a = Math.floor(num(w)), b = Math.floor(num(h));
    const g = (x, y) => y === 0 ? x : g(y, x % y);
    const d = g(a, b);
    return `${a}:${b} → ${a / d}:${b / d}`;
  }
});


/* ── Final remaining catalog ── */
Tools.register({
  id: 'home-afford', cat: 'finance', name: 'Home Affordability',
  desc: 'Rough max home price from income',
  fields: [
    { k: 'income', l: 'Annual gross income', d: 90000 },
    { k: 'debt', l: 'Monthly debts', d: 400 },
    { k: 'rate', l: 'Rate %', d: 6.5 },
    { k: 'downPct', l: 'Down %', d: 20 },
    { k: 'years', l: 'Term years', d: 30 },
  ],
  run: ({ income, debt, rate, downPct, years }) => {
    const maxMonthly = num(income) / 12 * 0.28 - num(debt);
    if (maxMonthly <= 0) return 'Income too low vs debts for 28% rule';
    const r = num(rate) / 100 / 12, n = num(years) * 12;
    const loan = maxMonthly * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
    const price = loan / (1 - num(downPct) / 100);
    return `Max payment ≈ $${fmt(maxMonthly)}/mo\nMax loan ≈ $${fmt(loan)}\nMax price ≈ $${fmt(price)}`;
  }
});

Tools.register({
  id: 'cash-on-cash', cat: 'finance', name: 'Cash-on-Cash Return',
  desc: 'Annual cash flow / cash invested',
  fields: [
    { k: 'cf', l: 'Annual cash flow $', d: 12000 },
    { k: 'invested', l: 'Cash invested', d: 80000 },
  ],
  run: ({ cf, invested }) => `CoC return: ${fmt(num(cf) / num(invested) * 100)}%`
});

Tools.register({
  id: 'coupon', cat: 'finance', name: 'Coupon Savings',
  desc: 'Stack % + $ off',
  fields: [
    { k: 'price', l: 'Price', d: 80 },
    { k: 'pct', l: '% off', d: 20 },
    { k: 'flat', l: '$ off after', d: 5 },
  ],
  run: ({ price, pct, flat }) => {
    const afterPct = num(price) * (1 - num(pct) / 100);
    const final = Math.max(0, afterPct - num(flat));
    return `You pay: $${fmt(final)}\nSaved: $${fmt(num(price) - final)}`;
  }
});

Tools.register({
  id: 'cc-payoff', cat: 'finance', name: 'Credit Card Payoff',
  desc: 'Months with fixed payment',
  fields: [
    { k: 'bal', l: 'Balance', d: 4500 },
    { k: 'apr', l: 'APR %', d: 21.9 },
    { k: 'pay', l: 'Monthly payment', d: 200 },
  ],
  run: ({ bal, apr, pay }) => {
    let b = num(bal), r = num(apr) / 100 / 12, p = num(pay), m = 0, int = 0;
    if (p <= b * r) return 'Payment ≤ interest — never pays off';
    while (b > 0.05 && m < 600) {
      const i = b * r; int += i; b = b + i - p; m++;
    }
    return `${m} months · Interest $${fmt(int)} · Total paid $${fmt(num(bal) + int)}`;
  }
});

Tools.register({
  id: 'pension', cat: 'finance', name: 'Pension Annuity Est.',
  desc: 'Simple payout from nest egg',
  fields: [
    { k: 'pot', l: 'Pension pot $', d: 400000 },
    { k: 'rate', l: 'Withdrawal %/yr', d: 4 },
  ],
  run: ({ pot, rate }) => {
    const y = num(pot) * num(rate) / 100;
    return `Annual: $${fmt(y)}\nMonthly: $${fmt(y / 12)}`;
  }
});

Tools.register({
  id: 'tfsa-rrsp', cat: 'finance', name: 'Contribution Room Growth',
  desc: 'Annual room × years (simple)',
  fields: [
    { k: 'room', l: 'Annual contribution room', d: 7000 },
    { k: 'years', l: 'Years', d: 10 },
    { k: 'have', l: 'Already contributed total', d: 15000 },
  ],
  run: ({ room, years, have }) => {
    const total = num(room) * num(years);
    return `Lifetime room over period: $${fmt(total)}\nIf unused from past: track separately\nExample remaining if used $${fmt(have)} of $${fmt(total)}: $${fmt(Math.max(0, total - num(have)))}`;
  }
});

Tools.register({
  id: 'car-depreciate', cat: 'auto', name: 'Car Depreciation',
  desc: 'Straight-line estimate',
  fields: [
    { k: 'price', l: 'Purchase price', d: 35000 },
    { k: 'years', l: 'Years owned', d: 5 },
    { k: 'rate', l: 'Loss % first year', d: 20 },
    { k: 'after', l: 'Loss %/yr after', d: 10 },
  ],
  run: ({ price, years, rate, after }) => {
    let v = num(price);
    for (let y = 1; y <= num(years); y++) {
      v *= 1 - (y === 1 ? num(rate) : num(after)) / 100;
    }
    return `Est. value: $${fmt(v)}\nLost: $${fmt(num(price) - v)}`;
  }
});

Tools.register({
  id: 'gas-mileage-cost', cat: 'auto', name: 'Annual Fuel Budget',
  desc: 'Miles/year × MPG × price',
  fields: [
    { k: 'miles', l: 'Miles/year', d: 12000 },
    { k: 'mpg', l: 'MPG', d: 28 },
    { k: 'price', l: '$/gallon', d: 3.5 },
  ],
  run: ({ miles, mpg, price }) => {
    const gal = num(miles) / num(mpg);
    return `${fmt(gal, 0)} gal/year · $${fmt(gal * num(price))}/year`;
  }
});

Tools.register({
  id: 'potential-energy', cat: 'science', name: 'Potential Energy',
  desc: 'PE = mgh',
  fields: [
    { k: 'm', l: 'Mass kg', d: 10 },
    { k: 'h', l: 'Height m', d: 5 },
    { k: 'g', l: 'g', d: 9.81 },
  ],
  run: ({ m, h, g }) => `PE = ${fmt(num(m) * num(g) * num(h))} J`
});

Tools.register({
  id: 'watts-kwh', cat: 'science', name: 'Watts ↔ kWh',
  desc: 'Energy from power × time',
  fields: [
    { k: 'w', l: 'Watts', d: 100 },
    { k: 'hours', l: 'Hours', d: 24 },
  ],
  run: ({ w, hours }) => `${fmt(num(w) * num(hours) / 1000, 3)} kWh`
});

Tools.register({
  id: 'resistor-divider', cat: 'science', name: 'Voltage Divider',
  desc: 'Vout = Vin × R2/(R1+R2)',
  fields: [
    { k: 'vin', l: 'Vin', d: 5 },
    { k: 'r1', l: 'R1 Ω', d: 1000 },
    { k: 'r2', l: 'R2 Ω', d: 2000 },
  ],
  run: ({ vin, r1, r2 }) => {
    const out = num(vin) * num(r2) / (num(r1) + num(r2));
    return `Vout = ${fmt(out, 4)} V`;
  }
});

Tools.register({
  id: 'cidr-hosts', cat: 'science', name: 'CIDR Host Range Size',
  desc: 'From /prefix',
  fields: [{ k: 'prefix', l: 'Prefix 8–30', d: 26 }],
  run: ({ prefix }) => {
    const p = Math.min(30, Math.max(8, Math.floor(num(prefix))));
    const hosts = Math.pow(2, 32 - p) - 2;
    return `/${p} → ${hosts} usable hosts`;
  }
});

Tools.register({
  id: 'correlation', cat: 'math', name: 'Correlation (Pearson)',
  desc: 'Paired x and y lists',
  fields: [
    { k: 'xs', l: 'x values', type: 'text', d: '1,2,3,4,5' },
    { k: 'ys', l: 'y values', type: 'text', d: '2,4,5,4,5' },
  ],
  run: ({ xs, ys }) => {
    const x = String(xs).split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
    const y = String(ys).split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
    const n = Math.min(x.length, y.length);
    if (n < 2) return 'Need 2+ pairs';
    const mx = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
    const my = y.slice(0, n).reduce((a, b) => a + b, 0) / n;
    let nume = 0, dx = 0, dy = 0;
    for (let i = 0; i < n; i++) {
      const a = x[i] - mx, b = y[i] - my;
      nume += a * b; dx += a * a; dy += b * b;
    }
    const r = nume / Math.sqrt(dx * dy);
    return `r = ${fmt(r, 4)} (n=${n})`;
  }
});

Tools.register({
  id: 'linear-regression', cat: 'math', name: 'Linear Regression',
  desc: 'Best-fit y = mx+b',
  fields: [
    { k: 'xs', l: 'x values', type: 'text', d: '1,2,3,4,5' },
    { k: 'ys', l: 'y values', type: 'text', d: '2,4,5,4,5' },
  ],
  run: ({ xs, ys }) => {
    const x = String(xs).split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
    const y = String(ys).split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
    const n = Math.min(x.length, y.length);
    if (n < 2) return 'Need 2+ points';
    let sx = 0, sy = 0, sxy = 0, sx2 = 0;
    for (let i = 0; i < n; i++) {
      sx += x[i]; sy += y[i]; sxy += x[i] * y[i]; sx2 += x[i] * x[i];
    }
    const m = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
    const b = (sy - m * sx) / n;
    return `y = ${fmt(m, 4)}x + ${fmt(b, 4)}`;
  }
});

Tools.register({
  id: 'mixed-number', cat: 'math', name: 'Mixed Number',
  desc: 'Improper ↔ mixed',
  fields: [
    { k: 'num', l: 'Numerator', d: 11 },
    { k: 'den', l: 'Denominator', d: 4 },
  ],
  run: ({ num: nu, den }) => {
    const n = Math.floor(num(nu)), d = Math.floor(num(den));
    if (!d) return 'Invalid';
    const whole = Math.floor(n / d), rem = n % d;
    return `${n}/${d} = ${whole} ${rem}/${d}\nDecimal: ${fmt(n / d, 6)}`;
  }
});

Tools.register({
  id: 'class-rank', cat: 'edu', name: 'Class Rank Percentile',
  desc: 'Rank among class size',
  fields: [
    { k: 'rank', l: 'Your rank (1=best)', d: 12 },
    { k: 'size', l: 'Class size', d: 120 },
  ],
  run: ({ rank, size }) => {
    const pct = (1 - (num(rank) - 1) / num(size)) * 100;
    return `Percentile ≈ ${fmt(pct, 1)}%\n(Top ${fmt(num(rank) / num(size) * 100, 1)}%)`;
  }
});

Tools.register({
  id: 'maintenance-cal', cat: 'health', name: 'Maintenance Calories',
  desc: 'TDEE alias with activity',
  fields: [
    { k: 'bmr', l: 'BMR kcal', d: 1600 },
    { k: 'act', l: 'Activity 1.2–1.9', d: 1.55 },
  ],
  run: ({ bmr, act }) => `Maintenance ≈ ${fmt(num(bmr) * num(act), 0)} kcal/day`
});

Tools.register({
  id: 'baby-due-weeks', cat: 'health', name: 'Gestational Age',
  desc: 'Weeks from LMP',
  fields: [{ k: 'lmp', l: 'LMP YYYY-MM-DD', type: 'text', d: '2026-01-01' }],
  run: ({ lmp }) => {
    const d = new Date(lmp);
    if (isNaN(d)) return 'Invalid';
    const days = Math.floor((Date.now() - d) / 86400000);
    const w = Math.floor(days / 7), r = days % 7;
    return `${w} weeks + ${r} days\n(${days} days since LMP)`;
  }
});

Tools.register({
  id: 'dog-food', cat: 'life', name: 'Dog Food Amount',
  desc: 'Rough daily cups by weight',
  fields: [
    { k: 'kg', l: 'Dog weight kg', d: 20 },
    { k: 'cupsPer10kg', l: 'Cups per 10kg', d: 1.5 },
  ],
  run: ({ kg, cupsPer10kg }) => `≈ ${fmt(num(kg) / 10 * num(cupsPer10kg), 1)} cups/day\n(Check your food label)`
});

Tools.register({
  id: 'cat-food', cat: 'life', name: 'Cat Food Amount',
  desc: 'Rough daily grams',
  fields: [
    { k: 'kg', l: 'Cat weight kg', d: 4.5 },
    { k: 'gPerKg', l: 'g food per kg', d: 20 },
  ],
  run: ({ kg, gPerKg }) => `≈ ${fmt(num(kg) * num(gPerKg), 0)} g/day dry-food estimate`
});

Tools.register({
  id: 'pet-bmi', cat: 'life', name: 'Pet BMI (rough)',
  desc: 'Not a vet diagnosis',
  fields: [
    { k: 'kg', l: 'Weight kg', d: 20 },
    { k: 'cm', l: 'Length cm (nose to base of tail)', d: 70 },
  ],
  run: ({ kg, cm }) => {
    const bmi = num(kg) / Math.pow(num(cm) / 100, 2);
    return `Index ≈ ${fmt(bmi, 1)}\n(Informational only)`;
  }
});

Tools.register({
  id: 'dew-point', cat: 'life', name: 'Dew Point',
  desc: 'Approx from T°C and RH%',
  fields: [
    { k: 't', l: 'Temp °C', d: 22 },
    { k: 'rh', l: 'Humidity %', d: 60 },
  ],
  run: ({ t, rh }) => {
    const a = 17.27, b = 237.7;
    const T = num(t), RH = num(rh);
    const alpha = ((a * T) / (b + T)) + Math.log(RH / 100);
    const dp = (b * alpha) / (a - alpha);
    return `Dew point ≈ ${fmt(dp, 1)}°C`;
  }
});

Tools.register({
  id: 'rainwater', cat: 'life', name: 'Rainwater Harvest',
  desc: 'Roof catchment liters',
  fields: [
    { k: 'm2', l: 'Roof area m²', d: 100 },
    { k: 'mm', l: 'Rainfall mm', d: 25 },
    { k: 'eff', l: 'Efficiency 0–1', d: 0.8 },
  ],
  run: ({ m2, mm, eff }) => {
    const L = num(m2) * num(mm) * num(eff); // 1mm on 1m² = 1L
    return `≈ ${fmt(L, 0)} liters collected`;
  }
});

Tools.register({
  id: 'alcohol-dilute', cat: 'life', name: 'Alcohol Dilution',
  desc: 'Mix to target ABV',
  fields: [
    { k: 'v1', l: 'Spirit volume ml', d: 500 },
    { k: 'abv1', l: 'Spirit ABV %', d: 40 },
    { k: 'abv2', l: 'Target ABV %', d: 20 },
  ],
  run: ({ v1, abv1, abv2 }) => {
    if (num(abv2) >= num(abv1) || num(abv2) <= 0) return 'Target must be lower than spirit ABV';
    const v2 = num(v1) * num(abv1) / num(abv2);
    const water = v2 - num(v1);
    return `Final volume: ${fmt(v2, 0)} ml\nAdd water: ${fmt(water, 0)} ml`;
  }
});

Tools.register({
  id: 'baking-baker', cat: 'life', name: 'Baker\'s Percentage',
  desc: 'Ingredient % of flour',
  fields: [
    { k: 'flour', l: 'Flour g', d: 500 },
    { k: 'ing', l: 'Ingredient g', d: 10 },
  ],
  run: ({ flour, ing }) => `${fmt(num(ing) / num(flour) * 100, 1)}% of flour weight`
});

Tools.register({
  id: 'color-rgb-hex', cat: 'convert', name: 'RGB ↔ Hex',
  desc: 'Color conversion',
  fields: [
    { k: 'r', l: 'R 0–255', d: 201 },
    { k: 'g', l: 'G 0–255', d: 162 },
    { k: 'b', l: 'B 0–255', d: 39 },
  ],
  run: ({ r, g, b }) => {
    const h = (n) => Math.max(0, Math.min(255, Math.round(num(n)))).toString(16).padStart(2, '0');
    return `#${h(r)}${h(g)}${h(b)}`;
  }
});

Tools.register({
  id: 'hex-to-rgb', cat: 'convert', name: 'Hex → RGB',
  desc: 'Parse #RRGGBB',
  fields: [{ k: 'hex', l: 'Hex', type: 'text', d: '#c9a227' }],
  run: ({ hex }) => {
    let s = String(hex).replace('#', '');
    if (s.length === 3) s = s.split('').map(c => c + c).join('');
    const n = parseInt(s, 16);
    if (isNaN(n)) return 'Invalid hex';
    return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
  }
});

Tools.register({
  id: 'torque-convert', cat: 'convert', name: 'Torque Converter',
  desc: 'N·m ↔ ft·lb',
  fields: [{ k: 'nm', l: 'Newton-meters', d: 100 }],
  run: ({ nm }) => `${fmt(num(nm))} N·m = ${fmt(num(nm) * 0.73756, 2)} ft·lb`
});

Tools.register({
  id: 'clothing-size', cat: 'convert', name: 'Clothing Size (approx)',
  desc: 'US women dress → EU',
  fields: [{ k: 'us', l: 'US women size', d: 8 }],
  run: ({ us }) => {
    const eu = num(us) + 30; // very rough
    return `US ${us} ≈ EU ${fmt(eu, 0)} / UK ${fmt(num(us) - 2, 0)}\n(Brand-dependent)`;
  }
});

Tools.register({
  id: 'ebitda', cat: 'biz', name: 'EBITDA (simple)',
  desc: 'Op. income + D&A',
  fields: [
    { k: 'op', l: 'Operating income', d: 500000 },
    { k: 'da', l: 'Depreciation & amort.', d: 80000 },
  ],
  run: ({ op, da }) => `EBITDA: $${fmt(num(op) + num(da))}`
});

Tools.register({
  id: 'payroll', cat: 'biz', name: 'Payroll Gross',
  desc: 'Employees × hours × rate',
  fields: [
    { k: 'n', l: 'Employees', d: 5 },
    { k: 'hours', l: 'Hours each', d: 40 },
    { k: 'rate', l: 'Hourly rate', d: 22 },
  ],
  run: ({ n, hours, rate }) => `Gross payroll: $${fmt(num(n) * num(hours) * num(rate))}`
});

Tools.register({
  id: 'sales-forecast', cat: 'biz', name: 'Sales Forecast',
  desc: 'Growth from base',
  fields: [
    { k: 'base', l: 'Current monthly sales', d: 50000 },
    { k: 'growth', l: 'Monthly growth %', d: 3 },
    { k: 'months', l: 'Months ahead', d: 12 },
  ],
  run: ({ base, growth, months }) => {
    let s = num(base), total = 0;
    for (let i = 0; i < num(months); i++) {
      s *= 1 + num(growth) / 100;
      total += s;
    }
    return `Month ${months} sales: $${fmt(s)}\nPeriod total: $${fmt(total)}`;
  }
});

Tools.register({
  id: 'upload-time', cat: 'science', name: 'Upload Time',
  desc: 'Same as download math',
  fields: [
    { k: 'mb', l: 'File MB', d: 500 },
    { k: 'mbps', l: 'Upload Mbps', d: 20 },
  ],
  run: ({ mb, mbps }) => {
    const sec = num(mb) * 8 / num(mbps);
    return `${fmt(sec, 1)} s · ${fmt(sec / 60, 2)} min`;
  }
});

Tools.register({
  id: 'lucky-number', cat: 'fun', name: 'Lucky Number',
  desc: 'From name (fun)',
  fields: [{ k: 'name', l: 'Name', type: 'text', d: 'Alex' }],
  run: ({ name }) => {
    let s = 0;
    for (const c of String(name).toUpperCase()) {
      if (c >= 'A' && c <= 'Z') s += c.charCodeAt(0) - 64;
    }
    while (s > 9) s = String(s).split('').reduce((a, d) => a + Number(d), 0);
    return `Lucky number: ${s}`;
  }
});

Tools.register({
  id: 'life-path', cat: 'fun', name: 'Life Path Number',
  desc: 'From birth date',
  fields: [{ k: 'date', l: 'YYYY-MM-DD', type: 'text', d: '1990-06-15' }],
  run: ({ date }) => {
    const digits = String(date).replace(/\D/g, '');
    let s = digits.split('').reduce((a, d) => a + Number(d), 0);
    while (s > 9 && s !== 11 && s !== 22 && s !== 33) {
      s = String(s).split('').reduce((a, d) => a + Number(d), 0);
    }
    return `Life path: ${s}`;
  }
});

Tools.register({
  id: 'compatibility', cat: 'fun', name: 'Name Compatibility',
  desc: 'Fun % from two names',
  fields: [
    { k: 'a', l: 'Name A', type: 'text', d: 'Jordan' },
    { k: 'b', l: 'Name B', type: 'text', d: 'Taylor' },
  ],
  run: ({ a, b }) => {
    const s = (String(a) + String(b)).toLowerCase();
    let h = 7;
    for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
    return `${50 + (h % 51)}% compatible (for fun)`;
  }
});

Tools.register({
  id: 'dps', cat: 'fun', name: 'DPS Calculator',
  desc: 'Damage per second',
  fields: [
    { k: 'dmg', l: 'Damage per hit', d: 120 },
    { k: 'aps', l: 'Attacks per second', d: 1.4 },
  ],
  run: ({ dmg, aps }) => `DPS: ${fmt(num(dmg) * num(aps), 1)}`
});

Tools.register({
  id: 'loot-chance', cat: 'fun', name: 'Loot Probability',
  desc: 'Chance after N tries',
  fields: [
    { k: 'p', l: 'Drop chance % each try', d: 5 },
    { k: 'n', l: 'Attempts', d: 20 },
  ],
  run: ({ p, n }) => {
    const prob = 1 - Math.pow(1 - num(p) / 100, num(n));
    return `P(at least one): ${fmt(prob * 100)}%`;
  }
});

Tools.register({
  id: 'mining-profit', cat: 'finance', name: 'Mining Profit (simple)',
  desc: 'Revenue − power cost',
  fields: [
    { k: 'rev', l: 'Daily revenue $', d: 5 },
    { k: 'watts', l: 'Watts', d: 1500 },
    { k: 'rate', l: '$/kWh', d: 0.12 },
  ],
  run: ({ rev, watts, rate }) => {
    const cost = num(watts) / 1000 * 24 * num(rate);
    return `Daily power: $${fmt(cost)}\nDaily profit: $${fmt(num(rev) - cost)}`;
  }
});

Tools.register({
  id: 'staking', cat: 'finance', name: 'Staking Rewards',
  desc: 'Simple APR on stake',
  fields: [
    { k: 'amount', l: 'Staked amount', d: 1000 },
    { k: 'apr', l: 'APR %', d: 5 },
    { k: 'days', l: 'Days', d: 365 },
  ],
  run: ({ amount, apr, days }) => {
    const reward = num(amount) * num(apr) / 100 * num(days) / 365;
    return `Est. rewards: ${fmt(reward, 4)}\nEnd balance: ${fmt(num(amount) + reward, 4)}`;
  }
});

Tools.register({
  id: 'crypto-tax', cat: 'finance', name: 'Crypto Capital Gain',
  desc: 'Sell − cost basis',
  fields: [
    { k: 'cost', l: 'Cost basis $', d: 5000 },
    { k: 'proceeds', l: 'Sale proceeds $', d: 8000 },
  ],
  run: ({ cost, proceeds }) => {
    const gain = num(proceeds) - num(cost);
    return `Capital gain: $${fmt(gain)}\n(Not tax advice)`;
  }
});

Tools.register({
  id: 'random-name', cat: 'fun', name: 'Random Name',
  desc: 'Pick from list',
  fields: [{ k: 'list', l: 'Comma-separated names', type: 'text', d: 'Alex,Sam,Jordan,Riley,Casey' }],
  run: ({ list }) => {
    const arr = String(list).split(/,/).map(s => s.trim()).filter(Boolean);
    if (!arr.length) return 'No names';
    return arr[Math.floor(Math.random() * arr.length)];
  }
});

Tools.register({
  id: 'cement', cat: 'home', name: 'Cement Bags',
  desc: 'From concrete volume',
  fields: [
    { k: 'yd', l: 'Cubic yards concrete', d: 1 },
    { k: 'bagsPerYd', l: 'Bags per yd³', d: 45 },
  ],
  run: ({ yd, bagsPerYd }) => `≈ ${fmt(Math.ceil(num(yd) * num(bagsPerYd)), 0)} bags`
});

Tools.register({
  id: 'deck', cat: 'home', name: 'Deck Board Count',
  desc: 'Boards for deck area',
  fields: [
    { k: 'sqft', l: 'Deck sqft', d: 200 },
    { k: 'boardSqft', l: 'Coverage per board sqft', d: 5.5 },
    { k: 'waste', l: 'Waste %', d: 10 },
  ],
  run: ({ sqft, boardSqft, waste }) => {
    const n = num(sqft) * (1 + num(waste) / 100) / num(boardSqft);
    return `≈ ${fmt(Math.ceil(n), 0)} boards`;
  }
});

Tools.register({
  id: 'asphalt', cat: 'home', name: 'Asphalt Tonnage',
  desc: 'Rough tons for area',
  fields: [
    { k: 'sqft', l: 'Area sqft', d: 500 },
    { k: 'inches', l: 'Thickness inches', d: 2 },
  ],
  run: ({ sqft, inches }) => {
    // ~145 lb/ft³ asphalt
    const cuFt = num(sqft) * num(inches) / 12;
    const tons = cuFt * 145 / 2000;
    return `≈ ${fmt(tons, 2)} tons`;
  }
});

Tools.register({
  id: 'holiday-offset', cat: 'datetime', name: 'Date + Business Days',
  desc: 'Add weekdays only',
  fields: [
    { k: 'date', l: 'Start YYYY-MM-DD', type: 'text', d: '2026-09-20' },
    { k: 'days', l: 'Business days to add', d: 10 },
  ],
  run: ({ date, days }) => {
    const d = new Date(date);
    if (isNaN(d)) return 'Invalid';
    let left = Math.floor(num(days));
    while (left > 0) {
      d.setDate(d.getDate() + 1);
      const day = d.getDay();
      if (day !== 0 && day !== 6) left--;
    }
    return d.toISOString().slice(0, 10);
  }
});

// Count
if (typeof console !== 'undefined') {
  console.info('Lumina Tools loaded:', Tools.list.length, 'calculators in', Tools.categories.length, 'categories');
}
