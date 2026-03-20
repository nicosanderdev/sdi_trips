import { supabase } from '../api/supabaseClient';

export const APP_NAMES = {
  RENTALS_APP: 'rentals_app',
  ADMIN_APP: 'admin_app',
  VENUES_APP: 'venues_app',
} as const;

export type AppName = (typeof APP_NAMES)[keyof typeof APP_NAMES];

/**
 * Resolve user id: use provided userId or current auth user.
 */
async function resolveUserId(userId?: string): Promise<string | null> {
  if (userId) return userId;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

/**
 * Returns true if the user has a UserApps row for the given app (i.e. they have "used" this app before).
 * Use for one-time onboarding: if false, show welcome modal; then call recordAppUsed on Continue.
 */
export async function hasUsedApp(appName: string, userId?: string): Promise<boolean> {
  const uid = await resolveUserId(userId);
  if (!uid) return false;

  const { data, error } = await supabase
    .from('UserApps')
    .select('Id')
    .eq('UserId', uid)
    .eq('AppName', appName)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('UserAppsService.hasUsedApp:', error);
    return false;
  }
  return data != null;
}

/**
 * Records that the user has used this app. Call after they dismiss the welcome modal (e.g. Continue).
 * Idempotent: uses upsert so duplicate calls do not error.
 */
export async function recordAppUsed(appName: string, userId?: string): Promise<void> {
  const uid = await resolveUserId(userId);
  if (!uid) return;

  await supabase.from('UserApps').upsert(
    { UserId: uid, AppName: appName },
    { onConflict: 'UserId,AppName', ignoreDuplicates: true }
  );
}
