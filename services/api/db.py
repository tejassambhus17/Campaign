"""SQLite locally, PostgreSQL when explicitly configured; shared transaction rules."""
from __future__ import annotations

import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import secrets
import sqlite3
from contextlib import contextmanager

try:
    import psycopg
except ImportError:  # The local SQLite prototype remains usable without cloud dependencies.
    psycopg = None

from domain import DEFAULT_PREFERENCES, stamp

ROOT = Path(__file__).resolve().parent
INTEGRITY_ERRORS = (sqlite3.IntegrityError,) + ((psycopg.IntegrityError,) if psycopg else ())
# Preserve the serialized read/modify/write behavior of SQLite BEGIN IMMEDIATE.
# A transaction-scoped lock also works with Neon's transaction-pooling endpoint.
WRITE_LOCK = 0x43414D504149474E


class Record(dict):
    """The app uses sqlite3.Row's named and positional lookup, as well as dict(row)."""
    def __getitem__(self, key):
        if isinstance(key, (int, slice)):
            return tuple(self.values())[key]
        return super().__getitem__(key)


def record_factory(cursor):
    columns = [column.name for column in cursor.description] if cursor.description else []
    return lambda values: Record(zip(columns, values))


def postgres_query(statement: str) -> str:
    """Translate our qmark SQL without treating quoted text/comments as parameters.

    Only app-owned statements reach this adapter; user values stay parameters.
    PostgreSQL percent signs must be escaped when psycopg binds parameters.
    """
    result = []
    position, quote, comment = 0, None, None
    while position < len(statement):
        character = statement[position]
        following = statement[position:position + 2]
        if comment == 'line':
            if character == '\n':
                comment = None
        elif comment == 'block':
            if following == '*/':
                result.append('*/')
                position += 2
                comment = None
                continue
        elif quote:
            if character == quote:
                if following == quote * 2:
                    result.append(following)
                    position += 2
                    continue
                quote = None
        elif following in {'--', '/*'}:
            comment = 'line' if following == '--' else 'block'
            result.append(following)
            position += 2
            continue
        elif character in {"'", '"'}:
            quote = character
        elif character == '?':
            result.append('%s')
            position += 1
            continue
        result.append('%%' if character == '%' else character)
        position += 1
    return ''.join(result)


class PostgresConnection:
    """Small DB-API bridge; domain SQL and public API behavior remain shared."""
    def __init__(self, connection):
        self.connection = connection

    def execute(self, statement, parameters=None):
        if parameters is None:
            return self.connection.execute(statement, prepare=False)
        return self.connection.execute(postgres_query(statement), parameters, prepare=False)

    def executescript(self, statement):
        return self.connection.execute(statement, prepare=False)

    def commit(self):
        self.connection.commit()

    def rollback(self):
        self.connection.rollback()

    def close(self):
        self.connection.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return self.connection.__exit__(exc_type, exc_value, traceback)


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
        # Explicit paths are always SQLite, including existing isolated API tests.
        self.url = os.getenv('CAMPAIGN_DATABASE_URL', '').strip() if path is None else ''
        self.backend = 'postgresql' if self.url else 'sqlite'
        self.notification_order = 'insertion_order' if self.url else 'rowid'
        self.schema = os.getenv('CAMPAIGN_DATABASE_SCHEMA', 'public') if self.url else None
        if self.url:
            if psycopg is None:
                raise ValueError('PostgreSQL requires the pinned psycopg[binary] dependency.')
            if not self.url.startswith(('postgres://', 'postgresql://')):
                raise ValueError('CAMPAIGN_DATABASE_URL must be a PostgreSQL URL.')
            if not re.fullmatch(r'[a-z_][a-z0-9_]{0,62}', self.schema):
                raise ValueError('CAMPAIGN_DATABASE_SCHEMA must be a simple PostgreSQL identifier.')
            supplied_secret = os.getenv('CAMPAIGN_RECEIPT_SECRET', '')
            if len(supplied_secret) < 32:
                raise ValueError('PostgreSQL requires CAMPAIGN_RECEIPT_SECRET with at least 32 characters.')
            self.secret = supplied_secret.encode()
            self.path = None
            # This is a disposable cache only; cloud mode must use durable media storage.
            self.media = (ROOT / 'data' / 'cloud-cache' / 'uploads').resolve()
            if not self.media.is_relative_to(ROOT):
                raise ValueError('Upload cache must remain within services/api.')
            self.media.mkdir(parents=True, exist_ok=True)
            self.initialize()
            return
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
        if self.url:
            connection = psycopg.connect(self.url, row_factory=record_factory,
                                         connect_timeout=10, prepare_threshold=None,
                                         options='-c statement_timeout=30000 -c lock_timeout=30000')
            wrapped = PostgresConnection(connection)
            # Only the strictly validated identifier above is interpolated.
            wrapped.execute(f'SET LOCAL search_path TO "{self.schema}"')
            return wrapped
        connection = sqlite3.connect(self.path, timeout=30, check_same_thread=False, factory=ClosingConnection)
        connection.row_factory = sqlite3.Row
        connection.execute('PRAGMA foreign_keys=ON')
        connection.execute('PRAGMA busy_timeout=30000')
        return connection

    @contextmanager
    def transaction(self):
        connection = self.connect()
        try:
            if self.url:
                connection.execute('SELECT pg_advisory_xact_lock(?)', (WRITE_LOCK,))
            else:
                connection.execute('BEGIN IMMEDIATE')
            yield connection
            connection.commit()
        except BaseException:
            connection.rollback()
            raise
        finally:
            connection.close()

    def initialize(self):
        if self.url:
            # Schema creation and each migration commit atomically; startup races
            # take the same lock as mutations before inspecting schema_migrations.
            with self.transaction() as connection:
                connection.execute('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)')
                for migration in sorted((ROOT / 'migrations' / 'postgres').glob('*.sql')):
                    version = int(migration.name.split('_')[0])
                    if connection.execute('SELECT 1 FROM schema_migrations WHERE version=?', (version,)).fetchone():
                        continue
                    connection.executescript(migration.read_text(encoding='utf-8'))
                    connection.execute('INSERT INTO schema_migrations VALUES (?,?)', (version, stamp()))
            return
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
        supplied = os.getenv('CAMPAIGN_REVIEWER_PASSWORD')
        if self.url and (not os.getenv('CAMPAIGN_REVIEWER_EMAIL') or not supplied):
            raise ValueError('PostgreSQL requires explicitly configured reviewer email and password.')
        if self.url and len(supplied) < 12:
            raise ValueError('CAMPAIGN_REVIEWER_PASSWORD must have at least 12 characters.')
        with self.transaction() as connection:
            existing = connection.execute('SELECT id,role FROM users WHERE email=?', (email,)).fetchone()
            if existing:
                if (self.url or os.getenv('CAMPAIGN_ENV') == 'cloud') and existing['role'] != 'reviewer':
                    raise ValueError('Configured reviewer email belongs to a member; choose a separate reviewer address.')
                return
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

