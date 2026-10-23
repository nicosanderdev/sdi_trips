import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePaymentStateKey } from '../../core/services/bookingPaymentState';
import { formatPriceAmount } from '../../services/pricing/formatPrice';

interface BookingPaymentFactsProps {
  totalAmount?: number | null;
  amountPaid?: number | null;
  amountDue?: number | null;
  depositAmount?: number | null;
  paymentStatus?: number | null;
  currencyCode?: string | null;
}

function isFiniteNumber(value: number | null | undefined): value is number {
  return value != null && Number.isFinite(value);
}

const BookingPaymentFacts: React.FC<BookingPaymentFactsProps> = ({
  totalAmount,
  amountPaid,
  amountDue,
  depositAmount,
  paymentStatus,
  currencyCode,
}) => {
  const { t } = useTranslation();
  const currency = currencyCode?.trim() || 'USD';
  const hasTotal = isFiniteNumber(totalAmount);
  const hasPaid = isFiniteNumber(amountPaid);
  const hasDue = isFiniteNumber(amountDue);
  const hasStatus = paymentStatus != null || hasTotal || hasPaid || hasDue || isFiniteNumber(depositAmount);

  if (!hasStatus) return null;

  const stateKey = resolvePaymentStateKey({
    amountPaid,
    depositAmount,
    totalAmount,
    paymentStatus,
  });

  return (
    <div className="space-y-1">
      {hasTotal && (
        <p>
          <span className="font-semibold">{t('reservationLookup.details.totalLabel')}</span>{' '}
          {formatPriceAmount(totalAmount, currency)}
        </p>
      )}
      {hasPaid && (
        <p>
          <span className="font-semibold">{t('reservationLookup.details.amountPaidLabel')}</span>{' '}
          {formatPriceAmount(amountPaid, currency)}
        </p>
      )}
      {hasDue && (
        <p>
          <span className="font-semibold">{t('reservationLookup.details.amountDueLabel')}</span>{' '}
          {formatPriceAmount(amountDue, currency)}
        </p>
      )}
      <p>
        <span className="font-semibold">{t('mercadoPago.paymentState.label')}</span>{' '}
        {t(`mercadoPago.paymentState.${stateKey}`)}
      </p>
    </div>
  );
};

export default BookingPaymentFacts;
