import { supabase } from '../lib/supabase';
import type { Property, User } from '../types';

export type PublicPropertyOwnerType = 'member' | 'company';

/** Guest-safe payload from `get_public_property_owner` (no email/phone). */
export interface PublicPropertyOwnerProfile {
  ownerId?: string | null;
  ownerType?: PublicPropertyOwnerType | string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  description?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

function asTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function mapPublicOwnerToHost(
  profile: PublicPropertyOwnerProfile | null | undefined,
  fallbackOwnerId?: string | null,
): Property['host'] {
  const name = asTrimmedString(profile?.fullName);
  const avatar = asTrimmedString(profile?.avatarUrl);
  const bio = asTrimmedString(profile?.description);
  const id = asTrimmedString(profile?.ownerId) || fallbackOwnerId || '';

  const host: User = {
    id,
    name: name || '',
    email: '',
    avatar,
    phone: undefined,
    verified: false,
    bio,
  };

  return host;
}

/**
 * Public host card for property/venue detail. Never returns email/phone.
 */
export async function getPublicPropertyOwner(
  propertyId: string,
): Promise<PublicPropertyOwnerProfile | null> {
  const { data, error } = await supabase.rpc('get_public_property_owner', {
    p_property_id: propertyId,
  });

  if (error) {
    console.error('Error fetching public property owner:', error);
    throw error;
  }

  if (!data || typeof data !== 'object') {
    return null;
  }

  return data as PublicPropertyOwnerProfile;
}

export async function fetchHostForProperty(
  propertyId: string,
  fallbackOwnerId?: string | null,
): Promise<Property['host']> {
  try {
    const profile = await getPublicPropertyOwner(propertyId);
    return mapPublicOwnerToHost(profile, fallbackOwnerId);
  } catch {
    return mapPublicOwnerToHost(null, fallbackOwnerId);
  }
}
