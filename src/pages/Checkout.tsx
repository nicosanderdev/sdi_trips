import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/layout';
import { Card, Button, Input, Badge } from '../components/ui';
import { ArrowLeft, Calendar, Users, Shield, CheckCircle, MapPin, Star } from 'lucide-react';
import { mockProperties } from '../data/mockData';

const Checkout: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();

  // Find the property
  const property = mockProperties.find(p => p.id === propertyId);

  // Booking form state
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
    agreeToTerms: false,
    paymentMethod: 'card',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!property) {
    return (
      <Layout>
        <div className="py-12 px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-semibold text-navy mb-4">Property not found</h1>
            <Link to="/search">
              <Button variant="primary">Browse Properties</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  const calculateSubtotal = () => {
    const nights = calculateNights();
    return nights * property.price;
  };

  const calculateServiceFee = () => {
    return Math.round(calculateSubtotal() * 0.12); // 12% service fee
  };

  const calculateTaxes = () => {
    return Math.round(calculateSubtotal() * 0.08); // 8% taxes
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateServiceFee() + calculateTaxes();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!bookingData.checkIn) newErrors.checkIn = 'Check-in date is required';
    if (!bookingData.checkOut) newErrors.checkOut = 'Check-out date is required';
    if (!bookingData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!bookingData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!bookingData.email) newErrors.email = 'Email is required';
    if (!bookingData.phone) newErrors.phone = 'Phone number is required';
    if (!bookingData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';

    if (bookingData.checkIn && bookingData.checkOut) {
      const checkIn = new Date(bookingData.checkIn);
      const checkOut = new Date(bookingData.checkOut);
      if (checkIn >= checkOut) {
        newErrors.checkOut = 'Check-out must be after check-in';
      }
    }

    if (bookingData.guests > property.maxGuests) {
      newErrors.guests = `Maximum ${property.maxGuests} guests allowed`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Handle booking submission
      console.log('Booking data:', bookingData);
      console.log('Total amount:', calculateTotal());
    }
  };

  const nights = calculateNights();
  const subtotal = calculateSubtotal();
  const serviceFee = calculateServiceFee();
  const taxes = calculateTaxes();
  const total = calculateTotal();

  return (
    <Layout>
      <div className="py-12 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to={`/property/${property.id}`} className="inline-flex items-center space-x-2 text-charcoal hover:text-navy transition-colors mb-4">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Property</span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-thin text-navy mb-2">
              Complete Your <span className="font-bold text-gold">Booking</span>
            </h1>
            <p className="text-xl text-charcoal">
              Secure your stay at {property.title}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Booking Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Property Summary */}
              <Card variant="default" className="p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-navy mb-2">{property.title}</h2>
                    <div className="flex items-center space-x-4 text-sm text-charcoal mb-3">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{property.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-gold text-gold" />
                        <span>{property.rating} ({property.reviewCount} reviews)</span>
                      </div>
                      <Badge variant="default" className="bg-gold text-navy">
                        ${property.price}/night
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-charcoal">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>Up to {property.maxGuests} guests</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{property.bedrooms} bedrooms, {property.bathrooms} bathrooms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Booking Details Form */}
              <Card variant="default" className="p-8">
                <h3 className="text-2xl font-semibold text-navy mb-6">Booking Details</h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      type="date"
                      label="Check-in Date"
                      value={bookingData.checkIn}
                      onChange={(value) => handleInputChange('checkIn', value)}
                      error={errors.checkIn}
                      required
                    />
                    <Input
                      type="date"
                      label="Check-out Date"
                      value={bookingData.checkOut}
                      onChange={(value) => handleInputChange('checkOut', value)}
                      error={errors.checkOut}
                      required
                    />
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">
                      Number of Guests
                    </label>
                    <select
                      value={bookingData.guests}
                      onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold bg-white"
                    >
                      {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                    {errors.guests && (
                      <p className="text-sm text-red-600 font-medium mt-1">{errors.guests}</p>
                    )}
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-navy">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="First Name"
                        placeholder="Enter your first name"
                        value={bookingData.firstName}
                        onChange={(value) => handleInputChange('firstName', value)}
                        error={errors.firstName}
                        required
                      />
                      <Input
                        label="Last Name"
                        placeholder="Enter your last name"
                        value={bookingData.lastName}
                        onChange={(value) => handleInputChange('lastName', value)}
                        error={errors.lastName}
                        required
                      />
                    </div>
                    <Input
                      type="email"
                      label="Email Address"
                      placeholder="Enter your email"
                      value={bookingData.email}
                      onChange={(value) => handleInputChange('email', value)}
                      error={errors.email}
                      required
                    />
                    <Input
                      type="tel"
                      label="Phone Number"
                      placeholder="Enter your phone number"
                      value={bookingData.phone}
                      onChange={(value) => handleInputChange('phone', value)}
                      error={errors.phone}
                      required
                    />
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      value={bookingData.specialRequests}
                      onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                      rows={4}
                      placeholder="Any special requests or requirements..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold resize-none"
                    />
                  </div>

                  {/* Terms Agreement */}
                  <div className="space-y-2">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bookingData.agreeToTerms}
                        onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-gold focus:ring-gold"
                      />
                      <span className="text-sm text-charcoal leading-relaxed">
                        I agree to the{' '}
                        <Link to="/terms" className="text-gold hover:text-navy transition-colors font-medium">
                          Terms of Service
                        </Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-gold hover:text-navy transition-colors font-medium">
                          Privacy Policy
                        </Link>
                        , and understand the cancellation policy.
                      </span>
                    </label>
                    {errors.agreeToTerms && (
                      <p className="text-sm text-red-600 font-medium">{errors.agreeToTerms}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={!bookingData.checkIn || !bookingData.checkOut}
                  >
                    Complete Booking
                  </Button>
                </form>
              </Card>
            </div>

            {/* Price Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card variant="default" className="p-6 sticky top-8">
                <h3 className="text-xl font-semibold text-navy mb-6">Price Summary</h3>

                {/* Price Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-charcoal">
                      ${property.price} × {nights || 0} night{nights !== 1 ? 's' : ''}
                    </span>
                    <span className="font-medium text-navy">${subtotal || 0}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-charcoal">Service fee</span>
                    <span className="font-medium text-navy">${serviceFee || 0}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-charcoal">Taxes</span>
                    <span className="font-medium text-navy">${taxes || 0}</span>
                  </div>

                  <hr className="border-gray-200" />

                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="text-navy">Total</span>
                    <span className="text-gold">${total || 0}</span>
                  </div>
                </div>

                {/* Payment Security */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-800">Secure Payment</h4>
                      <p className="text-sm text-green-700">
                        Your payment is protected by bank-level security
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div className="bg-warm-gray border border-gray-200 rounded-xl p-4 mb-6">
                  <h4 className="font-medium text-navy mb-2">Cancellation Policy</h4>
                  <p className="text-sm text-charcoal">
                    Free cancellation up to 24 hours after booking. After that, cancellations made 7 days before check-in receive a 50% refund.
                  </p>
                </div>

                {/* Property Highlights */}
                <div>
                  <h4 className="font-medium text-navy mb-3">Property Highlights</h4>
                  <div className="space-y-2">
                    {property.amenities.slice(0, 4).map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm text-charcoal">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Host Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <img
                      src={property.host.avatar || `https://ui-avatars.com/api/?name=${property.host.name}&background=E5C469&color=0A1A2F`}
                      alt={property.host.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-navy">Hosted by {property.host.name}</p>
                      {property.host.verified && (
                        <p className="text-sm text-green-600 font-medium">Verified Host</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
