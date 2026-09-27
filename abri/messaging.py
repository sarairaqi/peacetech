"""
messaging.py — Messagerie sécurisée de l'espace « Abri ».

Chaque message est chiffré (Fernet : AES-128-CBC + HMAC-SHA256) avant d'être
écrit sur disque. Une copie de la base de données ne révèle donc aucun
contenu en clair — seule la clé, qui n'est jamais stockée dans la base,
permet de déchiffrer.

Gestion de la clé :
  - Si la variable d'environnement ABRI_MESSAGE_KEY est définie, elle est
    utilisée telle quelle (recommandé en production : secret manager / env).
  - Sinon, une clé est générée au premier lancement et stockée localement
    dans instance/message.key (hors du dépôt — pensez à l'ajouter à
    .gitignore). Cela permet à la démo de fonctionner sans configuration,
    mais pour un déploiement réel, préférez la variable d'environnement.

Côté destinataire : il n'y a pas encore de vrai canal (SMS chiffré, email…)
relié aux organisations. Pour la démo, la « console conseil » (/conseil)
joue le rôle de l'intervenant·e : ses réponses sont enregistrées avec
direction="in", celles de la personne utilisatrice avec direction="out".
"""

from __future__ import annotations

import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from cryptography.fernet import Fernet, InvalidToken

import content as C

# ---------------------------------------------------------------------------
# Clé de chiffrement
# ---------------------------------------------------------------------------

_KEY_ENV_VAR = "ABRI_MESSAGE_KEY"
_KEY_FILE = Path(__file__).resolve().parent / "instance" / "message.key"


def _load_or_create_key() -> bytes:
    env_key = os.environ.get(_KEY_ENV_VAR)
    if env_key:
        return env_key.encode()

    if _KEY_FILE.exists():
        return _KEY_FILE.read_bytes()

    _KEY_FILE.parent.mkdir(parents=True, exist_ok=True)
    key = Fernet.generate_key()
    _KEY_FILE.write_bytes(key)
    try:
        os.chmod(_KEY_FILE, 0o600)  # lecture/écriture propriétaire uniquement
    except OSError:
        pass  # chmod indisponible sur certains systèmes (ex. Windows)
    return key


_fernet = Fernet(_load_or_create_key())


def _encrypt(text: str) -> bytes:
    return _fernet.encrypt(text.encode("utf-8"))


def _decrypt(blob: bytes) -> str:
    try:
        return _fernet.decrypt(blob).decode("utf-8")
    except InvalidToken:
        # Mauvaise clé ou donnée corrompue/altérée (l'authentification HMAC
        # de Fernet a rejeté le contenu) : on ne fait jamais planter l'appel.
        return "⚠️ message illisible (clé différente ou donnée corrompue)"


# ---------------------------------------------------------------------------
# Schéma (créé à la demande, indépendant du reste de models.py)
# ---------------------------------------------------------------------------

def _ensure_schema(db: sqlite3.Connection) -> None:
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS messages (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id  TEXT NOT NULL,
            direction   TEXT NOT NULL DEFAULT 'out',
            ciphertext  BLOB NOT NULL,
            created_at  TEXT NOT NULL
        )
        """
    )
    db.execute("CREATE INDEX IF NOT EXISTS idx_messages_contact ON messages(contact_id)")
    db.commit()


def _known_contact_ids() -> set[str]:
    return {c["id"] for c in C.CONTACTS}


def _row_to_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "contact_id": row["contact_id"],
        "direction": row["direction"],
        "content": _decrypt(row["ciphertext"]),
        "created_at": row["created_at"],
    }


# ---------------------------------------------------------------------------
# API utilisée par app.py
# ---------------------------------------------------------------------------

def wipe_messages(db: sqlite3.Connection) -> None:
    """Efface tout l'historique des messages (utilisé par le reset démo)."""
    _ensure_schema(db)
    db.execute("DELETE FROM messages")
    db.commit()


def delete_message(db: sqlite3.Connection, message_id: int) -> bool:
    """Efface un message. Renvoie False s'il n'existait pas."""
    _ensure_schema(db)
    cur = db.execute("DELETE FROM messages WHERE id = ?", (message_id,))
    db.commit()
    return cur.rowcount > 0


def wipe_conversation(db: sqlite3.Connection, contact_id: str) -> int:
    """Efface toute la conversation avec un contact. Renvoie le nombre de messages effacés."""
    _ensure_schema(db)
    cur = db.execute("DELETE FROM messages WHERE contact_id = ?", (contact_id,))
    db.commit()
    return cur.rowcount


def _insert(db: sqlite3.Connection, contact_id: str, content: str, direction: str) -> dict:
    content = (content or "").strip()
    if not content:
        raise ValueError("Le message est vide")
    if len(content) > 5000:
        raise ValueError("Le message est trop long (5000 caractères maximum)")
    if contact_id not in _known_contact_ids():
        raise ValueError("Contact inconnu")

    created_at = datetime.now(timezone.utc).isoformat()
    cur = db.execute(
        "INSERT INTO messages (contact_id, direction, ciphertext, created_at) "
        "VALUES (?, ?, ?, ?)",
        (contact_id, direction, _encrypt(content), created_at),
    )
    db.commit()

    return {
        "id": cur.lastrowid,
        "contact_id": contact_id,
        "direction": direction,
        "content": content,
        "created_at": created_at,
    }


def send_message(db: sqlite3.Connection, contact_id: str, content: str) -> dict:
    """Message envoyé par la personne utilisatrice à un contact."""
    _ensure_schema(db)
    return _insert(db, contact_id, content, "out")


def receive_message(db: sqlite3.Connection, contact_id: str, content: str) -> dict:
    """Réponse du contact (saisie depuis la console conseil pour la démo)."""
    _ensure_schema(db)
    return _insert(db, contact_id, content, "in")


def list_messages(db: sqlite3.Connection, contact_id: str | None = None) -> list[dict]:
    _ensure_schema(db)

    if contact_id:
        rows = db.execute(
            "SELECT id, contact_id, direction, ciphertext, created_at "
            "FROM messages WHERE contact_id = ? ORDER BY created_at ASC",
            (contact_id,),
        ).fetchall()
    else:
        rows = db.execute(
            "SELECT id, contact_id, direction, ciphertext, created_at "
            "FROM messages ORDER BY created_at ASC"
        ).fetchall()

    return [_row_to_dict(r) for r in rows]


def conversation_summary(db: sqlite3.Connection) -> list[dict]:
    """Un résumé par contact : dernier message, nombre total, horodatage."""
    _ensure_schema(db)

    rows = db.execute(
        "SELECT id, contact_id, direction, ciphertext, created_at "
        "FROM messages ORDER BY created_at ASC"
    ).fetchall()

    by_contact: dict[str, list[dict]] = {}
    for r in rows:
        by_contact.setdefault(r["contact_id"], []).append(_row_to_dict(r))

    contacts_by_id = {c["id"]: c for c in C.CONTACTS}
    summary = []
    for contact_id, msgs in by_contact.items():
        last = msgs[-1]
        contact = contacts_by_id.get(contact_id, {"id": contact_id, "name": contact_id})
        summary.append({
            "contact_id": contact_id,
            "name": contact.get("org", contact_id),
            "last_message": last["content"][:120],
            "last_direction": last["direction"],
            "last_at": last["created_at"],
            "count": len(msgs),
        })

    summary.sort(key=lambda s: s["last_at"], reverse=True)
    return summary
