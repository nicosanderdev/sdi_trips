import {
  GUEST_SITE_LISTING_TYPES,
  type GuestSiteListingType,
} from '../../types/guestReviewContract';

export type AppVariant = 'main' | 'alt';

let registeredVariant: AppVariant | undefined;

export function isGuestSiteListingType(value: string): value is GuestSiteListingType {
  return (GUEST_SITE_LISTING_TYPES as readonly string[]).includes(value);
}

/**
 * Register which guest site is running. Call this from the app entry before React render.
 *
 * Production builds both main and alt HTML entries with MODE=production, so Vite MODE
 * cannot distinguish them. Dedicated entries (`index-app-alt.html`) must opt in here.
 */
export function setAppVariant(variant: AppVariant): void {
  registeredVariant = variant;
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.app = variant;
  }
}

function variantFromDom(): AppVariant | undefined {
  if (typeof document === 'undefined') return undefined;
  const fromDom = document.documentElement.dataset.app;
  return fromDom === 'alt' || fromDom === 'main' ? fromDom : undefined;
}

export function getAppVariant(): AppVariant {
  return registeredVariant ?? variantFromDom() ?? (import.meta.env.MODE === 'alt' ? 'alt' : 'main');
}

/** Listing type for the current guest site (main → SummerRent, alt → EventVenue). */
export function getGuestSiteListingType(): GuestSiteListingType {
  return getAppVariant() === 'alt' ? 'EventVenue' : 'SummerRent';
}
