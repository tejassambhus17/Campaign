-- Account-only images are never placed in the public campaign-media directory.
CREATE TABLE IF NOT EXISTS profile_avatars (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  jpeg BYTEA NOT NULL CHECK(octet_length(jpeg) > 0 AND octet_length(jpeg) <= 2097152),
  updated_at TEXT NOT NULL
);
