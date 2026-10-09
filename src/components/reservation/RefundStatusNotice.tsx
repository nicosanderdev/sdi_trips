import React from 'react';
import { useTranslation } from 'react-i18next';
import type { BookingRefundStatus } from '../../types/guestReviewContract';
import { formatPriceAmount } from '../../services/pricing/formatPrice';
import { formatReservationStayDate } from '../../utils/formatReservationStayDate';

export interface RefundStatusNoticeProps {
  status?: BookingRefundStatus | number | null;
  amountPaid?: number | null;
  refundDueAt?: string | null;
  currencyCode?: string | null;
  bookingStatus?: string | null;
  className?: string;
}

const RefundStatusNotice: React.FC<RefundStatusNoticeProps> = ({
  status,
  amountPaid,
  refundDueAt,
  currencyCode,
  bookingStatus,
  className = '',
}) => {
  const { t, i18n } = useTranslation();

  if (bookingStatus && bookingStatus !== 'cancelled') {
    return null;
  }
  if (status == null || status === 0) {
    if (bookingStatus === 'cancelled' && (amountPaid == null || amountPaid <= 0.009)) {
      return (
        <div className={`rounded-lg border border-warm-gray bg-white/90 p-3 text-sm text-charcoal ${className}`}>
          {t('reservationLookup.refund.notRequired')}
        </div>
      );
    }
    return null;
  }

  const dueLabel =
    refundDueAt != null
      ? formatReservationStayDate(refundDueAt, i18n.language)
      : null;
  const paidLabel =
    amountPaid != null && Number.isFinite(amountPaid)
      ? formatPriceAmount(amountPaid, currencyCode ?? 'USD')
      : null;

  let message: string;
  switch (status) {
    case 1:
      message = dueLabel
        ? t('reservationLookup.refund.owedWithDue', { amount: paidLabel ?? '', due: dueLabel })
        : t('reservationLookup.refund.owed', { amount: paidLabel ?? '' });
      break;
    case 2:
      message = t('reservationLookup.refund.partial');
      break;
    case 3:
      message = t('reservationLookup.refund.refunded');
      break;
    case 4:
      message = t('reservationLookup.refund.overdue');
      break;
    default:
      return null;
  }

  const tone =
    status === 3
      ? 'border-green-200 bg-green-50 text-green-900'
      : status === 4
        ? 'border-red-200 bg-red-50 text-red-900'
        : 'border-amber-200 bg-amber-50 text-amber-900';

  return (
    <div className={`rounded-lg border p-3 text-sm ${tone} ${className}`} role="status">
      {message}
    </div>
  );
};

export default RefundStatusNotice;
