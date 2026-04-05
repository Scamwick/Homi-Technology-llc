/**
 * GET/POST /api/couples -- Couples Mode
 */

import { NextRequest, NextResponse } from 'next/server';
import { inviteCoupleSchema } from '@/validators/couples';
import { createClient } from '@/lib/supabase/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401, headers: CORS_HEADERS },
      );
    }

    // Find couple where user is initiator or partner
    const { data: couple } = await supabase
      .from('couples')
      .select('*')
      .or(`initiator_id.eq.${user.id},partner_id.eq.${user.id}`)
      .in('status', ['active', 'pending'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!couple) {
      return NextResponse.json(
        {
          success: true,
          data: {
            status: 'not_linked',
            partnerId: null,
            partnerName: null,
            partnerEmail: null,
            linkedAt: null,
            pendingInvites: [],
          },
        },
        { status: 200, headers: CORS_HEADERS },
      );
    }

    const partnerId = couple.initiator_id === user.id ? couple.partner_id : couple.initiator_id;
    const { data: partner } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', partnerId)
      .single();

    return NextResponse.json(
      {
        success: true,
        data: {
          status: couple.status,
          coupleId: couple.id,
          partnerId,
          partnerName: partner?.name ?? null,
          partnerEmail: partner?.email ?? null,
          linkedAt: couple.created_at,
          shareAssessments: couple.share_assessments,
          shareFullBreakdown: couple.share_full_breakdown,
        },
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Couples API] GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401, headers: CORS_HEADERS },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_JSON', message: 'Invalid JSON in request body' } },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const parsed = inviteCoupleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '),
          },
        },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    // Find partner by email
    const { data: partnerProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', parsed.data.partner_email)
      .single();

    if (!partnerProfile) {
      return NextResponse.json(
        { success: false, error: { code: 'PARTNER_NOT_FOUND', message: 'No account found with that email' } },
        { status: 404, headers: CORS_HEADERS },
      );
    }

    const { data: couple, error } = await supabase
      .from('couples')
      .insert({
        initiator_id: user.id,
        partner_id: partnerProfile.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { success: true, data: couple },
      { status: 201, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[Couples API] POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
