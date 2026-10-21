import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from '../ui';
import type { GuestSiteListingType } from '../../types';
import {
  createMercadoPagoPreference,
  resolveMercadoPagoCheckoutUrl,
} from '../../services/bookingService';
import { formatPriceAmount } from '../../services/pricing/formatPrice';
import { getAppVariant } from '../../core/config/guestSiteListingType';
import { isMercadoPagoPreferenceErrorCode } from '../../types/guestReviewContract';
import { clearMercadoPagoPayHandoff, saveMercadoPagoPayHandoff } from '../../utils/mercadoPagoPayHandoff';
import { formatReservationStayDate } from '../../utils/formatReservationStayDate';

type PaymentStateKey = 'notPaid' | 'depositPending' | 'depositPaid' | 'paid';

function resolvePaymentStateKey(options: {
  amountPaid?: number | null;
  depositAmount?: number | null;
  totalAmount?: number | null;
}): PaymentStateKey {
  const paid =
    options.amountPaid != null && Number.isFinite(options.amountPaid) ? options.amountPaid : 0;
  const total =
    options.totalAmount != null && Number.isFinite(options.totalAmount) ? options.totalAmount : null;
  const deposit =
    options.depositAmount != null && Number.isFinite(options.depositAmount)
      ? options.depositAmount
      : null;
  const hasPartialDeposit = deposit != null && (total == null || deposit + 0.009 < total);

  if (total != null && paid + 0.009 >= total) return 'paid';
  if (paid <= 0.009) return hasPartialDeposit ? 'depositPending' : 'notPaid';
  if (hasPartialDeposit && deposit != null && paid + 0.009 < deposit) return 'depositPending';
  return 'depositPaid';
}

export interface MercadoPagoPaySectionProps {
  bookingId: string;
  canPayOnline?: boolean;
  mercadoPagoApproved?: boolean;
  totalAmount?: number | null;
  amountDue?: number | null;
  amountPaid?: number | null;
  depositAmount?: number | null;
  paymentStatus?: number | null;
  dueAt?: string | null;
  currencyCode?: string | null;
  /** Required to start Checkout Pro. Without it, only paid/payable state is shown. */
  manageToken?: string;
  reservationCode?: string;
  listingType?: GuestSiteListingType;
  /** When true, show Pay now + Pay later (post-confirm). Otherwise Pay now only. */
  showPayLater?: boolean;
  onPayLater?: () => void;
  className?: string;
}

function mapPreferenceError(
  errorCode: string | undefined,
  httpStatus: number | undefined,
  fallback: string | undefined,
  t: (key: string) => string,
): string {
  if (httpStatus === 401) {
    return t('mercadoPago.errors.expiredToken');
  }
  if (isMercadoPagoPreferenceErrorCode(errorCode)) {
    return t(`mercadoPago.errors.${errorCode}`);
  }
  return fallback?.trim() || t('mercadoPago.errors.generic');
}

const MercadoPagoPaySection: React.FC<MercadoPagoPaySectionProps> = ({
  bookingId,
  canPayOnline,
  mercadoPagoApproved,
  totalAmount,
  amountDue,
  amountPaid,
  depositAmount,
  paymentStatus,
  dueAt,
  currencyCode,
  manageToken,
  reservationCode,
  listingType,
  showPayLater = false,
  onPayLater,
  className = '',
}) => {
  const { t, i18n } = useTranslation();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markedApproved, setMarkedApproved] = useState(false);
  const legalPath = getAppVariant() === 'alt' ? '/terms-and-conditions' : '/terms';

  const isApproved = Boolean(mercadoPagoApproved || markedApproved || paymentStatus === 1);
  const checkoutToken = manageToken?.trim() ?? '';
  const canStartCheckout = Boolean(canPayOnline && checkoutToken && !isApproved);

  const chargeAmount = useMemo(() => {
    if (amountDue != null && Number.isFinite(amountDue)) return amountDue;
    if (totalAmount != null && Number.isFinite(totalAmount)) return totalAmount;
    return null;
  }, [amountDue, totalAmount]);

  const isDepositPhase = useMemo(() => {
    if (depositAmount == null || !Number.isFinite(depositAmount)) return false;
    if (totalAmount != null && Number.isFinite(totalAmount) && depositAmount >= totalAmount - 0.009) {
      return false;
    }
    const paid = amountPaid ?? 0;
    return paid + 0.009 < depositAmount;
  }, [amountPaid, depositAmount, totalAmount]);

  const amountLabelKey = isDepositPhase
    ? 'mercadoPago.depositAmountLabel'
    : amountDue != null &&
        totalAmount != null &&
        amountDue + 0.009 < totalAmount
      ? 'mercadoPago.balanceAmountLabel'
      : 'mercadoPago.amountLabel';

  if (isApproved) {
    return (
      <div className={`rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900 ${className}`}>
        {t('mercadoPago.paymentRegistered')}
      </div>
    );
  }

  if (!canPayOnline) {
    return null;
  }

  const amountLabel =
    chargeAmount != null
      ? formatPriceAmount(chargeAmount, currencyCode ?? 'USD')
      : null;
  const paymentStateKey = resolvePaymentStateKey({ amountPaid, depositAmount, totalAmount });
  const dueLabel =
    dueAt != null ? formatReservationStayDate(dueAt, i18n.language) : null;

  const closeDisclaimer = () => {
    if (loading) return;
    setShowDisclaimer(false);
    setAgreed(false);
  };

  const handleConfirmPay = async () => {
    if (!checkoutToken) {
      setError(t('mercadoPago.errors.expiredToken'));
      return;
    }

    setLoading(true);
    setError(null);

    saveMercadoPagoPayHandoff({
      bookingId,
      manageToken: checkoutToken,
      reservationCode,
      listingType,
    });

    const result = await createMercadoPagoPreference({ manageToken: checkoutToken });
    if (!result.success) {
      setLoading(false);
      if (result.error_code === 'ALREADY_APPROVED') {
        setShowDisclaimer(false);
        setMarkedApproved(true);
        return;
      }
      if (result.httpStatus === 401) {
        clearMercadoPagoPayHandoff(bookingId);
      }
      setError(mapPreferenceError(result.error_code, result.httpStatus, result.error, t));
      return;
    }

    const checkoutUrl = resolveMercadoPagoCheckoutUrl(result);
    if (!checkoutUrl) {
      setLoading(false);
      setError(t('mercadoPago.errors.generic'));
      return;
    }

    window.location.assign(checkoutUrl);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-2 text-left text-sm text-charcoal">
        <p className="text-center text-base font-semibold text-navy">{t('mercadoPago.infoTitle')}</p>
        <p>{t('mercadoPago.infoBody')}</p>
        <p className="text-xs text-charcoal/80">{t('mercadoPago.infoFees')}</p>
      </div>

      {amountLabel && (
        <p className="text-sm text-charcoal">
          <span className="font-semibold">{t(amountLabelKey)}</span> {amountLabel}
          {!isDepositPhase && dueLabel ? (
            <> ({t('mercadoPago.balanceDueBy', { date: dueLabel })})</>
          ) : null}
        </p>
      )}

      <p className="text-sm text-charcoal">
        <span className="font-semibold">{t('mercadoPago.paymentState.label')}</span>{' '}
        {t(`mercadoPago.paymentState.${paymentStateKey}`)}
      </p>

      {canStartCheckout ? (
        <div className={`flex flex-wrap gap-3 ${showPayLater ? 'justify-center' : ''}`}>
          <Button
            variant="primary"
            className="bg-gold text-navy hover:bg-gold-dark"
            disabled={loading}
            onClick={() => {
              setError(null);
              setAgreed(false);
              setShowDisclaimer(true);
            }}
          >
            {loading ? t('mercadoPago.paying') : t('mercadoPago.payNow')}
          </Button>
          {showPayLater && (
            <Button variant="outline" disabled={loading} onClick={onPayLater}>
              {t('mercadoPago.payLater')}
            </Button>
          )}
        </div>
      ) : (
        <p className="text-sm text-charcoal/80">{t('mercadoPago.payableWithoutToken')}</p>
      )}

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <Modal
        isOpen={showDisclaimer}
        onClose={closeDisclaimer}
        title={t('mercadoPago.disclaimerTitle')}
      >
        <div className="space-y-4">
          <p className="text-sm text-charcoal">{t('mercadoPago.bridgeDisclaimer')}</p>
          <a
            href={legalPath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-medium text-navy underline underline-offset-4 hover:text-gold"
          >
            {t('mercadoPago.legalLink')}
          </a>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={loading}
              className="mt-1 rounded border-gray-300 text-gold focus:ring-gold"
            />
            <span className="text-sm text-charcoal">{t('mercadoPago.agreeLabel')}</span>
          </label>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              disabled={loading}
              onClick={closeDisclaimer}
            >
              {t('mercadoPago.cancel')}
            </Button>
            <Button
              variant="primary"
              className="bg-gold text-navy hover:bg-gold-dark"
              disabled={!agreed || loading}
              onClick={() => void handleConfirmPay()}
            >
              {loading ? t('mercadoPago.paying') : t('mercadoPago.continueToMercadoPago')}
            </Button>
          </div>
          {error && (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default MercadoPagoPaySection;
