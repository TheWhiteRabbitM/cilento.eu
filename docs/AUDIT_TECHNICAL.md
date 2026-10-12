# AUDIT TECNICO E ARCHITETTURA — cilento.eu

Audit del 2026-10-12 (Agente 1), sola lettura: nessun file del sito è stato
modificato. Per ogni misura è citato il comando usato.

## 1. Stack reale (verificato)

| Livello | Cosa c'è | Verifica |
|---|---|---|
| Build | **nessuna** | `Get-ChildItem -Recurse -Force -Include package.json,*lock*,node_modules,.nvmrc` → 0 risultati |
| Linguaggio | HTML/CSS/JS vanilla; `app.js` in ES5, nessun transpiler | lettura |
| Runtime | node **v24.19.0** presente, **npm assente** | `node -v`; `npm -v` → errore |
| HTML | **20 file**: root `index.html`, `404.html`, 18 di contenuto (3 lingue × 6 pagine) | `Get-ChildItem -Recurse -Filter *.html` |
| CSS | **1 file** `styles.css`: 805 righe, 36.4 kB, 348 blocchi `{}`, 17 `@media`, 3 `@keyframes` | parser custom |
| JS proprio | `app.js` 7.1 kB + `assets/motion.js` 12.7 kB | `Get-Item` |
| JS vendor | `assets/vendor/`: gsap 70.7 + ScrollTrigger 43.1 + lenis 16.4 = **130.2 kB** | `Get-Item` |
| Tool interno | `tools/build-api.js` 209 righe, solo `fs`+`path`, zero dipendenze | lettura + `--check` |
| VCS | `origin https://github.com/TheWhiteRabbitM/cilento.eu.git`, `main` pulito, 81 file, HEAD `1b3414c` | `git remote -v`, `git status`, `git ls-files` |

**ADR-001 confermata**: nessun framework, nessun `node_modules`, nessuna CDN.
Unica dipendenza esterna a runtime: Google Fonts (`it/index.html:32-34`).

## 2. Struttura e deploy

`/` = `index.html` (redirect a `it/`), `404.html`, `.htaccess`, `styles.css`,
`app.js`, `robots.txt`, `llms.txt`, `sitemap.xml` · `/{it,en,de}/` = 6 pagine
l'uno · `api/` = 3 JSON (22.3/22.3/22.9 kB) · `assets/img/` = **34 JPEG**
(17 pieni + 17 varianti `-640`) = **5.6 MB** · `assets/vendor/` = 3 librerie ·
`tools/build-api.js` (fuori deploy) · `docs/`.

**Nessuna CI, nessuno script**: `Get-ChildItem -Recurse -Force -Include *.yml,*.yaml,*.ps1,*.sh,*.bat` → 0. Deploy = caricamento manuale su Apache/IONOS mantenendo i percorsi; `/it/` `/en/` `/de/` si risolvono come directory (`README.md:74-78`).

`.htaccess` (34 righe), tutto da preservare: HTTPS→301 (`:8-9`),
`ErrorDocument 404 /404.html` (`:13`), `mod_deflate` (`:16-18`),
`mod_expires` (`:21-28`), `X-Content-Type-Options` + `Referrer-Policy` (`:31-34`).
`index.html:14-25` redirige a `it/` con **entrambi** i meccanismi
(`meta refresh` + `location.replace`): ridondanza utile senza JS.

## 3. Parti da PRESERVARE (funzionalità)

1. **Burger/nav sheet** `app.js:12-60` — `aria-expanded`, label da
   `data-label-open/close`, `inert`, Esc+ritorno focus, `syncBurgerContrast()`
   che **misura** il pannello invece di indovinare il breakpoint.
   ID: `#navToggle` (`it/index.html:322`), `#navSheet` (`:722`).
2. **Filtri destinazioni** `app.js:108-135` — `aria-pressed`, `#filter-status`
   live region (`:391`), `#no-dests` (`:715`); coerenti col CSS perché esistono
   `.dest[hidden]` (`styles.css:415`), `.empty[hidden]` (`:453`), `.panel[hidden]` (`:472`).
3. **Tab stagioni** `app.js:139-163` — frecce ←/→, Home, End, roving tabindex,
   init da `#hash` (`:177-183`).
4. **Torna in cima** `app.js:74-104` — integrato con Lenis
   (`window.__goCilentoLenis`) con fallback `scrollTo`.
5. **Fallback `file://`** `app.js:65-70`.
6. **Motion system** `assets/motion.js` (340 righe) — Lenis, timeline hero,
   ScrollTrigger, parallasse (`initParallax` `:242-256`), tutto sotto
   `prefers-reduced-motion`; senza GSAP il CSS lascia i `.rv` visibili.
7. **Contenuti/SEO** — 20 `<article class="dest">` per lingua; **4 hreflang
   per pagina** (it/en/de/x-default) reciproci su tutte le 18 pagine, più
   `canonical`; JSON-LD valido su tutte e 18 (home = `WebSite+TravelGuide+ItemList(20)`,
   interne = `WebSite+WebPage+BreadcrumbList(2)`), **0 errori `JSON.parse`**;
   `sitemap.xml` con 18 `<url>` e alternati; `robots.txt` con 10 crawler AI;
   `api/*.json` con 20 destinazioni, 4 stagioni, 4 verbi, 3 itinerari, 6 sapori,
   3 blocchi pratici per lingua — **`node tools/build-api.js --check` → 7
   differenze per lingua, tutte dentro `PRESERVATE` (`build-api.js:162-163`):
   zero deriva sui campi generati**.
8. **Immagini** — **84 `<img>`, 0 senza `width/height`, 0 senza `alt`**;
   **66 JPEG, 0 mismatch** attributi↔dimensioni reali; `fetchpriority="high"`
   sull'hero, `loading="lazy"` su tutte le altre. Skip link + `<main id="main">`
   (`it/index.html:352`) su tutte le 18 pagine.

## 4. Debito tecnico misurato

| # | Dove | Problema | Sev | Criterio di verifica |
|---|---|---|---|---|
| D1 | `trade/info/itinerari.html` ×3 | **Le pagine interne non hanno né `<nav>` né header**: contaggio `<nav>`=0 su 15 file; la nav si raggiunge solo dal footer | **Alta** | `Select-String '<nav'` → 6 per lingua |
| D2 | stessi file | caricano GSAP+ScrollTrigger+Lenis (130.2 kB) su pagine quasi statiche | Media | somma kB dei `<script src>` |
| D3 | `it/index.html:762` +14 | footer duplicato: 4 copie identiche per lingua (~1.3 kB) → **~12.0 kB duplicate** su 18 file | Media | hash del blocco `<footer>…</html>` normalizzato |
| D4 | `.htaccess:26-27` | `ExpiresByType text/css / application/javascript "access plus 1 month"` su file **non versionati**: un restyling resta invisibile fino a 30 giorni | **Alta** | nessun `?v=` o hash nei `<link>`/`<script>` |
| D5 | 12 file, tag `og:image:*` | **12 su 15 sbagliate**: dichiarano `1319x989`, il file è `1280x960`; `agropoli.jpg`/`paestum.jpg` dichiarano `1280x960`, sono `1280x853` | Media | lettura header SOF0 del JPEG e confronto |
| D6 | `it/index.html:23,32-34` | 3 famiglie Google Fonts = 7 file, stylesheet render-blocking su host esterno; il CSS usa solo `font-weight: 500, 600` → **Archivo 400 scaricato e mai applicato** | Media | `font-weight` in CSS vs famiglie richieste |
| D7 | `tools/build-api.js:118-137` | `function seasons()` **non è mai chiamata**: `main()` (`:139-157`) genera solo `meta, hero, facts, destinations`; le `seasons` nei JSON restano a mano | Media | grep delle chiamate; confermato da `--check` |
| D8 | `styles.css:15,20` | `--cielo` e `--torre` definite e **mai usate** (24 delle 26 property usate, 171 `var()`) | Bassa | estrazione definizioni vs usi |
| D9 | `styles.css:314` | `.pill{display:none}` — regola morta, `.pill` assente da tutti i 20 HTML | Bassa | `Select-String 'pill'` → 0 |
| D10 | `styles.css:762-763` | `.motion-line*` mai usati; esiste solo `.motion-word*` (`motion.js:150,152,160`) | Bassa | grep su HTML+JS |
| D11 | `assets/img/tramonto-palinuro-640.jpg` (19.2 kB) | **unico asset mai referenziato**: l'hero non ha `srcset`/`sizes`, il mobile scarica il file pieno (63.5 kB) | Bassa | scan di tutti i path in `assets/` |
| D12 | root progetto | `cilento.eu.zip` **7.0 MB** non tracciato ma in working tree (coperto da `*.zip`, `.gitignore:17`): un deploy "carica la cartella" porta 7 MB sul server | Media | `git status --porcelain -uall` |
| D13 | `.htaccess:16-18` | solo `mod_deflate`; misurato testo prima pagina **228.1 kB → 73.9 kB gzip / 66.2 kB brotli** (10.5 kB non spesi) | Bassa | `zlib.brotliCompressSync` |
| D14 | `index.html:13` vs `it/index.html:30` | favicon con path relativo in root, `../` altrove: due convenzioni per lo stesso file | Bassa | confronto dei due `<link rel="icon">` |
| D15 | `styles.css` | 8 `!important` superstiti | Bassa | `Select-String '!important'` |

**Drift documentazione → codice** (Bassa, ma da risolvere prima di usare i doc
come specifica): `ARCHITECTURE.md:1,77-78` e `README.md:17` dicono
`gocilento.it` mentre il repo è `cilento.eu` e tutti i canonical puntano al
primo · `ARCHITECTURE.md:92` cita `favicon-32.png` e `:197` `_redirects`, entrambi
inesistenti · `ARCHITECTURE.md:167-179,200-207` (routing `?lang=`, "prossimi
passi") superati da ADR-006 · `README.md:39-41` descrive "righe editoriali, non
card" e "hero a due colonne con video": oggi sono card (`.dest`) e hero
full-bleed **senza video** (`<video>`/`.mp4`/mixkit: 0 occorrenze) ·
`README.md:86` dice "sei destinazioni senza foto", sono **otto**
(`portoinfreschi, certosa, cervati, montestella, budorno, golecalore, morra,
migranti`, letto da `api/*.json`) · `README.md:57-58` attribuisce il JSON-LD al
generatore, ma `build-api.js` non scrive mai HTML · `DESIGN.md:22` dice "niente
parallax" mentre `:32` e `motion.js:242` lo implementano a 0.14 ·
`DESIGN.md:11,22` dicono radius 18/22 px contro `styles.css:22-23`
(`--r:18px`, `--radius-card:26px`).

Nessun altro file morto: tutti gli altri 46 asset e tutte le pagine sono
raggiungibili.

## 5. Rischi e dipendenze

1. **D4 è il rischio operativo più grave**: 30 giorni di CSS/JS vecchio nel
   browser dopo il deploy. *Verifica*: il CSS nuovo deve arrivare prima del
   primo utente ritornante (DevTools → Network).
2. **Doppia fonte di verità** HTML ↔ `api/*.json`: oggi `--check` dà solo
   differenze attese (D7), ma chi tocca `seasons/verbs/itineraries/flavors/
   practical` nell'HTML lascia il JSON fermo e il drift diventa silenzioso.
   *Verifica*: `--check` deve dare **0 differenze fuori `PRESERVATE`**.
3. **Google Fonts** è l'unica dipendenza esterna: se cade il sito resta
   leggibile (`Georgia`/`system-ui`/`ui-monospace`, `styles.css:28-30`) ma
   perde identità. *Verifica*: DevTools → *Block third-party*.
4. **Vincolo z-index brittle**: `it/index.html:299-301` e `app.js:19-22`
   documentano che il burger (`z:70`) sta sopra il nav sheet (`z:60`) **solo
   perché `.hero__left` non crea stacking context**. Un header nuovo che ne
   crei uno rompe il burger. *Verifica*: burger a 1440px e 375px.
5. **18 pagine in parallelo** + footer duplicato 4× per lingua (D3): un
   restyling del footer può divergere fra le copie. *Verifica*: hash uguali.
6. **Nessuna CI**: niente controllo automatico su hreflang, JSON-LD, `--check`,
   link morti (misurato: 0 file di pipeline).
7. **`llms.txt` e `api/*.json` senza policy di cache** in `.htaccess` (nessun
   `ExpiresByType` per `text/plain`/`application/json`). Bassa severità.

**Controlli NON eseguiti** (dichiarati): Lighthouse/CrUX, tempi di rete reali,
resa su device, contrasto a runtime, verifica che gli header `.htaccess` siano
attivi in produzione (serve accesso al server IONOS), screen reader,
validazione W3C completa.

## 6. Strategia di implementazione

Restano valide ADR-001 (niente framework) e ADR-002 (un CSS, un JS). Va
**emendata** la ADR-008: il generatore non copre `seasons/verbs/itineraries/
flavors/practical` (D7).

**Fase 0 — blindare il deploy, prima del design.** Risolvere D4 con un
parametro di versione sui 5 asset condivisi, senza build (una riga per pagina,
es. `styles.css?v=20261012`). *Verifica*: `Cache-Control` in DevTools.

**Fase 1 — togliere la duplicazione, senza tooling.** `tools/build-partials.js`
(nello stile di `build-api.js`, solo `fs`/`path`) produce `it/partials/
{nav,footer}.html` + un `--check` che segnala le copie divergenti. Non è un
build step: i partial restano committati come già avviene per `api/*.json`.
*Verifica*: `node tools/build-partials.js --check` → 0 differenze.

**Fase 2 — header sulle pagine interne (D1, D2).** Copiare il blocco
`<nav class="nav">` + `#navSheet` da `it/index.html:303-341` e `:722-773`
nelle 15 pagine interne con `aria-current="page"` sul link attivo; togliere
`#navToggle`/`#navSheet` dal footer per non duplicare i listener.

**Fase 3 — sistema visivo.** Header riusa `.nav`, `.brand`, `.burger`,
`.navsheet` (sezione "FOGLIO NAV" del CSS); hero riusa `.hero`, `.hero__media`,
`.hero__left`, `.hero__content`, `.hero__bottom`, `.hl` mantenendo
`fetchpriority` e `width/height`; griglia riusa `.dest`, `.dest-img`,
`.dest-tag`, `.dest-desc`, `.dest-meta` e la regola `.dest[hidden]` (i filtri
dipendono da essa); footer riusa `.foot-*` e `<picture class="foot-logo">`.
Vincoli da non rompere: `.hero__left` senza stacking context (R4), i tre ruoli
tipo `--fd/--fb/--fm`, nessun `!important` nuovo (D15), niente `.pill` (D9).

**Fase 4 — allineare macchina e documenti.** Correggere D5 leggendo le
dimensioni reali dei JPEG; risolvere D7 (chiamare `seasons()` in `main()` **o**
cancellarla e toglierla da `PRESERVATE` — non lasciare codice morto che promette
una cosa e ne fa un'altra); aggiornare i punti del §4 e aggiungere un'ADR-010
che descrive i partial HTML come estensione di ADR-002, non come build step.

**Verifica finale**: `build-api.js --check` → 0 differenze fuori `PRESERVATE`;
`build-partials.js --check` → 0; ogni pagina ha 4 hreflang, 1 canonical,
JSON-LD valido. **Test minimo su ogni pagina × 3 lingue**: burger apre/chiude,
Esc chiude e restituisce il focus, filtri con `#filter-status` aggiornato, tab
stagioni con frecce, torna in cima, skip link al `#main`, pagina leggibile con
JS disabilitato e con `prefers-reduced-motion`.