"""
wikimirror.py — Miroir de Wikipédia (seconde apparence possible de l'app).

Le serveur interroge <site>.wikipedia.org (fr, en, es, pt, sq, als… selon la langue choisie,
voir i18n/) et renvoie le résultat à l'interface : le téléphone ne contacte que ce serveur
(les images, elles, viennent de wikimedia.org, comme sur le vrai site).
Le HTML des articles est nettoyé côté navigateur (liste blanche de balises, voir app.js).

Sans connexion, les fonctions lèvent MirrorOffline : l'interface se rabat alors sur les
quelques articles intégrés (static/wiki.js).
"""

from __future__ import annotations

import json
import re
import urllib.parse
import urllib.request
from collections import OrderedDict

# La politique de Wikimedia demande un User-Agent qui identifie l'outil.
HEADERS = {"User-Agent": "PetitsPlats-prototype/0.1 (hackathon; miroir local)"}
TIMEOUT = 8

# Sections de fin sans intérêt pour la lecture (références, liens externes…) : coupées ici
# pour alléger la page (souvent la moitié du HTML). Titres dans les langues du miroir.
_TAIL_TITLES = ["Notes", "Références", "Voir_aussi", "Annexes", "Liens_externes", "Bibliographie", "Articles_connexes",
                "References", "See_also", "External_links", "Further_reading",
                "Referencias", "Véase_también", "Enlaces_externos", "Bibliografía", "Notas",
                "Referências", "Ver_também", "Ligações_externas", "Bibliografia",
                "Referimet", "Shiko_edhe", "Lidhje_të_jashtme", "Burime",
                "Literatur", "Weblink", "Weblinks", "Einzelnachweise", "Fuessnote", "Quelle", "Quellen", "Anmerkungen"]
_TAIL = re.compile(r'<div class="mw-heading mw-heading2"><h2 id="('
                   + "|".join(re.escape(x) for t in _TAIL_TITLES for x in {t, urllib.parse.quote(t)}) + ")")


class MirrorOffline(Exception):
    pass


class _Cache(OrderedDict):
    def __init__(self, size: int):
        super().__init__()
        self.size = size

    def put(self, key, value):
        self[key] = value
        self.move_to_end(key)
        while len(self) > self.size:
            self.popitem(last=False)
        return value


_pages = _Cache(60)
_searches = _Cache(200)


def _api(site: str) -> str:
    return f"https://{site}.wikipedia.org/w/api.php"


def _rest(site: str) -> str:
    return f"https://{site}.wikipedia.org/w/rest.php/v1"


def _get(url: str, params: dict) -> dict:
    req = urllib.request.Request(f"{url}?{urllib.parse.urlencode(params)}", headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as res:
            return json.loads(res.read().decode("utf-8"))
    except Exception as e:  # réseau coupé, délai dépassé, réponse illisible…
        raise MirrorOffline(str(e)) from e


def search(q: str, site: str = "fr", limit: int = 8) -> list[dict]:
    q = q.strip()[:120]
    if not q:
        return []
    key = (site, q.lower())
    if key in _searches:
        return _searches[key]
    data = _get(f"{_rest(site)}/search/title", {"q": q, "limit": limit})
    results = [{"title": p["title"], "desc": p.get("description") or ""} for p in data.get("pages", [])]
    return _searches.put(key, results)


def page(title: str, site: str = "fr") -> dict:
    title = title.strip()[:300]
    key = (site, title)
    if key in _pages:
        return _pages[key]
    data = _get(_api(site), {"action": "parse", "page": title, "prop": "text", "formatversion": 2,
                             "format": "json", "redirects": 1, "disableeditsection": 1, "disabletoc": 1})
    if "error" in data:
        raise LookupError(data["error"].get("info", "Page introuvable"))
    html = data["parse"]["text"]
    cut = _TAIL.search(html)
    if cut:
        html = html[:cut.start()]
    return _pages.put(key, {"title": data["parse"]["title"], "html": html})


def random_title(site: str = "fr") -> str:
    data = _get(_api(site), {"action": "query", "list": "random", "rnnamespace": 0, "rnlimit": 1,
                             "format": "json", "formatversion": 2})
    return data["query"]["random"][0]["title"]
