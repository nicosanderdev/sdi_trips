/**
 * app-alt specific configuration (feature flags, branding, etc.)
 */
export const appConfig = {
  appId: 'alt' as const,
  /** Guest RPC listing type for this deployment (see getGuestSiteListingType). */
  guestSiteListingType: 'EventVenue' as const,
  featureFlags: {
    showLandingAds: false,
    /** When true, all public routes serve the Coming Soon page instead of the normal site. */
    comingSoon: true,
  },
} as const;
