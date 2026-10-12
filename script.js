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

// ---------- Playground ----------

// Paint range input fills
document.querySelectorAll('.play-controls input[type="range"]').forEach(r => {
  const paint = () => r.style.setProperty('--fill', ((r.value - r.min) / (r.max - r.min) * 100) + '%');
  r.addEventListener('input', paint);
  paint();
});

// Spring lab: semi-implicit Euler spring on a knob
(function springLab() {
  const knob = document.getElementById('springKnob');
  const stage = document.getElementById('springStage');
  if (!knob || !stage) return;
  let x = 0, v = 0, target = 0, k = 120, c = 12, raf = null, maxX = 100;
  const measure = () => { maxX = Math.max(0, stage.clientWidth - 48 - 36); target = Math.min(target, maxX); };
  measure();
  window.addEventListener('resize', measure);
  const render = () => { knob.style.transform = `translateX(${x}px)`; };
  const step = () => {
    const dt = 1 / 60;
    v += (-k * (x - target) - c * v) * dt;
    x += v * dt;
    render();
    if (Math.abs(v) > 0.4 || Math.abs(x - target) > 0.4) {
      raf = requestAnimationFrame(step);
    } else {
      x = target; v = 0; render(); raf = null;
    }
  };
  const kick = () => {
    if (raf) cancelAnimationFrame(raf);
    if (reduceMotion) { x = target; v = 0; render(); return; }
    raf = requestAnimationFrame(step);
  };
  document.getElementById('nudgeBtn').addEventListener('click', () => {
    measure();
    target = Math.random() * maxX;
    kick();
  });
  document.getElementById('stiffRange').addEventListener('input', e => { k = +e.target.value; });
  document.getElementById('dampRange').addEventListener('input', e => { c = +e.target.value; });
  render();
})();

// Live chart: staggered bars + count-up labels
(function liveChart() {
  const chartEl = document.getElementById('chart');
  if (!chartEl) return;
  const sets = {
    stars:   [42, 68, 55, 90, 74, 120, 96],
    prs:     [12, 28, 20, 45, 38, 60, 52],
    deploys: [8, 15, 12, 22, 30, 26, 40],
  };
  const bars = sets.stars.map(() => {
    const b = document.createElement('div');
    b.className = 'bar';
    b.innerHTML = '<div class="bar-fill"></div><span>0</span>';
    chartEl.appendChild(b);
    return b;
  });
  const countUp = (label, from, to) => {
    if (reduceMotion) { label.textContent = to; return; }
    const t0 = performance.now();
    const tick = t => {
      const p = Math.min((t - t0) / 650, 1);
      label.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const renderSet = key => {
    const data = sets[key];
    const max = Math.max(...data);
    bars.forEach((b, i) => {
      const fill = b.querySelector('.bar-fill');
      const label = b.querySelector('span');
      fill.style.transitionDelay = (i * 55) + 'ms';
      // force reflow so the delay applies cleanly on repeat clicks
      void fill.offsetWidth;
      fill.style.height = Math.max(2, (data[i] / max) * 100) + '%';
      countUp(label, parseInt(label.textContent, 10) || 0, data[i]);
    });
  };
  document.querySelectorAll('[data-set]').forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-set]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderSet(btn.dataset.set);
    })
  );
  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) { renderSet('stars'); obs.disconnect(); }
    });
  }, { threshold: 0.3 }).observe(chartEl);
})();

// Theme mixer: one hue variable re-themes the preview
(function themeMixer() {
  const preview = document.getElementById('themePreview');
  const hue = document.getElementById('hueRange');
  const glow = document.getElementById('glowSwitch');
  if (!preview || !hue || !glow) return;
  hue.addEventListener('input', e => preview.style.setProperty('--mix-hue', e.target.value));
  glow.addEventListener('click', () => {
    const on = glow.getAttribute('aria-checked') === 'true';
    glow.setAttribute('aria-checked', String(!on));
    preview.classList.toggle('glow', !on);
  });
})();

// Button lab: spring switch, magnetic button, click ripple
(function buttonLab() {
  const demoSwitch = document.getElementById('demoSwitch');
  if (demoSwitch) {
    demoSwitch.addEventListener('click', () => {
      demoSwitch.setAttribute('aria-checked', String(demoSwitch.getAttribute('aria-checked') !== 'true'));
    });
  }
  const stage = document.getElementById('btnStage');
  const magnet = document.getElementById('magnetBtn');
  if (stage && magnet && !reduceMotion) {
    const PULL = 26;
    stage.addEventListener('mousemove', e => {
      const r = magnet.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      if (dist < 160) {
        magnet.style.transform = `translate(${(dx / 160) * PULL}px, ${(dy / 160) * PULL}px)`;
      } else {
        magnet.style.transform = '';
      }
    });
    stage.addEventListener('mouseleave', () => { magnet.style.transform = ''; });
  }
  if (magnet) {
    magnet.addEventListener('click', e => {
      const r = magnet.getBoundingClientRect();
      const s = document.createElement('span');
      s.className = 'ripple';
      const size = Math.max(r.width, r.height);
      s.style.width = s.style.height = size + 'px';
      s.style.left = (e.clientX - r.left - size / 2) + 'px';
      s.style.top = (e.clientY - r.top - size / 2) + 'px';
      magnet.appendChild(s);
      setTimeout(() => s.remove(), 700);
    });
  }
})();
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
