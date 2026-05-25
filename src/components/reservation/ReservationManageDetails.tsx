import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '../ui';
import type { ManageBookingView } from '../../types';
import HostContactSection from './HostContactSection';

interface ReservationManageDetailsProps {
  booking: ManageBookingView;
  statusLabel: string;
  cancelMessage: string | null;
  isCancelling: boolean;
  onCancel: () => void;
  cardVariant?: 'default' | 'elevated' | 'glass' | 'surface';
}

const ReservationManageDetails: React.FC<ReservationManageDetailsProps> = ({
  booking,
  statusLabel,
  cancelMessage,
  isCancelling,
  onCancel,
  cardVariant = 'default',
}) => {
  const { t } = useTranslation();

  const localizedSuccessMessage = t('reservationLookup.messages.cancelSuccess').toLowerCase();
  const isSuccessMessage =
    cancelMessage?.toLowerCase().includes(localizedSuccessMessage) ||
    cancelMessage?.toLowerCase().includes('success') ||
    false;

  return (
    <Card variant={cardVariant} className="w-full max-w-2xl p-8 space-y-4">
      <h2 className="text-2xl font-semibold text-navy">{t('reservationLookup.details.title')}</h2>
      <p>
        <span className="font-semibold">{t('reservationLookup.details.codeLabel')}</span>{' '}
        {booking.reservationCode}
      </p>
      <p>
        <span className="font-semibold">{t('reservationLookup.details.propertyLabel')}</span>{' '}
        {booking.propertyTitle}
      </p>
      <p>
        <span className="font-semibold">{t('reservationLookup.details.datesLabel')}</span>{' '}
        {t('reservationLookup.details.datesValue', {
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
        })}
      </p>
      <p>
        <span className="font-semibold">{t('reservationLookup.details.statusLabel')}</span> {statusLabel}
      </p>
      <p>
        <span className="font-semibold">{t('reservationLookup.details.guestsLabel')}</span>{' '}
        {t('reservationLookup.details.guestsCount', { count: booking.guests })}
      </p>

      <HostContactSection status={booking.status} hostContact={booking.hostContact} />

      <div className="pt-2 flex flex-wrap gap-3">
        {booking.canCancel && (
          <Button
            variant="primary"
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isCancelling}
            onClick={onCancel}
          >
            {isCancelling
              ? t('reservationLookup.actions.cancelling')
              : t('reservationLookup.actions.cancelReservation')}
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

export default ReservationManageDetails;
