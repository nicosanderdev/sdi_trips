import React from 'react';
import { Star, Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui';

const Testimonials: React.FC = () => {
  const { t } = useTranslation();

  const testimonials = [
    {
      id: 1,
      name: t('landing.testimonials.items.1.author'),
      location: t('landing.testimonials.items.1.location'),
      rating: 5,
      text: t('landing.testimonials.items.1.text'),
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      propertyType: "Property Owner"
    },
    {
      id: 2,
      name: t('landing.testimonials.items.2.author'),
      location: t('landing.testimonials.items.2.location'),
      rating: 5,
      text: t('landing.testimonials.items.2.text'),
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      propertyType: "Rivera"
    },
    {
      id: 3,
      name: t('landing.testimonials.items.3.author'),
      location: t('landing.testimonials.items.3.location'),
      rating: 5,
      text: t('landing.testimonials.items.3.text'),
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      propertyType: "Property Owner"
    }
  ];

  return (
    <section className="py-20 bg-warm-gray-light">
      <div className="max-w-7xl mx-auto px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-thin text-navy mb-4">
            {t('landing.testimonials.title')}
          </h2>
          <p className="text-xl text-charcoal max-w-2xl mx-auto">
            {t('landing.testimonials.subtitle')}
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
