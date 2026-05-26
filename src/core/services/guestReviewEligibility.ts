import type { GuestExistingReview } from '../../types/guestReviewContract';
import type { ReservationLookupData } from '../../services/bookingService';
import { getGuestReviewWindow, getGuestReviewWindowPhase } from './guestReviewWindow';

const ELIGIBLE_STATUSES = new Set(['confirmed', 'completed']);

export type GuestReviewLookupState =
  | { kind: 'hidden'; reasonKey: string }
  | { kind: 'not_yet_open'; windowStart: Date; windowEnd: Date }
  | { kind: 'expired' }
  | { kind: 'create'; windowEnd: Date }
  | { kind: 'edit'; review: GuestExistingReview; windowEnd: Date }
  | { kind: 'view_only'; review: GuestExistingReview };

function getBaseIneligibilityReason(reservation: ReservationLookupData): string | null {
  if (reservation.isDeleted === true) {
    return 'reservationLookup.review.errors.notEligible';
  }
  if (reservation.guestId === null || reservation.guestId === undefined) {
    return 'reservationLookup.review.errors.notEligible';
  }
  if (!ELIGIBLE_STATUSES.has(reservation.status)) {
    return 'reservationLookup.review.errors.notEligible';
  }
  return null;
}

function resolveExistingReview(reservation: ReservationLookupData): GuestExistingReview | null {
  if (reservation.existingGuestReview) {
    return reservation.existingGuestReview;
  }
  if (reservation.hasExistingReview === true) {
    return { reviewId: '', rating: 0, comment: '' };
  }
  return null;
}

function clientFallbackState(
  reservation: ReservationLookupData,
  now: Date,
): GuestReviewLookupState {
  const ineligible = getBaseIneligibilityReason(reservation);
  if (ineligible) {
    return { kind: 'hidden', reasonKey: ineligible };
  }

  const { windowStart, windowEnd } = getGuestReviewWindow(reservation.checkOut);
  const phase = getGuestReviewWindowPhase(reservation.checkOut, now);
  const existing = resolveExistingReview(reservation);

  if (phase === 'not_yet_open') {
    return { kind: 'not_yet_open', windowStart, windowEnd };
  }
  if (phase === 'expired') {
    if (existing && existing.reviewId) {
      return { kind: 'view_only', review: existing };
    }
    return { kind: 'expired' };
  }

  if (existing) {
    return { kind: 'edit', review: existing, windowEnd };
  }
  return { kind: 'create', windowEnd };
}

/**
 * Determines guest review UI state on reservation code lookup.
 * Prefers server flags when explicitly set; otherwise uses client window logic.
 */
export function getGuestReviewLookupState(
  reservation: ReservationLookupData,
  now: Date = new Date(),
): GuestReviewLookupState {
  const ineligible = getBaseIneligibilityReason(reservation);
  if (ineligible) {
    return { kind: 'hidden', reasonKey: ineligible };
  }

  const { windowStart, windowEnd } = getGuestReviewWindow(reservation.checkOut);
  const phase = getGuestReviewWindowPhase(reservation.checkOut, now);
  const existing = resolveExistingReview(reservation);

  if (reservation.canSubmitGuestReview === true) {
    return { kind: 'create', windowEnd };
  }
  if (reservation.canEditGuestReview === true && existing) {
    return { kind: 'edit', review: existing, windowEnd };
  }
  if (
    reservation.canSubmitGuestReview === false &&
    reservation.canEditGuestReview === false
  ) {
    if (phase === 'expired') {
      if (existing && existing.reviewId) {
        return { kind: 'view_only', review: existing };
      }
      return { kind: 'expired' };
    }
    if (phase === 'not_yet_open') {
      return { kind: 'not_yet_open', windowStart, windowEnd };
    }
    if (existing && existing.reviewId) {
      return { kind: 'view_only', review: existing };
    }
    return { kind: 'hidden', reasonKey: 'reservationLookup.review.errors.notEligible' };
  }

  return clientFallbackState(reservation, now);
}

/**
 * Whether to show the guest review form on reservation code lookup (UX only).
 * @deprecated Prefer getGuestReviewLookupState for full UI branching.
 */
export function canShowGuestReviewOnLookup(reservation: ReservationLookupData): boolean {
  const state = getGuestReviewLookupState(reservation);
  return state.kind === 'create' || state.kind === 'edit';
}
