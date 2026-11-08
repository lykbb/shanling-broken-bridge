/* =========================================================
 * 场景表（剧本 v0.2《断桥之森》：云溪村 → 峡谷断桥 → 古林雾道 → 山谷祭坛）
 * bg 背景  bgm 音乐  fx 氛围: dust | mist | fireflies | embers
 * onEnter { first: 首次进入的剧情节点, every: 每次进入的节点 }
 * characters 常驻角色: x 脚底中心横坐标, y 离底边距离, depth 视差, cls 额外样式, if 出现条件
 * props 场景道具（CSS 占位，换上正式背景后可删除或改为 asset 图片）: x y w h, cls, asset, text, if
 * hotspots 可点击区域 rect:[x,y,宽,高]; type npc|item|exit; script 剧情节点; do 点击时先执行的效果; exit 用 to/locked
 * 换上正式背景后，用 ?debug=1 点击画面看坐标，改这里的 rect / x / y 即可。
 * ========================================================= */
window.GAME_SCENES = {
  /* ---------------- 序章 · 云溪村 ---------------- */
  village: {
    name: '序章 · 云溪村', bg: 'bg_village', bgm: 'bgm_village', fx: 'dust',
    onEnter: { first: 'village_intro' },
    /* 背景 = 用户 BG_01 云溪村村口（2026-11-07 换上）：左侧瀑布与溪水，中间牌坊与石路 */
    characters: [ { id: 'hero', x: 1380, y: 0, depth: 0.8 }, { id: 'john', x: 880, y: 0, depth: 0.6 } ],
    hotspots: [
      { id: 'john', type: 'npc', label: '老约翰', rect: [720, 220, 320, 860], script: 'john_talk' },
      { id: 'farbridge', type: 'item', label: '峡谷方向', rect: [420, 230, 360, 330], script: 'village_farbridge' },
      /* 可调查的小物件（点击出一小段介绍） */
      { id: 'look_sign',    type: 'item', label: '牌坊匾额', rect: [1140, 150, 380, 150], script: 'look_v_sign' },
      { id: 'look_bell',    type: 'item', label: '古树铜铃', rect: [260, 200, 180, 220], script: 'look_v_bell' },
      { id: 'look_lantern', type: 'item', label: '石灯笼',   rect: [440, 660, 240, 360], script: 'look_v_lantern' },
      { id: 'look_banner',  type: 'item', label: '莲纹旗幡', rect: [1720, 340, 150, 300], script: 'look_v_banner' },
      { id: 'to_bridge', type: 'exit', label: '← 沿溪小路', rect: [0, 600, 380, 300], to: 'bridge', if: 'flag:met_john', locked: 'village_locked' }
    ]
  },

  /* ---------------- 第一关 · 峡谷断桥 · 踏石搭桥 ---------------- */
  bridge: {
    name: '第一关 · 踏石搭桥', bg: 'bg_bridge', bgm: 'bgm_bridge', fx: 'mist',
    onEnter: { first: 'bridge_intro' },
    characters: [ { id: 'hero', x: 520, y: 0, depth: 0.8 }, { id: 'good', x: 1480, y: 120, depth: 0.7, if: 'flag:met_good' } ],
    props: [
      /* 线索微光：提示镇纹石藏处，拿到后消失 */
      { cls: 'prop-glint', x: 110, y: 820, w: 90, h: 90, if: '!flag:stone_water' },
      { cls: 'prop-glint', x: 290, y: 370, w: 80, h: 80, if: ['flag:met_good', '!flag:stone_mountain'] },
      { cls: 'prop-glint', x: 500, y: 960, w: 80, h: 80, if: ['flag:met_good', '!flag:stone_lotus'] },
      /* 断口上的三级石阶 */
      { cls: 'prop-gap', x: 1010, y: 400, w: 70, h: 70, if: '!flag:path_lit' },
      { cls: 'prop-gap', x: 1120, y: 420, w: 70, h: 70, if: '!flag:path_lit' },
      { cls: 'prop-gap', x: 1230, y: 400, w: 70, h: 70, if: '!flag:path_lit' },
      { cls: 'prop-stone', x: 1010, y: 400, w: 70, h: 70, if: 'flag:path_lit' },
      { cls: 'prop-stone', x: 1120, y: 420, w: 70, h: 70, if: 'flag:path_lit' },
      { cls: 'prop-stone', x: 1230, y: 400, w: 70, h: 70, if: 'flag:path_lit' },
      { cls: 'prop-bridge', x: 960, y: 395, w: 400, h: 70, if: 'flag:path_lit' },
      { cls: 'prop-rune', x: 1560, y: 150, w: 300, h: 90, text: '归途', if: 'flag:crossed' }
    ],
    hotspots: [
      { id: 'grass',  type: 'item', label: '崖边花丛', rect: [0, 680, 340, 380], script: 'bridge_grass',  if: '!flag:stone_water' },
      { id: 'look_fall',   type: 'item', label: '谷底瀑布', rect: [780, 680, 220, 320], script: 'look_b_fall' },
      { id: 'look_sunset', type: 'item', label: '远山落日', rect: [560, 140, 480, 200], script: 'look_b_sunset' },
      { id: 'rail',   type: 'item', label: '倒塌的石栏', rect: [180, 330, 260, 130], script: 'bridge_rail', if: ['flag:met_good', '!flag:stone_mountain'] },
      { id: 'roots',  type: 'item', label: '老树盘根', rect: [380, 930, 360, 150], script: 'bridge_roots', if: ['flag:met_good', '!flag:stone_lotus'] },
      { id: 'groove', type: 'item', label: '桥头凹槽', rect: [840, 350, 170, 160], script: 'bridge_groove', if: '!flag:path_lit' },
      { id: 'good',   type: 'npc',  label: '善灵', rect: [1330, 520, 300, 480], script: 'bridge_good', if: 'flag:met_good' },
      { id: 'cross',  type: 'item', label: '踏上旧路', rect: [960, 360, 400, 140], script: 'bridge_cross', if: ['flag:path_lit', '!flag:crossed'] },
      { id: 'to_village', type: 'exit', label: '← 云溪村', rect: [0, 140, 180, 200], to: 'village', if: '!flag:crossed', locked: 'bridge_noreturn' },
      { id: 'to_forest',  type: 'exit', label: '古林 →', rect: [1640, 300, 280, 200], to: 'forest', if: 'flag:crossed', locked: 'bridge_locked' }
    ]
  },

  /* ---------------- 第二关 · 古林雾道 · 林里迷声 ---------------- */
  forest: {
    name: '第二关 · 林里迷声', bg: 'bg_forest', bgm: 'bgm_forest', fx: 'fireflies',
    onEnter: { first: 'forest_intro' },
    characters: [
      { id: 'hero', x: 300, y: 0, depth: 0.8 },
      { id: 'good', x: 720, y: 60, depth: 0.7 },
      { id: 'evil', x: 1600, y: 60, depth: 0.7, if: ['flag:met_evil', '!flag:evil_left'] }
    ],
    props: [
      { cls: 'prop-mist white', x: 760, y: 300, w: 760, h: 460, if: '!flag:fog_open' }
    ],
    hotspots: [
      { id: 'stele',  type: 'item', label: '古碑', rect: [1390, 520, 170, 220], script: 'forest_stele', if: ['flag:met_evil', '!flag:fog_open'] },
      { id: 'floor',  type: 'item', label: '地面的花纹', rect: [860, 840, 420, 240], script: 'forest_floor', if: ['flag:met_evil', '!flag:fog_open'] },
      { id: 'amulet', type: 'item', label: '木纹护符', rect: [150, 300, 300, 600], script: 'forest_amulet', if: ['flag:met_evil', '!flag:fog_open'] },
      { id: 'good',   type: 'npc',  label: '善灵', rect: [560, 180, 320, 780], script: 'forest_good' },
      { id: 'evil',   type: 'npc',  label: '恶灵', rect: [1440, 160, 320, 820], script: 'forest_evil', if: ['flag:met_evil', '!flag:evil_left'] },
      { id: 'to_altar', type: 'exit', label: '雾中石阶 ↑', rect: [880, 500, 260, 220], to: 'altar', if: 'flag:fog_open', locked: 'forest_locked' },
      { id: 'look_light', type: 'item', label: '林间光束', rect: [900, 90, 320, 300], script: 'look_f_light' }
    ]
  },

  /* ---------------- 第三、四关 · 山谷祭坛 ---------------- */
  altar: {
    name: '第三关 · 祭台镇灵', bg: 'bg_altar', bgm: 'bgm_altar', fx: 'embers',
    onEnter: { first: 'altar_intro' },
    characters: [
      { id: 'hero', x: 380, y: 0, depth: 0.8 },
      { id: 'good', x: 720, y: 60, depth: 0.7, if: '!flag:good_gone' },
      { id: 'evil', x: 1540, y: 60, depth: 0.7 },
      { id: 'spirit', x: 1020, y: 260, depth: 0.95, cls: 'ghost', if: 'flag:spirit_appeared' }
    ],
    props: [
      { cls: 'prop-seal lit', x: 820, y: 520, w: 400, h: 160, if: 'flag:seal_done' }
    ],
    hotspots: [
      { id: 'seal',   type: 'item', label: '祭台印纹', rect: [800, 540, 440, 140], script: 'altar_seal', if: ['flag:altar_ready', '!flag:seal_done'] },
      { id: 'good',   type: 'npc',  label: '善灵', rect: [560, 180, 320, 800], script: 'altar_good', if: '!flag:good_gone' },
      { id: 'evil',   type: 'npc',  label: '恶灵', rect: [1390, 160, 320, 820], script: 'altar_evil' },
      { id: 'spirit', type: 'npc',  label: '山灵本体', rect: [800, 60, 440, 460], script: 'final_choice', if: 'flag:truth_known' },
      { id: 'rift',   type: 'item', label: '地面裂隙', rect: [1040, 760, 500, 260], script: 'altar_rift' },
      { id: 'look_pillar',  type: 'item', label: '山纹石柱', rect: [60, 200, 150, 380], script: 'look_a_pillar' },
      { id: 'look_alantern',type: 'item', label: '祭坛石灯', rect: [130, 600, 190, 380], script: 'look_a_lantern' },
      { id: 'look_rpillar', type: 'item', label: '断裂的石柱', rect: [1730, 400, 150, 400], script: 'look_a_rpillar' }
    ]
  }
};

/* 开局配置 */
window.GAME_CONFIG = {
  title: '断桥之森',
  subtitle: '山 灵',
  startScene: 'village',
  titleBg: 'bg_title',
  titleBgm: 'bgm_title',
  textSpeed: 32
};
