import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui';
import type { Property } from '../../types';
import { getTopRatedPropertiesForHero } from '../../services/propertyService';

const mockReviews = [
  {
    image:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    rating: 4.9,
    reviewCount: 2500,
    reviewText:
      "The most beautiful property we've ever stayed in. Absolutely magical!",
    language: 'en',
  },
  {
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    rating: 4.8,
    reviewCount: 1800,
    reviewText:
      'La propiedad más hermosa en la que nos hemos quedado. ¡Absolutamente mágica!',
    language: 'es',
  },
  {
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    rating: 5.0,
    reviewCount: 3200,
    reviewText:
      'A propriedade mais linda em que nos ficamos. Absolutamente mágica!',
    language: 'pt',
  },
  {
    image:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    rating: 4.7,
    reviewCount: 1950,
    reviewText:
      'La propriété la plus belle dans laquelle nous avons séjourné. Absolument magique!',
    language: 'fr',
  },
  {
    image:
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    rating: 4.6,
    reviewCount: 1420,
    reviewText:
      'La proprietà più bella in cui siamo stati. Assolutamente magica!',
    language: 'it',
  },
];

type HeroSlide = {
  image: string;
  reviewText: string;
};

const HeroSplit: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [heroProperties, setHeroProperties] = useState<Property[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadHeroProperties = async () => {
      try {
        const properties = await getTopRatedPropertiesForHero(5);
        if (!isMounted) return;
        setHeroProperties(properties);
      } catch (err) {
        console.error('Error loading hero properties:', err);
      }
    };

    loadHeroProperties();

    return () => {
      isMounted = false;
    };
  }, []);

  const heroSlides: HeroSlide[] =
    heroProperties.length > 0
      ? heroProperties.map((property) => {
          const image =
            property.images && property.images.length > 0
              ? property.images[0]
              : 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';

          const maxLength = 140;
          const description = property.description || '';
          const truncatedDescription =
            description.length > maxLength
              ? `${description.slice(0, maxLength).trim()}…`
              : description || `Guests love staying at ${property.title}.`;

          return {
            image,
            reviewText: truncatedDescription,
          };
        })
      : mockReviews;

  useEffect(() => {
    if (heroSlides.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentReviewIndex((prev) => (prev + 1) % heroSlides.length);
        setIsFading(false);
      }, 500);
    }, 9000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const currentReview = heroSlides[currentReviewIndex] ?? heroSlides[0];

  return (
    <section className="relative min-h-screen overflow-hidden bg-navy isolate">
      <div
        className={`absolute inset-0 bg-cover bg-center transition-all duration-500 ${isFading ? 'opacity-70 scale-105' : 'opacity-100 scale-110'}`}
        style={{ backgroundImage: `url("${currentReview.image}")` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(10,26,47,0.85)_0%,rgba(10,26,47,0.74)_45%,rgba(10,26,47,0.56)_100%)]" aria-hidden="true" />

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-16 min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="animate-[fadeInUp_700ms_ease-out_both]">
          <h1 className="m-0 text-white font-bold text-[clamp(2rem,4vw,4rem)] leading-[1.1] max-w-[13ch]">
            {t('landing.hero.title')}
          </h1>
          <p className="mt-4 text-white/95 text-[clamp(1rem,1.8vw,1.35rem)] max-w-[34ch]">
            {t('landing.hero.description')}
          </p>
          {t('landing.hero.valueProposition').trim() ? (
            <p className="mt-3 text-white/90 text-[clamp(0.95rem,1.5vw,1.1rem)] max-w-[40ch] leading-snug">
              {t('landing.hero.valueProposition')}
            </p>
          ) : null}
          <p className="mt-3 text-white/85 text-base font-medium">{t('landing.hero.support')}</p>

          <form
            className="mt-5 grid grid-cols-1 md:grid-cols-[1.2fr_0.9fr_auto] gap-2 w-full max-w-[720px] p-3 rounded-2xl border border-gold/40 bg-white/95 backdrop-blur-sm"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const fd = new FormData(form);
              const checkIn = String(fd.get('checkIn') ?? '').trim();
              const params = new URLSearchParams({
                q: 'Rivera, Uruguay',
              });
              if (checkIn) {
                params.set('checkIn', checkIn);
              }
              navigate(`/search?${params.toString()}`);
            }}
          >
            <label htmlFor="hero-search-date" className="flex flex-col gap-1.5 text-xs font-semibold text-navy m-0">
              {t('landing.hero.search.dateLabel')}
              <input
                id="hero-search-date"
                className="w-full border border-navy/20 rounded-xl bg-white text-navy text-sm px-3 py-3 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold font-normal"
                type="date"
                name="checkIn"
                aria-label={t('landing.hero.search.dateAria')}
              />
            </label>
            <label htmlFor="hero-search-city" className="flex flex-col gap-1.5 text-xs font-semibold text-navy m-0">
              {t('landing.hero.search.locationLabel')}
              <select
                id="hero-search-city"
                className="w-full border border-navy/20 rounded-xl bg-white text-navy text-sm px-3 py-3 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold font-normal"
                name="city"
                aria-label={t('landing.hero.search.cityAria')}
                defaultValue="Rivera, Uruguay"
                disabled
              >
                <option value="Rivera, Uruguay">Rivera, Uruguay</option>
              </select>
            </label>
            <button
              className="inline-flex items-center justify-center rounded-full border-2 border-gold bg-gold text-navy font-semibold px-6 py-3 transition-all hover:scale-[1.04] hover:bg-navy hover:text-gold"
              type="submit"
            >
              {t('landing.hero.search.submit')}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-4">
            <p className="m-0 text-sm font-semibold text-white/90 before:content-['✓'] before:text-gold before:mr-2">
              {t('landing.hero.trust.verified')}
            </p>
            <p className="m-0 text-sm font-semibold text-white/90 before:content-['✓'] before:text-gold before:mr-2">
              {t('landing.hero.trust.payments')}
            </p>
            <p className="m-0 text-sm font-semibold text-white/90 before:content-['✓'] before:text-gold before:mr-2">
              {t('landing.hero.trust.bookings')}
            </p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3 items-start">
            <Link to="/search">
              <Button variant="primary" size="lg">
                {t('landing.hero.cta.search')}
              </Button>
            </Link>
            <div className="flex flex-col items-start gap-2">
              <Link to="/reservation-lookup">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-navy hover:border-gold hover:text-gold">
                  {t('landing.hero.cta.manage')}
                </Button>
              </Link>
            </div>
          </div>

          {t('landing.hero.links.security').trim() ? (
            <Link to="/privacy" className="inline-block mt-4 text-white/80 underline underline-offset-4 hover:text-white">
              {t('landing.hero.links.security')}
            </Link>
          ) : null}
        </div>

        <div className="relative min-h-[430px] rounded-3xl overflow-hidden border border-gold/30 shadow-2xl bg-white/10 backdrop-blur-sm">
          <div className={`absolute inset-0 p-8 flex flex-col justify-end bg-cover bg-center transition-all duration-500 ${isFading ? 'opacity-70 translate-x-2' : 'opacity-100 translate-x-0'}`}>
            <div className="absolute inset-0 bg-linear-to-t from-navy/90 to-navy/15" />
            <h3 className="relative z-10 m-0 text-xl font-bold text-white">{t('landing.hero.story.title')}</h3>
            <p className="relative z-10 mt-2 text-white/90">{currentReview.reviewText}</p>
          </div>
          <div className="absolute left-1/2 bottom-4 -translate-x-1/2 z-20 flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={`dot-${index}`}
                type="button"
                onClick={() => setCurrentReviewIndex(index)}
                className={`h-2 w-2 rounded-full transition-all ${index === currentReviewIndex ? 'bg-gold scale-125' : 'bg-white/50'}`}
                aria-label={t('landing.hero.story.stepAria', { step: index + 1 })}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSplit;
