CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY, campaign_id TEXT NOT NULL REFERENCES campaigns(id),
  user_id TEXT NOT NULL REFERENCES users(id), visuals TEXT NOT NULL, persuasion TEXT NOT NULL,
  created_at TEXT NOT NULL, UNIQUE(campaign_id,user_id)
);
