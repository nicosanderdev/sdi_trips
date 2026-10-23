import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { GuestSiteListingType } from '../../types';
import { requestBookingManageLink } from '../../services/bookingService';
import { Button, Card, Input } from '../ui';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RequestManageLinkFormProps {
  reservationCode: string;
  listingType: GuestSiteListingType;
  defaultEmail?: string | null;
  cardVariant?: 'default' | 'elevated' | 'glass' | 'surface';
}

type Notice = 'sent' | 'rate_limited' | 'failed';

const RequestManageLinkForm: React.FC<RequestManageLinkFormProps> = ({
  reservationCode,
  listingType,
  defaultEmail,
  cardVariant = 'default',
}) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState(defaultEmail?.trim() ?? '');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setEmailError(t('reservationLookup.manageLink.invalidEmail'));
      setNotice(null);
      return;
    }

    setSubmitting(true);
    setEmailError(null);
    setNotice(null);

    const result = await requestBookingManageLink({
      reservationCode,
      email: trimmed,
      listingType,
    });

    setSubmitting(false);
    if (result.success) {
      setNotice('sent');
      return;
    }
    setNotice(result.reason === 'rate_limited' ? 'rate_limited' : 'failed');
  };

  const noticeText =
    notice === 'sent'
      ? t('reservationLookup.manageLink.sent')
      : notice === 'rate_limited'
        ? t('reservationLookup.manageLink.rateLimited')
        : notice === 'failed'
          ? t('reservationLookup.manageLink.failed')
          : null;

  return (
    <Card variant={cardVariant} className="w-full max-w-2xl p-8">
      <h2 className="text-2xl font-semibold text-navy mb-2">
        {t('reservationLookup.manageLink.title')}
      </h2>
      <p className="text-charcoal mb-6">{t('reservationLookup.manageLink.body')}</p>

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
        <Input
          type="email"
          label={t('reservationLookup.manageLink.emailLabel')}
          placeholder={t('reservationLookup.manageLink.emailPlaceholder')}
          value={email}
          onChange={(value) => {
            setEmail(value);
            if (emailError) setEmailError(null);
          }}
          error={emailError ?? undefined}
          disabled={submitting}
          required
        />

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
          {submitting
            ? t('reservationLookup.manageLink.submitting')
            : t('reservationLookup.manageLink.submit')}
        </Button>
      </form>

      {noticeText && (
        <p
          className={`mt-4 text-sm ${notice === 'sent' ? 'text-green-800' : 'text-red-700'}`}
          role="status"
        >
          {noticeText}
        </p>
      )}
    </Card>
  );
};

export default RequestManageLinkForm;
