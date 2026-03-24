export type StaticVenue = {
  id: string;
  name: string;
  location: string;
  capacity: number;
  priceHint: string;
  images: string[];
  subtitle: string;
  description: string;
  amenities: string[];
  eventTypes: string[];
  layoutNotes: string;
  policies: { title: string; body: string }[];
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

export const STATIC_VENUES: StaticVenue[] = [
  {
    id: '1',
    name: 'The Grand Elm Ballroom',
    location: 'Downtown, Austin',
    capacity: 220,
    priceHint: 'From $4,500 / event',
    images: [
      venueImages.ballroom,
      'https://images.unsplash.com/photo-1520854221050-0f4caff449f5?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1566737236500-c8ac4304a668?auto=format&fit=crop&w=1400&q=80',
    ],
    subtitle: 'Crystal chandeliers, sprung dance floor, and a dedicated bridal suite.',
    description:
      'A timeless ballroom with fourteen-foot ceilings, warm oak floors, and floor-to-ceiling windows at sunset. Perfect for receptions that need a dramatic first dance and flexible seating layouts. Our team handles room flips and vendor load-in coordination.',
    amenities: [
      'In-house AV & lighting',
      'Bridal suite',
      'Commercial kitchen access',
      'Valet partnerships',
      'ADA-accessible entrances',
    ],
    eventTypes: ['Weddings', 'Galas', 'Award ceremonies'],
    layoutNotes: 'Theater: 280 · Banquet: 220 · Cocktail: 320',
    policies: [
      {
        title: 'Load-in & timing',
        body: 'Vendor access from 8:00 AM; events end by midnight with a 1-hour breakdown window.',
      },
      {
        title: 'Catering',
        body: 'Choose from our preferred list or bring a licensed caterer with certificate of insurance.',
      },
      {
        title: 'Decorations',
        body: 'Open flame and confetti require approval; ceiling installations must use venue rigging points only.',
      },
    ],
  },
  {
    id: '2',
    name: 'Cypress Garden Estate',
    location: 'Hill Country, TX',
    capacity: 150,
    priceHint: 'From $3,200 / event',
    images: [
      venueImages.garden,
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
    ],
    subtitle: 'Outdoor ceremony lawn, covered pavilion, and string-light courtyard.',
    description:
      'Exchange vows under ancient oaks, then celebrate in a climate-controlled pavilion steps away. The estate includes a prep cottage, fire pits for cool evenings, and optional tent add-ons for larger guest counts.',
    amenities: ['On-site parking (120)', 'Generator backup', 'Restroom trailer upgrade', 'Garden furniture'],
    eventTypes: ['Weddings', 'Milestone parties', 'Fundraisers'],
    layoutNotes: 'Lawn ceremony: 200 · Pavilion seated: 150',
    policies: [
      { title: 'Weather', body: 'Rain plan included with pavilion; tent quotes available 90 days out.' },
      { title: 'Noise', body: 'Amplified music outdoors ends by 10:00 PM per county ordinance.' },
    ],
  },
  {
    id: '3',
    name: 'Foundry Hall',
    location: 'East Austin',
    capacity: 180,
    priceHint: 'From $2,800 / event',
    images: [
      venueImages.industrial,
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80',
      venueImages.loft,
    ],
    subtitle: 'Exposed brick, steel beams, and a mezzanine for brand activations.',
    description:
      'Raw industrial character with polished concrete floors and plenty of power for productions. Brands love the mezzanine for VIP lounges; planners love the open floorplate for runway shows and seated dinners alike.',
    amenities: ['200A power drops', 'Roll-up load-in door', 'Green rooms (2)', 'Wi-Fi included'],
    eventTypes: ['Corporate', 'Product launches', 'Fashion', 'Private concerts'],
    layoutNotes: 'Standing reception: 350 · Seated: 180',
    policies: [
      { title: 'Production', body: 'Rigging and pyro require advance walkthrough with venue technical director.' },
    ],
  },
  {
    id: '4',
    name: 'Skyline Rooftop 12',
    location: 'Central Austin',
    capacity: 120,
    priceHint: 'From $5,000 / event',
    images: [
      venueImages.rooftop,
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1400&q=80',
      venueImages.waterfront,
    ],
    subtitle: 'Panoramic skyline views with retractable glass walls.',
    description:
      'An intimate rooftop built for sunset cocktails and executive dinners. Climate-controlled interior flows to an open terrace—ideal for investor gatherings and upscale private parties.',
    amenities: ['Private elevator', 'Climate-controlled interior', 'Premium bar package options'],
    eventTypes: ['Corporate', 'Rehearsal dinners', 'VIP receptions'],
    layoutNotes: 'Interior: 80 · Terrace cocktail: 120',
    policies: [
      { title: 'Capacity', body: 'Terrace capacity is weather-dependent; interior holds full guest count in inclement weather.' },
    ],
  },
  {
    id: '5',
    name: 'Red Barn Gathering',
    location: 'Driftwood, TX',
    capacity: 130,
    priceHint: 'From $2,400 / event',
    images: [
      venueImages.barn,
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1400&q=80',
      venueImages.garden,
    ],
    subtitle: 'Rustic charm with modern restrooms and climate-controlled dining hall.',
    description:
      'Authentic barn beams paired with updated amenities. Weekend packages include rehearsal hour options and s’mores stations at the fire pit.',
    amenities: ['Climate-controlled hall', 'Fire pit', 'Kids’ lawn games', 'Preferred BBQ partners'],
    eventTypes: ['Weddings', 'Family reunions', 'Grad parties'],
    layoutNotes: 'Hall seated: 130 · Lawn + tent: 200',
    policies: [{ title: 'Alcohol', body: 'TABC-licensed bartenders required; venue can coordinate.' }],
  },
  {
    id: '6',
    name: 'North Loop Gallery',
    location: 'North Austin',
    capacity: 90,
    priceHint: 'From $1,900 / event',
    images: [
      venueImages.gallery,
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1400&q=80',
      venueImages.loft,
    ],
    subtitle: 'White-box gallery with track lighting and modular walls.',
    description:
      'Minimalist walls and professional lighting make this space a favorite for creative workshops, pop-up retail, and intimate seated dinners with an art-forward backdrop.',
    amenities: ['Track lighting', 'Modular walls', 'Projector', 'Speakers'],
    eventTypes: ['Workshops', 'Pop-ups', 'Private dinners', 'Photo shoots'],
    layoutNotes: 'Standing: 120 · Seated: 90',
    policies: [{ title: 'Installations', body: 'Wall-mounted work requires patch & paint fee schedule.' }],
  },
  {
    id: '7',
    name: 'Riverstone Boathouse',
    location: 'Lake Austin',
    capacity: 100,
    priceHint: 'From $4,200 / event',
    images: [
      venueImages.waterfront,
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1400&q=80',
      venueImages.rooftop,
    ],
    subtitle: 'Dock access, sunset deck, and nautical lounge interior.',
    description:
      'Water views from every angle. Great for boutique corporate retreats and rehearsal dinners with optional boat arrival photos.',
    amenities: ['Dock (seasonal)', 'Deck heaters', 'Indoor lounge', 'Kayak storage for team builds'],
    eventTypes: ['Corporate retreats', 'Rehearsal dinners', 'Milestone birthdays'],
    layoutNotes: 'Deck: 100 · Indoor lounge: 60',
    policies: [{ title: 'Water safety', body: 'Dock use requires waiver; life jackets on site for demos only.' }],
  },
  {
    id: '8',
    name: 'Studio 9 Loft',
    location: 'South Congress',
    capacity: 75,
    priceHint: 'From $1,200 / event',
    images: [
      venueImages.loft,
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80',
      venueImages.gallery,
    ],
    subtitle: 'Bright creative loft with kitchen island and Sonos zones.',
    description:
      'A flexible downtown loft for team offsites, podcast tapings, and small celebrations. Natural light until mid-afternoon; blackout shades available.',
    amenities: ['Kitchen island', 'Sonos', 'Mobile 85" display', 'Phone booths (2)'],
    eventTypes: ['Offsites', 'Bridal showers', 'Podcast recordings'],
    layoutNotes: 'Workshop tables: 40 · Lounge: 75',
    policies: [{ title: 'Building', body: 'Load-in via freight elevator; quiet hours after 10 PM.' }],
  },
];

export function listVenues(): StaticVenue[] {
  return STATIC_VENUES;
}

export function getVenueById(id: string): StaticVenue | undefined {
  return STATIC_VENUES.find((v) => v.id === id);
}
