"""
models.py — Accès à la base de données SQLite du prototype Abri.

Une seule connexion par requête HTTP, mise en cache dans le contexte Flask
`g` et fermée automatiquement à la fin de la requête (`teardown_appcontext`).
Chaque module (messaging.py, logic.py, ...) crée ses propres tables à la
demande (`CREATE TABLE IF NOT EXISTS ...`) dans ce même fichier de base.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

from flask import g

DB_PATH = Path(__file__).resolve().parent / "instance" / "abri.db"


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    # Les lignes supprimées sont écrasées par des zéros au lieu de rester
    # dans les pages libres du fichier : un message effacé ne peut pas être
    # récupéré en fouillant la base.
    conn.execute("PRAGMA secure_delete = ON")
    return conn


def get_db() -> sqlite3.Connection:
    """
    Renvoie la connexion de la requête Flask en cours, en la créant si besoin.
    Nécessite un contexte d'application actif (une requête HTTP, ou un bloc
    `with app.app_context():` en dehors d'une requête, par ex. pour --reset).
    """
    if "db" not in g:
        g.db = _connect()
    return g.db


def close_db(exception=None) -> None:
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_app(app) -> None:
    """À appeler une fois au démarrage : ferme la connexion après chaque requête."""
    app.teardown_appcontext(close_db)


def reset_db() -> None:
    """
    Supprime entièrement le fichier de base. Plus radical que de vider les
    tables une à une — à utiliser seulement si on veut repartir de zéro
    (schémas compris). Pour un reset « démo » plus ciblé, préférez vider
    les tables via les fonctions de chaque module (ex. messaging.wipe_messages).
    """
    close_db()
    if DB_PATH.exists():
        DB_PATH.unlink()
