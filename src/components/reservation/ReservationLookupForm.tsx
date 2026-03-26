import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Input } from '../ui';

interface ReservationLookupFormProps {
  code: string;
  onCodeChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  isLoading: boolean;
  error: string | null;
}

const ReservationLookupForm: React.FC<ReservationLookupFormProps> = ({
  code,
  onCodeChange,
  onSubmit,
  isLoading,
  error,
}) => {
  const { t } = useTranslation();

  return (
    <Card variant="default" className="w-full max-w-2xl p-8">
      <h1 className="text-3xl font-semibold text-navy mb-2">{t('reservationLookup.form.title')}</h1>
      <p className="text-charcoal mb-6">
        {t('reservationLookup.form.subtitle')}
      </p>

      <form onSubmit={onSubmit} className="space-y-5">
        <Input
          label={t('reservationLookup.form.codeLabel')}
          placeholder={t('reservationLookup.form.codePlaceholder')}
          value={code}
          onChange={onCodeChange}
          disabled={isLoading}
          required
        />

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? t('reservationLookup.actions.searching') : t('reservationLookup.actions.search')}
        </Button>
      </form>
    </Card>
  );
};

export default ReservationLookupForm;
