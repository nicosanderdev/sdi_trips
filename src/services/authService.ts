import { supabase } from '../lib/supabase';

/**
 * Resend the signup verification email to the given address.
 * Uses Supabase Auth's resend API with type 'signup'.
 */
export async function resendEmailVerification(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });

  if (error) {
    console.error('Error resending verification email:', error);
    throw error;
  }
}

