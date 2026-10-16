-- Existing asset metadata and positional inserts remain unchanged. A missing
-- mapping denotes the original project-local image file.
CREATE TABLE IF NOT EXISTS asset_storage (
  asset_id TEXT PRIMARY KEY REFERENCES assets(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK(provider IN ('local','cloudinary')),
  public_id TEXT,
  version TEXT,
  CHECK ((provider='local' AND public_id IS NULL AND version IS NULL) OR
         (provider='cloudinary' AND public_id IS NOT NULL AND version IS NOT NULL))
);
