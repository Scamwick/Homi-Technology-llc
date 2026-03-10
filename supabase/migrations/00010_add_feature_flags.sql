-- Feature flags table for enabling/disabling features per user or globally
CREATE TABLE IF NOT EXISTS feature_flags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key    text NOT NULL UNIQUE,
  enabled     boolean NOT NULL DEFAULT false,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Per-user feature flag overrides
CREATE TABLE IF NOT EXISTS user_feature_flags (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flag_key   text NOT NULL,
  enabled    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, flag_key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(flag_key);
CREATE INDEX IF NOT EXISTS idx_user_feature_flags_user ON user_feature_flags(user_id);

-- RLS
ALTER TABLE feature_flags      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feature_flags ENABLE ROW LEVEL SECURITY;

-- Everyone can read global flags
CREATE POLICY "feature_flags_read" ON feature_flags FOR SELECT USING (true);

-- Users can read their own overrides
CREATE POLICY "user_feature_flags_read"   ON user_feature_flags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_feature_flags_insert" ON user_feature_flags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_feature_flags_update" ON user_feature_flags FOR UPDATE USING (auth.uid() = user_id);

-- Seed default flags
INSERT INTO feature_flags (flag_key, enabled, description) VALUES
  ('ai_coach',           true,  'AI Coach chat panel'),
  ('panels',             true,  'Decision panels (Strategy, Mindful, Command, Impulse, Network, Outcomes)'),
  ('certification',      true,  'Readiness certification'),
  ('marketplace',        true,  'Advisor marketplace'),
  ('behavioral_genome',  true,  'Behavioral genome tracking'),
  ('monte_carlo',        true,  'Monte Carlo simulation'),
  ('temporal_twin',      true,  'Temporal twin messaging'),
  ('trinity_engine',     true,  'Trinity Engine debates'),
  ('blind_budget',       true,  'Blind budget mode'),
  ('impulse_protection', true,  'Real-time impulse protection')
ON CONFLICT (flag_key) DO NOTHING;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_feature_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_feature_flags_updated_at();

COMMENT ON TABLE feature_flags      IS 'Global feature flag registry';
COMMENT ON TABLE user_feature_flags IS 'Per-user feature flag overrides';
