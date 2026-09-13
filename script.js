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
     SYSTEM BOOT
     ============================================ */
  function initBoot() {
    const boot = document.getElementById('boot');
    if (!boot) return Promise.resolve();

    const items = boot.querySelectorAll('.boot-checks li');

    return new Promise((resolve) => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(boot, {
            clipPath: 'inset(0 0 100% 0)',
            duration: reduceMotion ? 0.01 : 0.6,
            ease: 'power3.inOut',
            onComplete: () => {
              boot.style.display = 'none';
              resolve();
            },
          });
        },
      });

      items.forEach((li, i) => {
        const status = li.dataset.status || '';
        const statusEl = li.querySelector('.boot-status');
        tl.call(() => {
          if (statusEl) statusEl.textContent = status;
          li.classList.add('done');
        }, null, i * (reduceMotion ? 0.01 : 0.22));
      });

      tl.to({}, { duration: reduceMotion ? 0.01 : 0.4 });
    });
  }

  /* ============================================
     HERO ANIMATION
     ============================================ */
  function initHeroAnimation() {
    const tl = gsap.timeline({ delay: reduceMotion ? 0 : 0.1 });

    tl.to('.hero-tag', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
      .to('.hero-id', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
      .from('.hero-title .reveal', { yPercent: 110, duration: 0.9, ease: 'power4.out' }, '-=0.35')
      .to('.hero-meta', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
      .to('.hero-actions', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
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

    const hoverables = document.querySelectorAll('a, button, .module');
    hoverables.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        const context = el.dataset.cursor || (el.matches('.module') ? 'INFO' : '');
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
     PROJECT ARCHIVE
     ============================================ */
  function initArchive() {
    const rows = document.querySelectorAll('.archive-row');
    if (!rows.length) return;

    rows.forEach((row) => {
      const btn = row.querySelector('.archive-toggle');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const isOpen = row.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(isOpen));
      });
    });

    if (isTouch) return;

    const tag = document.getElementById('archiveCursorTag');
    const tagText = document.getElementById('archiveCursorTagText');
    if (!tag || !tagText) return;

    const setX = gsap.quickTo(tag, 'x', { duration: 0.4, ease: 'power3.out' });
    const setY = gsap.quickTo(tag, 'y', { duration: 0.4, ease: 'power3.out' });

    window.addEventListener('mousemove', (e) => {
      setX(e.clientX + 20);
      setY(e.clientY + 20);
    });

    rows.forEach((row) => {
      const id = row.dataset.id || '';
      const category = row.querySelector('.archive-category')?.textContent || '';
      row.addEventListener('mouseenter', () => {
        tagText.textContent = `${id} // SCAN — ${category.toUpperCase()}`;
        tag.classList.add('active');
      });
      row.addEventListener('mouseleave', () => {
        tag.classList.remove('active');
      });
    });
  }

  /* ============================================
     ENGINEERING ARCHITECTURE DIAGRAM
     ============================================ */
  function initArchitectureDiagram() {
    const diagram = document.getElementById('archDiagram');
    if (!diagram) return;

    const nodes = diagram.querySelectorAll('.arch-node');
    const connectors = diagram.querySelectorAll('.arch-connector');
    const branches = diagram.querySelectorAll('.arch-branch');
    const led = document.getElementById('archLed');
    const statusText = document.getElementById('archStatusText');
    const steps = nodes.length;

    ScrollTrigger.create({
      trigger: diagram,
      start: 'top 75%',
      end: 'bottom 60%',
      scrub: 0.6,
      onUpdate: (self) => {
        const activeCount = Math.ceil(self.progress * steps);

        nodes.forEach((n, i) => n.classList.toggle('active', i < activeCount));
        connectors.forEach((c, i) => c.classList.toggle('active', i < activeCount - 1));
        branches.forEach((b) => b.classList.toggle('active', activeCount > 2));

        const complete = activeCount >= steps;
        if (led) led.classList.toggle('live', complete);
        connectors.forEach((c) => c.classList.toggle('running', complete));

        if (statusText) {
          if (complete) statusText.textContent = 'SYSTEM ONLINE';
          else if (activeCount <= 1) statusText.textContent = 'SYSTEM STANDBY';
          else statusText.textContent = 'BOOTING SERVICES...';
        }
      },
    });
  }

  /* ============================================
     EXPERIENCE TIMELINE
     ============================================ */
  function initTimeline() {
    const timeline = document.getElementById('timeline');
    const rail = document.getElementById('timelineFill');
    if (!timeline || !rail) return;

    ScrollTrigger.create({
      trigger: timeline,
      start: 'top 75%',
      end: 'bottom 80%',
      scrub: 0.6,
      onUpdate: (self) => {
        rail.style.height = `${self.progress * 100}%`;
      },
    });

    gsap.utils.toArray('.timeline-row').forEach((row) => {
      const items = row.querySelectorAll('.timeline-list li');
      const tags = row.querySelector('.timeline-tags');
      const tagSpans = row.querySelectorAll('.timeline-tags span');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: row,
          start: 'top 85%',
          toggleClass: { targets: row, className: 'in-view' },
        },
      });

      tl.from(row.querySelector('.timeline-year'), { x: -16, opacity: 0, duration: 0.6, ease: 'power3.out' })
        .from(row.querySelector('.timeline-card'), { y: 18, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
        .from(row.querySelector('.timeline-company'), { y: 12, opacity: 0, duration: 0.5, ease: 'power3.out' }, '-=0.4')
        .from(row.querySelector('.timeline-role'), { y: 10, opacity: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3')
        .from(items, { y: 10, opacity: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }, '-=0.25')
        .from(tags, { opacity: 0, duration: 0.3 }, '-=0.15')
        .from(tagSpans, { y: 8, opacity: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' }, '-=0.2');
    });
  }

  /* ============================================
     TECHNOLOGY MATRIX
     ============================================ */
  function initMatrix() {
    const modules = document.querySelectorAll('.module');
    if (!modules.length) return;

    modules.forEach((btn) => {
      btn.addEventListener('click', () => {
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        modules.forEach((b) => b.setAttribute('aria-expanded', 'false'));
        btn.setAttribute('aria-expanded', String(!isOpen));
      });
    });

    gsap.utils.toArray('.matrix-col').forEach((el, i) => {
      const modules = el.querySelectorAll('.module');
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleClass: { targets: el, className: 'active' },
        },
        delay: (i % 3) * 0.08,
      });
      tl.from(el, { y: 24, opacity: 0, duration: 0.6, ease: 'power3.out' })
        .from(modules, { y: 12, opacity: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }, '-=0.35');
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
     SCROLL REVEALS (general)
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

    const terminal = document.querySelector('.terminal');
    if (terminal) {
      gsap.from(terminal, {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: terminal, start: 'top 88%' },
      });
    }
  }

  /* ============================================
     CONTACT TERMINAL TYPING
     ============================================ */
  function initTerminalTyping() {
    const el = document.getElementById('terminalReadyText');
    const terminal = document.querySelector('.terminal');
    if (!el || !terminal) return;

    const fullText = '> READY FOR CONNECTION.';

    if (reduceMotion) {
      el.textContent = fullText;
      return;
    }

    ScrollTrigger.create({
      trigger: terminal,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        let i = 0;
        const iv = setInterval(() => {
          i += 1;
          el.textContent = fullText.slice(0, i);
          if (i >= fullText.length) clearInterval(iv);
        }, 26);
      },
    });
  }

  /* ============================================
     SYSTEM ASSISTANT (PM-09)
     ============================================ */
  function initSystemAssistant() {
    const dial = document.getElementById('assistantDial');
    const bubble = document.getElementById('assistantBubble');
    const text = document.getElementById('assistantText');
    const needle = document.getElementById('dialNeedle');
    if (!dial || !bubble || !text) return;

    let hideTimer = null;

    const showMessage = (msg) => {
      text.textContent = msg;
      bubble.classList.add('show');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => bubble.classList.remove('show'), 3200);
    };

    if (!reduceMotion && needle) {
      gsap.to(needle, {
        rotation: 360,
        transformOrigin: '50% 50%',
        svgOrigin: '30 30',
        duration: 9,
        repeat: -1,
        ease: 'none',
      });
    }

    dial.addEventListener('click', () => showMessage('SYSTEM READY.'));

    const assistantEl = document.getElementById('assistant');
    const hero = document.getElementById('top');
    if (assistantEl && hero) {
      ScrollTrigger.create({
        trigger: hero,
        start: 'bottom top',
        onEnter: () => {
          assistantEl.classList.add('visible');
          showMessage('SYSTEM READY.');
        },
        onLeaveBack: () => assistantEl.classList.remove('visible'),
      });
    }

    const triggers = [
      { selector: '#projects', message: 'PROJECT SCANNED.' },
      { selector: '#architecture', message: 'API CONNECTION STABLE.' },
      { selector: '#experience', message: 'TIMELINE UPDATED.' },
      { selector: '#contact', message: 'CHANNEL OPEN.' },
    ];

    triggers.forEach(({ selector, message }) => {
      const el = document.querySelector(selector);
      if (!el) return;
      ScrollTrigger.create({
        trigger: el,
        start: 'top 60%',
        once: true,
        onEnter: () => showMessage(message),
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
     ACCESSIBILITY / ANCHOR SCROLL
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
    initArchive();
    initArchitectureDiagram();
    initTimeline();
    initMatrix();
    initTechMarquee();
    initMagneticButtons();
    initScrollAnimations();
    initTerminalTyping();
    initSystemAssistant();
    initBackToTop();
    initAccessibility();

    initBoot().then(() => {
      initHeroAnimation();
      ScrollTrigger.refresh();
    });

    window.addEventListener('load', () => ScrollTrigger.refresh());
  });
})();
