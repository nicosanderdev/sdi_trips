import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/layout';
import { Card } from '../../components/ui';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Terms: React.FC = () => {
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
      id: 'acceptance',
      title: t('terms.sections.acceptance.title'),
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>{t('terms.sections.acceptance.paragraph1')}</p>
          <p>{t('terms.sections.acceptance.paragraph2')}</p>
        </div>
      ),
    },
    {
      id: 'use-license',
      title: t('terms.sections.useLicense.title'),
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>{t('terms.sections.useLicense.paragraph1')}</p>
          <p>{t('terms.sections.useLicense.paragraph2')}</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>{t('terms.sections.useLicense.item1')}</li>
            <li>{t('terms.sections.useLicense.item2')}</li>
            <li>{t('terms.sections.useLicense.item3')}</li>
            <li>{t('terms.sections.useLicense.item4')}</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'user-account',
      title: t('terms.sections.userAccount.title'),
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>{t('terms.sections.userAccount.paragraph1')}</p>
          <p>{t('terms.sections.userAccount.paragraph2')}</p>
        </div>
      ),
    },
    {
      id: 'bookings',
      title: t('terms.sections.bookings.title'),
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>{t('terms.sections.bookings.paragraph1')}</p>
          <p>{t('terms.sections.bookings.paragraph2')}</p>
          <p>{t('terms.sections.bookings.paragraph3')}</p>
        </div>
      ),
    },
    {
      id: 'property-standards',
      title: t('terms.sections.propertyStandards.title'),
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>{t('terms.sections.propertyStandards.paragraph1')}</p>
          <p>{t('terms.sections.propertyStandards.paragraph2')}</p>
        </div>
      ),
    },
    {
      id: 'liability',
      title: t('terms.sections.liability.title'),
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>{t('terms.sections.liability.paragraph1')}</p>
          <p>{t('terms.sections.liability.paragraph2')}</p>
        </div>
      ),
    },
    {
      id: 'privacy',
      title: t('terms.sections.privacy.title'),
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>{t('terms.sections.privacy.paragraph1')}</p>
          <p>{t('terms.sections.privacy.paragraph2')}</p>
        </div>
      ),
    },
    {
      id: 'termination',
      title: t('terms.sections.termination.title'),
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>{t('terms.sections.termination.paragraph1')}</p>
          <p>{t('terms.sections.termination.paragraph2')}</p>
        </div>
      ),
    },
    {
      id: 'changes',
      title: t('terms.sections.changes.title'),
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>{t('terms.sections.changes.paragraph1')}</p>
          <p>{t('terms.sections.changes.paragraph2')}</p>
        </div>
      ),
    },
    {
      id: 'contact',
      title: t('terms.sections.contact.title'),
      content: (
        <div className="space-y-4 text-charcoal leading-relaxed">
          <p>{t('terms.sections.contact.intro')}</p>
          <div className="bg-warm-gray-light p-4 rounded-xl">
            <p>
              <strong>{t('terms.sections.contact.emailLabel')}:</strong> legal@holidaytrips.com
            </p>
            <p>
              <strong>{t('terms.sections.contact.phoneLabel')}:</strong> +1 (555) 123-4567
            </p>
            <p>
              <strong>{t('terms.sections.contact.addressLabel')}:</strong> 123 Luxury Lane, San Francisco, CA 94105
            </p>
          </div>
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
            {t('terms.hero.title')}{' '}
            <span className="font-bold text-gold">{t('terms.hero.titleHighlight')}</span>
          </h1>
          <p className="text-xl text-charcoal leading-relaxed">
            {t('terms.hero.description1')}{' '}
            {t('terms.hero.description2')}
          </p>
          <p className="text-sm text-charcoal mt-4">
            {t('terms.hero.lastUpdated')}{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </section>

      {/* Terms Content */}
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
              {t('terms.footer.questionsTitle')}
            </h3>
            <p className="text-charcoal mb-4">
              {t('terms.footer.questionsBody')}
            </p>
            <a
              href="mailto:legal@holidaytrips.com"
              className="inline-flex items-center px-6 py-3 bg-gold text-navy font-semibold rounded-full hover:bg-navy hover:text-gold transition-all duration-200"
            >
              {t('terms.footer.contactButton')}
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Terms;
