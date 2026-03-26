import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { enUS, es as esLocale, ptBR } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { Card } from '../../components/ui';
import { ChevronDown, ChevronUp } from 'lucide-react';

type TermSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  contactEmailLabel?: string;
  contactMailLabel?: string;
  contactEmail?: string;
  contactAddress?: string;
};

function formatLocale(i18nLang: string): Locale {
  if (i18nLang.startsWith('pt')) return ptBR;
  if (i18nLang.startsWith('es')) return esLocale;
  return enUS;
}

export default function AltTermsAndConditions() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState<Set<string>>(new Set(['acceptance']));

  const raw = t('alt.terms.sections', { returnObjects: true }) as unknown;
  const sections: TermSection[] = Array.isArray(raw) ? (raw as TermSection[]) : [];

  const lastUpdated = format(new Date(), 'PPP', { locale: formatLocale(i18n.language) });

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <section className="py-20 bg-warm-gray-light">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-thin text-navy mb-6">
            {t('alt.terms.heroTitleBefore')}
            <span className="font-bold text-gold">{t('alt.terms.heroTitleHighlight')}</span>
          </h1>
          <p className="text-xl text-charcoal leading-relaxed">{t('alt.terms.heroSub')}</p>
          <p className="text-sm text-charcoal mt-4">
            {t('alt.terms.lastUpdated')} {lastUpdated}
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-8">
          <div className="space-y-4">
            {sections.map((section) => (
              <Card key={section.id} variant="default" className="overflow-hidden p-0">
                <button
                  type="button"
                  onClick={() => toggle(section.id)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-warm-gray-light transition-colors"
                >
                  <h2 className="text-xl font-semibold text-navy m-0">{section.title}</h2>
                  {open.has(section.id) ? (
                    <ChevronUp className="h-5 w-5 text-gold shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gold shrink-0" />
                  )}
                </button>
                {open.has(section.id) && (
                  <div className="px-8 pb-6">
                    <div className="space-y-4 text-charcoal leading-relaxed">
                      {section.paragraphs.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                      {section.bullets && section.bullets.length > 0 && (
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          {section.bullets.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      )}
                      {section.id === 'contact' && section.contactEmail && (
                        <div className="bg-warm-gray-light p-4 rounded-xl space-y-2 text-sm">
                          <p className="m-0">
                            <strong>{section.contactEmailLabel}:</strong> {section.contactEmail}
                          </p>
                          <p className="m-0">
                            <strong>{section.contactMailLabel}:</strong> {section.contactAddress}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div className="mt-12 p-6 bg-warm-gray-light rounded-2xl">
            <h3 className="text-lg font-semibold text-navy mb-3">{t('alt.terms.footerTitle')}</h3>
            <p className="text-charcoal mb-4 m-0">{t('alt.terms.footerBody')}</p>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-gold text-navy font-semibold rounded-full hover:bg-navy hover:text-gold transition-all duration-200"
            >
              {t('alt.terms.footerCta')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
