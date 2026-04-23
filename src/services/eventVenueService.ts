import type { Property } from '../types';
import { supabase } from '../lib/supabase';

export type VenueEventTag = 'wedding' | 'corporate' | 'party' | 'workshop';

export interface EventVenue extends Property {
  name: string;
  capacity: number;
  priceFrom: number;
  priceHint: string;
  eventTypeTags: VenueEventTag[];
  eventTypes: string[];
  layoutNotes: string;
  policies: { title: string; body: string }[];
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
  IsActive: boolean;
  IsPropertyVisible: boolean;
  BlockedForBooking: boolean;
  AmenityNames: string[] | null;
  MaxGuests: number | null;
  HasCatering: boolean | null;
  HasSoundSystem: boolean | null;
  ClosingHour: string | null;
  AllowedEventsDescription: string | null;
  SectionData?: RpcPropertySectionRow[] | null;
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1519167758481-83f29da3a0a6?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80',
];

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

function isValidLayoutType(value: string | null | undefined): value is 'split' | 'carousel' | 'stacked' {
  return value === 'split' || value === 'carousel' || value === 'stacked';
}

function mapPropertySections(rawSections: RpcPropertySectionRow[] | null | undefined): Property['sections'] {
  if (!rawSections?.length) {
    return [];
  }

  return rawSections
    .map((section) => ({
      id: section.Id,
      name: section.Name,
      description: section.Description,
      layoutType: isValidLayoutType(section.LayoutType) ? section.LayoutType : 'split',
      layoutConfig: section.LayoutConfig ?? undefined,
      displayOrder: section.DisplayOrder ?? undefined,
      images: (section.Images ?? [])
        .slice()
        .sort((a, b) => (a.DisplayOrder ?? 0) - (b.DisplayOrder ?? 0))
        .map((image) => ({
          id: image.Id,
          imageId: image.PropertyImageId ?? undefined,
          url: image.R2Url,
          title: image.Title,
          metadata: image.Metadata,
          displayOrder: image.DisplayOrder ?? undefined,
        })),
    }))
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
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

function mapRow(row: EventVenueRpcRow): EventVenue {
  const location = [row.Neighborhood, row.City, row.State].filter(Boolean).join(', ') || 'Location not specified';
  const maxGuests = row.MaxGuests ?? row.ListingCapacity ?? row.Capacity ?? 0;
  const amenities = row.AmenityNames ?? [];
  const eventTypes = inferEventTypes(row.AllowedEventsDescription);
  const price = row.RentPrice ?? row.SalePrice ?? 0;
  const venueName = row.Title ?? 'Untitled venue';

  return {
    id: row.EstatePropertyId,
    name: venueName,
    title: venueName,
    subtitle: row.AllowedEventsDescription ?? 'Event-ready venue for curated experiences.',
    location,
    price,
    currency: row.Currency === 1 ? 'UYU' : 'USD',
    images: FALLBACK_IMAGES,
    bedrooms: row.Bedrooms ?? 0,
    bathrooms: row.Bathrooms ?? 0,
    maxGuests,
    description: row.ListingDescription ?? '',
    amenities,
    rating: 0,
    reviewCount: 0,
    host: {
      id: row.OwnerId ?? '',
      name: 'Venue coordinator',
      email: '',
      verified: false,
    },
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
    policies: [
      { title: 'Availability', body: 'Final confirmation depends on date and operations review.' },
      { title: 'Cancellation', body: 'Cancellation policies are shared in booking confirmation.' },
    ],
    hasCatering: Boolean(row.HasCatering),
    hasSoundSystem: Boolean(row.HasSoundSystem),
    closingHour: row.ClosingHour,
    allowedEventsDescription: row.AllowedEventsDescription,
    sections: mapPropertySections(row.SectionData),
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

  let venues = ((data ?? []) as EventVenueRpcRow[]).map(mapRow);
  if (filters.eventType) {
    venues = venues.filter((venue) => venue.eventTypeTags.includes(filters.eventType as VenueEventTag));
  }

  const totalCount = venues.length;
  const offset = (page - 1) * limit;
  return {
    venues: venues.slice(offset, offset + limit),
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
  return row ? mapRow(row) : null;
}
