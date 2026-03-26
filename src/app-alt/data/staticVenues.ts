/** Stable tags for filters (language-independent). */
export type VenueEventTag = 'wedding' | 'corporate' | 'party' | 'workshop';

export type StaticVenueCore = {
  id: string;
  capacity: number;
  /** Minimum price in USD for filter tiers (budget &lt; 3000, premium &gt;= 4000). */
  priceFrom: number;
  eventTypeTags: VenueEventTag[];
  images: string[];
};

const venueImages = {
  ballroom:
    'https://images.unsplash.com/photo-1519167758481-83f29da3a0a6?auto=format&fit=crop&w=1400&q=80',
  garden:
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1400&q=80',
  industrial:
    'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1400&q=80',
  rooftop:
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=80',
  barn:
    'https://images.unsplash.com/photo-1523438882030-5952d10c8769?auto=format&fit=crop&w=1400&q=80',
  gallery:
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80',
  waterfront:
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1400&q=80',
  loft:
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80',
};

export const STATIC_VENUE_CORES: StaticVenueCore[] = [
  {
    id: '1',
    capacity: 220,
    priceFrom: 4500,
    eventTypeTags: ['wedding', 'corporate'],
    images: [
      venueImages.ballroom,
      'https://images.unsplash.com/photo-1520854221050-0f4caff449f5?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1566737236500-c8ac4304a668?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    id: '2',
    capacity: 150,
    priceFrom: 3200,
    eventTypeTags: ['wedding', 'party'],
    images: [
      venueImages.garden,
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
    ],
  },
  {
    id: '3',
    capacity: 180,
    priceFrom: 2800,
    eventTypeTags: ['corporate', 'party', 'workshop'],
    images: [
      venueImages.industrial,
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80',
      venueImages.loft,
    ],
  },
  {
    id: '4',
    capacity: 120,
    priceFrom: 5000,
    eventTypeTags: ['corporate', 'wedding', 'party'],
    images: [
      venueImages.rooftop,
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1400&q=80',
      venueImages.waterfront,
    ],
  },
  {
    id: '5',
    capacity: 130,
    priceFrom: 2400,
    eventTypeTags: ['wedding', 'party'],
    images: [
      venueImages.barn,
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1400&q=80',
      venueImages.garden,
    ],
  },
  {
    id: '6',
    capacity: 90,
    priceFrom: 1900,
    eventTypeTags: ['workshop', 'party', 'corporate'],
    images: [
      venueImages.gallery,
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1400&q=80',
      venueImages.loft,
    ],
  },
  {
    id: '7',
    capacity: 100,
    priceFrom: 4200,
    eventTypeTags: ['corporate', 'wedding', 'party'],
    images: [
      venueImages.waterfront,
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1400&q=80',
      venueImages.rooftop,
    ],
  },
  {
    id: '8',
    capacity: 75,
    priceFrom: 1200,
    eventTypeTags: ['corporate', 'wedding', 'workshop'],
    images: [
      venueImages.loft,
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80',
      venueImages.gallery,
    ],
  },
];

export function listVenueCores(): StaticVenueCore[] {
  return STATIC_VENUE_CORES;
}

export function getVenueCoreById(id: string): StaticVenueCore | undefined {
  return STATIC_VENUE_CORES.find((v) => v.id === id);
}
