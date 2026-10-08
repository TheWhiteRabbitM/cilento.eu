# ORIGINALITY — audit 2026-10-08 (rev 2: + modello Halden)

Verdetto: **Changes recommended → applicate; ora Clear with low-risk similarities**.

## 1. Registro fonti
- R1 suedtirol.info/it/it (fetch 2026-10-08): solo architettura IA. Mai contenuti copiati.
- R2 Modello "Halden" (prompt brief, hero + header morphing): grammatica di interazione adottata su richiesta; brand/copy/asset Halden MAI pubblicati su cilento.eu.
- Sito: index.html + styles.css + app.js + assets/ (verificati via grep: zero stringhe Halden, zero stringhe suedtirol nei contenuti; unica citazione = attribuzione footer).
- Screenshot full-page fornito dall'utente (rendered output): ispezionato.
- Storia: repo non-git → gap dichiarato, nessun log verificabile.

## 2. Red-flag table
| # | Categoria | Sito | Riferimento | Overlap | Sev | Fix |
|---|-----------|------|-------------|---------|-----|-----|
| 1 | Brand/copy/asset esatti | halden-hero.html (file separato): logo Halden, "Expeditions to the edge", testi EN, 7 asset cloudfront | R2 (originale Halden) | Clone esatto pubblicato sotto il nostro dominio | ALTA | **Rimosso**: file eliminato, pattern resta solo come implementazione riscritta in index.html (ADR-005) |
| 2 | Struttura/motion | dd condiviso morph x/w/h, exit ±56px blur, instant/snap, grace 140ms, heroIn, ingressi .35/.45/.55 | R2 (stessa grammatica) | Combinazione distintiva adottata dal brief | MEDIA | Tenuta (richiesta dal brief) ma riespressa: tema chiaro, Fraunces, etichette cilentane, header sticky + chiusura a scroll, cue riscritto (riga + "scorri verso il mare", niente parentesi) |
| 3 | Testi/marchi/numeri | headline, microcopy, 181.048 ha, UNESCO 1998/whc842, Keys 1962 | R1/R2 | Nessun match (grep pulito) | — | — |
| 4 | Immagini | Unsplash evocative, dichiarate in footer | R1 DAM / R2 cloudfront | Nessun asset condiviso | LOW | Gap noto: servono foto proprie del Cilento |
| 5 | Video | Nessun video | R1/R2 thumbnails | Nulla da confrontare | — | — |
| 6 | History | No git | — | Non verificabile oltre il glob (8 file) | GAP | — |

## 3. Category pass list
Testi ✓ · Brand ✓ · Numeri ✓ · Immagini ✓(con gap) · Asset/codice ✓ · Video ✓ · Struttura/motion ⚠→differenziata · History GAP.

## 4. Fix applicati (questa rev)
1. Eliminato halden-hero.html (clone esatto).
2. Cue scroll: da "( scorri )" a linea + "scorri verso il mare".
3. ADR-005 documenta adozione-meccanica vs espressione-originale.
4. Struttura vincolante aggiornata (8 file, favicon incluso).

## 5. Resta da fare (non bloccante)
- Foto proprie cilentane al posto delle Unsplash evocative.
- Iniziare repo git per rendere la history verificabile.
