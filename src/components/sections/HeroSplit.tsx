import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui';

const HeroSplit: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Mock review data with different properties, images, ratings, and reviews in multiple languages
  const mockReviews = [
    {
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      rating: 4.9,
      reviewCount: 2500,
      reviewText: "The most beautiful property we've ever stayed in. Absolutely magical!",
      language: 'en'
    },
    {
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      rating: 4.8,
      reviewCount: 1800,
      reviewText: "La propiedad más hermosa en la que nos hemos quedado. ¡Absolutamente mágica!",
      language: 'es'
    },
    {
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      rating: 5.0,
      reviewCount: 3200,
      reviewText: "A propriedade mais linda em que nos ficamos. Absolutamente mágica!",
      language: 'pt'
    },
    {
      image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      rating: 4.7,
      reviewCount: 1950,
      reviewText: "La propriété la plus belle dans laquelle nous avons séjourné. Absolument magique!",
      language: 'fr'
    },
    {
      image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      rating: 4.6,
      reviewCount: 1420,
      reviewText: "La proprietà più bella in cui siamo stati. Assolutamente magica!",
      language: 'it'
    }
  ];

  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // Rotate reviews every 9 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentReviewIndex((prev) => (prev + 1) % mockReviews.length);
        setIsFading(false);
      }, 500);
    }, 9000);

    return () => clearInterval(interval);
  }, [mockReviews.length]);

  const currentReview = mockReviews[currentReviewIndex];

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Rich Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold via-warm-gray-light to-white"></div>
      
      {/* Enhanced Background Pattern with More Color Presence */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gold rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-navy rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-dark rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left Side - Text Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-thin text-navy leading-tight">
                {t('landing.hero.title')}
              </h1>
              <p className="text-xl text-charcoal max-w-md leading-relaxed">
                {t('landing.hero.description')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/search">
                <Button variant="primary" size="lg" onClick={() => navigate('/search')}>
                  {t('landing.hero.cta.search')}
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
                  {t('landing.hero.cta.login')}
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-navy">800+</div>
                <div className="text-sm text-charcoal font-medium">{t('landing.hero.stats.properties')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-navy">50+</div>
                <div className="text-sm text-charcoal font-medium">{t('landing.hero.stats.countries')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-navy">10K+</div>
                <div className="text-sm text-charcoal font-medium">{t('landing.hero.stats.happyGuests')}</div>
              </div>
            </div>
          </div>

          {/* Right Side - Image and Decorative Number */}
          <div className="relative">
            {/* Main Property Image */}
            <div className={`relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ${isFading ? 'opacity-50' : 'opacity-100'}`}>
              <img
                src={currentReview.image}
                alt="Luxury holiday home"
                className={`w-full h-[600px] object-cover transition-all duration-500 ${isFading ? 'opacity-50' : 'opacity-100'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Floating Card */}
            <div className={`absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-gold border border-gold/20 max-w-xs transition-all duration-500 ${isFading ? 'opacity-50' : 'opacity-100'}`}>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center">
                  <span className="text-navy font-bold text-lg">★</span>
                </div>
                <div>
                  <div className="font-semibold text-navy">{currentReview.rating} Rating</div>
                  <div className="text-sm text-charcoal">From {currentReview.reviewCount.toLocaleString()} reviews</div>
                </div>
              </div>
              <p className={`text-sm text-charcoal italic transition-all duration-500 ${isFading ? 'opacity-50' : 'opacity-100'}`}>
                {currentReview.reviewText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSplit;
