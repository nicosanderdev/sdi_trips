import {
  GUEST_SITE_LISTING_TYPES,
  type GuestSiteListingType,
} from '../../types/guestReviewContract';

export function isGuestSiteListingType(value: string): value is GuestSiteListingType {
  return (GUEST_SITE_LISTING_TYPES as readonly string[]).includes(value);
}

/** Listing type for the current Vite deployment (main → SummerRent, alt → EventVenue). */
export function getGuestSiteListingType(): GuestSiteListingType {
  return import.meta.env.MODE === 'alt' ? 'EventVenue' : 'SummerRent';
}
