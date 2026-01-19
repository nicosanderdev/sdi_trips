import { supabase } from '../lib/supabase';
import type { Booking } from '../types';

export interface CreateBookingParams {
  propertyId: string;
  userId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
}

export interface BookingResponse {
  success: boolean;
  booking?: Booking;
  error?: string;
  status: 'pending_confirmation' | 'confirmed';
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
  const { propertyId, userId, checkIn, checkOut, guests, totalPrice } = params;

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
        MemberId: userId,
        CheckInDate: checkIn.toISOString(),
        CheckOutDate: checkOut.toISOString(),
        NumberOfGuests: guests,
        TotalPrice: totalPrice,
        Status: status,
        Created: new Date().toISOString(),
        CreatedBy: userId,
        LastModified: new Date().toISOString(),
        LastModifiedBy: userId,
        IsDeleted: false
      })
      .select(`
        Id,
        CheckInDate,
        CheckOutDate,
        NumberOfGuests,
        TotalPrice,
        Status,
        Created,
        EstateProperties!inner (
          Id,
          Title,
          StreetName,
          HouseNumber,
          Neighborhood,
          City,
          State,
          LocationLatitude,
          LocationLongitude,
          RentPrice,
          SalePrice,
          Currency,
          Bedrooms,
          Bathrooms,
          MaxGuests,
          Description,
          Amenities,
          Rating,
          ReviewCount,
          Owners:Members (
            Id,
            FirstName,
            LastName,
            Email,
            AvatarUrl,
            Title
          )
        ),
        Members!inner (
          Id,
          FirstName,
          LastName,
          Email,
          AvatarUrl,
          Title
        )
      `)
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

    // Transform database response to Booking type
    const property = bookingData.EstateProperties as any;
    const user = bookingData.Members as any;

    if (!property || !user) {
      return {
        success: false,
        error: 'Failed to fetch booking details.',
        status: statusText
      };
    }

    const location = [
      property.StreetName,
      property.HouseNumber,
      property.Neighborhood,
      property.City,
      property.State
    ].filter(Boolean).join(', ');

    const booking: Booking = {
      id: bookingData.Id,
      property: {
        id: property.Id,
        title: property.Title,
        location: location || 'Location not specified',
        price: property.RentPrice || property.SalePrice || 0,
        currency: 'USD', // TODO: Map currency from database
        images: [], // TODO: Implement image fetching
        bedrooms: property.Bedrooms,
        bathrooms: property.Bathrooms,
        maxGuests: property.MaxGuests || property.Bedrooms * 2,
        description: property.Description || '',
        amenities: [], // TODO: Implement amenities fetching
        rating: property.Rating || 4.5,
        reviewCount: property.ReviewCount || 0,
        host: {
          id: property.Owners?.Id || '',
          name: `${property.Owners?.FirstName || ''} ${property.Owners?.LastName || ''}`.trim() || 'Host',
          email: property.Owners?.Email || '',
          avatar: property.Owners?.AvatarUrl || undefined,
          verified: true, // TODO: Implement verification status
        },
        available: true,
        coordinates: {
          lat: property.LocationLatitude,
          lng: property.LocationLongitude,
        },
      },
      user: {
        id: user.Id,
        name: `${user.FirstName || ''} ${user.LastName || ''}`.trim() || 'User',
        email: user.Email || '',
        avatar: user.AvatarUrl || undefined,
        verified: true, // TODO: Implement verification status
      },
      checkIn: bookingData.CheckInDate,
      checkOut: bookingData.CheckOutDate,
      guests: bookingData.NumberOfGuests,
      totalPrice: bookingData.TotalPrice,
      status: statusText as Booking['status'],
      createdAt: bookingData.Created,
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
      .select(`
        Id,
        CheckInDate,
        CheckOutDate,
        NumberOfGuests,
        TotalPrice,
        Status,
        Created,
        EstateProperties!inner (
          Id,
          Title,
          StreetName,
          HouseNumber,
          Neighborhood,
          City,
          State,
          LocationLatitude,
          LocationLongitude,
          RentPrice,
          SalePrice,
          Currency,
          Bedrooms,
          Bathrooms,
          MaxGuests,
          Description,
          Amenities,
          Rating,
          ReviewCount,
          Owners:Members (
            Id,
            FirstName,
            LastName,
            Email,
            AvatarUrl,
            Title
          )
        ),
        Members!inner (
          Id,
          FirstName,
          LastName,
          Email,
          AvatarUrl,
          Title
        )
      `)
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

    // Transform to Booking type (similar to createBooking)
    const property = data.EstateProperties as any;
    const user = data.Members as any;

    if (!property || !user) {
      return null;
    }

    const location = [
      property.StreetName,
      property.HouseNumber,
      property.Neighborhood,
      property.City,
      property.State
    ].filter(Boolean).join(', ');

    // Map status number to string
    const statusMap: { [key: number]: Booking['status'] } = {
      0: 'pending_confirmation',
      1: 'confirmed',
      2: 'cancelled',
      3: 'completed'
    };

    return {
      id: data.Id,
      property: {
        id: property.Id,
        title: property.Title,
        location: location || 'Location not specified',
        price: property.RentPrice || property.SalePrice || 0,
        currency: 'USD', // TODO: Map currency from database
        images: [], // TODO: Implement image fetching
        bedrooms: property.Bedrooms,
        bathrooms: property.Bathrooms,
        maxGuests: property.MaxGuests || property.Bedrooms * 2,
        description: property.Description || '',
        amenities: [], // TODO: Implement amenities fetching
        rating: property.Rating || 4.5,
        reviewCount: property.ReviewCount || 0,
        host: {
          id: property.Owners?.[0]?.Id || '',
          name: `${property.Owners?.[0]?.FirstName || ''} ${property.Owners?.[0]?.LastName || ''}`.trim() || 'Host',
          email: property.Owners?.[0]?.Email || '',
          avatar: property.Owners?.[0]?.AvatarUrl || undefined,
          verified: true, // TODO: Implement verification status
        },
        available: true,
        coordinates: {
          lat: property.LocationLatitude,
          lng: property.LocationLongitude,
        },
      },
      user: {
        id: user.Id,
        name: `${user.FirstName || ''} ${user.LastName || ''}`.trim() || 'User',
        email: user.Email || '',
        avatar: user.AvatarUrl || undefined,
        verified: true, // TODO: Implement verification status
      },
      checkIn: data.CheckInDate,
      checkOut: data.CheckOutDate,
      guests: data.NumberOfGuests,
      totalPrice: data.TotalPrice,
      status: statusMap[data.Status] || ('confirmed' as Booking['status']),
      createdAt: data.Created,
    };

  } catch (error) {
    console.error('Failed to fetch booking:', error);
    return null;
  }
}

/**
 * Get all bookings for a user
 */
export async function getUserBookings(userId: string): Promise<Booking[]> {
  try {
    const { data, error } = await supabase
      .from('Bookings')
      .select(`
        Id,
        CheckInDate,
        CheckOutDate,
        NumberOfGuests,
        TotalPrice,
        Status,
        Created,
        EstateProperties!inner (
          Id,
          Title,
          StreetName,
          HouseNumber,
          Neighborhood,
          City,
          State,
          LocationLatitude,
          LocationLongitude,
          RentPrice,
          SalePrice,
          Currency,
          Bedrooms,
          Bathrooms,
          MaxGuests,
          Description,
          Amenities,
          Rating,
          ReviewCount,
          Owners:Members (
            Id,
            FirstName,
            LastName,
            Email,
            AvatarUrl,
            Title
          )
        ),
        Members!inner (
          Id,
          FirstName,
          LastName,
          Email,
          AvatarUrl,
          Title
        )
      `)
      .eq('MemberId', userId)
      .eq('IsDeleted', false)
      .order('Created', { ascending: false });

    if (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Transform to Booking array
    const bookings: Booking[] = [];

    for (const bookingData of data) {
      const property = bookingData.EstateProperties as any;
      const user = bookingData.Members as any;

      if (!property || !user) {
        continue; // Skip invalid data
      }

      const location = [
        property.StreetName,
        property.HouseNumber,
        property.Neighborhood,
        property.City,
        property.State
      ].filter(Boolean).join(', ');

      // Map status number to string
      const statusMap: { [key: number]: Booking['status'] } = {
        0: 'pending_confirmation',
        1: 'confirmed',
        2: 'cancelled',
        3: 'completed'
      };

      bookings.push({
        id: bookingData.Id,
        property: {
          id: property.Id,
          title: property.Title,
          location: location || 'Location not specified',
          price: property.RentPrice || property.SalePrice || 0,
          currency: 'USD', // TODO: Map currency from database
          images: [], // TODO: Implement image fetching
          bedrooms: property.Bedrooms,
          bathrooms: property.Bathrooms,
          maxGuests: property.MaxGuests || property.Bedrooms * 2,
          description: property.Description || '',
          amenities: [], // TODO: Implement amenities fetching
          rating: property.Rating || 4.5,
          reviewCount: property.ReviewCount || 0,
          host: {
            id: property.Owners?.[0]?.Id || '',
            name: `${property.Owners?.[0]?.FirstName || ''} ${property.Owners?.[0]?.LastName || ''}`.trim() || 'Host',
            email: property.Owners?.[0]?.Email || '',
            avatar: property.Owners?.[0]?.AvatarUrl || undefined,
            verified: true, // TODO: Implement verification status
          },
          available: true,
          coordinates: {
            lat: property.LocationLatitude,
            lng: property.LocationLongitude,
          },
        },
        user: {
          id: user.Id,
          name: `${user.FirstName || ''} ${user.LastName || ''}`.trim() || 'User',
          email: user.Email || '',
          avatar: user.AvatarUrl || undefined,
          verified: true, // TODO: Implement verification status
        },
        checkIn: bookingData.CheckInDate,
        checkOut: bookingData.CheckOutDate,
        guests: bookingData.NumberOfGuests,
        totalPrice: bookingData.TotalPrice,
        status: statusMap[bookingData.Status] || ('confirmed' as Booking['status']),
        createdAt: bookingData.Created,
      });
    }

    return bookings;

  } catch (error) {
    console.error('Failed to fetch user bookings:', error);
    return [];
  }
}