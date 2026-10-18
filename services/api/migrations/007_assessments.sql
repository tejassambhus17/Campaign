-- Additive trust records only. No campaign, payment, lifecycle or media rewrite.
CREATE TABLE IF NOT EXISTS campaign_seed_registry (
  campaign_id TEXT PRIMARY KEY REFERENCES campaigns(id),
  seed_version TEXT NOT NULL, initial_content_hash TEXT NOT NULL,
  provenance_json TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS campaign_assessments (
  id TEXT PRIMARY KEY, campaign_id TEXT NOT NULL REFERENCES campaigns(id),
  content_hash TEXT NOT NULL, snapshot_json TEXT NOT NULL, assessed_version INTEGER NOT NULL,
  rubric_version TEXT NOT NULL,
  assessment_type TEXT NOT NULL CHECK(assessment_type IN ('reviewer','demo')),
  status TEXT NOT NULL CHECK(status IN ('draft','published')),
  criteria_json TEXT NOT NULL, limitations_json TEXT NOT NULL,
  policy_context_json TEXT NOT NULL, provenance_json TEXT NOT NULL,
  actor_id TEXT REFERENCES users(id), published_by TEXT REFERENCES users(id), total INTEGER CHECK(total BETWEEN 0 AND 100),
  classification TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  published_at TEXT, public_bound_at TEXT, revision INTEGER NOT NULL DEFAULT 1, seed_key TEXT UNIQUE,
  CHECK ((status='draft' AND total IS NULL AND published_at IS NULL) OR
         (status='published' AND total IS NOT NULL AND published_at IS NOT NULL)),
  CHECK ((assessment_type='reviewer' AND actor_id IS NOT NULL AND seed_key IS NULL) OR
         (assessment_type='demo' AND actor_id IS NULL AND seed_key IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_assessment_published_revision
  ON campaign_assessments(campaign_id,content_hash,rubric_version,assessment_type)
  WHERE status='published';
CREATE INDEX IF NOT EXISTS idx_assessment_campaign
  ON campaign_assessments(campaign_id,status,published_at);
