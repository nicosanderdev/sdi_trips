import { GUEST_REVIEW_WINDOW_HOURS } from '../../constants/reviews';

export interface GuestReviewWindow {
  windowStart: Date;
  windowEnd: Date;
}

/** Parse YYYY-MM-DD (or ISO date prefix) as local calendar date. */
function parseCheckOutDate(checkOut: string): Date {
  const datePart = checkOut.trim().slice(0, 10);
  const [y, m, d] = datePart.split('-').map(Number);
  if (!y || !m || !d) {
    const fallback = new Date(checkOut);
    fallback.setHours(0, 0, 0, 0);
    return fallback;
  }
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/**
 * Guest review window for reservation-code lookup:
 * opens at start of checkout day, closes 48h after end of checkout day (local time).
 */
export function getGuestReviewWindow(checkOut: string): GuestReviewWindow {
  const checkOutDate = parseCheckOutDate(checkOut);
  const windowStart = new Date(checkOutDate);

  const endOfCheckoutDay = new Date(checkOutDate);
  endOfCheckoutDay.setHours(23, 59, 59, 999);

  const windowEnd = new Date(
    endOfCheckoutDay.getTime() + GUEST_REVIEW_WINDOW_HOURS * 60 * 60 * 1000,
  );

  return { windowStart, windowEnd };
}

export type GuestReviewWindowPhase = 'not_yet_open' | 'open' | 'expired';

export function getGuestReviewWindowPhase(
  checkOut: string,
  now: Date = new Date(),
): GuestReviewWindowPhase {
  const { windowStart, windowEnd } = getGuestReviewWindow(checkOut);
  if (now < windowStart) return 'not_yet_open';
  if (now > windowEnd) return 'expired';
  return 'open';
}

export function isGuestReviewWindowOpen(checkOut: string, now: Date = new Date()): boolean {
  return getGuestReviewWindowPhase(checkOut, now) === 'open';
}
