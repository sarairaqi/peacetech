"""Run once to generate a key, then store it as an env var / secret."""
from cryptography.fernet import Fernet

if __name__ == "__main__":
    print(Fernet.generate_key().decode())
