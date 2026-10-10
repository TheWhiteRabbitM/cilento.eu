# GoCilento

![GoCilento](assets/logo.png)

**Guida indipendente al Cilento. Niente prenotazioni, niente commissioni, niente newsletter.**

> Dove i Greci hanno costruito in pietra,
> il mare ha risposto in grotte.

Sito statico trilingue (IT/EN/DE) sul Cilento: 20 destinazioni, 4 stagioni,
4 verbi cilentani, 3 itinerari onesti, sapori DOP e come arrivare. Solo
HTML + CSS + JS vanilla, nessuna build, nessun framework.

## Struttura

```text
gocilento.it/
├── index.html          # redirect alla lingua (x-default)
├── it/ · en/ · de/     # le tre pagine reali, una per lingua
├── api/it.json · api/en.json · api/de.json  # contenuti integrali per le AI
├── llms.txt            # indice per LLM (pagine + API + destinazioni)
├── 404.html            # pagina non trovata trilingue
├── styles.css          # design system unico
├── app.js              # solo comportamento (menu, tab, filtri)
├── assets/img/         # foto locali verificate (Wikimedia Commons)
├── assets/logo.png     # marchio CILENTO illustrato (+ .webp)
├── sitemap.xml         # sitemap con hreflang reciproci
├── robots.txt
└── docs/               # ARCHITECTURE, DESIGN, ORIGINALITY, CREDITS
```

## Design

- Tre ruoli tipo: Fraunces (display), Archivo (testo), IBM Plex Mono (dati).
- Palette misurata dal logo (mediane PIL sulle 7 lettere): blu fondo `#145B8B`,
  arancio tramonto `#A85A1C`, viola uva `#8E3A4E`, verde oliva `#6E702C`,
  oro `#C59D21`, mare scuro `#0C3249`.
- Destinazioni come **righe editoriali numerate**, non card. Un colore per
  territorio: mare blu, storia arancio, borgo viola, parco verde.
- Hero a due colonne con video, foglio di navigazione e animazioni solo
  `transform` + `opacity`, con rispetto di `prefers-reduced-motion`.

## SEO multilingua

- URL path-based: `/it/`, `/en/`, `/de/` + `x-default` su `/`.
- `hreflang` reciproci in ogni pagina e nella sitemap, `canonical`
  autodescrittivo, `og:locale` + alternati, meta title/description tradotti.

## API per LLM

- `api/{it,en,de}.json`: contenuto integrale di ogni pagina (hero, fatti,
  20 destinazioni, stagioni, verbi, itinerari, sapori, pratico, crediti),
  generato dall'HTML con `build-api.js` (l'HTML resta l'unica fonte).
  Riesegui il generatore dopo ogni modifica ai testi.
- `llms.txt`: indice per LLM (pagine + API + ancore + destinazioni).
- JSON-LD (`WebSite` + `TravelGuide` + `ItemList` di 20 `TouristDestination`)
  iniettato in ogni pagina dallo stesso generatore.
- `robots.txt` ammette esplicitamente i crawler AI (anche `llms.txt` e `api/`).
- Ogni footer linka `llms.txt` e l'API della propria lingua.

## Sviluppo locale

Qualsiasi server statico va bene, dalla root del progetto:

```bash
python -m http.server 8899
# http://localhost:8899/it/
```

Non aprire i file via `file://`: i link lingua relativi funzionano,
ma video, font e fetch si comportano meglio su HTTP.

## Deploy

Hosting statico qualsiasi (i file non richiedono build né server-side):
carica tutto mantenendo i percorsi, `/it/`, `/en/` e `/de/` si risolvono
da soli come directory. Nessun `_redirects` necessario.

## Crediti

- Foto: Wikimedia Commons, licenze CC BY / CC BY-SA / pubblico dominio.
  Autori e licenze esatti in [`docs/CREDITS.md`](docs/CREDITS.md).
- Le foto delle stagioni sono **di luogo, non di stagione**: dichiarato
  nel sito invece di spacciare una stagione per un'altra.
- Sei destinazioni non hanno foto (non esistono su Commons): le schede
  lo dicono invece di usare immagini generiche.
- Marchio CILENTO illustrato fornito dal committente.
- Video hero: Mixkit Free License — è un tramonto generico, dichiarato.

## Licenza

Testi e codice originali del progetto. Le foto restano sotto le rispettive
licenze Creative Commons indicate in `docs/CREDITS.md`.
