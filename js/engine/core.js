/* 核心：事件总线 + 游戏状态 + 条件判断。不依赖任何素材或剧情内容。 */
(function () {
  const G = (window.Game = window.Game || {});

  G.bus = {
    _h: {},
    on(evt, fn) { (this._h[evt] = this._h[evt] || []).push(fn); },
    emit(evt, data) { (this._h[evt] || []).forEach((fn) => fn(data)); }
  };

  const SAVE_KEY = 'spiritgame.save.';

  G.state = {
    data: null,
    reset() {
      this.data = { scene: null, flags: {}, vars: {}, items: [], visited: {}, unlocked: {}, seen: {} };
    },
    has(item) { return this.data.items.includes(item); },
    give(item) {
      if (!this.has(item)) { this.data.items.push(item); G.bus.emit('inventory', { added: item }); }
    },
    take(item) {
      this.data.items = this.data.items.filter((i) => i !== item);
      G.bus.emit('inventory', { removed: item });
    },
    flag(k) { return !!this.data.flags[k]; },
    set(k, v = true) { this.data.flags[k] = v; G.bus.emit('state'); },
    unset(k) { delete this.data.flags[k]; G.bus.emit('state'); },
    unlock(scene) { this.data.unlocked[scene] = true; G.bus.emit('state'); },

    save(slot) {
      const payload = { v: 1, time: Date.now(), data: this.data };
      localStorage.setItem(SAVE_KEY + slot, JSON.stringify(payload));
    },
    peek(slot) {
      try { return JSON.parse(localStorage.getItem(SAVE_KEY + slot)); } catch (e) { return null; }
    },
    load(slot) {
      const p = this.peek(slot);
      if (!p) return false;
      this.data = Object.assign({ scene: null, flags: {}, vars: {}, items: [], visited: {}, unlocked: {}, seen: {} }, p.data);
      return true;
    }
  };

  /* 条件：
   *  'flag:x' '!flag:x' 'item:x' 'var:x>=n' 'visited:scene' 'unlocked:scene' 'count:prefix>=n'
   *  数组 = 全部满足；{ any: [...] } = 任一满足；{ not: cond } */
  G.cond = function cond(c) {
    if (c === undefined || c === null || c === true) return true;
    if (c === false) return false;
    if (Array.isArray(c)) return c.every(cond);
    if (typeof c === 'object') {
      if (c.any) return c.any.some(cond);
      if (c.not) return !cond(c.not);
      return true;
    }
    let s = String(c).trim();
    let neg = false;
    if (s[0] === '!') { neg = true; s = s.slice(1); }
    const idx = s.indexOf(':');
    const type = s.slice(0, idx), arg = s.slice(idx + 1);
    const d = G.state.data;
    let r = false;
    switch (type) {
      case 'flag': r = !!d.flags[arg]; break;
      case 'item': r = d.items.includes(arg); break;
      case 'visited': r = !!d.visited[arg]; break;
      case 'unlocked': r = !!d.unlocked[arg]; break;
      case 'var': {
        const m = arg.match(/^(.+?)(>=|<=|==|>|<)(-?\d+)$/);
        if (m) {
          const n = d.vars[m[1]] || 0, t = +m[3];
          r = { '>=': n >= t, '<=': n <= t, '==': n === t, '>': n > t, '<': n < t }[m[2]];
        }
        break;
      }
      case 'count': {
        const m = arg.match(/^(.+?)(>=|<=|==|>|<)(\d+)$/);
        if (m) {
          const n = Object.keys(d.flags).filter((k) => k.startsWith(m[1]) && d.flags[k]).length;
          const t = +m[3];
          r = { '>=': n >= t, '<=': n <= t, '==': n === t, '>': n > t, '<': n < t }[m[2]];
        }
        break;
      }
      default: console.warn('[cond] 未知条件', c);
    }
    return neg ? !r : r;
  };

  G.applyEffects = function (list) {
    (list || []).forEach((e) => {
      if (e.set) G.state.set(e.set, e.value === undefined ? true : e.value);
      if (e.unset) G.state.unset(e.unset);
      if (e.give) G.state.give(e.give);
      if (e.take) G.state.take(e.take);
      if (e.unlock) G.state.unlock(e.unlock);
      if (e.inc) { const v = G.state.data.vars; v[e.inc] = (v[e.inc] || 0) + (e.by == null ? 1 : e.by); G.bus.emit('state'); }
      if (e.dec) { const v = G.state.data.vars; v[e.dec] = (v[e.dec] || 0) - (e.by == null ? 1 : e.by); G.bus.emit('state'); }
    });
  };

  G.sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  G.settings = Object.assign(
    { bgm: 0.7, sfx: 0.8, textSpeed: 32 },
    JSON.parse(localStorage.getItem('spiritgame.settings') || '{}')
  );
  G.saveSettings = () => localStorage.setItem('spiritgame.settings', JSON.stringify(G.settings));

  G.debug = /[?&]debug=1/.test(location.search);
})();
