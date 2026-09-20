/* History & session persistence */
const Storage = {
  HISTORY_KEY: 'lumina_history',
  MEMORY_KEY: 'lumina_memory',
  THEME_KEY: 'lumina_theme',
  SKIN_KEY: 'lumina_skin',
  ANGLE_KEY: 'lumina_angle',
  ANS_KEY: 'lumina_ans',
  MAX_HISTORY: 80,

  getHistory() {
    try {
      return JSON.parse(localStorage.getItem(this.HISTORY_KEY) || '[]');
    } catch {
      return [];
    }
  },

  addHistory(expression, result) {
    const list = this.getHistory();
    list.unshift({ expression, result, ts: Date.now() });
    if (list.length > this.MAX_HISTORY) list.length = this.MAX_HISTORY;
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(list));
    return list;
  },

  clearHistory() {
    localStorage.removeItem(this.HISTORY_KEY);
  },

  getMemory() {
    const v = localStorage.getItem(this.MEMORY_KEY);
    return v !== null ? parseFloat(v) : 0;
  },

  setMemory(val) {
    localStorage.setItem(this.MEMORY_KEY, String(val));
  },

  getTheme() {
    return localStorage.getItem(this.THEME_KEY) || 'dark';
  },

  setTheme(theme) {
    localStorage.setItem(this.THEME_KEY, theme);
  },

  getSkin() {
    return localStorage.getItem(this.SKIN_KEY) || 'lumina';
  },

  setSkin(skin) {
    localStorage.setItem(this.SKIN_KEY, skin);
  },

  getAngleMode() {
    return localStorage.getItem(this.ANGLE_KEY) || 'DEG';
  },

  setAngleMode(mode) {
    localStorage.setItem(this.ANGLE_KEY, mode);
  },

  getAns() {
    const v = localStorage.getItem(this.ANS_KEY);
    return v !== null ? parseFloat(v) : 0;
  },

  setAns(val) {
    localStorage.setItem(this.ANS_KEY, String(val));
  }
};
