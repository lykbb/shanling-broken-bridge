const { JSDOM } = require('jsdom');
const path = require('path').join(__dirname, '..', 'index.html');
const errors = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const dom = await JSDOM.fromFile(path, { runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true,
    beforeParse(w) { const fs=require('fs'); const base=require('path').join(__dirname, '..') + '/';
      w.Image = class { set src(v) { this._s=v; setTimeout(()=>{ const f=base+decodeURIComponent(String(v)); if(!/^data:/.test(v) && fs.existsSync(f)) this.onload&&this.onload(); else this.onerror&&this.onerror(); },1); } get src(){return this._s;} };
      w.Audio = class { addEventListener(e,fn){ if(e==='error') setTimeout(fn,1);} set src(v){} };
      const _ls={}; Object.defineProperty(w,'localStorage',{value:{getItem:k=>k in _ls?_ls[k]:null,setItem:(k,v)=>{_ls[k]=String(v)},removeItem:k=>{delete _ls[k]}}}); w.AudioContext = undefined; w.webkitAudioContext = undefined; w.HTMLMediaElement.prototype.play = () => Promise.resolve(); w.HTMLMediaElement.prototype.pause = () => {}; w.alert = () => {}; w.confirm = () => true;
      w.addEventListener('error', (e) => errors.push('winerr ' + e.message)); const ce = w.console.error; w.console.error = (...a) => { errors.push(a.join(' ')); }; } });
  const w = dom.window, d = w.document;
  for (let i = 0; i < 100 && !d.querySelector('#loading.hide'); i++) await sleep(100);
  const G = w.Game; let fails = 0;
  const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
  const mode = process.argv[2] || 'win';   // win | nopress | noitem
  // 自动玩家：光标在金区内就按
  let autoplay = mode !== 'nopress', presses = 0;
  const pct = (s) => parseFloat(s) / 100;
  const bot = setInterval(() => {
    const L = d.querySelector('.mg-boss'); if (!L) return;
    const panel = L.querySelector('.bx-panel'); if (panel.classList.contains('hide')) { if (G.dialogue.box.classList.contains('show') || true) G.dialogue.advance(); return; }
    if (!autoplay) return;
    const cur = pct(L.querySelector('.bx-cursor').style.left || '0');
    const g = L.querySelector('.bx-zones .gold'); if (!g) return;
    const a = pct(g.style.left), b = a + pct(g.style.width);
    if (cur > a + 0.01 && cur < b - 0.01) { presses++; L.querySelector('.bx-btn').dispatchEvent(new w.Event('pointerdown', { bubbles: true })); }
  }, 8);
  const drain = async (n = 3000) => { for (let i = 0; i < n; i++) { await sleep(20); const ch = d.querySelector('#choices button'); if (d.querySelector('#choices').classList.contains('show') && ch) { ch.click(); continue; } if (d.querySelector('#minigame.show')) continue; if (G.runner.busy) G.dialogue.advance(); else if (i > 5) break; } };

  d.querySelector('#btn-new').click(); await sleep(800); await drain(200);
  // 古林：先问清楚，再和恶灵说话 → 黑莲花瓣
  G.state.set('chose_ask'); G.state.set('met_evil');
  G.runner.run('forest_evil'); await drain(300);
  ok(G.state.has('petal') && G.state.flag('got_petal'), 'forest_evil gives petal after chose_ask');
  G.runner.run('forest_evil'); await drain(200);
  ok(G.state.data.items.filter((x) => x === 'petal').length === 1, 'petal only once');
  if (mode === 'noitem') G.state.take('petal');
  // 跳到祭坛真相后
  ['met_john','crossed','fog_open','altar_ready','seal_done','good_gone','spirit_appeared','truth_known'].forEach((f) => G.state.set(f));
  G.state.give('amulet_full'); G.state.unlock('altar');
  await G.stage.goto('altar', { silent: true }); await drain(100);
  const t0 = Date.now();
  G.runner.run('final_choice'); await drain(6000);
  console.log('fight secs', ((Date.now() - t0) / 1000).toFixed(1), 'presses', presses);
  const endTitle = d.querySelector('#ending-title').textContent;
  console.log('ending:', endTitle, '| loadsave btn:', d.querySelector('#btn-loadsave') && d.querySelector('#btn-loadsave').style.display);
  if (mode === 'win') {
    ok(endTitle === '真结局 · 山醒', 'win → 真结局');
    ok(G.state.has('twin') && !G.state.has('petal'), 'twin merged');
    ok(d.querySelector('#btn-loadsave').style.display === 'none', 'no 读档 on true ending');
  } else {
    ok(endTitle === '结局 · 灵息尽散', mode + ' → 失败结局');
    ok(d.querySelector('#btn-loadsave').style.display !== 'none', '读档 button shown');
    ok(!!G.state.peek('auto'), 'checkpoint kept');
    d.querySelector('#btn-loadsave').click(); await sleep(800); await drain(100);
    console.log('dbg', d.querySelector('#ending').className, G.state.data.scene, G.state.flag('boss_seen'));
    ok(!d.querySelector('#ending').classList.contains('show') && G.state.data.scene === 'altar' && G.state.flag('boss_seen'), 'load → back at altar');
    ok(!!d.querySelector('.hotspot') && [...d.querySelectorAll('.hotspot')].some((h) => /山灵/.test(h.textContent)), 'spirit hotspot available to retry');
    ok(Object.keys(w.GAME_ENDINGS).length === 2, '2 endings total');
  }
  clearInterval(bot);
  const errs = errors.filter((e) => !/未找到|placeholder|音频/.test(e));
  ok(!errs.length, 'no console errors ' + JSON.stringify(errs).slice(0, 300));
  console.log(fails ? fails + ' FAIL' : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
