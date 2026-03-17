/**
 * Log property page views to Supabase PropertyVisitLogs.
 * Throttled per property + session so refreshes don't inflate counts.
 */

import { supabase } from '../lib/supabase';

const STORAGE_KEY_PREFIX = 'pv_';
const TTL_MS = 8 * 60 * 1000; // 8 minutes

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem('sdi_pv_sid');
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem('sdi_pv_sid', sid);
    }
    return sid;
  } catch {
    return crypto.randomUUID();
  }
}

function throttleKey(propertyId: string): string {
  return `${STORAGE_KEY_PREFIX}${propertyId}_${getSessionId()}`;
}

function isThrottled(propertyId: string): boolean {
  try {
    const key = throttleKey(propertyId);
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const ts = Number(raw);
    if (Number.isNaN(ts)) return false;
    return Date.now() - ts < TTL_MS;
  } catch {
    return false;
  }
}

function setThrottle(propertyId: string): void {
  try {
    const key = throttleKey(propertyId);
    localStorage.setItem(key, String(Date.now()));
  } catch {
    // ignore
  }
}

/**
 * Insert a row into PropertyVisitLogs. Fire-and-forget; logs errors only.
 * Throttled: skips insert if the same property was already logged in this session within TTL.
 */
export function logPropertyVisit(propertyId: string, source: string): void {
  if (isThrottled(propertyId)) return;

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  setThrottle(propertyId);

  (async () => {
    try {
      const { error } = await supabase
        .from('PropertyVisitLogs')
        .insert({
          Id: id,
          PropertyId: propertyId,
          VisitedOnUtc: now,
          Source: source.slice(0, 50) || 'website',
          IsDeleted: false,
          Created: now,
          CreatedBy: null,
          LastModified: now,
          LastModifiedBy: null,
        });

      if (error) {
        console.error('[PropertyVisitLog] insert failed:', error.message);
      }
    } catch (err) {
      console.error('[PropertyVisitLog] error:', err);
    }
  })();
}
