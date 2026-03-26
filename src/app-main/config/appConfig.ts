/**
 * app-main specific configuration (feature flags, branding, etc.)
 */
export const appConfig = {
  appId: 'main' as const,
  featureFlags: {
    showLandingAds: true,
  },
} as const;
