(() => {
  const WIP_LIMIT = 3; 
  const COLUMNS = [['todo', 'To do'], ['progress', 'In progress'], ['done', 'Done']];
  const KEYS = COLUMNS.map(c => c[0]);

  const tasks = [
    { id: 1, title: 'Sketch the logo', tag: 'design', priority: 2, urgent: false, status: 'todo' },
    { id: 2, title: 'Build the navbar', tag: 'code', priority: 3, urgent: true, status: 'progress' },
    { id: 3, title: 'Write the README', tag: 'docs', priority: 1, urgent: false, status: 'todo' },
    { id: 4, title: 'Pick a color palette', tag: 'design', priority: 3, urgent: false, status: 'done' },
    { id: 5, title: 'Validate the form', tag: 'code', priority: 5, urgent: true, status: 'todo' },
    { id: 6, title: 'Record a demo', tag: 'docs', priority: 2, urgent: false, status: 'todo' },
    { id: 7, title: 'Make the footer', tag: 'code', priority: 1, urgent: false, status: 'progress' },
    { id: 8, title: 'Design icons', tag: 'design', priority: 4, urgent: false, status: 'todo' },
    { id: 9, title: 'Test on mobile', tag: 'code', priority: 4, urgent: true, status: 'todo' },
    { id: 10, title: 'Write the report', tag: 'docs', priority: 5, urgent: true, status: 'progress' },
  ];

  const board = document.getElementById('k-board');
  const filter = document.getElementById('k-filter');
  const sortBox = document.getElementById('k-sort');
  const msg = document.getElementById('k-msg');
  let tag = 'all';

  function el(name, cls, text) {
    const e = document.createElement(name);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function say(text, kind) {
    msg.textContent = text;
    msg.className = 'msg ' + kind;
  }

  function countStatus(status) { 
    let n = 0;
    for (const t of tasks) {
      if (t.status === status) n++;
    }
    return n;
  }

  function render() {
    board.replaceChildren();
    let shown = 0;
    for (const [key, label] of COLUMNS) {
      const col = el('section', 'column');
      let cards = tasks.filter(t => t.status === key && (tag === 'all' || t.tag === tag));
      if (sortBox.checked) cards.sort((a, b) => b.priority - a.priority);
      shown += cards.length;
      const limit = key === 'progress' ? ' (' + countStatus(key) + '/' + WIP_LIMIT + ')' : ' (' + cards.length + ')';
      col.append(el('h3', null, label + limit));
      if (cards.length === 0) col.append(el('p', 'empty', 'No cards here.'));
      for (const t of cards) {
        const card = el('article', 'card' + (t.urgent ? ' urgent' : ''));
        card.append(el('strong', null, t.title));
        card.append(el('span', 'badge', t.tag + ' · P' + t.priority));
        const row = el('div', 'row');
        const i = KEYS.indexOf(t.status);
        for (const [dir, sign] of [[-1, '←'], [1, '→']]) {
          const b = el('button', 'small ghost', sign);
          b.type = 'button';
          b.dataset.id = t.id;
          b.dataset.dir = dir;
          b.disabled = i + dir < 0 || i + dir >= KEYS.length;
          b.setAttribute('aria-label', (dir < 0 ? 'Move back: ' : 'Move forward: ') + t.title);
          row.append(b);
        }
        card.append(row);
        col.append(card);
      }
      board.append(col);
    }
    const done = countStatus('done');
    const bar = document.getElementById('k-progress');
    bar.max = tasks.length;
    bar.value = done;
    document.getElementById('k-percent').textContent = Math.round(done / tasks.length * 100) + '%';
    if (shown === 0) say('Nothing found for the tag "' + tag + '".', 'error');
  }

  const tags = ['all'];
  for (const t of tasks) if (!tags.includes(t.tag)) tags.push(t.tag);
  for (const name of tags) filter.append(new Option(name, name));

  board.addEventListener('click', e => {
    const b = e.target.closest('button[data-id]');
    if (!b) return;
    const t = tasks.find(x => x.id === Number(b.dataset.id));
    const target = KEYS[KEYS.indexOf(t.status) + Number(b.dataset.dir)];
    if (target === 'progress' && countStatus('progress') >= WIP_LIMIT) {
      say('Blocked: "In progress" holds at most ' + WIP_LIMIT + ' cards. Finish one first.', 'error');
      return;
    }
    t.status = target;
    say('Moved "' + t.title + '" to ' + COLUMNS[KEYS.indexOf(target)][1] + '.', 'success');
    render();
  });

  filter.addEventListener('change', () => { tag = filter.value; say('Filter: ' + tag + '.', 'info'); render(); });
  sortBox.addEventListener('change', render);

  say('Move cards with the arrows.', 'info');
  render();
})();