import React from 'react';
import { Link } from 'react-router-dom';
import { Button, OutlineNumber } from '../ui';

const HeroSplit: React.FC = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-warm-gray-light to-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gold rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-navy rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left Side - Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-thin text-navy leading-tight">
                Find Your
                <span className="block font-bold text-gold">Perfect</span>
                <span className="block font-thin">Holiday Home</span>
              </h1>
              <p className="text-xl text-charcoal max-w-md leading-relaxed">
                Discover extraordinary properties in the world's most beautiful destinations.
                Experience luxury, comfort, and unforgettable memories.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/search">
                <Button variant="primary" size="lg">
                  Explore Properties
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-navy">800+</div>
                <div className="text-sm text-charcoal font-medium">Properties</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-navy">50+</div>
                <div className="text-sm text-charcoal font-medium">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-navy">10K+</div>
                <div className="text-sm text-charcoal font-medium">Happy Guests</div>
              </div>
            </div>
          </div>

          {/* Right Side - Image and Decorative Number */}
          <div className="relative">
            {/* Main Property Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Luxury holiday home"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Decorative Outline Number */}
            <div className="absolute -top-20 -right-20 z-10">
              <OutlineNumber number="800+" size="3xl" />
            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-gold border border-gold/20 max-w-xs">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center">
                  <span className="text-navy font-bold text-lg">★</span>
                </div>
                <div>
                  <div className="font-semibold text-navy">4.9 Rating</div>
                  <div className="text-sm text-charcoal">From 2,500+ reviews</div>
                </div>
              </div>
              <p className="text-sm text-charcoal italic">
                "The most beautiful property we've ever stayed in. Absolutely magical!"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSplit;
