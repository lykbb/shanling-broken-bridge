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
  console.log('loaded', !!d.querySelector('#loading.hide'), d.querySelector('#loading-text').textContent, JSON.stringify(errors).slice(0,500)); const G = w.Game; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) errors.push('FAIL ' + m); };
  const drain = async (n = 400) => { for (let i = 0; i < n; i++) { await sleep(15); const ch = d.querySelector('#choices.show button, #choices button'); if (d.querySelector('#choices').classList.contains('show') && ch) { ch.click(); continue; } if (G.runner.busy) G.dialogue.advance(); else if (i > 5) break; } };
  d.querySelector('#btn-new').click(); await sleep(1500); await drain();
  ok(G.state.data.scene === 'village', 'start in village');
  d.querySelector('#btn-map').click(); await sleep(50);
  const wm = d.querySelector('#worldmap');
  ok(wm && wm.classList.contains('show'), 'map opens from 地图 button');
  ok(d.querySelectorAll('.wm-area').length === 4 && d.querySelectorAll('.wm-pin').length === 4, '4 areas + 4 pins');
  ok([...d.querySelectorAll('.wm-area,.wm-pin')].every((e) => /left:\s*[\d.]+%/.test(e.getAttribute('style'))), 'percent coords');
  const st = () => G.worldmap.lastStatuses = Object.fromEntries(w.WORLD_MAP.locations.map((l) => [l.id, G.worldmap.status(l)]));
  console.log('status0', JSON.stringify(st()));
  ok(st().village === 'exploring' && st().bridge === 'locked' && st().forest === 'locked' && st().altar === 'locked', 'default only village open');
  const pin = (id) => d.querySelector(`.wm-pin[data-id="${id}"]`);
  pin('bridge').click(); await sleep(300);
  ok(d.querySelector('.wm-head h3').textContent === '峡谷断桥', 'panel switches to bridge');
  ok(d.querySelector('.wm-enter').disabled, 'locked bridge cannot enter');
  ok(pin('bridge').classList.contains('sel') && !pin('village').classList.contains('sel'), 'selected state');
  d.querySelector(`.wm-area[data-id="forest"]`).click(); await sleep(300);
  ok(d.querySelector('.wm-head h3').textContent === '古林雾道', 'area click switches to forest');
  pin('village').click(); await sleep(300);
  ok(d.querySelector('.wm-head h3').textContent === '云溪村' && d.querySelectorAll('.wm-thumb').length === 4 && d.querySelectorAll('.wm-person').length === 2, 'village panel: 4 thumbs 2 people');
  const bigSrc = () => (d.querySelector('.wm-big img') || {}).src || '';
  const s0 = bigSrc(); d.querySelectorAll('.wm-thumb')[2].click(); await sleep(250);
  ok(bigSrc() !== s0 && bigSrc().includes('village_street'), 'thumb switches preview: ' + bigSrc().split('/').pop());
  d.querySelector('.wm-arrow.r').click(); await sleep(250);
  ok(bigSrc().includes('village_river'), 'arrow next');
  d.querySelectorAll('.wm-person')[1].click(); await sleep(50);
  ok(d.querySelector('.wm-card').classList.contains('show') && d.querySelector('.wm-card h4').textContent === '老约翰', 'person card');
  ok(/john_p_smile|portraits\/smile/.test(d.querySelector('.wm-card-face').getAttribute('style') || ''), 'card portrait ' + (d.querySelector('.wm-card-face').getAttribute('style')||'').slice(0,80));
  d.querySelector('.wm-card-x').click();
  ok(!d.querySelector('.wm-card').classList.contains('show'), 'card closes');
  ok(d.querySelector('.wm-chapters .wm-ch').length !== 0 && d.querySelectorAll('.wm-ch').length === 5, '5 chapters');
  // 关闭：Esc
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape' })); await sleep(50);
  ok(!wm.classList.contains('show'), 'Esc closes map');
  // 真实剧情：和约翰对话
  const john = [...d.querySelectorAll('.hotspot')].find((h) => /约翰/.test(h.textContent));
  console.log('pre', G.runner.busy, G.ui._modal, G.ui.modalOpen(), !!john); john.click(); await sleep(100); console.log('post', G.runner.busy, d.querySelector('#dlg-text').textContent.slice(0,30)); await drain();
  ok(G.state.flag('met_john'), 'met_john via story');
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'm' })); await sleep(50);
  ok(wm.classList.contains('show'), 'M key opens map');
  ok(d.querySelector('.wm-head h3').textContent === '云溪村', 'restores last selection (village)');
  console.log('status1', JSON.stringify(st()));
  ok(st().village === 'done' && st().bridge === 'unlocked', 'progress sync: village done, bridge unlocked');
  ok(/收集 <b>\d+ \/ \d+<\/b>/.test(d.querySelector('.wm-counters').innerHTML) && /剧情进度 <b>1 \/ 4/.test(d.querySelector('.wm-counters').innerHTML), 'counters');
  pin('bridge').click(); await sleep(300);
  ok(!d.querySelector('.wm-enter').disabled, 'bridge enter enabled');
  const origGoto = G.stage.goto; let called = null; G.stage.goto = function (id, o) { called = id; return origGoto.call(this, id, o); };
  d.querySelector('.wm-enter').click(); await sleep(1600);
  ok(called === 'bridge' && G.state.data.scene === 'bridge' && !wm.classList.contains('show'), 'enter uses Game.stage.goto');
  G.stage.goto = origGoto;
  await drain();
  d.querySelector('#btn-map').click(); await sleep(50);
  ok(d.querySelector('.wm-head h3').textContent === '峡谷断桥', 'return to map restores bridge selection');
  ok(pin('bridge').classList.contains('here') && pin('bridge').classList.contains('st-exploring'), 'bridge exploring + here');
  ok(d.querySelector('.wm-enter').textContent === '回到场景', 'current scene button text');
  // 存档里带着选中
  G.state.save('3'); ok(G.state.peek('3').data.mapSel === 'bridge', 'mapSel saved in existing save');
  // 菜单：收集物 → 背包
  d.querySelectorAll('.wm-menu-item')[3].click(); await sleep(50);
  ok(!wm.classList.contains('show') && d.querySelector('#modal').classList.contains('show') && d.querySelector('#modal-title').textContent === '背包', 'menu 收集物 opens existing bag');
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape' }));
  // 进度推进后同步
  ['crossed', 'fog_open', 'seal_done'].forEach((f) => G.state.set(f));
  d.querySelector('#btn-map').click(); await sleep(50);
  console.log('status2', JSON.stringify(st()));
  ok(st().bridge === 'done' && st().forest === 'done' && st().altar === 'done', 'later flags sync');
  ok([...d.querySelectorAll('.wm-ch')].map((c) => c.className.match(/st-(\w+)/)[1]).join() === 'done,done,done,done,exploring', 'chapter states');
  // 其他系统没坏：存档弹窗、记录
  d.querySelector('.wm-close').click(); await sleep(30);
  d.querySelector('#btn-save').click(); ok(d.querySelector('#modal-title').textContent.includes('存档'), 'save modal ok');
  d.querySelector('#btn-log').click(); ok(d.querySelector('#modal-title').textContent.includes('记录'), 'log modal ok');
  // 剧情中不能开地图
  G.ui.close();
  console.log('ERRORS', JSON.stringify(errors.filter((e) => !/Could not load|Not implemented|loading/i.test(e))));
  process.exit(0);
})();
