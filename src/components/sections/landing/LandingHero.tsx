import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui';
import { isSearchPageEnabled } from '../../../core/config/searchPageVisibility';
import { getTopRatedPropertiesForHero } from '../../../services/propertyService';
import type { Property } from '../../../types';
import MainHeroSearch from './MainHeroSearch';
import AltHeroSearch from './AltHeroSearch';

type HeroVariant = 'main' | 'alt';

interface LandingHeroProps {
  variant?: HeroVariant;
}

const MAIN_IMAGES = {
  primary: {
    src: '/landing/hero-house-1600.jpg',
    srcSet: '/landing/hero-house-800.jpg 800w, /landing/hero-house-1600.jpg 1600w',
    alt: 'Casa de vacaciones con fachada clara y jardín',
  },
  secondary: {
    src: '/landing/hero-garden-1600.jpg',
    srcSet: '/landing/hero-garden-800.jpg 800w, /landing/hero-garden-1600.jpg 1600w',
    alt: 'Patio con vegetación y espacio al aire libre',
  },
} as const;

const ALT_IMAGES = {
  primary: {
    src: '/alt-carousel-1.jpg',
    srcSet: undefined as string | undefined,
    alt: 'Salón preparado para una celebración',
  },
  secondary: {
    src: '/alt-carousel-2.jpg',
    srcSet: undefined as string | undefined,
    alt: 'Espacio de eventos con mesas y decoración',
  },
} as const;

const LandingHero: React.FC<LandingHeroProps> = ({ variant = 'main' }) => {
  const { t } = useTranslation();
  const isAlt = variant === 'alt';
  const prefix = isAlt ? 'alt.landing.hero' : 'landing.hero';
  const images = isAlt ? ALT_IMAGES : MAIN_IMAGES;

  const [featuredProperty, setFeaturedProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (isAlt || !isSearchPageEnabled) return;

    let mounted = true;
    getTopRatedPropertiesForHero(1)
      .then((properties) => {
        if (mounted && properties[0]) {
          setFeaturedProperty(properties[0]);
        }
      })
      .catch(() => {
        /* keep stock images */
      });

    return () => {
      mounted = false;
    };
  }, [isAlt]);

  const primarySrc = !isAlt && featuredProperty?.images?.[0]
    ? featuredProperty.images[0]
    : images.primary.src;
  const primarySrcSet = !isAlt && featuredProperty?.images?.[0]
    ? undefined
    : images.primary.srcSet;
  const primaryAlt = !isAlt && featuredProperty
    ? featuredProperty.title
    : images.primary.alt;

  const title = t(`${prefix}.title`);
  const description = t(isAlt ? `${prefix}.subtitle` : `${prefix}.description`);
  const primaryCta = t(isAlt ? `${prefix}.exploreCta` : `${prefix}.cta.search`);
  const secondaryCta = t(isAlt ? `${prefix}.talkCta` : `${prefix}.cta.manage`);
  const howItWorksLabel = t('footer.howItWorks');
  const eyebrow = t(`${prefix}.eyebrow`);
  const support = isAlt ? null : t('landing.hero.support');
  const chipLabel = !isAlt && featuredProperty
    ? featuredProperty.title
    : t(`${prefix}.chipLabel`);

  return (
    <section className="relative overflow-hidden bg-warm-gray">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center py-10 lg:py-14 lg:min-h-[min(100svh,46rem)]">
          {/* Mobile photo band */}
          <div className="lg:hidden relative -mx-6 md:-mx-8 aspect-[5/4] overflow-hidden">
            <img
              src={primarySrc}
              srcSet={primarySrcSet}
              sizes="100vw"
              alt={primaryAlt}
              width={1600}
              height={1280}
              className="absolute inset-0 h-full w-full object-cover"
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-linear-to-t from-warm-gray via-warm-gray/40 to-transparent" aria-hidden />
          </div>

          {/* Copy column */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center animate-[fadeInUp_700ms_ease-out_both] -mt-16 lg:mt-0 relative z-10">
            <p className="m-0 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-navy/70">
              <span className="inline-block h-px w-8 bg-gold" aria-hidden />
              {eyebrow}
            </p>
            <h1 className="m-0 mt-4 text-navy font-extrabold text-[clamp(2.1rem,4.2vw,3.75rem)] leading-[1.08] tracking-tight max-w-[14ch]">
              {title}
            </h1>
            <p className="mt-4 m-0 text-charcoal/85 text-[clamp(1rem,1.6vw,1.2rem)] leading-relaxed max-w-[36ch]">
              {description}
            </p>
            {support ? (
              <p className="mt-2 m-0 text-navy/70 text-sm font-medium">{support}</p>
            ) : null}

            {isSearchPageEnabled ? (isAlt ? <AltHeroSearch /> : <MainHeroSearch />) : null}

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              {isSearchPageEnabled ? (
                <Link to="/search">
                  <Button variant="primary" size="lg">
                    {primaryCta}
                  </Button>
                </Link>
              ) : (
                <Link to="/reservation-lookup">
                  <Button variant="primary" size="lg">
                    {secondaryCta}
                  </Button>
                </Link>
              )}

              {isSearchPageEnabled ? (
                <Link
                  to="/reservation-lookup"
                  className="text-sm font-semibold text-navy underline underline-offset-4 decoration-navy/30 hover:decoration-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 rounded-sm"
                >
                  {secondaryCta}
                </Link>
              ) : null}

              <a
                href="#how-it-works"
                className="text-sm font-semibold text-navy/70 hover:text-navy underline underline-offset-4 decoration-navy/20 hover:decoration-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 rounded-sm"
              >
                {howItWorksLabel}
              </a>
            </div>

            {!isAlt && (
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 list-none p-0 m-0">
                {(['verified', 'payments', 'bookings'] as const).map((key) => (
                  <li key={key} className="text-sm font-medium text-navy/80 before:content-['✓'] before:text-gold before:mr-2 before:font-bold">
                    {t(`landing.hero.trust.${key}`)}
                  </li>
                ))}
              </ul>
            )}

            {isAlt && (
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 list-none p-0 m-0">
                {(['badgeCurated', 'badgeCapacity', 'badgeHoldDemo'] as const).map((key) => (
                  <li key={key} className="text-sm font-medium text-navy/80 before:content-['✓'] before:text-gold before:mr-2 before:font-bold">
                    {t(`alt.landing.hero.${key}`)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Desktop collage */}
          <div className="hidden lg:block lg:col-span-6 xl:col-span-7 relative h-[min(32rem,62vh)]">
            <div className="absolute -right-8 xl:-right-16 top-0 bottom-6 w-[72%] overflow-hidden rounded-bl-[2.5rem]">
              <img
                src={primarySrc}
                srcSet={primarySrcSet}
                sizes="(min-width: 1280px) 560px, 45vw"
                alt={primaryAlt}
                width={1600}
                height={2000}
                className="h-full w-full object-cover object-[center_40%]"
                fetchPriority="high"
              />
            </div>
            <div className="absolute left-0 bottom-0 w-[42%] aspect-[3/4] overflow-hidden rounded-tr-[1.75rem] shadow-[0_20px_50px_-20px_rgba(10,26,47,0.45)] border-4 border-warm-gray">
              <img
                src={images.secondary.src}
                srcSet={images.secondary.srcSet}
                sizes="220px"
                alt={images.secondary.alt}
                width={800}
                height={1067}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            {chipLabel ? (
              featuredProperty && !isAlt ? (
                <Link
                  to={`/property/${featuredProperty.id}`}
                  className="absolute left-[38%] bottom-10 z-10 max-w-[14rem] rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-navy shadow-lg border border-navy/10 hover:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  {chipLabel}
                </Link>
              ) : (
                <span className="absolute left-[38%] bottom-10 z-10 max-w-[14rem] rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-navy shadow-lg border border-navy/10">
                  {chipLabel}
                </span>
              )
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
