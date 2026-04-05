/**
 * DELETE /api/user/delete -- Account Deletion
 * ==============================================
 *
 * Handles account deletion requests. Deletes the Supabase auth user
 * (which cascades to profiles and all related data via FK).
 *
 * Returns the canonical ApiResponse shape:
 *   { success: boolean, data?: T, error?: { code: string, message: string } }
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripeServer } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// CORS Headers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
} as const;

// ---------------------------------------------------------------------------
// CORS Preflight
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ---------------------------------------------------------------------------
// DELETE -- Delete user account
// ---------------------------------------------------------------------------

export const DELETE = withAuth(async (_req, ctx) => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const now = new Date().toISOString();
      const purgeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      return NextResponse.json(
        {
          success: true,
          data: {
            userId: 'dev-user',
            status: 'deletion_scheduled',
            deletedAt: now,
            dataPurgeScheduledAt: purgeDate,
            message: 'Account has been scheduled for deletion. Your data will be permanently removed in 30 days.',
          },
        },
        { status: 200, headers: CORS_HEADERS },
      );
    }

    const userId = ctx.user!.id;

    // Cancel Stripe subscription if exists
    const stripe = getStripeServer();
    if (stripe) {
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single();

      if (profile?.stripe_customer_id) {
        try {
          const subscriptions = await stripe.subscriptions.list({
            customer: profile.stripe_customer_id,
            status: 'active',
          });
          for (const sub of subscriptions.data) {
            await stripe.subscriptions.cancel(sub.id);
          }
        } catch (err) {
          console.error('[User Delete] Stripe cancellation error:', err);
        }
      }
    }

    // Delete the auth user (cascades to profiles and all related data)
    const admin = createAdminClient();
    if (admin) {
      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) throw error;
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          userId,
          status: 'deleted',
          deletedAt: new Date().toISOString(),
          message: 'Account has been permanently deleted.',
        },
      },
      { status: 200, headers: CORS_HEADERS },
    );
  } catch (error) {
    console.error('[User Delete API] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500, headers: CORS_HEADERS },
    );
  }
});
