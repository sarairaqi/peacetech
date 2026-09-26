"""
app.py — Serveur du prototype Abri (Flask).

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
import io
from functools import wraps

from flask import Flask, abort, jsonify, render_template, request, send_file

import content as C
import logic as L
import wikimirror as W

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024  # 50 Mo par fichier

# Jetons de session valides (en mémoire : un redémarrage du serveur verrouille tout).
_sessions: set[str] = set()


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
    return jsonify({"error": str(getattr(e, "description", "requête invalide"))}), 400


# ---------------------------------------------------------------------------
# Pages
# ---------------------------------------------------------------------------

@app.get("/")
def index():
    return render_template("index.html", wiki=L.get_front() == "wiki")


@app.get("/manifest.json")
def manifest():
    # Sur iPhone/Android, « Ajouter à l'écran d'accueil » installe l'app sous
    # l'identité de l'application de cuisine.
    # L'apparence choisie dans Abri décide du nom et de l'icône de l'app installée.
    if L.get_front() == "wiki":
        return jsonify({"name": "Wikipédia", "short_name": "Wikipédia", "start_url": "/",
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
    """Les 60 recettes fixes + les 2 recettes du jour."""
    return jsonify({"recipes": [L.for_client(r) for r in C.RECIPES_FIXED],
                    "daily": [L.for_client(r) for r in L.daily_recipes()],
                    "categories": C.RECIPE_CATEGORIES, "configured": L.is_configured()})


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
        payload["results"] = W.search(q)
    except W.MirrorOffline:
        payload.update(results=[], offline=True)
    return jsonify(payload)


@app.get("/api/wiki/page")
def wiki_page():
    try:
        return jsonify(W.page(request.args.get("title", "")))
    except W.MirrorOffline:
        return jsonify({"offline": True}), 503
    except LookupError as e:
        abort(404, str(e))


@app.get("/api/wiki/random")
def wiki_random():
    try:
        return jsonify({"title": W.random_title()})
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
                    "persons_max": L.PERSONS_MAX, "front": L.get_front()})


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
    return jsonify({
        "config": {**cfg, "recipe": L.recipe_by_id(cfg["recipe_id"])} if cfg else None,
        "questionnaire": {"intro": C.QUESTIONNAIRE_INTRO, "sections": C.QUESTIONNAIRE,
                          "situation": C.SITUATION},
        "contacts": C.CONTACTS,
        "axes": C.AXES,
        "offices": C.OFFICES,
        "office_types": C.OFFICE_TYPES,
        "vaud_url": C.VAUD_URL,
        "evidence_categories": C.EVIDENCE_CATEGORIES,
        "features": L.FEATURES,
        "front": L.get_front(),
        "prefs": L.get_prefs(),
        "last_result": L.last_result(),
        "audit": L.get_audit_state(),
        "evidence": L.list_evidence(),
        "journal": L.list_journal(),
        "dossier": L.dossier_status(),
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
        return jsonify({"prefs": L.set_pref(data.get("key", ""), data.get("value", False))})
    except ValueError as e:
        abort(400, str(e))


@app.post("/api/app/front")
@protected
def app_front():
    """Choisit l'apparence de l'app : recettes ou Wikipédia (+ mot secret)."""
    data = request.get_json(silent=True) or {}
    try:
        return jsonify({"front": L.set_front(data.get("front", ""), data.get("phrase"))})
    except ValueError as e:
        abort(400, str(e))


# --- Questionnaire ---------------------------------------------------------

@app.post("/api/questionnaire/evaluate")
@protected
def questionnaire_evaluate():
    data = request.get_json(silent=True) or {}
    result = L.evaluate(data.get("answers", {}), data.get("situation", {}))
    return jsonify(result)


# --- Localisation ----------------------------------------------------------

@app.get("/api/location/audit")
@protected
def location_audit():
    return jsonify(L.get_audit_state())


@app.post("/api/location/audit/<item_id>")
@protected
def location_audit_set(item_id):
    data = request.get_json(silent=True) or {}
    try:
        return jsonify(L.set_audit_item(item_id, data.get("done", True)))
    except ValueError as e:
        abort(400, str(e))


@app.post("/api/location/scan")
@protected
def location_scan():
    return jsonify(L.scan_findings())


# --- Coffre à preuves ------------------------------------------------------

@app.get("/api/evidence")
@protected
def evidence_list():
    return jsonify({"evidence": L.list_evidence(), "journal": L.list_journal(),
                    "dossier": L.dossier_status()})


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
    return jsonify({"item": item, "dossier": L.dossier_status()})


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
    return jsonify({"ok": True, "dossier": L.dossier_status()})


@app.get("/api/evidence/export")
@protected
def evidence_export():
    data, name = L.export_zip()
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
    return jsonify({"entry": entry, "dossier": L.dossier_status()})


@app.delete("/api/journal/<entry_id>")
@protected
def journal_delete(entry_id):
    if not L.delete_journal(entry_id):
        abort(404)
    return jsonify({"ok": True, "dossier": L.dossier_status()})


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
