import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout';
import { Button } from '../components/ui';

const NotFound: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <section className="py-20 min-h-[60vh] flex items-center justify-center bg-white">
        <div className="max-w-2xl mx-auto px-8 text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-navy mb-4">404</h1>
            <h2 className="text-4xl md:text-5xl font-thin text-navy mb-4">
              <span className="font-bold text-gold">{t('notFound.title')}</span>
            </h2>
            <p className="text-xl text-charcoal mb-8 leading-relaxed">
              {t('notFound.description')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="primary" size="lg">
                {t('notFound.backToHome')}
              </Button>
            </Link>
            <Link to="/search">
              <Button variant="outline" size="lg">
                {t('notFound.searchProperties')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
