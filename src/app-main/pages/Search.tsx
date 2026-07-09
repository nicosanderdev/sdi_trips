import React, { useState, useMemo, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import mapboxgl from 'mapbox-gl';
import { Layout } from '../../components/layout';
import { Button, Input, RangeSlider, Card } from '../../components/ui';
import PropertyCard from '../../components/sections/PropertyCard';
import { useSearchPricing } from '../../hooks/useSearchPricing';
import { usePortalPropertySearch } from '../../hooks/usePortalPropertySearch';
import { getFavoriteProperties } from '../../services/propertyService';
import { buildPropertyDetailPath, parseIsoDateLocal, toIsoDate } from '../../services/pricing/listingPricing';
import type { Property } from '../../types';
import { SlidersHorizontal, MapPin, Search as SearchIcon } from 'lucide-react';
import {
  findExactUyCityMatch,
  getUyCities,
  portalRpcCityFromUyLabel,
  type UyCity,
} from '../../data/uyCityUtils';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useAuth } from '../../hooks/useAuth';
import { getMemberProfile } from '../../services/memberService';
import { supabase } from '../../lib/supabase';

const DEBOUNCE_MS = 450;
const UY_CITIES_MAX_SUGGESTIONS = 10;
const DEFAULT_PRICE_RANGE: [number, number] = [100, 600];
const PRIVACY_OFFSET_METERS = 120;
const APPROX_ZONE_RADIUS_METERS = 100;
const APPROX_ZONE_MIN_ZOOM = 14;
const APPROX_ZONE_SOURCE_ID = 'selected-property-approx-zone-source';
const APPROX_ZONE_FILL_LAYER_ID = 'selected-property-approx-zone-fill-layer';
const APPROX_ZONE_STROKE_LAYER_ID = 'selected-property-approx-zone-stroke-layer';

const uyCities = getUyCities();

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
  const [searchParams] = useSearchParams();
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
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapBounds, setMapBounds] = useState<mapboxgl.LngLatBounds | null>(null);
  const [debouncedMapBounds, setDebouncedMapBounds] = useState<mapboxgl.LngLatBounds | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: -30.901139, lng: -55.543487 });
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

  // Seed location from deep link (?q=) from the landing hero form (layout effect so debounce effect sees updated searchQuery)
  useLayoutEffect(() => {
    const q = searchParams.get('q');
    if (!q) return;
    const trimmed = q.trim();
    if (!trimmed) return;
    setSearchQuery(trimmed);
    setDebouncedSearchQuery(trimmed);

    const exactMatch = findExactUyCityMatch(trimmed);
    if (exactMatch) {
      const lat = parseFloat(exactMatch.lat);
      const lng = parseFloat(exactMatch.long);
      const zoom = parseInt(exactMatch.zoom, 10);
      setMapViewport({ latitude: lat, longitude: lng, zoom });
    }
  }, [searchParams]);

  useLayoutEffect(() => {
    const checkInParam = searchParams.get('checkIn');
    const checkOutParam = searchParams.get('checkOut');
    if (!checkInParam && !checkOutParam) return;
    setFilters((prev) => ({
      ...prev,
      checkIn: checkInParam ? parseIsoDateLocal(checkInParam) ?? prev.checkIn : prev.checkIn,
      checkOut: checkOutParam ? parseIsoDateLocal(checkOutParam) ?? prev.checkOut : prev.checkOut,
    }));
  }, [searchParams]);

  // Debounce search query
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  // Debounce map bounds for portal search refetch
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedMapBounds(mapBounds);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [mapBounds]);

  const portalRpcFilters = useMemo(() => {
    const trimmedLocation = debouncedSearchQuery.trim();
    const exactCity = findExactUyCityMatch(trimmedLocation);
    const shouldApplyPriceRange =
      filters.priceRange[0] !== DEFAULT_PRICE_RANGE[0] ||
      filters.priceRange[1] !== DEFAULT_PRICE_RANGE[1];

    return {
      swLat: debouncedMapBounds?.getSouth(),
      neLat: debouncedMapBounds?.getNorth(),
      swLng: debouncedMapBounds?.getWest(),
      neLng: debouncedMapBounds?.getEast(),
      city: exactCity ? portalRpcCityFromUyLabel(exactCity.name) : undefined,
      searchText: exactCity ? undefined : trimmedLocation || undefined,
      minPrice: shouldApplyPriceRange ? filters.priceRange[0] : undefined,
      maxPrice: shouldApplyPriceRange ? filters.priceRange[1] : undefined,
      bedroomsMin: filters.bedrooms > 0 ? filters.bedrooms : undefined,
      capacityMin: filters.guests > 0 ? filters.guests : undefined,
      checkIn: filters.checkIn ? toIsoDate(filters.checkIn) : undefined,
      checkOut: filters.checkOut ? toIsoDate(filters.checkOut) : undefined,
      centerLat: mapCenter.lat,
      centerLng: mapCenter.lng,
    };
  }, [debouncedSearchQuery, debouncedMapBounds, filters, mapCenter.lat, mapCenter.lng]);

  const portalPostFilters = useMemo(
    () => ({
      amenityNames: filters.amenities.length > 0 ? filters.amenities : undefined,
      minRating: filters.minRating > 0 ? filters.minRating : undefined,
    }),
    [filters.amenities, filters.minRating],
  );

  const {
    properties,
    loading: searchLoading,
    error: searchError,
  } = usePortalPropertySearch({
    rpcFilters: portalRpcFilters,
    postFilters: portalPostFilters,
    hydrateLimit: 50,
  });

  const { priceByPropertyId } = useSearchPricing(
    properties as Property[],
    filters.checkIn,
    filters.checkOut,
  );

  const propertyDetailPath = useCallback(
    (propertyId: string) =>
      buildPropertyDetailPath(propertyId, {
        checkIn: filters.checkIn,
        checkOut: filters.checkOut,
      }),
    [filters.checkIn, filters.checkOut],
  );

  // Markers are placed in a separate effect; do not auto fitBounds on every
  // search result — that triggers moveend → bounds filter change → refetch loop.

  // When debounced query is set and not from list, geocode and move map
  useEffect(() => {
    const q = debouncedSearchQuery.trim();
    if (!q || !mapboxToken) return;
    const exactMatch = findExactUyCityMatch(q);
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
      const bounds = map.getBounds();
      setMapBounds(bounds);
      const center = map.getCenter();
      setMapCenter({ lat: center.lat, lng: center.lng });
    });

    map.on('moveend', () => {
      setMapBounds(map.getBounds());
      const center = map.getCenter();
      setMapCenter({ lat: center.lat, lng: center.lng });
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

    properties.forEach((property) => {
      if (selectedProperty?.id === property.id) {
        return;
      }
      const priced = priceByPropertyId.get(property.id);
      const markerPrice = priced?.amount ?? property.price;
      const offsetCoordinates = getOffsetCoordinates(property);
      const markerElement = document.createElement('div');
      markerElement.className = `w-10 h-10 rounded-full shadow-lg cursor-pointer transition-all ${
        hoveredProperty === property.id
          ? 'bg-gold scale-110'
          : 'bg-[#1F4D8B]'
      }`;
      markerElement.innerHTML = `
        <div class="w-full h-full rounded-full flex items-center justify-center">
          <span class="text-xs font-bold text-white">$${markerPrice}</span>
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
      const selectedPriced = priceByPropertyId.get(selectedProperty.id);
      const popupPrice = selectedPriced?.amount ?? selectedProperty.price;
      const selectedOffsetCoordinates = getOffsetCoordinates(selectedProperty);
      const popup = new mapboxgl.Popup({
        closeOnClick: false,
        offset: [0, -10],
        className: 'sdi-map-popup',
      })
        .setLngLat([selectedOffsetCoordinates.lng, selectedOffsetCoordinates.lat])
        .setHTML(`
          <div class="sdi-map-popup-card flex flex-col gap-2.5">
            <img src="${selectedProperty.images[0]}" alt="${selectedProperty.title}" class="w-full h-20 object-cover rounded-xl" />
            <h3 class="font-semibold text-navy text-sm leading-5 max-h-10 overflow-hidden wrap-break-word">${selectedProperty.title}</h3>
            <p class="text-xs text-charcoal truncate">${selectedProperty.location}</p>
            <div class="flex items-center justify-between">
              <span class="font-bold text-gold">$${popupPrice}${t('search.map.perNight')}</span>
              <div class="flex items-center space-x-1">
                <span class="text-xs text-charcoal">★ ${selectedProperty.rating}</span>
              </div>
            </div>
            <a href="${propertyDetailPath(selectedProperty.id)}" class="block mt-1">
              <button class="w-full bg-gold text-navy px-3 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 active:bg-navy active:text-white cursor-pointer">
                ${t('search.map.viewDetails')}
              </button>
            </a>
          </div>
        `)
        .addTo(map);

      popupsRef.current.push(popup);
    }
  }, [properties, hoveredProperty, selectedProperty, t, getOffsetCoordinates, priceByPropertyId, focusOnProperty, propertyDetailPath]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const clearApproxZone = () => {
      if (!map.isStyleLoaded()) {
        return;
      }
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
      if (!map.isStyleLoaded()) {
        return;
      }
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
      setDelayedVisibleProperties(properties);
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [properties]);

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
                        displayAmount={priceByPropertyId.get(property.id)?.amount}
                        displayLabelKey={priceByPropertyId.get(property.id)?.labelKey}
                        onToggleWishlist={handleToggleWishlist}
                        isInWishlist={wishlistIds.includes(property.id)}
                        showWishlist={!!user}
                        disableLink
                        detailTo={propertyDetailPath(property.id)}
                      />
                    </div>
                  );
                })}

                {searchLoading && (
                  <p className="text-center py-8 text-charcoal">{t('search.results.loading', { defaultValue: 'Loading properties…' })}</p>
                )}
                {searchError && !searchLoading && (
                  <p className="text-center py-8 text-red-600">{searchError}</p>
                )}
                {!searchLoading && !searchError && delayedVisibleProperties.length === 0 && (
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
