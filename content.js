(() => {
  const list = document.querySelector('ul.cardContainer');
  if (!list || document.querySelector('.csaSorter')) return;

  const cards = [...list.querySelectorAll(':scope > li.materialCard')];
  const num = (card, cls) => {
    const el = card.querySelector(`.materialCard__price${cls} .materialCard__priceNum`);
    return el ? Number(el.textContent.replace(/[^\d]/g, '')) : null;
  };
  const info = new Map(cards.map((c, i) => [c, {
    i,
    clippy: num(c, 'Clippy'),
    gold: num(c, 'Gold'),
    free: !!c.querySelector('.materialCard__priceFree'),
  }]));

  const state = { tab: 'all', sort: 'default' };
  const TABS = [['all', 'すべて'], ['clippy', 'CLIPPY'], ['gold', 'GOLD'], ['free', '無料']];
  const SORTS = [['default', '標準'], ['asc', '安い順'], ['desc', '高い順']];

  // 「すべて」タブの並べ替えは 無料=0、GOLD があれば GOLD、なければ CLIPPY の値で比べる
  const price = (d) => {
    if (state.tab === 'clippy') return d.clippy;
    if (state.tab === 'gold') return d.gold;
    return d.free ? 0 : (d.gold ?? d.clippy);
  };
  const show = (d) => state.tab === 'all' || (state.tab === 'free' ? d.free : d[state.tab] !== null);

  const bar = document.createElement('div');
  bar.className = 'csaSorter';
  const group = (items, key) => {
    const g = document.createElement('div');
    g.className = 'csaGroup';
    g.setAttribute('role', 'group');
    for (const [v, label] of items) {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset[key] = v;
      b.textContent = label;
      b.addEventListener('click', () => { state[key] = v; render(); });
      g.append(b);
    }
    return g;
  };
  const count = document.createElement('span');
  count.className = 'csaCount';
  bar.append(group(TABS, 'tab'), group(SORTS, 'sort'), count);
  list.before(bar);

  function render() {
    const sorted = [...cards].sort((a, b) => {
      const A = info.get(a), B = info.get(b);
      if (state.sort === 'default') return A.i - B.i;
      const pa = price(A), pb = price(B);
      if (pa === pb) return A.i - B.i;
      if (pa === null) return 1;
      if (pb === null) return -1;
      return state.sort === 'asc' ? pa - pb : pb - pa;
    });
    let n = 0;
    for (const c of sorted) {
      const v = show(info.get(c));
      c.style.display = v ? '' : 'none';
      if (v) n++;
      list.append(c);
    }
    bar.querySelectorAll('button').forEach((b) => {
      const on = b.dataset.tab ? b.dataset.tab === state.tab : b.dataset.sort === state.sort;
      b.classList.toggle('isActive', on);
      b.setAttribute('aria-pressed', on);
    });
    count.textContent = `${n}件`;
  }
  render();
})();
