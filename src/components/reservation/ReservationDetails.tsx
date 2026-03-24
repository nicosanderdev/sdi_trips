import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, Card } from '../ui';
import type { ReservationLookupData } from '../../services/bookingService';

interface ReservationDetailsProps {
  reservation: ReservationLookupData;
  cancelMessage: string | null;
  onCancel: () => void;
  isCancelling: boolean;
}

const ReservationDetails: React.FC<ReservationDetailsProps> = ({
  reservation,
  cancelMessage,
  onCancel,
  isCancelling,
}) => {
  const { t } = useTranslation();
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

  return (
    <Card className="w-full max-w-2xl p-8 space-y-4">
      <h2 className="text-2xl font-semibold text-navy">{t('reservationLookup.details.title')}</h2>
      <p><span className="font-semibold">{t('reservationLookup.details.codeLabel')}</span> {reservation.reservationCode}</p>
      <p><span className="font-semibold">{t('reservationLookup.details.propertyLabel')}</span> {reservation.propertyTitle}</p>
      <p>
        <span className="font-semibold">{t('reservationLookup.details.datesLabel')}</span>{' '}
        {t('reservationLookup.details.datesValue', { checkIn: reservation.checkIn, checkOut: reservation.checkOut })}
      </p>
      <p><span className="font-semibold">{t('reservationLookup.details.statusLabel')}</span> {statusLabel}</p>
      <p><span className="font-semibold">{t('reservationLookup.details.guestLabel')}</span> {guestInfo || t('reservationLookup.details.notAvailable')}</p>

      <div className="pt-2 flex flex-wrap gap-3">
        <Link to={`/property/${reservation.propertyId}`}>
          <Button variant="outline">{t('reservationLookup.actions.viewProperty')}</Button>
        </Link>

        {reservation.canCancel && (
          <Button
            variant="primary"
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isCancelling}
            onClick={onCancel}
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
  );
};

export default ReservationDetails;
