/* ═══════════════════════════════════════════════════════════════
   LUMINA Calculator — Core Controller
   ═══════════════════════════════════════════════════════════════ */

(() => {
  // State
  let expression = '';
  let result = 0;
  let memory = Storage.getMemory();
  let ans = Storage.getAns();
  window.__luminaAns = ans;
  let lastWasEquals = false;
  let currentMode = 'basic';
  let angleMode = Storage.getAngleMode(); // DEG | RAD
  let notationMode = localStorage.getItem('lumina_notation') || 'NORM'; // NORM | SCI | ENG | FRAC
  let undoStack = [];
  let redoStack = [];
  const UNDO_MAX = 40;
  let resultDisplay = null; // optional unit-aware label
  let progBase = 'dec';
  let progValue = 0;
  let progPendingOp = null;
  let progOperand = null;

  // DOM
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  const exprEl = $('#expression');
  const resultEl = $('#result');
  const memInd = $('#memoryIndicator');
  const historyList = $('#historyList');
  const historyDrawer = $('#historyDrawer');
  const menuDrawer = $('#menuDrawer');
  const overlay = $('#overlay');

  // ── Init ──
  function init() {
    applySkin(Storage.getSkin());
    // Theme preference only — skin owns the colors
    Storage.setTheme(LIGHT_SKINS.includes(Storage.getSkin()) ? 'light' : 'dark');
    updateAngleUI();
    updateDisplay();
    updateMemoryIndicator();
    renderHistory();
    setupModeTabs();
    setupKeypad();
    setupFinancial();
    setupProgrammer();
    setupGraph();
    setupConvert();
    setupHistory();
    setupTheme();
    setupMenu();
    setupSkins();
    setupDesignOptions();
    setupAngleMode();
    setupNotation();
    setupCopyResult();
    setupPhysicalConstants();
    setupFormulas();
    setupFeedback();
    setupExpressionEditor();
    refreshCurrencyRates();
    setupAmortization();
    setupPWA();
    setupVoice();
    setupOCR();
    setupBackup();
    setupToolsCatalog();
    Graph.init('graph-canvas');
    toggleScientificKeys(false);
  }

  // ── Display ──
  function updateDisplay() {
    if (document.activeElement !== exprEl) {
      exprEl.textContent = expression || '';
    }
    if (resultDisplay != null) {
      resultEl.textContent = resultDisplay;
      resultEl.classList.remove('error');
    } else {
      const t = Sci.format(result, notationMode);
      resultEl.textContent = t;
      resultEl.classList.toggle('error', t === 'Error');
    }
  }

  function pushUndo() {
    undoStack.push({ expression, result, ans, lastWasEquals, resultDisplay });
    if (undoStack.length > UNDO_MAX) undoStack.shift();
    redoStack = [];
  }

  function undo() {
    if (!undoStack.length) { showToast('Nothing to undo'); return; }
    redoStack.push({ expression, result, ans, lastWasEquals, resultDisplay });
    const s = undoStack.pop();
    expression = s.expression;
    result = s.result;
    ans = s.ans;
    window.__luminaAns = ans;
    lastWasEquals = s.lastWasEquals;
    resultDisplay = s.resultDisplay;
    updateDisplay();
    showToast('Undo');
  }

  function redo() {
    if (!redoStack.length) { showToast('Nothing to redo'); return; }
    undoStack.push({ expression, result, ans, lastWasEquals, resultDisplay });
    const s = redoStack.pop();
    expression = s.expression;
    result = s.result;
    ans = s.ans;
    window.__luminaAns = ans;
    lastWasEquals = s.lastWasEquals;
    resultDisplay = s.resultDisplay;
    updateDisplay();
    showToast('Redo');
  }

  function updateMemoryIndicator() {
    memInd.hidden = memory === 0;
  }

  // ── Theme (pairs with skins — never flattens all skins to one light palette) ──
  const DARK_SKINS = ['lumina', 'obsidian', 'ocean', 'emerald', 'rose', 'amber', 'violet', 'neon', 'carbon', 'sunset'];
  const LIGHT_SKINS = ['paper', 'snow'];

  function applyTheme(theme) {
    // theme is only a preference flag; visual look always comes from data-skin
    Storage.setTheme(theme);
    const skin = Storage.getSkin();
    if (theme === 'light' && DARK_SKINS.includes(skin)) {
      applySkin('paper');
    } else if (theme === 'dark' && LIGHT_SKINS.includes(skin)) {
      applySkin('lumina');
    }
  }

  function setupTheme() {
    const btn = $('#themeToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const skin = Storage.getSkin();
      if (LIGHT_SKINS.includes(skin)) {
        applySkin(Storage.getTheme() === 'light' ? 'lumina' : (Storage._lastDarkSkin || 'lumina'));
        Storage.setTheme('dark');
        showToast('Dark mode');
      } else {
        Storage._lastDarkSkin = skin;
        applySkin('paper');
        Storage.setTheme('light');
        showToast('Light mode');
      }
    });
  }

  // ── Modes ──
  function setupModeTabs() {
    $$('.mode-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.mode-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const mode = tab.dataset.mode;
        currentMode = mode;
        $$('.panel').forEach(p => p.classList.remove('active'));
        const panelId = mode === 'basic' || mode === 'scientific' ? 'panel-basic' : `panel-${mode}`;
        const panel = document.getElementById(panelId);
        if (panel) panel.classList.add('active');
        toggleScientificKeys(mode === 'scientific');
        if (mode === 'graph') Graph.plot(
          ($('#graph-fn') && $('#graph-fn').value) || 'sin(x)',
          ($('#graph-fn2') && $('#graph-fn2').value) || '',
          ($('#graph-fn3') && $('#graph-fn3').value) || ''
        );
        if (mode === 'formulas' && typeof renderFormulaList === 'function') renderFormulaList();
      });
    });
  }

  function toggleScientificKeys(show) {
    const sk = $('#scientificKeys');
    if (sk) sk.style.display = show ? 'grid' : 'none';
  }

  // ── Keypad (Basic + Scientific) ──
  function setupKeypad() {
    // Numbers
    $$('.key.num').forEach(btn => {
      if (btn.closest('#panel-programmer')) return;
      btn.addEventListener('click', () => inputDigit(btn.dataset.num));
    });

    // Operators
    $$('.key.op').forEach(btn => {
      if (btn.dataset.op) {
        btn.addEventListener('click', () => inputOperator(btn.dataset.op));
      }
    });

    // Actions
    $$('[data-action]').forEach(btn => {
      if (btn.closest('#panel-programmer')) return;
      btn.addEventListener('click', () => handleAction(btn.dataset.action));
    });

    // Functions
    $$('[data-fn]').forEach(btn => {
      btn.addEventListener('click', () => applyFn(btn.dataset.fn));
    });

    // Constants
    $$('[data-const]').forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.dataset.const;
        if (k === 'i') {
          if (lastWasEquals || expression === '') expression = 'i';
          else expression += 'i';
          lastWasEquals = false;
          updateDisplay();
          return;
        }
        const c = k === 'pi' ? Math.PI : Math.E;
        if (lastWasEquals || expression === '') {
          expression = Sci.format(c);
          result = c;
        } else {
          expression += Sci.format(c);
        }
        lastWasEquals = false;
        updateDisplay();
      });
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (currentMode !== 'basic' && currentMode !== 'scientific') return;
      if (e.target.matches('input, select, textarea')) return;
      const k = e.key;
      if (/^[0-9.]$/.test(k)) { e.preventDefault(); inputDigit(k); }
      else if (['+', '-', '*', '/'].includes(k)) { e.preventDefault(); inputOperator(k); }
      else if (k === 'Enter' || k === '=') { e.preventDefault(); handleAction('equals'); }
      else if (k === 'Backspace') { e.preventDefault(); handleAction('backspace'); }
      else if (k === 'Escape') { e.preventDefault(); handleAction('clear'); }
      else if ((e.ctrlKey || e.metaKey) && k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      else if ((e.ctrlKey || e.metaKey) && (k === 'y' || (k === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      else if (k === '%') { e.preventDefault(); applyFn('percent'); }
    });
  }

  function inputDigit(d) {
    if (lastWasEquals) {
      expression = '';
      result = 0;
      lastWasEquals = false;
    }
    if (d === '.' && expression.split(/[+\-*/]/).pop().includes('.')) return;
    expression += d;
    // Live preview
    tryPreview();
    updateDisplay();
  }

  function inputOperator(op) {
    if (expression === '' && result !== 0) {
      expression = Sci.format(result);
    }
    if (expression === '') return;
    // Replace trailing operator
    if (/[+\-*/]$/.test(expression)) {
      expression = expression.slice(0, -1) + op;
    } else {
      expression += op;
    }
    lastWasEquals = false;
    updateDisplay();
  }

  function tryPreview() {
    try {
      const cleaned = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
      if (/[+\-*/]$/.test(cleaned)) return;
      const v = Sci.eval(cleaned);
      if (isFinite(v)) result = v;
    } catch { /* ignore */ }
  }

  function handleAction(action) {
    switch (action) {
      case 'clear':
        pushUndo();
        expression = '';
        result = 0;
        resultDisplay = null;
        lastWasEquals = false;
        break;
      case 'ce':
        expression = expression.replace(/[\d.]+$/, '');
        tryPreview();
        break;
      case 'backspace':
        expression = expression.slice(0, -1);
        tryPreview();
        if (expression === '') result = 0;
        break;
      case 'equals':
        compute();
        break;
      case 'mc':
        memory = 0;
        Storage.setMemory(0);
        updateMemoryIndicator();
        break;
      case 'mr':
        if (lastWasEquals || expression === '') {
          expression = Sci.format(memory);
          result = memory;
        } else {
          expression += Sci.format(memory);
          tryPreview();
        }
        lastWasEquals = false;
        break;
      case 'mplus':
        memory += result;
        Storage.setMemory(memory);
        updateMemoryIndicator();
        break;
      case 'mminus':
        memory -= result;
        Storage.setMemory(memory);
        updateMemoryIndicator();
        break;
      case 'paren-l':
        if (lastWasEquals) { expression = ''; lastWasEquals = false; }
        expression += '(';
        break;
      case 'paren-r':
        expression += ')';
        tryPreview();
        break;
      case 'sign':
        toggleSign();
        break;
      case 'ans':
        if (lastWasEquals || expression === '') {
          expression = Sci.format(ans);
          result = ans;
        } else {
          expression += Sci.format(ans);
          tryPreview();
        }
        lastWasEquals = false;
        break;
      case 'copy':
        copyResult();
        break;
    }
    updateDisplay();
  }

  function toggleSign() {
    // Negate trailing number or whole result
    if (lastWasEquals || !expression) {
      result = -result;
      expression = Sci.format(result);
      lastWasEquals = true;
      return;
    }
    const m = expression.match(/^(.*?)([+\-*/(]?)(-?[\d.]+(?:[eE][+-]?\d+)?)$/);
    if (m) {
      const head = m[1] + (m[2] || '');
      const num = parseFloat(m[3]);
      expression = head + Sci.format(-num);
      tryPreview();
    } else {
      expression = '-(' + expression + ')';
      tryPreview();
    }
  }

  function compute() {
    if (!expression) return;
    pushUndo();
    const detailed = Sci.evalDetailed ? Sci.evalDetailed(expression) : { value: Sci.eval(expression), display: null };
    const v = detailed.value;
    if (detailed.error || (!isFinite(v) && !detailed.display)) {
      resultDisplay = null;
      resultEl.textContent = 'Error';
      resultEl.classList.add('error');
      const el = document.getElementById('errorLine');
      if (el) {
        el.hidden = false;
        el.textContent = detailed.error || Sci.lastError || 'Could not evaluate';
      }
      showToast(detailed.error || 'Could not evaluate');
      return;
    }
    resultEl.classList.remove('error');
    const el = document.getElementById('errorLine');
    if (el) { el.hidden = true; el.textContent = ''; }
    const histResult = detailed.display || Sci.format(v);
    Storage.addHistory(expression, histResult);
    renderHistory();
    result = isFinite(v) ? v : 0;
    if (isFinite(v)) {
      ans = v;
      window.__luminaAns = v;
      Storage.setAns(v);
    }
    resultDisplay = detailed.display || null;
    // Keep complex/matrix expression result visible; for numbers put value in expression
    if (detailed.matrix || detailed.complex) {
      expression = detailed.display;
    } else {
      expression = Sci.format(v, notationMode);
    }
    lastWasEquals = true;
    updateDisplay();
  }

  function applyFn(fn) {
    let val = result;
    const match = expression.match(/([\d.]+(?:[eE][+-]?\d+)?)$/);
    if (match && !lastWasEquals) {
      val = parseFloat(match[1]);
    }

    let out;
    switch (fn) {
      case 'sin': out = Math.sin(Sci.toRad(val, angleMode)); break;
      case 'cos': out = Math.cos(Sci.toRad(val, angleMode)); break;
      case 'tan': out = Math.tan(Sci.toRad(val, angleMode)); break;
      case 'asin': out = Sci.fromRad(Math.asin(val), angleMode); break;
      case 'acos': out = Sci.fromRad(Math.acos(val), angleMode); break;
      case 'atan': out = Sci.fromRad(Math.atan(val), angleMode); break;
      case 'sinh': out = Math.sinh(val); break;
      case 'cosh': out = Math.cosh(val); break;
      case 'tanh': out = Math.tanh(val); break;
      case 'log': out = Math.log10(val); break;
      case 'ln': out = Math.log(val); break;
      case 'exp': out = Math.exp(val); break;
      case 'pow10': out = Math.pow(10, val); break;
      case 'pow2': out = val * val; break;
      case 'pow3': out = val * val * val; break;
      case 'sqrt': out = Math.sqrt(val); break;
      case 'cbrt': out = Math.cbrt(val); break;
      case 'inv': out = 1 / val; break;
      case 'abs': out = Math.abs(val); break;
      case 'percent': out = val / 100; break;
      case 'fact': out = Sci.factorial(Math.round(val)); break;
      case 'rand': out = Math.random(); break;
      case 'frac':
        notationMode = 'FRAC';
        localStorage.setItem('lumina_notation', 'FRAC');
        if ($('#notationMode')) $('#notationMode').textContent = 'FRAC';
        resultDisplay = null;
        updateDisplay();
        showToast('Fraction mode');
        return;
      case 'diff': {
        const src = expression || 'x^2';
        const d = Sci.derivative(src.replace(/=.*/, '').trim() || 'x^2');
        if (!d) { showToast(Sci.lastError || 'Derivative failed'); return; }
        expression = d;
        resultDisplay = d;
        lastWasEquals = false;
        updateDisplay();
        showToast('d/dx → ' + d);
        return;
      }
      case 'simp': {
        const src = expression || 'x';
        const s = Sci.simplify(src);
        if (!s) { showToast(Sci.lastError || 'Simplify failed'); return; }
        expression = s;
        resultDisplay = s;
        lastWasEquals = false;
        updateDisplay();
        showToast('Simplified');
        return;
      }
      case 'eng':
        notationMode = notationMode === 'ENG' ? 'NORM' : 'ENG';
        localStorage.setItem('lumina_notation', notationMode);
        if ($('#notationMode')) $('#notationMode').textContent = notationMode;
        resultDisplay = null;
        updateDisplay();
        showToast('Notation: ' + notationMode);
        return;
      case 'pow':
        if (lastWasEquals) expression = Sci.format(result);
        expression += '^';
        lastWasEquals = false;
        updateDisplay();
        return;
      default: return;
    }

    if (!isFinite(out) && fn !== 'rand') {
      resultEl.textContent = 'Error';
      return;
    }

    const label = `${fn}(${Sci.format(val)})`;
    Storage.addHistory(label, Sci.format(out));
    renderHistory();
    result = out;
    ans = out;
    window.__luminaAns = out;
    Storage.setAns(out);
    expression = Sci.format(out);
    lastWasEquals = true;
    updateDisplay();
  }

  // ── Financial ──
  function setupFinancial() {
    $$('.fin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.fin-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        $$('.fin-form').forEach(f => f.classList.remove('active'));
        const form = document.getElementById(`fin-${tab.dataset.fin}`);
        if (form) form.classList.add('active');
      });
    });

    $$('[data-fin-calc]').forEach(btn => {
      btn.addEventListener('click', () => runFinancial(btn.dataset.finCalc));
    });
  }

  function runFinancial(type) {
    let text = '';
    switch (type) {
      case 'compound': {
        const r = Finance.compound(
          $('#ci-principal').value,
          $('#ci-rate').value,
          $('#ci-years').value,
          $('#ci-freq').value
        );
        if (!r) { $('#ci-result').textContent = 'Invalid input'; return; }
        text = `Future Value: $${Finance.fmt(r.amount)}\nInterest Earned: $${Finance.fmt(r.interest)}`;
        $('#ci-result').textContent = text;
        Storage.addHistory('Compound Interest', `$${Finance.fmt(r.amount)}`);
        break;
      }
      case 'loan': {
        const r = Finance.loan($('#loan-amount').value, $('#loan-rate').value, $('#loan-years').value);
        if (!r) { $('#loan-result').textContent = 'Invalid input'; return; }
        text = `Monthly Payment: $${Finance.fmt(r.payment)}\nTotal Paid: $${Finance.fmt(r.total)}\nTotal Interest: $${Finance.fmt(r.interest)}`;
        $('#loan-result').textContent = text;
        Storage.addHistory('Loan Payment', `$${Finance.fmt(r.payment)}/mo`);
        break;
      }
      case 'mortgage': {
        const r = Finance.mortgage(
          $('#mtg-price').value,
          $('#mtg-down').value,
          $('#mtg-rate').value,
          $('#mtg-years').value
        );
        if (!r) { $('#mtg-result').textContent = 'Invalid input'; return; }
        text = `Loan Amount: $${Finance.fmt(r.loanAmount)}\nMonthly Payment: $${Finance.fmt(r.payment)}\nTotal Interest: $${Finance.fmt(r.interest)}\nTotal Cost: $${Finance.fmt(r.total + r.down)}`;
        $('#mtg-result').textContent = text;
        Storage.addHistory('Mortgage', `$${Finance.fmt(r.payment)}/mo`);
        break;
      }
      case 'roi': {
        const r = Finance.roi($('#roi-initial').value, $('#roi-final').value);
        if (!r) { $('#roi-result').textContent = 'Invalid input'; return; }
        text = `Gain/Loss: $${Finance.fmt(r.gain)}\nROI: ${r.pct.toFixed(2)}%`;
        $('#roi-result').textContent = text;
        Storage.addHistory('ROI', `${r.pct.toFixed(2)}%`);
        break;
      }
      case 'pl': {
        const r = Finance.profitLoss($('#pl-cost').value, $('#pl-sell').value, $('#pl-qty').value);
        if (!r) { $('#pl-result').textContent = 'Invalid input'; return; }
        const label = r.pl >= 0 ? 'Profit' : 'Loss';
        text = `${label}: $${Finance.fmt(Math.abs(r.pl))}\nMargin: ${r.pct.toFixed(2)}%\nTotal Cost: $${Finance.fmt(r.totalCost)}\nTotal Revenue: $${Finance.fmt(r.totalSell)}`;
        $('#pl-result').textContent = text;
        Storage.addHistory('P/L', `$${Finance.fmt(r.pl)}`);
        break;
      }
      case 'tax': {
        const r = Finance.tax($('#tax-amount').value, $('#tax-rate').value);
        if (!r) { $('#tax-result').textContent = 'Invalid input'; return; }
        text = `Tax: $${Finance.fmt(r.tax)}\nNet: $${Finance.fmt(r.net)}`;
        $('#tax-result').textContent = text;
        Storage.addHistory('Tax', `$${Finance.fmt(r.tax)}`);
        break;
      }
    }
    renderHistory();
  }

  // ── Programmer ──
  function setupProgrammer() {
    $$('.base-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.base-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        progBase = tab.dataset.base;
        updateProgDisplay();
      });
    });

    // Prog numbers
    $$('#panel-programmer .key.num').forEach(btn => {
      btn.addEventListener('click', () => progInput(btn.dataset.num));
    });

    $$('#panel-programmer [data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.action === 'clear') {
          progValue = 0;
          progPendingOp = null;
          progOperand = null;
          updateProgDisplay();
        } else if (btn.dataset.action === 'backspace') {
          const s = progToString(progValue, progBase);
          const next = s.slice(0, -1) || '0';
          progValue = parseInt(next, baseRadix(progBase)) || 0;
          updateProgDisplay();
        } else if (btn.dataset.action === 'equals') {
          progEquals();
        }
      });
    });

    $$('#panel-programmer [data-bit]').forEach(btn => {
      btn.addEventListener('click', () => progBitOp(btn.dataset.bit));
    });
  }

  function baseRadix(b) {
    return { dec: 10, hex: 16, oct: 8, bin: 2 }[b] || 10;
  }

  function progToString(val, base) {
    const n = val >>> 0; // unsigned 32-bit view for display
    switch (base) {
      case 'hex': return n.toString(16).toUpperCase();
      case 'oct': return n.toString(8);
      case 'bin': return n.toString(2);
      default: return String(n);
    }
  }

  function updateProgDisplay() {
    const n = progValue | 0;
    $('#prog-hex').textContent = (n >>> 0).toString(16).toUpperCase();
    $('#prog-dec').textContent = String(n);
    $('#prog-oct').textContent = (n >>> 0).toString(8);
    $('#prog-bin').textContent = (n >>> 0).toString(2);
    // Also mirror to main display
    result = n;
    expression = progToString(n, progBase);
    updateDisplay();
  }

  function progInput(digit) {
    const radix = baseRadix(progBase);
    // Validate digit for current base
    const valid = parseInt(digit, 16);
    if (isNaN(valid) || valid >= radix) return;
    const current = progToString(progValue, progBase);
    const next = (current === '0' ? '' : current) + digit;
    progValue = parseInt(next, radix) || 0;
    updateProgDisplay();
  }

  function progBitOp(op) {
    if (op === 'NOT') {
      progValue = ~progValue;
      updateProgDisplay();
      return;
    }
    if (progPendingOp && progOperand !== null) {
      progEquals();
    }
    progPendingOp = op;
    progOperand = progValue;
    progValue = 0;
    updateProgDisplay();
  }

  function progEquals() {
    if (!progPendingOp || progOperand === null) return;
    let a = progOperand | 0;
    let b = progValue | 0;
    switch (progPendingOp) {
      case 'AND': progValue = a & b; break;
      case 'OR': progValue = a | b; break;
      case 'XOR': progValue = a ^ b; break;
      case 'LSH': progValue = a << b; break;
      case 'RSH': progValue = a >> b; break;
    }
    Storage.addHistory(`${progPendingOp}(${a}, ${b})`, String(progValue));
    renderHistory();
    progPendingOp = null;
    progOperand = null;
    updateProgDisplay();
  }

  // ── Graph ──
  function setupGraph() {
    const plotAll = () => {
      Graph.plot(
        $('#graph-fn').value.trim() || 'sin(x)',
        ($('#graph-fn2') && $('#graph-fn2').value.trim()) || '',
        ($('#graph-fn3') && $('#graph-fn3').value.trim()) || ''
      );
    };
    $('#graph-plot').addEventListener('click', plotAll);
    $('#graph-zoom-in').addEventListener('click', () => Graph.zoomIn());
    $('#graph-zoom-out').addEventListener('click', () => Graph.zoomOut());
    $('#graph-reset').addEventListener('click', () => Graph.reset());
    $('#graph-save').addEventListener('click', () => Graph.save());
    const rootsBtn = $('#graph-roots');
    if (rootsBtn) rootsBtn.addEventListener('click', () => Graph.showRoots());
    const exBtn = $('#graph-extrema');
    if (exBtn) exBtn.addEventListener('click', () => Graph.showExtrema());
    const polBtn = $('#graph-polar');
    if (polBtn) polBtn.addEventListener('click', () => {
      Graph.setMode(Graph.mode === 'polar' ? 'cartesian' : 'polar');
      showToast(Graph.mode === 'polar' ? 'Polar mode' : 'Cartesian mode');
    });
    $('#graph-fn').addEventListener('keydown', (e) => { if (e.key === 'Enter') plotAll(); });
  }

  // ── Convert ──
  const CONV = {
    length: {
      units: { m: 1, km: 0.001, cm: 100, mm: 1000, mi: 0.000621371, yd: 1.09361, ft: 3.28084, in: 39.3701 },
      labels: { m: 'Meters', km: 'Kilometers', cm: 'Centimeters', mm: 'Millimeters', mi: 'Miles', yd: 'Yards', ft: 'Feet', in: 'Inches' }
    },
    weight: {
      units: { kg: 1, g: 1000, mg: 1e6, lb: 2.20462, oz: 35.274, t: 0.001 },
      labels: { kg: 'Kilograms', g: 'Grams', mg: 'Milligrams', lb: 'Pounds', oz: 'Ounces', t: 'Tonnes' }
    },
    temp: {
      units: null, // special
      labels: { c: 'Celsius', f: 'Fahrenheit', k: 'Kelvin' }
    },
    currency: {
      // Approximate static rates (USD base) — offline friendly
      units: { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149, CAD: 1.36, AUD: 1.53, CHF: 0.88, CNY: 7.24, INR: 83.5 },
      labels: { USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen', CAD: 'Canadian Dollar', AUD: 'Australian Dollar', CHF: 'Swiss Franc', CNY: 'Chinese Yuan', INR: 'Indian Rupee' }
    },
    speed: {
      units: { 'm/s': 1, 'km/h': 3.6, mph: 2.23694, knot: 1.94384, fps: 3.28084 },
      labels: { 'm/s': 'Meters/sec', 'km/h': 'Km/hour', mph: 'Miles/hour', knot: 'Knots', fps: 'Feet/sec' }
    },
    time: {
      units: { s: 1, min: 1 / 60, h: 1 / 3600, d: 1 / 86400, wk: 1 / 604800 },
      labels: { s: 'Seconds', min: 'Minutes', h: 'Hours', d: 'Days', wk: 'Weeks' }
    }
  };

  let convType = 'length';

  function setupConvert() {
    $$('.conv-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.conv-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        convType = tab.dataset.conv;
        populateConvUnits();
        convert();
      });
    });

    $('#conv-from-val').addEventListener('input', convert);
    $('#conv-from-unit').addEventListener('change', convert);
    $('#conv-to-unit').addEventListener('change', convert);
    $('#conv-swap').addEventListener('click', () => {
      const fu = $('#conv-from-unit');
      const tu = $('#conv-to-unit');
      const tmp = fu.value;
      fu.value = tu.value;
      tu.value = tmp;
      convert();
    });

    populateConvUnits();
    convert();
  }

  function populateConvUnits() {
    const data = CONV[convType];
    const fromSel = $('#conv-from-unit');
    const toSel = $('#conv-to-unit');
    fromSel.innerHTML = '';
    toSel.innerHTML = '';
    Object.keys(data.labels).forEach((k, i) => {
      fromSel.add(new Option(data.labels[k], k));
      toSel.add(new Option(data.labels[k], k));
    });
    // Sensible defaults
    if (convType === 'temp') {
      fromSel.value = 'c';
      toSel.value = 'f';
    } else if (Object.keys(data.labels).length > 1) {
      toSel.selectedIndex = 1;
    }
  }

  function convert() {
    const val = parseFloat($('#conv-from-val').value);
    if (isNaN(val)) {
      $('#conv-to-val').value = '';
      return;
    }
    const from = $('#conv-from-unit').value;
    const to = $('#conv-to-unit').value;

    if (convType === 'temp') {
      let c;
      if (from === 'c') c = val;
      else if (from === 'f') c = (val - 32) * 5 / 9;
      else c = val - 273.15;
      let out;
      if (to === 'c') out = c;
      else if (to === 'f') out = c * 9 / 5 + 32;
      else out = c + 273.15;
      $('#conv-to-val').value = parseFloat(out.toFixed(6));
      return;
    }

    const data = CONV[convType];
    const base = val / data.units[from]; // to base unit
    const out = base * data.units[to];
    $('#conv-to-val').value = parseFloat(out.toFixed(8));
  }

  // ── History ──
  function setupHistory() {
    $('#historyToggle').addEventListener('click', openHistory);
    $('#historyClear').addEventListener('click', () => {
      Storage.clearHistory();
      renderHistory();
    });
    overlay.addEventListener('click', closeAllDrawers);
  }

  function openHistory() {
    closeMenu(false);
    historyDrawer.classList.add('open');
    overlay.classList.add('visible');
  }

  function closeHistory(hideOverlay = true) {
    historyDrawer.classList.remove('open');
    if (hideOverlay) overlay.classList.remove('visible');
  }

  function renderHistory() {
    const list = Storage.getHistory();
    historyList.innerHTML = list.length
      ? list.map(h => `<li data-expr="${escapeAttr(h.expression)}"><span>${escapeHtml(h.expression)}</span> = <span class="hist-result">${escapeHtml(h.result)}</span></li>`).join('')
      : '<li style="opacity:0.5;cursor:default">No calculations yet</li>';

    historyList.querySelectorAll('li[data-expr]').forEach(li => {
      li.addEventListener('click', () => {
        expression = li.dataset.expr;
        result = parseFloat(li.querySelector('.hist-result').textContent) || 0;
        lastWasEquals = true;
        updateDisplay();
        closeAllDrawers();
      });
    });
  }

  // ── Menu (hamburger) ──
  function setupMenu() {
    const btn = $('#menuToggle');
    if (!btn) return;
    btn.addEventListener('click', openMenu);
    const closeBtn = $('#menuClose');
    if (closeBtn) closeBtn.addEventListener('click', () => closeAllDrawers());

    $$('[data-menu-mode]').forEach(item => {
      item.addEventListener('click', () => {
        const mode = item.dataset.menuMode;
        switchMode(mode);
        closeAllDrawers();
      });
    });

    const undoBtn = $('#menuUndo');
    if (undoBtn) undoBtn.addEventListener('click', () => { undo(); });
    const redoBtn = $('#menuRedo');
    if (redoBtn) redoBtn.addEventListener('click', () => { redo(); });
    const histBtn = $('#menuHistory');
    if (histBtn) histBtn.addEventListener('click', () => {
      closeMenu(false);
      openHistory();
    });

    const exportBtn = $('#menuExport');
    if (exportBtn) exportBtn.addEventListener('click', exportHistory);
    const csvBtn = $('#menuExportCsv');
    if (csvBtn) csvBtn.addEventListener('click', exportHistoryCsv);

    const clearMem = $('#menuClearMem');
    if (clearMem) clearMem.addEventListener('click', () => {
      memory = 0;
      Storage.setMemory(0);
      updateMemoryIndicator();
      closeAllDrawers();
    });
  }

  function openMenu() {
    closeHistory(false);
    if (menuDrawer) menuDrawer.classList.add('open');
    overlay.classList.add('visible');
  }

  function closeMenu(hideOverlay = true) {
    if (menuDrawer) menuDrawer.classList.remove('open');
    if (hideOverlay) overlay.classList.remove('visible');
  }

  function closeAllDrawers() {
    closeHistory(false);
    closeMenu(false);
    overlay.classList.remove('visible');
  }

  function switchMode(mode) {
    $$('.mode-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.mode === mode);
    });
    currentMode = mode;
    $$('.panel').forEach(p => p.classList.remove('active'));
    const panelId = mode === 'basic' || mode === 'scientific' ? 'panel-basic' : `panel-${mode}`;
    const panel = document.getElementById(panelId);
    if (panel) panel.classList.add('active');
    toggleScientificKeys(mode === 'scientific');
    if (mode === 'graph') Graph.plot(
          ($('#graph-fn') && $('#graph-fn').value) || 'sin(x)',
          ($('#graph-fn2') && $('#graph-fn2').value) || '',
          ($('#graph-fn3') && $('#graph-fn3').value) || ''
        );
        if (mode === 'formulas' && typeof renderFormulaList === 'function') renderFormulaList();
  }

  function exportHistoryCsv() {
    const list = Storage.getHistory();
    const rows = ['expression,result,timestamp'];
    list.forEach(h => {
      const exp = '"' + String(h.expression).replace(/"/g, '""') + '"';
      const res = '"' + String(h.result).replace(/"/g, '""') + '"';
      rows.push([exp, res, h.ts || ''].join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumina-history-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    closeAllDrawers();
  }

  function exportHistory() {
    const list = Storage.getHistory();
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumina-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    closeAllDrawers();
  }

  // ── Skins ──
  function applySkin(skin) {
    skin = skin || 'lumina';
    document.documentElement.setAttribute('data-skin', skin);
    document.documentElement.removeAttribute('data-theme');
    Storage.setSkin(skin);
    if (DARK_SKINS.includes(skin)) Storage._lastDarkSkin = skin;
    Storage.setTheme(LIGHT_SKINS.includes(skin) ? 'light' : 'dark');
    $$('.skin-swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.skin === skin);
    });
  }


  function setupDesignOptions() {
    const root = document.documentElement;
        const radius = localStorage.getItem('lumina_radius') || 'default';
    const density = localStorage.getItem('lumina_density') || 'comfortable';

        if (radius === 'soft' || radius === 'sharp') root.setAttribute('data-radius', radius);
    else root.removeAttribute('data-radius');
    if (density === 'compact') root.setAttribute('data-density', 'compact');
    else root.removeAttribute('data-density');

    $$('#optRadius .design-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.radius === radius || (radius === 'default' && chip.dataset.radius === 'default'));
      chip.addEventListener('click', () => {
        $$('#optRadius .design-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const r = chip.dataset.radius;
        localStorage.setItem('lumina_radius', r);
        if (r === 'default') root.removeAttribute('data-radius');
        else root.setAttribute('data-radius', r);
      });
    });

    $$('#optDensity .design-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.density === density);
      chip.addEventListener('click', () => {
        $$('#optDensity .design-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const d = chip.dataset.density;
        localStorage.setItem('lumina_density', d);
        if (d === 'compact') root.setAttribute('data-density', 'compact');
        else root.removeAttribute('data-density');
      });
    });

    // High contrast
    const hc = localStorage.getItem('lumina_hc') === '1';
    if (hc) document.body.classList.add('high-contrast');
    const hcBtn = document.getElementById('optHighContrast');
    if (hcBtn) {
      hcBtn.classList.toggle('active', hc);
      hcBtn.addEventListener('click', () => {
        const on = !document.body.classList.contains('high-contrast');
        document.body.classList.toggle('high-contrast', on);
        localStorage.setItem('lumina_hc', on ? '1' : '0');
        hcBtn.classList.toggle('active', on);
        showToast(on ? 'High contrast on' : 'High contrast off');
      });
    }

  }

  function setupSkins() {
    $$('.skin-swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        applySkin(btn.dataset.skin);
        showToast('Theme: ' + (btn.title || btn.dataset.skin));
      });
    });
    const current = Storage.getSkin();
    $$('.skin-swatch').forEach(s => s.classList.toggle('active', s.dataset.skin === current));
  }

  // ── Angle mode ──
  function updateAngleUI() {
    const el = $('#angleMode');
    if (el) el.textContent = angleMode;
  }


  function setupNotation() {
    const el = $('#notationMode');
    if (!el) return;
    const cycle = ['NORM', 'SCI', 'ENG', 'FRAC'];
    el.textContent = notationMode;
    el.addEventListener('click', () => {
      const i = cycle.indexOf(notationMode);
      notationMode = cycle[(i + 1) % cycle.length];
      localStorage.setItem('lumina_notation', notationMode);
      el.textContent = notationMode;
      resultDisplay = null;
      updateDisplay();
      showToast('Notation: ' + notationMode);
    });
  }

  function setupPhysicalConstants() {
    $$('[data-action-const]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.actionConst;
        const c = Sci.CONSTANTS && Sci.CONSTANTS[key];
        if (!c) return;
        pushUndo();
        if (lastWasEquals || expression === '') {
          expression = Sci.format(c.value, 'SCI');
          result = c.value;
        } else {
          expression += String(c.value);
          tryPreview();
        }
        lastWasEquals = false;
        resultDisplay = null;
        updateDisplay();
        showToast(c.label);
      });
    });
  }

  function setupAngleMode() {
    const el = $('#angleMode');
    if (!el) return;
    el.addEventListener('click', () => {
      angleMode = angleMode === 'DEG' ? 'RAD' : 'DEG';
      Storage.setAngleMode(angleMode);
      updateAngleUI();
      showToast(angleMode === 'DEG' ? 'Degrees mode' : 'Radians mode');
    });
  }

  // ── Copy ──
  function setupCopyResult() {
    resultEl.addEventListener('click', copyResult);
  }

  function copyResult() {
    const text = Sci.format(result);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast('Copied ' + text)).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast('Copied ' + text); } catch (e) {}
    ta.remove();
  }

  function showToast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => t.classList.remove('show'), 1600);
  }


  // ── Formulas ──
  let activeFormula = null;
  let formulaCat = 'physics';

  function setupFormulas() {
    const list = $('#formulaList');
    if (!list) return;
    $$('[data-fcat]').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('[data-fcat]').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        formulaCat = tab.dataset.fcat;
        renderFormulaList();
        $('#formulaRun').hidden = true;
      });
    });
    renderFormulaList();
    const calcBtn = $('#formulaCalc');
    if (calcBtn) calcBtn.addEventListener('click', runActiveFormula);
  }

  function renderFormulaList() {
    const list = $('#formulaList');
    if (!list || typeof Formulas === 'undefined') return;
    const items = Formulas.list(formulaCat);
    list.innerHTML = items.map(f => `
      <button type="button" class="formula-card" data-fid="${f.id}">
        <div class="fname">${f.name}</div>
        <div class="fexpr">${f.expr}</div>
        <div class="fdesc">${f.desc}</div>
      </button>`).join('');
    list.querySelectorAll('.formula-card').forEach(card => {
      card.addEventListener('click', () => openFormula(card.dataset.fid));
    });
  }

  function openFormula(id) {
    const items = Formulas.list(formulaCat);
    activeFormula = items.find(f => f.id === id);
    if (!activeFormula) return;
    $('#formulaRun').hidden = false;
    $('#formulaTitle').textContent = activeFormula.name + '  ·  ' + activeFormula.expr;
    const fields = $('#formulaFields');
    fields.innerHTML = activeFormula.fields.map(f => `
      <div class="field">
        <label>${f.l}</label>
        <input type="${f.type === 'text' ? 'text' : 'number'}" data-fk="${f.k}" value="${f.d ?? ''}" step="any" placeholder="${f.l}">
      </div>`).join('');
    $('#formulaResult').textContent = '';
  }

  function runActiveFormula() {
    if (!activeFormula) return;
    const vals = {};
    $('#formulaFields').querySelectorAll('[data-fk]').forEach(inp => {
      const raw = inp.value;
      vals[inp.dataset.fk] = inp.type === 'number' ? parseFloat(raw) : raw;
    });
    try {
      const out = activeFormula.calc(vals);
      if (!isFinite(out)) throw new Error('invalid');
      const text = Sci.format(out) + (activeFormula.unit || '');
      $('#formulaResult').textContent = 'Result: ' + text;
      result = out;
      ans = out;
      window.__luminaAns = out;
      Storage.setAns(out);
      expression = Sci.format(out);
      lastWasEquals = true;
      updateDisplay();
      Storage.addHistory(activeFormula.name, text);
      renderHistory();
    } catch (e) {
      $('#formulaResult').textContent = 'Invalid input';
    }
  }

  // ── Live currency ──
  async function refreshCurrencyRates() {
    try {
      const res = await fetch('https://api.frankfurter.app/latest?from=USD');
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.rates) {
        CONV.currency.units = { USD: 1, ...data.rates };
        // keep only known labels
        Object.keys(CONV.currency.units).forEach(k => {
          if (!CONV.currency.labels[k]) CONV.currency.labels[k] = k;
        });
        if (convType === 'currency') {
          populateConvUnits();
          convert();
        }
        console.info('Currency rates updated', data.date);
      }
    } catch (e) {
      console.warn('Currency offline — using static rates');
    }
  }

  // ── Haptic + sound ──
  let soundOn = localStorage.getItem('lumina_sound') === '1';
  let hapticOn = localStorage.getItem('lumina_haptic') !== '0';
  let audioCtx = null;

  function setupFeedback() {
    const soundBtn = $('#menuSound');
    const hapBtn = $('#menuHaptic');
    if (soundBtn) {
      soundBtn.textContent = soundOn ? '♪  Key Sound: On' : '♪  Key Sound: Off';
      soundBtn.addEventListener('click', () => {
        soundOn = !soundOn;
        localStorage.setItem('lumina_sound', soundOn ? '1' : '0');
        soundBtn.innerHTML = '<span class="menu-icon">♪</span> Key Sound: ' + (soundOn ? 'On' : 'Off');
        showToast('Key sound ' + (soundOn ? 'on' : 'off'));
      });
    }
    if (hapBtn) {
      hapBtn.innerHTML = '<span class="menu-icon">◎</span> Haptics: ' + (hapticOn ? 'On' : 'Off');
      hapBtn.addEventListener('click', () => {
        hapticOn = !hapticOn;
        localStorage.setItem('lumina_haptic', hapticOn ? '1' : '0');
        hapBtn.innerHTML = '<span class="menu-icon">◎</span> Haptics: ' + (hapticOn ? 'On' : 'Off');
        showToast('Haptics ' + (hapticOn ? 'on' : 'off'));
      });
    }
    document.querySelectorAll('.key').forEach(k => {
      k.addEventListener('pointerdown', () => keyFeedback(k));
    });
  }

  function keyFeedback(el) {
    if (hapticOn && navigator.vibrate) navigator.vibrate(8);
    if (el) {
      el.classList.remove('haptic-pulse');
      void el.offsetWidth;
      el.classList.add('haptic-pulse');
    }
    if (soundOn) playClick();
  }

  function playClick() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'triangle';
      o.frequency.value = 420;
      g.gain.value = 0.04;
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
      o.stop(audioCtx.currentTime + 0.07);
    } catch (e) {}
  }

  // ── Expression editor (contenteditable) ──
  function setupExpressionEditor() {
    if (!exprEl) return;
    exprEl.addEventListener('input', () => {
      expression = exprEl.textContent.replace(/\s+/g, '');
      lastWasEquals = false;
      tryPreview();
      resultEl.textContent = Sci.format(result);
    });
    exprEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        expression = exprEl.textContent.replace(/\s+/g, '');
        compute();
      }
    });
  }


  // ── Amortization + PDF ──
  let lastAmort = null;
  function setupAmortization() {
    const mtgA = $('#mtg-amort'), mtgP = $('#mtg-pdf');
    const loanA = $('#loan-amort'), loanP = $('#loan-pdf');
    if (mtgA) mtgA.addEventListener('click', () => {
      const r = Finance.mortgage($('#mtg-price').value, $('#mtg-down').value, $('#mtg-rate').value, $('#mtg-years').value);
      if (!r) return showToast('Invalid mortgage inputs');
      lastAmort = Finance.amortization(r.loanAmount, $('#mtg-rate').value, $('#mtg-years').value);
      renderAmortTable('mtg-amort-table', lastAmort);
      plotAmortChart(lastAmort);
      showToast('Amortization ready');
    });
    if (mtgP) mtgP.addEventListener('click', () => {
      if (!lastAmort) {
        const r = Finance.mortgage($('#mtg-price').value, $('#mtg-down').value, $('#mtg-rate').value, $('#mtg-years').value);
        if (r) lastAmort = Finance.amortization(r.loanAmount, $('#mtg-rate').value, $('#mtg-years').value);
      }
      if (!lastAmort) return showToast('Calculate amortization first');
      const w = window.open('', '_blank');
      w.document.write(Finance.amortizationReportHTML(lastAmort, 'Mortgage Amortization'));
      w.document.close();
    });
    if (loanA) loanA.addEventListener('click', () => {
      lastAmort = Finance.amortization($('#loan-amount').value, $('#loan-rate').value, $('#loan-years').value);
      if (!lastAmort) return showToast('Invalid loan inputs');
      renderAmortTable('loan-amort-table', lastAmort);
      showToast('Amortization ready');
    });
    if (loanP) loanP.addEventListener('click', () => {
      if (!lastAmort) lastAmort = Finance.amortization($('#loan-amount').value, $('#loan-rate').value, $('#loan-years').value);
      if (!lastAmort) return showToast('Calculate amortization first');
      const w = window.open('', '_blank');
      w.document.write(Finance.amortizationReportHTML(lastAmort, 'Loan Amortization'));
      w.document.close();
    });
  }
  function renderAmortTable(id, schedule) {
    const el = document.getElementById(id);
    if (!el || !schedule) return;
    el.hidden = false;
    const head = '<table><thead><tr><th>#</th><th>Pay</th><th>Prin</th><th>Int</th><th>Bal</th></tr></thead><tbody>';
    const body = schedule.rows.slice(0, 60).map(r =>
      `<tr><td>${r.month}</td><td>${Finance.fmt(r.payment)}</td><td>${Finance.fmt(r.principal)}</td><td>${Finance.fmt(r.interest)}</td><td>${Finance.fmt(r.balance)}</td></tr>`
    ).join('');
    el.innerHTML = head + body + '</tbody></table>' +
      (schedule.rows.length > 60 ? '<div style="padding:6px;opacity:.7">Showing first 60 of ' + schedule.rows.length + ' months</div>' : '');
  }
  function plotAmortChart(schedule) {
    const canvas = document.getElementById('mtg-chart');
    if (!canvas || !schedule || typeof Chart === 'undefined') return;
    canvas.hidden = false;
    const labels = schedule.rows.filter((_, i) => i % Math.ceil(schedule.rows.length / 40) === 0).map(r => r.month);
    const bals = schedule.rows.filter((_, i) => i % Math.ceil(schedule.rows.length / 40) === 0).map(r => r.balance);
    if (canvas._chart) canvas._chart.destroy();
    canvas._chart = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: { labels, datasets: [{ label: 'Balance', data: bals, borderColor: '#c45a12', borderWidth: 2, pointRadius: 0, tension: 0.2 }] },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#8a8780', maxTicksLimit: 8 } }, y: { ticks: { color: '#8a8780' } } } }
    });
  }

  // ── PWA install ──
  let deferredPrompt = null;
  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true
      || document.referrer.includes('android-app://');
  }
  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
  function isSecureContextForPWA() {
    return location.protocol === 'https:' || location.hostname === 'localhost'
      || location.hostname === '127.0.0.1' || location.hostname === '[::1]';
  }
  function showInstallHelp() {
    let msg = '';
    if (isStandalone()) {
      msg = 'Lumina is already installed — open it from your home screen.';
    } else if (!isSecureContextForPWA()) {
      msg = 'Install needs HTTPS or localhost. Push to GitHub Pages, or run: npx serve .';
    } else if (isIOS()) {
      msg = 'iPhone/iPad: Safari → Share → Add to Home Screen';
    } else if (deferredPrompt) {
      msg = 'Tap Install when the browser prompt appears.';
    } else {
      msg = 'Chrome/Edge: menu (⋮) → Cast, save, and share → Install app. Or address bar install icon.';
    }
    showToast(msg);
    // Longer help in banner
    const ban = $('#installBanner');
    if (ban) {
      ban.hidden = false;
      const span = ban.querySelector('span');
      if (span) span.textContent = msg;
    }
  }
  function setupPWA() {
    // Register SW early with correct scope
    if ('serviceWorker' in navigator) {
      const swUrl = new URL('sw.js', window.location.href).href;
      navigator.serviceWorker.register(swUrl).then((reg) => {
        console.info('Lumina SW registered', reg.scope);
      }).catch((err) => console.warn('SW register failed', err));
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const ban = $('#installBanner');
      if (ban && !localStorage.getItem('lumina_install_dismiss')) {
        ban.hidden = false;
        const span = ban.querySelector('span');
        if (span) span.textContent = 'Install Lumina for offline use';
      }
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      const ban = $('#installBanner');
      if (ban) ban.hidden = true;
      showToast('Installed — launch from your home screen');
    });

    if (isStandalone()) {
      const ban = $('#installBanner');
      if (ban) ban.hidden = true;
    }

    const doInstall = async () => {
      if (isStandalone()) {
        showToast('Already running as installed app');
        return;
      }
      if (!isSecureContextForPWA()) {
        showInstallHelp();
        return;
      }
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        deferredPrompt = null;
        const ban = $('#installBanner');
        if (ban) ban.hidden = true;
        if (choice && choice.outcome === 'accepted') showToast('Installing…');
        else showToast('Install dismissed');
        return;
      }
      // No native prompt available — guide the user
      showInstallHelp();
    };

    const btn = $('#installBtn'), dis = $('#installDismiss'), menu = $('#menuInstall');
    if (btn) btn.addEventListener('click', doInstall);
    if (menu) menu.addEventListener('click', doInstall);
    if (dis) dis.addEventListener('click', () => {
      localStorage.setItem('lumina_install_dismiss', '1');
      const ban = $('#installBanner');
      if (ban) ban.hidden = true;
    });
  }

  // ── Voice ──
  function setupVoice() {
    const btn = $('#menuVoice');
    if (!btn) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      btn.addEventListener('click', () => showToast('Voice not supported in this browser'));
      return;
    }
    btn.addEventListener('click', () => {
      const rec = new SR();
      rec.lang = 'en-US';
      rec.onresult = (ev) => {
        let t = ev.results[0][0].transcript.toLowerCase()
          .replace(/plus/g, '+').replace(/minus/g, '-')
          .replace(/times|multiplied by/g, '*').replace(/divided by|over/g, '/')
          .replace(/squared/g, '^2').replace(/pi/g, 'pi')
          .replace(/\s+/g, '');
        expression = t;
        lastWasEquals = false;
        updateDisplay();
        closeAllDrawers();
        showToast('Heard: ' + t);
      };
      rec.onerror = () => showToast('Voice error');
      rec.start();
      showToast('Listening…');
      closeAllDrawers();
    });
  }

  // ── OCR (Tesseract CDN on demand) ──
  function setupOCR() {
    const btn = $('#menuOcr'), file = $('#ocrFile');
    if (!btn || !file) return;
    btn.addEventListener('click', () => file.click());
    file.addEventListener('change', async () => {
      const f = file.files && file.files[0];
      if (!f) return;
      showToast('Loading OCR…');
      try {
        if (!window.Tesseract) {
          await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
            s.onload = res; s.onerror = rej;
            document.head.appendChild(s);
          });
        }
        const { data: { text } } = await Tesseract.recognize(f, 'eng');
        const cleaned = text.replace(/[^\d+\-*/^().eE\pi\s]/g, '').trim();
        expression = cleaned.replace(/\s+/g, '');
        lastWasEquals = false;
        updateDisplay();
        showToast('OCR: ' + expression.slice(0, 40));
      } catch (e) {
        showToast('OCR failed');
      }
      file.value = '';
      closeAllDrawers();
    });
  }

  // ── Backup / restore (file-based "sync") ──
  function setupBackup() {
    const b = $('#menuBackup'), r = $('#menuRestore'), rf = $('#restoreFile');
    if (b) b.addEventListener('click', () => {
      const data = Storage.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'lumina-backup-' + Date.now() + '.json';
      a.click();
      showToast('Backup downloaded');
      closeAllDrawers();
    });
    if (r && rf) {
      r.addEventListener('click', () => rf.click());
      rf.addEventListener('change', async () => {
        const f = rf.files && rf.files[0];
        if (!f) return;
        try {
          const data = JSON.parse(await f.text());
          Storage.importAll(data);
          memory = Storage.getMemory();
          ans = Storage.getAns();
          window.__luminaAns = ans;
          applySkin(Storage.getSkin());
          renderHistory();
          updateMemoryIndicator();
          showToast('Backup restored');
        } catch {
          showToast('Invalid backup file');
        }
        rf.value = '';
        closeAllDrawers();
      });
    }
  }


  // ── Tools catalog ──
  let toolCat = 'all';
  let toolQuery = '';
  let activeTool = null;
  let lastToolOut = '';
  const FAV_KEY = 'lumina_tool_favs';
  const RECENT_KEY = 'lumina_tool_recent';
  function getFavs() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch { return []; }
  }
  function setFavs(a) { localStorage.setItem(FAV_KEY, JSON.stringify(a)); }
  function getRecent() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
  }
  function pushRecent(id) {
    let r = getRecent().filter(x => x !== id);
    r.unshift(id);
    if (r.length > 12) r.length = 12;
    localStorage.setItem(RECENT_KEY, JSON.stringify(r));
  }
  function setupToolsCatalog() {
    if (typeof Tools === 'undefined') return;
    const cats = $('#toolCats');
    if (!cats) return;
    const allCats = [
      { id: 'all', name: 'All' },
      { id: 'favs', name: '★ Favs' },
      { id: 'recent', name: 'Recent' },
    ].concat(Tools.categories);
    cats.innerHTML = allCats.map((c, i) =>
      `<button type="button" class="conv-tab${i === 0 ? ' active' : ''}" data-tcat="${c.id}">${c.name}</button>`
    ).join('');
    cats.querySelectorAll('[data-tcat]').forEach(btn => {
      btn.addEventListener('click', () => {
        cats.querySelectorAll('.conv-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        toolCat = btn.dataset.tcat;
        renderToolList();
        const run = $('#toolRun');
        if (run) run.hidden = true;
      });
    });
    const search = $('#toolSearch');
    if (search) {
      search.addEventListener('input', () => {
        toolQuery = search.value.trim().toLowerCase();
        renderToolList();
      });
    }
    const calc = $('#toolCalc');
    if (calc) calc.addEventListener('click', runActiveTool);
    const copyBtn = $('#toolCopy');
    if (copyBtn) copyBtn.addEventListener('click', () => {
      if (!lastToolOut) return showToast('Nothing to copy');
      navigator.clipboard.writeText(lastToolOut).then(() => showToast('Copied')).catch(() => showToast('Copy failed'));
    });
    const toCalc = $('#toolToCalc');
    if (toCalc) toCalc.addEventListener('click', sendToolToCalc);
    const favBtn = $('#toolFavBtn');
    if (favBtn) favBtn.addEventListener('click', toggleToolFav);
    // Enter in tool fields runs calc
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && currentMode === 'tools' && document.activeElement && document.activeElement.dataset && document.activeElement.dataset.tk != null) {
        e.preventDefault();
        runActiveTool();
      }
      if (e.key === '/' && currentMode === 'tools' && document.activeElement?.id !== 'toolSearch' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        $('#toolSearch')?.focus();
      }
    });
    renderToolList();
    renderToolQuick();
  }
  function renderToolQuick() {
    const el = $('#toolQuick');
    if (!el) return;
    const favs = getFavs().slice(0, 6);
    const recent = getRecent().filter(id => !favs.includes(id)).slice(0, 6);
    const ids = favs.concat(recent);
    el.innerHTML = ids.map(id => {
      const t = Tools.get(id);
      if (!t) return '';
      const isFav = favs.includes(id);
      return `<button type="button" class="tool-chip${isFav ? ' fav' : ''}" data-qid="${id}">${isFav ? '★ ' : ''}${t.name}</button>`;
    }).join('');
    el.querySelectorAll('[data-qid]').forEach(b => b.addEventListener('click', () => openTool(b.dataset.qid)));
  }
  function renderToolList() {
    const list = $('#toolList');
    if (!list || typeof Tools === 'undefined') return;
    const favs = getFavs();
    let items;
    if (toolCat === 'favs') items = favs.map(id => Tools.get(id)).filter(Boolean);
    else if (toolCat === 'recent') items = getRecent().map(id => Tools.get(id)).filter(Boolean);
    else if (toolCat === 'all') items = Tools.list.slice();
    else items = Tools.byCategory(toolCat);
    if (toolQuery) {
      items = items.filter(t =>
        (t.name + ' ' + (t.desc || '') + ' ' + t.id).toLowerCase().includes(toolQuery)
      );
    }
    if (toolCat !== 'recent') items.sort((a, b) => a.name.localeCompare(b.name));
    // Favorites first in All
    if (toolCat === 'all' && !toolQuery) {
      items.sort((a, b) => {
        const fa = favs.includes(a.id) ? 0 : 1;
        const fb = favs.includes(b.id) ? 0 : 1;
        if (fa !== fb) return fa - fb;
        return a.name.localeCompare(b.name);
      });
    }
    const countEl = $('#toolCount');
    if (countEl) countEl.textContent = items.length + ' / ' + Tools.list.length;
    list.innerHTML = items.map(t => `
      <button type="button" class="formula-card${favs.includes(t.id) ? ' fav' : ''}" data-tid="${t.id}">
        <div class="fname">${t.name}</div>
        <div class="fdesc">${t.desc || ''}</div>
      </button>`).join('') || '<div class="fdesc">No matching tools</div>';
    list.querySelectorAll('[data-tid]').forEach(card => {
      card.addEventListener('click', () => openTool(card.dataset.tid));
    });
  }
  function openTool(id) {
    activeTool = Tools.get(id);
    if (!activeTool) return;
    pushRecent(id);
    const run = $('#toolRun');
    if (run) run.hidden = false;
    $('#toolTitle').textContent = activeTool.name;
    const favBtn = $('#toolFavBtn');
    if (favBtn) favBtn.textContent = getFavs().includes(id) ? '★' : '☆';
    $('#toolFields').innerHTML = (activeTool.fields || []).map(f => `
      <div class="field">
        <label>${f.l}</label>
        <input type="${f.type === 'text' ? 'text' : 'number'}" data-tk="${f.k}" value="${f.d ?? ''}" step="any">
      </div>`).join('');
    $('#toolResult').textContent = '';
    lastToolOut = '';
    renderToolQuick();
  }
  function toggleToolFav() {
    if (!activeTool) return;
    let favs = getFavs();
    if (favs.includes(activeTool.id)) favs = favs.filter(x => x !== activeTool.id);
    else favs.unshift(activeTool.id);
    setFavs(favs);
    const favBtn = $('#toolFavBtn');
    if (favBtn) favBtn.textContent = favs.includes(activeTool.id) ? '★' : '☆';
    renderToolList();
    renderToolQuick();
    showToast(favs.includes(activeTool.id) ? 'Added to favorites' : 'Removed from favorites');
  }
  function runActiveTool() {
    if (!activeTool) return;
    const vals = {};
    $('#toolFields').querySelectorAll('[data-tk]').forEach(inp => {
      vals[inp.dataset.tk] = inp.type === 'number' ? parseFloat(inp.value) : inp.value;
    });
    try {
      const out = activeTool.run(vals);
      lastToolOut = String(out);
      $('#toolResult').textContent = lastToolOut;
      Storage.addHistory('Tool: ' + activeTool.name, lastToolOut.split('\n')[0]);
      renderHistory();
    } catch (e) {
      lastToolOut = '';
      $('#toolResult').textContent = 'Error: ' + (e.message || e);
    }
  }
  function sendToolToCalc() {
    if (!lastToolOut) return showToast('Calculate first');
    // Prefer first number with $ or plain number in result
    const m = lastToolOut.replace(/,/g, '').match(/[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/);
    if (!m) return showToast('No number found in result');
    expression = m[0];
    result = parseFloat(m[0]);
    resultDisplay = null;
    lastWasEquals = false;
    setMode('basic');
    updateDisplay();
    showToast('Sent ' + m[0] + ' to calculator');
  }


  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escapeAttr(s) {
    return String(s).replace(/"/g, '&quot;');
  }

  // Boot
  init();
})();
