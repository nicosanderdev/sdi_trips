import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import mapboxgl from 'mapbox-gl';
import { Layout } from '../components/layout';
import { Button, Input, RangeSlider, Card } from '../components/ui';
import PropertyCard from '../components/sections/PropertyCard';
import { searchProperties } from '../services/propertyService';
import type { Property } from '../types';
import { SlidersHorizontal, MapPin, Search as SearchIcon } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface SearchFilters {
  priceRange: [number, number];
  bedrooms: number;
  guests: number;
  amenities: string[];
  minRating: number;
  checkIn?: Date;
  checkOut?: Date;
}

const Search: React.FC = () => {
  const { t } = useTranslation();
  // Mapbox access token - you'll need to set this in your .env file

  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [100, 600],
    bedrooms: 0,
    guests: 1,
    amenities: [],
    minRating: 0,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapViewport] = useState({
    latitude: -30.901139,
    longitude: -55.543487,
    zoom: 12,
  });
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

  // Initialize mapbox
  useEffect(() => {
    if (mapboxToken) {
      mapboxgl.accessToken = mapboxToken;
    }
  }, [mapboxToken]);

  const propertyRefs = useRef<{ [key: string]: HTMLDivElement }>({});

  // Fetch properties based on current filters
  const fetchProperties = async () => {
    try {
      const searchFilters = {
        priceRange: filters.priceRange,
        bedrooms: filters.bedrooms > 0 ? filters.bedrooms : undefined,
        guests: filters.guests > 0 ? filters.guests : undefined,
        amenities: filters.amenities.length > 0 ? filters.amenities : undefined,
        location: searchQuery || undefined,
      };

      const result = await searchProperties(searchFilters, 1, 50);
      setProperties(result.properties);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setProperties([]);
    }
  };

  // Fetch properties when filters change
  useEffect(() => {
    fetchProperties();
  }, [filters, searchQuery]);

  // Get available amenities from current properties
  const availableAmenities = useMemo(() => {
    const allAmenities = properties.flatMap(p => p.amenities);
    return [...new Set(allAmenities)].sort();
  }, [properties]);


  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [100, 600],
      bedrooms: 0,
      guests: 1,
      amenities: [],
      minRating: 0,
    });
  };

  const scrollToProperty = (propertyId: string) => {
    const element = propertyRefs.current[propertyId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Initialize and update map
  useEffect(() => {
    if (!mapboxToken) return;

    const map = new mapboxgl.Map({
      container: 'search-map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [mapViewport.longitude, mapViewport.latitude],
      zoom: mapViewport.zoom,
    });

    // Add markers for filtered properties
    const markers: mapboxgl.Marker[] = [];
    const popups: mapboxgl.Popup[] = [];

    properties.forEach((property) => {
      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.className = `w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-pointer transition-all ${
        hoveredProperty === property.id || selectedProperty?.id === property.id
          ? 'bg-gold scale-125'
          : 'bg-navy'
      }`;
      markerElement.innerHTML = `
        <div class="w-full h-full rounded-full border-2 border-white flex items-center justify-center">
          <span class="text-xs font-bold text-white">$${property.price}</span>
        </div>
      `;

      // Create marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([property.coordinates.lng, property.coordinates.lat])
        .addTo(map);

      // Add click handler
      markerElement.addEventListener('click', () => {
        setSelectedProperty(property);
        scrollToProperty(property.id);
      });

      markers.push(marker);
    });

    // Handle selected property popup
    if (selectedProperty) {
      const popup = new mapboxgl.Popup({ closeOnClick: false, offset: [0, -10] })
        .setLngLat([selectedProperty.coordinates.lng, selectedProperty.coordinates.lat])
        .setHTML(`
          <div class="p-3 max-w-xs">
            <img src="${selectedProperty.images[0]}" alt="${selectedProperty.title}" class="w-full h-24 object-cover rounded-lg mb-2" />
            <h3 class="font-semibold text-navy text-sm mb-1">${selectedProperty.title}</h3>
            <p class="text-xs text-charcoal mb-2">${selectedProperty.location}</p>
            <div class="flex items-center justify-between">
              <span class="font-bold text-gold">$${selectedProperty.price}${t('search.map.perNight')}</span>
              <div class="flex items-center space-x-1">
                <span class="text-xs text-charcoal">★ ${selectedProperty.rating}</span>
              </div>
            </div>
            <a href="/property/${selectedProperty.id}" class="block mt-2">
              <button class="w-full bg-gold text-navy px-3 py-1 rounded text-sm font-medium hover:bg-opacity-90">
                ${t('search.map.viewDetails')}
              </button>
            </a>
          </div>
        `)
        .addTo(map);

      popups.push(popup);
    }

    // Fit map to show all properties
    if (properties.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();

      properties.forEach((property) => {
        bounds.extend([property.coordinates.lng, property.coordinates.lat]);
      });

      map.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }

    // Cleanup
    return () => {
      markers.forEach(marker => marker.remove());
      popups.forEach(popup => popup.remove());
      map.remove();
    };
  }, [properties, selectedProperty, hoveredProperty, mapboxToken, mapViewport]);

  return (
    <Layout>
      <div className="bg-white">
        {/* Header */}
        <div className="bg-navy text-white py-6">
          <div className="max-w-7xl mx-auto px-8">
            <h1 className="text-3xl md:text-4xl font-thin mb-2">
              {t('search.header.titlePrefix')} <span className="font-bold text-gold">{t('search.header.titleHighlight')}</span>
            </h1>
            <p className="text-warm-gray-light">{t('search.header.subtitle')}</p>
          </div>
        </div>

        <div className="flex h-[calc(100vh-200px)]">
          {/* Left Panel - Filters & Properties */}
          <div className="w-2/5 flex flex-col border-r border-gray-200">
            {/* Search & Filter Bar */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400">
                    <SearchIcon className="h-full w-full" />
                  </div>
                  <Input
                    placeholder={t('search.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(value) => setSearchQuery(value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant={showFilters ? "primary" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>{t('search.filters.button')}</span>
                </Button>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <Card variant="glass" className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-navy">{t('search.filters.title')}</h3>
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      {t('search.filters.clearAll')}
                    </Button>
                  </div>

                  <RangeSlider
                    label={t('search.filters.priceRange')}
                    min={50}
                    max={1000}
                    value={filters.priceRange}
                    onChange={(value) => handleFilterChange('priceRange', value)}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy mb-2">
                        {t('search.filters.bedrooms')}
                      </label>
                      <select
                        value={filters.bedrooms}
                        onChange={(e) => handleFilterChange('bedrooms', parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                      >
                        <option value={0}>{t('search.filters.options.any')}</option>
                        <option value={1}>{t('search.filters.options.bedrooms.1')}</option>
                        <option value={2}>{t('search.filters.options.bedrooms.2')}</option>
                        <option value={3}>{t('search.filters.options.bedrooms.3')}</option>
                        <option value={4}>{t('search.filters.options.bedrooms.4')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy mb-2">
                        {t('search.filters.guests')}
                      </label>
                      <select
                        value={filters.guests}
                        onChange={(e) => handleFilterChange('guests', parseInt(e.target.value))}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                      >
                        <option value={1}>{t('search.filters.options.guests.1')}</option>
                        <option value={2}>{t('search.filters.options.guests.2')}</option>
                        <option value={3}>{t('search.filters.options.guests.3')}</option>
                        <option value={4}>{t('search.filters.options.guests.4')}</option>
                        <option value={5}>{t('search.filters.options.guests.5')}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-3">
                      {t('search.filters.minimumRating')}
                    </label>
                    <div className="flex space-x-2">
                      {[0, 3, 4, 4.5].map(rating => (
                        <button
                          key={rating}
                          onClick={() => handleFilterChange('minRating', rating)}
                          className={`px-3 py-2 rounded-lg border ${
                            filters.minRating === rating
                              ? 'bg-gold text-navy border-gold'
                              : 'bg-white text-charcoal border-gray-300 hover:border-gold'
                          } transition-colors`}
                        >
                          {rating === 0 ? t('search.filters.options.rating.any') : t(`search.filters.options.rating.${rating}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy mb-3">
                      {t('search.filters.amenities')}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableAmenities.map(amenity => (
                        <button
                          key={amenity}
                          onClick={() => toggleAmenity(amenity)}
                          className={`px-3 py-2 text-left rounded-lg border text-sm ${
                            filters.amenities.includes(amenity)
                              ? 'bg-gold text-navy border-gold'
                              : 'bg-white text-charcoal border-gray-300 hover:border-gold'
                          } transition-colors`}
                        >
                          {amenity}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Results Count */}
              <div className="text-sm text-charcoal">
                {t('search.results.count', { count: properties.length})}
              </div>
            </div>

            {/* Properties List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {properties.map((property) => (
                  <div
                    key={property.id}
                    ref={(el) => {
                      if (el) propertyRefs.current[property.id] = el;
                    }}
                    onMouseEnter={() => setHoveredProperty(property.id)}
                    onMouseLeave={() => setHoveredProperty(null)}
                    className={`transition-all duration-200 ${
                      hoveredProperty === property.id ? 'scale-[1.02]' : ''
                    }`}
                  >
                    <PropertyCard property={property} />
                  </div>
                ))}

                {properties.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏠</div>
                    <h3 className="text-xl font-semibold text-navy mb-2">{t('search.results.empty.title')}</h3>
                    <p className="text-charcoal">{t('search.results.empty.message')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Map */}
          <div className="w-3/5 relative">
            <div id="search-map" className="w-full h-full"></div>
            {!mapboxToken && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <div className="text-center p-8">
                  <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">{t('search.map.unavailable')}</h3>
                  <p className="text-gray-500">
                    {t('search.map.tokenRequired')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Search;
