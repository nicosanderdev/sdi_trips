import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isSearchPageEnabled } from '../../core/config/searchPageVisibility';
import { useTranslation } from 'react-i18next';
import { Button, Card, Input, Textarea } from '../../components/ui';
import { Mail, MessageSquare, Building2, HelpCircle } from 'lucide-react';
import {
  CONTACT_MESSAGE_MAX_LENGTH,
  ContactSendError,
  sendContactMessage,
} from '../../services/contactService';
import HeroTitleSection from '../../components/sections/HeroTitleSection';

export default function AltContact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reasons = [
    { icon: MessageSquare, titleKey: 'alt.contact.reasonPlanningTitle', descKey: 'alt.contact.reasonPlanningDesc' },
    { icon: Building2, titleKey: 'alt.contact.reasonPublishSpaceTitle', descKey: 'alt.contact.reasonPublishSpaceDesc' },
    { icon: HelpCircle, titleKey: 'alt.contact.reasonGeneralInquiriesTitle', descKey: 'alt.contact.reasonGeneralInquiriesDesc' },
  ] as const;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('contact.errors.nameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact.errors.emailRequired');
    } else if (!validateEmail(formData.email.trim())) {
      newErrors.email = t('contact.errors.emailInvalid');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contact.errors.messageRequired');
    } else if (formData.message.trim().length > CONTACT_MESSAGE_MAX_LENGTH) {
      newErrors.message = t('contact.errors.messageTooLong');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: 'name' | 'email' | 'message', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <>
      <HeroTitleSection
        className="py-32"
        contentClassName="max-w-4xl mx-auto px-8 text-center flex flex-col items-center justify-center"
        backgroundImageUrl="/alt-contact.jpg"
      >
        <div>
          <h1 className="text-5xl md:text-6xl font-thin text-white mb-6">
            {t('alt.contact.heroTitleBefore')}
            <span className="font-bold text-gold">{t('alt.contact.heroTitleHighlight')}</span>
          </h1>
          <p className="text-xl text-white/95 leading-relaxed max-w-2xl mx-auto">{t('alt.contact.heroSub')}</p>
        </div>
      </HeroTitleSection>

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
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!validateForm()) {
                      return;
                    }

                    setIsSubmitting(true);
                    setErrors((prev) => {
                      const { submit: _submit, ...rest } = prev;
                      return rest;
                    });

                    try {
                      await sendContactMessage({
                        name: formData.name.trim(),
                        email: formData.email.trim(),
                        message: formData.message.trim(),
                      });
                      setSubmitted(true);
                      setFormData({ name: '', email: '', message: '' });
                    } catch (err) {
                      const rateLimited = err instanceof ContactSendError && err.reason === 'rate_limited';
                      setErrors({
                        submit: t(
                          rateLimited ? 'contact.errors.rateLimited' : 'contact.errors.submitFailed',
                        ),
                      });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  <Input
                    label={t('contact.form.name')}
                    placeholder={t('contact.form.namePlaceholder')}
                    value={formData.name}
                    onChange={(value: string) => handleInputChange('name', value)}
                    error={errors.name}
                    required
                  />
                  <Input
                    type="email"
                    label={t('contact.form.email')}
                    placeholder={t('contact.form.emailPlaceholder')}
                    value={formData.email}
                    onChange={(value) => handleInputChange('email', value)}
                    error={errors.email}
                    required
                  />
                  <Textarea
                    label={t('contact.form.message')}
                    placeholder={t('alt.contact.messagePlaceholder')}
                    value={formData.message}
                    onChange={(value: string) => handleInputChange('message', value)}
                    error={errors.message}
                    rows={6}
                    required
                  />
                  {errors.submit ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-red-600 font-medium">{errors.submit}</p>
                    </div>
                  ) : null}
                  <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? t('contact.form.sending') : t('contact.form.submit')}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>

      {isSearchPageEnabled && (
        <section className="py-20 bg-navy text-white">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-thin mb-6">{t('alt.contact.searchCtaHeading')}</h2>
            <p className="text-xl text-warm-gray-light mb-8 leading-relaxed">{t('alt.contact.searchCtaSub')}</p>
            <Link to="/search">
              <Button variant="primary" size="lg">
                {t('alt.contact.searchCtaButton')}
              </Button>
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
