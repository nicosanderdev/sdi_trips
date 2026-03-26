import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui';
import { Home } from 'lucide-react';

export default function AltNotFound() {
  const { t } = useTranslation();

  return (
    <section className="min-h-[70vh] flex flex-col items-center justify-center px-8 py-24 bg-linear-to-b from-warm-gray to-white">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-venue-accent mb-4">{t('alt.notFound.code')}</p>
      <h1 className="text-4xl md:text-5xl font-thin text-navy text-center mb-4">
        {t('alt.notFound.titleBefore')}
        <span className="font-bold text-gold">{t('alt.notFound.titleHighlight')}</span>
      </h1>
      <p className="text-lg text-charcoal/90 text-center max-w-lg mb-10 leading-relaxed">{t('alt.notFound.body')}</p>
      <Link to="/">
        <Button variant="primary" size="lg" className="gap-2">
          <Home className="h-5 w-5" />
          {t('alt.notFound.cta')}
        </Button>
      </Link>
    </section>
  );
}
