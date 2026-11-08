/* RPG 对话框：名牌、打字机效果、点击/空格推进、剧情选项、对话记录。 */
(function () {
  const G = window.Game;
  const $ = (s) => document.querySelector(s);

  G.dialogue = {
    history: [],
    init() {
      this.box = $('#dialogue'); this.nameEl = $('#dlg-name'); this.textEl = $('#dlg-text');
      this.choicesEl = $('#choices'); this.portraitEl = $('#dlg-portrait'); this.exprs = {};
      this.box.addEventListener('click', (e) => { e.stopPropagation(); this.advance(); });
      document.addEventListener('keydown', (e) => {
        if (G.ui.modalOpen()) return;
        if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); this.advance(); }
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= 9 && this._choiceResolve) {
          const btn = this.choicesEl.querySelectorAll('button')[n - 1]; if (btn) btn.click();
        }
      });
    },

    fmt(t) {
      const hero = window.GAME_CHARACTERS.hero;
      return String(t).replace(/\{hero\}/g, hero ? hero.name : '你');
    },

    say(speaker, text, expr) {
      return new Promise((resolve) => {
        const def = speaker ? window.GAME_CHARACTERS[speaker] : null;
        // 头像：用本句表情，否则沿用该角色上一次的表情
        if (def && expr) this.exprs[speaker] = expr;
        const pt = def && def.portraits ? (def.portraits[this.exprs[speaker]] || def.portraits[def.defaultExpr] || Object.values(def.portraits)[0]) : null;
        if (pt) { const u = G.assets.url(pt); if (this.portraitEl.dataset.src !== u) { this.portraitEl.dataset.src = u; this.portraitEl.style.backgroundImage = `url("${u}")`; this.portraitEl.classList.remove('pop'); void this.portraitEl.offsetWidth; this.portraitEl.classList.add('pop'); } }
        this.box.classList.toggle('has-portrait', !!pt);
        const full = this.fmt(text);
        this.box.classList.add('show');
        this.box.classList.toggle('narration', !def);
        if (def) { this.nameEl.textContent = def.name; this.nameEl.style.color = def.color; this.nameEl.style.display = ''; }
        else this.nameEl.style.display = 'none';
        G.stage.focus(def ? speaker : null);
        this.history.push({ name: def ? def.name : '', text: full });
        if (this.history.length > 200) this.history.shift();

        this._full = full;
        this.textEl.textContent = '';
        this.box.classList.remove('done');
        let i = 0; this.typing = true;
        const cps = Math.max(5, G.settings.textSpeed || 32);
        clearInterval(this._timer);
        if (cps >= 200) { i = full.length; }
        this._timer = setInterval(() => {
          i++; this.textEl.textContent = full.slice(0, i);
          if (i >= full.length) this.finishTyping();
        }, 1000 / cps);
        this._resolve = resolve;
        if (i >= full.length) this.finishTyping();
      });
    },
    finishTyping() {
      clearInterval(this._timer); this.typing = false;
      this.textEl.textContent = this._full || this.textEl.textContent;
      this.box.classList.add('done');
    },
    advance() {
      if (this._choiceResolve) return;
      if (this.typing) return this.finishTyping();
      if (this._resolve) { const r = this._resolve; this._resolve = null; G.audio.sfx('sfx_click'); r(); }
    },

    choose(options) {
      return new Promise((resolve) => {
        this.choicesEl.innerHTML = '';
        options.forEach((o, idx) => {
          const b = document.createElement('button');
          b.innerHTML = `<em>${idx + 1}</em>${this.fmt(o.text)}`;
          b.addEventListener('click', (e) => {
            e.stopPropagation();
            G.audio.sfx('sfx_click');
            this.choicesEl.classList.remove('show');
            this._choiceResolve = null;
            this.history.push({ name: '▶ 选择', text: this.fmt(o.text) });
            resolve(idx);
          });
          this.choicesEl.appendChild(b);
        });
        this._choiceResolve = resolve;
        this.choicesEl.classList.add('show');
      });
    },

    hide() {
      this.box.classList.remove('show');
      this.choicesEl.classList.remove('show');
      G.stage.focus(null);
    }
  };
})();
