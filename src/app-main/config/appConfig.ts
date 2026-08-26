/**
 * app-main specific configuration (feature flags, branding, etc.)
 */
export const appConfig = {
  appId: 'main' as const,
  /** Guest RPC listing type for this deployment (see getGuestSiteListingType). */
  guestSiteListingType: 'SummerRent' as const,
  featureFlags: {
    showLandingAds: true,
    /** When true, all public routes serve the Coming Soon page instead of the normal site. */
    comingSoon: true,
  },
} as const;
