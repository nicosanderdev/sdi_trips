import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRevealOnScroll } from '../../../hooks/useRevealOnScroll';

const tiles = [
  {
    key: 'weddings',
    image: '/alt-carousel-1.jpg',
    alt: 'Salón decorado para una boda',
  },
  {
    key: 'corporate',
    image: '/alt-carousel-2.jpg',
    alt: 'Espacio preparado para un evento corporativo',
  },
  {
    key: 'parties',
    image: '/alt-carousel-3.jpg',
    alt: 'Celebración con mesas y luces',
  },
] as const;

function TileCard({
  tile,
  title,
  description,
  tall,
}: {
  tile: (typeof tiles)[number];
  title: string;
  description: string;
  tall?: boolean;
}) {
  return (
    <article
      className={`relative overflow-hidden group h-full min-h-[13rem] ${
        tall ? 'md:col-span-5 md:min-h-[28rem]' : ''
      }`}
    >
      <img
        src={tile.image}
        alt={tile.alt}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-linear-to-t from-navy/85 via-navy/25 to-transparent" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <h3 className={`m-0 font-bold text-white ${tall ? 'text-xl' : 'text-lg'}`}>{title}</h3>
        <p className="m-0 mt-1.5 text-sm text-white/90 leading-relaxed max-w-[36ch]">{description}</p>
      </div>
    </article>
  );
}

const OccasionsEditorial: React.FC = () => {
  const { t } = useTranslation();
  const revealRef = useRevealOnScroll<HTMLElement>();

  return (
    <section ref={revealRef} className="landing-reveal py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="max-w-2xl mb-10 md:mb-14">
          <p className="m-0 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-navy/70">
            <span className="inline-block h-px w-8 bg-gold" aria-hidden />
            {t('alt.landing.occasions.eyebrow')}
          </p>
          <h2 className="m-0 mt-3 text-3xl md:text-4xl font-extrabold text-navy tracking-tight">
            {t('alt.landing.occasions.heading')}
          </h2>
        </div>

        {/* Desktop mosaic */}
        <div className="hidden md:grid grid-cols-12 gap-4 min-h-[28rem]" aria-label={t('alt.landing.occasions.heading')}>
          <TileCard
            tile={tiles[0]}
            tall
            title={t(`alt.landing.features.${tiles[0].key}.title`)}
            description={t(`alt.landing.features.${tiles[0].key}.description`)}
          />
          <div className="col-span-7 grid grid-rows-2 gap-4">
            {tiles.slice(1).map((tile) => (
              <TileCard
                key={tile.key}
                tile={tile}
                title={t(`alt.landing.features.${tile.key}.title`)}
                description={t(`alt.landing.features.${tile.key}.description`)}
              />
            ))}
          </div>
        </div>

        {/* Mobile scroll-snap */}
        <div
          className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-6 px-6"
          aria-label={t('alt.landing.occasions.heading')}
        >
          {tiles.map((tile) => (
            <div key={tile.key} className="relative shrink-0 w-[78%] aspect-[4/5] snap-center">
              <TileCard
                tile={tile}
                title={t(`alt.landing.features.${tile.key}.title`)}
                description={t(`alt.landing.features.${tile.key}.description`)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OccasionsEditorial;
