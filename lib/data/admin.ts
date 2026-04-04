import { createClient } from '@/lib/supabase/server';
import type {
  ProfileRow,
  AssessmentRow,
  OrganizationRow,
  AuditLogRow,
} from '@/types/database';

// =============================================================================
// lib/data/admin.ts — Admin Dashboard Data Access
// =============================================================================

/** KPI summary for admin overview. */
export interface AdminKPIs {
  totalUsers: number;
  activeAssessments: number;
  readyRate: number;
  monthlyRevenue: number;
  newUsersToday: number;
  assessmentsToday: number;
  churnRate: number;
}

/** Admin overview data bundle. */
export interface AdminOverviewData {
  kpis: AdminKPIs;
  recentUsers: ProfileRow[];
  recentAssessments: AssessmentRow[];
  verdictDistribution: { verdict: string; count: number }[];
  recentActivity: AuditLogRow[];
  monthlyRevenue: { month: string; revenue: number }[];
}

/** Full admin data for all pages. */
export interface AdminUsersData {
  users: (ProfileRow & {
    assessment_count?: number;
    last_verdict?: string;
    last_assessment_date?: string;
  })[];
  total: number;
}

export interface AdminAssessmentsData {
  assessments: (AssessmentRow & { user_name?: string; user_email?: string })[];
  avgScore: number;
  completionRate: number;
  crisisCount: number;
}

export interface AdminPartnersData {
  organizations: (OrganizationRow & {
    member_count?: number;
    status?: string;
  })[];
}

export interface AdminAuditData {
  entries: (AuditLogRow & { admin_email?: string })[];
  total: number;
}

/**
 * Fetch admin overview KPIs and chart data.
 */
export async function getAdminOverviewData(): Promise<AdminOverviewData | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await createClient();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const [
    usersCount,
    assessmentsCount,
    readyCount,
    todayUsersCount,
    todayAssessmentsCount,
    recentUsers,
    recentAssessments,
    recentAudit,
    subscriptions,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('assessments').select('id', { count: 'exact', head: true }),
    supabase.from('assessments').select('id', { count: 'exact', head: true }).eq('verdict', 'READY'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('assessments').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('assessments').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('subscriptions').select('*').eq('status', 'active'),
  ]);

  const totalUsers = usersCount.count ?? 0;
  const totalAssessments = assessmentsCount.count ?? 0;
  const totalReady = readyCount.count ?? 0;
  const readyRate = totalAssessments > 0 ? Math.round((totalReady / totalAssessments) * 100) : 0;

  // Calculate monthly revenue from active subscriptions
  const tierPrices: Record<string, number> = { free: 0, plus: 9, pro: 19, family: 39 };
  const monthlyRevenue = (subscriptions.data ?? []).reduce((sum, sub) => {
    return sum + (tierPrices[sub.tier] ?? 0);
  }, 0);

  // Build verdict distribution
  const allAssessments = recentAssessments.data ?? [];
  const verdictCounts: Record<string, number> = {};
  allAssessments.forEach((a) => {
    verdictCounts[a.verdict] = (verdictCounts[a.verdict] ?? 0) + 1;
  });
  const verdictDistribution = Object.entries(verdictCounts).map(([verdict, count]) => ({
    verdict,
    count,
  }));

  return {
    kpis: {
      totalUsers,
      activeAssessments: totalAssessments,
      readyRate,
      monthlyRevenue,
      newUsersToday: todayUsersCount.count ?? 0,
      assessmentsToday: todayAssessmentsCount.count ?? 0,
      churnRate: 0, // Requires historical calculation
    },
    recentUsers: recentUsers.data ?? [],
    recentAssessments: allAssessments,
    verdictDistribution,
    recentActivity: recentAudit.data ?? [],
    monthlyRevenue: [], // Requires aggregation query
  };
}

/**
 * Fetch admin users page data with assessment info.
 */
export async function getAdminUsersData(): Promise<AdminUsersData | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await createClient();

  const { data: users, count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(100);

  // For each user, get their latest assessment
  const enrichedUsers = await Promise.all(
    (users ?? []).map(async (user) => {
      const { data: assessment } = await supabase
        .from('assessments')
        .select('verdict, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const { count: assessmentCount } = await supabase
        .from('assessments')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      return {
        ...user,
        assessment_count: assessmentCount ?? 0,
        last_verdict: assessment?.verdict ?? undefined,
        last_assessment_date: assessment?.created_at ?? undefined,
      };
    }),
  );

  return {
    users: enrichedUsers,
    total: count ?? 0,
  };
}

/**
 * Fetch admin assessments page data.
 */
export async function getAdminAssessmentsData(): Promise<AdminAssessmentsData | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await createClient();

  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  const allAssessments = assessments ?? [];

  // Enrich with user info
  const enriched = await Promise.all(
    allAssessments.map(async (a) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', a.user_id)
        .single();
      return {
        ...a,
        user_name: profile?.name ?? undefined,
        user_email: profile?.email ?? undefined,
      };
    }),
  );

  const avgScore = allAssessments.length > 0
    ? Math.round(allAssessments.reduce((sum, a) => sum + a.overall_score, 0) / allAssessments.length)
    : 0;

  const crisisCount = allAssessments.filter((a) => a.crisis_detected).length;

  return {
    assessments: enriched,
    avgScore,
    completionRate: 0, // Requires started vs completed tracking
    crisisCount,
  };
}

/**
 * Fetch admin partners page data.
 */
export async function getAdminPartnersData(): Promise<AdminPartnersData | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await createClient();

  const { data: orgs } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false });

  const enriched = await Promise.all(
    (orgs ?? []).map(async (org) => {
      const { count } = await supabase
        .from('partner_users')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', org.id);
      return {
        ...org,
        member_count: count ?? 0,
      };
    }),
  );

  return { organizations: enriched };
}

/**
 * Fetch admin audit log data.
 */
export async function getAdminAuditData(
  filters?: { actionType?: string; adminEmail?: string },
): Promise<AdminAuditData | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await createClient();

  let query = supabase
    .from('audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(50);

  if (filters?.actionType && filters.actionType !== 'All') {
    query = query.like('action', `${filters.actionType}%`);
  }

  const { data: entries, count } = await query;

  // Enrich with admin emails
  const enriched = await Promise.all(
    (entries ?? []).map(async (entry) => {
      if (entry.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', entry.user_id)
          .single();
        return { ...entry, admin_email: profile?.email ?? undefined };
      }
      return { ...entry, admin_email: 'system' };
    }),
  );

  return { entries: enriched, total: count ?? 0 };
}

/**
 * Fetch CEO command center data — strategic KPIs.
 */
export interface CEOCommandCenterData {
  mrr: number;
  arr: number;
  totalUsers: number;
  userGrowthPct: number;
  churnRate: number;
  ltv: number;
  nps: number;
  activeSubscriptions: number;
  tierBreakdown: { tier: string; count: number; revenue: number }[];
  recentSignups: ProfileRow[];
  systemHealth: {
    activeNow: number;
    errorRate: number;
  };
}

export async function getCEOCommandCenterData(): Promise<CEOCommandCenterData | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await createClient();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalUsersResult,
    lastMonthUsersResult,
    activeSubsResult,
    recentSignupsResult,
    allProfilesResult,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
    supabase.from('subscriptions').select('*').eq('status', 'active'),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('profiles').select('tier'),
  ]);

  const totalUsers = totalUsersResult.count ?? 0;
  const lastMonthUsers = lastMonthUsersResult.count ?? 0;
  const prevMonthBase = totalUsers - lastMonthUsers;
  const userGrowthPct = prevMonthBase > 0 ? Math.round((lastMonthUsers / prevMonthBase) * 100) : 0;

  // Calculate MRR from active subscriptions
  const tierPrices: Record<string, number> = { free: 0, plus: 9, pro: 19, family: 39 };
  const activeSubs = activeSubsResult.data ?? [];
  const mrr = activeSubs.reduce((sum, sub) => sum + (tierPrices[sub.tier] ?? 0), 0);
  const arr = mrr * 12;

  // Tier breakdown
  const tierCounts: Record<string, number> = {};
  (allProfilesResult.data ?? []).forEach((p) => {
    tierCounts[p.tier] = (tierCounts[p.tier] ?? 0) + 1;
  });
  const tierBreakdown = Object.entries(tierCounts).map(([tier, count]) => ({
    tier,
    count,
    revenue: count * (tierPrices[tier] ?? 0),
  }));

  // Estimated LTV (MRR / churn rate) — simplified
  const ltv = mrr > 0 ? Math.round(mrr / Math.max(0.05, 0.05) * 12 / totalUsers) : 0;

  return {
    mrr,
    arr,
    totalUsers,
    userGrowthPct,
    churnRate: 0, // Requires subscription history analysis
    ltv,
    nps: 0, // Requires NPS survey data
    activeSubscriptions: activeSubs.length,
    tierBreakdown,
    recentSignups: recentSignupsResult.data ?? [],
    systemHealth: {
      activeNow: 0, // Requires real-time presence
      errorRate: 0, // Requires error tracking integration
    },
  };
}
