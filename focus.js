(() => {
  'use strict';
  const photo = document.getElementById('focus-memory');
  const button = document.getElementById('hold-focus');
  const label = document.getElementById('focus-label');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!photo || !button) return;
  let progress = 0;
  let target = 0;
  let animation = 0;
  let previousTime = 0;
  let pointer = null;
  let keyboardHolding = false;
  let ignoreKeyboardClick = false;
  function animate(time) {
    const elapsed = previousTime ? time - previousTime : 0;
    previousTime = time;
    const direction = target > progress ? 1 : -1;
    progress = Math.max(0, Math.min(1, progress + direction * elapsed / (target ? 950 : 600)));
    if (Math.abs(target - progress) < .001) progress = target;
    photo.style.setProperty('--focus', progress.toFixed(4));
    label.textContent = target ? (progress >= 1 ? 'In focus' : 'Coming into focus…') : 'Hold to focus';
    if (Math.abs(target - progress) > .001) animation = requestAnimationFrame(animate);
    else { animation = 0; previousTime = 0; }
  }
  function setHolding(holding) {
    if (reduceMotion.matches) return;
    target = holding ? 1 : 0;
    button.setAttribute('aria-pressed', String(holding));
    photo.classList.toggle('is-holding', holding);
    if (!animation) { previousTime = performance.now(); animation = requestAnimationFrame(animate); }
  }
  function release() { pointer = null; keyboardHolding = false; setHolding(false); }
  // Suppress native long-press callouts only inside this interactive photograph.
  photo.addEventListener('contextmenu', event => {
    if (photo.classList.contains('is-enabled')) event.preventDefault();
  });
  photo.addEventListener('dragstart', event => {
    if (photo.classList.contains('is-enabled')) event.preventDefault();
  });
  button.addEventListener('touchstart', event => event.preventDefault(), { passive: false });
  button.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    button.focus({ preventScroll: true });
    pointer = event.pointerId;
    button.setPointerCapture(pointer);
    setHolding(true);
  });
  button.addEventListener('pointerup', event => { if (event.pointerId === pointer) release(); });
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', () => { if (pointer !== null) release(); });
  button.addEventListener('keydown', event => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    ignoreKeyboardClick = true;
    keyboardHolding = true;
    setHolding(true);
  });
  button.addEventListener('keyup', event => {
    if ((event.key === ' ' || event.key === 'Enter') && keyboardHolding) {
      event.preventDefault(); release();
      setTimeout(() => { ignoreKeyboardClick = false; }, 0);
    }
  });
  button.addEventListener('click', event => {
    if (event.detail === 0 && !ignoreKeyboardClick && !keyboardHolding) setHolding(!target);
  });
  button.addEventListener('blur', release);
  window.addEventListener('blur', release);
  document.addEventListener('visibilitychange', () => { if (document.hidden) release(); });
  function syncMotion() {
    cancelAnimationFrame(animation); animation = 0; previousTime = 0;
    progress = 0; target = 0; pointer = null; keyboardHolding = false;
    photo.style.removeProperty('--focus');
    photo.classList.remove('is-holding');
    photo.classList.toggle('is-enabled', !reduceMotion.matches);
    button.hidden = reduceMotion.matches;
    button.setAttribute('aria-pressed', 'false');
    label.textContent = 'Hold to focus';
  }
  reduceMotion.addEventListener('change', syncMotion);
  syncMotion();
})();
