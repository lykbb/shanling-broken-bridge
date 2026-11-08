/* 剧情/素材完整性检查：node tools/validate.js
 * 检查：跳转目标、场景引用、角色与表情、物品、音频 id、结局是否都存在。改完剧本后跑一下即可。 */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = { window: {} };
vm.createContext(ctx);
['assets', 'characters', 'scenes', 'story', 'boss'].forEach((f) => vm.runInContext(fs.readFileSync(path.join(root, 'data', f + '.js'), 'utf8'), ctx));
const W = ctx.window;
const errs = [], warns = [];
const img = W.GAME_ASSETS.images, aud = W.GAME_ASSETS.audio;
const S = W.GAME_STORY, SC = W.GAME_SCENES, CH = W.GAME_CHARACTERS, IT = W.GAME_ITEMS, EN = W.GAME_ENDINGS;
const node = (id, where) => { if (id && !S[id]) errs.push(`${where}: 剧情节点不存在 "${id}"`); };
const used = new Set();

Object.entries(CH).forEach(([id, c]) => [...Object.values(c.sprites), ...Object.values(c.portraits || {})].forEach((a) => { if (!img[a]) errs.push(`角色 ${id}: 素材不存在 ${a}`); }));
const hasExpr = (cid, e) => CH[cid] && ((CH[cid].portraits && CH[cid].portraits[e]) || CH[cid].sprites[e]);
Object.entries(IT).forEach(([id, it]) => { if (!img[it.icon]) errs.push(`物品 ${id}: 图标不存在 ${it.icon}`); });
Object.entries(EN).forEach(([id, e]) => { if (e.bgm && !aud[e.bgm]) errs.push(`结局 ${id}: 音乐不存在 ${e.bgm}`); if (e.bg && !img[e.bg]) errs.push(`结局 ${id}: 背景不存在 ${e.bg}`); });

Object.entries(SC).forEach(([id, s]) => {
  if (!img[s.bg]) errs.push(`场景 ${id}: 背景不存在 ${s.bg}`);
  if (s.bgm && !aud[s.bgm]) errs.push(`场景 ${id}: 音乐不存在 ${s.bgm}`);
  if (s.onEnter) { node(s.onEnter.first, `场景 ${id}.onEnter`); node(s.onEnter.every, `场景 ${id}.onEnter`); [s.onEnter.first, s.onEnter.every].forEach((n) => n && used.add(n)); }
  (s.characters || []).forEach((c) => { if (!CH[c.id]) errs.push(`场景 ${id}: 角色不存在 ${c.id}`); });
  (s.hotspots || []).forEach((h) => {
    if (h.script) { node(h.script, `场景 ${id}.${h.id}`); used.add(h.script); }
    if (h.locked) { node(h.locked, `场景 ${id}.${h.id}`); used.add(h.locked); }
    if (h.type === 'exit' && !SC[h.to]) errs.push(`场景 ${id}.${h.id}: 出口目标场景不存在 ${h.to}`);
    const [x, y, w, hh] = h.rect; if (x < 0 || y < 0 || x + w > 1920 || y + hh > 1080) warns.push(`场景 ${id}.${h.id}: 热点超出 1920x1080`);
  });
});

Object.entries(S).forEach(([id, cmds]) => cmds.forEach((c, i) => {
  const at = `${id}[${i}]`;
  const tgt = (t) => { node(t, at); if (t) used.add(t); };
  if (c.say !== undefined && !CH[c.say]) errs.push(`${at}: 角色不存在 ${c.say}`);
  if (c.say && c.expr && !hasExpr(c.say, c.expr)) errs.push(`${at}: ${c.say} 没有表情 ${c.expr}`);
  if (c.show && !CH[c.show]) errs.push(`${at}: 角色不存在 ${c.show}`);
  if (c.show && c.expr && !hasExpr(c.show, c.expr)) errs.push(`${at}: ${c.show} 没有表情 ${c.expr}`);
  if (c.face && !hasExpr(c.face, c.expr)) errs.push(`${at}: 表情不存在 ${c.face}.${c.expr}`);
  if (c.cg && !img[c.cg]) errs.push(`${at}: CG 素材不存在 ${c.cg}`);
  if (c.charClass && !CH[c.charClass]) errs.push(`${at}: 角色不存在 ${c.charClass}`);
  if (c.hide && !CH[c.hide]) errs.push(`${at}: 角色不存在 ${c.hide}`);
  if (c.minigame) { if (!['battle', 'seal', 'runes', 'boss'].includes(c.minigame)) errs.push(`${at}: 小游戏不存在 ${c.minigame}`); tgt(c.win); tgt(c.lose); tgt(c.midNode); if (c.target && !CH[c.target]) errs.push(`${at}: 目标角色不存在 ${c.target}`); }
  if (c.goto) tgt(c.goto);
  if (c.branch !== undefined) { tgt(c.then); tgt(c.else); }
  if (c.choice) c.choice.forEach((o) => { tgt(o.goto); (o.do || []).forEach(chkEff); });
  if (c.do) c.do.forEach(chkEff);
  if (c.scene && !SC[c.scene]) errs.push(`${at}: 场景不存在 ${c.scene}`);
  if (c.bgm && !aud[c.bgm]) errs.push(`${at}: 音乐不存在 ${c.bgm}`);
  if (c.sfx && !aud[c.sfx]) errs.push(`${at}: 音效不存在 ${c.sfx}`);
  if (c.ending && !EN[c.ending]) errs.push(`${at}: 结局不存在 ${c.ending}`);
  function chkEff(e) { const it = e.give || e.take; if (it && !IT[it]) errs.push(`${at}: 物品不存在 ${it}`); if (e.unlock && !SC[e.unlock]) errs.push(`${at}: 场景不存在 ${e.unlock}`); }
}));
const BO = W.GAME_BOSS;
if (BO) {
  if (!img[BO.bg]) errs.push(`boss: 背景不存在 ${BO.bg}`);
  if (!img[BO.img]) errs.push(`boss: 图片不存在 ${BO.img}`);
  if (BO.needItem && !IT[BO.needItem]) errs.push(`boss: 前提物品不存在 ${BO.needItem}`);
  BO.stages.forEach((st, i) => [...(st.intro || []), ...(st.noItem || [])].forEach((l) => {
    if (l.say && !CH[l.say]) errs.push(`boss.stages[${i}]: 角色不存在 ${l.say}`);
    if (l.say && l.expr && !hasExpr(l.say, l.expr)) errs.push(`boss.stages[${i}]: ${l.say} 没有表情 ${l.expr}`);
  }));
  [1, 2, 3].forEach((f) => { if (!img['boss_phase' + f]) errs.push(`boss: 缺少 boss_phase${f}`); });
}
Object.keys(S).forEach((id) => { if (!used.has(id)) warns.push(`剧情节点从未被引用: ${id}`); });

console.log(`场景 ${Object.keys(SC).length} · 剧情节点 ${Object.keys(S).length} · 图片 ${Object.keys(img).length} · 音频 ${Object.keys(aud).length}`);
warns.forEach((w) => console.log('⚠ ' + w));
errs.forEach((e) => console.log('✖ ' + e));
console.log(errs.length ? `\n${errs.length} 个错误` : '\n✔ 检查通过');
process.exit(errs.length ? 1 : 0);
