import site from '../content/site.json';

type Video = (typeof site.work.videos)[number];

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } },
};

/* ---------- Rewind intro (first visit) ---------- */
const root = document.documentElement;
if (root.classList.contains('rewind')) {
  store.set('rewound', '1');
  const skip = () => {
    root.classList.remove('rewind');
    ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach((e) => removeEventListener(e, skip));
  };
  ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach((e) => addEventListener(e, skip, { passive: true }));
  setTimeout(skip, 1700);
}

/* ---------- Theme toggle ---------- */
const themeBtn = $<HTMLButtonElement>('[data-theme-toggle]')!;
const syncThemeLabel = () => {
  themeBtn.setAttribute('aria-label', root.dataset.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
};
syncThemeLabel();
themeBtn.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  const apply = () => { root.dataset.theme = next; syncThemeLabel(); };
  store.set('theme', next);
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (doc.startViewTransition && !reducedMotion()) doc.startViewTransition(apply);
  else apply();
});

/* ---------- Menu ---------- */
const menu = $('[data-menu]')!;
const menuOpen = $<HTMLButtonElement>('[data-menu-open]')!;
const setMenu = (open: boolean) => {
  menu.hidden = !open;
  menuOpen.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) $<HTMLButtonElement>('[data-menu-close]')!.focus();
};
menuOpen.addEventListener('click', () => setMenu(true));
$('[data-menu-close]')!.addEventListener('click', () => { setMenu(false); menuOpen.focus(); });
$$('[data-menu-link]').forEach((a) => a.addEventListener('click', () => setMenu(false)));
menu.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { setMenu(false); menuOpen.focus(); }
  if (e.key === 'Tab') {
    const f = $$<HTMLElement>('a, button', menu);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

/* ---------- Scroll: header, progress bar, track ---------- */
const header = $('[data-header]')!;
const progress = $('[data-progress]')!;
const rail = $('[data-rail]')!;
const truck = $('[data-truck]')!;
const stops = $$('[data-stop]');
const sectionEls = stops.map((s) => document.getElementById(s.dataset.stop!)!);
let lastPos = -1;
let tops: number[] = [];
let maxScroll = 0;
const measure = () => {
  tops = sectionEls.map((el) => el.getBoundingClientRect().top + scrollY);
  maxScroll = document.documentElement.scrollHeight - innerHeight;
};
let idleTimer = 0;

const updateScroll = () => {
  const y = scrollY;
  const max = maxScroll;
  header.classList.toggle('scrolled', y > 40);
  progress.style.setProperty('--p', String(max > 0 ? Math.min(1, y / max) : 0));

  // Which section are we in, and how far toward the next one?
  const probe = y + innerHeight * 0.4;
  let i = 0;
  for (let k = 0; k < sectionEls.length; k++) if (tops[k] <= probe) i = k;
  if (y >= max - 2) i = sectionEls.length - 1;
  let frac = 0;
  if (i < sectionEls.length - 1 && y < max - 2) {
    const a = tops[i], b = tops[i + 1];
    frac = Math.min(1, Math.max(0, (probe - a) / (b - a)));
  }
  const n = sectionEls.length - 1;
  const pos = reducedMotion() ? i / n : (i + frac) / n;

  stops.forEach((s, k) => {
    s.classList.toggle('current', k === i);
    if (k === i) s.setAttribute('aria-current', 'step');
    else s.removeAttribute('aria-current');
  });
  if (pos !== lastPos) {
    truck.style.transform = `translateX(${pos * rail.clientWidth}px)`;
    if (!reducedMotion()) {
      document.body.classList.add('truck-bounce');
      clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => document.body.classList.remove('truck-bounce'), 180);
    }
    lastPos = pos;
  }
};
let ticking = false;
const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { updateScroll(); ticking = false; });
};
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', () => { measure(); lastPos = -1; onScroll(); });
measure();
updateScroll();
// Fonts and lazy images shift section positions after first paint.
addEventListener('load', () => { measure(); onScroll(); });
new ResizeObserver(() => { measure(); onScroll(); }).observe(document.body);

/* ---------- Reveal, stripes, count-up ---------- */
const fmt = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const countUp = (el: HTMLElement) => {
  const target = Number(el.dataset.value);
  if (reducedMotion()) return;
  const start = performance.now();
  const step = (t: number) => {
    const p = Math.min(1, (t - start) / 1000);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt.format(Math.round(target * eased));
    if (p < 1) requestAnimationFrame(step);
  };
  el.textContent = '0';
  requestAnimationFrame(step);
};

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target as HTMLElement;
      el.classList.add('in');
      $$('[data-value]', el).forEach(countUp);
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  $$('.reveal, [data-stripe]').forEach((el) => io.observe(el));
} else {
  $$('.reveal, [data-stripe]').forEach((el) => el.classList.add('in'));
}

/* ---------- Work filters ---------- */
const filters = $$<HTMLButtonElement>('[data-filter]');
const cards = $$('[data-grid] > li');
const emptyNote = $('[data-empty]')!;
filters.forEach((btn) => btn.addEventListener('click', () => {
  const cat = btn.dataset.filter!;
  filters.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
  let shown = 0;
  cards.forEach((c) => {
    const show = cat === 'All' || c.dataset.category === cat;
    c.hidden = !show;
    if (show) { c.classList.add('in'); shown++; }
  });
  emptyNote.hidden = shown > 0;
}));

/* ---------- Card hover previews (desktop) ---------- */
if (matchMedia('(hover: hover)').matches && !reducedMotion()) {
  $$('[data-grid] .card').forEach((card) => {
    const v = $<HTMLVideoElement>('[data-preview]', card);
    if (!v) return;
    card.addEventListener('pointerenter', () => { v.preload = 'auto'; v.play().then(() => v.classList.add('on')).catch(() => {}); });
    card.addEventListener('pointerleave', () => { v.pause(); v.classList.remove('on'); });
  });
}

/* ---------- Hero reel mute ---------- */
const heroReel = $<HTMLVideoElement>('[data-hero-reel]');
const muteBtn = $<HTMLButtonElement>('[data-mute]');
if (heroReel && muteBtn) {
  muteBtn.addEventListener('click', () => {
    heroReel.muted = !heroReel.muted;
    muteBtn.setAttribute('aria-pressed', String(heroReel.muted));
    muteBtn.setAttribute('aria-label', heroReel.muted ? 'Unmute reel' : 'Mute reel');
    if (!heroReel.muted) heroReel.play().catch(() => {});
  });
  if (reducedMotion()) heroReel.pause();
}

/* ---------- Lightbox ---------- */
const lb = $<HTMLDialogElement>('[data-lightbox]')!;
const stage = $('[data-lb-stage]')!;
const lbTitle = $('[data-lb-title]')!;
const lbCount = $('[data-lb-count]')!;
const lbInner = $('[data-lb-inner]')!;
let list: Video[] = [];
let index = 0;
let opener: HTMLElement | null = null;

const render = () => {
  const v = list[index];
  lbTitle.textContent = `${v.brand} · ${v.title}`;
  lbCount.textContent = `${index + 1} / ${list.length}`;
  stage.replaceChildren();
  if (v.video) {
    const vid = document.createElement('video');
    vid.controls = true;
    vid.playsInline = true;
    vid.autoplay = true;
    if (v.poster) vid.poster = v.poster;
    vid.setAttribute('aria-label', `${v.title} for ${v.brand}`);
    if (v.videoWebm) vid.append(Object.assign(document.createElement('source'), { src: v.videoWebm, type: 'video/webm' }));
    vid.append(Object.assign(document.createElement('source'), { src: v.video, type: 'video/mp4' }));
    if (v.captions) vid.append(Object.assign(document.createElement('track'), { kind: 'captions', src: v.captions, srclang: 'en', label: 'English', default: true }));
    stage.append(vid);
  } else {
    const ph = document.createElement('div');
    ph.className = 'lb-ph';
    ph.innerHTML = `<span>Loading level…</span><strong></strong><span>Video coming soon</span>`;
    ph.querySelector('strong')!.textContent = v.title;
    stage.append(ph);
  }
};
const visibleVideos = () => {
  const ids = new Set(cards.filter((c) => !c.hidden).map((c) => $('[data-play]', c)!.dataset.play));
  return site.work.videos.filter((v) => ids.has(v.id));
};
const openVideo = (id: string, from: HTMLElement | null, pool = visibleVideos()) => {
  list = pool.some((v) => v.id === id) ? pool : site.work.videos;
  index = Math.max(0, list.findIndex((v) => v.id === id));
  opener = from;
  render();
  heroReel?.pause();
  lb.showModal();
};
const step = (d: number) => { index = (index + d + list.length) % list.length; render(); };
const closeLb = () => lb.close();

$$('[data-play]').forEach((el) => el.addEventListener('click', () => openVideo(el.dataset.play!, el)));
$('[data-lb-close]')!.addEventListener('click', closeLb);
$('[data-lb-prev]')!.addEventListener('click', () => step(-1));
$('[data-lb-next]')!.addEventListener('click', () => step(1));
lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
lb.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') step(1);
  if (e.key === 'ArrowLeft') step(-1);
});
lb.addEventListener('close', () => {
  stage.replaceChildren();
  if (heroReel && !reducedMotion()) heroReel.play().catch(() => {});
  opener?.focus();
});
let touchX = 0;
lbInner.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
lbInner.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
}, { passive: true });

/* ---------- Testimonial carousel ---------- */
const carousel = $('[data-carousel]');
if (carousel) {
  const slides = $$('[data-slide]', carousel);
  const dots = $$<HTMLButtonElement>('[data-dot]', carousel);
  let cur = 0;
  let timer = 0;
  let stopped = reducedMotion() || slides.length < 2;
  const show = (n: number) => {
    cur = (n + slides.length) % slides.length;
    slides.forEach((s, k) => (s.hidden = k !== cur));
    dots.forEach((d, k) => (k === cur ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')));
  };
  const play = () => { clearInterval(timer); if (!stopped) timer = window.setInterval(() => show(cur + 1), 6000); };
  const pause = () => clearInterval(timer);
  dots.forEach((d, k) => d.addEventListener('click', () => { stopped = true; pause(); show(k); }));
  carousel.addEventListener('pointerenter', pause);
  carousel.addEventListener('pointerleave', play);
  carousel.addEventListener('focusin', pause);
  carousel.addEventListener('focusout', play);
  play();
}

/* ---------- Contact form ---------- */
const form = $<HTMLFormElement>('[data-contact]')!;
const status = $('[data-status]', form)!;
const success = $('[data-success]')!;
form.addEventListener('focusin', () => document.body.classList.add('form-focus'));
form.addEventListener('focusout', () => setTimeout(() => {
  if (!form.contains(document.activeElement)) document.body.classList.remove('form-focus');
}, 0));

const fields = {
  name: { msg: 'Please add your name.', ok: (v: string) => v.trim().length > 0 },
  email: { msg: 'Please add a valid email, like you@brand.com.', ok: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) },
  message: { msg: 'Please add a short message.', ok: (v: string) => v.trim().length > 0 },
};
const check = (name: keyof typeof fields) => {
  const input = form.elements.namedItem(name) as HTMLInputElement;
  const ok = fields[name].ok(input.value);
  input.setAttribute('aria-invalid', String(!ok));
  $(`#e-${name}`, form)!.textContent = ok ? '' : fields[name].msg;
  return ok;
};
(Object.keys(fields) as (keyof typeof fields)[]).forEach((n) => {
  const input = form.elements.namedItem(n) as HTMLInputElement;
  input.addEventListener('blur', () => { if (input.value) check(n); });
  input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') check(n); });
});

const mailtoHref = (d: Record<string, string>) =>
  `mailto:${form.dataset.email}?subject=${encodeURIComponent(`UGC inquiry from ${d.name}${d.brand ? ` (${d.brand})` : ''}`)}&body=${encodeURIComponent(`${d.message}\n\n${d.name} · ${d.email}`)}`;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.textContent = '';
  const results = (Object.keys(fields) as (keyof typeof fields)[]).map(check);
  if (results.includes(false)) {
    $<HTMLElement>('[aria-invalid="true"]', form)?.focus();
    return;
  }
  const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
  if (data._gotcha) return;

  const endpoint = form.action;
  if (!endpoint || endpoint.includes('REPLACE_ME')) {
    // No form service yet: hand the message to the visitor's email app.
    location.href = mailtoHref(data);
    return;
  }

  const btn = $<HTMLButtonElement>('[data-submit]', form)!;
  btn.disabled = true;
  btn.textContent = 'LOADING…';
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(String(res.status));
    form.hidden = true;
    success.hidden = false;
    success.focus();
    document.body.classList.remove('form-focus');
  } catch {
    status.innerHTML = 'Something went wrong sending that. ';
    const a = Object.assign(document.createElement('a'), { href: mailtoHref(data), textContent: `Email ${form.dataset.email} instead` });
    status.append(a);
  } finally {
    btn.disabled = false;
    btn.textContent = site.contact.button;
  }
});

/* ---------- Konami easter egg ---------- */
if (site.easterEgg.enabled) {
  const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  const toast = $('[data-toast]')!;
  let pos = 0;
  addEventListener('keydown', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = key === code[pos] ? pos + 1 : key === code[0] ? 1 : 0;
    if (pos < code.length) return;
    pos = 0;
    toast.textContent = `★ ${site.easterEgg.toast} ★`;
    toast.hidden = false;
    setTimeout(() => (toast.hidden = true), 3200);
    if (site.easterEgg.blooper) {
      const blooper = { id: 'blooper', brand: site.name, category: '', title: 'Blooper reel', poster: site.easterEgg.blooperPoster, video: site.easterEgg.blooper, videoWebm: '', preview: '', captions: '' };
      openVideo('blooper', document.activeElement as HTMLElement, [blooper]);
    }
  });
}
