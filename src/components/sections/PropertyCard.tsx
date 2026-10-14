import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MapPin, Users, Bed, Bath, Star, Heart, Check } from 'lucide-react';
import { Badge, Button } from '../ui';
import type { Property } from '../../types';

interface PropertyCardProps {
  property: Property;
  /** Precomputed display price (dynamic pricing). */
  displayAmount?: number;
  /** i18n key for price label, e.g. pricing.from */
  displayLabelKey?: string;
  onToggleWishlist?: (propertyId: string) => void;
  isInWishlist?: boolean;
  disableLink?: boolean;
  /** When false, the wishlist heart is hidden (e.g. MVP without auth). */
  showWishlist?: boolean;
  /** Override destination for property detail links (e.g. with date query params). */
  detailTo?: string;
}

const FALLBACK_IMAGE = '/landing/porch-800.jpg';

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  displayAmount,
  displayLabelKey,
  onToggleWishlist,
  isInWishlist = false,
  disableLink = false,
  showWishlist = true,
  detailTo,
}) => {
  const { t } = useTranslation();
  const propertyDetailPath = detailTo ?? `/property/${property.id}`;
  const priceAmount = displayAmount ?? property.price;
  const pricePrefix = displayLabelKey ? `${t(displayLabelKey)} ` : '';
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist?.(property.id);
  };

  const cardContent = (
    <article className="group cursor-pointer overflow-hidden bg-white rounded-2xl border border-navy/10 hover:shadow-[0_16px_40px_-24px_rgba(10,26,47,0.35)] transition-shadow duration-300">
        {/* Image Container */}
        <div className="relative overflow-hidden rounded-t-2xl rounded-bl-[1.5rem]">
          <img
            src={property.images[0] || FALLBACK_IMAGE}
            alt={property.imageAltText || property.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Wishlist Button (hidden when showWishlist is false, e.g. MVP without auth) */}
          {showWishlist && (
            <button
              type="button"
              onClick={handleWishlistClick}
              className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              aria-label={isInWishlist ? t('wishlist.removeFromWishlist') : t('wishlist.addToWishlist')}
              title={isInWishlist ? t('wishlist.removeFromWishlist') : t('wishlist.addToWishlist')}
            >
              <Heart
                className={`h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            </button>
          )}

          {/* Price Badge */}
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-navy shadow">
              {pricePrefix}
              <span className="underline decoration-gold decoration-2 underline-offset-2">
                ${priceAmount}
              </span>
              {!displayLabelKey && (
                <span className="ml-0.5 font-semibold">{t('propertyCard.perNight')}</span>
              )}
            </span>
          </div>

          {/* Availability Badge */}
          {!property.available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="error" className="text-white font-medium">
                {t('propertyCard.unavailable')}
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
              <span className="text-sm font-medium text-charcoal/75">
                {property.rating} ({property.reviewCount})
              </span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-charcoal/75">
              <MapPin className="h-4 w-4" />
              <span>{property.location}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold tracking-tight text-navy mb-2 group-hover:underline group-hover:decoration-gold group-hover:decoration-2 group-hover:underline-offset-4 transition-[text-decoration]">
            {property.title}
          </h3>

          {/* Description */}
          <p className="text-charcoal/75 text-sm mb-4 line-clamp-2">
            {property.description}
          </p>

          {/* Amenities */}
          <div className="flex items-center justify-between text-sm text-charcoal/75">
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

          {/* Host Info + View Details (optional) */}
          <div className="mt-4 pt-4 border-t border-navy/10 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <img
                src={property.host.avatar || `https://ui-avatars.com/api/?name=${property.host.name}&background=E5C469&color=0A1A2F`}
                alt={property.host.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-navy">
                  {t('propertyCard.hostedBy', { name: property.host.name })}
                </p>
                {property.host.verified && (
                  <p className="text-xs text-navy/70 font-medium flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-gold shrink-0" aria-hidden />
                    {t('propertyCard.verifiedHost')}
                  </p>
                )}
              </div>
            </div>

            {disableLink && (
              <Link
                to={propertyDetailPath}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Button size="sm" variant="primary">
                  {t('search.map.viewDetails')}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </article>
  );

  if (disableLink) {
    return cardContent;
  }

  return (
    <Link to={propertyDetailPath}>
      {cardContent}
    </Link>
  );
};

export default PropertyCard;
