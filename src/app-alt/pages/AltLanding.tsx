import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listLocalizedVenues } from '../data/venueLocale';
import { useSearchPricing } from '../../hooks/useSearchPricing';
import { getFeaturedEventVenues, type EventVenue } from '../../services/eventVenueService';
import { buildVenuePriceHint } from '../../services/pricing';
import HumanTouchSection from '../../components/sections/HumanTouchSection';
import {
  LandingHero,
  OccasionsEditorial,
  FeaturedStays,
  ProcessTimeline,
  CtaBand,
  type FeaturedStayCard,
} from '../../components/sections/landing';
import { isSearchPageEnabled } from '../../core/config/searchPageVisibility';

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
    images: venue.images?.length ? venue.images : ['/alt-explore.jpg'],
  };
}

export default function AltLanding() {
  const { t } = useTranslation();
  const [popularVenuesRaw, setPopularVenuesRaw] = useState<EventVenue[]>([]);
  const [popularVenues, setPopularVenues] = useState<LandingVenueCard[]>([]);
  const [loadingPopularVenues, setLoadingPopularVenues] = useState(true);
  const [popularVenuesFetchFailed, setPopularVenuesFetchFailed] = useState(false);
  const fallbackPopularVenues = listLocalizedVenues(t).slice(0, 6);

  useEffect(() => {
    if (!isSearchPageEnabled) return;

    let isMounted = true;

    const loadFeaturedVenues = async () => {
      setLoadingPopularVenues(true);
      setPopularVenuesFetchFailed(false);

      try {
        const featuredVenues = await getFeaturedEventVenues();
        if (!isMounted) return;
        setPopularVenuesRaw(featuredVenues);
      } catch (error) {
        console.error('Failed to load featured event venues for alt landing:', error);
        if (!isMounted) return;
        setPopularVenuesRaw([]);
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

  const { priceByPropertyId } = useSearchPricing(popularVenuesRaw);

  useEffect(() => {
    if (!popularVenuesRaw.length) return;
    setPopularVenues(
      popularVenuesRaw.map((venue) => {
        const priced = priceByPropertyId.get(venue.id);
        const card = mapFeaturedVenueToCard(venue);
        if (!priced) return card;
        return {
          ...card,
          priceHint: buildVenuePriceHint(
            priced.amount,
            priced.labelKey,
            venue.currency,
            t,
          ),
        };
      }),
    );
  }, [popularVenuesRaw, priceByPropertyId, t]);

  const popularCards: LandingVenueCard[] = popularVenuesFetchFailed
    ? fallbackPopularVenues.map((venue) => ({
        id: venue.id,
        name: venue.name,
        location: venue.location,
        capacity: venue.capacity,
        priceHint: venue.priceHint,
        images: venue.images?.length ? venue.images : ['/alt-explore.jpg'],
      }))
    : popularVenues;

  const featuredCards: FeaturedStayCard[] = popularCards.map((venue) => ({
    id: venue.id,
    title: venue.name,
    location: venue.location,
    image: venue.images[0] ?? '/alt-explore.jpg',
    href: `/venue/${venue.id}`,
    meta: t('alt.landing.popular.guestsLine', {
      count: venue.capacity,
      priceHint: venue.priceHint,
    }),
  }));

  const processSteps = [
    {
      title: t('alt.landing.howItWorks.step1Title'),
      description: t('alt.landing.howItWorks.step1Desc'),
    },
    {
      title: t('alt.landing.howItWorks.step2Title'),
      description: t('alt.landing.howItWorks.step2Desc'),
    },
    {
      title: t('alt.landing.howItWorks.step3Title'),
      description: t('alt.landing.howItWorks.step3Desc'),
    },
    {
      title: t('alt.landing.howItWorks.step4Title'),
      description: t('alt.landing.howItWorks.step4Desc'),
    },
  ];

  return (
    <>
      <LandingHero variant="alt" />

      <OccasionsEditorial />

      {isSearchPageEnabled && (
        <FeaturedStays
          eyebrow={t('alt.landing.popular.eyebrow')}
          title={t('alt.landing.popular.heading')}
          subtitle={t('alt.landing.popular.sub')}
          viewAllLabel={t('alt.landing.popular.cta')}
          popularBadge={t('alt.landing.popular.popularBadge')}
          emptyMessage={t('alt.landing.popular.empty', {
            defaultValue: 'No featured venues are available right now.',
          })}
          loading={loadingPopularVenues}
          items={featuredCards}
        />
      )}

      <ProcessTimeline
        title={t('alt.landing.howItWorks.heading')}
        steps={processSteps}
        ctaLabel={t('alt.landing.hero.exploreCta')}
        ctaFallbackLabel={t('alt.landing.hero.talkCta')}
      />

      {isSearchPageEnabled && <CtaBand />}

      <HumanTouchSection variant="alt" />
    </>
  );
}
