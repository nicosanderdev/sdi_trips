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
