import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import mapboxgl from 'mapbox-gl';
import { Layout } from '../components/layout';
import { Button, Card, Badge } from '../components/ui';
import BookingDatePicker from '../components/sections/BookingDatePicker';
import { getPropertyById } from '../services/propertyService';
import { getPropertyMessages, sendPropertyQuestion, replyToMessage } from '../services/messageService';
import { createBooking } from '../services/bookingService';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import type { PropertyMessage } from '../types';
import {
  MapPin,
  Users,
  Bed,
  Bath,
  Star,
  Heart,
  Share,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Car,
  Waves,
  Flame,
  Mountain,
  Home,
  Shield,
  MessageCircle,
  Minus,
  Plus,
  X,
  CheckCircle
} from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews] = useState<any[]>([]); // TODO: Implement reviews API

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Booking state
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'pending_confirmation' | 'confirmed' | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Messages state
  const [messages, setMessages] = useState<PropertyMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionSubject, setQuestionSubject] = useState('');
  const [questionBody, setQuestionBody] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const { user } = useAuth();
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

  // Fetch messages when property is loaded
  useEffect(() => {
    const fetchMessages = async () => {
      if (!property?.id) return;

      try {
        setMessagesLoading(true);
        const messagesData = await getPropertyMessages(property.id);
        setMessages(messagesData);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchMessages();
  }, [property?.id]);

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

  const amenitiesIcons: { [key: string]: React.ReactNode } = {
    'WiFi': <Wifi className="h-5 w-5" />,
    'Pool': <Waves className="h-5 w-5" />,
    'Beach Access': <Waves className="h-5 w-5" />,
    'Parking': <Car className="h-5 w-5" />,
    'Fireplace': <Flame className="h-5 w-5" />,
    'Mountain View': <Mountain className="h-5 w-5" />,
    'Air Conditioning': <Home className="h-5 w-5" />,
    'Kitchen': <Home className="h-5 w-5" />,
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    return nights * property.price;
  };

  // TODO: Implement similar properties logic with API
  const similarProperties: any[] = [];

  // Message handlers
  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !property?.id || !questionSubject.trim() || !questionBody.trim()) return;

    try {
      setSubmittingQuestion(true);
      await sendPropertyQuestion(property.id, questionSubject.trim(), questionBody.trim());
      setQuestionSubject('');
      setQuestionBody('');
      setShowQuestionForm(false);

      // Refresh messages
      const messagesData = await getPropertyMessages(property.id);
      setMessages(messagesData);
    } catch (err) {
      console.error('Error submitting question:', err);
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleSubmitReply = async (messageId: string, body: string) => {
    if (!body.trim()) return;

    try {
      setSubmittingReply(true);
      await replyToMessage(messageId, body.trim());

      // Refresh messages
      const messagesData = await getPropertyMessages(property.id);
      setMessages(messagesData);

      setReplyingTo(null);
      setReplyBody('');
    } catch (err) {
      console.error('Error submitting reply:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  // Booking handler
  const handleReserveNow = async () => {
    // Validate dates
    if (!checkIn || !checkOut) {
      alert(t('booking.selectDates'));
      return;
    }

    // Validate user is logged in
    if (!user) {
      alert(t('booking.loginRequired'));
      return;
    }

    // Validate property exists
    if (!property?.id) {
      alert(t('booking.error'));
      return;
    }

    try {
      setBookingLoading(true);

      // Calculate total price
      const totalPrice = calculateTotal();

      // Create booking
      const result = await createBooking({
        propertyId: property.id,
        userId: user.id,
        checkIn,
        checkOut,
        guests,
        totalPrice
      });

      if (result.success && result.booking) {
        setBookingSuccess(true);
        setBookingStatus(result.status);
        setShowBookingModal(true);
      } else {
        alert(result.error || t('booking.error'));
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(t('booking.error'));
    } finally {
      setBookingLoading(false);
    }
  };

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setShowLightbox(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const nextLightboxImage = () => {
    setLightboxIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevLightboxImage = () => {
    setLightboxIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Header Navigation */}
        <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <Link to="/search" className="flex items-center space-x-2 text-navy hover:text-gold transition-colors">
                <ChevronLeft className="h-5 w-5" />
                <span>{t('propertyDetail.nav.backToSearch')}</span>
              </Link>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="flex items-center space-x-2 text-navy hover:text-gold transition-colors"
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{t('propertyDetail.nav.save')}</span>
                </button>
                <button className="flex items-center space-x-2 text-navy hover:text-gold transition-colors">
                  <Share className="h-5 w-5" />
                  <span>{t('propertyDetail.nav.share')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <div className="relative">
                <div className="aspect-[16/10] relative overflow-hidden rounded-3xl">
                  <img
                    src={property.images[currentImageIndex]}
                    alt={property.title}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => handleImageClick(currentImageIndex)}
                  />

                  {/* Navigation Arrows */}
                  {property.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5 text-navy" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
                      >
                        <ChevronRight className="h-5 w-5 text-navy" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {property.images.length}
                  </div>
                </div>

                {/* Thumbnail Strip */}
                {property.images.length > 1 && (
                  <div className="flex space-x-2 mt-4 overflow-x-auto">
                    {property.images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex ? 'border-gold' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Property Info */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-thin text-navy mb-2">
                        {property.title}
                      </h1>
                      <div className="flex items-center space-x-4 text-charcoal">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-5 w-5" />
                          <span>{property.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-5 w-5 fill-gold text-gold" />
                          <span className="font-medium">{property.rating}</span>
                          <span>({property.reviewCount} reviews)</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-navy">
                        ${property.price}
                      </div>
                      <div className="text-charcoal">{t('propertyDetail.pricing.perNight')}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-charcoal">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>{property.maxGuests} guests</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Bed className="h-5 w-5" />
                      <span>{property.bedrooms} bedrooms</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Bath className="h-5 w-5" />
                      <span>{property.bathrooms} bathrooms</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-2xl font-semibold text-navy mb-4">{t('propertyDetail.sections.about')}</h2>
                  <p className="text-charcoal leading-relaxed">{property.description}</p>
                </div>

                {/* Amenities */}
                <div>
                  <h2 className="text-2xl font-semibold text-navy mb-4">{t('propertyDetail.sections.amenities')}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {property.amenities.map((amenity: string) => (
                      <div key={amenity} className="flex items-center space-x-3">
                        <div className="text-gold">
                          {amenitiesIcons[amenity] || <Home className="h-5 w-5" />}
                        </div>
                        <span className="text-charcoal">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Map */}
                <div>
                  <h2 className="text-2xl font-semibold text-navy mb-4">{t('propertyDetail.sections.location')}</h2>
                  <div className="h-64 rounded-2xl overflow-hidden">
                    <div id="property-detail-map" className="w-full h-full"></div>
                    {!mapboxToken && (
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <div className="text-center p-8">
                          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <h3 className="text-lg font-semibold text-gray-600 mb-2">{t('propertyDetail.placeholders.propertyLocation')}</h3>
                          <p className="text-gray-500 text-sm mb-2">
                            {property.location}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {t('propertyDetail.placeholders.mapboxTokenNote')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Host Info */}
                <Card variant="elevated" className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={property.host.avatar || `https://ui-avatars.com/api/?name=${property.host.name}&background=E5C469&color=0A1A2F`}
                        alt={property.host.name}
                        className="w-16 h-16 rounded-full"
                      />
                      <div>
                        <h3 className="text-xl font-semibold text-navy">
                          {t('propertyDetail.sections.host')} {property.host.name}
                        </h3>
                        <div className="flex items-center space-x-2 text-charcoal">
                          {property.host.verified && (
                            <div className="flex items-center space-x-1">
                              <Shield className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600 font-medium">{t('propertyDetail.badges.verifiedHost')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>{t('propertyDetail.buttons.contactHost')}</span>
                    </Button>
                  </div>
                </Card>

                {/* Reviews */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-navy">
                      {t('propertyDetail.sections.reviews')} ({reviews.length})
                    </h2>
                    <div className="flex items-center space-x-1">
                      <Star className="h-5 w-5 fill-gold text-gold" />
                      <span className="text-lg font-semibold">{property.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <Card key={review.id} variant="elevated" className="p-6">
                        <div className="flex items-start space-x-4">
                          <img
                            src={review.user.avatar || `https://ui-avatars.com/api/?name=${review.user.name}&background=E5C469&color=0A1A2F`}
                            alt={review.user.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-navy">{review.user.name}</h4>
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 fill-gold text-gold" />
                                <span className="text-sm text-charcoal">{review.rating}</span>
                              </div>
                            </div>
                            <p className="text-charcoal">{review.comment}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Questions & Answers */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-navy">
                      {t('propertyDetail.sections.questions')} ({messages.length})
                    </h2>
                    {user ? (
                      <Button
                        variant="outline"
                        onClick={() => setShowQuestionForm(!showQuestionForm)}
                        className="flex items-center space-x-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{t('propertyDetail.buttons.askQuestion')}</span>
                      </Button>
                    ) : (
                      <Link to={`/login?redirect=/property/${property.id}`}>
                        <Button variant="outline" className="flex items-center space-x-2">
                          <MessageCircle className="h-4 w-4" />
                          <span>{t('propertyDetail.buttons.signInToAsk')}</span>
                        </Button>
                      </Link>
                    )}
                  </div>

                  {/* Question Form */}
                  {showQuestionForm && user && (
                    <Card variant="elevated" className="p-6 mb-6">
                      <form onSubmit={handleSubmitQuestion}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-navy mb-2">
                              {t('propertyDetail.form.subject')}
                            </label>
                            <input
                              type="text"
                              value={questionSubject}
                              onChange={(e) => setQuestionSubject(e.target.value)}
                              placeholder={t('propertyDetail.placeholders.questionSubject')}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                              required
                              maxLength={255}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-navy mb-2">
                              {t('propertyDetail.form.question')}
                            </label>
                            <textarea
                              value={questionBody}
                              onChange={(e) => setQuestionBody(e.target.value)}
                              placeholder={t('propertyDetail.placeholders.questionBody')}
                              rows={4}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
                              required
                              maxLength={1000}
                            />
                            <div className="text-sm text-gray-500 mt-1">
                              {questionBody.length}/1000 {t('propertyDetail.form.characters')}
                            </div>
                          </div>
                          <div className="flex justify-end space-x-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowQuestionForm(false);
                                setQuestionSubject('');
                                setQuestionBody('');
                              }}
                            >
                              {t('propertyDetail.buttons.cancel')}
                            </Button>
                            <Button
                              type="submit"
                              variant="primary"
                              disabled={submittingQuestion || !questionSubject.trim() || !questionBody.trim()}
                            >
                              {submittingQuestion ? t('propertyDetail.buttons.sending') : t('propertyDetail.buttons.sendQuestion')}
                            </Button>
                          </div>
                        </div>
                      </form>
                    </Card>
                  )}

                  {/* Messages List */}
                  {messagesLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="md" />
                    </div>
                  ) : messages.length === 0 ? (
                    <Card variant="elevated" className="p-8 text-center">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-navy mb-2">{t('propertyDetail.empty.noQuestionsTitle')}</h3>
                      <p className="text-charcoal">
                        {t('propertyDetail.empty.noQuestionsMessage')}
                      </p>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {messages.map((message) => (
                        <Card key={message.id} variant="elevated" className="p-6">
                          {/* Question */}
                          <div className="flex items-start space-x-4">
                            <img
                              src={`https://ui-avatars.com/api/?name=${message.senderName}&background=E5C469&color=0A1A2F`}
                              alt={message.senderName}
                              className="w-10 h-10 rounded-full flex-shrink-0"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-navy">{message.senderName}</h4>
                                <span className="text-sm text-gray-500">
                                  {new Date(message.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-charcoal mb-4">{message.body}</p>

                              {/* Reply Button for Property Owner */}
                              {user && message.senderId !== user.id && !message.replies?.length && (
                                <button
                                  onClick={() => setReplyingTo(message.id)}
                                  className="text-sm text-gold hover:text-gold-dark font-medium"
                                >
                                  {t('propertyDetail.buttons.reply')}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Reply Form */}
                          {replyingTo === message.id && (
                            <div className="mt-4 ml-14">
                              <div className="border-l-2 border-gold pl-4">
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSubmitReply(message.id, replyBody);
                                  }}
                                  className="space-y-3"
                                >
                                  <textarea
                                    value={replyBody}
                                    onChange={(e) => setReplyBody(e.target.value)}
                                    placeholder={t('propertyDetail.placeholders.replyBody')}
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
                                    required
                                    maxLength={1000}
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setReplyingTo(null);
                                        setReplyBody('');
                                      }}
                                    >
                                      {t('propertyDetail.buttons.cancel')}
                                    </Button>
                                    <Button
                                      type="submit"
                                      variant="primary"
                                      size="sm"
                                      disabled={submittingReply || !replyBody.trim()}
                                    >
                                      {submittingReply ? t('propertyDetail.buttons.sending') : t('propertyDetail.buttons.reply')}
                                    </Button>
                                  </div>
                                </form>
                              </div>
                            </div>
                          )}

                          {/* Replies */}
                          {message.replies && message.replies.map((reply) => (
                            <div key={reply.id} className="mt-4 ml-14">
                              <div className="border-l-2 border-gold pl-4">
                                <div className="flex items-start space-x-3">
                                  <img
                                    src={`https://ui-avatars.com/api/?name=${reply.senderName}&background=E5C469&color=0A1A2F`}
                                    alt={reply.senderName}
                                    className="w-8 h-8 rounded-full flex-shrink-0"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h5 className="font-semibold text-navy text-sm">{reply.senderName}</h5>
                                      {reply.isOwnerReply && (
                                        <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                          {t('propertyDetail.badges.propertyOwner')}
                                        </Badge>
                                      )}
                                      <span className="text-xs text-gray-500">
                                        {new Date(reply.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-charcoal text-sm">{reply.body}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Similar Properties */}
                {similarProperties.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold text-navy mb-6">{t('propertyDetail.sections.similarProperties')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {similarProperties.map((similarProperty) => (
                        <Link key={similarProperty.id} to={`/property/${similarProperty.id}`}>
                          <Card variant="elevated" className="overflow-hidden group cursor-pointer hover:shadow-gold-lg transition-shadow">
                            <div className="relative overflow-hidden rounded-t-2xl">
                              <img
                                src={similarProperty.images[0]}
                                alt={similarProperty.title}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-4 left-4">
                                <Badge variant="default" className="bg-navy text-gold font-bold">
                                  ${similarProperty.price}/night
                                </Badge>
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-navy mb-2 group-hover:text-gold transition-colors">
                                {similarProperty.title}
                              </h3>
                              <div className="flex items-center space-x-1 text-sm text-charcoal">
                                <MapPin className="h-4 w-4" />
                                <span>{similarProperty.location}</span>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Widget - Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card variant="elevated" className="p-6 shadow-gold-lg">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-navy mb-1">
                        ${property.price}
                      </div>
                      <div className="text-charcoal">per night</div>
                    </div>

                    <BookingDatePicker
                      propertyId={property.id}
                      checkIn={checkIn}
                      checkOut={checkOut}
                      onCheckInChange={setCheckIn}
                      onCheckOutChange={setCheckOut}
                      minStayDays={property.minStayDays}
                      maxStayDays={property.maxStayDays}
                      leadTimeDays={property.leadTimeDays}
                    />

                    <div>
                      <label className="block text-sm font-medium text-navy mb-2">
                        {t('propertyDetail.pricing.guests')}
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          className="p-2 border border-gray-300 rounded-lg hover:border-gold transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="flex-1 text-center font-medium">{guests} {t(guests === 1 ? 'propertyDetail.pricing.guest' : 'propertyDetail.pricing.guests_plural')}</span>
                        <button
                          onClick={() => setGuests(Math.min(property.maxGuests, guests + 1))}
                          className="p-2 border border-gray-300 rounded-lg hover:border-gold transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {checkIn && checkOut && (
                      <div className="border-t border-gray-200 pt-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-charcoal">
                            ${property.price} × {calculateNights()} {t('propertyDetail.pricing.nights')}
                          </span>
                          <span className="font-medium">${calculateTotal()}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg">
                          <span>{t('propertyDetail.pricing.total')}</span>
                          <span>${calculateTotal()}</span>
                        </div>
                      </div>
                    )}

                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full bg-gold text-navy hover:bg-gold-dark"
                      disabled={!checkIn || !checkOut || bookingLoading}
                      onClick={handleReserveNow}
                    >
                      {bookingLoading ? t('booking.reserving') : t('propertyDetail.buttons.reserveNow')}
                    </Button>

                    <p className="text-center text-sm text-charcoal">
                      {t('propertyDetail.pricing.youWontBeCharged')}
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Success Modal */}
        {showBookingModal && bookingSuccess && bookingStatus && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6">
              <div className="text-center">
                {bookingStatus === 'confirmed' ? (
                  <>
                    {/* Confirmed Booking */}
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-navy mb-2">
                      {t('booking.confirmed')}
                    </h3>
                    <p className="text-charcoal mb-4">
                      {t('booking.confirmedMessage')}
                    </p>
                  </>
                ) : (
                  <>
                    {/* Pending Confirmation */}
                    <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-8 h-8 rounded-full bg-gold animate-pulse"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-navy mb-2">
                      {t('booking.pendingConfirmation')}
                    </h3>
                    <p className="text-charcoal mb-4">
                      {t('booking.syncMessage')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('booking.pendingConfirmedNote')}
                    </p>
                  </>
                )}

                {/* Booking Details */}
                <div className="bg-warm-gray rounded-xl p-4 mb-6 text-left">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-charcoal">{property.title}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-charcoal">
                      {checkIn && checkOut ? `${format(checkIn, 'MMM dd')} - ${format(checkOut, 'MMM dd, yyyy')}` : 'Dates not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-charcoal">
                      {guests} {guests === 1 ? t('propertyDetail.pricing.guest') : t('propertyDetail.pricing.guests_plural')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-navy">{t('propertyDetail.pricing.total')}</span>
                    <span className="text-gold">${calculateTotal()}</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setShowBookingModal(false);
                    setBookingSuccess(false);
                    setBookingStatus(null);
                  }}
                  className="w-full"
                >
                  {t('booking.close')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Lightbox */}
        {showLightbox && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 text-white hover:text-gold transition-colors"
            >
              <X className="h-8 w-8" />
            </button>

            <button
              onClick={prevLightboxImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gold transition-colors"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <button
              onClick={nextLightboxImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gold transition-colors"
            >
              <ChevronRight className="h-8 w-8" />
            </button>

            <img
              src={property.images[lightboxIndex]}
              alt={property.title}
              className="max-w-full max-h-full object-contain"
            />

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full">
              {lightboxIndex + 1} / {property.images.length}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PropertyDetail;
