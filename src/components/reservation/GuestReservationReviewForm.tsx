import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { Button, Card, Input, Textarea } from '../ui';
import { getGuestSiteListingType } from '../../core/config/guestSiteListingType';
import type { GuestExistingReview } from '../../types/guestReviewContract';
import type { ReservationLookupData } from '../../services/bookingService';
import {
  createGuestReviewByReservationCode,
  updateGuestReviewByReservationCode,
} from '../../services/reviewService';

export interface GuestReservationReviewFormProps {
  reservation: ReservationLookupData;
  mode: 'create' | 'edit';
  existingReview?: GuestExistingReview;
  cardVariant?: 'default' | 'elevated' | 'glass' | 'surface';
  onReviewSaved?: (review: GuestExistingReview) => void;
}

const GuestReservationReviewForm: React.FC<GuestReservationReviewFormProps> = ({
  reservation,
  mode,
  existingReview,
  cardVariant = 'default',
  onReviewSaved,
}) => {
  const { t } = useTranslation();
  const guestEmail = reservation.guestEmail?.trim() ?? '';
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayRating = hoverRating || rating;
  const emailMissing = !guestEmail;
  const isEdit = mode === 'edit';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (emailMissing) {
      setError(t('reservationLookup.review.emailMissing'));
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
      const params = {
        reservationCode: reservation.reservationCode,
        guestEmail,
        rating,
        comment: comment.trim(),
        listingType: reservation.listingType ?? getGuestSiteListingType(),
      };

      const reviewId = isEdit
        ? await updateGuestReviewByReservationCode(params)
        : await createGuestReviewByReservationCode(params);

      const saved: GuestExistingReview = {
        reviewId: reviewId || existingReview?.reviewId || '',
        rating,
        comment: comment.trim(),
      };
      onReviewSaved?.(saved);
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
          {isEdit
            ? t('reservationLookup.review.updateSuccessMessage')
            : t('reservationLookup.review.successMessage')}
        </p>
      </Card>
    );
  }

  return (
    <Card variant={cardVariant} className="w-full max-w-2xl p-8 space-y-4">
      <div className="space-y-1 text-center sm:text-left">
        <h3 className="text-xl font-semibold text-navy">
          {isEdit
            ? t('reservationLookup.review.editTitle')
            : t('reservationLookup.review.promptTitle')}
        </h3>
        <p className="text-sm text-charcoal">
          {isEdit
            ? t('reservationLookup.review.editPromptBody')
            : t('reservationLookup.review.promptBody')}
        </p>
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
            {submitting
              ? t('reservationLookup.review.submitting')
              : isEdit
                ? t('reservationLookup.review.saveChanges')
                : t('reservationLookup.review.submit')}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default GuestReservationReviewForm;
