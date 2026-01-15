import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import type { Property } from '../types';

type DbProperty = Database['public']['Tables']['EstateProperties']['Row'];
type DbPropertyValue = Database['public']['Tables']['EstatePropertyValues']['Row'];
type DbAmenity = Database['public']['Tables']['Amenities']['Row'];
type DbMember = Database['public']['Tables']['Members']['Row'];

interface PropertyWithRelations extends DbProperty {
  EstatePropertyValues: DbPropertyValue[];
  EstatePropertyAmenity: Array<{
    AmenityId: string;
    Amenities: DbAmenity;
  }>;
  Owners?: DbMember | null;
}

export interface PropertyFilters {
  priceRange?: [number, number];
  bedrooms?: number;
  guests?: number;
  amenities?: string[];
  minRating?: number;
  location?: string;
  propertyType?: number;
}

export interface PropertySearchResult {
  properties: Property[];
  totalCount: number;
}

/**
 * Transform database property data to frontend Property type
 */
function transformProperty(dbProperty: PropertyWithRelations): Property {
  const propertyValue = dbProperty.EstatePropertyValues?.[0];
  if (!propertyValue) {
    throw new Error(`Property ${dbProperty.Id} has no property values`);
  }

  const amenities = dbProperty.EstatePropertyAmenity
    ?.map((epa: any) => epa.Amenities.Name) || [];

  const location = [
    dbProperty.StreetName,
    dbProperty.HouseNumber,
    dbProperty.Neighborhood,
    dbProperty.City,
    dbProperty.State
  ].filter(Boolean).join(', ');

  return {
    id: dbProperty.Id,
    title: dbProperty.Title,
    location: location || 'Location not specified',
    price: propertyValue.RentPrice || propertyValue.SalePrice || 0,
    currency: getCurrencyCode(propertyValue.Currency),
    images: [], // TODO: Implement image fetching
    bedrooms: dbProperty.Bedrooms,
    bathrooms: dbProperty.Bathrooms,
    maxGuests: propertyValue.Capacity || dbProperty.Bedrooms * 2,
    description: propertyValue.Description || '',
    amenities,
    rating: 4.5, // TODO: Implement real ratings
    reviewCount: 0, // TODO: Implement real reviews
    host: {
      id: dbProperty.Owners?.Id || dbProperty.OwnerId || '',
      name: `${dbProperty.Owners?.FirstName || ''} ${dbProperty.Owners?.LastName || ''}`.trim() || 'Host',
      email: dbProperty.Owners?.Email || '',
      avatar: dbProperty.Owners?.AvatarUrl || undefined,
      verified: true, // TODO: Implement verification status
    },
    available: propertyValue.IsActive && propertyValue.IsPropertyVisible,
    coordinates: {
      lat: dbProperty.LocationLatitude,
      lng: dbProperty.LocationLongitude,
    },
    minStayDays: dbProperty.MinStayDays || undefined,
    maxStayDays: dbProperty.MaxStayDays || undefined,
    leadTimeDays: dbProperty.LeadTimeDays || undefined,
    bufferDays: dbProperty.BufferDays || undefined,
  };
}

/**
 * Convert currency number to currency code
 */
function getCurrencyCode(_currencyNumber: number): string {
  // TODO: Map currency numbers to actual codes
  return 'USD';
}

/**
 * Get featured properties for landing page
 */
export async function getFeaturedProperties(limit: number = 6): Promise<Property[]> {
  const { data, error } = await supabase
    .from('EstateProperties')
    .select(`
      *,
      EstatePropertyValues!inner (
        *
      ),
      EstatePropertyAmenity (
        AmenityId,
        Amenities (*)
      ),
      Owners:Members (*)
    `)
    .eq('IsDeleted', false)
    .eq('EstatePropertyValues.IsDeleted', false)
    .eq('EstatePropertyValues.IsActive', true)
    .eq('EstatePropertyValues.IsPropertyVisible', true)
    .eq('EstatePropertyValues.IsFeatured', true)
    .limit(limit);

  if (error) {
    console.error('Error fetching featured properties:', error);
    throw error;
  }

  return data.map(transformProperty);
}

/**
 * Get all active properties
 */
export async function getProperties(limit?: number): Promise<Property[]> {
  let query = supabase
    .from('EstateProperties')
    .select(`
      *,
      EstatePropertyValues!inner (
        *
      ),
      EstatePropertyAmenity (
        AmenityId,
        Amenities (*)
      ),
      Owners:Members (*)
    `)
    .eq('IsDeleted', false)
    .eq('EstatePropertyValues.IsDeleted', false)
    .eq('EstatePropertyValues.IsActive', true)
    .eq('EstatePropertyValues.IsPropertyVisible', true);

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }

  return data.map(transformProperty);
}

/**
 * Get property by ID
 */
export async function getPropertyById(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from('EstateProperties')
    .select(`
      *,
      EstatePropertyValues!inner (
        *
      ),
      EstatePropertyAmenity (
        AmenityId,
        Amenities (*)
      ),
      Owners:Members (*)
    `)
    .eq('Id', id)
    .eq('IsDeleted', false)
    .eq('EstatePropertyValues.IsDeleted', false)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return null;
    }
    console.error('Error fetching property:', error);
    throw error;
  }

  return transformProperty(data as PropertyWithRelations);
}

/**
 * Search properties with filters
 */
export async function searchProperties(
  filters: PropertyFilters,
  page: number = 1,
  limit: number = 20
): Promise<PropertySearchResult> {
  let query = supabase
    .from('EstateProperties')
    .select(`
      *,
      EstatePropertyValues!inner (
        *
      ),
      EstatePropertyAmenity (
        AmenityId,
        Amenities (*)
      ),
      Owners:Members (*)
    `, { count: 'exact' })
    .eq('IsDeleted', false)
    .eq('EstatePropertyValues.IsDeleted', false)
    .eq('EstatePropertyValues.IsActive', true)
    .eq('EstatePropertyValues.IsPropertyVisible', true);

  // Apply filters
  if (filters.priceRange) {
    const [minPrice, maxPrice] = filters.priceRange;
    query = query
      .gte('EstatePropertyValues.RentPrice', minPrice)
      .lte('EstatePropertyValues.RentPrice', maxPrice);
  }

  if (filters.bedrooms && filters.bedrooms > 0) {
    query = query.gte('Bedrooms', filters.bedrooms);
  }

  if (filters.guests && filters.guests > 0) {
    query = query.gte('EstatePropertyValues.Capacity', filters.guests);
  }

  if (filters.location) {
    query = query.or(`City.ilike.%${filters.location}%,State.ilike.%${filters.location}%,Neighborhood.ilike.%${filters.location}%`);
  }

  if (filters.propertyType !== undefined) {
    query = query.eq('Type', filters.propertyType);
  }

  // Pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error searching properties:', error);
    throw error;
  }

  const properties = data.map(transformProperty);

  return {
    properties,
    totalCount: count || 0,
  };
}
