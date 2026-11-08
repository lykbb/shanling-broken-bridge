/* 界面：标题、HUD、背包、地图、存读档、设置、对话记录、结局、提示、调试面板。 */
(function () {
  const G = window.Game;
  const $ = (s) => document.querySelector(s);
  const ENDKEY = 'spiritgame.endings';

  G.ui = {
    ended: false,
    _modal: null,

    init() {
      $('#btn-bag').onclick = () => this.open('bag');
      $('#btn-map').onclick = () => this.open('map');
      $('#btn-save').onclick = () => this.open('save');
      $('#btn-log').onclick = () => this.open('log');
      $('#btn-settings').onclick = () => this.open('settings');
      $('#btn-menu').onclick = () => { if (confirm('返回标题画面？未存档的进度会保留在自动存档中。')) this.showTitle(); };
      $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') this.close(); });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.close();
        if ((e.key === 'h' || e.key === 'H') && !this._modal) $('#stage').classList.toggle('hint');
        if ((e.key === 'i' || e.key === 'I') && this.inGame()) this.open('bag');
        if ((e.key === 'm' || e.key === 'M') && this.inGame()) this.open('map');
      });
      G.bus.on('inventory', (e) => {
        if (e.added) { const it = window.GAME_ITEMS[e.added]; $('#btn-bag').classList.add('ping'); setTimeout(() => $('#btn-bag').classList.remove('ping'), 1200); if (it) this.toast('获得：' + it.name); }
      });
      G.bus.on('scene', ({ def }) => { $('#scene-name').textContent = def.name; $('#scene-name').classList.remove('anim'); void $('#scene-name').offsetWidth; $('#scene-name').classList.add('anim'); });
      G.bus.on('busy', (b) => $('#stage').classList.toggle('busy', b));
      G.bus.on('state', () => this.renderObjective());
      G.bus.on('inventory', () => this.renderObjective());
      if (G.debug) this.buildDebug();
    },

    /* 目标提示（右上角下方）。文本中 {var:名字} 会实时替换为变量值；null 隐藏 */
    objective(text) { G.state.data.objective = text || null; this.renderObjective(); },
    renderObjective() {
      const el = $('#objective'); const t = G.state.data && G.state.data.objective;
      if (!t) { el.classList.remove('show'); return; }
      el.textContent = t.replace(/\{var:(\w+)\}/g, (_, k) => G.state.data.vars[k] || 0);
      el.classList.add('show');
    },

    inGame() { return !$('#title').classList.contains('show') && !this.ended; },
    modalOpen() { return !!this._modal || $('#title').classList.contains('show') || $('#ending').classList.contains('show'); },

    /* ---------- 标题 ---------- */
    showTitle() {
      this.close(); this.ended = false;
      $('#ending').classList.remove('show');
      G.runner.queue = [];
      const cfg = window.GAME_CONFIG;
      $('#title').style.backgroundImage = `url("${G.assets.url(cfg.titleBg)}")`;
      $('#title-name').textContent = cfg.title;
      $('#title-sub').textContent = cfg.subtitle || '';
      const got = this.endings();
      const total = Object.keys(window.GAME_ENDINGS).length;
      $('#title-endings').textContent = `已达成结局 ${got.length} / ${total}`;
      $('#btn-continue').disabled = !G.state.peek('auto');
      $('#title').classList.add('show');
      G.audio.bgm(cfg.titleBgm);
    },
    newGame() {
      G.audio.unlock();
      G.state.reset(); G.dialogue.history = [];
      $('#title').classList.remove('show');
      G.stage.goto(window.GAME_CONFIG.startScene);
    },
    continueGame(slot = 'auto') {
      G.audio.unlock();
      if (!G.state.load(slot)) return this.toast('没有存档');
      this.close(); this.ended = false;
      $('#title').classList.remove('show'); $('#ending').classList.remove('show');
      G.stage.goto(G.state.data.scene || window.GAME_CONFIG.startScene, { silent: true });
      this.toast('读取完成');
    },
    autosave() { if (!this.ended && !G.runner.busy) G.state.save('auto'); },

    /* ---------- 弹窗 ---------- */
    open(kind) {
      if (G.runner.busy && (kind === 'save' || kind === 'map')) return this.toast('剧情进行中，稍后再试');
      if (!this.inGame()) return;
      const body = $('#modal-body');
      const titles = { bag: '背包', map: '地图', save: '存档 / 读档', log: '对话记录', settings: '设置' };
      $('#modal-title').textContent = titles[kind];
      body.innerHTML = '';
      this['_' + kind](body);
      $('#modal').classList.add('show');
      this._modal = kind;
    },
    close() { $('#modal').classList.remove('show'); this._modal = null; },

    _bag(body) {
      const items = G.state.data.items;
      if (!items.length) { body.innerHTML = '<p class="muted">背包空空如也。</p>'; return; }
      const grid = document.createElement('div'); grid.className = 'bag';
      const detail = document.createElement('div'); detail.className = 'bag-detail';
      items.forEach((id, idx) => {
        const it = window.GAME_ITEMS[id] || { name: id, desc: '' };
        const cell = document.createElement('button'); cell.className = 'bag-cell';
        cell.innerHTML = `<img src="${G.assets.url(it.icon)}"><span>${it.name}</span>`;
        cell.onclick = () => { grid.querySelectorAll('.bag-cell').forEach((c) => c.classList.remove('sel')); cell.classList.add('sel'); detail.innerHTML = `<h4>${it.name}</h4><p>${it.desc}</p>`; };
        grid.appendChild(cell);
        if (idx === 0) setTimeout(() => cell.click());
      });
      body.append(grid, detail);
    },
    _map(body) {
      const list = document.createElement('div'); list.className = 'map';
      Object.entries(window.GAME_SCENES).forEach(([id, s]) => {
        if (s.hideFromMap) return;
        const ok = G.state.data.unlocked[id];
        const b = document.createElement('button');
        b.className = 'map-node' + (id === G.state.data.scene ? ' here' : '');
        b.disabled = !ok || id === G.state.data.scene;
        b.innerHTML = `<img src="${G.assets.url(s.bg)}"><span>${ok ? s.name : '？？？'}</span>`;
        b.onclick = () => { this.close(); G.audio.sfx('sfx_step'); G.stage.goto(id); };
        list.appendChild(b);
      });
      body.appendChild(list);
    },
    _save(body) {
      const wrap = document.createElement('div'); wrap.className = 'slots';
      ['auto', '1', '2', '3'].forEach((slot) => {
        const p = G.state.peek(slot);
        const row = document.createElement('div'); row.className = 'slot';
        const info = p ? `${(window.GAME_SCENES[p.data.scene] || {}).name || p.data.scene} · ${new Date(p.time).toLocaleString()}` : '空';
        row.innerHTML = `<b>${slot === 'auto' ? '自动' : '存档 ' + slot}</b><span>${info}</span>`;
        if (slot !== 'auto') {
          const s = document.createElement('button'); s.textContent = '保存';
          s.onclick = () => { G.state.save(slot); this.toast('已保存'); this.open('save'); };
          row.appendChild(s);
        }
        const l = document.createElement('button'); l.textContent = '读取'; l.disabled = !p;
        l.onclick = () => this.continueGame(slot);
        row.appendChild(l);
        wrap.appendChild(row);
      });
      body.appendChild(wrap);
    },
    _log(body) {
      const h = G.dialogue.history;
      body.innerHTML = h.length ? h.map((l) => `<p class="log-line">${l.name ? `<b>${l.name}</b>` : ''}${l.text}</p>`).join('') : '<p class="muted">暂无记录。</p>';
      setTimeout(() => { body.scrollTop = body.scrollHeight; });
    },
    _settings(body) {
      const row = (label, key, min, max, step, fmt) => {
        const r = document.createElement('label'); r.className = 'setting';
        r.innerHTML = `<span>${label}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${G.settings[key]}"><em>${fmt(G.settings[key])}</em>`;
        const input = r.querySelector('input'), em = r.querySelector('em');
        input.oninput = () => { G.settings[key] = +input.value; em.textContent = fmt(+input.value); G.saveSettings(); if (key === 'bgm') G.audio.refreshVolume(); };
        if (key === 'sfx') input.onchange = () => G.audio.sfx('sfx_item');
        body.appendChild(r);
      };
      row('音乐音量', 'bgm', 0, 1, 0.05, (v) => Math.round(v * 100) + '%');
      row('音效音量', 'sfx', 0, 1, 0.05, (v) => Math.round(v * 100) + '%');
      row('文字速度', 'textSpeed', 10, 200, 5, (v) => (v >= 200 ? '瞬间' : v + ' 字/秒'));
      const tip = document.createElement('p'); tip.className = 'muted';
      tip.innerHTML = '快捷键：空格/回车 推进对话 · 1-9 选择选项 · H 显示可交互点 · I 背包 · M 地图 · Esc 关闭';
      body.appendChild(tip);
    },

    /* ---------- 结局 ---------- */
    endings() { try { return JSON.parse(localStorage.getItem(ENDKEY) || '[]'); } catch (e) { return []; } },
    async showEnding(id) {
      const e = window.GAME_ENDINGS[id];
      if (!e) return console.error('[ui] 结局不存在', id);
      this.ended = true;
      const got = this.endings(); if (!got.includes(id)) { got.push(id); localStorage.setItem(ENDKEY, JSON.stringify(got)); }
      localStorage.removeItem('spiritgame.save.auto');
      await G.sleep(600);
      if (e.bgm) G.audio.bgm(e.bgm);
      const el = $('#ending');
      el.style.backgroundImage = e.bg ? `url("${G.assets.url(e.bg)}")` : 'none';
      el.className = 'ending-' + id;
      $('#ending-title').textContent = e.title;
      $('#ending-text').innerHTML = e.text.split('\n').map((t) => `<p>${t}</p>`).join('');
      requestAnimationFrame(() => el.classList.add('show'));
    },

    toast(msg) {
      const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
      $('#toasts').appendChild(t);
      setTimeout(() => t.classList.add('out'), 1800);
      setTimeout(() => t.remove(), 2300);
    },

    /* ---------- 调试面板（网址加 ?debug=1） ---------- */
    buildDebug() {
      document.body.classList.add('debug');
      const p = document.createElement('div'); p.id = 'debug';
      p.innerHTML = '<b>DEBUG</b>';
      Object.keys(window.GAME_SCENES).forEach((id) => {
        const b = document.createElement('button'); b.textContent = id;
        b.onclick = () => { if (!G.state.data) G.state.reset(); document.querySelector('#title').classList.remove('show'); G.stage.goto(id, { silent: false }); };
        p.appendChild(b);
      });
      const m = document.createElement('button'); m.textContent = '缺失素材';
      m.onclick = () => alert('图片：\n' + G.assets.missing.join('\n') + '\n\n音频：\n' + G.audio.missing().join('\n'));
      const s = document.createElement('button'); s.textContent = '状态';
      s.onclick = () => alert(JSON.stringify(G.state.data, null, 2));
      p.append(m, s);
      document.body.appendChild(p);
    }
  };
})();
