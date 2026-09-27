"""
wikimirror.py — Miroir de Wikipédia en français (seconde apparence possible de l'app).

Le serveur interroge fr.wikipedia.org et renvoie le résultat à l'interface : le téléphone ne
contacte que ce serveur (les images, elles, viennent de wikimedia.org, comme sur le vrai site).
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

API = "https://fr.wikipedia.org/w/api.php"
REST = "https://fr.wikipedia.org/w/rest.php/v1"
# La politique de Wikimedia demande un User-Agent qui identifie l'outil.
HEADERS = {"User-Agent": "PetitsPlats-prototype/0.1 (hackathon; miroir local)"}
TIMEOUT = 8
HOME = "Lac Léman"

# Sections de fin sans intérêt pour la lecture (références, liens externes…) : coupées ici
# pour alléger la page (souvent la moitié du HTML).
_TAIL = re.compile(r'<div class="mw-heading mw-heading2"><h2 id="(Notes|R%C3%A9f|Références|Voir_aussi|'
                   r'Annexes|Liens_externes|Bibliographie|Articles_connexes)')


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


def _get(url: str, params: dict) -> dict:
    req = urllib.request.Request(f"{url}?{urllib.parse.urlencode(params)}", headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as res:
            return json.loads(res.read().decode("utf-8"))
    except Exception as e:  # réseau coupé, délai dépassé, réponse illisible…
        raise MirrorOffline(str(e)) from e


def search(q: str, limit: int = 8) -> list[dict]:
    q = q.strip()[:120]
    if not q:
        return []
    key = q.lower()
    if key in _searches:
        return _searches[key]
    data = _get(f"{REST}/search/title", {"q": q, "limit": limit})
    results = [{"title": p["title"], "desc": p.get("description") or ""} for p in data.get("pages", [])]
    return _searches.put(key, results)


def page(title: str) -> dict:
    title = (title or HOME).strip()[:300]
    if title in _pages:
        return _pages[title]
    data = _get(API, {"action": "parse", "page": title, "prop": "text", "formatversion": 2,
                      "format": "json", "redirects": 1, "disableeditsection": 1, "disabletoc": 1})
    if "error" in data:
        raise LookupError(data["error"].get("info", "Page introuvable"))
    html = data["parse"]["text"]
    cut = _TAIL.search(html)
    if cut:
        html = html[:cut.start()]
    return _pages.put(title, {"title": data["parse"]["title"], "html": html})


def random_title() -> str:
    data = _get(API, {"action": "query", "list": "random", "rnnamespace": 0, "rnlimit": 1,
                      "format": "json", "formatversion": 2})
    return data["query"]["random"][0]["title"]
