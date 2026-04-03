/**
 * GET /api/user/export -- GDPR Data Export
 * ==========================================
 *
 * Returns all user data in a single JSON payload for GDPR compliance.
 *
 * Returns the canonical ApiResponse shape:
 *   { success: boolean, data?: T, error?: { code: string, message: string } }
 */

import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// ---------------------------------------------------------------------------
// CORS Preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// GET -- Export all user data
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const exportData = {
      exportedAt: new Date().toISOString(),
      format: 'homi-gdpr-export-v1',
      profile: {
        id: 'dev-user',
        email: 'dev@homi.app',
        name: 'Alex Developer',
        avatarUrl: null,
        tier: 'pro',
        onboardingComplete: true,
        createdAt: '2026-01-15T08:00:00Z',
        updatedAt: '2026-03-28T14:15:00Z',
      },
      preferences: {
        notifications: {
          email: true,
          push: false,
          reassessReminders: true,
          reminderFrequencyDays: 30,
          agentDigest: true,
        },
        couples: {
          enabled: false,
          partnerId: null,
          shareAssessments: false,
          shareFullBreakdown: false,
        },
        privacy: {
          analyticsOptIn: true,
          visibleToAdvisors: false,
          retainInputs: true,
        },
      },
      assessments: [
        {
          id: 'assess_001',
          overall: 74,
          verdict: 'ALMOST_THERE',
          createdAt: '2026-03-15T10:30:00Z',
        },
        {
          id: 'assess_002',
          overall: 82,
          verdict: 'READY',
          createdAt: '2026-03-28T14:15:00Z',
        },
      ],
      agentConversations: [],
      notifications: [
        {
          id: 'notif_001',
          type: 'assessment_complete',
          title: 'Assessment Complete',
          createdAt: '2026-03-28T14:15:00Z',
        },
      ],
      subscription: {
        tier: 'pro',
        status: 'active',
        currentPeriodEnd: '2026-04-15T08:00:00Z',
      },
    };

    return NextResponse.json(
      { success: true, data: exportData },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[User Export API] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
