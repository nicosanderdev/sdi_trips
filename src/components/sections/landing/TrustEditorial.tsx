import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, MapPin, Sparkles } from 'lucide-react';
import { useRevealOnScroll } from '../../../hooks/useRevealOnScroll';

const supportingIcons = [Heart, MapPin, Sparkles] as const;

const TrustEditorial: React.FC = () => {
  const { t } = useTranslation();
  const revealRef = useRevealOnScroll<HTMLElement>();

  return (
    <section ref={revealRef} className="landing-reveal py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="relative aspect-[4/5] overflow-hidden rounded-bl-[2rem]">
              <img
                src="/landing/trust-patio-1600.jpg"
                srcSet="/landing/trust-patio-800.jpg 800w, /landing/trust-patio-1600.jpg 1600w"
                sizes="(min-width: 1024px) 420px, 100vw"
                alt="Patio soleado de una casa de vacaciones"
                width={1600}
                height={2000}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="m-0 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-navy/70">
              <span className="inline-block h-px w-8 bg-gold" aria-hidden />
              {t('landing.platform.eyebrow', { defaultValue: 'Confianza local' })}
            </p>
            <h2 className="m-0 mt-3 text-3xl md:text-4xl font-extrabold text-navy tracking-tight">
              {t('landing.platform.title')}
            </h2>

            <article className="mt-10 pb-8 border-b border-navy/10">
              <h3 className="m-0 text-2xl md:text-[1.75rem] font-bold text-navy leading-snug max-w-[20ch]">
                {t('landing.platform.cards.1.title')}
              </h3>
              <p className="m-0 mt-3 text-base md:text-lg text-charcoal/85 leading-relaxed max-w-[40ch]">
                {t('landing.platform.cards.1.description')}
              </p>
            </article>

            <ul className="m-0 mt-2 p-0 list-none divide-y divide-navy/10">
              {[2, 3, 4].map((card, index) => {
                const Icon = supportingIcons[index];
                return (
                  <li key={card} className="flex gap-4 py-6">
                    <div className="shrink-0 mt-0.5 text-gold" aria-hidden>
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <h3 className="m-0 text-lg font-semibold text-navy">
                        {t(`landing.platform.cards.${card}.title`)}
                      </h3>
                      <p className="m-0 mt-1.5 text-sm md:text-base text-charcoal/80 leading-relaxed max-w-[42ch]">
                        {t(`landing.platform.cards.${card}.description`)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustEditorial;
