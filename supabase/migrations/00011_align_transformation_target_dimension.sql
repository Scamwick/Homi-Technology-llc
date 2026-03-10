-- Add target_dimension to transformation_paths for focused improvement tracking
ALTER TABLE transformation_paths
  ADD COLUMN IF NOT EXISTS target_dimension text
    CHECK (target_dimension IN ('financial', 'emotional', 'timing', 'overall')),
  ADD COLUMN IF NOT EXISTS target_score     integer CHECK (target_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS current_score    integer CHECK (current_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS score_delta      integer GENERATED ALWAYS AS (
    CASE WHEN target_score IS NOT NULL AND current_score IS NOT NULL
         THEN target_score - current_score
         ELSE NULL END
  ) STORED;

-- Index for querying paths by dimension
CREATE INDEX IF NOT EXISTS idx_transformation_paths_dimension
  ON transformation_paths(target_dimension)
  WHERE target_dimension IS NOT NULL;

-- Backfill: set target_dimension = 'overall' for existing paths
UPDATE transformation_paths
SET target_dimension = 'overall',
    target_score     = 65
WHERE target_dimension IS NULL;

COMMENT ON COLUMN transformation_paths.target_dimension IS 'Which dimension this path is focused on improving';
COMMENT ON COLUMN transformation_paths.target_score     IS 'Score target to hit before reassessing';
COMMENT ON COLUMN transformation_paths.current_score    IS 'Score at path creation time';
COMMENT ON COLUMN transformation_paths.score_delta      IS 'Points needed to reach target (computed)';
