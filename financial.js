/* Financial calculators + amortization */
const Finance = {
  compound(principal, rate, years, freq) {
    const P = Number(principal), r = Number(rate) / 100, t = Number(years), n = Number(freq);
    if ([P, r, t, n].some(x => isNaN(x) || x < 0)) return null;
    const amount = P * Math.pow(1 + r / n, n * t);
    return { amount, interest: amount - P, principal: P };
  },

  loan(amount, rate, years) {
    const P = Number(amount), annual = Number(rate) / 100, n = Number(years) * 12;
    if ([P, annual, n].some(x => isNaN(x) || x <= 0)) return null;
    const monthlyRate = annual / 12;
    const payment = monthlyRate === 0 ? P / n
      : P * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    const total = payment * n;
    return { payment, total, interest: total - P, months: n, principal: P, rate: annual };
  },

  mortgage(price, down, rate, years) {
    const loanAmount = Number(price) - Number(down);
    if (loanAmount <= 0) return null;
    const result = this.loan(loanAmount, rate, years);
    if (!result) return null;
    return { ...result, loanAmount, price: Number(price), down: Number(down) };
  },

  /** Full amortization schedule */
  amortization(principal, annualRate, years) {
    const base = this.loan(principal, annualRate, years);
    if (!base) return null;
    const r = annualRate / 100 / 12;
    let balance = Number(principal);
    const rows = [];
    for (let m = 1; m <= base.months; m++) {
      const interest = balance * r;
      let principalPaid = base.payment - interest;
      if (m === base.months) principalPaid = balance;
      balance = Math.max(0, balance - principalPaid);
      rows.push({
        month: m,
        payment: base.payment,
        principal: principalPaid,
        interest,
        balance
      });
    }
    return { ...base, rows };
  },

  roi(initial, final) {
    const i = Number(initial), f = Number(final);
    if (isNaN(i) || isNaN(f) || i === 0) return null;
    const gain = f - i;
    return { gain, pct: (gain / i) * 100, initial: i, final: f };
  },

  profitLoss(cost, sell, qty) {
    const c = Number(cost), s = Number(sell), q = Number(qty) || 1;
    if ([c, s, q].some(x => isNaN(x))) return null;
    const totalCost = c * q, totalSell = s * q, pl = totalSell - totalCost;
    return { pl, pct: totalCost === 0 ? 0 : (pl / totalCost) * 100, totalCost, totalSell, qty: q };
  },

  tax(amount, rate) {
    const a = Number(amount), r = Number(rate) / 100;
    if (isNaN(a) || isNaN(r)) return null;
    const tax = a * r;
    return { tax, net: a - tax, amount: a, rate: Number(rate) };
  },

  fmt(n) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  /** HTML report for print/PDF */
  amortizationReportHTML(schedule, title = 'Amortization Schedule') {
    if (!schedule) return '';
    const rows = schedule.rows.map(r =>
      `<tr><td>${r.month}</td><td>$${this.fmt(r.payment)}</td><td>$${this.fmt(r.principal)}</td><td>$${this.fmt(r.interest)}</td><td>$${this.fmt(r.balance)}</td></tr>`
    ).join('');
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body{font-family:system-ui,sans-serif;padding:24px;color:#111}
  h1{font-size:20px} .meta{margin-bottom:16px;color:#444}
  table{border-collapse:collapse;width:100%;font-size:12px}
  th,td{border:1px solid #ccc;padding:6px 8px;text-align:right}
  th{background:#f4f4f4;text-align:right}
  th:first-child,td:first-child{text-align:left}
  @media print{button{display:none}}
</style></head><body>
<button onclick="window.print()">Print / Save as PDF</button>
<h1>${title}</h1>
<div class="meta">
  Principal: $${this.fmt(schedule.principal)} · Payment: $${this.fmt(schedule.payment)}/mo<br>
  Total interest: $${this.fmt(schedule.interest)} · Total paid: $${this.fmt(schedule.total)} · ${schedule.months} months
</div>
<table>
<thead><tr><th>#</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead>
<tbody>${rows}</tbody>
</table>
</body></html>`;
  }
};
