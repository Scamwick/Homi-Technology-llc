import { createClient } from '@/lib/supabase/server';
import type { OrganizationRow, AssessmentRow, ProfileRow } from '@/types/database';

// =============================================================================
// lib/data/partner.ts — Partner Portal Data Access
// =============================================================================

export interface PartnerClient {
  id: string;
  user_id: string;
  role: string;
  accepted: boolean;
  created_at: string;
  profile: Pick<ProfileRow, 'id' | 'name' | 'email' | 'avatar_url' | 'created_at'> | null;
  latest_assessment: Pick<AssessmentRow, 'overall_score' | 'verdict' | 'created_at'> | null;
  assessment_count: number;
}

export interface PartnerDashboardData {
  organization: OrganizationRow | null;
  clientCount: number;
  totalAssessments: number;
  readyCount: number;
  recentAssessments: (AssessmentRow & { user_name?: string; user_email?: string })[];
}

export async function getPartnerOrganization(userId: string): Promise<{ orgId: string; role: string } | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('partner_users')
    .select('organization_id, role')
    .eq('user_id', userId)
    .eq('accepted', true)
    .single();

  if (!data) return null;
  return { orgId: data.organization_id, role: data.role };
}

export async function getPartnerDashboardData(orgId: string): Promise<PartnerDashboardData | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = await createClient();

  // Get organization details
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single();

  // Get all member user IDs
  const { data: members } = await supabase
    .from('partner_users')
    .select('user_id')
    .eq('organization_id', orgId)
    .eq('accepted', true);

  const memberIds = members?.map(m => m.user_id) ?? [];

  if (memberIds.length === 0) {
    return {
      organization: org ?? null,
      clientCount: 0,
      totalAssessments: 0,
      readyCount: 0,
      recentAssessments: [],
    };
  }

  // Get assessments for all members
  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .in('user_id', memberIds)
    .order('created_at', { ascending: false });

  const allAssessments = assessments ?? [];
  const readyCount = allAssessments.filter(a => a.verdict === 'ready').length;

  return {
    organization: org ?? null,
    clientCount: memberIds.length,
    totalAssessments: allAssessments.length,
    readyCount,
    recentAssessments: allAssessments.slice(0, 10),
  };
}

export async function getPartnerClients(orgId: string): Promise<PartnerClient[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

  const supabase = await createClient();

  const { data: members } = await supabase
    .from('partner_users')
    .select('id, user_id, role, accepted, created_at')
    .eq('organization_id', orgId);

  if (!members || members.length === 0) return [];

  const clients: PartnerClient[] = [];

  for (const member of members) {
    const [profileResult, assessmentResult, countResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, name, email, avatar_url, created_at')
        .eq('id', member.user_id)
        .single(),
      supabase
        .from('assessments')
        .select('overall_score, verdict, created_at')
        .eq('user_id', member.user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('assessments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', member.user_id),
    ]);

    clients.push({
      ...member,
      profile: profileResult.data ?? null,
      latest_assessment: assessmentResult.data ?? null,
      assessment_count: countResult.count ?? 0,
    });
  }

  return clients;
}

export interface PartnerAnalyticsData {
  verdictDistribution: { name: string; value: number; color: string }[];
  scoreHistogram: { range: string; count: number }[];
  monthlyTrend: { month: string; assessments: number; readyRate: number }[];
  avgScore: number;
  totalAssessments: number;
  readyRate: number;
}

export async function getPartnerAnalyticsData(orgId: string): Promise<PartnerAnalyticsData | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = await createClient();

  // Get all member user IDs
  const { data: members } = await supabase
    .from('partner_users')
    .select('user_id')
    .eq('organization_id', orgId)
    .eq('accepted', true);

  const memberIds = members?.map(m => m.user_id) ?? [];

  if (memberIds.length === 0) {
    return {
      verdictDistribution: [],
      scoreHistogram: [],
      monthlyTrend: [],
      avgScore: 0,
      totalAssessments: 0,
      readyRate: 0,
    };
  }

  const { data: assessments } = await supabase
    .from('assessments')
    .select('overall_score, verdict, created_at')
    .in('user_id', memberIds)
    .order('created_at', { ascending: true });

  const all = assessments ?? [];
  const total = all.length;

  // Verdict distribution
  const verdictCounts: Record<string, number> = {};
  for (const a of all) {
    verdictCounts[a.verdict] = (verdictCounts[a.verdict] || 0) + 1;
  }

  const verdictColorMap: Record<string, { label: string; color: string }> = {
    READY: { label: 'READY', color: '#34d399' },
    ALMOST_THERE: { label: 'ALMOST THERE', color: '#facc15' },
    BUILD_FIRST: { label: 'BUILD FIRST', color: '#fb923c' },
    NOT_YET: { label: 'NOT YET', color: '#ef4444' },
  };

  const verdictDistribution = Object.entries(verdictCounts).map(([verdict, count]) => ({
    name: verdictColorMap[verdict]?.label ?? verdict,
    value: total > 0 ? Math.round((count / total) * 100) : 0,
    color: verdictColorMap[verdict]?.color ?? '#94a3b8',
  }));

  // Score histogram (0-10, 11-20, ..., 91-100)
  const bins = Array.from({ length: 10 }, (_, i) => ({
    range: `${i * 10 + (i === 0 ? 0 : 1)}-${(i + 1) * 10}`,
    count: 0,
  }));
  // Fix first bin label
  bins[0].range = '0-10';

  for (const a of all) {
    const idx = Math.min(Math.floor(a.overall_score / 10), 9);
    bins[idx].count += 1;
  }

  // Monthly trend (last 6 months)
  const monthlyMap = new Map<string, { assessments: number; readyCount: number }>();
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString('en-US', { month: 'short' });
    monthlyMap.set(key, { assessments: 0, readyCount: 0 });
  }

  for (const a of all) {
    const d = new Date(a.created_at);
    const key = d.toLocaleString('en-US', { month: 'short' });
    const entry = monthlyMap.get(key);
    if (entry) {
      entry.assessments += 1;
      if (a.verdict === 'READY') entry.readyCount += 1;
    }
  }

  const monthlyTrend = Array.from(monthlyMap.entries()).map(([month, data]) => ({
    month,
    assessments: data.assessments,
    readyRate: data.assessments > 0 ? Math.round((data.readyCount / data.assessments) * 100) : 0,
  }));

  // Aggregates
  const avgScore = total > 0
    ? Math.round(all.reduce((sum, a) => sum + a.overall_score, 0) / total)
    : 0;
  const readyCount = all.filter(a => a.verdict === 'READY').length;
  const readyRate = total > 0 ? Math.round((readyCount / total) * 100) : 0;

  return {
    verdictDistribution,
    scoreHistogram: bins,
    monthlyTrend,
    avgScore,
    totalAssessments: total,
    readyRate,
  };
}

export interface PartnerBillingData {
  organization: OrganizationRow | null;
  currentMonthAssessments: number;
  pricingPerAssessment: number;
  estimatedCost: number;
}

export async function getPartnerBillingData(orgId: string): Promise<PartnerBillingData | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = await createClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single();

  // Get all member user IDs
  const { data: members } = await supabase
    .from('partner_users')
    .select('user_id')
    .eq('organization_id', orgId)
    .eq('accepted', true);

  const memberIds = members?.map(m => m.user_id) ?? [];

  // Count assessments for the current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  let currentMonthAssessments = 0;
  if (memberIds.length > 0) {
    const { count } = await supabase
      .from('assessments')
      .select('id', { count: 'exact', head: true })
      .in('user_id', memberIds)
      .gte('created_at', startOfMonth);
    currentMonthAssessments = count ?? 0;
  }

  const pricing = org?.pricing_per_assessment ?? 15;

  return {
    organization: org ?? null,
    currentMonthAssessments,
    pricingPerAssessment: pricing,
    estimatedCost: currentMonthAssessments * pricing,
  };
}

export interface PartnerApiData {
  apiKey: string;
  webhookUrl: string | null;
  webhookEvents: string[];
}

export async function getPartnerApiData(orgId: string): Promise<PartnerApiData | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = await createClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('api_key, webhook_url, webhook_events')
    .eq('id', orgId)
    .single();

  if (!org) return null;

  return {
    apiKey: org.api_key,
    webhookUrl: org.webhook_url,
    webhookEvents: org.webhook_events ?? [],
  };
}

export interface PartnerBrandingData {
  companyName: string;
  primaryColor: string;
  welcomeMessage: string;
  logoUrl: string | null;
  orgId: string;
}

export async function getPartnerBrandingData(orgId: string): Promise<PartnerBrandingData | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = await createClient();

  const { data: org } = await supabase
    .from('organizations')
    .select('id, company_name, branding')
    .eq('id', orgId)
    .single();

  if (!org) return null;

  const branding = (org.branding ?? {}) as Record<string, unknown>;

  return {
    companyName: org.company_name,
    primaryColor: (branding.primary_color as string) ?? '#3b82f6',
    welcomeMessage: (branding.welcome_message as string) ?? 'Welcome to your Decision Readiness Assessment. Answer honestly for the most accurate results.',
    logoUrl: (branding.logo_url as string) ?? null,
    orgId: org.id,
  };
}
