/* =========================================================
   CARLOS LÓPEZ — PSICÓLOGO ONLINE
   script.js — interacciones de la landing page (v2)
   JavaScript puro, sin dependencias externas.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------
     1. AÑO DINÁMICO EN EL FOOTER
  ------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* -------------------------------------------------------
     2. NAVBAR: sombra/blur al hacer scroll
  ------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const onScrollNavbar = () => {
    if (window.scrollY > 12) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  };
  onScrollNavbar();
  window.addEventListener('scroll', onScrollNavbar, { passive: true });

  /* -------------------------------------------------------
     3. MENÚ MÓVIL (overlay a pantalla completa)
  ------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    const closeMenu = () => {
      navLinks.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Abrir menú de navegación');
      document.body.style.overflow = '';
    };

    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute(
        'aria-label',
        isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'
      );
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Cierra el menú al hacer click en un link (mobile)
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Cierra el menú con la tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
        closeMenu();
      }
    });
  }

  /* -------------------------------------------------------
     4. BARRA DE PROGRESO DE SCROLL
  ------------------------------------------------------- */
  const scrollProgress = document.getElementById('scrollProgress');
  const onScrollProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (scrollProgress) scrollProgress.style.width = progress + '%';
  };
  onScrollProgress();
  window.addEventListener('scroll', onScrollProgress, { passive: true });

  /* -------------------------------------------------------
     5. ANIMACIONES AL HACER SCROLL (IntersectionObserver)
  ------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -60px 0px' }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* -------------------------------------------------------
     6. ACORDEÓN DE PREGUNTAS FRECUENTES
  ------------------------------------------------------- */
  const faqButtons = document.querySelectorAll('.faq__question');

  faqButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq__item');
      const answer = item.querySelector('.faq__answer');
      const isOpen = button.getAttribute('aria-expanded') === 'true';

      faqButtons.forEach((otherButton) => {
        if (otherButton !== button) {
          otherButton.setAttribute('aria-expanded', 'false');
          const otherAnswer = otherButton.closest('.faq__item').querySelector('.faq__answer');
          otherAnswer.style.maxHeight = null;
        }
      });

      button.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = isOpen ? null : answer.scrollHeight + 'px';
    });
  });

  /* -------------------------------------------------------
     7. SMOOTH SCROLL CON OFFSET (compensa navbar sticky)
  ------------------------------------------------------- */
  const navbarHeight = () => (navbar ? navbar.offsetHeight : 0);

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId.length <= 1) return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight() - 12;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* -------------------------------------------------------
     8. NAV ACTIVO SEGÚN LA SECCIÓN VISIBLE (scroll spy)
  ------------------------------------------------------- */
  const navAnchors = document.querySelectorAll('[data-nav-link]');
  const sectionsWithId = Array.from(navAnchors)
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sectionsWithId.length) {
    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = '#' + entry.target.id;
          const link = document.querySelector(`[data-nav-link][href="${id}"]`);
          if (!link) return;
          if (entry.isIntersecting) {
            navAnchors.forEach((a) => a.classList.remove('is-active'));
            link.classList.add('is-active');
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sectionsWithId.forEach((s) => spyObserver.observe(s));
  }

  /* -------------------------------------------------------
     9. CONTADOR ANIMADO PARA LAS CIFRAS DE CONFIANZA DEL HERO
  ------------------------------------------------------- */
  const countEls = document.querySelectorAll('[data-count-to]');

  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-count-to'), 10);
    const prefix = el.getAttribute('data-count-prefix') || '';
    const suffix = el.getAttribute('data-count-suffix') || '';

    if (prefersReducedMotion || !target) {
      el.textContent = prefix + target + suffix;
      return;
    }

    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(target * eased);
      el.textContent = prefix + value + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window && countEls.length) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    countEls.forEach((el) => countObserver.observe(el));
  } else {
    countEls.forEach(animateCount);
  }

  /* -------------------------------------------------------
     10. SPOTLIGHT AMBIENTAL EN EL HERO (sigue al cursor)
     Solo en dispositivos con mouse; se desactiva con
     prefers-reduced-motion.
  ------------------------------------------------------- */
  const hero = document.getElementById('hero');
  const spotlight = document.getElementById('heroSpotlight');
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  if (hero && spotlight && hasFinePointer && !prefersReducedMotion) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      spotlight.style.setProperty('--mx', x + '%');
      spotlight.style.setProperty('--my', y + '%');
    });
  }

  /* -------------------------------------------------------
     11. TILT SUAVE SOBRE EL RETRATO DEL HERO
     Micro-interacción 3D discreta, solo con mouse fino.
  ------------------------------------------------------- */
  const heroPortrait = document.getElementById('heroPortrait');
  const heroImg = heroPortrait ? heroPortrait.querySelector('.img-placeholder') : null;

  if (heroPortrait && heroImg && hasFinePointer && !prefersReducedMotion) {
    heroPortrait.addEventListener('mousemove', (e) => {
      const rect = heroPortrait.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      heroImg.style.setProperty('--tilt-y', (px * 3.5) + 'deg');
      heroImg.style.setProperty('--tilt-x', (py * -3.5) + 'deg');
    });
    heroPortrait.addEventListener('mouseleave', () => {
      heroImg.style.setProperty('--tilt-y', '0deg');
      heroImg.style.setProperty('--tilt-x', '0deg');
    });
  }

  /* -------------------------------------------------------
     12. REGISTRO SIMPLE DE CLICS EN WHATSAPP (opcional / analítica)
     No envía datos a ningún servidor: queda listo para
     conectarse a Google Analytics / Meta Pixel en el futuro.
  ------------------------------------------------------- */
  document.querySelectorAll('[data-wa-event]').forEach((el) => {
    el.addEventListener('click', () => {
      const origin = el.getAttribute('data-wa-event');
      // TODO: conectar con la herramienta de analítica que se defina (GA4, Meta Pixel, etc.)
      console.info('[contacto-whatsapp] origen:', origin);
    });
  });

});
