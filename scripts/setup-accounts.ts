/**
 * Setup Accounts Script
 * =====================
 *
 * Creates and confirms the CEO and Admin accounts in Supabase.
 * Run with: npx tsx scripts/setup-accounts.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (service role
 * bypasses email confirmation and RLS).
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local manually (no dotenv dependency)
try {
  const envPath = resolve(__dirname, '../.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch {
  console.error('Could not read .env.local');
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

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

async function setupAccount(account: (typeof ACCOUNTS)[0]) {
  console.log(`\n--- Setting up ${account.label} (${account.email}) ---`);

  // Step 1: Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users.find(
    (u) => u.email?.toLowerCase() === account.email.toLowerCase(),
  );

  let userId: string;

  if (existing) {
    console.log(`  User already exists (ID: ${existing.id})`);
    console.log(`  Email confirmed: ${existing.email_confirmed_at ? 'Yes' : 'NO — fixing...'}`);
    userId = existing.id;

    // Confirm email if not confirmed
    if (!existing.email_confirmed_at) {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        email_confirm: true,
      });
      if (error) {
        console.error(`  Failed to confirm email:`, error.message);
      } else {
        console.log(`  Email confirmed successfully`);
      }
    }

    // Update password to ensure it matches
    const { error: pwError } = await supabase.auth.admin.updateUserById(userId, {
      password: account.password,
    });
    if (pwError) {
      console.error(`  Failed to update password:`, pwError.message);
    } else {
      console.log(`  Password updated to match expected credentials`);
    }
  } else {
    // Step 2: Create user with service role (bypasses email confirmation)
    console.log(`  Creating new user...`);
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: account.name,
      },
    });

    if (error) {
      console.error(`  Failed to create user:`, error.message);
      return;
    }

    userId = data.user.id;
    console.log(`  User created (ID: ${userId})`);
    console.log(`  Email auto-confirmed: Yes`);
  }

  // Step 3: Verify profile exists (should be auto-created by trigger)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, role, subscription_tier')
    .eq('id', userId)
    .single();

  if (profile) {
    console.log(`  Profile exists: role=${profile.role}, tier=${profile.subscription_tier}`);

    // Update role to admin if needed
    if (profile.role !== account.role) {
      await supabase
        .from('profiles')
        .update({ role: account.role })
        .eq('id', userId);
      console.log(`  Updated role to: ${account.role}`);
    }
  } else {
    console.log(`  WARNING: No profile found — trigger may not have fired`);
    console.log(`  Creating profile manually...`);
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      email: account.email,
      full_name: account.name,
      role: account.role,
      subscription_tier: 'free',
      subscription_status: 'active',
      onboarding_completed: false,
    });
    if (profileError) {
      console.error(`  Failed to create profile:`, profileError.message);
    } else {
      console.log(`  Profile created manually`);
    }
  }

  // Step 4: Test login
  console.log(`  Testing login...`);
  const testClient = createClient(url!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: loginData, error: loginError } = await testClient.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  });

  if (loginError) {
    console.error(`  LOGIN TEST FAILED:`, loginError.message);
  } else {
    console.log(`  LOGIN TEST PASSED — session token received`);
    console.log(`  User ID: ${loginData.user?.id}`);
  }
}

async function main() {
  console.log('HoMI Account Setup');
  console.log('==================');
  console.log(`Supabase URL: ${url}`);

  // Quick connectivity check
  try {
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1 });
    if (error) throw error;
    console.log(`Connected to Supabase (${data.users.length > 0 ? 'users exist' : 'no users yet'})`);
  } catch (err) {
    console.error(`Cannot connect to Supabase:`, err);
    console.error(`\nPossible causes:`);
    console.error(`  1. Supabase project is paused (free tier pauses after inactivity)`);
    console.error(`  2. SUPABASE_SERVICE_ROLE_KEY is invalid`);
    console.error(`  3. Network connectivity issue`);
    console.error(`\nFix: Visit https://supabase.com/dashboard and unpause your project`);
    process.exit(1);
  }

  for (const account of ACCOUNTS) {
    await setupAccount(account);
  }

  console.log('\n==================');
  console.log('Setup complete!');
  console.log('\nYou can now log in with:');
  console.log('  CEO:   Cody@homitechnology.com / Cgs_7367');
  console.log('  Admin: info@homitechnology.com / Admin1234!');
}

main().catch(console.error);
