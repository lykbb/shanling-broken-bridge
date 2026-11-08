/* 启动：加载素材 → 初始化各模块 → 标题画面 */
(function () {
  const G = window.Game;
  window.addEventListener('DOMContentLoaded', async () => {
    const bar = document.querySelector('#loading-bar'), label = document.querySelector('#loading-text');
    await G.assets.preload((n, total) => { bar.style.width = (n / total) * 100 + '%'; label.textContent = `加载素材 ${n} / ${total}`; });
    label.textContent = '加载音频…';
    await G.audio.preload();

    G.state.reset();
    G.stage.init();
    G.dialogue.init();
    G.ui.init();

    // 点击舞台空白处也能推进对话
    document.querySelector('#stage').addEventListener('click', () => { if (G.runner.busy) G.dialogue.advance(); });
    document.querySelector('#btn-new').onclick = () => G.ui.newGame();
    document.querySelector('#btn-continue').onclick = () => G.ui.continueGame('auto');
    document.querySelector('#btn-restart').onclick = () => { document.querySelector('#ending').classList.remove('show'); G.ui.ended = false; G.ui.newGame(); };
    document.querySelector('#btn-totitle').onclick = () => G.ui.showTitle();

    document.querySelector('#loading').classList.add('hide');
    G.ui.showTitle();
    if (G.assets.missing.length) console.info(`[assets] ${G.assets.missing.length} 张图片使用占位图：`, G.assets.missing);
  });
})();
