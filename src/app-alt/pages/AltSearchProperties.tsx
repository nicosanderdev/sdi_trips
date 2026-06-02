import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, Search as SearchIcon, SlidersHorizontal, Users } from 'lucide-react';
import { useSearchPricing } from '../../hooks/useSearchPricing';
import { usePortalPropertySearch } from '../../hooks/usePortalPropertySearch';
import type { EventVenue } from '../../services/eventVenueService';
import { buildVenuePriceHint } from '../../services/pricing';
import HeroTitleSection from '../../components/sections/HeroTitleSection';
import uyCitiesData from '../../data/uy-cities.json';

const UY_CITIES_MAX_SUGGESTIONS = 10;
const DEBOUNCE_MS = 450;

interface UyCity {
  name: string;
  lat: string;
  long: string;
  zoom: string;
}

const uyCities: UyCity[] = uyCitiesData as UyCity[];

function parseOptionalInt(value: string): number | undefined {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n >= 1 ? n : undefined;
}

function findExactCityMatch(query: string): UyCity | undefined {
  const q = query.trim().toLowerCase();
  return uyCities.find((c) => c.name.toLowerCase() === q);
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

  const [capacityMinInput, setCapacityMinInput] = useState(
    () => searchParams.get('capacityMin') ?? searchParams.get('guests') ?? '',
  );
  const [capacityMaxInput, setCapacityMaxInput] = useState(
    () => searchParams.get('capacityMax') ?? '',
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

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedLocationQuery(locationQuery), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [locationQuery]);

  useEffect(() => {
    const params = new URLSearchParams();
    const trimmedLocation = locationQuery.trim();
    if (trimmedLocation) params.set('location', trimmedLocation);

    const capMin = parseOptionalInt(capacityMinInput);
    const capMax = parseOptionalInt(capacityMaxInput);
    if (capMin != null) params.set('capacityMin', String(capMin));
    if (capMax != null) params.set('capacityMax', String(capMax));
    if (availableFrom) params.set('from', availableFrom);
    if (availableTo) params.set('to', availableTo);

    setSearchParams(params, { replace: true });
  }, [
    locationQuery,
    capacityMinInput,
    capacityMaxInput,
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

  const capacityMin = parseOptionalInt(capacityMinInput);
  const capacityMax = parseOptionalInt(capacityMaxInput);

  const portalRpcFilters = useMemo(() => {
    const trimmedLocation = debouncedLocationQuery.trim();
    const exactCity = findExactCityMatch(trimmedLocation);
    const hasDateRange = Boolean(availableFrom && availableTo);

    return {
      city: exactCity?.name,
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

  const { priceByPropertyId } = useSearchPricing(filtered, pricingCheckIn, pricingCheckOut);

  const resetFilters = () => {
    setLocationQuery('');
    setCapacityMinInput('');
    setCapacityMaxInput('');
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
          <h1 className="text-4xl md:text-5xl font-thin text-white mb-4">
            {t('alt.search.heroTitleBefore')}
            <span className="font-bold text-gold">{t('alt.search.heroTitleHighlight')}</span>
            {t('alt.search.heroTitleAfter')}
          </h1>
          <p className="text-lg text-white/95 max-w-2xl mx-auto leading-relaxed">{t('alt.search.heroSub')}</p>
        </div>
      </HeroTitleSection>

      <section className="py-12 bg-white border-b border-navy/10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:justify-between mb-8">
            <div className="flex items-center gap-2 text-navy">
              <SlidersHorizontal className="h-5 w-5 text-venue-accent" />
              <h2 className="text-xl font-semibold m-0">{t('alt.search.filtersHeading')}</h2>
            </div>
            <p className="text-sm text-charcoal/70 m-0 lg:text-right">{t('alt.search.filtersHint')}</p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-navy md:col-span-2 lg:col-span-6">
                {t('alt.search.location')}
                <div ref={searchContainerRef} className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/50 pointer-events-none" />
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={t('alt.search.locationPlaceholder')}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white pl-10 pr-3 py-3 text-charcoal font-normal focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                  />
                  {showSuggestions && locationQuery.length >= 1 && filteredCities.length > 0 && (
                    <ul
                      className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                      role="listbox"
                    >
                      {filteredCities.map((city) => (
                        <li
                          key={city.name}
                          role="option"
                          className="px-4 py-2.5 cursor-pointer text-sm text-navy hover:bg-warm-gray border-b border-gray-100 last:border-0"
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

              <label className="flex flex-col gap-2 text-sm font-medium text-navy lg:col-span-3">
                {t('alt.search.capacityMin')}
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/50 pointer-events-none" />
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    inputMode="numeric"
                    value={capacityMinInput}
                    onChange={(e) => setCapacityMinInput(e.target.value)}
                    placeholder={t('alt.search.capacityMinPlaceholder')}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white pl-10 pr-3 py-3 text-charcoal font-normal focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-navy lg:col-span-3">
                {t('alt.search.capacityMax')}
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/50 pointer-events-none" />
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    inputMode="numeric"
                    value={capacityMaxInput}
                    onChange={(e) => setCapacityMaxInput(e.target.value)}
                    placeholder={t('alt.search.capacityMaxPlaceholder')}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white pl-10 pr-3 py-3 text-charcoal font-normal focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                  />
                </div>
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-navy">{t('alt.search.availabilityRange')}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 lg:items-end">
                <label className="relative flex flex-col gap-1 lg:col-span-4">
                  <span className="text-xs text-charcoal/70">{t('alt.search.availableFrom')}</span>
                  <Calendar className="absolute left-3 bottom-3 h-4 w-4 text-charcoal/50 pointer-events-none" />
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
                    className="w-full rounded-xl border-2 border-gray-200 bg-white pl-10 pr-3 py-3 text-charcoal font-normal focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                  />
                </label>
                <label className="relative flex flex-col gap-1 lg:col-span-4">
                  <span className="text-xs text-charcoal/70">{t('alt.search.availableTo')}</span>
                  <Calendar className="absolute left-3 bottom-3 h-4 w-4 text-charcoal/50 pointer-events-none" />
                  <input
                    type="date"
                    value={availableTo}
                    min={availableFrom || undefined}
                    onChange={(e) => setAvailableTo(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white pl-10 pr-3 py-3 text-charcoal font-normal focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                  />
                </label>
                <div className="flex sm:col-span-2 lg:col-span-4 justify-end lg:items-end">
                  <button
                    type="button"
                    className="w-full sm:w-auto shrink-0 rounded-full border-2 border-navy/20 px-5 py-3 text-sm font-semibold text-navy hover:bg-warm-gray transition-colors"
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
          <p className="text-sm text-charcoal/70 mb-6">{t('alt.search.resultsLine', { count: filtered.length })}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((venue) => (
              <article
                key={venue.id}
                className="group rounded-2xl border border-navy/10 bg-white overflow-hidden shadow-sm hover:shadow-gold transition-shadow"
              >
                <Link to={`/venue/${venue.id}`} className="block relative aspect-4/3 overflow-hidden bg-navy/10">
                  <img
                    src={venue.images[0]}
                    alt={venue.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {venue.eventTypes.slice(0, 2).map((et) => (
                      <span
                        key={et}
                        className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-navy border border-navy/10"
                      >
                        {et}
                      </span>
                    ))}
                  </div>
                </Link>
                <div className="p-5 space-y-3">
                  <div>
                    <Link to={`/venue/${venue.id}`} className="text-lg font-semibold text-navy hover:text-gold transition-colors">
                      {venue.name}
                    </Link>
                    <div className="flex items-center gap-1.5 text-sm text-charcoal/80 mt-1">
                      <MapPin className="h-4 w-4 text-venue-accent shrink-0" />
                      <span>{venue.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-charcoal">
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
                    className="inline-flex text-sm font-medium text-navy underline underline-offset-4 hover:text-gold"
                  >
                    {t('alt.search.viewDetails')}
                  </Link>
                </div>
              </article>
            ))}
          </div>
          {loading && <p className="text-sm text-charcoal/70">{t('alt.search.loading')}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <p className="text-sm text-charcoal/70">{t('alt.search.empty')}</p>
          )}
        </div>
      </section>
    </>
  );
}
