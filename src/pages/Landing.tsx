import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout';
import { Button } from '../components/ui';
import HeroSplit from '../components/sections/HeroSplit';
import PropertyCard from '../components/sections/PropertyCard';
import Testimonials from '../components/sections/Testimonials';
import { getFeaturedProperties } from '../services/propertyService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import type { Property } from '../types';

const Landing: React.FC = () => {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const properties = await getFeaturedProperties();
        setFeaturedProperties(properties);
      } catch (err) {
        console.error('Error fetching featured properties:', err);
        setError('Failed to load featured properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <HeroSplit />

      {/* Featured Properties Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-thin text-navy mb-4">
              Featured <span className="font-bold text-gold">Properties</span>
            </h2>
            <p className="text-xl text-charcoal max-w-2xl mx-auto">
              Discover handpicked properties that offer exceptional experiences
              in stunning locations around the world.
            </p>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="col-span-full">
                <ErrorMessage message={error} />
              </div>
            ) : featuredProperties.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-charcoal text-lg">No featured properties available at the moment.</p>
              </div>
            ) : (
              featuredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                />
              ))
            )}
          </div>

          {/* View All Button */}
          <div className="text-center">
            <Link to="/search">
              <Button variant="outline" size="lg">
                View All Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-warm-gray-light">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-thin text-navy mb-4">
              How It <span className="font-bold text-gold">Works</span>
            </h2>
            <p className="text-xl text-charcoal max-w-2xl mx-auto">
              Booking your dream holiday home is simple and secure.
              Here's how to get started.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold">
                <span className="text-2xl font-bold text-navy">1</span>
              </div>
              <h3 className="text-2xl font-semibold text-navy mb-4">Search & Discover</h3>
              <p className="text-charcoal leading-relaxed">
                Browse through our curated collection of luxury properties.
                Use filters to find the perfect match for your needs and budget.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold">
                <span className="text-2xl font-bold text-navy">2</span>
              </div>
              <h3 className="text-2xl font-semibold text-navy mb-4">Book Instantly</h3>
              <p className="text-charcoal leading-relaxed">
                Found your ideal property? Book instantly with our secure
                payment system. Get instant confirmation and property details.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-gold">
                <span className="text-2xl font-bold text-navy">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-navy mb-4">Enjoy Your Stay</h3>
              <p className="text-charcoal leading-relaxed">
                Arrive and enjoy your luxury holiday home. Our 24/7 support
                team is here to ensure your experience is perfect.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Content */}
            <div>
              <h2 className="text-4xl md:text-5xl font-thin text-navy mb-6">
                Why Choose <span className="font-bold text-gold">Holiday Trips</span>
              </h2>
              <p className="text-xl text-charcoal mb-8 leading-relaxed">
                We're more than just a booking platform. We're your trusted partner
                in creating unforgettable holiday memories.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-navy font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy mb-2">Curated Selection</h3>
                    <p className="text-charcoal">Every property is personally inspected and meets our high standards for luxury and comfort.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-navy font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy mb-2">24/7 Support</h3>
                    <p className="text-charcoal">Our dedicated team is available around the clock to assist with any questions or concerns.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-navy font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy mb-2">Secure Payments</h3>
                    <p className="text-charcoal">Your payments are protected with bank-level security and flexible cancellation policies.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Luxury holiday experience"
                className="rounded-3xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-gold border border-gold/20">
                <div className="text-3xl font-bold text-navy mb-1">98%</div>
                <div className="text-sm text-charcoal font-medium">Guest Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-thin mb-6">
            Ready to Start Your <span className="font-bold text-gold">Adventure</span>?
          </h2>
          <p className="text-xl text-warm-gray-light mb-8 leading-relaxed">
            Join thousands of travelers who trust Holiday Trips for their perfect holiday home.
            Your dream destination awaits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="primary" size="lg" className="bg-gold text-navy hover:bg-white hover:text-navy">
                Get Started Today
              </Button>
            </Link>
            <Link to="/search">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-navy">
                Browse Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Landing;
