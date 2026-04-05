/**
 * POST /api/advisor/chat -- AI Advisor Streaming Chat
 * =====================================================
 *
 * Streams advisor responses using the AdvisorService.
 * Requires authentication. Accepts assessment context for
 * score-aware responses.
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AdvisorService } from '@/lib/advisor/service';
import type { AssessmentContext, AdvisorMessage } from '@/lib/advisor/service';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401, headers: CORS_HEADERS },
      );
    }

    const body = await request.json();
    const {
      message,
      assessmentContext,
      history = [],
    } = body as {
      message: string;
      assessmentContext?: AssessmentContext;
      history?: AdvisorMessage[];
    };

    if (!message?.trim()) {
      return Response.json(
        { error: 'Message is required' },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const advisor = new AdvisorService();
    const stream = await advisor.sendMessage({
      conversationId: user.id,
      message,
      assessmentContext,
      history,
    });

    return new Response(stream, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('[Advisor Chat API] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
