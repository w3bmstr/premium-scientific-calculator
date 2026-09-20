/* Financial calculators */
const Finance = {
  compound(principal, rate, years, freq) {
    const P = Number(principal);
    const r = Number(rate) / 100;
    const t = Number(years);
    const n = Number(freq);
    if ([P, r, t, n].some(x => isNaN(x) || x < 0)) return null;
    const amount = P * Math.pow(1 + r / n, n * t);
    const interest = amount - P;
    return { amount, interest, principal: P };
  },

  loan(amount, rate, years) {
    const P = Number(amount);
    const annual = Number(rate) / 100;
    const n = Number(years) * 12;
    if ([P, annual, n].some(x => isNaN(x) || x <= 0)) return null;
    const monthlyRate = annual / 12;
    let payment;
    if (monthlyRate === 0) {
      payment = P / n;
    } else {
      payment = P * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    }
    const total = payment * n;
    const interest = total - P;
    return { payment, total, interest, months: n };
  },

  mortgage(price, down, rate, years) {
    const loanAmount = Number(price) - Number(down);
    if (loanAmount <= 0) return null;
    const result = this.loan(loanAmount, rate, years);
    if (!result) return null;
    return { ...result, loanAmount, price: Number(price), down: Number(down) };
  },

  roi(initial, final) {
    const i = Number(initial);
    const f = Number(final);
    if (isNaN(i) || isNaN(f) || i === 0) return null;
    const gain = f - i;
    const pct = (gain / i) * 100;
    return { gain, pct, initial: i, final: f };
  },

  profitLoss(cost, sell, qty) {
    const c = Number(cost);
    const s = Number(sell);
    const q = Number(qty) || 1;
    if ([c, s, q].some(x => isNaN(x))) return null;
    const totalCost = c * q;
    const totalSell = s * q;
    const pl = totalSell - totalCost;
    const pct = totalCost === 0 ? 0 : (pl / totalCost) * 100;
    return { pl, pct, totalCost, totalSell, qty: q };
  },

  tax(amount, rate) {
    const a = Number(amount);
    const r = Number(rate) / 100;
    if (isNaN(a) || isNaN(r)) return null;
    const tax = a * r;
    const net = a - tax;
    return { tax, net, amount: a, rate: Number(rate) };
  },

  fmt(n) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
};
