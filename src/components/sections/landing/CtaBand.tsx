import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui';
import { useRevealOnScroll } from '../../../hooks/useRevealOnScroll';

const CtaBand: React.FC = () => {
  const { t } = useTranslation();
  const revealRef = useRevealOnScroll<HTMLElement>();

  return (
    <section ref={revealRef} className="landing-reveal relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/landing/venue-bg-1600.jpg"
          srcSet="/landing/venue-bg-800.jpg 800w, /landing/venue-bg-1600.jpg 1600w"
          sizes="100vw"
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(105deg,rgba(43,43,43,0.92)_0%,rgba(43,43,43,0.78)_55%,rgba(43,43,43,0.55)_100%)]"
          aria-hidden
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-28">
        <div className="max-w-xl rounded-none md:rounded-bl-[2rem] bg-navy/40 backdrop-blur-sm border border-white/10 p-8 md:p-10">
          <h2 className="m-0 text-3xl md:text-4xl font-thin text-white leading-snug">
            {t('alt.landing.ctaBand.titleBefore')}
            <span className="font-bold text-gold">{t('alt.landing.ctaBand.titleHighlight')}</span>
            {t('alt.landing.ctaBand.titleAfter')}
          </h2>
          <div className="mt-8">
            <Link to="/search">
              <Button variant="primary" size="lg">
                {t('alt.landing.ctaBand.button')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaBand;
