export * from '../core/models';

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
  fullName: string;
  email?: string;
  phone: string;
  documentId?: string;
}

export interface GuestBookingConfirmation {
  success: boolean;
  bookingId?: string;
  reservationCode?: string;
  manageToken?: string;
  manageUrl?: string;
  error?: string;
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
