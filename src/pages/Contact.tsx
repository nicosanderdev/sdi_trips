import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout';
import { Card, Button, Input, Textarea } from '../components/ui';
import { Mail, MessageSquare, Bug, Handshake } from 'lucide-react';

const Contact: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('contact.errors.firstNameRequired');
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('contact.errors.lastNameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact.errors.emailRequired');
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('contact.errors.emailInvalid');
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t('contact.errors.subjectRequired');
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contact.errors.messageRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Reset form and show success
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
      });
      setIsSuccess(true);

      // Hide success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      setErrors({ submit: t('contact.errors.submitFailed') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasonsToContact = [
    {
      icon: MessageSquare,
      title: t('contact.reasons.support'),
      description: t('contact.reasons.supportDesc')
    },
    {
      icon: Bug,
      title: t('contact.reasons.technical'),
      description: t('contact.reasons.technicalDesc')
    },
    {
      icon: Handshake,
      title: t('contact.reasons.partnership'),
      description: t('contact.reasons.partnershipDesc')
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-32 bg-linear-to-br from-warm-gray-light to-white">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gold rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-navy rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-thin text-navy mb-6">
            {t('contact.title.first')} <span className="font-bold text-gold">{t('contact.title.second')}</span>
          </h1>
          <p className="text-xl text-charcoal leading-relaxed max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Side - Contact Information */}
            <div>
              <div className="mb-8">
                <h2 className="text-4xl md:text-5xl font-thin text-navy mb-6">
                  {t('contact.reasons.title')}
                </h2>
                <div className="w-20 h-1 bg-gold mb-8"></div>
              </div>

              <div className="space-y-8">
                {reasonsToContact.map((reason, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center shrink-0">
                      <reason.icon className="h-6 w-6 text-navy" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-navy mb-2">
                        {reason.title}
                      </h3>
                      <p className="text-charcoal leading-relaxed">
                        {reason.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-6 bg-warm-gray-light rounded-2xl">
                <div className="flex items-center space-x-3 mb-3">
                  <Mail className="h-6 w-6 text-gold" />
                  <h3 className="text-lg font-semibold text-navy">
                    {t('common.contact', 'Contact Information')}
                  </h3>
                </div>
                <p className="text-charcoal leading-relaxed">
                  {t('contact.subtitle')}
                </p>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <Card variant="elevated" className="p-8">
              {isSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-navy mb-4">
                    {t('contact.success.title')}
                  </h3>
                  <p className="text-charcoal">
                    {t('contact.success.message')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label={t('contact.form.firstName')}
                      placeholder={t('contact.form.firstNamePlaceholder')}
                      value={formData.firstName}
                      onChange={(value) => handleInputChange('firstName', value)}
                      error={errors.firstName}
                      required
                    />
                    <Input
                      label={t('contact.form.lastName')}
                      placeholder={t('contact.form.lastNamePlaceholder')}
                      value={formData.lastName}
                      onChange={(value) => handleInputChange('lastName', value)}
                      error={errors.lastName}
                      required
                    />
                  </div>

                  <Input
                    type="email"
                    label={t('contact.form.email')}
                    placeholder={t('contact.form.emailPlaceholder')}
                    value={formData.email}
                    onChange={(value) => handleInputChange('email', value)}
                    error={errors.email}
                    required
                  />

                  <Input
                    label={t('contact.form.subject')}
                    placeholder={t('contact.form.subjectPlaceholder')}
                    value={formData.subject}
                    onChange={(value) => handleInputChange('subject', value)}
                    error={errors.subject}
                    required
                  />

                  <Textarea
                    label={t('contact.form.message')}
                    placeholder={t('contact.form.messagePlaceholder')}
                    value={formData.message}
                    onChange={(value) => handleInputChange('message', value)}
                    error={errors.message}
                    rows={6}
                    required
                  />

                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-red-600 font-medium">{errors.submit}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('contact.form.sending') : t('contact.form.submit')}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Host Banner Section */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-thin mb-6">
            {t('contact.publishBanner.title')}
          </h2>
          <p className="text-xl text-warm-gray-light mb-8 leading-relaxed">
            {t('contact.publishBanner.description')}
          </p>
          <a
            href="#"
            className="inline-flex items-center justify-center px-8 py-4 bg-gold text-navy font-semibold rounded-full hover:bg-white hover:text-navy transition-all duration-200"
          >
            {t('contact.publishBanner.button')}
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;