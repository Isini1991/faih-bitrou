(() => {
  'use strict';
  const opening = document.getElementById('opening');
  const skip = document.getElementById('skip-intro');
  const replay = document.getElementById('replay-intro');
  const main = document.getElementById('main');
  const footer = document.querySelector('footer');
  const heroImage = document.querySelector('.hero-image');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 700px)');
  const storageKey = 'faih-opening-seen-v2';
  let timers = [];
  let running = false;
  let generation = 0;
  const later = (callback, ms) => timers.push(window.setTimeout(callback, ms));
  function markSeen() { try { window.localStorage.setItem(storageKey, '1'); } catch {} }
  function hasSeen() { try { return window.localStorage.getItem(storageKey) === '1'; } catch { return false; } }
  function clearTimers() { timers.forEach(window.clearTimeout); timers = []; }
  function restorePage() {
    main.inert = false;
    footer.inert = false;
    document.body.classList.remove('is-opening');
  }
  function finish(moveFocus = false) {
    generation++;
    clearTimers();
    running = false;
    opening.hidden = true;
    opening.className = 'opening';
    restorePage();
    markSeen();
    if (moveFocus) replay.focus({ preventScroll: true });
  }
  async function play(manual = false) {
    if (reduceMotion.matches) { finish(); return; }
    const attempt = ++generation;
    clearTimers();
    window.scrollTo({ top: 0, behavior: 'instant' });
    running = true;
    opening.className = 'opening';
    opening.hidden = false;
    main.inert = true;
    footer.inert = true;
    document.body.classList.add('is-opening');
    if (manual) skip.focus({ preventScroll: true });
    // A slow image must never trap the visitor inside the opening.
    const decoded = heroImage.decode ? heroImage.decode().catch(() => {}) : Promise.resolve();
    await Promise.race([decoded, new Promise(resolve => later(resolve, 1600))]);
    if (attempt !== generation) return;
    clearTimers();
    const pace = mobile.matches ? .72 : 1;
    opening.style.setProperty('--intro-pace', pace);
    later(() => opening.classList.add('photo-in'), 120 * pace);
    later(() => opening.classList.add('iris-open'), 300 * pace);
    later(() => opening.classList.add('name-in'), 650 * pace);
    later(() => opening.classList.add('focus-in'), 850 * pace);
    later(() => opening.classList.add('caption-in'), 1700 * pace);
    later(() => opening.classList.add('expand'), 2300 * pace);
    later(() => {
      restorePage();
      opening.classList.add('depart');
    }, 3300 * pace);
    later(() => finish(document.activeElement === skip), 3750 * pace);
  }
  skip.addEventListener('click', () => finish(true));
  replay.addEventListener('click', () => play(true));
  document.addEventListener('keydown', event => { if (running && event.key === 'Escape') finish(true); });
  reduceMotion.addEventListener('change', () => { if (reduceMotion.matches && running) finish(true); });
  if (!hasSeen() && !reduceMotion.matches) {
    play();
  }
})();
