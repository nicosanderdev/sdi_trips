import { supabase } from '../lib/supabase';
import type { BookingSelectionValidation, DateAvailability, PropertyBookingRules } from '../types';

/**
 * Get property availability for a date range
 * Calls the Supabase RPC function and transforms the data
 */
export async function getPropertyAvailability(
  propertyId: string,
  startDate: Date,
  endDate: Date
): Promise<DateAvailability[]> {
  try {
    // Call the RPC function
    const { data, error } = await supabase.rpc('get_property_availability', {
      property_id: propertyId,
      start_date: startDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD
      end_date: endDate.toISOString().split('T')[0]
    });

    if (error) {
      console.error('Error fetching property availability:', error);
      throw error;
    }

    // Transform the data to frontend format
    return transformAvailabilityData(data);
  } catch (error) {
    console.error('Failed to get property availability:', error);
    throw error;
  }
}

/**
 * Transform raw availability data from Supabase to frontend format
 */
export function transformAvailabilityData(data: unknown[]): DateAvailability[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item) => {
    const row = item as { date?: string; is_available?: boolean };
    return {
      date: row.date ?? '',
      status: row.is_available ? 'available' : 'blocked' as const
    };
  });
}

/**
 * Get a set of blocked dates for quick lookup
 */
export function getBlockedDates(availability: DateAvailability[]): Set<string> {
  const blocked = new Set<string>();

  availability.forEach(item => {
    if (item.status === 'blocked') {
      blocked.add(item.date);
    }
  });

  return blocked;
}

/** How far ahead guests can select dates on the booking calendar. */
export const BOOKING_AVAILABILITY_MONTHS = 3;

export interface DateSelectionValidationResult {
  isValid: boolean;
  /** Relative key under `propertyDetail.bookingFlow`, e.g. `errors.minStayRequired`. */
  errorKey?: string;
  errorParams?: Record<string, unknown>;
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validate date selection according to booking rules
 */
export function validateDateSelection(
  checkIn: Date | null,
  checkOut: Date | null,
  blockedDates: Set<string>,
  rules: PropertyBookingRules = {}
): DateSelectionValidationResult {
  // Must have both dates selected
  if (!checkIn || !checkOut) {
    return { isValid: false, errorKey: 'errors.bothDatesRequired' };
  }

  // Check-in must be before check-out
  if (checkIn >= checkOut) {
    return { isValid: false, errorKey: 'errors.checkOutAfterCheckIn' };
  }

  const checkInStr = toLocalDateString(checkIn);
  const checkOutStr = toLocalDateString(checkOut);

  // Check-in date cannot be blocked
  if (blockedDates.has(checkInStr)) {
    return { isValid: false, errorKey: 'errors.dateUnavailable' };
  }

  // Check-out date cannot be blocked
  if (blockedDates.has(checkOutStr)) {
    return { isValid: false, errorKey: 'errors.dateUnavailable' };
  }

  // Check that no dates in the range are blocked
  const current = startOfLocalDay(checkIn);
  const end = startOfLocalDay(checkOut);

  while (current < end) {
    const dateStr = toLocalDateString(current);
    if (blockedDates.has(dateStr)) {
      return { isValid: false, errorKey: 'errors.rangeUnavailable' };
    }
    current.setDate(current.getDate() + 1);
  }

  // Calculate number of nights
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  // Check minimum stay requirement
  if (rules.minStayDays && nights < rules.minStayDays) {
    return {
      isValid: false,
      errorKey: 'errors.minStayRequired',
      errorParams: { count: rules.minStayDays },
    };
  }

  // Check maximum stay requirement
  if (rules.maxStayDays && nights > rules.maxStayDays) {
    return {
      isValid: false,
      errorKey: 'errors.maxStayExceeded',
      errorParams: { count: rules.maxStayDays },
    };
  }

  // Check lead time requirement (too soon / too close)
  if (rules.leadTimeDays && rules.leadTimeDays > 0) {
    const earliestAllowed = getEarliestAvailableDate(rules.leadTimeDays);
    if (startOfLocalDay(checkIn) < startOfLocalDay(earliestAllowed)) {
      return {
        isValid: false,
        errorKey: 'errors.leadTimeRequired',
        errorParams: { count: rules.leadTimeDays },
      };
    }
  }

  // Check booking horizon (too far / too late to select)
  const latestAllowed = getLatestBookableDate(rules.leadTimeDays);
  if (startOfLocalDay(checkIn) > startOfLocalDay(latestAllowed)) {
    return {
      isValid: false,
      errorKey: 'errors.datesTooFarAhead',
      errorParams: { count: BOOKING_AVAILABILITY_MONTHS },
    };
  }

  return { isValid: true };
}

/**
 * Calculate the earliest available date based on lead time
 */
export function getEarliestAvailableDate(leadTimeDays?: number): Date {
  const date = startOfLocalDay(new Date());
  if (leadTimeDays && leadTimeDays > 0) {
    date.setDate(date.getDate() + leadTimeDays);
  }
  return date;
}

/**
 * Latest date guests can book on the calendar (availability fetch horizon).
 */
export function getLatestBookableDate(leadTimeDays?: number): Date {
  const date = getEarliestAvailableDate(leadTimeDays);
  date.setMonth(date.getMonth() + BOOKING_AVAILABILITY_MONTHS);
  return date;
}

/**
 * Validate a booking selection against server-side rules and availability.
 */
export async function validateBookingSelection(
  propertyId: string,
  checkIn: Date,
  checkOut: Date,
  guests: number
): Promise<BookingSelectionValidation> {
  try {
    const { data, error } = await supabase.rpc('validate_booking_selection', {
      p_property_id: propertyId,
      p_check_in: checkIn.toISOString().split('T')[0],
      p_check_out: checkOut.toISOString().split('T')[0],
      p_guests: guests,
    });

    if (error) {
      console.error('Error validating booking selection:', error);
      return {
        isValid: false,
        errors: ['propertyDetail.bookingFlow.errors.invalidDateSelection'],
      };
    }

    const response = data as Record<string, unknown> | null;
    return {
      isValid: Boolean(response?.is_valid),
      errors: Array.isArray(response?.errors) ? (response.errors as string[]) : [],
      pricing: (response?.pricing as BookingSelectionValidation['pricing']) ?? undefined,
      normalized_rules: (response?.normalized_rules as BookingSelectionValidation['normalized_rules']) ?? undefined,
    };
  } catch (error) {
    console.error('Failed to validate booking selection:', error);
    return {
      isValid: false,
      errors: ['propertyDetail.bookingFlow.errors.invalidDateSelection'],
    };
  }
}