ALTER TABLE campaigns ADD COLUMN client_draft_id TEXT;
CREATE UNIQUE INDEX idx_campaign_client_draft ON campaigns(owner_id,client_draft_id) WHERE client_draft_id IS NOT NULL;
