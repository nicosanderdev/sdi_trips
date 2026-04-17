import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Users, SlidersHorizontal } from 'lucide-react';
import {
  searchEventVenues,
  type EventVenue,
  type VenueEventTag,
} from '../../services/eventVenueService';
import HeroTitleSection from '../../components/sections/HeroTitleSection';

export default function AltSearchProperties() {
  const { t } = useTranslation();
  const [allVenues, setAllVenues] = useState<EventVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventType, setEventType] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [priceTier, setPriceTier] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await searchEventVenues();
        setAllVenues(result.venues);
      } catch (_error) {
        setError('Failed to load venues. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [t]);

  const filtered = useMemo(() => {
    return allVenues.filter((v) => {
      if (eventType && !v.eventTypeTags.includes(eventType as VenueEventTag)) {
        return false;
      }
      if (capacityFilter === 'small' && v.capacity > 80) return false;
      if (capacityFilter === 'medium' && (v.capacity <= 80 || v.capacity > 150)) return false;
      if (capacityFilter === 'large' && v.capacity <= 150) return false;
      if (priceTier === 'budget' && v.priceFrom >= 3000) return false;
      if (priceTier === 'premium' && v.priceFrom < 4000) return false;
      return true;
    });
  }, [allVenues, eventType, capacityFilter, priceTier]);

  return (
    <>
      <HeroTitleSection
        className="py-24"
        contentClassName="max-w-4xl mx-auto px-8 text-center flex flex-col items-center justify-center"
        minHeightClassName="min-h-[300px] md:min-h-[340px]"
        backgroundImageUrl="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1800&q=80"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-navy">
              {t('alt.search.eventType')}
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="rounded-xl border-2 border-gray-200 bg-white px-3 py-3 text-charcoal font-normal focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
              >
                <option value="">{t('alt.search.optionAny')}</option>
                <option value="wedding">{t('alt.search.eventWedding')}</option>
                <option value="corporate">{t('alt.search.eventCorporate')}</option>
                <option value="party">{t('alt.search.eventParty')}</option>
                <option value="workshop">{t('alt.search.eventWorkshop')}</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-navy">
              {t('alt.search.capacity')}
              <select
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
                className="rounded-xl border-2 border-gray-200 bg-white px-3 py-3 text-charcoal font-normal focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
              >
                <option value="">{t('alt.search.optionAny')}</option>
                <option value="small">{t('alt.search.capSmall')}</option>
                <option value="medium">{t('alt.search.capMedium')}</option>
                <option value="large">{t('alt.search.capLarge')}</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-navy">
              {t('alt.search.priceTier')}
              <select
                value={priceTier}
                onChange={(e) => setPriceTier(e.target.value)}
                className="rounded-xl border-2 border-gray-200 bg-white px-3 py-3 text-charcoal font-normal focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
              >
                <option value="">{t('alt.search.optionAny')}</option>
                <option value="budget">{t('alt.search.priceBudget')}</option>
                <option value="premium">{t('alt.search.pricePremium')}</option>
              </select>
            </label>
            <div className="flex items-end">
              <button
                type="button"
                className="w-full rounded-full border-2 border-navy/20 px-4 py-3 text-sm font-semibold text-navy hover:bg-warm-gray transition-colors"
                onClick={() => {
                  setEventType('');
                  setCapacityFilter('');
                  setPriceTier('');
                }}
              >
                {t('alt.search.resetFilters')}
              </button>
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
                  <p className="text-sm font-semibold text-venue-accent m-0">{venue.priceHint}</p>
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
          {loading && <p className="text-sm text-charcoal/70">Loading venues...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <p className="text-sm text-charcoal/70">No venues found for the selected filters.</p>
          )}
        </div>
      </section>
    </>
  );
}
