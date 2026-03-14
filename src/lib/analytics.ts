/**
 * Google Analytics (GA4) integration for the public app.
 * - page_view on route changes
 * - property_view on property detail pages with custom parameters
 *
 * Set VITE_GA_MEASUREMENT_ID in .env to enable (e.g. G-XXXXXXXXXX).
 * In dev, events show in GA4 DebugView (Realtime > DebugView).
 */

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const IS_DEV = import.meta.env.DEV;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function ensureGtag(): boolean {
  if (!MEASUREMENT_ID || typeof window === 'undefined') return false;
  if (window.gtag) return true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  script.onload = () => {
    // First page_view only after gtag.js has loaded (avoids race on initial load)
    sendPageView(window.location.pathname + window.location.search);
  };
  document.head.appendChild(script);
  return true;
}

/**
 * Initialize GA (call once on app load). Config is sent immediately; first page_view is sent when gtag.js loads.
 */
export function initAnalytics(): void {
  if (!MEASUREMENT_ID) return;
  if (IS_DEV) {
    console.debug('[GA] Measurement ID:', MEASUREMENT_ID, '- use GA4 Realtime > DebugView to see events');
  }
  ensureGtag();
  window.gtag?.('config', MEASUREMENT_ID, {
    send_page_view: false,
    ...(IS_DEV && { debug_mode: true }),
  });
}

/**
 * Send a GA page_view for the current path.
 */
export function sendPageView(path: string, title?: string): void {
  if (!MEASUREMENT_ID || !ensureGtag()) return;
  const payload = {
    page_path: path,
    page_title: title ?? document.title,
    page_location: typeof window !== 'undefined' ? window.location.origin + path : undefined,
  };
  if (IS_DEV) console.debug('[GA] page_view', payload);
  window.gtag?.('event', 'page_view', payload);
}

export interface PropertyViewParams {
  property_id: string;
  property_slug?: string;
  company_id?: string;
  listing_type?: string;
  source?: string;
}

/**
 * Send custom property_view event (on property detail page).
 */
export function sendPropertyView(params: PropertyViewParams): void {
  if (!MEASUREMENT_ID || !ensureGtag()) return;
  window.gtag?.('event', 'property_view', params);
}

/**
 * Derive source label from UTM params and referrer for analytics.
 */
export function getSourceFromUtmOrReferrer(): string {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const utmSource = params?.get('utm_source')?.toLowerCase();
  if (utmSource) {
    if (['facebook', 'twitter', 'instagram', 'linkedin', 'social'].includes(utmSource)) return 'social';
    if (['google', 'campaign', 'cpc', 'email', 'newsletter'].includes(utmSource)) return 'campaign';
    return utmSource.slice(0, 50);
  }
  const referrer = typeof document !== 'undefined' ? document.referrer : '';
  if (!referrer) return 'website';
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (/facebook|twitter|instagram|linkedin|t\.co|reddit|pinterest/.test(host)) return 'social';
    if (/google|bing|yahoo|duckduckgo/.test(host)) return 'organic';
  } catch {
    // ignore
  }
  return 'website';
}

export function isAnalyticsEnabled(): boolean {
  return Boolean(MEASUREMENT_ID);
}
