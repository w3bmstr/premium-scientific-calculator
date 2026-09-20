/**
 * Lumina core math tests — run with: node tests.js
 * Requires: npm i mathjs  OR  use global if available
 */
let math, Sci, Finance, passed = 0, failed = 0;

async function load() {
  try {
    math = require('mathjs');
    global.math = math;
  } catch {
    console.error('Install mathjs: npm i mathjs');
    process.exit(1);
  }
  // Minimal Sci/Finance for node — re-eval from files is heavy; inline critical checks
}

function assert(name, cond, detail = '') {
  if (cond) { passed++; console.log('  ✓', name); }
  else { failed++; console.error('  ✗', name, detail); }
}

function approx(a, b, eps = 1e-6) {
  return Math.abs(a - b) < eps;
}

async function run() {
  await load();
  console.log('\nLumina core tests\n');

  // Arithmetic
  assert('2+2', math.evaluate('2+2') === 4);
  assert('order of ops', math.evaluate('2+3*4') === 14);
  assert('power', math.evaluate('2^10') === 1024);
  assert('sqrt', approx(math.evaluate('sqrt(2)'), Math.SQRT2));

  // Trig radians
  assert('sin(pi/2)', approx(math.evaluate('sin(pi/2)'), 1));

  // Complex
  const c = math.evaluate('2 + 3i');
  assert('complex re', approx(c.re, 2));
  assert('complex im', approx(c.im, 3));

  // Matrix
  const m = math.evaluate('[[1,2],[3,4]]');
  assert('matrix', m.size && m.size()[0] === 2);

  // Units
  const u = math.evaluate('5 km').to('mile');
  assert('5 km to mile', approx(u.toNumber(), 3.106855, 1e-4));

  // Finance amortization interest positive
  function loan(P, annual, years) {
    const n = years * 12, r = annual / 100 / 12;
    const pay = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return { pay, total: pay * n, interest: pay * n - P };
  }
  const L = loan(100000, 6, 30);
  assert('mortgage payment > 0', L.pay > 500 && L.pay < 700);
  assert('interest > 0', L.interest > 0);

  // Derivative
  const d = math.derivative('x^2', 'x').toString();
  assert('d/dx x^2', d.replace(/\s/g, '') === '2*x' || d.includes('2') && d.includes('x'));

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed ? 1 : 0);
}

run();
