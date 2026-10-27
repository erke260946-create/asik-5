(() => {
  const MAX_LIVES = 3;
  const PRICE_MIN = 5;
  const PRICE_MAX = 100;
  const WIN_STREAK = 10;
  const ITEMS = ['Headphones', 'Backpack', 'Keyboard', 'Desk lamp', 'Notebook', 'Sneakers', 'Watch', 'Mug'];

  const $ = id => document.getElementById(id);
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const newItem = () => ({ name: ITEMS[randInt(0, ITEMS.length - 1)], price: randInt(PRICE_MIN, PRICE_MAX) });

  let lives, streak, current, state; 
  let best = 0;

  function say(text, kind) {
    const m = $('g-msg');
    m.textContent = text;
    m.className = 'msg ' + kind;
  }

  function render() {
    $('g-lives').textContent = '♥'.repeat(lives) + '♡'.repeat(MAX_LIVES - lives);
    $('g-streak').textContent = streak + ' / ' + WIN_STREAK;
    $('g-best').textContent = best;
    $('g-current').textContent = current.name + ': $' + current.price;
    const over = state !== 'play';
    $('g-higher').disabled = over;
    $('g-lower').disabled = over;
    $('g-box').dataset.state = state;
  }

  function start() {
    lives = MAX_LIVES;
    streak = 0;
    state = 'play';
    current = newItem();
    say('Will the next price be higher or lower?', 'info');
    render();
  }

  function guess(choice) {
    if (state !== 'play' || (choice !== 'higher' && choice !== 'lower')) {
      say('The round is over. Press Restart to play again.', 'error');
      return;
    }
    const next = newItem();
    const right = (choice === 'higher' && next.price >= current.price) ||
                  (choice === 'lower' && next.price <= current.price);
    const info = next.name + ' costs $' + next.price + '. ';
    if (right) {
      streak++;
      best = Math.max(best, streak);
      say(info + 'Right!', 'success');
    } else {
      lives--;
      streak = 0;
      say(info + 'Wrong, you lose a life.', 'error');
    }
    if (streak === WIN_STREAK) {
      state = 'win';
      say(info + 'You win with a streak of ' + WIN_STREAK + '!', 'success');
    } else if (lives === 0) {
      state = 'lose';
      say(info + 'No lives left. Game over.', 'error');
    }
    current = next;
    render();
  }

  $('g-higher').addEventListener('click', () => guess('higher'));
  $('g-lower').addEventListener('click', () => guess('lower'));
  $('g-restart').addEventListener('click', start);
  start();
})();