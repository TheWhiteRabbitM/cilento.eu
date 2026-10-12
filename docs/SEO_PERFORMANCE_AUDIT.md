# SEO tecnica e performance — audit

Data 2026-10-12 · revisione `1b3414c` · metodo: lettura file su disco, conteggio byte, verifica di
ogni link/ancora/asset referenziato. **Nessun file del sito è stato modificato.**

**Core Web Vitals non misurati**: sono metriche di campo, servono Lighthouse+Chrome o CrUX del
dominio live; qui non c'è né un server su `gocilento.it` né Chrome headless. Tutto sotto è **peso
e struttura statici**, non punteggi di laboratorio. I fattori che *peserebbero* su LCP sono in §7.

## 1. URL e sitemap

18 `<loc>` in `sitemap.xml`, tutti unici; mappati su file reali: **18/18 esistono, 0 rotte**. Le 18
pagine sono `/it|en|de/` × {`index`, `impressum`, `trade`, `esperienze`, `itinerari`, `info`}.
Fuori sitemap solo `index.html` (root) e `404.html`: corretto.

| Verifica | Esito |
|---|---|
| `<loc>` → file su disco | 18/18 OK |
| hreflang sitemap ⇄ hreflang `<head>` | **0 mismatch** su 18 |
| `canonical` HTML = `<loc>` | 18/18 |
| `og:url` = `<loc>` | 15/15 (3 impressum senza `og:url`) |
| Reciprocità hreflang (URL per URL, non a campione) | **0 asimmetrie** |
| Pagine reali assenti dalla sitemap | nessuna |

**Dominato incoerente — decidere prima del lancio.** La cartella è `cilento.eu`, ma *tutto* il
SEO dichiara `https://gocilento.it`: canonical, hreflang, `og:url`, `sitemap.xml:5`, `robots.txt:33`,
`llms.txt:8-21`, ogni JSON-LD, `tools/build-api.js:144`, `README.md:17`. Se il live è `cilento.eu`,
ogni segnale punta a un altro host e le 18 pagine si auto-cancellano. Se il live è `gocilento.it`,
va documentato perché cartella e `docs/ORIGINALITY.md:7` dicono `cilento.eu`.

## 2. Title e meta description

18 title **unici**, 18 description **uniche**, tutti presenti. `404.html` ha il title ma nessuna
description (accettabile: è `noindex`).

- **Title troppo lunghi** (soglia ~60): `it/index.html:6` **81**, `de/index.html:6` **74**,
  `en/index.html:6` **70**. Le altre 15 pagine: 21–56, OK.
- **Description troppo lunghe**: le 3 home sono **180 / 191 / 181 caratteri**
  (`it|en|de/index.html:7`) → troncamento a ~155-160 con perdita della coda informativa
  ("tre itinerari onesti" / "three honest itineraries" / "drei ehrliche Routen"). Le altre 15: 38–113, OK.

## 3. Heading hierarchy

**`h1` unico su tutte le 18 pagine di contenuto** e su `404.html`. **Zero salti di livello** su
20/20 pagine: gerarchia regolare `h1 → h2 → h3` (`it/index.html` = h1 + 2 h2 + 20 h3;
`it/esperienze.html` = h1 + h2 "Stagioni" + 4 h3, h2 "Quattro verbi cilentani" + 4 h3).

`index.html` (root) **non ha heading**: è pagina di redirect (meta refresh a riga 14).
Non è un difetto d'indicizzazione (è una porta d'ingresso duplicata, vedi rischio 2).

## 4. Structured data

18 blocchi JSON-LD, **tutti JSON validi**. Home = `WebSite`+`TravelGuide`+`ItemList`; le altre 15 =
`WebSite`+`WebPage`+`BreadcrumbList`. Verificato che ogni dichiarazione descriva contenuto reale:
`ItemList.numberOfItems` 20 = 20 elementi reali in 3/3 lingue; **60/60** `description` di
`TouristDestination` presenti in pagina; **60/60** `@id` mappano su un'`id=` reale; **52/52** `image`
su file esistente; `TravelGuide.name`/`.description` coincidono con `<title>`/meta 3/3.

**Dichiarazioni non supportate dai dati reali — 3 rilievi:**

1. **Le 8 destinazioni senza foto sono oneste nel dato, sbagliate nel testo.** Le 8 sono
   `portoinfreschi, certosa, cervati, montestella, budorno, golecalore, morra, migranti`
   (`api/*.json`, `photo_available: false`) e il JSON-LD **omette correttamente** `image` per queste.
   Ma il testo dichiara **sei**: `it/impressum.html:112` "Sei destinazioni non hanno foto",
   `en/impressum.html:112` "Six destinations", `de/impressum.html:112` "Sechs Reiseziele",
   `llms.txt:96` "Six destinations have no photo". Dato sbagliato in 4 punti e 3 lingue, su un sito
   che dichiara la propria onestà dei dati.
2. **`WebPage.isPartOf` è dangling su 14 pagine su 15**: dichiara `@id …/it/#guida`, ma l'entità
   `TravelGuide` con quell'`@id` è definita **solo** nella home (`it/index.html:51`).
3. **`BreadcrumbList` con nome falso sulla home**: posizione 1 è `"GoCilento" → /it/`
   (`it/itinerari.html:64-70`), il nome del sito, non il titolo reale della home.

**Sync `api/*.json`.** `node tools/build-api.js --check` → **7 differenze per lingua, tutte e sole**
nelle sezioni che il generatore non produce (`seasons, verbs, itineraries, flavors, practical,
tagline, legal` — `tools/build-api.js:162`); i campi generabili (`meta, hero, facts, destinations`)
hanno **0 differenze**. Verifica manuale delle 7 sezioni "preservate" contro l'HTML: **0 elementi non
trovati** (20 per lingua). `updated: "2026-10-12"` coerente, ma `sitemap.xml` dichiara
`lastmod 2026-10-11` su tutte le 18 URL mentre l'ultimo commit è del **2026-10-12**.

## 5. Immagini

**84 `<img>`** (18 pagine + root + 404), 15 sulla home.

- **`alt` presenti e non vuoti su 84/84**, e descrittivi: "Le colonne del Tempio di Nettuno a Paestum
  tra i papaveri", "L'Arco Naturale di Palinuro sporgente sul mare azzurro". Nessun `alt=""`.
- **`width`/`height` su 84/84** → nessun CLS da immagine.
- **`srcset`+`sizes` sulle 12 foto-destinazione** (`it/index.html:3`:
  `srcset="paestum-640.jpg 640w, paestum.jpg 1280w"`, `sizes="(max-width:1000px) calc(100vw - 40px), 590px"`).
  Verificato al byte: **tutti i 17 derivati `-640.jpg` sono davvero 640px**.
- **3 `<img>` senza `srcset` per pagina**, due pesanti:
  `hero-fallback` (`it/index.html`, `fetchpriority="high"`) → **65.013 B, 1280×960**, senza srcset,
  sebbene esista `tramonto-palinuro-640.jpg` (19.699 B) — è l'elemento LCP candidato, su mobile
  scarica 1280px dove ne servono ~390; e `logo.png` **174,2 KB** nel footer, `lazy` ma **senza
  `<picture>`** (esiste `logo.webp` 45,8 KB): il singolo file più pesante di una pagina di contenuto
  dopo il testo, su tutte le 15 pagine interne. Il terzo, `logo-mark.png` 71,3 KB, ha già il WebP come `<source>`.

**Formato:** solo JPEG in `assets/img/` (34 file), nessun WebP/AVIF per le foto; solo i loghi hanno
varianti WebP. Le 17 foto 1280w pesano in media **259,2 KB** ciascuna.

**Dato social sbagliato su 12 pagine su 15** — `og:image:width/height` non corrispondono al file:

| Pagina | File | Dichiarato | Reale |
|---|---|---|---|
| `{it,en,de}/index.html:15-16`, `…/trade.html:21-22` | tramonto-palinuro.jpg | 1319×989 | **1280×960** |
| `{it,en,de}/itinerari.html:21-22` | paestum.jpg | 1280×960 | **1280×853** |
| `{it,en,de}/info.html:21-22` | agropoli.jpg | 1280×960 | **1280×853** |

Solo `esperienze.html` (camerota.jpg 1280×960) è corretto. Dimensioni false ⇒ anteprima rifiutata
o ritagliata da Facebook/LinkedIn/X.

## 6. Link interni

**Verifica file per file: nessun link locale rotto.** **0 target mancanti** su 18 pagine (ogni
`<a href>` relativo risolto contro il filesystem, ogni `src`/`href` di asset verificato esistere);
**0 ancore rotte** (tutti gli `href="#…"` controllati contro gli `id=`: le 60 ancore destinazione
`#paestum`…`#migranti`, `#destinazioni`, `#cifre`). ** esterni:** solo Google Fonts e
`mailto:hello@gocilento.it` (12 pagine), nessun link a terzi. Nota: cambio lingua e menu usano URL
**assoluti** `https://gocilento.it/en/` invece di `../en/` — funziona, ma è dominio hardcoded in
30 punti e raddoppia l'impatto del rischio 1. **Linkaggio:** dalla home si raggiungono tutte le 5
pagine interne, `impressum` è collegata solo dal footer, nessuna pagina orphana.

## 7. Performance misurata sul disco

Byte reali, gzip con zlib livello 9.

**Testo**

| | Raw | gzip |
|---|---|---|
| 18 pagine HTML (totale) | **269.420 B** | **70.724 B** |
| home IT (la più pesante) | 42.630 B | 8.476 B |
| pagina interna più leggera (`it/impressum.html`) | 5.630 B | 2.030 B |
| `styles.css` | 36,4 KB | 9,6 KB |
| JS totale (`app.js`+`motion.js`+3 vendor) | **157,1 KB** | **56,0 KB** |

Vendor: `gsap` 70,7 KB (→27,6 gzip), `ScrollTrigger` 43,1 KB (→17,4), `lenis` 16,4 KB (→4,7).
Tutti `defer`, locali, nessun CDN. **Caricamento iniziale di una pagina: 73,9 KB** (testo gzip, senza font).

**Asset**

| | Byte |
|---|---|
| `assets/img/` (34 file) | **5.523,4 KB** |
| ├ 17 file 1280w | 4.406,6 KB (media **259,2 KB**) |
| └ 17 derivati 640w | 1.116,8 KB (media **65,7 KB**) |
| loghi+favicon+apple-touch | 361,9 KB (di cui `logo.png` 174,2 KB) |
| JS vendor | 130,2 KB |
| **Totale deploy (74 file serviti)** | **6.417,2 KB** |

**Per pagina** (somma di tutto ciò che il browser scarica; "mobile" = candidato 640w, "desktop" = 1280w;
i woff2 Google non sono misurabili da disco):

| Pagina | img mobile | img desktop | testo | **Tot. mobile** | **Tot. desktop** |
|---|---|---|---|---|---|
| `it/index.html` | 992,6 KB | 3.388,6 KB | 228,1 KB | **1.220,7 KB** | **3.616,7 KB** |
| `it/esperienze.html` | 636,1 KB | 1.633,2 KB | 199,0 KB | 835,1 KB | 1.832,2 KB |
| `it/trade.html` | 404,3 KB | 1.192,7 KB | 196,1 KB | 600,4 KB | 1.388,8 KB |
| `it/info.html` | 174,2 KB | 174,2 KB | 196,5 KB | 370,7 KB | 370,7 KB |
| `it/itinerari.html` | 174,2 KB | 174,2 KB | 194,2 KB | 368,4 KB | 368,4 KB |
| `it/impressum.html` | 0 | 0 | 192,0 KB | 192,0 KB | 192,0 KB |

**Prima/dopo** (`4479036^` → `HEAD`): `assets/img/` **5.523,4 KB → 5.523,4 KB, invariato**, 34 file → 34;
`it/index.html` 40,6 → 40,9 KB; `styles.css` 35,3 → 35,6 KB; vendor 130,2 KB invariato.
Il commit `4479036` ("6MB→1.1MB") **non ha ridotto i byte su disco**: i 34 JPEG erano già lì, ha
aggiunto gli attributi `srcset` perché il browser *scegliesse* i file piccoli. Il guadagno è reale
lato client (3.616,7 → 1.220,7 KB) ma **il repository non è cambiato** e su rete senza srcset
(crawler, social bot, browser legacy) quei 4,4 MB restano l'unica realtà.

**Fattori che peserebbero sui CWV (non misurati):** nessun `<link rel="preload">` in nessuna pagina,
quindi l'immagine LCP si scopre solo dopo l'HTML; il CSS dei font Google è un
`<link rel="stylesheet">` render-blocking nel `<head>` di tutte le 18 pagine, dichiarato **prima** di
`styles.css`, senza `preload` e senza `@font-face` locali (3 famiglie, 6+ woff2; ha `display=swap`,
quindi niente FOIT ma lo swap su 3 famiglie); 5 script `defer` = 5 richieste prima che il motion
diventi attivo.

## 8. Rischi SEO concreti

1. **Dominio incoerente (`cilento.eu` vs `gocilento.it`)** — vedi §1. Se il live è `cilento.eu`, tutti
   i canonical, gli hreflang, gli `og:url`, i 18 `<loc>`, il `Sitemap:` e i `url` dei JSON-LD puntano
   a un altro host: i crawler consolidano sull'esterno e `cilento.eu` resta con 18 pagine cancellate.
   **È il rischio che cancella il sito.**
2. **`/` non fa redirect HTTP, fa meta refresh.** `index.html:14` `meta http-equiv="refresh"` +
   `:25` `location.replace`; `.htaccess:5-10` fa solo HTTPS→HTTPS, nessun 301. Google spesso non
   tratta il meta refresh come un 301, quindi `/` resta un 200 indicizzabile duplicato di `/it/`;
   inoltre `index.html:8` dichiara `canonical → /it/` mentre `:12` dichiara `x-default → /`:
   **due segnali contraddittori sulla stessa pagina**, e `/` non è in sitemap pur essendo l'x-default
   delle home. Fix: `Redirect 302 / /it/` e rimuovere canonical e x-default da `index.html`.
3. **"Sei/Six/Sechs" contro 8 destinazioni senza foto** (§4.1) in 4 punti e 3 lingue: i dati JSON sono
   corretti, **è il testo a mentire**.
4. **`og:image` con dimensioni false su 12 pagine su 15** (§5): anteprime social ritagliate o rifiutate,
   costo di distribuzione diretto al primo link condiviso.
5. **Home: title 70–81 caratteri, description 180–191** → title tagliato, description troncata sulla
   parte informativa. Le 15 pagine interne sono entro i limiti: problema isolato alle 3 home.
6. **4,4 MB di JPEG 1280w per chi non legge `srcset`**, nessun WebP/AVIF; il guadagno di `4479036`
   vale solo per i browser moderni. In più `logo.png` 174,2 KB senza `<picture>` nel footer di 15
   pagine e l'hero LCP da 65 KB senza `srcset` sebbene il 640w esista.
7. **Font Google render-blocking senza `preload` né font locali**: è il fattore più probabile di un
   LCP alto su mobile, perché il primo render attende il CSS di un terzo esterno.
8. **`lastmod` indietro di un giorno** (`sitemap.xml` 2026-10-11 vs commit 2026-10-12): costo zero,
   ritarda il ricrawl di un sito che cambia spesso.
9. **Nessun `<meta name="robots">` sulle 18 pagine** (solo `404.html:7`). Corretto oggi, ma significa
   che **non esiste un meccanismo di sicurezza** se un domani una pagina di test o un duplicato.
10. **`@id` dangling su 14 pagine su 15** e `BreadcrumbList` che nomina la home col nome del sito
    invece del suo titolo (§4.2-3): rumore che i validatori segnalano e indebolisce `TravelGuide`.
11. **Dominio hardcoded in 30 URL assoluti** oltre a sitemap/robots/llms.txt/JSON-LD: ogni cambio
    futuro tocca 5 file e 30 riferimenti — il costo di manutenzione del rischio 1.

---

**Solido:** alt 84/84, `width`/`height` 84/84, `srcset` sui 12 file pesanti, h1 unico e senza salti
20/20, 18 title e 18 description uniche, hreflang sitemap⇄HTML allineato con reciprocità verificata
URL per URL, 0 link interni rotti, JSON-LD valido e descrittivo di contenuto reale (60/60
descrizioni, 60/60 ancore), `api/*.json` in sync sui campi generabili.
**Da sistemare:** dominio (1) → redirect `/` (2) → conteggio "sei destinazioni" (3) →
`og:image` (4) → title/description delle home (5) → peso immagini e font (6-7).