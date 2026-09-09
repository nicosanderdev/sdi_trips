import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { format, isSameDay } from 'date-fns';
import { enUS, es, ptBR } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import {
  getPropertyAvailability,
  getBlockedDates,
  validateDateSelection,
  getEarliestAvailableDate,
  getLatestBookableDate,
  type DateSelectionValidationResult,
} from '../../services/availabilityService';
import type { PropertyBookingRules } from '../../types';
import 'react-datepicker/dist/react-datepicker.css';

// Register locales for react-datepicker
registerLocale('en', enUS);
registerLocale('es', es);
registerLocale('pt', ptBR);

interface BookingDatePickerProps {
  propertyId: string;
  bookingMode?: 'singleNight' | 'multipleDays';
  checkIn: Date | null;
  checkOut: Date | null;
  onCheckInChange: (date: Date | null) => void;
  onCheckOutChange: (date: Date | null) => void;
  minStayDays?: number;
  maxStayDays?: number;
  leadTimeDays?: number;
  bufferDays?: number;
  onSelectionErrorChange?: (error: string | null) => void;
}

const BookingDatePicker: React.FC<BookingDatePickerProps> = ({
  propertyId,
  bookingMode = 'multipleDays',
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  minStayDays,
  maxStayDays,
  leadTimeDays,
  bufferDays,
  onSelectionErrorChange,
}) => {
  const { t, i18n } = useTranslation();
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Map i18n language to date-fns locale
  const dateLocale = useMemo(() => {
    const lang = i18n.language.split('-')[0]; // Get base language (e.g., 'en' from 'en-US')
    switch (lang) {
      case 'es':
        return es;
      case 'pt':
        return ptBR;
      case 'en':
      default:
        return enUS;
    }
  }, [i18n.language]);

  // Map i18n language to react-datepicker locale string
  const datePickerLocale = useMemo(() => {
    const lang = i18n.language.split('-')[0];
    return lang === 'pt' ? 'pt' : lang === 'es' ? 'es' : 'en';
  }, [i18n.language]);

  const bookingRules: PropertyBookingRules = useMemo(
    () => ({
      minStayDays,
      maxStayDays,
      leadTimeDays,
      bufferDays,
    }),
    [minStayDays, maxStayDays, leadTimeDays, bufferDays],
  );

  const addDays = useCallback((date: Date, days: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }, []);

  const formatValidationError = useCallback(
    (validation: DateSelectionValidationResult) => {
      if (!validation.errorKey) return null;
      return t(`propertyDetail.bookingFlow.${validation.errorKey}`, validation.errorParams);
    },
    [t],
  );

  // Fetch availability when property or date range changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!propertyId) return;

      try {
        setLoading(true);
        setError(null);

        // Calculate date range (3 months ahead from earliest available date)
        const startDate = getEarliestAvailableDate(leadTimeDays);
        const endDate = getLatestBookableDate(leadTimeDays);

        const availabilityData = await getPropertyAvailability(propertyId, startDate, endDate);
        setBlockedDates(getBlockedDates(availabilityData));
      } catch (err) {
        console.error('Failed to fetch availability:', err);
        setError(t('booking.failedToLoadAvailability'));
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [propertyId, leadTimeDays, t]);

  // Surface rule errors as soon as both dates are present (parent also gates Continue).
  useEffect(() => {
    if (!checkIn || !checkOut) {
      setSelectionError(null);
      onSelectionErrorChange?.(null);
      return;
    }
    const validation = validateDateSelection(checkIn, checkOut, blockedDates, bookingRules);
    const message = validation.isValid ? null : formatValidationError(validation);
    setSelectionError(message);
    onSelectionErrorChange?.(message ?? null);
  }, [checkIn, checkOut, blockedDates, bookingRules, formatValidationError, onSelectionErrorChange]);

  // Handle hover over dates
  const handleDayMouseEnter = useCallback((date: Date) => {
    if (!checkIn || checkOut) return; // Only show hover preview when check-in is selected but check-out is not

    const dateStr = format(date, 'yyyy-MM-dd', { locale: dateLocale });

    // Don't show hover preview for blocked dates or dates before check-in
    if (blockedDates.has(dateStr) || date < checkIn) {
      setHoverDate(null);
      return;
    }

    setHoverDate(date);
  }, [checkIn, checkOut, blockedDates, dateLocale]);

  const handleMonthMouseLeave = useCallback(() => {
    setHoverDate(null);
  }, []);

  // Handle date selection
  const handleDateChange = useCallback((date: Date | null, isStartDate: boolean) => {
    if (!date) return;

    const dateStr = format(date, 'yyyy-MM-dd', { locale: dateLocale });

    // Don't allow selection of blocked dates
    if (blockedDates.has(dateStr)) {
      const message = t('propertyDetail.bookingFlow.errors.dateUnavailable');
      setSelectionError(message);
      onSelectionErrorChange?.(message);
      return;
    }

    if (isStartDate) {
      // Selecting check-in date
      onCheckInChange(date);

      // If check-out is before or same as check-in, clear it
      if (checkOut && (date >= checkOut || isSameDay(date, checkOut))) {
        onCheckOutChange(null);
        setSelectionError(null);
        onSelectionErrorChange?.(null);
        return;
      }

      if (checkOut) {
        const validation = validateDateSelection(date, checkOut, blockedDates, bookingRules);
        const message = validation.isValid ? null : formatValidationError(validation);
        setSelectionError(message);
        onSelectionErrorChange?.(message ?? null);
      } else {
        setSelectionError(null);
        onSelectionErrorChange?.(null);
      }
    } else {
      // Selecting check-out date
      // Only allow if we have a check-in date
      if (!checkIn) return;

      // Always apply the selection so the guest sees the chosen range,
      // then surface a clear error when rules are not met.
      onCheckOutChange(date);
      const validation = validateDateSelection(checkIn, date, blockedDates, bookingRules);
      const message = validation.isValid ? null : formatValidationError(validation);
      setSelectionError(message);
      onSelectionErrorChange?.(message ?? null);
    }
  }, [
    checkIn,
    checkOut,
    blockedDates,
    bookingRules,
    onCheckInChange,
    onCheckOutChange,
    dateLocale,
    formatValidationError,
    onSelectionErrorChange,
    t,
  ]);

  const handleSingleNightDateChange = useCallback((date: Date | null) => {
    if (!date) return;
    const checkInStr = format(date, 'yyyy-MM-dd', { locale: dateLocale });
    const visibleCheckOut = addDays(date, 1);
    const visibleCheckOutStr = format(visibleCheckOut, 'yyyy-MM-dd', { locale: dateLocale });

    if (blockedDates.has(checkInStr) || blockedDates.has(visibleCheckOutStr)) {
      const message = t('propertyDetail.bookingFlow.errors.dateUnavailable');
      setSelectionError(message);
      onSelectionErrorChange?.(message);
      return;
    }

    onCheckInChange(date);
    onCheckOutChange(visibleCheckOut);
    const validation = validateDateSelection(date, visibleCheckOut, blockedDates, bookingRules);
    const message = validation.isValid ? null : formatValidationError(validation);
    setSelectionError(message);
    onSelectionErrorChange?.(message ?? null);
  }, [
    addDays,
    blockedDates,
    bookingRules,
    dateLocale,
    formatValidationError,
    onCheckInChange,
    onCheckOutChange,
    onSelectionErrorChange,
    t,
  ]);

  // Get CSS class for each day
  const getDayClassName = useCallback((date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd', { locale: dateLocale });
    const today = new Date();
    const isToday = isSameDay(date, today);
    const isBlocked = blockedDates.has(dateStr);

    // Calculate hover preview range
    const isInHoverRange = checkIn && !checkOut && hoverDate && date >= checkIn && date <= hoverDate;
    const isHoverStart = checkIn && !checkOut && isSameDay(date, checkIn) && isInHoverRange;
    const isHoverEnd = checkIn && !checkOut && hoverDate && isSameDay(date, hoverDate) && isInHoverRange;

    const classes = ['react-datepicker__day'];

    if (isBlocked) {
      classes.push('blocked-date');
    } else if (isHoverStart) {
      classes.push('hover-range-start');
    } else if (isHoverEnd) {
      classes.push('hover-range-end');
    } else if (isInHoverRange) {
      classes.push('hover-range-middle');
    } else if (isToday) {
      classes.push('today-date');
    } else {
      classes.push('available-date');
    }

    return classes.join(' ');
  }, [checkIn, checkOut, blockedDates, hoverDate, dateLocale]);

  // Get dates to exclude (blocked dates)
  const excludeDates = Array.from(blockedDates).map(dateStr => new Date(dateStr + 'T00:00:00'));

  // Calculate min/max dates based on lead time and booking horizon
  const minDate = getEarliestAvailableDate(leadTimeDays);
  const maxDate = getLatestBookableDate(leadTimeDays);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-charcoal">{t('booking.loadingAvailability')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="booking-datepicker">
      {/* Check-in DatePicker */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-navy mb-2">
          {t('booking.checkIn')}
        </label>
        <DatePicker
          selected={checkIn}
          onChange={(date) => (bookingMode === 'singleNight' ? handleSingleNightDateChange(date) : handleDateChange(date, true))}
          onCalendarOpen={() => setHoverDate(null)}
          onCalendarClose={() => setHoverDate(null)}
          onDayMouseEnter={handleDayMouseEnter}
          onMonthMouseLeave={handleMonthMouseLeave}
          selectsStart
          startDate={checkIn}
          endDate={checkOut}
          minDate={minDate}
          maxDate={maxDate}
          excludeDates={excludeDates}
          dayClassName={getDayClassName}
          placeholderText={t('booking.selectCheckIn')}
          locale={datePickerLocale}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
          calendarClassName="custom-datepicker"
          popperClassName="datepicker-popper"
          dateFormat="MMM dd, yyyy"
          formatWeekDay={(nameOfDay) => nameOfDay.substring(0, 1)}
        />
      </div>

      {bookingMode === 'multipleDays' && (
        <div>
          <label className="block text-sm font-medium text-navy mb-2">
            {t('booking.checkOut')}
          </label>
          <DatePicker
            selected={checkOut}
            onChange={(date) => handleDateChange(date, false)}
            onCalendarOpen={() => setHoverDate(null)}
            onCalendarClose={() => setHoverDate(null)}
            onDayMouseEnter={handleDayMouseEnter}
            onMonthMouseLeave={handleMonthMouseLeave}
            selectsEnd
            startDate={checkIn}
            endDate={checkOut}
            minDate={checkIn || minDate}
            maxDate={maxDate}
            excludeDates={excludeDates}
            dayClassName={getDayClassName}
            placeholderText={t('booking.selectCheckOut')}
            locale={datePickerLocale}
            disabled={!checkIn}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            calendarClassName="custom-datepicker"
            popperClassName="datepicker-popper"
            dateFormat="MMM dd, yyyy"
            formatWeekDay={(nameOfDay) => nameOfDay.substring(0, 1)}
          />
        </div>
      )}

      {checkIn && checkOut && (
        <div className="mt-4 p-3 bg-warm-gray rounded-lg">
          <div className="text-sm text-charcoal">
            {Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))}{' '}
            {Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) === 1
              ? t('booking.nightSelected')
              : t('booking.nightsSelected')}
          </div>
          {selectionError && (
            <p className="text-sm text-red-600 mt-1" role="alert">
              {selectionError}
            </p>
          )}
        </div>
      )}

      {selectionError && !(checkIn && checkOut) && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {selectionError}
        </p>
      )}
    </div>
  );
};

export default BookingDatePicker;
