import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/layout';
import { Card } from '../../components/ui';
import { Award, Heart, Globe, Shield } from 'lucide-react';

type AboutVariant = 'main' | 'alt';

type AboutProps = {
  variant?: AboutVariant;
};

export function AboutContent({ variant = 'main' }: AboutProps) {
  const { t } = useTranslation();
  const prefix = variant === 'alt' ? 'alt.about' : 'about';

  const teamMembers = [
    {
      name: t('about.team.members.anna.name'),
      role: t('about.team.members.anna.role'),
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
      bio: t('about.team.members.anna.bio'),
    },
    {
      name: t('about.team.members.marcus.name'),
      role: t('about.team.members.marcus.role'),
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      bio: t('about.team.members.marcus.bio'),
    },
    {
      name: t('about.team.members.elena.name'),
      role: t('about.team.members.elena.role'),
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
      bio: t('about.team.members.elena.bio'),
    },
  ];

  const values = [
    {
      icon: Heart,
      title: t('about.values.passion.title'),
      description: t('about.values.passion.description'),
    },
    {
      icon: Award,
      title: t('about.values.excellence.title'),
      description: t('about.values.excellence.description'),
    },
    {
      icon: Globe,
      title: t('about.values.global.title'),
      description: t('about.values.global.description'),
    },
    {
      icon: Shield,
      title: t('about.values.trust.title'),
      description: t('about.values.trust.description'),
    },
  ];

  const stats = [
    { number: '800+', label: t('about.stats.curatedProperties') },
    { number: '50+', label: t('about.stats.countries') },
    { number: '10,000+', label: t('about.stats.happyGuests') },
    { number: '4.9/5', label: t('about.stats.averageRating') },
  ];

  const browseLabel = variant === 'alt' ? t('alt.landing.popular.cta') : t('about.cta.browseProperties');

  return (
    <>
      <section className="relative py-32 bg-gradient-to-br from-warm-gray-light to-white">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gold rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-navy rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-thin text-navy mb-6">
            {t(`${prefix}.hero.title`)}{' '}
            <span className="font-bold text-gold">{t(`${prefix}.hero.titleHighlight`)}</span>
          </h1>
          <p className="text-xl text-charcoal leading-relaxed max-w-3xl mx-auto">
            {t(`${prefix}.hero.description`)}
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-thin text-navy mb-6">
                {t(`${prefix}.story.title`)}{' '}
                <span className="font-bold text-gold">{t(`${prefix}.story.titleHighlight`)}</span>
              </h2>
              <div className="space-y-6 text-charcoal leading-relaxed">
                <p>{t(`${prefix}.story.paragraph1`)}</p>
                <p>{t(`${prefix}.story.paragraph2`)}</p>
                <p>{t(`${prefix}.story.paragraph3`)}</p>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt={t('about.story.imageAlt')}
                className="rounded-3xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {variant === 'main' && (
        <>
          <section className="py-24 bg-navy text-white">
            <div className="max-w-7xl mx-auto px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-gold mb-2">{stat.number}</div>
                    <div className="text-lg text-warm-gray-light font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-24 bg-warm-gray-light">
            <div className="max-w-7xl mx-auto px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-thin text-navy mb-4">
                  {t('about.values.title')}{' '}
                  <span className="font-bold text-gold">{t('about.values.titleHighlight')}</span>
                </h2>
                <p className="text-xl text-charcoal max-w-2xl mx-auto">{t('about.values.subtitle')}</p>
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

          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-thin text-navy mb-4">
                  {t('about.team.title')}{' '}
                  <span className="font-bold text-gold">{t('about.team.titleHighlight')}</span>
                </h2>
                <p className="text-xl text-charcoal max-w-2xl mx-auto">{t('about.team.subtitle')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {teamMembers.map((member, index) => (
                  <Card key={index} variant="elevated" className="text-center p-8">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-32 h-32 rounded-full mx-auto mb-6 object-cover shadow-lg"
                    />
                    <h3 className="text-xl font-semibold text-navy mb-2">{member.name}</h3>
                    <p className="text-gold font-medium mb-4">{member.role}</p>
                    <p className="text-charcoal leading-relaxed">{member.bio}</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <section className="py-24 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-thin mb-6">
            {t('about.cta.title')}{' '}
            <span className="font-bold text-gold">{t('about.cta.titleHighlight')}</span>
          </h2>
          <p className="text-xl text-warm-gray-light mb-8 leading-relaxed">{t('about.cta.description')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/search"
              className="inline-flex items-center justify-center px-8 py-4 bg-gold text-navy font-semibold rounded-full hover:bg-white hover:text-navy transition-all duration-200"
            >
              {browseLabel}
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
