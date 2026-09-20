/* Persistence: history, memory, scenarios, formula packs, full backup */
const Storage = {
  HISTORY_KEY: 'lumina_history',
  MEMORY_KEY: 'lumina_memory',
  THEME_KEY: 'lumina_theme',
  SKIN_KEY: 'lumina_skin',
  ANGLE_KEY: 'lumina_angle',
  ANS_KEY: 'lumina_ans',
  SCENARIOS_KEY: 'lumina_scenarios',
  PACKS_KEY: 'lumina_formula_packs',
  MAX_HISTORY: 100,

  getHistory() {
    try { return JSON.parse(localStorage.getItem(this.HISTORY_KEY) || '[]'); }
    catch { return []; }
  },
  addHistory(expression, result) {
    const list = this.getHistory();
    list.unshift({ expression, result, ts: Date.now() });
    if (list.length > this.MAX_HISTORY) list.length = this.MAX_HISTORY;
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(list));
    return list;
  },
  clearHistory() { localStorage.removeItem(this.HISTORY_KEY); },

  getMemory() {
    const v = localStorage.getItem(this.MEMORY_KEY);
    return v !== null ? parseFloat(v) : 0;
  },
  setMemory(val) { localStorage.setItem(this.MEMORY_KEY, String(val)); },

  getTheme() { return localStorage.getItem(this.THEME_KEY) || 'dark'; },
  setTheme(theme) { localStorage.setItem(this.THEME_KEY, theme); },
  getSkin() { return localStorage.getItem(this.SKIN_KEY) || 'lumina'; },
  setSkin(skin) { localStorage.setItem(this.SKIN_KEY, skin); },
  getAngleMode() { return localStorage.getItem(this.ANGLE_KEY) || 'DEG'; },
  setAngleMode(mode) { localStorage.setItem(this.ANGLE_KEY, mode); },
  getAns() {
    const v = localStorage.getItem(this.ANS_KEY);
    return v !== null ? parseFloat(v) : 0;
  },
  setAns(val) { localStorage.setItem(this.ANS_KEY, String(val)); },

  getScenarios() {
    try { return JSON.parse(localStorage.getItem(this.SCENARIOS_KEY) || '[]'); }
    catch { return []; }
  },
  saveScenario(scenario) {
    const list = this.getScenarios();
    scenario.id = scenario.id || 's_' + Date.now();
    scenario.ts = Date.now();
    list.unshift(scenario);
    if (list.length > 30) list.length = 30;
    localStorage.setItem(this.SCENARIOS_KEY, JSON.stringify(list));
    return list;
  },
  deleteScenario(id) {
    const list = this.getScenarios().filter(s => s.id !== id);
    localStorage.setItem(this.SCENARIOS_KEY, JSON.stringify(list));
    return list;
  },

  getFormulaPacks() {
    try { return JSON.parse(localStorage.getItem(this.PACKS_KEY) || '[]'); }
    catch { return []; }
  },
  saveFormulaPack(pack) {
    const list = this.getFormulaPacks();
    pack.id = pack.id || 'p_' + Date.now();
    list.unshift(pack);
    localStorage.setItem(this.PACKS_KEY, JSON.stringify(list));
    return list;
  },

  /** Full backup for "cloud sync" via file */
  exportAll() {
    return {
      version: 2,
      exportedAt: new Date().toISOString(),
      history: this.getHistory(),
      memory: this.getMemory(),
      ans: this.getAns(),
      skin: this.getSkin(),
      angle: this.getAngleMode(),
      scenarios: this.getScenarios(),
      formulaPacks: this.getFormulaPacks(),
      notation: localStorage.getItem('lumina_notation'),
      settings: {
        sound: localStorage.getItem('lumina_sound'),
        haptic: localStorage.getItem('lumina_haptic'),
        density: localStorage.getItem('lumina_density'),
        radius: localStorage.getItem('lumina_radius'),
        hc: localStorage.getItem('lumina_hc')
      }
    };
  },

  importAll(data) {
    if (!data || typeof data !== 'object') throw new Error('Invalid backup');
    if (data.history) localStorage.setItem(this.HISTORY_KEY, JSON.stringify(data.history));
    if (data.memory != null) this.setMemory(data.memory);
    if (data.ans != null) this.setAns(data.ans);
    if (data.skin) this.setSkin(data.skin);
    if (data.angle) this.setAngleMode(data.angle);
    if (data.scenarios) localStorage.setItem(this.SCENARIOS_KEY, JSON.stringify(data.scenarios));
    if (data.formulaPacks) localStorage.setItem(this.PACKS_KEY, JSON.stringify(data.formulaPacks));
    if (data.notation) localStorage.setItem('lumina_notation', data.notation);
    if (data.settings) {
      Object.entries(data.settings).forEach(([k, v]) => {
        if (v != null) localStorage.setItem('lumina_' + (k === 'hc' ? 'hc' : k), v);
      });
    }
  }
};
