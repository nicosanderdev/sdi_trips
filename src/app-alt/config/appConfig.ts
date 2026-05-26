/**
 * app-alt specific configuration (feature flags, branding, etc.)
 */
export const appConfig = {
  appId: 'alt' as const,
  /** Guest RPC listing type for this deployment (see getGuestSiteListingType). */
  guestSiteListingType: 'EventVenue' as const,
  featureFlags: {
    showLandingAds: false,
  },
} as const;
