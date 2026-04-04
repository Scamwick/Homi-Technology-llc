import { createClient } from '@/lib/supabase/server';
import type { ProfileRow, AssessmentRow, AuditLogRow, NotificationRow } from '@/types/database';

// =============================================================================
// lib/data/employee.ts — Employee Dashboard Data Access
// =============================================================================

/** Employee overview KPIs. */
export interface EmployeeKPIs {
  assignedClients: number;
  tasksDueToday: number;
  avgClientScore: number;
  completionRate: number;
}

/** Support dashboard data. */
export interface SupportDashboardData {
  openTickets: NotificationRow[];
  crisisAlerts: (AssessmentRow & { user_name?: string; user_email?: string })[];
  recentUsers: ProfileRow[];
  totalOpen: number;
  avgResolutionTime: number;
}

/** Sales dashboard data. */
export interface SalesDashboardData {
  totalLeads: number;
  qualified: number;
  converted: number;
  conversionRate: number;
  recentSignups: ProfileRow[];
  tierDistribution: { tier: string; count: number }[];
}

/** Employee overview data. */
export interface EmployeeOverviewData {
  kpis: EmployeeKPIs;
  recentActivity: AuditLogRow[];
  recentAssessments: (AssessmentRow & { user_name?: string })[];
}

/**
 * Fetch employee overview data.
 */
export async function getEmployeeOverviewData(): Promise<EmployeeOverviewData | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await createClient();

  const [
    usersResult,
    assessmentsResult,
    auditResult,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('assessments').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(10),
  ]);

  const assessments = assessmentsResult.data ?? [];

  // Enrich assessments with user names
  const enrichedAssessments = await Promise.all(
    assessments.map(async (a) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', a.user_id)
        .single();
      return { ...a, user_name: profile?.name ?? undefined };
    }),
  );

  const avgScore = assessments.length > 0
    ? Math.round(assessments.reduce((sum, a) => sum + a.overall_score, 0) / assessments.length)
    : 0;

  return {
    kpis: {
      assignedClients: usersResult.count ?? 0,
      tasksDueToday: 0, // Requires task system
      avgClientScore: avgScore,
      completionRate: 0, // Requires task tracking
    },
    recentActivity: auditResult.data ?? [],
    recentAssessments: enrichedAssessments,
  };
}

/**
 * Fetch support dashboard data — crisis alerts and user issues.
 */
export async function getSupportDashboardData(): Promise<SupportDashboardData | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await createClient();

  const [
    crisisResult,
    usersResult,
    notificationsResult,
  ] = await Promise.all([
    // Assessments with crisis detected
    supabase
      .from('assessments')
      .select('*')
      .eq('crisis_detected', true)
      .order('created_at', { ascending: false })
      .limit(20),

    // Recent users for lookup
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50),

    // System notifications (support tickets)
    supabase
      .from('notifications')
      .select('*')
      .eq('type', 'system')
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  // Enrich crisis alerts with user info
  const crisisAlerts = await Promise.all(
    (crisisResult.data ?? []).map(async (a) => {
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

  return {
    openTickets: notificationsResult.data ?? [],
    crisisAlerts,
    recentUsers: usersResult.data ?? [],
    totalOpen: notificationsResult.data?.length ?? 0,
    avgResolutionTime: 0,
  };
}

/**
 * Fetch sales dashboard data.
 */
export async function getSalesDashboardData(): Promise<SalesDashboardData | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }

  const supabase = await createClient();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalUsersResult,
    recentSignupsResult,
    paidUsersResult,
    allProfilesResult,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('*').gte('created_at', thirtyDaysAgo).order('created_at', { ascending: false }),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active').neq('tier', 'free'),
    supabase.from('profiles').select('tier'),
  ]);

  const totalUsers = totalUsersResult.count ?? 0;
  const paidUsers = paidUsersResult.count ?? 0;
  const conversionRate = totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0;

  // Tier distribution
  const tierCounts: Record<string, number> = {};
  (allProfilesResult.data ?? []).forEach((p) => {
    tierCounts[p.tier] = (tierCounts[p.tier] ?? 0) + 1;
  });
  const tierDistribution = Object.entries(tierCounts).map(([tier, count]) => ({ tier, count }));

  return {
    totalLeads: totalUsers,
    qualified: recentSignupsResult.data?.length ?? 0,
    converted: paidUsers,
    conversionRate,
    recentSignups: recentSignupsResult.data ?? [],
    tierDistribution,
  };
}
