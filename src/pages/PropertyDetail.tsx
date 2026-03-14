import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import mapboxgl from 'mapbox-gl';
import { Layout } from '../components/layout';
import { Button, Card, LeaveReviewModal } from '../components/ui';
import BookingDatePicker from '../components/sections/BookingDatePicker';
import { getPropertyById } from '../services/propertyService';
import { createBooking } from '../services/bookingService';
import { sendPropertyView, getSourceFromUtmOrReferrer } from '../lib/analytics';
import { logPropertyVisit } from '../services/propertyVisitService';
import { getMemberProfile } from '../services/memberService';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { getBookingEligibility, type BookingEligibility } from '../services/bookingEligibilityService';
import { getReviewsByPropertyId, getReviewEligibilityForProperty } from '../services/reviewService';
import type { PropertyReviewsResult } from '../types';
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
    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);
    const [showBookingCalendar, setShowBookingCalendar] = useState(false);
    const [bookingNotes, setBookingNotes] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [eligibility, setEligibility] = useState<BookingEligibility | null>(null);
    const [eligibilityLoading, setEligibilityLoading] = useState(false);
    const [reviewsResult, setReviewsResult] = useState<PropertyReviewsResult | null>(null);
    const [reviewEligibility, setReviewEligibility] = useState<{
        canReview: boolean;
        booking?: { id: string };
        reason?: string;
    } | null>(null);
    const [reviewEligibilityLoading, setReviewEligibilityLoading] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const { t } = useTranslation();
    const { user } = useAuth();
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

    // Compute booking eligibility for the current user
    useEffect(() => {
        let isMounted = true;

        const loadEligibility = async () => {
            if (!user) {
                if (isMounted) {
                    setEligibility(null);
                }
                return;
            }

            try {
                if (isMounted) {
                    setEligibilityLoading(true);
                }
                const result = await getBookingEligibility(user);
                if (isMounted) {
                    setEligibility(result);
                }
            } catch (err) {
                console.error('Error loading booking eligibility:', err);
            } finally {
                if (isMounted) {
                    setEligibilityLoading(false);
                }
            }
        };

        loadEligibility();

        return () => {
            isMounted = false;
        };
    }, [user]);

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

    // Property view tracking: GA property_view + Supabase PropertyVisitLogs (throttled)
    useEffect(() => {
        if (!property?.id) return;
        const source = getSourceFromUtmOrReferrer();
        sendPropertyView({
            property_id: property.id,
            property_slug: id ?? undefined,
            company_id: property.ownerId,
            listing_type: property.listingType,
            source,
        });
        logPropertyVisit(property.id, source);
    }, [property?.id, id, property?.ownerId, property?.listingType]);

    // Fetch reviews for this property
    useEffect(() => {
        let isMounted = true;

        const loadReviews = async () => {
            if (!id) return;
            try {
                const result = await getReviewsByPropertyId(id);
                if (isMounted) setReviewsResult(result);
            } catch (err) {
                console.error('Error loading reviews:', err);
                if (isMounted) setReviewsResult({ reviews: [], averageRating: 0, totalCount: 0 });
            }
        };

        loadReviews();
        return () => { isMounted = false; };
    }, [id]);

    // Review eligibility for logged-in user (can they leave a review for this property?)
    useEffect(() => {
        let isMounted = true;

        const loadReviewEligibility = async () => {
            if (!user || !id || !property?.id) {
                if (isMounted) setReviewEligibility(null);
                return;
            }
            try {
                if (isMounted) setReviewEligibilityLoading(true);
                const member = await getMemberProfile(user.id);
                if (!member?.id || !isMounted) return;
                const result = await getReviewEligibilityForProperty(id, member.id);
                if (isMounted) setReviewEligibility(result);
            } catch (err) {
                console.error('Error loading review eligibility:', err);
                if (isMounted) setReviewEligibility(null);
            } finally {
                if (isMounted) setReviewEligibilityLoading(false);
            }
        };

        loadReviewEligibility();
        return () => { isMounted = false; };
    }, [user, id, property?.id]);

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

    // Grouped attributes (structure, infrastructure, amenities/location)
    const structureAttributes = [
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
            title: t('propertyDetail.attributes.comfort.title'),
            description: t('propertyDetail.attributes.comfort.description'),
            icon: <Users className="h-6 w-6 text-gold" />
        }
    ];

    const infrastructureAttributes = [
        {
            title: t('propertyDetail.attributes.kitchen.title'),
            description: t('propertyDetail.attributes.kitchen.description'),
            icon: <Shield className="h-6 w-6 text-gold" />
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

    const calculateNights = () => {
        if (!checkIn || !checkOut) return 0;
        const diffTime = checkOut.getTime() - checkIn.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const calculateTotal = () => {
        const nights = calculateNights();
        return nights * (property.price || 0);
    };

    const isLoggedIn = !!user;
    const shouldShowEligibilityOverlay = isLoggedIn && !!eligibility && !eligibility.meetsRequirements;
    const isReserveDisabledForEligibility = isLoggedIn && !!eligibility && !eligibility.meetsRequirements;

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

    const handleBookDates = async () => {
        if (!checkIn || !checkOut) {
            alert(t('booking.selectDates'));
            return;
        }

        if (!user) {
            alert(t('booking.loginRequired'));
            return;
        }

        if (eligibility && !eligibility.meetsRequirements) {
            const message = t('propertyDetail.bookingRequirements.error');
            setBookingError(message);
            alert(message);
            return;
        }

        if (!property?.id) {
            alert(t('booking.error'));
            return;
        }

        try {
            setBookingLoading(true);
            setBookingError(null);
            setBookingSuccess(false);

            const totalPrice = calculateTotal();
            const guests = 1;

            const result = await createBooking({
                propertyId: property.id,
                memberId: user.id,
                checkIn,
                checkOut,
                guests,
                totalPrice,
                notes: bookingNotes || undefined
            });

            if (!result.success) {
                const message = result.error || t('booking.error');
                setBookingError(message);
                alert(message);
                return;
            }

            setBookingSuccess(true);
        } catch (error) {
            console.error('Error creating booking:', error);
            const message = t('booking.error');
            setBookingError(message);
            alert(message);
        } finally {
            setBookingLoading(false);
        }
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

                                {/* Attributes Section */}
                                <section className="space-y-4">
                                    <h2 className="text-2xl font-semibold text-navy">
                                        {t('propertyDetail.attributes.heading')}
                                    </h2>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {[...structureAttributes, ...infrastructureAttributes].map((item) => (
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
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-full bg-gold text-navy hover:bg-gold-dark"
                                        onClick={() => setShowBookingCalendar((prev) => !prev)}
                                    >
                                        {t('propertyDetail.cta.checkAvailability')}
                                    </Button>
                                    {showBookingCalendar && (
                                        <div className="relative pt-4 border-t border-warm-gray">
                                            <div className="space-y-4">
                                                <BookingDatePicker
                                                    propertyId={property.id}
                                                    checkIn={checkIn}
                                                    checkOut={checkOut}
                                                    onCheckInChange={setCheckIn}
                                                    onCheckOutChange={setCheckOut}
                                                    minStayDays={property.minStayDays}
                                                    maxStayDays={property.maxStayDays}
                                                    leadTimeDays={property.leadTimeDays}
                                                    bufferDays={property.bufferDays}
                                                />
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-navy">
                                                        Notes for your booking
                                                    </label>
                                                    <textarea
                                                        value={bookingNotes}
                                                        onChange={(e) => setBookingNotes(e.target.value)}
                                                        rows={3}
                                                        className="w-full rounded-2xl border border-warm-gray bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
                                                    />
                                                </div>
                                                <Button
                                                    variant="primary"
                                                    size="lg"
                                                    className="w-full bg-gold text-navy hover:bg-gold-dark"
                                                    disabled={!checkIn || !checkOut || bookingLoading || isReserveDisabledForEligibility}
                                                    onClick={handleBookDates}
                                                >
                                                    {bookingLoading ? t('booking.reserving') : t('propertyDetail.buttons.reserveNow')}
                                                </Button>
                                                {bookingSuccess && (
                                                    <p className="text-xs text-green-700">
                                                        {t('booking.pendingConfirmation')}
                                                    </p>
                                                )}
                                                {bookingError && (
                                                    <p className="text-xs text-red-600">
                                                        {bookingError}
                                                    </p>
                                                )}
                                            </div>
                                            {shouldShowEligibilityOverlay && (
                                                <div className="absolute inset-0 rounded-2xl bg-white/75 backdrop-blur-sm flex flex-col items-center justify-center px-4 text-center">
                                                    <p className="text-sm font-semibold text-navy mb-1">
                                                        {t('propertyDetail.bookingRequirements.heading')}
                                                    </p>
                                                    <p className="text-xs text-charcoal mb-3">
                                                        {t('propertyDetail.bookingRequirements.description')}
                                                    </p>
                                                    <Link to="/profile">
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            className="bg-gold text-navy hover:bg-gold-dark"
                                                            disabled={eligibilityLoading}
                                                        >
                                                            {t('propertyDetail.bookingRequirements.cta')}
                                                        </Button>
                                                    </Link>
                                                </div>
                                            )}
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
                    </section>

                    {/* Reviews Section (includes reviews, house layout, outdoor, map, all photos) */}
                    <section className="space-y-8">
                        <div className="flex items-center justify-between mr-4">
                            <h2 className="text-2xl font-semibold text-navy">
                                {t('propertyDetail.reviews.heading')}
                            </h2>
                            <div className="flex items-center gap-2">
                                <Star className="h-5 w-5 fill-gold text-gold" />
                                <span className="text-lg font-semibold text-navy">
                                    {reviewsResult != null
                                        ? reviewsResult.averageRating > 0
                                            ? reviewsResult.averageRating.toFixed(1)
                                            : '—'
                                        : (property.rating != null ? property.rating.toFixed(1) : '—')}
                                </span>
                                <span className="text-charcoal">
                                    {t('propertyDetail.reviews.reviewsCount', { count: reviewsResult?.totalCount ?? property.reviewCount ?? 0 })}
                                </span>
                            </div>
                        </div>
                        {/* Add review: show button if eligible, or message if not, or login prompt */}
                        {!user ? (
                            <p className="text-charcoal text-sm">{t('reviews.loginToReview')}</p>
                        ) : reviewEligibilityLoading ? null : reviewEligibility?.canReview && reviewEligibility.booking ? (
                            <div className="mb-4">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => setIsReviewModalOpen(true)}
                                >
                                    {t('reviews.addReview')}
                                </Button>
                            </div>
                        ) : reviewEligibility?.reason ? (
                            <p className="text-charcoal text-sm mb-4">
                                {reviewEligibility.reason.startsWith('reviews.') ? t(reviewEligibility.reason) : reviewEligibility.reason}
                            </p>
                        ) : null}
                        {reviewsResult && reviewsResult.reviews.length > 0 ? (
                            <div className="space-y-4">
                                {reviewsResult.reviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="rounded-2xl border border-warm-gray bg-white/80 p-4 space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-warm-gray-light flex items-center justify-center text-navy font-semibold">
                                                    {(review.reviewerName || '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-navy">{review.reviewerName || t('reviews.anonymous')}</p>
                                                    <p className="text-xs text-charcoal/80">
                                                        {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-gold text-gold" />
                                                <span className="text-sm font-medium text-navy">{review.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                        {review.comment ? (
                                            <p className="text-sm text-charcoal leading-relaxed">{review.comment}</p>
                                        ) : null}
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

            <LeaveReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                onSuccess={() => {
                    setIsReviewModalOpen(false);
                    setReviewEligibility((prev) => (prev?.canReview ? { canReview: false, reason: 'reviews.errors.reviewAlreadyExists' } : prev));
                    getReviewsByPropertyId(id!).then(setReviewsResult);
                }}
                bookingId={reviewEligibility?.booking?.id ?? ''}
                propertyTitle={property?.title}
            />
        </Layout>
    );
};

export default PropertyDetail;