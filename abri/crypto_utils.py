import os
from cryptography.fernet import Fernet, InvalidToken


def load_key() -> bytes:
    """
    The key lives ONLY in the environment (or a secrets manager in prod),
    never in source control and never in the database. If an attacker
    only gets the DB file, they get unreadable ciphertext.
    """
    key = os.environ.get("MESSAGE_ENCRYPTION_KEY")
    if not key:
        raise RuntimeError(
            "MESSAGE_ENCRYPTION_KEY is not set. Generate one with "
            "generate_key.py and put it in your env / secrets manager."
        )
    return key.encode()


def get_fernet() -> Fernet:
    return Fernet(load_key())


def encrypt_message(plaintext: str) -> bytes:
    return get_fernet().encrypt(plaintext.encode("utf-8"))


def decrypt_message(ciphertext: bytes) -> str:
    try:
        return get_fernet().decrypt(ciphertext).decode("utf-8")
    except InvalidToken:
        # Wrong key, corrupted data, or tampering. Fernet's HMAC
        # authentication catches modified ciphertext here.
        raise ValueError("Message could not be decrypted or was tampered with")
