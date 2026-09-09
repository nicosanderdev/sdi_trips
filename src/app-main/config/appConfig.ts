/**
 * app-main specific configuration (feature flags, branding, etc.)
 */
export const appConfig = {
  appId: 'main' as const,
  /** Guest RPC listing type for this deployment (see getGuestSiteListingType). */
  guestSiteListingType: 'SummerRent' as const,
  featureFlags: {
    showLandingAds: true,
  },
} as const;
