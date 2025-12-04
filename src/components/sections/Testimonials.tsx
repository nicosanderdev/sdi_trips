import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Card } from '../ui';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah & Michael Chen",
      location: "San Francisco, CA",
      rating: 5,
      text: "Our stay at the mountain cabin was absolutely magical. The views were breathtaking, and the property was even more beautiful than the photos. We'll definitely be back!",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      propertyType: "Mountain Cabin"
    },
    {
      id: 2,
      name: "Emma Thompson",
      location: "London, UK",
      rating: 5,
      text: "The beach villa exceeded all our expectations. The attention to detail was incredible, and the host was so welcoming. Perfect for our family vacation.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      propertyType: "Beach Villa"
    },
    {
      id: 3,
      name: "Carlos Rodriguez",
      location: "Barcelona, Spain",
      rating: 5,
      text: "Stunning property with amazing amenities. The city apartment had everything we needed for our business trip, plus it was incredibly stylish and comfortable.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      propertyType: "City Apartment"
    }
  ];

  return (
    <section className="py-20 bg-warm-gray-light">
      <div className="max-w-7xl mx-auto px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-thin text-navy mb-4">
            What Our <span className="font-bold text-gold">Guests Say</span>
          </h2>
          <p className="text-xl text-charcoal max-w-2xl mx-auto">
            Don't just take our word for it. Hear from travelers who've experienced
            the magic of our holiday homes.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} variant="default" className="relative">
              {/* Quote Icon */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gold rounded-full flex items-center justify-center shadow-lg">
                <Quote className="h-6 w-6 text-navy" />
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-gold text-gold" />
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-charcoal mb-6 italic leading-relaxed">
                "{testimonial.text}"
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center space-x-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="font-semibold text-navy">{testimonial.name}</div>
                  <div className="text-sm text-charcoal">{testimonial.location}</div>
                  <div className="text-xs text-gold font-medium">{testimonial.propertyType}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-navy mb-2">4.9/5</div>
              <div className="text-sm text-charcoal">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-navy mb-2">10,000+</div>
              <div className="text-sm text-charcoal">Happy Guests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-navy mb-2">99%</div>
              <div className="text-sm text-charcoal">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-navy mb-2">24/7</div>
              <div className="text-sm text-charcoal">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
