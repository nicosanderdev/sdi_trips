import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { enUS, es, ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Button, Card } from '../ui';
import type { GuestExistingReview } from '../../types/guestReviewContract';
import type { ReservationLookupData } from '../../services/bookingService';
import { getGuestSiteListingType } from '../../core/config/guestSiteListingType';
import { getGuestReviewLookupState } from '../../core/services/guestReviewEligibility';
import { getGuestReviewWindow } from '../../core/services/guestReviewWindow';
import { formatReservationStayDate } from '../../utils/formatReservationStayDate';
import BookingPaymentFacts from './BookingPaymentFacts';
import GuestReservationReviewForm from './GuestReservationReviewForm';
import GuestReviewReadOnlyCard from './GuestReviewReadOnlyCard';
import HostContactSection from './HostContactSection';
import RefundStatusNotice from './RefundStatusNotice';
import RequestManageLinkForm from './RequestManageLinkForm';

const defaultPropertyPath = (propertyId: string) => `/property/${propertyId}`;

const DATE_FNS_LOCALES = { en: enUS, es, pt: ptBR } as const;

function formatReviewDate(date: Date, language: string): string {
  const locale = DATE_FNS_LOCALES[language as keyof typeof DATE_FNS_LOCALES] ?? enUS;
  return format(date, 'PPp', { locale });
}

interface ReservationDetailsProps {
  reservation: ReservationLookupData;
  /** Build destination URL for "View property" (default: `/property/:id`). */
  propertyPath?: (propertyId: string) => string;
  cardVariant?: 'default' | 'elevated' | 'glass' | 'surface';
}

const ReservationDetails: React.FC<ReservationDetailsProps> = ({
  reservation: reservationProp,
  propertyPath = defaultPropertyPath,
  cardVariant = 'default',
}) => {
  const { t, i18n } = useTranslation();
  const [localReservation, setLocalReservation] = useState(reservationProp);

  useEffect(() => {
    setLocalReservation(reservationProp);
  }, [reservationProp]);

  const reviewState = useMemo(
    () => getGuestReviewLookupState(localReservation),
    [localReservation],
  );

  const windowDates = useMemo(() => {
    const { windowStart, windowEnd } = getGuestReviewWindow(localReservation.checkOut);
    const serverEnd = localReservation.guestReviewWindowEnd
      ? new Date(localReservation.guestReviewWindowEnd)
      : windowEnd;
    return {
      checkOut: formatReviewDate(windowStart, i18n.language),
      windowEnd: formatReviewDate(serverEnd, i18n.language),
    };
  }, [localReservation.checkOut, localReservation.guestReviewWindowEnd, i18n.language]);

  const handleReviewSaved = (review: GuestExistingReview) => {
    setLocalReservation((prev) => ({
      ...prev,
      hasExistingReview: true,
      canSubmitGuestReview: false,
      canEditGuestReview: true,
      existingGuestReview: review,
    }));
  };

  const statusKey = `reservationLookup.status.${localReservation.status}`;
  const translatedStatus = t(statusKey);
  const statusLabel = translatedStatus === statusKey ? localReservation.status : translatedStatus;
  const formattedCheckIn = formatReservationStayDate(localReservation.checkIn, i18n.language);
  const formattedCheckOut = formatReservationStayDate(localReservation.checkOut, i18n.language);
  const listingType = localReservation.listingType ?? getGuestSiteListingType();

  const renderReviewBanner = () => {
    if (reviewState.kind === 'not_yet_open') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
          {t('reservationLookup.review.windowOpens', windowDates)}
        </div>
      );
    }
    if (reviewState.kind === 'create' || reviewState.kind === 'edit') {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-900">
          {t('reservationLookup.review.windowOpen', windowDates)}
        </div>
      );
    }
    if (reviewState.kind === 'expired') {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900" role="status">
          {t('reservationLookup.review.codeExpired')}
        </div>
      );
    }
    return null;
  };

  const renderReviewSection = () => {
    if (reviewState.kind === 'hidden') {
      return null;
    }

    const banner = renderReviewBanner();

    if (reviewState.kind === 'not_yet_open' || reviewState.kind === 'expired') {
      return banner ? (
        <Card variant={cardVariant} className="w-full max-w-2xl p-6">
          {banner}
        </Card>
      ) : null;
    }

    if (reviewState.kind === 'view_only') {
      return (
        <div className="space-y-4 w-full max-w-2xl">
          {banner}
          <GuestReviewReadOnlyCard review={reviewState.review} cardVariant={cardVariant} />
        </div>
      );
    }

    if (reviewState.kind === 'create' || reviewState.kind === 'edit') {
      return (
        <div className="space-y-4 w-full max-w-2xl">
          {banner}
          <GuestReservationReviewForm
            reservation={localReservation}
            mode={reviewState.kind}
            existingReview={reviewState.kind === 'edit' ? reviewState.review : undefined}
            cardVariant={cardVariant}
            onReviewSaved={handleReviewSaved}
          />
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Card variant={cardVariant} className="w-full max-w-2xl p-8 space-y-4">
        <h2 className="text-2xl font-semibold text-navy">{t('reservationLookup.details.title')}</h2>
        <p><span className="font-semibold">{t('reservationLookup.details.codeLabel')}</span> {localReservation.reservationCode}</p>
        <p><span className="font-semibold">{t('reservationLookup.details.propertyLabel')}</span> {localReservation.propertyTitle}</p>
        <p>
          <span className="font-semibold">{t('reservationLookup.details.datesLabel')}</span>{' '}
          {t('reservationLookup.details.datesValue', {
            checkIn: formattedCheckIn,
            checkOut: formattedCheckOut,
          })}
        </p>
        <p><span className="font-semibold">{t('reservationLookup.details.statusLabel')}</span> {statusLabel}</p>
        {localReservation.guests != null && (
          <p>
            <span className="font-semibold">{t('reservationLookup.details.guestsLabel')}</span>{' '}
            {t('reservationLookup.details.guestsCount', { count: localReservation.guests })}
          </p>
        )}
        {localReservation.guestName?.trim() ? (
          <p>
            <span className="font-semibold">{t('reservationLookup.details.guestLabel')}</span>{' '}
            {localReservation.guestName}
          </p>
        ) : null}
        {localReservation.guestEmail?.trim() ? (
          <p>
            <span className="font-semibold">{t('reservationLookup.details.emailLabel')}</span>{' '}
            {localReservation.guestEmail}
          </p>
        ) : null}
        {localReservation.guestPhone?.trim() ? (
          <p>
            <span className="font-semibold">{t('reservationLookup.details.phoneLabel')}</span>{' '}
            {localReservation.guestPhone}
          </p>
        ) : null}
        {!localReservation.guestName?.trim() &&
          !localReservation.guestEmail?.trim() &&
          !localReservation.guestPhone?.trim() && (
          <p>
            <span className="font-semibold">{t('reservationLookup.details.guestLabel')}</span>{' '}
            {t('reservationLookup.details.notAvailable')}
          </p>
        )}

        <HostContactSection
          status={localReservation.status}
          hostContact={localReservation.hostContact}
        />

        <BookingPaymentFacts
          totalAmount={localReservation.totalAmount}
          amountPaid={localReservation.amountPaid}
          amountDue={localReservation.amountDue}
          depositAmount={localReservation.depositAmount}
          paymentStatus={localReservation.paymentStatus}
          currencyCode={localReservation.currencyCode}
        />

        <RefundStatusNotice
          status={localReservation.refundStatus}
          amountPaid={localReservation.amountPaid}
          refundDueAt={localReservation.refundDueAt}
          currencyCode={localReservation.currencyCode}
          bookingStatus={localReservation.status}
        />

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <Link to={propertyPath(localReservation.propertyId)}>
            <Button variant="outline">{t('reservationLookup.actions.viewProperty')}</Button>
          </Link>
        </div>
      </Card>

      <RequestManageLinkForm
        key={`${localReservation.reservationCode}:${listingType}`}
        reservationCode={localReservation.reservationCode}
        listingType={listingType}
        defaultEmail={localReservation.guestEmail}
        cardVariant={cardVariant}
      />

      {renderReviewSection()}
    </>
  );
};

export default ReservationDetails;
