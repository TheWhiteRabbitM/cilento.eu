// cilento.eu — comportamento del template.
// Nessun contenuto qui: il testo vive nell'HTML di ogni lingua.
// Se questo file non parte, la pagina resta comunque completa e leggibile.

(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────────── hero: il video si rivela solo se parte davvero ─────────────
     Sotto al video c'è sempre la foto. Nessun poster, nessun salto di
     immagine: se il video non parte, resta la foto e non si vede nulla di rotto. */

  var heroVideo = document.querySelector('[data-hero-video]');

  if (heroVideo) {
    // Pausa se l'hero non è più in viewport: un video che gira fuori schermo
    // è batteria sprecata. Riparte quando torna.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            var p = heroVideo.play();
            if (p && p.catch) p.catch(function () {});
          } else if (!heroVideo.paused) {
            heroVideo.pause();
          }
        });
      }, { threshold: 0.05 }).observe(heroVideo);
    }

    // Solo quando c'è un frame reale il video può diventare visibile.
    function markReady() { heroVideo.dataset.ready = 'true'; }

    if (heroVideo.readyState >= 3) markReady();

    heroVideo.addEventListener('playing', markReady);
    heroVideo.addEventListener('timeupdate', markReady, { once: true });
    heroVideo.addEventListener('loadeddata', function () {
      // loadeddata garantisce solo il primo frame: controllo le dimensioni reali
      if (heroVideo.videoWidth > 0) markReady();
    });

    heroVideo.addEventListener('error', function () {
      heroVideo.remove(); // lascia solo la foto
    });

    // autoplay può essere rifiutato: prova una volta, se non va la foto resta
    var attempt = heroVideo.play();
    if (attempt && attempt.catch) attempt.catch(function () {});
  }

  /* ───────────── foglio nav: burger morph + contrasto misurato ───────────── */

  var navToggle = document.getElementById('navToggle');
  var navSheet = document.getElementById('navSheet');
  var navPanel = navSheet ? navSheet.querySelector('.navsheet__panel') : null;
  var sheetOpen = false;

  function syncBurgerContrast() {
    if (!navToggle || !navPanel) return;
    // Il pannello è ancorato a destra e largo max 460px: su schermi larghi
    // può fermarsi PRIMA del burger. Non indovinare breakpoint: misura.
    var panelLeft = window.innerWidth - navPanel.getBoundingClientRect().width;
    var onPanel = navToggle.getBoundingClientRect().right > panelLeft + 4;
    navToggle.classList.toggle('burger--on-panel', onPanel);
  }

  function setSheetOpen(next) {
    if (!navToggle || !navSheet || next === sheetOpen) return;
    if (next) syncBurgerContrast();
    sheetOpen = next;
    navSheet.classList.toggle('is-open', next);
    navToggle.classList.toggle('is-active', next);
    document.body.classList.toggle('nav-open', next);
    navToggle.setAttribute('aria-expanded', next ? 'true' : 'false');
    navToggle.setAttribute('aria-label', next
      ? (navToggle.getAttribute('data-label-close') || 'Close menu')
      : (navToggle.getAttribute('data-label-open') || 'Open menu'));
    if (next) navSheet.removeAttribute('inert');
    else navSheet.setAttribute('inert', '');
  }

  if (navToggle && navSheet) {
    navToggle.addEventListener('click', function () { setSheetOpen(!sheetOpen); });

    navSheet.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-nav-close') || e.target.closest('a')) {
        setSheetOpen(false);
      }
    });

    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && sheetOpen) {
        setSheetOpen(false);
        navToggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (sheetOpen) syncBurgerContrast();
    });
  }

  /* ───────────── filtri destinazioni ───────────── */

  var chips = document.querySelectorAll('.chip[data-filter]');
  var dests = document.querySelectorAll('.dest[data-territorio]');
  var status = document.getElementById('filter-status');
  var empty = document.getElementById('no-dests');

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var want = chip.dataset.filter;

      chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      chip.setAttribute('aria-pressed', 'true');

      var shown = 0;
      dests.forEach(function (card) {
        var match = want === 'all' || card.dataset.territorio === want;
        card.hidden = !match;
        if (match) shown++;
      });

      if (empty) empty.hidden = shown !== 0;
      if (status) {
        status.textContent = chip.textContent.trim() + ': ' + shown +
          (shown === 1 ? ' luogo' : ' luoghi');
      }
    });
  });

  /* ───────────── tab stagioni (frecce ← → Home End) ───────────── */

  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));

  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab, false); });

    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  /* ───────────── reveal on scroll ───────────── */

  var targets = document.querySelectorAll('.rv');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  /* ───────────── init tab in base all'hash ───────────── */

  if (tabs.length) {
    var fromHash = location.hash.replace('#', '');
    var hit = tabs.filter(function (t) {
      return t.getAttribute('aria-controls') === 'p-' + fromHash;
    })[0];
    selectTab(hit || tabs[0], false);
  }
})();