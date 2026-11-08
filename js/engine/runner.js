/* 剧情解释器：执行 data/story.js 中的指令。剧情内容和引擎逻辑完全分离。 */
(function () {
  const G = window.Game;

  G.runner = {
    busy: false, queue: [],

    run(nodeId) {
      if (!window.GAME_STORY[nodeId]) { console.error('[runner] 剧情节点不存在:', nodeId); return; }
      this.queue.push(nodeId);
      if (!this.busy) this._loop();
    },

    async _loop() {
      this.busy = true; G.bus.emit('busy', true);
      try {
        while (this.queue.length) {
          const ended = await this._exec(this.queue.shift());
          if (ended) { this.queue = []; break; }
        }
      } catch (err) { console.error('[runner] 执行出错', err); }
      G.dialogue.hide();
      this.busy = false; G.bus.emit('busy', false);
      if (!G.ui.ended) G.stage.sync();
    },

    async _exec(startId) {
      const story = window.GAME_STORY;
      let node = story[startId], i = 0, guard = 0;
      while (node && i < node.length) {
        if (++guard > 5000) { console.error('[runner] 疑似死循环，已中断'); break; }
        const c = node[i++];
        if (c.when !== undefined && !G.cond(c.when)) continue;
        const jump = (id) => { if (!story[id]) { console.error('[runner] 跳转目标不存在:', id); node = null; return; } node = story[id]; i = 0; };

        if (c.say !== undefined) {
          if (c.expr && G.stage.chars[c.say]) G.stage.face(c.say, c.expr);
          await G.dialogue.say(c.say, c.text, c.expr);
        } else if (c.text !== undefined) {
          await G.dialogue.say(null, c.text);
        } else if (c.choice) {
          const opts = c.choice.filter((o) => G.cond(o.if));
          if (!opts.length) continue;
          const k = await G.dialogue.choose(opts);
          const o = opts[k];
          if (o.do) G.applyEffects(o.do);
          if (o.goto) jump(o.goto);
        } else if (c.branch !== undefined) {
          const target = G.cond(c.branch) ? c.then : c.else;
          if (target) jump(target);
        } else if (c.goto) {
          jump(c.goto);
        } else if (c.do) {
          G.applyEffects(c.do);
        } else if (c.show) {
          G.stage.show(c.show, c);
        } else if (c.hide) {
          G.stage.hide(c.hide, c.effect);
          if (c.effect === 'dissolve') await G.sleep(2200);
        } else if (c.charClass) {
          G.stage.charClass(c.charClass, c.add, c.remove);
        } else if (c.cg !== undefined) {
          G.stage.cg(c.cg, c.style);
          if (c.cg) await G.sleep(c.hold || 600);
        } else if (c.minigame) {
          G.dialogue.hide();
          const win = await G.minigames.play(c.minigame, c);
          G.stage.sync();
          const target = win ? c.win : c.lose;
          if (target) jump(target);
        } else if (c.objective !== undefined) {
          G.ui.objective(c.objective);
        } else if (c.props) {
          G.stage.renderProps(); G.stage.renderHotspots();
        } else if (c.face) {
          G.stage.face(c.face, c.expr);
        } else if (c.scene) {
          G.dialogue.hide();
          await G.stage.goto(c.scene);
        } else if (c.bgm !== undefined) {
          G.audio.bgm(c.bgm);
        } else if (c.sfx) {
          G.audio.sfx(c.sfx);
        } else if (c.shake) {
          G.stage.shake(); await G.sleep(500);
        } else if (c.flash) {
          G.stage.flash(c.flash); await G.sleep(300);
        } else if (c.wait) {
          await G.sleep(c.wait);
        } else if (c.ending) {
          G.dialogue.hide();
          await G.ui.showEnding(c.ending);
          return true;
        } else if (c.end) {
          break;
        } else {
          console.warn('[runner] 未知指令', c);
        }
      }
      return false;
    }
  };
})();
