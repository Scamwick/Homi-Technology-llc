-- ═══════════════════════════════════════════════════════════════════════════
-- HōMI COMPANIONS - Database Schema
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- COMPANION SESSIONS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE companion_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Current companion
  companion TEXT NOT NULL CHECK (companion IN ('dog', 'dolphin', 'owl')),
  
  -- Score state
  score INTEGER DEFAULT 58 CHECK (score >= 0 AND score <= 100),
  score_breakdown JSONB DEFAULT '{"financial": 50, "emotional": 50, "timing": 50}'::jsonb,
  
  -- Conversation
  messages JSONB DEFAULT '[]'::jsonb,
  -- Each message: { role: 'user'|'assistant'|'system', content: string, timestamp: string, companion?: string }
  
  -- Extracted intelligence
  extracted_details JSONB DEFAULT '{}'::jsonb,
  -- { partnerConcern?: string, biggestFear?: string, timeline?: string, mentionedBudget?: string }
  
  -- Companion switch history
  companion_history JSONB DEFAULT '[]'::jsonb,
  -- [{ from: string, to: string, timestamp: string }]
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  
  -- Indexes
  CONSTRAINT valid_messages CHECK (jsonb_typeof(messages) = 'array')
);

-- Index for quick user session lookup
CREATE INDEX idx_companion_sessions_user_id ON companion_sessions(user_id);
CREATE INDEX idx_companion_sessions_status ON companion_sessions(status);
CREATE INDEX idx_companion_sessions_updated ON companion_sessions(updated_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- COMPANION USAGE ANALYTICS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE companion_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  companion TEXT NOT NULL CHECK (companion IN ('dog', 'dolphin', 'owl')),
  message_count INTEGER DEFAULT 1,
  
  -- Session context
  session_id UUID REFERENCES companion_sessions(id) ON DELETE SET NULL,
  
  -- Score at time of interaction
  score_at_time INTEGER,
  
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companion_usage_user_id ON companion_usage(user_id);
CREATE INDEX idx_companion_usage_timestamp ON companion_usage(timestamp DESC);
CREATE INDEX idx_companion_usage_companion ON companion_usage(companion);

-- ─────────────────────────────────────────────────────────────────────────────
-- USER COMPANION PREFERENCES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE companion_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Default companion
  default_companion TEXT CHECK (default_companion IN ('dog', 'dolphin', 'owl')),
  
  -- UI preferences
  animations_enabled BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT false,
  haptic_enabled BOOLEAN DEFAULT true,
  
  -- Notification preferences
  daily_checkin_enabled BOOLEAN DEFAULT false,
  checkin_time TIME DEFAULT '09:00:00',
  
  -- Companion unlock status (for gamification)
  unlocked_companions TEXT[] DEFAULT ARRAY['dog']::TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS
ALTER TABLE companion_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_preferences ENABLE ROW LEVEL SECURITY;

-- Sessions: Users can only access their own
CREATE POLICY "Users can view own sessions"
  ON companion_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON companion_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON companion_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON companion_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Usage: Users can only access their own
CREATE POLICY "Users can view own usage"
  ON companion_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert usage"
  ON companion_usage FOR INSERT
  WITH CHECK (true); -- Backend inserts via service role

-- Preferences: Users can only access their own
CREATE POLICY "Users can view own preferences"
  ON companion_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own preferences"
  ON companion_preferences FOR ALL
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companion_sessions_updated_at
  BEFORE UPDATE ON companion_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_companion_preferences_updated_at
  BEFORE UPDATE ON companion_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Get user's companion stats
CREATE OR REPLACE FUNCTION get_companion_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_sessions', COUNT(DISTINCT session_id),
    'total_messages', SUM(message_count),
    'favorite_companion', (
      SELECT companion 
      FROM companion_usage 
      WHERE user_id = p_user_id 
      GROUP BY companion 
      ORDER BY SUM(message_count) DESC 
      LIMIT 1
    ),
    'companion_breakdown', (
      SELECT jsonb_object_agg(companion, cnt)
      FROM (
        SELECT companion, SUM(message_count) as cnt
        FROM companion_usage
        WHERE user_id = p_user_id
        GROUP BY companion
      ) sub
    ),
    'last_session', (
      SELECT MAX(timestamp) FROM companion_usage WHERE user_id = p_user_id
    )
  ) INTO result
  FROM companion_usage
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- GRANTS
-- ─────────────────────────────────────────────────────────────────────────────

-- Grant usage to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON companion_sessions TO authenticated;
GRANT ALL ON companion_usage TO authenticated;
GRANT ALL ON companion_preferences TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_companion_stats TO authenticated;
