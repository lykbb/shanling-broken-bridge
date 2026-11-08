/* =========================================================
 * 素材清单（唯一需要登记素材路径的地方）
 * ---------------------------------------------------------
 * 替换素材：
 *   A. 零改动：把文件按 src 的路径和文件名放进 assets/
 *   B. 改路径：把 src 改成你的文件名（png / jpg / webp / mp3 / ogg 均可）
 * 文件不存在时自动使用 placeholder（占位图 / 占位合成音乐），游戏照常可玩。
 * 规格：背景 1920x1080；立绘透明 PNG 高 1000~1400px、脚底贴底边；头像 约 288x320。
 * 注：characters/ 下现有立绘和头像是从设定图里临时抠出来的（hero=阿萨尔 john=老约翰 good=善灵白莲 evil=恶灵黑莲 spirit=山灵本体），正式立绘到了直接覆盖同名文件。
 * ========================================================= */
window.GAME_ASSETS = {
  images: {
    /* ---------- 场景背景（目前都是占位，等正式场景图） ---------- */
    bg_opening: { src: 'assets/backgrounds/opening.jpg', placeholder: { kind: 'bg', motif: 'altar',  label: '', top: '#0e0b1c', mid: '#1c1633', bottom: '#050409' } },
    bg_village: { src: 'assets/backgrounds/village.jpg', placeholder: { kind: 'bg', motif: 'gate',   label: '云溪村', top: '#f3d29b', mid: '#b8915f', bottom: '#4b3a2a' } },
    bg_bridge:  { src: 'assets/backgrounds/bridge.jpg',  placeholder: { kind: 'bg', motif: 'bridge', label: '峡谷断桥', top: '#cfe6f5', mid: '#8fa9b4', bottom: '#2f3d44' } },
    bg_forest:  { src: 'assets/backgrounds/forest.jpg',  placeholder: { kind: 'bg', motif: 'forest', label: '古林雾道', top: '#3d5a4a', mid: '#23392e', bottom: '#0e1a14' } },
    bg_altar:   { src: 'assets/backgrounds/altar.jpg',   placeholder: { kind: 'bg', motif: 'summit', label: '山谷祭坛', top: '#3a3150', mid: '#4a3a62', bottom: '#120e1f' } },
    bg_title:   { src: 'assets/ui/title.jpg',            placeholder: { kind: 'bg', motif: 'altar',  label: '', top: '#1b2238', mid: '#33405e', bottom: '#0b0f1a' } },

    /* ---------- 角色立绘（全身，一人一张） ---------- */
    hero_full:      { src: 'assets/characters/hero/full.png',      placeholder: { kind: 'char', label: '阿萨尔', color: '#a0432a' } },
    john_full:      { src: 'assets/characters/john/full.png',      placeholder: { kind: 'char', label: '老约翰', color: '#9a7b4f' } },
    good_full:  { src: 'assets/characters/good/full.png',  placeholder: { kind: 'char', label: '善灵·白莲', color: '#e8dcc0', aura: '#fff3c8' } },
    evil_full: { src: 'assets/characters/evil/full.png', placeholder: { kind: 'char', label: '恶灵·黑莲', color: '#5a2a3e', aura: '#b03a6e' } },
    spirit_full:    { src: 'assets/characters/spirit/full.png',    placeholder: { kind: 'char', label: '山灵本体', color: '#b8c4a0', aura: '#ffe9b0' } },

    /* ---------- 对话头像（表情） ---------- */
    hero_p_normal:    { src: 'assets/characters/hero/portraits/normal.jpg',    placeholder: { kind: 'icon', label: '阿', color: '#a0432a' } },
    hero_p_smile:     { src: 'assets/characters/hero/portraits/smile.jpg',     placeholder: { kind: 'icon', label: '阿', color: '#a0432a' } },
    hero_p_grin:      { src: 'assets/characters/hero/portraits/grin.jpg',      placeholder: { kind: 'icon', label: '阿', color: '#a0432a' } },
    hero_p_bored:     { src: 'assets/characters/hero/portraits/bored.jpg',     placeholder: { kind: 'icon', label: '阿', color: '#a0432a' } },
    hero_p_surprised: { src: 'assets/characters/hero/portraits/surprised.jpg', placeholder: { kind: 'icon', label: '阿', color: '#a0432a' } },
    hero_p_sleep:     { src: 'assets/characters/hero/portraits/sleep.jpg',     placeholder: { kind: 'icon', label: '阿', color: '#a0432a' } },

    john_p_smile:  { src: 'assets/characters/john/portraits/smile.jpg',  placeholder: { kind: 'icon', label: '约', color: '#9a7b4f' } },
    john_p_laugh:  { src: 'assets/characters/john/portraits/laugh.jpg',  placeholder: { kind: 'icon', label: '约', color: '#9a7b4f' } },
    john_p_calm:   { src: 'assets/characters/john/portraits/calm.jpg',   placeholder: { kind: 'icon', label: '约', color: '#9a7b4f' } },
    john_p_recall: { src: 'assets/characters/john/portraits/recall.jpg', placeholder: { kind: 'icon', label: '约', color: '#9a7b4f' } },
    john_p_think:  { src: 'assets/characters/john/portraits/think.jpg',  placeholder: { kind: 'icon', label: '约', color: '#9a7b4f' } },

    good_p_smile:     { src: 'assets/characters/good/portraits/smile.jpg',     placeholder: { kind: 'icon', label: '善', color: '#e8dcc0' } },
    good_p_calm:      { src: 'assets/characters/good/portraits/calm.jpg',      placeholder: { kind: 'icon', label: '善', color: '#e8dcc0' } },
    good_p_surprised: { src: 'assets/characters/good/portraits/surprised.jpg', placeholder: { kind: 'icon', label: '善', color: '#e8dcc0' } },
    good_p_firm:      { src: 'assets/characters/good/portraits/firm.jpg',      placeholder: { kind: 'icon', label: '善', color: '#e8dcc0' } },

    evil_p_scorn:  { src: 'assets/characters/evil/portraits/scorn.jpg',  placeholder: { kind: 'icon', label: '恶', color: '#5a2a3e' } },
    evil_p_calm:   { src: 'assets/characters/evil/portraits/calm.jpg',   placeholder: { kind: 'icon', label: '恶', color: '#5a2a3e' } },
    evil_p_angry:  { src: 'assets/characters/evil/portraits/angry.jpg',  placeholder: { kind: 'icon', label: '恶', color: '#5a2a3e' } },
    evil_p_mock:   { src: 'assets/characters/evil/portraits/mock.jpg',   placeholder: { kind: 'icon', label: '恶', color: '#5a2a3e' } },
    evil_p_sorrow: { src: 'assets/characters/evil/portraits/sorrow.jpg', placeholder: { kind: 'icon', label: '恶', color: '#5a2a3e' } },

    spirit_p_calm:   { src: 'assets/characters/spirit/portraits/calm.jpg',   placeholder: { kind: 'icon', label: '灵', color: '#b8c4a0' } },
    spirit_p_sorrow: { src: 'assets/characters/spirit/portraits/sorrow.jpg', placeholder: { kind: 'icon', label: '灵', color: '#b8c4a0' } },
    spirit_p_gaze:   { src: 'assets/characters/spirit/portraits/gaze.jpg',   placeholder: { kind: 'icon', label: '灵', color: '#b8c4a0' } },
    spirit_p_relief: { src: 'assets/characters/spirit/portraits/relief.jpg', placeholder: { kind: 'icon', label: '灵', color: '#b8c4a0' } },
    spirit_p_angry:  { src: 'assets/characters/spirit/portraits/angry.jpg',  placeholder: { kind: 'icon', label: '灵', color: '#b8c4a0' } },

    /* ---------- 物品图标 ---------- */
    item_lantern: { src: 'assets/items/lantern.png', placeholder: { kind: 'icon', label: '灯', color: '#e8b04a' } },
    item_stone:   { src: 'assets/items/stone.png',   placeholder: { kind: 'icon', label: '纹', color: '#8fc6e8' } },
    item_amulet:  { src: 'assets/items/amulet.png',  placeholder: { kind: 'icon', label: '符', color: '#c49a5a' } },
    item_tablet:  { src: 'assets/items/tablet.png',  placeholder: { kind: 'icon', label: '板', color: '#7fa59a' } },
    item_petal:   { src: 'assets/items/petal.png',   placeholder: { kind: 'icon', label: '瓣', color: '#8a1838' } },
    item_twin:    { src: 'assets/ui/boss/lotus.png', placeholder: { kind: 'icon', label: '莲', color: '#e8c48a' } },

    /* ---------- 最终战 · 狍鸮（boss.js 使用）。狍鸮图为设定集临时裁图，正式透明立绘到了同名覆盖 ---------- */
    bg_altar_corrupt: { src: 'assets/backgrounds/altar_corrupt.jpg', placeholder: { kind: 'bg', motif: 'summit', label: '祭坛异变', top: '#2a0a18', mid: '#4a1028', bottom: '#0a0408' } },
    boss_paoxiao: { src: 'assets/boss/paoxiao.png', placeholder: { kind: 'char', label: '狍鸮', color: '#8a1030', aura: '#ff2040' } },
    boss_phase1:  { src: 'assets/boss/phase1.jpg', placeholder: { kind: 'bg', label: '苏醒·低语' } },
    boss_phase2:  { src: 'assets/boss/phase2.jpg', placeholder: { kind: 'bg', label: '侵蚀·狂乱' } },
    boss_phase3:  { src: 'assets/boss/phase3.jpg', placeholder: { kind: 'bg', label: '终鸣·堕化' } },
    ui_boss_bar:     { src: 'assets/ui/boss/bar.png',     placeholder: { kind: 'icon', label: '条', color: '#333' } },
    ui_boss_swirl:   { src: 'assets/ui/boss/swirl.png',   placeholder: { kind: 'icon', label: '剑', color: '#e8c48a' } },
    ui_boss_lotus:   { src: 'assets/ui/boss/lotus.png',   placeholder: { kind: 'icon', label: '息', color: '#e8c48a' } },
    ui_boss_erosion: { src: 'assets/ui/boss/erosion.png', placeholder: { kind: 'icon', label: '怨', color: '#8a1030' } }
  },

  audio: {
    /* ---------- 背景音乐（loop）。placeholder.notes = 占位合成和弦（Hz） ---------- */
    bgm_title:   { src: 'assets/audio/bgm/title.mp3',   loop: true, volume: 0.7, placeholder: { notes: [196, 247, 294, 392] } },
    bgm_opening: { src: 'assets/audio/bgm/opening.mp3', loop: true, volume: 0.7, placeholder: { notes: [110, 165, 220] } },
    bgm_village: { src: 'assets/audio/bgm/village.mp3', loop: true, volume: 0.7, placeholder: { notes: [262, 330, 392] } },
    bgm_bridge:  { src: 'assets/audio/bgm/bridge.mp3',  loop: true, volume: 0.7, placeholder: { notes: [294, 370, 440, 587] } },
    bgm_evil:    { src: 'assets/audio/bgm/evil.mp3',    loop: true, volume: 0.75, placeholder: { notes: [98, 147, 156, 196] } },
    bgm_forest:  { src: 'assets/audio/bgm/forest.mp3',  loop: true, volume: 0.7, placeholder: { notes: [147, 175, 220] } },
    bgm_altar:   { src: 'assets/audio/bgm/altar.mp3',   loop: true, volume: 0.7, placeholder: { notes: [110, 131, 165, 208] } },
    bgm_seal:    { src: 'assets/audio/bgm/seal.mp3',    loop: true, volume: 0.85, placeholder: { notes: [87, 131, 139, 175] } },
    bgm_truth:   { src: 'assets/audio/bgm/truth.mp3',   loop: true, volume: 0.7, placeholder: { notes: [131, 165, 196, 247] } },
    bgm_end_bear:  { src: 'assets/audio/bgm/end_bear.mp3',  loop: true, volume: 0.7, placeholder: { notes: [262, 330, 392, 523] } },
    bgm_end_leave: { src: 'assets/audio/bgm/end_leave.mp3', loop: true, volume: 0.7, placeholder: { notes: [110, 131, 156] } },
    bgm_end_split: { src: 'assets/audio/bgm/end_split.mp3', loop: true, volume: 0.7, placeholder: { notes: [196, 247, 294, 370] } },

    /* ---------- 音效 ---------- */
    sfx_click:   { src: 'assets/audio/sfx/click.mp3',   volume: 0.6, placeholder: { tone: [880, 0.05] } },
    sfx_item:    { src: 'assets/audio/sfx/item.mp3',    volume: 0.8, placeholder: { tone: [660, 0.12, 990, 0.18] } },
    sfx_step:    { src: 'assets/audio/sfx/step.mp3',    volume: 0.6, placeholder: { tone: [180, 0.08] } },
    sfx_reveal:  { src: 'assets/audio/sfx/reveal.mp3',  volume: 0.8, placeholder: { tone: [440, 0.15, 554, 0.15, 659, 0.3] } },
    sfx_thunder: { src: 'assets/audio/sfx/thunder.mp3', volume: 0.9, placeholder: { tone: [70, 0.6] } },
    sfx_locked:  { src: 'assets/audio/sfx/locked.mp3',  volume: 0.6, placeholder: { tone: [220, 0.1, 196, 0.15] } },
    sfx_water:   { src: 'assets/audio/sfx/water.mp3',   volume: 0.7, placeholder: { tone: [520, 0.08, 390, 0.2] } },
    sfx_hit:     { src: 'assets/audio/sfx/hit.mp3',     volume: 0.8, placeholder: { tone: [330, 0.05, 160, 0.12] } },
    sfx_bell:    { src: 'assets/audio/sfx/bell.mp3',    volume: 0.7, placeholder: { tone: [784, 0.5, 1175, 0.8] } },
    sfx_petal:   { src: 'assets/audio/sfx/petal.mp3',   volume: 0.7, placeholder: { tone: [1046, 0.1, 880, 0.1, 698, 0.3] } },
    sfx_voice:   { src: 'assets/audio/sfx/voice.mp3',   volume: 0.7, placeholder: { tone: [392, 0.4, 330, 0.6] } },
    /* ---------- 最终战 ---------- */
    bgm_boss:    { src: 'assets/audio/bgm/boss.mp3',    loop: true, volume: 0.85, placeholder: { notes: [73, 110, 117, 147] } },
    bgm_end_true:{ src: 'assets/audio/bgm/end_true.mp3', loop: true, volume: 0.7, placeholder: { notes: [262, 330, 392, 494] } },
    bgm_end_fall:{ src: 'assets/audio/bgm/end_fall.mp3', loop: true, volume: 0.7, placeholder: { notes: [98, 117, 147] } },
    sfx_slash:   { src: 'assets/audio/sfx/slash.mp3',   volume: 0.85, placeholder: { tone: [1200, 0.04, 600, 0.1] } },
    sfx_block:   { src: 'assets/audio/sfx/block.mp3',   volume: 0.8, placeholder: { tone: [520, 0.06, 780, 0.12] } },
    sfx_screech: { src: 'assets/audio/sfx/screech.mp3', volume: 0.8, placeholder: { tone: [1400, 0.2, 900, 0.4] } }
  }
};
