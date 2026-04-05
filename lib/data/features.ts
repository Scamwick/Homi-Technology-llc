import { createClient } from '@/lib/supabase/server';
import type {
  CoupleRow,
  BehavioralGenomeRow,
  TransformationPathRow,
  AssessmentRow,
  TemporalMessageRow,
  ProfileRow,
} from '@/types/database';

// =============================================================================
// lib/data/features.ts — Feature Page Data Access
// =============================================================================

// ── Couples ──────────────────────────────────────────────────────────────────

export interface CouplesData {
  couple: CoupleRow | null;
  partnerProfile: Pick<ProfileRow, 'id' | 'name' | 'avatar_url'> | null;
  userLatestAssessment: AssessmentRow | null;
  partnerLatestAssessment: AssessmentRow | null;
}

export async function getCouplesData(userId: string): Promise<CouplesData | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = await createClient();

  // Find couple where user is either initiator or partner
  const { data: couple } = await supabase
    .from('couples')
    .select('*')
    .or(`initiator_id.eq.${userId},partner_id.eq.${userId}`)
    .eq('status', 'active')
    .single();

  if (!couple) return { couple: null, partnerProfile: null, userLatestAssessment: null, partnerLatestAssessment: null };

  const partnerId = couple.initiator_id === userId ? couple.partner_id : couple.initiator_id;

  const [partnerProfileResult, userAssessmentResult, partnerAssessmentResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .eq('id', partnerId)
      .single(),
    supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('assessments')
      .select('*')
      .eq('user_id', partnerId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ]);

  return {
    couple,
    partnerProfile: partnerProfileResult.data ?? null,
    userLatestAssessment: userAssessmentResult.data ?? null,
    partnerLatestAssessment: partnerAssessmentResult.data ?? null,
  };
}

// ── Behavioral Genome ────────────────────────────────────────────────────────

export async function getGenomeData(userId: string): Promise<BehavioralGenomeRow | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('behavioral_genome')
    .select('*')
    .eq('user_id', userId)
    .single();

  return data ?? null;
}

// ── Transformation Path ──────────────────────────────────────────────────────

export interface TransformationData {
  path: TransformationPathRow | null;
  latestAssessment: AssessmentRow | null;
}

export async function getTransformationData(userId: string): Promise<TransformationData | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = await createClient();

  const [pathResult, assessmentResult] = await Promise.all([
    supabase
      .from('transformation_paths')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ]);

  return {
    path: pathResult.data ?? null,
    latestAssessment: assessmentResult.data ?? null,
  };
}

// ── Temporal Twin / Agent Messages ───────────────────────────────────────────

export async function getTemporalMessages(userId: string, threadId?: string): Promise<TemporalMessageRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

  const supabase = await createClient();
  let query = supabase
    .from('temporal_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (threadId) {
    query = query.eq('thread_id', threadId);
  } else {
    // Get latest thread
    query = query.limit(50);
  }

  const { data } = await query;
  return data ?? [];
}
