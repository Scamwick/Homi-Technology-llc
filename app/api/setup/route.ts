/**
 * GET /api/setup — One-time account bootstrap
 * ==============================================
 *
 * Creates and confirms the CEO and Admin accounts in Supabase.
 * Uses the service role key to bypass email confirmation.
 *
 * Hit this endpoint once from your browser after deploying:
 *   https://your-domain.com/api/setup
 *
 * IMPORTANT: Remove this file after accounts are set up.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ACCOUNTS = [
  {
    email: 'Cody@homitechnology.com',
    password: 'Cgs_7367',
    name: 'Cody',
    role: 'ceo_founder',
    label: 'CEO/Founder',
  },
  {
    email: 'info@homitechnology.com',
    password: 'Admin1234!',
    name: 'Admin',
    role: 'admin',
    label: 'Admin',
  },
];

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !serviceKey || !anonKey) {
    return NextResponse.json({
      error: 'Missing Supabase env vars',
    }, { status: 500 });
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const results: Record<string, unknown>[] = [];

  for (const account of ACCOUNTS) {
    const result: Record<string, unknown> = { email: account.email, label: account.label };

    try {
      // Check if user exists
      const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const existing = listData?.users.find(
        (u) => u.email?.toLowerCase() === account.email.toLowerCase(),
      );

      if (existing) {
        result.status = 'exists';
        result.userId = existing.id;
        result.emailConfirmed = !!existing.email_confirmed_at;

        // Confirm email and reset password
        const { error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, {
          email_confirm: true,
          password: account.password,
        });

        if (updateErr) {
          result.updateError = updateErr.message;
        } else {
          result.updated = true;
          result.emailConfirmed = true;
        }
      } else {
        // Create user
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: { full_name: account.name },
        });

        if (createErr) {
          result.status = 'create_failed';
          result.error = createErr.message;
        } else {
          result.status = 'created';
          result.userId = created.user.id;
          result.emailConfirmed = true;
        }
      }

      // Ensure profile exists with admin role
      if (result.userId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', result.userId as string)
          .single();

        if (profile) {
          result.profileExists = true;
          if (profile.role !== account.role) {
            await supabase
              .from('profiles')
              .update({ role: account.role })
              .eq('id', result.userId as string);
            result.roleUpdated = account.role;
          }
        } else {
          // Create profile manually if trigger didn't fire
          const { error: profileErr } = await supabase.from('profiles').insert({
            id: result.userId,
            email: account.email,
            full_name: account.name,
            role: account.role,
            subscription_tier: 'free',
            subscription_status: 'active',
            onboarding_completed: false,
          });
          result.profileCreated = !profileErr;
          if (profileErr) result.profileError = profileErr.message;
        }
      }

      // Test login
      const testClient = createClient(url, anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { error: loginErr } = await testClient.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });

      result.loginTest = loginErr ? `FAILED: ${loginErr.message}` : 'PASSED';
    } catch (err) {
      result.error = err instanceof Error ? err.message : 'Unknown error';
    }

    results.push(result);
  }

  return NextResponse.json({
    message: 'Account setup complete. DELETE this endpoint after use (/app/api/setup/route.ts)',
    results,
  }, { status: 200 });
}
