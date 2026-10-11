# DESIGN.md — sistema gocilento.it v2 (gate no-ai-design-slop)

## Tesi visiva (una sola)
"Epigrafe greca + mare di Palinuro". Il nome è il logo: `cilent` in Fraunces di pagina + `o` come SVG inline (anello-Arco con onda) + `.eu` funzionale in mare. Niente testo dentro SVG-come-immagine (i font pagina lì non esistono e il fallback sgrana tutto). Favicon ed emblemi solo vettore puro.

## Token (palette misurata dal logo con PIL, mediane sulle 7 lettere)
--paper #FAF6ED, --paper-2 #F2EAD6, --ink #1C2420, --mare-950 #0C3249 (fondi scuri, dalla O),
--fondo #145B8B (blu testo, dalla O), --tramonto #A85A1C (arancio testo, dalla E),
--uva #8E3A4E (viola testo, dalla N), --oliva #6E702C (verde testo, dalla L),
--oro #C59D21 (dalla T, solo grafica e titoli grandi), --cielo #4D9FC6 (dalla C, solo grafica),
--terracotta #BE5B33 (azioni), radius 18px. Fraunces = display/epigrafe, Archivo = uso.
Tag destinazioni: un colore per territorio (mare blu, storia arancio, borgo viola, parco verde).
Imbuto Paestum: le destinazioni sono ordinate come percorso (templi → costa → borghi → interno → temi), con Paestum in vetrina a tutta larghezza ("Inizia da qui") e cue verso il resto. I numeri delle righe vengono dal contatore DOM.
Sottolineatura hero: scarabocchio SVG arancio tramonto sulla parola chiave (data-uri, niente asset).
Esperienze in due colonne con figura fissa sticky (foto vera con didascalia e crediti).
Pannello CTA pre-footer (btn-solid + btn-line) verso mail e Trade.

## Voce (5 regole)
Nomi propri mai categorie; misura non aggettivi (ore, gradi, metri); sempre un dettaglio sensoriale verificabile; mito come istruzione d'uso; onestà operativa (scarpe, auto, torcia).

## Sistema editoriale (anti-slop, rev 3)
Tre ruoli tipo e basta: Fraunces = display, Archivo = testo, Plex Mono = dati (orari, coordinate, tag, tab). Niente pill: filtri e stagioni sono tab sottolineati. Niente card-contenitore dove basta una riga: destinazioni, verbi e itinerari sono righe con filetto, non box. Niente widget SaaS: la ricerca è un tabellone partenze marittimo con orari tipo onesti ("verifica in porto"). L'hero segue la meccanica OceanPulse adattata (media prima nel DOM, foglio nav, marker, pill arrivi): font e palette restano cilentani, gli asset sono locali e verificati, i social finti sono sostituiti dalla pill arrivi.

## Cosa abbiamo rimosso / corretto (removal test + audit coerenza)
- Claim "più scelto" → "5 giorni · costa + barca" (informativo, non prova inventata).
- `!important` su .meta → specificità `.dest-body .meta`.
- Outline inline JS → classe `.dest.selected` di sistema.
- Badge/duplicazioni: tide nascosta su mobile; hero-facts a 2 col su mobile.
- Unico gradiente ammesso: filetto tricolore dei verbi su dark, non replicare altrove.
- Focus-visible unico color terracotta (oro su dark); chip hover/active, btn active/disabled; aria-pressed/selected + frecce sulle stagioni.
