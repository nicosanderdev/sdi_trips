import { useCallback, useEffect, useMemo, useState } from 'react';
import { getGuestSiteListingType } from '../core/config/guestSiteListingType';
import type { Property } from '../types';
import type { GuestSiteListingType } from '../types/guestReviewContract';
import { calculateDisplayPrice } from '../services/pricing/calculateDisplayPrice';
import { fetchAppParameters, fetchListingDailyFactors } from '../services/pricing/fetchParameters';
import {
  buildSearchContext,
  listingPricingFromProperty,
  toIsoDate,
} from '../services/pricing/listingPricing';
import type {
  AppParametersMap,
  DailyFactorEntry,
  PriceBreakdown,
} from '../services/pricing/types';

export interface UseDisplayPriceOptions {
  property: Property;
  checkIn?: Date | null;
  checkOut?: Date | null;
  guests?: number;
  siteListingType?: GuestSiteListingType;
  /** Preloaded app parameters (e.g. from parent Search page). */
  appParameters?: AppParametersMap | null;
  /** Preloaded daily factors for this listing. */
  dailyFactors?: DailyFactorEntry[] | null;
  /** When false, skips RPC loads (e.g. property not loaded yet). */
  enabled?: boolean;
}

export interface UseDisplayPriceResult {
  breakdown: PriceBreakdown | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDisplayPrice({
  property,
  checkIn,
  checkOut,
  guests,
  siteListingType,
  appParameters: appParametersProp,
  dailyFactors: dailyFactorsProp,
  enabled = true,
}: UseDisplayPriceOptions): UseDisplayPriceResult {
  const scope = siteListingType ?? getGuestSiteListingType();
  const [appParameters, setAppParameters] = useState<AppParametersMap | null>(
    appParametersProp ?? null,
  );
  const [dailyFactors, setDailyFactors] = useState<DailyFactorEntry[] | null>(
    dailyFactorsProp ?? null,
  );
  const [loading, setLoading] = useState(!appParametersProp);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const checkInIso = checkIn ? toIsoDate(checkIn) : undefined;
  const checkOutIso = checkOut ? toIsoDate(checkOut) : undefined;
  const listingId = property.listingId;

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (appParametersProp) {
      setAppParameters(appParametersProp);
    }
  }, [appParametersProp]);

  useEffect(() => {
    if (dailyFactorsProp) {
      setDailyFactors(dailyFactorsProp);
    }
  }, [dailyFactorsProp]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load(): Promise<void> {
      if (appParametersProp && (dailyFactorsProp || !listingId || !checkInIso || !checkOutIso)) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const params = appParametersProp ?? (await fetchAppParameters(scope));
        if (cancelled) return;
        setAppParameters(params);

        if (listingId && checkInIso && checkOutIso && !dailyFactorsProp) {
          const factors = await fetchListingDailyFactors(listingId, checkInIso, checkOutIso);
          if (!cancelled) setDailyFactors(factors);
        } else if (!dailyFactorsProp) {
          setDailyFactors([]);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load pricing');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [
    scope,
    listingId,
    checkInIso,
    checkOutIso,
    appParametersProp,
    dailyFactorsProp,
    tick,
    enabled,
  ]);

  const breakdown = useMemo(() => {
    if (!enabled || !appParameters) return null;
    const listing = listingPricingFromProperty(property);
    const context = buildSearchContext(scope, checkIn, checkOut, guests);
    return calculateDisplayPrice(
      listing,
      appParameters,
      context,
      dailyFactors ?? undefined,
    );
  }, [enabled, appParameters, property, scope, checkIn, checkOut, guests, dailyFactors]);

  return { breakdown, loading, error, refresh };
}
