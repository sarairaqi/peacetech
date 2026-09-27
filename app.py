"""
app.py — Serveur du prototype Abri / Petits Plats (Flask).

Lancer :   python app.py            → http://127.0.0.1:5000
           python app.py --host 0.0.0.0   (pour ouvrir depuis un téléphone sur le même Wi-Fi)
           python app.py --reset    (efface la configuration et les preuves : démo « premier lancement »)

L'application de couverture (« Petits Plats », recettes) est publique.
L'espace protégé (« Abri ») n'est servi qu'avec un jeton obtenu en choisissant la
bonne recette ET le bon nombre de personnes — sinon l'app se contente d'adapter
les quantités, comme n'importe quelle app de cuisine.
"""

from __future__ import annotations

import argparse
import json
import io
from functools import wraps

from flask import Flask, abort, jsonify, render_template, request, send_file

import content as C
import i18n as I
import logic as L
import wikimirror as W

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024  # 50 Mo par fichier

# Jetons de session valides. Gardés dans storage/sessions.json : en mode debug, Flask redémarre
# à chaque modification d'un fichier .py, et un jeton perdu verrouillait Abri en pleine
# utilisation (« verrouillé » au milieu d'un réglage). Le fichier est ignoré par git.
class _Sessions:
    def __init__(self):
        self._path = L.STORAGE_DIR / "sessions.json"

    def _load(self) -> set:
        try:
            return set(json.loads(self._path.read_text(encoding="utf-8")))
        except (OSError, ValueError):
            return set()

    def _save(self, tokens: set) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._path.write_text(json.dumps(sorted(tokens)), encoding="utf-8")

    def __contains__(self, token) -> bool:
        return token in self._load()

    def add(self, token: str) -> None:
        self._save(self._load() | {token})

    def discard(self, token) -> None:
        self._save(self._load() - {token})

    def clear(self) -> None:
        self._save(set())


_sessions = _Sessions()


def _token_from_request() -> str | None:
    return request.headers.get("X-Abri-Token") or request.args.get("t")


def protected(view):
    """Les routes de l'espace protégé exigent un jeton valide."""
    @wraps(view)
    def wrapper(*args, **kwargs):
        token = _token_from_request()
        if not token or token not in _sessions:
            abort(401)
        return view(*args, **kwargs)
    return wrapper


@app.errorhandler(401)
def _unauthorized(_):
    return jsonify({"error": "verrouillé"}), 401


@app.errorhandler(400)
def _bad_request(e):
    return jsonify({"error": I.tr(str(getattr(e, "description", "requête invalide")), L.get_lang())}), 400


# Langue : content.py et logic.py sont en français ; chaque réponse est traduite à la sortie
# (i18n/<langue>.py). Les données de l'utilisateur (preuves, notes, journal) ne le sont jamais.
def _tr(obj):
    return I.translate(obj, L.get_lang())


def _recipe(r):
    return I.recipe(r, L.get_lang())


def _wiki_site() -> str:
    return I.wiki(L.get_lang())["site"]


# ---------------------------------------------------------------------------
# Pages
# ---------------------------------------------------------------------------

@app.get("/")
def index():
    return render_template("index.html", wiki=L.get_front() == "wiki", i18n=I.client(L.get_lang()))


@app.get("/manifest.json")
def manifest():
    # Sur iPhone/Android, « Ajouter à l'écran d'accueil » installe l'app sous
    # l'identité de l'application de cuisine.
    # L'apparence choisie dans Abri décide du nom et de l'icône de l'app installée.
    if L.get_front() == "wiki":
        brand = I.wiki(L.get_lang())["brand"]
        return jsonify({"name": brand, "short_name": brand, "start_url": "/",
                        "display": "standalone", "background_color": "#ffffff", "theme_color": "#ffffff",
                        "icons": [{"src": "/static/icon-wiki.svg", "sizes": "any", "type": "image/svg+xml"}]})
    return jsonify({
        "name": "Petits Plats",
        "short_name": "Petits Plats",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#fff8f0",
        "theme_color": "#e0643c",
        "icons": [
            {"src": "/static/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "/static/icon-512.png", "sizes": "512x512", "type": "image/png"},
        ],
    })


# ---------------------------------------------------------------------------
# Application de couverture (publique)
# ---------------------------------------------------------------------------

@app.get("/api/cover/recipes")
def cover_recipes():
    """Les 60 recettes fixes + les 2 recettes du jour (nom, région, difficulté et durée traduits)."""
    return jsonify({"recipes": [_recipe(L.for_client(r)) for r in C.RECIPES_FIXED],
                    "daily": [_recipe(L.for_client(r)) for r in L.daily_recipes()],
                    "categories": C.RECIPE_CATEGORIES, "configured": L.is_configured()})


@app.get("/api/i18n")
def i18n_get():
    """Textes de l'interface dans la langue choisie."""
    return jsonify(I.client(L.get_lang()))


@app.post("/api/lang")
def lang_set():
    """
    Change la langue de l'app (profil des recettes, accueil ou Réglages d'Abri). Publique, comme
    le choix de langue de n'importe quelle app : elle ne révèle rien de l'espace protégé.
    """
    data = request.get_json(silent=True) or {}
    try:
        return jsonify(I.client(L.set_lang(str(data.get("lang", "")))))
    except ValueError as e:
        abort(400, str(e))


@app.post("/api/cover/adapt")
def cover_adapt():
    """
    Comportement visible : renvoie les quantités adaptées au nombre de personnes.
    Comportement caché   : si (recette, personnes) == secret, renvoie aussi un jeton.
    """
    data = request.get_json(silent=True) or {}
    recipe_id = data.get("recipe_id", "")
    persons = data.get("persons", 4)
    try:
        ingredients = L.scale_recipe(recipe_id, persons)
    except ValueError as e:
        abort(400, str(e))
    payload = {"ingredients": ingredients, "persons": persons}
    if L.check_unlock(recipe_id, persons):
        token = L.new_token()
        _sessions.add(token)
        payload["token"] = token
    return jsonify(payload)


@app.get("/api/cover/favs")
def cover_favs():
    return jsonify({"favs": L.get_favs()})


@app.post("/api/cover/favs")
def cover_favs_set():
    data = request.get_json(silent=True) or {}
    return jsonify({"favs": L.set_favs(data.get("favs"))})


@app.post("/api/cover/quick")
def cover_quick():
    """
    Ouverture rapide « Face ID » (option des Réglages d'Abri) : appui long sur une recette des
    favoris, ou sur le titre de l'accueil de Wikipédia. Dans ce prototype web, la
    reconnaissance du visage est simulée par l'interface ; une vraie app passerait par la
    biométrie du téléphone (Face ID / empreinte) avant d'appeler cette route.
    """
    if not L.quick_unlock_enabled():
        abort(401)
    token = L.new_token()
    _sessions.add(token)
    return jsonify({"token": token})


# ---------------------------------------------------------------------------
# Apparence « Wikipédia » (publique) : miroir de fr.wikipedia.org
# ---------------------------------------------------------------------------

@app.post("/api/wiki/search")
def wiki_search():
    """
    Comportement visible : suggestions de titres, comme la recherche de Wikipédia.
    Comportement caché   : validée avec Entrée (submit) et égale au mot secret → jeton.
    POST pour que la recherche n'apparaisse pas dans le journal du serveur.
    """
    data = request.get_json(silent=True) or {}
    q = str(data.get("q", ""))
    payload = {"q": q}
    if data.get("submit") and L.check_wiki_unlock(q):
        token = L.new_token()
        _sessions.add(token)
        return jsonify({**payload, "token": token, "results": []})
    try:
        payload["results"] = W.search(q, _wiki_site())
    except W.MirrorOffline:
        payload.update(results=[], offline=True)
    return jsonify(payload)


@app.get("/api/wiki/page")
def wiki_page():
    try:
        wiki = I.wiki(L.get_lang())
        return jsonify(W.page(request.args.get("title", "") or wiki["home"], wiki["site"]))
    except W.MirrorOffline:
        return jsonify({"offline": True}), 503
    except LookupError as e:
        abort(404, str(e))


@app.get("/api/wiki/random")
def wiki_random():
    try:
        return jsonify({"title": W.random_title(_wiki_site())})
    except W.MirrorOffline:
        return jsonify({"offline": True}), 503


@app.errorhandler(404)
def _not_found(e):
    return jsonify({"error": str(getattr(e, "description", "introuvable"))}), 404


# ---------------------------------------------------------------------------
# Configuration initiale (premier lancement) — ou modification depuis l'espace protégé
# ---------------------------------------------------------------------------

@app.get("/api/setup/status")
def setup_status():
    return jsonify({"configured": L.is_configured(), "persons_min": L.PERSONS_MIN,
                    "persons_max": L.PERSONS_MAX, "front": L.get_front(),
                    "quick": L.quick_unlock_enabled()})


@app.post("/api/setup")
def setup():
    token = _token_from_request()
    if L.is_configured() and (not token or token not in _sessions):
        abort(401)  # une fois configuré, seul l'espace protégé peut changer le secret
    data = request.get_json(silent=True) or {}
    try:
        cfg = L.set_config(data.get("recipe_id", ""), data.get("persons", 0))
    except ValueError as e:
        abort(400, str(e))
    return jsonify({"ok": True, "config": cfg})


# ---------------------------------------------------------------------------
# Espace protégé
# ---------------------------------------------------------------------------

@app.get("/api/app/bootstrap")
@protected
def app_bootstrap():
    """Tout ce dont l'interface a besoin en un appel."""
    cfg = L.get_config()
    public_cfg = None
    if cfg:
        public_cfg = {k: v for k, v in cfg.items() if k != "wiki_phrase"}   # l'empreinte reste côté serveur
        public_cfg.update(recipe=_recipe(L.recipe_by_id(cfg["recipe_id"])), has_wiki=bool(cfg.get("wiki_phrase")))
    return jsonify({
        "config": public_cfg,
        **_tr({
            "questionnaire": {"intro": C.QUESTIONNAIRE_INTRO, "sections": C.QUESTIONNAIRE,
                              "situation": C.SITUATION},
            "contacts": C.CONTACTS,
            "axes": C.AXES,
            "offices": C.OFFICES,
            "office_types": C.OFFICE_TYPES,
            "evidence_categories": C.EVIDENCE_CATEGORIES,
            "features": L.FEATURES,
            "assistant": C.ASSISTANT,
            "resources": C.RESOURCES,
            "last_result": L.last_result(),
            "audit": L.get_audit_state(),
            "dossier": L.dossier_status(),
        }),
        "vaud_url": C.VAUD_URL,
        "front": L.get_front(),
        "prefs": L.get_prefs(),
        "prefs_at": L.get_pref_times(),
        "evidence": L.list_evidence(),
        "journal": L.list_journal(),
    })


@app.post("/api/app/lock")
@protected
def app_lock():
    _sessions.discard(_token_from_request())
    return jsonify({"ok": True})


@app.post("/api/app/pref")
@protected
def app_pref():
    """Mémorise une préférence (placeholder : n'active aucune fonctionnalité réelle)."""
    data = request.get_json(silent=True) or {}
    try:
        prefs = L.set_pref(data.get("key", ""), data.get("value", False))
        return jsonify({"prefs": prefs, "prefs_at": L.get_pref_times()})
    except ValueError as e:
        abort(400, str(e))


@app.post("/api/app/front")
@protected
def app_front():
    """Choisit l'apparence de l'app : recettes ou Wikipédia (+ mot secret)."""
    data = request.get_json(silent=True) or {}
    try:
        return jsonify({"front": L.set_front(data.get("front", ""), data.get("phrase"),
                                             activate=data.get("activate", True) is not False)})
    except ValueError as e:
        abort(400, str(e))


# --- Assistant (aperçu) ------------------------------------------------------

@app.post("/api/assistant")
@protected
def assistant():
    """Réponse de l'assistant. Aperçu : texte fixe (voir logic.assistant_reply)."""
    data = request.get_json(silent=True) or {}
    try:
        return jsonify(_tr(L.assistant_reply(data.get("messages"))))
    except ValueError as e:
        abort(400, str(e))


# --- Questionnaire ---------------------------------------------------------

@app.post("/api/questionnaire/evaluate")
@protected
def questionnaire_evaluate():
    data = request.get_json(silent=True) or {}
    result = L.evaluate(data.get("answers", {}), data.get("situation", {}))
    return jsonify(_tr(result))


# --- Localisation ----------------------------------------------------------

@app.get("/api/location/audit")
@protected
def location_audit():
    return jsonify(_tr(L.get_audit_state()))


@app.post("/api/location/audit/<item_id>")
@protected
def location_audit_set(item_id):
    data = request.get_json(silent=True) or {}
    try:
        return jsonify(_tr(L.set_audit_item(item_id, data.get("done", True))))
    except ValueError as e:
        abort(400, str(e))


@app.post("/api/location/scan")
@protected
def location_scan():
    return jsonify(_tr(L.scan_findings()))


# --- Coffre à preuves ------------------------------------------------------

@app.get("/api/evidence")
@protected
def evidence_list():
    return jsonify({"evidence": L.list_evidence(), "journal": L.list_journal(),
                    "dossier": _tr(L.dossier_status())})


@app.post("/api/evidence")
@protected
def evidence_add():
    f = request.files.get("file")
    if f is None:
        abort(400, "Aucun fichier")
    try:
        item = L.add_evidence(f, request.form.get("category", "autre"), request.form.get("note", ""))
    except ValueError as e:
        abort(400, str(e))
    return jsonify({"item": item, "dossier": _tr(L.dossier_status())})


@app.get("/api/evidence/file/<item_id>")
@protected
def evidence_file(item_id):
    item = L.get_evidence(item_id)
    if item is None:
        abort(404)
    return send_file(L.evidence_path(item), mimetype=item["mime"], download_name=item["name"])


@app.delete("/api/evidence/<item_id>")
@protected
def evidence_delete(item_id):
    if not L.delete_evidence(item_id):
        abort(404)
    return jsonify({"ok": True, "dossier": _tr(L.dossier_status())})


@app.get("/api/evidence/export")
@protected
def evidence_export():
    data, name = L.export_zip(L.get_lang())
    return send_file(io.BytesIO(data), mimetype="application/zip", as_attachment=True,
                     download_name=name)


@app.post("/api/journal")
@protected
def journal_add():
    data = request.get_json(silent=True) or {}
    try:
        entry = L.add_journal(data.get("text", ""), data.get("occurred"))
    except ValueError as e:
        abort(400, str(e))
    return jsonify({"entry": entry, "dossier": _tr(L.dossier_status())})


@app.delete("/api/journal/<entry_id>")
@protected
def journal_delete(entry_id):
    if not L.delete_journal(entry_id):
        abort(404)
    return jsonify({"ok": True, "dossier": _tr(L.dossier_status())})


# --- Réglages (démo) -------------------------------------------------------

@app.post("/api/app/reset")
@protected
def app_reset():
    L.reset_all()
    _sessions.clear()
    return jsonify({"ok": True})


# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Prototype Abri / Petits Plats")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=5000)
    parser.add_argument("--reset", action="store_true", help="efface configuration et preuves")
    args = parser.parse_args()
    if args.reset:
        L.reset_all()
        print("Configuration et preuves effacées.")
    print(f"\n  Petits Plats / Abri  →  http://{'127.0.0.1' if args.host == '0.0.0.0' else args.host}:{args.port}\n")
    app.run(host=args.host, port=args.port, debug=True)
