/**
 * Guest-site visits via the record_guest_visit RPC.
 * Each origin keeps its own session and first-load acquisition snapshot.
 * The call is fire-and-forget: navigation does not wait, and failures stay out of the UI.
 */

import { supabase } from '../api/supabaseClient';
import { getGuestSiteListingType } from '../config/guestSiteListingType';

const SESSION_STORAGE_KEY = 'sdi_guest_session_id';
const ACQUISITION_STORAGE_KEY = 'sdi_guest_acquisition';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const GUEST_PAGE_KEYS = [
  'home',
  'search',
  'about',
  'how_it_works',
  'contact',
  'property_detail',
] as const;

export type GuestPageKey = (typeof GUEST_PAGE_KEYS)[number];

/** Pages the router can record as soon as the route is entered. */
export type ImmediateGuestPageKey = Exclude<GuestPageKey, 'property_detail'>;

export interface GuestAcquisition {
  referrerHost: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
}

type TrackedListingType = 'SummerRent' | 'EventVenue';

let memorySessionId: string | null = null;
let memoryAcquisition: GuestAcquisition | null = null;

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function nullableTrimmed(value: string | null): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  const withSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (withSlash.length > 1 && withSlash.endsWith('/')) {
    return withSlash.slice(0, -1);
  }
  return withSlash;
}

/**
 * Map the current location to a page that can be recorded immediately.
 * Property detail is omitted: that call waits until the public property payload loads.
 * Query-string changes do not change the result.
 */
export function resolveTrackedGuestPage(
  pathname: string,
  hash: string,
): ImmediateGuestPageKey | null {
  const path = normalizePath(pathname);
  if (path === '/') {
    return hash === '#how-it-works' ? 'how_it_works' : 'home';
  }
  if (path === '/search') return 'search';
  if (path === '/about') return 'about';
  if (path === '/contact') return 'contact';
  return null;
}

function ensureSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing && isUuid(existing)) {
      memorySessionId = existing;
      return existing;
    }
    const created = crypto.randomUUID();
    localStorage.setItem(SESSION_STORAGE_KEY, created);
    memorySessionId = created;
    return created;
  } catch {
    if (memorySessionId && isUuid(memorySessionId)) return memorySessionId;
    memorySessionId = crypto.randomUUID();
    return memorySessionId;
  }
}

function referrerHostFromDocument(): string | null {
  const raw = document.referrer;
  if (!raw) return null;
  try {
    const host = new URL(raw).hostname;
    return host || null;
  } catch {
    return null;
  }
}

function captureAcquisition(): GuestAcquisition {
  const params = new URLSearchParams(window.location.search);
  return {
    referrerHost: referrerHostFromDocument(),
    utmSource: nullableTrimmed(params.get('utm_source')),
    utmMedium: nullableTrimmed(params.get('utm_medium')),
    utmCampaign: nullableTrimmed(params.get('utm_campaign')),
  };
}

function storedNullableString(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  return nullableTrimmed(value);
}

function parseAcquisition(raw: string): GuestAcquisition | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const record = parsed as Record<string, unknown>;
    const referrerHost = storedNullableString(record.referrerHost);
    const utmSource = storedNullableString(record.utmSource);
    const utmMedium = storedNullableString(record.utmMedium);
    const utmCampaign = storedNullableString(record.utmCampaign);
    if (
      referrerHost === undefined ||
      utmSource === undefined ||
      utmMedium === undefined ||
      utmCampaign === undefined
    ) {
      return null;
    }
    return { referrerHost, utmSource, utmMedium, utmCampaign };
  } catch {
    return null;
  }
}

function ensureAcquisition(): GuestAcquisition {
  try {
    const raw = localStorage.getItem(ACQUISITION_STORAGE_KEY);
    if (raw) {
      const parsed = parseAcquisition(raw);
      if (parsed) {
        memoryAcquisition = parsed;
        return parsed;
      }
    }
  } catch {
    if (memoryAcquisition) return memoryAcquisition;
  }

  const captured = captureAcquisition();
  memoryAcquisition = captured;
  try {
    localStorage.setItem(ACQUISITION_STORAGE_KEY, JSON.stringify(captured));
  } catch {
    // Keep the in-memory snapshot for the rest of this document.
  }
  return captured;
}

/** Create the session id and the first-load acquisition snapshot if they are not already stored. */
export function ensureGuestVisitContext(): void {
  if (typeof window === 'undefined') return;
  ensureSessionId();
  ensureAcquisition();
}

function trackedListingType(): TrackedListingType | null {
  const listingType = getGuestSiteListingType();
  if (listingType === 'SummerRent' || listingType === 'EventVenue') return listingType;
  return null;
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message)
        : '';
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code ?? '')
      : '';
  if (code) return false;
  return /failed to fetch|networkerror|network request failed|load failed|timeout|aborted/i.test(
    message,
  );
}

async function invokeRecordGuestVisit(
  args: Record<string, string | null>,
): Promise<'done' | 'retry'> {
  try {
    const { error } = await supabase.rpc('record_guest_visit', args);
    if (!error || !isNetworkError(error)) return 'done';
    return 'retry';
  } catch (error) {
    return isNetworkError(error) ? 'retry' : 'done';
  }
}

function sendGuestVisit(pageKey: GuestPageKey, propertyId: string | null): void {
  if (typeof window === 'undefined') return;

  const listingType = trackedListingType();
  const pageHost = window.location.hostname;
  if (!listingType || !pageHost) return;
  if (pageKey === 'property_detail') {
    if (!propertyId || !isUuid(propertyId)) return;
  }

  const sessionId = ensureSessionId();
  const acquisition = ensureAcquisition();
  const args = {
    p_session_id: sessionId,
    p_listing_type: listingType,
    p_page_key: pageKey,
    p_property_id: pageKey === 'property_detail' ? propertyId : null,
    p_page_host: pageHost,
    p_referrer_host: acquisition.referrerHost,
    p_utm_source: acquisition.utmSource,
    p_utm_medium: acquisition.utmMedium,
    p_utm_campaign: acquisition.utmCampaign,
  };

  void (async () => {
    const first = await invokeRecordGuestVisit(args);
    if (first === 'retry') {
      await invokeRecordGuestVisit(args);
    }
  })();
}

export function recordGuestPageVisit(pageKey: ImmediateGuestPageKey): void {
  sendGuestVisit(pageKey, null);
}

/** Call only after the public property payload for this site has loaded. */
export function recordGuestPropertyVisit(propertyId: string): void {
  sendGuestVisit('property_detail', propertyId);
}
