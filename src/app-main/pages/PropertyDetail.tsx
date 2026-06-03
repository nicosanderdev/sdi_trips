import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import mapboxgl from 'mapbox-gl';
import { Layout } from '../../components/layout';
import { Button, Card } from '../../components/ui';
import GuestBookingFlow from '../../components/sections/GuestBookingFlow';
import PropertyReviewsSection from '../../components/sections/PropertyReviewsSection';
import PropertyContentSections from '../../components/sections/PropertyContentSections';
import PropertyAmenitySections from '../../components/amenities/PropertyAmenitySections';
import PropertyPolicySections from '../../components/policies/PropertyPolicySections';
import { getPropertyById } from '../../services/propertyService';
import { getUtmSourceAndMedium, trackEvent } from '../../lib/analytics';
import { logPropertyVisit } from '../../services/propertyVisitService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import type { Property } from '../../types';
import { useDisplayPrice } from '../../hooks/useDisplayPrice';
import {
  formatPriceAmount,
  getPriceLabelKey,
} from '../../services/pricing/formatPrice';
import { parseIsoDateLocal } from '../../services/pricing/listingPricing';
import {
    MapPin,
    Users,
    Bed,
    Bath,
    ChevronLeft,
    ChevronRight,
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

const PropertyDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();

    const dateSearchContext = useMemo(() => {
        const checkInParam = searchParams.get('checkIn');
        const checkOutParam = searchParams.get('checkOut');
        if (!checkInParam || !checkOutParam) return null;
        const checkIn = parseIsoDateLocal(checkInParam);
        const checkOut = parseIsoDateLocal(checkOutParam);
        if (!checkIn || !checkOut || checkOut <= checkIn) return null;
        return { checkIn, checkOut };
    }, [searchParams]);

    const hasDateSearchContext = dateSearchContext !== null;

    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [galleryOpacity, setGalleryOpacity] = useState(1);
    const [lightboxOpacity, setLightboxOpacity] = useState(1);
    const [showBookingCalendar, setShowBookingCalendar] = useState(false);
    const { t, i18n } = useTranslation();
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const placeholderProperty = useMemo<Property>(
        () => ({
            id: '',
            title: '',
            location: '',
            price: 0,
            basePrice: 0,
            currency: 'USD',
            images: [],
            bedrooms: 0,
            bathrooms: 0,
            maxGuests: 0,
            description: '',
            amenities: [],
            rating: 0,
            reviewCount: 0,
            host: { id: '', name: '', email: '', verified: false },
            available: false,
            coordinates: { lat: 0, lng: 0 },
        }),
        [],
    );

    const { breakdown: exploreBreakdown, loading: explorePriceLoading } = useDisplayPrice({
        property: property ?? placeholderProperty,
        checkIn: dateSearchContext?.checkIn,
        checkOut: dateSearchContext?.checkOut,
        enabled: Boolean(property),
    });

    const showCalendar = hasDateSearchContext || showBookingCalendar;

    const sidebarPriceAmount = exploreBreakdown
        ? exploreBreakdown.displayLabel === 'total_stay'
            ? exploreBreakdown.total
            : exploreBreakdown.nightlyAverage
        : property?.price ?? 0;
    const sidebarPriceLabelKey = exploreBreakdown
        ? getPriceLabelKey(exploreBreakdown.displayLabel)
        : 'pricing.perNight';
    const sidebarFormattedPrice = property
        ? formatPriceAmount(sidebarPriceAmount, property.currency)
        : '';

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
                    setError(t('propertyDetail.errors.propertyNotFound'));
                }
            } catch (err) {
                console.error('Error fetching property:', err);
                setError(t('propertyDetail.errors.failedToLoad'));
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [id, t]);

    // Property view tracking: first-party analytics + Supabase PropertyVisitLogs (throttled)
    useEffect(() => {
        if (!property?.id) return;
        const { source } = getUtmSourceAndMedium();
        trackEvent('property_view', {
            property_id: property.id,
            metadata: {
                property_slug: id ?? undefined,
                company_id: property.ownerId,
                listing_type: property.listingType,
            },
        });
        logPropertyVisit(property.id, source ?? 'unknown');
    }, [property?.id, id, property?.ownerId, property?.listingType]);

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
    const hostName = property.host?.name?.trim() || t('propertyDetail.host.defaultName');
    const hostFirstName = hostName.split(' ')[0];
    const hostSinceYear = property.host?.sinceYear || '2019';
    const hostBio = property.host?.bio || t('propertyDetail.host.bioDefault');
    const descriptionBody =
        property.description?.trim() || t('propertyDetail.description.fallback');
    const neighborhoodCopy =
        property.neighborhoodDetails || t('propertyDetail.detailSections.neighborhood.default');
    const secondaryGalleryImages = heroImages.slice(0, 6);

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
                                        className={`flex h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border transition-all ${index === heroImageIndex ? 'border-gold' : 'border-transparent'
                                            }`}
                                    >
                                        <img src={image} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Title, features, host sidebar */}
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm text-charcoal/80">
                                    <MapPin className="h-4 w-4 text-gold" />
                                    <span>{property.location}</span>
                                    <span>•</span>
                                    <span>{t('propertyDetail.trustSignals.localResident')}</span>
                                </div>
                                <h1 className="text-4xl font-thin leading-tight text-navy">{property.title}</h1>
                                <p className="max-w-3xl text-lg leading-relaxed text-charcoal whitespace-pre-line">
                                    {descriptionBody}
                                </p>
                            </div>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-semibold text-navy">
                                    {t('propertyDetail.someFeatures.heading')}
                                </h2>
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
                            </section>

                            <PropertyAmenitySections
                                publicAmenities={property.publicAmenities}
                                fallbackNames={property.amenities}
                                locale={i18n.language}
                                describedHeading={t('propertyDetail.attributes.heading')}
                                nameOnlyHeading={t('propertyDetail.amenities.heading')}
                            />
                        </div>
                            {/* Sidebar - CTA & Host */}
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
                                    <p className="text-sm leading-relaxed text-charcoal pt-2 border-t border-warm-gray">{hostBio}</p>
                                </Card>
                                <Card className="space-y-4 rounded-[2rem] border border-warm-gray bg-white p-6 shadow-[0_20px_45px_-25px_rgba(10,26,47,0.5)]">
                                    <div className="space-y-2 text-center">
                                        <p className="text-xs uppercase tracking-[0.4em] text-charcoal/70">
                                            {explorePriceLoading
                                                ? t('propertyDetail.pricing.loading')
                                                : t(sidebarPriceLabelKey)}
                                        </p>
                                        <div className="text-3xl font-semibold text-navy">
                                            {explorePriceLoading ? '…' : sidebarFormattedPrice}
                                        </div>
                                        <p className="text-sm text-charcoal">
                                            {exploreBreakdown?.displayLabel === 'from'
                                                ? t('propertyDetail.pricing.fromHint')
                                                : t('propertyDetail.pricing.perNight')}
                                        </p>
                                    </div>
                                    {!hasDateSearchContext && (
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="w-full bg-gold text-navy hover:bg-gold-dark"
                                            onClick={() => setShowBookingCalendar((prev) => !prev)}
                                        >
                                            {t('propertyDetail.cta.checkAvailability')}
                                        </Button>
                                    )}
                                    {showCalendar && (
                                        <div className={`relative ${hasDateSearchContext ? 'pt-2' : 'pt-4 border-t border-warm-gray'}`}>
                                            <GuestBookingFlow
                                                property={property}
                                                initialCheckIn={dateSearchContext?.checkIn}
                                                initialCheckOut={dateSearchContext?.checkOut}
                                            />
                                        </div>
                                    )}
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
                            </div>
                    </div>

                    <section className="space-y-8">
                        <PropertyContentSections
                            publicContentSections={property.publicContentSections}
                            legacySections={property.sections}
                            locale={i18n.language}
                        />

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
                            <h3 className="text-xl font-semibold text-navy">
                                {t('propertyDetail.secondaryGallery.heading')}
                            </h3>
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

                        {id && (
                            <PropertyReviewsSection
                                propertyId={id}
                                propertyTitle={property.title}
                                fallbackRating={property.rating}
                                fallbackReviewCount={property.reviewCount}
                            />
                        )}
                    </section>

                    <PropertyPolicySections
                        publicPolicies={property.publicPolicies}
                        heading={t('propertyDetail.policies.heading')}
                        locale={i18n.language}
                    />
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