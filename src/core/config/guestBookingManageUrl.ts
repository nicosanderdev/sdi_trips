import type { GuestSiteListingType } from '../../types/guestReviewContract';
import { isGuestSiteListingType } from './guestSiteListingType';

const DEFAULT_MANAGE_PATH = '/reservation-lookup';

/**
 * Base URL for guest reservation manage / lookup links.
 * Prefer `VITE_GUEST_BOOKING_MANAGE_BASE_URL` when set (per main/alt deploy);
 * otherwise same-origin relative `/reservation-lookup` for SPA navigation.
 */
export function getGuestBookingManageBaseUrl(): string {
  const fromEnv = (import.meta.env.VITE_GUEST_BOOKING_MANAGE_BASE_URL as string | undefined)?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }
  return DEFAULT_MANAGE_PATH;
}

export interface BuildGuestManageUrlParams {
  code?: string;
  listingType?: GuestSiteListingType;
  token?: string;
}

/**
 * Builds a guest manage/lookup URL.
 * - Code lookup: `?code=&listingType=`
 * - Token manage (email/WhatsApp links): `?token=`
 */
export function buildGuestManageUrl(params: BuildGuestManageUrlParams): string {
  const base = getGuestBookingManageBaseUrl();
  const search = new URLSearchParams();

  if (params.token?.trim()) {
    search.set('token', params.token.trim());
  } else if (params.code?.trim()) {
    search.set('code', params.code.trim());
    if (params.listingType) {
      search.set('listingType', params.listingType);
    }
  } else if (params.listingType) {
    search.set('listingType', params.listingType);
  }

  const query = search.toString();
  return query ? `${base}?${query}` : base;
}

/** Parse `listingType` from a URL search param; returns undefined if missing/invalid. */
export function parseListingTypeParam(value: string | null | undefined): GuestSiteListingType | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return isGuestSiteListingType(trimmed) ? trimmed : undefined;
}
