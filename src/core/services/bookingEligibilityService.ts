import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../api/supabaseClient';

export interface BookingEligibility {
  isEmailVerified: boolean;
  hasPhone: boolean;
  meetsRequirements: boolean;
}

export async function getBookingEligibility(
  user: SupabaseUser | null
): Promise<BookingEligibility> {
  if (!user) {
    return {
      isEmailVerified: false,
      hasPhone: false,
      meetsRequirements: false,
    };
  }

  // Email verified state comes from Supabase auth; ensure Auth > Email "Confirm email" is enabled
  // for new signups so email_confirmed_at is null until the user confirms.
  const isEmailVerified = !!user.email_confirmed_at;

  let hasPhone = false;

  try {
    const { data, error } = await supabase
      .from('Members')
      .select('Phone, PhonePrefix')
      .eq('UserId', user.id)
      .eq('IsDeleted', false)
      .single();

    if (error) {
      // PGRST116 = no rows found
      if ((error as any).code !== 'PGRST116') {
        console.error('Error loading member contact info for eligibility:', error);
      }
    } else if (data) {
      hasPhone = !!(data.Phone || data.PhonePrefix);
    }
  } catch (err) {
    console.error('Unexpected error computing booking eligibility:', err);
  }

  return {
    isEmailVerified,
    hasPhone,
    meetsRequirements: isEmailVerified && hasPhone,
  };
}

