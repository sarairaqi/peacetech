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
  quick: false,                   // ouverture rapide « Face ID » activée (Réglages d'Abri)
  home: { open: {} },             // accueil : domaines de contacts dépliés
  quiz: { stage: 'intro', i: 0, answers: {}, situation: {}, si: 0, result: null, busy: false },
  loc: { scanning: false, scanStep: 0, scan: null, open: {}, groups: {}, platform: 'iphone', selected: null, focus: null, refit: false },
  ev: { sub: 'pieces', cat: null, step: 'type', files: null, previews: null, note: '', jtext: '', jdate: '', busy: false },
  chat: { messages: [], text: '', typing: false },   // assistant (aperçu) : en mémoire, effacé au verrouillage
  overlay: null,
};
let idleTimer = null;
let callTimer = null;

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Langues (voir i18n/ côté serveur) : t(« texte français ») donne la traduction dans la langue choisie,
// ou le texte français s'il n'est pas traduit. {n}, {app}… sont remplacés par les valeurs données.
// tn(n, singulier, pluriel) choisit la forme selon la langue. La page reçoit la langue au chargement
// (window.I18N, voir templates/index.html) ; « lang-set » en change sans recharger la page.
let L10N = window.I18N || { lang: 'fr', locale: 'fr-CH', langs: [], ui: {}, wiki: { site: 'fr', home: 'Lac Léman', brand: 'Wikipédia', tagline: 'L\'encyclopédie libre' } };
const t = (s, vars) => { const out = L10N.ui[s] || s; return vars ? out.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : out; };
const tn = (n, one, many, vars = {}) => t(new Intl.PluralRules(L10N.locale).select(n) === 'one' ? one : many, { n, ...vars });
function applyLang(p) {
  L10N = p;
  document.documentElement.lang = p.lang;
  WIKI_HOME = p.wiki.home; WIKI_ARTICLES = WIKI_OFFLINE[p.lang] || WIKI_OFFLINE.fr;   // static/wiki.js
}
// Choix de la langue : les mêmes boutons dans le profil des recettes, l'accueil et les Réglages d'Abri
const langButtons = (cls) => `<div class="${cls}">${L10N.langs.map((l) => `<button class="${l.code === L10N.lang ? 'on' : ''}" data-action="lang-set" data-lang="${esc(l.code)}" lang="${esc(l.code)}">${esc(l.name)}</button>`).join('')}</div>`;
const grad = (r) => `linear-gradient(135deg, ${r.gradient[0]}, ${r.gradient[1]})`;
const fmtDate = (iso) => { const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleString(L10N.locale, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };
// « lundi 22 septembre à 21:30 » : plus facile à lire qu'une date en chiffres
const fmtDay = (iso) => { const d = new Date(iso); if (isNaN(d)) return iso;
  return d.toLocaleString(L10N.locale, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
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
  if (!res.ok) throw new Error(data.error || t('Erreur {n}', { n: res.status }));
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
  if (S.mode === 'app' && S.tab === 'loc') mountMap();
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
  const brand = L10N.wiki.brand;
  document.title = !wiki ? 'Petits Plats' : S.mode === 'wiki' && S.wiki.page ? `${S.wiki.page.title} — ${brand}` : brand;
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
  + '.mw-kartographer-map, .coordinates, #coordinates, .toc, .ambox, .sistersitebox, .mw-references-wrap, .reflist';
// Espaces de noms (fichiers, catégories, modèles…) dans les langues du miroir : liens non suivis
const WK_NS = new RegExp('^(Fichier|File|Image|Média|Aide|Help|Catégorie|Category|Portail|Portal|Modèle|Template|Wikipédia|Wikipedia|Spécial|Special|Projet|'
  + 'Discussion|Talk|Utilisateur|User|Module|Référence|Archivo|Categoría|Plantilla|Ayuda|Especial|Usuario|Anexo|Ficheiro|Arquivo|Categoria|'
  + 'Predefinição|Ajuda|Utilizador|Usuário|Skeda|Kategoria|Stampa|Ndihmë|Speciale|Përdoruesi|Datei|Kategorie|Vorlage|Hilfe|Spezial|Benutzer|Diskussion)\\s*:', 'i');
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
      lead: `<p>${status === 404 ? t('Cette page n\'existe pas.') : t('Impossible de charger la page. Vérifiez votre connexion Internet.')}</p>` };
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
  if (!W.results.length) return norm(W.searched) && norm(W.searched) === norm(W.q) ? `<p class="wk-none">${t('Aucun résultat pour « {q} »', { q: esc(W.q.trim()) })}</p>` : '';
  return W.results.map((r) => `<button class="wk-result" data-action="wiki-go" data-id="${esc(r.title)}"><b>${esc(r.title)}</b><span>${esc(r.desc)}</span></button>`).join('');
}
function paintWikiResults() { const el = $('#wk-results', screen); if (el) el.innerHTML = wikiResultsHtml(); }

function renderWiki() {
  const W = S.wiki;
  if (W.search) {
    return `<div class="wk"><header class="wk-bar wk-searchbar"><button class="wk-icon" data-action="wiki-search-close" aria-label="${t('Retour')}">${WI.back}</button>
      <input class="wk-input" data-input="wiki-q" type="search" placeholder="${t('Rechercher sur Wikipédia')}" value="${esc(W.q)}" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search"></header>
      <div class="content wk-results" id="wk-results">${wikiResultsHtml()}</div></div>`;
  }
  const a = W.page;
  return `<div class="wk">
    <header class="wk-bar"><button class="wk-icon" data-action="wiki-menu" aria-label="${t('Menu')}">${WI.menu}</button>
      <span class="wk-brand">${esc(L10N.wiki.brand)}<small>${esc(L10N.wiki.tagline)}</small></span>
      <button class="wk-icon" data-action="wiki-search" aria-label="${t('Rechercher')}">${WI.search}</button></header>
    ${W.menu ? `<div class="wk-drawer-bg" data-action="wiki-menu"></div><nav class="wk-drawer">
      <button data-action="wiki-go" data-id="${esc(WIKI_HOME)}">${t('Accueil')}</button><button data-action="wiki-random">${t('Au hasard')}</button><button data-action="wiki-search">${t('Rechercher')}</button></nav>` : ''}
    <div class="content wk-page">
      <h1 class="wk-title${W.title === WIKI_HOME ? ' wk-home' : ''}">${esc(a ? a.title : W.title)}</h1>
      <div class="wk-tabs"><span class="on">${t('Article')}</span><span>${t('Discussion')}</span><span class="wk-tools">${WI.lang}${WI.star}${WI.edit}</span></div>
      ${!a ? '<div class="wk-loading"><i></i><i></i><i></i><i></i></div>' : `
      <div class="wk-lead">${a.lead}</div>
      ${a.sections.map((x, i) => `<section class="wk-sec${W.open[i] ? ' open' : ''}"><h2 data-action="wiki-sec" data-i="${i}">${WI.chev}${esc(x.h)}</h2>${W.open[i] ? `<div class="wk-sec-body">${x.html}</div>` : ''}</section>`).join('')}
      <footer class="wk-foot">${t('Le contenu est disponible sous licence CC BY-SA 4.0 sauf mention contraire.')}</footer>`}
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
// Astuce commune aux deux accueils : l'ouverture rapide par appui long
const quickTip = (where) => `<div class="how tip"><div class="n">${LI.faceid}</div><p>${t('<b>Astuce :</b> activez « Ouverture rapide » dans les Réglages d\'{app}. Ensuite, {where} ouvre {app} avec Face ID, sans code.', { app: APP_NAME, where })}</p></div>`;

function renderSetup() {
  const st = S.setup;
  if (st.kind === 'wiki') return renderWikiSetup();
  const dots = `<div class="dots">${[0, 1, 2, 3].map((n) => `<i class="${n === st.step ? 'on' : ''}"></i>`).join('')}</div>`;
  if (st.step === 0) {
    return `<div class="setup fade-in">
      ${st.fromSettings ? '' : langButtons('lang-chips')}
      <div class="logo">${LOGO}</div>
      <h1>${st.fromSettings ? t('Modifier votre accès discret') : t('Bienvenue dans Abri')}</h1>
      <p class="lead">${t('Abri se cache derrière une application de cuisine ordinaire, « Petits Plats ». Personne ne peut deviner que l\'espace protégé existe.')}</p>
      <div class="how"><div class="n">1</div><p>${t('Choisissez une <b>recette secrète</b> et un <b>nombre secret de personnes</b>.')}</p></div>
      <div class="how"><div class="n">2</div><p>${t('Pour entrer : ouvrez la recette, tapez le nombre, appuyez sur <b>Adapter les quantités</b>.')}</p></div>
      <div class="how"><div class="n">3</div><p>${t('Une mauvaise combinaison adapte simplement la recette : aucune erreur, aucune trace.')}</p></div>
      <div class="grow"></div>
      <button class="btn primary block" data-action="setup-next">${st.fromSettings ? t('Continuer') : t('Commencer')}</button>
      ${st.fromSettings ? `<button class="btn muted block" style="margin-top:10px" data-action="setup-cancel">${t('Annuler')}</button>` : ''}
      ${dots}</div>`;
  }
  if (st.step === 1) {
    return `<div class="setup fade-in">
      <button class="icon-btn" data-action="setup-prev">${I.back}</button>
      <h2>${t('Votre recette secrète')}</h2>
      <p class="lead">${t('Choisissez une recette que vous n\'ouvrirez pas par hasard devant quelqu\'un.')}</p>
      <div class="pick-grid">${S.recipes.map((r) => `<button class="pick ${st.recipe === r.id ? 'on' : ''}" data-action="setup-pick" data-id="${r.id}"><div class="em">${r.emoji}</div><div class="nm">${esc(r.name)}</div></button>`).join('')}</div>
      <div class="grow"></div>
      <button class="btn primary block" data-action="setup-next" ${st.recipe ? '' : 'disabled'}>${t('Suivant')}</button>
      ${dots}</div>`;
  }
  if (st.step === 2) {
    return `<div class="setup fade-in">
      <button class="icon-btn" data-action="setup-prev">${I.back}</button>
      <h2>${t('Votre nombre secret')}</h2>
      <p class="lead">${t('Le nombre de personnes à saisir pour ouvrir l\'espace protégé. Évitez la taille réelle de votre foyer.')}</p>
      <div class="bignum"><button data-action="setup-dec">−</button><div class="val">${st.persons}</div><button data-action="setup-inc">+</button></div>
      <p class="lead" style="text-align:center">${tn(st.persons, 'personne', 'personnes')}</p>
      <div class="grow"></div>
      <button class="btn primary block" data-action="setup-next">${t('Suivant')}</button>
      ${dots}</div>`;
  }
  const r = S.recipes.find((x) => x.id === st.recipe);
  return `<div class="setup fade-in">
    <button class="icon-btn" data-action="setup-prev">${I.back}</button>
    <h2>${t('Retenez votre code')}</h2>
    <p class="lead">${t('Il ne sera plus affiché en clair, sauf dans les réglages de l\'espace protégé.')}</p>
    <div class="secret-card"><div class="em">${r.emoji}</div><div class="l1">${esc(r.name)}</div><div class="l2">${tn(st.persons, 'pour {n} personne', 'pour {n} personnes')}</div></div>
    <div class="how"><div class="n">${LI.home}</div><p>${t('Ouvrir « Petits Plats » → <b>{recipe}</b> → saisir <b>{n}</b> → <b>Adapter les quantités</b>.', { recipe: esc(r.name), n: st.persons })}</p></div>
    ${quickTip(t('dans l\'onglet <b>Favoris</b>, garder le doigt appuyé sur <b>n\'importe quelle recette</b>'))}
    <div class="grow"></div>
    <button class="btn primary block" data-action="setup-finish">${st.fromSettings ? t('Enregistrer') : t('C\'est compris, terminer')}</button>
    ${dots}</div>`;
}

// Accueil de l'apparence Wikipédia (depuis les Réglages d'Abri) : explication, mot secret, rappel.
// activate=false : on change seulement le mot, l'apparence reste celle d'aujourd'hui.
function renderWikiSetup() {
  const st = S.setup;
  const dots = `<div class="dots">${[0, 1, 2].map((n) => `<i class="${n === st.step ? 'on' : ''}"></i>`).join('')}</div>`;
  const cancel = `<button class="btn muted block" style="margin-top:10px" data-action="wsetup-cancel">${t('Annuler')}</button>`;
  if (st.step === 0) {
    return `<div class="setup fade-in">
      <div class="logo wiki-logo">${LI.wiki}</div>
      <h1>${t('Apparence Wikipédia')}</h1>
      <p class="lead">${t('En quittant {app}, l\'app ressemblera à Wikipédia, avec de vrais articles. Personne ne peut deviner que l\'espace protégé existe.', { app: APP_NAME })}</p>
      <div class="how"><div class="n">1</div><p>${t('Choisissez un <b>mot secret</b>.')}</p></div>
      <div class="how"><div class="n">2</div><p>${t('Pour entrer : touchez la <b>loupe</b>, tapez le mot, puis <b>Entrée</b>.')}</p></div>
      <div class="how"><div class="n">3</div><p>${t('Un autre mot lance une recherche normale : aucune erreur, aucune trace.')}</p></div>
      <div class="grow"></div>
      <button class="btn primary block" data-action="setup-next">${t('Continuer')}</button>${cancel}${dots}</div>`;
  }
  if (st.step === 1) {
    return `<div class="setup fade-in">
      <button class="icon-btn" data-action="${st.fromSettings ? 'wsetup-cancel' : 'setup-prev'}">${LI.back}</button>
      <h2>${t('Votre mot secret')}</h2>
      <p class="lead">${t('Des mots que personne ne chercherait sur Wikipédia, et que vous retiendrez facilement.')}</p>
      <div class="field"><input class="word-input" data-input="wsetup-word" value="${esc(st.word)}" placeholder="${t('Ex. : girafe bleue 42')}" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="next"></div>
      <p class="small muted" style="margin:0">${t('Au moins 4 lettres ou chiffres. Les majuscules et les accents ne comptent pas.')}</p>
      <div class="grow"></div>
      <button class="btn primary block" data-action="wsetup-check">${t('Suivant')}</button>${dots}</div>`;
  }
  return `<div class="setup fade-in">
    <button class="icon-btn" data-action="setup-prev">${LI.back}</button>
    <h2>${t('Retenez votre mot')}</h2>
    <p class="lead">${t('Il reste visible dans les Réglages d\'{app}, et nulle part ailleurs.', { app: APP_NAME })}</p>
    <div class="secret-card"><div class="em wk-em">${LI.search}</div><div class="l1">${esc(st.word.trim())}</div><div class="l2">${t('dans la recherche de Wikipédia')}</div></div>
    <div class="how"><div class="n">${LI.wiki}</div><p>${t('Ouvrir l\'app → <b>loupe</b> → taper <b>{word}</b> → <b>Entrée</b>.', { word: esc(st.word.trim()) })}</p></div>
    ${quickTip(t('sur l\'accueil de Wikipédia, garder le doigt appuyé sur <b>le titre de l\'article</b>'))}
    <div class="grow"></div>
    <button class="btn primary block" data-action="wsetup-finish" ${st.busy ? 'disabled' : ''}>${st.busy ? t('Un instant…') : st.activate ? t('Utiliser l\'apparence Wikipédia') : t('Enregistrer le mot')}</button>
    ${dots}</div>`;
}

function startWikiSetup(activate) {
  S.overlay = null; renderOverlay();
  S.setup = { kind: 'wiki', step: activate ? 0 : 1, word: '', activate, fromSettings: !activate, busy: false };
  S.mode = 'setup'; render();
}

async function wikiSetupFinish() {
  const st = S.setup; st.busy = true; render();
  try {
    S.front = (await api('/api/app/front', { method: 'POST', body: { front: 'wiki', phrase: st.word, activate: st.activate } })).front;
    S.boot = await api('/api/app/bootstrap');
  } catch (e) { st.busy = false; render(); toast(e.message); return; }
  const activate = st.activate;
  S.setup = { step: 0, recipe: null, persons: 4, fromSettings: false };
  S.mode = 'app'; setIdentity(); render();
  S.overlay = { type: 'settings' }; renderOverlay();
  toast(activate ? t('✓ En quittant, l\'app ressemblera à Wikipédia') : t('✓ Mot secret enregistré'));
}

async function setupFinish() {
  const st = S.setup;
  try {
    await api('/api/setup', { method: 'POST', body: { recipe_id: st.recipe, persons: st.persons } });
  } catch (e) { toast(e.message); return; }
  if (st.fromSettings) {
    S.mode = 'app';
    S.boot = await api('/api/app/bootstrap');
    toast(t('Accès secret modifié'));
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
  const featHtml = !q && c.cat === 'Tous' ? S.daily.map((r) => `<button class="feature-card" data-action="cover-open" data-id="${esc(r.id)}"><span class="em">${esc(r.emoji)}</span><span><span class="muted small">${t('Recette du jour')}</span><b>${esc(r.name)}</b><span class="muted small">${recipeMeta(r)}</span></span></button>`).join('') : '';
  const empty = `<div class="empty" style="grid-column:1/-1"><div class="em">🥄</div>${t('Aucune recette ne correspond')}</div>`;
  return featHtml + (list.length ? list.map(recipeCard).join('') : empty);
}

// Met à jour la seule grille (garde le focus du champ de recherche pendant la saisie)
function refreshGrid() { const g = $('#recipe-grid', screen); if (g) g.innerHTML = coverGrid(); }

function coverHome() {
  const c = S.cover;
  return `<div class="content">
    <div class="cover-hero"><div class="greet">${t('Bonjour')} 👋</div><h1>${t('Qu\'est-ce qu\'on cuisine aujourd\'hui ?')}</h1>
      <label class="search">${I.search}<input data-input="cover-search" placeholder="${t('Rechercher une recette, un ingrédient…')}" value="${esc(c.query)}"></label></div>
    <div class="chips">${S.categories.map((cat) => `<button class="chip ${cat === c.cat ? 'active' : ''}" data-action="cover-cat" data-cat="${esc(cat)}">${esc(t(cat))}</button>`).join('')}</div>
    <div class="recipe-grid" id="recipe-grid">${coverGrid()}</div>
  </div>`;
}

const ingredientItems = (r) => scaleIngredients(r, S.cover.adapted)
  .map((i) => `<li><span>${esc(i.name)}</span><span class="q">${esc(`${i.qty} ${i.unit}`.trim())}</span></li>`).join('');

// Après « Adapter les quantités » : seule la liste change (le champ garde sa saisie et son focus)
function refreshIngredients() {
  const r = S.cover.recipe; if (!r) return;
  const list = $('#ing-list', screen); if (list) list.innerHTML = ingredientItems(r);
  const title = $('#ing-title', screen); if (title) title.textContent = t('Ingrédients · {n} pers.', { n: S.cover.adapted });
}

function coverRecipe(r) {
  const c = S.cover;
  const fav = c.favs.has(r.id);
  const pills = `<span class="pill">⏱ ${esc(r.time)}</span><span class="pill">👩‍🍳 ${esc(r.difficulty)}</span>`;
  return `<div class="content">
    <div class="recipe-hero" style="background:${esc(grad(r))}">${esc(r.emoji)}<button class="back" data-action="cover-back">${I.back}</button>
      <button class="fav ${fav ? 'on' : ''}" style="position:absolute;top:8px;right:16px;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.85);color:#c24e2a;display:flex;align-items:center;justify-content:center" data-action="cover-fav" data-id="${esc(r.id)}">${I.heart}</button></div>
    <div class="recipe-title">${esc(r.name)}</div>
    <div class="meta-pills">${pills}${r.region ? `<span class="pill">📍 ${esc(r.region)}</span>` : ''}<span class="pill">🍽 ${esc(t(r.category))}</span></div>
    <div class="card"><div class="servings"><div><b>${t('Pour combien de personnes ?')}</b><div class="muted small">${t('Choisissez le nombre, puis adaptez les quantités')}</div></div>
      <div class="stepper"><button data-action="persons-dec">−</button><input type="number" inputmode="numeric" min="${S.personsMin}" max="${S.personsMax}" value="${c.persons}" data-input="persons"><button data-action="persons-inc">+</button></div></div>
      <button class="btn primary block" style="margin-top:12px" data-action="adapt">${t('Adapter les quantités')}</button></div>
    <div class="section-title" id="ing-title">${t('Ingrédients · {n} pers.', { n: c.adapted })}</div>
    <div class="card"><ul class="ingredients" id="ing-list">${ingredientItems(r)}</ul></div>
    <div class="section-title">${t('Préparation')}</div>
    <div class="card"><ol class="steps">${r.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>
    <button class="btn ghost block" data-action="add-cart" data-id="${esc(r.id)}">${I.cart} ${t('Ajouter à la liste de courses')}</button>  </div>`;
}

function coverFavs() {
  const list = [...S.cover.favs].map(findRecipe).filter(Boolean);
  return `<div class="content"><div class="cover-hero"><h1>${t('Mes favoris')}</h1></div>
    ${list.length ? `<div class="recipe-grid">${list.map(recipeCard).join('')}</div>` : `<div class="empty"><div class="em">🤍</div>${t('Touchez le cœur d\'une recette pour la retrouver ici')}</div>`}</div>`;
}

function coverCart() {
  const c = S.cover; const cart = c.cart;
  const nDone = cart.filter((i) => i.done).length;
  const clearBtn = c.confirmClear
    ? `<div class="row"><button class="btn muted block" data-action="cart-clear-cancel">${t('Annuler')}</button><button class="btn primary block" data-action="cart-clear-confirm">${t('Tout supprimer')}</button></div>`
    : `<button class="btn muted block" data-action="cart-clear">${t('Vider la liste')}</button>`;
  return `<div class="content"><div class="cover-hero"><h1>${t('Liste de courses')}</h1>${cart.length ? `<div class="muted small">${tn(cart.length, '{n} article', '{n} articles')}${nDone ? ` · ${tn(nDone, '{n} coché', '{n} cochés')}` : ''}</div>` : ''}</div>
    ${cart.length ? `<div class="card"><ul class="ingredients">${cart.map((i, n) => `<li><label class="row" style="flex:1"><input type="checkbox" data-action="cart-check" data-n="${n}" ${i.done ? 'checked' : ''}><span style="${i.done ? 'text-decoration:line-through;opacity:.5' : ''}">${esc(i.name)}</span></label><span class="q">${esc(`${i.qty} ${i.unit}`.trim())}</span></li>`).join('')}</ul></div>
      ${nDone && !c.confirmClear ? `<button class="btn soft block" style="margin-bottom:10px" data-action="cart-remove-done">${t('Retirer les articles cochés ({n})', { n: nDone })}</button>` : ''}
      ${c.confirmClear ? `<p class="small muted" style="text-align:center;margin:0 0 10px">${t('Supprimer les {n} articles de la liste ?', { n: cart.length })}</p>` : ''}
      ${clearBtn}` : `<div class="empty"><div class="em">🧺</div>${t('Votre liste est vide.<br>Ajoutez les ingrédients d\'une recette.')}</div>`}</div>`;
}

function coverProfile() {
  const p = S.cover.profile;
  const sw = (k, label, sub) => `<div class="setting-row"><div><div>${label}</div>${sub ? `<div class="muted small">${sub}</div>` : ''}</div><button class="switch ${p[k] ? 'on' : ''}" data-action="profile-toggle" data-k="${k}"></button></div>`;
  const lang = L10N.langs.find((l) => l.code === L10N.lang);
  return `<div class="content"><div class="cover-hero"><h1>${t('Mon profil')}</h1></div>
    <div class="profile-head"><div class="avatar">👩‍🍳</div><div><b style="font-size:17px">${t('Cuisinier·ère du dimanche')}</b><div class="muted small">${t('Membre depuis mars 2025 · 12 recettes cuisinées')}</div></div></div>
    <div class="card">${sw('notif', t('Notifications'), t('Idées de recettes le week-end'))}${sw('metric', t('Unités métriques'), 'g, dl, cl')}${sw('dark', t('Thème sombre'))}</div>
    <div class="card"><button class="setting-row lang-row" data-action="cover-lang"><span>${t('Langue')}</span><span class="muted">${esc(lang ? lang.name : L10N.lang)} ${S.cover.langOpen ? I.chevD : I.chevR}</span></button>
      ${S.cover.langOpen ? langButtons('lang-list') : ''}</div>
    <div class="card"><div class="setting-row"><span>${t('Aide et contact')}</span>${I.chevR}</div><div class="setting-row"><span>${t('Conditions d\'utilisation')}</span>${I.chevR}</div><div class="setting-row"><span class="muted small">Version 2.3.1 (build 118)</span></div></div>
  </div>`;
}

function coverTabbar() {
  const cur = S.cover.tab;
  const tab = (id, icon, label) => `<button class="tab ${cur === id ? 'active' : ''}" data-action="cover-tab" data-tab="${id}">${icon}${label}</button>`;
  return `<div class="bottombar tabbar">${tab('recettes', I.home, t('Recettes'))}${tab('favoris', I.heart, t('Favoris'))}${tab('courses', I.cart, t('Courses'))}${tab('profil', I.user, t('Profil'))}</div>`;
}

async function adaptRecipe() {
  const c = S.cover; const r = c.recipe;
  let data;
  try { data = await api('/api/cover/adapt', { method: 'POST', body: { recipe_id: r.id, persons: c.persons } }); }
  catch (e) { toast(e.message); return; }
  if (data.token) { unlock(data.token); return; }            // ← accès secret reconnu : Abri s'ouvre
  c.adapted = c.persons; refreshIngredients();
  toast(tn(c.adapted, 'Quantités adaptées pour {n} personne', 'Quantités adaptées pour {n} personnes'));
}

// ===========================================================================
// 3. VERROUILLAGE / DÉVERROUILLAGE (« Retour en cuisine »)
// ===========================================================================
async function unlock(token) {
  S.token = token;
  screen.classList.add('unlocking');
  try { S.boot = await api('/api/app/bootstrap'); }
  catch (e) { screen.classList.remove('unlocking'); toast(e.message); return; }
  setTimeout(() => {
    S.mode = 'app'; S.tab = 'home'; S.home = { open: {} };
    S.quiz = { stage: 'intro', i: 0, answers: {}, situation: {}, si: 0, result: S.boot.last_result, busy: false };
    // Les étapes s'affichent pour le téléphone utilisé (modifiable dans l'onglet)
    S.loc = { scanning: false, scanStep: 0, scan: null, open: {}, groups: {}, platform: /android/i.test(navigator.userAgent) ? 'android' : 'iphone', selected: null, focus: null, refit: true };
    S.ev = { sub: 'pieces', cat: null, step: 'type', files: null, previews: null, note: '', jtext: '', jdate: '', busy: false };
    S.quick = !!(S.boot.prefs && S.boot.prefs.face_id);
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
// Icônes d'Abri : traits arrondis, une teinte par famille (voir .ic / .tone-* dans style.css)
const LI = {
  home: svg('<path d="M4 11.5L12 5l8 6.5V19a1.5 1.5 0 01-1.5 1.5h-4v-6h-5v6h-4A1.5 1.5 0 014 19z"/>'),
  list: svg('<rect x="5" y="4" width="14" height="17" rx="3"/><path d="M9 4V3h6v1M9 11h6M9 15.5h4"/>'),
  pin: svg('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'),
  folder: svg('<path d="M3 7.5A2.5 2.5 0 015.5 5h4l2 2h7A2.5 2.5 0 0121 9.5v8a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 17.5z"/>'),
  book: svg('<path d="M12 6.8C10.2 5.2 7.6 4.6 3.5 4.7v13.2c4.1-.1 6.7.5 8.5 2.1 1.8-1.6 4.4-2.2 8.5-2.1V4.7c-4.1-.1-6.7.5-8.5 2.1z"/><path d="M12 6.8V20"/>'),
  wiki: svg('<circle cx="12" cy="12" r="8.5"/><path d="M6.5 9l2.6 6.5L12 9.5l2.9 6L17.5 9"/>'),
  timer: svg('<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 2M10 3h4"/>'),
  bolt: svg('<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>'),
  refresh: svg('<path d="M20 11a8 8 0 00-14.3-4.6L4 8.5M4 4v4.5h4.5M4 13a8 8 0 0014.3 4.6L20 15.5M20 20v-4.5h-4.5"/>'),
  eyeoff: svg('<path d="M3 3l18 18M10.6 5.7A9.7 9.7 0 0112 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 01-3 3.7M6.6 6.7C4 8.4 2.5 12 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.3-1.1"/><path d="M9.9 9.9a3 3 0 004.2 4.2"/>'),
  video: svg('<rect x="3" y="6" width="13" height="12" rx="3"/><path d="M16 10.5l5-3v9l-5-3z"/>'),
  robot: svg('<rect x="4" y="8" width="16" height="11" rx="4"/><path d="M12 8V5.5M12 5.5a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4zM2.5 13v3M21.5 13v3"/><circle cx="9" cy="13" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="13" r="1.3" fill="currentColor" stroke="none"/><path d="M9.5 16.3c1.5 1 3.5 1 5 0"/>'),
  phone: svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>'),
  message: svg('<path d="M4 5.5h16v10H10l-5 4v-4H4z"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" stroke-width="2.4"/>'),
  link: svg('<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>'),
  gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 01-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 012.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 012.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/>'),
  exit: svg('<path d="M9 6l-6 6 6 6M3 12h12M14 4h5v16h-5"/>'),
  chevR: svg('<path d="M9 6l6 6-6 6"/>'),
  chevD: svg('<path d="M6 9l6 6 6-6"/>'),
  check: svg('<path d="M5 12l5 5L20 7"/>', 'stroke-width="3"'),
  x: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  trash: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  download: svg('<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>'),
  back: svg('<path d="M15 6l-6 6 6 6"/>'),
  lock: svg('<rect x="5" y="11" width="14" height="10" rx="3"/><path d="M8 11V8a4 4 0 018 0v3"/>'),
  unlock: svg('<rect x="5" y="11" width="14" height="10" rx="3"/><path d="M8 11V8a4 4 0 017.5-2"/>'),
  camera: svg('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
  image: svg('<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>'),
  doc: svg('<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'),
  mic: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/>'),
  clip: svg('<path d="M20 11.5l-7.8 7.8a5 5 0 01-7.1-7.1l8.2-8.2a3.4 3.4 0 014.8 4.8l-8.2 8.2a1.7 1.7 0 01-2.4-2.4l7.4-7.4"/>'),
  hammer: svg('<path d="M14 4l6 6-2.5 2.5-6-6z"/><path d="M12.5 8.5L4 17l3 3 8.5-8.5"/>'),
  bandage: svg('<rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="M10.5 10.5h.01M13.5 10.5h.01M10.5 13.5h.01M13.5 13.5h.01" stroke-width="2.4"/>'),
  heart: svg('<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>'),
  users: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0M16 4.5a3.5 3.5 0 010 7M21.5 20a6.5 6.5 0 00-4.5-6.2"/>'),
  scale: svg('<path d="M12 4v16M5 20h14M4 8h16"/><path d="M7 8l-3 6a3 3 0 006 0zM17 8l-3 6a3 3 0 006 0z"/>'),
  cross: svg('<path d="M9.5 4h5v5.5H20v5h-5.5V20h-5v-5.5H4v-5h5.5z"/>'),
  shield: svg('<path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>'),
  globe: svg('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z"/>'),
  chat: svg('<path d="M5 5h14a2 2 0 012 2v8a2 2 0 01-2 2h-6l-5 4v-4H5a2 2 0 01-2-2V7a2 2 0 012-2z"/>'),
  lifebuoy: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6"/>'),
  hand: svg('<path d="M8 12V6.5a1.5 1.5 0 013 0V11M11 6a1.5 1.5 0 013 0v5M14 7.5a1.5 1.5 0 013 0V13M17 10.5a1.5 1.5 0 013 0V15a6 6 0 01-6 6h-2a6 6 0 01-5-2.7L4.6 15A1.6 1.6 0 017 13l1 1.3"/>'),
  speech: svg('<path d="M4 6h16v9H11l-4 3.5V15H4z"/><path d="M8 9.5h8M8 12h5"/>'),
  ban: svg('<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>'),
  coins: svg('<ellipse cx="9" cy="7" rx="6" ry="2.5"/><path d="M3 7v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V7M3 11v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4"/><path d="M15 9.5c3 .3 6 1.3 6 2.5v4c0 1.4-2.7 2.5-6 2.5"/>'),
  rings: svg('<circle cx="9" cy="13" r="5.5"/><circle cx="15" cy="13" r="5.5"/><path d="M12 3.5l-1.5 2.5h3z"/>'),
  eye: svg('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>'),
  key: svg('<circle cx="8" cy="14" r="4.5"/><path d="M11.5 11.5L20 3M16 7l2.5 2.5M13.5 9.5l2.5 2.5"/>'),
  bag: svg('<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 016 0v2"/>'),
  child: svg('<circle cx="12" cy="6.5" r="3"/><path d="M6 21v-5.5a6 6 0 0112 0V21M9 14.5V21M15 14.5V21"/>'),
  sparkle: svg('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>'),
  alert: svg('<path d="M12 3.5l9 16H3z"/><path d="M12 10v4.5M12 17.2v.3"/>'),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'),
  siren: svg('<path d="M6 19v-6a6 6 0 0112 0v6"/><path d="M3 19h18M12 3v2M4.5 6.5L6 8M19.5 6.5L18 8"/>'),
  pen: svg('<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13 7l4 4"/>'),
  idcard: svg('<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="11" r="2"/><path d="M6 16a3 3 0 016 0M14 10h4M14 13.5h4"/>'),
  phonelock: svg('<rect x="6" y="3" width="12" height="18" rx="3"/><path d="M10 17.5h4"/><rect x="9.5" y="9" width="5" height="4.5" rx="1"/><path d="M10.5 9V8a1.5 1.5 0 013 0v1"/>'),
  faceid: svg('<path d="M4 8V6a2 2 0 012-2h2M16 4h2a2 2 0 012 2v2M4 16v2a2 2 0 002 2h2M16 20h2a2 2 0 002-2v-2"/><path d="M9 9.5v1.5M15 9.5v1.5M12 9.5v3.5h-1M9 15c1.7 1.3 4.3 1.3 6 0"/>'),
  send: svg('<path d="M5 12l14-7-5 15-2.5-6z"/>'),
  moon: svg('<path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/>'),
  map: svg('<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>'),
  shieldx: svg('<path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/><path d="M9.5 9.5l5 5M14.5 9.5l-5 5"/>'),
};
const LOGO = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5.6"/><circle cx="12" cy="12" r="2.6"/><path d="M3.6 4.5v15M2.3 4.5v3.2a1.3 1.3 0 002.6 0V4.5"/><path d="M20.4 4.5v15M20.4 4.5c1.7 1.2 1.7 5.2 0 7"/></svg>';
const APP_NAME = 'Abri';
const FREEZE_PLACE = 'Lausanne, pl. de la Riponne';
const fmtTime = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };

// Correspondances contenu → icône / teinte (le contenu de content.py garde ses emojis, l'interface ne les montre plus)
const AXIS_ICON = { urgence: 'lifebuoy', sante: 'cross', securite: 'shield', justice: 'scale', migration: 'globe', conseils: 'chat' };
const AXIS_TONE = { urgence: 'or', sante: 'menthe', securite: 'bleu', justice: 'rose', migration: 'peche', conseils: 'lavande' };
const AXIS_ORDER = ['securite', 'sante', 'justice', 'migration', 'conseils'];
const QUIZ_ICON = { physique: 'hand', psychologique: 'speech', sexuelle: 'shieldx', economique: 'coins', mariage: 'rings' };
const QUIZ_TONE = { physique: 'rose', psychologique: 'lavande', sexuelle: 'peche', economique: 'or', mariage: 'menthe' };
const ACTION_ICON = { '🚨': 'siren', '📞': 'phone', '🏠': 'home', '🩺': 'cross', '⚖️': 'scale', '💬': 'chat', '🗂️': 'folder', '📝': 'pen', '📍': 'pin' };
const EV_ICON = { blessure: 'bandage', message: 'message', degats: 'hammer', document: 'doc', audio: 'mic', autre: 'clip', journal: 'pen' };
const EV_TONE = { blessure: 'rose', message: 'lavande', degats: 'peche', document: 'bleu', audio: 'menthe', autre: 'or', journal: 'lavande' };
const DOSSIER_ICON = { identite: 'idcard', constat: 'cross', photos: 'camera', messages: 'message', journal: 'pen', temoins: 'users', banque: 'coins', civil: 'doc', audio: 'mic' };
const LOC_GROUP_ICON = { voir: 'eye', acces: 'key', objets: 'bag' };
const LOC_GROUP_TONE = { voir: 'rose', acces: 'lavande', objets: 'peche' };
const OFFICE_TONE = { aide: 'peche', medecin: 'menthe', police: 'bleu' };
const GUIDE_ICON = { bag: 'bag', shield: 'shield', scale: 'scale', book: 'book', 'phone-lock': 'phonelock', child: 'child', coins: 'coins' };
// Quels lieux (content.OFFICES) correspondent à quel contact : adresse affichée dans la carte du contact
const CONTACT_OFFICE = {
  lavi: ['lavi-lausanne', 'lavi-nyon', 'lavi-yverdon', 'lavi-vevey', 'lavi-aigle'], malley_urg: ['malley'], malley_conseil: ['malley'],
  umv: ['umv-lausanne', 'umv-yverdon', 'umv-nyon', 'umv-rennaz'], bci: ['bci'], fraternite: ['fraternite'], police: ['police-lausanne', 'police-cantonale'],
};
const ic = (name, tone = 'rose', size = '') => `<span class="ic tone-${tone} ${size}">${LI[name] || LI.sparkle}</span>`;
const toneColor = (tone) => ({ rose: '#ff9ec4', lavande: '#c4b0ff', peche: '#ffbf9b', menthe: '#8fe3c4', or: '#ffd77a', bleu: '#9db4ff', sos: '#ff5a75' }[tone] || '#ff9ec4');
const isFrozen = () => !!(S.boot && S.boot.prefs && S.boot.prefs.freeze_location);

function renderApp() {
  const tabs = { home: appHome, quiz: appQuiz, loc: appLocation, ev: appEvidence, res: appResources };
  const current = S.tab;
  const tab = (id, icon, label) => `<button class="tab ${current === id ? 'active' : ''}" data-action="tab" data-tab="${id}">${LI[icon]}${label}</button>`;
  const backLabel = S.front === 'wiki' ? t('Retour à Wikipédia') : t('Retour en cuisine');
  return `<div class="view">
    <div class="topbar lu-top">
      <button class="brand" data-action="tab" data-tab="home"><span class="lg">${LOGO}</span>${APP_NAME}</button>
      <span style="flex:1"></span>
      <button class="icon-btn" data-action="tab" data-tab="res" title="${t('Guides et témoignages')}" aria-label="${t('Guides et témoignages')}" ${current === 'res' ? 'style="color:var(--a-primary)"' : ''}>${LI.book}</button>
      <button class="icon-btn" data-action="settings" title="${t('Réglages')}" aria-label="${t('Réglages')}">${LI.gear}</button>
      <button class="exit-btn" data-action="quick-exit" title="${t('Ferme l\'espace protégé immédiatement')}">${LI.exit}${backLabel}</button>
    </div>
    ${posBar()}
    <div class="content">${tabs[current]()}</div>
    <button class="robot-fab" data-action="chat-open" aria-label="${t('Assistant')}" title="${t('Assistant')}">${LI.robot}</button>
    <div class="bottombar lu-tabbar">
      ${tab('home', 'home', t('Accueil'))}${tab('quiz', 'list', t('Situation'))}
      <div class="sos-slot"><button class="sos-btn" data-action="sos">SOS<small>${t('POLICE 117')}</small></button></div>
      ${tab('loc', 'pin', t('Position'))}${tab('ev', 'folder', t('Coffre'))}
    </div>
  </div>`;
}

// Barre « Ma position », en haut de chaque page : un geste pour figer / rendre visible
function posBar() {
  const on = isFrozen(); const at = (S.boot.prefs_at || {}).freeze_location;
  return `<div class="pos-bar ${on ? 'on' : ''}">
    <button class="pos-main" data-action="tab" data-tab="loc">
      <span class="ic ${on ? 'tone-lavande' : 'tone-rose'}">${on ? LI.lock : LI.pin}</span>
      <span style="min-width:0"><b>${on ? t('Position figée') : t('Ma position')}</b><small>${on ? `${t('Les applis voient {place}', { place: esc(FREEZE_PLACE) })}${at ? ` · ${t('depuis {time}', { time: fmtTime(at) })}` : ''}` : t('Réelle · touchez l\'interrupteur pour la figer')}</small></span>
    </button>
    <button class="switch lu ${on ? 'on' : ''}" data-action="freeze-toggle" aria-label="${t('Figer ma position')}" title="${on ? t('Rendre ma position réelle') : t('Figer ma position')}"></button>
  </div>`;
}

async function toggleFreeze() {
  const on = !isFrozen();
  try {
    const r = await api('/api/app/pref', { method: 'POST', body: { key: 'freeze_location', value: on } });
    S.boot.prefs = r.prefs; S.boot.prefs_at = r.prefs_at || S.boot.prefs_at;
  } catch (e) { toast(e.message); return; }
  render();
  if (officeMap) placeYouMarker();
  toast(on ? t('Position figée : les applis voient un lieu fixe') : t('Position réelle rétablie'));
}

// --- 4a. Accueil = les contacts --------------------------------------------
function appHome() {
  const B = S.boot; const H = S.home;
  const rec = B.last_result ? B.last_result.contacts.filter((c) => !c.pinned) : [];
  const hour = new Date().getHours();
  const greet = hour < 6 ? t('Bonne nuit') : hour < 12 ? t('Bonjour') : hour < 18 ? t('Bon après-midi') : t('Bonsoir');
  const malley = B.contacts.find((c) => c.id === 'malley_urg');
  return `<div class="fade-in">
    <div class="hero"><div class="h-greet">${greet}</div><h2>${t('Vous êtes en sécurité ici.')}</h2>
      <p>${t('Cet espace est invisible depuis le téléphone. « {back} » le referme aussitôt.', { back: S.front === 'wiki' ? t('Retour à Wikipédia') : t('Retour en cuisine') })}</p></div>
    <button class="call-big" data-action="call" data-id="victimes142"><span class="ic round">${LI.phone}</span><span><b>${t('Parler à quelqu\'un maintenant')}</b><small>${t('142 · gratuit, confidentiel, 24h/24')}</small></span><span class="go">${LI.chevR}</span></button>
    <div class="tiles">
      <button class="tile" data-action="sos"><span class="ic tone-sos">${LI.siren}</span><b>${t('Danger immédiat')}</b><small>${t('Police · 117')}</small></button>
      <button class="tile" data-action="call" data-id="malley_urg"><span class="ic tone-peche">${LI.home}</span><b>${t('Un endroit où dormir')}</b><small>${malley ? esc(malley.org) : t('Hébergement d\'urgence')}</small></button>
      ${B.last_result ? '' : `<button class="tile wide" data-action="tab" data-tab="quiz"><span class="ic tone-lavande">${LI.list}</span><div><b>${t('Faire le point sur ma situation')}</b><small>${t('22 questions oui / non, 3 minutes. {app} vous oriente ensuite.', { app: APP_NAME })}</small></div><span class="chev">${LI.chevR}</span></button>`}
    </div>
    ${rec.length ? `<div class="section-title">${t('Recommandés pour vous')}</div>${rec.map(contactCard).join('')}` : ''}
    <div class="section-title">${t('Tous les services vaudois')}</div>
    ${AXIS_ORDER.map((ax) => { const list = B.contacts.filter((c) => c.axis === ax && !c.pinned); const open = !!H.open[ax];
      return `<button class="axis-head ${open ? 'open' : ''}" data-action="axis-toggle" data-axis="${ax}">${ic(AXIS_ICON[ax], AXIS_TONE[ax])}${esc(B.axes[ax].label)}<span class="n">${list.length}</span><span class="chev">${LI.chevR}</span></button>${open ? `<div class="axis-body">${list.map(contactCard).join('')}</div>` : ''}`; }).join('')}
    <button class="tile wide" style="margin-top:14px;width:100%" data-action="tab" data-tab="res"><span class="ic tone-menthe">${LI.book}</span><div><b>${t('Guides et témoignages')}</b><small>${t('Partir en sécurité, porter plainte, mes droits…')}</small></div><span class="chev">${LI.chevR}</span></button>
    <p class="tiny muted" style="text-align:center;margin-top:14px">${t('Réseau vaudois de lutte contre la violence domestique — canton de Vaud. Les appels passent par {app} : rien dans l\'historique du téléphone.', { app: APP_NAME })}</p>
  </div>`;
}

function contactCard(c) {
  const B = S.boot; const tone = AXIS_TONE[c.axis] || 'rose';
  const offs = (CONTACT_OFFICE[c.id] || []).map((id) => B.offices.find((o) => o.id === id)).filter(Boolean);
  const o = offs[0];
  return `<div class="contact-card tone-${tone} ${c.pinned ? 'pinned' : ''}">
    <span class="ic">${LI[AXIS_ICON[c.axis]] || LI.phone}</span>
    <div class="cc-body">
      <div class="t">${esc(c.title)}</div><div class="o">${esc(c.org)}</div>
      <div class="d">${esc(c.desc)}</div>
      ${c.phone ? `<div class="num">${esc(c.phone)}</div>` : ''}
      ${o ? `<div class="addr">${LI.pin}<span>${esc(o.address)}${offs.length > 1 ? ` · ${tn(offs.length - 1, '+{n} autre lieu', '+{n} autres lieux')}` : ''}</span><button data-action="office-map" data-id="${esc(o.id)}">${t('Carte')}</button></div>` : ''}
      <div class="acts">${c.phone ? `<button class="btn primary" data-action="call" data-id="${esc(c.id)}">${LI.phone} ${t('Appeler')}</button><button class="btn muted" data-action="sms" data-id="${esc(c.id)}">${LI.message} ${t('Message')}</button>` : ''}
        ${c.web ? `<button class="btn primary" data-action="web" data-url="${esc(c.web)}">${LI.link} ${t('Ouvrir le site')}</button>` : ''}</div>
    </div></div>`;
}

// --- 4b. Situation (questionnaire) ------------------------------------------
function allQuestions() {
  return S.boot.questionnaire.sections.flatMap((s) => s.questions.map((q) => ({ ...q, section: s })));
}

function appQuiz() {
  const q = S.quiz; const Q = S.boot.questionnaire;
  if (q.stage === 'intro') {
    const last = q.result;
    return `<div class="fade-in"><div class="page-title">${t('Faire le point')}</div>
      <p class="page-sub">${t('22 questions, oui ou non, 3 minutes. Quelle que soit la raison invoquée, la violence est inacceptable.')}</p>
      ${last ? `<div class="card"><div class="row between"><div><b>${t('Dernier bilan')}</b><div class="muted small">${fmtDate(last.evaluated_at)} — <span style="color:${last.level_info.color};font-weight:800">${esc(last.level_info.label)}</span></div></div><button class="btn soft sm" data-action="quiz-show-result">${t('Revoir')}</button></div></div>` : ''}
      <div class="sec-list">${Q.sections.map((s, i) => `<div class="sec-card ${i === Q.sections.length - 1 ? 'wide' : ''}">${ic(QUIZ_ICON[s.id], QUIZ_TONE[s.id])}<span>${esc(s.title)}<small>${tn(s.questions.length, '{n} question', '{n} questions')}</small></span></div>`).join('')}</div>
      <div class="privacy-note">${LI.lock}<span>${t('Vos réponses restent dans {app} et ne sont transmises à personne. À la fin, vous voyez les services adaptés à votre situation.', { app: APP_NAME })}</span></div>
      <button class="btn primary block big-btn" data-action="quiz-start">${t('Commencer')}</button></div>`;
  }
  if (q.stage === 'questions') {
    const list = allQuestions(); const cur = list[q.i]; const sec = cur.section; const sel = q.answers[cur.id];
    return `<div class="fade-in">
      <div class="row between"><span class="q-section">${ic(QUIZ_ICON[sec.id], QUIZ_TONE[sec.id])}${esc(sec.title)}</span><span class="muted small">${q.i + 1} / ${list.length}</span></div>
      <div class="progress"><i style="width:${Math.round(100 * q.i / list.length)}%"></i></div>
      <div class="q-lead">${t('Votre partenaire ou ex-partenaire…')}</div>
      <div class="q-text">${esc(cur.text)}</div>
      <div class="q-answers"><button class="btn no ${sel === false ? 'selected' : ''}" data-action="answer" data-v="0">${t('Non')}</button><button class="btn yes ${sel === true ? 'selected' : ''}" data-action="answer" data-v="1">${t('Oui')}</button></div>
      <div class="q-mention">${esc(sec.mention)}</div>
      <div class="q-nav"><button data-action="quiz-prev">${q.i > 0 ? t('← Précédent') : t('← Retour')}</button><button data-action="quiz-skip">${t('Passer →')}</button></div></div>`;
  }
  if (q.stage === 'situation') {
    const list = Q.situation; const cur = list[q.si]; const sel = q.situation[cur.id];
    return `<div class="fade-in">
      <div class="row between"><span class="q-section">${ic('info', 'lavande')}${t('Votre situation (facultatif)')}</span><span class="muted small">${q.si + 1} / ${list.length}</span></div>
      <div class="progress"><i style="width:100%"></i></div>
      <div class="q-lead">${t('Pour vous orienter vers les bons services')}</div>
      <div class="q-text">${esc(cur.text)}</div>
      <div class="q-answers"><button class="btn no ${sel === false ? 'selected' : ''}" data-action="sit-answer" data-v="0">${t('Non')}</button><button class="btn yes ${sel === true ? 'selected' : ''}" data-action="sit-answer" data-v="1">${t('Oui')}</button></div>
      <div class="q-nav"><button data-action="sit-prev">${t('← Précédent')}</button><button data-action="sit-skip">${t('Passer →')}</button></div></div>`;
  }
  if (q.stage === 'loading') return `<div class="empty"><div class="spinner" style="margin:0 auto 12px;width:28px;height:28px"></div>${t('Analyse de vos réponses…')}</div>`;
  return quizResult(q.result);
}

function quizResult(r) {
  const li = r.level_info;
  return `<div class="fade-in">
    <div class="level-banner ${r.level}"><div class="lbl">${t('Résultat')}</div><h2>${esc(li.label)}</h2><p><b>${esc(li.headline)}</b> ${esc(li.text)}</p></div>
    ${r.sections.length ? `<div class="section-title">${t('Ce que vos réponses montrent')}</div><div class="sec-list">${r.sections.map((s) => `<div class="sec-card">${ic(QUIZ_ICON[s.id], QUIZ_TONE[s.id])}<span>${esc(s.title)}<small>${t('{n} oui sur {total}', { n: s.count, total: s.total })}</small></span></div>`).join('')}</div>` : ''}
    ${r.advice.length ? `<div style="margin-top:14px">${r.advice.map((a) => `<div class="advice">${LI.info}<span>${esc(a)}</span></div>`).join('')}</div>` : ''}
    <div class="section-title">${t('Que faire maintenant')}</div>
    ${r.actions.map((a) => `<button class="action" data-action="act" ${a.goto ? `data-goto="${a.goto}"` : ''} ${a.contact ? `data-contact="${a.contact}"` : ''}>${ic(ACTION_ICON[a.icon] || 'sparkle', a.goto === 'sos' ? 'sos' : 'rose')}<div><b>${esc(a.title)}</b><span>${esc(a.text)}</span></div><span class="chev">${LI.chevR}</span></button>`).join('')}
    <div class="section-title">${t('Services recommandés pour vous')}</div>
    ${r.contacts.map(contactCard).join('')}
    ${r.dossier.length ? `<div class="section-title" id="dossier">${t('Porter plainte — à préparer')}</div>
      <div class="card">${r.dossier.map(dossierItem).join('')}</div>
      <div class="card"><h3>${t('Bon à savoir')}</h3><ul class="info-list">${r.plainte_info.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}
    <button class="btn muted block" data-action="quiz-restart" style="margin-top:6px">${t('Refaire le questionnaire')}</button>
    <p class="tiny muted" style="text-align:center;margin-top:12px">${t('Questionnaire et réseau d\'aide : canton de Vaud — Bureau de l\'égalité entre les femmes et les hommes.')}</p>
  </div>`;
}

function dossierItem(d) {
  const have = new Set((S.boot.evidence || []).map((e) => e.category));
  if ((S.boot.journal || []).length) have.add('journal');
  const done = d.category && have.has(d.category);
  const link = d.category === 'journal' ? `<button class="link" data-action="goto" data-goto="journal">${t('Ouvrir le journal →')}</button>`
    : d.category ? `<button class="link" data-action="goto" data-goto="evidence" data-cat="${esc(d.category)}">${t('Déposer dans le coffre →')}</button>`
    : d.contact ? `<button class="link" data-action="call" data-id="${esc(d.contact)}">${t('Appeler →')}</button>` : '';
  return `<div class="check-item"><div class="box ${done ? 'on' : ''}">${done ? LI.check : ''}</div><div><b>${esc(d.label)}</b>${d.optional ? ` <span class="pill" style="font-size:10px;padding:2px 7px">${t('selon le cas')}</span>` : ''}<p>${esc(d.detail)}</p>${link}</div></div>`;
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

// --- 4c. Position : figer, carte des lieux d'aide, vérification du téléphone ---
const scanSteps = () => [t('Qui voit votre position…'), t('Applis qui vous surveillent…'), t('Appareils connectés à votre compte…'), t('Traqueurs près de vous…')];
const PLATFORMS = { iphone: 'iPhone', android: 'Android' };
const YOU_REAL = [46.5197, 6.6323];       // position (simulée) : centre de Lausanne
const YOU_FROZEN = [46.5225, 6.6349];     // place de la Riponne

function appLocation() {
  const L = S.loc; const A = S.boot.audit; const B = S.boot; const types = B.office_types;
  const on = isFrozen(); const at = (B.prefs_at || {}).freeze_location;
  const byId = Object.fromEntries(A.items.map((i) => [i.id, i]));
  const sel = B.offices.find((o) => o.id === L.selected);
  const card = sel ? `<div class="office-card">
      <button class="office-close" data-action="office-close" aria-label="${t('Fermer')}">${LI.x}</button>
      <b><i class="dot" style="background:${esc(types[sel.type].color)}"></i>${esc(sel.name)} · ${esc(sel.town)}</b>
      <div class="addr">${esc(sel.address)}</div>
      <p>${esc(sel.note)}</p>
      <button class="btn primary block" data-action="call-office" data-id="${esc(sel.id)}">${LI.phone} ${t('Appeler')} · ${esc(sel.phone)}</button>
    </div>` : '';

  let scanBlock;
  if (L.scanning) scanBlock = `<ul class="scan-steps">${scanSteps().map((s, n) => `<li class="${n < L.scanStep ? 'done' : ''}">${n < L.scanStep ? '✓' : n === L.scanStep ? '<span class="spinner"></span>' : '·'} ${s}</li>`).join('')}</ul>`;
  else if (L.scan) {
    const lbl = { high: t('À régler'), medium: t('À vérifier'), ok: t('OK') };
    const todo = L.scan.counts.high + L.scan.counts.medium;
    scanBlock = `<p class="small muted" style="margin:0 0 6px">${todo ? tn(todo, '{n} point à regarder', '{n} points à regarder') : t('Rien d\'inquiétant trouvé')}</p>
      ${L.scan.findings.map((f) => `<div class="finding"><span class="badge ${f.level}">${lbl[f.level]}</span><div><b>${esc(f.text)}</b>${f.detail ? `<p>${esc(f.detail)}</p>` : ''}${f.level !== 'ok' && byId[f.item] ? `<button class="fix" data-action="audit-goto" data-item="${esc(f.item)}">${t('Voir comment faire →')}</button>` : ''}</div></div>`).join('')}
      <button class="btn soft sm" style="margin-top:12px" data-action="scan">${t('Vérifier à nouveau')}</button>`;
  } else scanBlock = `<p class="small muted" style="margin:0 0 12px">${t('{app} cherche qui peut voir votre position, les applis qui vous surveillent et les appareils connectés à votre compte.', { app: APP_NAME })}</p><button class="btn primary block" data-action="scan">${t('Vérifier mon téléphone')}</button>`;

  const item = (it) => {
    const open = L.open[it.id]; const done = A.done[it.id];
    const steps = Array.isArray(it.steps) ? it.steps : it.steps[L.platform];
    return `<div class="audit-item ${done ? 'done' : ''} ${open ? 'open' : ''}" id="audit-${esc(it.id)}"><div class="head">
      <button class="ai-open" data-action="audit-open" data-item="${esc(it.id)}"><span class="ai-t"><b>${esc(it.title)}</b>${it.priority && !done ? `<span class="badge medium">${t('Important')}</span>` : ''}</span><span class="chev">${LI.chevR}</span></button>
      <button class="box ${done ? 'on' : ''}" data-action="audit-toggle" data-item="${esc(it.id)}" title="${t('C\'est fait')}" aria-label="${t('C\'est fait')}">${done ? LI.check : ''}</button></div>
      ${open ? `<div class="body"><p class="risk">${esc(it.why)}</p>
        ${it.warning ? `<div class="advice">${LI.alert}<span>${esc(it.warning)}</span></div>` : ''}
        <ol>${steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
        <button class="btn ${done ? 'muted' : 'soft'} sm" style="margin-top:10px" data-action="audit-toggle" data-item="${esc(it.id)}">${done ? t('Finalement, pas encore fait') : `✓ ${t('C\'est fait')}`}</button></div>` : ''}</div>`;
  };
  const group = (g) => { const items = A.items.filter((i) => i.group === g.id); const nd = items.filter((i) => A.done[i.id]).length; const open = !!L.groups[g.id];
    return `<button class="group-head ${open ? 'open' : ''}" data-action="group-toggle" data-group="${esc(g.id)}">${ic(LOC_GROUP_ICON[g.id] || 'eye', LOC_GROUP_TONE[g.id] || 'rose')}<span class="gh-t">${esc(g.title)}</span><span class="n">${nd}/${items.length}</span><span class="chev">${LI.chevR}</span></button>${open ? items.map(item).join('') : ''}`; };

  return `<div class="fade-in"><div class="page-title">${t('Ma position')}</div><p class="page-sub">${t('Décidez qui peut savoir où vous êtes.')}</p>
    <div class="freeze-card ${on ? 'on' : ''}"><div class="fc-row">${ic(on ? 'lock' : 'pin', on ? 'lavande' : 'rose', 'lg')}<div><b>${on ? t('Position figée') : t('Figer ma position')}</b><small>${on ? `${t('Les applis et les partages voient {place}', { place: esc(FREEZE_PLACE) })}${at ? ` ${t('depuis {time}', { time: fmtTime(at) })}` : ''}.` : t('Un lieu fixe est montré aux applis et aux partages, pas vos déplacements.')}</small></div><button class="switch lu ${on ? 'on' : ''}" data-action="freeze-toggle" aria-label="${t('Figer ma position')}"></button></div>
      <p>${on ? t('Vous pouvez bouger librement : rien ne change pour les personnes qui vous suivent. Désactivez pour revenir à votre position réelle.') : t('Utile avant un rendez-vous au Centre LAVI ou chez l\'avocat·e, ou pour préparer un départ.')}</p></div>
    <div class="section-title">${t('Où trouver de l\'aide près de vous')}</div>
    <div id="map-slot" class="map-slot"><div class="map-loading"><span class="spinner"></span> ${t('Chargement de la carte…')}</div></div>
    <div class="map-legend"><span><i class="dot" style="background:${on ? '#c4b0ff' : '#ff9ec4'}"></i>${on ? t('Position figée') : t('Vous')}</span>${Object.values(types).map((t) => `<span><i class="dot" style="background:${esc(t.color)}"></i>${esc(t.label)}</span>`).join('')}</div>
    ${card || `<p class="small muted" style="text-align:center;margin:0 0 12px">${t('Touchez un point pour voir l\'adresse et appeler.')}</p>`}
    <div class="section-title">${t('Mon téléphone')}</div>
    <div class="card"><div class="row between" style="margin-bottom:6px"><h3 style="margin:0">${t('Vérification rapide')}</h3><span class="tiny muted">${t('démo · simulée')}</span></div>${scanBlock}</div>
    <div class="advice">${LI.alert}<span><b>${t('Avant de changer un réglage :')}</b> ${esc(A.warning)}<br><button class="btn soft sm" data-action="call" data-id="victimes142">${LI.phone} ${t('Appeler le 142')}</button></span></div>
    <div class="row between" style="margin:14px 0 8px"><b class="small">${t('Points à vérifier')}</b><span class="muted small">${t('{n} sur {total} faits', { n: A.n_done, total: A.n_total })}</span></div>
    <div class="segmented" style="margin-top:0">${Object.entries(PLATFORMS).map(([id, label]) => `<button class="${L.platform === id ? 'active' : ''}" data-action="loc-platform" data-platform="${id}">${label}</button>`).join('')}</div>
    ${A.groups.map(group).join('')}
    ${A.quick[L.platform] ? `<div class="card highlight-card"><h3>${t('Tout couper d\'un coup')}</h3><p class="small muted">${esc(A.quick[L.platform])}</p></div>` : ''}
    <div class="card"><h3>${t('Bon à savoir')}</h3><ul class="info-list">${A.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
  </div>`;
}

function startScan() {
  const L = S.loc; L.scanning = true; L.scanStep = 0; L.scan = null; render();
  const iv = setInterval(async () => {
    L.scanStep++;
    if (L.scanStep >= scanSteps().length) {
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

// La carte (Leaflet) n'est chargée qu'à la première ouverture de l'onglet Position :
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

function placeYouMarker() {
  if (!officeMap) return;
  const Lf = window.L; const on = isFrozen();
  const icon = Lf.divIcon({ className: '', html: `<div class="you-marker ${on ? 'frozen' : ''}"></div>`, iconSize: [18, 18], iconAnchor: [9, 9] });
  const pos = on ? YOU_FROZEN : YOU_REAL;
  if (officeMap.you) officeMap.you.setLatLng(pos).setIcon(icon);
  else officeMap.you = Lf.marker(pos, { icon, interactive: false, zIndexOffset: 1000 }).addTo(officeMap.map);
  const badge = $('.map-badge', screen);
  if (badge) { badge.className = `map-badge ${on ? 'frozen' : ''}`; badge.innerHTML = `${on ? LI.lock : LI.pin}${on ? t('Position figée') : t('Position réelle')}`; }
}

async function mountMap() {
  try { await loadLeaflet(); } catch (e) {
    const slot = $('#map-slot', screen);
    if (slot) slot.innerHTML = `<p class="small muted map-loading">${t('Carte indisponible : les adresses sont dans les contacts.')}</p>`;
    return;
  }
  const slot = $('#map-slot', screen); if (!slot) return;          // on a changé d'onglet entre-temps
  const Lf = window.L;
  if (!officeMap) {
    const el = document.createElement('div'); el.className = 'lu-map';
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
    officeMap = { el, map, markers, you: null };
    showAllOffices();
  } else {
    slot.replaceChildren(officeMap.el);
    officeMap.map.invalidateSize();
    if (S.loc.refit) { S.loc.refit = false; showAllOffices(); }
  }
  let badge = $('.map-badge', slot);
  if (!badge) { badge = document.createElement('div'); badge.className = 'map-badge'; slot.appendChild(badge); }
  placeYouMarker();
  if (S.loc.focus) { const o = S.boot.offices.find((x) => x.id === S.loc.focus); S.loc.focus = null; if (o) officeMap.map.setView([o.lat, o.lon], 14); }
  for (const [id, m] of Object.entries(officeMap.markers)) {
    const on = id === S.loc.selected;
    m.setRadius(on ? 12 : 8).setStyle({ weight: on ? 3 : 2 });
    if (on) m.bringToFront();
  }
}

function showAllOffices() {
  if (!officeMap) return;
  officeMap.map.fitBounds(window.L.latLngBounds([...S.boot.offices.map((o) => [o.lat, o.lon]), YOU_REAL]), { padding: [24, 24], animate: false });
}

// Choisir un lieu (depuis la carte, un contact ou la liste) : sa fiche s'affiche sous la carte
function selectOffice(id, fromList) {
  const o = S.boot.offices.find((x) => x.id === id); if (!o) return;
  S.loc.selected = id;
  if (fromList) { S.tab = 'loc'; S.loc.focus = id; }
  render();
  if (fromList) { const slot = $('#map-slot', screen); if (slot) slot.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}

function openOfficeCall(id) {
  const o = S.boot.offices.find((x) => x.id === id); if (!o) return;
  S.overlay = { type: 'call', contact: { title: `${o.name} · ${o.town}`, org: S.boot.office_types[o.type].label, phone: o.phone } };
  renderOverlay();
}

// --- 4d. Coffre à preuves ---------------------------------------------------
// Un bouton, puis une feuille en deux temps : le type de preuve (grandes tuiles), puis le fichier.
const EV_ACCEPT = 'image/*,audio/*,video/*,application/pdf,.doc,.docx,.txt';
const EV_MAX = 50 * 1024 * 1024;
const fmtSize = (n) => (n < 1024 * 1024 ? t('{n} Ko', { n: Math.max(1, Math.round(n / 1024)) })
  : t('{n} Mo', { n: (n / 1024 / 1024).toLocaleString(L10N.locale, { maximumFractionDigits: 1 }) }));
const fmtShort = (iso) => { const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleString(L10N.locale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };
const isTouch = () => matchMedia('(pointer: coarse)').matches;

function appEvidence() {
  const E = S.ev; const B = S.boot;
  const cats = Object.fromEntries(B.evidence_categories.map((c) => [c.id, c]));
  const catOf = (e) => cats[e.category] || cats.autre;
  const seg = (id, icon, label, n) => `<button class="${E.sub === id ? 'active' : ''}" data-action="ev-sub" data-sub="${id}">${LI[icon]}<span>${label}</span><small>${n}</small></button>`;
  let body;
  if (E.sub === 'pieces') {
    // Une seule zone d'ajout : on la touche (choix du type, puis du fichier) ou on y dépose des fichiers
    const row = (e) => { const c = catOf(e);
      return `<div class="ev-row tone-${EV_TONE[c.id] || 'or'}">
        <div class="thumb">${e.mime.startsWith('image/') ? `<img src="/api/evidence/file/${esc(e.id)}?t=${encodeURIComponent(S.token)}" alt="">` : LI[EV_ICON[c.id]] || LI.doc}</div>
        <div class="info"><div class="nm">${esc(e.note || e.name || c.label)}</div>
          <div class="dt">${esc(fmtShort(e.added_at))} · ${esc(fmtSize(e.size))}</div></div>
        <button class="icon-btn del" data-action="ev-del" data-id="${esc(e.id)}" title="${t('Supprimer')}" aria-label="${t('Supprimer')}">${LI.trash}</button></div>`; };
    const groups = B.evidence_categories.map((c) => ({ c, items: B.evidence.filter((e) => catOf(e).id === c.id) })).filter((g) => g.items.length);
    body = `<button class="ev-drop" id="ev-drop" data-action="ev-add">
        <span class="ic round">${LI.plus}</span>
        <b>${t('Ajouter une preuve')}</b>
        <small>${isTouch() ? t('Photo, capture d\'écran, document, audio') : t('Cliquez pour choisir, ou glissez des fichiers ici')}</small></button>
      ${groups.length ? groups.map((g) => `<div class="ev-group-h">${ic(EV_ICON[g.c.id] || 'clip', EV_TONE[g.c.id] || 'or', 'xs')}<span>${esc(g.c.label)}</span><small>${g.items.length}</small></div>
        <div class="ev-list">${g.items.map(row).join('')}</div>`).join('')
      : `<p class="ev-empty">${t('Aucune preuve pour l\'instant. Par exemple : la photo d\'une blessure, la capture d\'un message, un certificat médical.')}</p>`}
      <p class="ev-note">${LI.shield}<span>${t('Chaque fichier est daté à l\'ajout et reçoit une empreinte numérique : on peut prouver qu\'il n\'a pas été modifié.')}</span></p>`;
  } else if (E.sub === 'journal') {
    body = `<div class="card ev-form">
        <div class="field"><label>${t('Ce qui s\'est passé')}</label><textarea data-input="jtext" placeholder="${t('Avec vos mots : ce qui s\'est passé, où, et qui était présent. Quelques phrases suffisent.')}">${esc(E.jtext)}</textarea></div>
        <div class="field"><label>${t('Date et heure des faits')}</label><input type="datetime-local" data-input="jdate" value="${esc(E.jdate || localDT())}"></div>
        <button class="btn primary block" data-action="journal-add" ${E.busy ? 'disabled' : ''}>${E.busy ? t('Enregistrement…') : t('Enregistrer')}</button></div>
      ${B.journal.length ? `<div class="section-title">${t('Entrées · {n}', { n: B.journal.length })}</div>${B.journal.map((j) => `<div class="journal-entry">
        <div class="row between"><span class="dt">${esc(fmtDay(j.occurred))}</span><button class="icon-btn del" data-action="journal-del" data-id="${esc(j.id)}" title="${t('Supprimer')}" aria-label="${t('Supprimer')}">${LI.trash}</button></div>
        <p>${esc(j.text)}</p><div class="rec">${t('Écrit le {date}', { date: esc(fmtShort(j.recorded)) })}</div></div>`).join('')}`
      : `<div class="ev-empty">${ic('pen', 'lavande', 'lg')}${t('Aucune entrée pour l\'instant.<br>Notez les faits dès que possible : les détails s\'oublient vite.')}</div>`}`;
  } else {
    const D = B.dossier;
    const acts = (d) => {
      const btns = [];
      if (d.category === 'journal') btns.push(`<button class="link-btn" data-action="goto" data-goto="journal">${LI.pen} ${t('Rédiger')}</button>`);
      else if (d.category) btns.push(`<button class="link-btn" data-action="goto" data-goto="evidence" data-cat="${esc(d.category)}">${LI.plus} ${t('Ajouter')}</button>`);
      if (d.contact) btns.push(`<button class="link-btn" data-action="call" data-id="${esc(d.contact)}">${LI.phone} ${t('Appeler')}</button>`);
      return btns.length ? `<div class="dl-acts">${btns.join('')}</div>` : `<p class="dl-self">${t('À préparer en dehors de l\'application.')}</p>`;
    };
    body = `<div class="card dossier-head"><div class="row between"><b>${t('Pièces pour une plainte')}</b><span>${D.n_done} / ${D.n_total}</span></div>
        <div class="progress"><i style="width:${D.n_total ? Math.round(100 * D.n_done / D.n_total) : 0}%"></i></div>
        ${B.last_result ? '' : `<p>${t('Liste générale. Faites « Situation » pour une liste adaptée à votre cas.')}</p>`}</div>
      <div class="dossier-list">${D.items.map((d) => `<div class="dl-item ${d.done ? 'done' : ''}">${ic(DOSSIER_ICON[d.id] || 'doc', d.done ? 'menthe' : 'lavande')}
        <div><b>${esc(d.label)}${d.optional ? ` <span class="pill">${t('Facultatif')}</span>` : ''}</b><p>${esc(d.detail)}</p>${d.done ? '' : acts(d)}</div></div>`).join('')}</div>
      <div class="card ev-export"><b>${t('Exporter le dossier')}</b>
        <p>${t('Un fichier ZIP avec vos preuves, votre journal et un index daté, à remettre à un·e avocat·e ou au Centre LAVI.')}</p>
        <button class="btn primary block" data-action="ev-export">${LI.download} ${t('Télécharger le dossier (.zip)')}</button>
        <p class="ev-note">${LI.info}<span>${t('Le fichier est enregistré dans les téléchargements du téléphone. Supprimez-le après l\'avoir remis.')}</span></p></div>`;
  }
  return `<div class="fade-in ev"><div class="page-title">${t('Mon coffre')}</div><p class="page-sub">${t('Vos preuves, datées et rangées. Visibles seulement ici.')}</p>
    <div class="segmented ev-tabs">${seg('pieces', 'image', t('Preuves'), B.evidence.length)}${seg('journal', 'pen', t('Journal'), B.journal.length)}${seg('dossier', 'list', t('Dossier'), `${B.dossier.n_done}/${B.dossier.n_total}`)}</div>${body}</div>`;
}

// Fichiers choisis (tuile de type, appareil photo ou glisser-déposer) → feuille de détails
function openEvidenceSheet(list, cat = null) {
  const files = [...list].filter((f) => f.size <= EV_MAX);
  if (files.length < list.length) toast(t('Fichier trop lourd (50 Mo max.)'));
  if (!files.length) return;
  const E = S.ev;
  (E.previews || []).forEach((u) => u && URL.revokeObjectURL(u));
  E.files = files;
  E.previews = files.map((f) => (f.type.startsWith('image/') ? URL.createObjectURL(f) : null));
  const ty = files[0].type;
  E.cat = cat || E.cat || (ty.startsWith('audio/') ? 'audio' : /pdf|word|text/.test(ty) || /\.(docx?|txt|pdf)$/i.test(files[0].name) ? 'document' : null);
  E.step = 'files'; E.note = ''; E.busy = false;
  S.overlay = { type: 'evidence' }; renderOverlay();
}

async function refreshEvidence() {
  const d = await api('/api/evidence');
  S.boot.evidence = d.evidence; S.boot.journal = d.journal; S.boot.dossier = d.dossier;
}

async function submitEvidence() {
  const E = S.ev;
  if (!E.files || !E.files.length) { toast(t('Choisissez d\'abord une photo ou un fichier')); return; }
  if (!E.cat) { toast(t('Choisissez le type de preuve')); return; }
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
  E.busy = false; E.files = null; E.previews = null; E.note = ''; E.cat = null; E.step = 'type'; S.overlay = null;
  render(); toast(n > 1 ? t('{n} preuves ajoutées au coffre', { n }) : t('Ajouté au coffre'));
}

async function submitJournal() {
  const E = S.ev; if (!E.jtext.trim()) { toast(t('Décrivez d\'abord ce qui s\'est passé')); return; }
  E.busy = true; render();
  try { await api('/api/journal', { method: 'POST', body: { text: E.jtext, occurred: E.jdate || localDT() } }); await refreshEvidence(); }
  catch (e) { toast(e.message); E.busy = false; render(); return; }   // on garde le texte pour réessayer
  E.busy = false; E.jtext = ''; E.jdate = ''; render(); toast(t('Entrée enregistrée'));
}

// --- 4e. Ressources : guides, paroles, liens --------------------------------
function appResources() {
  const R = S.boot.resources;
  return `<div class="fade-in"><div class="page-title">${t('Guides et témoignages')}</div><p class="page-sub">${t('Comprendre, préparer, agir. À votre rythme.')}</p>
    <div class="section-title">${t('Guides pratiques')}</div>
    ${R.guides.map((g) => `<button class="guide-card" data-action="res-open" data-id="${esc(g.id)}">${ic(GUIDE_ICON[g.icon] || 'book', g.tone || 'rose')}<div><b>${esc(g.title)}</b><span>${esc(g.summary)}</span></div><span class="chev">${LI.chevR}</span></button>`).join('')}
    <div class="section-title">${t('Elles en parlent')}</div>
    ${R.testimonies.map((t) => `<div class="quote-card"><p>${esc(t.text)}</p><small>${esc(t.name)}</small></div>`).join('')}
    <p class="illus-note">${t('Récits illustratifs écrits pour le prototype — à remplacer par des témoignages recueillis avec l\'accord des personnes.')}</p>
    <div class="section-title">${t('Sites utiles')}</div>
    ${R.links.map((l) => `<button class="link-card" data-action="web" data-url="${esc(l.url)}">${ic('link', 'lavande', 'sm')}<div><b>${esc(l.title)}</b><span>${esc(l.desc)}</span></div><span class="chev">${LI.chevR}</span></button>`).join('')}
    <p class="ev-note">${LI.info}<span>${esc(R.links_note)}</span></p>
  </div>`;
}

// ===========================================================================
// 5. SUPERPOSITIONS : appel, message, réglages, feuille d'ajout, guide, Face ID, confirmation
// ===========================================================================
function renderOverlay() {
  clearInterval(callTimer);
  const O = S.overlay;
  if (!O) { overlaysEl.innerHTML = ''; return; }
  if (O.type === 'call') {
    const c = O.contact;
    overlaysEl.innerHTML = `<div class="overlay"><div class="call ${O.sos ? 'sos' : ''}">
      <span class="via">${O.sos ? t('Appel d\'urgence · via {app}', { app: APP_NAME }) : t('Appel via {app}', { app: APP_NAME })}</span>
      <div class="av">${O.sos ? LI.siren : LI.phone}</div>
      <h2>${esc(c.title)}</h2><div class="org">${esc(c.org)}</div><div class="num">${esc(c.phone)}</div>
      <div class="st" id="call-status">${t('Appel en cours…')}</div>
      <div class="grow"></div>
      <div class="keys"><div class="key"><i>${I.mic}</i>${t('Muet')}</div><div class="key"><i>${I.speaker}</i>${t('Haut-parleur')}</div><div class="key"><i>${I.keypad}</i>${t('Clavier')}</div></div>
      <button class="hangup" data-action="hangup">${I.phone}</button>
      <p class="note">${O.sos ? `${t('La police intervient 24h/24.')} ` : ''}${t('Cet appel passe par l\'application et n\'apparaît pas dans l\'historique d\'appels du téléphone.')}</p>
    </div></div>`;
    const t0 = Date.now();
    callTimer = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); const el = $('#call-status');
      if (el) el.textContent = s < 3 ? t('Appel en cours…') : `${t('Connecté')} · ${String(Math.floor((s - 3) / 60)).padStart(2, '0')}:${String((s - 3) % 60).padStart(2, '0')}`; }, 500);
    return;
  }
  if (O.type === 'sms') {
    const c = O.contact;
    overlaysEl.innerHTML = `<div class="overlay dim" data-action="overlay-close"><div class="sheet" data-stop><div class="grip"></div><h3>${t('Message à {org}', { org: esc(c.org) })}</h3>
      <p class="small muted" style="margin:0 0 12px">${esc(c.phone)} · ${t('envoyé via {app}, sans trace dans l\'application Messages.', { app: APP_NAME })}</p>
      <div class="field"><textarea data-input="sms-text">${esc(O.text)}</textarea></div>
      <button class="btn primary block" data-action="sms-send">${t('Envoyer')}</button></div></div>`;
    return;
  }
  if (O.type === 'evidence') {
    const E = S.ev; const cats = S.boot.evidence_categories;
    const tile = (c) => `<label class="${E.cat === c.id ? 'on' : ''}"><input type="file" data-input="ev-file" data-cat="${esc(c.id)}" multiple accept="${c.id === 'audio' ? 'audio/*' : EV_ACCEPT}">${ic(EV_ICON[c.id] || 'clip', EV_TONE[c.id] || 'or')}${esc(c.label)}</label>`;
    if (E.step !== 'files' || !E.files) {
      overlaysEl.innerHTML = `<div class="overlay dim" data-action="overlay-close"><div class="sheet ev-sheet" data-stop><div class="grip"></div><h3>${t('Quel type de preuve ?')}</h3>
        <p class="small muted" style="margin:-4px 0 14px">${t('Touchez un type : votre téléphone vous propose ensuite la photo ou le fichier.')}</p>
        <div class="type-tiles">${cats.map(tile).join('')}${isTouch() ? `<label><input type="file" data-input="ev-file" data-cat="blessure" accept="image/*" capture="environment">${ic('camera', 'rose')}${t('Prendre une photo')}</label>` : ''}</div>
        <p class="ev-note">${LI.info}<span>${t('La date et l\'heure d\'ajout sont enregistrées automatiquement. 50 Mo max. par fichier.')}</span></p></div></div>`;
      return;
    }
    const n = E.files.length; const busy = E.busy !== false; const cat = cats.find((c) => c.id === E.cat);
    overlaysEl.innerHTML = `<div class="overlay dim" data-action="overlay-close"><div class="sheet ev-sheet" data-stop><div class="grip"></div><h3>${t('Ajouter au coffre')}</h3>
      ${cat ? `<div class="chosen-type">${ic(EV_ICON[cat.id] || 'clip', EV_TONE[cat.id] || 'or', 'sm')}<b>${esc(cat.label)}</b><button data-action="ev-step-type" ${busy ? 'disabled' : ''}>${t('Changer')}</button></div>`
        : `<div class="ev-label">${t('Type de preuve')}</div><div class="type-tiles" style="margin-bottom:14px">${cats.map((c) => `<button class="${E.cat === c.id ? 'on' : ''}" data-action="ev-cat" data-cat="${esc(c.id)}">${ic(EV_ICON[c.id] || 'clip', EV_TONE[c.id] || 'or')}${esc(c.label)}</button>`).join('')}</div>`}
      <div class="ev-preview">${E.files.map((f, i) => `<div class="pv">${E.previews[i] ? `<img src="${E.previews[i]}" alt="">` : `<span class="pv-ic">${LI.doc}</span>`}
        <div class="pv-t"><b>${esc(f.name)}</b><span>${fmtSize(f.size)}</span></div></div>`).join('')}
        <label class="link-btn pv-change"><input type="file" data-input="ev-file" multiple accept="${EV_ACCEPT}" hidden>${t('Changer de fichier')}</label></div>
      <div class="field"><label>${t('Note')} <span class="opt">${t('(facultatif)')}</span></label><input data-input="ev-note" placeholder="${t('Ex. : bras gauche, lundi soir')}" value="${esc(E.note)}"></div>
      <button class="btn primary block" data-action="ev-submit" ${busy ? 'disabled' : ''}>${busy ? `${t('Ajout en cours…')}${n > 1 ? ` ${E.busy}/${n}` : ''}` : `${LI.lock} ${n > 1 ? t('Ajouter {n} fichiers au coffre', { n }) : t('Ajouter au coffre')}`}</button></div></div>`;
    return;
  }
  if (O.type === 'settings') {
    const cfg = S.boot.config; const F = S.boot.features || {}; const P = S.boot.prefs || {};
    const wikiOn = S.front === 'wiki';
    const row = (icon, tone, title, sub, right = '') => `<div class="settings-row">${ic(icon, tone, 'sm')}<div class="sr-txt"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</div>${right}</div>`;
    const btn = (action, label, kind = 'soft') => `<button class="btn ${kind} sm" data-action="${action}">${label}</button>`;
    const tag = (s) => (s === 'placeholder' ? `<span class="pill soon">${t('À venir')}</span>` : s === 'demo' ? `<span class="pill demo">${t('démo')}</span>` : '');
    const active = `<span class="pill on">${t('Actif')}</span>`;
    const FEAT_ICON = { face_id: ['faceid', 'lavande'], emergency_recording: ['video', 'rose'] };
    const featDesc = (key, f) => (key !== 'face_id' ? f.desc : wikiOn
      ? t('Sur l\'accueil de Wikipédia, gardez le doigt appuyé sur le titre de l\'article : Face ID ouvre Abri, sans mot secret.')
      : t('Dans l\'onglet Favoris, gardez le doigt appuyé sur une recette : Face ID ouvre Abri, sans code secret.'));
    const featRow = ([key, f]) => (f.hidden ? '' : row(...(FEAT_ICON[key] || ['sparkle', 'rose']), `${esc(f.label)} ${tag(f.status)}`, esc(featDesc(key, f)),
      `<button class="switch ${P[key] ? 'on' : ''}" data-action="pref-toggle" data-key="${esc(key)}" aria-label="${esc(f.label)}"></button>`));
    const word = cfg.wiki_word
      ? `<span class="secret-word">${O.reveal ? esc(cfg.wiki_word) : '•'.repeat(Math.min(12, Math.max(6, cfg.wiki_word.length)))}</span>
         <button class="reveal" data-action="word-reveal" aria-label="${O.reveal ? t('Masquer le mot secret') : t('Afficher le mot secret')}">${O.reveal ? LI.eyeoff : LI.eye}</button>`
      : cfg.has_wiki ? t('Enregistré (choisi avant cette version : modifiez-le pour le voir ici)') : t('Pas encore choisi');
    const frontName = wikiOn ? L10N.wiki.brand : 'Petits Plats';
    overlaysEl.innerHTML = `<div class="overlay dim" data-action="overlay-close"><div class="sheet settings-sheet" data-stop><div class="grip"></div>
      <div class="sheet-head"><h3>${t('Réglages')}</h3><button class="icon-btn" data-action="sheet-close" aria-label="${t('Fermer')}">${LI.x}</button></div>
      <div class="set-sec">${t('Apparence de l\'app')}</div>
      <div class="front-pick">${[['recettes', 'home', t('Recettes'), 'peche'], ['wiki', 'wiki', L10N.wiki.brand, 'bleu']].map(([id, icon, label, tone]) => `<button class="${S.front === id ? 'on' : ''}" data-action="front-set" data-front="${id}">${ic(icon, tone, 'sm')}<span>${esc(label)}${S.front === id ? `<small>${t('Utilisée')}</small>` : ''}</span></button>`).join('')}</div>
      <div class="set-sec">${t('Langue')}</div>
      ${langButtons('lang-pick')}
      <div class="set-sec">${t('Codes secrets')}</div>
      <div class="set-card">
        ${row('home', 'peche', `${t('Recette secrète')} ${wikiOn ? '' : active}`, `${esc(cfg.recipe.name)} · ${tn(cfg.persons, '{n} personne', '{n} personnes')}`, btn('settings-change', t('Modifier')))}
        ${row('wiki', 'bleu', `${t('Mot secret Wikipédia')} ${wikiOn ? active : ''}`, word, btn('phrase-edit', cfg.has_wiki ? t('Modifier') : t('Choisir')))}
      </div>
      <div class="set-sec">${t('Ouverture rapide')}</div>
      <div class="set-card">${Object.entries(F).map(featRow).join('')}</div>
      <div class="set-sec">${t('Sécurité')}</div>
      <div class="set-card">
        ${row('timer', 'menthe', t('Verrouillage automatique'), t('Retour à {front} après 3 min sans activité.', { front: frontName }))}
        ${row('bolt', 'or', t('Sortie rapide'), t('Bouton « {back} » ou touche Échap.', { back: wikiOn ? t('Retour à Wikipédia') : t('Retour en cuisine') }))}
        ${row('lock', 'lavande', t('Verrouiller maintenant'), t('Ferme l\'espace protégé tout de suite.'), btn('quick-exit', t('Verrouiller'), 'lav'))}
      </div>
      <div class="set-sec">${t('Démo')}</div>
      <div class="set-card">${row('refresh', 'sos', t('Réinitialiser la démo'), t('Efface les codes secrets, les preuves et le journal.'), btn('reset-ask', t('Effacer'), 'danger'))}</div>
      <p class="tiny muted set-foot">${t('Source du questionnaire et du réseau d\'aide : canton de Vaud (vd.ch).')}</p></div></div>`;
    return;
  }
  if (O.type === 'guide') {
    const g = S.boot.resources.guides.find((x) => x.id === O.id); if (!g) { S.overlay = null; overlaysEl.innerHTML = ''; return; }
    const c = g.contact ? S.boot.contacts.find((x) => x.id === g.contact) : null;
    const gotoLabel = { ev: t('Ouvrir le coffre'), loc: t('Vérifier ma position'), quiz: t('Faire le point') }[g.goto];
    overlaysEl.innerHTML = `<div class="overlay dim" data-action="overlay-close"><div class="sheet guide-sheet" data-stop><div class="grip"></div>
      <div class="g-head">${ic(GUIDE_ICON[g.icon] || 'book', g.tone || 'rose')}<h3>${esc(g.title)}</h3></div>
      <p class="g-intro">${esc(g.intro)}</p>
      <ol class="g-steps">${g.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
      <div class="g-acts">${c ? `<button class="btn primary" data-action="call" data-id="${esc(c.id)}">${LI.phone} ${esc(c.org.length > 22 ? c.title : c.org)}</button>` : ''}${g.goto ? `<button class="btn lav" data-action="res-goto" data-goto="${esc(g.goto)}">${gotoLabel}</button>` : ''}</div>
      </div></div>`;
    return;
  }
  if (O.type === 'faceid') {
    overlaysEl.innerHTML = `<div class="overlay"><div class="faceid ${O.ok ? 'ok' : ''}"><div class="fi">${O.ok ? LI.check : LI.faceid}</div><b>${O.ok ? t('Reconnue') : 'Face ID'}</b><small>${O.ok ? t('Ouverture…') : t('Regardez l\'écran')}</small></div></div>`;
    return;
  }
  if (O.type === 'chat') {
    const A = S.boot.assistant; const Ch = S.chat;
    const acts = (m) => (m.actions && m.actions.length ? `<div class="chat-acts">${m.actions.map((a) => a.contact
      ? `<button data-action="chat-act" data-contact="${esc(a.contact)}">${LI.phone} ${esc(a.label)}</button>`
      : `<button data-action="chat-act" data-goto="${esc(a.goto)}">${esc(a.label)}</button>`).join('')}</div>` : '');
    const started = Ch.messages.some((m) => m.from === 'me');
    overlaysEl.innerHTML = `<div class="overlay chat-wrap${O.anim ? ' anim' : ''}" data-action="overlay-close"><div class="chat-panel" data-stop>
      <header class="chat-head"><span class="chat-av">${LI.robot}</span><div><b>${esc(A.name)}</b><span>${esc(A.status)}</span></div>
        <button class="icon-btn" data-action="chat-close" aria-label="${t('Fermer')}">${LI.x}</button></header>
      <button class="chat-sos" data-action="sos">${LI.siren} ${t('Danger immédiat ? Appeler le 117')}</button>
      <div class="chat-log" id="chat-log">
        ${Ch.messages.map((m) => `<div class="msg ${m.from}"><p>${esc(m.text)}</p>${acts(m)}</div>`).join('')}
        ${Ch.typing ? '<div class="msg bot typing"><p><i></i><i></i><i></i></p></div>' : ''}
        ${started ? '' : `<div class="chat-sugg">${A.suggestions.map((t) => `<button data-action="chat-suggest" data-text="${esc(t)}">${esc(t)}</button>`).join('')}</div>`}
      </div>
      <div class="chat-compose"><textarea class="chat-input" data-input="chat-text" rows="1" placeholder="${t('Écrivez votre message…')}">${esc(Ch.text)}</textarea>
        <button class="chat-send" data-action="chat-send" aria-label="${t('Envoyer')}">${LI.send}</button></div>
      <p class="chat-notice">${esc(A.notice)}</p>
    </div></div>`;
    const log = $('#chat-log', overlaysEl); log.scrollTop = log.scrollHeight;
    return;
  }
  if (O.type === 'confirm') {
    overlaysEl.innerHTML = `<div class="overlay center" data-action="overlay-close"><div class="confirm-box" data-stop><h3>${esc(O.title)}</h3><p>${esc(O.text)}</p>
      <div class="row"><button class="btn muted block" data-action="overlay-close">${t('Annuler')}</button><button class="btn ${O.danger ? 'danger' : 'primary'} block" data-action="confirm-ok">${esc(O.ok)}</button></div></div></div>`;
    return;
  }
}

// --- Assistant (aperçu) ------------------------------------------------------
// Le bouton « robot » (ou glisser vers la droite) ouvre le panneau ; vers la gauche le ferme.
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
    reply = { text: t('Connexion impossible pour le moment. Vous pouvez appeler le 142 à tout moment.'), actions: [{ label: t('Appeler le 142'), contact: 'victimes142' }] };
  }
  Ch.typing = false; Ch.messages.push({ from: 'bot', text: reply.text, actions: reply.actions || [] });
  if (S.overlay && S.overlay.type === 'chat') { renderOverlay(); if (!isTouch()) $('.chat-input', overlaysEl)?.focus(); }
}

// --- Face ID (simulation) : ouverture rapide depuis l'apparence publique -----
// Geste : appui long sur une recette des favoris, ou sur le titre de l'accueil de Wikipédia
// (voir pressTarget). Une vraie app utiliserait la biométrie du téléphone ; ici l'animation
// est simulée, puis /api/cover/quick délivre le jeton si l'option est activée.
let faceIdBusy = false;
async function startFaceId() {
  if (faceIdBusy || (S.mode !== 'cover' && S.mode !== 'wiki') || !S.quick) return;
  faceIdBusy = true;
  S.overlay = { type: 'faceid', ok: false }; renderOverlay();
  const [res] = await Promise.all([api('/api/cover/quick', { method: 'POST' }).catch(() => null), new Promise((r) => setTimeout(r, 1300))]);
  if (!res || !res.token) { S.overlay = null; renderOverlay(); faceIdBusy = false; return; }   // option désactivée : rien ne se passe
  S.overlay.ok = true; renderOverlay();
  setTimeout(() => { S.overlay = null; renderOverlay(); faceIdBusy = false; unlock(res.token); }, 550);
}

function openCall(contactId, sos = false) {
  const c = S.boot.contacts.find((x) => x.id === contactId); if (!c) return;
  S.overlay = { type: 'call', contact: c, sos }; renderOverlay();
}
function openSms(contactId) {
  const c = S.boot.contacts.find((x) => x.id === contactId); if (!c) return;
  S.overlay = { type: 'sms', contact: c, text: t('Bonjour, j\'ai besoin d\'aide. Pouvez-vous me rappeler à un moment discret ? Merci de ne pas laisser de message vocal.') };
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
  'cover-fav': (d) => { const f = S.cover.favs; f.has(d.id) ? f.delete(d.id) : f.add(d.id); render();
    api('/api/cover/favs', { method: 'POST', body: { favs: [...f] } }).catch(() => {}); },
  'persons-inc': () => { S.cover.persons = Math.min(S.personsMax, S.cover.persons + 1); render(); },
  'persons-dec': () => { S.cover.persons = Math.max(S.personsMin, S.cover.persons - 1); render(); },
  'adapt': adaptRecipe,
  'add-cart': (d) => { const r = findRecipe(d.id); if (!r) return;
    S.cover.cart.push(...scaleIngredients(r, S.cover.adapted).map((i) => ({ ...i, done: false }))); toast(t('Ingrédients ajoutés à la liste')); },
  'cart-check': (d) => { S.cover.cart[+d.n].done = !S.cover.cart[+d.n].done; render(); },
  'cart-clear': () => { S.cover.confirmClear = true; render(); },
  'cart-clear-cancel': () => { S.cover.confirmClear = false; render(); },
  'cart-clear-confirm': () => { S.cover.cart = []; S.cover.confirmClear = false; render(); toast(t('Liste de courses vidée')); },
  'cart-remove-done': () => { const n = S.cover.cart.filter((i) => i.done).length;
    S.cover.cart = S.cover.cart.filter((i) => !i.done); render(); toast(tn(n, '{n} article retiré', '{n} articles retirés')); },
  'profile-toggle': (d) => { S.cover.profile[d.k] = !S.cover.profile[d.k]; render(); },
  'cover-lang': () => { S.cover.langOpen = !S.cover.langOpen; render(); },
  // Langue : enregistrée sur le serveur (comme l'apparence), puis recettes, contenus d'Abri et
  // Wikipédia sont rechargés dans la nouvelle langue, sans quitter l'écran en cours.
  'lang-set': async (d) => {
    if (d.lang === L10N.lang) return;
    try {
      applyLang(await api('/api/lang', { method: 'POST', body: { lang: d.lang } }));
      const rec = await api('/api/cover/recipes');
      S.recipes = rec.recipes; S.daily = rec.daily;
      if (S.cover.recipe) S.cover.recipe = findRecipe(S.cover.recipe.id) || S.cover.recipe;
      if (S.token) {                  // dans Abri (ou en modifiant le code secret depuis Abri)
        S.boot = await api('/api/app/bootstrap');
        if (S.quiz.result) S.quiz.result = S.boot.last_result;
        if (S.loc.scan) S.loc.scan = await api('/api/location/scan', { method: 'POST' });
        if (!S.chat.messages.some((m) => m.from === 'me')) S.chat.messages = S.boot.assistant.greeting.map((text) => ({ from: 'bot', text }));
      }
    } catch (e) { toast(e.message); return; }
    wikiCache.clear();
    render(); if (S.overlay) renderOverlay();
  },
  // — espace protégé
  'tab': (d) => { S.tab = d.tab; render(); const c = $('.content', screen); if (c) c.scrollTop = 0; },
  // un seul domaine ouvert à la fois : ouvrir l'un referme les autres
  'axis-toggle': (d) => { const open = !S.home.open[d.axis]; S.home.open = open ? { [d.axis]: true } : {}; render();
    if (open) { const h = $(`.axis-head[data-axis="${d.axis}"]`, screen); if (h) h.scrollIntoView({ behavior: 'smooth', block: 'start' }); } },
  'freeze-toggle': toggleFreeze,
  'office-map': (d) => selectOffice(d.id, true),
  'office-close': () => { S.loc.selected = null; S.loc.refit = true; render(); },
  'call-office': (d) => openOfficeCall(d.id),
  'quick-exit': () => lock(true),
  'settings': () => { S.overlay = { type: 'settings' }; renderOverlay(); },
  'settings-change': () => { S.overlay = null; S.setup = { step: 0, recipe: S.boot.config.recipe_id, persons: S.boot.config.persons, fromSettings: true }; S.mode = 'setup'; render(); },
  'front-set': async (d) => {
    if (d.front === S.front) return;
    // Wikipédia sans mot secret : on passe par son accueil (explication + choix du mot)
    if (d.front === 'wiki' && !S.boot.config.has_wiki) { startWikiSetup(true); return; }
    try { S.front = (await api('/api/app/front', { method: 'POST', body: { front: d.front } })).front; }
    catch (e) { toast(e.message); return; }
    setIdentity(); renderOverlay(); toast(S.front === 'wiki' ? t('✓ En quittant, l\'app ressemblera à Wikipédia') : t('✓ En quittant, l\'app ressemblera aux recettes'));
  },
  'phrase-edit': () => startWikiSetup(false),
  'word-reveal': () => { S.overlay.reveal = !S.overlay.reveal; renderOverlay(); },
  'wsetup-cancel': () => { S.setup = { step: 0, recipe: null, persons: 4, fromSettings: false }; S.mode = 'app'; render(); S.overlay = { type: 'settings' }; renderOverlay(); },
  'wsetup-check': () => {
    if (norm(S.setup.word).replace(/ /g, '').length < 4) { toast(t('Au moins 4 lettres ou chiffres')); $('.word-input', screen)?.focus(); return; }
    S.setup.step = 2; render();
  },
  'wsetup-finish': wikiSetupFinish,
  // Options : « démo » = visible dans l'interface ; « à venir » = seulement mémorisé (voir logic.FEATURES)
  'pref-toggle': async (d) => {
    const on = !S.boot.prefs[d.key];
    try { const r = await api('/api/app/pref', { method: 'POST', body: { key: d.key, value: on } }); S.boot.prefs = r.prefs; S.boot.prefs_at = r.prefs_at || S.boot.prefs_at; }
    catch (e) { toast(e.message); return; }
    if (d.key === 'face_id') S.quick = on;
    renderOverlay();
    const f = (S.boot.features || {})[d.key] || {};
    toast(!on ? t('Désactivé') : f.status === 'placeholder' ? t('Enregistré — fonctionnalité pas encore disponible')
      : d.key === 'face_id' ? (S.front === 'wiki' ? t('Activé : appui long sur le titre de l\'accueil') : t('Activé : appui long sur une recette favorite')) : t('Activé'));
  },
  'reset-ask': () => confirmBox(t('Réinitialiser la démo ?'), t('Le code secret, les preuves, le journal et les résultats seront effacés. L\'application repartira du premier lancement.'), t('Tout effacer'), async () => {
    try { await api('/api/app/reset', { method: 'POST' }); } catch (e) { /* le jeton est déjà invalide */ }
    S.token = null; S.boot = null; S.overlay = null; S.front = 'recettes'; S.quick = false; S.cover.favs = new Set(); S.setup = { step: 0, recipe: null, persons: 4, fromSettings: false };
    S.mode = 'setup'; render(); toast(t('Démo réinitialisée')); }, true),
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
  'sheet-close': () => closeSheet(),
  'sos': () => openCall('police', true),
  'call': (d) => openCall(d.id),
  'sms': (d) => openSms(d.id),
  'sms-send': () => { S.overlay = null; renderOverlay(); toast(t('Message envoyé ✓')); },
  'hangup': () => { S.overlay = null; renderOverlay(); },
  'web': (d) => confirmBox(t('Ouvrir le site ?'), t('Il s\'ouvrira dans le navigateur du téléphone. Pensez à effacer l\'historique ensuite, ou utilisez la navigation privée.'), t('Ouvrir'), () => window.open(d.url, '_blank', 'noopener')),
  // — ressources
  'res-open': (d) => { S.overlay = { type: 'guide', id: d.id }; renderOverlay(); },
  'res-goto': (d) => { S.overlay = null; renderOverlay(); S.tab = d.goto; if (d.goto === 'ev') S.ev.sub = 'pieces'; render(); },
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
    if (d.goto === 'evidence') { S.tab = 'ev'; S.ev.sub = 'pieces'; S.ev.cat = d.cat || null; S.ev.step = 'type'; render(); S.overlay = { type: 'evidence' }; renderOverlay(); return; }
    if (d.goto === 'journal') { S.tab = 'ev'; S.ev.sub = 'journal'; render(); return; }
    if (d.goto === 'dossier') { const el = $('#dossier', screen); if (el) el.scrollIntoView({ behavior: 'smooth' }); }
  },
  // — position
  'scan': startScan,
  'loc-platform': (d) => { S.loc.platform = d.platform; render(); },
  'group-toggle': (d) => { S.loc.groups[d.group] = !S.loc.groups[d.group]; render(); },
  'audit-open': (d) => { S.loc.open[d.item] = !S.loc.open[d.item]; render(); },
  'audit-toggle': (d) => toggleAudit(d.item),
  'audit-goto': (d) => { const it = S.boot.audit.items.find((i) => i.id === d.item); if (it) S.loc.groups[it.group] = true; S.loc.open[d.item] = true; render();
    const el = $(`#audit-${d.item}`, screen); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); },
  // — coffre
  'ev-sub': (d) => { S.ev.sub = d.sub; render(); },
  'ev-add': () => { S.ev.cat = null; S.ev.step = 'type'; S.ev.files = null; S.overlay = { type: 'evidence' }; renderOverlay(); },
  'ev-step-type': () => { if (S.ev.busy === false) { S.ev.step = 'type'; renderOverlay(); } },
  'ev-cat': (d) => { if (S.ev.busy === false) { S.ev.cat = d.cat; renderOverlay(); } },
  'ev-submit': submitEvidence,
  'ev-del': (d) => confirmBox(t('Supprimer cette preuve ?'), t('Elle sera supprimée définitivement du coffre.'), t('Supprimer'), async () => {
    try { await api(`/api/evidence/${d.id}`, { method: 'DELETE' }); await refreshEvidence(); render(); } catch (e) { toast(e.message); } }, true),
  'ev-export': () => { const a = document.createElement('a'); a.href = `/api/evidence/export?t=${encodeURIComponent(S.token)}`; a.download = ''; document.body.appendChild(a); a.click(); a.remove(); toast(t('Téléchargement du dossier lancé')); },
  'journal-add': submitJournal,
  'journal-del': (d) => confirmBox(t('Supprimer cette entrée ?'), t('Elle sera supprimée définitivement du journal.'), t('Supprimer'), async () => {
    try { await api(`/api/journal/${d.id}`, { method: 'DELETE' }); await refreshEvidence(); render(); } catch (e) { toast(e.message); } }, true),
};

const inputs = {
  'wiki-q': (el) => { S.wiki.q = el.value; clearTimeout(wikiTimer);
    if (!norm(el.value)) { S.wiki.results = []; paintWikiResults(); return; }
    wikiTimer = setTimeout(() => wikiSearch(el.value), 200); },
  'wsetup-word': (el) => { S.setup.word = el.value; },
  'chat-text': (el) => { S.chat.text = el.value; el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 110)}px`; },
  'cover-search': (el) => { S.cover.query = el.value; refreshGrid(); },
  'persons': (el) => { const v = parseInt(el.value, 10); if (!isNaN(v)) { S.cover.persons = Math.max(S.personsMin, Math.min(S.personsMax, v)); } },
  'jtext': (el) => { S.ev.jtext = el.value; },
  'jdate': (el) => { S.ev.jdate = el.value; },
  'sms-text': (el) => { if (S.overlay) S.overlay.text = el.value; },
  'ev-note': (el) => { S.ev.note = el.value; },
  // un champ fichier déclenche « input » puis « change » : on vide le champ après lecture.
  // data-cat = type choisi sur la tuile (feuille d'ajout)
  'ev-file': (el) => { if (!el.files.length) return; const list = [...el.files]; const cat = el.dataset.cat || null; el.value = ''; openEvidenceSheet(list, cat); },
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
  swipe = S.mode === 'app' && !target.closest('.map-slot, .leaflet-container, input, textarea, select, .dropzone')
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
// Feuilles (réglages, ajout de preuve, guide…) : glisser vers le bas les referme, comme sur
// un téléphone. Le geste part de n'importe où dans la feuille, tant qu'elle est défilée en
// haut (sinon on laisse défiler) ; en dessous de 90 px, la feuille revient en place.
function closeSheet() {
  const sh = $('.sheet', overlaysEl);
  if (!sh) { S.overlay = null; renderOverlay(); return; }
  sh.style.transition = 'transform .2s ease-in'; sh.style.transform = 'translateY(100%)';
  sh.parentElement.classList.add('closing');
  setTimeout(() => { if ($('.sheet', overlaysEl) === sh) { S.overlay = null; renderOverlay(); } }, 190);
}
let drag = null;
function dragStart(target, y) {
  const sh = target.closest('.sheet');
  drag = sh && !target.closest('input, textarea, select, .switch') ? { sh, y, dy: 0, top: sh.scrollTop <= 0, moved: false } : null;
}
function dragMove(y, e) {
  if (!drag) return;
  const dy = y - drag.y;
  if (!drag.moved) {
    if (Math.abs(dy) < 8) return;
    if (dy < 0 || !drag.top || drag.sh.scrollTop > 0) { drag = null; return; }   // vers le haut, ou feuille défilée : défilement normal
    drag.moved = true; drag.sh.style.transition = 'none'; drag.sh.classList.add('dragging');
  }
  drag.dy = Math.max(0, dy);
  drag.sh.style.transform = `translateY(${drag.dy}px)`;
  if (e.cancelable) e.preventDefault();
}
function dragEnd() {
  if (!drag) return;
  const { sh, dy, moved } = drag; drag = null;
  if (!moved) return;
  sh.classList.remove('dragging');
  sheetDragged = true; setTimeout(() => { sheetDragged = false; }, 0);          // pas de clic parasite au relâcher
  if (dy > 90) closeSheet();
  else { sh.style.transition = 'transform .2s ease'; sh.style.transform = ''; }
}
let sheetDragged = false;
// doigt : événements tactiles (touchmove non passif, pour empêcher le défilement pendant le geste)
overlaysEl.addEventListener('touchstart', (e) => dragStart(e.target, e.touches[0].clientY), { passive: true });
overlaysEl.addEventListener('touchmove', (e) => dragMove(e.touches[0].clientY, e), { passive: false });
overlaysEl.addEventListener('touchend', dragEnd);
overlaysEl.addEventListener('touchcancel', dragEnd);
// souris (démo sur ordinateur)
overlaysEl.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse' && e.button === 0) dragStart(e.target, e.clientY); });
document.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') dragMove(e.clientY, e); });
document.addEventListener('pointerup', (e) => { if (e.pointerType === 'mouse') dragEnd(); });
overlaysEl.addEventListener('click', (e) => { if (sheetDragged) { sheetDragged = false; e.stopImmediatePropagation(); } }, true);

// Ouverture rapide « Face ID » : appui long sur une recette des favoris (app de cuisine) ou sur
// le titre de l'accueil (Wikipédia). Rien ne se passe si l'option n'est pas activée dans les
// Réglages d'Abri : un appui long ordinaire, puis le relâcher, ouvre simplement la recette.
let pressTimer = null;
let pressFired = false;                    // l'appui long a lancé Face ID : on ignore le clic qui suit
const pressTarget = (t) => S.quick && (
  (S.mode === 'cover' && S.cover.tab === 'favoris' && !S.cover.recipe && t.closest('.recipe-card') && !t.closest('.fav'))
  || (S.mode === 'wiki' && t.closest('.wk-title.wk-home')));
function pressStart(target) {
  clearTimeout(pressTimer); pressFired = false;
  if (pressTarget(target)) pressTimer = setTimeout(() => { pressFired = true; startFaceId(); }, 650);
}
const pressEnd = () => clearTimeout(pressTimer);
screen.addEventListener('touchstart', (e) => pressStart(e.target), { passive: true });
screen.addEventListener('mousedown', (e) => pressStart(e.target));
['touchend', 'touchmove', 'touchcancel', 'mouseup', 'mouseleave'].forEach((ev) => screen.addEventListener(ev, pressEnd, { passive: true }));
screen.addEventListener('contextmenu', (e) => { if (pressTarget(e.target)) e.preventDefault(); });
screen.addEventListener('click', (e) => { if (pressFired) { pressFired = false; e.stopImmediatePropagation(); e.preventDefault(); } }, true);
// Coffre : glisser-déposer des fichiers sur la zone d'ajout (ordinateur)
screen.addEventListener('dragover', (e) => { const z = e.target.closest('#ev-drop'); if (!z) return; e.preventDefault(); z.classList.add('over'); });
screen.addEventListener('dragleave', (e) => { const z = e.target.closest('#ev-drop'); if (z && !z.contains(e.relatedTarget)) z.classList.remove('over'); });
screen.addEventListener('drop', (e) => { const z = e.target.closest('#ev-drop'); if (!z) return; e.preventDefault(); z.classList.remove('over');
  if (e.dataTransfer.files.length) openEvidenceSheet(e.dataTransfer.files); });
// Recherche Wikipédia : Entrée valide (article, ou Abri si c'est le mot secret)
screen.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter') return;
  if (e.target.matches('.wk-input')) { e.preventDefault(); wikiSubmit(e.target.value); }
  else if (e.target.matches('.word-input')) { e.preventDefault(); actions['wsetup-check'](); }   // accueil Wikipédia : Entrée = Suivant
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if (S.overlay) { S.overlay = null; renderOverlay(); } else if (S.mode === 'app') lock(true); }
});

// ===========================================================================
// 7. DÉMARRAGE
// ===========================================================================
async function boot() {
  applyLang(L10N);
  tickClock(); setInterval(tickClock, 30000);
  try {
    const [rec, st, fv] = await Promise.all([api('/api/cover/recipes'), api('/api/setup/status'), api('/api/cover/favs').catch(() => ({ favs: [] }))]);
    S.recipes = rec.recipes; S.daily = rec.daily; S.categories = rec.categories;
    S.cover.favs = new Set(fv.favs || []);
    S.personsMin = st.persons_min; S.personsMax = st.persons_max;
    S.front = st.front || 'recettes'; S.quick = !!st.quick;
    S.mode = !st.configured ? 'setup' : S.front === 'wiki' ? 'wiki' : 'cover';
  } catch (e) {
    screen.innerHTML = `<div class="empty">${t('Impossible de joindre le serveur.')}<br><span class="small">${t('Lancez <code>python app.py</code>')}</span></div>`;
    return;
  }
  if (S.mode === 'wiki') wikiOpen(WIKI_HOME); else render();
}
boot();
