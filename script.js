const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const art = document.querySelector('.hero-art');
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelector('.hero').addEventListener('pointermove', (event) => {
    if (reducedMotion.matches) return;
    const bounds = art.getBoundingClientRect();
    const x = (event.clientX - bounds.left - bounds.width / 2) / 65;
    const y = (event.clientY - bounds.top - bounds.height / 2) / 65;
    art.style.transform = `translate(${Math.max(-9, Math.min(9, x))}px, ${Math.max(-7, Math.min(7, y))}px)`;
  });
  document.querySelector('.hero').addEventListener('pointerleave', () => { art.style.transform = ''; });
}
document.querySelector('#year').textContent = new Date().getFullYear();
const navigation = document.querySelectorAll('.header nav a');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) navigation.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
  });
}, { rootMargin: '-15% 0px -55% 0px' });
document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));

const portraitFrame = document.querySelector('#portrait-frame');
const portraitCaption = document.querySelector('#portrait-caption');
document.querySelectorAll('[data-portrait]').forEach(button => {
  button.addEventListener('click', () => {
    const avatar = button.dataset.portrait === 'avatar';
    portraitFrame.classList.toggle('avatar-mode', avatar);
    portraitCaption.textContent = avatar ? 'a dreamer, in developer mode.' : 'a human behind the code.';
    document.querySelectorAll('[data-portrait]').forEach(control => {
      control.setAttribute('aria-pressed', String(control === button));
    });
  });
});

const progress = document.querySelector('.reading-progress');
let progressQueued = false;
function updateProgress() {
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${distance > 0 ? Math.min(100, Math.max(0, window.scrollY / distance * 100)) : 0}%`;
  progressQueued = false;
}
window.addEventListener('scroll', () => {
  if (!progressQueued) { progressQueued = true; requestAnimationFrame(updateProgress); }
}, { passive: true });
window.addEventListener('resize', updateProgress);
updateProgress();
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const aura = document.querySelector('.cursor-aura');
  let auraFrame = 0;
  document.addEventListener('pointermove', event => {
    if (reducedMotion.matches) { aura.style.opacity = '0'; return; }
    cancelAnimationFrame(auraFrame);
    auraFrame = requestAnimationFrame(() => {
      aura.style.transform = `translate(${event.clientX - 150}px, ${event.clientY - 150}px)`;
      aura.style.opacity = '1';
    });
  });
  document.documentElement.addEventListener('pointerleave', () => { aura.style.opacity = '0'; });
  document.querySelectorAll('.interest-grid article').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (reducedMotion.matches) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--glow-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--glow-y', `${event.clientY - rect.top}px`);
    });
  });
}

// Animate profile totals once, without delaying the readable HTML values.
const totalsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    totalsObserver.unobserve(entry.target);
    if (reducedMotion.matches) return;
    const target = Number(entry.target.dataset.count);
    let started;
    function tick(now) {
      if (!started) started = now;
      const t = Math.min((now - started) / 1000, 1);
      entry.target.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach(total => totalsObserver.observe(total));

const cursorMedia = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
let cursorX = 0, cursorY = 0, ringX = 0, ringY = 0, cursorFrame = 0;
function drawCursor() {
  ringX += (cursorX - ringX) * 0.2;
  ringY += (cursorY - ringY) * 0.2;
  cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
  cursorFrame = 0;
  if (Math.abs(cursorX - ringX) + Math.abs(cursorY - ringY) > 0.1 && cursorMedia.matches) cursorFrame = requestAnimationFrame(drawCursor);
}
document.addEventListener('pointermove', event => {
  if (!cursorMedia.matches || event.pointerType === 'touch') return;
  cursorX = event.clientX; cursorY = event.clientY;
  if (!document.body.classList.contains('cursor-active')) { ringX = cursorX; ringY = cursorY; }
  document.body.classList.add('cursor-ready', 'cursor-active');
  cursorDot.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
  document.body.classList.toggle('cursor-hover', Boolean(event.target.closest('a, button')));
  if (!cursorFrame) cursorFrame = requestAnimationFrame(drawCursor);
});
function hideCustomCursor() {
  document.body.classList.remove('cursor-ready', 'cursor-active', 'cursor-hover');
  cancelAnimationFrame(cursorFrame); cursorFrame = 0;
}
document.documentElement.addEventListener('pointerleave', hideCustomCursor);
window.addEventListener('blur', hideCustomCursor);
cursorMedia.addEventListener('change', hideCustomCursor);
document.addEventListener('keydown', event => { if (event.key === 'Tab') hideCustomCursor(); });
