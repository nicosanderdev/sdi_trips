import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, Card, Modal } from '../ui';
import type { ReservationLookupData } from '../../services/bookingService';
import { canShowGuestReviewOnLookup } from '../../core/services/guestReviewEligibility';
import GuestReservationReviewForm from './GuestReservationReviewForm';

const defaultPropertyPath = (propertyId: string) => `/property/${propertyId}`;

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
  reservation,
  cancelMessage,
  onCancel,
  isCancelling,
  propertyPath = defaultPropertyPath,
  cardVariant = 'default',
}) => {
  const { t } = useTranslation();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const guestInfo = [reservation.guestName, reservation.guestEmail, reservation.guestPhone]
    .filter(Boolean)
    .join(' - ');
  const statusKey = `reservationLookup.status.${reservation.status}`;
  const translatedStatus = t(statusKey);
  const statusLabel = translatedStatus === statusKey ? reservation.status : translatedStatus;
  const localizedSuccessMessage = t('reservationLookup.messages.cancelSuccess').toLowerCase();
  const isSuccessMessage =
    cancelMessage?.toLowerCase().includes(localizedSuccessMessage) ||
    cancelMessage?.toLowerCase().includes('success') ||
    false;

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    onCancel();
  };

  const showGuestReview = canShowGuestReviewOnLookup(reservation);

  return (
    <>
      <Card variant={cardVariant} className="w-full max-w-2xl p-8 space-y-4">
        <h2 className="text-2xl font-semibold text-navy">{t('reservationLookup.details.title')}</h2>
        <p><span className="font-semibold">{t('reservationLookup.details.codeLabel')}</span> {reservation.reservationCode}</p>
        <p><span className="font-semibold">{t('reservationLookup.details.propertyLabel')}</span> {reservation.propertyTitle}</p>
        <p>
          <span className="font-semibold">{t('reservationLookup.details.datesLabel')}</span>{' '}
          {t('reservationLookup.details.datesValue', { checkIn: reservation.checkIn, checkOut: reservation.checkOut })}
        </p>
        <p><span className="font-semibold">{t('reservationLookup.details.statusLabel')}</span> {statusLabel}</p>
        <p><span className="font-semibold">{t('reservationLookup.details.guestLabel')}</span> {guestInfo || t('reservationLookup.details.notAvailable')}</p>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link to={propertyPath(reservation.propertyId)}>
            <Button variant="outline">{t('reservationLookup.actions.viewProperty')}</Button>
          </Link>

          {reservation.canCancel && (
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

      {showGuestReview && (
        <GuestReservationReviewForm reservation={reservation} cardVariant={cardVariant} />
      )}

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
