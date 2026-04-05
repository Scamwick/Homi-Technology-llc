import { createClient } from '@/lib/supabase/server';
import type { AssessmentRow, MonteCarloResultRow, TrinityAnalysisRow } from '@/types/database';

// =============================================================================
// lib/data/assessments.ts — Assessment Data Access
// =============================================================================

export interface AssessmentWithDetails extends AssessmentRow {
  monte_carlo: MonteCarloResultRow | null;
  trinity: TrinityAnalysisRow | null;
}

/**
 * Fetch all assessments for a user, ordered by most recent first.
 */
export async function getUserAssessments(userId: string): Promise<AssessmentRow[] | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return data ?? [];
}

/**
 * Fetch a single assessment by ID with monte carlo and trinity analysis.
 */
export async function getAssessmentById(
  assessmentId: string,
  userId: string,
): Promise<AssessmentWithDetails | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = await createClient();

  const [assessmentResult, monteCarloResult, trinityResult] = await Promise.all([
    supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('user_id', userId)
      .single(),
    supabase
      .from('monte_carlo_results')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single(),
    supabase
      .from('trinity_analyses')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single(),
  ]);

  if (!assessmentResult.data) return null;

  return {
    ...assessmentResult.data,
    monte_carlo: monteCarloResult.data ?? null,
    trinity: trinityResult.data ?? null,
  };
}
