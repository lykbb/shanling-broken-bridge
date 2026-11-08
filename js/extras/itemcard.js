/* 拿到物品时弹出一张介绍卡（图标 + 名字 + 介绍），点一下或 4 秒后自动收起。只监听 inventory 事件，不改引擎。 */
(function () {
  const G = window.Game;
  function install() {
    if (!G.bus || !G.ui) return setTimeout(install, 30);
    const stage = document.querySelector('#stage');
    const card = document.createElement('div'); card.id = 'itemcard';
    stage.appendChild(card);
    let t = null;
    const hide = () => { card.classList.remove('show'); clearTimeout(t); };
    card.addEventListener('click', (e) => { e.stopPropagation(); hide(); });
    G.bus.on('inventory', (e) => {
      if (!e || !e.added) return;
      const it = (window.GAME_ITEMS || {})[e.added]; if (!it) return;
      card.innerHTML = `<img src="${G.assets.url(it.icon)}" alt=""><div><small>获得物品</small><h4>${it.name}</h4><p>${it.desc || ''}</p><em>点击收起 · 背包里可以再次查看</em></div>`;
      card.classList.remove('show'); void card.offsetWidth; card.classList.add('show');
      clearTimeout(t); t = setTimeout(hide, 4000);
    });
  }
  install();
})();
