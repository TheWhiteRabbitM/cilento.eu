# AUDIT UX / UI e accessibilità — Agente 2

Data: 2026-10-12 · Repo: `cilento.eu` · Target: WCAG 2.2 AA.

**Metodo e limiti.** Ho solo letto il codice: nessun browser con schermo. Non ho potuto verificare
resa visiva reale, fluidità delle animazioni, layout a breakpoint specifici (1024/900/768/640/420 px)
né screen reader reali. **VERIFICATO** = letto in un file con `file:riga`. **IPOTESI** = deduzione non
verificata a schermo. I contrasti li ho calcolati io dai hex di `styles.css` (formula WCAG 2.x): quei
numeri sono verificati, l'effettiva resa del testo sopra la foto dell'hero resta ipotesi.

---

## 1. Percorsi di navigazione principali

**Home** (`it|en|de/index.html`): `<nav class="nav" aria-label>` (`it/index.html:307`) con logo→`#top`,
4 link (`:312-315`: `#destinazioni`, `esperienze`, `itinerari`, `info`), 3 bandierine lingua
(`:318-320`), burger (`:322`). Sotto ~1024 px (`.nav__links{display:none}`, `styles.css:731` e `:300`)
compaiono burger + `.langs--mobile` (`:343-347`) e il foglio `#navSheet` (`:722-741`) con **5** voci,
incluse `trade.html` (`:730`). CTA hero → `#destinazioni` (`:339`); pannello finale → `mailto:` e
Trade (`:751-752`).

**Sottopagine (5×3 lingue): i percorsi si rompono.** Non esiste alcuna `<nav>`, né logo, né selettore
lingua. Unica uscita: link testuale `← GoCilento` dentro un `<p class="kicker">`
(`it/esperienze.html:89`, `it/itinerari.html:89`, `it/info.html:89`, `it/trade.html:85`,
`it/impressum.html:73`). Il footer aggiunge solo `impressum` e `trade` (`it/esperienze.html:263`).
**Da `/it/esperienze.html` non si arriva a `/it/info.html`, né a `/en/esperienze.html`.**

- **A1 — Cambio lingua assente ovunque tranne la home.** Un utente TEDESCO che atterra su una
  sottopagine in inglese (ricerca, link esterno, `llms.txt`, `api/*.json`) non può passare a IT/DE →
  **3.1.2 Language of Page non soddisfatto**. Gravità **Alta**.
- **A2 — Stessa pagina, due nomi.** `Esperienze` (`it/index.html:313`) vs `Stagioni` (`:727`); il desktop
  ha 4 voci, il foglio 5. Idem `en:313/722`, `de:313/723`. Gravità **Media**.
- **A3 — `aria-current` assente sui link nav**, presente solo sulle lingue (`:318-320`). **Bassa**.
- **A4 — `index.html` (x-default) e `404.html` fuori dal design system**: doppio redirect
  (`index.html:14`+`:25`), nessun `<h1>`, nessun skip link, stili inline (`:15-18`); `404.html` ha solo
  `<main>`+`<nav>` e percorsi assoluti `/it/` (`:21`) che si rompono in una sottocartella. **Media**.

## 2. Accessibilità WCAG 2.2 AA

**Landmark/struttura.** `main` unico ✅, `footer` ✅, skip link su 19/21 pagine ✅. **B1 — `#main` senza
`tabindex="-1"`** (`it/index.html:352` e analoghe): il skip link (`:294`) sposta lo scroll ma il focus
resta su `body` → **2.4.1 incompleto**. **Media**. **B9 — Nessun landmark `banner`**: la home ha
`<nav>` dentro `<section class="hero">` fuori da `main` (`:297,307`); le sottopagine non hanno landmark
di navigazione. **Media**. **Heading** coerente ovunque, nessun salto (h1→h2→h3). **B10** — su
esperienze/itinerari/info l'h1 è `sr-only` (`it/esperienze.html:90`, `it/itinerari.html:90`,
`it/info.html:90`): la prima intestazione *visibile* è un `h2`; su trade/impressum l'h1 è visibile
(`it/trade.html:87`, `it/impressum.html:74`). **Bassa**.

**Nomi accessibili.** ✅ burger con `aria-label`+`aria-expanded`+`aria-controls` (`:322-324`), to-top
con `aria-label` (`:775`), tab con `aria-controls`/`aria-selected`/`aria-labelledby`
(`it/esperienze.html:100-107`), live region sul filtro (`:391`), tutti gli SVG decorativi con
`aria-hidden="true"` (`:340`, `:726-730`, `:776`, `:784`), tutti gli `<img>` con alt descrittivo
(`:302`, `:398`, `:415`…). **B6 — Le due tabelle dell'info non hanno nome accessibile**:
`<table class="timetable">` senza `<caption>` né `aria-label` (`it/info.html:143` e `:172`), con
intestazioni identiche "Rotta/Stato": uno screen reader annuncia due tabelle indistinguibili. **Media**.

**Focus visibile.** Globale `:focus-visible{outline:3px solid var(--terracotta)}` (`styles.css:55`), oro
su fondo scuro (`:56`), override sui link nav (`:697`), `currentColor` sul burger (`:155`),
`outline:none`+underline offset 8px sul foglio (`:256`), duplicato sul to-top (`:556`). Esiste ed è
applicato a tutti i controlli; due riserve: il foglio usa il sottolineato come unico segnale (2.4.11
non verificabile qui) e `.langs--desk a`/`.navsheet__langs a` non hanno override dedicato.

**Tastiera.** ✅ Implementato: tab stagioni con `←/→/Home/End` e roving `tabindex` (`app.js:139-163`);
`inert` applicato/rimosso sul foglio (`:37-38` + `it/index.html:722`); `Escape` chiude e **riporta il
focus sul burger** (`:50-55`); click su link o scrim chiude (`:44-48`). **B4 — Tre difetti sul foglio
nav:** ① **nessun focus trap né scroll lock**: `document.body.classList.toggle('nav-open')`
(`app.js:32`) **non ha alcuna regola in `styles.css`**, quindi la pagina resta tabulabile e scrollabile
sotto lo scrim — **Alta**; ② **il focus non entra nel pannello all'apertura** (`app.js:26-39` non chiama
`focus()`): da tastiera apri il menu e il Tab resta fuori — **Alta**; ③ `.navsheet__scrim` è un `<div>`
non focusabile (`it/index.html:723`): chiudere col mouse non riporta il focus al burger — **Bassa**.

**Contrasto (calcolato sui hex di `styles.css`) — B2, 8 combinazioni sotto 4.5:1:**

| Elemento | Coppia | Rapporto | Riferimento |
|---|---|---|---|
| `.kicker`, `.dest-start/.dest-next`, `.row-num`, `.steps::before` | `#BE5B33` su `#F2EAD6` | **3.70** | `styles.css:69-73,449-450`; sez. `.paper-2` `it/index.html:375,377` |
| `.kicker` su paper | `#BE5B33` su `#FAF6ED` | **4.11** | `it/trade.html:86,97,132`; `it/itinerari.html:97` |
| `.foot-small` | `#7E928E` su `#0C3249` | **4.07** | `styles.css:632` — testo legale in **19 pagine** |
| `.btn-solid` | `#fff` su `#BE5B33` | **4.44** | `styles.css:535`; CTA `it/index.html:751` |
| `.dest-start` / `.dest-next` | `#BE5B33` su `#fff` | **4.44** | `styles.css:449-450` |
| `.status-off` | ink-soft `.7` su `#F2EAD6` | **3.29** | `styles.css:614`; `it/info.html:148,153,154,180` |
| `::after` "Foto non disponibile" | ink-soft `.65` su `#fff` | **3.23** | `styles.css:420-424` — 6 card su 20 |
| `.langs--desk a` (non corrente) | ink `.6` su barra | **4.20** | `styles.css:699` |

✅ **Oltre soglia**: ink 14.72 · ink-soft 7.19/6.47 · `#B4C3BF` 7.33 · `#A9BDB8` 6.80 · `#C3CFCC`
8.37 · `#8FA3A0` 5.05 · oro su mare-950 5.24 · oro-chiaro 8.02 · tag territorio su bianco 5.07–7.33 ·
focus terracotta su paper-2 3.70 (≥3:1, valido come non-testo). **IPOTESI:** i bianchi dell'hero
(`rgba(255,255,255,.55)` in `.hero__text span`, `styles.css:710`; `.hero__micro` `.7`, `:723`) passano
su navy (6.27/9.68) ma l'hero è una **foto**: va misurato a schermo.

**`prefers-reduced-motion` ✅ rispettato su tre livelli**: `motion.js:12,337` (niente GSAP, Lenis,
cursore) · blocco CSS `styles.css:736-745` (animation/transition azzerate, `.anim` e `.rv` visibili) ·
`styles.css:801-805` (cursore e parallasse spenti) · `app.js:8,102` (scroll "auto"). Non esiste variante
`prefers-reduced-data` né interruttore utente.

---

## 3. Stati interattivi

**ESISTONO (verificati, `styles.css`).** Hover: `.chip:389`, `.tab:468`, `.dest:411-414`,
`.row:hover h3:491`, `.btn-solid:536`, `.btn-line:538`, `.to-top:555`, `.nav__links a:696`,
`.langs--desk a:700`, `.navsheet__link:254`, `.navsheet__cta:273`, `.navsheet__langs a:281`,
`.cta-solid:718`, burger `:156`. Focus: `:focus-visible` ovunque (`:55-56`) + 4 override. Active:
**solo** `.cta-solid:active` (`:719`). Selezionato: `.chip[aria-pressed=true]` con bordo 2px **e**
`font-weight` (`:390`) → non solo colore ✅; `.tab[aria-selected]` (`:469`); `aria-current` sulle lingue
(`:199,205,282`). Vuoto: `#no-dests` (`it/index.html:715`). Attenuato: `.status-off` (`:614`).

**MANCANO.** ① **Disabilitato assente**: `:disabled` non compare mai in `styles.css` e nessun elemento
è disabilitabile — coerente con un sito senza form, ma **DESIGN.md:30 dichiara "btn active/disabled"**:
sistema promise e non implementato (**Bassa**, documentale). ② **Errore inesistente per scelta**:
nessun `<form>`, nessuna `fetch`, tutti i CTA sono `mailto:` (`it/index.html:751`,
`it/itinerari.html:145`, `it/trade.html:116,152`) — non esistono stati di errore né di caricamento perché
non esiste interazione asincrona. ③ **Hover dei link footer solo per tinta** (`.foot a`, `:624`).
④ **`#no-dests` è codice morto**: i 5 filtri hanno tutti ≥1 risultato (mare 6, storia 2, borgo 6, parco 6
— `it/index.html:385-388` e `:446-711`), quindi il messaggio (`app.js:127`) non può mai apparire.

---

## 4. Coerenza tra le pagine

**Coerente ✅**: token e `.wrap` 1180px condivisi; footer standard identico in 5 pagine × 3 lingue
(`it/esperienze.html:251-266`, `it/itinerari.html:154-169`, `it/info.html:214-229`,
`it/index.html:759-773`); `<html lang>` e traduzioni di skip link, `aria-label`, to-top, tab e live region
corrette in it/en/de; impalcatura identica (6 script in 15 delle 21 pagine).
**Incoerente ✗ (tutto verificato).** ① **Tre footer diversi**: standard · `it/trade.html:159-170` senza
logo e senza riga UNESCO · `it/impressum.html:135-142` solo ©, nessun logo — **Media**.
② **Le sottopagine non caricano JS**: `impressum.html` × 3 ha **1 solo script** (il JSON-LD, `:19`):
niente `app.js`, `motion.js`, cursore e **niente bottone to-top** (presente in `it/index.html:775`) —
**Media**. ③ **Due implementazioni del ritorno all'home**:
`style="text-decoration:none;color:inherit"` inline in 4 pagine (`esperienze:89`, `itinerari:89`,
`info:89`, `impressum:73`) e nulla in `trade.html:85`, che si regge su `.trade .kicker a`
(`styles.css:515`) — **Bassa**. ④ **Due CTA per lo stesso scopo**: `.panel-cta` solo home
(`it/index.html:746`) e `.tail-cta` altrove (`itinerari:144`, `trade.html:151`), mentre `DESIGN.md:16`
promette il pannello ovunque — **Media**. ⑤ **Larghezze diverse**: `.trade .wrap{max-width:68ch}`
(`:513`) e `62ch` inline su impressum (`it/impressum.html:72`) contro 1180px.

---

## 5. Problemi UX (problema → impatto → gravità → modifica → verifica)

| # | Problema | Impatto | Gravità | Modifica | Criterio di verifica |
|---|---|---|---|---|---|
| P1 | Sottopagine senza nav né lingua (`it/esperienze.html:86-92` e analoghe) | 3.1.2 non soddisfatto; 3 sezioni irraggiungibili | **Alta** | `<header>` condiviso: logo, link + Trade, 3 lingue con `aria-current` | Da ogni `/it/*.html` si arriva a `/en/…` e a `trade.html` con 0 click |
| P2 | Foglio nav senza focus trap né scroll lock (`app.js:32`, nessuna regola `.nav-open`) | Focus esce dal menu aperto; pagina scrolled sotto lo scrim | **Alta** | `overflow:hidden` su `body.nav-open` + trap (o `inert` sui siblings) | Tab oltre l'ultimo link resta dentro; scroll col mouse bloccato |
| P3 | Il focus non entra nel pannello all'aperto (`app.js:26-39`) | Da tastiera apri il menu e il Tab resta fuori | **Alta** | `navPanel.focus()` o focus sul primo link | Il primo Tab dopo l'apertura mette a fuoco "Destinazioni" |
| P4 | 8 combinazioni sotto 4.5:1 (§2) | Testo legale, kicker, "stagionale", crediti foto illeggibili | **Alta** | `--terracotta`→`#A34C28` su carta, `#7E928E`→`#9FB0AC`, togliere `opacity` a `.status-off` e al `::after` | Ogni coppia calcolata ≥4.5 via script |
| P5 | `#main` senza `tabindex="-1"` (`it/index.html:352` × 21) | Skip link non trasferisce il focus: 2.4.1 incompleto | **Media** | `tabindex="-1"` su tutti gli `#main` | Dopo skip link il focus è su `main`, non su `body` |
| P6 | Tabelle senza `<caption>` (`it/info.html:143,172`) | Screen reader: due tabelle indistinguibili | **Media** | `<caption>` o `.sr-only` con il tipo di trasporto | Nome accessibile della tabella leggibile a schermo |
| P7 | Etichette nav divergenti (`it/index.html:313` vs `:727`) | Due nomi per la stessa pagina in 3 lingue | **Media** | Un solo etichettaggio per destinazione | Link desktop e voci del foglio hanno lo stesso testo |
| P8 | Tre footer + impressum senza JS (`trade.html:159`, `impressum.html:135`) | Identità e comportamento non uniformi; niente to-top | **Media** | Template footer unico; caricare `app.js`+`motion.js` anche su impressum | 21 footer identici e `toTop` presente ovunque |
| P9 | `.panel-cta` solo home vs `.tail-cta` (`DESIGN.md:16`) | CTA finale incoerente fra pagine | **Media** | Un pattern unico | Un solo pattern CTA in tutte le pagine |
| P10 | Tre moduli motion morti (`motion.js:136,278,315-327`): zero `data-magnetic`, `data-motion-text`, `data-cursor-label` esterni | Byte inutili; `DESIGN.md:32` promette funzioni inesistenti | **Media** | Aggiungere gli attributi o rimuovere i moduli e allineare `DESIGN.md` | Ogni modulo trova ≥1 elemento, o non esiste |
| P11 | `#no-dests` irraggiungibile (nessun filtro a zero risultati) | Stato vuoto mai testabile | **Bassa** | Test con filtro a zero, o rimuovere | Un filtro senza risultati mostra il messaggio |
| P12 | Nessun `aria-current` sui link nav (`it/index.html:312-315`) | Orientamento debole per AT | **Bassa** | `aria-current="page"` sulla voce attiva | La voce attiva è annunciata come corrente |
| P13 | Hover dei link footer solo per tinta (`styles.css:624`) | Segnale debole al passaggio | **Bassa** | `text-underline-offset` all'hover | Link distinguibile senza distinguere la tinta |

---

## 6. Verificato vs ipotesi

**VERIFICATO** (lettura diretta dal codice): assenza di nav e selettore lingua sulle 15 sottopagine ·
etichette nav divergenti · `nav-open` senza regola CSS e nessun focus trap · focus non portato nel
pannello · `inert` gestito bene ed `Escape` con ritorno del focus · tab stagioni con frecce/Home/End e
roving tabindex · 8 contrasti sotto soglia e 11 sopra (numeri calcolati) · `#main` senza
`tabindex="-1"` · tabelle senza caption · due footer non standard · `impressum.html` × 3 senza JS né
to-top · `#no-dests` irraggiungibile · tre moduli motion morti e `.pill` (`styles.css:314`) su classe
inesistente · nessun `:disabled` in tutto il CSS · nessun form né fetch (quindi nessuno stato di
errore/caricamento) · skip link su 19/21 pagine, assente su `404.html` e root · `prefers-reduced-motion`
rispettato su CSS, `motion.js` e `app.js` · tutti gli `<img>` con alt e tutti gli SVG decorativi con
`aria-hidden`.

**IPOTESI (non verificabile senza schermo)**: contrasto reale dei bianchi sopra la foto dell'hero ·
leggibilità del focus-outline sopra ombre e blur del foglio · comportamento al bordo del breakpoint
1024 px (`.nav__links{display:none}` compare due volte, `styles.css:731` e `:300`) · fluidità di
Lenis/parallasse e flash dei `.rv` · esito del layout a 900/768/420 px (`.verbi-fig` sticky,
`.dest--lead`, `.routes-grid`) · filtro su schermi stretti · leggibilità dei `.chip` su `.paper-2`.
**Non verificabile in alcun modo**: resa visiva, animazioni, layout per breakpoint, comportamento con
screen reader e tastiera reali. Le prove da eseguire a schermo sono nella colonna "Criterio di verifica"
di §5.