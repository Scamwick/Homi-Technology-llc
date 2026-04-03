/**
 * Cooldown Management
 * ====================
 *
 * Manages the 24-hour reflection period that the Safety Canon imposes
 * after a crisis deflection. During cooldown, the user can view their
 * previous assessment but cannot start a new one.
 *
 * Storage strategy:
 *   - Current: localStorage (client-side only)
 *   - Future:  Supabase row in user_cooldowns table (server-authoritative)
 *
 * The localStorage approach is intentionally bypassable — a determined
 * user can clear storage and retake. This is acceptable because:
 *   1. The deflection already delivered its message
 *   2. We log the deflection event separately (audit trail)
 *   3. The cooldown is a speed bump, not a wall
 *   4. Server-side enforcement comes with Supabase integration
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** localStorage key prefix for cooldown records. */
const COOLDOWN_KEY_PREFIX = 'homi_cooldown_';

/** Default cooldown duration in hours. */
const DEFAULT_COOLDOWN_HOURS = 24;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CooldownStatus {
  /** Whether the user is currently in a cooldown period. */
  active: boolean;

  /** ISO 8601 expiration timestamp, null if no cooldown is active. */
  expiresAt: string | null;

  /** Remaining time in human-readable format, null if no cooldown. */
  remainingFormatted: string | null;
}

interface StoredCooldown {
  expiresAt: string;
  triggeredAt: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getStorageKey(userId: string): string {
  return `${COOLDOWN_KEY_PREFIX}${userId}`;
}

/**
 * Safely reads from localStorage. Returns null if unavailable
 * (SSR, storage quota exceeded, etc).
 */
function readFromStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    // localStorage can throw in private browsing, iframe sandboxes, etc.
    return null;
  }
}

/**
 * Safely writes to localStorage. No-ops if unavailable.
 */
function writeToStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Quota exceeded or private browsing — silently fail.
    // The cooldown message was already shown; server-side
    // enforcement will handle persistence in production.
    console.error('[Safety Canon] Failed to persist cooldown to localStorage');
  }
}

/**
 * Safely removes from localStorage. No-ops if unavailable.
 */
function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Silent fail — same reasoning as writeToStorage
  }
}

/**
 * Formats remaining milliseconds into a human-readable string.
 */
function formatRemaining(ms: number): string {
  if (ms <= 0) return 'expired';

  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Activates a 24-hour cooldown for the specified user.
 *
 * Call this after the Safety Canon triggers a deflection.
 * If a cooldown is already active, it is NOT extended — the
 * original expiration time is preserved.
 *
 * @param userId - The user to place in cooldown
 * @param durationHours - Cooldown duration (default: 24)
 */
export function setCooldown(
  userId: string,
  durationHours: number = DEFAULT_COOLDOWN_HOURS,
): void {
  const key = getStorageKey(userId);

  // Don't overwrite an existing active cooldown
  const existing = readFromStorage(key);
  if (existing) {
    try {
      const parsed: StoredCooldown = JSON.parse(existing);
      const expiresAt = new Date(parsed.expiresAt);
      if (expiresAt > new Date()) {
        // Cooldown still active — preserve it
        return;
      }
    } catch {
      // Corrupted data — overwrite it
    }
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

  const record: StoredCooldown = {
    expiresAt: expiresAt.toISOString(),
    triggeredAt: now.toISOString(),
  };

  writeToStorage(key, JSON.stringify(record));
}

/**
 * Checks whether a user is currently in a cooldown period.
 *
 * Automatically cleans up expired cooldowns.
 *
 * @param userId - The user to check
 * @returns CooldownStatus with active state and expiration info
 */
export function checkCooldown(userId: string): CooldownStatus {
  const key = getStorageKey(userId);
  const raw = readFromStorage(key);

  if (!raw) {
    return { active: false, expiresAt: null, remainingFormatted: null };
  }

  let parsed: StoredCooldown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Corrupted — clean up and return inactive
    removeFromStorage(key);
    return { active: false, expiresAt: null, remainingFormatted: null };
  }

  const expiresAt = new Date(parsed.expiresAt);
  const now = new Date();
  const remaining = expiresAt.getTime() - now.getTime();

  if (remaining <= 0) {
    // Expired — clean up
    removeFromStorage(key);
    return { active: false, expiresAt: null, remainingFormatted: null };
  }

  return {
    active: true,
    expiresAt: parsed.expiresAt,
    remainingFormatted: formatRemaining(remaining),
  };
}

/**
 * Forcefully clears a cooldown for the specified user.
 *
 * This should ONLY be called from an admin panel or after a user
 * explicitly acknowledges the override flow. Never call this
 * automatically — the cooldown exists for a reason.
 *
 * @param userId - The user whose cooldown to clear
 */
export function clearCooldown(userId: string): void {
  removeFromStorage(getStorageKey(userId));
}

// ---------------------------------------------------------------------------
// Server-side stubs (TODO: Supabase integration)
// ---------------------------------------------------------------------------

/**
 * TODO: Server-authoritative cooldown check via Supabase.
 *
 * When implemented, this will:
 *   1. Query the user_cooldowns table for an active record
 *   2. Return the same CooldownStatus shape
 *   3. Be used in API routes instead of localStorage
 *
 * The localStorage version remains as a client-side cache for
 * instant UI feedback while the server check happens.
 */
export async function checkCooldownServer(
  _userId: string,
): Promise<CooldownStatus> {
  // TODO: Implement with Supabase
  // const { data } = await supabase
  //   .from('user_cooldowns')
  //   .select('expires_at')
  //   .eq('user_id', userId)
  //   .gt('expires_at', new Date().toISOString())
  //   .single();
  //
  // if (!data) return { active: false, expiresAt: null, remainingFormatted: null };
  // ...

  return { active: false, expiresAt: null, remainingFormatted: null };
}

/**
 * TODO: Server-authoritative cooldown setter via Supabase.
 */
export async function setCooldownServer(
  _userId: string,
  _durationHours: number = DEFAULT_COOLDOWN_HOURS,
): Promise<void> {
  // TODO: Implement with Supabase
  // await supabase.from('user_cooldowns').upsert({
  //   user_id: userId,
  //   expires_at: new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString(),
  //   triggered_at: new Date().toISOString(),
  // });
}
