/**
 * app-alt specific configuration (feature flags, branding, etc.)
 */
export const appConfig = {
  appId: 'alt' as const,
  featureFlags: {
    showLandingAds: false,
  },
} as const;
