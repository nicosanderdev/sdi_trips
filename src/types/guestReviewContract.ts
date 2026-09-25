/** Guest-site listing types accepted by reservation lookup and guest review RPCs. */
export type GuestSiteListingType = 'RealEstate' | 'SummerRent' | 'EventVenue';

export const GUEST_SITE_LISTING_TYPES: readonly GuestSiteListingType[] = [
  'RealEstate',
  'SummerRent',
  'EventVenue',
] as const;

/** Gallery item from public detail RPCs (`Images` jsonb). */
export interface PublicPropertyImage {
  propertyImageId: string;
  url: string;
  altText?: string | null;
  isMain?: boolean;
  displayOrder?: number;
}

/** Params for get_public_featured_*_properties RPCs. Omit or null → server default 6 (clamped 1–20). */
export interface GetPublicFeaturedPropertiesParams {
  p_limit?: number | null;
}

/**
 * PascalCase row from get_public_summer_rent_properties /
 * get_public_featured_summer_rent_properties (and detail-by-id with optional gallery fields).
 */
export interface PublicSummerRentListRow {
  EstatePropertyId: string;
  StreetName: string | null;
  HouseNumber: string | null;
  Neighborhood: string | null;
  City: string | null;
  State: string | null;
  ZipCode: string | null;
  Country: string | null;
  LocationLatitude: number;
  LocationLongitude: number;
  AreaValue: number | null;
  AreaUnit: number | null;
  Bedrooms: number;
  Bathrooms: number;
  HasGarage: boolean;
  GarageSpaces: number;
  OwnerId: string | null;
  IsDeleted: boolean;
  HasLaundryRoom: boolean;
  HasPool: boolean;
  HasBalcony: boolean;
  IsFurnished: boolean;
  Capacity: number | null;
  LocationCategory: 'rural' | 'city' | 'near_shore' | null;
  ViewType: 'city' | 'mountain' | 'rural' | 'sea' | null;

  ListingId: string;
  ListingType: string;
  ListingDescription: string | null;
  AvailableFrom: string;
  ListingCapacity: number | null;
  Currency: number;
  SalePrice: number | null;
  RentPrice: number | null;
  BasePrice?: number | null;
  MinPrice?: number | null;
  MaxPrice?: number | null;
  LongStayDiscountEnabled?: boolean | null;
  LongStayMinDays?: number | null;
  LongStayDiscountPercentage?: number | null;
  HasCommonExpenses: boolean;
  CommonExpensesValue: number | null;
  IsElectricityIncluded: boolean | null;
  IsWaterIncluded: boolean | null;
  IsPriceVisible: boolean;
  Status: number;
  IsActive: boolean;
  IsPropertyVisible: boolean;
  IsFeatured: boolean;
  BlockedForBooking: boolean;
  Title: string | null;

  MinStayDays: number | null;
  MaxStayDays: number | null;
  LeadTimeDays: number | null;
  BufferDays: number | null;

  AmenityNames: string[] | null;
  Amenities?: unknown;
  Policies?: unknown;
  ContentSections?: unknown;
  SectionData?: unknown;
  /** Featured image from list/featured RPC (null when no photos). */
  MainImageUrl?: string | null;
  MainImageAltText?: string | null;
  /** Full gallery from detail RPC (absent on list/featured endpoints). */
  Images?: unknown;
}

/**
 * PascalCase row from get_public_event_venue_properties /
 * get_public_featured_event_venue_properties (and detail-by-id with optional gallery fields).
 */
export interface PublicEventVenueListRow {
  EstatePropertyId: string;
  ListingId?: string;
  OwnerId: string | null;
  Neighborhood: string | null;
  City: string | null;
  State: string | null;
  Country: string | null;
  LocationLatitude: number;
  LocationLongitude: number;
  Bedrooms: number;
  Bathrooms: number;
  Capacity: number | null;
  ListingCapacity: number | null;
  Title: string | null;
  ListingDescription: string | null;
  Currency: number;
  RentPrice: number | null;
  SalePrice: number | null;
  BasePrice?: number | null;
  MinPrice?: number | null;
  MaxPrice?: number | null;
  LongStayDiscountEnabled?: boolean | null;
  LongStayMinDays?: number | null;
  LongStayDiscountPercentage?: number | null;
  IsActive: boolean;
  IsPropertyVisible: boolean;
  BlockedForBooking: boolean;
  AmenityNames: string[] | null;
  Amenities?: unknown;
  Policies?: unknown;
  MaxGuests: number | null;
  HasCatering: boolean | null;
  HasSoundSystem: boolean | null;
  ClosingHour: string | null;
  AllowedEventsDescription: string | null;
  ContentSections?: unknown;
  SectionData?: unknown;
  /** Featured image from list/featured RPC (null when no photos). */
  MainImageUrl?: string | null;
  MainImageAltText?: string | null;
  /** Full gallery from detail RPC (absent on list/featured endpoints). */
  Images?: unknown;
}

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
  /** True when a verified Mercado Pago webhook set PaymentStatus = 1. Not booking Status. */
  mercadoPagoApproved?: boolean;
  mercadoPagoApprovedAt?: string | null;
  /** True when seller is connected, booking pending/confirmed, unpaid via MP, and amount > 0. */
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
  manageToken: string;
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
  /** Present when the edge function returned a non-2xx (e.g. 401 expired token). */
  httpStatus?: number;
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
