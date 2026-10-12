# RESTYLE_PLAN — GoCilento

Registro delle decisioni. Aggiornato durante l'esecuzione, non a prior d.

## Stato

Fase 0 (ricognizione) e i tre audit indipendenti: **completati**.
Batch 1 (blocchi deploy, fatti, accessibilita'): **completato e verificato**.
Palette: **decisa con i numeri**. Copy hero: **decisa**.
Restyle visuale completo: **non eseguito** — vedi "Cosa non e' stato fatto".

## Vincoli ereditati (non negoziabili)

- `ADR-001`: sito statico, nessun framework, nessuna build. Non si introduce
  Angular/React/Vite: un SPA senza SSR non serve HTML ai crawler e perderebbe
  URL per lingua, hreflang, sitemap e lo strato LLM generato dall'HTML.
- I colori e i font derivano dal **logo del cliente**, non da una palette generica.
- Nessun fatto turistico inventato: niente prezzi, recensioni, primati, disponibilita'.
- Ogni link deve portare a qualcosa di reale.

## Decisioni prese

| # | Decisione | Motivo |
|---|---|---|
| D-01 | Palette dal logo, non quella del brief | Confronto misurato: 5 abbinamenti sotto soglia contro 4. Il brief peggiora occhiello (3,29 vs 3,70), bottone (4,06 vs 4,44) e nota foto (2,89 vs 3,26) |
| D-02 | Un valore dal brief adottato: il testo legale del footer | 7,66 contro 4,07: l'unico caso in cui il brief batte nettamente il logo |
| D-03 | Titolo hero = "Il Cilento, tutto da vivere" | Scelta del cliente. Il sottotitolo fattuale resta |
| D-04 | Cache CSS/JS = sempre riverificata | Con "access plus 1 month" su file non versionati un restyle restava invisibile 30 giorni |
| D-05 | Parallasse tolta su `trade.html` | Il contenitore e' un `<figure>` con `figcaption`: altezza indefinita, la percentuale non risolve |

| D-06 | Sezione "percorso" 3D in home, dopo le cifre | Scelta del cliente. Tre.js in `assets/vendor/`, caricato a richiesta |
| D-07 | Le 8 localita' senza foto hanno un segnaposto, non un'immagine | Nessuna immagine inventata per riempire un vuoto |

## Verificato sul percorso 3D

- WebGL 2.0 presente: scena costruita, 20 fermate, **12 texture caricate**
- Animazione: 2612 frame in 6 s di prova, barca spostata 5,12 unita, la fermata
  corrente nella lista passa da "02 Velia" a "03 Agropoli"
- Senza scroll: **0 richieste** di Three.js
- Sottopagine: **0 richieste** di Three.js
- Senza WebGL (simulato): il palco resta nascosto, restano i 12 fermate con link
- IT, EN, DE: sintassi inline verificata, 0 errori console

**Non verificato:** la resa visiva della scena. Qui non escono screenshot: il
funzionamento e' provato via DOM e geometria, l'aspetto va visto a schermo.

## Priorita' per impatto e rischio

1. **Cache deploy** — bloccava ogni restyle (risolto)
2. **Focus trap del menu** — il menu si apriva ma la pagina sotto restava tabulabile (risolto)
3. **Fatti sbagliati pubblicati** — "sei" destinazioni senza foto invece di otto (risolto)
4. **Contrasto sotto WCAG AA** — 5 abbinamenti (risolto)
5. **`og:image` sbagliate** — 12 pagine su 15 (risolto)
6. **`#main` non focalizzabile** — il link di salto spostava lo scroll ma non il focus (risolto)
7. **Navigazione assente nelle 15 sottopagine** — da fare: e' il difetto UX piu' grave rimasto
8. **Moduli motion morti** — da fare: `data-magnetic`, `data-motion-text`, `data-cursor-label` non esistono nell'HTML
9. **Restyle visuale** — rinviato: i due punti di indirizzo (palette, copy) sono stati decisi solo ora

## Cosa non e' stato fatto e perche'

- **Restyle completo delle sezioni** (card per interessi, itinerari in home, contenuti
  editoriali, esperienze locali). Le sezioni esistenti sono gia' frutto di decisioni
  prese e registrate: la home tiene 4 sezioni di proposito per non essere lunga, e gli
  itinerari vivono in una sottopagna perche' il sito non ha sistema di prenotazione.
  Aggiungere sezioni vuote o marketplace senza dati reali contraddice i vincoli.
- **Core Web Vitals**: nessuno strumento qui misura LCP/INP sul campo. Dichiarato
  non verificato invece di dichiararlo superato.
- **Storia git**: ancora da autorizzare, comporta force-push.
