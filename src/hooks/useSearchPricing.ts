import { useEffect, useMemo, useState } from 'react';
import { getGuestSiteListingType } from '../core/config/guestSiteListingType';
import type { Property } from '../types';
import { batchListingDailyFactors } from '../services/pricing/batchDailyFactors';
import { calculateDisplayPrice } from '../services/pricing/calculateDisplayPrice';
import { fetchAppParameters } from '../services/pricing/fetchParameters';
import {
  buildSearchContext,
  listingPricingFromProperty,
  toIsoDate,
} from '../services/pricing/listingPricing';
import { getPriceLabelKey } from '../services/pricing/formatPrice';
import type { AppParametersMap, DailyFactorEntry } from '../services/pricing/types';

export interface PropertyDisplayPrice {
  amount: number;
  labelKey: string;
}

export function useSearchPricing(
  properties: Property[],
  checkIn?: Date | null,
  checkOut?: Date | null,
): {
  priceByPropertyId: Map<string, PropertyDisplayPrice>;
  loading: boolean;
  appParameters: AppParametersMap | null;
} {
  const scope = getGuestSiteListingType();
  const [appParameters, setAppParameters] = useState<AppParametersMap | null>(null);
  const [factorsByListing, setFactorsByListing] = useState<Map<string, DailyFactorEntry[]>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);

  const checkInIso = checkIn ? toIsoDate(checkIn) : undefined;
  const checkOutIso = checkOut ? toIsoDate(checkOut) : undefined;
  const listingIds = useMemo(
    () =>
      properties
        .map((p) => p.listingId)
        .filter((id): id is string => Boolean(id)),
    [properties],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load(): Promise<void> {
      try {
        const params = await fetchAppParameters(scope);
        if (cancelled) return;
        setAppParameters(params);

        if (checkInIso && checkOutIso && listingIds.length) {
          const map = await batchListingDailyFactors(listingIds, checkInIso, checkOutIso);
          if (!cancelled) setFactorsByListing(map);
        } else {
          setFactorsByListing(new Map());
        }
      } catch {
        if (!cancelled) setAppParameters(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [scope, checkInIso, checkOutIso, listingIds.join(',')]);

  const priceByPropertyId = useMemo(() => {
    const map = new Map<string, PropertyDisplayPrice>();
    if (!appParameters) return map;

    const context = buildSearchContext(scope, checkIn, checkOut);
    for (const property of properties) {
      const factors = property.listingId
        ? factorsByListing.get(property.listingId)
        : undefined;
      const breakdown = calculateDisplayPrice(
        listingPricingFromProperty(property),
        appParameters,
        context,
        factors,
      );
      const amount =
        breakdown.displayLabel === 'total_stay'
          ? breakdown.total
          : breakdown.displayLabel === 'per_night'
            ? breakdown.nightlyAverage
            : breakdown.nightlyAverage;
      map.set(property.id, {
        amount,
        labelKey: getPriceLabelKey(breakdown.displayLabel),
      });
    }
    return map;
  }, [appParameters, properties, factorsByListing, scope, checkIn, checkOut]);

  return { priceByPropertyId, loading, appParameters };
}
