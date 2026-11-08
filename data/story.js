/* =========================================================
 * 剧情脚本《断桥之森》· 山灵 —— 依据《山灵_优化剧本_v0.2》
 * 标【补】的是为串联交互补写的少量提示/旁白，其余对白按剧本原文。
 * ---------------------------------------------------------
 * 指令：
 *   { say: 'john', expr: 'laugh', text: '……' }  角色说话（expr 切换对话头像）
 *   { text: '……' }                               旁白
 *   { choice: [ { text, if, do, goto } ] }       选项
 *   { branch: 条件, then: '节点', else: '节点' }   条件跳转       { goto: '节点' }
 *   { do: [ {set}, {unset}, {give}, {take}, {unlock}, {inc:'变量', by:1}, {dec} ] }
 *   { show: 'good', at: 'left'|'center'|'right'|数字, cls: '样式' }  { hide: 'x', effect: 'dissolve' }
 *   { charClass: 'hero', add: 'fadeout', remove: '...' }
 *   { cg: '素材id', style: 'kenburns'|'memory', hold: 毫秒 }  { cg: null }
 *   { minigame: 'runes'|'battle'|'seal', ...参数, win: '节点', lose: '节点' }
 *   { objective: '镇纹石 {var:stones}/3' | null }   左上角目标提示
 *   { scene: 'forest' } { bgm: 'bgm_x' | null } { sfx: 'sfx_x' } { shake: true } { flash: '#fff' } { wait: 500 } { props: true } { ending: 'bear' }
 *   任何指令可加 when: 条件
 * 条件：'flag:x' '!flag:x' 'item:x' 'var:stones>=1' 'visited:scene'；数组=全部满足；{ any: [...] }
 * ========================================================= */
window.GAME_STORY = {

  /* ======================== 序章｜晴日来客 ======================== */
  village_intro: [
    { text: '晴日。村口石路被树荫切成斑驳的光块。河水从村旁流过，远处山间瀑布落入峡谷。' },
    { text: '瀑布那头就是峡谷，断桥藏在雾后。' },
    { text: '【提示】点击发光的人物或物品互动。按 H 显示所有可交互点。' },   // 【补】
    { objective: '和路边的老人说说话' }
  ],

  john_talk: [
    { branch: 'flag:met_john', then: 'john_again' },
    { objective: null },
    { say: 'john', expr: 'smile', text: '年轻人，往山里去？' },
    { say: 'hero', expr: 'normal', text: '嗯。我总觉得，有什么声音在那边叫我。' },
    { say: 'john', expr: 'think', text: '前面的桥早断了。晴天看着漂亮，一进山，雾就把路吃得干干净净。' },
    { choice: [
      { text: '问断桥：“桥断了，还有路吗？”', goto: 'john_bridge' },
      { text: '问山灵：“山里真的有山灵吗？”', goto: 'john_spirit' }
    ] }
  ],
  john_bridge: [
    { say: 'hero', expr: 'normal', text: '桥断了，还有路吗？' },
    { say: 'john', expr: 'recall', text: '桥头石栏上有旧花纹。老人们说，找到三枚散落的镇纹石，断口会显出旧路。我年轻时当它是传说。' },
    { goto: 'john_end' }
  ],
  john_spirit: [
    { say: 'hero', expr: 'normal', text: '山里真的有山灵吗？' },
    { say: 'john', expr: 'recall', text: '有人说见过一朵发光的白花，也有人说，夜里有红色的花在哭。谁也讲不清是真是假。' },
    { goto: 'john_end' }
  ],
  john_end: [
    { say: 'john', expr: 'think', text: '还有一件事。山里有种怪鸟，叫狍鸮——人脸，鸟身，叫声像婴儿哭。听见了，千万别往声音那边走。' },
    { say: 'john', expr: 'calm', text: '不管你去找什么，都记得回来。村里的人可还要过日子呢。' },
    { text: '老约翰把提灯提到胸前，冲你点头。村庄的炊烟和桥下河水一起留在远景中。' },
    { say: 'hero', expr: 'smile', text: '我会记得。' },
    { do: [{ set: 'met_john' }, { unlock: 'bridge' }] },
    { objective: '点击左侧溪边小路，前往断桥' }
  ],
  john_again: [
    { say: 'john', expr: 'smile', text: '去吧。记得回来。' }
  ],
  village_farbridge: [
    { text: '远山之间，一座断裂的高石桥横在峡谷上，像一句没说完的话。' }
  ],
  village_locked: [
    { sfx: 'sfx_locked' },
    { say: 'hero', expr: 'normal', text: '先跟路边那位老人家打个招呼吧。' }   // 【补】
  ],

  /* ======================== 第一关｜踏石搭桥 ======================== */
  bridge_intro: [
    { objective: null },
    { text: '断桥横跨深谷。两截石桥之间隔着巨大的断口，水雾从下方瀑布升起。' },
    { text: '桥头石栏布满细小裂痕，三处圆形凹槽空着。' },
    { say: 'hero', expr: 'normal', text: '这样的断口，根本跳不过去。' },
    { sfx: 'sfx_petal' },
    { text: '一片白色花瓣被风托起。发光的白莲在桥边绽开——' },
    { flash: '#fff6e0' },
    { do: [{ set: 'met_good' }] },
    { show: 'good', at: 1480, y: 100 },
    { say: 'good', expr: 'surprised', text: '别跳。你会掉下去的。' },
    { say: 'hero', expr: 'surprised', text: '你是谁？' },
    { say: 'good', expr: 'calm', text: '我……好像一直在这里等人。' },
    { text: '她看向桥头三处凹槽，短暂停顿。' },
    { say: 'good', expr: 'smile', text: '石头还在。崖边白花丛里，石栏下面，还有那棵老树的根部。把它们找回来，旧路就会亮。' },
    { objective: '镇纹石 {var:stones}/3' }
  ],
  bridge_good: [
    { branch: 'flag:path_lit', then: 'bridge_good_after' },
    { say: 'good', expr: 'calm', text: '崖边白花丛里，石栏下面，还有那棵老树的根部。' }
  ],
  bridge_good_after: [
    { say: 'good', expr: 'smile', text: '走吧，趁它还亮着。' }
  ],
  bridge_grass: [
    { branch: 'flag:met_good', else: 'bridge_grass_early' },
    { do: [{ set: 'stone_water' }, { inc: 'stones' }, { give: 'stone' }] },
    { sfx: 'sfx_item' },
    { say: 'hero', expr: 'normal', text: '第一枚。上面的花纹像水流。' },
    { goto: 'bridge_stone_check' }
  ],
  bridge_grass_early: [
    { text: '崖边开着几朵小白花。' }
  ],
  bridge_rail: [
    { do: [{ set: 'stone_mountain' }, { inc: 'stones' }, { give: 'stone' }] },
    { sfx: 'sfx_item' },
    { say: 'hero', expr: 'normal', text: '第二枚。像是一座山。' },
    { goto: 'bridge_stone_check' }
  ],
  bridge_roots: [
    { do: [{ set: 'stone_lotus' }, { inc: 'stones' }, { give: 'stone' }] },
    { sfx: 'sfx_item' },
    { say: 'hero', expr: 'normal', when: 'var:stones>=3', text: '最后一枚……这上面刻着一朵莲花。' },
    { say: 'hero', expr: 'normal', when: 'var:stones<3', text: '这上面刻着一朵莲花。' },
    { goto: 'bridge_stone_check' }
  ],
  bridge_stone_check: [
    { objective: '把镇纹石放回桥头凹槽', when: 'var:stones>=3' }
  ],
  bridge_groove: [
    { branch: 'var:stones>=3', then: 'bridge_light', else: 'bridge_groove_empty' }
  ],
  bridge_groove_empty: [
    { text: '桥头石栏上三处圆形凹槽，刻着水、山、莲的残纹。' },
    { text: '镇纹石还不够，三处凹槽都要填上。', when: 'var:stones>=1' }
  ],
  bridge_light: [
    { objective: null },
    { do: [{ take: 'stone' }, { set: 'path_lit' }] },
    { sfx: 'sfx_reveal' },
    { props: true },
    { text: '三枚石纹归位，桥头的古阵发出柔和的金光。' },
    { flash: '#ffe9a8' },
    { text: '不是石头补上了巨大的断口——是断桥原有的灵纹被唤醒，短暂形成一条半透明的光路。' },
    { say: 'good', expr: 'surprised', text: '原来……它还记得怎么亮起来。' },
    { text: '断口上浮现出几级连向对岸的金色石阶。远处森林入口的轮廓终于清晰。' },
    { objective: '踏上旧路' }
  ],
  bridge_cross: [
    { objective: null },
    { sfx: 'sfx_step' },
    { charClass: 'hero', add: 'fadeout' },
    { wait: 1400 },
    { text: '你踏上光阶，一步步走向对岸。' },
    { do: [{ set: 'crossed' }] },
    { props: true },
    { text: '最后一级光阶上闪过古字——「归途」。' },
    { charClass: 'hero', remove: 'fadeout' },
    { say: 'hero', expr: 'surprised', text: '归途？是让我回去吗？' },
    { say: 'good', expr: 'calm', text: '我不知道。可看到这个字，我忽然有些难过。' },
    { text: '她将一枚木纹护符放进你手心，护符上有半朵莲花的纹样。' },
    { sfx: 'sfx_item' },
    { do: [{ give: 'amulet' }, { unlock: 'forest' }] },
    { say: 'good', expr: 'firm', text: '收好它。雾里的东西有时会说谎；如果连我也忘了什么……就把这个拿给我看。' },
    { say: 'hero', expr: 'normal', text: '你要和我一起进去？' },
    { say: 'good', expr: 'smile', text: '嗯。我不想再一个人守着桥了。' },
    { text: '桥后的树林吞没最后一缕阳光。光路在身后缓慢熄灭，断桥依旧断着，并未被永久修好。' },
    { text: '—— 第一关完成 ——' },
    { scene: 'forest' }
  ],
  bridge_noreturn: [ { text: '光路已经熄灭，回不去了。' } ],
  bridge_locked: [ { sfx: 'sfx_locked' }, { text: '断口太宽了。' } ],

  /* ======================== 第二关｜林里迷声 ======================== */
  forest_intro: [
    { text: '树冠遮住天空。雾压得很低，石路时隐时现。远处传来金属摩擦石面的声响。' },
    { say: 'good', expr: 'calm', text: '这里比我记得的更冷了。' },
    { say: 'hero', expr: 'normal', text: '你上次来是什么时候？' },
    { say: 'good', expr: 'calm', text: '上次……我想不起来。' },
    { sfx: 'sfx_screech' },
    { text: '林子深处传来一声婴儿似的啼哭。树梢间，一对血红的眼睛一闪就不见了。' },
    { bgm: 'bgm_evil' },
    { sfx: 'sfx_petal' },
    { text: '林中一朵暗红色莲花无声盛开。树影扭动，红黑色的枝根从石缝里伸出。' },
    { do: [{ set: 'met_evil' }] },
    { show: 'evil', at: 1380, y: 60 },
    { text: '与善灵容貌几乎一致的恶灵出现，红色光纹沿面颊蔓延。' },
    { say: 'evil', expr: 'scorn', text: '又带人来了？' },
    { say: 'hero', expr: 'surprised', text: '你和她……长得一样。' },
    { say: 'evil', expr: 'mock', text: '（笑了一下）当然一样。她只记得自己要保护谁。我却记得……疼。' },
    { say: 'good', expr: 'firm', text: '离他远一点。' },
    { say: 'evil', expr: 'angry', text: '你连为什么守在这里都忘了，还要教我怎么做？' },
    { shake: true },
    { text: '黑根封住前方道路，低雾里传出不属于任何一个人的细碎哭声。' },
    { choice: [
      { text: 'A｜举起剑，保护善灵', do: [{ set: 'chose_sword' }], goto: 'forest_sword' },
      { text: 'B｜举起木纹护符，先问清楚', do: [{ set: 'chose_ask' }], goto: 'forest_ask' }
    ] }
  ],
  forest_sword: [
    { sfx: 'sfx_hit' }, { flash: '#ffffff' },
    { text: '剑锋划开近处的黑根。' },
    { say: 'evil', expr: 'scorn', text: '你们总是这样。看见红色，就以为只需要砍下去。' },
    { goto: 'forest_fair' }
  ],
  forest_ask: [
    { sfx: 'sfx_reveal' }, { flash: '#fff3c8' },
    { text: '木纹护符泛起白光，黑根短暂松开。' },
    { say: 'hero', expr: 'normal', text: '你说的疼，是从哪里来的？' },
    { say: 'evil', expr: 'sorrow', text: '从地底。从每一个不肯消失的声音里。' },
    { goto: 'forest_fair' }
  ],
  forest_fair: [
    { bgm: 'bgm_forest' },
    { say: 'evil', expr: 'calm', text: '山灵封住了裂隙，也把我们困在这里。她把怨恨留给了我，把安宁留给了她……你说，这公平吗？' },
    { say: 'good', expr: 'calm', text: '（轻声）我曾经知道答案。现在……想不起了。' },
    { text: '恶灵脚边的黑根继续扩散，远处古碑上短暂闪过与护符相似的花纹。' },
    { objective: '调查：古碑 · 地面的花纹 · 木纹护符（{var:clues}/3）' }
  ],
  forest_good: [
    { branch: 'flag:fog_open', then: 'forest_good_after' },
    { say: 'good', expr: 'calm', when: 'flag:met_evil', text: '那块古碑……我好像在哪里见过它的花纹。' },
    { say: 'good', expr: 'calm', when: '!flag:met_evil', text: '雾里有人。' }
  ],
  forest_good_after: [
    { say: 'good', expr: 'firm', text: '我害怕记起来。但我更怕我们再忘下去。' }
  ],
  forest_evil: [
    { say: 'evil', expr: 'mock', when: '!flag:chose_ask', text: '剑收好。砍断几根黑根，又能砍断什么？' },
    { branch: ['flag:chose_ask', '!flag:got_petal'], then: 'forest_petal' },
    { say: 'evil', expr: 'calm', when: 'flag:chose_ask', text: '你倒是第一个问我疼不疼的人。' }
  ],
  forest_petal: [
    { say: 'evil', expr: 'calm', text: '你倒是第一个问我疼不疼的人。' },
    { text: '她沉默了一会儿，从暗莲上摘下一片花瓣，丢到你脚边。' },
    { say: 'evil', expr: 'sorrow', text: '拿着。到了祭坛，你会知道它有什么用。……别弄丢了。' },
    { sfx: 'sfx_petal' },
    { do: [{ set: 'got_petal' }, { give: 'petal' }] }
  ],
  forest_stele: [
    { branch: 'flag:clue_stele', then: 'forest_stele_again' },
    { do: [{ set: 'clue_stele' }, { inc: 'clues' }] },
    { text: '古碑上的刻痕被苔藓填满，中央有一处半朵莲花形状的凹纹。' },
    { goto: 'forest_clue_check' }
  ],
  forest_stele_again: [ { text: '半朵莲花形状的凹纹，像在等什么东西嵌进去。' } ],
  forest_floor: [
    { branch: 'flag:clue_floor', then: 'forest_floor_again' },
    { do: [{ set: 'clue_floor' }, { inc: 'clues' }] },
    { text: '石路上的花纹从古碑脚下一路延伸，被黑根截成了几段——是另外半朵莲。' },
    { goto: 'forest_clue_check' }
  ],
  forest_floor_again: [ { text: '地上是另外半朵莲，被黑根截断了。' } ],
  forest_amulet: [
    { branch: 'flag:clue_amulet', then: 'forest_amulet_again' },
    { do: [{ set: 'clue_amulet' }, { inc: 'clues' }] },
    { text: '你摊开手心。木纹护符上的半朵莲花，正微微发烫。' },
    { goto: 'forest_clue_check' }
  ],
  forest_amulet_again: [ { text: '护符上的半朵莲花还在发烫。' } ],
  forest_clue_check: [
    { branch: 'var:clues>=3', then: 'forest_open' }
  ],
  forest_open: [
    { objective: null },
    { text: '护符上的半朵莲花与碑面凹纹重合——' },
    { sfx: 'sfx_reveal' }, { flash: '#fff3c8' },
    { text: '古碑微微移开，露出一块刻着完整莲纹的青石片。林中的雾路被打开。' },
    { do: [{ give: 'tablet' }, { set: 'fog_open' }, { unlock: 'altar' }] },
    { props: true },
    { say: 'hero', expr: 'normal', text: '这块石片……似乎原本就属于祭坛。' },
    { say: 'good', expr: 'calm', text: '我想起来一点。有人曾说过，不能再让一个人独自承受这一切。' },
    { say: 'evil', expr: 'calm', text: '（收起笑意）说过的人，就是她自己。' },
    { say: 'hero', expr: 'surprised', text: '她是谁？' },
    { say: 'evil', expr: 'scorn', text: '走到尽头，你会见到的。' },
    { sfx: 'sfx_petal' },
    { hide: 'evil', effect: 'dissolve' },
    { do: [{ set: 'evil_left' }] },
    { text: '恶灵散入红色花瓣与黑雾。她不是被打败了——她先一步去了祭坛。' },
    { say: 'good', expr: 'firm', text: '我害怕记起来。但我更怕我们再忘下去。' },
    { text: '石阶沿峡谷下行，森林深处露出古老圆形祭坛的轮廓。' },
    { text: '—— 第二关完成 ——' },
    { scene: 'altar' }
  ],
  forest_locked: [ { sfx: 'sfx_locked' }, { text: '黑根和浓雾封住了前路。' } ],

  /* ======================== 第三关｜祭台镇灵 ======================== */
  altar_intro: [
    { text: '山谷最深处，巨大树根缠绕石柱。圆形祭坛中央的镇灵印暗了大半，有如细根的黑红裂纹从地下延伸出来。' },
    { text: '祭坛背后，不时闪现一圈温暖的金色山纹。' },
    { say: 'good', expr: 'calm', text: '就是这里。我……原来一直想回到这里。' },
    { text: '恶灵站在裂隙边缘，手中的暗莲像一枚燃着的伤口。' },
    { say: 'evil', expr: 'scorn', text: '你们来晚了。封印快碎了。' },
    { say: 'hero', expr: 'normal', text: '那就先把它稳住。' },
    { say: 'evil', expr: 'calm', text: '你知道稳定它的代价吗？' },
    { say: 'good', expr: 'firm', text: '我不记得了。但山下还有人，不能让它现在裂开。' },
    { sfx: 'sfx_reveal' },
    { text: '护符和青石片同时发光，祭坛上出现三处可以触碰的镇灵符位。' },
    { do: [{ set: 'altar_ready' }] },
    { text: '【操作】点击镇灵印开始。60 秒内按「水 → 山 → 莲」的顺序按住符位点亮；黑根缠住符位时，先点击驱散。' },   // 【补】
    { objective: '点击镇灵印，稳住封印' }
  ],
  altar_good: [ { say: 'good', expr: 'firm', when: '!flag:seal_done', text: '山下还有人。' } ],
  altar_evil: [
    { say: 'evil', expr: 'calm', when: '!flag:truth_known', text: '你知道稳定它的代价吗？' },
    { say: 'evil', expr: 'scorn', when: 'flag:truth_known', text: '别急着当英雄。' }
  ],
  altar_rift: [ { text: '地底有漫长而压抑的呼吸声。' } ],
  altar_seal: [
    { objective: null },
    { bgm: 'bgm_seal' },
    { minigame: 'runes', duration: 60, hold: 1100, rootFirst: 4000, rootEvery: 5500,
      title: '镇灵印稳定倒计时', tip: '按顺序按住符位注入灵息 · 黑根缠住时先点击驱散',
      runes: [
        { x: 760,  y: 650, label: '水', caption: '……花溪的水声短暂响起。', sfx: 'sfx_water', color: '#cfeeff' },
        { x: 1020, y: 520, label: '山', caption: '断桥的石纹亮了起来。',   sfx: 'sfx_reveal', color: '#ffe9a8' },
        { x: 1280, y: 650, label: '莲', caption: '白莲与黑莲的花纹同时闪烁。', sfx: 'sfx_bell', color: '#ffd6e2' }
      ],
      win: 'seal_win', lose: 'seal_lose' }
  ],
  seal_lose: [
    { bgm: 'bgm_altar' },
    { text: '黑根遮住了视线。封印未稳。' },
    { choice: [
      { text: '重新尝试', goto: 'altar_seal' },
      { text: '稍后再试', do: [], goto: 'seal_later' }
    ] }
  ],
  seal_later: [ { objective: '点击镇灵印，稳住封印' } ],
  seal_win: [
    { do: [{ set: 'seal_done' }] },
    { props: true },
    { bgm: 'bgm_altar' },
    { text: '第三枚符文被点亮，封印稳定在微光状态。' },
    { text: '但地底仍有漫长而压抑的呼吸声——它只是暂时稳住，问题并没有解决。' },
    { sfx: 'sfx_thunder' }, { shake: true },
    { text: '一条黑根突然缠向你。善灵挡在前方，白莲花瓣形成微光屏障。' },
    { flash: '#fff6e0' },
    { text: '恶灵的脸色第一次发生了变化。' },
    { say: 'evil', expr: 'angry', text: '你还要再替她挡一次？' },
    { say: 'good', expr: 'smile', text: '我不是替谁。我只是……不想让他受伤。' },
    { sfx: 'sfx_petal' },
    { text: '光屏碎裂，善灵的形体一点点散成花瓣。' },
    { say: 'good', expr: 'calm', text: '（渐弱）别恨她……也别恨你自己。' },
    { hide: 'good', effect: 'dissolve' },
    { do: [{ set: 'good_gone' }, { take: 'amulet' }, { give: 'amulet_full' }] },
    { text: '她没有倒地，也没有留下别的东西。只有护符上的半朵莲纹，终于完整了。' },
    { say: 'evil', expr: 'sorrow', text: '……（她握紧暗莲，似乎想抓住最后一瓣白花，却没能抓住。）' },
    { goto: 'truth' }
  ],

  truth: [
    { bgm: 'bgm_truth' },
    { sfx: 'sfx_bell' },
    { text: '祭坛中心的金色山纹升起。' },
    { do: [{ set: 'spirit_appeared' }] },
    { show: 'spirit', at: 1000, y: 120, cls: 'ghost' },
    { text: '山灵本体浮现：银白长发、枝角金铃、胸前旋转的灵核。她不是恶灵的巨大变身，也不是善灵的升级形态，而是两者的来源。' },
    { say: 'spirit', expr: 'gaze', text: '你终于来了。' },
    { say: 'hero', expr: 'surprised', text: '你就是山灵？' },
    { say: 'spirit', expr: 'calm', text: '是。她们也是。' },
    { show: 'good', at: 660, y: 60, cls: 'memory' },
    { wait: 900 },
    { text: '短暂地，三道轮廓重叠在一起：本体居中，白莲与黑莲在两侧。' },
    { hide: 'good' },
    { say: 'spirit', expr: 'sorrow', text: '很久以前，地怨从山谷深处涌出。我挡住了它，却无法消除那些已经发生过的痛苦。' },
    { say: 'spirit', expr: 'calm', text: '我把愿意保护一切的心，留给了白莲；把不肯放下的愤怒与痛，留给了黑莲。自己留在这里，维持最后的封印。' },
    { say: 'evil', expr: 'angry', text: '你把我叫作“恶”，好像这样疼痛就有了罪名。' },
    { say: 'spirit', expr: 'sorrow', text: '我从未觉得你是错的。是我不敢面对你。' },
    { text: '恶灵的赤色纹路闪烁了一瞬，慢慢退到祭坛边缘。' },
    { say: 'spirit', expr: 'calm', text: '漫长岁月里，我们的记忆不断磨损。我害怕有一天，连为什么要守护这里都忘了。' },
    { say: 'spirit', expr: 'gaze', text: '所以我把一缕尚且自由的灵息送入人间。它转生，经历很多次不同的人生……最后成了你。' },
    { shake: true },
    { say: 'hero', expr: 'surprised', text: '我也是……你的一部分？' },
    { say: 'spirit', expr: 'calm', text: '你的起点与我有关。但你如今是你自己。你在村庄认识的人，你走过的路，你愿意相信什么，都不是我替你决定的。' },
    { say: 'hero', expr: 'normal', text: '你唤我回来，是要我替你镇住裂隙？' },
    { say: 'spirit', expr: 'sorrow', text: '（沉默片刻）我需要帮助，却没有权利要求你牺牲。接下来，无论你如何选择，都应该由你决定。' },
    { say: 'evil', expr: 'scorn', text: '别急着当英雄。那个封印会记住你的每一次付出，也会慢慢拿走你的一切。' },
    { sfx: 'sfx_bell' },
    { text: '祭坛裂隙重新微微发亮。远处仿佛传来云溪村的钟声。' },
    { do: [{ set: 'truth_known' }] },
    { text: '—— 第三关完成 · 终章「狍鸮」 ——' },
    { goto: 'final_choice' }
  ],


  /* ---------- 可调查的小物件（点击出一小段介绍） ---------- */
  look_v_sign:    [ { text: '牌匾上写着「云溪村」三个字，木头被晒得发白。匾角挂着一串小小的莲花木牌。' } ],
  look_v_bell:    [ { sfx: 'sfx_bell' }, { text: '古树枝上系着一枚铜铃。风一吹，铃声顺着溪水一直往山里飘。' },
                    { say: 'hero', expr: 'normal', text: '……山里也会听见吗？' } ],
  look_v_lantern: [ { text: '石灯笼里点着长明灯。灯座上刻着三道浅浅的纹：水、山、莲。和断桥那边的旧纹路很像。' } ],
  look_v_banner:  [ { text: '旗幡上绣着一朵白莲。村里人说，这是给山里那位“看不见的守护者”挂的。' } ],
  look_b_fall:    [ { sfx: 'sfx_water' }, { text: '瀑布落进雾里，看不见底。水声大得盖过了心跳。' } ],
  look_b_sunset:  [ { text: '夕阳把远山镶上一圈金边。桥对岸的石柱上，有一样的金色纹路在微微发亮。' } ],
  look_f_light:   [ { text: '几束光从树冠缝隙里斜着落下来，照不到地面就被雾吞了。' },
                    { say: 'good', expr: 'calm', when: '!flag:good_gone', text: '这里以前……没有这么暗。' } ],
  look_a_pillar:  [ { text: '石柱上的金色漩涡纹还亮着，像一颗很慢的心跳。纹路的形状，和护符背面一模一样。' } ],
  look_a_lantern: [ { text: '祭坛边的石灯早就熄了，灯里积着厚厚的落叶，还有一根焦黑的羽毛。' },
                    { say: 'hero', expr: 'normal', text: '好大的羽毛……这是什么鸟？' } ],
  look_a_rpillar: [ { text: '石柱从中间断开，断口上缠着细细的黑根，一碰就往回缩。' } ],

  /* ======================== 终章｜狍鸮（最终战，规则与数值见 data/boss.js） ======================== */
  final_choice: [
    { branch: 'flag:boss_seen', then: 'boss_retry' },
    { do: [{ set: 'boss_seen' }] },
    { sfx: 'sfx_thunder' }, { shake: true },
    { text: '话音未落，祭坛的地缝突然裂开，血红的光从地底喷涌而出。' },
    { sfx: 'sfx_screech' },
    { text: '婴儿似的啼哭在山谷里回荡。一只巨大的人面怪鸟从裂隙中升起，焦黑的羽翼遮住了半边天。' },
    { say: 'hero', expr: 'surprised', text: '狍鸮……老约翰说的那个？' },
    { say: 'spirit', expr: 'sorrow', text: '它本是山中灵兽，替我守了很多年。地怨先吃掉的，是它。' },
    { say: 'evil', expr: 'angry', text: '它要冲下山了。村子挡不住它。' },
    { goto: 'boss_item' }
  ],
  boss_retry: [
    { sfx: 'sfx_screech' },
    { text: '地缝再次裂开，狍鸮的啼声压了下来。' },
    { goto: 'boss_item' }
  ],
  boss_item: [
    { branch: 'item:petal', then: 'boss_twin', else: 'boss_fight' }
  ],
  boss_twin: [
    { text: '口袋里的黑莲花瓣忽然发烫，飞向你手中的白莲护符。' },
    { sfx: 'sfx_reveal' }, { flash: '#fff3c8' },
    { do: [{ take: 'petal' }, { take: 'amulet_full' }, { give: 'twin' }] },
    { text: '一白一黑，两朵半莲合成一枚完整的护符。' },
    { say: 'evil', expr: 'sorrow', text: '……原来它一直在等的，是这个。' },
    { goto: 'boss_fight' }
  ],
  boss_fight: [
    { say: 'hero', expr: 'normal', text: '那就在这里拦住它。' },
    { text: '【操作】光标扫到金色区间时，点击按钮或按空格。我方回合出剑，敌方回合格挡。灵息耗尽即失败。' },
    { objective: '点击山灵本体，迎战狍鸮' },
    { minigame: 'boss', win: 'boss_win', lose: 'boss_lose' }
  ],

  /* ---------- 真结局 · 山醒 ---------- */
  boss_win: [
    { objective: null },
    { bgm: 'bgm_end_true' },
    { text: '双莲护符的光沿剑锋贯穿灵核。狍鸮发出最后一声长鸣——这一次，不再像哭。' },
    { text: '焦黑的羽毛一片片褪去，露出底下灰白的旧羽。地怨像退潮一样缩回地底，裂隙缓缓合上。' },
    { say: 'evil', expr: 'calm', text: '……不疼了。' },
    { text: '恶灵手中的暗莲褪成了浅粉。她走到山灵本体身边，像终于回到了原来的位置。' },
    { say: 'spirit', expr: 'relief', text: '谢谢你。你没有替我承受，也没有丢下我们。你只是……把它们都带回来了。' },
    { say: 'hero', expr: 'smile', text: '那我可以回村子了吗？我答应过老约翰。' },
    { say: 'spirit', expr: 'relief', text: '去吧。山会记得你。' },
    { hide: 'evil', effect: 'dissolve' },
    { hide: 'spirit', effect: 'dissolve' },
    { text: '恢复原形的狍鸮在祭坛上空盘旋一圈，飞进了远山的云里。' },
    { ending: 'true' }
  ],

  /* ---------- 失败结局 · 灵息尽散 ---------- */
  boss_lose: [
    { objective: null },
    { bgm: 'bgm_end_fall' },
    { text: '最后一点灵息从指间散去，剑落在祭坛的石面上。' },
    { text: '狍鸮的啼声越过山岭。血红的雾跟在它身后，朝云溪村的方向流去。' },
    { say: 'spirit', expr: 'sorrow', text: '……对不起。' },
    { ending: 'fall' }
  ]
};

/* 结局画面（剧情演完后显示） */
window.GAME_ENDINGS = {
  true: {
    title: '真结局 · 山醒', bgm: 'bgm_end_true', bg: 'bg_altar',
    text: '裂隙合上了，祭坛上的金色山纹重新亮起。\n云溪村的钟声照常响起，老约翰在村口等到了一个风尘仆仆的年轻剑士。\n「山醒」——白莲与黑莲回到了山里，你回到了人间。'
  },
  fall: {
    title: '结局 · 灵息尽散', bgm: 'bgm_end_fall', bg: 'bg_altar_corrupt', keepSave: true,
    text: '你没能拦住它。\n血雾漫过山岭，云溪村的灯一盏一盏熄灭了。\n（可以读档，回到祭坛重新挑战。）'
  }
};
