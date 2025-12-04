import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import DatePicker from 'react-datepicker';
import { Layout } from '../components/layout';
import { Button, Card, Badge } from '../components/ui';
import { mockProperties, mockReviews } from '../data/mockData';
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
  X
} from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import 'mapbox-gl/dist/mapbox-gl.css';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const property = mockProperties.find(p => p.id === id);
  const reviews = mockReviews.filter(r => r.property.id === property?.id);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

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

  if (!property) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-navy mb-4">Property Not Found</h1>
            <Link to="/search">
              <Button>Back to Search</Button>
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

  const similarProperties = mockProperties
    .filter(p => p.id !== property.id && p.location.split(',')[1]?.trim() === property.location.split(',')[1]?.trim())
    .slice(0, 3);

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
                <span>Back to search</span>
              </Link>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="flex items-center space-x-2 text-navy hover:text-gold transition-colors"
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>Save</span>
                </button>
                <button className="flex items-center space-x-2 text-navy hover:text-gold transition-colors">
                  <Share className="h-5 w-5" />
                  <span>Share</span>
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
                    {property.images.map((image, index) => (
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
                      <div className="text-charcoal">per night</div>
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
                  <h2 className="text-2xl font-semibold text-navy mb-4">About this place</h2>
                  <p className="text-charcoal leading-relaxed">{property.description}</p>
                </div>

                {/* Amenities */}
                <div>
                  <h2 className="text-2xl font-semibold text-navy mb-4">What this place offers</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {property.amenities.map((amenity) => (
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
                  <h2 className="text-2xl font-semibold text-navy mb-4">Location</h2>
                  <div className="h-64 rounded-2xl overflow-hidden">
                    <div id="property-detail-map" className="w-full h-full"></div>
                    {!mapboxToken && (
                      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <div className="text-center p-8">
                          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <h3 className="text-lg font-semibold text-gray-600 mb-2">Property Location</h3>
                          <p className="text-gray-500 text-sm mb-2">
                            {property.location}
                          </p>
                          <p className="text-gray-400 text-xs">
                            Add Mapbox API token to .env file for interactive map
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
                          Hosted by {property.host.name}
                        </h3>
                        <div className="flex items-center space-x-2 text-charcoal">
                          {property.host.verified && (
                            <div className="flex items-center space-x-1">
                              <Shield className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600 font-medium">Verified Host</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>Contact Host</span>
                    </Button>
                  </div>
                </Card>

                {/* Reviews */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-navy">
                      Reviews ({reviews.length})
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

                {/* Similar Properties */}
                {similarProperties.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold text-navy mb-6">Similar properties</h2>
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

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-navy mb-2">
                          Check-in
                        </label>
                        <DatePicker
                          selected={checkIn}
                          onChange={setCheckIn}
                          selectsStart
                          startDate={checkIn}
                          endDate={checkOut}
                          minDate={new Date()}
                          placeholderText="Select date"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-navy mb-2">
                          Check-out
                        </label>
                        <DatePicker
                          selected={checkOut}
                          onChange={setCheckOut}
                          selectsEnd
                          startDate={checkIn}
                          endDate={checkOut}
                          minDate={checkIn || new Date()}
                          placeholderText="Select date"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy mb-2">
                        Guests
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          className="p-2 border border-gray-300 rounded-lg hover:border-gold transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="flex-1 text-center font-medium">{guests} guest{guests > 1 ? 's' : ''}</span>
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
                            ${property.price} × {calculateNights()} nights
                          </span>
                          <span className="font-medium">${calculateTotal()}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total</span>
                          <span>${calculateTotal()}</span>
                        </div>
                      </div>
                    )}

                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full bg-gold text-navy hover:bg-gold-dark"
                      disabled={!checkIn || !checkOut}
                    >
                      Reserve Now
                    </Button>

                    <p className="text-center text-sm text-charcoal">
                      You won't be charged yet
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

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
