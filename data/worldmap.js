/* =========================================================
 * 世界地图配置（只放内容，逻辑在 js/worldmap/）
 * 所有坐标都是相对地图图片的百分比 [左, 上, 宽, 高]，随窗口缩放不会错位。
 *   area   可点击区域（悬停发光、点击选中）
 *   pin    覆盖在原图地点名牌上的动态名牌（显示状态标记）
 * scene    对应 data/scenes.js 里的场景 id，「进入场景」调用 Game.stage.goto(scene)
 * unlockIf / doneIf  条件写法与剧情相同（flag:xx、item:xx、visited:xx、数组=全部满足），直接读现有存档状态
 * images   详情面板的大图与缩略图；文件缺失时显示占位框并标出路径
 * people   涉及人物：char 对应 data/characters.js 的 id，portrait 为表情名
 * ========================================================= */
window.WORLD_MAP = {
  image: 'assets/ui/worldmap.jpg',
  title: '断桥之森 · 山灵',

  locations: [
    {
      id: 'village', no: '01', scene: 'village', chapter: '序章',
      name: '云溪村', tagline: '起点 · 寻迹而来',
      intro: '依山而建的宁静村落，河水绕村而过，水车日夜转动。这里是阿萨尔旅途的起点，村口的老约翰知道断桥的旧传说。',
      area: [0, 52, 25, 33], pin: [12.1, 61.1, 11.1, 7.4],
      unlockIf: true, doneIf: 'flag:met_john',
      images: [
        { src: 'assets/map/village_main.jpg',   caption: '村口全景' },
        { src: 'assets/map/village_gate.jpg',   caption: '村口牌坊' },
        { src: 'assets/map/village_street.jpg', caption: '村内街道' },
        { src: 'assets/map/village_river.jpg',  caption: '河畔水车' }
      ],
      people: [
        { char: 'hero', portrait: 'normal', role: '主角 · 年轻剑士', bio: '红金披风的旅人，循着断桥的传说来到云溪村。他自己也不知道，为何总能听见山的声音。' },
        { char: 'john', portrait: 'smile',  role: '村民 · 引路人', bio: '村口的好心老人，年轻时听过镇纹石的传说，把自己的灯笼交给了阿萨尔。' }
      ]
    },
    {
      id: 'bridge', no: '02', scene: 'bridge', chapter: '第一关',
      name: '峡谷断桥', tagline: '踏石成桥 · 通往古林',
      intro: '横跨深谷的古石桥从中断裂，瀑布在脚下轰鸣。找回三枚镇纹石放回桥头凹槽，断口才会显出旧路。',
      area: [16, 33, 34, 27], pin: [28.5, 35.4, 11.1, 6.5],
      unlockIf: 'flag:met_john', doneIf: 'flag:crossed',
      images: [
        { src: 'assets/map/bridge_main.jpg', caption: '断桥峡谷' },
        { src: 'assets/map/bridge_far.jpg',  caption: '断桥远景' },
        { src: 'assets/map/bridge_pier.jpg', caption: '残存桥墩' }
      ],
      people: [
        { char: 'hero', portrait: 'normal', role: '主角 · 年轻剑士', bio: '在断口前，他第一次看见白莲中现身的灵。' },
        { char: 'good', portrait: 'calm',   role: '善灵 · 白莲', bio: '银白卷发、浅金眼眸的山灵分身，温柔而沉静，记忆正一点点消散。' }
      ]
    },
    {
      id: 'forest', no: '03', scene: 'forest', chapter: '第二关',
      name: '古林雾道', tagline: '林里迷声 · 记忆消散',
      intro: '古树遮天，浓雾压着石路。古碑、地面的花纹与护符里，藏着善灵遗失的记忆，也藏着恶灵愤怒的源头。',
      area: [50, 24, 27.5, 34], pin: [59.1, 44.7, 11, 7],
      unlockIf: 'flag:crossed', doneIf: 'flag:fog_open',
      images: [
        { src: 'assets/map/forest_path.jpg', caption: '雾中石阶' },
        { src: 'assets/map/forest_arch.jpg', caption: '残破石拱' }
      ],
      people: [
        { char: 'hero', portrait: 'normal', role: '主角 · 年轻剑士', bio: '雾里有人说话，而他手中的护符正在发热。' },
        { char: 'good', portrait: 'calm',   role: '善灵 · 白莲', bio: '她认得这片林子，却想不起为什么。' },
        { char: 'evil', portrait: 'scorn',  role: '恶灵 · 黑莲', bio: '与善灵同一张脸，红眸黑莲，荆棘缠身。她替山承受痛苦，行为危险，情绪却是真的。' }
      ]
    },
    {
      id: 'altar', no: '04', scene: 'altar', chapter: '第三关 · 终章',
      name: '山谷祭坛', tagline: '祭台镇灵 · 真相之地',
      intro: '山谷深处镇压地怨的古祭坛，也是山灵本体所在之处。在这里点亮三处符位，听完真相，再做出你的选择。',
      area: [54, 2, 23.5, 22], pin: [61.3, 14.6, 10.7, 6.5],
      unlockIf: 'flag:fog_open', doneIf: 'flag:seal_done',
      images: [
        { src: 'assets/map/altar_main.jpg', caption: '山谷祭坛' },
        { src: 'assets/map/altar_ring.jpg', caption: '祭台印纹' },
        { src: 'assets/map/altar_core.jpg', caption: '镇灵核心' }
      ],
      people: [
        { char: 'hero',   portrait: 'normal', role: '主角 · 独立的灵息', bio: '轮回中形成的独立灵息。他有权拒绝本体的请求。' },
        { char: 'spirit', portrait: 'calm',   role: '山灵本体', bio: '金色山纹，枝角挂着金铃，胸前灵核缓缓旋转。守了这座山太久。' },
        { char: 'good',   portrait: 'calm',   role: '善灵 · 白莲', bio: '在祭坛前，她替阿萨尔挡下了黑根。' },
        { char: 'evil',   portrait: 'angry',  role: '恶灵 · 黑莲', bio: '先一步抵达祭坛，等着看你会怎么选。' }
      ]
    }
  ],

  /* 底部章节流程：loc 为点击后选中的地点；doneIf 'ended' 表示已看到任一结局 */
  chapters: [
    { name: '序章',   sub: '初入云溪', loc: 'village', unlockIf: true,              doneIf: 'flag:met_john' },
    { name: '第一关', sub: '踏石搭桥', loc: 'bridge',  unlockIf: 'flag:met_john',   doneIf: 'flag:crossed' },
    { name: '第二关', sub: '林里迷声', loc: 'forest',  unlockIf: 'flag:crossed',    doneIf: 'flag:fog_open' },
    { name: '第三关', sub: '祭台镇灵', loc: 'altar',   unlockIf: 'flag:fog_open',   doneIf: 'flag:seal_done' },
    { name: '终章', sub: '狍鸮', loc: 'altar',   unlockIf: 'flag:seal_done',  doneIf: 'ended' }
  ],

  /* 覆盖原图左侧菜单：action 为 bag / settings / toast */
  menu: [
    { label: '主线剧情', rect: [0.9, 12.4, 11.5, 4.6], action: 'none' },
    { label: '场景图鉴', rect: [1.6, 18.6, 9, 3.6], action: 'toast', text: '场景图鉴制作中' },
    { label: '人物档案', rect: [1.6, 23.8, 9, 3.6], action: 'toast', text: '人物档案制作中，可在地点详情里点击人物头像查看' },
    { label: '收集物',   rect: [1.6, 28.9, 9, 3.6], action: 'bag' },
    { label: '设定资料', rect: [1.6, 33.8, 9, 3.6], action: 'settings' }
  ],

  /* 覆盖原图右上角的计数牌、右侧信息面板、底部章节栏 */
  layout: {
    counters: [78.3, 1.2, 21, 4.6],
    panel: [78.1, 9.2, 21.4, 76.4],
    chapterBar: [0, 87.4, 77.6, 12.6],
    close: [80.5, 89.5, 17, 6.5]
  }
};
