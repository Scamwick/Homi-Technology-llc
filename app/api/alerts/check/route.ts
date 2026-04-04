/**
 * POST /api/alerts/check — Evaluate Alerts for Current User
 * ============================================================
 *
 * Triggers alert evaluation for the authenticated user.
 * Can be called after a Plaid sync or on dashboard load.
 *
 * Response: { alerts: Alert[] }
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { evaluateAlerts } from '@/lib/alerts/engine';

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    );
  }

  try {
    const alerts = await evaluateAlerts(user.id);

    return NextResponse.json({
      alerts: alerts.map((a) => ({
        type: a.type,
        title: a.title,
        body: a.body,
        severity: a.severity,
        previousValue: a.previousValue,
        currentValue: a.currentValue,
        changePercent: a.changePercent,
      })),
      count: alerts.length,
      evaluatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Alerts Check] Error:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate alerts' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/alerts/check — Get Pending Alerts
 *
 * Returns all pending (undelivered) alerts for the authenticated user.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    );
  }

  const { data: alerts } = await supabase
    .from('financial_alerts')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('triggered_at', { ascending: false })
    .limit(20);

  return NextResponse.json({
    alerts: alerts ?? [],
    count: alerts?.length ?? 0,
  });
}
