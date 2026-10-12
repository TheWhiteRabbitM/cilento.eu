// Ricostruisce api/{it,en,de}.json e llms.txt dall'HTML.
// L'HTML resta l'unica fonte di verita' (ADR-008).
//
// Uso:  node tools/build-api.js [radice-sito]
// Non fa parte della build del sito: i JSON generati sono committati.

'use strict';

const fs = require('fs');
const path = require('path');

const argomenti = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const ROOT = argomenti[0] || path.resolve(__dirname, '..');
const LINGUE = { it: 'it', en: 'en', de: 'de' };
const OGGI = new Date().toISOString().slice(0, 10);

// ── utilita' di lettura ──────────────────────────────────────────

function leggi(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function testo(html) {
  return String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function tutti(re, html, gruppi = {}) {
  const out = [];
  let m;
  const rx = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  while ((m = rx.exec(html)) !== null) {
    const o = {};
    for (const k of Object.keys(gruppi)) o[k] = m[gruppi[k]];
    out.push(o);
  }
  return out;
}

function primo(re, html, gruppo) {
  const m = re.exec(html);
  return m ? m[gruppo] : '';
}

function attr(tag, nome) {
  const m = new RegExp(nome + '="([^"]*)"').exec(tag);
  return m ? m[1] : '';
}

// ── sezioni ──────────────────────────────────────────────────────

function meta(html) {
  return {
    title: primo(/<title>([\s\S]*?)<\/title>/, html, 1).trim(),
    description: attr(primo(/<meta name="description" content="([^"]*)"/, html, 0), 'content'),
    canonical: primo(/<link rel="canonical" href="([^"]*)"/, html, 1),
  };
}

function hero(html, lingua) {
  const m = /<section class="hero"[\s\S]*?<\/section>/.exec(html);
  if (!m) return {};
  const h = m[0];
  const titolo = primo(/<h1 class="hero__title">([\s\S]*?)<\/h1>/, h, 1);
  const lede = testo(primo(/<p class="hero__text[^"]*"[^>]*>([\s\S]*?)<\/p>/, h, 1));
  const puntua = (s) => (s && !/[.!?]$/.test(s) ? s + '.' : s);
  return {
    kicker: testo(primo(/<p class="hero__kicker">([\s\S]*?)<\/p>/, h, 1)),
    title: testo(titolo),
    lede: puntua(lede),
    cta: testo(primo(/<a class="cta-solid[^"]*"[^>]*>([^<]*)<\/a>/, h, 1)),
    arrival_note: '',
  };
}

function facts(html) {
  const m = /<dl class="facts">([\s\S]*?)<\/dl>/.exec(html);
  if (!m) return [];
  const dts = tutti(/<dt>([\s\S]*?)<\/dt>/g, m[1], { v: 1 });
  const dds = tutti(/<dd>([\s\S]*?)<\/dd>/g, m[1], { v: 1 });
  return dts.map((d, i) => ({
    value: testo(d.v),
    label: testo(dds[i] ? dds[i].v : ''),
  }));
}

function destinations(html, lingua) {
  const out = [];
  const re = /<article class="dest[^"]*" id="([^"]+)" data-territorio="([^"]+)"[^>]*>([\s\S]*?)<\/article>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const blocco = m[3];
    const img = /<img\b[^>]*>/.exec(blocco);
    out.push({
      id: m[1],
      url: `https://gocilento.it/${lingua}/#${m[1]}`,
      territory: m[2],
      tag: testo(primo(/<p class="dest-tag">([\s\S]*?)<\/p>/, blocco, 1)),
      title: testo(primo(/<h3[^>]*>([\s\S]*?)<\/h3>/, blocco, 1)),
      description: testo(primo(/<p class="dest-desc">([\s\S]*?)<\/p>/, blocco, 1)),
      practical: testo(primo(/<p class="dest-meta">([\s\S]*?)<\/p>/, blocco, 1)),
      image: img ? 'https://gocilento.it/assets/img/' + attr(img[0], 'src').split('/').pop() : null,
      image_alt: img ? attr(img[0], 'alt') : null,
      photo_available: Boolean(img),
    });
  }
  return out;
}

function seasons(html, lingua) {
  const out = [];
  const re = /<div class="panel" role="tabpanel" id="([^"]+)"[\s\S]*?<\/div>\s*<div class="panel"/g;
  const blocchi = [];
  const re2 = /<div class="panel" role="tabpanel" id="([^"]+)"[\s\S]*?(?=<div class="panel" role="tabpanel"|<\/section>)/g;
  let m;
  while ((m = re2.exec(html)) !== null) blocchi.push([m[1], m[0]]);
  for (const [id, b] of blocchi) {
    const img = /<img\b[^>]*>/.exec(b);
    out.push({
      id,
      title: testo(primo(/<h3[^>]*>([\s\S]*?)<\/h3>/, b, 1)),
      text: testo(primo(/<p class="panel-text">([\s\S]*?)<\/p>/, b, 1)) ||
            testo(primo(/<p>([\s\S]*?)<\/p>/, b, 1)),
      practical: testo(primo(/<p class="panel-meta">([s\S]*?)<\/p>/, b, 1)),
      image: img ? 'https://gocilento.it/assets/img/' + attr(img[0], 'src').split('/').pop() : null,
    });
  }
  return out;
}

function main(lingua) {
  const home = leggi(`${lingua}/index.html`);
  const out = {
    site: 'GoCilento',
    language: lingua,
    url: `https://gocilento.it/${lingua}/`,
    updated: OGGI,
    license_texts: 'Testi originali del progetto; foto CC Wikimedia (vedi docs/CREDITS.md).',
    operator: {
      name: 'Agos Tours Srl',
      address: 'Strada Loichita Vasile 1-3, Timisoara, Romania',
      vat_id: 'RO31093182',
    },
    meta: meta(home),
    hero: hero(home, lingua),
    facts: facts(home),
    destinations: destinations(home, lingua),
  };
  return out;
}

// Sezioni che questo generatore NON sa produrre. Vengono conservate dal
// file esistente: e' preferibile un dato fermo a un dato corrotto.
const PRESERVATE = ['seasons', 'verbs', 'itineraries', 'flavors', 'practical',
                    'tagline', 'legal'];

function confronta(a, b, percorso = '') {
  const diff = [];
  if (JSON.stringify(a) === JSON.stringify(b)) return diff;
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a)) {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      diff.push(...confronta(a[k], b[k], percorso ? percorso + '.' + k : k));
    }
    return diff;
  }
  diff.push({
    campo: percorso,
    atteso: JSON.stringify(a),
    ottenuto: JSON.stringify(b),
  });
  return diff;
}

if (require.main === module) {
  for (const l of Object.keys(LINGUE)) {
    const percorso = path.join(ROOT, 'api', `${l}.json`);
    const esistente = JSON.parse(fs.readFileSync(percorso, 'utf8'));
    const nuovo = main(l);

    if (process.argv.includes('--check')) {
      const diff = confronta(esistente, nuovo);
      console.log(`${l}: ${diff.length} differenze`);
      for (const d of diff.slice(0, 12)) {
        console.log(`  ${d.campo}`);
        console.log(`    atteso  : ${d.atteso}`);
        console.log(`    ottenuto: ${d.ottenuto}`);
      }
      continue;
    }

    // scrittura incrementale: si sostituisce solo ciò che il generatore
    // sa ricavare dall'HTML, il resto resta com'era
    const fuso = Object.assign({}, esistente, nuovo);
    for (const k of PRESERVATE) {
      if (!(k in nuovo) && k in esistente) fuso[k] = esistente[k];
    }
    fs.writeFileSync(percorso, JSON.stringify(fuso, null, 2) + '\n', 'utf8');
    console.log(`${l}: aggiornato (${Object.keys(nuovo).length} campi rigenerati, ` +
                `${PRESERVATE.length} sezioni preservate)`);
  }
}