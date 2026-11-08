/* 最终战 · 狍鸮（独立模块）
 * 剧本中调用：{ minigame: 'boss', win: '节点', lose: '节点' }
 * 数值与台词：data/boss.js（window.GAME_BOSS）
 * 只往 G.minigames.games 注册一个新小游戏，并给结局画面补一个「读档」按钮；不改引擎原文件。 */
(function () {
  const G = window.Game;
  const $ = (s) => document.querySelector(s);
  const CHECKPOINT = 'auto';

  function inZone(pos, z) { return pos >= z.a && pos <= z.b; }
  function randZone(width, avoid) {
    for (let k = 0; k < 30; k++) {
      const a = 0.08 + Math.random() * (0.84 - width);
      const z = { a, b: a + width };
      if (!avoid.some((o) => z.a < o.b + 0.04 && z.b > o.a - 0.04)) return z;
    }
    return { a: 0.1, b: 0.1 + width };
  }

  function boss(p) {
    const C = window.GAME_BOSS, T = C.text;
    const hasItem = !C.needItem || G.state.has(C.needItem);
    return new Promise((resolve) => {
      // 战前存档：失败结局后可「读档」回到祭坛重新开打
      G.state.save(CHECKPOINT);

      const L = $('#minigame'); L.innerHTML = ''; L.className = 'show mg-boss';
      L.style.setProperty('--bg', `url("${G.assets.url(C.bg)}")`);
      L.innerHTML = `
        <div class="bx-bg"></div>
        <img class="bx-boss" src="${G.assets.url(C.img)}" alt="">
        <img class="bx-hero" src="${G.assets.url('hero_full')}" alt="">
        <div class="bx-top">
          <div class="bx-name">${C.name}<small></small></div>
          <div class="bx-hp"><div class="bx-hp-fill"></div><div class="bx-hp-seg">${'<i></i>'.repeat(C.stages.length)}</div></div>
        </div>
        <div class="bx-hearts">${'<i></i>'.repeat(C.hearts)}</div>
        <button class="bx-slow">${T.slow}</button>
        <div class="bx-phase"><img alt=""><b></b></div>
        <div class="bx-panel">
          <div class="bx-tip"></div>
          <div class="bx-bar"><div class="bx-zones"></div><div class="bx-track"><div class="bx-cursor"></div></div></div>
          <button class="bx-btn"><span></span></button>
        </div>
        <div class="bx-pop"></div>`;
      const q = (s) => L.querySelector(s);
      const hpFill = q('.bx-hp-fill'), segs = L.querySelectorAll('.bx-hp-seg i'), hearts = L.querySelectorAll('.bx-hearts i');
      const zonesEl = q('.bx-zones'), cursor = q('.bx-cursor'), tip = q('.bx-tip'), btn = q('.bx-btn'), btnLabel = btn.querySelector('span');
      const panel = q('.bx-panel'), pop = q('.bx-pop'), phase = q('.bx-phase'), bossImg = q('.bx-boss'), slowBtn = q('.bx-slow');

      let hp = C.hearts, stageIdx = 0, stageHits = 0, ended = false, slow = !!C._slow;
      let turn = null;           // { kind, zones, traps, pos, dir, t, speed, ... }
      slowBtn.classList.toggle('on', slow);
      slowBtn.onclick = (e) => { e.stopPropagation(); slow = !slow; C._slow = slow; slowBtn.classList.toggle('on', slow); };

      const totalHits = C.stages.reduce((n, s) => n + (s.hits || 1), 0);
      let doneHits = 0;
      function renderHp() {
        hpFill.style.width = (100 - doneHits / totalHits * 100) + '%';
        segs.forEach((s, i) => s.classList.toggle('done', i < stageIdx));
      }
      function renderHearts() { hearts.forEach((h, i) => h.classList.toggle('lost', i >= hp)); }
      function popText(t, cls) { pop.textContent = t; pop.className = 'bx-pop show ' + (cls || ''); clearTimeout(popText._t); popText._t = setTimeout(() => pop.classList.remove('show'), 700); }
      function flashClass(el, c, ms) { el.classList.add(c); setTimeout(() => el.classList.remove(c), ms || 350); }

      async function lines(list) {
        if (!list || !list.length) return;
        panel.classList.add('hide');
        for (const l of list) await G.dialogue.say(l.say || null, l.text, l.expr);
        G.dialogue.hide();
        panel.classList.remove('hide');
      }

      async function showPhase(st) {
        const formChanged = !C.stages[stageIdx - 1] || C.stages[stageIdx - 1].form !== st.form;
        L.dataset.form = st.form;
        q('.bx-name small').textContent = st.title;
        if (formChanged) {
          phase.querySelector('img').src = G.assets.url('boss_phase' + st.form);
          G.audio.sfx('sfx_screech'); G.stage.shake();
        }
        phase.querySelector('b').textContent = st.title;
        phase.classList.remove('show'); void phase.offsetWidth; phase.classList.add('show');
        await G.sleep(1500);
        phase.classList.remove('show');
      }

      function buildTurn(kind) {
        const st = C.stages[stageIdx];
        const finisher = kind === 'attack' && st.combo;
        const gold = st.combo && !hasItem ? [] : [randZone(st.gold, [])];   // 没有双莲护符：终章既打不中也挡不住
        const traps = [];
        for (let k = 0; k < (kind === 'attack' ? st.traps || 0 : 0); k++) traps.push(randZone(0.09, gold.concat(traps)));
        zonesEl.innerHTML = gold.map((z) => `<i class="gold" style="left:${z.a * 100}%;width:${(z.b - z.a) * 100}%"></i>`).join('') +
                            traps.map((z) => `<i class="trap" style="left:${z.a * 100}%;width:${(z.b - z.a) * 100}%"></i>`).join('');
        panel.dataset.kind = kind;
        btnLabel.textContent = kind === 'attack' ? T.button.attack : T.button.block;
        let t = kind === 'attack' ? T.attackTip : T.blockTip;
        if (finisher) t = hasItem ? (st.comboTip || '').replace('{n}', st.combo) + `（0/${st.combo}）` : T.noItem;
        tip.textContent = t;
        turn = { kind, st, gold, traps, pos: 0, dir: 1, sweeps: 0, clock: 0, combo: 0, finisher, locked: false };
      }

      function relocateGold() {
        turn.gold = [randZone(turn.st.gold * 0.9, turn.traps)];
        zonesEl.querySelector('.gold').style.left = turn.gold[0].a * 100 + '%';
        zonesEl.querySelector('.gold').style.width = (turn.gold[0].b - turn.gold[0].a) * 100 + '%';
      }

      // 一回合的结果 → 'hit' | 'miss' | 'trap' | 'block' | 'hurt'
      let resolveTurn = null;
      function playTurn(kind) {
        buildTurn(kind);
        if (kind === 'block') { flashClass(bossImg, 'charge', 700); G.audio.sfx('sfx_screech'); }
        return new Promise((r) => { resolveTurn = r; });
      }
      function endTurn(result) { if (!turn || turn.locked) return; turn.locked = true; const r = resolveTurn; resolveTurn = null; setTimeout(() => r(result), 420); }

      function press() {
        if (ended || !turn || turn.locked) return;
        const pos = turn.pos;
        flashClass(btn, 'press', 160);
        if (turn.kind === 'block') return endTurn(turn.gold.some((z) => inZone(pos, z)) ? 'block' : 'hurt');
        if (turn.traps.some((z) => inZone(pos, z))) return endTurn('trap');
        if (turn.gold.some((z) => inZone(pos, z))) {
          if (turn.finisher) {
            turn.combo++; G.audio.sfx('sfx_slash'); G.stage.flash('#fff3c8'); flashClass(bossImg, 'hurt');
            tip.textContent = (turn.st.comboTip || '').replace('{n}', turn.st.combo) + `（${turn.combo}/${turn.st.combo}）`;
            if (turn.combo >= turn.st.combo) return endTurn('hit');
            relocateGold(); turn.sweeps = 0; return;
          }
          return endTurn('hit');
        }
        return endTurn('miss');
      }

      btn.addEventListener('pointerdown', (e) => { e.stopPropagation(); press(); });
      const onKey = (e) => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); press(); } };
      // 只在没有对白时接管空格（对白期间空格照旧翻页）
      const keyHandler = (e) => { if (!panel.classList.contains('hide')) onKey(e); };
      window.addEventListener('keydown', keyHandler, true);

      let last = performance.now();
      function tick(now) {
        if (ended) return;
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        if (turn && !turn.locked && !panel.classList.contains('hide')) {
          const st = turn.st;
          turn.clock += dt;
          let v = st.speed * (slow ? C.slowFactor : 1) * (turn.kind === 'block' ? 1.1 : 1);
          if (st.wobble) v *= 1 + st.wobble * Math.sin(turn.clock * 5.3) * Math.sin(turn.clock * 2.1 + 1);
          turn.pos += turn.dir * v * dt;
          if (turn.pos >= 1) { turn.pos = 1; turn.dir = -1; turn.sweeps += 0.5; }
          if (turn.pos <= 0) { turn.pos = 0; turn.dir = 1; turn.sweeps += 0.5; }
          cursor.style.left = (turn.pos * 100) + '%';
          if (turn.sweeps >= C.sweeps) endTurn(turn.kind === 'block' ? 'hurt' : 'miss');
        }
        requestAnimationFrame(tick);
      }
      requestAnimationFrame((n) => { last = n; tick(n); });

      function finish(win) {
        ended = true; window.removeEventListener('keydown', keyHandler, true);
        setTimeout(() => { L.className = ''; L.innerHTML = ''; L.removeAttribute('data-form'); resolve(win); }, win ? 1600 : 1200);
      }

      async function loop() {
        G.audio.bgm('bgm_boss');
        renderHp(); renderHearts();
        while (stageIdx < C.stages.length) {
          const st = C.stages[stageIdx]; stageHits = 0;
          await showPhase(st);
          await lines(st.intro);
          if (st.combo && !hasItem) await lines(st.noItem);
          while (stageHits < (st.hits || 1)) {
            // 我方回合
            const a = await playTurn('attack');
            if (a === 'hit') {
              stageHits++; doneHits++; renderHp();
              G.audio.sfx('sfx_slash'); G.stage.flash('#ffffff'); flashClass(bossImg, 'hurt'); flashClass(q('.bx-hero'), 'lunge', 400);
              popText(T.hit, 'good');
              if (stageHits >= (st.hits || 1)) break;
            } else if (a === 'trap') {
              hp--; renderHearts(); G.audio.sfx('sfx_thunder'); G.stage.shake(); flashClass(L, 'struck', 500); popText(T.trap, 'bad');
            } else popText(T.miss);
            if (hp <= 0) break;
            await G.sleep(350);
            // 敌方回合
            const b = await playTurn('block');
            if (b === 'block') { G.audio.sfx('sfx_block'); G.stage.flash('#fff3c8'); popText(T.block, 'good'); }
            else { hp--; renderHearts(); G.audio.sfx('sfx_thunder'); G.stage.shake(); flashClass(L, 'struck', 500); flashClass(q('.bx-hero'), 'hit', 400); popText(T.hurt, 'bad'); }
            if (hp <= 0) break;
            await G.sleep(350);
          }
          turn = null;
          if (hp <= 0) { panel.classList.add('hide'); L.classList.add('lost'); return finish(false); }
          stageIdx++; renderHp();
        }
        panel.classList.add('hide'); L.classList.add('won');
        G.audio.sfx('sfx_reveal'); G.stage.flash('#ffffff');
        finish(true);
      }
      setTimeout(loop, 300);
    });
  }

  function install() {
    if (!G.minigames || !G.ui) return setTimeout(install, 30);
    G.minigames.games.boss = boss;

    // 结局画面：标了 keepSave 的结局（失败结局）保留战前存档，并显示「读档」按钮
    const orig = G.ui.showEnding.bind(G.ui);
    G.ui.showEnding = async function (id) {
      const e = (window.GAME_ENDINGS || {})[id] || {};
      const keep = e.keepSave ? localStorage.getItem('spiritgame.save.' + CHECKPOINT) : null;
      const r = await orig(id);
      if (keep) localStorage.setItem('spiritgame.save.' + CHECKPOINT, keep);
      let b = $('#btn-loadsave');
      if (!b) {
        b = document.createElement('button'); b.id = 'btn-loadsave'; b.textContent = '读档';
        b.onclick = () => G.ui.continueGame(CHECKPOINT);
        const row = document.querySelector('#ending .title-btns'); if (row) row.prepend(b);
      }
      b.style.display = keep ? '' : 'none';
      return r;
    };
  }
  install();
})();
