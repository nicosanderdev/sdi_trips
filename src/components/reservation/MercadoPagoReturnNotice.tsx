import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getBookingPaymentStatusByManageToken } from '../../services/bookingService';
import type { BookingPaymentStatusResponse, GuestSiteListingType } from '../../types';
import { isGuestSiteListingType } from '../../core/config/guestSiteListingType';
import {
  getLiveManageToken,
  loadMercadoPagoPayHandoff,
} from '../../utils/mercadoPagoPayHandoff';
import {
  parseMercadoPagoListingReturn,
  type MercadoPagoReturnOutcome,
  type MercadoPagoReturnQuery,
} from '../../utils/mercadoPagoReturn';
import MercadoPagoPaySection from './MercadoPagoPaySection';

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 20_000;

const MESSAGE_KEYS: Record<Exclude<MercadoPagoReturnOutcome, 'unknown'>, string> = {
  abandoned: 'mercadoPago.listingReturn.abandoned',
  approved: 'mercadoPago.listingReturn.approved',
  pending: 'mercadoPago.listingReturn.pending',
  rejected: 'mercadoPago.listingReturn.rejected',
};

interface PayFacts {
  totalAmount: number | null;
  amountDue: number | null;
  amountPaid: number | null;
  depositAmount: number | null;
  dueAt: string | null;
  currencyCode: string | null;
  reservationCode?: string;
  listingType?: GuestSiteListingType;
}

function emptyPayFacts(): PayFacts {
  return {
    totalAmount: null,
    amountDue: null,
    amountPaid: null,
    depositAmount: null,
    dueAt: null,
    currencyCode: null,
  };
}

function isRejectedManageToken(result: Extract<BookingPaymentStatusResponse, { success: false }>): boolean {
  const message = `${result.error ?? ''} ${result.error_code ?? ''}`.toLowerCase();
  return message.includes('expired') || message.includes('invalid') || message.includes('missing token');
}

function toneClass(outcome: Exclude<MercadoPagoReturnOutcome, 'unknown'>): string {
  if (outcome === 'approved') return 'border-green-200 bg-green-50 text-green-900';
  if (outcome === 'rejected') return 'border-red-200 bg-red-50 text-red-900';
  return 'border-amber-200 bg-amber-50 text-amber-950';
}

/**
 * Read `mpReturn=1` once, then drop the query so refresh and share stay on the clean listing URL.
 * React state keeps the banner for this visit.
 */
export function useMercadoPagoListingReturn(cleanPath: string | null): MercadoPagoReturnQuery | null {
  const [snapshot] = useState(() => {
    if (typeof window === 'undefined') return null;
    return parseMercadoPagoListingReturn(new URLSearchParams(window.location.search));
  });

  useLayoutEffect(() => {
    if (!snapshot || !cleanPath) return;
    if (!window.location.search) return;
    window.history.replaceState(window.history.state, '', cleanPath);
  }, [snapshot, cleanPath]);

  return snapshot;
}

export interface MercadoPagoReturnNoticeProps {
  bookingId: string;
  outcome: MercadoPagoReturnOutcome;
  propertyId?: string;
  /**
   * Legacy result route shows the URL banner even when the stash cannot be checked.
   * The listing page only shows that banner when the stashed token matches `bookingId`.
   */
  trustUrlStatus?: boolean;
  /** Legacy route always links to reservation lookup beside the banner. */
  alwaysShowLookup?: boolean;
  className?: string;
}

const MercadoPagoReturnNotice: React.FC<MercadoPagoReturnNoticeProps> = ({
  bookingId,
  outcome,
  propertyId,
  trustUrlStatus = false,
  alwaysShowLookup = false,
  className = '',
}) => {
  const { t } = useTranslation();
  const [tokenOk, setTokenOk] = useState(() => {
    if (!bookingId) return false;
    const handoff = loadMercadoPagoPayHandoff(bookingId);
    return Boolean(getLiveManageToken(bookingId) && handoff?.bookingId === bookingId);
  });
  const [liveToken, setLiveToken] = useState<string | null>(() =>
    bookingId ? getLiveManageToken(bookingId) : null,
  );
  const [canPayOnline, setCanPayOnline] = useState(false);
  const [serverApproved, setServerApproved] = useState(false);
  const [polling, setPolling] = useState(false);
  const [payFacts, setPayFacts] = useState<PayFacts>(() => {
    const handoff = bookingId ? loadMercadoPagoPayHandoff(bookingId) : null;
    return {
      ...emptyPayFacts(),
      reservationCode: handoff?.reservationCode,
      listingType: handoff?.listingType,
    };
  });

  useEffect(() => {
    if (!bookingId || !tokenOk || !liveToken) return;
    if (outcome !== 'abandoned' && outcome !== 'rejected' && outcome !== 'pending' && outcome !== 'approved') {
      return;
    }

    let cancelled = false;
    let timer = 0;
    let resolveSleep: (() => void) | null = null;
    const startedAt = Date.now();
    const shouldPoll = outcome === 'pending' || outcome === 'approved';
    setPolling(shouldPoll);

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        resolveSleep = resolve;
        timer = window.setTimeout(resolve, ms);
      });

    const apply = (result: BookingPaymentStatusResponse): 'stop' | 'approved' | 'continue' => {
      if (!result.success) {
        if (isRejectedManageToken(result)) {
          setTokenOk(false);
          setLiveToken(null);
          setCanPayOnline(false);
          return 'stop';
        }
        return 'continue';
      }
      if (result.booking_id && result.booking_id !== bookingId) {
        setTokenOk(false);
        setLiveToken(null);
        setCanPayOnline(false);
        return 'stop';
      }
      setCanPayOnline(result.can_pay_online);
      setPayFacts((prev) => ({
        totalAmount: result.total_amount ?? null,
        amountDue: result.amount_due ?? result.amount,
        amountPaid: result.amount_paid ?? null,
        depositAmount: result.deposit_amount ?? null,
        dueAt: result.balance_due_at ?? result.deposit_deadline_at ?? null,
        currencyCode: result.currency_code,
        reservationCode: result.reservation_code ?? prev.reservationCode,
        listingType: prev.listingType,
      }));
      if (result.mercado_pago_approved) {
        setServerApproved(true);
        return 'approved';
      }
      return 'continue';
    };

    const run = async () => {
      while (!cancelled) {
        let step: 'stop' | 'approved' | 'continue' = 'continue';
        try {
          const result = await getBookingPaymentStatusByManageToken(liveToken);
          if (cancelled) return;
          step = apply(result);
        } catch {
          step = 'continue';
        }
        if (step === 'stop' || step === 'approved' || !shouldPoll) break;
        if (Date.now() - startedAt >= POLL_TIMEOUT_MS) break;
        await sleep(POLL_INTERVAL_MS);
      }
      if (!cancelled) setPolling(false);
    };

    void run();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      resolveSleep?.();
    };
  }, [bookingId, liveToken, outcome, tokenOk]);

  const displayOutcome: MercadoPagoReturnOutcome = serverApproved ? 'approved' : outcome;
  const showStatus = displayOutcome !== 'unknown' && (trustUrlStatus || tokenOk);
  const showLookup = alwaysShowLookup || !tokenOk || displayOutcome === 'unknown';
  const showPayAgain =
    tokenOk &&
    Boolean(liveToken) &&
    canPayOnline &&
    !serverApproved &&
    (outcome === 'abandoned' || outcome === 'rejected');

  if (!showStatus && !showLookup) return null;

  const handoff = bookingId ? loadMercadoPagoPayHandoff(bookingId) : null;
  const listingType =
    payFacts.listingType && isGuestSiteListingType(payFacts.listingType)
      ? payFacts.listingType
      : undefined;

  return (
    <div className={`space-y-3 ${className}`}>
      {showStatus && (
        <div role="status" className={`space-y-3 rounded-2xl border p-4 text-sm ${toneClass(displayOutcome)}`}>
          <p className="font-semibold">{t(MESSAGE_KEYS[displayOutcome])}</p>
          {polling && <p>{t('mercadoPago.return.polling')}</p>}
          {showPayAgain && liveToken && (
            <MercadoPagoPaySection
              className="text-left"
              bookingId={bookingId}
              canPayOnline={canPayOnline}
              totalAmount={payFacts.totalAmount}
              amountDue={payFacts.amountDue}
              amountPaid={payFacts.amountPaid}
              depositAmount={payFacts.depositAmount}
              dueAt={payFacts.dueAt}
              currencyCode={payFacts.currencyCode}
              manageToken={liveToken}
              manageExpiresAt={handoff?.manageExpiresAt}
              propertyId={propertyId ?? handoff?.propertyId}
              reservationCode={payFacts.reservationCode}
              listingType={listingType}
              showIntro={false}
              showAmountSummary={false}
            />
          )}
        </div>
      )}
      {showLookup && (
        <p>
          <Link
            to="/reservation-lookup"
            className="text-sm font-medium text-navy underline underline-offset-4 hover:text-gold"
          >
            {t('mercadoPago.listingReturn.checkReservation')}
          </Link>
        </p>
      )}
    </div>
  );
};

export default MercadoPagoReturnNotice;
