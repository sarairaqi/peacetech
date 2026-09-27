// Console conseil — démo du côté destinataire de la messagerie Abri.
// Joue le rôle de l'organisation contactée : lit les messages reçus et y
// répond. Les réponses s'affichent dans l'app (bulles « incoming »).

const KEY = new URLSearchParams(location.search).get('k') || '';
const POLL_MS = 3000;

const QUICK_REPLIES = [
  'Bonjour, je suis là pour vous écouter. Êtes-vous en sécurité en ce moment ?',
  'Merci de nous avoir écrit. Pouvez-vous parler librement, ou préférez-vous qu\'on communique uniquement par écrit ?',
  'Si vous êtes en danger immédiat, appelez le 117. Sinon, nous pouvons vous proposer un rendez-vous confidentiel.',
  'Vous n\'êtes pas seul·e. Nous pouvons vous aider à trouver un hébergement d\'urgence si besoin.',
];

const C = { conversations: [], messages: [], contact: null, sig: '', busy: false };
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (iso) => { const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleString('fr-CH', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); };

async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'X-Conseil-Key': KEY };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
  return data;
}

function renderConvs() {
  const el = $('#convs');
  if (!C.conversations.length) {
    el.innerHTML = '<div class="empty">Aucune conversation pour l\'instant.<br>Envoyez un message depuis l\'app.</div>';
    return;
  }
  // Point = le dernier message vient de la personne : une réponse est attendue.
  el.innerHTML = C.conversations.map((c) => `<button class="conv ${c.contact_id === C.contact ? 'on' : ''}" data-id="${esc(c.contact_id)}">
    <b><span>${c.last_direction === 'out' ? '<i class="dot"></i>' : ''}${esc(c.name)}</span><span class="count">${c.count} · ${fmt(c.last_at)}</span></b>
    <p>${c.last_direction === 'in' ? 'Vous : ' : ''}${esc(c.last_message)}</p></button>`).join('');
}

function renderPane() {
  const conv = C.conversations.find((c) => c.contact_id === C.contact);
  if (!conv) { $('#pane').innerHTML = '<div class="empty">Choisissez une conversation</div>'; return; }
  $('#pane').innerHTML = `<div class="thread-head">Vous répondez en tant que : ${esc(conv.name)}<small>La personne voit vos réponses dans Abri, sans trace dans l'app Messages de son téléphone.</small></div>
    <div class="thread" id="thread"></div>
    <div class="quick">${QUICK_REPLIES.map((q, i) => `<button type="button" data-quick="${i}">${esc(q.length > 48 ? q.slice(0, 46) + '…' : q)}</button>`).join('')}</div>
    <form id="reply"><textarea id="text" placeholder="Votre réponse…"></textarea><button id="send">Envoyer</button></form>`;
  C.sig = '';
  renderThread();
}

function renderThread() {
  const el = $('#thread'); if (!el) return;
  // Ne redessine que si le fil a changé, pour ne pas perturber le défilement.
  const sig = C.messages.map((m) => m.id).join(',');
  if (sig === C.sig) return;
  C.sig = sig;
  el.innerHTML = C.messages.length
    ? C.messages.map((m) => `<div class="bubble ${m.direction === 'out' ? 'from-user' : 'from-us'}">${esc(m.content)}<time>${fmt(m.created_at)}</time></div>`).join('')
    : '<div class="empty">Conversation effacée par la personne.</div>';
  el.scrollTop = el.scrollHeight;
}

async function refresh() {
  try {
    const d = await api(`/api/conseil/messages${C.contact ? `?contact=${encodeURIComponent(C.contact)}` : ''}`);
    C.conversations = d.conversations;
    C.messages = d.messages;
    renderConvs();
    if (C.contact && !$('#thread')) renderPane(); else renderThread();
  } catch (e) {
    $('#convs').innerHTML = `<div class="empty">${esc(e.message === 'verrouillé' ? 'Clé console invalide : utilisez l\'adresse affichée au démarrage du serveur.' : e.message)}</div>`;
  }
}

async function send(text) {
  text = (text || '').trim();
  if (!text || !C.contact || C.busy) return;
  C.busy = true; $('#send').disabled = true;
  try {
    await api('/api/conseil/messages', { method: 'POST', body: { contact_id: C.contact, content: text } });
    $('#text').value = '';
    await refresh();
  } catch (e) { alert(e.message); }
  C.busy = false; $('#send').disabled = false;
  $('#text').focus();
}

$('#convs').addEventListener('click', (e) => {
  const b = e.target.closest('.conv'); if (!b) return;
  C.contact = b.dataset.id; C.messages = [];
  renderConvs(); renderPane(); refresh();
});
$('#pane').addEventListener('click', (e) => {
  const q = e.target.closest('[data-quick]'); if (!q) return;
  $('#text').value = QUICK_REPLIES[+q.dataset.quick]; $('#text').focus();
});
$('#pane').addEventListener('submit', (e) => { e.preventDefault(); send($('#text').value); });
$('#pane').addEventListener('keydown', (e) => {
  if (e.target.id === 'text' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e.target.value); }
});

refresh();
setInterval(refresh, POLL_MS);
