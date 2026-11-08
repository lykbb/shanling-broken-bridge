/* =========================================================
 * 世界地图模块（独立模块，读 data/worldmap.js 配置）
 *  - MapView      地图主视图（背景、打开/关闭动画、计数牌、章节栏、菜单）
 *  - MapSpot      地点热点（悬停光晕、选中缩放、四种状态标记）
 *  - DetailPanel  右侧地点详情（大图预览 + 缩略图、介绍、人物、状态、进入按钮）
 *  - CharCard     人物简介浮层
 * 状态全部来自现有存档 Game.state.data（flags / visited / scene），
 * 选中的地点记在 Game.state.data.mapSel，随现有存档一起保存。
 * 进入场景调用现有 Game.stage.goto(scene)，复用原有淡入淡出。
 * ========================================================= */
(function () {
  const G = window.Game;
  const CFG = window.WORLD_MAP;
  if (!G || !CFG) return;

  const STATUS = {
    locked:    { text: '未解锁', mark: '🔒' },
    unlocked:  { text: '可前往', mark: '' },
    exploring: { text: '探索中', mark: '!' },
    done:      { text: '已完成', mark: '✓' }
  };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pct = (r) => `left:${r[0]}%;top:${r[1]}%;width:${r[2]}%;height:${r[3]}%`;
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  /* 条件：复用剧情条件 Game.cond，另支持 'ended'（当前周目已看到结局） */
  function test(c) {
    if (c === 'ended') return !!(G.ui && G.ui.ended);
    return G.cond(c);
  }

  /* 图片：文件缺失时换成占位框并写出路径，方便补素材 */
  function img(src, alt) {
    const i = el('img'); i.alt = alt || ''; i.draggable = false;
    i.onerror = () => { const ph = el('div', 'wm-ph', `<span>缺少图片</span><code>${esc(src)}</code>`); ph.title = src; i.replaceWith(ph); };
    i.src = src;
    return i;
  }

  const WM = (G.worldmap = {
    el: null, isOpen: false, sel: null, imgIdx: 0, spots: {},

    /* ---------- 状态 ---------- */
    loc(id) { return CFG.locations.find((l) => l.id === id); },
    status(loc) {
      if (!test(loc.unlockIf)) return 'locked';
      if (test(loc.doneIf)) return 'done';
      const d = G.state.data;
      if (d.scene === loc.scene || d.visited[loc.scene]) return 'exploring';
      return 'unlocked';
    },
    chapterStatus(ch) {
      if (!test(ch.unlockIf)) return 'locked';
      if (test(ch.doneIf)) return 'done';
      return 'exploring';
    },
    defaultSel() {
      const d = G.state.data || {};
      if (d.mapSel && this.loc(d.mapSel)) return d.mapSel;
      const here = CFG.locations.find((l) => l.scene === d.scene);
      return (here || CFG.locations[0]).id;
    },

    /* ---------- 构建（只建一次） ---------- */
    build() {
      if (this.el) return;
      const root = (this.el = el('div', '', ''));
      root.id = 'worldmap';
      root.innerHTML = `<div class="wm-frame"><div class="wm-bg"></div><div class="wm-areas"></div><div class="wm-pins"></div><div class="wm-menu"></div><div class="wm-counters"></div><div class="wm-panel"></div><div class="wm-chapters"></div><button class="wm-close">返回场景 <b>✕</b></button><div class="wm-card"></div></div>`;
      const $ = (s) => root.querySelector(s);
      const bg = $('.wm-bg');
      const probe = new Image();
      probe.onload = () => { bg.style.backgroundImage = `url("${CFG.image}")`; };
      probe.onerror = () => { bg.classList.add('missing'); bg.innerHTML = `<div class="wm-ph big"><span>缺少世界地图</span><code>${esc(CFG.image)}</code></div>`; };
      probe.src = CFG.image;

      const L = CFG.layout;
      $('.wm-counters').style.cssText = pct(L.counters);
      $('.wm-panel').style.cssText = pct(L.panel);
      $('.wm-chapters').style.cssText = pct(L.chapterBar);
      $('.wm-close').style.cssText = pct(L.close);
      $('.wm-close').onclick = () => this.close();

      /* 地点热点 + 名牌 */
      CFG.locations.forEach((loc, i) => {
        const area = el('button', 'wm-area'); area.style.cssText = pct(loc.area); area.dataset.id = loc.id;
        area.setAttribute('aria-label', loc.name);
        const pin = el('button', 'wm-pin', `<i class="wm-num">${i + 1}</i><span class="wm-pname">${esc(loc.name)}</span><small>${esc(loc.tagline)}</small><em class="wm-mark"></em>`);
        pin.style.cssText = pct(loc.pin); pin.dataset.id = loc.id;
        [area, pin].forEach((b) => {
          b.onclick = (e) => { e.stopPropagation(); this.select(loc.id, true); };
          b.onmouseenter = () => this.hover(loc.id, true);
          b.onmouseleave = () => this.hover(loc.id, false);
        });
        $('.wm-areas').appendChild(area); $('.wm-pins').appendChild(pin);
        this.spots[loc.id] = { area, pin };
      });

      /* 左侧菜单（覆盖原图上的菜单文字，只加点击） */
      (CFG.menu || []).forEach((m) => {
        const b = el('button', 'wm-menu-item' + (m.action === 'none' ? ' active' : '')); b.style.cssText = pct(m.rect); b.title = m.label;
        b.onclick = () => {
          if (m.action === 'bag' || m.action === 'settings') { this.close(true); G.ui.open(m.action); }
          else if (m.action === 'toast') G.ui.toast(m.text || '敬请期待');
        };
        $('.wm-menu').appendChild(b);
      });

      root.addEventListener('click', (e) => { if (!e.target.closest('.wm-card') && !e.target.closest('.wm-person')) this.hideCard(); });
      document.querySelector('#stage').appendChild(root);
    },

    /* ---------- 打开 / 关闭 ---------- */
    open() {
      this.build();
      this.sel = this.defaultSel();
      this.refresh();
      this.renderPanel(false);
      this.isOpen = true;
      this.el.classList.remove('closing');
      requestAnimationFrame(() => this.el.classList.add('show'));
      G.ui._modal = 'map';
      G.audio.sfx('sfx_click');
    },
    close(instant) {
      if (!this.isOpen) return;
      this.isOpen = false; this.hideCard();
      this.el.classList.remove('show');
      if (G.ui._modal === 'map') G.ui._modal = null;
      if (instant) this.el.classList.add('closing');
    },

    /* ---------- 渲染 ---------- */
    refresh() {
      CFG.locations.forEach((loc) => {
        const st = this.status(loc), s = this.spots[loc.id];
        [s.area, s.pin].forEach((b) => {
          b.className = b.className.replace(/\b(st-\w+|sel|here)\b/g, '').trim() + ` st-${st}` + (loc.id === this.sel ? ' sel' : '') + (G.state.data.scene === loc.scene ? ' here' : '');
        });
        s.pin.querySelector('.wm-mark').textContent = STATUS[st].mark;
        s.pin.title = `${loc.name} · ${STATUS[st].text}`;
      });
      this.renderCounters(); this.renderChapters();
    },
    renderCounters() {
      const items = Object.keys(window.GAME_ITEMS || {}).length;
      const got = (G.state.data.items || []).length;
      const done = CFG.locations.filter((l) => this.status(l) === 'done').length;
      this.el.querySelector('.wm-counters').innerHTML =
        `<div class="wm-count"><i>❀</i>收集 <b>${got} / ${items}</b></div><div class="wm-count"><i>❒</i>剧情进度 <b>${done} / ${CFG.locations.length}</b></div>`;
    },
    renderChapters() {
      const bar = this.el.querySelector('.wm-chapters');
      bar.innerHTML = '<div class="wm-ch-title">章节流程</div>';
      const row = el('div', 'wm-ch-row');
      CFG.chapters.forEach((ch) => {
        const st = this.chapterStatus(ch);
        const b = el('button', `wm-ch st-${st}` + (ch.loc === this.sel ? ' sel' : ''), `<i>${st === 'locked' ? '🔒' : st === 'done' ? '✓' : '◆'}</i><b>${esc(ch.name)}</b><small>${esc(ch.sub)}</small>`);
        b.title = `${ch.name} · ${STATUS[st].text}`;
        b.onclick = (e) => { e.stopPropagation(); this.select(ch.loc, true); };
        row.appendChild(b);
      });
      bar.appendChild(row);
    },

    hover(id, on) {
      const s = this.spots[id]; if (!s) return;
      s.area.classList.toggle('hover', on); s.pin.classList.toggle('hover', on);
    },

    select(id, animate) {
      if (!this.loc(id)) return;
      const changed = id !== this.sel;
      this.sel = id; G.state.data.mapSel = id;
      if (changed) this.imgIdx = 0;
      this.refresh();
      if (animate) {
        const s = this.spots[id]; s.pin.classList.remove('pop'); void s.pin.offsetWidth; s.pin.classList.add('pop');
        G.audio.sfx('sfx_click');
      }
      if (changed || !animate) this.renderPanel(true);
    },

    renderPanel(fade) {
      const panel = this.el.querySelector('.wm-panel');
      const draw = () => {
        const loc = this.loc(this.sel), st = this.status(loc);
        const locked = st === 'locked';
        panel.innerHTML = '';
        panel.className = `wm-panel st-${st}`;
        /* 大图预览 */
        const pv = el('div', 'wm-preview');
        const imgs = loc.images || [];
        const big = el('div', 'wm-big');
        pv.appendChild(big);
        if (imgs.length > 1) {
          const prev = el('button', 'wm-arrow l', '‹'), next = el('button', 'wm-arrow r', '›');
          prev.onclick = () => this.showImage(this.imgIdx - 1); next.onclick = () => this.showImage(this.imgIdx + 1);
          pv.append(prev, next);
        }
        pv.appendChild(el('div', 'wm-cap'));
        panel.appendChild(pv);
        /* 标题 */
        panel.appendChild(el('div', 'wm-head', `<h3>${esc(loc.name)}</h3><span class="wm-no">${esc(loc.no)}</span>`));
        panel.appendChild(el('div', 'wm-chap', `${esc(loc.chapter)} · ${esc(loc.tagline)}`));
        panel.appendChild(el('p', 'wm-intro', locked ? '前路尚未开启。继续推进剧情，这里会在地图上亮起。' : esc(loc.intro)));
        /* 缩略图 */
        panel.appendChild(el('div', 'wm-sec', '<i>✦</i>场景预览'));
        const th = el('div', 'wm-thumbs');
        imgs.slice(0, 4).forEach((im, i) => {
          const b = el('button', 'wm-thumb'); b.appendChild(img(im.src, im.caption)); b.title = im.caption;
          b.onclick = () => this.showImage(i);
          th.appendChild(b);
        });
        panel.appendChild(th);
        /* 人物 */
        panel.appendChild(el('div', 'wm-sec', '<i>✦</i>涉及人物'));
        const ppl = el('div', 'wm-people');
        (loc.people || []).forEach((p) => {
          const def = (window.GAME_CHARACTERS || {})[p.char] || {};
          const pid = def.portraits && (def.portraits[p.portrait] || def.portraits[def.defaultExpr]);
          const b = el('button', 'wm-person');
          const face = el('div', 'wm-face'); if (pid) face.style.backgroundImage = `url("${G.assets.url(pid)}")`;
          b.append(face, el('span', '', esc(def.name || p.char)));
          b.onclick = (e) => { e.stopPropagation(); this.showCard(p, def, pid); };
          ppl.appendChild(b);
        });
        panel.appendChild(ppl);
        /* 状态 + 进入 */
        const foot = el('div', 'wm-foot');
        foot.appendChild(el('div', `wm-status st-${st}`, `<i>${STATUS[st].mark || '◆'}</i>${STATUS[st].text}`));
        const here = G.state.data.scene === loc.scene;
        const go = el('button', 'wm-enter', locked ? '尚未解锁' : here ? '回到场景' : '进入场景');
        go.disabled = locked;
        go.onclick = () => this.enter(loc);
        foot.appendChild(go);
        panel.appendChild(foot);
        if (locked) panel.classList.add('locked');
        this.showImage(this.imgIdx, true);
      };
      if (!fade) return draw();
      panel.classList.add('fading');
      clearTimeout(this._ft);
      this._ft = setTimeout(() => { draw(); requestAnimationFrame(() => panel.classList.remove('fading')); }, 125);
    },

    showImage(i, instant) {
      const loc = this.loc(this.sel), imgs = loc.images || [];
      if (!imgs.length) return;
      this.imgIdx = (i + imgs.length) % imgs.length;
      const im = imgs[this.imgIdx];
      const big = this.el.querySelector('.wm-big'); if (!big) return;
      const swap = () => { big.innerHTML = ''; big.appendChild(img(im.src, im.caption)); big.classList.remove('fading'); };
      if (instant) swap(); else { big.classList.add('fading'); setTimeout(swap, 125); }
      this.el.querySelector('.wm-cap').textContent = im.caption || '';
      this.el.querySelectorAll('.wm-thumb').forEach((t, k) => t.classList.toggle('sel', k === this.imgIdx));
    },

    showCard(p, def, pid) {
      const card = this.el.querySelector('.wm-card');
      card.innerHTML = `<div class="wm-card-face"${pid ? ` style="background-image:url('${G.assets.url(pid)}')"` : ''}></div><div class="wm-card-text"><h4 style="color:${def.color || '#ffe0a0'}">${esc(def.name || p.char)}</h4><div class="wm-role">${esc(p.role || '')}</div><p>${esc(p.bio || '')}</p></div><button class="wm-card-x">✕</button>`;
      card.querySelector('.wm-card-x').onclick = (e) => { e.stopPropagation(); this.hideCard(); };
      card.classList.add('show');
    },
    hideCard() { if (this.el) this.el.querySelector('.wm-card').classList.remove('show'); },

    /* 进入场景：调用现有场景系统 */
    enter(loc) {
      if (this.status(loc) === 'locked') return;
      G.state.data.mapSel = loc.id;
      this.close();
      if (G.state.data.scene === loc.scene) return;
      G.audio.sfx('sfx_step');
      G.stage.goto(loc.scene);
    }
  });

  /* ---------- 集成：地图按钮 / M 键改为打开世界地图（不改 ui.js） ---------- */
  const origOpen = G.ui.open.bind(G.ui);
  G.ui.open = function (kind) {
    if (kind !== 'map') return origOpen(kind);
    if (WM.isOpen) return WM.close();
    if (G.runner.busy) return G.ui.toast('剧情进行中，稍后再试');
    if (document.querySelector('#fade.on')) return;
    if (!G.ui.inGame()) return;
    if (G.ui._modal) G.ui.close();
    WM.open();
  };
  const origClose = G.ui.close.bind(G.ui);
  G.ui.close = function () { if (WM.isOpen) WM.close(); return origClose(); };
  G.bus.on('state', () => { if (WM.isOpen) WM.refresh(); });
  /* 剧情开始时自动收起地图，避免挡住对话 */
  G.bus.on('busy', (b) => { if (b && WM.isOpen) WM.close(); });
})();
