(() => {
  const TOTAL = 20, MIN_SKILL = 1, MAX_SKILL = 10;
  const TAKEN = ['arthur', 'merlin', 'gandalf', 'lara'];
  const CLASS_MIN = { mage: ['magic', 5], warrior: ['strength', 5], rogue: ['agility', 5] };
  const SKILLS = ['strength', 'agility', 'magic', 'luck'];
  const FIELDS = ['name', 'cls', 'color', ...SKILLS];

  const form = document.getElementById('c-form');
  form.noValidate = true; 
  const el = id => document.getElementById('c-' + id);
  const num = id => Number(el(id).value);
  const total = () => SKILLS.reduce((sum, k) => sum + num(k), 0);
  const touched = new Set();

  function native(input) {
    const v = input.validity;
    if (v.valueMissing) return 'This field is required.';
    if (v.tooShort || v.tooLong) return 'Use ' + input.minLength + '–' + input.maxLength + ' characters.';
    if (v.rangeUnderflow || v.rangeOverflow || v.badInput || v.stepMismatch)
      return 'Enter a whole number from ' + MIN_SKILL + ' to ' + MAX_SKILL + '.';
    return '';
  }

  const rules = {
    name() {
      const e = native(el('name'));
      if (e) return e;
      const n = el('name').value.trim().toLowerCase();
      if (n.length < 3) return 'Use 3–16 characters.';
      if (TAKEN.includes(n)) return 'This name is already taken.';
      if (n === el('cls').value) return 'The name cannot be the same as the class.';
      return '';
    },
    cls() {
      if (native(el('cls'))) return 'Choose a class.';
      const cls = el('cls').value;
      const [skill, min] = CLASS_MIN[cls];
      return num(skill) < min ? 'A ' + cls + ' needs ' + skill + ' ' + min + ' or more.' : '';
    },
    color() { return native(el('color')) ? 'Choose a color.' : ''; },
  };
  for (const k of SKILLS) {
    rules[k] = () => {
      const e = native(el(k));
      if (e) return e;
      return total() !== TOTAL ? 'Points must total exactly ' + TOTAL + ' (now ' + total() + ').' : '';
    };
  }

  function show(f) {
    const msg = rules[f]();
    el('err-' + f).textContent = msg;
    el(f).setAttribute('aria-invalid', msg ? 'true' : 'false');
    return msg;
  }
  function clearErrors() {
    for (const f of FIELDS) { el('err-' + f).textContent = ''; el(f).removeAttribute('aria-invalid'); }
    el('summary').textContent = '';
    el('summary').className = 'msg';
  }
  const recheck = () => FIELDS.filter(f => touched.has(f)).forEach(show);

  function preview() {
    el('p-name').textContent = el('name').value.trim() || 'Unnamed hero';
    el('p-cls').textContent = el('cls').value || 'No class yet';
    el('preview').dataset.color = el('color').value;
    for (const k of SKILLS) el('p-' + k).textContent = el(k).value || '0';
    const left = TOTAL - total();
    el('left').textContent = left;
    el('left').className = left === 0 ? 'ok' : left < 0 ? 'over' : '';
  }

  form.addEventListener('focusout', e => {
    const f = e.target.id.replace('c-', '');
    if (FIELDS.includes(f)) { touched.add(f); recheck(); }
  });
  form.addEventListener('input', () => { preview(); recheck(); });

  form.addEventListener('submit', e => {
    e.preventDefault();
    FIELDS.forEach(f => touched.add(f));
    const bad = FIELDS.filter(f => show(f));
    const box = el('summary');
    if (bad.length) {
      box.textContent = bad.length + (bad.length === 1 ? ' error' : ' errors') + ' to fix before creating the character.';
      box.className = 'msg error';
      el(bad[0]).focus();
      return;
    }
    const card = document.createElement('article');
    card.className = 'card hero';
    card.dataset.color = el('color').value;
    const h = document.createElement('h4');
    h.textContent = el('name').value.trim();
    const p = document.createElement('p');
    p.textContent = el('cls').value + ' · ' + el('color').value;
    const ul = document.createElement('ul');
    for (const k of SKILLS) {
      const li = document.createElement('li');
      li.textContent = k + ' ' + num(k);
      ul.append(li);
    }
    card.append(h, p, ul);
    el('result').replaceChildren(card);
    TAKEN.push(el('name').value.trim().toLowerCase());
    form.reset();
  });

  form.addEventListener('reset', () => setTimeout(() => {
    touched.clear();
    const keepSummary = el('result').querySelector('.card');
    clearErrors();
    if (keepSummary) { el('summary').textContent = 'Character created!'; el('summary').className = 'msg success'; }
    preview();
  }, 0));

  preview();
})();