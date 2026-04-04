import { createClient } from '@/lib/supabase/server';
import type { AssessmentRow, NotificationRow, TransformationPathRow, BehavioralGenomeRow, CoupleRow, ProfileRow } from '@/types/database';

// =============================================================================
// lib/data/dashboard.ts — User Dashboard Data Access
// =============================================================================
// Server-side functions that query Supabase for the user dashboard.
// All functions require an authenticated user ID.
// =============================================================================

/** Score history entry for the assessment trend chart. */
export interface ScoreHistoryEntry {
  date: string;
  score: number;
  verdict: string;
  financial: number;
  emotional: number;
  timing: number;
}

/** User dashboard data bundle — fetched in a single call. */
export interface DashboardData {
  profile: ProfileRow | null;
  latestAssessment: AssessmentRow | null;
  scoreHistory: ScoreHistoryEntry[];
  notifications: NotificationRow[];
  transformationPath: TransformationPathRow | null;
  genome: BehavioralGenomeRow | null;
  couple: (CoupleRow & { partner_name?: string; partner_score?: number }) | null;
  assessmentCount: number;
}

/**
 * Fetch all data needed for the user dashboard.
 * Returns null if Supabase is not configured.
 */
export async function getDashboardData(userId: string): Promise<DashboardData | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await createClient();

  // Run all queries in parallel for performance
  const [
    profileResult,
    assessmentsResult,
    notificationsResult,
    transformationResult,
    genomeResult,
    coupleResult,
    countResult,
  ] = await Promise.all([
    // User profile
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single(),

    // Assessment history (most recent 12)
    supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(12),

    // Recent notifications (unread + last 5)
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),

    // Active transformation path
    supabase
      .from('transformation_paths')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),

    // Behavioral genome
    supabase
      .from('behavioral_genome')
      .select('*')
      .eq('user_id', userId)
      .single(),

    // Active couple link
    supabase
      .from('couples')
      .select('*')
      .or(`initiator_id.eq.${userId},partner_id.eq.${userId}`)
      .eq('status', 'active')
      .limit(1)
      .single(),

    // Total assessment count
    supabase
      .from('assessments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
  ]);

  // Build score history from assessments
  const assessments = assessmentsResult.data ?? [];
  const scoreHistory: ScoreHistoryEntry[] = assessments.map((a) => ({
    date: new Date(a.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    score: a.overall_score,
    verdict: a.verdict,
    financial: a.financial_score,
    emotional: a.emotional_score,
    timing: a.timing_score,
  }));

  // Get latest assessment
  const latestAssessment = assessments.length > 0
    ? assessments[assessments.length - 1]
    : null;

  // If coupled, fetch partner info
  let coupleWithPartner = null;
  if (coupleResult.data) {
    const partnerId = coupleResult.data.initiator_id === userId
      ? coupleResult.data.partner_id
      : coupleResult.data.initiator_id;

    const [partnerProfile, partnerAssessment] = await Promise.all([
      supabase.from('profiles').select('name').eq('id', partnerId).single(),
      supabase
        .from('assessments')
        .select('overall_score')
        .eq('user_id', partnerId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
    ]);

    coupleWithPartner = {
      ...coupleResult.data,
      partner_name: partnerProfile.data?.name ?? undefined,
      partner_score: partnerAssessment.data?.overall_score ?? undefined,
    };
  }

  return {
    profile: profileResult.data,
    latestAssessment,
    scoreHistory,
    notifications: notificationsResult.data ?? [],
    transformationPath: transformationResult.data,
    genome: genomeResult.data,
    couple: coupleWithPartner,
    assessmentCount: countResult.count ?? 0,
  };
}
