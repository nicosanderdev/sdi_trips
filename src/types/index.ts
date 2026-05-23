export * from '../core/models';
export * from './guestReviewContract';
import type { GuestSiteListingType } from './guestReviewContract';

export interface BookingSelectionValidation {
  isValid: boolean;
  errors: string[];
  pricing?: {
    nightly_price?: number;
    nights?: number;
    total_price?: number;
  };
  normalized_rules?: {
    min_stay_days?: number;
    max_stay_days?: number;
    lead_time_days?: number;
    buffer_days?: number;
    max_guests?: number;
  };
}

export interface BookingHold {
  id: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'expired' | 'released';
  expiresAt: string;
  otpVerifiedAt?: string | null;
}

export interface GuestBookingProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentId?: string;
  estimatedGuests?: number;
}

export interface GuestBookingConfirmation {
  success: boolean;
  bookingId?: string;
  reservationCode?: string;
  manageToken?: string;
  manageUrl?: string;
  guestId?: string;
  listingType?: GuestSiteListingType;
  error?: string;
}

/** Row shape for public.Guests (PascalCase DB columns). */
export interface Guest {
  Id: string;
  FirstName: string;
  LastName: string;
  Email: string;
  PhoneNumber: string;
  Created: string;
  LastModified: string;
}

export interface ManageBookingView {
  bookingId: string;
  reservationCode: string;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: string;
  canCancel: boolean;
}
