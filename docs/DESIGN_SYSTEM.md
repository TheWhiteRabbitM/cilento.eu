# DESIGN_SYSTEM — GoCilento

Token centralizzati in `styles.css` (`:root`). Nessun valore duplicato altrove.

## Colori — derivati dal logo

Il logo ha 7 lettere, ognuna un mondo colorato. La palette nasce da li', non da una
scelta estetica: ogni tinta e' la versione scurita di una lettera, scelta per
superare il contrasto WCAG AA nel ruolo in cui viene usata.

| Token | Valore |Origine | Ruolo |
|---|---|---|---|
| `--paper` | `#FAF6ED` | sabbia | fondo pagina |
| `--paper-2` | `#F2EAD6` | sabbia | fondo sezione alternata |
| `--ink` | `#1C2420` | — | testo principale |
| `--ink-soft` | `#4A5550` | — | testo secondario |
| `--terracotta` | `#BE5B33` | E (#B9543C) | accento decorativo: bordi, filetti |
| `--terracotta-testo` | `#A64F2D` | E scurita | **accento per testo piccolo** su fondo chiaro |
| `--oro` | `#C59D21` | T (#C49C22) | accento su fondo scuro |
| `--oliva` | `#6E702C` | L | territorio parco |
| `--fondo` | `#145B8B` | O (#145B8B) | territorio mare |
| `--mare-950` | `#0C3249` | O scurito | fondi scuri, footer |
| `--tramonto` | `#A85A1C` | E scurita | territorio storia |
| `--uva` | `#8E3A4E` | N scurita | territorio borgo |
| `--oro-chiaro` | `#E9C46A` | T schiarita | testo su fotografia |

### La regola che tiene insieme tutto

Un colore che funziona come accento decorativo **non** funziona come colore di testo
piccolo. `--terracotta` su `--paper-2` fa 3,70:1 e non passa. Per questo esiste
`--terracotta-testo`: stessa tinta, scurita, 4,64:1. Applicare la regola ovunque,
non eccezionalmente.

### Palette del brief: valutata e scartata

Misurata sugli stessi 17 abbinamenti realmente usati nel CSS:

- Palette dal logo: **5** sotto soglia
- Palette del brief (turchese/verde/sabbia/arancio): **4** sotto soglia

Il brief e' migliore solo nel testo legale del footer (7,66 contro 4,07), valore
adottato. Negli altri casi e' peggiore. **La palette del logo resta.**

## Tipografia — tre ruoli, non di piu'

| Ruolo | Font | Uso |
|---|---|---|
| Display | Fraunces | titoli, numeri, citazioni |
| Testo | Archivo | paragrafi, UI |
| Dati | IBM Plex Mono | orari, coordinate, tag, etichette |

Nessun font nuovo: Manrope e Inter del brief avrebbero aggiunto peso e tolto il
contrasto serif editoriale che tiene insieme il carattere del sito.

## Componenti

- **Card destinazione**: bianca, raggio 22px, ombra a due livelli, si alza di 5px.
  Foto in testa con rivelazione a clip e parallasse; tag colorato per territorio.
- **Card vetrina** (Paestum): stessa card a tutta larghezza, foto a sinistra.
- **Barra di navigazione**: quasi-bianca con bordo bianco e ombra ambrata, logo e
  link dentro un elemento solo.
- **Pillola vetro**: navigazione mobile, pulsante pieno, chip filtro.
- **Sottolineatura a scarabocchio**: gesto tipografico del progetto, oro su foto.
- **Stato vuoto**: `.empty`, con testo che spiega la scelta, non un'icona muta.

## Stati

| Stato | Trattamento |
|---|---|
| hover | cambio tinta, mai cambio layout |
| focus | `:focus-visible` con contorno 2px e offset |
| active | leggero scale (0,97) |
| disabled | opacita' ridotta, mai sotto 4,5:1 sul testo che resta |
| vuoto | testo esplicito, mai solo spazio bianco |
| errore | testo esplicito, mai solo colore |

## Movimento

GSAP + ScrollTrigger + Lenis, vendorizzati in `assets/vendor/`, orchestrati da
`assets/motion.js`. Nessun bundler.

Regole ferree:
- Il contenuto e' visibile per default. Lo stato nascosto lo imposta solo il JS e
  solo con `html.has-motion`. **Senza GSAP la pagina resta completa e leggibile.**
- Ogni immagine con parallasse riceve un'altezza pari al contenitore piu' il
  percorso reale dello scorrimento: se no, la foto si scopre e si taglia.
- `prefers-reduced-motion` disattiva tutto e lascia una pagina ferma.
- Salvagenti: se il RAF non gira (tab in background) l'hero e i trigger gia'
  superati vengono completati con un timer, cosi' nessun contenuto resta invisibile.
