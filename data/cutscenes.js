/* 过场 CG 视频配置（js/extras/cutscene.js 读取）。换视频：同名覆盖 assets/video/ 下的文件即可。 */
window.GAME_CUTSCENES = {
  opening: 'assets/video/opening.mp4',          // 开始新游戏时，进入云溪村之前播放
  endings: {
    true: 'assets/video/end_true.mp4',          // 结局一 · 山河归晴
    fall: 'assets/video/end_fall.mp4'           // 结局二 · 山河永夜
  }
};
