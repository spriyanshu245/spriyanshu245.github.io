// ---------- Theme: dark default, toggleable, persisted ----------
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setTheme(theme) {
  root.setAttribute('data-theme', theme);
  try { localStorage.setItem('ps-theme', theme); } catch (e) {}
  if (theme === 'dark') startAurora(); else stopAurora();
}
let saved = 'dark';
try { saved = localStorage.getItem('ps-theme') || 'dark'; } catch (e) {}
themeToggle.addEventListener('click', () => {
  setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

// ---------- Aurora: slow-drifting gradient orbs on canvas ----------
const canvas = document.getElementById('aurora');
const ctx = canvas.getContext('2d');
let rafId = null, W = 0, H = 0;
const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

const orbs = [
  { x: 0.18, y: 0.25, r: 0.42, hue: 212, speed: 0.00021, phase: 0.0, alpha: 0.20 },
  { x: 0.82, y: 0.18, r: 0.38, hue: 268, speed: 0.00017, phase: 2.1, alpha: 0.17 },
  { x: 0.62, y: 0.82, r: 0.48, hue: 190, speed: 0.00014, phase: 4.2, alpha: 0.15 },
  { x: 0.30, y: 0.78, r: 0.34, hue: 285, speed: 0.00019, phase: 1.3, alpha: 0.14 },
  { x: 0.50, y: 0.50, r: 0.55, hue: 230, speed: 0.00010, phase: 3.0, alpha: 0.08 },
];

function sizeCanvas() {
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = Math.floor(W * DPR);
  canvas.height = Math.floor(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', sizeCanvas);
sizeCanvas();

function drawAurora(t) {
  ctx.fillStyle = '#08080d';
  ctx.fillRect(0, 0, W, H);
  const maxR = Math.max(W, H);
  for (const o of orbs) {
    const x = (o.x + Math.sin(t * o.speed + o.phase) * 0.09) * W;
    const y = (o.y + Math.cos(t * o.speed * 1.35 + o.phase) * 0.09) * H;
    const r = o.r * maxR;
    const hue = o.hue + Math.sin(t * 0.000045 + o.phase) * 22; // slow shade drift
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `hsla(${hue}, 85%, 58%, ${o.alpha})`);
    g.addColorStop(0.55, `hsla(${hue}, 80%, 50%, ${o.alpha * 0.45})`);
    g.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  // faint vignette to keep text readable
  const v = ctx.createRadialGradient(W/2, H/2, Math.min(W,H)*0.35, W/2, H/2, maxR*0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
  rafId = requestAnimationFrame(drawAurora);
}

function startAurora() {
  if (reduceMotion || rafId) return;
  rafId = requestAnimationFrame(drawAurora);
}
function stopAurora() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAurora();
  else if (root.getAttribute('data-theme') === 'dark') startAurora();
});
if (saved === 'dark' && !reduceMotion) startAurora();
root.setAttribute('data-theme', saved);

// ---------- Mobile menu ----------
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
menuBtn.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  })
);

// ---------- Frosted nav hairline on scroll ----------
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- Scroll reveals ----------
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ---------- Footer year ----------
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Live demo links (fill after deploys) ----------
const DEMO_URLS = {};
document.querySelectorAll('.demo-link').forEach(a => {
  const url = DEMO_URLS[a.dataset.demo];
  if (url) {
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
  } else {
    a.textContent = 'Live demo — deploying soon';
    a.classList.add('pending');
    a.removeAttribute('href');
  }
});
