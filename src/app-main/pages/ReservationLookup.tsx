import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/layout';
import HeroTitleSection from '../../components/sections/HeroTitleSection';
import ReservationLookupForm from '../../components/reservation/ReservationLookupForm';
import ReservationDetails from '../../components/reservation/ReservationDetails';
import { Button, Card } from '../../components/ui';
import type { ManageBookingView } from '../../types';
import {
  cancelBookingByManageToken,
  cancelReservation,
  getBookingByManageToken,
  getReservationByCode,
  normalizeReservationCode,
  type ReservationLookupData,
} from '../../services/bookingService';

function mapLookupError(error: string | undefined, t: (key: string) => string): string {
  if (!error) return t('reservationLookup.errors.couldNotFindCode');
  const normalized = error.toLowerCase();
  if (normalized.includes('expired')) return t('reservationLookup.errors.expired');
  if (normalized.includes('not found')) return t('reservationLookup.errors.notFound');
  return error;
}

type ViewModel =
  | { mode: 'none' }
  | { mode: 'manage'; token: string; booking: ManageBookingView }
  | { mode: 'lookup'; reservation: ReservationLookupData };

const ReservationLookup: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = searchParams.get('code') ?? '';

  const tokenFromUrl = searchParams.get('token');
  const hasTokenParam = searchParams.has('token');
  const token = tokenFromUrl?.trim() ?? '';

  const [code, setCode] = useState(initialCode);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [view, setView] = useState<ViewModel>({ mode: 'none' });
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  const [tokenLoading, setTokenLoading] = useState(() => Boolean(searchParams.get('token')?.trim()));
  const [tokenError, setTokenError] = useState<string | null>(null);

  const hasLookupResult = useMemo(() => view.mode === 'lookup', [view.mode]);

  const refreshManageBooking = useCallback(async (manageToken: string) => {
    const result = await getBookingByManageToken(manageToken);
    if (result.success && result.booking) {
      setView({ mode: 'manage', token: manageToken, booking: result.booking });
    }
  }, []);

  useEffect(() => {
    if (!hasTokenParam) {
      setTokenError(null);
      setTokenLoading(false);
      setView((v) => (v.mode === 'manage' ? { mode: 'none' } : v));
      return;
    }
    if (!token) {
      setTokenError(t('reservationLookup.manageToken.missingToken'));
      setTokenLoading(false);
      setView((v) => (v.mode === 'manage' ? { mode: 'none' } : v));
      return;
    }

    let mounted = true;
    setTokenLoading(true);
    setTokenError(null);
    setCancelMessage(null);

    (async () => {
      const result = await getBookingByManageToken(token);
      if (!mounted) return;
      setTokenLoading(false);
      if (!result.success || !result.booking) {
        setTokenError(result.error ?? t('reservationLookup.manageToken.invalidOrExpired'));
        setView((v) => (v.mode === 'lookup' ? v : { mode: 'none' }));
        return;
      }
      setView({ mode: 'manage', token, booking: result.booking });
    })();

    return () => {
      mounted = false;
    };
  }, [hasTokenParam, token, t]);

  useEffect(() => {
    const normalized = normalizeReservationCode(initialCode);
    if (!normalized) return;

    let cancelled = false;
    (async () => {
      const result = await getReservationByCode(normalized);
      if (cancelled) return;
      if (result.success && result.reservation) {
        setCode(normalized);
        setView({ mode: 'lookup', reservation: result.reservation });
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.set('code', normalized);
            return next;
          },
          { replace: true },
        );
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate from URL on mount only
  }, []);

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

    const result = await getReservationByCode(normalizedCode);
    setLoadingSearch(false);

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('code', normalizedCode);
      return next;
    });

    if (!result.success || !result.reservation) {
      setFormError(mapLookupError(result.error, t));
      setView((v) => (v.mode === 'manage' ? v : { mode: 'none' }));
      return;
    }

    setCode(normalizedCode);
    setView({ mode: 'lookup', reservation: result.reservation });
  };

  const handleCancelLookup = async () => {
    if (view.mode !== 'lookup' || !view.reservation.canCancel || loadingCancel) return;

    setLoadingCancel(true);
    setCancelMessage(null);
    const result = await cancelReservation(view.reservation.bookingId);
    setLoadingCancel(false);

    if (!result.success) {
      setCancelMessage(result.error ?? t('reservationLookup.errors.cancelFailed'));
      return;
    }

    setView({
      mode: 'lookup',
      reservation: {
        ...view.reservation,
        status: 'cancelled',
        canCancel: false,
      },
    });
    setCancelMessage(t('reservationLookup.messages.cancelSuccess'));
  };

  const handleCancelManage = async () => {
    if (view.mode !== 'manage' || !view.booking.canCancel || loadingCancel) return;
    setLoadingCancel(true);
    setCancelMessage(null);
    const result = await cancelBookingByManageToken(view.token, 'Cancelled by guest from management link');
    setLoadingCancel(false);
    if (!result.success) {
      setCancelMessage(result.error ?? t('reservationLookup.errors.cancelFailed'));
      return;
    }
    setCancelMessage(t('reservationLookup.messages.cancelSuccess'));
    await refreshManageBooking(view.token);
  };

  const handleSearchAgain = async () => {
    setCode('');
    setFormError(null);
    setCancelMessage(null);
    setView({ mode: 'none' });
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('code');
      return next;
    });
    if (hasTokenParam && token) {
      await refreshManageBooking(token);
    }
  };

  const missingTokenMessage = hasTokenParam && !token ? t('reservationLookup.manageToken.missingToken') : null;
  const displayTokenError = missingTokenMessage ?? tokenError;
  const showTokenErrorCard = Boolean(displayTokenError) && !tokenLoading;
  const showTokenLoading = hasTokenParam && Boolean(token) && tokenLoading;

  const manageStatusLabel =
    view.mode === 'manage'
      ? (() => {
          const raw = view.booking.status;
          const statusKey = `reservationLookup.status.${raw}`;
          const translated = t(statusKey);
          return translated === statusKey ? raw : translated;
        })()
      : '';

  return (
    <Layout>
      <HeroTitleSection className="py-20 md:py-24" contentClassName="mx-auto max-w-4xl px-6 text-center flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-5xl font-thin text-white mb-4">
          {t('reservationLookup.form.title')}
        </h1>
        <p className="text-lg md:text-xl text-white/95 leading-relaxed max-w-2xl">
          {t('reservationLookup.form.subtitle')}
        </p>
      </HeroTitleSection>
      <div className="px-6 py-12 md:py-16">
        <div className="mx-auto max-w-4xl flex flex-col items-center gap-6">
          {showTokenLoading && (
            <p className="text-center text-charcoal">{t('reservationLookup.manageToken.loading')}</p>
          )}

          {showTokenErrorCard && displayTokenError && (
            <Card className="w-full max-w-2xl rounded-2xl border border-red-200 p-5 bg-red-50">
              <p className="text-red-700 m-0">{displayTokenError}</p>
              <Link to="/search" className="inline-block mt-4">
                <Button variant="outline">{t('notFound.searchProperties')}</Button>
              </Link>
            </Card>
          )}

          {view.mode === 'manage' && (
            <Card className="w-full max-w-2xl p-8 space-y-4">
              <h2 className="text-2xl font-semibold text-navy">{t('reservationLookup.details.title')}</h2>
              <p>
                <span className="font-semibold">{t('reservationLookup.details.codeLabel')}</span>{' '}
                {view.booking.reservationCode}
              </p>
              <p>
                <span className="font-semibold">{t('reservationLookup.details.propertyLabel')}</span>{' '}
                {view.booking.propertyTitle}
              </p>
              <p>
                <span className="font-semibold">{t('reservationLookup.details.datesLabel')}</span>{' '}
                {t('reservationLookup.details.datesValue', {
                  checkIn: view.booking.checkIn,
                  checkOut: view.booking.checkOut,
                })}
              </p>
              <p>
                <span className="font-semibold">{t('reservationLookup.details.statusLabel')}</span> {manageStatusLabel}
              </p>
              <p>
                <span className="font-semibold">{t('reservationLookup.details.guestsLabel')}</span>{' '}
                {t('reservationLookup.details.guestsCount', { count: view.booking.guests })}
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                {view.booking.canCancel && (
                  <Button
                    variant="primary"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={loadingCancel}
                    onClick={handleCancelManage}
                  >
                    {loadingCancel ? t('reservationLookup.actions.cancelling') : t('reservationLookup.actions.cancelReservation')}
                  </Button>
                )}
              </div>
              {cancelMessage && (
                <p
                  className={
                    cancelMessage.toLowerCase().includes('success') ? 'text-green-700 text-sm' : 'text-red-700 text-sm'
                  }
                >
                  {cancelMessage}
                </p>
              )}
            </Card>
          )}

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

          {hasLookupResult && view.mode === 'lookup' && (
            <>
              <ReservationDetails
                reservation={view.reservation}
                cancelMessage={cancelMessage}
                onCancel={handleCancelLookup}
                isCancelling={loadingCancel}
              />
              <button
                type="button"
                className="text-sm font-medium text-navy underline underline-offset-4 hover:text-gold"
                onClick={() => void handleSearchAgain()}
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
