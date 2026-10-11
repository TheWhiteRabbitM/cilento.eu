# CREDITS — GoCilento

Tutte le immagini sono locali in `assets/img/`. Tranne la foto dell'hero
(`tramonto-palinuro.jpg`, foto propria), provengono da Wikimedia Commons.
Licenze verificate via API il 2026-10-08. Nessuna foto generica da stock:
sono tutte foto di luogo del Cilento o delle aree immediatamente adiacenti.

## Destinazioni

| File locale | Origine Commons | Autore | Licenza |
|---|---|---|---|
| `tramonto-palinuro.jpg` | foto propria del gestore, scattata a Palinuro | Agos Tours Srl | uso sul sito |
| `paestum.jpg` | Capaccio Paestum - Tempio di Nettuno.jpg | AlessioAg89 | CC BY-SA 4.0 |
| `palinuro.jpg` | Palinuro-arco-naturale-02.JPG | Mboesch | CC BY-SA 3.0 |
| `camerota.jpg` | Spiaggia Mingardo (Marina di Camerota) e Capo Palinuro (panoramio).jpg | Mario Penner | CC BY 3.0 |
| `acciaroli.jpg` | 2007 Porto Acciaroli.jpg | Goelette Cardabela | CC BY-SA 4.0 |
| `castellabate.jpg` | Panorama of Santa Maria di Castellabate.jpg | PumaGator | CC BY-SA 4.0 |
| `velia.jpg` | Elea-velia-via-porta-rosa-01.JPG | Mboesch | CC BY-SA 3.0 |
| `agropoli.jpg` | Agropoli-castello-aragonese-01.JPG | Mboesch | CC BY-SA 3.0 |
| `teggiano.jpg` | Teggiano belvedere.JPG | Velvet | CC BY-SA 3.0 |

## Altre località (20 destinazioni totali)

| File locale | Origine Commons | Autore | Licenza |
|---|---|---|---|
| `santamaria.jpg` | Chiesapace.jpg | Pinto Gabriele | Public domain |
| `pioppi-litorale.jpg` | Litorale di Pioppi.JPG | Spinoziano | CC BY-SA 3.0 |
| `pioppi-torre.jpg` | Torre di Pioppi.JPG | Geofix | CC BY-SA 3.0 |
| `scario.jpg` | Port of Scario.jpg | Bernd Schade | CC BY-SA 3.0 |
| `pisciotta.jpg` | Pisciotta - Italy.JPG | Heinz-Josef Lücking | CC BY-SA 3.0 de |

## Destinazioni senza foto

Sei destinazioni **non hanno foto**: Trentova, Porto Infreschi, Morra,
Monte Cervati, Monte Stella, Gole del Calore. Non esistono su Wikimedia
Commons e non abbiamo usato immagini generiche al loro posto. Le schede
dicono esplicitamente "Foto non disponibile su Wikimedia".

## Stagioni — foto di luogo, non di stagione

Queste **non** ritraggono la stagione indicata. Sono foto reali di luoghi
cilentani (o adiacenti) scelte per atmosfera. Dichiarato qui e nel footer
per non spacciare una foto d'autunno per una foto d'inverno.

| File locale | Origine Commons | Autore | Licenza | Uso |
|---|---|---|---|---|
| `st-primavera.jpg` | Cilento (aerial view).jpg | Ottantafome | CC BY-SA 4.0 | primavera |
| `st-estate.jpg` | Cala delle vipere - panoramio.jpg | Mario Penner | CC BY 3.0 | estate |
| `st-autunno.jpg` | Photo Olive orchard 1962 - Touring Club Italiano 1.2570.jpg | *autore non dichiarato su Commons* | CC BY-SA 4.0 | autunno |
| `st-inverno.jpg` | +pietrapertosa01.jpg | Alessio020302 | CC BY-SA 4.0 | inverno |

`st-inverno.jpg` è Pietrapertosa (Basilicata), nelle Dolomiti lucane:
fuori dal Cilento in senso stretto, ma dentro l'area del Parco e usata
già dal sito per il settore montano.

## Hero

Niente video: l'hero usa `tramonto-palinuro.jpg` (tramonto sul mare a Palinuro,
foto propria del gestore) con un lento zoom Ken Burns. Il precedente video Mixkit — un tramonto
generico, non del Cilento — è stato rimosso il 2026-10-10 perché non esiste
alcun video stock libero e verificabile del Cilento (verifica su Wikimedia
Commons, Pexels e Coverr: zero risultati utilizzabili).

## Logo

`assets/logo.png` (960x280, 174 KB): scritta illustrata CILENTO fornita
dall'utente, generata con AI, usata in header e footer di tutte e tre le
lingue. Originale `Downloads/cilentoeu.png` (2400x700) conservato fuori
dal sito. I precedenti `logo-cilento.svg` / `logo-cilento-light.svg`
sono stati rimossi su richiesta.
`assets/favicon.svg`: originale, vettore puro.
`assets/favicon.png` (64px), `favicon-32.png`, `apple-touch-icon.png` (180px):
ritaglio della O col pesce da `assets/logo.png`, fondo trasparente.

## Librerie di terzi (motion)

Servono al sistema di movimento. Sono **vendorizzate in `assets/vendor/`**, non
caricare da CDN: il sito dichiara nell'Impressum che l'unica richiesta verso un
server esterno è Google Fonts, e un CDN farebbe diventare falso.

| File | Libreria | Versione | Licenza | Note |
|---|---|---|---|---|
| `assets/vendor/gsap.min.js` | GSAP | 3.13.0 | **GreenSock Standard License** | © 2025 GreenSock, tutti i diritti riservati. **Non è open source**: uso gratuito secondo https://gsap.com/standard-license |
| `assets/vendor/ScrollTrigger.min.js` | ScrollTrigger | 3.13.0 | **GreenSock Standard License** | idem |
| `assets/vendor/lenis.min.js` | Lenis | 1.3.x | MIT | studio darkroom.engineering |
| `assets/motion.js` | — | — | nostro | wiring del sistema di movimento, nessuna dipendenza |

**Da rifare prima del rilascio commerciale:** la licenza standard GSAP è gratuita
per la maggior parte dei siti, ma ha condizioni (niente uso in prodotti a pagamento,
niente rivendita del file). Se Agos Tours dovesse vendere il sito come prodotto o
usarlo in un contesto coperto da quelle clausole, va acquistata una licenza
Commercial o sostituita GSAP. Lenis (MIT) non ha problemi.

Nessuna di queste librerie è un bundler: sono file UMD serviti così come sono.
Per questo **non c'è `package.json`, `node_modules` né passaggio di build**
(vedi ADR-001 e ADR-009).
