import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { createReview } from '../../services/reviewService';

export interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookingId: string;
  propertyTitle?: string;
}

const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  bookingId,
  propertyTitle,
}) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setComment('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (rating < 1 || rating > 5) {
      setError(t('reviews.form.ratingRequired'));
      return;
    }
    setSubmitting(true);
    try {
      await createReview(bookingId, rating, comment.trim() || null);
      onSuccess();
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message.startsWith('reviews.') ? t(message) : message);
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={propertyTitle ? t('reviews.leaveReviewFor', { title: propertyTitle }) : t('reviews.leaveReview')}
      size="md"
      showCloseButton
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-2">
            {t('reviews.rating')} <span className="text-red-500">*</span>
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

        <div>
          <label className="block text-sm font-medium text-navy mb-2">{t('reviews.comment')}</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('reviews.commentPlaceholder')}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold bg-white text-charcoal placeholder-gray-400"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
            {t('reviews.form.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? t('reviews.submitting') : t('reviews.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LeaveReviewModal;
