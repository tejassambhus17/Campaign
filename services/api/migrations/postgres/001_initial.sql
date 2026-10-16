-- PostgreSQL schema: integer cents, UTC timestamp text and content JSON remain unchanged.
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('member','reviewer')),
  preferences_json TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES users(id),
  data_json TEXT NOT NULL, published_json TEXT, status TEXT NOT NULL,
  revision_status TEXT, version INTEGER NOT NULL DEFAULT 1,
  approved_version INTEGER, setup_ready INTEGER NOT NULL DEFAULT 0,
  feedback TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  deadline TEXT, report_json TEXT
);
CREATE TABLE IF NOT EXISTS campaign_events (
  id TEXT PRIMARY KEY, campaign_id TEXT NOT NULL REFERENCES campaigns(id),
  actor_id TEXT REFERENCES users(id), event_type TEXT NOT NULL, previous_state TEXT,
  new_state TEXT, version INTEGER NOT NULL, detail TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY, campaign_id TEXT NOT NULL REFERENCES campaigns(id), user_id TEXT REFERENCES users(id),
  actor_scope TEXT NOT NULL, idempotency_hash TEXT NOT NULL, request_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('successful','pending','rejected','cancelled','failed')),
  amount_cents INTEGER NOT NULL CHECK(amount_cents > 0), fee_cents INTEGER NOT NULL,
  ad_cents INTEGER NOT NULL, estimated_reach INTEGER NOT NULL,
  refunded_cents INTEGER NOT NULL DEFAULT 0, title TEXT NOT NULL, created_at TEXT NOT NULL,
  UNIQUE(actor_scope,idempotency_hash)
);
CREATE TABLE IF NOT EXISTS ledger (
  id TEXT PRIMARY KEY, payment_id TEXT NOT NULL REFERENCES payments(id),
  campaign_id TEXT NOT NULL REFERENCES campaigns(id), kind TEXT NOT NULL CHECK(kind IN ('contribution','refund')),
  gross_cents INTEGER NOT NULL, fee_cents INTEGER NOT NULL, ad_cents INTEGER NOT NULL,
  created_at TEXT NOT NULL, UNIQUE(payment_id,kind)
);
CREATE TABLE IF NOT EXISTS tracking (
  user_id TEXT NOT NULL REFERENCES users(id), campaign_id TEXT NOT NULL REFERENCES campaigns(id),
  kind TEXT NOT NULL CHECK(kind IN ('save','follow')), created_at TEXT NOT NULL,
  PRIMARY KEY(user_id,campaign_id,kind)
);
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), campaign_id TEXT REFERENCES campaigns(id),
  category TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0, dedup_key TEXT NOT NULL, insertion_order BIGSERIAL UNIQUE, UNIQUE(user_id,dedup_key)
);
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES users(id), purpose TEXT NOT NULL,
  filename TEXT NOT NULL, content_type TEXT NOT NULL, size INTEGER NOT NULL,
  width INTEGER NOT NULL, height INTEGER NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_campaign_owner ON campaigns(owner_id);
CREATE INDEX IF NOT EXISTS idx_payments_campaign ON payments(campaign_id,status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id,created_at);
CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);

