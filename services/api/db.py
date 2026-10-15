"""Project-local SQLite transactions and migrations; no external service access."""
from __future__ import annotations

import hashlib
import hmac
import json
import os
from pathlib import Path
import secrets
import sqlite3
from contextlib import contextmanager

from domain import DEFAULT_PREFERENCES, stamp

ROOT = Path(__file__).resolve().parent


class ClosingConnection(sqlite3.Connection):
    """sqlite3's default context manager commits but does not close its handle."""
    def __exit__(self, exc_type, exc_value, traceback):
        try:
            return super().__exit__(exc_type, exc_value, traceback)
        finally:
            self.close()


def identifier(prefix: str) -> str:
    return f'{prefix}_{secrets.token_hex(12)}'


def digest(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=16384, r=8, p=1)
    return f'scrypt$16384$8$1${salt}${key.hex()}'


def verify_password(password: str, stored: str) -> bool:
    try:
        _, n, r, p, salt, expected = stored.split('$')
        result = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=int(n), r=int(r), p=int(p))
        return hmac.compare_digest(result.hex(), expected)
    except (ValueError, TypeError):
        return False


class Database:
    def __init__(self, path: str | Path | None = None):
        self.path = Path(path or os.getenv('CAMPAIGN_DB_PATH', ROOT / 'data' / 'campaign.db')).resolve()
        # Keep app-owned state inside this service, including a user-provided path.
        if not self.path.is_relative_to(ROOT):
            raise ValueError('CAMPAIGN_DB_PATH must be within services/api.')
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.media = self.path.parent / 'uploads'
        self.media = self.media.resolve()
        if not self.media.is_relative_to(ROOT):
            raise ValueError('Upload storage must remain within services/api.')
        self.media.mkdir(exist_ok=True)
        secret_path = (self.path.parent / '.receipt-secret').resolve()
        if not secret_path.is_relative_to(ROOT):
            raise ValueError('Receipt secret must remain within services/api.')
        if not secret_path.exists():
            try:
                with secret_path.open('x', encoding='utf-8') as handle:
                    handle.write(secrets.token_hex(32))
            except FileExistsError:
                pass
        self.secret = secret_path.read_text(encoding='utf-8').strip().encode()
        self.initialize()

    def connect(self):
        connection = sqlite3.connect(self.path, timeout=30, check_same_thread=False, factory=ClosingConnection)
        connection.row_factory = sqlite3.Row
        connection.execute('PRAGMA foreign_keys=ON')
        connection.execute('PRAGMA busy_timeout=30000')
        return connection

    @contextmanager
    def transaction(self):
        connection = self.connect()
        try:
            connection.execute('BEGIN IMMEDIATE')
            yield connection
            connection.commit()
        except BaseException:
            connection.rollback()
            raise
        finally:
            connection.close()

    def initialize(self):
        with self.connect() as connection:
            connection.execute('PRAGMA journal_mode=WAL')
            connection.execute('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)')
            for migration in sorted((ROOT / 'migrations').glob('*.sql')):
                version = int(migration.name.split('_')[0])
                if connection.execute('SELECT 1 FROM schema_migrations WHERE version=?', (version,)).fetchone():
                    continue
                connection.executescript(migration.read_text(encoding='utf-8'))
                connection.execute('INSERT OR IGNORE INTO schema_migrations VALUES (?,?)',
                                   (version, stamp()))

    def receipt_token(self, payment_id: str) -> str:
        return hmac.new(self.secret, payment_id.encode(), hashlib.sha256).hexdigest()

    def seed_reviewer(self):
        email = os.getenv('CAMPAIGN_REVIEWER_EMAIL', 'reviewer@amplify.local').strip().lower()
        with self.transaction() as connection:
            if connection.execute('SELECT id FROM users WHERE email=?', (email,)).fetchone():
                return
            supplied = os.getenv('CAMPAIGN_REVIEWER_PASSWORD')
            password = supplied or secrets.token_urlsafe(20)
            if len(password) < 12:
                raise ValueError('CAMPAIGN_REVIEWER_PASSWORD must have at least 12 characters.')
            connection.execute('INSERT INTO users VALUES (?,?,?,?,?,?,?)',
                               (identifier('usr'), 'Campaign Reviewer', email, hash_password(password),
                                'reviewer', json.dumps(DEFAULT_PREFERENCES), stamp()))
            if not supplied:
                (ROOT / '.demo-credentials.json').write_text(json.dumps({
                    'note': 'Local reviewer credentials. Keep private; never bundle with the mobile app.',
                    'email': email, 'password': password}, indent=2), encoding='utf-8')

