import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { Card } from '../ui';
import type { GuestExistingReview } from '../../types/guestReviewContract';

export interface GuestReviewReadOnlyCardProps {
  review: GuestExistingReview;
  cardVariant?: 'default' | 'elevated' | 'glass' | 'surface';
}

const GuestReviewReadOnlyCard: React.FC<GuestReviewReadOnlyCardProps> = ({
  review,
  cardVariant = 'default',
}) => {
  const { t } = useTranslation();

  return (
    <Card variant={cardVariant} className="w-full max-w-2xl p-8 space-y-4">
      <h3 className="text-xl font-semibold text-navy">{t('reservationLookup.review.yourReview')}</h3>
      <div className="flex gap-1" aria-label={t('reservationLookup.review.ratingLabel')}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            className={`h-6 w-6 ${
              value <= review.rating ? 'fill-gold text-gold' : 'text-warm-gray'
            }`}
          />
        ))}
      </div>
      <p className="text-charcoal whitespace-pre-wrap">{review.comment}</p>
    </Card>
  );
};

export default GuestReviewReadOnlyCard;
