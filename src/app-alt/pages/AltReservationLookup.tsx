import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  cancelReservation,
  getReservationByCode,
  normalizeReservationCode,
  type ReservationLookupData,
} from '../../services/bookingService';
import { Button, Card, Input } from '../../components/ui';

function mapLookupError(error: string | undefined, t: (key: string) => string): string {
  if (!error) return t('reservationLookup.errors.couldNotFindCode');
  const normalized = error.toLowerCase();
  if (normalized.includes('expired')) return t('reservationLookup.errors.expired');
  if (normalized.includes('not found')) return t('reservationLookup.errors.notFound');
  return error;
}

export default function AltReservationLookup() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = searchParams.get('code') ?? '';

  const [code, setCode] = useState(initialCode);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<ReservationLookupData | null>(null);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  const hasResult = useMemo(() => reservation !== null, [reservation]);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loadingSearch) return;

    const normalizedCode = normalizeReservationCode(code);
    if (!normalizedCode) {
      setFormError(t('reservationLookup.errors.invalidCode'));
      return;
    }

    setLoadingSearch(true);
    setFormError(null);
    setCancelMessage(null);
    setReservation(null);

    const result = await getReservationByCode(normalizedCode);
    setLoadingSearch(false);
    setSearchParams({ code: normalizedCode });

    if (!result.success || !result.reservation) {
      setFormError(mapLookupError(result.error, t));
      return;
    }

    setCode(normalizedCode);
    setReservation(result.reservation);
  };

  const handleCancel = async () => {
    if (!reservation?.canCancel || loadingCancel) return;

    setLoadingCancel(true);
    setCancelMessage(null);
    const result = await cancelReservation(reservation.bookingId);
    setLoadingCancel(false);

    if (!result.success) {
      setCancelMessage(result.error ?? t('reservationLookup.errors.cancelFailed'));
      return;
    }

    setReservation((current) =>
      current
        ? {
            ...current,
            status: 'cancelled',
            canCancel: false,
          }
        : current,
    );
    setCancelMessage(t('reservationLookup.messages.cancelSuccess'));
  };

  return (
    <>
      <section className="py-20 bg-linear-to-br from-warm-gray-light to-white border-b border-navy/10">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-thin text-navy mb-4">
            {t('reservationLookup.form.title')}
          </h1>
          <p className="text-lg text-charcoal/90 max-w-2xl mx-auto">{t('reservationLookup.form.subtitle')}</p>
        </div>
      </section>

      <section className="py-16 bg-warm-gray">
        <div className="max-w-4xl mx-auto px-8 space-y-6">
          <Card className="p-6 space-y-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <Input
                label={t('reservationLookup.form.codeLabel')}
                placeholder={t('reservationLookup.form.codePlaceholder')}
                value={code}
                onChange={(value) => {
                  setCode(value);
                  if (formError) setFormError(null);
                }}
                disabled={loadingSearch}
                required
              />
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <Button type="submit" variant="primary" className="w-full" disabled={loadingSearch}>
                {loadingSearch ? t('reservationLookup.actions.searching') : t('reservationLookup.actions.search')}
              </Button>
            </form>
          </Card>

          {hasResult && reservation && (
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-navy">{t('reservationLookup.details.title')}</h2>
              <p><span className="font-semibold">{t('reservationLookup.details.codeLabel')}</span> {reservation.reservationCode}</p>
              <p><span className="font-semibold">{t('reservationLookup.details.propertyLabel')}</span> {reservation.propertyTitle}</p>
              <p>
                <span className="font-semibold">{t('reservationLookup.details.datesLabel')}</span>{' '}
                {t('reservationLookup.details.datesValue', { checkIn: reservation.checkIn, checkOut: reservation.checkOut })}
              </p>
              <p><span className="font-semibold">{t('reservationLookup.details.statusLabel')}</span> {reservation.status}</p>

              <div className="flex flex-wrap gap-3">
                <Link to={`/venue/${reservation.propertyId}`}>
                  <Button variant="outline">{t('reservationLookup.actions.viewProperty')}</Button>
                </Link>
                {reservation.canCancel && (
                  <Button
                    variant="primary"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={loadingCancel}
                    onClick={handleCancel}
                  >
                    {loadingCancel ? t('reservationLookup.actions.cancelling') : t('reservationLookup.actions.cancelReservation')}
                  </Button>
                )}
              </div>

              {cancelMessage && <p className="text-sm text-charcoal">{cancelMessage}</p>}
            </Card>
          )}
        </div>
      </section>
    </>
  );
}
