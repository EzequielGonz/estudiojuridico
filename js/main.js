document.addEventListener('DOMContentLoaded', () => {

  const header = document.querySelector('.site-header');
  const utilTop = document.querySelector('.util-top');

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
    utilTop.classList.toggle('show', window.scrollY > 700);
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
