/* 素材加载器：读取 data/assets.js，真实文件加载失败时自动生成占位图（SVG，不需要任何外部服务）。 */
(function () {
  const G = window.Game;

  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function svgURL(svg) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }

  const MOTIFS = {
    village: '<g fill="#00000055"><rect x="260" y="600" width="300" height="240"/><polygon points="230,600 410,470 590,600"/><rect x="1260" y="630" width="320" height="210"/><polygon points="1230,630 1420,490 1610,630"/><rect x="760" y="700" width="200" height="140"/></g><ellipse cx="840" cy="760" rx="120" ry="40" fill="#00000044"/>',
    bridge: '<rect x="0" y="780" width="1920" height="300" fill="#00000055"/><g stroke="#000000aa" stroke-width="12" fill="none"><path d="M120 560 Q 480 700 860 620"/><path d="M1080 620 Q 1460 700 1800 560"/></g><rect x="300" y="520" width="140" height="300" fill="#00000066"/>',
    forest: '<g fill="#00000066"><polygon points="120,900 300,200 480,900"/><polygon points="420,900 620,120 820,900"/><polygon points="1180,900 1380,160 1580,900"/><polygon points="1500,900 1720,240 1920,900"/></g><rect x="880" y="520" width="120" height="320" fill="#00000077"/>',
    gate: '<g fill="#00000055"><rect x="820" y="380" width="60" height="460"/><rect x="1040" y="380" width="60" height="460"/><rect x="780" y="350" width="360" height="50"/><rect x="200" y="560" width="300" height="260"/><polygon points="170,560 350,430 530,560"/><rect x="1440" y="600" width="300" height="230"/><polygon points="1410,600 1590,470 1770,600"/></g><path d="M900 1080 L940 840 L980 840 L1020 1080Z" fill="#ffffff22"/>',
    creek: '<rect x="0" y="640" width="1920" height="260" fill="#9fd8ff44"/><path d="M0 700 Q 480 660 960 700 T 1920 690" stroke="#ffffff55" stroke-width="6" fill="none"/><rect x="0" y="880" width="1920" height="200" fill="#4f8a3a88"/><g fill="#00000044"><polygon points="1500,640 1640,240 1780,640"/><polygon points="1660,640 1800,300 1920,640"/></g>',
    summit: '<path d="M0 820 L1920 820 L1920 1080 L0 1080Z" fill="#00000066"/><ellipse cx="960" cy="850" rx="520" ry="90" fill="#00000077"/><path d="M700 900 L820 860 L900 920 L1000 870 L1120 930 L1240 880" stroke="#8a1040" stroke-width="10" fill="none"/>',
    altar: '<circle cx="960" cy="420" r="200" fill="#ffffff18"/><rect x="740" y="660" width="440" height="90" fill="#00000077"/><rect x="800" y="580" width="320" height="90" fill="#00000066"/><rect x="600" y="740" width="720" height="60" fill="#00000055"/>'
  };

  const placeholder = {
    bg(p, id, src) {
      const label = p.label === undefined ? id : p.label;
      return svgURL(`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.top || '#335'}"/><stop offset=".62" stop-color="${p.mid || '#556'}"/><stop offset="1" stop-color="${p.bottom || '#112'}"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#g)"/><path d="M0 760 L240 560 L520 700 L860 480 L1200 690 L1500 520 L1920 720 L1920 1080 L0 1080Z" fill="#00000033"/>${MOTIFS[p.motif] || ''}${label ? `<text x="960" y="130" text-anchor="middle" font-family="sans-serif" font-size="60" fill="#ffffffaa">${esc(label)}</text><text x="960" y="186" text-anchor="middle" font-family="monospace" font-size="24" fill="#ffffff77">占位背景 · 替换为 ${esc(src || '')}</text>` : ''}</svg>`);
    },
    char(p, id, src) {
      const c = p.color || '#888';
      const aura = p.aura ? `<ellipse cx="300" cy="560" rx="290" ry="540" fill="${p.aura}" opacity=".22"/>` : '';
      const expr = id.split('_').pop();
      return svgURL(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="1100" viewBox="0 0 600 1100"><defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></linearGradient></defs>${aura}<ellipse cx="300" cy="1086" rx="190" ry="14" fill="#0005"/><circle cx="300" cy="230" r="110" fill="url(#c)"/><path d="M140 1090 L170 520 Q 180 380 300 370 Q 420 380 430 520 L460 1090 Z" fill="url(#c)"/><rect x="90" y="570" width="420" height="120" rx="18" fill="#000a"/><text x="300" y="625" text-anchor="middle" font-family="sans-serif" font-size="40" fill="#fff">${esc(p.label || id)}</text><text x="300" y="668" text-anchor="middle" font-family="monospace" font-size="22" fill="#fffa">${esc(expr)} · 占位立绘</text></svg>`);
    },
    icon(p) {
      return svgURL(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect x="6" y="6" width="116" height="116" rx="22" fill="${p.color || '#888'}"/><text x="64" y="84" text-anchor="middle" font-family="sans-serif" font-size="56" fill="#222">${esc(p.label || '?')}</text></svg>`);
    }
  };

  G.assets = {
    urls: {},       // id -> 最终可用的 url（真实或占位）
    missing: [],    // 未找到真实文件的 id，用于调试面板
    preload(onProgress) {
      const defs = (window.GAME_ASSETS && window.GAME_ASSETS.images) || {};
      const ids = Object.keys(defs);
      let done = 0;
      return Promise.all(ids.map((id) => new Promise((resolve) => {
        const def = defs[id];
        const finish = (url, real) => {
          this.urls[id] = url;
          if (!real) this.missing.push(id);
          onProgress && onProgress(++done, ids.length);
          resolve();
        };
        const ph = () => {
          const p = def.placeholder || { kind: 'bg' };
          finish((placeholder[p.kind] || placeholder.bg)(p, id, def.src), false);
        };
        if (!def.src) return ph();
        const img = new Image();
        img.onload = () => finish(def.src, true);
        img.onerror = ph;
        img.src = def.src;
      })));
    },
    url(id) {
      if (this.urls[id]) return this.urls[id];
      console.warn('[assets] 未登记的图片 id:', id);
      return placeholder.bg({ label: '缺失:' + id }, id, '');
    }
  };
})();
