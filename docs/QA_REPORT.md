# QA_REPORT — GoCilento

Data: 2026-10-12. Ultimo commit: 1b3414c parallasse: le foto non si tagliano piu', altezza calcolata sul percorso reale.
File modificati in questa sessione: 32.

## Cosa e' stato eseguito davvero

| Controllo | Metodo | Esito |
|---|---|---|
| Sintassi JS | `node --check` su `app.js` e `assets/motion.js` | superato |
| Bilancio graffe CSS | conteggio su `styles.css` | 350/350 |
| Pagine in browser | 9 URL aperti e ispezionati | tutte rispondono |
| Errori console | raccolta su 9 pagine | **0** |
| Immagini rotte | `naturalWidth === 0` | **0** su 47 immagini |
| Alt mancanti | attributo `alt` presente | **0** mancanti |
| Overflow orizzontale | `scrollWidth > innerWidth` | **0** su 9 pagine |
| `h1` unici | conteggio | 1 su 9 pagine |
| Menu mobile: focus trap | click + `document.activeElement` | focus entra nel pannello |
| Menu mobile: scroll lock | `getComputedStyle(body).overflow` | `hidden` a menu aperto |
| Menu mobile: Escape | `KeyboardEvent` | chiude correttamente |
| Contrasto | calcolo WCAG sui 17 abbinamenti reali | 5 sotto soglia **corretti**, ora tutti passano |
| Larghezza/height immagini | confronto attributi vs file reale | 0 discrepanze su 84 |
| `srcset` | esistenza dei file referenziati | 0 mancanti |
| `og:image` | confronto dichiarato vs reale | 12 corretti, 0 problemi |
| JSON API | `node tools/build-api.js --check` | deriva 0 sui campi generati |
| Link interni | verifica contro il filesystem | 0 rotti |

## Difetti trovati e corretti in questa sessione

1. **Cache deploy** (`.htaccess`) — CSS e JS in cache un mese senza versionamento:
   un restyle sarebbe rimasto invisibile 30 giorni. Ora riverificano sempre.
2. **Focus trap assente** — `app.js` applicava `nav-open` ma il CSS non aveva la
   regola: la pagina sotto restava tabulabile e scrollabile. Aggiunti blocco scroll,
   focus iniziale e ciclo Tab.
3. **Fatto sbagliato pubblicato** — Impressum IT/EN/DE e `llms.txt` dichiaravano sei
   destinazioni senza foto; sono **otto**. Corretto anche `docs/CREDITS.md`.
4. **Contrasto sotto WCAG AA** — cinque abbinazioni sotto 4,5:1, risolte sulla stessa
   tinta senza cambiare identita'.
5. **`og:image:width/height` sbagliate** su 12 pagine su 15.
6. **`#main` non focalizzabile** — il link di salto spostava lo scroll ma non il focus.

## Difetti NOTI e non risolti

1. **Le 15 sottopagine non hanno navigazione.** Header, logo e selettore lingua
   esistono solo in home. Da una sottopagine si arriva alla home solo dal footer, e
   non si cambia lingua. Viola WCAG 3.1.2. **E' il difetto UX piu' grave rimasto.**
2. **Tre moduli di `motion.js` sono morti** — `data-magnetic`, `data-motion-text` e
   `data-cursor-label` non compaiono in nessun HTML, contrariamente a quanto
   dichiarato in `DESIGN.md`.
3. **Le sottopagine caricano 130 KB di GSAP** su pagine in gran parte statiche.
4. **Cinque moduli di navigazione diversi** fra le varie pagine; le Impressum non
   hanno alcuno script, quindi niente "torna in cima".
5. **`og:title` e il titolo reale possono divergere** quando l'h1 cambia: andrebbe
   verificato a ogni deploy.

## Non verificabile in questo ambiente

Dichiarato **non superato**, non "passato":

- **Core Web Vitals** (LCP, INP, CLS sul campo): serve Chrome con Lighthouse o CrUX.
  Non e' disponibile. I valori dichiarati sono stime, non misure.
- **Resa visiva e fluidita' delle animazioni**: qui il RAF non gira e gli screenshot
  non sono disponibili. Verificato solo lo stato iniziale e finale via DOM.
- **Layout a viewport specifici** (320, 375, 430, 768, 1280, 1440 px): non ho uno
  strumento per cambiare la dimensione della finestra. Il responsive resta
  **non verificato** per puntata.
- **Screen reader e navigazione con tecnologie assistive**: nessun tooling.
- **Comportamento in produzione su IONOS**: le regole `.htaccess` sono scritte ma
  non testate su un server Apache reale.

## Note di metodo

Due misure iniziali si sono rivelate sbagliate e sono state riverificate prima di
dare per risolto qualcosa:

- un contggio delle destinazioni senza foto restituiva 0 per un selettore sbagliato
- un controllo su `tabindex` riportava "assente" su un elemento che lo aveva

Nessuna correzione e' stata fatta su quei falsi allarmi: il difetto non c'era.
