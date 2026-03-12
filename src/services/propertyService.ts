import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import type { Property } from '../types';
import { getRatingsForProperties } from './reviewService';

type DbProperty = Database['public']['Tables']['EstateProperties']['Row'];
type DbListing = Database['public']['Tables']['Listings']['Row'];

/**
 * Shape returned by get_public_summer_rent_properties / get_public_summer_rent_property_by_id.
 * Must stay in sync with the SQL migrations.
 */
interface RpcSummerRentPropertyRow {
  EstatePropertyId: string;
  Title: string;
  StreetName: string | null;
  HouseNumber: string | null;
  Neighborhood: string | null;
  City: string | null;
  State: string | null;
  Country: string | null;
  LocationLatitude: number;
  LocationLongitude: number;
  Bedrooms: number;
  Bathrooms: number;
  HasGarage: boolean;
  GarageSpaces: number;
  Visits: number | null;
  OwnerId: string | null;
  PropertyType: DbProperty['PropertyType'];
  HasLaundryRoom: boolean;
  HasPool: boolean;
  HasBalcony: boolean;
  IsFurnished: boolean;
  Capacity: number | null;
  LocationCategory: DbProperty['LocationCategory'];
  ViewType: DbProperty['ViewType'];
  ListingId: string;
  ListingType: DbListing['ListingType'];
  ListingDescription: string | null;
  AvailableFrom: string;
  ListingCapacity: number | null;
  Currency: number;
  SalePrice: number | null;
  RentPrice: number | null;
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
  MinStayDays: number | null;
  MaxStayDays: number | null;
  LeadTimeDays: number | null;
  BufferDays: number | null;
  AmenityNames: string[] | null;
}

export interface PropertyFilters {
  priceRange?: [number, number];
  bedrooms?: number;
  guests?: number;
  amenities?: string[];
  minRating?: number;
  location?: string;
}

export interface PropertySearchResult {
  properties: Property[];
  totalCount: number;
}

/**
 * Transform SummerRent RPC row to frontend Property type
 */
function transformSummerRentProperty(row: RpcSummerRentPropertyRow): Property {
  const location = [
    row.StreetName,
    row.HouseNumber,
    row.Neighborhood,
    row.City,
    row.State,
  ]
    .filter(Boolean)
    .join(', ');

  const maxGuests =
    row.ListingCapacity ??
    row.Capacity ??
    (row.Bedrooms != null ? row.Bedrooms * 2 : 0);

  const amenities = row.AmenityNames ?? [];

  return {
    id: row.EstatePropertyId,
    title: row.Title,
    location: location || 'Location not specified',
    price: row.RentPrice || row.SalePrice || 0,
    currency: getCurrencyCode(row.Currency),
    images: [], // TODO: Implement image fetching
    bedrooms: row.Bedrooms,
    bathrooms: row.Bathrooms,
    maxGuests,
    description: row.ListingDescription || '',
    amenities,
    rating: 0,
    reviewCount: 0,
    host: {
      id: row.OwnerId || '',
      name: 'Host',
      email: '',
      avatar: undefined,
      phone: undefined,
      verified: false,
    },
    available: row.IsActive && row.IsPropertyVisible && !row.BlockedForBooking,
    coordinates: {
      lat: Number(row.LocationLatitude),
      lng: Number(row.LocationLongitude),
    },
    minStayDays: row.MinStayDays ?? undefined,
    maxStayDays: row.MaxStayDays ?? undefined,
    leadTimeDays: row.LeadTimeDays ?? undefined,
    bufferDays: row.BufferDays ?? undefined,
    ownerId: row.OwnerId ?? undefined,
    listingType: 'SummerRent',
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
export async function getFeaturedProperties(
  limit: number = 6,
): Promise<Property[]> {
  const { data, error } = await supabase.rpc<RpcSummerRentPropertyRow>(
    'get_public_summer_rent_properties',
    {
      p_min_price: null,
      p_max_price: null,
      p_min_bedrooms: null,
      p_min_guests: null,
      p_location: null,
      p_only_featured: true,
    },
  );

  if (error) {
    console.error('Error fetching featured properties:', error);
    throw error;
  }

  const rows = (data ?? []).slice(0, limit);
  return rows.map(transformSummerRentProperty);
}

/**
 * Get all active properties
 */
export async function getProperties(limit?: number): Promise<Property[]> {
  const { data, error } = await supabase.rpc<RpcSummerRentPropertyRow>(
    'get_public_summer_rent_properties',
    {
      p_min_price: null,
      p_max_price: null,
      p_min_bedrooms: null,
      p_min_guests: null,
      p_location: null,
      p_only_featured: false,
    },
  );

  if (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }

  const rows = limit ? (data ?? []).slice(0, limit) : data ?? [];
  return rows.map(transformSummerRentProperty);
}

/**
 * Get top-rated properties for the landing hero section.
 *
 * This uses a limited pool of active, visible properties and enriches them
 * with real ratings aggregated from the Reviews table.
 */
export async function getTopRatedPropertiesForHero(
  limit: number = 5,
): Promise<Property[]> {
  const HERO_POOL_LIMIT = 30;

  const { data, error } = await supabase.rpc<RpcSummerRentPropertyRow>(
    'get_public_summer_rent_properties',
    {
      p_min_price: null,
      p_max_price: null,
      p_min_bedrooms: null,
      p_min_guests: null,
      p_location: null,
      p_only_featured: false,
    },
  );

  if (error) {
    console.error('Error fetching properties for hero:', error);
    throw error;
  }

  const baseProperties = (data ?? [])
    .slice(0, HERO_POOL_LIMIT)
    .map(transformSummerRentProperty);

  if (baseProperties.length === 0) {
    return [];
  }

  const ratingsMap = await getRatingsForProperties(
    baseProperties.map((p) => p.id)
  );

  const enriched = baseProperties.map((property) => {
    const stats = ratingsMap[property.id];
    if (!stats) {
      return {
        ...property,
        rating: 0,
        reviewCount: 0,
      };
    }

    return {
      ...property,
      rating: stats.averageRating,
      reviewCount: stats.reviewCount,
    };
  });

  enriched.sort((a, b) => {
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }
    if (b.reviewCount !== a.reviewCount) {
      return b.reviewCount - a.reviewCount;
    }
    return 0;
  });

  return enriched.slice(0, limit);
}

/**
 * Get property by ID
 */
export async function getPropertyById(id: string): Promise<Property | null> {
  const { data, error } = await supabase.rpc<RpcSummerRentPropertyRow>(
    'get_public_summer_rent_property_by_id',
    { p_property_id: id },
  );

  if (error) {
    // PGRST116 equivalent is not surfaced through rpc in the same way; treat empty data as not found.
    console.error('Error fetching property:', error);
    throw error;
  }

  const row = (data ?? [])[0];
  if (!row) {
    return null;
  }

  return transformSummerRentProperty(row);
}

/**
 * Search properties with filters
 */
export async function searchProperties(
  filters: PropertyFilters,
  page: number = 1,
  limit: number = 20,
): Promise<PropertySearchResult> {
  const [minPrice, maxPrice] = filters.priceRange ?? [null, null];

  const { data, error } = await supabase.rpc<RpcSummerRentPropertyRow>(
    'get_public_summer_rent_properties',
    {
      p_min_price: minPrice,
      p_max_price: maxPrice,
      p_min_bedrooms: filters.bedrooms ?? null,
      p_min_guests: filters.guests ?? null,
      p_location: filters.location ?? null,
      p_only_featured: false,
    },
  );

  if (error) {
    console.error('Error searching properties:', error);
    throw error;
  }

  let rows = data ?? [];

  // Client-side filter: amenities (by name)
  if (filters.amenities && filters.amenities.length > 0) {
    const required = new Set(
      filters.amenities.map((a) => a.toLowerCase().trim()),
    );
    rows = rows.filter((row) => {
      const names = row.AmenityNames ?? [];
      const lower = names.map((n) => n.toLowerCase().trim());
      return Array.from(required).every((req) => lower.includes(req));
    });
  }

  // Map to Property objects
  let properties = rows.map(transformSummerRentProperty);

  // Client-side filter: minimum rating (uses aggregated ratings when available)
  if (filters.minRating && filters.minRating > 0) {
    const ratingsMap = await getRatingsForProperties(
      properties.map((p) => p.id),
    );
    properties = properties.filter((p) => {
      const stats = ratingsMap[p.id];
      const rating = stats?.averageRating ?? 0;
      return rating >= (filters.minRating ?? 0);
    });
  }

  const totalCount = properties.length;
  const offset = (page - 1) * limit;
  const paged = properties.slice(offset, offset + limit);

  return {
    properties: paged,
    totalCount,
  };
}

/**
 * Get favorite properties for a specific member
 */
export async function getFavoriteProperties(
  memberId: string,
): Promise<Property[]> {
  const { data, error } = await supabase
    .from('Favorites')
    .select('EstatePropertyId')
    .eq('MemberId', memberId);

  if (error) {
    console.error('Error fetching favorite properties:', error);
    throw error;
  }

  const ids = (data ?? []).map((row: any) => row.EstatePropertyId) as string[];
  if (ids.length === 0) {
    return [];
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc<
    RpcSummerRentPropertyRow
  >('get_public_summer_rent_properties', {
    p_min_price: null,
    p_max_price: null,
    p_min_bedrooms: null,
    p_min_guests: null,
    p_location: null,
    p_only_featured: false,
  });

  if (rpcError) {
    console.error('Error fetching favorite properties via RPC:', rpcError);
    throw rpcError;
  }

  const byId = new Map(
    (rpcData ?? []).map((row) => [row.EstatePropertyId, row]),
  );

  const favorites: Property[] = [];
  for (const id of ids) {
    const row = byId.get(id);
    if (row) {
      favorites.push(transformSummerRentProperty(row));
    }
  }

  return favorites;
}
