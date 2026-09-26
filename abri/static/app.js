/* ==========================================================================
   Petits Plats / Abri — logique de l'interface (prototype)

   Architecture volontairement simple :
     • un objet d'état S
     • une fonction render() qui redessine l'écran à partir de S
     • des actions déclenchées par des attributs data-action / data-input
   Aucune donnée n'est écrite dans le navigateur (pas de localStorage, pas
   d'URL modifiée) : rien ne trahit l'existence de l'espace protégé.
   ========================================================================== */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const screen = $('#screen');
const overlaysEl = $('#overlays');
const phoneEl = $('#phone');

const AUTO_LOCK_MS = 3 * 60 * 1000;        // verrouillage automatique de l'espace protégé
const Q_LEAD = 'Votre partenaire ou ex-partenaire…';

// ---------------------------------------------------------------------------
// Icônes (SVG inline, traits simples)
// ---------------------------------------------------------------------------
const svg = (d, extra = '') => `<svg class="i" viewBox="0 0 24 24" ${extra}>${d}</svg>`;
const I = {
  shield: svg('<path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>'),
  clipboard: svg('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 11h6M9 15h4"/>'),
  pin: svg('<path d="M12 21s-6-5.5-6-11a6 6 0 0112 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>'),
  folder: svg('<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>'),
  phone: svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>'),
  exit: svg('<path d="M10 17l5-5-5-5M15 12H3M13 3h6v18h-6"/>'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 01-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 012.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 012.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/>'),
  heart: svg('<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
  cart: svg('<path d="M3 4h2l2.4 11h11l2-8H6"/><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/>'),
  user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>'),
  home: svg('<path d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-4v-6H9v6H5a2 2 0 01-2-2v-9z"/>'),
  chevR: svg('<path d="M9 6l6 6-6 6"/>'),
  chevD: svg('<path d="M6 9l6 6 6-6"/>'),
  check: svg('<path d="M5 12l5 5L20 7"/>', 'stroke-width="3"'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  trash: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  lock: svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>'),
  mic: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>'),
  speaker: svg('<path d="M4 10v4h4l5 4V6L8 10H4z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/>'),
  keypad: svg('<circle cx="7" cy="6" r="1.5"/><circle cx="12" cy="6" r="1.5"/><circle cx="17" cy="6" r="1.5"/><circle cx="7" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="17" cy="12" r="1.5"/><circle cx="7" cy="18" r="1.5"/><circle cx="12" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/>'),
  x: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  back: svg('<path d="M15 6l-6 6 6 6"/>'),
  download: svg('<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>'),
  link: svg('<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>'),
  chat: svg('<path d="M5 5h14a2 2 0 012 2v8a2 2 0 01-2 2h-6l-5 4v-4H5a2 2 0 01-2-2V7a2 2 0 012-2z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/>', 'stroke-width="2.2"'),
  send: svg('<path d="M5 12l14-7-5 15-2.5-6z"/>'),
  camera: svg('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
};

// ---------------------------------------------------------------------------
// État
// ---------------------------------------------------------------------------
const S = {
  mode: 'loading',                // 'setup' | 'wiki' | 'cover' | 'app'
  front: 'recettes',              // apparence de l'app : 'recettes' | 'wiki' (Réglages d'Abri)
  wiki: { title: '', page: null, loading: false, search: false, q: '', results: [], searched: '', open: {}, menu: false },
  recipes: [], categories: [], personsMin: 1, personsMax: 12,
  // persons : le nombre choisi (− / + / saisie) ; adapted : celui des quantités affichées,
  // mis à jour seulement par le bouton « Adapter les quantités »
  cover: { tab: 'recettes', cat: 'Tous', query: '', recipe: null, persons: 4, adapted: 4, confirmClear: false,
           favs: new Set(), cart: [], profile: { notif: true, metric: true, dark: false } },
  daily: [],                      // les 2 recettes du jour (S.recipes = les 60 recettes fixes)
  setup: { step: 0, recipe: null, persons: 4, fromSettings: false },
  token: null, boot: null, tab: 'home',
  home: { selected: null, list: false },   // accueil : lieu choisi sur la carte, liste dépliée
  quiz: { stage: 'intro', i: 0, answers: {}, situation: {}, si: 0, result: null, busy: false },
  loc: { scanning: false, scanStep: 0, scan: null, open: {}, platform: 'iphone' },
  ev: { sub: 'pieces', cat: null, catPreset: null, files: null, previews: null, note: '', jtext: '', jdate: '', busy: false },
  contacts: { open: {} },
  chat: { messages: [], text: '', typing: false },   // assistant (aperçu) : en mémoire, effacé au verrouillage
  overlay: null,
};
let idleTimer = null;
let callTimer = null;

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const grad = (r) => `linear-gradient(135deg, ${r.gradient[0]}, ${r.gradient[1]})`;
const fmtDate = (iso) => { const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };
// « lundi 22 septembre à 21:30 » : plus facile à lire qu'une date en chiffres
const fmtDay = (iso) => { const d = new Date(iso); if (isNaN(d)) return iso;
  return d.toLocaleString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
    ...(d.getFullYear() === new Date().getFullYear() ? {} : { year: 'numeric' }) }); };
const localDT = (d = new Date()) => { const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };

const findRecipe = (id) => [...S.recipes, ...S.daily].find((r) => r.id === id) || null;

// Adaptation des quantités, mêmes règles que logic.scale_recipe : chaque ingrédient porte
// sa règle d'arrondi ('int' | 'half' | 'none'). Appliquée au bouton « Adapter les quantités »,
// le seul geste qui peut aussi ouvrir Abri (− / + ne déverrouillent rien par accident).
function fmtQty(v) {
  const whole = Math.floor(v); const frac = Math.round((v - whole) * 100) / 100;
  const F = { 0.25: '¼', 0.5: '½', 0.75: '¾' };
  if (!frac) return String(whole);
  if (F[frac]) return `${whole || ''}${F[frac]}`;
  return v.toFixed(1).replace(/\.?0+$/, '');
}
function scaleIngredients(r, persons) {
  const f = persons / r.base_servings;
  return r.ingredients.map((i) => {
    if (i.round === 'none') return { name: i.name, qty: fmtQty(i.qty), unit: i.unit };
    const v = i.qty * f;
    const q = i.round === 'int' ? Math.max(1, Math.round(v))
      : v < 1 ? Math.max(0.25, Math.round(v * 4) / 4) : Math.round(v * 2) / 2;
    return { name: i.name, qty: fmtQty(q), unit: i.unit };
  });
}

async function api(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  if (S.token) headers['X-Abri-Token'] = S.token;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(path, { method, headers, body: form ? form : (body !== undefined ? JSON.stringify(body) : undefined) });
  if (res.status === 401 && S.mode === 'app') { lock(false); throw new Error('verrouillé'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
  return data;
}

let toastTimer = null;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function tickClock() {
  const d = new Date();
  $('#clock').textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Rendu principal
// ---------------------------------------------------------------------------
let lastViewKey = '';
function viewKey() {
  if (S.mode === 'app') return `app:${S.tab}:${S.quiz.stage}:${S.ev.sub}`;
  if (S.mode === 'wiki') return `wiki:${S.wiki.title}:${S.wiki.search}:${!!S.wiki.page}`;
  if (S.mode === 'cover') return `cover:${S.cover.tab}:${S.cover.recipe ? S.cover.recipe.id : ''}`;
  return `${S.mode}:${S.setup.step}`;
}

function render() {
  const key = viewKey();
  const prevKey = lastViewKey;
  const content = $('.content', screen);
  const keepScroll = content && key === prevKey ? content.scrollTop : 0;
  lastViewKey = key;

  const wiki = S.mode === 'wiki';
  const abri = !wiki && S.mode !== 'cover';
  const dark = S.mode === 'cover' && S.cover.profile.dark;
  screen.className = `screen ${wiki ? 'theme-wiki' : abri ? 'theme-abri' : 'theme-cover'}${dark ? ' dark' : ''}${screen.classList.contains('unlocking') ? ' unlocking' : ''}`;
  phoneEl.classList.toggle('on-abri', abri);
  phoneEl.classList.toggle('on-wiki', wiki);
  phoneEl.classList.toggle('cover-dark', dark);
  setIdentity();

  if (S.mode === 'loading') screen.innerHTML = '';
  else if (wiki) screen.innerHTML = renderWiki();
  else if (S.mode === 'setup') screen.innerHTML = renderSetup();
  else if (S.mode === 'cover') screen.innerHTML = renderCover();
  else screen.innerHTML = renderApp();

  const c2 = $('.content', screen);
  if (c2 && keepScroll) c2.scrollTop = keepScroll;
  // pas d'animation d'apparition quand on redessine le même écran (évite le clignotement)
  if (key === prevKey) $$('.fade-in', screen).forEach((el) => el.classList.remove('fade-in'));
  if (!S.overlay || !overlaysEl.firstChild) renderOverlay();
  if (S.mode === 'app' && S.tab === 'home') mountMap();
  if (wiki && S.wiki.search) { const q = $('.wk-input', screen); q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
}

// ===========================================================================
// 0. APPARENCE « WIKIPÉDIA » — miroir de fr.wikipedia.org (au choix dans les Réglages d'Abri)
// ===========================================================================
// Au lieu de l'app de recettes, l'app peut ressembler à Wikipédia. Le serveur relaie les vrais
// articles (wikimirror.py) ; sans connexion, quelques articles intégrés prennent le relais
// (static/wiki.js). Le secret : un mot tapé dans la recherche, validé avec Entrée ; le serveur
// répond par des résultats ordinaires, ou par un jeton si c'est le bon mot.
const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const wikiFresh = () => ({ title: WIKI_HOME, page: null, loading: false, search: false, q: '', results: [], searched: '', open: {}, menu: false });
const WI = {
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  search: svg('<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>'),
  back: svg('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
  lang: svg('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z"/>'),
  star: svg('<path d="M12 4l2.4 5 5.3.6-4 3.7 1.1 5.3L12 16l-4.8 2.6 1.1-5.3-4-3.7 5.3-.6z"/>'),
  edit: svg('<path d="M4 20h4L19 9l-4-4L4 16v4z"/>'),
  chev: svg('<path d="M9 6l6 6-6 6"/>'),
};
// Titre d'onglet, icône et couleur de barre suivent l'apparence choisie, même dans Abri
function setIdentity() {
  const wiki = S.front === 'wiki';
  document.title = !wiki ? 'Petits Plats' : S.mode === 'wiki' && S.wiki.page ? `${S.wiki.page.title} — Wikipédia` : 'Wikipédia';
  $('link[rel="icon"]').href = wiki ? '/static/icon-wiki.svg' : '/static/icon-192.png';
  $('meta[name="theme-color"]').content = wiki ? '#ffffff' : '#c8412f';
}

// Nettoyage du HTML de Wikipédia : liste blanche de balises, aucun attribut d'origine gardé
// (ni style, ni script, ni on…) ; liens internes → navigation dans le miroir, liens externes
// → texte simple ; images seulement depuis wikimedia.org.
const WK_KEEP = new Set(['P', 'B', 'I', 'EM', 'STRONG', 'A', 'H3', 'H4', 'UL', 'OL', 'LI', 'TABLE', 'TBODY', 'THEAD', 'TR', 'TH', 'TD',
  'CAPTION', 'SUP', 'SUB', 'BR', 'SPAN', 'DIV', 'BLOCKQUOTE', 'DL', 'DT', 'DD', 'FIGURE', 'FIGCAPTION', 'IMG', 'SMALL', 'ABBR']);
const WK_DROP = 'style, script, link, meta, noscript, .mw-editsection, .reference, .mw-ref, .noprint, .metadata, .navbox, .navbox-container, '
  + '.bandeau-container, .bandeau-portail, .homonymie, .hatnote, .mw-empty-elt, .autres-projets, .printfooter, .catlinks, '
  + '.mw-kartographer-map, .coordinates, #coordinates, .toc';
const WK_NS = /^(Fichier|File|Image|Média|Aide|Help|Catégorie|Category|Portail|Modèle|Template|Wikipédia|Spécial|Special|Projet|Discussion|Utilisateur|Module|Référence)\s*:/i;
function wikiClean(el) {
  for (const c of [...el.children]) {
    wikiClean(c);
    const tag = c.tagName;
    if (!WK_KEEP.has(tag)) { c.replaceWith(...c.childNodes); continue; }
    const cls = c.getAttribute('class') || '';
    const keep = {};
    if (tag === 'A') {
      const m = /^\/wiki\/([^#?]+)/.exec(c.getAttribute('href') || '');
      const title = m ? decodeURIComponent(m[1]).replace(/_/g, ' ') : '';
      if (!title || WK_NS.test(title)) { c.replaceWith(...c.childNodes); continue; }
      Object.assign(keep, { 'data-action': 'wiki-go', 'data-id': title });
    } else if (tag === 'IMG') {
      const src = (c.getAttribute('src') || '').replace(/^\/\//, 'https://');
      if (!/^https:\/\/(upload|thumb)\.wikimedia\.org\//.test(src)) { c.remove(); continue; }
      Object.assign(keep, { src, alt: c.getAttribute('alt') || '', width: c.getAttribute('width'), height: c.getAttribute('height'), loading: 'lazy' });
    } else if (tag === 'TD' || tag === 'TH') {
      Object.assign(keep, { colspan: c.getAttribute('colspan'), rowspan: c.getAttribute('rowspan') });
    }
    if (/infobox/.test(cls)) keep.class = 'wk-infobox';
    else if (tag === 'TABLE') keep.class = 'wk-table';
    for (const a of [...c.attributes]) c.removeAttribute(a.name);
    for (const [k, v] of Object.entries(keep)) if (v != null) c.setAttribute(k, v);
  }
}
// Découpe comme sur le site mobile : introduction (1er paragraphe avant l'infobox), puis sections repliées
function wikiParse(title, html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const root = doc.querySelector('.mw-parser-output') || doc.body;
  root.querySelectorAll(WK_DROP).forEach((e) => e.remove());
  const lead = doc.createElement('div'); const sections = []; let cur = null;
  for (const node of [...root.childNodes]) {
    const h = node.nodeType === 1 && (node.matches('.mw-heading2') ? node.querySelector('h2') : node.tagName === 'H2' ? node : null);
    if (h) { cur = { h: h.textContent.trim(), body: doc.createElement('div') }; sections.push(cur); continue; }
    (cur ? cur.body : lead).appendChild(node);
  }
  const first = [...lead.children].find((e) => e.tagName === 'P' && e.textContent.trim());
  if (first) lead.prepend(first);
  const out = (el) => { wikiClean(el); return el.innerHTML; };
  return { title, lead: out(lead), sections: sections.map((x) => ({ h: x.h, html: out(x.body) })).filter((x) => x.html.trim()) };
}
// Articles intégrés (sans connexion)
function wikiLocal(title) {
  const a = WIKI_ARTICLES.find((x) => norm(x.title) === norm(title)); if (!a) return null;
  const links = (h) => h.replace(/\[\[(\w+)\|([^\]]+)\]\]/g, (_, id, t) => `<a data-action="wiki-go" data-id="${esc((WIKI_ARTICLES.find((x) => x.id === id) || a).title)}">${t}</a>`);
  const box = `<table class="wk-infobox"><caption>${esc(a.title)}</caption>${a.infobox.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>`;
  return { title: a.title, lead: `<p>${links(a.lead)}</p>${box}`, sections: a.sections.map((x) => ({ h: x.h, html: links(x.html) })) };
}
const wikiLocalSearch = (q) => { const n = norm(q); return n ? WIKI_ARTICLES.filter((a) => norm(a.title).includes(n) || norm(a.desc).includes(n)).map((a) => ({ title: a.title, desc: a.desc })) : []; };

const wikiCache = new Map();
async function wikiOpen(title) {
  S.wiki = { ...wikiFresh(), title, loading: true };
  render();
  let page = wikiCache.get(title);
  if (!page) {
    let status = 0;
    try {
      const r = await fetch(`/api/wiki/page?title=${encodeURIComponent(title)}`); status = r.status;
      if (r.ok) { const d = await r.json(); page = wikiParse(d.title, d.html); }
    } catch (e) { /* hors ligne */ }
    if (page) wikiCache.set(title, page);
    else page = wikiLocal(title) || { title, sections: [],
      lead: `<p>${status === 404 ? 'Cette page n\'existe pas.' : 'Impossible de charger la page. Vérifiez votre connexion Internet.'}</p>` };
  }
  if (S.mode !== 'wiki' || S.wiki.title !== title) return;   // on a navigué ailleurs entre-temps
  S.wiki.page = page; S.wiki.loading = false;
  render(); const c = $('.content', screen); if (c) c.scrollTop = 0;
}

// Recherche : suggestions pendant la frappe (jamais de déverrouillage), Entrée = validation
let wikiTimer = null; let wikiSeq = 0;
async function wikiSearch(q, submit = false) {
  const seq = ++wikiSeq;
  let d;
  try {
    d = await (await fetch('/api/wiki/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q, submit }) })).json();
  } catch (e) { d = { results: [], offline: true }; }
  if (d.token) {                       // bon mot secret : on efface la saisie et on ouvre Abri
    const inp = $('.wk-input', screen); if (inp) { inp.value = ''; inp.blur(); }
    S.wiki = wikiFresh(); unlock(d.token); return null;
  }
  const results = d.offline ? wikiLocalSearch(q) : (d.results || []);
  if (seq === wikiSeq && S.mode === 'wiki' && S.wiki.search) { S.wiki.results = results; S.wiki.searched = q; paintWikiResults(); }
  return results;
}
async function wikiSubmit(q) {
  if (!norm(q)) return;
  clearTimeout(wikiTimer);
  const res = await wikiSearch(q, true);
  if (!res) return;
  const hit = res.find((r) => norm(r.title) === norm(q)) || res[0];
  if (hit) wikiOpen(hit.title);
}
function wikiResultsHtml() {
  const W = S.wiki;
  if (!W.results.length) return norm(W.searched) && norm(W.searched) === norm(W.q) ? `<p class="wk-none">Aucun résultat pour « ${esc(W.q.trim())} »</p>` : '';
  return W.results.map((r) => `<button class="wk-result" data-action="wiki-go" data-id="${esc(r.title)}"><b>${esc(r.title)}</b><span>${esc(r.desc)}</span></button>`).join('');
}
function paintWikiResults() { const el = $('#wk-results', screen); if (el) el.innerHTML = wikiResultsHtml(); }

function renderWiki() {
  const W = S.wiki;
  if (W.search) {
    return `<div class="wk"><header class="wk-bar wk-searchbar"><button class="wk-icon" data-action="wiki-search-close" aria-label="Retour">${WI.back}</button>
      <input class="wk-input" data-input="wiki-q" type="search" placeholder="Rechercher sur Wikipédia" value="${esc(W.q)}" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search"></header>
      <div class="content wk-results" id="wk-results">${wikiResultsHtml()}</div></div>`;
  }
  const a = W.page;
  return `<div class="wk">
    <header class="wk-bar"><button class="wk-icon" data-action="wiki-menu" aria-label="Menu">${WI.menu}</button>
      <span class="wk-brand">Wikipédia<small>L'encyclopédie libre</small></span>
      <button class="wk-icon" data-action="wiki-search" aria-label="Rechercher">${WI.search}</button></header>
    ${W.menu ? `<div class="wk-drawer-bg" data-action="wiki-menu"></div><nav class="wk-drawer">
      <button data-action="wiki-go" data-id="${esc(WIKI_HOME)}">Accueil</button><button data-action="wiki-random">Au hasard</button><button data-action="wiki-search">Rechercher</button></nav>` : ''}
    <div class="content wk-page">
      <h1 class="wk-title">${esc(a ? a.title : W.title)}</h1>
      <div class="wk-tabs"><span class="on">Article</span><span>Discussion</span><span class="wk-tools">${WI.lang}${WI.star}${WI.edit}</span></div>
      ${!a ? '<div class="wk-loading"><i></i><i></i><i></i><i></i></div>' : `
      <div class="wk-lead">${a.lead}</div>
      ${a.sections.map((x, i) => `<section class="wk-sec${W.open[i] ? ' open' : ''}"><h2 data-action="wiki-sec" data-i="${i}">${WI.chev}${esc(x.h)}</h2>${W.open[i] ? `<div class="wk-sec-body">${x.html}</div>` : ''}</section>`).join('')}
      <footer class="wk-foot">Le contenu est disponible sous licence CC BY-SA 4.0 sauf mention contraire.</footer>`}
    </div></div>`;
}

async function wikiRandom() {
  let title = null;
  try { const r = await fetch('/api/wiki/random'); if (r.ok) title = (await r.json()).title; } catch (e) { /* hors ligne */ }
  if (!title) { const others = WIKI_ARTICLES.filter((x) => x.title !== S.wiki.title); title = others[Math.floor(Math.random() * others.length)].title; }
  wikiOpen(title);
}

// ===========================================================================
// 1. CONFIGURATION (premier lancement ou modification du secret)
// ===========================================================================
function renderSetup() {
  const st = S.setup;
  const dots = `<div class="dots">${[0, 1, 2, 3].map((n) => `<i class="${n === st.step ? 'on' : ''}"></i>`).join('')}</div>`;
  if (st.step === 0) {
    return `<div class="setup fade-in">
      <div class="logo">${I.shield}</div>
      <h1>${st.fromSettings ? 'Modifier votre accès discret' : 'Bienvenue dans Abri'}</h1>
      <p class="lead">Abri se cache derrière une application de cuisine ordinaire, « Petits Plats ». Personne ne peut deviner que l'espace protégé existe.</p>
      <div class="how"><div class="n">1</div><p>Choisissez une <b>recette secrète</b> et un <b>nombre secret de personnes</b>.</p></div>
      <div class="how"><div class="n">2</div><p>Pour entrer : ouvrez la recette, tapez le nombre, appuyez sur <b>Adapter les quantités</b>.</p></div>
      <div class="how"><div class="n">3</div><p>Une mauvaise combinaison adapte simplement la recette : aucune erreur, aucune trace.</p></div>
      <div class="grow"></div>
      <button class="btn primary block" data-action="setup-next">${st.fromSettings ? 'Continuer' : 'Commencer'}</button>
      ${st.fromSettings ? `<button class="btn muted block" style="margin-top:10px" data-action="setup-cancel">Annuler</button>` : ''}
      ${dots}</div>`;
  }
  if (st.step === 1) {
    return `<div class="setup fade-in">
      <button class="icon-btn" data-action="setup-prev">${I.back}</button>
      <h2>Votre recette secrète</h2>
      <p class="lead">Choisissez une recette que vous n'ouvrirez pas par hasard devant quelqu'un.</p>
      <div class="pick-grid">${S.recipes.map((r) => `<button class="pick ${st.recipe === r.id ? 'on' : ''}" data-action="setup-pick" data-id="${r.id}"><div class="em">${r.emoji}</div><div class="nm">${esc(r.name)}</div></button>`).join('')}</div>
      <div class="grow"></div>
      <button class="btn primary block" data-action="setup-next" ${st.recipe ? '' : 'disabled'}>Suivant</button>
      ${dots}</div>`;
  }
  if (st.step === 2) {
    return `<div class="setup fade-in">
      <button class="icon-btn" data-action="setup-prev">${I.back}</button>
      <h2>Votre nombre secret</h2>
      <p class="lead">Le nombre de personnes à saisir pour ouvrir l'espace protégé. Évitez la taille réelle de votre foyer.</p>
      <div class="bignum"><button data-action="setup-dec">−</button><div class="val">${st.persons}</div><button data-action="setup-inc">+</button></div>
      <p class="lead" style="text-align:center">personnes</p>
      <div class="grow"></div>
      <button class="btn primary block" data-action="setup-next">Suivant</button>
      ${dots}</div>`;
  }
  const r = S.recipes.find((x) => x.id === st.recipe);
  return `<div class="setup fade-in">
    <button class="icon-btn" data-action="setup-prev">${I.back}</button>
    <h2>Retenez votre code</h2>
    <p class="lead">Il ne sera plus affiché en clair, sauf dans les réglages de l'espace protégé.</p>
    <div class="secret-card"><div class="em">${r.emoji}</div><div class="l1">${esc(r.name)}</div><div class="l2">pour ${st.persons} personne${st.persons > 1 ? 's' : ''}</div></div>
    <div class="how"><div class="n">🍳</div><p>Ouvrir « Petits Plats » → <b>${esc(r.name)}</b> → saisir <b>${st.persons}</b> → <b>Adapter les quantités</b>.</p></div>
    <div class="grow"></div>
    <button class="btn primary block" data-action="setup-finish">${st.fromSettings ? 'Enregistrer' : "C'est compris, terminer"}</button>
    ${dots}</div>`;
}

async function setupFinish() {
  const st = S.setup;
  try {
    await api('/api/setup', { method: 'POST', body: { recipe_id: st.recipe, persons: st.persons } });
  } catch (e) { toast(e.message); return; }
  if (st.fromSettings) {
    S.mode = 'app';
    S.boot = await api('/api/app/bootstrap');
    toast('Accès secret modifié');
  } else {
    S.mode = 'cover';
    S.cover.recipe = null; S.cover.tab = 'recettes';
  }
  st.fromSettings = false; st.step = 0;
  render();
}

// ===========================================================================
// 2. APPLICATION DE COUVERTURE — « Petits Plats »
// ===========================================================================
function renderCover() {
  const c = S.cover;
  let body;
  if (c.recipe) body = coverRecipe(c.recipe);
  else if (c.tab === 'recettes') body = coverHome();
  else if (c.tab === 'favoris') body = coverFavs();
  else if (c.tab === 'courses') body = coverCart();
  else body = coverProfile();
  return `<div class="view">${body}${c.recipe ? '' : coverTabbar()}</div>`;
}

function filteredRecipes() {
  const c = S.cover; const q = c.query.trim().toLowerCase();
  const matches = (r) => !q || r.name.toLowerCase().includes(q) || r.ingredients.some((i) => i.name.toLowerCase().includes(q));
  // Les recettes du jour sont en haut (cartes à part) ; la recherche les inclut aussi
  const pool = q ? [...S.recipes, ...S.daily] : S.recipes;
  return pool.filter((r) => (c.cat === 'Tous' || r.category === c.cat) && matches(r));
}

const recipeMeta = (r) => `⏱ ${esc(r.time)} · ${esc(r.difficulty)}`;
function recipeCard(r) {
  const fav = S.cover.favs.has(r.id);
  return `<div class="recipe-card">
    <button class="tile" style="background:${esc(grad(r))};width:100%" data-action="cover-open" data-id="${esc(r.id)}">${esc(r.emoji)}</button>
    <button class="body" style="display:block;width:100%;text-align:left" data-action="cover-open" data-id="${esc(r.id)}"><div class="name">${esc(r.name)}</div><div class="meta">${recipeMeta(r)}</div></button>
    <button class="fav ${fav ? 'on' : ''}" data-action="cover-fav" data-id="${esc(r.id)}">${I.heart}</button>
  </div>`;
}

function coverGrid() {
  const c = S.cover; const list = filteredRecipes(); const q = c.query.trim();
  // Les 2 recettes du jour (choisies par le serveur parmi la réserve, elles changent chaque jour)
  const featHtml = !q && c.cat === 'Tous' ? S.daily.map((r) => `<button class="feature-card" data-action="cover-open" data-id="${esc(r.id)}"><span class="em">${esc(r.emoji)}</span><span><span class="muted small">Recette du jour</span><b>${esc(r.name)}</b><span class="muted small">${recipeMeta(r)}</span></span></button>`).join('') : '';
  const empty = `<div class="empty" style="grid-column:1/-1"><div class="em">🥄</div>Aucune recette ne correspond</div>`;
  return featHtml + (list.length ? list.map(recipeCard).join('') : empty);
}

// Met à jour la seule grille (garde le focus du champ de recherche pendant la saisie)
function refreshGrid() { const g = $('#recipe-grid', screen); if (g) g.innerHTML = coverGrid(); }

function coverHome() {
  const c = S.cover;
  return `<div class="content">
    <div class="cover-hero"><div class="greet">Bonjour 👋</div><h1>Qu'est-ce qu'on cuisine aujourd'hui ?</h1>
      <label class="search">${I.search}<input data-input="cover-search" placeholder="Rechercher une recette, un ingrédient…" value="${esc(c.query)}"></label></div>
    <div class="chips">${S.categories.map((cat) => `<button class="chip ${cat === c.cat ? 'active' : ''}" data-action="cover-cat" data-cat="${esc(cat)}">${esc(cat)}</button>`).join('')}</div>
    <div class="recipe-grid" id="recipe-grid">${coverGrid()}</div>
  </div>`;
}

const ingredientItems = (r) => scaleIngredients(r, S.cover.adapted)
  .map((i) => `<li><span>${esc(i.name)}</span><span class="q">${esc(`${i.qty} ${i.unit}`.trim())}</span></li>`).join('');

// Après « Adapter les quantités » : seule la liste change (le champ garde sa saisie et son focus)
function refreshIngredients() {
  const r = S.cover.recipe; if (!r) return;
  const list = $('#ing-list', screen); if (list) list.innerHTML = ingredientItems(r);
  const title = $('#ing-title', screen); if (title) title.textContent = `Ingrédients · ${S.cover.adapted} pers.`;
}

function coverRecipe(r) {
  const c = S.cover;
  const fav = c.favs.has(r.id);
  const pills = `<span class="pill">⏱ ${esc(r.time)}</span><span class="pill">👩‍🍳 ${esc(r.difficulty)}</span>`;
  return `<div class="content">
    <div class="recipe-hero" style="background:${esc(grad(r))}">${esc(r.emoji)}<button class="back" data-action="cover-back">${I.back}</button>
      <button class="fav ${fav ? 'on' : ''}" style="position:absolute;top:8px;right:16px;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.85);color:#c24e2a;display:flex;align-items:center;justify-content:center" data-action="cover-fav" data-id="${esc(r.id)}">${I.heart}</button></div>
    <div class="recipe-title">${esc(r.name)}</div>
    <div class="meta-pills">${pills}${r.region ? `<span class="pill">📍 ${esc(r.region)}</span>` : ''}<span class="pill">🍽 ${esc(r.category)}</span></div>
    <div class="card"><div class="servings"><div><b>Pour combien de personnes ?</b><div class="muted small">Choisissez le nombre, puis adaptez les quantités</div></div>
      <div class="stepper"><button data-action="persons-dec">−</button><input type="number" inputmode="numeric" min="${S.personsMin}" max="${S.personsMax}" value="${c.persons}" data-input="persons"><button data-action="persons-inc">+</button></div></div>
      <button class="btn primary block" style="margin-top:12px" data-action="adapt">Adapter les quantités</button></div>
    <div class="section-title" id="ing-title">Ingrédients · ${c.adapted} pers.</div>
    <div class="card"><ul class="ingredients" id="ing-list">${ingredientItems(r)}</ul></div>
    <div class="section-title">Préparation</div>
    <div class="card"><ol class="steps">${r.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>
    <button class="btn ghost block" data-action="add-cart" data-id="${esc(r.id)}">${I.cart} Ajouter à la liste de courses</button>  </div>`;
}

function coverFavs() {
  const list = [...S.cover.favs].map(findRecipe).filter(Boolean);
  return `<div class="content"><div class="cover-hero"><h1>Mes favoris</h1></div>
    ${list.length ? `<div class="recipe-grid">${list.map(recipeCard).join('')}</div>` : `<div class="empty"><div class="em">🤍</div>Touchez le cœur d'une recette pour la retrouver ici</div>`}</div>`;
}

function coverCart() {
  const c = S.cover; const cart = c.cart;
  const nDone = cart.filter((i) => i.done).length;
  const clearBtn = c.confirmClear
    ? `<div class="row"><button class="btn muted block" data-action="cart-clear-cancel">Annuler</button><button class="btn primary block" data-action="cart-clear-confirm">Tout supprimer</button></div>`
    : `<button class="btn muted block" data-action="cart-clear">Vider la liste</button>`;
  return `<div class="content"><div class="cover-hero"><h1>Liste de courses</h1>${cart.length ? `<div class="muted small">${cart.length} article${cart.length > 1 ? 's' : ''}${nDone ? ` · ${nDone} coché${nDone > 1 ? 's' : ''}` : ''}</div>` : ''}</div>
    ${cart.length ? `<div class="card"><ul class="ingredients">${cart.map((i, n) => `<li><label class="row" style="flex:1"><input type="checkbox" data-action="cart-check" data-n="${n}" ${i.done ? 'checked' : ''}><span style="${i.done ? 'text-decoration:line-through;opacity:.5' : ''}">${esc(i.name)}</span></label><span class="q">${esc(`${i.qty} ${i.unit}`.trim())}</span></li>`).join('')}</ul></div>
      ${nDone && !c.confirmClear ? `<button class="btn soft block" style="margin-bottom:10px" data-action="cart-remove-done">Retirer les articles cochés (${nDone})</button>` : ''}
      ${c.confirmClear ? `<p class="small muted" style="text-align:center;margin:0 0 10px">Supprimer les ${cart.length} articles de la liste ?</p>` : ''}
      ${clearBtn}` : `<div class="empty"><div class="em">🧺</div>Votre liste est vide.<br>Ajoutez les ingrédients d'une recette.</div>`}</div>`;
}

function coverProfile() {
  const p = S.cover.profile;
  const sw = (k, label, sub) => `<div class="setting-row"><div><div>${label}</div>${sub ? `<div class="muted small">${sub}</div>` : ''}</div><button class="switch ${p[k] ? 'on' : ''}" data-action="profile-toggle" data-k="${k}"></button></div>`;
  return `<div class="content"><div class="cover-hero"><h1>Mon profil</h1></div>
    <div class="profile-head"><div class="avatar">👩‍🍳</div><div><b style="font-size:17px">Cuisinier·ère du dimanche</b><div class="muted small">Membre depuis mars 2025 · 12 recettes cuisinées</div></div></div>
    <div class="card">${sw('notif', 'Notifications', 'Idées de recettes le week-end')}${sw('metric', 'Unités métriques', 'g, dl, cl')}${sw('dark', 'Thème sombre')}</div>
    <div class="card"><div class="setting-row"><span>Aide et contact</span>${I.chevR}</div><div class="setting-row"><span>Conditions d'utilisation</span>${I.chevR}</div><div class="setting-row"><span class="muted small">Version 2.3.1 (build 118)</span></div></div>
  </div>`;
}

function coverTabbar() {
  const t = S.cover.tab;
  const tab = (id, icon, label) => `<button class="tab ${t === id ? 'active' : ''}" data-action="cover-tab" data-tab="${id}">${icon}${label}</button>`;
  return `<div class="bottombar tabbar">${tab('recettes', I.home, 'Recettes')}${tab('favoris', I.heart, 'Favoris')}${tab('courses', I.cart, 'Courses')}${tab('profil', I.user, 'Profil')}</div>`;
}

async function adaptRecipe() {
  const c = S.cover; const r = c.recipe;
  let data;
  try { data = await api('/api/cover/adapt', { method: 'POST', body: { recipe_id: r.id, persons: c.persons } }); }
  catch (e) { toast(e.message); return; }
  if (data.token) { unlock(data.token); return; }            // ← accès secret reconnu
  c.adapted = c.persons; refreshIngredients();
  toast(`Quantités adaptées pour ${c.adapted} personne${c.adapted > 1 ? 's' : ''}`);
}

// ===========================================================================
// 3. VERROUILLAGE / DÉVERROUILLAGE
// ===========================================================================
async function unlock(token) {
  S.token = token;
  screen.classList.add('unlocking');
  try { S.boot = await api('/api/app/bootstrap'); }
  catch (e) { screen.classList.remove('unlocking'); toast(e.message); return; }
  setTimeout(() => {
    S.mode = 'app'; S.tab = 'home'; S.home = { selected: null, list: false };
    S.quiz = { stage: 'intro', i: 0, answers: {}, situation: {}, si: 0, result: S.boot.last_result, busy: false };
    // Les étapes s'affichent pour le téléphone utilisé (modifiable dans l'onglet)
    S.loc = { scanning: false, scanStep: 0, scan: null, open: {}, platform: /android/i.test(navigator.userAgent) ? 'android' : 'iphone' };
    S.ev = { sub: 'pieces', cat: null, catPreset: null, files: null, previews: null, note: '', jtext: '', jdate: '', busy: false };
    S.contacts = { open: {} };
    S.chat = { messages: S.boot.assistant.greeting.map((text) => ({ from: 'bot', text })), text: '', typing: false };
    S.overlay = null;
    render();
    resetIdle();
    setTimeout(() => screen.classList.remove('unlocking'), 400);
  }, 300);
}

function lock(notify = true) {
  if (S.token && notify) api('/api/app/lock', { method: 'POST' }).catch(() => {});
  S.token = null; S.boot = null; S.overlay = null; S.chat = { messages: [], text: '', typing: false };
  clearInterval(callTimer); clearTimeout(idleTimer);
  S.cover.recipe = null; S.cover.tab = 'recettes'; S.cover.persons = 4;
  if (S.front === 'wiki') { S.mode = 'wiki'; wikiOpen(WIKI_HOME); } else { S.mode = 'cover'; render(); }
}

function resetIdle() {
  clearTimeout(idleTimer);
  if (S.mode === 'app') idleTimer = setTimeout(() => lock(true), AUTO_LOCK_MS);
}

// ===========================================================================
// 4. ESPACE PROTÉGÉ — « Abri »
// ===========================================================================
function renderApp() {
  const tabs = { home: appHome, quiz: appQuiz, loc: appLocation, ev: appEvidence, contacts: appContacts };
  // Les contacts s'ouvrent depuis l'accueil : l'onglet Accueil reste allumé
  const current = S.tab === 'contacts' ? 'home' : S.tab;
  const tab = (id, icon, label) => `<button class="tab ${current === id ? 'active' : ''}" data-action="tab" data-tab="${id}">${icon}${label}</button>`;
  return `<div class="view">
    <div class="topbar abri-top">
      <button class="brand" data-action="tab" data-tab="home"><span class="lg">${I.shield}</span> Abri</button>
      <span style="flex:1"></span>
      <button class="icon-btn" data-action="settings" title="Réglages">${I.gear}</button>
      <button class="exit-btn" data-action="quick-exit" title="Retour immédiat à l'app de cuisine">${I.exit} Quitter</button>
    </div>
    <div class="content">${tabs[S.tab]()}</div>
    ${S.tab === 'home' ? `<button class="chat-fab" data-action="chat-open" aria-label="Ouvrir l'assistant"><span class="chat-fab-tag">Assistant</span>${I.chat}</button>` : ''}
    <div class="bottombar abri-tabbar">
      ${tab('home', I.home, 'Accueil')}${tab('quiz', I.clipboard, 'Situation')}
      <div class="sos-slot"><button class="sos-btn" data-action="sos">SOS<small>POLICE 117</small></button></div>
      ${tab('loc', I.pin, 'Localisation')}${tab('ev', I.folder, 'Coffre')}
    </div>
  </div>`;
}

// --- 4·. Accueil : raccourcis + carte des lieux d'aide ------------------------
// Volontairement dépouillé : un bouton pour parler à quelqu'un, quatre raccourcis,
// une carte à trois couleurs. Toucher un point affiche UN lieu ; la liste est repliée.
function appHome() {
  const B = S.boot; const H = S.home; const types = B.office_types;
  const shortcut = (goto, icon, title) => `<button class="home-tile" data-action="tab" data-tab="${goto}"><span class="em">${icon}</span>${title}</button>`;
  const sel = B.offices.find((o) => o.id === H.selected);
  const card = sel ? `<div class="office-card">
      <button class="office-close" data-action="office-close" title="Fermer">${I.x}</button>
      <b><i class="dot" style="background:${esc(types[sel.type].color)}"></i>${esc(sel.name)} · ${esc(sel.town)}</b>
      <div class="small muted">${esc(sel.address)}</div>
      <p class="small">${esc(sel.note)}</p>
      <button class="btn primary block" data-action="call-office" data-id="${esc(sel.id)}">${I.phone} Appeler · ${esc(sel.phone)}</button>
    </div>` : '<p class="small muted map-hint">Touchez un point pour voir le lieu.</p>';
  return `<div class="fade-in">
    <div class="page-title">Vous êtes à l'abri ici</div>
    <p class="page-sub">« Quitter » ou Échap : retour ${S.front === 'wiki' ? 'à Wikipédia' : 'aux recettes'}. Glissez vers la droite pour l'assistant.</p>
    <button class="home-call" data-action="call" data-id="victimes142">${I.phone}<span><b>Parler à quelqu'un</b><small>142 · gratuit, 24h/24</small></span></button>
    <div class="home-grid">
      ${shortcut('quiz', '📋', 'Ma situation')}${shortcut('loc', '📍', 'Localisation')}
      ${shortcut('ev', '🔒', 'Mon coffre')}${shortcut('contacts', '📞', 'Contacts')}
    </div>
    <div class="section-title">Où trouver de l'aide</div>
    <div id="map-slot" class="office-map-slot"><div class="map-loading"><span class="spinner"></span> Chargement de la carte…</div></div>
    <div class="map-legend">${Object.values(types).map((t) => `<span><i class="dot" style="background:${esc(t.color)}"></i>${esc(t.label)}</span>`).join('')}</div>
    ${card}
    <button class="btn muted sm block" data-action="office-list">${H.list ? 'Masquer la liste' : `Voir la liste des ${B.offices.length} lieux`}</button>
    ${H.list ? `<div class="office-list">${B.offices.map((o) => `<button class="office-line" data-action="office-show" data-id="${esc(o.id)}"><i class="dot" style="background:${esc(types[o.type].color)}"></i><span><b>${esc(o.name)}</b> · ${esc(o.town)}</span>${I.chevR}</button>`).join('')}</div>` : ''}
  </div>`;
}

// La carte (Leaflet) n'est chargée qu'à la première ouverture de l'accueil d'Abri :
// l'app de cuisine ne charge jamais rien qui la trahisse. Un seul élément carte est créé,
// puis déplacé dans la page à chaque rendu (render() redessine tout l'écran).
let officeMap = null;
let leafletLoading = null;
function loadLeaflet() {
  if (!leafletLoading) {
    leafletLoading = new Promise((resolve, reject) => {
      const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = '/static/vendor/leaflet/leaflet.min.css';
      const js = document.createElement('script'); js.src = '/static/vendor/leaflet/leaflet.min.js';
      js.onload = resolve; js.onerror = () => { leafletLoading = null; reject(new Error('Leaflet')); };
      document.head.append(css, js);
    });
  }
  return leafletLoading;
}

async function mountMap() {
  try { await loadLeaflet(); } catch (e) {
    const slot = $('#map-slot', screen);
    if (slot) slot.innerHTML = '<p class="small muted map-loading">Carte indisponible : voyez la liste ci-dessous.</p>';
    return;
  }
  const slot = $('#map-slot', screen); if (!slot) return;          // on a changé d'onglet entre-temps
  const Lf = window.L;
  if (!officeMap) {
    const el = document.createElement('div'); el.className = 'office-map';
    slot.replaceChildren(el);
    const map = Lf.map(el, { scrollWheelZoom: false });
    map.attributionControl.setPrefix(false);
    Lf.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18, attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
    }).addTo(map);
    const markers = {};
    for (const o of S.boot.offices) {
      markers[o.id] = Lf.circleMarker([o.lat, o.lon], { radius: 8, color: '#fff', weight: 2, fillColor: S.boot.office_types[o.type].color, fillOpacity: 1 })
        .on('click', () => selectOffice(o.id, false)).addTo(map);
    }
    officeMap = { el, map, markers };
    showAllOffices();
  } else {
    slot.replaceChildren(officeMap.el);
    officeMap.map.invalidateSize();
    if (S.home.refit) { S.home.refit = false; showAllOffices(); }   // fiche fermée : retour à tout le canton
  }
  // Le lieu choisi est plus gros sur la carte
  for (const [id, m] of Object.entries(officeMap.markers)) {
    const on = id === S.home.selected;
    m.setRadius(on ? 12 : 8).setStyle({ weight: on ? 3 : 2 });
    if (on) m.bringToFront();
  }
}

// Vue d'ensemble : tout le canton
function showAllOffices() {
  if (!officeMap) return;
  officeMap.map.fitBounds(window.L.latLngBounds(S.boot.offices.map((o) => [o.lat, o.lon])), { padding: [24, 24], animate: false });
}

// Choisir un lieu (depuis la carte ou la liste) : sa fiche s'affiche sous la carte
function selectOffice(id, fromList) {
  const o = S.boot.offices.find((x) => x.id === id); if (!o) return;
  S.home.selected = id;
  render();
  if (fromList) {
    const slot = $('#map-slot', screen); if (slot) slot.scrollIntoView({ behavior: 'smooth', block: 'start' });
    loadLeaflet().then(() => { if (officeMap) officeMap.map.setView([o.lat, o.lon], 14); }).catch(() => {});
  }
}

function openOfficeCall(id) {
  const o = S.boot.offices.find((x) => x.id === id); if (!o) return;
  S.overlay = { type: 'call', contact: { title: `${o.name} · ${o.town}`, org: S.boot.office_types[o.type].label, phone: o.phone } };
  renderOverlay();
}

// --- 4a. Questionnaire ------------------------------------------------------
function allQuestions() {
  return S.boot.questionnaire.sections.flatMap((s) => s.questions.map((q) => ({ ...q, section: s })));
}

function appQuiz() {
  const q = S.quiz; const Q = S.boot.questionnaire;
  if (q.stage === 'intro') {
    const last = q.result;
    return `<div class="fade-in"><div class="page-title">Évaluer votre situation</div>
      <p class="page-sub">${esc(Q.intro)}</p>
      ${last ? `<div class="card"><div class="row between"><div><b>Dernière évaluation</b><div class="muted small">${fmtDate(last.evaluated_at)} — <span style="color:${last.level_info.color};font-weight:700">${esc(last.level_info.label)}</span></div></div><button class="btn soft sm" data-action="quiz-show-result">Voir</button></div></div>` : ''}
      <div class="section-title">Ce que le questionnaire aborde</div>
      <div class="sections-list">${Q.sections.map((s) => `<div class="sec-row"><span class="em">${s.icon}</span>${esc(s.title)}<span class="cnt">${s.questions.length} questions</span></div>`).join('')}</div>
      <div class="card" style="margin-top:16px"><p class="small muted">🔒 Vos réponses restent dans l'espace protégé et ne sont transmises à personne. À la fin, Abri vous oriente vers les services du canton de Vaud adaptés à votre situation.</p></div>
      <button class="btn primary block" data-action="quiz-start">Commencer · ${allQuestions().length} questions</button></div>`;
  }
  if (q.stage === 'questions') {
    const list = allQuestions(); const cur = list[q.i]; const sec = cur.section; const sel = q.answers[cur.id];
    return `<div class="fade-in">
      <div class="row between"><span class="q-section">${sec.icon} ${esc(sec.title)}</span><span class="muted small">${q.i + 1} / ${list.length}</span></div>
      <div class="progress"><i style="width:${Math.round(100 * q.i / list.length)}%"></i></div>
      <div class="q-lead">${Q_LEAD}</div>
      <div class="q-text">${esc(cur.text)}</div>
      <div class="q-answers"><button class="btn no ${sel === false ? 'selected' : ''}" data-action="answer" data-v="0">Non</button><button class="btn yes ${sel === true ? 'selected' : ''}" data-action="answer" data-v="1">Oui</button></div>
      <div class="q-mention">${esc(sec.mention)}</div>
      <div class="q-nav"><button data-action="quiz-prev">${q.i > 0 ? '← Précédent' : '← Intro'}</button><button data-action="quiz-skip">Passer →</button></div></div>`;
  }
  if (q.stage === 'situation') {
    const list = Q.situation; const cur = list[q.si]; const sel = q.situation[cur.id];
    return `<div class="fade-in">
      <div class="row between"><span class="q-section">ℹ️ Votre situation (facultatif)</span><span class="muted small">${q.si + 1} / ${list.length}</span></div>
      <div class="progress"><i style="width:100%"></i></div>
      <div class="q-lead">Pour vous orienter vers les bons services</div>
      <div class="q-text">${esc(cur.text)}</div>
      <div class="q-answers"><button class="btn no ${sel === false ? 'selected' : ''}" data-action="sit-answer" data-v="0">Non</button><button class="btn yes ${sel === true ? 'selected' : ''}" data-action="sit-answer" data-v="1">Oui</button></div>
      <div class="q-nav"><button data-action="sit-prev">← Précédent</button><button data-action="sit-skip">Passer →</button></div></div>`;
  }
  if (q.stage === 'loading') return `<div class="empty"><div class="spinner" style="margin:0 auto 12px;width:28px;height:28px"></div>Analyse de vos réponses…</div>`;
  return quizResult(q.result);
}

function quizResult(r) {
  const li = r.level_info;
  const axes = S.boot.axes;
  return `<div class="fade-in">
    <div class="level-banner ${r.level}"><div class="lbl">Résultat</div><h2>${esc(li.label)}</h2><p><b>${esc(li.headline)}</b> ${esc(li.text)}</p></div>
    ${r.sections.length ? `<div class="section-title">Formes de violence identifiées</div><div class="sections-list">${r.sections.map((s) => `<div class="sec-row"><span class="em">${s.icon}</span>${esc(s.title)}<span class="cnt">${s.count} oui / ${s.total}</span></div>`).join('')}</div>` : ''}
    ${r.advice.length ? `<div style="margin-top:14px">${r.advice.map((a) => `<div class="advice">${esc(a)}</div>`).join('')}</div>` : ''}
    <div class="section-title">Que faire maintenant</div>
    ${r.actions.map((a) => `<button class="action" data-action="act" ${a.goto ? `data-goto="${a.goto}"` : ''} ${a.contact ? `data-contact="${a.contact}"` : ''}><span class="em">${a.icon}</span><span><b>${esc(a.title)}</b><span>${esc(a.text)}</span></span>${I.chevR}</button>`).join('')}
    <div class="section-title">Services recommandés pour vous</div>
    ${r.contacts.map((c) => contactCard(c, axes)).join('')}
    ${r.dossier.length ? `<div class="section-title" id="dossier">Porter plainte — pièces à préparer</div>
      <div class="card">${r.dossier.map(dossierItem).join('')}</div>
      <div class="card"><h3>Bon à savoir</h3><ul class="info-list">${r.plainte_info.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}
    <button class="btn muted block" data-action="quiz-restart" style="margin-top:6px">Refaire le questionnaire</button>
    <p class="tiny muted" style="text-align:center;margin-top:12px">Questionnaire et réseau d'aide : canton de Vaud — Bureau de l'égalité entre les femmes et les hommes.</p>
  </div>`;
}

function dossierItem(d) {
  const have = new Set((S.boot.evidence || []).map((e) => e.category));
  if ((S.boot.journal || []).length) have.add('journal');
  const done = d.category && have.has(d.category);
  const link = d.category === 'journal' ? `<button class="link" data-action="goto" data-goto="journal">Ouvrir le journal →</button>`
    : d.category ? `<button class="link" data-action="goto" data-goto="evidence" data-cat="${d.category}">Déposer dans le coffre →</button>`
    : d.contact ? `<button class="link" data-action="call" data-id="${d.contact}">Appeler →</button>` : '';
  return `<div class="check-item"><div class="box ${done ? 'on' : ''}">${done ? I.check : ''}</div><div><b>${esc(d.label)}</b>${d.optional ? ' <span class="pill" style="font-size:10px;padding:2px 7px">selon le cas</span>' : ''}<p>${esc(d.detail)}</p>${link}</div></div>`;
}

async function quizEvaluate() {
  S.quiz.stage = 'loading'; render();
  try {
    const r = await api('/api/questionnaire/evaluate', { method: 'POST', body: { answers: S.quiz.answers, situation: S.quiz.situation } });
    S.quiz.result = r; S.boot.last_result = r;
    S.boot.dossier = (await api('/api/evidence')).dossier;
  } catch (e) { toast(e.message); S.quiz.stage = 'intro'; render(); return; }
  S.quiz.stage = 'result'; render();
  const c = $('.content', screen); if (c) c.scrollTop = 0;
}

// --- 4b. Localisation ------------------------------------------------------
const SCAN_STEPS = ['Qui voit votre position…', 'Applis qui vous surveillent…', 'Appareils connectés à votre compte…', 'Traqueurs près de vous…'];
const PLATFORMS = { iphone: 'iPhone', android: 'Android' };

function appLocation() {
  const L = S.loc; const A = S.boot.audit;
  const byId = Object.fromEntries(A.items.map((i) => [i.id, i]));

  // 1. Vérification automatique (démo) : chaque résultat renvoie au point à régler
  let scanBlock;
  if (L.scanning) scanBlock = `<ul class="scan-steps">${SCAN_STEPS.map((s, n) => `<li class="${n < L.scanStep ? 'done' : ''}">${n < L.scanStep ? '✓' : n === L.scanStep ? '<span class="spinner"></span>' : '·'} ${s}</li>`).join('')}</ul>`;
  else if (L.scan) {
    const lbl = { high: 'À régler', medium: 'À vérifier', ok: 'OK' };
    const todo = L.scan.counts.high + L.scan.counts.medium;
    scanBlock = `<p class="small muted" style="margin:0 0 6px">${todo ? `${todo} point${todo > 1 ? 's' : ''} à regarder` : 'Rien d\'inquiétant trouvé'}</p>
      ${L.scan.findings.map((f) => `<div class="finding"><span class="badge ${f.level}">${lbl[f.level]}</span><div><b>${esc(f.text)}</b>${f.detail ? `<p>${esc(f.detail)}</p>` : ''}${f.level !== 'ok' && byId[f.item] ? `<button class="fix" data-action="audit-goto" data-item="${esc(f.item)}">Voir comment faire →</button>` : ''}</div></div>`).join('')}
      <button class="btn soft sm" style="margin-top:12px" data-action="scan">Vérifier à nouveau</button>`;
  } else scanBlock = `<p class="small muted" style="margin:0 0 12px">Abri cherche qui peut voir votre position, les applis qui vous surveillent et les appareils connectés à votre compte.</p><button class="btn primary block" data-action="scan">Vérifier mon téléphone</button>`;

  // 2. Les points à vérifier, regroupés en trois questions simples
  const item = (it) => {
    const open = L.open[it.id]; const done = A.done[it.id];
    const steps = Array.isArray(it.steps) ? it.steps : it.steps[L.platform];
    return `<div class="audit-item ${done ? 'done' : ''}" id="audit-${esc(it.id)}"><div class="head"><button style="flex:1;text-align:left;color:inherit;display:flex;align-items:center;gap:8px" data-action="audit-open" data-item="${esc(it.id)}"><b style="flex:1">${esc(it.title)}${it.priority && !done ? ' <span class="badge medium">Important</span>' : ''}</b>${open ? I.chevD : I.chevR}</button><button class="box ${done ? 'on' : ''}" data-action="audit-toggle" data-item="${esc(it.id)}" title="C'est fait">${done ? I.check : ''}</button></div>
      ${open ? `<div class="body"><p class="risk">${esc(it.why)}</p>
        ${it.warning ? `<div class="advice">⚠️ ${esc(it.warning)}</div>` : ''}
        <ol>${steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
        <button class="btn ${done ? 'muted' : 'soft'} sm" style="margin-top:10px" data-action="audit-toggle" data-item="${esc(it.id)}">${done ? 'Finalement, pas encore fait' : '✓ C\'est fait'}</button></div>` : ''}</div>`;
  };

  return `<div class="fade-in"><div class="page-title">Localisation</div><p class="page-sub">Vérifiez que personne ne peut savoir où vous êtes.</p>
    <div class="advice"><b>⚠️ Avant de changer un réglage</b><br>${esc(A.warning)}
      <div style="margin-top:10px"><button class="btn soft sm" data-action="call" data-id="victimes142">${I.phone} Appeler le 142</button></div></div>
    <div class="row between" style="margin:14px 0 0"><b class="small">Mon téléphone</b><span class="muted small">${A.n_done} sur ${A.n_total} vérifiés</span></div>
    <div class="segmented">${Object.entries(PLATFORMS).map(([id, label]) => `<button class="${L.platform === id ? 'active' : ''}" data-action="loc-platform" data-platform="${id}">${label}</button>`).join('')}</div>
    <div class="progress" style="margin-top:0"><i style="width:${Math.round(100 * A.n_done / A.n_total)}%"></i></div>
    <div class="card"><div class="row between" style="margin-bottom:6px"><h3 style="margin:0">Vérification rapide</h3><span class="tiny muted">démo · résultats simulés</span></div>${scanBlock}</div>
    ${A.quick[L.platform] ? `<div class="card highlight-card"><h3>⚡ Tout couper d'un coup</h3><p class="small muted">${esc(A.quick[L.platform])}</p></div>` : ''}
    ${A.groups.map((g) => `<div class="section-title">${g.icon} ${esc(g.title)}</div>${A.items.filter((i) => i.group === g.id).map(item).join('')}`).join('')}
    <div class="card" style="margin-top:16px"><h3>Bon à savoir</h3><ul class="info-list">${A.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
  </div>`;
}

function startScan() {
  const L = S.loc; L.scanning = true; L.scanStep = 0; L.scan = null; render();
  const iv = setInterval(async () => {
    L.scanStep++;
    if (L.scanStep >= SCAN_STEPS.length) {
      clearInterval(iv);
      try { L.scan = await api('/api/location/scan', { method: 'POST' }); } catch (e) { toast(e.message); }
      L.scanning = false;
    }
    render();
  }, 550);
}

async function toggleAudit(id) {
  const A = S.boot.audit; const val = !A.done[id];
  try { S.boot.audit = await api(`/api/location/audit/${id}`, { method: 'POST', body: { done: val } }); }
  catch (e) { toast(e.message); return; }
  if (S.loc.scan) S.loc.scan = await api('/api/location/scan', { method: 'POST' }).catch(() => S.loc.scan);
  render();
}

// --- 4c. Coffre à preuves ---------------------------------------------------
// Écrit en français facile : phrases courtes, mots simples, une icône sur chaque chose.
// Pensé pour un enfant de 9 ans ou une personne qui lit mal le français.
// (L'empreinte SHA-256 et les dates exactes restent dans le fichier téléchargé pour l'avocat·e.)
// Icônes du coffre (traits fins, pas d'emoji : ton sobre)
const EVI = {
  upload: svg('<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5"/><path d="M4 14v4a2 2 0 002 2h12a2 2 0 002-2v-4"/>'),
  file: svg('<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/>'),
  files: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>'),
  journal: svg('<path d="M6 3h10a2 2 0 012 2v16H8a2 2 0 01-2-2z"/><path d="M10 8h5M10 12h5"/>'),
  dossier: svg('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 11l2 2 4-4M9 17h6"/>'),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'),
  todo: svg('<circle cx="12" cy="12" r="9"/>'),
  done: svg('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>'),
  blessure: svg('<path d="M9.5 4h5v5.5H20v5h-5.5V20h-5v-5.5H4v-5h5.5z"/>'),
  message: svg('<path d="M4 5h16v11H9l-5 4z"/>'),
  degats: svg('<path d="M12 3.5l9 16H3z"/><path d="M12 10v4.5M12 17.2v.3"/>'),
  document: svg('<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'),
  audio: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>'),
  autre: svg('<path d="M20 11.5l-7.8 7.8a5 5 0 01-7.1-7.1l8.2-8.2a3.4 3.4 0 014.8 4.8l-8.2 8.2a1.7 1.7 0 01-2.4-2.4l7.4-7.4"/>'),
};
const EV_ACCEPT = 'image/*,audio/*,video/*,application/pdf,.doc,.docx,.txt';
const EV_MAX = 50 * 1024 * 1024;
const fmtSize = (n) => n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} Ko` : `${(n / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`;
const fmtShort = (iso) => { const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleString('fr-CH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };
const isTouch = () => matchMedia('(pointer: coarse)').matches;

function appEvidence() {
  const E = S.ev; const B = S.boot;
  const cats = Object.fromEntries(B.evidence_categories.map((c) => [c.id, c]));
  const catOf = (e) => cats[e.category] || cats.autre;
  const seg = (id, icon, label, n) => `<button class="${E.sub === id ? 'active' : ''}" data-action="ev-sub" data-sub="${id}">${icon}<span>${label}</span><small>${n}</small></button>`;
  let body;
  if (E.sub === 'pieces') {
    // La zone de dépôt : toucher pour choisir, ou glisser-déposer (ordinateur)
    body = `<label class="dropzone" id="ev-drop">
        <input type="file" data-input="ev-file" multiple accept="${EV_ACCEPT}">
        <span class="dz-ic">${EVI.upload}</span>
        <b>Ajouter une photo ou un fichier</b>
        <span class="dz-sub">${isTouch() ? 'Touchez ici pour choisir' : 'Cliquez pour choisir, ou glissez les fichiers ici'}</span>
        <span class="dz-types">Photos, captures d'écran, PDF, audio, vidéo · 50 Mo max.</span>
      </label>
      ${isTouch() ? `<label class="btn soft block dz-camera"><input type="file" data-input="ev-file" accept="image/*" capture="environment" hidden>${I.camera} Prendre une photo</label>` : ''}
      ${B.evidence.length ? `<div class="section-title">Dans le coffre · ${B.evidence.length}</div>
        <div class="ev-list">${B.evidence.map((e) => { const c = catOf(e);
          return `<div class="ev-row">
          <div class="thumb">${e.mime.startsWith('image/') ? `<img src="/api/evidence/file/${esc(e.id)}?t=${encodeURIComponent(S.token)}" alt="">` : e.mime.startsWith('audio/') ? EVI.audio : EVI.document}</div>
          <div class="info"><div class="nm">${esc(e.note || c.label)}</div>
            <div class="dt">${[e.note ? c.label : null, fmtShort(e.added_at), fmtSize(e.size)].filter(Boolean).map(esc).join(' · ')}</div></div>
          <button class="icon-btn del" data-action="ev-del" data-id="${esc(e.id)}" title="Supprimer" aria-label="Supprimer">${I.trash}</button></div>`; }).join('')}</div>`
      : `<p class="ev-empty">Aucun fichier pour l'instant. Par exemple : la photo d'une blessure, la capture d'écran d'un message, un certificat médical.</p>`}
      <p class="ev-note">${I.shield}<span>Chaque fichier est daté à l'ajout et reçoit une empreinte numérique : on peut prouver qu'il n'a pas été modifié.</span></p>`;
  } else if (E.sub === 'journal') {
    body = `<div class="card ev-form">
        <div class="field"><label>Ce qui s'est passé</label><textarea data-input="jtext" placeholder="Décrivez les faits avec vos mots : ce qui s'est passé, où, et qui était présent. Quelques phrases suffisent.">${esc(E.jtext)}</textarea></div>
        <div class="field"><label>Date et heure des faits</label><input type="datetime-local" data-input="jdate" value="${esc(E.jdate || localDT())}"></div>
        <button class="btn primary block" data-action="journal-add" ${E.busy ? 'disabled' : ''}>${E.busy ? 'Enregistrement…' : 'Enregistrer'}</button></div>
      ${B.journal.length ? `<div class="section-title">Entrées · ${B.journal.length}</div>${B.journal.map((j) => `<div class="journal-entry">
        <div class="row between"><span class="dt">${esc(fmtDay(j.occurred))}</span><button class="icon-btn del" data-action="journal-del" data-id="${esc(j.id)}" title="Supprimer" aria-label="Supprimer">${I.trash}</button></div>
        <p>${esc(j.text)}</p><div class="rec">Écrit le ${esc(fmtShort(j.recorded))}</div></div>`).join('')}`
      : '<p class="ev-empty">Aucune entrée pour l\'instant. Notez les faits dès que possible, même brièvement : les détails s\'oublient vite.</p>'}`;
  } else {
    const D = B.dossier;
    const acts = (d) => {
      const btns = [];
      if (d.category === 'journal') btns.push(`<button class="link-btn" data-action="goto" data-goto="journal">${EVI.journal} Rédiger</button>`);
      else if (d.category) btns.push(`<button class="link-btn" data-action="goto" data-goto="evidence" data-cat="${esc(d.category)}">${EVI.upload} Ajouter</button>`);
      if (d.contact) btns.push(`<button class="link-btn" data-action="call" data-id="${esc(d.contact)}">${I.phone} Appeler</button>`);
      return btns.length ? `<div class="dl-acts">${btns.join('')}</div>` : '<p class="dl-self">À préparer en dehors d\'Abri.</p>';
    };
    body = `<div class="card dossier-head"><div class="row between"><b>Pièces pour une plainte</b><span>${D.n_done} / ${D.n_total}</span></div>
        <div class="progress"><i style="width:${D.n_total ? Math.round(100 * D.n_done / D.n_total) : 0}%"></i></div>
        ${B.last_result ? '' : '<p>Liste générale. Faites « Ma situation » pour une liste adaptée à votre cas.</p>'}</div>
      <div class="dossier-list">${D.items.map((d) => `<div class="dl-item ${d.done ? 'done' : ''}"><span class="dl-st">${d.done ? EVI.done : EVI.todo}</span>
        <div><b>${esc(d.label)}${d.optional ? ' <span class="pill">Facultatif</span>' : ''}</b><p>${esc(d.detail)}</p>${d.done ? '' : acts(d)}</div></div>`).join('')}</div>
      <div class="card ev-export"><b>Exporter le dossier</b>
        <p>Un fichier ZIP avec vos fichiers, votre journal et un index daté, à remettre à un·e avocat·e ou au Centre LAVI.</p>
        <button class="btn primary block" data-action="ev-export">${I.download} Télécharger le dossier (.zip)</button>
        <p class="ev-note">${EVI.info}<span>Le fichier est enregistré dans les téléchargements du téléphone. Supprimez-le après l'avoir remis.</span></p></div>`;
  }
  return `<div class="fade-in ev"><div class="page-title">Coffre</div><p class="page-sub">Vos preuves, datées et rangées. Visibles seulement dans Abri.</p>
    <div class="segmented ev-tabs">${seg('pieces', EVI.files, 'Fichiers', B.evidence.length)}${seg('journal', EVI.journal, 'Journal', B.journal.length)}${seg('dossier', EVI.dossier, 'Dossier', `${B.dossier.n_done}/${B.dossier.n_total}`)}</div>${body}</div>`;
}

// Fichiers choisis (bouton, appareil photo ou glisser-déposer) → feuille de détails
function openEvidenceSheet(list) {
  const files = [...list].filter((f) => f.size <= EV_MAX);
  if (files.length < list.length) toast('Fichier trop lourd (50 Mo max.)');
  if (!files.length) return;
  const E = S.ev;
  (E.previews || []).forEach((u) => u && URL.revokeObjectURL(u));
  E.files = files;
  E.previews = files.map((f) => (f.type.startsWith('image/') ? URL.createObjectURL(f) : null));
  // type proposé : celui demandé par le dossier, sinon deviné (audio, document), sinon à choisir
  const t = files[0].type;
  E.cat = E.catPreset || (t.startsWith('audio/') ? 'audio' : /pdf|word|text/.test(t) || /\.(docx?|txt|pdf)$/i.test(files[0].name) ? 'document' : null);
  E.catPreset = null; E.note = ''; E.busy = false;
  S.overlay = { type: 'evidence' }; renderOverlay();
}

async function refreshEvidence() {
  const d = await api('/api/evidence');
  S.boot.evidence = d.evidence; S.boot.journal = d.journal; S.boot.dossier = d.dossier;
}

async function submitEvidence() {
  const E = S.ev;
  if (!E.files || !E.files.length) { toast('Choisissez d\'abord une photo ou un fichier'); return; }
  if (!E.cat) { toast('Choisissez le type de pièce'); return; }
  E.busy = 0; renderOverlay();
  try {
    for (const f of E.files) {
      const form = new FormData(); form.append('file', f); form.append('category', E.cat); form.append('note', E.note);
      await api('/api/evidence', { method: 'POST', form });
      E.busy++; renderOverlay();
    }
    await refreshEvidence();
  } catch (e) { toast(e.message); E.busy = false; await refreshEvidence().catch(() => {}); renderOverlay(); render(); return; }
  const n = E.files.length;
  (E.previews || []).forEach((u) => u && URL.revokeObjectURL(u));
  E.busy = false; E.files = null; E.previews = null; E.note = ''; S.overlay = null;
  render(); toast(n > 1 ? `${n} fichiers ajoutés au coffre` : 'Ajouté au coffre');
}

async function submitJournal() {
  const E = S.ev; if (!E.jtext.trim()) { toast('Décrivez d\'abord ce qui s\'est passé'); return; }
  E.busy = true; render();
  try { await api('/api/journal', { method: 'POST', body: { text: E.jtext, occurred: E.jdate || localDT() } }); await refreshEvidence(); }
  catch (e) { toast(e.message); E.busy = false; render(); return; }   // on garde le texte pour réessayer
  E.busy = false; E.jtext = ''; E.jdate = ''; render(); toast('Entrée enregistrée');
}

// --- 4d. Contacts ----------------------------------------------------------
function contactCard(c, axes) {
  const col = (axes[c.axis] || {}).color || '#3dd6c8';
  return `<div class="contact ${c.pinned ? 'pinned' : ''}" style="--axis:${col}">
    <div class="t">${esc(c.title)}</div><div class="o">${esc(c.org)}</div><div class="d">${esc(c.desc)}</div>
    ${c.phone ? `<div class="num">${esc(c.phone)}</div>` : ''}
    <div class="acts">${c.phone ? `<button class="btn primary sm" data-action="call" data-id="${c.id}">${I.phone} Appeler</button><button class="btn muted sm" data-action="sms" data-id="${c.id}">💬 Message</button>` : ''}
    ${c.web ? `<button class="btn primary sm" data-action="web" data-url="${esc(c.web)}">${I.link} Ouvrir le site</button>` : ''}</div></div>`;
}

function appContacts() {
  const B = S.boot; const axes = B.axes; const O = S.contacts.open;
  const pinned = B.contacts.filter((c) => c.pinned);
  const rec = B.last_result ? B.last_result.contacts.filter((c) => !c.pinned) : [];
  const order = ['securite', 'sante', 'justice', 'migration', 'conseils'];
  return `<div class="fade-in"><div class="page-title">Contacts</div><p class="page-sub">Réseau vaudois de lutte contre la violence domestique. Les appels et messages passent par Abri : ils n'apparaissent pas dans l'historique du téléphone.</p>
    ${pinned.map((c) => contactCard(c, axes)).join('')}
    ${rec.length ? `<div class="section-title">Recommandés pour votre situation</div>${rec.map((c) => contactCard(c, axes)).join('')}` : ''}
    <div class="section-title">Tous les services, par domaine</div>
    ${order.map((ax) => { const list = B.contacts.filter((c) => c.axis === ax && !c.pinned); const open = O[ax] !== false;
      return `<button class="axis-head" data-action="axis-toggle" data-axis="${ax}"><span class="dot" style="background:${axes[ax].color}"></span>${esc(axes[ax].label)}<span class="n">${list.length}</span>${open ? I.chevD : I.chevR}</button>${open ? list.map((c) => contactCard(c, axes)).join('') : ''}`; }).join('')}
    <p class="tiny muted" style="text-align:center;margin-top:10px">Source : canton de Vaud — « Violence domestique : où trouver de l'aide ? »</p>
  </div>`;
}

// ===========================================================================
// 5. SUPERPOSITIONS : appel, message, réglages, feuille d'ajout, confirmation
// ===========================================================================
function renderOverlay() {
  clearInterval(callTimer);
  const O = S.overlay;
  if (!O) { overlaysEl.innerHTML = ''; return; }
  if (O.type === 'call') {
    const c = O.contact;
    overlaysEl.innerHTML = `<div class="overlay"><div class="call ${O.sos ? 'sos' : ''}">
      <span class="via">${O.sos ? 'Appel d\'urgence · via Abri' : 'Appel via Abri · VoIP'}</span>
      <div class="av">${O.sos ? '🚨' : '📞'}</div>
      <h2>${esc(c.title)}</h2><div class="org">${esc(c.org)}</div><div class="num">${esc(c.phone)}</div>
      <div class="st" id="call-status">Appel en cours…</div>
      <div class="grow"></div>
      <div class="keys"><div class="key"><i>${I.mic}</i>Muet</div><div class="key"><i>${I.speaker}</i>Haut-parleur</div><div class="key"><i>${I.keypad}</i>Clavier</div></div>
      <button class="hangup" data-action="hangup">${I.phone}</button>
      <p class="note">${O.sos ? 'La police intervient 24h/24. ' : ''}Cet appel passe par l'application et n'apparaît pas dans l'historique d'appels du téléphone.</p>
    </div></div>`;
    const t0 = Date.now();
    callTimer = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); const el = $('#call-status');
      if (el) el.textContent = s < 3 ? 'Appel en cours…' : `Connecté · ${String(Math.floor((s - 3) / 60)).padStart(2, '0')}:${String((s - 3) % 60).padStart(2, '0')}`; }, 500);
    return;
  }
  if (O.type === 'sms') {
    const c = O.contact;
    overlaysEl.innerHTML = `<div class="overlay dim" data-action="overlay-close"><div class="sheet" data-stop><div class="grip"></div><h3>Message à ${esc(c.org)}</h3>
      <p class="small muted" style="margin:0 0 12px">${esc(c.phone)} · envoyé via Abri, sans trace dans l'application Messages.</p>
      <div class="field"><textarea data-input="sms-text">${esc(O.text)}</textarea></div>
      <button class="btn primary block" data-action="sms-send">Envoyer</button></div></div>`;
    return;
  }
  if (O.type === 'evidence') {
    const E = S.ev; const n = E.files.length;
    const busy = E.busy !== false;
    overlaysEl.innerHTML = `<div class="overlay dim" data-action="overlay-close"><div class="sheet ev-sheet" data-stop><div class="grip"></div><h3>Ajouter au coffre</h3>
      <div class="ev-preview">${E.files.map((f, i) => `<div class="pv">${E.previews[i] ? `<img src="${E.previews[i]}" alt="">` : `<span class="pv-ic">${EVI.file}</span>`}
        <div class="pv-t"><b>${esc(f.name)}</b><span>${fmtSize(f.size)}</span></div></div>`).join('')}
        <label class="link-btn pv-change"><input type="file" data-input="ev-file" multiple accept="${EV_ACCEPT}" hidden>Changer</label></div>
      <div class="ev-label">Type de pièce</div>
      <div class="type-grid">${S.boot.evidence_categories.map((c) => `<button class="${E.cat === c.id ? 'on' : ''}" data-action="ev-cat" data-cat="${esc(c.id)}">${EVI[c.id] || EVI.file}<span>${esc(c.label)}</span></button>`).join('')}</div>
      <div class="field"><label>Note <span class="opt">(facultatif)</span></label><input data-input="ev-note" placeholder="Ex. : bras gauche, lundi soir" value="${esc(E.note)}"></div>
      <p class="ev-note">${EVI.info}<span>La date et l'heure d'ajout sont enregistrées automatiquement.</span></p>
      <button class="btn primary block" data-action="ev-submit" ${busy ? 'disabled' : ''}>${busy ? `Ajout en cours…${n > 1 ? ` ${E.busy}/${n}` : ''}` : `${I.lock} ${n > 1 ? `Ajouter ${n} fichiers au coffre` : 'Ajouter au coffre'}`}</button></div></div>`;
    return;
  }
  if (O.type === 'settings') {
    const cfg = S.boot.config;
    overlaysEl.innerHTML = `<div class="overlay dim" data-action="overlay-close"><div class="sheet" data-stop><div class="grip"></div><h3>Réglages</h3>
      <div class="settings-row col"><div><b>Apparence de l'app</b><span>Ce que l'on voit en ouvrant l'app.</span></div>
        <div class="cat-grid front-pick">${[['recettes', '🍳', 'Recettes'], ['wiki', '📖', 'Wikipédia']].map(([id, em, label]) => `<button class="${S.front === id ? 'on' : ''}" data-action="front-set" data-front="${id}"><span class="em">${em}</span>${label}</button>`).join('')}</div></div>
      ${S.front === 'wiki'
        ? `<div class="settings-row"><div><b>Mot secret</b><span>Pour ouvrir Abri : tapez-le dans la recherche de Wikipédia, puis Entrée.</span></div><button class="btn soft sm" data-action="phrase-edit">Modifier</button></div>`
        : `<div class="settings-row"><div><b>Accès secret</b><span>${cfg.recipe.emoji} ${esc(cfg.recipe.name)} · ${cfg.persons} personne${cfg.persons > 1 ? 's' : ''}</span></div><button class="btn soft sm" data-action="settings-change">Modifier</button></div>`}
      ${Object.entries(S.boot.features || {}).map(([key, f]) => `<div class="settings-row"><div><b>${esc(f.label)} <span class="pill" style="font-size:10px;padding:2px 7px">À venir</span></b><span>${esc(f.desc)}</span></div><button class="switch ${S.boot.prefs[key] ? 'on' : ''}" data-action="pref-toggle" data-key="${esc(key)}"></button></div>`).join('')}
      <div class="settings-row"><div><b>Verrouillage automatique</b><span>Retour à ${S.front === 'wiki' ? 'Wikipédia' : 'Petits Plats'} après 3 min d'inactivité</span></div></div>
      <div class="settings-row"><div><b>Sortie rapide</b><span>Bouton « Quitter » ou touche Échap : retour immédiat à ${S.front === 'wiki' ? 'Wikipédia' : 'l\'app de cuisine'}</span></div></div>
      <div class="settings-row"><div><b>Verrouiller maintenant</b><span>Ferme l'espace protégé</span></div><button class="btn muted sm" data-action="quick-exit">${I.lock} Verrouiller</button></div>
      <div class="settings-row"><div><b>Réinitialiser la démo</b><span>Efface le code secret, les preuves et le journal</span></div><button class="btn danger sm" data-action="reset-ask">Réinitialiser</button></div>
      <p class="tiny muted" style="margin-top:12px">Source du questionnaire et du réseau d'aide : canton de Vaud (vd.ch).</p></div></div>`;
    return;
  }
  if (O.type === 'chat') {
    const A = S.boot.assistant; const Ch = S.chat;
    const acts = (m) => (m.actions && m.actions.length ? `<div class="chat-acts">${m.actions.map((a) => a.contact
      ? `<button data-action="chat-act" data-contact="${esc(a.contact)}">${I.phone} ${esc(a.label)}</button>`
      : `<button data-action="chat-act" data-goto="${esc(a.goto)}">${esc(a.label)}</button>`).join('')}</div>` : '');
    const started = Ch.messages.some((m) => m.from === 'me');
    overlaysEl.innerHTML = `<div class="overlay chat-wrap${O.anim ? ' anim' : ''}" data-action="overlay-close"><div class="chat-panel" data-stop>
      <header class="chat-head"><span class="chat-av">${I.chat}</span><div><b>${esc(A.name)}</b><span>${esc(A.status)}</span></div>
        <button class="icon-btn" data-action="chat-close" aria-label="Fermer">${I.x}</button></header>
      <button class="chat-sos" data-action="sos">${I.phone} Danger immédiat ? Appeler le 117</button>
      <div class="chat-log" id="chat-log">
        ${Ch.messages.map((m) => `<div class="msg ${m.from}"><p>${esc(m.text)}</p>${acts(m)}</div>`).join('')}
        ${Ch.typing ? '<div class="msg bot typing"><p><i></i><i></i><i></i></p></div>' : ''}
        ${started ? '' : `<div class="chat-sugg">${A.suggestions.map((t) => `<button data-action="chat-suggest" data-text="${esc(t)}">${esc(t)}</button>`).join('')}</div>`}
      </div>
      <div class="chat-compose"><textarea class="chat-input" data-input="chat-text" rows="1" placeholder="Écrivez votre message…">${esc(Ch.text)}</textarea>
        <button class="chat-send" data-action="chat-send" aria-label="Envoyer">${I.send}</button></div>
      <p class="chat-notice">${esc(A.notice)}</p>
    </div></div>`;
    const log = $('#chat-log', overlaysEl); log.scrollTop = log.scrollHeight;
    return;
  }
  if (O.type === 'phrase') {
    overlaysEl.innerHTML = `<div class="overlay dim" data-action="overlay-close"><div class="sheet" data-stop><div class="grip"></div><h3>📖 Apparence Wikipédia</h3>
      <p class="ev-help">L'app ressemblera à Wikipédia. Pour ouvrir Abri, vous taperez un <b>mot secret</b> dans la recherche, puis Entrée.</p>
      <div class="field"><label>Votre mot secret</label><input data-input="phrase" value="${esc(O.phrase)}" placeholder="Ex. : girafe bleue 42" autocomplete="off" autocapitalize="off" spellcheck="false"></div>
      <p class="small muted" style="margin:-4px 0 14px">Choisissez des mots que personne ne chercherait. Au moins 4 lettres ou chiffres. Les majuscules et les accents ne comptent pas.</p>
      <button class="btn primary block big-btn" data-action="phrase-save" ${O.busy ? 'disabled' : ''}>${O.busy ? 'Un instant…' : '✓ Enregistrer'}</button>
      <button class="btn muted block" data-action="settings">Annuler</button></div></div>`;
    return;
  }
  if (O.type === 'confirm') {
    overlaysEl.innerHTML = `<div class="overlay center" data-action="overlay-close"><div class="confirm-box" data-stop><h3>${esc(O.title)}</h3><p>${esc(O.text)}</p>
      <div class="row"><button class="btn muted block" data-action="overlay-close">Annuler</button><button class="btn ${O.danger ? 'danger' : 'primary'} block" data-action="confirm-ok">${esc(O.ok)}</button></div></div></div>`;
    return;
  }
}

// --- Assistant (aperçu) ------------------------------------------------------
// Glisser vers la droite (ou la bulle de l'accueil) ouvre le panneau ; vers la gauche le ferme.
// Les réponses viennent de /api/assistant (logic.assistant_reply) : texte fixe pour l'instant,
// futur point de branchement du modèle d'IA.
function openChat() {
  if (S.mode !== 'app' || !S.boot) return;
  S.overlay = { type: 'chat', anim: true }; renderOverlay(); S.overlay.anim = false;
}
function closeChat() {
  const w = $('.chat-wrap', overlaysEl);
  if (!w) return;
  w.classList.add('closing');
  setTimeout(() => { if (S.overlay && S.overlay.type === 'chat') { S.overlay = null; renderOverlay(); } }, 180);
}
async function chatSend(raw) {
  const Ch = S.chat; const text = String(raw || '').trim();
  if (!text || Ch.typing) return;
  Ch.messages.push({ from: 'me', text }); Ch.text = ''; Ch.typing = true; renderOverlay();
  let reply;
  try {
    const history = Ch.messages.map((m) => ({ from: m.from, text: m.text }));
    // petit délai : le temps de lecture d'une vraie réponse, pour que l'aperçu soit crédible
    [reply] = await Promise.all([api('/api/assistant', { method: 'POST', body: { messages: history } }), new Promise((r) => setTimeout(r, 900))]);
  } catch (e) {
    reply = { text: 'Connexion impossible pour le moment. Vous pouvez appeler le 142 à tout moment.', actions: [{ label: 'Appeler le 142', contact: 'victimes142' }] };
  }
  Ch.typing = false; Ch.messages.push({ from: 'bot', text: reply.text, actions: reply.actions || [] });
  if (S.overlay && S.overlay.type === 'chat') { renderOverlay(); if (!isTouch()) $('.chat-input', overlaysEl)?.focus(); }
}

function openCall(contactId, sos = false) {
  const c = S.boot.contacts.find((x) => x.id === contactId); if (!c) return;
  S.overlay = { type: 'call', contact: c, sos }; renderOverlay();
}
function openSms(contactId) {
  const c = S.boot.contacts.find((x) => x.id === contactId); if (!c) return;
  S.overlay = { type: 'sms', contact: c, text: 'Bonjour, j\'ai besoin d\'aide. Pouvez-vous me rappeler à un moment discret ? Merci de ne pas laisser de message vocal.' };
  renderOverlay();
}
function confirmBox(title, text, ok, onOk, danger = false) {
  S.overlay = { type: 'confirm', title, text, ok, onOk, danger }; renderOverlay();
}

// ===========================================================================
// 6. ACTIONS (délégation d'événements)
// ===========================================================================
const actions = {
  // — configuration
  'setup-next': () => { S.setup.step++; render(); },
  'setup-prev': () => { S.setup.step--; render(); },
  'setup-cancel': () => { S.setup.fromSettings = false; S.setup.step = 0; S.mode = 'app'; render(); },
  'setup-pick': (d) => { S.setup.recipe = d.id; render(); },
  'setup-inc': () => { S.setup.persons = Math.min(S.personsMax, S.setup.persons + 1); render(); },
  'setup-dec': () => { S.setup.persons = Math.max(S.personsMin, S.setup.persons - 1); render(); },
  'setup-finish': setupFinish,
  // — page Wikipédia
  'wiki-menu': () => { S.wiki.menu = !S.wiki.menu; render(); },
  'wiki-search': () => { Object.assign(S.wiki, { menu: false, search: true, q: '', results: [], searched: '' }); render(); },
  'wiki-search-close': () => { S.wiki.search = false; render(); },
  'wiki-go': (d) => wikiOpen(d.id),
  'wiki-random': wikiRandom,
  'wiki-sec': (d) => { S.wiki.open[d.i] = !S.wiki.open[d.i]; render(); },
  // — app de cuisine
  'cover-tab': (d) => { S.cover.tab = d.tab; S.cover.recipe = null; S.cover.confirmClear = false; render(); },
  'cover-cat': (d) => { S.cover.cat = d.cat; render(); },
  'cover-open': (d) => { const r = findRecipe(d.id); if (!r) return; S.cover.recipe = r; S.cover.persons = S.cover.adapted = r.base_servings; render(); $('.content', screen).scrollTop = 0; },
  'cover-back': () => { S.cover.recipe = null; render(); },
  'cover-fav': (d) => { const f = S.cover.favs; f.has(d.id) ? f.delete(d.id) : f.add(d.id); render(); },
  'persons-inc': () => { S.cover.persons = Math.min(S.personsMax, S.cover.persons + 1); render(); },
  'persons-dec': () => { S.cover.persons = Math.max(S.personsMin, S.cover.persons - 1); render(); },
  'adapt': adaptRecipe,
  'add-cart': (d) => { const r = findRecipe(d.id); if (!r) return;
    S.cover.cart.push(...scaleIngredients(r, S.cover.adapted).map((i) => ({ ...i, done: false }))); toast('Ingrédients ajoutés à la liste'); },
  'cart-check': (d) => { S.cover.cart[+d.n].done = !S.cover.cart[+d.n].done; render(); },
  'cart-clear': () => { S.cover.confirmClear = true; render(); },
  'cart-clear-cancel': () => { S.cover.confirmClear = false; render(); },
  'cart-clear-confirm': () => { S.cover.cart = []; S.cover.confirmClear = false; render(); toast('Liste de courses vidée'); },
  'cart-remove-done': () => { const n = S.cover.cart.filter((i) => i.done).length;
    S.cover.cart = S.cover.cart.filter((i) => !i.done); render(); toast(`${n} article${n > 1 ? 's' : ''} retiré${n > 1 ? 's' : ''}`); },
  'profile-toggle': (d) => { S.cover.profile[d.k] = !S.cover.profile[d.k]; render(); },
  // — espace protégé
  'tab': (d) => { S.tab = d.tab; render(); },
  'office-show': (d) => selectOffice(d.id, true),
  'office-close': () => { S.home.selected = null; S.home.refit = true; render(); },
  'office-list': () => { S.home.list = !S.home.list; render(); },
  'call-office': (d) => openOfficeCall(d.id),
  'quick-exit': () => lock(true),
  'settings': () => { S.overlay = { type: 'settings' }; renderOverlay(); },
  'settings-change': () => { S.overlay = null; S.setup = { step: 0, recipe: S.boot.config.recipe_id, persons: S.boot.config.persons, fromSettings: true }; S.mode = 'setup'; render(); },
  // Placeholder : la préférence est mémorisée mais n'active aucune fonctionnalité (voir logic.FEATURES)
  'front-set': async (d) => {
    if (d.front === S.front) return;
    if (d.front === 'wiki') { S.overlay = { type: 'phrase', phrase: '', busy: false }; renderOverlay(); return; }
    try { S.front = (await api('/api/app/front', { method: 'POST', body: { front: d.front } })).front; }
    catch (e) { toast(e.message); return; }
    setIdentity(); renderOverlay(); toast('✓ En quittant Abri, l\'app ressemblera aux recettes');
  },
  'phrase-edit': () => { S.overlay = { type: 'phrase', phrase: '', busy: false }; renderOverlay(); },
  'phrase-save': async () => {
    const O = S.overlay;
    if (norm(O.phrase).replace(/ /g, '').length < 4) { toast('Au moins 4 lettres ou chiffres'); return; }
    O.busy = true; renderOverlay();
    try { S.front = (await api('/api/app/front', { method: 'POST', body: { front: 'wiki', phrase: O.phrase } })).front; }
    catch (e) { O.busy = false; renderOverlay(); toast(e.message); return; }
    S.overlay = { type: 'settings' }; setIdentity(); renderOverlay();
    toast('✓ Enregistré. En quittant Abri, l\'app ressemblera à Wikipédia');
  },
  'pref-toggle': async (d) => {
    const on = !S.boot.prefs[d.key];
    try { S.boot.prefs = (await api('/api/app/pref', { method: 'POST', body: { key: d.key, value: on } })).prefs; }
    catch (e) { toast(e.message); return; }
    renderOverlay();
    toast(on ? 'Enregistré — fonctionnalité pas encore disponible' : 'Désactivé');
  },
  'reset-ask': () => confirmBox('Réinitialiser la démo ?', 'Le code secret, les preuves, le journal et les résultats seront effacés. L\'application repartira du premier lancement.', 'Tout effacer', async () => {
    try { await api('/api/app/reset', { method: 'POST' }); } catch (e) { /* le jeton est déjà invalide */ }
    S.token = null; S.boot = null; S.overlay = null; S.front = 'recettes'; S.setup = { step: 0, recipe: null, persons: 4, fromSettings: false };
    S.mode = 'setup'; render(); toast('Démo réinitialisée'); }, true),
  'chat-open': openChat,
  'chat-close': closeChat,
  'chat-send': () => chatSend(S.chat.text),
  'chat-suggest': (d) => chatSend(d.text),
  'chat-act': (d) => {
    S.overlay = null; renderOverlay();
    if (d.contact) openCall(d.contact); else if (d.goto) { S.tab = d.goto; render(); }
  },
  'confirm-ok': () => { const fn = S.overlay && S.overlay.onOk; S.overlay = null; renderOverlay(); if (fn) fn(); },
  'overlay-close': () => { S.overlay = null; renderOverlay(); },
  'sos': () => openCall('police', true),
  'call': (d) => openCall(d.id),
  'sms': (d) => openSms(d.id),
  'sms-send': () => { S.overlay = null; renderOverlay(); toast('Message envoyé ✓'); },
  'hangup': () => { S.overlay = null; renderOverlay(); },
  'web': (d) => confirmBox('Ouvrir le site ?', 'Il s\'ouvrira dans le navigateur discret de l\'application, sans historique.', 'Ouvrir', () => window.open(d.url, '_blank', 'noopener')),
  // — questionnaire
  'quiz-start': () => { S.quiz = { ...S.quiz, stage: 'questions', i: 0, answers: {}, situation: {}, si: 0 }; render(); },
  'quiz-show-result': () => { S.quiz.stage = 'result'; render(); },
  'quiz-restart': () => { S.quiz = { ...S.quiz, stage: 'intro' }; render(); },
  'answer': (d) => { const list = allQuestions(); const cur = list[S.quiz.i]; S.quiz.answers[cur.id] = d.v === '1'; render();
    setTimeout(() => { if (S.quiz.i < list.length - 1) S.quiz.i++; else S.quiz.stage = 'situation'; render(); }, 160); },
  'quiz-skip': () => { const list = allQuestions(); if (S.quiz.i < list.length - 1) S.quiz.i++; else S.quiz.stage = 'situation'; render(); },
  'quiz-prev': () => { if (S.quiz.i > 0) S.quiz.i--; else S.quiz.stage = 'intro'; render(); },
  'sit-answer': (d) => { const list = S.boot.questionnaire.situation; const cur = list[S.quiz.si]; S.quiz.situation[cur.id] = d.v === '1'; render();
    setTimeout(() => { if (S.quiz.si < list.length - 1) { S.quiz.si++; render(); } else quizEvaluate(); }, 160); },
  'sit-skip': () => { const list = S.boot.questionnaire.situation; if (S.quiz.si < list.length - 1) { S.quiz.si++; render(); } else quizEvaluate(); },
  'sit-prev': () => { if (S.quiz.si > 0) S.quiz.si--; else { S.quiz.stage = 'questions'; S.quiz.i = allQuestions().length - 1; } render(); },
  'act': (d) => { if (d.contact) { if (d.contact === 'vqf' || d.contact === 'withyou') { const c = S.boot.contacts.find((x) => x.id === d.contact); actions.web({ url: c.web }); } else openCall(d.contact); } else actions.goto(d); },
  'goto': (d) => {
    if (d.goto === 'sos') return openCall('police', true);
    if (d.goto === 'location') { S.tab = 'loc'; render(); return; }
    if (d.goto === 'evidence') { S.tab = 'ev'; S.ev.sub = 'pieces'; S.ev.catPreset = d.cat || null; render(); if (d.cat) $('#ev-drop input', screen).click(); return; }
    if (d.goto === 'journal') { S.tab = 'ev'; S.ev.sub = 'journal'; render(); return; }
    if (d.goto === 'dossier') { const el = $('#dossier', screen); if (el) el.scrollIntoView({ behavior: 'smooth' }); }
  },
  // — localisation
  'scan': startScan,
  'loc-platform': (d) => { S.loc.platform = d.platform; render(); },
  'audit-open': (d) => { S.loc.open[d.item] = !S.loc.open[d.item]; render(); },
  'audit-toggle': (d) => toggleAudit(d.item),
  'audit-goto': (d) => { S.loc.open[d.item] = true; render(); const el = $(`#audit-${d.item}`, screen); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); },
  // — coffre
  'ev-sub': (d) => { S.ev.sub = d.sub; render(); },
  'ev-cat': (d) => { if (S.ev.busy === false) { S.ev.cat = d.cat; renderOverlay(); } },
  'ev-submit': submitEvidence,
  'ev-del': (d) => confirmBox('Supprimer ce fichier ?', 'Il sera supprimé définitivement du coffre.', 'Supprimer', async () => {
    try { await api(`/api/evidence/${d.id}`, { method: 'DELETE' }); await refreshEvidence(); render(); } catch (e) { toast(e.message); } }, true),
  'ev-export': () => { const a = document.createElement('a'); a.href = `/api/evidence/export?t=${encodeURIComponent(S.token)}`; a.download = ''; document.body.appendChild(a); a.click(); a.remove(); toast('Téléchargement du dossier lancé'); },
  'journal-add': submitJournal,
  'journal-del': (d) => confirmBox('Supprimer cette entrée ?', 'Elle sera supprimée définitivement du journal.', 'Supprimer', async () => {
    try { await api(`/api/journal/${d.id}`, { method: 'DELETE' }); await refreshEvidence(); render(); } catch (e) { toast(e.message); } }, true),
  // — contacts
  'axis-toggle': (d) => { S.contacts.open[d.axis] = S.contacts.open[d.axis] === false; render(); },
};

const inputs = {
  'wiki-q': (el) => { S.wiki.q = el.value; clearTimeout(wikiTimer);
    if (!norm(el.value)) { S.wiki.results = []; paintWikiResults(); return; }
    wikiTimer = setTimeout(() => wikiSearch(el.value), 200); },
  'phrase': (el) => { if (S.overlay) S.overlay.phrase = el.value; },
  'chat-text': (el) => { S.chat.text = el.value; el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 110)}px`; },
  'cover-search': (el) => { S.cover.query = el.value; refreshGrid(); },
  'persons': (el) => { const v = parseInt(el.value, 10); if (!isNaN(v)) { S.cover.persons = Math.max(S.personsMin, Math.min(S.personsMax, v)); } },
  'jtext': (el) => { S.ev.jtext = el.value; },
  'jdate': (el) => { S.ev.jdate = el.value; },
  'sms-text': (el) => { if (S.overlay) S.overlay.text = el.value; },
  'ev-note': (el) => { S.ev.note = el.value; },
  // un champ fichier déclenche « input » puis « change » : on vide le champ après lecture
  'ev-file': (el) => { if (!el.files.length) return; const list = [...el.files]; el.value = ''; openEvidenceSheet(list); },
};

function onClick(e) {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  // un clic à l'intérieur d'une feuille (data-stop) ne doit pas fermer la superposition
  if (el.dataset.action === 'overlay-close' && e.target.closest('[data-stop]')) return;
  const fn = actions[el.dataset.action];
  if (fn) { if (el.tagName !== 'INPUT') e.preventDefault(); fn(el.dataset, el); }
}
function onInput(e) {
  const el = e.target.closest('[data-input]'); if (!el) return;
  const fn = inputs[el.dataset.input]; if (fn) fn(el);
}
screen.addEventListener('click', onClick);
overlaysEl.addEventListener('click', onClick);
screen.addEventListener('input', onInput);
overlaysEl.addEventListener('input', onInput);
overlaysEl.addEventListener('change', onInput);
['click', 'keydown', 'touchstart', 'input'].forEach((ev) => document.addEventListener(ev, () => { if (S.mode === 'app') resetIdle(); }, { passive: true }));
// Assistant : Entrée envoie (Maj+Entrée = nouvelle ligne)
overlaysEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && e.target.matches('.chat-input')) { e.preventDefault(); chatSend(e.target.value); }
});
// Abri : glisser vers la droite ouvre l'assistant, vers la gauche le referme.
// Doigt (téléphone) ou souris (démo sur ordinateur) ; pas sur la carte ni dans un champ.
let swipe = null;
function swipeStart(x, y, target) {
  swipe = S.mode === 'app' && !target.closest('.office-map-slot, .leaflet-container, input, textarea, select, .dropzone')
    ? { x, y, t: Date.now() } : null;
}
function swipeEnd(x, y) {
  if (!swipe) return;
  const dx = x - swipe.x; const dy = y - swipe.y; const dt = Date.now() - swipe.t; swipe = null;
  if (dt > 800 || Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.6) return;
  const chatOpen = S.overlay && S.overlay.type === 'chat';
  if (dx > 0 && !S.overlay) openChat();
  else if (dx < 0 && chatOpen) closeChat();
}
phoneEl.addEventListener('touchstart', (e) => { const t = e.touches[0]; swipeStart(t.clientX, t.clientY, e.target); }, { passive: true });
phoneEl.addEventListener('touchend', (e) => { const t = e.changedTouches[0]; swipeEnd(t.clientX, t.clientY); }, { passive: true });
phoneEl.addEventListener('mousedown', (e) => swipeStart(e.clientX, e.clientY, e.target));
phoneEl.addEventListener('mouseup', (e) => swipeEnd(e.clientX, e.clientY));
// Coffre : glisser-déposer des fichiers sur la zone d'ajout
screen.addEventListener('dragover', (e) => { const z = e.target.closest('#ev-drop'); if (!z) return; e.preventDefault(); z.classList.add('over'); });
screen.addEventListener('dragleave', (e) => { const z = e.target.closest('#ev-drop'); if (z && !z.contains(e.relatedTarget)) z.classList.remove('over'); });
screen.addEventListener('drop', (e) => { const z = e.target.closest('#ev-drop'); if (!z) return; e.preventDefault(); z.classList.remove('over');
  if (e.dataTransfer.files.length) openEvidenceSheet(e.dataTransfer.files); });
// Recherche Wikipédia : Entrée valide (article, ou Abri si c'est le mot secret)
screen.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || !e.target.matches('.wk-input')) return;
  e.preventDefault(); wikiSubmit(e.target.value);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if (S.overlay) { S.overlay = null; renderOverlay(); } else if (S.mode === 'app') lock(true); }
});

// ===========================================================================
// 7. DÉMARRAGE
// ===========================================================================
async function boot() {
  tickClock(); setInterval(tickClock, 30000);
  try {
    const [rec, st] = await Promise.all([api('/api/cover/recipes'), api('/api/setup/status')]);
    S.recipes = rec.recipes; S.daily = rec.daily; S.categories = rec.categories;
    S.personsMin = st.persons_min; S.personsMax = st.persons_max;
    S.front = st.front || 'recettes';
    S.mode = !st.configured ? 'setup' : S.front === 'wiki' ? 'wiki' : 'cover';
  } catch (e) {
    screen.innerHTML = `<div class="empty">Impossible de joindre le serveur.<br><span class="small">Lancez <code>python app.py</code></span></div>`;
    return;
  }
  if (S.mode === 'wiki') wikiOpen(WIKI_HOME); else render();
}
boot();
