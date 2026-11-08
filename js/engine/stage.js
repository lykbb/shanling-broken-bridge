/* 舞台：16:9 固定镜头（1920x1080 逻辑坐标，自动缩放）、背景、角色立绘叠加、热点、氛围特效、2.5D 视差。 */
(function () {
  const G = window.Game;
  const W = 1920, H = 1080;
  const POS = { left: 480, center: 960, right: 1440, farleft: 300, farright: 1620 };

  const $ = (sel) => document.querySelector(sel);

  G.stage = {
    el: null, chars: {}, sceneId: null, mouse: { x: 0, y: 0 },

    init() {
      this.el = $('#stage');
      this.bgA = $('#bg-a'); this.bgB = $('#bg-b');
      this.charLayer = $('#chars'); this.hotLayer = $('#hotspots'); this.fxLayer = $('#fx'); this.propLayer = $('#props'); this.cgEl = $('#cg');
      const fit = () => {
        const s = Math.min(window.innerWidth / W, window.innerHeight / H);
        this.scale = s;
        this.el.style.transform = `translate(-50%, -50%) scale(${s})`;
      };
      window.addEventListener('resize', fit); fit();

      // 2.5D 视差：鼠标移动时背景与角色以不同深度微移
      this.el.addEventListener('mousemove', (e) => {
        const r = this.el.getBoundingClientRect();
        this.mouse.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        this.mouse.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      });
      const tick = () => {
        const m = this.mouse;
        const bgT = `translate(${-m.x * 14}px, ${-m.y * 8}px) scale(1.03)`;
        this.bgA.style.transform = bgT; this.bgB.style.transform = bgT;
        this.propLayer.style.transform = `translate(${-m.x * 18}px, ${-m.y * 9}px)`;
        Object.values(this.chars).forEach((c) => {
          const d = c.depth == null ? 0.6 : c.depth;
          c.wrap.style.translate = `${-m.x * 28 * d}px ${-m.y * 10 * d}px`;
        });
        this.fxLayer.style.transform = `translate(${-m.x * 40}px, ${-m.y * 16}px)`;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);

      if (G.debug) {
        this.el.addEventListener('click', (e) => {
          const r = this.el.getBoundingClientRect();
          const x = Math.round((e.clientX - r.left) / this.scale), y = Math.round((e.clientY - r.top) / this.scale);
          G.ui.toast(`坐标 x:${x}  y:${y}`);
          console.log('[debug] stage coords', x, y);
        }, true);
      }
    },

    scene() { return window.GAME_SCENES[this.sceneId]; },

    /* 切换场景（带淡入淡出），返回 Promise */
    async goto(id, opts = {}) {
      const def = window.GAME_SCENES[id];
      if (!def) { console.error('[stage] 场景不存在', id); return; }
      const fade = $('#fade');
      if (!opts.instant) { fade.classList.add('on'); await G.sleep(450); }
      this.sceneId = id;
      const st = G.state.data;
      st.scene = id; st.unlocked[id] = true;
      const firstVisit = !st.visited[id];
      st.visited[id] = true;

      this.setBg(def.bg, true);
      this.clearChars();
      this.cg(null);
      this.sync();
      this.setFx(def.fx);
      G.audio.bgm(def.bgm);
      G.bus.emit('scene', { id, def });
      G.ui.renderObjective();
      if (!opts.instant) { await G.sleep(80); fade.classList.remove('on'); await G.sleep(350); }

      if (!opts.silent && def.onEnter) {
        if (firstVisit && def.onEnter.first) G.runner.run(def.onEnter.first);
        if (def.onEnter.every) G.runner.run(def.onEnter.every);
      }
      if (!opts.silent) G.ui.autosave();
    },

    setBg(assetId, instant) {
      const url = G.assets.url(assetId);
      const front = this.bgA.classList.contains('show') ? this.bgA : this.bgB;
      const back = front === this.bgA ? this.bgB : this.bgA;
      back.style.backgroundImage = `url("${url}")`;
      if (instant) { back.style.transition = 'none'; front.style.transition = 'none'; }
      back.classList.add('show'); front.classList.remove('show');
      if (instant) requestAnimationFrame(() => { back.style.transition = ''; front.style.transition = ''; });
    },

    setFx(kind) {
      this.fxLayer.innerHTML = '';
      this.fxLayer.className = 'fx-' + (kind || 'none');
      if (!kind) return;
      const n = { dust: 26, mist: 6, fireflies: 34, embers: 40 }[kind] || 0;
      for (let i = 0; i < n; i++) {
        const p = document.createElement('i');
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 100 + '%';
        p.style.animationDelay = (-Math.random() * 12).toFixed(2) + 's';
        p.style.animationDuration = (6 + Math.random() * 10).toFixed(2) + 's';
        this.fxLayer.appendChild(p);
      }
    },

    /* ---------- 角色 ---------- */
    show(id, o = {}) {
      const def = window.GAME_CHARACTERS[id];
      if (!def) return console.warn('[stage] 未登记的角色', id);
      let c = this.chars[id];
      const x = typeof o.at === 'number' ? o.at : (POS[o.at] != null ? POS[o.at] : (c ? c.x : POS.center));
      if (!c) {
        const wrap = document.createElement('div'); wrap.className = 'char' + (def.float ? ' float' : '');
        const img = document.createElement('img'); img.draggable = false; img.alt = def.name;
        wrap.appendChild(img); this.charLayer.appendChild(wrap);
        c = this.chars[id] = { id, wrap, img, expr: null, x, depth: o.depth };
        requestAnimationFrame(() => wrap.classList.add('in'));
      }
      c.x = x; if (o.depth != null) c.depth = o.depth;
      if (o.cls) o.cls.split(' ').forEach((k) => k && c.wrap.classList.add(k));
      c.wrap.style.left = x + 'px';
      c.wrap.style.bottom = (o.y || 0) + 'px';
      c.wrap.style.height = (o.height || def.height || 900) + 'px';
      c.wrap.style.zIndex = Math.round(o.y != null ? 100 - o.y / 10 : 50);
      this.face(id, o.expr || c.expr || 'normal');
    },
    face(id, expr) {
      const c = this.chars[id], def = window.GAME_CHARACTERS[id];
      if (!c || !def) return;
      const asset = def.sprites[expr] || def.sprites.normal || Object.values(def.sprites)[0];
      if (c.expr === expr) return;
      c.expr = expr;
      if (c.asset === asset) return;   // 只有头像表情变化、立绘相同时不重播动画
      c.asset = asset;
      c.img.src = G.assets.url(asset);
      c.wrap.classList.remove('pop'); void c.wrap.offsetWidth; c.wrap.classList.add('pop');
    },
    hide(id, effect) {
      const c = this.chars[id]; if (!c) return;
      delete this.chars[id];
      if (effect === 'dissolve') { c.wrap.classList.add('dissolve'); setTimeout(() => c.wrap.remove(), 2600); return; }
      c.wrap.classList.remove('in');
      setTimeout(() => c.wrap.remove(), 400);
    },
    charClass(id, add, remove) {
      const c = this.chars[id]; if (!c) return;
      if (add) add.split(' ').forEach((k) => c.wrap.classList.add(k));
      if (remove) remove.split(' ').forEach((k) => c.wrap.classList.remove(k));
    },

    /* 全屏 CG（开场、回忆投影等）。style: kenburns | memory | 自定义 class */
    cg(assetId, style) {
      const el = this.cgEl;
      if (!assetId) { el.classList.remove('show'); return; }
      el.className = 'cg ' + (style || '');
      el.querySelector('img').src = G.assets.url(assetId);
      void el.offsetWidth; el.classList.add('show');
    },

    renderProps() {
      const def = this.scene();
      this.propLayer.innerHTML = '';
      (def.props || []).forEach((p) => {
        if (!G.cond(p.if)) return;
        const el = document.createElement('div');
        el.className = 'prop ' + (p.cls || '');
        Object.assign(el.style, { left: p.x + 'px', top: p.y + 'px', width: (p.w || 100) + 'px', height: (p.h || 100) + 'px' });
        if (p.asset) el.style.backgroundImage = `url("${G.assets.url(p.asset)}")`;
        if (p.text) el.textContent = p.text;
        this.propLayer.appendChild(el);
      });
    },
    clearChars() { Object.keys(this.chars).forEach((id) => { this.chars[id].wrap.remove(); delete this.chars[id]; }); },
    focus(speaker) {
      Object.values(this.chars).forEach((c) => {
        c.wrap.classList.toggle('speaking', c.id === speaker);
        c.wrap.classList.toggle('dim', !!speaker && speaker !== 'narrator' && c.id !== speaker);
      });
    },

    /* 按场景定义重新同步常驻角色和热点（剧情结束后调用，临时出场的角色会退场） */
    sync() {
      const def = this.scene(); if (!def) return;
      const want = (def.characters || []).filter((c) => G.cond(c.if));
      const wantIds = want.map((c) => c.id);
      Object.keys(this.chars).forEach((id) => { if (!wantIds.includes(id)) this.hide(id); });
      want.forEach((c) => this.show(c.id, { at: c.x, y: c.y, expr: this.chars[c.id] ? this.chars[c.id].expr : c.expr, depth: c.depth, height: c.height, cls: c.cls }));
      this.focus(null);
      this.renderProps();
      this.renderHotspots();
    },

    renderHotspots() {
      const def = this.scene();
      this.hotLayer.innerHTML = '';
      (def.hotspots || []).forEach((h) => {
        if (h.type !== 'exit' && !G.cond(h.if)) return;
        const el = document.createElement('div');
        const key = this.sceneId + '.' + h.id;
        const seen = G.state.data.seen[key];
        el.className = `hotspot hs-${h.type}` + (seen ? ' seen' : '') + (h.type === 'exit' && !G.cond(h.if) ? ' locked' : '');
        const [x, y, w, hh] = h.rect;
        Object.assign(el.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: hh + 'px' });
        el.innerHTML = `<span class="hs-label">${h.label || ''}</span>${h.type === 'item' && !seen ? '<b class="spark"></b>' : ''}`;
        el.addEventListener('mouseenter', () => G.audio.sfx('sfx_click'));
        el.addEventListener('click', (e) => { e.stopPropagation(); this.activate(h, key); });
        this.hotLayer.appendChild(el);
      });
    },

    activate(h, key) {
      if (G.runner.busy || G.ui.modalOpen()) return;
      G.state.data.seen[key] = true;
      if (h.type === 'exit') {
        if (G.cond(h.if)) { G.audio.sfx('sfx_step'); this.goto(h.to); }
        else if (h.locked) G.runner.run(h.locked);
        return;
      }
      if (h.do) G.applyEffects(h.do);
      if (h.script) G.runner.run(h.script);
    },

    /* ---------- 演出 ---------- */
    shake() { this.el.classList.remove('shake'); void this.el.offsetWidth; this.el.classList.add('shake'); },
    flash(color) {
      const f = $('#flash'); f.style.background = color || '#fff';
      f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
    }
  };
})();
