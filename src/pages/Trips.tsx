import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout';
import { Card, Button, Badge } from '../components/ui';
import { Calendar, MapPin, Users, Clock, Star, ChevronRight, CalendarDays } from 'lucide-react';
import { mockBookings } from '../data/mockData';

const Trips: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Mock current user bookings - in real app this would come from auth context
  const userBookings = mockBookings; // Using all bookings for demo

  const currentDate = new Date();

  const upcomingBookings = userBookings.filter(booking =>
    new Date(booking.checkIn) > currentDate
  );

  const pastBookings = userBookings.filter(booking =>
    new Date(booking.checkOut) < currentDate
  );

  const activeBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'warning';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Pending';
    }
  };

  const tabs = [
    { id: 'upcoming' as const, label: 'Upcoming Trips', icon: Calendar, count: upcomingBookings.length },
    { id: 'past' as const, label: 'Past Trips', icon: CalendarDays, count: pastBookings.length },
  ];

  const TripCard: React.FC<{ booking: typeof userBookings[0] }> = ({ booking }) => (
    <Card variant="elevated" className="p-6 hover:shadow-gold-lg transition-all duration-300">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Property Image */}
        <div className="lg:w-48 lg:flex-shrink-0">
          <div className="relative">
            <img
              src={booking.property.images[0]}
              alt={booking.property.title}
              className="w-full h-32 lg:h-40 object-cover rounded-xl"
            />
            <div className="absolute top-3 right-3">
              <Badge variant={getStatusColor(booking.status)} className="text-xs">
                {getStatusText(booking.status)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Trip Details */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
            <div>
              <Link
                to={`/property/${booking.property.id}`}
                className="text-xl font-semibold text-navy hover:text-gold transition-colors mb-1 block"
              >
                {booking.property.title}
              </Link>
              <div className="flex items-center space-x-4 text-sm text-charcoal mb-2">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-gold" />
                  <span>{booking.property.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span>{booking.property.rating} ({booking.property.reviewCount})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gold" />
              <div>
                <div className="text-sm font-medium text-navy">Check-in</div>
                <div className="text-sm text-charcoal">
                  {new Date(booking.checkIn).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gold" />
              <div>
                <div className="text-sm font-medium text-navy">Check-out</div>
                <div className="text-sm text-charcoal">
                  {new Date(booking.checkOut).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gold" />
              <div>
                <div className="text-sm font-medium text-navy">Guests</div>
                <div className="text-sm text-charcoal">{booking.guests}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-medium text-navy">Total</div>
              <div className="text-lg font-bold text-gold">${booking.totalPrice}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {activeTab === 'upcoming' && booking.status === 'confirmed' && (
              <>
                <Button variant="primary" size="sm">
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  Contact Host
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                  Cancel Trip
                </Button>
              </>
            )}
            {activeTab === 'past' && booking.status === 'completed' && (
              <>
                <Button variant="primary" size="sm">
                  Book Again
                </Button>
                <Button variant="outline" size="sm">
                  Leave Review
                </Button>
                <Button variant="outline" size="sm">
                  Download Receipt
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" className="ml-auto">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <Layout>
      <div className="py-12 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-thin text-navy mb-2">
              My <span className="font-bold text-gold">Trips</span>
            </h1>
            <p className="text-xl text-charcoal">
              Manage your upcoming adventures and revisit past experiences
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-warm-gray rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-navy shadow-md'
                    : 'text-charcoal hover:text-navy'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
                <Badge variant="default" className="bg-gold text-navy text-xs">
                  {tab.count}
                </Badge>
              </button>
            ))}
          </div>

          {/* Trips Content */}
          {activeBookings.length === 0 ? (
            <Card variant="default" className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gold mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-navy mb-2">
                {activeTab === 'upcoming' ? 'No Upcoming Trips' : 'No Past Trips'}
              </h3>
              <p className="text-charcoal mb-6">
                {activeTab === 'upcoming'
                  ? 'You don\'t have any upcoming trips planned. Start exploring our amazing properties!'
                  : 'You haven\'t completed any trips yet. Your travel history will appear here.'
                }
              </p>
              <Link to="/search">
                <Button variant="primary">
                  {activeTab === 'upcoming' ? 'Find Your Next Trip' : 'Browse Properties'}
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-6">
              {activeBookings.map((booking) => (
                <TripCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}

          {/* Trip Planning Tips */}
          {activeTab === 'upcoming' && upcomingBookings.length > 0 && (
            <Card variant="default" className="p-8 mt-8 bg-gradient-to-r from-gold/5 to-navy/5 border-gold/20">
              <h3 className="text-xl font-semibold text-navy mb-4">Trip Planning Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-navy">Before You Go</h4>
                  <ul className="text-sm text-charcoal space-y-1">
                    <li>• Confirm check-in details with your host</li>
                    <li>• Review house rules and amenities</li>
                    <li>• Check local transportation options</li>
                    <li>• Pack according to the weather</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-navy">During Your Stay</h4>
                  <ul className="text-sm text-charcoal space-y-1">
                    <li>• Take photos of the property upon arrival</li>
                    <li>• Keep your booking confirmation handy</li>
                    <li>• Respect quiet hours and neighborhood rules</li>
                    <li>• Contact us if you need any assistance</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Trips;
