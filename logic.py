"""
logic.py — La logique du prototype Abri (sans Flask, testable seule).

  • Storage      : lecture/écriture des fichiers JSON dans storage/
  • Auth         : vérification « bonne recette + bon nombre de personnes »
  • Recettes     : recettes du jour, adaptation des quantités
  • Questionnaire: calcul du niveau de danger + redirections + pièces du dossier
  • Coffre       : dépôt, listing, suppression, export ZIP des preuves
"""

from __future__ import annotations

import hashlib
import hmac
import io
import json
import math
import mimetypes
import os
import re
import secrets
import unicodedata
import uuid
import zipfile
from datetime import date, datetime
from pathlib import Path

from werkzeug.utils import secure_filename

import content as C

BASE_DIR = Path(__file__).resolve().parent
STORAGE_DIR = BASE_DIR / "storage"
EVIDENCE_DIR = STORAGE_DIR / "evidence"
CONFIG_FILE = STORAGE_DIR / "config.json"
EVIDENCE_INDEX = STORAGE_DIR / "evidence.json"
JOURNAL_FILE = STORAGE_DIR / "journal.json"
AUDIT_FILE = STORAGE_DIR / "location_audit.json"
RESULT_FILE = STORAGE_DIR / "last_result.json"
PREFS_FILE = STORAGE_DIR / "prefs.json"

PERSONS_MIN, PERSONS_MAX = 1, 12


# ---------------------------------------------------------------------------
# Storage (petits fichiers JSON — largement suffisant pour un prototype)
# ---------------------------------------------------------------------------

def _read_json(path: Path, default):
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return default


def _write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def now_iso() -> str:
    return datetime.now().replace(microsecond=0).isoformat()


def fmt_dt(iso: str) -> str:
    try:
        return datetime.fromisoformat(iso).strftime("%d.%m.%Y à %H:%M")
    except ValueError:
        return iso


# ---------------------------------------------------------------------------
# Configuration de l'accès secret (recette + nombre de personnes)
# ---------------------------------------------------------------------------

def get_config() -> dict | None:
    return _read_json(CONFIG_FILE, None)


def is_configured() -> bool:
    return get_config() is not None


def recipe_by_id(recipe_id: str) -> dict | None:
    return next((r for r in C.RECIPES if r["id"] == recipe_id), None)


def set_config(recipe_id: str, persons: int) -> dict:
    # Seules les 60 recettes fixes : une recette du jour disparaîtrait le lendemain.
    if not any(r["id"] == recipe_id for r in C.RECIPES_FIXED):
        raise ValueError("Recette inconnue")
    persons = int(persons)
    if not PERSONS_MIN <= persons <= PERSONS_MAX:
        raise ValueError(f"Le nombre de personnes doit être entre {PERSONS_MIN} et {PERSONS_MAX}")
    cfg = {"recipe_id": recipe_id, "persons": persons, "created": now_iso()}
    old = get_config() or {}
    if old.get("wiki_phrase"):          # changer la recette ne doit pas effacer le mot secret
        cfg["wiki_phrase"] = old["wiki_phrase"]
    _write_json(CONFIG_FILE, cfg)
    return cfg


# ---------------------------------------------------------------------------
# Préférences de l'espace protégé
# ---------------------------------------------------------------------------
#
# PLACEHOLDER — « Enregistrement d'urgence » (triple tap → capture vidéo 10 min → coffre).
#
# Cette préférence n'est qu'un INTERRUPTEUR mémorisé : rien n'enregistre quoi que ce soit.
# Le geste triple-tap, la caméra et l'ajout au coffre NE SONT PAS implémentés. Ce champ
# existe pour qu'un·e développeur·se puisse brancher une vraie implémentation plus tard, en
# connaissance de cause :
#
#   • Techniquement infaisable en web : un navigateur coupe la caméra dès que l'onglet passe
#     en arrière-plan ou que l'écran se verrouille. « Enregistrer 10 min sans que l'app soit
#     visible » suppose une vraie application native (Android/iOS) avec permissions caméra.
#   • Cadre légal (Suisse) : enregistrer une CONVERSATION à l'insu des participants est punissable
#     (art. 179bis/ter CP). Documenter une agression subie est une pratique reconnue, mais la
#     limite est réelle : à faire valider par un·e juriste (LAVI, avocat·e) avant toute diffusion.
#   • Sécurité : un enregistreur caché « toujours armé » sur un téléphone surveillé est
#     précisément ce contre quoi l'onglet Localisation met en garde. À n'activer qu'en connaissance
#     du risque, et jamais par défaut.
#
# Tant que ces trois points ne sont pas traités, l'interface présente l'option comme « à venir ».
FEATURES = {
    "freeze_location": {
        "label": "Figer ma position",
        "desc": "Les applis et les personnes qui suivent votre position voient un lieu fixe, pas vos déplacements.",
        # 'demo' = l'interface montre l'état « figé », mais un site web ne peut pas changer la
        # position vue par les autres applis : c'est le rôle d'une app native (voir README).
        "status": "demo",
        "default": False,
        "hidden": True,            # pilotée depuis la barre « Ma position », pas depuis les Réglages
    },
    "face_id": {
        "label": "Ouverture rapide (Face ID)",
        "desc": "Depuis l'app de cuisine, gardez le doigt appuyé sur « Bonjour » : Face ID ouvre Abri sans passer par la recette.",
        # 'demo' = animation Face ID simulée ; une vraie app utiliserait la biométrie du téléphone.
        "status": "demo",
        "default": False,
    },
    "emergency_recording": {
        "label": "Enregistrement d'urgence",
        "desc": "Trois tapes sur l'écran lancent une capture vidéo de 10 min, déposée dans le coffre.",
        "status": "placeholder",   # 'placeholder' = mémorisé mais non fonctionnel (voir ci-dessus)
        "default": False,
    },
}


def get_prefs() -> dict:
    """Préférences enregistrées, complétées par les valeurs par défaut de chaque option."""
    saved = _read_json(PREFS_FILE, {})
    return {key: bool(saved.get(key, f["default"])) for key, f in FEATURES.items()}


def get_pref_times() -> dict:
    """Quand chaque option a été activée pour la dernière fois (ISO), pour l'affichage « figée depuis… »."""
    saved = _read_json(PREFS_FILE, {})
    return {key: saved.get(f"{key}_at") for key in FEATURES if saved.get(f"{key}_at")}


def set_pref(key: str, value: bool) -> dict:
    if key not in FEATURES:
        raise ValueError("Option inconnue")
    saved = _read_json(PREFS_FILE, {})
    saved[key] = bool(value)
    if value:
        saved[f"{key}_at"] = now_iso()
    _write_json(PREFS_FILE, saved)
    return get_prefs()


def quick_unlock_enabled() -> bool:
    """Vrai si l'ouverture rapide « Face ID » est activée (apparence recettes seulement)."""
    return is_configured() and get_front() == "recettes" and get_prefs().get("face_id", False)


# ---------------------------------------------------------------------------
# Apparence de l'app : application de recettes OU miroir de Wikipédia (Réglages d'Abri)
# ---------------------------------------------------------------------------
# Chaque apparence a son propre secret, et seul celui de l'apparence active ouvre Abri :
#   • recettes : la bonne recette + le bon nombre de personnes (« Adapter les quantités ») ;
#   • wiki     : un mot secret tapé dans la recherche (validé avec Entrée).
# Le mot secret n'est gardé que sous forme d'empreinte (config.json → wiki_phrase) : il
# n'apparaît pas en clair si quelqu'un ouvre le fichier. Une empreinte d'un mot court se
# retrouve toutefois par essais : c'est un camouflage, pas un coffre-fort.
FRONTS = ("recettes", "wiki")
WIKI_PHRASE_MIN = 4


def get_front() -> str:
    front = _read_json(PREFS_FILE, {}).get("front", "recettes")
    return front if front in FRONTS and (front != "wiki" or _wiki_phrase()) else "recettes"


def _wiki_phrase() -> str | None:
    return (get_config() or {}).get("wiki_phrase")


def _norm_phrase(text) -> str:
    """« Girafe  Bleue » = « girafe bleue » = « GIRAFÉ bleue » : casse, accents et espaces ignorés."""
    text = "".join(c for c in unicodedata.normalize("NFD", str(text or "")) if not unicodedata.combining(c))
    return " ".join(re.sub(r"[^a-z0-9]+", " ", text.lower()).split())


def _hash_phrase(text) -> str:
    return hashlib.sha256(f"abri-wiki|{_norm_phrase(text)}".encode()).hexdigest()


def set_front(front: str, phrase: str | None = None) -> str:
    if front not in FRONTS:
        raise ValueError("Apparence inconnue")
    cfg = get_config()
    if cfg is None:
        raise ValueError("L'accès secret n'est pas encore configuré")
    if front == "wiki":
        if phrase:
            if len(_norm_phrase(phrase).replace(" ", "")) < WIKI_PHRASE_MIN:
                raise ValueError(f"Le mot secret doit avoir au moins {WIKI_PHRASE_MIN} lettres ou chiffres")
            cfg["wiki_phrase"] = _hash_phrase(phrase)
            _write_json(CONFIG_FILE, cfg)
        elif not cfg.get("wiki_phrase"):
            raise ValueError("Choisissez d'abord un mot secret")
    saved = _read_json(PREFS_FILE, {})
    saved["front"] = front
    _write_json(PREFS_FILE, saved)
    return get_front()


def check_wiki_unlock(query) -> bool:
    """Vrai si l'apparence Wikipédia est active et que la recherche est le mot secret."""
    stored = _wiki_phrase()
    if get_front() != "wiki" or not stored or not _norm_phrase(query):
        return False
    return hmac.compare_digest(_hash_phrase(query), stored)


# ---------------------------------------------------------------------------
# Assistant (aperçu) — point d'entrée du futur modèle d'IA
# ---------------------------------------------------------------------------
# Aujourd'hui : réponse fixe, rien n'est gardé. Pour brancher un modèle, remplacer le corps
# de assistant_reply en gardant la même forme de réponse ({"text", "actions"}). À prévoir :
#   • danger immédiat détecté → proposer d'abord le 117 / 142 (actions « contact ») ;
#   • pas de journalisation des messages côté serveur, ni chez le fournisseur du modèle ;
#   • les réponses orientent vers le réseau vaudois (content.CONTACTS), sans se substituer à lui.
ASSISTANT_MAX_CHARS = 2000


def assistant_reply(messages: list) -> dict:
    """messages : [{"from": "me" | "bot", "text": str}, …] → {"text", "actions", "status"}."""
    if not isinstance(messages, list) or not messages:
        raise ValueError("Aucun message")
    last = messages[-1]
    if not isinstance(last, dict) or not str(last.get("text", "")).strip():
        raise ValueError("Message vide")
    if len(str(last["text"])) > ASSISTANT_MAX_CHARS:
        raise ValueError("Message trop long")
    return {"text": C.ASSISTANT["placeholder_reply"], "actions": C.ASSISTANT["placeholder_actions"],
            "status": "placeholder"}


def check_unlock(recipe_id: str, persons) -> bool:
    """Vrai si (recette, nombre de personnes) correspond au secret configuré."""
    cfg = get_config()
    if cfg is None or get_front() != "recettes":
        return False
    try:
        persons = int(persons)
    except (TypeError, ValueError):
        return False
    return cfg["recipe_id"] == recipe_id and cfg["persons"] == persons


def new_token() -> str:
    return secrets.token_urlsafe(24)


# ---------------------------------------------------------------------------
# Recettes : adaptation des quantités (comportement « normal »)
# ---------------------------------------------------------------------------

_INT_UNITS = {"g", "ml"}
_FIXED_UNITS = {"pincée"}
DAILY_COUNT = 2   # « recettes du jour » affichées en plus des 60 recettes fixes


def daily_recipes(day: date | None = None) -> list[dict]:
    """Les recettes du jour : tirées de la réserve, les mêmes toute la journée (et après un redémarrage)."""
    key = (day or date.today()).isoformat()
    rank = lambda r: hashlib.sha256(f"{r['id']}|{key}".encode()).hexdigest()  # noqa: E731
    return sorted(C.RECIPES_DAILY_POOL, key=rank)[:DAILY_COUNT]


def rounding(ing: dict) -> str:
    """
    Comment arrondir une quantité adaptée — règle partagée avec l'interface (app.js) :
      'int'  : grammes, millilitres → entier
      'half' : le reste (pièces, cuillères, dl, l) → demi (quart sous 1)
      'none' : une pincée reste une pincée
    """
    unit = ing["unit"].strip().lower()
    if unit in _FIXED_UNITS:
        return "none"
    if unit.split(" ")[0] in _INT_UNITS:
        return "int"
    return "half"


def for_client(recipe: dict) -> dict:
    """La recette telle que l'interface la reçoit : chaque ingrédient porte sa règle d'arrondi."""
    return {**recipe, "ingredients": [{**i, "round": rounding(i)} for i in recipe["ingredients"]]}


def _round_qty(value: float, mode: str) -> float:
    if mode == "int":
        return max(1, math.floor(value + 0.5))
    if value < 1:
        return max(0.25, math.floor(value * 4 + 0.5) / 4)
    return math.floor(value * 2 + 0.5) / 2


def _fmt_qty(value: float) -> str:
    """0.5 → ½, 1.5 → 1½, 2.0 → 2, 0.33 → 0.3."""
    whole = int(value)
    frac = round(value - whole, 2)
    fractions = {0.25: "¼", 0.5: "½", 0.75: "¾"}
    if frac == 0:
        return str(whole)
    if frac in fractions:
        return f"{whole if whole else ''}{fractions[frac]}"
    return f"{value:.1f}".rstrip("0").rstrip(".")


def scale_recipe(recipe_id: str, persons) -> list[dict]:
    recipe = recipe_by_id(recipe_id)
    if recipe is None:
        raise ValueError("Recette inconnue")
    try:
        persons = max(PERSONS_MIN, min(PERSONS_MAX, int(persons)))
    except (TypeError, ValueError):
        persons = recipe["base_servings"]
    factor = persons / recipe["base_servings"]
    out = []
    for ing in recipe["ingredients"]:
        mode = rounding(ing)
        if mode == "none":
            qty = _fmt_qty(ing["qty"])
        else:
            qty = _fmt_qty(_round_qty(ing["qty"] * factor, mode))
        out.append({"name": ing["name"], "qty": qty, "unit": ing["unit"]})
    return out


# ---------------------------------------------------------------------------
# Questionnaire : évaluation et redirection
# ---------------------------------------------------------------------------

LEVELS = {
    "high": {
        "label": "Danger élevé",
        "color": "#e63946",
        "headline": "Ces actes sont interdits par la loi.",
        "text": "Votre sécurité passe avant tout. En cas de danger immédiat, appelez la police (117). "
                "Des professionnel·le·s peuvent vous mettre à l'abri, vous soigner et vous accompagner dès aujourd'hui.",
    },
    "concern": {
        "label": "Situation préoccupante",
        "color": "#f2a900",
        "headline": "Ces comportements sont inacceptables et certains sont punissables.",
        "text": "Vous n'avez pas à vivre cela. Des services gratuits et confidentiels peuvent vous conseiller, "
                "et le coffre vous aide à conserver des preuves en sécurité.",
    },
    "none": {
        "label": "Aucune forme de violence identifiée",
        "color": "#2e9e5b",
        "headline": "Aucune situation de violence n'a été identifiée dans vos réponses.",
        "text": "Si un doute persiste, des ressources existent. Vous pouvez aussi vérifier que personne "
                "ne suit votre position, dans l'onglet Localisation.",
    },
}

# Contacts recommandés par niveau, dans l'ordre d'affichage.
RECOMMENDED = {
    "high": ["police", "victimes142", "malley_urg", "umv", "lavi", "avocats"],
    "concern": ["victimes142", "lavi", "malley_conseil", "vqf", "withyou", "avocats"],
    "none": ["vqf", "victimes142"],
}

# Contacts ajoutés selon les sections cochées.
SECTION_EXTRA = {
    "mariage": ["bci"],
    "sexuelle": ["umv", "lavi"],
    "physique": ["umv"],
    "economique": ["lavi", "avocats"],
}

# Actions concrètes proposées par niveau (affichées comme "Que faire maintenant").
ACTIONS = {
    "high": [
        {"icon": "🚨", "title": "Danger immédiat", "text": "Appuyez sur SOS : la police (117) intervient 24h/24.", "goto": "sos"},
        {"icon": "📞", "title": "Parler à quelqu'un maintenant", "text": "La ligne 142 écoute et oriente, gratuitement, à toute heure.", "contact": "victimes142"},
        {"icon": "🏠", "title": "Être mis·e à l'abri", "text": "Le Centre MalleyPrairie héberge en urgence, avec les enfants.", "contact": "malley_urg"},
        {"icon": "🩺", "title": "Faire constater les blessures", "text": "L'Unité de médecine des violences établit un constat, utile même plus tard.", "contact": "umv"},
        {"icon": "⚖️", "title": "Porter plainte", "text": "Voir ci-dessous les pièces à préparer. Le Centre LAVI peut vous accompagner.", "goto": "dossier"},
    ],
    "concern": [
        {"icon": "📞", "title": "Être conseillé·e", "text": "Le Centre LAVI conseille gratuitement et en toute confidentialité.", "contact": "lavi"},
        {"icon": "💬", "title": "Poser une question anonymement", "text": "violencequefaire.ch répond en ligne, sans donner votre nom.", "contact": "vqf"},
        {"icon": "🗂️", "title": "Garder des preuves", "text": "Déposez captures d'écran et photos dans le coffre : elles sont horodatées.", "goto": "evidence"},
        {"icon": "📝", "title": "Tenir une chronologie", "text": "Notez chaque événement dans le journal du coffre.", "goto": "journal"},
        {"icon": "⚖️", "title": "Connaître vos droits", "text": "Un·e avocat·e peut demander des mesures de protection.", "contact": "avocats"},
    ],
    "none": [
        {"icon": "📍", "title": "Vérifier votre localisation", "text": "Assurez-vous que personne ne peut savoir où vous êtes.", "goto": "location"},
        {"icon": "💬", "title": "En parler quand même ?", "text": "violencequefaire.ch et le 142 répondent à toute question, sans jugement.", "contact": "vqf"},
    ],
}


def _section_of(qid: str) -> dict | None:
    for section in C.QUESTIONNAIRE:
        if any(q["id"] == qid for q in section["questions"]):
            return section
    return None


def evaluate(answers: dict, situation: dict | None = None) -> dict:
    """
    answers   : {"q1": true/false, ...}
    situation : {"enfants": true/false, "migration": true/false}
    """
    situation = situation or {}
    flagged: dict[str, list[str]] = {}          # section id -> questions cochées "Oui"
    for qid, value in answers.items():
        if value is True or value == "oui":
            section = _section_of(qid)
            if section:
                flagged.setdefault(section["id"], []).append(qid)

    # Niveau : 1 "Oui" en physique / sexuelle / mariage forcé => élevé
    #          1 "Oui" ou plus en psychologique / économique   => préoccupant
    #          tout "Non"                                       => aucune forme identifiée
    if any(s["danger"] == "high" and s["id"] in flagged for s in C.QUESTIONNAIRE):
        level = "high"
    elif flagged:
        level = "concern"
    else:
        level = "none"

    # Contacts recommandés (ordre conservé, sans doublon)
    contact_ids: list[str] = list(RECOMMENDED[level])
    for section_id in flagged:
        for cid in SECTION_EXTRA.get(section_id, []):
            if cid not in contact_ids:
                contact_ids.append(cid)
    for q in C.SITUATION:
        if situation.get(q["id"]):
            for cid in q["adds"]:
                if cid not in contact_ids:
                    contact_ids.append(cid)

    contacts_by_id = {c["id"]: c for c in C.CONTACTS}
    contacts = [contacts_by_id[cid] for cid in contact_ids if cid in contacts_by_id]

    # Pièces du dossier de plainte, adaptées aux sections cochées
    dossier = []
    if level != "none":
        for item in C.DOSSIER_ITEMS:
            if item.get("always"):
                dossier.append(item)
            elif item.get("sections") and any(s in flagged for s in item["sections"]):
                dossier.append(item)
        dossier += [i for i in C.DOSSIER_ITEMS if i.get("optional")]

    advice = []
    if "sexuelle" in flagged:
        advice.append("Si les faits sont récents, essayez si possible de ne pas vous laver ni changer de vêtements "
                      "avant l'examen médical : cela préserve les traces.")
    if situation.get("enfants"):
        advice.append("Les enfants exposés à la violence sont aussi des victimes : les Offices de protection des "
                      "mineurs peuvent les protéger et vous conseiller.")
    if situation.get("migration"):
        advice.append("Se séparer d'un·e conjoint·e violent·e ne fait pas automatiquement perdre le permis de séjour : "
                      "La Fraternité du CSP vous renseigne.")

    sections = [
        {"id": s["id"], "title": s["title"], "icon": s["icon"], "mention": s["mention"],
         "count": len(flagged[s["id"]]), "total": len(s["questions"])}
        for s in C.QUESTIONNAIRE if s["id"] in flagged
    ]

    result = {
        "level": level,
        "level_info": LEVELS[level],
        "sections": sections,
        "yes_count": sum(len(v) for v in flagged.values()),
        "actions": ACTIONS[level],
        "contacts": contacts,
        "dossier": dossier,
        "plainte_info": C.PLAINTE_INFO if level != "none" else [],
        "advice": advice,
        "evaluated_at": now_iso(),
    }
    _write_json(RESULT_FILE, result)
    return result


def last_result() -> dict | None:
    result = _read_json(RESULT_FILE, None)
    if result and result.get("dossier"):
        # Relire les pièces dans content.py : un changement de texte s'applique aussi aux anciens résultats
        by_id = {i["id"]: i for i in C.DOSSIER_ITEMS}
        result["dossier"] = [by_id[i["id"]] for i in result["dossier"] if i.get("id") in by_id]
    return result


# ---------------------------------------------------------------------------
# Localisation : les points à vérifier et ce qui est déjà fait
# ---------------------------------------------------------------------------

def get_audit_state() -> dict:
    done = _read_json(AUDIT_FILE, {})
    items = C.LOCATION_AUDIT
    return {
        "warning": C.LOCATION_WARNING,
        "groups": C.LOCATION_GROUPS,
        "items": items,
        "quick": C.LOCATION_QUICK,
        "tips": C.LOCATION_TIPS,
        "done": done,
        "n_done": sum(1 for i in items if done.get(i["id"])),
        "n_total": len(items),
    }


def set_audit_item(item_id: str, value: bool) -> dict:
    if not any(i["id"] == item_id for i in C.LOCATION_AUDIT):
        raise ValueError("Élément inconnu")
    done = _read_json(AUDIT_FILE, {})
    done[item_id] = bool(value)
    _write_json(AUDIT_FILE, done)
    return get_audit_state()


def scan_findings() -> dict:
    done = _read_json(AUDIT_FILE, {})
    findings = []
    for f in C.SCAN_FINDINGS:
        level = "ok" if done.get(f["item"]) else f["level"]
        findings.append({**f, "level": level, "fixed": bool(done.get(f["item"]))})
    counts = {"high": 0, "medium": 0, "ok": 0}
    for f in findings:
        counts[f["level"]] += 1
    return {"findings": findings, "counts": counts, "scanned_at": now_iso()}


# ---------------------------------------------------------------------------
# Coffre à preuves
# ---------------------------------------------------------------------------

def _evidence_index() -> list[dict]:
    return _read_json(EVIDENCE_INDEX, [])


def _sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def add_evidence(file_storage, category: str, note: str) -> dict:
    """file_storage : objet FileStorage de Flask (request.files['file'])."""
    if category not in {c["id"] for c in C.EVIDENCE_CATEGORIES}:
        category = "autre"
    data = file_storage.read()
    if not data:
        raise ValueError("Fichier vide")
    original = secure_filename(file_storage.filename or "preuve") or "preuve"
    item_id = uuid.uuid4().hex[:12]
    stored_name = f"{item_id}_{original}"
    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    (EVIDENCE_DIR / stored_name).write_bytes(data)
    mime = file_storage.mimetype or mimetypes.guess_type(original)[0] or "application/octet-stream"
    item = {
        "id": item_id,
        "name": original,
        "stored": stored_name,
        "category": category,
        "note": (note or "").strip()[:500],
        "mime": mime,
        "size": len(data),
        "sha256": _sha256(data),
        "added_at": now_iso(),
    }
    index = _evidence_index()
    index.insert(0, item)
    _write_json(EVIDENCE_INDEX, index)
    return item


def list_evidence() -> list[dict]:
    return _evidence_index()


def get_evidence(item_id: str) -> dict | None:
    return next((i for i in _evidence_index() if i["id"] == item_id), None)


def evidence_path(item: dict) -> Path:
    return EVIDENCE_DIR / item["stored"]


def delete_evidence(item_id: str) -> bool:
    index = _evidence_index()
    item = next((i for i in index if i["id"] == item_id), None)
    if item is None:
        return False
    try:
        evidence_path(item).unlink()
    except FileNotFoundError:
        pass
    _write_json(EVIDENCE_INDEX, [i for i in index if i["id"] != item_id])
    return True


# Journal des faits (chronologie horodatée)

def list_journal() -> list[dict]:
    return _read_json(JOURNAL_FILE, [])


def add_journal(text: str, occurred: str | None = None) -> dict:
    text = (text or "").strip()
    if not text:
        raise ValueError("Texte vide")
    entry = {
        "id": uuid.uuid4().hex[:12],
        "text": text[:2000],
        "occurred": occurred or now_iso(),   # date des faits (modifiable)
        "recorded": now_iso(),               # date de saisie (horodatage)
    }
    journal = list_journal()
    journal.insert(0, entry)
    _write_json(JOURNAL_FILE, journal)
    return entry


def delete_journal(entry_id: str) -> bool:
    journal = list_journal()
    new = [e for e in journal if e["id"] != entry_id]
    if len(new) == len(journal):
        return False
    _write_json(JOURNAL_FILE, new)
    return True


def dossier_status() -> dict:
    """Quelles pièces du dossier sont déjà présentes dans le coffre ?"""
    result = last_result()
    items = result["dossier"] if result and result.get("dossier") else \
        [i for i in C.DOSSIER_ITEMS if i.get("always")]
    have = {i["category"] for i in list_evidence()}
    if list_journal():
        have.add("journal")
    status = []
    for item in items:
        cat = item.get("category")
        status.append({**item, "done": bool(cat and cat in have), "manual": cat is None})
    n_done = sum(1 for s in status if s["done"])
    return {"items": status, "n_done": n_done, "n_total": len(status)}


def export_zip() -> tuple[bytes, str]:
    """Construit un ZIP : pièces renommées + index + journal. Retourne (bytes, nom)."""
    cats = {c["id"]: c["label"] for c in C.EVIDENCE_CATEGORIES}
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        lines = ["DOSSIER — pièces déposées dans le coffre d'Abri",
                 f"Exporté le {fmt_dt(now_iso())}", "",
                 "Chaque fichier est accompagné de son empreinte SHA-256 : elle permet de prouver",
                 "qu'il n'a pas été modifié depuis son dépôt.", ""]
        for n, item in enumerate(reversed(list_evidence()), start=1):
            path = evidence_path(item)
            if not path.exists():
                continue
            ext = Path(item["name"]).suffix
            arc = f"pieces/{n:03d}_{item['category']}_{item['added_at'][:10]}{ext}"
            zf.write(path, arc)
            lines += [f"[{n:03d}] {cats.get(item['category'], item['category'])}",
                      f"      fichier   : {arc}",
                      f"      nom       : {item['name']}",
                      f"      déposé le : {fmt_dt(item['added_at'])}",
                      f"      SHA-256   : {item['sha256']}",
                      f"      note      : {item['note'] or '—'}", ""]
        zf.writestr("INDEX.txt", "\n".join(lines))

        jl = ["JOURNAL DES FAITS (chronologie)", ""]
        for e in reversed(list_journal()):
            jl += [f"Faits du {fmt_dt(e['occurred'])}  (noté le {fmt_dt(e['recorded'])})",
                   f"  {e['text']}", ""]
        zf.writestr("JOURNAL.txt", "\n".join(jl))
    return buf.getvalue(), f"dossier_{datetime.now():%Y%m%d_%H%M}.zip"


# ---------------------------------------------------------------------------
# Réinitialisation (démo)
# ---------------------------------------------------------------------------

def reset_all() -> None:
    for f in (CONFIG_FILE, EVIDENCE_INDEX, JOURNAL_FILE, AUDIT_FILE, RESULT_FILE, PREFS_FILE):
        if f.exists():
            f.unlink()
    if EVIDENCE_DIR.exists():
        for p in EVIDENCE_DIR.iterdir():
            if p.is_file():
                p.unlink()
