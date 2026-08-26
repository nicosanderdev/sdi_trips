import { useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/config';

type ComingSoonVariant = 'main' | 'alt';

type ComingSoonProps = {
  variant?: ComingSoonVariant;
};

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
] as const;

/**
 * Temporary public entry point while the guest sites are not ready for launch.
 * Branding (logo, theme class) follows the active site variant; flip
 * `featureFlags.comingSoon` in appConfig to restore the normal routes.
 */
export default function ComingSoon({ variant = 'main' }: ComingSoonProps) {
  const { t, i18n: i18nInstance } = useTranslation();
  const isAlt = variant === 'alt';

  const logoSrc = isAlt ? '/logo-en-cartelera-alt.png' : '/logo-en-cartelera.png';
  const logoAlt = isAlt
    ? 'Event venues: En cartelera - Espacios'
    : 'Summer rentals: En cartelera - Escapadas';

  useEffect(() => {
    document.title = t('comingSoon.documentTitle');
  }, [t, i18nInstance.language]);

  return (
    <div className={isAlt ? 'alt-site' : undefined}>
      <div className="relative min-h-screen flex flex-col bg-linear-to-b from-warm-gray to-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40" aria-hidden>
          <div className="absolute top-16 right-8 md:right-24 w-72 h-72 md:w-96 md:h-96 bg-gold rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-4 md:left-20 w-64 h-64 md:w-80 md:h-80 bg-navy rounded-full blur-3xl opacity-30" />
        </div>

        <header className="relative z-10 flex justify-end px-6 pt-6 md:px-10 md:pt-8">
          <div className="flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-md border border-gold/20 shadow-gold px-3 py-2">
            <Globe className="h-4 w-4 text-navy shrink-0" aria-hidden />
            <label htmlFor="coming-soon-language" className="sr-only">
              {t('comingSoon.languageLabel')}
            </label>
            <select
              id="coming-soon-language"
              value={i18nInstance.language}
              onChange={(e) => {
                void i18n.changeLanguage(e.target.value);
              }}
              className="bg-transparent text-sm text-navy font-medium focus:outline-none cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </header>

        <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-16 md:py-24">
          <div className="max-w-xl w-full text-center">
            <img
              src={logoSrc}
              alt={logoAlt}
              className="mx-auto h-16 md:h-20 w-auto mb-10 md:mb-12"
            />

            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold mb-4">
              {t('comingSoon.eyebrow')}
            </p>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-thin text-navy mb-6 leading-tight">
              {t('comingSoon.titleBefore')}
              <span className="font-bold text-gold">{t('comingSoon.titleHighlight')}</span>
            </h1>

            <p className="text-lg md:text-xl text-charcoal/90 leading-relaxed mb-4">
              {t('comingSoon.message')}
            </p>
            <p className="text-base text-charcoal/70 leading-relaxed">{t('comingSoon.supporting')}</p>
          </div>
        </main>
      </div>
    </div>
  );
}
