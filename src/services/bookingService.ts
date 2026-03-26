import { supabase } from '../lib/supabase';
import type {
  Booking,
  BookingHold,
  GuestBookingConfirmation,
  GuestBookingProfile,
  ManageBookingView,
  Property,
  User
} from '../types';
import { getPropertyById } from './propertyService';

export interface CreateBookingParams {
  propertyId: string;
  memberId?: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  notes?: string;
}

export interface BookingResponse {
  success: boolean;
  booking?: Booking;
  error?: string;
  status: 'pending_confirmation' | 'confirmed';
}

export interface CancelBookingParams {
  bookingId: string;
  reason?: string;
  cancelledBy: 'guest' | 'owner' | 'system';
}

export interface CancelBookingResponse {
  success: boolean;
  error?: string;
}

export interface CreateBookingHoldParams {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
  blockedCheckOut?: Date;
  guests: number;
  estimatedGuests?: number;
  ipHash?: string;
  idempotencyKey?: string;
}

export interface BookingHoldResponse {
  success: boolean;
  hold?: BookingHold;
  validation?: Record<string, unknown>;
  error?: string;
}

export interface OtpResponse {
  success: boolean;
  error?: string;
}

export interface ReservationLookupData {
  bookingId: string;
  reservationCode: string;
  propertyId: string;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  status: string;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  canCancel: boolean;
  isExpired: boolean;
}

export interface ReservationLookupResponse {
  success: boolean;
  reservation?: ReservationLookupData;
  error?: string;
}

export interface ConfirmGuestBookingParams {
  holdId: string;
  profile: GuestBookingProfile & { totalPrice?: number };
}

const RESERVATION_CODE_PATTERN = /^RSV-[A-Z0-9]{6}$/;

export function normalizeReservationCode(code: string): string | null {
  const normalized = code.trim().toUpperCase();
  return RESERVATION_CODE_PATTERN.test(normalized) ? normalized : null;
}

function mapHoldRow(row: Record<string, unknown>): BookingHold {
  return {
    id: String(row.id),
    propertyId: String(row.property_id),
    checkIn: String(row.check_in),
    checkOut: String(row.check_out),
    guests: Number(row.guests),
    status: row.status as BookingHold['status'],
    expiresAt: String(row.expires_at),
    otpVerifiedAt: (row.otp_verified_at as string | null | undefined) ?? null,
  };
}

/**
 * Cancel a booking by Id.
 *
 * This function is intentionally implemented as a placeholder so that
 * database changes can be applied manually by the developer.
 *
 * Intended behavior (to be wired via Supabase RPC or edge function):
 * - Validate that the booking exists, is not deleted, and belongs to the caller (if guest).
 * - Ensure status is in a cancellable state (e.g. pending_confirmation or confirmed).
 * - Update Bookings.Status to the integer value that maps to 'cancelled'.
 * - Optionally persist `reason` and `cancelledBy` in audit columns or a separate table.
 */
export async function cancelBooking(params: CancelBookingParams): Promise<CancelBookingResponse> {
  const { bookingId } = params;

  if (!bookingId) {
    return {
      success: false,
      error: 'Missing bookingId',
    };
  }

  try {
    // TODO: replace this with a call to a Supabase RPC or edge function
    // Example (RPC):
    // const { error } = await supabase.rpc('rpc_cancel_booking', {
    //   p_booking_id: bookingId,
    //   p_reason: params.reason ?? null,
    //   p_cancelled_by: params.cancelledBy,
    // });
    //
    // if (error) {
    //   console.error('Error cancelling booking via RPC:', error);
    //   return { success: false, error: 'Failed to cancel booking. Please try again.' };
    // }

    console.warn(
      '[cancelBooking] Placeholder implementation called. Backend RPC/edge function is not yet wired.'
    );

    // For now, pretend the operation failed so the UI does not mislead users
    return {
      success: false,
      error: 'Cancel booking is not yet available. Please try again later.',
    };
  } catch (error) {
    console.error('Unexpected error in cancelBooking placeholder:', error);
    return {
      success: false,
      error: 'Failed to cancel booking. Please try again.',
    };
  }
}

export async function createBookingHold(params: CreateBookingHoldParams): Promise<BookingHoldResponse> {
  try {
    const { data, error } = await supabase.rpc('create_booking_hold', {
      p_property_id: params.propertyId,
      p_check_in: params.checkIn.toISOString().split('T')[0],
      p_check_out: (params.blockedCheckOut ?? params.checkOut).toISOString().split('T')[0],
      p_visible_check_out: params.checkOut.toISOString().split('T')[0],
      p_guests: params.guests,
      p_estimated_guests: params.estimatedGuests ?? null,
      p_ip_hash: params.ipHash ?? null,
      p_idempotency_key: params.idempotencyKey ?? null,
    });

    if (error) {
      console.error('Error creating booking hold:', error);
      return { success: false, error: 'Failed to create hold. Please try again.' };
    }

    const payload = data as Record<string, unknown> | null;
    if (!payload?.success) {
      return {
        success: false,
        error: (payload?.error as string | undefined) ?? 'Unable to hold selected dates',
        validation: (payload?.validation as Record<string, unknown> | undefined),
      };
    }

    const { data: holdRow, error: holdError } = await supabase
      .from('booking_holds')
      .select('id, property_id, check_in, check_out, guests, status, expires_at, otp_verified_at')
      .eq('id', ((payload.hold as Record<string, unknown> | undefined)?.id as string | undefined) ?? '')
      .single();

    if (holdError || !holdRow) {
      return { success: false, error: 'Hold created but could not be loaded.' };
    }

    return {
      success: true,
      hold: mapHoldRow(holdRow),
      validation: (payload?.validation as Record<string, unknown> | undefined),
    };
  } catch (error) {
    console.error('Unexpected error creating booking hold:', error);
    return { success: false, error: 'Failed to create hold. Please try again.' };
  }
}

export async function sendGuestOtp(holdId: string, phone: string): Promise<OtpResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('booking-send-otp', {
      body: { holdId, phone },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const payload = data as Record<string, unknown> | null;
    return { success: Boolean(payload?.success), error: payload?.error as string | undefined };
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return { success: false, error: 'Failed to send OTP.' };
  }
}

export async function verifyGuestOtp(holdId: string, phone: string, code: string): Promise<OtpResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('booking-verify-otp', {
      body: { holdId, phone, code },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const payload = data as Record<string, unknown> | null;
    return { success: Boolean(payload?.success), error: payload?.error as string | undefined };
  } catch (error) {
    console.error('Failed to verify OTP:', error);
    return { success: false, error: 'Failed to verify OTP.' };
  }
}

export async function reconfirmHold(holdId: string): Promise<BookingHoldResponse> {
  try {
    const { data, error } = await supabase.rpc('reconfirm_booking_hold', {
      p_hold_id: holdId,
    });

    if (error) {
      return { success: false, error: 'Failed to revalidate hold.' };
    }

    const payload = data as Record<string, unknown> | null;
    if (!payload?.success) {
      return { success: false, error: (payload?.error as string | undefined) ?? 'Hold is no longer valid.' };
    }

    const hold = payload?.hold as Record<string, unknown> | undefined;

    return {
      success: true,
      hold: {
        id: String(hold?.id),
        propertyId: String(hold?.property_id),
        checkIn: String(hold?.check_in),
        checkOut: String(hold?.check_out),
        guests: Number(hold?.guests),
        status: 'pending',
        expiresAt: String(hold?.expires_at),
      },
    };
  } catch (error) {
    console.error('Failed to reconfirm hold:', error);
    return { success: false, error: 'Failed to revalidate hold.' };
  }
}

export async function confirmGuestBooking(params: ConfirmGuestBookingParams): Promise<GuestBookingConfirmation> {
  try {
    const { data, error } = await supabase.rpc('confirm_booking_from_hold', {
      p_hold_id: params.holdId,
      p_guest_payload: {
        fullName: params.profile.fullName,
        email: params.profile.email ?? null,
        phone: params.profile.phone,
        documentId: params.profile.documentId ?? null,
        estimatedGuests: params.profile.estimatedGuests ?? null,
        totalPrice: params.profile.totalPrice ?? null,
      },
    });

    if (error) {
      return { success: false, error: 'Failed to confirm booking.' };
    }

    const payload = data as Record<string, unknown> | null;
    if (!payload?.success) {
      return { success: false, error: (payload?.error as string | undefined) ?? 'Could not confirm booking.' };
    }

    return {
      success: true,
      bookingId: payload.booking_id as string | undefined,
      reservationCode: payload.reservation_code as string | undefined,
      manageToken: payload.manage_token as string | undefined,
    };
  } catch (error) {
    console.error('Failed to confirm guest booking:', error);
    return { success: false, error: 'Failed to confirm booking.' };
  }
}

export async function getBookingByManageToken(token: string): Promise<{ success: boolean; booking?: ManageBookingView; error?: string; }> {
  try {
    const { data, error } = await supabase.rpc('get_booking_by_manage_token', { p_token: token });
    if (error) {
      return { success: false, error: 'Failed to load reservation.' };
    }

    const payload = data as Record<string, unknown> | null;
    if (!payload?.success || !payload?.booking) {
      return { success: false, error: (payload?.error as string | undefined) ?? 'Invalid or expired token.' };
    }

    return { success: true, booking: payload.booking as ManageBookingView };
  } catch (error) {
    console.error('Failed to get booking by token:', error);
    return { success: false, error: 'Failed to load reservation.' };
  }
}

export async function cancelBookingByManageToken(token: string, reason?: string): Promise<CancelBookingResponse> {
  try {
    const { data, error } = await supabase.rpc('cancel_booking_by_manage_token', {
      p_token: token,
      p_reason: reason ?? null,
    });
    if (error) {
      return { success: false, error: 'Failed to cancel reservation.' };
    }

    const payload = data as Record<string, unknown> | null;
    return {
      success: Boolean(payload?.success),
      error: payload?.success ? undefined : (payload?.error as string | undefined) ?? 'Could not cancel reservation.',
    };
  } catch (error) {
    console.error('Failed to cancel booking by token:', error);
    return { success: false, error: 'Failed to cancel reservation.' };
  }
}

export async function getReservationByCode(reservationCode: string): Promise<ReservationLookupResponse> {
  const normalizedCode = normalizeReservationCode(reservationCode);
  if (!normalizedCode) {
    return { success: false, error: 'Invalid reservation code format.' };
  }

  try {
    const { data, error } = await supabase.rpc('get_reservation_by_code', {
      reservation_code: normalizedCode,
    });

    if (error) {
      return { success: false, error: 'Failed to load reservation.' };
    }

    const payload = data as Record<string, unknown> | null;
    if (!payload?.success || !payload?.reservation) {
      return {
        success: false,
        error: (payload?.error as string | undefined) ?? 'Reservation not found.',
      };
    }

    return {
      success: true,
      reservation: payload.reservation as ReservationLookupData,
    };
  } catch (serviceError) {
    console.error('Failed to get reservation by code:', serviceError);
    return { success: false, error: 'Failed to load reservation.' };
  }
}

export async function cancelReservation(reservationId: string): Promise<CancelBookingResponse> {
  if (!reservationId) {
    return { success: false, error: 'Missing reservation id.' };
  }

  try {
    const { data, error } = await supabase.rpc('cancel_reservation', {
      reservation_id: reservationId,
    });

    if (error) {
      return { success: false, error: 'Failed to cancel reservation.' };
    }

    const payload = data as Record<string, unknown> | null;
    return {
      success: Boolean(payload?.success),
      error: payload?.success ? undefined : (payload?.error as string | undefined) ?? 'Could not cancel reservation.',
    };
  } catch (serviceError) {
    console.error('Failed to cancel reservation:', serviceError);
    return { success: false, error: 'Failed to cancel reservation.' };
  }
}

interface DbBookingRow {
  Id: string;
  EstatePropertyId: string;
  GuestId: string | null;
  CheckInDate: string;
  CheckOutDate: string;
  GuestCount: number;
  TotalAmount: number | null;
  Status: number;
  PaymentStatus?: number;
  Created: string;
  IsDeleted: boolean;
}

/**
 * Check if a property has active calendar integrations
 */
export async function checkPropertyHasCalendarSync(propertyId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('CalendarIntegrations')
      .select('Id')
      .eq('EstatePropertyId', propertyId)
      .eq('IsActive', true)
      .eq('IsDeleted', false)
      .limit(1);

    if (error) {
      console.error('Error checking calendar integrations:', error);
      // On error, assume no calendar sync to avoid blocking bookings
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Failed to check calendar integrations:', error);
    return false;
  }
}

/**
 * Create a new booking with appropriate status based on calendar sync
 */
export async function createBooking(params: CreateBookingParams): Promise<BookingResponse> {
  const { propertyId, memberId, checkIn, checkOut, guests, totalPrice, notes } = params;

  try {
    // Check if property has calendar sync
    const hasCalendarSync = await checkPropertyHasCalendarSync(propertyId);

    // Determine booking status
    const status = hasCalendarSync ? 0 : 1; // 0 = pending_confirmation, 1 = confirmed
    const statusText = hasCalendarSync ? 'pending_confirmation' : 'confirmed';

    // Insert booking into database
    const { data: bookingData, error } = await supabase
      .from('Bookings')
      .insert({
        EstatePropertyId: propertyId,
        GuestId: memberId ?? null,
        CheckInDate: checkIn.toISOString(),
        CheckOutDate: checkOut.toISOString(),
        GuestCount: guests,
        TotalAmount: totalPrice,
        Notes: notes,
        Status: status,
        Created: new Date().toISOString(),
        CreatedBy: memberId ?? null,
        LastModified: new Date().toISOString(),
        LastModifiedBy: memberId ?? null,
        IsDeleted: false
      })
      .select(
        'Id,EstatePropertyId,GuestId,CheckInDate,CheckOutDate,GuestCount,TotalAmount,Status,PaymentStatus,Created,IsDeleted'
      )
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      return {
        success: false,
        error: 'Failed to create booking. Please try again.',
        status: statusText
      };
    }

    if (!bookingData) {
      return {
        success: false,
        error: 'Failed to create booking. Please try again.',
        status: statusText
      };
    }

    const insertedRow = bookingData as DbBookingRow;

    const property = await getPropertyById(insertedRow.EstatePropertyId);

    if (!property) {
      return {
        success: false,
        error: 'Failed to fetch booking details.',
        status: statusText,
      };
    }

    const bookingUser: User = {
      id: insertedRow.GuestId ?? '',
      name: '',
      email: '',
      verified: true,
    };

    const booking: Booking = {
      id: insertedRow.Id,
      property,
      user: bookingUser,
      checkIn: insertedRow.CheckInDate,
      checkOut: insertedRow.CheckOutDate,
      guests: insertedRow.GuestCount,
      totalPrice: insertedRow.TotalAmount ?? 0,
      status: statusText as Booking['status'],
      paymentStatus: insertedRow.PaymentStatus,
      createdAt: insertedRow.Created,
    };

    // If booking is confirmed, send confirmation email (if enabled)
    if (status === 1) {
      try {
        const sendEmailsEnabled = import.meta.env.VITE_SEND_EMAILS_ENABLED === 'true';

        if (sendEmailsEnabled) {
          // Call email function asynchronously (don't wait for it)
          supabase.functions.invoke('send-booking-confirmation', {
            body: { bookingId: booking.id }
          }).catch(emailError => {
            console.error('Failed to send confirmation email:', emailError);
            // Don't fail the booking if email fails
          });
        }
      } catch (emailError) {
        console.error('Error triggering confirmation email:', emailError);
        // Don't fail the booking if email fails
      }
    }

    return {
      success: true,
      booking,
      status: statusText
    };

  } catch (error) {
    console.error('Failed to create booking:', error);
    return {
      success: false,
      error: 'Failed to create booking. Please try again.',
      status: 'confirmed' // fallback
    };
  }
}

/**
 * Get booking details by ID
 */
export async function getBookingById(bookingId: string): Promise<Booking | null> {
  try {
    const { data, error } = await supabase
      .from('Bookings')
      .select(
        'Id,EstatePropertyId,GuestId,CheckInDate,CheckOutDate,GuestCount,TotalAmount,Status,PaymentStatus,Created,IsDeleted'
      )
      .eq('Id', bookingId)
      .eq('IsDeleted', false)
      .single();

    if (error) {
      console.error('Error fetching booking:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    const row = data as DbBookingRow;

    const property = await getPropertyById(row.EstatePropertyId);

    if (!property) {
      return null;
    }

    const statusMap: { [key: number]: Booking['status'] } = {
      0: 'pending_confirmation',
      1: 'confirmed',
      2: 'cancelled',
      3: 'completed',
    };

    const bookingUser: User = {
      id: row.GuestId ?? '',
      name: '',
      email: '',
      verified: true,
    };

    return {
      id: row.Id,
      property,
      user: bookingUser,
      checkIn: row.CheckInDate,
      checkOut: row.CheckOutDate,
      guests: row.GuestCount,
      totalPrice: row.TotalAmount ?? 0,
      status: statusMap[row.Status] || 'confirmed',
      paymentStatus: row.PaymentStatus,
      createdAt: row.Created,
    };

  } catch (error) {
    console.error('Failed to fetch booking:', error);
    return null;
  }
}

/**
 * Get all bookings for a member (linked via GuestId)
 */
export async function getUserBookings(memberId: string): Promise<Booking[]> {
  try {
    const { data, error } = await supabase
      .from('Bookings')
      .select(
        'Id,EstatePropertyId,GuestId,CheckInDate,CheckOutDate,GuestCount,TotalAmount,Status,PaymentStatus,Created,IsDeleted'
      )
      .eq('GuestId', memberId)
      .eq('IsDeleted', false)
      .order('Created', { ascending: false });

    if (error) {
      console.error('Error fetching user bookings for member', memberId, error);
      return [];
    }

    if (!data) {
      return [];
    }

    const rows = (data ?? []) as DbBookingRow[];

    if (rows.length === 0) {
      return [];
    }

    const statusMap: { [key: number]: Booking['status'] } = {
      0: 'pending_confirmation',
      1: 'confirmed',
      2: 'cancelled',
      3: 'completed',
    };

    const hydrated = await Promise.all(
      rows.map(async (row) => {
        try {
          const property: Property | null = await getPropertyById(row.EstatePropertyId);

          if (!property) {
            console.error(
              'Property not found for booking',
              row.Id,
              'with EstatePropertyId',
              row.EstatePropertyId
            );
            return null;
          }

          const user: User = {
            id: row.GuestId ?? '',
            name: '',
            email: '',
            verified: true,
          };

          const booking: Booking = {
            id: row.Id,
            property,
            user,
            checkIn: row.CheckInDate,
            checkOut: row.CheckOutDate,
            guests: row.GuestCount,
            totalPrice: row.TotalAmount ?? 0,
            status: statusMap[row.Status] || 'confirmed',
            paymentStatus: row.PaymentStatus,
            createdAt: row.Created,
          };

          return booking;
        } catch (err) {
          console.error(
            'Error hydrating booking property for booking',
            row.Id,
            'with EstatePropertyId',
            row.EstatePropertyId,
            err
          );
          return null;
        }
      })
    );

    return hydrated.filter((b): b is Booking => b !== null);

  } catch (error) {
    console.error('Failed to fetch user bookings:', error);
    return [];
  }
}

/**
 * Get the count of a member's bookings (non-deleted)
 */
export async function getUserBookingsCount(memberId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('Bookings')
      .select('Id', { count: 'exact', head: true })
      .eq('GuestId', memberId)
      .eq('IsDeleted', false);

    if (error) {
      console.error('Error fetching user bookings count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Failed to fetch user bookings count:', error);
    return 0;
  }
}