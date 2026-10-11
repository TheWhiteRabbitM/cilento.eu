# AUDIT DI ORIGINALITÀ — GoCilento — 2026-10-12

Verdetto: **Clear in checked scope** per l'originalità, con **due errori di accuratezza
in una pagina legale pubblicata** che vanno corretti subito (non sono originalità, sono
falsi dichiarati).

Metodo: confronto per categoria tra sito pubblicato, sorgente, asset e **tutta la storia
git** (22 commit, 2026-10-08 → 2026-10-12). Strumento deterministico:
`build_evidence_inventory.py` + verifiche manuali su file, byte e cronologia.

---

## 1. Registro fonti

| # | Fonte | Dove | Cosa può provare | Stato |
|---|---|---|---|---|
| R1 | **Travellian** (preview) | `Downloads/Travellian - Travel Agency Landing Page (Community).zip` → 2 PNG (3840×2160, 4800×2880) | resa del template, device, device di sezione | ✅ ispezionato |
| R2 | **Travellian** (codice) | — | confronto riga per riga | ❌ **assente**: lo zip contiene solo 2 immagini, nessun sorgente |
| R3 | `docs/ORIGINALITY.md` (2026-10-08 rev 2) | repo | audit precedente: suedtirol.info, modello Halden | ✅ letto (datato, pre-git) |
| R4 | `docs/CREDITS.md` | repo | provenienza e licenze foto | ✅ letto |
| R5 | `docs/DESIGN.md`, `docs/ARCHITECTURE.md` | repo | decisioni di design, ADR | ✅ letti |
| R6 | **Storia git** | repo, 22 commit | file cancellati, rinominati, risorse esterne mai pubblicate | ✅ ispezionato |
| R7 | `shot-full.jpg`, `shot-small.jpg` | temp, 11/10 | resa del sito a quella data | ✅ disponibili |
| R8 | **Wayo** (Webflow a pagamento) | — | — | ❌ **mai scaricato**: confronto impossibile |
| R9 | **Wanderful** (spec React) | solo in conversazione | — | ❌ **nessuna copia locale** |
| R10 | **OceanPulse** (asset CloudFront) | — | — | ❌ **nessuna copia locale** |
| R11 | **Modello Halden** | cancellato pre-git | — | ❌ **nessuna copia**: irrecuperabile |
| R12 | 3 screen-recording (mp4/webm, 20–39 MB) | `Downloads/` | riferimento di **motion** | ❌ **`ffmpeg` non installato**: fotogrammi non estraibili |

**Access gap dichiarati:** R2, R8, R9, R10, R11, R12. Le affermazioni su Wayo, Wanderful,
OceanPulse e Halden restano quelle di `docs/ORIGINALITY.md` e **non** sono state
riverificate in questa passata. Nessun access gap è stato colato come esito positivo.

---

## 2. Red-flag table

| # | Cat. | Evidenza sito | Evidenza riferimento | Sovrapposizione | Sev | Esito |
|---|---|---|---|---|---|---|
| RF-1 | **Storia / asset** | `assets.mixkit.co/videos/44498/44498-1080.mp4` in `it/`, `en/`, `de/index.html` nei commit fino a `0acdb14^` | nessun riferimento | **video stock di terzi hotlinked nell'HTML pubblicato**, poi rimosso il 2026-10-10 | MEDIA | rimosso dal sito; **il blob resta nella storia git** |
| RF-2 | **Storia / asset** | 4 URL `images.unsplash.com/photo-…` in `i18n/{it,en,de}.json` | nessun riferimento | **immagini stock hotlinked** in JSON pubblicati, poi `i18n/` cancellato | MEDIA | rimosso; **restano nella storia** |
| RF-3 | **Asset / asset** | `styles.css:85` commento «meccanica OceanPulse, contenuti Cilento» | R10 (non disponibile) | nome di un terzo in un commento CSS pubblicato | LOW | nota di provenienza, non contenuto. Decisione del cliente |
| RF-4 | **Struttura** | hero full-bleed + titolo serif + nav con link attivo; **0 `<form>`, 0 `<input>`, 0 `<select>`** in tutto il sito | Travellian: hero full-bleed + serif + nav underline + **barra di prenotazione a 4 campi + "Book Now"** | solo la grammatica hero/nav, che è **comune** e **permissivamente licenziata** | LOW | accettata; il dispositivo più distintivo del template **non è stato preso** |
| RF-5 | **Testi / legal** | `it/en/de/impressum.html:128` dichiarava «un video da Mixkit» | — | **dichiarazione legale falsa**: il video non esiste più nel codice | **ALTA** | ✅ **CORRETTO 2026-10-12**: riscritto il paragrafo Privacy in IT/EN/DE, ora dichiara solo Google Fonts e aggiunge che tutte le immagini sono locali |
| RF-6 | **Markup** | `it/en/de/impressum.html:123` | — | `</p>` di troppo: 11 `<p>` contro 12 `</p>` | MEDIA | ✅ **CORRETTO 2026-10-12**: rimossa la chiusura orfana in tutte e tre le lingue, ora 11/11 |

### Dettaglio su RF-4 (licenza, dato oggettivo)

Il file `01.png` contenuto nello zip del template dichiara testualmente:

> **100% Free** — Feel free to use this project for personal and commercial usage.
> No need to give credits, but we would highly appreciate if you do!
> Reach us at – siam.alrazzi@gmail.com

Quindi l'uso commerciale della **grammatica di layout** è autorizzato dalla fonte stessa.
Questo non autorizzerebbe comunque a copiare testo, asset o identità — e non è successo.

---

## 3. Category pass list

| Categoria | Esito | Prova |
|---|---|---|
| **Testi** | ✅ superato | 0 sovrapposizioni testuali; nessuna stringa `Halden`, `suedtirol`, `Wanderful`, `Wayo`, `Travellian`, `alrazzi`, `Expeditions to the edge`, `Start your unforgettable` in **tutta** la storia |
| **Marchi** | ✅ superato | solo identità propria (GoCilento, Agos Tours Srl); nessun marchio di terzi nei contenuti pubblicati |
| **Numeri** | ✅ superato | i numeri sono dati verificabili del Parco (superficie, UNESCO 1998, 20 località); nessun riuso dei numeri del template (prezzi/rating) |
| **Immagini** | ✅ superato | 19 immagini: 18 da Wikimedia con licenza verificata in `CREDITS.md`, 1 foto propria dell'hero. **0 file identici** al riferimento (hash). Nessuna immagine generica al posto delle 6 località senza foto |
| **Asset** | ✅ superato | font Google (dichiarati), logo fornito dal cliente, favicon originali. Nessun bundle di terzi |
| **Video** | ⚠️ superato nella storia | nessun `<video>` nel sito attuale; vedi RF-1 |
| **Struttura / motion** | ✅ superato | 4 sezioni (hero, cifre, destinazioni, su-misura) contro le ~10 del template; barra di prenotazione assente; zero form |
| **History** | ✅ ispezionata | 22 commit, 3 soli file mai più presenti: `cilento.eu.zip`, `assets/img/hero.jpg`, `i18n/*.json` — tutti rimossi per motivi leciti |

---

## 4. History findings

File **mai** committati (quindi mai pubblicati): nessuno strano.
File cancellati dopo la pubblicazione: **3**, tutti verificati.

1. **`cilento.eu.zip`** (6,7 MB) — commit `b6b4c77`, rimosso e aggiunto a `.gitignore`.
   Nessun impatto sui contenuti.
2. **`assets/img/hero.jpg`** — rimosso in `0acdb14` quando l'hero è passato alla foto
   propria al tramonto.
3. **`i18n/{it,en,de}.json`** — rimosso in `eeebd29`. **Contenevano 4 URL Unsplash
   hotlinked** (RF-2). Se quei file sono stati serviti pubblicamente, le immagini
   stock erano raggiungibili dal sito.

**Rischio residuo:** i blob RF-1 e RF-2 restano nel repository pubblico su GitHub.
Non è un problema di copyright (Mixkit e Unsplash sono licenze stock permissive), ma
è materiale di terzi che non vorresti associato al tuo progetto. La decisione —
riscrivere la storia o lasciarla — è tua.

---

## 5. Access gap e aree non provate

- **Nessun confronto pixel-per-pixel** con Wayo, Wanderful, OceanPulse, Halden: nessuna
  copia locale. Se quelle pagine sono ancora online, servono catture per confrontarle.
- **Nessun confronto di motion**: 3 registrazioni schermo non analizzabili senza `ffmpeg`.
  Installandolo si potrebbe estrarre fotogrammi e verificare transizioni e timing.
- **Nessun confronto riga per riga con Travellian**: lo zip è solo immagini. Il codice
  del template non è mai stato avuto.
- **Il sito live non è stato controllato**: IONOS potrebbe non aver ancora preso l'ultimo
  commit. L'audit copre il sorgente e la storia, non ciò che è effettivamente in produzione.
- I confronti **testuale e numerico automatici** sono strutturalmente deboli in questa
  passata: il riferimento non contiene file di testo. Quei due controlli sono passati,
  ma **non hanno avuto contro cosa confrontare** — la copertura reale l'ho fatta a mano.

---

## 6. Piano di correzione, in ordine

1. ~~**Corregge `it/en/de/impressum.html`**~~ — ✅ **fatto il 2026-10-12**: la Privacy ora
   dichiara solo Google Fonts, tutte le immagini sono locali, e il `</p>` di troppo è
   sparito. Verificato nel browser: 11/11 paragrafi, zero richieste esterne, console pulita.
2. **Decidere sulla storia git** — riscrivere i commit che contengono il video Mixkit e
   gli URL Unsplash, oppure accettarli e registrarlo qui.
3. **Decidere sul commento `styles.css:85`** — se non vuoi il nome di un terzo nel CSS
   pubblicato, riscrivilo come nota di provenienza neutra.
4. **Colmare i gap** — catturare Wayo/Wanderful/OceanPulse se le pagine esistono ancora,
   installare `ffmpeg` per le registrazioni, rieseguire l'audit sui riferimenti mancanti.
5. **Non richiede azione**: foto, testi, struttura, numeri, form assenti, licenze foto.

---

## 7. Cosa questo audit NON dice

Non dice che il sito sia copiato: non ho trovato file, testi, marchi, numeri o immagini
in comune con i riferimenti. Non dice nemmeno che sia **provato** libero da ogni
sovrapposizione: sei riferimenti non erano disponibili e restano non verificati.