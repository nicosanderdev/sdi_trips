import { supabase } from '../api/supabaseClient';

/** Access token for the current session, if any. */
export async function getAuthToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function isAuthenticated(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session != null;
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}
