/* ==========================================================================
   DÉMO HACKATHON — simulation de FLAG_SECURE (enregistrement / partage d'écran)

   Sur Android, FLAG_SECURE rend noire toute capture ou tout partage de l'écran
   de l'app, sur TOUS ses écrans, pendant que l'utilisatrice continue à la voir
   normalement. Ici :
     - le téléphone reste intact et utilisable (ce qu'elle voit) ;
     - à côté, un panneau de même taille, noir en permanence (ce que voit
       la personne qui enregistre / regarde le partage).
   Ce script ne lit ni ne modifie rien À L'INTÉRIEUR de #phone.

   Pour retirer la démo : supprimer ce fichier, static/demo-rec.css et leurs
   deux lignes dans templates/index.html.
   ========================================================================== */
(function () {
  "use strict";

  const phone = document.getElementById("phone");
  if (!phone) return;

  // Sur un téléphone ou une tablette (écran tactile, ou app en plein écran) : pas de démo du tout.
  const MOBILE = "(max-width: 520px), (max-height: 700px)";
  if (matchMedia(MOBILE).matches || matchMedia("(hover: none) and (pointer: coarse)").matches) return;

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  };

  // --- Mise en page : [ téléphone ] [ panneau enregistrement ] -------------
  // On enveloppe le téléphone sans le recréer : ses écouteurs et son état restent.
  const row = el("div", "demo-row");
  const slot = el("div", "demo-phone-slot");
  phone.parentNode.insertBefore(row, phone);
  slot.appendChild(phone);
  slot.appendChild(el("div", "demo-cap", "What she sees on her phone"));
  row.appendChild(slot);

  const panel = el("div", "demo-rec-panel");
  const cap = el("div", "demo-cap");
  const badge = el("span", "demo-rec-badge", "REC 00:00");
  cap.append(badge, document.createTextNode("What the recording shows"));
  const screen = el("div", "demo-rec-screen");
  screen.setAttribute("aria-label", "Screen recording output (black: FLAG_SECURE)");
  panel.append(cap, screen);
  row.appendChild(panel);

  // Le panneau suit exactement la taille du téléphone (y compris max-height).
  const syncSize = () => {
    screen.style.width = phone.offsetWidth + "px";
    screen.style.height = phone.offsetHeight + "px";
  };
  if ("ResizeObserver" in window) new ResizeObserver(syncSize).observe(phone);
  window.addEventListener("resize", syncSize);
  syncSize();

  // --- Bouton hors de l'app -------------------------------------------------
  const btn = el("button", "demo-rec-btn");
  btn.type = "button";
  const label = el("span", null);
  btn.append(el("span", "dot"), label);
  // Dans la page, au-dessus du téléphone : flottant en haut à gauche sur grand écran (CSS)
  row.parentNode.insertBefore(btn, row);

  let timer = null;
  let startedAt = 0;
  const tick = () => {
    const s = Math.floor((Date.now() - startedAt) / 1000);
    badge.textContent = "REC " + String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  };

  const render = (on) => {
    document.body.classList.toggle("demo-recording", on);
    btn.classList.toggle("on", on);
    label.textContent = on ? "Stop recording" : "Start screen recording";
    btn.setAttribute("aria-pressed", String(on));
    clearInterval(timer);
    if (on) {
      startedAt = Date.now();
      tick();
      timer = setInterval(tick, 500);
      syncSize();
    }
  };

  btn.addEventListener("click", () => render(!btn.classList.contains("on")));
  // Fenêtre réduite à la taille d'un téléphone : la démo est masquée, l'enregistrement s'arrête
  matchMedia(MOBILE).addEventListener("change", (e) => { if (e.matches) render(false); });
  render(false);
})();
