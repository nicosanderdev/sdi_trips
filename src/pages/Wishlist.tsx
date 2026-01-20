import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout';
import { Card, Button, Badge } from '../components/ui';
import { Heart, MapPin, Users, Bed, Bath, Star, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getMemberProfile } from '../services/memberService';
import { getFavoriteProperties } from '../services/propertyService';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const Wishlist: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get member profile to get the MemberId
        const member = await getMemberProfile(user.id);
        if (!member) {
          setError(t('wishlist.errors.unableToLoadMemberProfile'));
          setLoading(false);
          return;
        }

        // Fetch favorite properties
        const favorites = await getFavoriteProperties(member.id);
        setWishlistItems(favorites);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError(t('wishlist.errors.failedToLoadWishlist'));
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const removeFromWishlist = async (propertyId: string) => {
    if (!user) return;

    try {
      // Get member profile to get the MemberId
      const member = await getMemberProfile(user.id);
      if (!member) {
        console.error(t('wishlist.errors.unableToGetMemberProfile'));
        return;
      }

      // Delete from Favorites table
      const { error } = await supabase
        .from('Favorites')
        .delete()
        .eq('MemberId', member.id)
        .eq('EstatePropertyId', propertyId);

      if (error) {
        console.error('Error removing from wishlist:', error);
        return;
      }

      // Update local state
      setWishlistItems(prev => prev.filter(item => item.id !== propertyId));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  };

  const PropertyCard: React.FC<{ property: any }> = ({ property }) => (
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
          title={t('wishlist.removeFromWishlist')}
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
              {t('wishlist.unavailable')}
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
              <p className="text-sm font-medium text-navy">{t('wishlist.hostedBy', { hostName: property.host.name })}</p>
              {property.host.verified && (
                <p className="text-xs text-green-600 font-medium">{t('wishlist.verifiedHost')}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Link to={`/checkout/${property.id}`}>
              <Button variant="primary" size="sm" disabled={!property.available}>
                {property.available ? t('wishlist.bookNow') : t('wishlist.unavailable')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <Layout>
        <div className="py-12 px-8">
          <div className="max-w-7xl mx-auto flex justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="py-12 px-8">
          <div className="max-w-7xl mx-auto">
            <ErrorMessage message={error} />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-12 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-thin text-navy mb-2">
              {t('wishlist.my')} <span className="font-bold text-gold">{t('wishlist.wishlistTitle')}</span>
            </h1>
            <p className="text-xl text-charcoal">
              {t('wishlist.subtitle')}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="text-lg font-semibold text-navy">
                {t('wishlist.savedProperties', { count: wishlistItems.length })}
              </span>
            </div>
            <div className="h-6 border-l border-gray-300"></div>
            <div className="text-charcoal">
              {t('wishlist.lastUpdated')}: {new Date().toLocaleDateString('en-US', {
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
              <h3 className="text-xl font-semibold text-navy mb-2">{t('wishlist.emptyTitle')}</h3>
              <p className="text-charcoal mb-6">
                {t('wishlist.emptyDescription')}
              </p>
              <Link to="/search">
                <Button variant="primary">
                  {t('wishlist.exploreProperties')}
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

            </>
          )}

          {/* TODO: Implement Wishlist Tips banner when notification system is ready */}
        </div>
      </div>
    </Layout>
  );
};

export default Wishlist;
