import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from '../ui';
import type { CancellationPreview, CancellationPreviewResponse } from '../../types';
import type { CancelBookingResponse } from '../../services/bookingService';
import { formatPriceAmount } from '../../services/pricing/formatPrice';
import { formatReservationStayDate } from '../../utils/formatReservationStayDate';

export interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  loadPreview: () => Promise<CancellationPreviewResponse>;
  confirm: (previewHash: string) => Promise<CancelBookingResponse>;
  currencyCode?: string | null;
  onSuccess?: (preview: CancellationPreview) => void;
}

const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  onClose,
  loadPreview,
  confirm,
  currencyCode,
  onSuccess,
}) => {
  const { t, i18n } = useTranslation();
  const [preview, setPreview] = useState<CancellationPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mismatchNotice, setMismatchNotice] = useState(false);

  const refreshPreview = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await loadPreview();
    setLoading(false);
    if (!result.success) {
      setPreview(null);
      setError(result.error ?? t('reservationLookup.cancelPreview.loadFailed'));
      return;
    }
    setPreview(result);
  }, [loadPreview, t]);

  useEffect(() => {
    if (!isOpen) {
      setPreview(null);
      setError(null);
      setMismatchNotice(false);
      setConfirming(false);
      return;
    }
    void refreshPreview();
  }, [isOpen, refreshPreview]);

  const handleConfirm = async () => {
    if (!preview?.previewHash || confirming) return;
    setConfirming(true);
    setError(null);
    const result = await confirm(preview.previewHash);
    if (!result.success) {
      setConfirming(false);
      if (result.error_code === 'PREVIEW_MISMATCH') {
        setMismatchNotice(true);
        await refreshPreview();
        setError(t('reservationLookup.cancelPreview.previewChanged'));
        return;
      }
      setError(result.error ?? t('reservationLookup.errors.cancelFailed'));
      return;
    }
    const successPreview = result.preview ?? preview;
    onSuccess?.(successPreview);
    setConfirming(false);
    onClose();
  };

  const amountLabel = (amount: number) =>
    formatPriceAmount(amount, currencyCode ?? 'USD');

  const tierLabel = preview
    ? t(`reservationLookup.cancelPreview.tier.${preview.policyTier}`, {
        defaultValue: preview.policyTier,
      })
    : '';

  const refundDueLabel =
    preview?.refundDueAt != null
      ? formatReservationStayDate(preview.refundDueAt, i18n.language)
      : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (confirming || loading) return;
        onClose();
      }}
      title={t('reservationLookup.cancelPreview.title')}
    >
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
          {t('reservationLookup.cancelPreview.cannotUndo')}
        </div>

        {loading && (
          <p className="text-sm text-charcoal">{t('reservationLookup.cancelPreview.loading')}</p>
        )}

        {!loading && preview && (
          <div className="space-y-2 text-sm text-charcoal">
            {mismatchNotice && (
              <p className="text-amber-800" role="status">
                {t('reservationLookup.cancelPreview.previewChanged')}
              </p>
            )}
            <p>
              <span className="font-semibold">{t('reservationLookup.cancelPreview.tierLabel')}</span>{' '}
              {tierLabel}
            </p>
            <p>
              <span className="font-semibold">{t('reservationLookup.cancelPreview.amountPaid')}</span>{' '}
              {amountLabel(preview.amountPaid)}
            </p>
            <p>
              <span className="font-semibold">{t('reservationLookup.cancelPreview.refundPercent')}</span>{' '}
              {preview.refundPercent}%
            </p>
            <p>
              <span className="font-semibold">{t('reservationLookup.cancelPreview.refundAmount')}</span>{' '}
              {amountLabel(preview.refundAmount)}
            </p>
            {refundDueLabel && preview.refundAmount > 0.009 && (
              <p>
                <span className="font-semibold">{t('reservationLookup.cancelPreview.refundDueAt')}</span>{' '}
                {refundDueLabel}
              </p>
            )}
            {!preview.canCancel && preview.message && (
              <p className="text-red-700" role="alert">
                {preview.message}
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={confirming || loading}
          >
            {t('reservationLookup.cancelPreview.dismiss')}
          </Button>
          <Button
            variant="primary"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => void handleConfirm()}
            disabled={confirming || loading || !preview?.canCancel || !preview.previewHash}
          >
            {confirming
              ? t('reservationLookup.actions.cancelling')
              : t('reservationLookup.cancelPreview.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CancelBookingModal;
