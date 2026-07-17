import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BookingDatePicker from './BookingDatePicker';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/config';
import { Button, Modal, SixDigitCodeInput } from '../ui';
import { isValidTOTPSecret } from '../../core/services/mfaService';
import { buildGuestManageUrl } from '../../core/config/guestBookingManageUrl';
import { getGuestSiteListingType, isGuestSiteListingType } from '../../core/config/guestSiteListingType';
import type { GuestSiteListingType, OtpChannel, Property } from '../../types';
import type { MercadoPagoBookingEligibility } from '../../types/guestReviewContract';
import { validateBookingSelection } from '../../services/availabilityService';
import {
  confirmGuestBooking,
  createBookingHold,
  reconfirmHold,
  sendGuestOtp,
  validateGuestBookingOverlap,
  verifyGuestOtp,
} from '../../services/bookingService';
import { useDisplayPrice } from '../../hooks/useDisplayPrice';
import {
  formatPriceAmount,
  getPriceLabelKey,
} from '../../services/pricing/formatPrice';
import { isGuestBookingOverlapError, isPriceQuoteMismatchError } from '../../types/guestReviewContract';
import {
  buildInternationalPhone,
  isValidLocalPhone,
  SUPPORTED_PHONE_COUNTRIES,
  type PhoneCountryCode,
} from '../../utils/phoneCountries';
import MercadoPagoPaySection from '../reservation/MercadoPagoPaySection';

type BookingStep = 'dates' | 'guest' | 'otp' | 'confirming' | 'done';
type BookingMode = 'singleNight' | 'multipleDays';
type BookingFlowVariant = 'rental' | 'event';

interface GuestBookingFlowProps {
  property: Property;
  /** Base path for the post-booking lookup page (`?code=` appended when available). Default: `/reservation-lookup`. */
  reservationManagePath?: string;
  /** `event` enables alt-site copy and phone prefix UI. Default: `rental`. */
  variant?: BookingFlowVariant;
  /** Pre-selected check-in date (e.g. from search URL). */
  initialCheckIn?: Date | null;
  /** Pre-selected check-out date (e.g. from search URL). */
  initialCheckOut?: Date | null;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

function resolveHoldListingType(property: Property): GuestSiteListingType {
  const fromProperty = property.listingType;
  if (fromProperty && isGuestSiteListingType(fromProperty)) {
    return fromProperty;
  }
  return getGuestSiteListingType();
}

const GuestBookingFlow: React.FC<GuestBookingFlowProps> = ({
  property,
  variant = 'rental',
  initialCheckIn = null,
  initialCheckOut = null,
}) => {
  const { t } = useTranslation();
  const isEvent = variant === 'event';

  const bookingT = useCallback(
    (key: string) => {
      const altKey = `alt.bookingFlow.${key}`;
      if (isEvent && i18n.exists(altKey)) {
        return t(altKey);
      }
      return t(`propertyDetail.bookingFlow.${key}`);
    },
    [isEvent, t],
  );

  const [step, setStep] = useState<BookingStep>('dates');
  const [checkIn, setCheckIn] = useState<Date | null>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<Date | null>(initialCheckOut);
  const [bookingMode, setBookingMode] = useState<BookingMode>(() =>
    variant === 'event' ? 'singleNight' : 'multipleDays',
  );
  const [estimatedGuests, setEstimatedGuests] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [holdId, setHoldId] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountryCode>('UY');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpChannel, setOtpChannel] = useState<OtpChannel | null>(null);
  const [reservationCode, setReservationCode] = useState<string | null>(null);
  const [confirmedListingType, setConfirmedListingType] = useState<GuestSiteListingType | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [confirmedManageToken, setConfirmedManageToken] = useState<string | null>(null);
  const [confirmedTotalAmount, setConfirmedTotalAmount] = useState<number | null>(null);
  const [confirmedCurrencyCode, setConfirmedCurrencyCode] = useState<string | null>(null);
  const [confirmedMercadoPago, setConfirmedMercadoPago] = useState<MercadoPagoBookingEligibility | null>(
    null,
  );
  const [flowError, setFlowError] = useState<string | null>(null);
  const [overlapError, setOverlapError] = useState<string | null>(null);
  const [overlapChecking, setOverlapChecking] = useState(false);

  const fullPhone = useMemo(() => {
    if (isEvent) {
      return buildInternationalPhone(phoneCountry, phoneLocal);
    }
    return phone.trim();
  }, [isEvent, phone, phoneCountry, phoneLocal]);

  const canValidate = Boolean(checkIn && checkOut);

  const resolveBookingError = useCallback(
    (error: string | null | undefined, fallbackKey: string) => {
      if (!error) return bookingT(fallbackKey);
      if (error.startsWith('propertyDetail.') || error.startsWith('alt.')) {
        return t(error);
      }
      const relativeKey = error.startsWith('errors.') ? error : `errors.${error}`;
      const mainKey = `propertyDetail.bookingFlow.${relativeKey}`;
      const altKey = `alt.bookingFlow.${relativeKey}`;
      if ((isEvent && i18n.exists(altKey)) || i18n.exists(mainKey)) {
        return bookingT(relativeKey);
      }
      return bookingT(fallbackKey);
    },
    [bookingT, isEvent, t],
  );

  useEffect(() => {
    let cancelled = false;
    if (!canValidate || !checkIn || !checkOut) {
      const resetTimer = window.setTimeout(() => {
        setValidationError(null);
      }, 0);
      return () => window.clearTimeout(resetTimer);
    }

    const timer = window.setTimeout(async () => {
      setValidationLoading(true);
      const result = await validateBookingSelection(property.id, checkIn, checkOut, 1);
      if (!cancelled) {
        setValidationError(
          result.isValid
            ? null
            : resolveBookingError(result.errors[0], 'errors.invalidDateSelection'),
        );
      }
      setValidationLoading(false);
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [canValidate, checkIn, checkOut, property.id, resolveBookingError]);

  useEffect(() => {
    let cancelled = false;
    const trimmedEmail = email.trim();
    if (step !== 'guest' || !checkIn || !checkOut || !EMAIL_PATTERN.test(trimmedEmail)) {
      const resetTimer = window.setTimeout(() => {
        setOverlapError(null);
        setOverlapChecking(false);
      }, 0);
      return () => window.clearTimeout(resetTimer);
    }

    const timer = window.setTimeout(async () => {
      setOverlapChecking(true);
      const result = await validateGuestBookingOverlap({
        email: trimmedEmail,
        checkIn,
        checkOut,
      });
      if (!cancelled) {
        if (
          !result.success ||
          result.hasOverlap ||
          isGuestBookingOverlapError(result.error_code)
        ) {
          setOverlapError(
            isGuestBookingOverlapError(result.error_code) || result.hasOverlap
              ? bookingT('errors.guestBookingOverlap')
              : resolveBookingError(result.error, 'errors.couldNotConfirmReservation'),
          );
        } else {
          setOverlapError(null);
        }
        setOverlapChecking(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [step, email, checkIn, checkOut, bookingT, resolveBookingError]);

  useEffect(() => {
    if (!holdExpiresAt) {
      return;
    }

    const update = () => {
      const remaining = Math.max(0, Math.floor((new Date(holdExpiresAt).getTime() - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining === 0 && step !== 'done') {
        setFlowError(bookingT('errors.holdExpired'));
        setStep('dates');
      }
    };

    const kickoff = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 1000);
    return () => {
      window.clearTimeout(kickoff);
      window.clearInterval(interval);
    };
  }, [holdExpiresAt, step, bookingT]);

  const countdownLabel = useMemo(() => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [countdown]);

  const isGuestFormValid = useMemo(() => {
    if (!firstName.trim() || !lastName.trim()) return false;
    const trimmedEmail = email.trim();
    if (trimmedEmail && !EMAIL_PATTERN.test(trimmedEmail)) return false;
    if (isEvent) {
      if (!isValidLocalPhone(phoneLocal)) return false;
      if (!PHONE_PATTERN.test(fullPhone)) return false;
    } else if (!PHONE_PATTERN.test(fullPhone)) {
      return false;
    }
    return true;
  }, [firstName, lastName, fullPhone, phoneLocal, email, isEvent]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  }, [checkIn, checkOut]);

  const { breakdown, loading: priceLoading, error: priceError } = useDisplayPrice({
    property,
    checkIn,
    checkOut,
    siteListingType: resolveHoldListingType(property),
  });

  const totalPrice =
    breakdown?.total ?? nights * (property.basePrice ?? property.price ?? 0);

  const priceSummaryLabel = breakdown
    ? t(getPriceLabelKey(breakdown.displayLabel))
    : null;
  const formattedTotal = breakdown
    ? formatPriceAmount(breakdown.total, property.currency)
    : null;

  const addDays = (date: Date, days: number): Date => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  };

  const handleCreateHold = async () => {
    if (!checkIn || !checkOut || validationError) return;
    setActionLoading(true);
    setFlowError(null);
    const response = await createBookingHold({
      propertyId: property.id,
      checkIn,
      checkOut,
      blockedCheckOut: addDays(checkOut, 1),
      guests: 1,
      estimatedGuests: estimatedGuests.trim() ? Number(estimatedGuests) : undefined,
      idempotencyKey: `${property.id}-${checkIn.toISOString()}-${checkOut.toISOString()}-${bookingMode}`,
      listingType: resolveHoldListingType(property),
      clientTotal: totalPrice,
    });
    setActionLoading(false);

    if (!response.success || !response.hold) {
      if (isPriceQuoteMismatchError(response.errorCode)) {
        const serverTotal = response.validation?.pricing?.total_price;
        setFlowError(
          serverTotal != null
            ? t('propertyDetail.bookingFlow.errors.priceQuoteMismatchWithTotal', {
                total: formatPriceAmount(serverTotal, property.currency),
              })
            : bookingT('errors.priceQuoteMismatch'),
        );
      } else {
        setFlowError(resolveBookingError(response.error, 'errors.unableToCreateHold'));
      }
      return;
    }

    setHoldId(response.hold.id);
    setHoldExpiresAt(response.hold.expiresAt);
    setOverlapError(null);
    setStep('guest');
  };

  const handleSendOtp = async () => {
    if (!holdId || overlapError || overlapChecking) return;
    setActionLoading(true);
    setFlowError(null);
    const result = await sendGuestOtp(holdId, fullPhone);
    setActionLoading(false);
    if (!result.success) {
      setFlowError(
        resolveBookingError(
          result.error,
          isEvent ? 'errors.couldNotSendConfirmationCode' : 'errors.couldNotSendOtp',
        ),
      );
      return;
    }
    setOtpChannel(result.channel ?? null);
    setOtpCode('');
    setStep('otp');
  };

  const handleVerifyOtp = async () => {
    if (!holdId) return;
    setActionLoading(true);
    setFlowError(null);
    const verifyResult = await verifyGuestOtp(holdId, fullPhone, otpCode.trim());
    if (!verifyResult.success) {
      setActionLoading(false);
      setFlowError(
        resolveBookingError(
          verifyResult.error,
          isEvent ? 'errors.invalidConfirmationCode' : 'errors.invalidOtp',
        ),
      );
      return;
    }

    const reconfirmResult = await reconfirmHold(holdId);
    if (!reconfirmResult.success) {
      setActionLoading(false);
      setFlowError(resolveBookingError(reconfirmResult.error, 'errors.holdNoLongerValid'));
      setStep('dates');
      return;
    }

    setStep('confirming');
    const confirmResult = await confirmGuestBooking({
      holdId,
      profile: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: fullPhone,
        documentId: documentId.trim() || undefined,
        estimatedGuests: estimatedGuests.trim() ? Number(estimatedGuests) : undefined,
        totalPrice,
      },
    });
    setActionLoading(false);

    if (!confirmResult.success) {
      if (isGuestBookingOverlapError(confirmResult.errorCode)) {
        setOverlapError(bookingT('errors.guestBookingOverlap'));
        setFlowError(null);
      } else {
        setFlowError(
          resolveBookingError(confirmResult.error, 'errors.couldNotConfirmReservation'),
        );
        setOverlapError(null);
      }
      setStep('guest');
      return;
    }

    setReservationCode(confirmResult.reservationCode ?? null);
    setConfirmedBookingId(confirmResult.bookingId ?? null);
    setConfirmedManageToken(confirmResult.manageToken ?? null);
    setConfirmedTotalAmount(confirmResult.totalAmount ?? null);
    setConfirmedCurrencyCode(confirmResult.currencyCode ?? null);
    setConfirmedMercadoPago(confirmResult.mercadoPago ?? null);
    setConfirmedListingType(
      confirmResult.listingType && isGuestSiteListingType(confirmResult.listingType)
        ? confirmResult.listingType
        : resolveHoldListingType(property),
    );
    setStep('done');
  };

  const lookupHref = useMemo(() => {
    return buildGuestManageUrl({
      code: reservationCode ?? undefined,
      listingType: confirmedListingType ?? resolveHoldListingType(property),
    });
  }, [reservationCode, confirmedListingType, property]);

  const lookupIsExternal = /^https?:\/\//i.test(lookupHref);

  const otpChannelHint = useMemo(() => {
    if (!otpChannel) return null;
    if (otpChannel === 'whatsapp') return bookingT('otpHint.whatsapp');
    if (otpChannel === 'sms_fallback') return bookingT('otpHint.sms');
    if (otpChannel === 'local_mock') return bookingT('otpHint.localMock');
    return null;
  }, [otpChannel, bookingT]);

  const handleCloseSuccess = () => {
    setStep('dates');
    setReservationCode(null);
    setConfirmedListingType(null);
    setConfirmedBookingId(null);
    setConfirmedManageToken(null);
    setConfirmedTotalAmount(null);
    setConfirmedCurrencyCode(null);
    setConfirmedMercadoPago(null);
    setOtpChannel(null);
    setHoldId(null);
    setHoldExpiresAt(null);
    setCheckIn(null);
    setCheckOut(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setPhoneLocal('');
    setDocumentId('');
    setEstimatedGuests('');
    setOtpCode('');
    setFlowError(null);
    setOverlapError(null);
  };

  const handlePayLater = () => {
    const href = lookupHref;
    handleCloseSuccess();
    window.location.assign(href);
  };

  const continueButtonLabel = isEvent
    ? bookingT('actions.continue')
    : bookingT('actions.continueAsGuest');

  const sendCodeLabel = isEvent
    ? bookingT('actions.sendConfirmationCode')
    : bookingT('actions.sendOtpCode');

  const codePlaceholder = isEvent
    ? bookingT('form.enterConfirmationCode')
    : bookingT('form.enterOtp');

  const phonePlaceholder = bookingT('form.phone');

  return (
    <div className="space-y-4">
      {isEvent && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-navy">{bookingT('bookingModeLabel')}</label>
          <select
            value={bookingMode}
            onChange={(e) => {
              const nextMode = e.target.value as BookingMode;
              setBookingMode(nextMode);
              setCheckIn(null);
              setCheckOut(null);
              setValidationError(null);
            }}
            className="w-full rounded-2xl border border-warm-gray bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="singleNight">{bookingT('bookingModes.singleNight')}</option>
            <option value="multipleDays">{bookingT('bookingModes.multipleDays')}</option>
          </select>
          {bookingMode === 'singleNight' && (
            <p className="text-xs text-charcoal/80">{bookingT('singleNightHint')}</p>
          )}
        </div>
      )}

      <BookingDatePicker
        propertyId={property.id}
        bookingMode={bookingMode}
        checkIn={checkIn}
        checkOut={checkOut}
        onCheckInChange={setCheckIn}
        onCheckOutChange={setCheckOut}
        minStayDays={property.minStayDays}
        maxStayDays={property.maxStayDays}
        leadTimeDays={property.leadTimeDays}
        bufferDays={property.bufferDays}
      />

      {holdExpiresAt && step !== 'done' && (
        <p className="text-xs text-charcoal">
          {bookingT('holdActiveFor')}{' '}
          <span className="font-semibold">{countdownLabel}</span>
        </p>
      )}
      {validationLoading && <p className="text-xs text-charcoal">{bookingT('checkingAvailability')}</p>}
      {priceLoading && checkIn && checkOut && (
        <p className="text-xs text-charcoal">{bookingT('calculatingPrice')}</p>
      )}
      {priceError && <p className="text-xs text-red-600">{priceError}</p>}
      {breakdown && checkIn && checkOut && !priceLoading && (
        <div className="rounded-2xl border border-warm-gray bg-white/80 px-4 py-3 text-sm text-charcoal space-y-1">
          <p className="font-medium text-navy">
            {priceSummaryLabel}: {formattedTotal}
          </p>
          {nights > 1 && (
            <p className="text-xs">
              {t('propertyDetail.bookingFlow.priceSummary.nights', { count: nights })}
              {' · '}
              {t('propertyDetail.bookingFlow.priceSummary.avgPerNight', {
                amount: formatPriceAmount(breakdown.nightlyAverage, property.currency),
              })}
            </p>
          )}
          {breakdown.stayFactor < 1 && (
            <p className="text-xs text-green-700">
              {bookingT('priceSummary.longStayApplied')}
            </p>
          )}
        </div>
      )}
      {validationError && <p className="text-xs text-red-600">{validationError}</p>}
      {flowError && <p className="text-xs text-red-600">{flowError}</p>}

      {step === 'dates' && (
        <Button
          variant="primary"
          size="lg"
          className="w-full bg-gold text-navy hover:bg-gold-dark"
          disabled={
            !checkIn ||
            !checkOut ||
            !!validationError ||
            actionLoading ||
            priceLoading ||
            !breakdown
          }
          onClick={handleCreateHold}
        >
          {actionLoading
            ? bookingT('actions.creatingHold')
            : continueButtonLabel}
        </Button>
      )}

      <Modal
        isOpen={step === 'guest' || step === 'otp' || step === 'confirming'}
        onClose={() => {
          if (!actionLoading) {
            setOtpCode('');
            setOverlapError(null);
            setStep('dates');
          }
        }}
        title={bookingT('modal.title')}
        size="md"
      >
        {step === 'guest' && (
          <div className="space-y-3">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={bookingT('form.firstName')}
              className="w-full rounded-2xl border border-warm-gray bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={bookingT('form.lastName')}
              className="w-full rounded-2xl border border-warm-gray bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={bookingT('form.email')}
              className="w-full rounded-2xl border border-warm-gray bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
            />
            {isEvent ? (
              <div className="flex gap-2">
                <select
                  value={phoneCountry}
                  onChange={(e) => setPhoneCountry(e.target.value as PhoneCountryCode)}
                  className="w-28 shrink-0 rounded-2xl border border-warm-gray bg-white px-2 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
                  aria-label={phonePlaceholder}
                >
                  {SUPPORTED_PHONE_COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.dialCode}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phoneLocal}
                  onChange={(e) => setPhoneLocal(e.target.value.replace(/\D/g, ''))}
                  placeholder={phonePlaceholder}
                  className="min-w-0 flex-1 rounded-2xl border border-warm-gray bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
            ) : (
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={phonePlaceholder}
                className="w-full rounded-2xl border border-warm-gray bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
              />
            )}
            <input
              type="text"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              placeholder={bookingT('form.documentIdOptional')}
              className="w-full rounded-2xl border border-warm-gray bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <input
              type="number"
              min={1}
              max={property.maxGuests || 2000}
              value={estimatedGuests}
              onChange={(e) => setEstimatedGuests(e.target.value)}
              placeholder={bookingT('form.estimatedGuests')}
              className="w-full rounded-2xl border border-warm-gray bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
            />
            {overlapChecking && (
              <p className="text-xs text-charcoal">{bookingT('checkingAvailability')}</p>
            )}
            {overlapError && <p className="text-xs text-red-600">{overlapError}</p>}
            <Button
              variant="primary"
              size="lg"
              className="w-full bg-gold text-navy hover:bg-gold-dark"
              disabled={!isGuestFormValid || actionLoading || !!overlapError || overlapChecking}
              onClick={handleSendOtp}
            >
              {actionLoading
                ? bookingT('actions.sendingCode')
                : sendCodeLabel}
            </Button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-3">
            {otpChannelHint && (
              <p className="text-xs text-charcoal">{otpChannelHint}</p>
            )}
            {overlapError && <p className="text-xs text-red-600">{overlapError}</p>}
            <SixDigitCodeInput
              value={otpCode}
              onChange={setOtpCode}
              disabled={actionLoading}
              ariaLabel={codePlaceholder}
              autoFocus
            />
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="w-full rounded-2xl"
                onClick={handleSendOtp}
                disabled={actionLoading}
              >
                {bookingT('actions.resendCode')}
              </Button>
              <Button
                variant="primary"
                className="w-full bg-gold text-navy hover:bg-gold-dark"
                onClick={handleVerifyOtp}
                disabled={!isValidTOTPSecret(otpCode) || actionLoading}
              >
                {actionLoading
                  ? bookingT('actions.confirming')
                  : bookingT('actions.verifyAndConfirm')}
              </Button>
            </div>
          </div>
        )}

        {step === 'confirming' && (
          <p className="text-sm text-charcoal">{bookingT('confirmingMessage')}</p>
        )}
      </Modal>

      <Modal
        isOpen={step === 'done'}
        onClose={handleCloseSuccess}
        title={bookingT('done.modalTitle')}
        size="lg"
      >
        <div className="space-y-5 text-center">
          <p className="text-sm text-charcoal">{bookingT('done.body')}</p>
          {reservationCode && (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-5">
              <p className="text-sm font-medium text-green-900">{bookingT('done.codeLabel')}</p>
              <p className="mt-2 font-mono text-2xl font-bold tracking-wide text-green-900">
                {reservationCode}
              </p>
            </div>
          )}
          {confirmedMercadoPago?.can_pay_online && confirmedBookingId ? (
            <MercadoPagoPaySection
              bookingId={confirmedBookingId}
              canPayOnline={confirmedMercadoPago.can_pay_online}
              mercadoPagoApproved={confirmedMercadoPago.mercado_pago_approved}
              totalAmount={confirmedTotalAmount}
              currencyCode={confirmedCurrencyCode}
              manageToken={confirmedManageToken ?? undefined}
              reservationCode={reservationCode ?? undefined}
              listingType={confirmedListingType ?? undefined}
              showPayLater
              onPayLater={handlePayLater}
            />
          ) : (
            <>
              <p className="text-sm text-charcoal">{bookingT('done.lookupHint')}</p>
              <div className="flex flex-col gap-2">
                {lookupIsExternal ? (
                  <a
                    href={lookupHref}
                    className="block w-full"
                    onClick={handleCloseSuccess}
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full bg-gold text-navy hover:bg-gold-dark"
                    >
                      {bookingT('done.goToReservationLookup')}
                    </Button>
                  </a>
                ) : (
                  <Link to={lookupHref} className="block w-full" onClick={handleCloseSuccess}>
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full bg-gold text-navy hover:bg-gold-dark"
                    >
                      {bookingT('done.goToReservationLookup')}
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-2xl"
                  onClick={handleCloseSuccess}
                >
                  {bookingT('done.close')}
                </Button>
              </div>
            </>
          )}
          {confirmedMercadoPago?.can_pay_online && (
            <div className="flex flex-col gap-2">
              {lookupIsExternal ? (
                <a href={lookupHref} className="block w-full" onClick={handleCloseSuccess}>
                  <Button variant="outline" size="lg" className="w-full rounded-2xl">
                    {bookingT('done.goToReservationLookup')}
                  </Button>
                </a>
              ) : (
                <Link to={lookupHref} className="block w-full" onClick={handleCloseSuccess}>
                  <Button variant="outline" size="lg" className="w-full rounded-2xl">
                    {bookingT('done.goToReservationLookup')}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default GuestBookingFlow;
