import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Input, Textarea } from '../../components/ui';
import { Mail, MessageSquare, Building2, Handshake } from 'lucide-react';

export default function AltContact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const reasons = [
    { icon: MessageSquare, titleKey: 'alt.contact.reasonPlanningTitle', descKey: 'alt.contact.reasonPlanningDesc' },
    { icon: Building2, titleKey: 'alt.contact.reasonVenueTitle', descKey: 'alt.contact.reasonVenueDesc' },
    { icon: Handshake, titleKey: 'alt.contact.reasonSponsorTitle', descKey: 'alt.contact.reasonSponsorDesc' },
  ] as const;

  return (
    <>
      <section className="relative py-32 bg-linear-to-br from-warm-gray-light to-white">
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gold rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-venue-accent rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-thin text-navy mb-6">
            {t('alt.contact.heroTitleBefore')}
            <span className="font-bold text-gold">{t('alt.contact.heroTitleHighlight')}</span>
          </h1>
          <p className="text-xl text-charcoal leading-relaxed max-w-2xl mx-auto">{t('alt.contact.heroSub')}</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="mb-8">
                <h2 className="text-4xl md:text-5xl font-thin text-navy mb-6">{t('alt.contact.whyHeading')}</h2>
                <div className="w-20 h-1 bg-gold mb-8" />
              </div>
              <div className="space-y-8">
                {reasons.map((reason) => (
                  <div key={reason.titleKey} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center shrink-0">
                      <reason.icon className="h-6 w-6 text-navy" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-navy mb-2">{t(reason.titleKey)}</h3>
                      <p className="text-charcoal leading-relaxed m-0">{t(reason.descKey)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12 p-6 bg-warm-gray-light rounded-2xl">
                <div className="flex items-center space-x-3 mb-3">
                  <Mail className="h-6 w-6 text-gold" />
                  <h3 className="text-lg font-semibold text-navy m-0">{t('alt.contact.directLineHeading')}</h3>
                </div>
                <p className="text-charcoal leading-relaxed m-0">{t('alt.contact.directLineBody')}</p>
              </div>
            </div>

            <Card variant="elevated" className="p-8">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-venue-accent/15">
                    <MessageSquare className="w-8 h-8 text-venue-accent" />
                  </div>
                  <h3 className="text-2xl font-semibold text-navy mb-4">{t('alt.contact.successTitle')}</h3>
                  <p className="text-charcoal m-0">{t('alt.contact.successBody')}</p>
                </div>
              ) : (
                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                >
                  <Input
                    label={t('contact.form.name')}
                    placeholder={t('contact.form.namePlaceholder')}
                    value={formData.name}
                    onChange={(value: string) => setFormData((p) => ({ ...p, name: value }))}
                    required
                  />
                  <Input
                    type="email"
                    label={t('contact.form.email')}
                    placeholder={t('contact.form.emailPlaceholder')}
                    value={formData.email}
                    onChange={(value) => setFormData((p) => ({ ...p, email: value }))}
                    required
                  />
                  <Textarea
                    label={t('contact.form.message')}
                    placeholder={t('alt.contact.messagePlaceholder')}
                    value={formData.message}
                    onChange={(value: string) => setFormData((p) => ({ ...p, message: value }))}
                    rows={6}
                    required
                  />
                  <Button type="submit" variant="primary" size="lg" className="w-full">
                    {t('alt.contact.submitDemo')}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-thin mb-6">{t('alt.contact.listVenueHeading')}</h2>
          <p className="text-xl text-warm-gray-light mb-8 leading-relaxed">{t('alt.contact.listVenueSub')}</p>
          <span className="inline-flex items-center justify-center px-8 py-4 bg-gold text-navy font-semibold rounded-full">
            {t('alt.contact.partnerDemo')}
          </span>
        </div>
      </section>
    </>
  );
}
