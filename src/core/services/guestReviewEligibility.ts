import type { ReservationLookupData } from '../../services/bookingService';

const ELIGIBLE_STATUSES = new Set(['confirmed', 'completed']);

function isCheckoutOnOrBeforeToday(checkOut: string): boolean {
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  checkOutDate.setHours(0, 0, 0, 0);
  return checkOutDate <= today;
}

/**
 * Whether to show the guest review form on reservation code lookup (UX only).
 * Used by both main and alt apps via shared ReservationDetails.
 */
function clientFallbackEligible(reservation: ReservationLookupData): boolean {
  if (reservation.isDeleted === true) return false;
  if (!ELIGIBLE_STATUSES.has(reservation.status)) return false;
  if (!isCheckoutOnOrBeforeToday(reservation.checkOut)) return false;
  return true;
}

export function canShowGuestReviewOnLookup(reservation: ReservationLookupData): boolean {
  if (reservation.hasExistingReview === true) return false;
  if (reservation.canSubmitGuestReview === true) return true;
  if (reservation.canSubmitGuestReview === false) return false;
  return clientFallbackEligible(reservation);
}
