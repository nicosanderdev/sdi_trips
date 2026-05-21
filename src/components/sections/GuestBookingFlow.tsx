import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BookingDatePicker from './BookingDatePicker';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/config';
import { Button, Modal, SixDigitCodeInput } from '../ui';
import { isValidTOTPSecret } from '../../core/services/mfaService';
import type { Property } from '../../types';
import { validateBookingSelection } from '../../services/availabilityService';
import {
  confirmGuestBooking,
  createBookingHold,
  reconfirmHold,
  sendGuestOtp,
  verifyGuestOtp
} from '../../services/bookingService';
import {
  buildInternationalPhone,
  isValidLocalPhone,
  SUPPORTED_PHONE_COUNTRIES,
  type PhoneCountryCode,
} from '../../utils/phoneCountries';

type BookingStep = 'dates' | 'guest' | 'otp' | 'confirming' | 'done';
type BookingMode = 'singleNight' | 'multipleDays';
type BookingFlowVariant = 'rental' | 'event';

interface GuestBookingFlowProps {
  property: Property;
  /** Base path for the post-booking manage link (query `token` is appended). Default: `/reservation-lookup`. */
  reservationManagePath?: string;
  /** `event` enables alt-site copy and phone prefix UI. Default: `rental`. */
  variant?: BookingFlowVariant;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

const GuestBookingFlow: React.FC<GuestBookingFlowProps> = ({
  property,
  reservationManagePath = '/reservation-lookup',
  variant = 'rental',
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
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [bookingMode, setBookingMode] = useState<BookingMode>('singleNight');
  const [estimatedGuests, setEstimatedGuests] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [holdId, setHoldId] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountryCode>('UY');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [reservationCode, setReservationCode] = useState<string | null>(null);
  const [manageUrl, setManageUrl] = useState<string | null>(null);
  const [flowError, setFlowError] = useState<string | null>(null);

  const fullPhone = useMemo(() => {
    if (isEvent) {
      return buildInternationalPhone(phoneCountry, phoneLocal);
    }
    return phone.trim();
  }, [isEvent, phone, phoneCountry, phoneLocal]);

  const canValidate = Boolean(checkIn && checkOut);

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
        setValidationError(result.isValid ? null : (result.errors[0] ?? bookingT('errors.invalidDateSelection')));
      }
      setValidationLoading(false);
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [canValidate, checkIn, checkOut, property.id, bookingT]);

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
    if (!fullName.trim()) return false;
    if (isEvent) {
      if (!isValidLocalPhone(phoneLocal)) return false;
      if (!PHONE_PATTERN.test(fullPhone)) return false;
    } else if (!PHONE_PATTERN.test(fullPhone)) {
      return false;
    }
    if (email.trim() && !EMAIL_PATTERN.test(email.trim())) return false;
    return true;
  }, [fullName, fullPhone, phoneLocal, email, isEvent]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  }, [checkIn, checkOut]);

  const totalPrice = nights * (property.price || 0);

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
    });
    setActionLoading(false);

    if (!response.success || !response.hold) {
      setFlowError(response.error ?? bookingT('errors.unableToCreateHold'));
      return;
    }

    setHoldId(response.hold.id);
    setHoldExpiresAt(response.hold.expiresAt);
    setStep('guest');
  };

  const handleSendOtp = async () => {
    if (!holdId) return;
    setActionLoading(true);
    setFlowError(null);
    const result = await sendGuestOtp(holdId, fullPhone);
    setActionLoading(false);
    if (!result.success) {
      setFlowError(
        result.error
          ?? (isEvent
            ? bookingT('errors.couldNotSendConfirmationCode')
            : bookingT('errors.couldNotSendOtp')),
      );
      return;
    }
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
        verifyResult.error
          ?? (isEvent
            ? bookingT('errors.invalidConfirmationCode')
            : bookingT('errors.invalidOtp')),
      );
      return;
    }

    const reconfirmResult = await reconfirmHold(holdId);
    if (!reconfirmResult.success) {
      setActionLoading(false);
      setFlowError(reconfirmResult.error ?? bookingT('errors.holdNoLongerValid'));
      setStep('dates');
      return;
    }

    setStep('confirming');
    const confirmResult = await confirmGuestBooking({
      holdId,
      profile: {
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        phone: fullPhone,
        documentId: documentId.trim() || undefined,
        estimatedGuests: estimatedGuests.trim() ? Number(estimatedGuests) : undefined,
        totalPrice,
      },
    });
    setActionLoading(false);

    if (!confirmResult.success) {
      setFlowError(confirmResult.error ?? bookingT('errors.couldNotConfirmReservation'));
      setStep('guest');
      return;
    }

    const token = confirmResult.manageToken;
    const appUrl = window.location.origin;
    setReservationCode(confirmResult.reservationCode ?? null);
    const path = reservationManagePath.startsWith('/') ? reservationManagePath : `/${reservationManagePath}`;
    setManageUrl(token ? `${appUrl}${path}?token=${encodeURIComponent(token)}` : null);
    setStep('done');
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
      {validationError && <p className="text-xs text-red-600">{validationError}</p>}
      {flowError && <p className="text-xs text-red-600">{flowError}</p>}

      {step === 'dates' && (
        <Button
          variant="primary"
          size="lg"
          className="w-full bg-gold text-navy hover:bg-gold-dark"
          disabled={!checkIn || !checkOut || !!validationError || actionLoading}
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
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={bookingT('form.fullName')}
              className="w-full rounded-2xl border border-warm-gray bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={bookingT('form.emailOptional')}
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
            <Button
              variant="primary"
              size="lg"
              className="w-full bg-gold text-navy hover:bg-gold-dark"
              disabled={!isGuestFormValid || actionLoading}
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

      {step === 'done' && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <p className="font-semibold">{bookingT('done.reservationConfirmed')}</p>
          {reservationCode && (
            <p>
              {bookingT('done.codeLabel')}: {reservationCode}
            </p>
          )}
          {manageUrl && (
            <p>
              {bookingT('done.manageLinkLabel')}{' '}
              <Link to={manageUrl.replace(window.location.origin, '')} className="underline">
                {bookingT('done.openReservationManager')}
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default GuestBookingFlow;
