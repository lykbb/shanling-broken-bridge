# 断桥之森 · 山灵 —— 2.5D 点击式剧情游戏（v0.3，依据剧本 v0.2）

纯 HTML/CSS/JS，无需安装、无需构建、无任何付费服务。
**运行：解压后双击 `index.html`**（Chrome / Edge / Safari 均可）。
网址后加 `?debug=1` 打开调试模式（场景跳转、点击显示坐标、查看缺失素材）。

---

## 一、目录结构

```
game/
├─ index.html                 入口
├─ css/style.css              全部界面样式（对话框、按钮、动画、特效）
├─ data/                      ← 内容层：替换剧本/素材只改这里
│  ├─ assets.js               素材清单（图片 + 音乐 + 音效的路径）
│  ├─ characters.js           角色（名字、名牌颜色、表情→立绘）+ 物品表
│  ├─ scenes.js               场景（背景、BGM、氛围特效、常驻角色、可点击热点）+ 开局配置
│  └─ story.js                剧情脚本（对话、选项、条件、效果）+ 结局
├─ js/engine/                 ← 引擎层：通用逻辑，不含任何剧情内容
│  ├─ core.js                 事件总线、游戏状态、条件判断、存档
│  ├─ assets.js               图片加载 + 缺失时自动生成占位图
│  ├─ audio.js                BGM 交叉淡入淡出、音效；缺失时合成占位音乐
│  ├─ stage.js                16:9 舞台缩放、背景、立绘、热点、视差、演出
│  ├─ dialogue.js             对话框、打字机、选项、对话记录
│  ├─ runner.js               剧情脚本解释器
│  ├─ ui.js                   标题、HUD、背包、地图、存读档、设置、结局
│  └─ main.js                 启动
├─ assets/                    ← 你的素材放这里
│  ├─ backgrounds/            village.jpg（云溪村） bridge.jpg（峡谷断桥） forest.jpg（古林雾道） altar.jpg（山谷祭坛）
│  ├─ characters/hero/        阿萨尔：full.png + portraits/normal smile grin bored surprised sleep.jpg
│  ├─ characters/john/        老约翰：full.png + portraits/smile laugh calm recall think.jpg
│  ├─ characters/good/        善灵·白莲：full.png + portraits/smile calm surprised firm.jpg
│  ├─ characters/evil/        恶灵·黑莲：full.png + portraits/scorn calm angry mock sorrow.jpg
│  ├─ characters/spirit/      山灵本体：full.png + portraits/calm sorrow gaze relief angry.jpg
│  ├─ items/                  stone.png amulet.png tablet.png（物品图标，可选）
│  ├─ ui/                     title.jpg（标题背景，可选）
│  └─ audio/bgm|sfx/          见下方「音乐与音效表」
└─ tools/validate.js          剧情完整性检查：node tools/validate.js
```

## 二、导入素材（三种情况）

**1. 直接替换（零改代码）**：按上面的文件名把图片放进对应文件夹，刷新即可。没放的会继续显示占位图。

**2. 文件名不同**：打开 `data/assets.js`，把对应条目的 `src` 改成你的文件路径。
```js
bg_village: { src: 'assets/backgrounds/我的村庄.png', ... }
```

**3. 新增表情 / 新角色**
- `data/assets.js` 加一行：`john_angry: { src: 'assets/characters/john/angry.png', placeholder: { kind: 'char', label: '老约翰' } }`
- `data/characters.js` 里 john 的 `sprites` 加：`angry: 'john_angry'`
- 剧本中使用：`{ say: 'john', expr: 'angry', text: '……' }`

**素材规格建议**
| 类型 | 规格 |
|---|---|
| 背景 | 1920×1080（16:9），jpg/webp，单张 < 1MB |
| 立绘 | 透明 PNG/WebP，高 1000–1400px，脚底贴图片底边，留少量透明边 |
| 物品图标 | 正方形透明 PNG，256×256 |
| BGM | mp3/ogg，可无缝循环，128–192kbps |
| 音效 | mp3/ogg，短促，开头无静音 |

立绘显示高度在 `characters.js` 的 `height` 调；站位在 `scenes.js` 的 `x / y` 调。

## 三、写剧情（data/story.js）

```js
my_node: [
  { show: 'john', at: 'right', expr: 'normal' },
  { say: 'john', text: '你好，{hero}。' },
  { text: '旁白文字' },
  { choice: [
    { text: '选项A', do: [{ set: 'chose_a' }], goto: 'node_a' },
    { text: '只有拿到护符才出现', if: 'item:amulet_half', goto: 'node_b' }
  ]},
  { say: 'john', when: 'flag:chose_a', text: '只有满足条件才说这句' },
  { sfx: 'sfx_item' }, { do: [{ give: 'lantern' }] },
  { bgm: 'bgm_altar' }, { shake: true }, { flash: '#fff' },
  { ending: 'good' }
]
```
条件：`'flag:x'` `'!flag:x'` `'item:x'` `'visited:bridge'` `'count:clue_>=3'`，数组=全部满足，`{ any: [...] }`=任一满足。
改完运行 `node tools/validate.js` 检查跳转、角色、表情、素材 id 是否写错。

## 四、场景热点（data/scenes.js）

`rect: [x, y, 宽, 高]` 以 1920×1080 为坐标。用 `?debug=1` 打开游戏，点击画面任意位置即可显示坐标，热点会显示绿色虚线框。
游戏里按 **H** 可高亮所有可交互点。

## 当前素材状态

- 立绘与对话头像：**临时**从你的 5 张设定图里抠出（full.png 是三视图正面放大，清晰度有限；头像来自「表情参考」格）。正式透明立绘到了，直接覆盖同名文件。
- 场景背景（v0.4）：断桥、祭坛用的是用户给的完整大图（1672×941 放大到 1920×1080）；云溪村、古林是从概念合集图里裁出来放大的临时图，比较糊，等完整大图后同名覆盖 assets/backgrounds/village.jpg、forest.jpg 即可。标题背景暂用断桥图。热点和站位已按这四张图重新摆过，新图构图不同时需在 data/scenes.js 里微调（?debug=1 点画面看坐标）。断桥上的空石阶/光路、镇纹石提示微光、古林白雾、祭坛点亮光晕是 CSS 道具。

## 音乐与音效表（文件放进 assets/audio/，同名即生效）

| 文件 | 用在哪里 | 建议气质 |
|---|---|---|
| bgm/title.mp3 | 标题画面 | 空灵、钟铃，留白多 |
| bgm/village.mp3 | 序章 云溪村 | 温暖晴朗，木管/拨弦 |
| bgm/bridge.mp3 | 第一关 断桥 | 开阔、风声水雾，带一点悬念 |
| bgm/forest.mp3 | 第二关 古林（调查时） | 幽暗、低频铺底 |
| bgm/evil.mp3 | 恶灵登场 / 对峙 | 不协和弦、心跳感 |
| bgm/altar.mp3 | 祭坛（非限时时） | 庄严、压抑 |
| bgm/seal.mp3 | 60 秒镇灵 | 紧张、节奏推进 |
| bgm/truth.mp3 | 善灵消散 + 本体揭露 | 悲悯、弦乐 |
| bgm/end_bear.mp3 / end_leave.mp3 / end_split.mp3 | 三个结局 | 释然 / 冷寂 / 余韵留白 |
| sfx/click item step reveal thunder locked water hit bell petal voice | 点击、获得、脚步、点亮、震动、无效、水声、斩根、金铃、花瓣、召唤声 | 短促、开头无静音 |

免费可商用来源可选：Pixabay Music、Freesound（注意 CC0/CC-BY 授权）、爱给网免费区。

## 五、操作

鼠标点击调查/推进 · 小游戏：按顺序按住符位，黑根缠住时先点击驱散 · 空格/回车 推进对话 · 1–9 选择 · H 提示 · I 背包 · M 地图 · Esc 关闭
自动存档（每次切换场景）+ 3 个手动存档位，已达成结局会记录在标题画面。

## 六、部署到网页演示（免费）

整个文件夹是纯静态网页，可直接拖到 Netlify Drop / GitHub Pages / Vercel 静态托管，得到一个可分享的网址。

## 世界地图模块（v0.5）

按「地图」按钮或 M 键打开，Esc 或右下角「返回场景」关闭。剧情对话进行中不能打开。

文件：
- `data/worldmap.js`：地图配置（地点名、章节、介绍、图片路径、人物关联、解锁/完成条件、热点百分比坐标、面板位置）。改内容只改这里。
- `js/worldmap/worldmap.js`：地图模块（主视图、地点热点、详情面板、图片预览、人物卡）。只包装了现有的 `Game.ui.open('map')`，没有改 ui.js。
- `css/worldmap.css`：地图样式。
- `tools/worldmap.test.js`：自动测试（需 `npm i jsdom`，然后 `node tools/worldmap.test.js`）。

状态完全来自现有存档：
| 地点 | 解锁条件 | 完成条件 |
|---|---|---|
| 云溪村 | 开局 | 和老约翰谈完（flag:met_john） |
| 峡谷断桥 | flag:met_john | 过桥（flag:crossed） |
| 古林雾道 | flag:crossed | 雾散（flag:fog_open） |
| 山谷祭坛 | flag:fog_open | 镇灵完成（flag:seal_done） |
去过但没完成的地点显示「探索中」。选中的地点存在存档里（mapSel），下次打开地图会恢复。

坐标：`area`（可点区域）和 `pin`（名牌）都是相对地图图片的百分比 [左, 上, 宽, 高]。换地图图片后只需改这几组数字。

素材：
- `assets/ui/worldmap.jpg`：世界地图（用户提供的地图图，已放大到 1920×1080）。原图里的地点名牌、右侧信息面板、底部章节栏、右上角计数都被 HTML 动态层盖住了；左侧菜单保留原图，只加了点击（收集物 → 背包，设定资料 → 设置，其余提示制作中）。
- `assets/map/*.jpg`：详情面板的场景大图与缩略图，从用户提供的场景设定合集里裁出（960×540）。缺图时面板会显示占位框和缺失路径。

## v0.6 · 终章 · 狍鸮（最终战）

- 流程：第三关真相揭露后直接进入狍鸮战。打赢 = 真结局「山醒」，打输 = 失败结局「灵息尽散」。原承山 / 弃山 / 分山三结局已删除，共 2 个结局。
- 玩法：回合制。光标在时间条上来回扫，到金色区间时点「出剑 / 格挡」按钮或按空格。我方回合出剑，敌方回合格挡；第 3 阶段起有红色陷阱区。阿萨尔 3 点灵息，归零即失败。共 5 个阶段，终章需连续命中 3 次。右下角可开「慢速模式」。
- 前提道具：古林里选「B｜举起木纹护符，先问清楚」，之后再点恶灵说话，可得「黑莲花瓣」。到祭坛与完整白莲护符合成「双莲护符」。没有双莲护符时，终章没有金色区间，必败。
- 失败后：结局画面有「读档」按钮，回到战前的祭坛，点山灵本体重新开战。
- 所有数值、台词：data/boss.js。代码：js/boss/boss.js、css/boss.css。测试：`node tools/boss.test.js win|nopress|noitem`（需要 jsdom）。
- 素材：战场 assets/backgrounds/altar_corrupt.jpg（BG_06）；狍鸮 assets/boss/paoxiao.png（设定集主图临时裁切，正式透明立绘同名覆盖）；形态卡 assets/boss/phase1~3.jpg；UI 来自第一批 UI_17 / FX_01 / FX_03 / FX_04。
- 待补音频（目前为占位合成音）：bgm/boss.mp3、bgm/end_true.mp3、bgm/end_fall.mp3、sfx/slash.mp3、sfx/block.mp3、sfx/screech.mp3。黑莲花瓣图标 assets/items/petal.png 待补。
- 云溪村背景已换为 BG_01 村口，热点与站位已按新图调整。
