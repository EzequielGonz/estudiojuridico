document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Theme toggle (dark by default) ---------- */
  const THEME_KEY = 'vita-theme';
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      const next = isLight ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore (private mode) */ }
    });
  }

  /* ---------- Hero title word-split (must run before preloader fades) ---------- */
  const heroTitle = document.getElementById('hero-title');
  if (heroTitle) {
    const words = heroTitle.textContent.trim().split(/\s+/);
    heroTitle.innerHTML = words.map((w, i) =>
      `<span class="word"><span class="word-inner" style="transition-delay:${(i * 0.045).toFixed(3)}s">${w}</span></span>`
    ).join(' ');
  }

  /* ---------- Preloader ---------- */
  (function preloader() {
    const pre = document.getElementById('preloader');
    const fill = document.getElementById('preloader-bar-fill');
    if (!pre) return;
    const start = performance.now();
    const minDisplay = reduceMotion ? 0 : 1100;
    let done = false;

    const tick = () => {
      if (done) return;
      const elapsed = performance.now() - start;
      const target = Math.min(90, (elapsed / 1400) * 90);
      fill.style.width = target + '%';
      requestAnimationFrame(tick);
    };
    if (fill) requestAnimationFrame(tick);

    const finish = () => {
      if (done) return;
      done = true;
      const elapsed = performance.now() - start;
      const wait = Math.max(0, minDisplay - elapsed);
      setTimeout(() => {
        if (fill) fill.style.width = '100%';
        setTimeout(() => {
          pre.classList.add('done');
          document.body.classList.remove('is-loading');
          const hero = document.querySelector('.hero');
          if (hero) hero.classList.add('loaded');
        }, reduceMotion ? 0 : 260);
      }, wait);
    };

    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish);
    // Safety net: never block the site if 'load' is delayed by a slow asset.
    setTimeout(finish, 5000);
  })();

  /* ---------- Header scroll state, back-to-top, scroll progress ---------- */
  const header = document.querySelector('.site-header');
  const utilTop = document.querySelector('.util-top');
  const progressBar = document.getElementById('scroll-progress-bar');

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
    utilTop.classList.toggle('show', window.scrollY > 700);
    if (progressBar) {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      progressBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Desktop dropdown menus ---------- */
  const menuItems = document.querySelectorAll('.menu-item.has-sub');
  const closeAllMenus = () => menuItems.forEach(mi => mi.classList.remove('open'));

  menuItems.forEach(item => {
    const trigger = item.querySelector('button');
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !item.classList.contains('open');
      closeAllMenus();
      if (willOpen) item.classList.add('open');
    });
  });
  document.addEventListener('click', closeAllMenus);

  /* ---------- Mobile drawer ---------- */
  const drawer = document.querySelector('.drawer');
  const burger = document.querySelector('.burger');
  const drawerClose = document.querySelector('.drawer-close');
  const drawerBackdrop = document.querySelector('.drawer-backdrop');

  const openDrawer = () => { drawer.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const closeDrawer = () => { drawer.classList.remove('open'); document.body.style.overflow = ''; };

  burger.addEventListener('click', openDrawer);
  drawerClose.addEventListener('click', closeDrawer);
  drawerBackdrop.addEventListener('click', closeDrawer);
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

  /* ---------- Active link on scroll ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const links = document.querySelectorAll('.menu a[href^="#"], .submenu a[href^="#"]');
  const markActive = () => {
    let current = '';
    const pos = window.scrollY + 150;
    sections.forEach(sec => { if (pos >= sec.offsetTop) current = sec.id; });
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  };
  window.addEventListener('scroll', markActive, { passive: true });
  markActive();

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-in]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('shown');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('shown'));
  }

  /* ---------- Parallax (desktop only) ---------- */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && !reduceMotion && window.innerWidth > 860) {
    let ticking = false;
    const updateParallax = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.15;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - vh / 2;
        el.style.transform = `translateY(${(center * -speed).toFixed(1)}px)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
    }, { passive: true });
    updateParallax();
  }

  /* ---------- Custom cursor, magnetic buttons, card tilt (fine pointer only) ---------- */
  if (canFine && !reduceMotion) {
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');

    let mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      document.body.classList.add('has-cursor');
      if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }
    });
    document.addEventListener('mouseleave', () => document.body.classList.remove('has-cursor'));
    const ringLoop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
      requestAnimationFrame(ringLoop);
    };
    ringLoop();

    document.querySelectorAll('a, button, .practice-row, input, textarea, select').forEach(el => {
      el.addEventListener('mouseenter', () => ring && ring.classList.add('hovered'));
      el.addEventListener('mouseleave', () => ring && ring.classList.remove('hovered'));
    });

    /* Magnetic buttons */
    document.querySelectorAll('.btn:not(.btn-block), .util-btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${(x * 0.25).toFixed(1)}px, ${(y * 0.35).toFixed(1)}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });

    /* Tilt cards */
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${(px * 7).toFixed(2)}deg) rotateX(${(py * -7).toFixed(2)}deg)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-row').forEach(row => {
    const q = row.querySelector('.faq-q');
    const a = row.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = row.classList.contains('open');
      document.querySelectorAll('.faq-row.open').forEach(openRow => {
        if (openRow !== row) {
          openRow.classList.remove('open');
          openRow.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      if (isOpen) {
        row.classList.remove('open');
        a.style.maxHeight = null;
      } else {
        row.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Contact form (no backend — mailto fallback) ---------- */
  const form = document.getElementById('contact-form');
  const formOk = document.getElementById('form-ok');
  const FIRM_EMAIL = 'estudiojuridicointegralvita@gmail.com';

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const data = new FormData(form);
      const nombre = data.get('nombre');
      const email = data.get('email');
      const telefono = data.get('telefono') || 'No indicado';
      const area = data.get('area');
      const mensaje = data.get('mensaje');

      const subject = encodeURIComponent(`Consulta legal — ${nombre}`);
      const body = encodeURIComponent(
        `Nombre: ${nombre}\nEmail: ${email}\nTeléfono: ${telefono}\nÁrea de interés: ${area}\n\nMensaje:\n${mensaje}`
      );
      window.location.href = `mailto:${FIRM_EMAIL}?subject=${subject}&body=${body}`;

      formOk.classList.add('show');
      form.reset();
      setTimeout(() => formOk.classList.remove('show'), 6000);
    });
  }

  /* ---------- Back to top ---------- */
  utilTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
