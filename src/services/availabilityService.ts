import { supabase } from '../lib/supabase';
import type { DateAvailability, PropertyBookingRules } from '../types';

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
export function transformAvailabilityData(data: any[]): DateAvailability[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(item => ({
    date: item.date,
    status: item.is_available ? 'available' : 'blocked' as const
  }));
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

/**
 * Validate date selection according to booking rules
 */
export function validateDateSelection(
  checkIn: Date | null,
  checkOut: Date | null,
  blockedDates: Set<string>,
  rules: PropertyBookingRules = {}
): { isValid: boolean; error?: string } {
  // Must have both dates selected
  if (!checkIn || !checkOut) {
    return { isValid: false, error: 'Both check-in and check-out dates are required' };
  }

  // Check-in must be before check-out
  if (checkIn >= checkOut) {
    return { isValid: false, error: 'Check-out date must be after check-in date' };
  }

  // Convert dates to YYYY-MM-DD strings for comparison
  const checkInStr = checkIn.toISOString().split('T')[0];
  const checkOutStr = checkOut.toISOString().split('T')[0];

  // Check-in date cannot be blocked
  if (blockedDates.has(checkInStr)) {
    return { isValid: false, error: 'Selected check-in date is not available' };
  }

  // Check-out date cannot be blocked
  if (blockedDates.has(checkOutStr)) {
    return { isValid: false, error: 'Selected check-out date is not available' };
  }

  // Check that no dates in the range are blocked
  const current = new Date(checkIn);
  const end = new Date(checkOut);

  while (current < end) {
    const dateStr = current.toISOString().split('T')[0];
    if (blockedDates.has(dateStr)) {
      return { isValid: false, error: 'Selected date range contains unavailable dates' };
    }
    current.setDate(current.getDate() + 1);
  }

  // Calculate number of nights
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  // Check minimum stay requirement
  if (rules.minStayDays && nights < rules.minStayDays) {
    return {
      isValid: false,
      error: `Minimum stay is ${rules.minStayDays} nights`
    };
  }

  // Check maximum stay requirement
  if (rules.maxStayDays && nights > rules.maxStayDays) {
    return {
      isValid: false,
      error: `Maximum stay is ${rules.maxStayDays} nights`
    };
  }

  // Check lead time requirement
  if (rules.leadTimeDays) {
    const earliestAllowed = new Date();
    earliestAllowed.setDate(earliestAllowed.getDate() + rules.leadTimeDays);

    if (checkIn < earliestAllowed) {
      return {
        isValid: false,
        error: `Bookings must be made at least ${rules.leadTimeDays} days in advance`
      };
    }
  }

  return { isValid: true };
}

/**
 * Calculate the earliest available date based on lead time
 */
export function getEarliestAvailableDate(leadTimeDays?: number): Date {
  const date = new Date();
  if (leadTimeDays && leadTimeDays > 0) {
    date.setDate(date.getDate() + leadTimeDays);
  }
  return date;
}