// GoCilento — sistema di movimento cinematografico.
// GSAP 3.13 + ScrollTrigger + Lenis 1.3, vendorizzati in assets/vendor/.
// Nessun bundler, nessun import: le librerie sono globali UMD (ADR-001).
//
// Regola: questo file non contiene contenuti e non deve mai impedire
// la lettura della pagina. Se una libreria manca, non parte e basta.

(function () {
  'use strict';

  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ───────────── guardie ─────────────
  // NB: l'avvio sta in FONDO al file. Se lo chiamassi qui, le
  // dichiarazioni var sotto (lenis, preset) sarebbero ancora undefined.

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  var Lenis = window.Lenis;

  // ───────────── core ─────────────

  var lenis = null;
  var cursore = null;
  var cursorLabel = null;

  function initAll(smooth) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: 'power3.out', duration: 0.85 });
    doc.classList.add('has-motion');

    if (smooth) {
      lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    initHero();
    initTextReveals();
    initScrollReveals();
    initImageReveals();
    initParallax();
    initMagnetic();
    initCursor();

    if (lenis) window.__goCilentoLenis = lenis;   // lo usa app.js per "torna in cima"

    // Le ancore le porta Lenis: il salto nativo del browser taglierebbe
    // di netto lo scroll morbido, e su questo sito sono la via principale
    // di navigazione (il CTA dell'hero, i 20 collegamenti alle destinazioni).
    if (lenis) {
      document.addEventListener('click', function (e) {
        var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
        if (!a) return;
        var href = a.getAttribute('href');
        if (!href || href === '#') return;
        var dest = document.querySelector(href);
        if (!dest) return;
        e.preventDefault();
        lenis.scrollTo(dest, { offset: -16, duration: 1.4 });
      });
    }

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });

    // Stessa logica del salvagente dell'hero, per il resto della pagina:
    // se un trigger non ha mai girato, ciò che l'utente ha gia' superato
    // resterebbe invisibile. Completo solo quello che e' gia' passato,
    // non quello che sta sotto: le animazioni future restano intatte.
    window.setTimeout(function () {
      ScrollTrigger.refresh();
      ScrollTrigger.getAll().forEach(function (t) {
        if (t.animation && t.start != null && window.scrollY >= t.start - 1) {
          t.animation.progress(1);
        }
      });
    }, 2200);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && lenis) lenis.stop();
      else if (lenis) lenis.start();
      if (document.hidden) gsap.globalTimeline.pause();
      else gsap.globalTimeline.resume();
    });
  }

  // ───────────── hero: media, titolo, copia, CTA ─────────────
  // Coreografia: sfondo per primo, titolo poi, testo, bottone per ultimo.

  function initHero() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo('.hero__media',
      { opacity: 0, scale: 1.04 },
      { opacity: 1, scale: 1, duration: 1.5, ease: 'power2.out' }, 0);

    tl.fromTo('.hero__kicker',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.8 }, 0.35);

    tl.fromTo('.hero__line',
      { opacity: 0, yPercent: 45, filter: 'blur(6px)' },
      { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 1.1, stagger: 0.1 }, 0.5);

    tl.fromTo('.hero__text',
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.9 }, 0.85);

    tl.fromTo('.cta-solid',
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.8 }, 1.0);

    tl.fromTo('.hero__micro',
      { opacity: 0 },
      { opacity: 1, duration: 0.7 }, 1.15);

    tl.fromTo('.nav',
      { opacity: 0, y: -14 },
      { opacity: 1, y: 0, duration: 0.9 }, 0.15);

    // Salvagente: requestAnimationFrame non scatta in un tab in
    // background o sotto throttling, e l'hero resterebbe a opacity 0
    // per sempre. I timer invece girano sempre: se la timeline non e'
    // advanced, la completo. Il contenuto non deve mai restare nascosto.
    window.setTimeout(function () {
      if (tl.progress() === 0) tl.progress(1);
    }, 1600);
  }

  // ───────────── testo che sale, parola per parola ─────────────

  function initTextReveals() {
    gsap.utils.toArray('[data-motion-text="words"]').forEach(function (el) {
      if (el.dataset.motionSplit === 'true') return;

      var testo = el.textContent || '';
      var parti = testo.split(/(\s+)/);
      el.textContent = '';
      el.setAttribute('aria-label', testo.trim());

      var n = 0;
      parti.forEach(function (parte) {
        if (!parte.trim()) { el.appendChild(document.createTextNode(parte)); return; }
        var maschera = document.createElement('span');
        var parola = document.createElement('span');
        maschera.className = 'motion-word-mask';
        maschera.setAttribute('aria-hidden', 'true');
        parola.className = 'motion-word';
        parola.textContent = parte;
        maschera.appendChild(parola);
        el.appendChild(maschera);
        n++;
      });
      el.dataset.motionSplit = 'true';

      gsap.fromTo(el.querySelectorAll('.motion-word'),
        { yPercent: 110, opacity: 0, filter: 'blur(8px)' },
        {
          yPercent: 0, opacity: 1, filter: 'blur(0px)',
          duration: 0.9, ease: 'power4.out', stagger: 0.045,
          scrollTrigger: { trigger: el, start: 'top 84%', once: true }
        });
    });
  }

  // ───────────── rivelazioni allo scroll ─────────────

  var preset = {
    'fade-up': { from: { y: 32, opacity: 0 }, to: { y: 0, opacity: 1 } },
    'blur-in': { from: { y: 18, opacity: 0, filter: 'blur(10px)' }, to: { y: 0, opacity: 1, filter: 'blur(0px)' } },
    'slide-left': { from: { x: 44, opacity: 0 }, to: { x: 0, opacity: 1 } }
  };

  function initScrollReveals() {
    // le card .rv erano animate da IntersectionObserver in app.js:
    // ora le conduce GSAP, raggruppate per contenitore.
    var gruppiRv = new Map();
    gsap.utils.toArray('.rv').forEach(function (el) {
      if (el.dataset.rv === 'done') return;
      el.dataset.rv = 'done';
      var padre = el.parentElement;
      if (!padre) return;
      if (!gruppiRv.has(padre)) gruppiRv.set(padre, []);
      gruppiRv.get(padre).push(el);
    });

    gruppiRv.forEach(function (items, contenitore) {
      gsap.fromTo(items,
        { y: 34, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.9, ease: 'power4.out', stagger: 0.07,
          scrollTrigger: { trigger: contenitore, start: 'top 84%', once: true }
        });
    });

    gsap.utils.toArray('[data-reveal-group]').forEach(function (gruppo) {
      var items = gruppo.querySelectorAll('[data-reveal-item]');
      if (!items.length) return;
      gsap.fromTo(items,
        { y: 36, opacity: 0, filter: 'blur(6px)' },
        {
          y: 0, opacity: 1, filter: 'blur(0px)',
          duration: 0.95, ease: 'power4.out', stagger: 0.07,
          scrollTrigger: { trigger: gruppo, start: 'top 82%', once: true }
        });
    });

    gsap.utils.toArray('[data-reveal]:not([data-reveal-item])').forEach(function (el) {
      var p = preset[el.dataset.reveal] || preset['fade-up'];
      gsap.fromTo(el, p.from, {
        y: p.to.y, x: p.to.x, opacity: 1,
        filter: p.to.filter || 'none',
        duration: 0.9, ease: 'power4.out',
        delay: Number(el.dataset.revealDelay || 0),
        scrollTrigger: { trigger: el, start: 'top 84%', once: true }
      });
    });
  }

  // ───────────── immagini: clip + parallasse ─────────────

  function initImageReveals() {
    gsap.utils.toArray('[data-image-reveal]').forEach(function (fig) {
      var img = fig.querySelector('img');
      var tl = gsap.timeline({
        scrollTrigger: { trigger: fig, start: 'top 84%', once: true }
      });
      tl.fromTo(fig,
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power4.out' })
        .fromTo(img,
          { scale: 1.07 },
          { scale: 1, duration: 1.2, ease: 'power4.out' }, 0);
    });
  }

  function initParallax() {
    gsap.utils.toArray('[data-parallax-image]').forEach(function (img) {
      var velocita = Number(img.dataset.parallaxSpeed || 0.14);
      var sezione = img.closest('[data-parallax-section]');
      if (!sezione) return;                       // senza contenitore non serve
      var percorso = function () { return window.innerHeight * velocita; };

      // La foto e' alta quanto il contenitore, quindi basta spostarla
      // verso l'alto per scoprire una fascia vuota sotto. Le do'
      // esattamente il margine che il percorso richiede, ricalcolato
      // a ogni refresh: se la finestra cambia, cambia anche la foto.
      function adatta() {
        // +15% di margine: a fine corsa la foto arriva a filo del bordo,
        // e un arrotondamento o un resize potrebbe lasciare una riga vuota.
        sezione.style.setProperty('--parallax-extra',
          Math.ceil(percorso() * 1.15) + 10 + 'px');
      }
      adatta();

      gsap.to(img, {
        y: function () { return -percorso(); },
        ease: 'none',
        onRefresh: adatta,
        scrollTrigger: {
          trigger: sezione,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
          invalidateOnRefresh: true
        }
      });
    });
  }

  // ───────────── hover magnetico ─────────────

  function initMagnetic() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    gsap.utils.toArray('[data-magnetic]').forEach(function (el) {
      var forza = Number(el.dataset.magnetic || 0.16);
      var xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * forza);
        yTo((e.clientY - r.top - r.height / 2) * forza);
      });
      el.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });
  }

  // ───────────── cursore ─────────────

  function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    cursore = document.querySelector('[data-cursor]');
    if (!cursore) return;
    cursorLabel = cursore.querySelector('[data-cursor-label]');

    var xTo = gsap.quickTo(cursore, 'x', { duration: 0.35, ease: 'power3.out' });
    var yTo = gsap.quickTo(cursore, 'y', { duration: 0.35, ease: 'power3.out' });
    var acceso = false;

    window.addEventListener('pointermove', function (e) {
      xTo(e.clientX); yTo(e.clientY);
      if (!acceso) { acceso = true; cursore.classList.add('is-on'); }
    }, { passive: true });

    document.addEventListener('pointerleave', function () {
      cursore.classList.remove('is-on');
      acceso = false;
    });

    gsap.utils.toArray('[data-cursor-label]').forEach(function (t) {
      if (cursore.contains(t)) return;
      t.addEventListener('pointerenter', function () {
        if (cursorLabel) cursorLabel.textContent = t.dataset.cursorLabel || '';
        cursore.classList.add('is-labelled');
        gsap.to(cursore, { scale: 1.7, duration: 0.35, ease: 'power3.out' });
      });
      t.addEventListener('pointerleave', function () {
        if (cursorLabel) cursorLabel.textContent = '';
        cursore.classList.remove('is-labelled');
        gsap.to(cursore, { scale: 1, duration: 0.35, ease: 'power3.out' });
      });
    });
  }

  // ───────────── torna in cima ─────────────
  // Lo gestisce app.js: gli passo solo l'istanza Lenis tramite
  // window.__goCilentoLenis, cosi' scroll morbido e nativo non si pestano.

  // ───────────── avvio ─────────────

  if (!gsap || !ScrollTrigger) return;   // niente motion, pagina intatta
  if (reduce) return;                   // utente: nessuna animazione
  initAll(Boolean(Lenis));              // motion senza scroll morbido se Lenis manca

})();