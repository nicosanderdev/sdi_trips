import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Bed, Bath, Star, Heart } from 'lucide-react';
import { Card, Badge } from '../ui';
import type { Property } from '../../types';

interface PropertyCardProps {
  property: Property;
  onFavorite?: (propertyId: string) => void;
  isFavorite?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onFavorite,
  isFavorite = false
}) => {
  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.(property.id);
  };

  return (
    <Link to={`/property/${property.id}`}>
      <Card variant="elevated" className="group cursor-pointer overflow-hidden hover:shadow-gold-lg transition-all duration-300">
        {/* Image Container */}
        <div className="relative overflow-hidden rounded-t-2xl">
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
          >
            <Heart
              className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </button>

          {/* Price Badge */}
          <div className="absolute top-4 left-4">
            <Badge variant="default" className="bg-navy text-gold font-bold">
              ${property.price}/night
            </Badge>
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
          <h3 className="text-xl font-semibold text-navy mb-2 group-hover:text-gold transition-colors">
            {property.title}
          </h3>

          {/* Description */}
          <p className="text-charcoal text-sm mb-4 line-clamp-2">
            {property.description}
          </p>

          {/* Amenities */}
          <div className="flex items-center justify-between text-sm text-charcoal">
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
          <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
            <img
              src={property.host.avatar || `https://ui-avatars.com/api/?name=${property.host.name}&background=E5C469&color=0A1A2F`}
              alt={property.host.name}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-navy">Hosted by {property.host.name}</p>
              {property.host.verified && (
                <p className="text-xs text-green-600 font-medium">Verified Host</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default PropertyCard;
