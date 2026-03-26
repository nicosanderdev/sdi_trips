import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '../../components/ui';
import GuestBookingFlow from '../../components/sections/GuestBookingFlow';
import {
  MapPin,
  Users,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { getEventVenueById, type EventVenue } from '../../services/eventVenueService';

export default function AltVenueDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [venue, setVenue] = useState<EventVenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [galleryOpacity, setGalleryOpacity] = useState(1);
  const [showBookingFlow, setShowBookingFlow] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getEventVenueById(id);
        setVenue(data);
      } catch (_error) {
        setError('Failed to load venue details.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const heroImages = venue?.images ?? [];
  const heroImageCount = heroImages.length;
  const displayImageIndex = heroImageCount > 0 ? currentImageIndex % heroImageCount : 0;

  const transitionThenSetIndex = (nextIndex: number) => {
    setGalleryOpacity(0);
    window.setTimeout(() => {
      setCurrentImageIndex(nextIndex);
      setGalleryOpacity(1);
    }, 200);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-8 py-20 bg-warm-gray">
        <p className="text-charcoal">Loading venue details...</p>
      </div>
    );
  }

  if (!venue || error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-8 py-20 bg-warm-gray">
        <h1 className="text-2xl font-bold text-navy mb-4">{t('alt.venueDetail.notFoundTitle')}</h1>
        <p className="text-charcoal mb-6 text-center max-w-md">{error ?? t('alt.venueDetail.notFoundBody')}</p>
        <Link to="/search">
          <Button variant="primary">{t('alt.venueDetail.backToVenues')}</Button>
        </Link>
      </div>
    );
  }

  const suffix = t('alt.venueDetail.pricingHintSuffix');
  const attributeBlocks = [
    {
      title: t('alt.venueDetail.capacityLayoutTitle'),
      description: t('alt.venueDetail.capacityLayoutDesc', { capacity: venue.capacity, layoutNotes: venue.layoutNotes }),
      icon: <Users className="h-6 w-6 text-gold" />,
    },
    {
      title: t('alt.venueDetail.eventTypesTitle'),
      description: venue.eventTypes.join(' · '),
      icon: <Sparkles className="h-6 w-6 text-gold" />,
    },
    {
      title: t('alt.venueDetail.pricingHintTitle'),
      description: t('alt.venueDetail.pricingHintDesc', { priceHint: venue.priceHint, suffix }),
      icon: <Sparkles className="h-6 w-6 text-gold" />,
    },
  ];

  return (
    <div className="bg-warm-gray min-h-screen pb-16">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-charcoal">
          <Link to="/search" className="flex items-center gap-2 text-charcoal hover:text-navy transition-colors w-fit">
            <ChevronLeft className="h-4 w-4" />
            <span>{t('alt.venueDetail.backToVenues')}</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-charcoal/80">
            <MapPin className="h-4 w-4 text-gold" />
            <span>{venue.location}</span>
          </div>
        </div>

        <section className="space-y-6">
          <div className="relative rounded-4xl overflow-hidden bg-white shadow-[0_25px_60px_-25px_rgba(43,43,43,0.35)] aspect-4/3">
            <img
              key={displayImageIndex}
              src={heroImages[displayImageIndex]}
              alt={venue.name}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ease-in-out"
              style={{ opacity: galleryOpacity }}
            />
            {heroImageCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    transitionThenSetIndex((displayImageIndex - 1 + heroImageCount) % heroImageCount)
                  }
                  className="absolute top-1/2 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-lg transition-colors hover:bg-white"
                  aria-label={t('alt.venueDetail.prevImage')}
                >
                  <ChevronLeft className="h-5 w-5 text-navy" />
                </button>
                <button
                  type="button"
                  onClick={() => transitionThenSetIndex((displayImageIndex + 1) % heroImageCount)}
                  className="absolute top-1/2 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-lg transition-colors hover:bg-white"
                  aria-label={t('alt.venueDetail.nextImage')}
                >
                  <ChevronRight className="h-5 w-5 text-navy" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium tracking-wide text-navy shadow-md">
              {displayImageIndex + 1} / {heroImageCount}
            </div>
          </div>

          {heroImageCount > 1 && (
            <div className="flex gap-3 overflow-x-auto py-2">
              {heroImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => index !== displayImageIndex && transitionThenSetIndex(index)}
                  className={`flex h-20 w-20 shrink-0 overflow-hidden rounded-2xl border transition-all ${
                    index === displayImageIndex ? 'border-gold' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-charcoal/80">
                <MapPin className="h-4 w-4 text-gold" />
                <span>{venue.location}</span>
                <span aria-hidden>•</span>
                <span className="text-venue-accent font-medium">{t('alt.venueDetail.curatedBadge')}</span>
              </div>
              <h1 className="text-4xl font-thin leading-tight text-navy">{venue.name}</h1>
              <p className="max-w-3xl text-lg text-charcoal">{venue.subtitle}</p>
              <p className="text-charcoal/90 leading-relaxed">{venue.description}</p>

              <div className="flex flex-wrap gap-6 text-sm text-charcoal">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gold" />
                  <span>{t('alt.venueDetail.guestsCount', { count: venue.capacity })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-venue-accent" />
                  <span>{t('alt.venueDetail.eventCategoriesCount', { count: venue.eventTypes.length })}</span>
                </div>
              </div>

              <section className="space-y-4 pt-4">
                <h2 className="text-2xl font-semibold text-navy">{t('alt.venueDetail.whyWorks')}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {attributeBlocks.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start gap-4 rounded-3xl border border-warm-gray bg-white/80 p-4 shadow-sm"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warm-gray-light">{item.icon}</div>
                      <div>
                        <p className="text-sm font-semibold text-charcoal">{item.title}</p>
                        <p className="text-sm text-charcoal/80">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-navy">{t('alt.venueDetail.amenities')}</h3>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {venue.amenities.map((a) => (
                      <div
                        key={a}
                        className="flex items-center gap-2 rounded-2xl border border-warm-gray bg-white/80 px-3 py-2 text-sm text-charcoal"
                      >
                        <CheckCircle className="h-4 w-4 text-gold shrink-0" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-navy">{t('alt.venueDetail.policies')}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {venue.policies.map((p) => (
                      <div key={p.title} className="rounded-2xl border border-navy/10 bg-white p-4">
                        <p className="text-sm font-semibold text-navy">{p.title}</p>
                        <p className="text-sm text-charcoal/85 mt-2 m-0">{p.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <Card className="space-y-4 rounded-4xl border border-warm-gray bg-white/80 p-6 shadow-[0_20px_40px_-20px_rgba(43,43,43,0.35)]">
                <div className="flex items-center gap-4">
                  <img
                    src="https://ui-avatars.com/api/?name=Venue+Coordinator&background=F3E9DD&color=2B2B2B"
                    alt=""
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-charcoal/70">{t('alt.venueDetail.coordinatorTeam')}</p>
                    <h3 className="text-xl font-semibold text-navy">{t('alt.venueDetail.coordinatorNames')}</h3>
                    <p className="text-sm text-charcoal">{t('alt.venueDetail.coordinatorRole')}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-charcoal">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gold" />
                    <span>{t('alt.venueDetail.coordinatorBullet1')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gold" />
                    <span>{t('alt.venueDetail.coordinatorBullet2')}</span>
                  </div>
                </div>
                <Link
                  to="/contact"
                  className="flex items-center justify-center gap-2 rounded-full border border-warm-gray px-4 py-2 text-sm font-medium text-navy hover:border-gold transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-venue-accent" />
                  {t('alt.venueDetail.messageVenue')}
                </Link>
              </Card>

              <Card className="space-y-4 rounded-4xl border border-warm-gray bg-white p-6 shadow-[0_20px_45px_-25px_rgba(43,43,43,0.35)]">
                <div className="space-y-1 text-center">
                  <p className="text-xs uppercase tracking-[0.35em] text-charcoal/70">{t('alt.venueDetail.startingFrom')}</p>
                  <div className="text-2xl font-semibold text-navy">{venue.priceHint}</div>
                  <p className="text-sm text-charcoal">{t('alt.venueDetail.taxesNote')}</p>
                </div>
                <Button variant="primary" size="lg" className="w-full" type="button" onClick={() => setShowBookingFlow((s) => !s)}>
                  {t('alt.venueDetail.checkAvailability')}
                </Button>

                {showBookingFlow && (
                  <div className="pt-4 border-t border-warm-gray space-y-4">
                    <GuestBookingFlow property={venue} />
                  </div>
                )}
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
