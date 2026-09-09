import { supabase } from '../../lib/supabase';
import type { RpcSummerRentPropertyRow } from '../../models/summerRentProperty';
import type { Property } from '../../types';
import { enrichPropertiesWithImages } from '../propertyImageService';
import { transformSummerRentProperty } from '../propertyService';
import { mapEventVenueFromRpc, type EventVenue } from '../eventVenueService';

function orderByIds<T extends { id: string }>(ids: string[], byId: Map<string, T>): T[] {
  const result: T[] = [];
  for (const id of ids) {
    const item = byId.get(id);
    if (item) result.push(item);
  }
  return result;
}

export async function hydrateSummerRentProperties(rankedIds: string[]): Promise<Property[]> {
  if (rankedIds.length === 0) return [];

  const { data, error } = await supabase.rpc('get_public_summer_rent_properties', {
    p_min_price: null,
    p_max_price: null,
    p_min_bedrooms: null,
    p_min_guests: null,
    p_location: null,
    p_only_featured: false,
  });

  if (error) throw error;

  const byId = new Map(
    ((data ?? []) as RpcSummerRentPropertyRow[]).map((row) => [
      row.EstatePropertyId,
      transformSummerRentProperty(row),
    ]),
  );

  return enrichPropertiesWithImages(orderByIds(rankedIds, byId));
}

export async function hydrateEventVenueProperties(rankedIds: string[]): Promise<EventVenue[]> {
  if (rankedIds.length === 0) return [];

  const { data, error } = await supabase.rpc('get_public_event_venue_properties', {
    p_min_price: null,
    p_max_price: null,
    p_min_guests: null,
    p_location: null,
    p_only_featured: false,
  });

  if (error) throw error;

  const byId = new Map(
    ((data ?? []) as Parameters<typeof mapEventVenueFromRpc>[0][]).map((row) => [
      row.EstatePropertyId,
      mapEventVenueFromRpc(row),
    ]),
  );

  return enrichPropertiesWithImages(orderByIds(rankedIds, byId));
}
