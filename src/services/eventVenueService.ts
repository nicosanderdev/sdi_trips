import type { Property } from '../types';
import { supabase } from '../lib/supabase';
import { parseAmenities } from '../models/properties/publicAmenity';
import { resolvePublicContentSectionsFromRow } from '../models/properties/propertyContentSections';
import { parsePolicies } from '../models/properties/propertyPolicies';
import { enrichPropertiesWithImages } from './propertyImageService';
import { mapRpcPricingFields } from './pricing/listingPricing';

export type VenueEventTag = 'wedding' | 'corporate' | 'party' | 'workshop';

export interface EventVenue extends Property {
  name: string;
  capacity: number;
  priceFrom: number;
  priceHint: string;
  eventTypeTags: VenueEventTag[];
  eventTypes: string[];
  layoutNotes: string;
  hasCatering: boolean;
  hasSoundSystem: boolean;
  closingHour?: string | null;
  allowedEventsDescription?: string | null;
}

export interface EventVenueFilters {
  minPrice?: number;
  maxPrice?: number;
  minGuests?: number;
  location?: string;
  onlyFeatured?: boolean;
  eventType?: VenueEventTag;
}

interface EventVenueRpcRow {
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
  SectionData?: RpcPropertySectionRow[] | null;
}

interface RpcPropertySectionImageRow {
  Id: string;
  PropertyImageId: string | null;
  R2Url: string;
  Title: string | null;
  Metadata: Record<string, unknown> | null;
  DisplayOrder: number | null;
}

interface RpcPropertySectionRow {
  Id: string;
  Name: string;
  Description: string | null;
  LayoutType: 'split' | 'carousel' | 'stacked' | null;
  LayoutConfig: Record<string, unknown> | null;
  DisplayOrder: number | null;
  Images: RpcPropertySectionImageRow[] | null;
}

function inferEventTypes(allowed: string | null | undefined): string[] {
  if (!allowed) return ['Private events'];
  const source = allowed.toLowerCase();
  const out: string[] = [];
  if (source.includes('wedd')) out.push('Weddings');
  if (source.includes('corp')) out.push('Corporate events');
  if (source.includes('party')) out.push('Private parties');
  if (source.includes('workshop')) out.push('Workshops');
  return out.length ? out : ['Private events'];
}

function inferEventTags(eventTypes: string[]): VenueEventTag[] {
  const merged = eventTypes.join(' ').toLowerCase();
  const tags: VenueEventTag[] = [];
  if (merged.includes('wedd')) tags.push('wedding');
  if (merged.includes('corp')) tags.push('corporate');
  if (merged.includes('party')) tags.push('party');
  if (merged.includes('workshop')) tags.push('workshop');
  return tags.length ? tags : ['party'];
}

/** Public venue listings must never expose owner email/phone. */
function mapPublicVenueHost(ownerId: string | null | undefined): Property['host'] {
  return {
    id: ownerId ?? '',
    name: 'Venue coordinator',
    email: '',
    verified: false,
    phone: undefined,
  };
}

export function mapEventVenueFromRpc(row: EventVenueRpcRow): EventVenue {
  const location = [row.Neighborhood, row.City, row.State].filter(Boolean).join(', ') || 'Location not specified';
  const maxGuests = row.MaxGuests ?? row.ListingCapacity ?? row.Capacity ?? 0;
  const amenities = row.AmenityNames ?? [];
  const publicAmenities = parseAmenities(row.Amenities);
  const publicPolicies = parsePolicies(row.Policies);
  const publicContentSections = resolvePublicContentSectionsFromRow(
    row.ContentSections,
    row.SectionData,
  );
  const eventTypes = inferEventTypes(row.AllowedEventsDescription);
  const pricing = mapRpcPricingFields(row as unknown as Record<string, unknown>);
  const price = pricing.basePrice;
  const venueName = row.Title ?? 'Untitled venue';

  return {
    id: row.EstatePropertyId,
    name: venueName,
    title: venueName,
    subtitle: row.AllowedEventsDescription ?? 'Event-ready venue for curated experiences.',
    location,
    price,
    listingId: pricing.listingId ?? row.ListingId,
    basePrice: pricing.basePrice,
    minPrice: pricing.minPrice,
    maxPrice: pricing.maxPrice,
    longStayDiscountEnabled: pricing.longStayDiscountEnabled,
    longStayMinDays: pricing.longStayMinDays,
    longStayDiscountPercentage: pricing.longStayDiscountPercentage,
    currency: row.Currency === 1 ? 'UYU' : 'USD',
    images: [],
    bedrooms: row.Bedrooms ?? 0,
    bathrooms: row.Bathrooms ?? 0,
    maxGuests,
    description: row.ListingDescription ?? '',
    amenities,
    publicAmenities: publicAmenities.length ? publicAmenities : undefined,
    publicPolicies: publicPolicies.length ? publicPolicies : undefined,
    publicContentSections: publicContentSections.length ? publicContentSections : undefined,
    rating: 0,
    reviewCount: 0,
    host: mapPublicVenueHost(row.OwnerId),
    available: row.IsActive && row.IsPropertyVisible && !row.BlockedForBooking,
    coordinates: {
      lat: Number(row.LocationLatitude),
      lng: Number(row.LocationLongitude),
    },
    ownerId: row.OwnerId ?? undefined,
    listingType: 'EventVenue',
    capacity: maxGuests,
    priceFrom: price,
    priceHint: `From $${price.toLocaleString()} per event`,
    eventTypes,
    eventTypeTags: inferEventTags(eventTypes),
    layoutNotes: `Up to ${maxGuests} guests`,
    hasCatering: Boolean(row.HasCatering),
    hasSoundSystem: Boolean(row.HasSoundSystem),
    closingHour: row.ClosingHour,
    allowedEventsDescription: row.AllowedEventsDescription,
  };
}

export async function searchEventVenues(
  filters: EventVenueFilters = {},
  page: number = 1,
  limit: number = 20,
): Promise<{ venues: EventVenue[]; totalCount: number }> {
  const { data, error } = await supabase.rpc('get_public_event_venue_properties', {
    p_min_price: filters.minPrice ?? null,
    p_max_price: filters.maxPrice ?? null,
    p_min_guests: filters.minGuests ?? null,
    p_location: filters.location ?? null,
    p_only_featured: filters.onlyFeatured ?? false,
  });

  if (error) {
    console.error('Error searching event venues:', error);
    throw error;
  }

  let venues = ((data ?? []) as EventVenueRpcRow[]).map(mapEventVenueFromRpc);
  if (filters.eventType) {
    venues = venues.filter((venue) => venue.eventTypeTags.includes(filters.eventType as VenueEventTag));
  }

  const totalCount = venues.length;
  const offset = (page - 1) * limit;
  const paged = venues.slice(offset, offset + limit);
  return {
    venues: await enrichPropertiesWithImages(paged),
    totalCount,
  };
}

export async function getFeaturedEventVenues(limit: number = 6): Promise<EventVenue[]> {
  const { venues } = await searchEventVenues({ onlyFeatured: true }, 1, limit);
  return venues;
}

export async function getEventVenueById(id: string): Promise<EventVenue | null> {
  const { data, error } = await supabase.rpc('get_public_event_venue_property_by_id', {
    p_property_id: id,
  });

  if (error) {
    console.error('Error fetching event venue by id:', error);
    throw error;
  }

  const row = ((data ?? []) as EventVenueRpcRow[])[0];
  if (!row) return null;
  const [venue] = await enrichPropertiesWithImages([mapEventVenueFromRpc(row)]);
  return venue;
}
