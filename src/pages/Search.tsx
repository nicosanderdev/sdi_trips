import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import mapboxgl from 'mapbox-gl';
import { Layout } from '../components/layout';
import { Button, Input, RangeSlider, Card } from '../components/ui';
import PropertyCard from '../components/sections/PropertyCard';
import { getFavoriteProperties, searchProperties } from '../services/propertyService';
import type { Property } from '../types';
import { SlidersHorizontal, MapPin, Search as SearchIcon } from 'lucide-react';
import uyCitiesData from '../data/uy-cities.json';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAuth } from '../hooks/useAuth';
import { getMemberProfile } from '../services/memberService';
import { supabase } from '../lib/supabase';

const DEBOUNCE_MS = 450;
const UY_CITIES_MAX_SUGGESTIONS = 10;
const DEFAULT_PRICE_RANGE: [number, number] = [100, 600];
const PRIVACY_OFFSET_METERS = 120;
const APPROX_ZONE_RADIUS_METERS = 100;
const APPROX_ZONE_MIN_ZOOM = 14;
const APPROX_ZONE_SOURCE_ID = 'selected-property-approx-zone-source';
const APPROX_ZONE_FILL_LAYER_ID = 'selected-property-approx-zone-fill-layer';
const APPROX_ZONE_STROKE_LAYER_ID = 'selected-property-approx-zone-stroke-layer';

interface UyCity {
  name: string;
  lat: string;
  long: string;
  zoom: string;
}

const uyCities: UyCity[] = uyCitiesData as UyCity[];

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
  const { user } = useAuth();
  // Mapbox access token - you'll need to set this in your .env file

  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: DEFAULT_PRICE_RANGE,
    bedrooms: 0,
    guests: 1,
    amenities: [],
    minRating: 0,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapBounds, setMapBounds] = useState<mapboxgl.LngLatBounds | null>(null);
  const [mapViewport, setMapViewport] = useState({
    latitude: -30.901139,
    longitude: -55.543487,
    zoom: 12,
  });
  const [delayedVisibleProperties, setDelayedVisibleProperties] = useState<Property[]>([]);
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupsRef = useRef<mapboxgl.Popup[]>([]);
  const privacyOffsetsRef = useRef<Record<string, { lng: number; lat: number }>>({});

  // Initialize mapbox
  useEffect(() => {
    if (mapboxToken) {
      mapboxgl.accessToken = mapboxToken;
    }
  }, [mapboxToken]);

  const propertyRefs = useRef<{ [key: string]: HTMLDivElement }>({});

  const hashPropertyId = useCallback((id: string): number => {
    let hash = 0;
    for (let index = 0; index < id.length; index += 1) {
      hash = (hash << 5) - hash + id.charCodeAt(index);
      hash |= 0;
    }
    return Math.abs(hash);
  }, []);

  const getOffsetCoordinates = useCallback(
    (property: Property) => {
      const cached = privacyOffsetsRef.current[property.id];
      if (cached) return cached;

      const baseHash = hashPropertyId(property.id);
      const angleRadians = ((baseHash % 360) * Math.PI) / 180;
      const distanceMeters = 60 + (baseHash % (PRIVACY_OFFSET_METERS - 60));
      const latRadians = (property.coordinates.lat * Math.PI) / 180;
      const metersPerDegreeLat = 111_320;
      const metersPerDegreeLng = Math.max(111_320 * Math.cos(latRadians), 0.00001);
      const latOffset = (distanceMeters * Math.sin(angleRadians)) / metersPerDegreeLat;
      const lngOffset = (distanceMeters * Math.cos(angleRadians)) / metersPerDegreeLng;
      const offsetCoordinates = {
        lat: property.coordinates.lat + latOffset,
        lng: property.coordinates.lng + lngOffset,
      };

      privacyOffsetsRef.current[property.id] = offsetCoordinates;
      return offsetCoordinates;
    },
    [hashPropertyId]
  );

  const createGeoCircleFeature = useCallback((centerLng: number, centerLat: number, radiusMeters: number) => {
    const points = 64;
    const coordinates: [number, number][] = [];
    const latRadians = (centerLat * Math.PI) / 180;
    const metersPerDegreeLat = 111_320;
    const metersPerDegreeLng = Math.max(111_320 * Math.cos(latRadians), 0.00001);

    for (let pointIndex = 0; pointIndex <= points; pointIndex += 1) {
      const angle = (pointIndex / points) * 2 * Math.PI;
      const lat = centerLat + (radiusMeters * Math.sin(angle)) / metersPerDegreeLat;
      const lng = centerLng + (radiusMeters * Math.cos(angle)) / metersPerDegreeLng;
      coordinates.push([lng, lat]);
    }

    return {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [coordinates],
      },
      properties: {},
    };
  }, []);

  // Load member profile and favorites when user changes
  useEffect(() => {
    const fetchMemberAndFavorites = async () => {
      if (!user) {
        setWishlistIds([]);
        setMemberId(null);
        return;
      }

      try {
        const member = await getMemberProfile(user.id);
        if (!member) {
          setWishlistIds([]);
          setMemberId(null);
          return;
        }

        setMemberId(member.id);
        const favorites = await getFavoriteProperties(member.id);
        setWishlistIds(favorites.map((property) => property.id));
      } catch (err) {
        console.error('Error fetching favorites for search page:', err);
        setWishlistIds([]);
      }
    };

    fetchMemberAndFavorites();
  }, [user]);

  // Debounce search query
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  function findExactCityMatch(query: string): UyCity | undefined {
    const q = query.trim().toLowerCase();
    return uyCities.find((c) => c.name.toLowerCase() === q);
  }

  // Fetch properties based on current non-location filters
  const fetchProperties = useCallback(
    async () => {
      try {
        const trimmedLocation = debouncedSearchQuery.trim();
        const shouldApplyPriceRange =
          filters.priceRange[0] !== DEFAULT_PRICE_RANGE[0] ||
          filters.priceRange[1] !== DEFAULT_PRICE_RANGE[1];
        const searchFilters = {
          priceRange: shouldApplyPriceRange ? filters.priceRange : undefined,
          bedrooms: filters.bedrooms > 0 ? filters.bedrooms : undefined,
          guests: filters.guests > 0 ? filters.guests : undefined,
          amenities: filters.amenities.length > 0 ? filters.amenities : undefined,
          minRating: filters.minRating > 0 ? filters.minRating : undefined,
          location: trimmedLocation.length > 0 ? trimmedLocation : undefined,
        };

        const result = await searchProperties(searchFilters, 1, 50);
        setProperties(result.properties);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setProperties([]);
      }
    },
    [filters, debouncedSearchQuery]
  );

  // Fetch properties when debounced location or filters change
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Keep map in sync with current results so markers/list are visible.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || properties.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    properties.forEach((property) => {
      const offsetCoordinates = getOffsetCoordinates(property);
      bounds.extend([offsetCoordinates.lng, offsetCoordinates.lat]);
    });

    if (bounds.isEmpty()) return;

    map.fitBounds(bounds, {
      padding: 80,
      maxZoom: 13,
      duration: 600,
    });
  }, [properties, getOffsetCoordinates]);

  // When debounced query is set and not from list, geocode and move map
  useEffect(() => {
    const q = debouncedSearchQuery.trim();
    if (!q || !mapboxToken) return;
    const exactMatch = findExactCityMatch(q);
    if (exactMatch) return; // use list coordinates only on explicit select; debounced flow doesn't set viewport for list matches

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${mapboxToken}&country=UY`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const feature = data.features?.[0];
        if (feature?.center && Array.isArray(feature.center)) {
          const [lng, lat] = feature.center;
          setMapViewport((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            zoom: 12,
          }));

          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [lng, lat],
              zoom: 12,
              essential: true,
            });
          }
        }
      })
      .catch((err) => console.error('Geocoding error:', err));
  }, [debouncedSearchQuery, mapboxToken]);

  // Filtered Uruguay cities for autocomplete
  const filteredCities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return uyCities
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, UY_CITIES_MAX_SUGGESTIONS);
  }, [searchQuery]);

  const handleSelectCity = useCallback(
    (city: UyCity) => {
      setSearchQuery(city.name);
      const lat = parseFloat(city.lat);
      const lng = parseFloat(city.long);
      const zoom = parseInt(city.zoom, 10);

      setMapViewport({
        latitude: lat,
        longitude: lng,
        zoom,
      });

      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom,
          essential: true,
        });
      }
      setShowSuggestions(false);
    },
    []
  );

  // Click outside and Escape to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
      priceRange: DEFAULT_PRICE_RANGE,
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

  const visibleProperties = useMemo(() => {
    if (!mapBounds) return properties;

    return properties.filter((property) => {
      const { lng, lat } = property.coordinates;
      return (
        lng >= mapBounds.getWest() &&
        lng <= mapBounds.getEast() &&
        lat >= mapBounds.getSouth() &&
        lat <= mapBounds.getNorth()
      );
    });
  }, [properties, mapBounds]);

  const focusOnProperty = useCallback(
    (property: Property) => {
      setSelectedProperty(property);
      const offsetCoordinates = getOffsetCoordinates(property);
      const map = mapRef.current;
      if (map) {
        map.flyTo({
          center: [offsetCoordinates.lng, offsetCoordinates.lat],
          zoom: 14,
          essential: true,
        });
      }
      scrollToProperty(property.id);
    },
    [scrollToProperty, getOffsetCoordinates]
  );

  // Initialize map once
  useEffect(() => {
    if (!mapboxToken || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: 'search-map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [mapViewport.longitude, mapViewport.latitude],
      zoom: mapViewport.zoom,
    });

    mapRef.current = map;

    map.on('load', () => {
      setMapBounds(map.getBounds());
    });

    map.on('moveend', () => {
      setMapBounds(map.getBounds());
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      popupsRef.current.forEach((popup) => popup.remove());
      markersRef.current = [];
      popupsRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [mapboxToken, mapViewport.latitude, mapViewport.longitude, mapViewport.zoom]);

  // Update markers and popup when properties or selection change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    popupsRef.current.forEach((popup) => popup.remove());
    markersRef.current = [];
    popupsRef.current = [];

    visibleProperties.forEach((property) => {
      const offsetCoordinates = getOffsetCoordinates(property);
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

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([offsetCoordinates.lng, offsetCoordinates.lat])
        .addTo(map);

      markerElement.addEventListener('click', () => {
        focusOnProperty(property);
      });

      markersRef.current.push(marker);
    });

    if (selectedProperty) {
      const selectedOffsetCoordinates = getOffsetCoordinates(selectedProperty);
      const popup = new mapboxgl.Popup({
        closeOnClick: false,
        offset: [0, -10],
        className: 'sdi-map-popup',
      })
        .setLngLat([selectedOffsetCoordinates.lng, selectedOffsetCoordinates.lat])
        .setHTML(`
          <div class="sdi-map-popup-card">
            <img src="${selectedProperty.images[0]}" alt="${selectedProperty.title}" class="w-full h-24 object-cover rounded-xl mb-3" />
            <h3 class="font-semibold text-navy text-sm mb-1 leading-5">${selectedProperty.title}</h3>
            <p class="text-xs text-charcoal mb-3">${selectedProperty.location}</p>
            <div class="flex items-center justify-between">
              <span class="font-bold text-gold">$${selectedProperty.price}${t('search.map.perNight')}</span>
              <div class="flex items-center space-x-1">
                <span class="text-xs text-charcoal">★ ${selectedProperty.rating}</span>
              </div>
            </div>
            <a href="/property/${selectedProperty.id}" class="block mt-3">
              <button class="w-full bg-gold text-navy px-3 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90">
                ${t('search.map.viewDetails')}
              </button>
            </a>
          </div>
        `)
        .addTo(map);

      popupsRef.current.push(popup);
    }
  }, [visibleProperties, hoveredProperty, selectedProperty, t, getOffsetCoordinates]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const clearApproxZone = () => {
      if (map.getLayer(APPROX_ZONE_FILL_LAYER_ID)) {
        map.removeLayer(APPROX_ZONE_FILL_LAYER_ID);
      }
      if (map.getLayer(APPROX_ZONE_STROKE_LAYER_ID)) {
        map.removeLayer(APPROX_ZONE_STROKE_LAYER_ID);
      }
      if (map.getSource(APPROX_ZONE_SOURCE_ID)) {
        map.removeSource(APPROX_ZONE_SOURCE_ID);
      }
    };

    const renderApproxZone = () => {
      if (!selectedProperty || map.getZoom() < APPROX_ZONE_MIN_ZOOM) {
        clearApproxZone();
        return;
      }

      const offsetCoordinates = getOffsetCoordinates(selectedProperty);
      const zoneFeature = createGeoCircleFeature(
        offsetCoordinates.lng,
        offsetCoordinates.lat,
        APPROX_ZONE_RADIUS_METERS
      );

      clearApproxZone();
      map.addSource(APPROX_ZONE_SOURCE_ID, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [zoneFeature],
        },
      });

      map.addLayer({
        id: APPROX_ZONE_FILL_LAYER_ID,
        type: 'fill',
        source: APPROX_ZONE_SOURCE_ID,
        paint: {
          'fill-color': '#7DC7F2',
          'fill-opacity': 0.22,
        },
      });

      map.addLayer({
        id: APPROX_ZONE_STROKE_LAYER_ID,
        type: 'line',
        source: APPROX_ZONE_SOURCE_ID,
        paint: {
          'line-color': '#5AAEDC',
          'line-width': 2,
          'line-opacity': 0.65,
        },
      });
    };

    if (map.isStyleLoaded()) {
      renderApproxZone();
    } else {
      map.once('load', renderApproxZone);
    }

    map.on('zoomend', renderApproxZone);
    return () => {
      map.off('zoomend', renderApproxZone);
      clearApproxZone();
    };
  }, [selectedProperty, getOffsetCoordinates, createGeoCircleFeature]);

  // Delay visible properties list rendering slightly for smoother UX
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDelayedVisibleProperties(visibleProperties);
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [visibleProperties]);

  const handleToggleWishlist = async (propertyId: string) => {
    if (!user) return;

    try {
      let currentMemberId = memberId;

      if (!currentMemberId) {
        const member = await getMemberProfile(user.id);
        if (!member) {
          return;
        }
        currentMemberId = member.id;
        setMemberId(member.id);
      }

      const isCurrentlyInWishlist = wishlistIds.includes(propertyId);

      if (isCurrentlyInWishlist) {
        const { error: deleteError } = await supabase
          .from('Favorites')
          .delete()
          .eq('MemberId', currentMemberId)
          .eq('EstatePropertyId', propertyId);

        if (deleteError) {
          console.error('Error removing property from wishlist:', deleteError);
          return;
        }

        setWishlistIds((prev) => prev.filter((id) => id !== propertyId));
      } else {
        const { error: insertError } = await supabase
          .from('Favorites')
          .insert({
            MemberId: currentMemberId,
            EstatePropertyId: propertyId,
            FavoritedAt: new Date().toISOString(),
          });

        if (insertError) {
          console.error('Error adding property to wishlist:', insertError);
          return;
        }

        setWishlistIds((prev) => [...prev, propertyId]);
      }
    } catch (err) {
      console.error('Error toggling wishlist status:', err);
    }
  };

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
                <div ref={searchContainerRef} className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400">
                    <SearchIcon className="h-full w-full" />
                  </div>
                  <Input
                    placeholder={t('search.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(value) => setSearchQuery(value)}
                    onFocus={() => setShowSuggestions(true)}
                    className="pl-10"
                  />
                  {showSuggestions && searchQuery.length >= 1 && filteredCities.length > 0 && (
                    <ul
                      className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      role="listbox"
                    >
                      {filteredCities.map((city) => (
                        <li
                          key={city.name}
                          role="option"
                          className="px-4 py-2.5 cursor-pointer text-sm text-navy hover:bg-gray-100 border-b border-gray-100 last:border-0"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectCity(city);
                          }}
                        >
                          {city.name}
                        </li>
                      ))}
                    </ul>
                  )}
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
            </div>

            {/* Properties List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {delayedVisibleProperties.map((property) => {
                  const isSelected = selectedProperty?.id === property.id;
                  const isHovered = hoveredProperty === property.id;

                  return (
                    <div
                      key={property.id}
                      ref={(el) => {
                        if (el) propertyRefs.current[property.id] = el;
                      }}
                      onMouseEnter={() => setHoveredProperty(property.id)}
                      onMouseLeave={() => setHoveredProperty(null)}
                      className={`transition-all duration-200 cursor-pointer rounded-2xl ${
                        isSelected
                          ? 'ring-2 ring-gold ring-offset-2 ring-offset-white scale-[1.02] shadow-gold-lg'
                          : isHovered
                          ? 'scale-[1.02]'
                          : ''
                      }`}
                      onClick={() => focusOnProperty(property)}
                    >
                      <PropertyCard
                        property={property}
                        onToggleWishlist={handleToggleWishlist}
                        isInWishlist={wishlistIds.includes(property.id)}
                        showWishlist={!!user}
                        disableLink
                      />
                    </div>
                  );
                })}

                {delayedVisibleProperties.length === 0 && (
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
