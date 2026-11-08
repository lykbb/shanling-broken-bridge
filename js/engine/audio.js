/* 音频：BGM 交叉淡入淡出 + 音效。真实音频不存在时，用 WebAudio 合成占位和弦 / 提示音（本地运行，无任何付费服务）。 */
(function () {
  const G = window.Game;
  const defs = () => (window.GAME_ASSETS && window.GAME_ASSETS.audio) || {};

  let ctx = null;
  function ac() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  const realOK = {}; // id -> true/false（真实文件是否可用）

  function probe(id) {
    const d = defs()[id];
    return new Promise((resolve) => {
      if (!d || !d.src) { realOK[id] = false; return resolve(); }
      const a = new Audio();
      let settled = false;
      const done = (ok) => { if (!settled) { settled = true; realOK[id] = ok; resolve(); } };
      a.addEventListener('canplaythrough', () => done(true), { once: true });
      a.addEventListener('error', () => done(false), { once: true });
      setTimeout(() => done(false), 4000);
      a.preload = 'auto';
      a.src = d.src;
    });
  }

  /* ---- 占位 BGM：缓慢起伏的和弦垫 ---- */
  function synthPad(notes) {
    const c = ac(); if (!c) return null;
    const out = c.createGain(); out.gain.value = 0;
    const filter = c.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 900;
    filter.connect(out); out.connect(c.destination);
    const oscs = [];
    notes.forEach((f, i) => {
      [0, 4].forEach((det) => {
        const o = c.createOscillator(); o.type = i % 2 ? 'triangle' : 'sine';
        o.frequency.value = f; o.detune.value = det;
        const g = c.createGain(); g.gain.value = 0.05 / notes.length;
        const lfo = c.createOscillator(); lfo.frequency.value = 0.07 + i * 0.03;
        const lg = c.createGain(); lg.gain.value = 0.03 / notes.length;
        lfo.connect(lg); lg.connect(g.gain);
        o.connect(g); g.connect(filter); o.start(); lfo.start();
        oscs.push(o, lfo);
      });
    });
    return {
      setVolume(v, t = 1.5) { out.gain.cancelScheduledValues(c.currentTime); out.gain.linearRampToValueAtTime(v, c.currentTime + t); },
      stop(t = 1.5) { this.setVolume(0, t); setTimeout(() => oscs.forEach((o) => { try { o.stop(); } catch (e) {} }), t * 1000 + 100); }
    };
  }

  function wrapAudio(d) {
    const a = new Audio(d.src); a.loop = d.loop !== false; a.volume = 0;
    let timer = null;
    return {
      play() { a.play().catch(() => {}); },
      setVolume(v, t = 1.5) {
        clearInterval(timer);
        const from = a.volume, steps = Math.max(1, Math.round(t * 30)); let i = 0;
        timer = setInterval(() => { i++; a.volume = Math.max(0, Math.min(1, from + (v - from) * (i / steps))); if (i >= steps) clearInterval(timer); }, 1000 / 30);
      },
      stop(t = 1.5) { this.setVolume(0, t); setTimeout(() => a.pause(), t * 1000 + 100); }
    };
  }

  G.audio = {
    current: null, currentId: null,
    preload() { return Promise.all(Object.keys(defs()).map(probe)); },
    unlock() { ac(); },
    bgm(id) {
      if (id === this.currentId) return;
      if (this.current) { this.current.stop(); this.current = null; }
      this.currentId = id || null;
      if (!id) return;
      const d = defs()[id];
      if (!d) return console.warn('[audio] 未登记的音乐 id:', id);
      let track = null;
      if (realOK[id]) { track = wrapAudio(d); track.play(); }
      else if (d.placeholder && d.placeholder.notes) track = synthPad(d.placeholder.notes);
      if (!track) return;
      track.baseVol = d.volume === undefined ? 1 : d.volume;
      track.setVolume(track.baseVol * G.settings.bgm);
      this.current = track;
    },
    refreshVolume() { if (this.current) this.current.setVolume(this.current.baseVol * G.settings.bgm, 0.2); },
    sfx(id) {
      const d = defs()[id];
      if (!d || G.settings.sfx <= 0) return;
      const vol = (d.volume === undefined ? 1 : d.volume) * G.settings.sfx;
      if (realOK[id]) { const a = new Audio(d.src); a.volume = vol; a.play().catch(() => {}); return; }
      const tone = d.placeholder && d.placeholder.tone; const c = ac();
      if (!tone || !c) return;
      let t = c.currentTime;
      for (let i = 0; i < tone.length; i += 2) {
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.value = tone[i];
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.2 * vol, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + tone[i + 1]);
        o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + tone[i + 1] + 0.05);
        t += tone[i + 1] * 0.8;
      }
    },
    missing() { return Object.keys(realOK).filter((k) => !realOK[k]); }
  };
})();
