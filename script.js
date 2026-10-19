/* =========================================================
   Halloween Mágico — interações (v3)
   ========================================================= */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const buzz = (p = 12) => { if (navigator.vibrate) { try { navigator.vibrate(p); } catch (e) {} } };

  /* ---------- Ano ---------- */
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ---------- Ripple ---------- */
  $$('.ripple').forEach((el) => {
    el.addEventListener('pointerdown', (e) => {
      const r = el.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const rip = document.createElement('span');
      rip.className = 'rip';
      rip.style.width = rip.style.height = size + 'px';
      rip.style.left = (e.clientX - r.left - size / 2) + 'px';
      rip.style.top = (e.clientY - r.top - size / 2) + 'px';
      el.appendChild(rip);
      setTimeout(() => rip.remove(), 600);
      buzz(10);
    });
  });

  /* ---------- Scroll suave ---------- */
  $$('[data-scroll]').forEach((b) => b.addEventListener('click', () => {
    const t = $(b.getAttribute('data-scroll'));
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  /* ---------- Progress bar ---------- */
  const prog = $('#scrollProgress');
  const onScroll = () => {
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    if (prog) prog.style.width = Math.min(100, p * 100) + '%';
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Tilt 3D (seguindo o toque/mouse) ---------- */
  if (!reduce) {
    $$('[data-tilt]').forEach((el) => {
      const strength = 10;
      const move = (x, y) => {
        const r = el.getBoundingClientRect();
        const px = (x - r.left) / r.width - 0.5;
        const py = (y - r.top) / r.height - 0.5;
        el.style.transform = `perspective(800px) rotateY(${px * strength}deg) rotateX(${-py * strength}deg) scale(1.01)`;
      };
      const reset = () => { el.style.transform = ''; };
      el.addEventListener('pointermove', (e) => move(e.clientX, e.clientY));
      el.addEventListener('pointerleave', reset);
      el.addEventListener('pointercancel', reset);
    });
  }

  /* ---------- Botão magnético (chip) ---------- */
  if (!reduce) {
    $$('[data-magnet]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${mx * 0.2}px, ${my * 0.3}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Abas / slides ---------- */
  const tabs = $$('.tab'), slides = $$('.slide');
  tabs.forEach((tab) => tab.addEventListener('click', () => {
    const i = tab.getAttribute('data-tab');
    tabs.forEach((t) => t.classList.remove('is-active'));
    slides.forEach((p) => p.classList.remove('is-active'));
    tab.classList.add('is-active');
    const s = $(`.slide[data-panel="${i}"]`);
    if (s) s.classList.add('is-active');
    buzz(10);
  }));

  /* ---------- FAQ ---------- */
  $$('.qa').forEach((qa) => {
    const q = $('.qa__q', qa), a = $('.qa__a', qa);
    q.addEventListener('click', () => {
      const open = qa.classList.contains('open');
      $$('.qa.open').forEach((o) => { if (o !== qa) { o.classList.remove('open'); $('.qa__a', o).style.maxHeight = null; } });
      qa.classList.toggle('open', !open);
      a.style.maxHeight = open ? null : a.scrollHeight + 'px';
      buzz(10);
    });
  });

  /* ---------- Timer 24h ---------- */
  (function () {
    const KEY = 'hw_deadline', DUR = 24 * 36e5;
    let dl = Number(localStorage.getItem(KEY));
    if (!dl || dl < Date.now()) { dl = Date.now() + DUR; localStorage.setItem(KEY, String(dl)); }
    const th = $('#th'), tm = $('#tm'), ts = $('#ts');
    if (!th) return;
    const pad = (n) => String(n).padStart(2, '0');
    const tick = () => {
      let d = dl - Date.now();
      if (d <= 0) { dl = Date.now() + DUR; localStorage.setItem(KEY, String(dl)); d = DUR; }
      const s = Math.floor(d / 1000);
      th.textContent = pad(Math.floor(s / 3600));
      tm.textContent = pad(Math.floor((s % 3600) / 60));
      ts.textContent = pad(s % 60);
    };
    tick(); setInterval(tick, 1000);
  })();

  /* ---------- Dock ---------- */
  const dock = $('#dock'), hero = $('.hero');
  if (dock && 'IntersectionObserver' in window && hero) {
    new IntersectionObserver(([e]) => dock.classList.toggle('show', !e.isIntersecting), { rootMargin: '-70% 0px 0px 0px' }).observe(hero);
  } else if (dock) {
    document.addEventListener('scroll', () => dock.classList.toggle('show', scrollY > 500), { passive: true });
  }

  /* ---------- Reveal ---------- */
  const rev = $$('.section, .offer__card, .guarantee');
  rev.forEach((el) => el.classList.add('reveal'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
    rev.forEach((el) => io.observe(el));
  } else rev.forEach((el) => el.classList.add('in'));

  /* ---------- Lightbox (zoom nas imagens) ---------- */
  const lb = $('#lightbox'), lbImg = $('#lightboxImg'), lbClose = $('#lightboxClose');
  const openLB = (src, alt) => {
    if (!lb) return;
    lbImg.src = src; lbImg.alt = alt || '';
    lb.classList.add('show'); lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeLB = () => { if (!lb) return; lb.classList.remove('show'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
  $$('[data-lightbox]').forEach((fig) => {
    fig.addEventListener('click', () => {
      const img = $('img', fig);
      if (img && img.currentSrc) { openLB(img.currentSrc, img.alt); buzz(12); }
    });
  });
  if (lbClose) lbClose.addEventListener('click', closeLB);
  if (lb) lb.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLB(); });

  /* ---------- Compra ---------- */
  // 🔧 Troque pela URL do seu checkout (Hotmart/Kiwify/Eduzz…)
  const CHECKOUT_URL = '#';
  const toast = $('#toast');
  const showToast = (m) => { if (!toast) return; if (m) $('.toast__msg', toast).textContent = m; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2600); };
  const doBuy = (btn) => {
    buzz([14, 40, 14]);
    const label = btn && ($('.buyBtn__label', btn) || $('span', btn));
    const orig = label ? label.textContent : '';
    if (label) label.textContent = 'Processando…';
    if (btn) btn.style.pointerEvents = 'none';
    setTimeout(() => {
      showToast(CHECKOUT_URL === '#' ? 'Configure seu link de checkout 🔗' : 'Redirecionando…');
      if (label) label.textContent = orig;
      if (btn) btn.style.pointerEvents = '';
      if (CHECKOUT_URL !== '#') location.href = CHECKOUT_URL;
    }, 900);
  };
  const buyBtn = $('#buyBtn'), dockBtn = $('#dockBtn');
  if (buyBtn) buyBtn.addEventListener('click', () => doBuy(buyBtn));
  if (dockBtn) dockBtn.addEventListener('click', () => {
    const o = $('#comprar'); if (o) o.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => doBuy(buyBtn), 650);
  });
})();
