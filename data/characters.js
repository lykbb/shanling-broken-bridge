/* =========================================================
 * 角色表
 * sprites   立绘（目前每人一张全身图，normal）
 * portraits 对话框头像，按表情区分；剧本里 { say:'john', expr:'laugh' } 即切换头像
 * height    立绘在 1920x1080 舞台上的显示高度
 * ========================================================= */
window.GAME_CHARACTERS = {
  hero: {
    name: '阿萨尔', color: '#ffb48a', height: 820, defaultExpr: 'normal',
    sprites: { normal: 'hero_full' },
    portraits: { normal: 'hero_p_normal', smile: 'hero_p_smile', grin: 'hero_p_grin', bored: 'hero_p_bored', surprised: 'hero_p_surprised', sleep: 'hero_p_sleep' }
  },
  john: {
    name: '老约翰', color: '#e8c48a', height: 860, defaultExpr: 'smile',
    sprites: { normal: 'john_full' },
    portraits: { smile: 'john_p_smile', laugh: 'john_p_laugh', calm: 'john_p_calm', recall: 'john_p_recall', think: 'john_p_think' }
  },
  good: {
    name: '善灵', color: '#fff0c4', height: 840, float: true, defaultExpr: 'calm',
    sprites: { normal: 'good_full' },
    portraits: { smile: 'good_p_smile', calm: 'good_p_calm', surprised: 'good_p_surprised', firm: 'good_p_firm' }
  },
  evil: {
    name: '恶灵', color: '#ff8aa8', height: 860, float: true, defaultExpr: 'scorn',
    sprites: { normal: 'evil_full' },
    portraits: { scorn: 'evil_p_scorn', calm: 'evil_p_calm', angry: 'evil_p_angry', mock: 'evil_p_mock', sorrow: 'evil_p_sorrow' }
  },
  spirit: {
    name: '山灵本体', color: '#ffe9a8', height: 1000, defaultExpr: 'calm',
    sprites: { normal: 'spirit_full' },
    portraits: { calm: 'spirit_p_calm', sorrow: 'spirit_p_sorrow', gaze: 'spirit_p_gaze', relief: 'spirit_p_relief', angry: 'spirit_p_angry' }
  }
};

/* 物品表 */
window.GAME_ITEMS = {
  stone:  { name: '镇纹石',       icon: 'item_stone',  desc: '刻着古老石纹的小石片：水、山、莲。' },
  amulet: { name: '木纹护符',     icon: 'item_amulet', desc: '善灵放进你手心的护符，上面有半朵莲花的纹样。“雾里的东西有时会说谎。”' },
  tablet: { name: '莲纹青石片',   icon: 'item_tablet', desc: '古碑后取出的青石片，刻着完整的莲纹。似乎原本属于祭坛。' },
  amulet_full: { name: '完整的白莲护符', icon: 'item_amulet', desc: '善灵消散后，护符上的半朵莲纹终于完整了。' },
  petal:  { name: '黑莲花瓣',     icon: 'item_petal',  desc: '恶灵从暗莲上摘下的一片花瓣，摸上去是温的。“到了祭坛，你会知道它有什么用。”' },
  twin:   { name: '双莲护符',     icon: 'item_twin',   desc: '白莲护符与黑莲花瓣合成的护符。终结一击需要它。' }
};
