"""
i18n — Langues de l'application (couverture « Petits Plats », apparence Wikipédia et Abri).

Le français est la langue source : tout le code et content.py restent écrits en français.
Chaque autre langue a son fichier i18n/<code>.py, qui traduit à partir du texte français :

  • UI       : textes de l'interface (static/app.js, fonction t()), clé = texte français
  • CONTENT  : textes de content.py et logic.py, clé = texte français
  • RECIPES  : noms des recettes, par id (ingrédients et étapes restent en français)
  • REGIONS  : région ou pays d'origine d'une recette
  • TIME     : mots des durées de recette (« repos », « 1 nuit »…)
  • WIKI     : Wikipédia utilisée par l'apparence « Wikipédia » (sous-domaine, page d'accueil…)

Une clé absente reste en français : une traduction incomplète ne casse jamais rien.
Pour vérifier qu'un fichier est complet : python -m i18n.check
"""

from __future__ import annotations

import importlib
import re

DEFAULT = "fr"
CODES = ("fr", "en", "es", "pt", "sq", "gsw")

_MODULES = {code: importlib.import_module(f"i18n.{code}") for code in CODES}

# Champs de content.py qui ne sont jamais du texte à traduire (identifiants, numéros, liens…)
_SKIP_KEYS = {"id", "axis", "group", "item", "level", "category", "contact", "goto", "icon", "tone",
              "url", "web", "phone", "dial", "color", "type", "adds", "address", "town",
              "lat", "lon", "danger", "evaluated_at", "scanned_at", "created", "recipe_id"}


def valid(code) -> bool:
    return code in _MODULES


def _mod(lang: str):
    return _MODULES.get(lang) or _MODULES[DEFAULT]


def tr(text: str, lang: str) -> str:
    """Un texte de content.py / logic.py dans la langue choisie (le français sinon)."""
    return getattr(_mod(lang), "CONTENT", {}).get(text, text)


def translate(obj, lang: str):
    """Traduit en profondeur une structure de content.py (dict / list / str)."""
    if lang == DEFAULT:
        return obj
    table = getattr(_mod(lang), "CONTENT", {})

    def walk(o, key=None):
        if key in _SKIP_KEYS:
            return o
        if isinstance(o, str):
            return table.get(o, o)
        if isinstance(o, dict):
            return {k: walk(v, k) for k, v in o.items()}
        if isinstance(o, list):
            return [walk(v, key) for v in o]
        return o

    return walk(obj)


def _time(text: str, words: dict) -> str:
    for fr in sorted(words, key=len, reverse=True):
        text = re.sub(rf"(?<!\w){re.escape(fr)}(?!\w)", words[fr], text)
    return text


def recipe(r: dict | None, lang: str) -> dict | None:
    """Une recette avec son nom, sa région, sa difficulté et sa durée traduits."""
    if r is None or lang == DEFAULT:
        return r
    m = _mod(lang)
    out = {**r, "name": m.RECIPES.get(r["id"], r["name"]),
           "difficulty": m.CONTENT.get(r["difficulty"], r["difficulty"]),
           "time": _time(r["time"], m.TIME)}
    if r.get("region"):
        out["region"] = " · ".join(m.REGIONS.get(p, p) for p in r["region"].split(" · "))
    return out


def wiki(lang: str) -> dict:
    """Wikipédia de la langue : {"site": "fr", "home": "Lac Léman", "brand": …, "tagline": …}."""
    return _mod(lang).WIKI


def langs() -> list[dict]:
    return [{"code": c, "name": _MODULES[c].NAME} for c in CODES]


def client(lang: str) -> dict:
    """Ce dont l'interface a besoin pour s'afficher dans une langue."""
    m = _mod(lang)
    return {"lang": lang if valid(lang) else DEFAULT, "locale": m.LOCALE, "langs": langs(),
            "ui": getattr(m, "UI", {}), "wiki": m.WIKI}
