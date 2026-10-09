import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ensureGuestVisitContext,
  recordGuestPageVisit,
  resolveTrackedGuestPage,
} from '../../core/services/guestVisitService';

/**
 * Records a guest visit when the visitor enters a tracked page.
 * Query-string changes on the same page do not send another call.
 * Property detail is recorded by the page after its public payload loads.
 */
export function GuestVisitTracker() {
  const { pathname, hash } = useLocation();
  const pageKey = resolveTrackedGuestPage(pathname, hash);

  useEffect(() => {
    ensureGuestVisitContext();
  }, []);

  useEffect(() => {
    if (!pageKey) return;
    recordGuestPageVisit(pageKey);
  }, [pageKey]);

  return null;
}
