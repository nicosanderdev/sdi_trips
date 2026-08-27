import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/layout';
import { Card } from '../../components/ui';
import { Eye, Heart, Lightbulb, Shield, Sparkles, Star, Users } from 'lucide-react';

type AboutVariant = 'main' | 'alt';

type AboutProps = {
  variant?: AboutVariant;
};

export function AboutContent({ variant = 'main' }: AboutProps) {
  const { t } = useTranslation();
  const prefix = variant === 'alt' ? 'alt.about' : 'about';

  const values = [
    {
      icon: Shield,
      title: t(`${prefix}.values.trust.title`),
      description: t(`${prefix}.values.trust.description`),
    },
    {
      icon: Sparkles,
      title: t(`${prefix}.values.simplicity.title`),
      description: t(`${prefix}.values.simplicity.description`),
    },
    {
      icon: Heart,
      title: t(`${prefix}.values.closeness.title`),
      description: t(`${prefix}.values.closeness.description`),
    },
    {
      icon: Star,
      title: t(`${prefix}.values.experience.title`),
      description: t(`${prefix}.values.experience.description`),
    },
    {
      icon: Eye,
      title: t(`${prefix}.values.transparency.title`),
      description: t(`${prefix}.values.transparency.description`),
    },
    {
      icon: Lightbulb,
      title: t(`${prefix}.values.innovation.title`),
      description: t(`${prefix}.values.innovation.description`),
    },
    {
      icon: Users,
      title: t(`${prefix}.values.community.title`),
      description: t(`${prefix}.values.community.description`),
    },
  ];

  return (
    <>
      <section className="relative py-32 bg-gradient-to-br from-warm-gray-light to-white">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gold rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-navy rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-thin text-navy">
            {t(`${prefix}.hero.title`)}{' '}
            <span className="font-bold text-gold">{t(`${prefix}.hero.titleHighlight`)}</span>
          </h1>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-thin text-navy mb-6">
                {t(`${prefix}.mission.title`)}{' '}
                <span className="font-bold text-gold">{t(`${prefix}.mission.titleHighlight`)}</span>
              </h2>
              <div className="space-y-6 text-charcoal leading-relaxed">
                <p>
                  <span className="font-semibold text-navy">{t(`${prefix}.mission.missionLabel`)}:</span>{' '}
                  {t(`${prefix}.mission.missionText`)}
                </p>
                <p>
                  <span className="font-semibold text-navy">{t(`${prefix}.mission.visionLabel`)}:</span>{' '}
                  {t(`${prefix}.mission.visionText`)}
                </p>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt={t(`${prefix}.mission.imageAlt`)}
                className="rounded-3xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-warm-gray-light">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-thin text-navy">
              {t(`${prefix}.values.title`)}{' '}
              <span className="font-bold text-gold">{t(`${prefix}.values.titleHighlight`)}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} variant="default" className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center flex-shrink-0">
                    <value.icon className="h-6 w-6 text-navy" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-navy mb-3">{value.title}</h3>
                    <p className="text-charcoal leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-thin mb-6">
            {t(`${prefix}.cta.title`)}{' '}
            <span className="font-bold text-gold">{t(`${prefix}.cta.titleHighlight`)}</span>
          </h2>
          <p className="text-xl text-warm-gray-light mb-8 leading-relaxed">{t(`${prefix}.cta.description`)}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/search"
              className="inline-flex items-center justify-center px-8 py-4 bg-gold text-navy font-semibold rounded-full hover:bg-white hover:text-navy transition-all duration-200"
            >
              {t(`${prefix}.cta.browseProperties`)}
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-navy transition-all duration-200"
            >
              {t('nav.contact')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

const About: React.FC<AboutProps> = ({ variant = 'main' }) => {
  const content = <AboutContent variant={variant} />;

  if (variant === 'alt') {
    return content;
  }

  return <Layout>{content}</Layout>;
};

export default About;
