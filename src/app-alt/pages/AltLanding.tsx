import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui';
import { Heart, Briefcase, PartyPopper } from 'lucide-react';
import { listLocalizedVenues } from '../data/venueLocale';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1519167758481-83f29da3a0a6?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1520854221050-0f4caff449f5?auto=format&fit=crop&w=1400&q=80',
];

const SLIDE_COUNT = HERO_IMAGES.length;

export default function AltLanding() {
  const { t } = useTranslation();
  const [slideIndex, setSlideIndex] = useState(0);
  const [fade, setFade] = useState(false);
  const venues = listLocalizedVenues(t);

  const featureCards = [
    { icon: Heart, titleKey: 'alt.landing.features.weddings.title', descKey: 'alt.landing.features.weddings.description' },
    { icon: Briefcase, titleKey: 'alt.landing.features.corporate.title', descKey: 'alt.landing.features.corporate.description' },
    { icon: PartyPopper, titleKey: 'alt.landing.features.parties.title', descKey: 'alt.landing.features.parties.description' },
  ] as const;

  const howSteps = [
    { titleKey: 'alt.landing.howItWorks.step1Title', descKey: 'alt.landing.howItWorks.step1Desc' },
    { titleKey: 'alt.landing.howItWorks.step2Title', descKey: 'alt.landing.howItWorks.step2Desc' },
    { titleKey: 'alt.landing.howItWorks.step3Title', descKey: 'alt.landing.howItWorks.step3Desc' },
    { titleKey: 'alt.landing.howItWorks.step4Title', descKey: 'alt.landing.howItWorks.step4Desc' },
  ] as const;

  useEffect(() => {
    const id = window.setInterval(() => {
      setFade(true);
      window.setTimeout(() => {
        setSlideIndex((i) => (i + 1) % SLIDE_COUNT);
        setFade(false);
      }, 400);
    }, 8000);
    return () => window.clearInterval(id);
  }, []);

  const heroImage = HERO_IMAGES[slideIndex];
  const heroQuote = t(`alt.landing.hero.slides.${slideIndex}.quote`);

  return (
    <>
      <section className="relative min-h-screen overflow-hidden bg-navy isolate">
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${fade ? 'opacity-70' : 'opacity-100'}`}
          style={{ backgroundImage: `url("${heroImage}")` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(105deg,rgba(43,43,43,0.88)_0%,rgba(43,43,43,0.72)_45%,rgba(43,43,43,0.5)_100%)]"
          aria-hidden
        />

        <div className="relative z-10 max-w-7xl mx-auto px-8 py-16 min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="m-0 text-white font-bold text-[clamp(2rem,4vw,3.5rem)] leading-[1.1] max-w-[16ch]">
              {t('alt.landing.hero.title')}
            </h1>
            <p className="mt-4 text-white/95 text-[clamp(1rem,1.8vw,1.25rem)] max-w-[36ch]">{t('alt.landing.hero.subtitle')}</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-center w-full max-w-[640px] p-3 rounded-2xl border border-gold/35 bg-white/95 backdrop-blur-sm">
              <input
                className="w-full border border-navy/15 rounded-xl bg-white text-navy text-sm px-3 py-3 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold"
                type="text"
                name="q"
                placeholder={t('alt.landing.hero.searchPlaceholder')}
                aria-label={t('alt.landing.hero.searchAria')}
              />
              <Link to="/search" className="md:justify-self-end w-full md:w-auto">
                <Button type="button" variant="primary" size="md" className="w-full md:w-auto justify-center">
                  {t('alt.landing.hero.searchCta')}
                </Button>
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-4">
              <p className="m-0 text-sm font-semibold text-white/90 before:content-['✓'] before:text-gold before:mr-2">
                {t('alt.landing.hero.badgeCurated')}
              </p>
              <p className="m-0 text-sm font-semibold text-white/90 before:content-['✓'] before:text-gold before:mr-2">
                {t('alt.landing.hero.badgeCapacity')}
              </p>
              <p className="m-0 text-sm font-semibold text-white/90 before:content-['✓'] before:text-gold before:mr-2">
                {t('alt.landing.hero.badgeHoldDemo')}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/search">
                <Button variant="primary" size="lg">
                  {t('alt.landing.hero.exploreCta')}
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-navy hover:border-gold hover:text-gold"
                >
                  {t('alt.landing.hero.talkCta')}
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative min-h-[400px] rounded-3xl overflow-hidden border border-gold/25 shadow-2xl bg-white/10 backdrop-blur-sm">
            <div
              className={`absolute inset-0 p-8 flex flex-col justify-end bg-cover bg-center transition-opacity duration-500 ${fade ? 'opacity-80' : 'opacity-100'}`}
              style={{ backgroundImage: `url("${heroImage}")` }}
            >
              <div className="absolute inset-0 bg-linear-to-t from-navy/90 to-navy/20" />
              <h3 className="relative z-10 m-0 text-lg font-bold text-white">{t('alt.landing.hero.storiesHeading')}</h3>
              <p className="relative z-10 mt-2 text-white/90 text-sm leading-relaxed">{heroQuote}</p>
            </div>
            <div className="absolute left-1/2 bottom-4 -translate-x-1/2 z-20 flex gap-2">
              {HERO_IMAGES.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSlideIndex(index)}
                  className={`h-2 w-2 rounded-full transition-all ${index === slideIndex ? 'bg-gold scale-125' : 'bg-white/50'}`}
                  aria-label={t('alt.landing.hero.storyDotAria', { n: index + 1 })}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <p className="m-0 text-sm uppercase tracking-[0.08em] font-bold text-navy/70">{t('alt.landing.occasions.eyebrow')}</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-navy">{t('alt.landing.occasions.heading')}</h2>
            <p className="mt-3 text-charcoal/80 max-w-2xl mx-auto">{t('alt.landing.occasions.sub')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featureCards.map(({ icon: Icon, titleKey, descKey }) => (
              <article
                key={titleKey}
                className="rounded-2xl border border-navy/10 bg-warm-gray p-6 hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-full grid place-items-center bg-white text-venue-accent border border-navy/10">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-navy">{t(titleKey)}</h3>
                <p className="m-0 mt-2 text-sm text-charcoal/85 leading-relaxed">{t(descKey)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-warm-gray">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-10">
            <p className="m-0 text-sm uppercase tracking-[0.08em] font-bold text-navy/70">{t('alt.landing.popular.eyebrow')}</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-navy">{t('alt.landing.popular.heading')}</h2>
            <p className="mt-3 text-charcoal/80 max-w-3xl mx-auto">{t('alt.landing.popular.sub')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {venues.slice(0, 6).map((venue, index) => {
              const image = venue.images[0];
              return (
                <article key={venue.id} className="relative min-h-[220px] border border-navy/15 rounded-2xl overflow-hidden bg-navy group">
                  <Link to={`/venue/${venue.id}`} className="absolute inset-0 z-10" aria-label={venue.name} />
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundImage: `url("${image}")` }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-navy/90 to-navy/35" />
                  <div className="absolute left-4 right-4 bottom-4 z-20 flex items-end justify-between gap-3">
                    <div>
                      <h3 className="m-0 text-white text-lg font-semibold">{venue.name}</h3>
                      <p className="m-0 mt-1 text-white/85 text-sm">{venue.location}</p>
                      <p className="m-0 mt-1 text-white/75 text-xs">
                        {t('alt.landing.popular.guestsLine', { count: venue.capacity, priceHint: venue.priceHint })}
                      </p>
                    </div>
                    {index === 0 && (
                      <span className="rounded-full px-3 py-1 text-xs font-bold bg-gold text-navy whitespace-nowrap">
                        {t('alt.landing.popular.popularBadge')}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="text-center">
            <Link to="/search">
              <Button variant="outline" size="lg">
                {t('alt.landing.popular.cta')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-navy">{t('alt.landing.howItWorks.heading')}</h2>
            <p className="mt-3 text-charcoal/80 max-w-2xl mx-auto">{t('alt.landing.howItWorks.sub')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {howSteps.map((step, i) => (
              <article key={step.titleKey} className="rounded-2xl border border-navy/10 bg-warm-gray p-5">
                <div className="w-10 h-10 rounded-full grid place-items-center bg-white text-navy border border-navy/15 font-bold">
                  {i + 1}
                </div>
                <h3 className="mt-4 mb-2 text-lg font-semibold text-navy">{t(step.titleKey)}</h3>
                <p className="m-0 text-sm text-charcoal/85">{t(step.descKey)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-thin mb-4">
            {t('alt.landing.ctaBand.titleBefore')}
            <span className="font-bold text-gold">{t('alt.landing.ctaBand.titleHighlight')}</span>
            {t('alt.landing.ctaBand.titleAfter')}
          </h2>
          <p className="text-lg text-white/85 mb-8 leading-relaxed">{t('alt.landing.ctaBand.sub')}</p>
          <Link to="/search">
            <Button variant="primary" size="lg">
              {t('alt.landing.ctaBand.button')}
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
