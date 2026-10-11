// GoCilento — comportamento del template.
// Nessun contenuto qui: il testo vive nell'HTML di ogni lingua.
// Se questo file non parte, la pagina resta comunque completa e leggibile.

(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* ───────────── file:// fallback: le directory non risolvono index ─────────────
     Su http le lingue usano ../xx/ (URL puliti). Su file:// il browser mostra
     invece l'indice della cartella: aggiungi index.html solo in quel caso. */
  if (window.location && window.location.protocol === 'file:') {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (h && /\/$/.test(h) && h.charAt(0) !== '#') a.setAttribute('href', h + 'index.html');
    });
  }

  /* ───────────── parallax hero su mouse (solo pointer fine, no reduced-motion) ───────────── */

  var hero = document.querySelector('.hero');
  var heroMedia = document.querySelector('.hero__media');
  if (hero && heroMedia && !reduce && window.matchMedia('(pointer:fine)').matches) {
    var ptx = 0, pty = 0, pcx = 0, pcy = 0, praf = null;
    function ploop() {
      pcx += (ptx - pcx) * 0.06;
      pcy += (pty - pcy) * 0.06;
      heroMedia.style.transform = 'translate3d(' + pcx.toFixed(2) + 'px,' + pcy.toFixed(2) + 'px,0)';
      if (Math.abs(ptx - pcx) > 0.05 || Math.abs(pty - pcy) > 0.05) {
        praf = window.requestAnimationFrame(ploop);
      } else {
        praf = null;
      }
    }
    hero.addEventListener('mousemove', function (e) {
      ptx = ((e.clientX - window.innerWidth / 2) / (window.innerWidth / 2)) * 20;
      pty = ((e.clientY - window.innerHeight / 2) / (window.innerHeight / 2)) * 20;
      if (!praf) praf = window.requestAnimationFrame(ploop);
    });
  }

  /* ───────────── torna in cima ───────────── */

  var toTop = document.getElementById('toTop');
  if (toTop) {
    // Niente rAF qui di proposito: nei tab in background non scatta mai e
    // il pulsante resterebbe morto. Il toggle è solo classi, costa niente.
    function onScrollTop() {
      if (window.scrollY > 600) {
        if (toTop.hasAttribute('hidden')) {
          toTop.removeAttribute('hidden');
          void toTop.offsetWidth;
          toTop.classList.add('is-visible');
        }
      } else if (toTop.classList.contains('is-visible')) {
        toTop.classList.remove('is-visible');
        window.setTimeout(function () {
          if (!toTop.classList.contains('is-visible')) toTop.setAttribute('hidden', '');
        }, 320);
      }
    }
    window.addEventListener('scroll', onScrollTop, { passive: true });
    onScrollTop();
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
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
        var one = status.getAttribute('data-one') || 'luogo';
        var many = status.getAttribute('data-many') || 'luoghi';
        status.textContent = chip.textContent.trim() + ': ' + shown +
          (shown === 1 ? ' ' + one : ' ' + many);
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