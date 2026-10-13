import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Calendar,
  Home,
  MapPin,
  Search as SearchIcon,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { RangeSlider } from '../../components/ui';
import { useSearchPricing } from '../../hooks/useSearchPricing';
import { usePortalPropertySearch } from '../../hooks/usePortalPropertySearch';
import { appConfig } from '../config/appConfig';
import type { EventVenue } from '../../services/eventVenueService';
import { buildVenuePriceHint } from '../../services/pricing';
import HeroTitleSection from '../../components/sections/HeroTitleSection';
import {
  findExactUyCityMatch,
  getUyCities,
  portalRpcCityFromUyLabel,
  type UyCity,
} from '../../data/uyCityUtils';

const UY_CITIES_MAX_SUGGESTIONS = 10;
const DEBOUNCE_MS = 450;
const GUESTS_SLIDER_MIN = 25;
const GUESTS_SLIDER_MAX = 300;
const GUESTS_SLIDER_STEP = 5;
const DEFAULT_GUESTS_RANGE: [number, number] = [GUESTS_SLIDER_MIN, GUESTS_SLIDER_MAX];

const uyCities = getUyCities();

function clampGuestsValue(value: number): number {
  const stepped = Math.round(value / GUESTS_SLIDER_STEP) * GUESTS_SLIDER_STEP;
  return Math.min(GUESTS_SLIDER_MAX, Math.max(GUESTS_SLIDER_MIN, stepped));
}

function parseGuestsRangeFromParams(params: URLSearchParams): [number, number] {
  const rawMin = parseInt(params.get('capacityMin') ?? params.get('guests') ?? '', 10);
  const rawMax = parseInt(params.get('capacityMax') ?? '', 10);
  const min = Number.isFinite(rawMin) ? clampGuestsValue(rawMin) : GUESTS_SLIDER_MIN;
  const max = Number.isFinite(rawMax) ? clampGuestsValue(rawMax) : GUESTS_SLIDER_MAX;
  return [Math.min(min, max), Math.max(min, max)];
}

function applyCapacityMaxFilter(venues: EventVenue[], capacityMax?: number): EventVenue[] {
  if (capacityMax == null) return venues;
  return venues.filter((v) => v.capacity <= capacityMax);
}

function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function AltSearchProperties() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [locationQuery, setLocationQuery] = useState(() => searchParams.get('location') ?? '');
  const [debouncedLocationQuery, setDebouncedLocationQuery] = useState(locationQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [guestsRange, setGuestsRange] = useState<[number, number]>(() =>
    parseGuestsRangeFromParams(searchParams),
  );

  const [availableFrom, setAvailableFrom] = useState(() => {
    const from = searchParams.get('from');
    if (from) return from;
    return searchParams.get('date') ?? '';
  });
  const [availableTo, setAvailableTo] = useState(() => {
    const to = searchParams.get('to');
    if (to) return to;
    return searchParams.get('date') ?? '';
  });

  const isDefaultGuestsRange =
    guestsRange[0] === DEFAULT_GUESTS_RANGE[0] && guestsRange[1] === DEFAULT_GUESTS_RANGE[1];
  const isOpenEndedGuestsMax = guestsRange[1] === GUESTS_SLIDER_MAX;
  const capacityMin = isDefaultGuestsRange ? undefined : guestsRange[0];
  const capacityMax = isDefaultGuestsRange || isOpenEndedGuestsMax ? undefined : guestsRange[1];

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedLocationQuery(locationQuery), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [locationQuery]);

  useEffect(() => {
    const params = new URLSearchParams();
    const trimmedLocation = locationQuery.trim();
    if (trimmedLocation) params.set('location', trimmedLocation);

    if (capacityMin != null) params.set('capacityMin', String(capacityMin));
    if (capacityMax != null) params.set('capacityMax', String(capacityMax));
    if (availableFrom) params.set('from', availableFrom);
    if (availableTo) params.set('to', availableTo);

    setSearchParams(params, { replace: true });
  }, [
    locationQuery,
    capacityMin,
    capacityMax,
    availableFrom,
    availableTo,
    setSearchParams,
  ]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCities = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    if (!q) return [];
    return uyCities
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, UY_CITIES_MAX_SUGGESTIONS);
  }, [locationQuery]);

  const handleSelectCity = useCallback((city: UyCity) => {
    setLocationQuery(city.name);
    setShowSuggestions(false);
  }, []);

  const portalRpcFilters = useMemo(() => {
    const trimmedLocation = debouncedLocationQuery.trim();
    const exactCity = findExactUyCityMatch(trimmedLocation);
    const hasDateRange = Boolean(availableFrom && availableTo);

    return {
      city: exactCity ? portalRpcCityFromUyLabel(exactCity.name) : undefined,
      searchText: exactCity ? undefined : trimmedLocation || undefined,
      capacityMin,
      checkIn: hasDateRange ? availableFrom : undefined,
      checkOut: hasDateRange ? availableTo : undefined,
      availabilityMode: hasDateRange ? ('any_day_in_range' as const) : undefined,
    };
  }, [debouncedLocationQuery, capacityMin, availableFrom, availableTo]);

  const { properties, loading, error } = usePortalPropertySearch({
    rpcFilters: portalRpcFilters,
    hydrateLimit: 50,
    listingType: appConfig.guestSiteListingType,
  });

  const filtered = useMemo(
    () => applyCapacityMaxFilter(properties as EventVenue[], capacityMax),
    [properties, capacityMax],
  );

  const pricingCheckIn = useMemo(
    () => (availableFrom ? new Date(`${availableFrom}T12:00:00`) : null),
    [availableFrom],
  );
  const pricingCheckOut = useMemo(
    () => (availableFrom ? new Date(`${addDaysIso(availableFrom, 1)}T12:00:00`) : null),
    [availableFrom],
  );

  const { priceByPropertyId } = useSearchPricing(
    filtered,
    pricingCheckIn,
    pricingCheckOut,
    appConfig.guestSiteListingType,
  );

  const formatGuestsSliderValue = (value: number, edge: 'min' | 'max') => {
    if (edge === 'max' && value === GUESTS_SLIDER_MAX) {
      return `${GUESTS_SLIDER_MAX}+`;
    }
    return String(value);
  };

  const resetFilters = () => {
    setLocationQuery('');
    setGuestsRange(DEFAULT_GUESTS_RANGE);
    setAvailableFrom('');
    setAvailableTo('');
  };

  return (
    <>
      <HeroTitleSection
        className="py-24"
        contentClassName="max-w-4xl mx-auto px-8 text-center flex flex-col items-center justify-center"
        minHeightClassName="min-h-[300px] md:min-h-[340px]"
        backgroundImageUrl="/alt-explore.jpg"
      >
        <div>
          <p className="m-0 mb-4 flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-white/80">
            <span className="inline-block h-px w-8 bg-gold" aria-hidden />
            {t('alt.landing.hero.eyebrow')}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            {t('alt.search.heroTitleBefore')}
            <span className="text-gold">{t('alt.search.heroTitleHighlight')}</span>
            {t('alt.search.heroTitleAfter')}
          </h1>
          <p className="text-lg text-white/95 max-w-2xl mx-auto leading-relaxed">{t('alt.search.heroSub')}</p>
        </div>
      </HeroTitleSection>

      <section className="py-12 bg-white border-b border-navy/10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:justify-between mb-8">
            <div className="flex items-center gap-3 text-navy">
              <SlidersHorizontal className="h-5 w-5 text-venue-accent shrink-0" />
              <h2 className="m-0 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-navy/70">
                <span className="inline-block h-px w-8 bg-gold" aria-hidden />
                {t('alt.search.filtersHeading')}
              </h2>
            </div>
            <p className="text-sm text-charcoal/70 m-0 lg:text-right">{t('alt.search.filtersHint')}</p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-navy md:col-span-2 lg:col-span-6">
                {t('alt.search.location')}
                <div ref={searchContainerRef} className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy/40 pointer-events-none" />
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={t('alt.search.locationPlaceholder')}
                    className="w-full rounded-xl border border-navy/20 bg-white pl-10 pr-3 py-3 text-charcoal font-normal focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
                  />
                  {showSuggestions && locationQuery.length >= 1 && filteredCities.length > 0 && (
                    <ul
                      className="absolute z-50 left-0 right-0 mt-1 bg-white border border-navy/15 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                      role="listbox"
                    >
                      {filteredCities.map((city) => (
                        <li
                          key={city.name}
                          role="option"
                          className="px-4 py-2.5 cursor-pointer text-sm text-navy hover:bg-warm-gray border-b border-navy/10 last:border-0"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectCity(city);
                          }}
                        >
                          {city.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </label>

              <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-6 rounded-xl border border-navy/20 bg-white px-4 py-3">
                <RangeSlider
                  label={t('alt.search.guestsRange')}
                  min={GUESTS_SLIDER_MIN}
                  max={GUESTS_SLIDER_MAX}
                  step={GUESTS_SLIDER_STEP}
                  value={guestsRange}
                  onChange={setGuestsRange}
                  formatValue={formatGuestsSliderValue}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-navy">{t('alt.search.availabilityRange')}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 lg:items-end">
                <label className="relative flex flex-col gap-1 lg:col-span-4">
                  <span className="text-xs text-charcoal/70">{t('alt.search.availableFrom')}</span>
                  <Calendar className="absolute left-3 bottom-3 h-4 w-4 text-navy/40 pointer-events-none" />
                  <input
                    type="date"
                    value={availableFrom}
                    onChange={(e) => {
                      const next = e.target.value;
                      setAvailableFrom(next);
                      if (!availableTo || next > availableTo) {
                        setAvailableTo(next);
                      }
                    }}
                    className="w-full rounded-xl border border-navy/20 bg-white pl-10 pr-3 py-3 text-charcoal font-normal focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
                  />
                </label>
                <label className="relative flex flex-col gap-1 lg:col-span-4">
                  <span className="text-xs text-charcoal/70">{t('alt.search.availableTo')}</span>
                  <Calendar className="absolute left-3 bottom-3 h-4 w-4 text-navy/40 pointer-events-none" />
                  <input
                    type="date"
                    value={availableTo}
                    min={availableFrom || undefined}
                    onChange={(e) => setAvailableTo(e.target.value)}
                    className="w-full rounded-xl border border-navy/20 bg-white pl-10 pr-3 py-3 text-charcoal font-normal focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
                  />
                </label>
                <div className="flex sm:col-span-2 lg:col-span-4 justify-end lg:items-end">
                  <button
                    type="button"
                    className="w-full sm:w-auto shrink-0 rounded-full border border-navy/20 px-5 py-3 text-sm font-semibold text-navy hover:border-gold hover:bg-warm-gray transition-colors"
                    onClick={resetFilters}
                  >
                    {t('alt.search.resetFilters')}
                  </button>
                </div>
              </div>
              <p className="text-xs text-charcoal/60 m-0">{t('alt.search.availabilityHint')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-warm-gray min-h-[40vh]">
        <div className="max-w-7xl mx-auto px-8">
          <p className="m-0 mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-navy/70">
            <span className="inline-block h-px w-8 bg-gold" aria-hidden />
            {t('alt.search.resultsLine', { count: filtered.length })}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((venue) => (
              <article
                key={venue.id}
                className="group rounded-2xl border border-navy/10 bg-white overflow-hidden hover:shadow-[0_16px_40px_-24px_rgba(10,26,47,0.35)] transition-shadow duration-300"
              >
                <Link to={`/venue/${venue.id}`} className="block relative aspect-4/3 overflow-hidden bg-navy/10 rounded-bl-[1.5rem]">
                  <img
                    src={venue.images?.[0] || '/alt-explore.jpg'}
                    alt={venue.imageAltText || venue.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {(venue.eventTypes ?? []).slice(0, 2).map((et) => (
                      <span
                        key={et}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-semibold text-navy shadow"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-venue-accent shrink-0" aria-hidden />
                        {et}
                      </span>
                    ))}
                  </div>
                </Link>
                <div className="p-5 space-y-3">
                  <div>
                    <Link
                      to={`/venue/${venue.id}`}
                      className="text-lg font-bold tracking-tight text-navy hover:underline hover:decoration-gold hover:decoration-2 hover:underline-offset-4 transition-[text-decoration]"
                    >
                      {venue.name}
                    </Link>
                    <div className="flex items-center gap-1.5 text-sm text-charcoal/75 mt-1">
                      <MapPin className="h-4 w-4 text-venue-accent shrink-0" />
                      <span>{venue.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-charcoal/75">
                    <Users className="h-4 w-4 text-gold" />
                    <span>{t('alt.search.guestsUpTo', { count: venue.capacity })}</span>
                  </div>
                  <p className="text-sm font-semibold text-venue-accent m-0">
                    {(() => {
                      const priced = priceByPropertyId.get(venue.id);
                      if (priced) {
                        return buildVenuePriceHint(
                          priced.amount,
                          priced.labelKey,
                          venue.currency,
                          t,
                        );
                      }
                      return venue.priceHint;
                    })()}
                  </p>
                  <Link
                    to={`/venue/${venue.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-navy underline decoration-gold decoration-2 underline-offset-4 hover:text-navy group/link"
                  >
                    {t('alt.search.viewDetails')}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" aria-hidden />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          {loading && (
            <div className="text-center py-12">
              <Home className="h-10 w-10 text-gold mx-auto mb-4" aria-hidden />
              <p className="text-sm text-charcoal/75 m-0">{t('alt.search.loading')}</p>
            </div>
          )}
          {error && (
            <div className="text-center py-12">
              <Home className="h-10 w-10 text-gold mx-auto mb-4" aria-hidden />
              <p className="text-sm text-red-600 m-0">{error}</p>
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-12">
              <Home className="h-12 w-12 text-gold mx-auto mb-4" aria-hidden />
              <p className="text-sm text-charcoal/75 m-0">{t('alt.search.empty')}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
