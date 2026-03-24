import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, SlidersHorizontal } from 'lucide-react';
import { listVenues } from '../data/staticVenues';

export default function AltSearchProperties() {
  const allVenues = listVenues();
  const [eventType, setEventType] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [priceTier, setPriceTier] = useState('');

  const filtered = useMemo(() => {
    return allVenues.filter((v) => {
      if (eventType && !v.eventTypes.some((t) => t.toLowerCase().includes(eventType.toLowerCase()))) {
        return false;
      }
      if (capacityFilter === 'small' && v.capacity > 80) return false;
      if (capacityFilter === 'medium' && (v.capacity <= 80 || v.capacity > 150)) return false;
      if (capacityFilter === 'large' && v.capacity <= 150) return false;
      if (priceTier === 'budget') {
        const n = parseInt(v.priceHint.replace(/\D/g, ''), 10);
        if (!Number.isNaN(n) && n >= 3000) return false;
      }
      if (priceTier === 'premium') {
        const n = parseInt(v.priceHint.replace(/\D/g, ''), 10);
        if (!Number.isNaN(n) && n < 4000) return false;
      }
      return true;
    });
  }, [allVenues, eventType, capacityFilter, priceTier]);

  return (
    <>
      <section className="relative py-24 bg-linear-to-br from-warm-gray-light to-white">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          <div className="absolute top-16 right-16 w-80 h-80 bg-gold rounded-full blur-3xl" />
          <div className="absolute bottom-16 left-16 w-72 h-72 bg-venue-accent rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-thin text-navy mb-4">
            Discover <span className="font-bold text-gold">venues</span> for your event
          </h1>
          <p className="text-lg text-charcoal/90 max-w-2xl mx-auto leading-relaxed">
            No map—just a focused list. Use filters to narrow the grid (demo UI; refine logic as you like).
          </p>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-navy/10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:justify-between mb-8">
            <div className="flex items-center gap-2 text-navy">
              <SlidersHorizontal className="h-5 w-5 text-venue-accent" />
              <h2 className="text-xl font-semibold m-0">Filters</h2>
            </div>
            <p className="text-sm text-charcoal/70 m-0 lg:text-right">Filters update the list below for quick exploration.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-navy">
              Event type
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="rounded-xl border-2 border-gray-200 bg-white px-3 py-3 text-charcoal font-normal focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
              >
                <option value="">Any</option>
                <option value="wedding">Weddings</option>
                <option value="corporate">Corporate</option>
                <option value="party">Parties</option>
                <option value="workshop">Workshops</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-navy">
              Capacity
              <select
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
                className="rounded-xl border-2 border-gray-200 bg-white px-3 py-3 text-charcoal font-normal focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
              >
                <option value="">Any</option>
                <option value="small">Up to 80</option>
                <option value="medium">81 – 150</option>
                <option value="large">151+</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-navy">
              Price hint
              <select
                value={priceTier}
                onChange={(e) => setPriceTier(e.target.value)}
                className="rounded-xl border-2 border-gray-200 bg-white px-3 py-3 text-charcoal font-normal focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
              >
                <option value="">Any</option>
                <option value="budget">Under ~$3k</option>
                <option value="premium">$4k+</option>
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
                Reset filters
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-warm-gray min-h-[40vh]">
        <div className="max-w-7xl mx-auto px-8">
          <p className="text-sm text-charcoal/70 mb-6">
            Showing <span className="font-semibold text-navy">{filtered.length}</span> venues
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((venue) => (
              <article
                key={venue.id}
                className="group rounded-2xl border border-navy/10 bg-white overflow-hidden shadow-sm hover:shadow-gold transition-shadow"
              >
                <Link to={`/venue/${venue.id}`} className="block relative aspect-[4/3] overflow-hidden bg-navy/10">
                  <img
                    src={venue.images[0]}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {venue.eventTypes.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-navy border border-navy/10"
                      >
                        {t}
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
                    <span>Up to {venue.capacity} guests</span>
                  </div>
                  <p className="text-sm font-semibold text-venue-accent m-0">{venue.priceHint}</p>
                  <Link
                    to={`/venue/${venue.id}`}
                    className="inline-flex text-sm font-medium text-navy underline underline-offset-4 hover:text-gold"
                  >
                    View details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
