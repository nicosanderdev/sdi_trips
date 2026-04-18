import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui';
import { Heart, Briefcase, PartyPopper } from 'lucide-react';
import { listLocalizedVenues } from '../data/venueLocale';
import { getFeaturedEventVenues, type EventVenue } from '../../services/eventVenueService';

const HERO_IMAGES = ['/alt-carousel-1.jpg', '/alt-carousel-2.jpg', '/alt-carousel-3.jpg'] as const;

/** Full-bleed hero background: fixed (does not follow carousel). */
const HERO_STATIC_BACKGROUND =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80';

const SLIDE_COUNT = HERO_IMAGES.length;

interface LandingVenueCard {
  id: string;
  name: string;
  location: string;
  capacity: number;
  priceHint: string;
  images: string[];
}

function mapFeaturedVenueToCard(venue: EventVenue): LandingVenueCard {
  const capacity = venue.capacity || venue.maxGuests || 0;
  const fallbackPriceHint = `From $${venue.priceFrom.toLocaleString()} per event`;
  return {
    id: venue.id,
    name: venue.name,
    location: venue.location,
    capacity,
    priceHint: venue.priceHint || fallbackPriceHint,
    images: venue.images?.length ? venue.images : [...HERO_IMAGES],
  };
}

export default function AltLanding() {
  const { t } = useTranslation();
  const [slideIndex, setSlideIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const [popularVenues, setPopularVenues] = useState<LandingVenueCard[]>([]);
  const [loadingPopularVenues, setLoadingPopularVenues] = useState(true);
  const [popularVenuesFetchFailed, setPopularVenuesFetchFailed] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const fallbackPopularVenues = listLocalizedVenues(t).slice(0, 6);

  const searchHref = useMemo(() => {
    const params = new URLSearchParams();
    if (eventDate) params.set('date', eventDate);
    const guests = parseInt(guestCount, 10);
    if (Number.isFinite(guests) && guests >= 1) params.set('guests', String(guests));
    const q = params.toString();
    return q ? `/search?${q}` : '/search';
  }, [eventDate, guestCount]);

  const featureCards = [
    { icon: Heart, titleKey: 'alt.landing.features.weddings.title', descKey: 'alt.landing.features.weddings.description' },
    { icon: Briefcase, titleKey: 'alt.landing.features.corporate.title', descKey: 'alt.landing.features.corporate.description' },
    { icon: PartyPopper, titleKey: 'alt.landing.features.parties.title', descKey: 'alt.landing.features.parties.description' },
  ] as const;

  const howSteps = [
    { titleKey: 'alt.landing.howItWorks.step1Title', descKey: 'alt.landing.howItWorks.step1Desc' },
    { titleKey: 'alt.landing.howItWorks.step2Title', descKey: 'alt.landing.howItWorks.step2Desc' },
    { titleKey: 'alt.landing.howItWorks.step3Title', descKey: 'alt.landing.howItWorks.step3Desc' },
    { titleKey: 'alt.landing.howItWorks.step4Title', descKey: 'alt.landing.howItWorks.step4Desc' },
  ] as const;

  useEffect(() => {
    const id = window.setInterval(() => {
      setFade(true);
      window.setTimeout(() => {
        setSlideIndex((i) => (i + 1) % SLIDE_COUNT);
        setFade(false);
      }, 400);
    }, 8000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadFeaturedVenues = async () => {
      setLoadingPopularVenues(true);
      setPopularVenuesFetchFailed(false);

      try {
        const featuredVenues = await getFeaturedEventVenues(6);
        if (!isMounted) return;
        setPopularVenues(featuredVenues.map(mapFeaturedVenueToCard));
      } catch (error) {
        console.error('Failed to load featured event venues for alt landing:', error);
        if (!isMounted) return;
        setPopularVenues([]);
        setPopularVenuesFetchFailed(true);
      } finally {
        if (isMounted) {
          setLoadingPopularVenues(false);
        }
      }
    };

    void loadFeaturedVenues();

    return () => {
      isMounted = false;
    };
  }, []);

  const heroImage = HERO_IMAGES[slideIndex];
  const heroQuote = t(`alt.landing.hero.slides.${slideIndex}.quote`);
  const popularCards = popularVenuesFetchFailed ? fallbackPopularVenues : popularVenues;

  return (
    <>
      <section className="group relative min-h-screen overflow-hidden bg-navy isolate">
        <div
          className="absolute inset-0 bg-cover bg-center scale-100 transition-transform duration-700 will-change-transform group-hover:scale-110"
          style={{ backgroundImage: `url("${HERO_STATIC_BACKGROUND}")` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(105deg,rgba(43,43,43,0.88)_0%,rgba(43,43,43,0.72)_45%,rgba(43,43,43,0.5)_100%)]"
          aria-hidden
        />

        <div className="relative z-10 max-w-7xl mx-auto px-8 py-16 min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="m-0 text-white font-bold text-[clamp(2rem,4vw,3.5rem)] leading-[1.1] max-w-[16ch]">
              {t('alt.landing.hero.title')}
            </h1>
            <p className="mt-4 text-white/95 text-[clamp(1rem,1.8vw,1.25rem)] max-w-[36ch]">{t('alt.landing.hero.subtitle')}</p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] gap-3 items-end w-full max-w-[640px] p-3 rounded-2xl border border-gold/35 bg-white/95 backdrop-blur-sm">
              <label htmlFor="hero-search-date" className="flex flex-col gap-1.5 text-xs font-semibold text-navy m-0">
                {t('alt.landing.hero.searchDateLabel')}
                <input
                  id="hero-search-date"
                  className="w-full border border-navy/15 rounded-xl bg-white text-navy text-sm px-3 py-3 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold font-normal"
                  type="date"
                  name="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  aria-label={t('alt.landing.hero.searchDateAria')}
                />
              </label>
              <label htmlFor="hero-search-guests" className="flex flex-col gap-1.5 text-xs font-semibold text-navy m-0">
                {t('alt.landing.hero.searchGuestsLabel')}
                <input
                  id="hero-search-guests"
                  className="w-full border border-navy/15 rounded-xl bg-white text-navy text-sm px-3 py-3 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold font-normal"
                  type="number"
                  name="guests"
                  min={1}
                  max={5000}
                  step={1}
                  inputMode="numeric"
                  placeholder={t('alt.landing.hero.searchGuestsPlaceholder')}
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  aria-label={t('alt.landing.hero.searchGuestsAria')}
                />
              </label>
              <Link to={searchHref} className="w-full sm:col-span-2 lg:col-span-1 lg:justify-self-end">
                <Button type="button" variant="primary" size="md" className="w-full lg:w-auto justify-center">
                  {t('alt.landing.hero.searchCta')}
                </Button>
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-4">
              <p className="m-0 text-sm font-semibold text-white/90 before:content-['✓'] before:text-gold before:mr-2">
                {t('alt.landing.hero.badgeCurated')}
              </p>
              <p className="m-0 text-sm font-semibold text-white/90 before:content-['✓'] before:text-gold before:mr-2">
                {t('alt.landing.hero.badgeCapacity')}
              </p>
              <p className="m-0 text-sm font-semibold text-white/90 before:content-['✓'] before:text-gold before:mr-2">
                {t('alt.landing.hero.badgeHoldDemo')}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/search">
                <Button variant="primary" size="lg">
                  {t('alt.landing.hero.exploreCta')}
                </Button>
              </Link>
              <Link to="/reservations">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-navy hover:border-gold hover:text-gold"
                >
                  {t('alt.landing.hero.talkCta')}
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative min-h-[400px] rounded-3xl overflow-hidden border border-gold/25 shadow-2xl bg-white/10 backdrop-blur-sm">
            <div
              className={`absolute inset-0 p-8 flex flex-col justify-end bg-cover bg-center transition-opacity duration-500 ${fade ? 'opacity-80' : 'opacity-100'}`}
              style={{ backgroundImage: `url("${heroImage}")` }}
            >
              <div className="absolute inset-0 bg-linear-to-t from-navy/90 to-navy/20" />
              <h3 className="relative z-10 m-0 text-lg font-bold text-white">{t('alt.landing.hero.storiesHeading')}</h3>
              <p className="relative z-10 mt-2 text-white/90 text-sm leading-relaxed">{heroQuote}</p>
            </div>
            <div className="absolute left-1/2 bottom-4 -translate-x-1/2 z-20 flex gap-2">
              {HERO_IMAGES.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSlideIndex(index)}
                  className={`h-2 w-2 rounded-full transition-all ${index === slideIndex ? 'bg-gold scale-125' : 'bg-white/50'}`}
                  aria-label={t('alt.landing.hero.storyDotAria', { n: index + 1 })}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <p className="m-0 text-sm uppercase tracking-[0.08em] font-bold text-navy/70">{t('alt.landing.occasions.eyebrow')}</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-navy">{t('alt.landing.occasions.heading')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featureCards.map(({ icon: Icon, titleKey, descKey }) => (
              <article
                key={titleKey}
                className="rounded-2xl border border-navy/10 bg-warm-gray p-6 hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-full grid place-items-center bg-white text-venue-accent border border-navy/10">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-navy">{t(titleKey)}</h3>
                <p className="m-0 mt-2 text-sm text-charcoal/85 leading-relaxed">{t(descKey)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-warm-gray">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-10">
            <p className="m-0 text-sm uppercase tracking-[0.08em] font-bold text-navy/70">{t('alt.landing.popular.eyebrow')}</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-navy">{t('alt.landing.popular.heading')}</h2>
            <p className="mt-3 text-charcoal/80 max-w-3xl mx-auto">{t('alt.landing.popular.sub')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {loadingPopularVenues &&
              Array.from({ length: 6 }).map((_, index) => (
                <article
                  key={`popular-skeleton-${index}`}
                  className="relative min-h-[220px] border border-navy/15 rounded-2xl overflow-hidden bg-white/70 animate-pulse"
                />
              ))}

            {!loadingPopularVenues &&
              popularCards.map((venue, index) => {
                const image = venue.images[0] ?? HERO_IMAGES[0];
                return (
                  <article key={venue.id} className="relative min-h-[220px] border border-navy/15 rounded-2xl overflow-hidden bg-navy group">
                    <Link to={`/venue/${venue.id}`} className="absolute inset-0 z-10" aria-label={venue.name} />
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url("${image}")` }}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-navy/90 to-navy/35" />
                    <div className="absolute left-4 right-4 bottom-4 z-20 flex items-end justify-between gap-3">
                      <div>
                        <h3 className="m-0 text-white text-lg font-semibold">{venue.name}</h3>
                        <p className="m-0 mt-1 text-white/85 text-sm">{venue.location}</p>
                        <p className="m-0 mt-1 text-white/75 text-xs">
                          {t('alt.landing.popular.guestsLine', { count: venue.capacity, priceHint: venue.priceHint })}
                        </p>
                      </div>
                      {index === 0 && (
                        <span className="rounded-full px-3 py-1 text-xs font-bold bg-gold text-navy whitespace-nowrap">
                          {t('alt.landing.popular.popularBadge')}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}

            {!loadingPopularVenues && !popularVenuesFetchFailed && popularCards.length === 0 && (
              <article className="col-span-full rounded-2xl border border-navy/15 bg-white px-6 py-10 text-center">
                <p className="m-0 text-charcoal/85">
                  {t('alt.landing.popular.empty', { defaultValue: 'No featured venues are available right now.' })}
                </p>
              </article>
            )}
          </div>

          <div className="text-center">
            <Link to="/search">
              <Button variant="outline" size="lg">
                {t('alt.landing.popular.cta')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-navy">{t('alt.landing.howItWorks.heading')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {howSteps.map((step, i) => (
              <article key={step.titleKey} className="rounded-2xl border border-navy/10 bg-warm-gray p-5">
                <div className="w-10 h-10 rounded-full grid place-items-center bg-white text-navy border border-navy/15 font-bold">
                  {i + 1}
                </div>
                <h3 className="mt-4 mb-2 text-lg font-semibold text-navy">{t(step.titleKey)}</h3>
                <p className="m-0 text-sm text-charcoal/85">{t(step.descKey)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-thin mb-8">
            {t('alt.landing.ctaBand.titleBefore')}
            <span className="font-bold text-gold">{t('alt.landing.ctaBand.titleHighlight')}</span>
            {t('alt.landing.ctaBand.titleAfter')}
          </h2>
          <Link to="/search">
            <Button variant="primary" size="lg">
              {t('alt.landing.ctaBand.button')}
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
