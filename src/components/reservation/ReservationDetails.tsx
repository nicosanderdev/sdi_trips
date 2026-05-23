import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { enUS, es, ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Button, Card, Modal } from '../ui';
import type { GuestExistingReview } from '../../types/guestReviewContract';
import type { ReservationLookupData } from '../../services/bookingService';
import { getGuestReviewLookupState } from '../../core/services/guestReviewEligibility';
import { getGuestReviewWindow } from '../../core/services/guestReviewWindow';
import GuestReservationReviewForm from './GuestReservationReviewForm';
import GuestReviewReadOnlyCard from './GuestReviewReadOnlyCard';

const defaultPropertyPath = (propertyId: string) => `/property/${propertyId}`;

const DATE_FNS_LOCALES = { en: enUS, es, pt: ptBR } as const;

function formatReviewDate(date: Date, language: string): string {
  const locale = DATE_FNS_LOCALES[language as keyof typeof DATE_FNS_LOCALES] ?? enUS;
  return format(date, 'PPp', { locale });
}

interface ReservationDetailsProps {
  reservation: ReservationLookupData;
  cancelMessage: string | null;
  onCancel: () => void;
  isCancelling: boolean;
  /** Build destination URL for "View property" (default: `/property/:id`). */
  propertyPath?: (propertyId: string) => string;
  cardVariant?: 'default' | 'elevated' | 'glass' | 'surface';
}

const ReservationDetails: React.FC<ReservationDetailsProps> = ({
  reservation: reservationProp,
  cancelMessage,
  onCancel,
  isCancelling,
  propertyPath = defaultPropertyPath,
  cardVariant = 'default',
}) => {
  const { t, i18n } = useTranslation();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [localReservation, setLocalReservation] = useState(reservationProp);

  useEffect(() => {
    setLocalReservation(reservationProp);
  }, [reservationProp]);

  const reviewState = useMemo(
    () => getGuestReviewLookupState(localReservation),
    [localReservation],
  );

  const windowDates = useMemo(() => {
    const { windowStart, windowEnd } = getGuestReviewWindow(localReservation.checkOut);
    const serverEnd = localReservation.guestReviewWindowEnd
      ? new Date(localReservation.guestReviewWindowEnd)
      : windowEnd;
    return {
      checkOut: formatReviewDate(windowStart, i18n.language),
      windowEnd: formatReviewDate(serverEnd, i18n.language),
    };
  }, [localReservation.checkOut, localReservation.guestReviewWindowEnd, i18n.language]);

  const handleReviewSaved = (review: GuestExistingReview) => {
    setLocalReservation((prev) => ({
      ...prev,
      hasExistingReview: true,
      canSubmitGuestReview: false,
      canEditGuestReview: true,
      existingGuestReview: review,
    }));
  };

  const guestInfo = [localReservation.guestName, localReservation.guestEmail, localReservation.guestPhone]
    .filter(Boolean)
    .join(' - ');
  const statusKey = `reservationLookup.status.${localReservation.status}`;
  const translatedStatus = t(statusKey);
  const statusLabel = translatedStatus === statusKey ? localReservation.status : translatedStatus;
  const localizedSuccessMessage = t('reservationLookup.messages.cancelSuccess').toLowerCase();
  const isSuccessMessage =
    cancelMessage?.toLowerCase().includes(localizedSuccessMessage) ||
    cancelMessage?.toLowerCase().includes('success') ||
    false;

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    onCancel();
  };

  const renderReviewBanner = () => {
    if (reviewState.kind === 'not_yet_open') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
          {t('reservationLookup.review.windowOpens', windowDates)}
        </div>
      );
    }
    if (reviewState.kind === 'create' || reviewState.kind === 'edit') {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-900">
          {t('reservationLookup.review.windowOpen', windowDates)}
        </div>
      );
    }
    if (reviewState.kind === 'expired') {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900" role="status">
          {t('reservationLookup.review.codeExpired')}
        </div>
      );
    }
    return null;
  };

  const renderReviewSection = () => {
    if (reviewState.kind === 'hidden') {
      return null;
    }

    const banner = renderReviewBanner();

    if (reviewState.kind === 'not_yet_open' || reviewState.kind === 'expired') {
      return banner ? (
        <Card variant={cardVariant} className="w-full max-w-2xl p-6">
          {banner}
        </Card>
      ) : null;
    }

    if (reviewState.kind === 'view_only') {
      return (
        <div className="space-y-4 w-full max-w-2xl">
          {banner}
          <GuestReviewReadOnlyCard review={reviewState.review} cardVariant={cardVariant} />
        </div>
      );
    }

    if (reviewState.kind === 'create' || reviewState.kind === 'edit') {
      return (
        <div className="space-y-4 w-full max-w-2xl">
          {banner}
          <GuestReservationReviewForm
            reservation={localReservation}
            mode={reviewState.kind}
            existingReview={reviewState.kind === 'edit' ? reviewState.review : undefined}
            cardVariant={cardVariant}
            onReviewSaved={handleReviewSaved}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Card variant={cardVariant} className="w-full max-w-2xl p-8 space-y-4">
        <h2 className="text-2xl font-semibold text-navy">{t('reservationLookup.details.title')}</h2>
        <p><span className="font-semibold">{t('reservationLookup.details.codeLabel')}</span> {localReservation.reservationCode}</p>
        <p><span className="font-semibold">{t('reservationLookup.details.propertyLabel')}</span> {localReservation.propertyTitle}</p>
        <p>
          <span className="font-semibold">{t('reservationLookup.details.datesLabel')}</span>{' '}
          {t('reservationLookup.details.datesValue', { checkIn: localReservation.checkIn, checkOut: localReservation.checkOut })}
        </p>
        <p><span className="font-semibold">{t('reservationLookup.details.statusLabel')}</span> {statusLabel}</p>
        <p><span className="font-semibold">{t('reservationLookup.details.guestLabel')}</span> {guestInfo || t('reservationLookup.details.notAvailable')}</p>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link to={propertyPath(localReservation.propertyId)}>
            <Button variant="outline">{t('reservationLookup.actions.viewProperty')}</Button>
          </Link>

          {localReservation.canCancel && (
            <Button
              variant="primary"
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isCancelling}
              onClick={() => setShowCancelConfirm(true)}
            >
              {isCancelling ? t('reservationLookup.actions.cancelling') : t('reservationLookup.actions.cancelReservation')}
            </Button>
          )}
        </div>

        {cancelMessage && (
          <p className={isSuccessMessage ? 'text-green-700 text-sm' : 'text-red-700 text-sm'}>
            {cancelMessage}
          </p>
        )}
      </Card>

      {renderReviewSection()}

      <Modal
        isOpen={showCancelConfirm}
        onClose={() => {
          if (isCancelling) return;
          setShowCancelConfirm(false);
        }}
        title={t('reservationLookup.confirmCancel.title')}
      >
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
            {t('reservationLookup.confirmCancel.message')}
          </div>

          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirm(false)}
              disabled={isCancelling}
            >
              {t('reservationLookup.confirmCancel.dismiss')}
            </Button>
            <Button
              variant="primary"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmCancel}
              disabled={isCancelling}
            >
              {isCancelling
                ? t('reservationLookup.actions.cancelling')
                : t('reservationLookup.confirmCancel.confirm')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ReservationDetails;
