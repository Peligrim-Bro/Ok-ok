/* OK-OK night bay: local Canvas 2D, no dependencies or external requests. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const canvas = document.createElement('canvas');
  canvas.id = 'spatial-background';
  canvas.dataset.effect = 'night-bay-v1';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.pointerEvents = 'none';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) { canvas.remove(); return; }
  let width = 1, height = 1, frame = 0, previous = 0, time = 0;
  let ripples = [], palette = [88, 161, 210];
  const still = () => reduced.matches || !!connection?.saveData;
  const targetPalette = () => {
    const city = document.querySelector('#cityPicker [aria-pressed="true"]')?.dataset.city;
    return city === 'phuket' ? [48, 187, 174] : city === 'bangkok' ? [196, 159, 94] : [116, 145, 211];
  };
  const color = (rgb, alpha) => `rgba(${rgb.map(Math.round).join(',')},${alpha})`;
  function paint(delta = 0) {
    time += delta;
    const target = targetPalette();
    palette = palette.map((value, index) => value + (target[index] - value) * (still() ? 1 : .045));
    const light = document.documentElement.dataset.theme === 'light';
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, light ? '#e7eff8' : '#081325');
    sky.addColorStop(.5, light ? '#d8e9ef' : '#0c263b');
    sky.addColorStop(1, light ? '#edf6f3' : '#092a34');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);
    // Broad, low contrast reflections; no blur filters or image assets.
    for (let i = 0; i < 3; i++) {
      const x = width * (.18 + i * .33) + Math.sin(time * .00013 + i * 2) * width * .055;
      const y = height * (.36 + i * .2);
      const radius = Math.max(width * .34, 180);
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, color(palette, light ? .13 : .12));
      glow.addColorStop(1, color(palette, 0));
      ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
    }
    for (let band = 0; band < 6; band++) {
      const base = height * (.4 + band * .105);
      ctx.beginPath();
      for (let x = -24; x <= width + 24; x += 24) {
        const y = base + Math.sin(x / Math.max(width, 390) * 6.5 + time * .0003 + band * .7) * (12 + band * 2)
          + Math.sin(x * .008 - time * .00016 + band) * 7;
        if (x === -24) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color(palette, light ? .12 : .11);
      ctx.lineWidth = 2 + band * .5; ctx.stroke();
    }
    // A handful of distant lights, moving with the water.
    for (let i = 0; i < 14; i++) {
      const x = width * ((i * .61803398875) % 1);
      const y = height * (.42 + (i % 5) * .11) + Math.sin(time * .0004 + i) * 4;
      ctx.fillStyle = color(palette, .14 + Math.sin(time * .0006 + i) * .045);
      ctx.beginPath(); ctx.ellipse(x, y, 1.5 + i % 3, .9, 0, 0, Math.PI * 2); ctx.fill();
    }
    ripples = ripples.filter(ripple => time - ripple.at < 1500);
    for (const ripple of ripples) {
      const age = (time - ripple.at) / 1500;
      ctx.strokeStyle = color(palette, (1 - age) * .28);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(ripple.x, ripple.y, 10 + age * 95, 5 + age * 38, 0, 0, Math.PI * 2); ctx.stroke();
    }
  }
  function animate(now) {
    frame = 0;
    if (document.hidden || still()) return;
    if (!previous || now - previous >= 1000 / 30) {
      const delta = previous ? Math.min(now - previous, 70) : 0;
      previous = now; paint(delta);
    }
    frame = requestAnimationFrame(animate);
  }
  function refresh() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; previous = 0;
    if (document.hidden) return;
    paint();
    if (!still()) frame = requestAnimationFrame(animate);
  }
  function resize() {
    width = innerWidth; height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 1.25);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    refresh();
  }
  document.addEventListener('pointerdown', event => {
    if (still() || document.hidden) return;
    ripples.push({ x: event.clientX, y: event.clientY, at: time });
    ripples = ripples.slice(-3);
  }, { passive: true });
  document.addEventListener('visibilitychange', refresh);
  reduced.addEventListener('change', () => { ripples = []; refresh(); });
  connection?.addEventListener?.('change', refresh);
  addEventListener('resize', resize, { passive: true });
  new MutationObserver(refresh).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  // City selection re-renders the picker; only observe that small region.
  const observeCity = () => {
    const picker = document.getElementById('cityPicker');
    if (picker) new MutationObserver(refresh).observe(picker, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-pressed'] });
  };
  observeCity(); resize();
})();

/* Preserve the existing tactile feedback; respect reduced motion. */
document.addEventListener('pointerdown', event => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const element = event.target.closest('button,.btn,.chip,a[role="button"],nav.tab a');
  if (!element) return;
  element.classList.remove('ok-press'); void element.offsetWidth;
  element.classList.add('ok-press');
  setTimeout(() => element.classList.remove('ok-press'), 480);
}, { passive: true });
