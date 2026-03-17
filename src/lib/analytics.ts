const IS_DEV = import.meta.env.DEV;

const SESSION_STORAGE_KEY = 'sdi_analytics_session';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

interface AnalyticsSessionState {
  id: string;
  lastActivity: number;
}

export interface TrackEventPayload {
  property_id?: string;
  user_id?: string;
  source?: string | null;
  medium?: string | null;
  revenue?: number;
  metadata?: Record<string, unknown>;
}

export interface UtmSourceMedium {
  source: string | null;
  medium: string | null;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function readSessionFromStorage(): AnalyticsSessionState | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AnalyticsSessionState;
    if (!parsed?.id || typeof parsed.lastActivity !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSessionToStorage(session: AnalyticsSessionState): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // ignore storage errors
  }
}

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback: RFC4122-ish random string
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function isSessionExpired(lastActivity: number): boolean {
  return Date.now() - lastActivity >= SESSION_TIMEOUT_MS;
}

function getOrCreateSession(emitSessionStart: boolean): { session: AnalyticsSessionState; isNew: boolean } {
  let session = readSessionFromStorage();
  let isNew = false;

  if (!session || isSessionExpired(session.lastActivity)) {
    session = {
      id: generateSessionId(),
      lastActivity: Date.now(),
    };
    isNew = true;
  } else {
    session = {
      ...session,
      lastActivity: Date.now(),
    };
  }

  writeSessionToStorage(session);

  if (isNew && emitSessionStart) {
    const { source, medium } = getUtmSourceAndMedium();
    internalTrackEvent('session_start', session.id, { source, medium });
  }

  return { session, isNew };
}

function internalTrackEvent(eventName: string, sessionId: string, payload: TrackEventPayload = {}): void {
  if (!isBrowser()) return;

  const body = JSON.stringify({
    event_name: eventName,
    session_id: sessionId,
    property_id: payload.property_id ?? null,
    user_id: payload.user_id ?? null,
    source: payload.source ?? null,
    medium: payload.medium ?? null,
    revenue: typeof payload.revenue === 'number' ? payload.revenue : null,
    metadata: payload.metadata ?? null,
  });

  try {
    if ('sendBeacon' in navigator) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/track', blob);
      return;
    }
  } catch {
    // fall through to fetch
  }

  try {
    // Fire-and-forget; do not await
    void fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
      keepalive: true,
    });
  } catch (error) {
    if (IS_DEV) {
      // eslint-disable-next-line no-console
      console.debug('[analytics] failed to send event', eventName, error);
    }
  }
}

export function getUtmSourceAndMedium(): UtmSourceMedium {
  if (!isBrowser()) {
    return { source: null, medium: null };
  }
  try {
    const params = new URLSearchParams(window.location.search);
    const source = params.get('utm_source');
    const medium = params.get('utm_medium');
    return {
      source: source ? source.toLowerCase().slice(0, 255) : null,
      medium: medium ? medium.toLowerCase().slice(0, 255) : null,
    };
  } catch {
    return { source: null, medium: null };
  }
}

export function initAnalyticsSession(): void {
  if (!isBrowser()) return;
  getOrCreateSession(true);
}

export function trackEvent(eventName: string, payload: TrackEventPayload = {}): void {
  if (!isBrowser()) return;
  const { session } = getOrCreateSession(false);
  internalTrackEvent(eventName, session.id, payload);
}

