import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { browseFallbackPath, isSearchPageEnabled } from '../../core/config/searchPageVisibility';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/layout';
import HeroTitleSection from '../../components/sections/HeroTitleSection';
import ReservationLookupForm from '../../components/reservation/ReservationLookupForm';
import ReservationDetails from '../../components/reservation/ReservationDetails';
import ReservationManageDetails from '../../components/reservation/ReservationManageDetails';
import { Button, Card } from '../../components/ui';
import { parseListingTypeParam } from '../../core/config/guestBookingManageUrl';
import { getGuestSiteListingType } from '../../core/config/guestSiteListingType';
import type { CancellationPreview, ManageBookingView } from '../../types';
import {
  cancelBookingByCode,
  cancelBookingByManageToken,
  getBookingByManageToken,
  getReservationByCode,
  normalizeReservationCode,
  previewBookingCancellationByCode,
  previewBookingCancellationByManageToken,
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
  const listingTypeFromUrl = parseListingTypeParam(searchParams.get('listingType'));

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
  const siteListingType = listingTypeFromUrl ?? getGuestSiteListingType();

  const refreshManageBooking = useCallback(async (manageToken: string) => {
    const result = await getBookingByManageToken(manageToken);
    if (result.success && result.booking) {
      setView({ mode: 'manage', token: manageToken, booking: result.booking });
      return true;
    }
    return false;
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
      const result = await getReservationByCode(normalized, listingTypeFromUrl);
      if (cancelled) return;
      if (result.success && result.reservation) {
        setCode(normalized);
        setView({ mode: 'lookup', reservation: result.reservation });
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.set('code', normalized);
            const lt = listingTypeFromUrl ?? result.reservation?.listingType;
            if (lt) next.set('listingType', lt);
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

    const result = await getReservationByCode(normalizedCode, listingTypeFromUrl);
    setLoadingSearch(false);

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('code', normalizedCode);
      const lt = listingTypeFromUrl ?? result.reservation?.listingType;
      if (lt) next.set('listingType', lt);
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

  const handleCancelLookup = async (previewHash: string) => {
    if (view.mode !== 'lookup' || !view.reservation.canCancel || loadingCancel) {
      return { success: false, error: t('reservationLookup.errors.cancelFailed') };
    }

    setLoadingCancel(true);
    setCancelMessage(null);
    const result = await cancelBookingByCode(
      view.reservation.reservationCode,
      view.reservation.listingType ?? siteListingType,
      'Cancelled by guest from reservation lookup',
      previewHash,
    );
    setLoadingCancel(false);
    return result;
  };

  const handleCancelManage = async (previewHash: string) => {
    if (view.mode !== 'manage' || !view.booking.canCancel || loadingCancel) {
      return { success: false, error: t('reservationLookup.errors.cancelFailed') };
    }
    setLoadingCancel(true);
    setCancelMessage(null);
    const result = await cancelBookingByManageToken(
      view.token,
      'Cancelled by guest from management link',
      previewHash,
    );
    setLoadingCancel(false);
    return result;
  };

  const handleCancelLookupSuccess = async (_preview: CancellationPreview) => {
    setCancelMessage(t('reservationLookup.messages.cancelSuccess'));
    if (view.mode !== 'lookup') return;
    const refreshed = await getReservationByCode(
      view.reservation.reservationCode,
      view.reservation.listingType ?? siteListingType,
    );
    if (refreshed.success && refreshed.reservation) {
      setView({ mode: 'lookup', reservation: refreshed.reservation });
      return;
    }
    setView({
      mode: 'lookup',
      reservation: {
        ...view.reservation,
        status: 'cancelled',
        canCancel: false,
        canPayOnline: false,
        refundStatus: _preview.refundAmount > 0.009 ? 1 : 0,
        refundDueAt: _preview.refundDueAt,
        amountPaid: _preview.amountPaid,
      },
    });
  };

  const handleCancelManageSuccess = async (_preview: CancellationPreview) => {
    setCancelMessage(t('reservationLookup.messages.cancelSuccess'));
    if (view.mode !== 'manage') return;
    const refreshed = await refreshManageBooking(view.token);
    if (refreshed) return;
    setView({
      mode: 'manage',
      token: view.token,
      booking: {
        ...view.booking,
        status: 'cancelled',
        canCancel: false,
        canPayOnline: false,
        refundStatus: _preview.refundAmount > 0.009 ? 1 : 0,
        refundDueAt: _preview.refundDueAt,
        amountPaid: _preview.amountPaid,
      },
    });
  };

  const handleSearchAgain = async () => {
    setCode('');
    setFormError(null);
    setCancelMessage(null);
    setView({ mode: 'none' });
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('code');
      next.delete('listingType');
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
              <Link to={browseFallbackPath} className="inline-block mt-4">
                <Button variant="outline">
                  {isSearchPageEnabled ? t('notFound.searchProperties') : t('auth.backToHome')}
                </Button>
              </Link>
            </Card>
          )}

          {view.mode === 'manage' && (
            <ReservationManageDetails
              booking={view.booking}
              statusLabel={manageStatusLabel}
              cancelMessage={cancelMessage}
              isCancelling={loadingCancel}
              onCancelConfirm={handleCancelManage}
              onLoadCancelPreview={() => previewBookingCancellationByManageToken(view.token)}
              onCancelSuccess={(preview) => void handleCancelManageSuccess(preview)}
              manageToken={view.token}
            />
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
                isCancelling={loadingCancel}
                onCancelConfirm={handleCancelLookup}
                onLoadCancelPreview={() =>
                  previewBookingCancellationByCode(
                    view.reservation.reservationCode,
                    view.reservation.listingType ?? siteListingType,
                  )
                }
                onCancelSuccess={(preview) => void handleCancelLookupSuccess(preview)}
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
