/** Guest-site listing types accepted by reservation lookup and guest review RPCs. */
export type GuestSiteListingType = 'RealEstate' | 'SummerRent' | 'EventVenue';

export const GUEST_SITE_LISTING_TYPES: readonly GuestSiteListingType[] = [
  'RealEstate',
  'SummerRent',
  'EventVenue',
] as const;

export interface GuestExistingReview {
  reviewId: string;
  rating: number;
  comment: string;
  updatedAt?: string;
}

export interface GuestReservationHostContact {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface GuestReservationLookupReservation {
  bookingId: string;
  guestId: string | null;
  reservationCode: string;
  propertyId: string;
  propertyTitle: string;
  listingType: GuestSiteListingType;
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'unknown';
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  canCancel: boolean;
  isExpired: boolean;
  isDeleted: boolean;
  hasExistingReview: boolean;
  existingGuestReview?: GuestExistingReview | null;
  canSubmitGuestReview: boolean;
  canEditGuestReview?: boolean;
  guestReviewWindowEnd?: string;
  hostName?: string | null;
  hostEmail?: string | null;
  hostPhone?: string | null;
  hostContact?: GuestReservationHostContact | null;
}

export interface GetReservationByCodeResponse {
  success: boolean;
  reservation?: GuestReservationLookupReservation;
  error?: string;
}

export interface CreateGuestReviewResponse {
  success: boolean;
  reviewId?: string;
  listingType?: GuestSiteListingType;
  error?: string;
}

export type GuestBookingErrorCode = 'GUEST_BOOKING_OVERLAP' | 'PRICE_QUOTE_MISMATCH';

export interface ValidateGuestBookingOverlapParams {
  email: string;
  checkIn: Date;
  checkOut: Date;
}

export interface ValidateGuestBookingOverlapResponse {
  success: boolean;
  hasOverlap?: boolean;
  error_code?: GuestBookingErrorCode;
  error?: string;
}

export interface ConfirmBookingFromHoldResponse {
  success: boolean;
  error_code?: GuestBookingErrorCode;
  error?: string;
  booking_id?: string;
  reservation_code?: string;
  manage_token?: string;
  guest_id?: string;
  listing_type?: GuestSiteListingType;
}

export function isGuestBookingOverlapError(
  code: string | undefined | null,
): code is 'GUEST_BOOKING_OVERLAP' {
  return code === 'GUEST_BOOKING_OVERLAP';
}

export function isPriceQuoteMismatchError(
  code: string | undefined | null,
): code is 'PRICE_QUOTE_MISMATCH' {
  return code === 'PRICE_QUOTE_MISMATCH';
}
