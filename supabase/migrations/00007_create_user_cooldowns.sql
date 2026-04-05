-- User cooldowns — server-authoritative rate limiting for safety module
-- Ensures assessment cooldown periods are enforced server-side, not just via localStorage.

CREATE TABLE user_cooldowns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  triggered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_cooldowns_user ON user_cooldowns(user_id);
CREATE INDEX idx_user_cooldowns_expires ON user_cooldowns(expires_at);

ALTER TABLE user_cooldowns ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_cooldowns_select
  ON user_cooldowns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY user_cooldowns_insert
  ON user_cooldowns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_cooldowns_update
  ON user_cooldowns FOR UPDATE
  USING (auth.uid() = user_id);
