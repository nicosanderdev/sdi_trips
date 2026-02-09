import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import mapboxgl from 'mapbox-gl';
import { Layout } from '../components/layout';
import { Button, Card } from '../components/ui';
import { getPropertyById } from '../services/propertyService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import {
  MapPin,
  Users,
  Bed,
  Bath,
  Star,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Shield,
  MessageCircle,
  X,
  CheckCircle
} from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

const fallbackGalleryImages = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80'
];

const mockReviews = [
  { authorName: 'Maria S.', date: 'January 2025', rating: 4.8, text: 'Wonderful stay. The house was spotless and the host was very responsive. We would definitely come back.' },
  { authorName: 'James L.', date: 'December 2024', rating: 5, text: 'Perfect location and everything we needed was there. The outdoor space was a real highlight for our family.' },
  { authorName: 'Ana R.', date: 'November 2024', rating: 4.5, text: 'Cozy and well equipped. Great base for exploring the area. Check-in was smooth.' }
];

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [galleryOpacity, setGalleryOpacity] = useState(1);
  const [lightboxOpacity, setLightboxOpacity] = useState(1);

  const { t } = useTranslation();
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const propertyData = await getPropertyById(id);
        if (propertyData) {
          setProperty(propertyData);
        } else {
          setError('Property not found');
        }
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Initialize map
  useEffect(() => {
    if (!mapboxToken || !property) return;

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: 'property-detail-map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [property.coordinates.lng, property.coordinates.lat],
      zoom: 12,
    });

    // Add marker
    const markerElement = document.createElement('div');
    markerElement.className = 'w-8 h-8 rounded-full bg-gold border-2 border-white shadow-lg flex items-center justify-center';
    markerElement.innerHTML = '<div class="w-4 h-4 rounded-full bg-white"></div>';

    new mapboxgl.Marker(markerElement)
      .setLngLat([property.coordinates.lng, property.coordinates.lat])
      .addTo(map);

    // Add navigation control
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.remove();
    };
  }, [mapboxToken, property]);

  // Sync image indices when gallery changes
  const heroImages = property?.images?.length ? property.images : fallbackGalleryImages;
  const heroImageCount = heroImages.length;
  
  useEffect(() => {
    if (!heroImageCount) {
      setCurrentImageIndex(0);
      setLightboxIndex(0);
      return;
    }
    setCurrentImageIndex((prev) => prev % heroImageCount);
    setLightboxIndex((prev) => prev % heroImageCount);
  }, [heroImageCount]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <ErrorMessage message={error} />
            <Link to="/search" className="mt-4 inline-block">
              <Button>{t('propertyDetail.buttons.backToSearch')}</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-navy mb-4">{t('propertyDetail.errors.propertyNotFound')}</h1>
            <Link to="/search">
              <Button>{t('propertyDetail.buttons.backToSearch')}</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Prepare data (heroImages and heroImageCount now computed above before early returns)
  const heroImageIndex = heroImageCount ? currentImageIndex % heroImageCount : 0;
  const heroSubtitle =
    property?.subtitle ||
    property?.description?.split('. ')[0] ||
    t('propertyDetail.propertyIdentity.defaultSubtitle');
  const hostName = property.host?.name?.trim() || t('propertyDetail.host.defaultName');
  const hostFirstName = hostName.split(' ')[0];
  const hostSinceYear = property.host?.sinceYear || '2019';
  const hostBio = property.host?.bio || t('propertyDetail.host.bioDefault');
  const hostResponseHours = property.host?.responseTimeHours || 2;
  const outdoorDescription =
    property.outdoorDescription ||
    property.outdoorHighlights ||
    t('propertyDetail.attributes.outdoor.descriptionDefault');
  const homeLayoutCopy =
    property.homeLayout || t('propertyDetail.detailSections.homeLayout.default');
  const outdoorCopy =
    property.outdoorDetails || t('propertyDetail.detailSections.outdoorAreas.default');
  const neighborhoodCopy =
    property.neighborhoodDetails || t('propertyDetail.detailSections.neighborhood.default');

  const attributeItems = [
    {
      title: t('propertyDetail.attributes.sleeping.title'),
      description: t('propertyDetail.attributes.sleeping.description', {
        bedrooms: property.bedrooms || 0
      }),
      icon: <Bed className="h-6 w-6 text-gold" />
    },
    {
      title: t('propertyDetail.attributes.bathrooms.title'),
      description: t('propertyDetail.attributes.bathrooms.description', {
        count: property.bathrooms || 0
      }),
      icon: <Bath className="h-6 w-6 text-gold" />
    },
    {
      title: t('propertyDetail.attributes.kitchen.title'),
      description: t('propertyDetail.attributes.kitchen.description'),
      icon: <Shield className="h-6 w-6 text-gold" />
    },
    {
      title: t('propertyDetail.attributes.comfort.title'),
      description: t('propertyDetail.attributes.comfort.description'),
      icon: <Users className="h-6 w-6 text-gold" />
    },
    {
      title: t('propertyDetail.attributes.wifi.title'),
      description: t('propertyDetail.attributes.wifi.description'),
      icon: <Wifi className="h-6 w-6 text-gold" />
    },
    {
      title: t('propertyDetail.attributes.outdoor.title'),
      description: outdoorDescription,
      icon: <CheckCircle className="h-6 w-6 text-gold" />
    }
  ];

  const descriptionParagraphs =
    property.description
      ?.split('\n')
      .map((paragraph: string) => paragraph.trim())
      .filter(Boolean) || [t('propertyDetail.description.fallback')];

  const secondaryGalleryImages = heroImages.slice(0, 6);
  const amenityList = property.amenities?.length ? property.amenities : [t('propertyDetail.amenities.empty')];

  const policyBlocks = [
    {
      title: t('propertyDetail.policies.checkIn.title'),
      body: (
        <>
          <p className="text-charcoal">{t('propertyDetail.policies.checkIn.times', { time: '3 PM' })}</p>
          <p className="text-charcoal text-sm mt-1">{t('propertyDetail.policies.checkIn.flexible')}</p>
        </>
      )
    },
    {
      title: t('propertyDetail.policies.cancellation.title'),
      body: (
        <>
          <p className="text-charcoal">{t('propertyDetail.policies.cancellation.free', { days: 7 })}</p>
          <p className="text-charcoal text-sm mt-1">{t('propertyDetail.policies.cancellation.refund')}</p>
        </>
      )
    },
    {
      title: t('propertyDetail.policies.houseRules.title'),
      body: (
        <>
          <p className="text-charcoal">{t('propertyDetail.policies.houseRules.quiet')}</p>
          <p className="text-charcoal text-sm mt-1">{t('propertyDetail.policies.houseRules.smoking')}</p>
        </>
      )
    },
    {
      title: t('propertyDetail.policies.children.title'),
      body: (
        <>
          <p className="text-charcoal">{t('propertyDetail.policies.children.childrenWelcome')}</p>
          <p className="text-charcoal text-sm mt-1">{t('propertyDetail.policies.children.petsPolicy')}</p>
        </>
      )
    }
  ];

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setShowLightbox(true);
  };

  const transitionThenSetIndex = (nextIndex: number) => {
    setGalleryOpacity(0);
    window.setTimeout(() => {
      setCurrentImageIndex(nextIndex);
      setGalleryOpacity(1);
    }, 200);
  };

  const nextImage = () => {
    transitionThenSetIndex((currentImageIndex + 1) % heroImageCount);
  };

  const prevImage = () => {
    transitionThenSetIndex((currentImageIndex - 1 + heroImageCount) % heroImageCount);
  };

  const nextLightboxImage = () => {
    setLightboxOpacity(0);
    window.setTimeout(() => {
      setLightboxIndex((prev) => (prev + 1) % heroImageCount);
      setLightboxOpacity(1);
    }, 200);
  };

  const prevLightboxImage = () => {
    setLightboxOpacity(0);
    window.setTimeout(() => {
      setLightboxIndex((prev) => (prev - 1 + heroImageCount) % heroImageCount);
      setLightboxOpacity(1);
    }, 200);
  };

  return (
    <Layout>
      <div className="bg-warm-gray min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
          {/* Navigation */}
          <div className="flex items-center justify-between text-sm text-charcoal">
            <Link
              to="/search"
              className="flex items-center gap-2 text-charcoal hover:text-navy transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>{t('propertyDetail.nav.backToSearch')}</span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-charcoal/80">
              <MapPin className="h-4 w-4 text-gold" />
              <span>{property.location}</span>
            </div>
          </div>

          {/* Hero Gallery Section */}
          <section className="space-y-6">
            <div className="relative rounded-[2rem] overflow-hidden bg-white shadow-[0_25px_60px_-25px_rgba(10,26,47,0.65)] aspect-[4/3]">
              <img
                key={heroImageIndex}
                src={heroImages[heroImageIndex]}
                alt={property.title}
                className="absolute inset-0 h-full w-full object-cover cursor-pointer transition-opacity duration-200 ease-in-out"
                style={{ opacity: galleryOpacity }}
                onClick={() => handleImageClick(heroImageIndex)}
              />
              {heroImageCount > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute top-1/2 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-lg transition-colors hover:bg-white"
                  >
                    <ChevronLeft className="h-5 w-5 text-navy" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute top-1/2 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-lg transition-colors hover:bg-white"
                  >
                    <ChevronRight className="h-5 w-5 text-navy" />
                  </button>
                </>
              )}
              <div className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium tracking-wide text-navy shadow-md">
                {t('propertyDetail.heroGallery.imageCounter', {
                  current: heroImageIndex + 1,
                  total: heroImageCount
                })}
              </div>
            </div>
            {heroImageCount > 1 && (
              <div className="flex gap-3 overflow-x-auto py-2">
                {heroImages.map((image: string, index: number) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => index !== heroImageIndex && transitionThenSetIndex(index)}
                    className={`flex h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border transition-all ${
                      index === heroImageIndex ? 'border-gold' : 'border-transparent'
                    }`}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Property Identity & Trust Signals */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-charcoal/80">
                  <MapPin className="h-4 w-4 text-gold" />
                  <span>{property.location}</span>
                  <span>•</span>
                  <span>{t('propertyDetail.trustSignals.localResident')}</span>
                </div>
                <h1 className="text-4xl font-thin leading-tight text-navy">{property.title}</h1>
                <p className="max-w-3xl text-lg text-charcoal">{heroSubtitle}</p>
                <div className="flex flex-wrap gap-6 text-sm text-charcoal">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gold" />
                    <span>
                      {t('propertyDetail.propertyIdentity.guests', {
                        count: property.maxGuests || 0
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-gold" />
                    <span>
                      {t('propertyDetail.propertyIdentity.bedrooms', {
                        count: property.bedrooms || 0
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-5 w-5 text-gold" />
                    <span>
                      {t('propertyDetail.propertyIdentity.bathrooms', {
                        count: property.bathrooms || 0
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-charcoal">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span className="font-semibold text-navy">
                    {property.rating?.toFixed(1) ?? '—'}
                  </span>
                  <span>({property.reviewCount ?? 0})</span>
                </div>
              </div>
              <div className="space-y-4">
                <Card className="space-y-4 rounded-[2rem] border border-warm-gray bg-white/80 p-6 shadow-[0_20px_40px_-20px_rgba(10,26,47,0.5)]">
                  <div className="flex items-center gap-4">
                    <img
                      src={property.host.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(hostName)}&background=E5C469&color=0A1A2F`}
                      alt={hostName}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-charcoal/70">
                        {t('propertyDetail.host.heading')}
                      </p>
                      <h3 className="text-xl font-semibold text-navy">{hostName}</h3>
                      <p className="text-sm text-charcoal">
                        {t('propertyDetail.trustSignals.hostSince', {
                          name: hostFirstName,
                          year: hostSinceYear
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-charcoal">
                    {['propertyVerified', 'identityConfirmed', 'ownerOccupied'].map((key) => (
                      <div key={key} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-gold" />
                        <span>{t(`propertyDetail.trustSignals.${key}`)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-charcoal">
                    {t('propertyDetail.trustSignals.verificationDescription')}
                  </p>
                  <Link
                    to="/trust"
                    className="text-sm font-medium text-navy hover:text-gold transition-colors"
                  >
                    {t('propertyDetail.trustSignals.learnMore')}
                  </Link>
                  <p className="text-sm leading-relaxed text-charcoal pt-2 border-t border-warm-gray">{hostBio}</p>
                  <p className="text-xs text-charcoal">{t('propertyDetail.host.responseTime', { hours: hostResponseHours })}</p>
                  <Button variant="outline" className="w-full rounded-2xl">
                    {t('propertyDetail.cta.sendMessage', { name: hostFirstName })}
                  </Button>
                </Card>
              </div>
            </div>
          </section>

          {/* Main Content & Sidebar */}
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] -mt-4">
            <main className="space-y-10">
              {/* Primary Description */}
              <section className="space-y-4 rounded-[2rem] border border-warm-gray bg-white/90 p-6 shadow-[0_20px_40px_-25px_rgba(10,26,47,0.35)]">
                <h2 className="text-2xl font-semibold text-navy">
                  {t('propertyDetail.description.heading')}
                </h2>
                <div className="space-y-4 text-charcoal leading-relaxed">
                  {descriptionParagraphs.slice(0, 3).map((paragraph: string, index: number) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </section>

              {/* Attributes Section */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-navy">
                  {t('propertyDetail.attributes.heading')}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {attributeItems.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start gap-4 rounded-3xl border border-warm-gray bg-white/80 p-4"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warm-gray-light">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-charcoal">{item.title}</p>
                        <p className="text-sm text-charcoal/80">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-navy">{t('propertyDetail.amenities.heading')}</h3>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {amenityList.map((amenity: string) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 rounded-2xl border border-warm-gray bg-white/80 px-3 py-2 text-sm text-charcoal"
                      >
                        <CheckCircle className="h-4 w-4 text-gold flex-shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </main>

            {/* Sidebar - CTA & Host */}
            <aside className="space-y-6">
              <Card className="space-y-4 rounded-[2rem] border border-warm-gray bg-white p-6 shadow-[0_20px_45px_-25px_rgba(10,26,47,0.5)]">
                <div className="space-y-2 text-center">
                  <p className="text-xs uppercase tracking-[0.4em] text-charcoal/70">
                    {t('propertyDetail.cta.pricePerNight', {
                      price: `$${property.price}`
                    })}
                  </p>
                  <div className="text-3xl font-semibold text-navy">${property.price}</div>
                  <p className="text-sm text-charcoal">{t('propertyDetail.pricing.perNight')}</p>
                </div>
                <Button variant="primary" size="lg" className="w-full bg-gold text-navy hover:bg-gold-dark">
                  {t('propertyDetail.cta.checkAvailability')}
                </Button>
                <Button variant="outline" className="w-full">
                  {t('propertyDetail.cta.askAboutDates')}
                </Button>
                <p className="text-xs text-charcoal">{t('propertyDetail.cta.confirmWithHost', { name: hostFirstName })}</p>
                <p className="text-xs text-charcoal">{t('propertyDetail.cta.noPaymentYet')}</p>
                <Link
                  to="/contact"
                  className="flex items-center justify-center gap-2 rounded-full border border-warm-gray px-4 py-2 text-sm font-medium text-navy"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{t('propertyDetail.cta.contactHost', { name: hostFirstName })}</span>
                </Link>
              </Card>
            </aside>
          </div>

          {/* Reviews Section (includes reviews, house layout, outdoor, map, all photos) */}
          <section className="space-y-8">
            <div className="flex items-center justify-between mr-4">
              <h2 className="text-2xl font-semibold text-navy">
                {t('propertyDetail.reviews.heading')}
              </h2>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-gold text-gold" />
                <span className="text-lg font-semibold text-navy">
                  {property.rating != null ? property.rating.toFixed(1) : '—'}
                </span>
              </div>
            </div>
            {mockReviews.length > 0 ? (
              <div className="space-y-4">
                {mockReviews.map((review, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-warm-gray bg-white/80 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-warm-gray-light flex items-center justify-center text-navy font-semibold">
                          {review.authorName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-navy">{review.authorName}</p>
                          <p className="text-xs text-charcoal/80">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-gold text-gold" />
                        <span className="text-sm font-medium text-navy">{review.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-charcoal leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-charcoal text-sm">{t('propertyDetail.reviews.noReviews')}</p>
            )}

            {/* House distribution */}
            <div className="space-y-3 rounded-[2rem] border border-warm-gray bg-white/90 p-6">
              <h3 className="text-xl font-semibold text-navy">
                {t('propertyDetail.detailSections.homeLayout.heading')}
              </h3>
              <p className="text-sm leading-relaxed text-charcoal">{homeLayoutCopy}</p>
            </div>

            {/* Exterior areas */}
            <div className="space-y-3 rounded-[2rem] border border-warm-gray bg-white/90 p-6">
              <h3 className="text-xl font-semibold text-navy">
                {t('propertyDetail.detailSections.outdoorAreas.heading')}
              </h3>
              <p className="text-sm leading-relaxed text-charcoal">{outdoorCopy}</p>
            </div>

            {/* Neighborhood & map */}
            <div className="space-y-3 rounded-[2rem] border border-warm-gray bg-white/90 p-6">
              <div className="flex items-center gap-2 text-xl font-semibold text-navy">
                <MapPin className="h-5 w-5 text-gold" />
                {t('propertyDetail.detailSections.neighborhood.heading')}
              </div>
              <p className="text-sm leading-relaxed text-charcoal">{neighborhoodCopy}</p>
              <div className="relative mt-4 overflow-hidden rounded-[1.5rem] border border-warm-gray bg-white">
                <div id="property-detail-map" className="h-64 w-full"></div>
                {!mapboxToken && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[1.5rem] bg-white/80">
                    <MapPin className="h-10 w-10 text-gray-400" />
                    <p className="text-sm text-charcoal">
                      {t('propertyDetail.placeholders.propertyLocation')}
                    </p>
                    <p className="text-xs text-charcoal/70">{property.location}</p>
                    <p className="text-xs text-charcoal/60">
                      {t('propertyDetail.placeholders.mapboxTokenNote')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* All photos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-navy">
                  {t('propertyDetail.secondaryGallery.heading')}
                </h3>
                {secondaryGalleryImages.length > 1 && (
                  <span className="text-sm text-charcoal/70">
                    {t('propertyDetail.heroGallery.viewAllPhotos')}
                  </span>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {secondaryGalleryImages.map((image: string, index: number) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => handleImageClick(index)}
                    className="overflow-hidden rounded-3xl border border-warm-gray bg-white/70"
                  >
                    <img src={image} alt={`Gallery ${index + 1}`} className="h-52 w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Policies - full width */}
          <section className="mt-10 space-y-4">
            <h2 className="text-2xl font-semibold text-navy">{t('propertyDetail.policies.heading')}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {policyBlocks.map((policy) => (
                <div
                  key={policy.title}
                  className="space-y-2 rounded-2xl border border-warm-gray bg-white/90 p-4 text-sm text-charcoal"
                >
                  <h3 className="text-base font-semibold text-navy">{policy.title}</h3>
                  <div className="space-y-1">{policy.body}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Trust Footer */}
        <section className="bg-white pb-16">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 rounded-[2rem] border border-warm-gray px-6 py-10 text-center">
            <CheckCircle className="h-10 w-10 text-gold" />
            <h3 className="text-2xl font-semibold text-navy">{t('propertyDetail.trustFooter.heading')}</h3>
            <p className="text-sm text-charcoal">{t('propertyDetail.trustFooter.description')}</p>
            <div className="flex flex-col gap-2 text-sm text-charcoal/80 md:flex-row md:justify-center md:gap-6">
              <Link to="/trust" className="font-medium text-navy hover:text-gold">
                {t('propertyDetail.trustFooter.learnMore')}
              </Link>
              <Link to="/contact" className="font-medium text-navy hover:text-gold">
                {t('propertyDetail.trustFooter.support')}
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-5 right-5 z-20 rounded-full bg-white/80 p-2 text-navy transition-colors hover:bg-white"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            onClick={prevLightboxImage}
            className="absolute left-5 top-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-navy transition-colors hover:bg-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <img
            key={lightboxIndex}
            src={heroImages[lightboxIndex]}
            alt={`Gallery ${lightboxIndex + 1}`}
            className="max-h-[80vh] w-auto max-w-full rounded-3xl object-cover transition-opacity duration-200 ease-in-out"
            style={{ opacity: lightboxOpacity }}
          />

          <button
            onClick={nextLightboxImage}
            className="absolute right-5 top-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-navy transition-colors hover:bg-white"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1 text-xs text-navy shadow-lg">
            {t('propertyDetail.heroGallery.imageCounter', {
              current: lightboxIndex + 1,
              total: heroImageCount
            })}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PropertyDetail;
