import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '../components/layout';
import ReservationLookupForm from '../components/reservation/ReservationLookupForm';
import ReservationDetails from '../components/reservation/ReservationDetails';
import {
  cancelReservation,
  getReservationByCode,
  normalizeReservationCode,
  type ReservationLookupData,
} from '../services/bookingService';

function mapLookupError(error: string | undefined, t: (key: string) => string): string {
  if (!error) return t('reservationLookup.errors.couldNotFindCode');
  const normalized = error.toLowerCase();
  if (normalized.includes('expired')) return t('reservationLookup.errors.expired');
  if (normalized.includes('not found')) return t('reservationLookup.errors.notFound');
  return error;
}

const ReservationLookup: React.FC = () => {
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
        : current
    );
    setCancelMessage(t('reservationLookup.messages.cancelSuccess'));
  };

  const handleSearchAgain = () => {
    setCode('');
    setFormError(null);
    setCancelMessage(null);
    setReservation(null);
    setSearchParams({});
  };

  return (
    <Layout>
      <div className="px-6 py-12 md:py-16">
        <div className="mx-auto max-w-4xl flex flex-col items-center gap-6">
          <ReservationLookupForm
            code={code}
            onCodeChange={(value) => {
              setCode(value);
              if (formError) setFormError(null);
            }}
            onSubmit={handleSearch}
            isLoading={loadingSearch}
            error={formError}
          />

          {hasResult && reservation && (
            <>
              <ReservationDetails
                reservation={reservation}
                cancelMessage={cancelMessage}
                onCancel={handleCancel}
                isCancelling={loadingCancel}
              />
              <button
                type="button"
                className="text-sm font-medium text-navy underline underline-offset-4 hover:text-gold"
                onClick={handleSearchAgain}
              >
                {t('reservationLookup.actions.searchAnotherCode')}
              </button>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ReservationLookup;
