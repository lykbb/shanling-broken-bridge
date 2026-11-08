/* 小游戏模块：剧本中用 { minigame: 'battle' | 'seal', ...参数, win: '节点', lose: '节点' } 调用。
 * 每个小游戏返回 Promise<boolean>（true = 成功）。与剧情、素材无耦合，参数都来自 story.js。 */
(function () {
  const G = window.Game;
  const $ = (s) => document.querySelector(s);

  function layer() {
    const el = $('#minigame');
    el.innerHTML = ''; el.className = 'show';
    return el;
  }
  function closeLayer() { const el = $('#minigame'); el.className = ''; el.innerHTML = ''; }
  function stagePoint(e) {
    const r = $('#stage').getBoundingClientRect(), s = G.stage.scale;
    return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s };
  }
  // 角色立绘在舞台坐标里的大致矩形
  function charRect(id) {
    const c = G.stage.chars[id];
    if (!c) return { x: 760, y: 200, w: 400, h: 760 };
    const r = c.img.getBoundingClientRect(), sr = $('#stage').getBoundingClientRect(), s = G.stage.scale;
    const w = r.width / s || 400, h = r.height / s || 760;
    return { x: (r.left - sr.left) / s || c.x - w / 2, y: (r.top - sr.top) / s || 1080 - h, w, h };
  }

  const games = {
    /* ---------- 战斗：护符指引方向，点击浮现的弱点 ---------- */
    battle(p) {
      return new Promise((resolve) => {
        const L = layer(); L.classList.add('mg-battle');
        const need = p.hits || 5, win = p.window || 1800;
        let hits = 0, misses = 0, alive = true;
        L.innerHTML = `<div class="mg-top"><b>${p.title || '击破黑丝'}</b><span class="pips">${'<i></i>'.repeat(need)}</span><em>${p.tip || '护符发烫时，点击它指向的弱点'}</em></div><div class="mg-amulet"><div class="mg-arrow"></div></div>`;
        const pips = L.querySelectorAll('.pips i'), arrow = L.querySelector('.mg-arrow'), amulet = L.querySelector('.mg-amulet');

        const round = async () => {
          if (!alive) return;
          if (hits >= need) { alive = false; await G.sleep(500); closeLayer(); return resolve(true); }
          const r = charRect(p.target);
          const pt = { x: r.x + r.w * (0.25 + Math.random() * 0.5), y: r.y + r.h * (0.15 + Math.random() * 0.55) };
          // 护符指向
          const ang = Math.atan2(pt.y - 540, pt.x - 960) * 180 / Math.PI;
          arrow.style.transform = `rotate(${ang}deg)`; amulet.classList.add('hot');
          G.audio.sfx(p.hintSfx || 'sfx_click');
          await G.sleep(p.hintTime || 550);
          amulet.classList.remove('hot');
          const spot = document.createElement('button'); spot.className = 'mg-spot';
          spot.style.left = pt.x + 'px'; spot.style.top = pt.y + 'px';
          spot.style.setProperty('--t', win + 'ms');
          L.appendChild(spot);
          let done = false;
          spot.addEventListener('pointerdown', (e) => {
            e.stopPropagation(); if (done) return; done = true;
            hits++; pips[hits - 1].classList.add('on');
            G.audio.sfx(p.hitSfx || 'sfx_hit'); G.stage.flash('#ffffff');
            G.stage.charClass(p.target, 'hurt'); setTimeout(() => G.stage.charClass(p.target, null, 'hurt'), 300);
            spot.classList.add('hit'); setTimeout(() => spot.remove(), 300);
            setTimeout(round, 450);
          });
          setTimeout(() => {
            if (done) return; done = true; misses++;
            spot.remove(); G.audio.sfx(p.missSfx || 'sfx_thunder'); G.stage.shake();
            L.classList.add('struck'); setTimeout(() => L.classList.remove('struck'), 500);
            G.ui.toast(p.missText || '黑丝擦过你的手臂！');
            setTimeout(round, 900);
          }, win);
        };
        setTimeout(round, 600);
      });
    },


    /* ---------- 镇灵符位：限时内按顺序按住点亮符位；黑根会缠住符位，先点击驱散 ---------- */
    runes(p) {
      return new Promise((resolve) => {
        const L = layer(); L.classList.add('mg-runes');
        const dur = (p.duration || 60) * 1000, holdMs = p.hold || 1000;
        const runes = p.runes || [];
        L.innerHTML = `<div class="mg-top"><b>${p.title || '镇灵印'}</b><div class="mg-timer"><i></i></div><em>${p.tip || '按顺序按住发亮的符位'}</em></div><div class="mg-crack"></div><div class="mg-caption"></div>`;
        const bar = L.querySelector('.mg-timer i'), crack = L.querySelector('.mg-crack'), cap = L.querySelector('.mg-caption');
        let idx = 0, left = dur, ended = false, holding = null, holdT = 0, rootT = p.rootFirst || 3500;
        const els = runes.map((r, i) => {
          const el = document.createElement('button'); el.className = 'mg-rune';
          el.style.left = r.x + 'px'; el.style.top = r.y + 'px';
          el.innerHTML = `<span>${r.label || i + 1}</span><i class="root"></i>`;
          el.addEventListener('pointerdown', (e) => {
            e.stopPropagation(); if (ended) return;
            if (el.classList.contains('rooted')) { el.classList.remove('rooted'); G.audio.sfx(p.cutSfx || 'sfx_hit'); return; }
            if (i < idx) return;
            if (i !== idx) { G.stage.shake(); G.audio.sfx('sfx_locked'); G.ui.toast(p.orderText || '顺序不对——先点亮正在发光的符位'); return; }
            holding = i; holdT = 0; el.classList.add('hold');
          });
          L.appendChild(el); return el;
        });
        const up = () => { if (holding != null) els[holding].classList.remove('hold'); holding = null; };
        window.addEventListener('pointerup', up);
        const mark = () => els.forEach((el, i) => { el.classList.toggle('next', i === idx); el.classList.toggle('lit', i < idx); });
        mark();
        function finish(ok) { ended = true; window.removeEventListener('pointerup', up); setTimeout(() => { closeLayer(); resolve(ok); }, ok ? 1400 : 700); }
        let last = performance.now();
        function tick(now) {
          if (ended) return;
          const dt = Math.min(0.05, (now - last) / 1000); last = now;
          left -= dt * 1000;
          bar.style.width = Math.max(0, left / dur * 100) + '%';
          bar.parentNode.dataset.sec = Math.max(0, Math.ceil(left / 1000)) + 's';
          L.classList.toggle('urgent', left < 15000);
          rootT -= dt * 1000;
          if (rootT <= 0 && idx < els.length) {
            const target = els[idx];
            if (!target.classList.contains('rooted')) { target.classList.add('rooted'); up(); G.audio.sfx(p.rootSfx || 'sfx_thunder'); }
            rootT = (p.rootEvery || 5000) * (0.7 + Math.random() * 0.6);
          }
          if (holding != null) {
            if (els[holding].classList.contains('rooted')) up();
            else {
              holdT += dt * 1000;
              els[holding].style.setProperty('--p', Math.min(100, holdT / holdMs * 100).toFixed(0));
              if (holdT >= holdMs) {
                const r = runes[idx]; els[idx].classList.remove('hold');
                G.audio.sfx(r.sfx || 'sfx_reveal'); G.stage.flash(r.color || '#fff3c8');
                cap.textContent = r.caption || ''; cap.classList.remove('show'); void cap.offsetWidth; cap.classList.add('show');
                idx++; holding = null; mark();
                crack.style.opacity = (1 - idx / els.length) * 0.9;
                if (idx >= els.length) return finish(true);
              }
            }
          }
          if (left <= 0) { G.ui.toast(p.failText || '封印未稳'); return finish(false); }
          requestAnimationFrame(tick);
        }
        requestAnimationFrame((n) => { last = n; tick(n); });
      });
    },

    /* ---------- 限时镇灵：按住镇灵印蓄力，点掉缠来的触手 ---------- */
    seal(p) {
      return new Promise((resolve) => {
        const L = layer(); L.classList.add('mg-seal');
        const dur = (p.duration || 90) * 1000, rate = p.chargeRate || 2.4, dmg = p.damage || 10;
        const cx = p.x || 960, cy = p.y || 560, R = p.radius || 150;
        L.innerHTML = `<div class="mg-top"><b>${p.title || '镇压地怨'}</b><div class="mg-timer"><i></i></div><em>${p.tip || '按住镇灵印注入神魂 · 点击触手将其斩断'}</em></div>
          <div class="mg-seal-ring" style="left:${cx}px;top:${cy}px;width:${R * 2}px;height:${R * 2}px"><div class="mg-seal-core"></div><span>0%</span></div>`;
        const ring = L.querySelector('.mg-seal-ring'), label = ring.querySelector('span'), bar = L.querySelector('.mg-timer i');
        let charge = 0, left = dur, holding = false, paused = false, ended = false, midDone = false;
        let spawnT = 1500, last = performance.now();
        const tentacles = [];

        ring.addEventListener('pointerdown', (e) => { e.stopPropagation(); holding = true; ring.classList.add('hold'); });
        const up = () => { holding = false; ring.classList.remove('hold'); };
        window.addEventListener('pointerup', up);

        function spawn() {
          const side = Math.random() * Math.PI * 2;
          const sx = cx + Math.cos(side) * 1100, sy = cy + Math.sin(side) * 700;
          const el = document.createElement('button'); el.className = 'mg-tentacle';
          L.appendChild(el);
          const t = { el, x: Math.max(-40, Math.min(1960, sx)), y: Math.max(140, Math.min(1100, sy)), speed: (p.tentacleSpeed || 150) * (1 + (1 - left / dur) * 0.8) };
          el.addEventListener('pointerdown', (e) => {
            e.stopPropagation(); if (t.dead) return; t.dead = true;
            G.audio.sfx(p.cutSfx || 'sfx_hit'); el.classList.add('cut'); setTimeout(() => el.remove(), 300);
          });
          tentacles.push(t);
        }

        function finish(ok) {
          ended = true; window.removeEventListener('pointerup', up);
          setTimeout(() => { closeLayer(); resolve(ok); }, ok ? 900 : 600);
        }

        async function tick(now) {
          if (ended) return;
          const dt = Math.min(0.05, (now - last) / 1000); last = now;
          if (!paused) {
            left -= dt * 1000;
            if (holding) charge = Math.min(100, charge + rate * dt);
            spawnT -= dt * 1000;
            if (spawnT <= 0) { spawn(); spawnT = (p.spawnEvery || 2200) * (0.55 + 0.45 * left / dur); }
            tentacles.forEach((t) => {
              if (t.dead) return;
              const dx = cx - t.x, dy = cy - t.y, d = Math.hypot(dx, dy);
              if (d < R + 10) {
                t.dead = true; t.el.classList.add('cut'); setTimeout(() => t.el.remove(), 300);
                charge = Math.max(0, charge - dmg); G.stage.shake(); G.audio.sfx(p.hurtSfx || 'sfx_thunder');
                L.classList.add('struck'); setTimeout(() => L.classList.remove('struck'), 400);
                return;
              }
              t.x += dx / d * t.speed * dt; t.y += dy / d * t.speed * dt;
              t.el.style.left = t.x + 'px'; t.el.style.top = t.y + 'px';
              t.el.style.transform = `translate(-50%,-50%) rotate(${Math.atan2(dy, dx) * 180 / Math.PI}deg)`;
            });
            ring.style.setProperty('--p', charge.toFixed(1));
            label.textContent = Math.floor(charge) + '%';
            bar.style.width = (left / dur * 100) + '%';
            bar.parentNode.dataset.sec = Math.ceil(left / 1000) + 's';
            L.classList.toggle('urgent', left < 30000);
          }
          if (!midDone && p.midNode && charge >= (p.midAt || 70)) {
            midDone = true; paused = true; up();
            await G.runner._exec(p.midNode); G.dialogue.hide();
            last = performance.now(); paused = false;
          }
          if (charge >= 100) { ring.classList.add('full'); G.audio.sfx('sfx_reveal'); return finish(true); }
          if (left <= 0) { G.ui.toast(p.failText || '镇灵印的光熄灭了……'); return finish(false); }
          requestAnimationFrame(tick);
        }
        requestAnimationFrame((n) => { last = n; tick(n); });
      });
    }
  };

  G.minigames = {
    games,
    play(name, params) {
      const g = games[name];
      if (!g) { console.error('[minigame] 不存在', name); return Promise.resolve(true); }
      return g(params);
    }
  };
})();
