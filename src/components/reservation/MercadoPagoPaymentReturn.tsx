import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '../ui';
import { getBookingPaymentStatusByManageToken } from '../../services/bookingService';
import { buildGuestManageUrl } from '../../core/config/guestBookingManageUrl';
import { isGuestSiteListingType } from '../../core/config/guestSiteListingType';
import {
  clearMercadoPagoPayHandoff,
  getLiveManageToken,
  loadMercadoPagoPayHandoff,
} from '../../utils/mercadoPagoPayHandoff';
import MercadoPagoPaySection from './MercadoPagoPaySection';

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 40_000;

type PollState = 'polling' | 'approved' | 'pending' | 'failure' | 'timeout' | 'error';

interface MercadoPagoPaymentReturnProps {
  /** Layout chrome — main app wraps with Layout externally when needed. */
  cardVariant?: 'default' | 'elevated' | 'glass' | 'surface';
  /** Optional outer wrapper class for alt pages. */
  className?: string;
}

const MercadoPagoPaymentReturn: React.FC<MercadoPagoPaymentReturnProps> = ({
  cardVariant = 'default',
  className = '',
}) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const statusHint = (searchParams.get('status') ?? '').toLowerCase();
  const bookingId = searchParams.get('bookingId')?.trim() ?? '';

  const [pollState, setPollState] = useState<PollState>('polling');
  const [reservationCode, setReservationCode] = useState<string | null>(null);
  const [listingType, setListingType] = useState<string | undefined>(undefined);
  const [liveToken, setLiveToken] = useState<string | null>(null);
  const [canPayOnline, setCanPayOnline] = useState(false);
  const [payAmount, setPayAmount] = useState<number | null>(null);
  const [payCurrencyCode, setPayCurrencyCode] = useState<string | null>(null);

  const lookupHref = useMemo(() => {
    return buildGuestManageUrl({
      code: reservationCode ?? undefined,
      listingType: listingType && isGuestSiteListingType(listingType) ? listingType : undefined,
    });
  }, [reservationCode, listingType]);

  useEffect(() => {
    if (!bookingId) {
      setPollState('error');
      return;
    }

    const handoff = loadMercadoPagoPayHandoff(bookingId);
    if (handoff?.reservationCode) setReservationCode(handoff.reservationCode);
    if (handoff?.listingType) setListingType(handoff.listingType);

    const token = getLiveManageToken(bookingId);
    setLiveToken(token);

    if (!token) {
      setPollState(statusHint === 'failure' ? 'failure' : 'error');
      return;
    }

    let cancelled = false;
    const startedAt = Date.now();

    const pollOnce = async (): Promise<'approved' | 'cannot_pay' | 'expired' | 'continue'> => {
      const result = await getBookingPaymentStatusByManageToken(token);
      if (!result.success) {
        const message = (result.error ?? '').toLowerCase();
        if (message.includes('expired') || message.includes('invalid') || message.includes('missing token')) {
          setCanPayOnline(false);
          setLiveToken(null);
          return 'expired';
        }
        return 'continue';
      }

      if (result.reservation_code) setReservationCode(result.reservation_code);
      setPayAmount(result.amount);
      setPayCurrencyCode(result.currency_code);
      setCanPayOnline(result.can_pay_online);

      if (result.mercado_pago_approved) return 'approved';
      if (!result.can_pay_online) return 'cannot_pay';
      return 'continue';
    };

    const run = async () => {
      while (!cancelled && Date.now() - startedAt < POLL_TIMEOUT_MS) {
        try {
          const outcome = await pollOnce();
          if (cancelled) return;
          if (outcome === 'approved') {
            clearMercadoPagoPayHandoff(bookingId);
            setCanPayOnline(false);
            setPollState('approved');
            return;
          }
          if (outcome === 'cannot_pay') {
            setPollState(statusHint === 'failure' ? 'failure' : 'pending');
            return;
          }
          if (outcome === 'expired') {
            setPollState('error');
            return;
          }
        } catch {
          // keep polling until timeout
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }

      if (cancelled) return;
      if (statusHint === 'failure') {
        setPollState('failure');
      } else if (statusHint === 'pending' || statusHint === 'success') {
        setPollState('timeout');
      } else {
        setPollState('pending');
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [bookingId, statusHint]);

  const titleKey =
    pollState === 'approved'
      ? 'mercadoPago.return.approvedTitle'
      : pollState === 'failure'
        ? 'mercadoPago.return.failureTitle'
        : pollState === 'timeout'
          ? 'mercadoPago.return.timeoutTitle'
          : pollState === 'error'
            ? 'mercadoPago.return.errorTitle'
            : 'mercadoPago.return.pendingTitle';

  const bodyKey =
    pollState === 'approved'
      ? 'mercadoPago.return.approvedBody'
      : pollState === 'failure'
        ? 'mercadoPago.return.failureBody'
        : pollState === 'timeout'
          ? 'mercadoPago.return.timeoutBody'
          : pollState === 'error'
            ? 'mercadoPago.return.errorBody'
            : 'mercadoPago.return.pendingBody';

  const showPayAgain =
    pollState !== 'polling' &&
    pollState !== 'approved' &&
    Boolean(liveToken && canPayOnline);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Card variant={cardVariant} className="w-full max-w-2xl p-8 space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-navy">{t(titleKey)}</h1>
        <p className="text-sm text-charcoal">{t(bodyKey)}</p>
        {pollState === 'polling' && (
          <p className="text-sm text-charcoal/80">{t('mercadoPago.return.polling')}</p>
        )}
        {showPayAgain && bookingId && liveToken && (
          <MercadoPagoPaySection
            className="text-left"
            bookingId={bookingId}
            canPayOnline={canPayOnline}
            totalAmount={payAmount}
            currencyCode={payCurrencyCode}
            manageToken={liveToken}
            reservationCode={reservationCode ?? undefined}
            listingType={listingType && isGuestSiteListingType(listingType) ? listingType : undefined}
          />
        )}
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link to={lookupHref}>
            <Button variant="primary" className="bg-gold text-navy hover:bg-gold-dark">
              {t('mercadoPago.return.viewReservation')}
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline">{t('mercadoPago.return.goHome')}</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default MercadoPagoPaymentReturn;
