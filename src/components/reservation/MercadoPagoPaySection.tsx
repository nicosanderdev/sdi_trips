import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from '../ui';
import type { CreateMercadoPagoPreferenceRequest, GuestSiteListingType } from '../../types';
import {
  createMercadoPagoPreference,
  resolveMercadoPagoCheckoutUrl,
} from '../../services/bookingService';
import { formatPriceAmount } from '../../services/pricing/formatPrice';
import { isMercadoPagoPreferenceErrorCode } from '../../types/guestReviewContract';
import { saveMercadoPagoPayHandoff } from '../../utils/mercadoPagoPayHandoff';

export interface MercadoPagoPaySectionProps {
  bookingId: string;
  canPayOnline?: boolean;
  mercadoPagoApproved?: boolean;
  totalAmount?: number | null;
  currencyCode?: string | null;
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
  fallback: string | undefined,
  t: (key: string) => string,
): string {
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
  currencyCode,
  manageToken,
  reservationCode,
  listingType,
  showPayLater = false,
  onPayLater,
  className = '',
}) => {
  const { t } = useTranslation();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (mercadoPagoApproved) {
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
    totalAmount != null && Number.isFinite(totalAmount)
      ? formatPriceAmount(totalAmount, currencyCode ?? 'USD')
      : null;

  const buildRequest = (): CreateMercadoPagoPreferenceRequest | null => {
    if (manageToken?.trim()) {
      return { manageToken: manageToken.trim() };
    }
    if (reservationCode?.trim() && listingType) {
      return { reservationCode: reservationCode.trim(), listingType };
    }
    return null;
  };

  const handleConfirmPay = async () => {
    const request = buildRequest();
    if (!request) {
      setError(t('mercadoPago.errors.generic'));
      return;
    }

    setLoading(true);
    setError(null);

    saveMercadoPagoPayHandoff({
      bookingId,
      manageToken,
      reservationCode,
      listingType,
    });

    const result = await createMercadoPagoPreference(request);
    if (!result.success) {
      setLoading(false);
      setError(mapPreferenceError(result.error_code, result.error, t));
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
      {amountLabel && (
        <p className="text-sm text-charcoal">
          <span className="font-semibold">{t('mercadoPago.amountLabel')}</span> {amountLabel}
        </p>
      )}

      <div className={`flex flex-wrap gap-3 ${showPayLater ? 'justify-center' : ''}`}>
        <Button
          variant="primary"
          className="bg-gold text-navy hover:bg-gold-dark"
          disabled={loading}
          onClick={() => {
            setError(null);
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

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <Modal
        isOpen={showDisclaimer}
        onClose={() => {
          if (loading) return;
          setShowDisclaimer(false);
        }}
        title={t('mercadoPago.disclaimerTitle')}
      >
        <div className="space-y-4">
          <p className="text-sm text-charcoal">{t('mercadoPago.bridgeDisclaimer')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => setShowDisclaimer(false)}
            >
              {t('mercadoPago.cancel')}
            </Button>
            <Button
              variant="primary"
              className="bg-gold text-navy hover:bg-gold-dark"
              disabled={loading}
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
