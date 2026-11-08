/* =========================================================
 * 最终战 · 狍鸮  —— 全部数值与台词都在这里调
 * 玩法：回合制。光标在时间条上来回扫，扫到金色区间时按「按钮 / 空格」。
 *   我方回合 = 出剑（金区命中，偏了空振；第 3 阶段起按到红区会被反噬）
 *   敌方回合 = 格挡（金区挡住，偏了或没按都扣 1 点灵息）
 * 灵息归零 = 失败（坏结局）。打完 5 个阶段 = 胜利（真结局）。
 * speed：光标每秒走过时间条的比例（1 = 1 秒走完一趟）
 * gold：金区宽度（占时间条的比例）   traps：红色陷阱区个数
 * wobble：光标忽快忽慢的幅度 0~1    hits：本阶段需要命中几次
 * combo：终结一击需要在同一回合内连续命中几次
 * ========================================================= */
window.GAME_BOSS = {
  name: '狍鸮',
  hearts: 3,                 // 阿萨尔的灵息
  slowFactor: 0.6,           // 「慢速模式」下光标速度倍率
  sweeps: 2,                 // 一回合光标最多来回几趟，超时算没按
  needItem: 'twin',          // 终结一击的前提物品：双莲护符（黑莲花瓣 + 完整白莲护符在祭坛合成）。为空字符串则不需要
  bg: 'bg_altar_corrupt',
  img: 'boss_paoxiao',

  stages: [
    { form: 1, title: '第一阶段 · 苏醒', hits: 2, speed: 0.55, gold: 0.20, traps: 0, wobble: 0,
      intro: [ { say: 'spirit', expr: 'sorrow', text: '它在睡梦里也在哭。先看清它的节奏——光到金色时出剑。' } ] },
    { form: 1, title: '第二阶段 · 低语', hits: 2, speed: 0.7, gold: 0.15, traps: 0, wobble: 0,
      intro: [ { text: '狍鸮张开人面，婴儿般的啼声在耳边绕成低语。' },
               { say: 'hero', expr: 'normal', text: '……别听。只看光。' } ] },
    { form: 2, title: '第三阶段 · 侵蚀', hits: 2, speed: 0.8, gold: 0.13, traps: 1, wobble: 0,
      intro: [ { text: '羽翼被地怨染成血红。时间条上浮出一道红光。' },
               { say: 'evil', expr: 'angry', text: '红色的是地怨的诱饵——碰到它，疼的是你！' } ] },
    { form: 2, title: '第四阶段 · 狂乱', hits: 2, speed: 0.9, gold: 0.12, traps: 2, wobble: 0.55,
      intro: [ { text: '它彻底狂乱了，扑击忽快忽慢。' },
               { say: 'evil', expr: 'sorrow', text: '……它的疼，和我一样。' } ] },
    { form: 3, title: '终章 · 终鸣', hits: 1, combo: 3, speed: 0.85, gold: 0.12, traps: 1, wobble: 0.3,
      intro: [ { text: '血色法阵在狍鸮身后展开，灾厄之翼遮住了天空。' },
               { say: 'spirit', expr: 'gaze', text: '就是现在。把白莲与黑莲一起，交给你的剑。' } ],
      noItem: [ { text: '护符只亮起一半的光——白莲还在，黑莲却不在。终结一击怎么也凝聚不起来。' } ],
      comboTip: '连续命中 {n} 次，完成终结一击' }
  ],

  text: {
    attackTip: '出剑！光到金色时按下',
    blockTip: '它要扑过来了！光到金色时格挡',
    hit: '命中！', miss: '空振……', trap: '被地怨反噬！', block: '挡住了！', hurt: '被利爪撕开——灵息 -1',
    noItem: '没有金色的光……',
    button: { attack: '出 剑', block: '格 挡' },
    slow: '慢速模式'
  }
};
