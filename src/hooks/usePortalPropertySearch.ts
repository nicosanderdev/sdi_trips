import { useCallback, useEffect, useRef, useState } from 'react';
import { getGuestSiteListingType } from '../core/config/guestSiteListingType';
import type { Property } from '../types';
import type { EventVenue, VenueEventTag } from '../services/eventVenueService';
import { getRatingsForProperties } from '../services/reviewService';
import { toIsoDate } from '../services/pricing/listingPricing';
import {
  fetchSearchParameters,
  getOrCreateSessionSeed,
  portalSearchProperties,
  rankSearchResults,
  paginateRankedResults,
  paramNumber,
  hydrateSummerRentProperties,
  hydrateEventVenueProperties,
  type PortalSearchFilters,
} from '../services/search';

export interface PortalSearchPostFilters {
  amenityNames?: string[];
  minRating?: number;
  eventType?: VenueEventTag;
}

export interface UsePortalPropertySearchOptions {
  rpcFilters: Omit<PortalSearchFilters, 'listingType'>;
  postFilters?: PortalSearchPostFilters;
  /** Cap ranked candidates before hydration (default 50). */
  hydrateLimit?: number;
  enabled?: boolean;
}

export type PortalSearchProperty = Property | EventVenue;

export function usePortalPropertySearch({
  rpcFilters,
  postFilters,
  hydrateLimit = 50,
  enabled = true,
}: UsePortalPropertySearchOptions) {
  const listingType = getGuestSiteListingType();
  const [properties, setProperties] = useState<PortalSearchProperty[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const runSearch = useCallback(async () => {
    if (!enabled) return;

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const params = await fetchSearchParameters(listingType);
      if (requestId !== requestIdRef.current) return;

      const sessionSeed = getOrCreateSessionSeed(params);
      const limit = paramNumber(params, 'SEARCH_CANDIDATE_POOL_SIZE', 200);

      const { items, total: rpcTotal } = await portalSearchProperties({
        listingType,
        siteScope: listingType,
        limit,
        ...rpcFilters,
      });
      if (requestId !== requestIdRef.current) return;

      const ranked = rankSearchResults(items, { params, sessionSeed });
      const page = paginateRankedResults(ranked, 1, hydrateLimit);
      const rankedIds = page.items.map((item) => item.estatePropertyId);

      let hydrated: PortalSearchProperty[] =
        listingType === 'EventVenue'
          ? await hydrateEventVenueProperties(rankedIds)
          : await hydrateSummerRentProperties(rankedIds);
      if (requestId !== requestIdRef.current) return;

      if (postFilters?.amenityNames?.length && listingType === 'SummerRent') {
        const required = new Set(
          postFilters.amenityNames.map((a) => a.toLowerCase().trim()),
        );
        hydrated = (hydrated as Property[]).filter((property) => {
          const lower = property.amenities.map((n) => n.toLowerCase().trim());
          return Array.from(required).every((req) => lower.includes(req));
        });
      }

      if (postFilters?.minRating && postFilters.minRating > 0 && listingType === 'SummerRent') {
        const ratingsMap = await getRatingsForProperties(hydrated.map((p) => p.id));
        if (requestId !== requestIdRef.current) return;
        hydrated = (hydrated as Property[]).filter((property) => {
          const stats = ratingsMap[property.id];
          return (stats?.averageRating ?? 0) >= postFilters.minRating!;
        });
      }

      if (postFilters?.eventType && listingType === 'EventVenue') {
        hydrated = (hydrated as EventVenue[]).filter((venue) =>
          venue.eventTypeTags.includes(postFilters.eventType!),
        );
      }

      setProperties(hydrated);
      setTotal(rpcTotal);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error('Portal property search failed:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setProperties([]);
      setTotal(0);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [enabled, listingType, rpcFilters, postFilters, hydrateLimit]);

  const rpcFiltersKey = JSON.stringify({
    ...rpcFilters,
    checkIn: rpcFilters.checkIn,
    checkOut: rpcFilters.checkOut,
    availabilityMode: rpcFilters.availabilityMode,
  });
  const postFiltersKey = JSON.stringify(postFilters ?? {});

  useEffect(() => {
    void runSearch();
  }, [runSearch, rpcFiltersKey, postFiltersKey, enabled]);

  return {
    properties,
    total,
    loading,
    error,
    refetch: runSearch,
    listingType,
  };
}

export function buildPortalRpcFiltersFromDates(
  checkIn?: Date | null,
  checkOut?: Date | null,
): Pick<PortalSearchFilters, 'checkIn' | 'checkOut'> {
  return {
    checkIn: checkIn ? toIsoDate(checkIn) : undefined,
    checkOut: checkOut ? toIsoDate(checkOut) : undefined,
  };
}
