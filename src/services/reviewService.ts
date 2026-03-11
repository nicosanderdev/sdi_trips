import { supabase } from '../lib/supabase';
import { getUserBookings } from './bookingService';
import { REVIEW_WINDOW_DAYS } from '../constants/reviews';
import type { Booking, PropertyReviewItem, PropertyReviewsResult } from '../types';

/**
 * Frontend eligibility for showing "Leave Review" (UX only; RPC enforces on submit).
 * Requires: completed stay, checkout passed, within review window, no existing review, payment done.
 */
export function canLeaveReview(booking: Booking, hasExistingReview: boolean): boolean {
  if (hasExistingReview) return false;
  if (booking.status !== 'completed') return false;
  if (booking.paymentStatus != null && booking.paymentStatus !== 1) return false; // 1 = Paid
  const checkOut = new Date(booking.checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  checkOut.setHours(0, 0, 0, 0);
  if (checkOut > today) return false; // not yet after checkout
  const windowEnd = new Date(checkOut);
  windowEnd.setDate(windowEnd.getDate() + REVIEW_WINDOW_DAYS);
  if (today > windowEnd) return false; // window expired
  return true;
}

/**
 * Returns the translation key for why a booking is ineligible for review, or null if eligible.
 */
export function getReviewIneligibilityReason(booking: Booking, hasExistingReview: boolean): string | null {
  if (hasExistingReview) return 'reviews.errors.reviewAlreadyExists';
  if (booking.status !== 'completed') return 'reviews.errors.bookingNotCompleted';
  if (booking.paymentStatus != null && booking.paymentStatus !== 1) return 'reviews.errors.paymentRequired';
  const checkOut = new Date(booking.checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  checkOut.setHours(0, 0, 0, 0);
  if (checkOut > today) return 'reviews.errors.checkoutNotPassed';
  const windowEnd = new Date(checkOut);
  windowEnd.setDate(windowEnd.getDate() + REVIEW_WINDOW_DAYS);
  if (today > windowEnd) return 'reviews.errors.reviewWindowExpired';
  return null;
}

export interface ReviewEligibilityResult {
  canReview: boolean;
  booking?: Booking;
  reason?: string;
}

/**
 * Determine if the current user can leave a review for a property and return the eligible booking or reason.
 */
export async function getReviewEligibilityForProperty(
  propertyId: string,
  memberId: string
): Promise<ReviewEligibilityResult> {
  const bookings = await getUserBookings(memberId);
  const forProperty = bookings.filter((b) => b.property.id === propertyId);
  if (forProperty.length === 0) {
    return { canReview: false, reason: 'reviews.noBookingForProperty' };
  }
  for (const booking of forProperty) {
    const hasReview = await getExistingReviewForBooking(booking.id);
    if (canLeaveReview(booking, hasReview)) {
      return { canReview: true, booking };
    }
    const reason = getReviewIneligibilityReason(booking, hasReview);
    if (reason) {
      return { canReview: false, reason };
    }
  }
  return { canReview: false, reason: 'reviews.noBookingForProperty' };
}

const RPC_ERROR_MESSAGES: Record<string, string> = {
  Unauthorized: 'reviews.errors.unauthorized',
  'Booking not found': 'reviews.errors.bookingNotFound',
  'Not your booking': 'reviews.errors.notYourBooking',
  'Booking not completed': 'reviews.errors.bookingNotCompleted',
  'Checkout has not passed': 'reviews.errors.checkoutNotPassed',
  'Payment required': 'reviews.errors.paymentRequired',
  'Review window expired': 'reviews.errors.reviewWindowExpired',
  'Review already exists': 'reviews.errors.reviewAlreadyExists',
  'Rating must be between 1 and 5': 'reviews.errors.ratingInvalid',
};

/**
 * Submit a review for a booking. Backend validates eligibility.
 * @returns Created review Id
 * @throws Error with user-facing message key or raw message
 */
export async function createReview(
  bookingId: string,
  rating: number,
  comment: string | null
): Promise<string> {
  const { data, error } = await supabase.rpc('create_review', {
    p_booking_id: bookingId,
    p_rating: rating,
    p_comment: comment || null,
  });

  if (error) {
    const msg = error.message || '';
    const key = RPC_ERROR_MESSAGES[msg];
    throw new Error(key || msg);
  }

  if (data == null) {
    throw new Error('reviews.errors.submitFailed');
  }

  return data as string;
}

/**
 * Fetch reviews for a property (newest first) with average rating and count.
 */
export async function getReviewsByPropertyId(
  estatePropertyId: string
): Promise<PropertyReviewsResult> {
  const { data, error } = await supabase
    .from('Reviews')
    .select(
      `
      Id,
      Rating,
      Comment,
      CreatedAt,
      Members!UserId (
        FirstName,
        LastName,
        AvatarUrl
      )
    `
    )
    .eq('EstatePropertyId', estatePropertyId)
    .order('CreatedAt', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return { reviews: [], averageRating: 0, totalCount: 0 };
  }

  const rows = (data ?? []) as unknown as Array<{
    Id: string;
    Rating: number;
    Comment: string | null;
    CreatedAt: string;
    Members?: { FirstName: string | null; LastName: string | null; AvatarUrl: string | null } | null;
  }>;

  const reviews: PropertyReviewItem[] = rows.map((row) => {
    const member = row.Members;
    const reviewerName =
      member && (member.FirstName || member.LastName)
        ? [member.FirstName, member.LastName].filter(Boolean).join(' ').trim()
        : undefined;
    return {
      id: row.Id,
      rating: row.Rating,
      comment: row.Comment,
      createdAt: row.CreatedAt,
      reviewerName: reviewerName || undefined,
      reviewerAvatar: member?.AvatarUrl ?? undefined,
    };
  });

  const totalCount = reviews.length;
  const averageRating =
    totalCount > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount) * 10) / 10
      : 0;

  return { reviews, averageRating, totalCount };
}

/**
 * Check if a review already exists for a booking (for "Leave Review" button visibility).
 */
export async function getExistingReviewForBooking(bookingId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('Reviews')
    .select('Id')
    .eq('BookingId', bookingId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error checking existing review:', error);
    return false;
  }

  return data != null;
}
