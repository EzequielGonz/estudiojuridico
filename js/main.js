document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Header scroll state ---------- */
  const header = document.querySelector('.header');
  const backToTop = document.querySelector('.float-top');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
    backToTop.classList.toggle('is-visible', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const iconMenu = navToggle.querySelector('.icon-menu');
  const iconClose = navToggle.querySelector('.icon-close');

  const closeNav = () => {
    navLinks.classList.remove('is-open');
    iconMenu.style.display = '';
    iconClose.style.display = 'none';
    document.body.style.overflow = '';
  };
  const toggleNav = () => {
    const open = navLinks.classList.toggle('is-open');
    iconMenu.style.display = open ? 'none' : '';
    iconClose.style.display = open ? '' : 'none';
    document.body.style.overflow = open ? 'hidden' : '';
  };
  navToggle.addEventListener('click', toggleNav);
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  const setActive = () => {
    let current = '';
    const pos = window.scrollY + 140;
    sections.forEach(sec => {
      if (pos >= sec.offsetTop) current = sec.id;
    });
    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  };
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const animateCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const decimals = el.getAttribute('data-count').includes('.') ? 1 : 0;
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = decimals ? value.toFixed(1) : Math.round(value).toLocaleString('es-AR');
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = decimals ? target.toFixed(1) : target.toLocaleString('es-AR');
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && counters.length) {
    const cIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(c => cIo.observe(c));
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item.is-open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('is-open');
          openItem.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove('is-open');
        a.style.maxHeight = null;
      } else {
        item.classList.add('is-open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Contact form (mailto fallback, no backend) ---------- */
  const form = document.getElementById('contact-form');
  const successBox = document.getElementById('form-success');
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

      successBox.classList.add('is-visible');
      form.reset();
      setTimeout(() => successBox.classList.remove('is-visible'), 6000);
    });
  }

  /* ---------- Back to top ---------- */
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
