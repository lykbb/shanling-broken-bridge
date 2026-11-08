/* 过场 CG：新游戏前播开场视频，结局画面前播对应结局视频。可点「跳过」或按 Esc 跳过。
 * 只包装 G.ui.newGame / G.ui.showEnding，不改引擎。 */
(function () {
  const G = window.Game;
  const CFG = window.GAME_CUTSCENES || {};

  function play(src) {
    return new Promise((resolve) => {
      if (!src || /jsdom/i.test(navigator.userAgent)) return resolve();   // 自动测试环境不播视频
      const stage = document.querySelector('#stage');
      const box = document.createElement('div'); box.id = 'cutscene';
      box.innerHTML = '<video playsinline preload="auto"></video><button class="cs-skip">跳过 ▶▶</button><button class="cs-sound">点击开启声音 🔊</button>';
      stage.appendChild(box);
      const v = box.querySelector('video'), skip = box.querySelector('.cs-skip'), snd = box.querySelector('.cs-sound');
      const prevModal = G.ui._modal; G.ui._modal = 'cutscene';
      const prevBgm = G.audio.currentId; G.audio.bgm(null);
      let done = false;
      const finish = () => {
        if (done) return; done = true;
        document.removeEventListener('keydown', onKey, true);
        v.pause(); box.classList.add('out');
        if (G.ui._modal === 'cutscene') G.ui._modal = prevModal || null;
        setTimeout(() => { box.remove(); resolve(); }, 500);
      };
      const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); finish(); } else if (e.code === 'Space') { e.preventDefault(); e.stopPropagation(); } };
      document.addEventListener('keydown', onKey, true);
      skip.onclick = (e) => { e.stopPropagation(); finish(); };
      snd.onclick = (e) => { e.stopPropagation(); v.muted = false; snd.style.display = 'none'; };
      box.addEventListener('click', (e) => e.stopPropagation());
      v.onended = finish;
      v.onerror = () => { console.warn('[cutscene] 视频无法播放，已跳过:', src); finish(); };
      v.volume = Math.min(1, Math.max(0, G.settings.bgm == null ? 1 : G.settings.bgm));
      v.src = src;
      requestAnimationFrame(() => box.classList.add('show'));
      const p = v.play();
      if (!p) finish();
      else if (p.catch) p.catch(() => { v.muted = true; snd.style.display = 'block'; v.play().catch(finish); });
      setTimeout(finish, 60000);   // 保险：最长 60 秒
      void prevBgm;
    });
  }
  G.cutscene = { play };

  function install() {
    if (!G.ui || !G.ui.newGame || !G.ui.showEnding) return setTimeout(install, 30);
    const origNew = G.ui.newGame.bind(G.ui);
    G.ui.newGame = async function () {
      G.audio.unlock();
      document.querySelector('#title').classList.remove('show');
      await play(CFG.opening);
      return origNew();
    };
    const origEnd = G.ui.showEnding.bind(G.ui);
    G.ui.showEnding = async function (id) {
      await play((CFG.endings || {})[id]);
      return origEnd(id);
    };
  }
  install();
})();
