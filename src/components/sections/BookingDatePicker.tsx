import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { format, isSameDay, isWithinInterval, startOfWeek, endOfWeek, isSameWeek } from 'date-fns';
import { enUS, es, ptBR } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { getPropertyAvailability, getBlockedDates, validateDateSelection, getEarliestAvailableDate } from '../../services/availabilityService';
import type { PropertyBookingRules } from '../../types';
import 'react-datepicker/dist/react-datepicker.css';

// Register locales for react-datepicker
registerLocale('en', enUS);
registerLocale('es', es);
registerLocale('pt', ptBR);

interface BookingDatePickerProps {
  propertyId: string;
  checkIn: Date | null;
  checkOut: Date | null;
  onCheckInChange: (date: Date | null) => void;
  onCheckOutChange: (date: Date | null) => void;
  minStayDays?: number;
  maxStayDays?: number;
  leadTimeDays?: number;
  bufferDays?: number;
}

const BookingDatePicker: React.FC<BookingDatePickerProps> = ({
  propertyId,
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  minStayDays,
  maxStayDays,
  leadTimeDays,
  bufferDays,
}) => {
  const { t, i18n } = useTranslation();
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const bookingRules: PropertyBookingRules = {
    minStayDays,
    maxStayDays,
    leadTimeDays,
    bufferDays,
  };

  // Fetch availability when property or date range changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!propertyId) return;

      try {
        setLoading(true);
        setError(null);

        // Calculate date range (3 months ahead from earliest available date)
        const startDate = getEarliestAvailableDate(leadTimeDays);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 3);

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
  }, [propertyId, leadTimeDays]);

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
      return;
    }

    if (isStartDate) {
      // Selecting check-in date
      onCheckInChange(date);

      // If check-out is before or same as check-in, clear it
      if (checkOut && (date >= checkOut || isSameDay(date, checkOut))) {
        onCheckOutChange(null);
      }
    } else {
      // Selecting check-out date
      // Only allow if we have a check-in date
      if (!checkIn) return;

      // Validate the selection
      const validation = validateDateSelection(checkIn, date, blockedDates, bookingRules);
      if (!validation.isValid) {
        // Could show error message here
        return;
      }

      onCheckOutChange(date);
    }
  }, [checkIn, checkOut, blockedDates, bookingRules, onCheckInChange, onCheckOutChange, dateLocale]);

  // Get CSS class for each day
  const getDayClassName = useCallback((date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd', { locale: dateLocale });
    const today = new Date();
    const isToday = isSameDay(date, today);
    const isCheckIn = checkIn && isSameDay(date, checkIn);
    const isCheckOut = checkOut && isSameDay(date, checkOut);
    const isInRange = checkIn && checkOut && isWithinInterval(date, { start: checkIn, end: checkOut });
    const isBlocked = blockedDates.has(dateStr);

    // Calculate hover preview range
    const isInHoverRange = checkIn && !checkOut && hoverDate && date >= checkIn && date <= hoverDate;
    const isHoverStart = checkIn && !checkOut && isSameDay(date, checkIn);
    const isHoverEnd = checkIn && !checkOut && hoverDate && isSameDay(date, hoverDate);

    const classes = ['react-datepicker__day'];

    if (isBlocked) {
      classes.push('blocked-date');
    } else if (isCheckIn) {
      classes.push('range-start');
      // Check if start date is first day of week
      if (isSameDay(date, startOfWeek(date, { locale: dateLocale }))) {
        classes.push('range-start-week');
      }
    } else if (isCheckOut) {
      classes.push('range-end');
      // Check if end date is last day of week
      if (isSameDay(date, endOfWeek(date, { locale: dateLocale }))) {
        classes.push('range-end-week');
      }
    } else if (isInRange) {
      classes.push('range-middle');
      // Check if this is a continuation from previous week
      if (checkIn && !isSameWeek(date, checkIn, { locale: dateLocale })) {
        classes.push('range-continuation');
      }
      // Add week boundary classes for proper edge rounding
      const isFirstDayOfWeek = isSameDay(date, startOfWeek(date, { locale: dateLocale }));
      const isLastDayOfWeek = isSameDay(date, endOfWeek(date, { locale: dateLocale }));

      if (isFirstDayOfWeek) {
        classes.push('range-week-start');
      }
      if (isLastDayOfWeek) {
        classes.push('range-week-end');
      }
    } else if (isHoverStart) {
      classes.push('hover-range-start');
    } else if (isHoverEnd) {
      classes.push('hover-range-end');
    } else if (isInHoverRange) {
      classes.push('hover-range-middle');
      // Add week boundary classes for hover ranges too
      const isFirstDayOfWeek = isSameDay(date, startOfWeek(date, { locale: dateLocale }));
      const isLastDayOfWeek = isSameDay(date, endOfWeek(date, { locale: dateLocale }));

      if (isFirstDayOfWeek) {
        classes.push('hover-range-week-start');
      }
      if (isLastDayOfWeek) {
        classes.push('hover-range-week-end');
      }
    } else if (isToday) {
      classes.push('today-date');
    } else {
      classes.push('available-date');
    }

    return classes.join(' ');
  }, [checkIn, checkOut, blockedDates, hoverDate, dateLocale]);

  // Get dates to exclude (blocked dates)
  const excludeDates = Array.from(blockedDates).map(dateStr => new Date(dateStr + 'T00:00:00'));

  // Calculate min date based on lead time
  const minDate = getEarliestAvailableDate(leadTimeDays);

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
          onChange={(date) => handleDateChange(date, true)}
          onCalendarOpen={() => setHoverDate(null)}
          onCalendarClose={() => setHoverDate(null)}
          onDayMouseEnter={handleDayMouseEnter}
          onMonthMouseLeave={handleMonthMouseLeave}
          selectsStart
          startDate={checkIn}
          endDate={checkOut}
          minDate={minDate}
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

      {/* Check-out DatePicker */}
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

      {/* Validation Messages */}
      {checkIn && checkOut && (
        <div className="mt-4 p-3 bg-warm-gray rounded-lg">
          <div className="text-sm text-charcoal">
            {Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))}{' '}
            {Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) === 1
              ? t('booking.nightSelected')
              : t('booking.nightsSelected')}
          </div>
          {(() => {
            const validation = validateDateSelection(checkIn, checkOut, blockedDates, bookingRules);
            return !validation.isValid ? (
              <div className="text-sm text-red-600 mt-1">{validation.error}</div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
};

export default BookingDatePicker;