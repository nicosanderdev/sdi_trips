import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { Button, Card, Input, Textarea } from '../ui';
import type { ReservationLookupData } from '../../services/bookingService';
import { createGuestReviewByReservationCode } from '../../services/reviewService';

export interface GuestReservationReviewFormProps {
  reservation: ReservationLookupData;
  cardVariant?: 'default' | 'elevated' | 'glass' | 'surface';
}

const GuestReservationReviewForm: React.FC<GuestReservationReviewFormProps> = ({
  reservation,
  cardVariant = 'default',
}) => {
  const { t } = useTranslation();
  const guestEmail = reservation.guestEmail?.trim() ?? '';
  const [guestName, setGuestName] = useState(reservation.guestName?.trim() ?? '');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayRating = hoverRating || rating;
  const emailMissing = !guestEmail;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (emailMissing) {
      setError(t('reservationLookup.review.emailMissing'));
      return;
    }
    if (!guestName.trim()) {
      setError(t('reservationLookup.review.nameRequired'));
      return;
    }
    if (rating < 1 || rating > 5) {
      setError(t('reservationLookup.review.ratingRequired'));
      return;
    }
    if (!comment.trim()) {
      setError(t('reservationLookup.review.commentRequired'));
      return;
    }

    setSubmitting(true);
    try {
      await createGuestReviewByReservationCode({
        reservationCode: reservation.reservationCode,
        guestEmail,
        guestName: guestName.trim(),
        rating,
        comment: comment.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message.startsWith('reservationLookup.') ? t(message) : message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card variant={cardVariant} className="w-full max-w-2xl p-8">
        <p className="text-green-700 text-center font-medium" role="status">
          {t('reservationLookup.review.successMessage')}
        </p>
      </Card>
    );
  }

  return (
    <Card variant={cardVariant} className="w-full max-w-2xl p-8 space-y-4">
      <div className="space-y-1 text-center sm:text-left">
        <h3 className="text-xl font-semibold text-navy">{t('reservationLookup.review.promptTitle')}</h3>
        <p className="text-sm text-charcoal">{t('reservationLookup.review.promptBody')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('reservationLookup.review.emailLabel')}
          type="email"
          value={guestEmail}
          onChange={() => {}}
          disabled
          required
        />
        {emailMissing && (
          <p className="text-sm text-amber-800">{t('reservationLookup.review.emailMissing')}</p>
        )}

        <Input
          label={t('reservationLookup.review.nameLabel')}
          placeholder={t('reservationLookup.review.namePlaceholder')}
          value={guestName}
          onChange={setGuestName}
          required
          disabled={submitting}
        />

        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">
            {t('reservationLookup.review.ratingLabel')} <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className="p-1 focus:outline-none focus:ring-2 focus:ring-gold rounded"
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(value)}
                disabled={submitting}
                aria-label={`${value} ${t('reviews.stars')}`}
              >
                <Star
                  className={`h-8 w-8 ${
                    value <= displayRating ? 'fill-gold text-gold' : 'text-warm-gray'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <Textarea
          label={t('reservationLookup.review.commentLabel')}
          placeholder={t('reservationLookup.review.commentPlaceholder')}
          value={comment}
          onChange={setComment}
          rows={4}
          required
          disabled={submitting}
        />

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-center sm:justify-end pt-2">
          <Button type="submit" variant="primary" disabled={submitting || emailMissing}>
            {submitting ? t('reservationLookup.review.submitting') : t('reservationLookup.review.submit')}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default GuestReservationReviewForm;
