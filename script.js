(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  gsap.registerPlugin(ScrollTrigger);

  let lenis = null;

  /* ============================================
     LENIS
     ============================================ */
  function initLenis() {
    if (reduceMotion) return;

    lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  /* ============================================
     LOADER
     ============================================ */
  function initLoader() {
    const loader = document.getElementById('loader');
    const progress = document.getElementById('loaderProgress');
    if (!loader) return Promise.resolve();

    return new Promise((resolve) => {
      const tl = gsap.timeline({
        onComplete: () => {
          loader.style.display = 'none';
          resolve();
        },
      });

      tl.to(progress, { width: '100%', duration: reduceMotion ? 0.01 : 0.9, ease: 'power2.inOut' })
        .to(loader, {
          clipPath: 'inset(0 0 100% 0)',
          duration: reduceMotion ? 0.01 : 0.6,
          ease: 'power3.inOut',
          delay: 0.05,
        });
    });
  }

  /* ============================================
     HERO ANIMATION
     ============================================ */
  function initHeroAnimation() {
    const tl = gsap.timeline({ delay: reduceMotion ? 0 : 0.15 });

    tl.from('.hero-meta-top', { y: 14, opacity: 0, duration: 0.7, ease: 'power3.out' })
      .from('.hero-title .reveal', { yPercent: 110, duration: 0.9, ease: 'power4.out' }, '-=0.35')
      .from('.hero-role .reveal', { yPercent: 110, duration: 0.7, ease: 'power4.out' }, '-=0.55')
      .from('.hero-description', { y: 16, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.35')
      .from('.hero-actions', { y: 16, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
      .to('.hero-visual-frame', { clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'power3.inOut' }, '-=0.6')
      .call(() => document.querySelector('.hero-visual')?.classList.add('revealed'), null, '<0.3')
      .from('.scroll-indicator', { opacity: 0, duration: 0.6 }, '-=0.3');
  }

  /* ============================================
     NAVIGATION
     ============================================ */
  function initNavigation() {
    const nav = document.getElementById('siteNav');
    if (!nav) return;

    ScrollTrigger.create({
      start: 'top -80',
      end: 99999,
      onUpdate: (self) => {
        nav.classList.toggle('scrolled', self.scroll() > 80);
      },
    });

    const toggle = document.getElementById('menuToggle');
    const menu = document.getElementById('mobileMenu');
    if (!toggle || !menu) return;

    const closeMenu = () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      if (lenis) lenis.start();
    };

    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      if (lenis) isOpen ? lenis.stop() : lenis.start();
    });

    menu.querySelectorAll('.mobile-link').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  }

  /* ============================================
     CUSTOM CURSOR
     ============================================ */
  function initCursor() {
    if (isTouch || reduceMotion) return;

    const cursor = document.getElementById('cursor');
    const label = document.getElementById('cursorLabel');
    if (!cursor) return;

    const setX = gsap.quickTo(cursor, 'x', { duration: 0.4, ease: 'power3.out' });
    const setY = gsap.quickTo(cursor, 'y', { duration: 0.4, ease: 'power3.out' });

    window.addEventListener('mousemove', (e) => {
      cursor.classList.add('active');
      setX(e.clientX);
      setY(e.clientY);
    });

    const hoverables = document.querySelectorAll('a, button, .work-row, .stack-column li');
    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        const context = el.dataset.cursor
          || (el.matches('.work-row') ? 'view' : '')
          || (el.closest('.stack-column') ? 'info' : '');
        if (context) {
          cursor.classList.add('link');
          if (label) label.textContent = context.toUpperCase();
        }
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover', 'link');
      });
    });
  }

  /* ============================================
     PROJECT INTERACTIONS (cursor preview)
     ============================================ */
  function initProjectInteractions() {
    if (isTouch) return;

    const preview = document.getElementById('workPreview');
    const rows = document.querySelectorAll('.work-row');
    if (!preview || !rows.length) return;

    const setX = gsap.quickTo(preview, 'x', { duration: 0.5, ease: 'power3.out' });
    const setY = gsap.quickTo(preview, 'y', { duration: 0.5, ease: 'power3.out' });

    window.addEventListener('mousemove', (e) => {
      setX(e.clientX + 24);
      setY(e.clientY - 75);
    });

    rows.forEach((row) => {
      const targetId = row.dataset.preview;
      row.addEventListener('mouseenter', () => {
        preview.classList.add('active');
        document.querySelectorAll('.work-preview-inner').forEach((el) => {
          el.classList.toggle('show', el.id === targetId);
        });
      });
      row.addEventListener('mouseleave', () => {
        preview.classList.remove('active');
      });
    });
  }

  /* ============================================
     SCROLL ANIMATIONS (general reveals)
     ============================================ */
  function initScrollAnimations() {
    gsap.utils.toArray('.philosophy-statement, .philosophy-text').forEach((el) => {
      gsap.from(el, {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });

    gsap.utils.toArray('.system-line').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        ease: 'power2.out',
        delay: i * 0.06,
        scrollTrigger: { trigger: '.system-diagram', start: 'top 85%' },
      });
    });

    gsap.utils.toArray('.work-row').forEach((el) => {
      gsap.from(el, {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 92%' },
      });
    });

    gsap.utils.toArray('.stack-column').forEach((el, i) => {
      gsap.from(el, {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        delay: (i % 4) * 0.08,
        scrollTrigger: { trigger: el, start: 'top 92%' },
      });
    });

    const contactStatement = document.querySelector('.contact-statement');
    if (contactStatement) {
      gsap.from(contactStatement, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: contactStatement, start: 'top 90%' },
      });
    }

    const eduRow = document.querySelector('.education-row');
    if (eduRow) {
      gsap.from(eduRow, {
        y: 20,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: eduRow, start: 'top 92%' },
      });
    }
  }

  /* ============================================
     EXPERIENCE ANIMATIONS
     ============================================ */
  function initExperienceAnimations() {
    gsap.utils.toArray('.timeline-row').forEach((row) => {
      const year = row.querySelector('.timeline-year');
      const items = row.querySelectorAll('.timeline-list li');
      const tags = row.querySelector('.timeline-tags');

      const tl = gsap.timeline({
        scrollTrigger: { trigger: row, start: 'top 85%' },
      });

      tl.from(year, { x: -20, opacity: 0, duration: 0.6, ease: 'power3.out' })
        .from(row.querySelector('.timeline-company'), { y: 14, opacity: 0, duration: 0.5, ease: 'power3.out' }, '-=0.35')
        .from(row.querySelector('.timeline-role'), { y: 10, opacity: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3')
        .from(items, { y: 10, opacity: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }, '-=0.25')
        .from(tags, { opacity: 0, duration: 0.4 }, '-=0.15');
    });
  }

  /* ============================================
     BUILD SYSTEM FLOW
     ============================================ */
  function initBuildSystem() {
    const flow = document.getElementById('buildFlow');
    if (!flow) return;

    const nodes = flow.querySelectorAll('.build-node');
    const connectors = flow.querySelectorAll('.build-connector');
    const steps = nodes.length;

    ScrollTrigger.create({
      trigger: flow,
      start: 'top 75%',
      end: 'bottom 55%',
      scrub: 0.5,
      onUpdate: (self) => {
        const activeCount = Math.round(self.progress * steps);
        nodes.forEach((node, i) => node.classList.toggle('active', i < activeCount));
        connectors.forEach((c, i) => c.classList.toggle('active', i < activeCount - 1));
      },
    });
  }

  /* ============================================
     TECH MARQUEE
     ============================================ */
  function initTechMarquee() {
    const track = document.querySelector('.marquee-track');
    if (!track || reduceMotion) return;

    const width = track.scrollWidth / 2;

    const tween = gsap.to(track, {
      x: -width,
      duration: 28,
      ease: 'none',
      repeat: -1,
    });

    track.parentElement.addEventListener('mouseenter', () => tween.timeScale(0.25));
    track.parentElement.addEventListener('mouseleave', () => tween.timeScale(1));
  }

  /* ============================================
     MAGNETIC BUTTONS
     ============================================ */
  function initMagneticButtons() {
    if (isTouch || reduceMotion) return;

    document.querySelectorAll('.magnetic').forEach((btn) => {
      const setX = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
      const setY = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        setX(relX * 0.3);
        setY(relY * 0.4);
      });

      btn.addEventListener('mouseleave', () => {
        setX(0);
        setY(0);
      });
    });
  }

  /* ============================================
     BACK TO TOP
     ============================================ */
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    btn.addEventListener('click', () => {
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
  }

  /* ============================================
     ACCESSIBILITY
     ============================================ */
  function initAccessibility() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { duration: 1.2, offset: -70 });
        } else {
          target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ============================================
     INIT
     ============================================ */
  document.addEventListener('DOMContentLoaded', () => {
    initLenis();
    initNavigation();
    initCursor();
    initProjectInteractions();
    initExperienceAnimations();
    initScrollAnimations();
    initBuildSystem();
    initTechMarquee();
    initMagneticButtons();
    initBackToTop();
    initAccessibility();

    initLoader().then(() => {
      initHeroAnimation();
      ScrollTrigger.refresh();
    });

    window.addEventListener('load', () => ScrollTrigger.refresh());
  });
})();
