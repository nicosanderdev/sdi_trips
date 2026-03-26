import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/layout';
import { Card } from '../../components/ui';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Privacy: React.FC = () => {
  const { t } = useTranslation();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  const sections = [
    {
      id: 'controller',
      title: t('privacy.sections.controller.title'),
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>{t('privacy.sections.controller.paragraph1')}</p>
        </div>
      ),
    },
    {
      id: 'data-collected',
      title: t('privacy.sections.dataCollected.title'),
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>{t('privacy.sections.dataCollected.intro')}</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>{t('privacy.sections.dataCollected.item1')}</li>
            <li>{t('privacy.sections.dataCollected.item2')}</li>
            <li>{t('privacy.sections.dataCollected.item3')}</li>
            <li>{t('privacy.sections.dataCollected.item4')}</li>
            <li>{t('privacy.sections.dataCollected.item5')}</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'purpose',
      title: t('privacy.sections.purpose.title'),
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>{t('privacy.sections.purpose.intro')}</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>{t('privacy.sections.purpose.item1')}</li>
            <li>{t('privacy.sections.purpose.item2')}</li>
            <li>{t('privacy.sections.purpose.item3')}</li>
            <li>{t('privacy.sections.purpose.item4')}</li>
            <li>{t('privacy.sections.purpose.item5')}</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'legal-basis',
      title: t('privacy.sections.legalBasis.title'),
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>{t('privacy.sections.legalBasis.intro')}</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>{t('privacy.sections.legalBasis.item1')}</li>
            <li>{t('privacy.sections.legalBasis.item2')}</li>
            <li>{t('privacy.sections.legalBasis.item3')}</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'international-transfers',
      title: t('privacy.sections.internationalTransfers.title'),
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>{t('privacy.sections.internationalTransfers.paragraph1')}</p>
        </div>
      ),
    },
    {
      id: 'user-rights',
      title: t('privacy.sections.userRights.title'),
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>{t('privacy.sections.userRights.paragraph1')}</p>
        </div>
      ),
    },
    {
      id: 'security',
      title: t('privacy.sections.security.title'),
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>{t('privacy.sections.security.paragraph1')}</p>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      {/* Header */}
      <section className="py-20 bg-warm-gray-light">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-thin text-navy mb-6">
            {t('privacy.hero.title')}{' '}
            <span className="font-bold text-gold">{t('privacy.hero.titleHighlight')}</span>
          </h1>
          <p className="text-xl text-charcoal leading-relaxed">
            {t('privacy.hero.description1')}{' '}
            {t('privacy.hero.description2')}
          </p>
          <p className="text-sm text-charcoal mt-4">
            {t('privacy.hero.lastUpdated')}{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-8">
          <div className="space-y-4">
            {sections.map((section) => (
              <Card key={section.id} variant="default" className="overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-warm-gray-light transition-colors"
                >
                  <h2 className="text-xl font-semibold text-navy">
                    {section.title}
                  </h2>
                  {openSections.has(section.id) ? (
                    <ChevronUp className="h-5 w-5 text-gold" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gold" />
                  )}
                </button>

                {openSections.has(section.id) && (
                  <div className="px-8 pb-6">
                    {section.content}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-12 p-6 bg-warm-gray-light rounded-2xl">
            <h3 className="text-lg font-semibold text-navy mb-3">
              {t('privacy.footer.questionsTitle')}
            </h3>
            <p className="text-charcoal mb-4">
              {t('privacy.footer.questionsBody')}
            </p>
            <a
              href="mailto:privacy@holidaytrips.com"
              className="inline-flex items-center px-6 py-3 bg-gold text-navy font-semibold rounded-full hover:bg-navy hover:text-gold transition-all duration-200"
            >
              {t('privacy.footer.contactButton')}
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Privacy;

