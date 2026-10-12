// Il percorso: le 20 localita' disposte lungo una rotta che segue la costa,
// con la barca che le attraversa. Sezione della home, progressive enhancement.
//
// Regole non negoziabili:
// - I dati NON sono duplicati: arrivano dalle card .dest che sono gia' in pagina.
// - Le 8 localita' senza foto restano senza foto. Nessuna immagine inventata:
//   hanno un segnaposto diverso, dichiarato anche nel testo della sezione.
// - Se non c'e' WebGL, o l'utente chiede movimento ridotto, la sezione non
//   carica niente e mostra la lista dei fermate reali.
// - Un canvas non dice niente ai crawler: per questo ogni fermata ha anche
//   un link vero nel documento.

import * as THREE from './vendor/three.module.min.js';

// Il loader dinamico chiama mostraScena(); se il modulo viene importato
// per primo, parte da solo. Due ingressi, una sola costruzione.
export function mostraScena(sez) { avvia(sez || document.querySelector('[data-journey]')); }

const SEZ = document.querySelector('[data-journey]');
if (SEZ) avvia(SEZ);

function avvia(sez) {
  const palco = sez.querySelector('[data-journey-stage]');
  const telo = sez.querySelector('[data-journey-canvas]');
  const stato = sez.querySelector('[data-journey-stato]');
  const lista = sez.querySelector('[data-journey-stops]');
  if (!palco || !telo) return;

  const ridotto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gia = sez.getAttribute('data-journey-stato');
  if (gia === 'caricato') return;          // non costruire due volte
  sez.setAttribute('data-journey-stato', 'caricato');

  // ── 1. le fermate vengono dalle card gia' presenti nella pagina ──
  const fermate = Array.prototype.slice
    .call(document.querySelectorAll('.dest[data-territorio]'))
    .map(function (card) {
      const img = card.querySelector('.dest-img img');
      return {
        id: card.id,
        titolo: (card.querySelector('h3') || {}).textContent || '',
        territorio: card.dataset.territorio,
        foto: img ? img.getAttribute('src') : null,
        alt: img ? img.getAttribute('alt') || '' : '',
      };
    });
  if (!fermate.length) return;

  // ── 2. condizioni: senza WebGL la sezione resta una lista ──
  function webgl() {
    try {
      return !!(document.createElement('canvas').getContext('webgl2') ||
                document.createElement('canvas').getContext('webgl'));
    } catch (e) { return false; }
  }

  if (!webgl() || ridotto) {
    sez.setAttribute('data-journey-stato', ridotto ? 'ridotto' : 'no-webgl');
    if (stato) {
      stato.textContent = ridotto
        ? 'Percorso statico: hai chiesto un movimento ridotto.'
        : 'Percorso statico: il tuo browser non ha WebGL.';
    }
    return;
  }

  sez.setAttribute('data-journey-stato', 'pronto');
  if (palco) palco.hidden = false;      // il palco si vede solo se la scena c'e'
  costruisci();
  // eslint-disable-next-line no-inner-declarations
  function costruisci() {

  // ── 3. scena ──
  const scena = new THREE.Scene();
  // cielo/ fondo: i colori della sezione, non un nero da scena 3D generica
  scena.background = new THREE.Color('#0C3249');
  scena.fog = new THREE.Fog('#0C3249', 34, 96);

  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 220);
  const renderer = new THREE.WebGLRenderer({
    canvas: telo, antialias: true, powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const luce = new THREE.DirectionalLight('#FFE9C4', 1.15);
  luce.position.set(6, 14, 8);
  scena.add(luce);
  scena.add(new THREE.AmbientLight('#9CC2D8', 0.55));

  // mare: un piano sotto, con onde solo di suggestione (nessuna simulazione)
  const mare = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400, 1, 1),
    new THREE.MeshBasicMaterial({ color: '#0F4A63' })
  );
  mare.rotation.x = -Math.PI / 2;
  mare.position.y = -1.4;
  scena.add(mare);

  // ── 4. la rotta ──
  const punti = fermate.map(function (_, i) {
    const t = i / (fermate.length - 1);
    return new THREE.Vector3(
      Math.sin(t * Math.PI * 2.1) * 9 + Math.sin(t * 9.1) * 1.6,
      0,
      -t * 86
    );
  });
  const curva = new THREE.CatmullRomCurve3(punti);

  // ── 5. le fermate ──
  const fotoCache = {};
  const geometriaFoto = new THREE.PlaneGeometry(9, 6);
  const geometriaSegnaposto = new THREE.TorusGeometry(1.5, 0.09, 8, 28);
  const materiali = [];
  const caricate = [];

  fermate.forEach(function (f, i) {
    const t = fermate.length > 1 ? i / (fermate.length - 1) : 0.5;
    const p = curva.getPointAt(t);
    const tangente = curva.getTangentAt(t);

    const gruppo = new THREE.Group();
    gruppo.position.copy(p);
    gruppo.lookAt(p.clone().add(tangente));
    gruppo.rotation.y += Math.PI / 2;

    if (f.foto) {
      // Riuso lo stesso URL che la pagina ha gia' chiesto: niente doppio scarico
      const mat = new THREE.MeshBasicMaterial({ color: '#1A2B36', side: THREE.DoubleSide });
      materiali.push(mat);
      const mesh = new THREE.Mesh(geometriaFoto, mat);
      mesh.position.y = 4.4;
      gruppo.add(mesh);
      fotoCache[f.id] = { mesh: mesh, material: mat };
      caricate.push(new THREE.TextureLoader().load(
        new URL(f.foto, document.baseURI).href,
        function (texture) {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          mat.map = texture;
          mat.color.set('#FFFFFF');
          mat.needsUpdate = true;
        },
        undefined,
        function () { /* immagine non disponibile: resta il segnaposto scuro */ }
      ));
    } else {
      // niente foto: un segnaposto dichiarato, non un'immagine inventata
      const mat = new THREE.MeshBasicMaterial({ color: '#E9C46A' });
      materiali.push(mat);
      const mesh = new THREE.Mesh(geometriaSegnaposto, mat);
      mesh.position.y = 4.4;
      gruppo.add(mesh);
    }

    scena.add(gruppo);
  });

  // ── 6. la barca ──
  const barca = new THREE.Group();
  const scafo = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 1.1, 5.2),
    new THREE.MeshStandardMaterial({ color: '#FAF6ED' })
  );
  scafo.position.y = 0.45;
  barca.add(scafo);
  const cabina = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 1.3, 2.4),
    new THREE.MeshStandardMaterial({ color: '#145B8B' })
  );
  cabina.position.set(0, 1.55, -0.5);
  barca.add(cabina);
  const prua = new THREE.Mesh(
    new THREE.ConeGeometry(1.3, 1.6, 4),
    new THREE.MeshStandardMaterial({ color: '#FAF6ED' })
  );
  prua.rotation.set(Math.PI / 2, 0, Math.PI / 4);
  prua.position.set(0, 0.45, 3.1);
  barca.add(prua);
  scena.add(barca);

  // ── 7. il viaggio ──
  const INIZIO = 0.02;
  const FINE = 0.985;
  const PAUSA = 2.4;                 // secondi a ogni fermata
  let t = INIZIO;
  let attesa = 0;
  let corrente = -1;

  function posiziona() {
    const punto = curva.getPointAt(t);
    const tang = curva.getTangentAt(t);
    barca.position.copy(punto);
    barca.position.y = 0;
    barca.lookAt(punto.clone().add(tang));
    // onde: dondolio leggero, non simulazione
    const tempo = clock.elapsedTime;
    barca.rotation.z = Math.sin(tempo * 1.1) * 0.045;
    barca.rotation.x = Math.cos(tempo * 0.8) * 0.03;

    const bersaglio = punto.clone().addScaledVector(tang, 13);
    camera.position.lerp(
      punto.clone().add(new THREE.Vector3(6.5, 5.2, 9.5)), 0.045);
    camera.lookAt(bersaglio);

    // fermata corrente
    const i = Math.min(fermate.length - 1,
      Math.max(0, Math.round(t * (fermate.length - 1))));
    if (i !== corrente) {
      corrente = i;
      if (lista) {
        Array.prototype.forEach.call(lista.children, function (li, k) {
          li.classList.toggle('is-current', k === i);
        });
      }
      sez.dispatchEvent(new CustomEvent('journey:fermata', {
        detail: { indice: i, fermata: fermate[i] }
      }));
    }
  }

  const clock = { elapsedTime: 0 };
  let ultimo = performance.now();
  let visibile = true;

  function frame(ora) {
    const dt = Math.min((ora - ultimo) / 1000, 0.05);
    ultimo = ora;
    clock.elapsedTime += dt;

    if (visibile) {
      if (attesa > 0) {
        attesa -= dt;
      } else {
        t += dt * 0.021;
        if (t >= FINE) t = INIZIO;     // ricomincia: e' un viaggio, non una fine
        // si ferma un attimo quando raggiunge una fermata
        const prima = Math.round((t - dt * 0.021) * (fermate.length - 1));
        const adesso = Math.round(t * (fermate.length - 1));
        if (adesso !== prima) attesa = PAUSA;
      }
    }
    posiziona();
    renderer.render(scena, camera);
    raf = window.requestAnimationFrame(frame);
  }
  let raf = window.requestAnimationFrame(frame);

  // ── 8. pausa quando la sezione non si vede o il tab e' in fondo ──
  const osserva = new IntersectionObserver(function (voci) {
    visibile = voci[0].isIntersecting;
  }, { threshold: 0.02 });
  osserva.observe(sez);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      window.cancelAnimationFrame(raf);
      raf = 0;
    } else if (!raf) {
      ultimo = performance.now();
      raf = window.requestAnimationFrame(frame);
    }
  });

  // ── 9. misura e ridimensionamento ──
  function ridimensiona() {
    const larghezza = palco.clientWidth;
    const altezza = palco.clientHeight;
    if (!larghezza || !altezza) return;
    renderer.setSize(larghezza, altezza, false);
    camera.aspect = larghezza / altezza;
    camera.updateProjectionMatrix();
  }
  ridimensiona();
  window.addEventListener('resize', ridimensiona);

  palco.addEventListener('webglcontextlost', function (e) {
    e.preventDefault();
    window.cancelAnimationFrame(raf);
    raf = 0;
    sez.setAttribute('data-journey-stato', 'perso');
    if (stato) {
      stato.textContent = 'Percorso interrotto: la scheda grafica ha smesso di rispondere.';
    }
  });

  // ── 10. partita da una fermata scelta dalla lista ──
  if (lista) {
    lista.addEventListener('click', function (e) {
      const li = e.target.closest('li[data-indice]');
      if (!li) return;
      t = INIZIO + (FINE - INIZIO) * (Number(li.dataset.indice) / (fermate.length - 1));
      attesa = PAUSA;
    });
  }

  sez.__journey = { scena: scena, curva: curva, fermate: fermate };
  }
}