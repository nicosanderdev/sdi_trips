import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout';
import { Card, Button, Badge } from '../components/ui';
import { Heart, MapPin, Users, Bed, Bath, Star, X, Calendar } from 'lucide-react';
import { mockProperties } from '../data/mockData';

const Wishlist: React.FC = () => {
  // Mock wishlist - in real app this would come from user preferences
  const [wishlistItems, setWishlistItems] = useState([
    mockProperties[0], // Seaside Villa
    mockProperties[2], // Urban Loft
    mockProperties[3], // Tropical Beach Bungalow
    mockProperties[5], // Desert Oasis Villa
  ]);

  const removeFromWishlist = (propertyId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== propertyId));
  };

  const PropertyCard: React.FC<{ property: typeof mockProperties[0] }> = ({ property }) => (
    <Card variant="elevated" className="group overflow-hidden hover:shadow-gold-lg transition-all duration-300">
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <Link to={`/property/${property.id}`}>
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Remove Button */}
        <button
          onClick={() => removeFromWishlist(property.id)}
          className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
          title="Remove from wishlist"
        >
          <X className="h-5 w-5 text-gray-600 hover:text-red-600" />
        </button>

        {/* Price Badge */}
        <div className="absolute top-4 left-4">
          <Badge variant="default" className="bg-navy text-gold font-bold">
            ${property.price}/night
          </Badge>
        </div>

        {/* Wishlist Heart */}
        <div className="absolute top-4 right-4 p-2 bg-red-500/90 backdrop-blur-sm rounded-full shadow-md">
          <Heart className="h-5 w-5 text-white fill-white" />
        </div>

        {/* Availability Badge */}
        {!property.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="error" className="text-white font-medium">
              Unavailable
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Rating and Location */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-gold text-gold" />
            <span className="text-sm font-medium text-charcoal">
              {property.rating} ({property.reviewCount})
            </span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-charcoal">
            <MapPin className="h-4 w-4" />
            <span>{property.location}</span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/property/${property.id}`}>
          <h3 className="text-xl font-semibold text-navy hover:text-gold transition-colors mb-2 line-clamp-1">
            {property.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-charcoal text-sm mb-4 line-clamp-2">
          {property.description}
        </p>

        {/* Amenities */}
        <div className="flex items-center justify-between text-sm text-charcoal mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{property.maxGuests}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bed className="h-4 w-4" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bath className="h-4 w-4" />
              <span>{property.bathrooms}</span>
            </div>
          </div>
        </div>

        {/* Host Info */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <img
              src={property.host.avatar || `https://ui-avatars.com/api/?name=${property.host.name}&background=E5C469&color=0A1A2F`}
              alt={property.host.name}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="text-sm font-medium text-navy">Hosted by {property.host.name}</p>
              {property.host.verified && (
                <p className="text-xs text-green-600 font-medium">Verified Host</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Link to={`/checkout/${property.id}`}>
              <Button variant="primary" size="sm" disabled={!property.available}>
                {property.available ? 'Book Now' : 'Unavailable'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <Layout>
      <div className="py-12 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-thin text-navy mb-2">
              My <span className="font-bold text-gold">Wishlist</span>
            </h1>
            <p className="text-xl text-charcoal">
              Your saved properties, ready for your next adventure
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="text-lg font-semibold text-navy">
                {wishlistItems.length} Saved {wishlistItems.length === 1 ? 'Property' : 'Properties'}
              </span>
            </div>
            <div className="h-6 border-l border-gray-300"></div>
            <div className="text-charcoal">
              Last updated: {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* Wishlist Content */}
          {wishlistItems.length === 0 ? (
            <Card variant="default" className="p-12 text-center">
              <Heart className="h-16 w-16 text-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-navy mb-2">Your Wishlist is Empty</h3>
              <p className="text-charcoal mb-6">
                Start saving your favorite properties to keep track of places you'd like to visit.
              </p>
              <Link to="/search">
                <Button variant="primary">
                  Explore Properties
                </Button>
              </Link>
            </Card>
          ) : (
            <>
              {/* Grid View */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {wishlistItems.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {/* Wishlist Actions */}
              <Card variant="default" className="p-6 bg-gradient-to-r from-gold/5 to-navy/5 border-gold/20">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-navy mb-2">Ready to Book?</h3>
                    <p className="text-charcoal">
                      Turn your wishlist into reality. Contact hosts or proceed with booking for your favorite properties.
                    </p>
                  </div>
                  <div className="flex space-x-3 mt-4 md:mt-0">
                    <Link to="/trips">
                      <Button variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        View My Trips
                      </Button>
                    </Link>
                    <Link to="/search">
                      <Button variant="primary">
                        Find More Properties
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Wishlist Tips */}
          {wishlistItems.length > 0 && (
            <Card variant="default" className="p-8 mt-8">
              <h3 className="text-xl font-semibold text-navy mb-4">Wishlist Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-navy mb-2">💝 Save Smart</h4>
                  <p className="text-sm text-charcoal">
                    Save properties you're genuinely interested in. Use the wishlist to compare options
                    and track properties that match your preferences.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-navy mb-2">🔔 Get Notified</h4>
                  <p className="text-sm text-charcoal">
                    We'll notify you when prices change or when similar properties become available
                    in your saved destinations.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-navy mb-2">📅 Plan Ahead</h4>
                  <p className="text-sm text-charcoal">
                    Check availability and book early. Popular properties fill up quickly,
                    especially during peak seasons.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-navy mb-2">💬 Ask Questions</h4>
                  <p className="text-sm text-charcoal">
                    Don't hesitate to contact hosts with questions about amenities,
                    local attractions, or any special requirements.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Wishlist;
