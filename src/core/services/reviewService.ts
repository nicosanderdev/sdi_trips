import { getGuestSiteListingType } from '../config/guestSiteListingType';
import { supabase } from '../api/supabaseClient';
import { getUserBookings, normalizeReservationCode } from '../../services/bookingService';
import type { GuestSiteListingType } from '../../types/guestReviewContract';
import { REVIEW_WINDOW_DAYS } from '../../constants/reviews';
import type { Booking, PropertyReviewItem, PropertyReviewsResult } from '../models';

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

export interface CreateGuestReviewParams {
  reservationCode: string;
  guestEmail: string;
  rating: number;
  comment: string;
  listingType?: GuestSiteListingType;
}

const GUEST_REVIEW_RPC_ERROR_MESSAGES: Record<string, string> = {
  'Invalid reservation code format': 'reservationLookup.review.errors.invalidCode',
  'Reservation not found': 'reservationLookup.review.errors.notFound',
  'Booking not eligible for review': 'reservationLookup.review.errors.notEligible',
  'Checkout has not passed': 'reservationLookup.review.errors.checkoutNotPassed',
  'Guest email does not match': 'reservationLookup.review.errors.emailMismatch',
  'Review already exists': 'reservationLookup.review.errors.alreadyExists',
  'Review window expired': 'reservationLookup.review.errors.codeExpired',
  'Review not found': 'reservationLookup.review.errors.notFound',
  'Rating must be between 1 and 5': 'reservationLookup.review.errors.ratingInvalid',
  'Comment is required': 'reservationLookup.review.errors.commentRequired',
  'Invalid listing type': 'reservationLookup.review.errors.invalidListingType',
};

function parseGuestReviewRpcResult(
  data: unknown,
  error: { message?: string } | null,
): string {
  if (error) {
    const key = GUEST_REVIEW_RPC_ERROR_MESSAGES[error.message || ''];
    throw new Error(key || 'reservationLookup.review.errors.submitFailed');
  }

  const payload = data as Record<string, unknown> | null;
  if (payload?.success === true && payload.reviewId != null) {
    return String(payload.reviewId);
  }

  const errMsg = (payload?.error as string | undefined) ?? '';
  const key = GUEST_REVIEW_RPC_ERROR_MESSAGES[errMsg];
  throw new Error(key || errMsg || 'reservationLookup.review.errors.submitFailed');
}

/**
 * Submit a guest review via reservation code (no auth). Backend validates eligibility.
 * @returns Created review Id
 * @throws Error with i18n key under reservationLookup.review.errors.* or raw message
 */
export async function createGuestReviewByReservationCode(
  params: CreateGuestReviewParams,
): Promise<string> {
  const code =
    normalizeReservationCode(params.reservationCode) ?? params.reservationCode.trim().toUpperCase();

  const { data, error } = await supabase.rpc('create_guest_review_by_reservation_code', {
    p_reservation_code: code,
    p_guest_email: params.guestEmail.trim(),
    p_rating: params.rating,
    p_comment: params.comment.trim(),
    p_listing_type: params.listingType ?? getGuestSiteListingType(),
  });

  return parseGuestReviewRpcResult(data, error);
}

/**
 * Update a guest review via reservation code (no auth). Backend validates eligibility.
 * @returns Updated review Id
 */
export async function updateGuestReviewByReservationCode(
  params: CreateGuestReviewParams,
): Promise<string> {
  const code =
    normalizeReservationCode(params.reservationCode) ?? params.reservationCode.trim().toUpperCase();

  const { data, error } = await supabase.rpc('update_guest_review_by_reservation_code', {
    p_reservation_code: code,
    p_guest_email: params.guestEmail.trim(),
    p_rating: params.rating,
    p_comment: params.comment.trim(),
    p_listing_type: params.listingType ?? getGuestSiteListingType(),
  });

  return parseGuestReviewRpcResult(data, error);
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

function formatPersonName(firstName: string | null | undefined, lastName: string | null | undefined): string {
  return [firstName, lastName].filter(Boolean).join(' ').trim();
}

/**
 * Fetch reviews for a property (newest first) with average rating and count.
 * Reviewer names resolve via polymorphic Reviews.GuestId (Members or Guests).
 */
export async function getReviewsByPropertyId(
  estatePropertyId: string,
  listingType?: GuestSiteListingType,
): Promise<PropertyReviewsResult> {
  const siteListingType = listingType ?? getGuestSiteListingType();
  const { data, error } = await supabase
    .from('Reviews')
    .select('Id, Rating, Comment, CreatedAt, GuestId')
    .eq('EstatePropertyId', estatePropertyId)
    .eq('ListingType', siteListingType)
    .order('CreatedAt', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return { reviews: [], averageRating: 0, totalCount: 0 };
  }

  const rows = (data ?? []) as Array<{
    Id: string;
    Rating: number;
    Comment: string | null;
    CreatedAt: string;
    GuestId: string | null;
  }>;

  const guestIds = [...new Set(rows.map((r) => r.GuestId).filter((id): id is string => Boolean(id)))];

  const memberById = new Map<
    string,
    { FirstName: string | null; LastName: string | null; AvatarUrl: string | null }
  >();
  const guestById = new Map<string, { FirstName: string | null; LastName: string | null }>();

  if (guestIds.length > 0) {
    const [membersResult, guestsResult] = await Promise.all([
      supabase
        .from('Members')
        .select('Id, FirstName, LastName, AvatarUrl')
        .in('Id', guestIds),
      supabase.from('Guests').select('Id, FirstName, LastName').in('Id', guestIds),
    ]);

    if (membersResult.error) {
      console.error('Error fetching member reviewers:', membersResult.error);
    } else {
      for (const m of membersResult.data ?? []) {
        memberById.set(m.Id, {
          FirstName: m.FirstName,
          LastName: m.LastName,
          AvatarUrl: m.AvatarUrl,
        });
      }
    }

    if (guestsResult.error) {
      console.error('Error fetching guest reviewers:', guestsResult.error);
    } else {
      for (const g of guestsResult.data ?? []) {
        guestById.set(g.Id, { FirstName: g.FirstName, LastName: g.LastName });
      }
    }
  }

  const reviews: PropertyReviewItem[] = rows.map((row) => {
    const guestId = row.GuestId;
    let reviewerName: string | undefined;
    let reviewerAvatar: string | undefined;

    if (guestId) {
      const member = memberById.get(guestId);
      if (member) {
        const name = formatPersonName(member.FirstName, member.LastName);
        reviewerName = name || undefined;
        reviewerAvatar = member.AvatarUrl ?? undefined;
      } else {
        const guest = guestById.get(guestId);
        if (guest) {
          const name = formatPersonName(guest.FirstName, guest.LastName);
          reviewerName = name || undefined;
        }
      }
    }

    return {
      id: row.Id,
      rating: row.Rating,
      comment: row.Comment,
      createdAt: row.CreatedAt,
      reviewerName,
      reviewerAvatar,
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

/**
 * Fetch aggregated rating stats (average rating and total count) for multiple properties in one query.
 *
 * This is intentionally read-only and does not modify any database structures.
 */
export async function getRatingsForProperties(
  propertyIds: string[],
  listingType?: GuestSiteListingType,
): Promise<Record<string, { averageRating: number; reviewCount: number }>> {
  if (!propertyIds || propertyIds.length === 0) {
    return {};
  }

  const siteListingType = listingType ?? getGuestSiteListingType();
  const { data, error } = await supabase
    .from('Reviews')
    .select('EstatePropertyId, Rating')
    .eq('ListingType', siteListingType)
    .in('EstatePropertyId', propertyIds);

  if (error) {
    console.error('Error fetching ratings for properties:', error);
    return {};
  }

  const rows =
    (data ?? []) as Array<{
      EstatePropertyId: string;
      Rating: number;
    }>;

  const stats: Record<string, { sum: number; count: number }> = {};

  for (const row of rows) {
    const key = row.EstatePropertyId;
    if (!key) continue;
    if (!stats[key]) {
      stats[key] = { sum: 0, count: 0 };
    }
    stats[key].sum += row.Rating;
    stats[key].count += 1;
  }

  const result: Record<string, { averageRating: number; reviewCount: number }> = {};

  for (const [propertyId, { sum, count }] of Object.entries(stats)) {
    if (count === 0) continue;
    const averageRaw = sum / count;
    const averageRating = Math.round(averageRaw * 10) / 10;
    result[propertyId] = {
      averageRating,
      reviewCount: count,
    };
  }

  return result;
}
