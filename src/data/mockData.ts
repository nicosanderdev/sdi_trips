import type { Property, User, Booking, Message, Conversation, Review } from '../types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Anna Svensson',
    email: 'anna@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    verified: true,
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    email: 'marcus@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    verified: true,
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    email: 'elena@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    verified: false,
  },
];

// Mock Properties
export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Seaside Villa Paradise',
    location: 'Malibu, California',
    price: 450,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    ],
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    description: 'Stunning beachfront villa with panoramic ocean views. Features a private infinity pool, gourmet kitchen, and direct beach access. Perfect for family gatherings or romantic getaways.',
    amenities: ['Pool', 'Beach Access', 'WiFi', 'Air Conditioning', 'Kitchen', 'Parking'],
    rating: 4.9,
    reviewCount: 127,
    host: mockUsers[0],
    available: true,
    coordinates: { lat: 34.0259, lng: -118.7798 }, // Malibu coordinates
  },
  {
    id: '2',
    title: 'Alpine Mountain Chalet',
    location: 'Zermatt, Switzerland',
    price: 380,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    ],
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    description: 'Cozy mountain chalet with breathtaking Matterhorn views. Features a stone fireplace, hot tub, and ski-in/ski-out access. Experience Swiss alpine luxury at its finest.',
    amenities: ['Fireplace', 'Hot Tub', 'Ski Access', 'WiFi', 'Mountain View', 'Parking'],
    rating: 4.8,
    reviewCount: 89,
    host: mockUsers[1],
    available: true,
    coordinates: { lat: 46.0207, lng: 7.7491 }, // Zermatt coordinates
  },
  {
    id: '3',
    title: 'Urban Loft Downtown',
    location: 'New York City, NY',
    price: 320,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aaa4c4bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    ],
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    description: 'Modern loft in the heart of Manhattan. Floor-to-ceiling windows, exposed brick, and rooftop access. Walking distance to Central Park and world-class dining.',
    amenities: ['City View', 'Rooftop', 'WiFi', 'Air Conditioning', 'Gym Access', 'Doorman'],
    rating: 4.7,
    reviewCount: 203,
    host: mockUsers[2],
    available: true,
    coordinates: { lat: 40.7128, lng: -74.0060 }, // NYC coordinates
  },
  {
    id: '4',
    title: 'Tropical Beach Bungalow',
    location: 'Bali, Indonesia',
    price: 180,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1520637836862-4d197d17c115?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1573790387438-4da905039392?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    ],
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    description: 'Charming beach bungalow surrounded by lush tropical gardens. Wake up to the sound of waves, enjoy fresh coconuts, and experience authentic Balinese hospitality.',
    amenities: ['Beach Access', 'Garden', 'WiFi', 'Air Conditioning', 'Kitchen', 'Bicycles'],
    rating: 4.9,
    reviewCount: 156,
    host: mockUsers[0],
    available: true,
    coordinates: { lat: -8.4095, lng: 115.1889 }, // Bali coordinates
  },
  {
    id: '5',
    title: 'Countryside Manor House',
    location: 'Cotswolds, England',
    price: 520,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1502672023488-70e25813eb80?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1501183638710-841dd1904471?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    ],
    bedrooms: 5,
    bathrooms: 4,
    maxGuests: 10,
    description: 'Historic manor house set in the picturesque Cotswolds countryside. Features period architecture, expansive gardens, and a private lake. Perfect for large family gatherings.',
    amenities: ['Garden', 'Lake', 'Fireplace', 'WiFi', 'Parking', 'Pet Friendly'],
    rating: 4.8,
    reviewCount: 94,
    host: mockUsers[1],
    available: false,
    coordinates: { lat: 51.8331, lng: -1.8501 }, // Cotswolds coordinates
  },
  {
    id: '6',
    title: 'Desert Oasis Villa',
    location: 'Sedona, Arizona',
    price: 290,
    currency: 'USD',
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1520637836862-4d197d17c115?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    ],
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    description: 'Contemporary villa nestled in the red rocks of Sedona. Features floor-to-ceiling windows, a private pool, and stunning sunset views. Experience the magic of the desert.',
    amenities: ['Pool', 'Mountain View', 'WiFi', 'Air Conditioning', 'Hot Tub', 'Hiking Trails'],
    rating: 4.7,
    reviewCount: 78,
    host: mockUsers[2],
    available: true,
    coordinates: { lat: 34.8697, lng: -111.7610 }, // Sedona coordinates
  },
];

// Mock Bookings
export const mockBookings: Booking[] = [
  {
    id: '1',
    property: mockProperties[0],
    user: mockUsers[2],
    checkIn: '2024-07-15',
    checkOut: '2024-07-22',
    guests: 4,
    totalPrice: 3150,
    status: 'confirmed',
    createdAt: '2024-06-01T10:00:00Z',
  },
  {
    id: '2',
    property: mockProperties[1],
    user: mockUsers[2],
    checkIn: '2024-08-10',
    checkOut: '2024-08-17',
    guests: 2,
    totalPrice: 2660,
    status: 'completed',
    createdAt: '2024-05-15T14:30:00Z',
  },
];

// Mock Reviews
export const mockReviews: Review[] = [
  {
    id: '1',
    property: mockProperties[0],
    user: mockUsers[2],
    rating: 5,
    comment: 'Absolutely incredible villa! The views are breathtaking and the amenities are top-notch. Anna was an amazing host and made our family vacation unforgettable.',
    createdAt: '2024-06-20T15:30:00Z',
  },
  {
    id: '2',
    property: mockProperties[0],
    user: mockUsers[1],
    rating: 4,
    comment: 'Beautiful property with amazing ocean views. The pool area was perfect for relaxing. Only minor issue was the WiFi connection, but overall a fantastic stay.',
    createdAt: '2024-05-18T11:45:00Z',
  },
  {
    id: '3',
    property: mockProperties[1],
    user: mockUsers[2],
    rating: 5,
    comment: 'The Matterhorn views from this chalet are absolutely stunning. Perfect for our ski trip, and the hot tub after a day on the slopes was heavenly.',
    createdAt: '2024-04-12T20:15:00Z',
  },
  {
    id: '4',
    property: mockProperties[2],
    user: mockUsers[0],
    rating: 4,
    comment: 'Great location in Manhattan! Walking distance to everything. The loft is stylish and modern. Only wish it had been a bit bigger for our group.',
    createdAt: '2024-03-08T14:20:00Z',
  },
];

// Mock Messages and Conversations
export const mockMessages: Message[] = [
  {
    id: '1',
    conversationId: '1',
    sender: mockUsers[2],
    content: 'Hi Anna! I\'m interested in your Seaside Villa for next month. Is it available?',
    timestamp: '2024-06-15T09:00:00Z',
    read: true,
  },
  {
    id: '2',
    conversationId: '1',
    sender: mockUsers[0],
    content: 'Hello Elena! Yes, the villa is available for next month. I\'d be happy to discuss the details with you.',
    timestamp: '2024-06-15T10:30:00Z',
    read: true,
  },
];

export const mockConversations: Conversation[] = [
  {
    id: '1',
    participants: [mockUsers[0], mockUsers[2]],
    property: mockProperties[0],
    lastMessage: mockMessages[1],
    unreadCount: 0,
    updatedAt: '2024-06-15T10:30:00Z',
  },
];
