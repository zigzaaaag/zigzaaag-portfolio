/* All photo layers share the CSS --photograph variable. No libraries needed. */
(() => {
  const scene = document.querySelector('.scene');
  const reveal = document.querySelector('.reveal');
  if (!scene || !reveal) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = matchMedia('(pointer: coarse)');
  let width = innerWidth, height = innerHeight;
  let targetX = width * .57, targetY = height * .56;
  let x = targetX, y = targetY, alpha = 0, targetAlpha = 0;
  let frame = 0, previousTime = 0, touchTimer = 0;
  let maskWidth = 0, maskHeight = 0;
  let heroVisible = true;
  function measure() {
    width = scene.clientWidth; height = scene.clientHeight;
    const mobile = width <= 640;
    maskWidth = mobile ? width * 1.45 : Math.min(width * .84, 1080);
    maskHeight = mobile ? height * .75 : Math.min(height * .88, 820);
    targetX = Math.min(targetX, width); targetY = Math.min(targetY, height);
    start();
  }
  function render(time) {
    frame = 0;
    const dt = previousTime ? Math.min(time - previousTime, 64) : 16.67;
    previousTime = time;
    // Time-based interpolation stays consistent on 60 Hz and 120 Hz displays.
    const follow = reducedMotion.matches ? 1 : 1 - Math.exp(-dt / 220);
    const fade = reducedMotion.matches ? 1 : 1 - Math.exp(-dt / 520);
    x += (targetX - x) * follow; y += (targetY - y) * follow;
    alpha += (targetAlpha - alpha) * fade;
    reveal.style.setProperty('--mask-x', `${(x - maskWidth * .48).toFixed(2)}px`);
    reveal.style.setProperty('--mask-y', `${(y - maskHeight * .52).toFixed(2)}px`);
    reveal.style.opacity = alpha.toFixed(4);
    if (Math.abs(targetX - x) + Math.abs(targetY - y) > .12 || Math.abs(targetAlpha - alpha) > .001) frame = requestAnimationFrame(render);
    else previousTime = 0;
  }
  function start() { if (!frame && !document.hidden && heroVisible) frame = requestAnimationFrame(render); }
  function look(event) {
    const bounds = scene.getBoundingClientRect();
    if (!heroVisible || event.clientY < bounds.top || event.clientY > bounds.bottom) return;
    targetX = event.clientX - bounds.left; targetY = event.clientY - bounds.top; targetAlpha = 1;
    document.body.classList.add('has-interacted');
    clearTimeout(touchTimer); start();
  }
  window.addEventListener('pointermove', event => {
    if (event.pointerType !== 'touch' || event.target.closest('.scene')) look(event);
  }, { passive: true });
  scene.addEventListener('pointerdown', look, { passive: true });
  function fadeOut() { targetAlpha = 0; start(); }
  document.documentElement.addEventListener('pointerleave', fadeOut);
  window.addEventListener('blur', fadeOut);
  window.addEventListener('pointerup', event => {
    if (event.pointerType === 'touch') touchTimer = setTimeout(fadeOut, 1500);
  }, { passive: true });
  window.addEventListener('pointercancel', fadeOut, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('is-hidden', document.hidden);
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; previousTime = 0; }
    else start();
  });
  reducedMotion.addEventListener('change', start);
  if (coarsePointer.matches) document.querySelector('.interaction-hint').textContent = '轻触，或缓慢滑动';
  // Off-screen Hero does no animation work. Touch can scroll down into Works.
  new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    scene.classList.toggle('is-paused', !heroVisible);
    if (!heroVisible) { cancelAnimationFrame(frame); frame = 0; previousTime = 0; }
    else start();
  }).observe(scene);
  const photo = new Image();
  photo.onerror = () => { document.querySelector('.image-error').hidden = false; };
  const background = getComputedStyle(document.querySelector('.photograph')).backgroundImage;
  const photoUrl = background.match(/^url\(["']?(.*?)["']?\)$/);
  if (photoUrl) photo.src = photoUrl[1];
  measure();
})();
