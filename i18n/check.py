"""
Vérifie les traductions : python -m i18n.check          → clés manquantes / inutilisées par langue
                          python -m i18n.check --dump   → tous les textes à traduire (français)

Textes attendus :
  • UI       : chaque t('…') / tn(n, '…', '…') de static/app.js
  • CONTENT  : les textes de content.py et de logic.py (niveaux, actions, options, erreurs, export ZIP)
  • RECIPES  : chaque recette de content.RECIPES ; REGIONS : chaque région citée
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

import content as C
import i18n as I
import logic as L

ROOT = Path(__file__).resolve().parent.parent

# Noms propres : identiques dans toutes les langues, inutile de les traduire
PROPER = {"Centre LAVI", "MalleyPrairie", "CHUV", "La Fraternité (CSP)", "violencequefaire.ch", "with-you.ch",
          "Centre MalleyPrairie", "Centre LAVI Vaud", "Espace Santé Rennaz", "Assistant Abri"}


def _strings(obj, key=None, out=None):
    out = [] if out is None else out
    if key in I._SKIP_KEYS:
        return out
    if isinstance(obj, str):
        # ni noms propres, ni nombres, ni identifiants (« demo », « placeholder »…)
        if obj.strip() and obj not in PROPER and not re.fullmatch(r"[\W\d_]+|[a-z_]+", obj):
            out.append(obj)
    elif isinstance(obj, dict):
        for k, v in obj.items():
            _strings(v, k, out)
    elif isinstance(obj, list):
        for v in obj:
            _strings(v, key, out)
    return out


def content_keys() -> list[str]:
    data = [C.QUESTIONNAIRE_INTRO, C.QUESTIONNAIRE, C.SITUATION, C.AXES, C.CONTACTS, C.OFFICE_TYPES, C.OFFICES,
            C.LOCATION_WARNING, C.LOCATION_GROUPS, C.LOCATION_AUDIT, C.LOCATION_QUICK, C.LOCATION_TIPS,
            C.SCAN_FINDINGS, C.EVIDENCE_CATEGORIES, C.DOSSIER_ITEMS, C.ASSISTANT, C.PLAINTE_INFO, C.RESOURCES,
            L.LEVELS, L.ACTIONS, L.FEATURES, L.ADVICE, sorted({r["difficulty"] for r in C.RECIPES})]
    keys = _strings(data)
    # Messages d'erreur, textes de l'export ZIP (t("…") / I.tr("…"))
    for path in (ROOT / "logic.py", ROOT / "app.py"):
        src = path.read_text(encoding="utf-8")
        keys += re.findall(r'ValueError\("([^"]+)"\)', src)
        keys += re.findall(r'abort\(\d+, "([^"]+)"\)', src)
        keys += re.findall(r'\bt\("([^"]+)"\)', src)
        keys += re.findall(r"\bt\('([^']+)'\)", src)
        keys += re.findall(r'I\.tr\("([^"]+)"', src)
    keys += [f"Le nombre de personnes doit être entre {L.PERSONS_MIN} et {L.PERSONS_MAX}",
             f"Le mot secret doit avoir au moins {L.WIKI_PHRASE_MIN} lettres ou chiffres"]
    return list(dict.fromkeys(keys))


_JS_STR = r"""'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\$]|\\.)*)`"""


def _unescape(s: str) -> str:
    return re.sub(r"\\(.)", r"\1", s)


def ui_keys() -> list[str]:
    src = (ROOT / "static" / "app.js").read_text(encoding="utf-8")
    keys = []
    for m in re.finditer(rf"\bt\(\s*(?:{_JS_STR})", src):
        keys.append(_unescape(next(g for g in m.groups() if g is not None)))
    for m in re.finditer(rf"\btn\([^,]+,\s*(?:{_JS_STR})\s*,\s*(?:{_JS_STR})", src):
        g = m.groups()
        keys.append(_unescape(next(x for x in g[:3] if x is not None)))
        keys.append(_unescape(next(x for x in g[3:] if x is not None)))
    keys += C.RECIPE_CATEGORIES          # traduites dans l'interface : t(cat), t(r.category)
    return list(dict.fromkeys(keys))


def region_keys() -> list[str]:
    return sorted({p for r in C.RECIPES if r.get("region") for p in r["region"].split(" · ")})


def main() -> int:
    ui, content, regions = ui_keys(), content_keys(), region_keys()
    if "--dump" in sys.argv:
        for title, keys in (("UI", ui), ("CONTENT", content), ("REGIONS", regions)):
            print(f"# {title} ({len(keys)})")
            for k in keys:
                print(repr(k))
        return 0
    bad = 0
    for code in I.CODES:
        if code == I.DEFAULT:
            continue
        m = I._MODULES[code]
        report = {
            "UI": ([k for k in ui if k not in m.UI], [k for k in m.UI if k not in ui]),
            "CONTENT": ([k for k in content if k not in m.CONTENT],
                        [k for k in m.CONTENT if k not in content and k not in PROPER]),
            "RECIPES": ([r["id"] for r in C.RECIPES if r["id"] not in m.RECIPES], []),
            "REGIONS": ([k for k in regions if k not in m.REGIONS], []),
        }
        print(f"[{code}] {m.NAME}")
        for name, (missing, unused) in report.items():
            bad += len(missing)
            print(f"  {name:8} {len(missing):3} manquant(s)  {len(unused):3} inutilisé(s)")
            for k in missing:
                print(f"      - {k!r}")
            for k in unused:
                print(f"      ? {k!r}")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
