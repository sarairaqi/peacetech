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
  camera: svg('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
};

// ---------------------------------------------------------------------------
// État
// ---------------------------------------------------------------------------
const S = {
  mode: 'loading',                // 'setup' | 'cover' | 'app'
  recipes: [], categories: [], personsMin: 1, personsMax: 12,
  // persons : le nombre choisi (− / + / saisie) ; adapted : celui des quantités affichées,
  // mis à jour seulement par le bouton « Adapter les quantités »
  cover: { tab: 'recettes', cat: 'Tous', query: '', recipe: null, persons: 4, adapted: 4, confirmClear: false,
           favs: new Set(), cart: [], profile: { notif: true, metric: true, dark: false } },
  daily: [],                      // les 2 recettes du jour (S.recipes = les 60 recettes fixes)
  setup: { step: 0, recipe: null, persons: 4, fromSettings: false },
  token: null, boot: null, tab: 'quiz',
  quiz: { stage: 'intro', i: 0, answers: {}, situation: {}, si: 0, result: null, busy: false },
  loc: { scanning: false, scanStep: 0, scan: null, open: {} },
  ev: { sub: 'pieces', cat: 'blessure', file: null, note: '', jtext: '', jdate: '' , busy: false },
  contacts: { open: {} },
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
  if (S.mode === 'cover') return `cover:${S.cover.tab}:${S.cover.recipe ? S.cover.recipe.id : ''}`;
  return `${S.mode}:${S.setup.step}`;
}

function render() {
  const key = viewKey();
  const prevKey = lastViewKey;
  const content = $('.content', screen);
  const keepScroll = content && key === prevKey ? content.scrollTop : 0;
  lastViewKey = key;

  const abri = S.mode !== 'cover';
  const dark = !abri && S.cover.profile.dark;
  screen.className = `screen ${abri ? 'theme-abri' : 'theme-cover'}${dark ? ' dark' : ''}${screen.classList.contains('unlocking') ? ' unlocking' : ''}`;
  phoneEl.classList.toggle('on-abri', abri);
  phoneEl.classList.toggle('cover-dark', dark);

  if (S.mode === 'loading') screen.innerHTML = '';
  else if (S.mode === 'setup') screen.innerHTML = renderSetup();
  else if (S.mode === 'cover') screen.innerHTML = renderCover();
  else screen.innerHTML = renderApp();

  const c2 = $('.content', screen);
  if (c2 && keepScroll) c2.scrollTop = keepScroll;
  // pas d'animation d'apparition quand on redessine le même écran (évite le clignotement)
  if (key === prevKey) $$('.fade-in', screen).forEach((el) => el.classList.remove('fade-in'));
  if (!S.overlay || !overlaysEl.firstChild) renderOverlay();
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
    S.mode = 'app'; S.tab = 'quiz';
    S.quiz = { stage: 'intro', i: 0, answers: {}, situation: {}, si: 0, result: S.boot.last_result, busy: false };
    S.loc = { scanning: false, scanStep: 0, scan: null, open: {} };
    S.ev = { sub: 'pieces', cat: 'blessure', file: null, note: '', jtext: '', jdate: '', busy: false };
    S.contacts = { open: {} };
    S.overlay = null;
    render();
    resetIdle();
    setTimeout(() => screen.classList.remove('unlocking'), 400);
  }, 300);
}

function lock(notify = true) {
  if (S.token && notify) api('/api/app/lock', { method: 'POST' }).catch(() => {});
  S.token = null; S.boot = null; S.overlay = null;
  clearInterval(callTimer); clearTimeout(idleTimer);
  S.mode = 'cover'; S.cover.recipe = null; S.cover.tab = 'recettes'; S.cover.persons = 4;
  render();
}

function resetIdle() {
  clearTimeout(idleTimer);
  if (S.mode === 'app') idleTimer = setTimeout(() => lock(true), AUTO_LOCK_MS);
}

// ===========================================================================
// 4. ESPACE PROTÉGÉ — « Abri »
// ===========================================================================
function renderApp() {
  const tabs = { quiz: appQuiz, loc: appLocation, ev: appEvidence, contacts: appContacts };
  const tab = (id, icon, label) => `<button class="tab ${S.tab === id ? 'active' : ''}" data-action="tab" data-tab="${id}">${icon}${label}</button>`;
  return `<div class="view">
    <div class="topbar abri-top">
      <div class="brand"><span class="lg">${I.shield}</span> Abri</div>
      <span style="flex:1"></span>
      <button class="icon-btn" data-action="settings" title="Réglages">${I.gear}</button>
      <button class="exit-btn" data-action="quick-exit" title="Retour immédiat à l'app de cuisine">${I.exit} Quitter</button>
    </div>
    <div class="content">${tabs[S.tab]()}</div>
    <div class="bottombar abri-tabbar">
      ${tab('quiz', I.clipboard, 'Situation')}${tab('loc', I.pin, 'Localisation')}
      <div class="sos-slot"><button class="sos-btn" data-action="sos">SOS<small>POLICE 117</small></button></div>
      ${tab('ev', I.folder, 'Preuves')}${tab('contacts', I.phone, 'Contacts')}
    </div>
  </div>`;
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
const SCAN_STEPS = ['Recherche de profils de configuration et de gestion d\'appareil…', 'Vérification des partages de position (Localiser, Google Maps, Snap Map…)…', 'Analyse des permissions de localisation des applications…', 'Appareils connectés à votre compte…', 'Recherche de traqueurs Bluetooth…'];

function appLocation() {
  const L = S.loc; const A = S.boot.audit;
  const ring = (pct) => { const r = 34, c = 2 * Math.PI * r; const col = pct >= 80 ? '#2e9e5b' : pct >= 40 ? '#f2a900' : '#e63946';
    return `<div class="ring"><svg width="84" height="84" viewBox="0 0 84 84"><circle cx="42" cy="42" r="${r}" stroke="#1f3155" stroke-width="9" fill="none"/><circle cx="42" cy="42" r="${r}" stroke="${col}" stroke-width="9" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct / 100)}"/></svg><div class="val">${pct}%</div></div>`; };
  let scanBlock;
  if (L.scanning) scanBlock = `<ul class="scan-steps">${SCAN_STEPS.map((s, n) => `<li class="${n < L.scanStep ? 'done' : ''}">${n < L.scanStep ? '✓' : n === L.scanStep ? '<span class="spinner"></span>' : '·'} ${s}</li>`).join('')}</ul>`;
  else if (L.scan) {
    const lbl = { high: 'Élevé', medium: 'Moyen', ok: 'OK' };
    scanBlock = `<p class="small muted" style="margin:0 0 6px">${L.scan.counts.high} risque${L.scan.counts.high > 1 ? 's' : ''} élevé${L.scan.counts.high > 1 ? 's' : ''}, ${L.scan.counts.medium} moyen${L.scan.counts.medium > 1 ? 's' : ''} — analyse du ${fmtDate(L.scan.scanned_at)}</p>
      ${L.scan.findings.map((f) => `<div class="finding"><span class="badge ${f.level}">${lbl[f.level]}</span><div><b>${esc(f.text)}</b>${f.detail ? `<p>${esc(f.detail)}</p>` : ''}${f.level !== 'ok' ? `<button class="fix" data-action="audit-goto" data-item="${f.item}">Corriger →</button>` : ''}</div></div>`).join('')}
      <button class="btn soft sm" style="margin-top:12px" data-action="scan">Relancer l'analyse</button>`;
  } else scanBlock = `<p class="small muted" style="margin:0 0 12px">Recherche les profils suspects (logiciels espions), les partages de position actifs, les appareils inconnus connectés à vos comptes et les permissions trop larges.</p><button class="btn primary block" data-action="scan">Analyser mon téléphone</button>`;

  const item = (it) => { const open = L.open[it.id]; const done = A.done[it.id];
    return `<div class="audit-item ${done ? 'done' : ''}" id="audit-${it.id}"><div class="head"><span class="sev ${it.severity}"></span><button style="flex:1;text-align:left;color:inherit;display:flex;align-items:center;gap:8px" data-action="audit-open" data-item="${it.id}"><b style="flex:1">${esc(it.title)}</b>${open ? I.chevD : I.chevR}</button><button class="box ${done ? 'on' : ''}" data-action="audit-toggle" data-item="${it.id}" title="Marquer comme fait">${done ? I.check : ''}</button></div>
      ${open ? `<div class="body"><p class="risk">${esc(it.risk)}</p><ol>${it.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>` : ''}</div>`; };

  return `<div class="fade-in"><div class="page-title">Localisation</div><p class="page-sub">Coupez ou maîtrisez tout ce qui permet de suivre vos déplacements.</p>
    <div class="card score-card">${ring(A.score)}<div><b>Sécurité de la localisation</b><div class="muted small">${A.n_done} / ${A.n_total} vérifications effectuées</div><div class="tiny muted" style="margin-top:4px">Cochez chaque point une fois réglé sur votre téléphone.</div></div></div>
    <div class="card"><div class="row between" style="margin-bottom:6px"><h3 style="margin:0">Analyse automatique</h3><span class="tiny muted">démo · résultats simulés</span></div>${scanBlock}</div>
    <div class="card highlight-card"><h3>⚡ Tout couper d'un coup (iPhone)</h3><p class="small muted">Réglages › Confidentialité et sécurité › <b>Contrôle de sécurité</b> › <b>Réinitialisation d'urgence</b> : révoque en une fois tous les partages de position et les accès accordés à d'autres personnes et appareils.</p></div>
    ${A.groups.map((g) => `<div class="section-title">${g.icon} ${esc(g.title)}</div>${A.items.filter((i) => i.group === g.id).map(item).join('')}`).join('')}
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
function appEvidence() {
  const E = S.ev; const B = S.boot;
  const cats = Object.fromEntries(B.evidence_categories.map((c) => [c.id, c]));
  const seg = (id, label) => `<button class="${E.sub === id ? 'active' : ''}" data-action="ev-sub" data-sub="${id}">${label}</button>`;
  let body;
  if (E.sub === 'pieces') {
    body = `<button class="btn primary block" data-action="ev-add">${I.plus} Ajouter une preuve</button>
      <div style="height:12px"></div>
      ${B.evidence.length ? B.evidence.map((e) => `<div class="ev-item"><div class="thumb">${e.mime.startsWith('image/') ? `<img src="/api/evidence/file/${e.id}?t=${encodeURIComponent(S.token)}" alt="">` : (cats[e.category] || cats.autre).icon}</div>
        <div class="info"><div class="cat">${(cats[e.category] || cats.autre).icon} ${esc((cats[e.category] || cats.autre).label)}</div><div class="nm">${esc(e.note || e.name)}</div><div class="dt">Déposé le ${fmtDate(e.added_at)} · ${(e.size / 1024).toFixed(0)} Ko</div><div class="hash">SHA-256 ${e.sha256.slice(0, 16)}…</div></div>
        <button class="icon-btn del" data-action="ev-del" data-id="${e.id}">${I.trash}</button></div>`).join('')
      : `<div class="empty"><div class="em">🗂️</div>Photos de blessures, captures d'écran de messages, documents : chaque pièce est horodatée et reçoit une empreinte numérique.</div>`}`;
  } else if (E.sub === 'journal') {
    body = `<div class="card"><div class="field"><label>Que s'est-il passé ?</label><textarea data-input="jtext" placeholder="Décrivez les faits : quoi, où, qui était présent…">${esc(E.jtext)}</textarea></div>
      <div class="field"><label>Date et heure des faits</label><input type="datetime-local" data-input="jdate" value="${esc(E.jdate || localDT())}"></div>
      <button class="btn primary block" data-action="journal-add" ${E.busy ? 'disabled' : ''}>Ajouter à la chronologie</button></div>
      ${B.journal.length ? B.journal.map((j) => `<div class="journal-entry"><div class="row between"><span class="dt">Faits du ${fmtDate(j.occurred)}</span><button class="icon-btn del" style="width:30px;height:30px" data-action="journal-del" data-id="${j.id}">${I.trash}</button></div><p>${esc(j.text)}</p><div class="rec">Noté le ${fmtDate(j.recorded)} (horodatage automatique)</div></div>`).join('')
      : `<div class="empty"><div class="em">📝</div>Une chronologie précise est très utile pour une plainte ou une demande de protection.</div>`}`;
  } else {
    const D = B.dossier;
    body = `<div class="card"><div class="row between" style="margin-bottom:8px"><b>Votre dossier</b><span class="pill">${D.n_done} / ${D.n_total}</span></div>
      <div class="progress" style="margin:0 0 12px"><i style="width:${D.n_total ? Math.round(100 * D.n_done / D.n_total) : 0}%"></i></div>
      ${D.items.map((d) => `<div class="check-item"><div class="box ${d.done ? 'on' : ''}">${d.done ? I.check : ''}</div><div><b>${esc(d.label)}</b><p>${esc(d.detail)}</p>${d.manual ? '<p class="tiny">À rassembler vous-même (hors application).</p>' : ''}</div></div>`).join('')}</div>
      ${B.last_result ? '' : '<p class="small muted">Faites le questionnaire pour obtenir la liste des pièces adaptée à votre situation.</p>'}
      <button class="btn primary block" data-action="ev-export">${I.download} Exporter le dossier (ZIP)</button>
      <p class="tiny muted" style="text-align:center;margin-top:10px">Le ZIP contient les pièces renommées, un index avec les empreintes SHA-256 et la chronologie : prêt à remettre à un·e avocat·e ou au Centre LAVI.</p>`;
  }
  return `<div class="fade-in"><div class="page-title">Coffre à preuves</div><p class="page-sub">${I.lock} Chaque pièce est horodatée et reçoit une empreinte SHA-256 : on peut prouver qu'elle n'a pas été modifiée.</p>
    <div class="segmented">${seg('pieces', `Pièces (${B.evidence.length})`)}${seg('journal', `Journal (${B.journal.length})`)}${seg('dossier', `Dossier ${B.dossier.n_done}/${B.dossier.n_total}`)}</div>${body}</div>`;
}

async function refreshEvidence() {
  const d = await api('/api/evidence');
  S.boot.evidence = d.evidence; S.boot.journal = d.journal; S.boot.dossier = d.dossier;
}

async function submitEvidence() {
  const E = S.ev;
  if (!E.file) { toast('Choisissez un fichier'); return; }
  E.busy = true; renderOverlay();
  const form = new FormData(); form.append('file', E.file); form.append('category', E.cat); form.append('note', E.note);
  try { await api('/api/evidence', { method: 'POST', form }); await refreshEvidence(); }
  catch (e) { toast(e.message); E.busy = false; renderOverlay(); return; }
  E.busy = false; E.file = null; E.note = ''; S.overlay = null;
  render(); toast('Preuve ajoutée au coffre');
}

async function submitJournal() {
  const E = S.ev; if (!E.jtext.trim()) { toast('Décrivez les faits'); return; }
  E.busy = true; render();
  try { await api('/api/journal', { method: 'POST', body: { text: E.jtext, occurred: E.jdate || localDT() } }); await refreshEvidence(); }
  catch (e) { toast(e.message); }
  E.busy = false; E.jtext = ''; E.jdate = ''; render(); toast('Ajouté à la chronologie');
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
    const E = S.ev;
    overlaysEl.innerHTML = `<div class="overlay dim" data-action="overlay-close"><div class="sheet" data-stop><div class="grip"></div><h3>Ajouter une preuve</h3>
      <div class="field"><label>Type de pièce</label></div>
      <div class="cat-grid">${S.boot.evidence_categories.map((c) => `<button class="${E.cat === c.id ? 'on' : ''}" data-action="ev-cat" data-cat="${c.id}"><span class="em">${c.icon}</span>${esc(c.label)}</button>`).join('')}</div>
      <div class="field"><label>Fichier</label><div class="file-drop ${E.file ? 'has' : ''}">${E.file ? `📎 ${esc(E.file.name)}` : `${I.camera}<br>Photo, capture d'écran, PDF, audio…`}<input type="file" data-input="ev-file" accept="image/*,audio/*,video/*,application/pdf,.doc,.docx,.txt"></div></div>
      <div class="field"><label>Note (facultatif)</label><input data-input="ev-note" placeholder="Ex. : bras gauche, après la dispute du soir" value="${esc(E.note)}"></div>
      <button class="btn primary block" data-action="ev-submit" ${E.busy ? 'disabled' : ''}>${E.busy ? 'Chiffrement et dépôt…' : 'Déposer dans le coffre'}</button></div></div>`;
    return;
  }
  if (O.type === 'settings') {
    const cfg = S.boot.config;
    overlaysEl.innerHTML = `<div class="overlay dim" data-action="overlay-close"><div class="sheet" data-stop><div class="grip"></div><h3>Réglages</h3>
      <div class="settings-row"><div><b>Accès secret</b><span>${cfg.recipe.emoji} ${esc(cfg.recipe.name)} · ${cfg.persons} personne${cfg.persons > 1 ? 's' : ''}</span></div><button class="btn soft sm" data-action="settings-change">Modifier</button></div>
      <div class="settings-row"><div><b>Verrouillage automatique</b><span>Retour à Petits Plats après 3 min d'inactivité</span></div></div>
      <div class="settings-row"><div><b>Sortie rapide</b><span>Bouton « Quitter » ou touche Échap : retour immédiat à l'app de cuisine</span></div></div>
      <div class="settings-row"><div><b>Verrouiller maintenant</b><span>Ferme l'espace protégé</span></div><button class="btn muted sm" data-action="quick-exit">${I.lock} Verrouiller</button></div>
      <div class="settings-row"><div><b>Réinitialiser la démo</b><span>Efface le code secret, les preuves et le journal</span></div><button class="btn danger sm" data-action="reset-ask">Réinitialiser</button></div>
      <p class="tiny muted" style="margin-top:12px">Source du questionnaire et du réseau d'aide : canton de Vaud (vd.ch).</p></div></div>`;
    return;
  }
  if (O.type === 'confirm') {
    overlaysEl.innerHTML = `<div class="overlay center" data-action="overlay-close"><div class="confirm-box" data-stop><h3>${esc(O.title)}</h3><p>${esc(O.text)}</p>
      <div class="row"><button class="btn muted block" data-action="overlay-close">Annuler</button><button class="btn ${O.danger ? 'danger' : 'primary'} block" data-action="confirm-ok">${esc(O.ok)}</button></div></div></div>`;
    return;
  }
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
  'quick-exit': () => lock(true),
  'settings': () => { S.overlay = { type: 'settings' }; renderOverlay(); },
  'settings-change': () => { S.overlay = null; S.setup = { step: 0, recipe: S.boot.config.recipe_id, persons: S.boot.config.persons, fromSettings: true }; S.mode = 'setup'; render(); },
  'reset-ask': () => confirmBox('Réinitialiser la démo ?', 'Le code secret, les preuves, le journal et les résultats seront effacés. L\'application repartira du premier lancement.', 'Tout effacer', async () => {
    try { await api('/api/app/reset', { method: 'POST' }); } catch (e) { /* le jeton est déjà invalide */ }
    S.token = null; S.boot = null; S.overlay = null; S.setup = { step: 0, recipe: null, persons: 4, fromSettings: false };
    S.mode = 'setup'; render(); toast('Démo réinitialisée'); }, true),
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
    if (d.goto === 'evidence') { S.tab = 'ev'; S.ev.sub = 'pieces'; if (d.cat) S.ev.cat = d.cat; render(); if (d.cat) { S.overlay = { type: 'evidence' }; renderOverlay(); } return; }
    if (d.goto === 'journal') { S.tab = 'ev'; S.ev.sub = 'journal'; render(); return; }
    if (d.goto === 'dossier') { const el = $('#dossier', screen); if (el) el.scrollIntoView({ behavior: 'smooth' }); }
  },
  // — localisation
  'scan': startScan,
  'audit-open': (d) => { S.loc.open[d.item] = !S.loc.open[d.item]; render(); },
  'audit-toggle': (d) => toggleAudit(d.item),
  'audit-goto': (d) => { S.loc.open[d.item] = true; render(); const el = $(`#audit-${d.item}`, screen); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); },
  // — coffre
  'ev-sub': (d) => { S.ev.sub = d.sub; render(); },
  'ev-add': () => { S.ev.file = null; S.overlay = { type: 'evidence' }; renderOverlay(); },
  'ev-cat': (d) => { S.ev.cat = d.cat; renderOverlay(); },
  'ev-submit': submitEvidence,
  'ev-del': (d) => confirmBox('Supprimer cette pièce ?', 'Elle sera définitivement retirée du coffre.', 'Supprimer', async () => {
    try { await api(`/api/evidence/${d.id}`, { method: 'DELETE' }); await refreshEvidence(); render(); } catch (e) { toast(e.message); } }, true),
  'ev-export': () => { const a = document.createElement('a'); a.href = `/api/evidence/export?t=${encodeURIComponent(S.token)}`; a.download = ''; document.body.appendChild(a); a.click(); a.remove(); toast('Dossier exporté'); },
  'journal-add': submitJournal,
  'journal-del': (d) => confirmBox('Supprimer cette entrée ?', 'Elle sera retirée de la chronologie.', 'Supprimer', async () => {
    try { await api(`/api/journal/${d.id}`, { method: 'DELETE' }); await refreshEvidence(); render(); } catch (e) { toast(e.message); } }, true),
  // — contacts
  'axis-toggle': (d) => { S.contacts.open[d.axis] = S.contacts.open[d.axis] === false; render(); },
};

const inputs = {
  'cover-search': (el) => { S.cover.query = el.value; refreshGrid(); },
  'persons': (el) => { const v = parseInt(el.value, 10); if (!isNaN(v)) { S.cover.persons = Math.max(S.personsMin, Math.min(S.personsMax, v)); } },
  'jtext': (el) => { S.ev.jtext = el.value; },
  'jdate': (el) => { S.ev.jdate = el.value; },
  'sms-text': (el) => { if (S.overlay) S.overlay.text = el.value; },
  'ev-note': (el) => { S.ev.note = el.value; },
  'ev-file': (el) => { S.ev.file = el.files[0] || null; renderOverlay(); },
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
    S.mode = st.configured ? 'cover' : 'setup';
  } catch (e) {
    screen.innerHTML = `<div class="empty">Impossible de joindre le serveur.<br><span class="small">Lancez <code>python app.py</code></span></div>`;
    return;
  }
  render();
}
boot();
