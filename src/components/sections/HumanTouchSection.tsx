import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';

type HumanTouchVariant = 'main' | 'alt';

interface HumanTouchSectionProps {
  variant?: HumanTouchVariant;
}

const HumanTouchSection: React.FC<HumanTouchSectionProps> = ({ variant = 'main' }) => {
  const { t } = useTranslation();
  const prefix = variant === 'alt' ? 'alt.landing.humanTouch' : 'landing.humanTouch';
  const revealRef = useRevealOnScroll<HTMLElement>();
  const imageSrc = variant === 'alt' ? '/alt-contact.jpg' : '/landing/interior-1600.jpg';
  const imageSrcSet =
    variant === 'alt'
      ? undefined
      : '/landing/interior-800.jpg 800w, /landing/interior-1600.jpg 1600w';
  const imageAlt =
    variant === 'alt'
      ? 'Espacio de encuentro con luz natural'
      : 'Interior cálido de una casa de vacaciones';

  return (
    <section ref={revealRef} className="landing-reveal py-20 md:py-28 bg-warm-gray">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-tr-[2rem]">
              <img
                src={imageSrc}
                srcSet={imageSrcSet}
                sizes="(min-width: 1024px) 400px, 100vw"
                alt={imageAlt}
                width={1600}
                height={2000}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div className="lg:col-span-7 max-w-xl">
            <p className="m-0 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-navy/70">
              <span className="inline-block h-px w-8 bg-gold" aria-hidden />
              En cartelera
            </p>
            <h2 className="m-0 mt-4 text-2xl md:text-4xl font-extrabold text-navy leading-snug tracking-tight">
              {t(`${prefix}.title`)}
            </h2>
            <div className="mt-6 space-y-4 text-charcoal/85 text-base leading-relaxed">
              <p className="m-0">{t(`${prefix}.paragraph1`)}</p>
              <p className="m-0">{t(`${prefix}.paragraph2`)}</p>
              <p className="m-0">{t(`${prefix}.paragraph3`)}</p>
            </div>
            <div className="mt-8">
              <Link to="/about">
                <Button variant="primary" size="lg">
                  {t(`${prefix}.learnMore`)}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HumanTouchSection;
