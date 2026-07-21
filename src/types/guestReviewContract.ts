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
  /** Authoritative booking total from server quote. */
  totalAmount?: number | null;
  currency?: number | null;
  currencyCode?: string | null;
  /** True when a verified Mercado Pago webhook marked approval (audit only). */
  mercadoPagoApproved?: boolean;
  mercadoPagoApprovedAt?: string | null;
  /** True when seller is connected, booking unpaid via MP, and amount > 0. */
  canPayOnline?: boolean;
  sellerConnected?: boolean;
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

/** Stable error codes returned by guest booking RPCs / payment edges. */
export type GuestBookingErrorCode =
  | 'GUEST_BOOKING_OVERLAP'
  | 'PRICE_QUOTE_MISMATCH'
  | 'SELLER_NOT_CONNECTED'
  | 'NO_DESIGNATED_SELLER'
  | 'ALREADY_APPROVED'
  | 'CANNOT_PAY'
  | 'INVALID_AMOUNT'
  | 'AMOUNT_MISMATCH'
  | 'CURRENCY_MISMATCH';

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

/** create_booking_hold / confirm_booking_from_hold Mercado Pago eligibility. */
export interface MercadoPagoBookingEligibility {
  can_pay_online: boolean;
  seller_connected: boolean;
  mercado_pago_approved: boolean;
}

export interface ConfirmBookingFromHoldResponse {
  success: boolean;
  error_code?: GuestBookingErrorCode;
  error?: string;
  booking_id?: string;
  reservation_code?: string;
  manage_token?: string;
  manage_expires_at?: string;
  guest_id?: string;
  listing_type?: GuestSiteListingType;
  total_amount?: number;
  currency?: number;
  currency_code?: string;
  mercado_pago?: MercadoPagoBookingEligibility;
}

export interface CreateMercadoPagoPreferenceRequest {
  manageToken?: string;
  reservationCode?: string;
  listingType?: GuestSiteListingType;
}

export interface CreateMercadoPagoPreferenceSuccess {
  success: true;
  attemptId: string;
  preferenceId: string | null;
  initPoint?: string;
  sandboxInitPoint?: string;
  amount: number;
  currencyCode: string;
  reused: boolean;
  disclaimerKey: 'mercado_pago_bridge_disclaimer';
}

export interface MercadoPagoPreferenceFailure {
  success: false;
  error?: string;
  error_code?: GuestBookingErrorCode;
}

export type CreateMercadoPagoPreferenceResponse =
  | CreateMercadoPagoPreferenceSuccess
  | MercadoPagoPreferenceFailure;

export interface BookingPaymentStatusSuccess {
  success: true;
  booking_id: string;
  reservation_code: string | null;
  amount: number | null;
  currency: number | null;
  currency_code: string;
  mercado_pago_approved: boolean;
  mercado_pago_approved_at: string | null;
  can_pay_online: boolean;
  seller_connected: boolean;
  seller_error_code?: string | null;
  seller_member_id?: string | null;
}

export interface BookingPaymentStatusFailure {
  success: false;
  error?: string;
  error_code?: GuestBookingErrorCode;
}

export type BookingPaymentStatusResponse =
  | BookingPaymentStatusSuccess
  | BookingPaymentStatusFailure;

/** Delivery channel returned by booking-send-otp on success. */
export type OtpChannel = 'whatsapp' | 'sms_fallback' | 'local_mock';

export interface OtpSendResponse {
  success: boolean;
  channel?: OtpChannel;
  otpRequestId?: string;
  /** Present only in local dry-run mode. */
  mode?: string;
  error?: string;
}

export interface OtpVerifyResponse {
  success: boolean;
  error?: string;
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

export function isMercadoPagoPreferenceErrorCode(
  code: string | undefined | null,
): code is Extract<
  GuestBookingErrorCode,
  | 'SELLER_NOT_CONNECTED'
  | 'NO_DESIGNATED_SELLER'
  | 'ALREADY_APPROVED'
  | 'CANNOT_PAY'
  | 'INVALID_AMOUNT'
> {
  return (
    code === 'SELLER_NOT_CONNECTED' ||
    code === 'NO_DESIGNATED_SELLER' ||
    code === 'ALREADY_APPROVED' ||
    code === 'CANNOT_PAY' ||
    code === 'INVALID_AMOUNT'
  );
}
