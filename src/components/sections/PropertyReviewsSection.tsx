import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { Button, LeaveReviewModal } from '../ui';
import { useAuth } from '../../hooks/useAuth';
import { getMemberProfile } from '../../services/memberService';
import {
  getReviewEligibilityForProperty,
  getReviewsByPropertyId,
} from '../../services/reviewService';
import type { PropertyReviewsResult } from '../../types';

export interface PropertyReviewsSectionProps {
  propertyId: string;
  propertyTitle?: string;
  fallbackRating?: number;
  fallbackReviewCount?: number;
  className?: string;
}

export default function PropertyReviewsSection({
  propertyId,
  propertyTitle,
  fallbackRating,
  fallbackReviewCount,
  className = '',
}: PropertyReviewsSectionProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [reviewsResult, setReviewsResult] = useState<PropertyReviewsResult | null>(null);
  const [reviewEligibility, setReviewEligibility] = useState<{
    canReview: boolean;
    booking?: { id: string };
    reason?: string;
  } | null>(null);
  const [reviewEligibilityLoading, setReviewEligibilityLoading] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      if (!propertyId) return;
      try {
        const result = await getReviewsByPropertyId(propertyId);
        if (isMounted) setReviewsResult(result);
      } catch (err) {
        console.error('Error loading reviews:', err);
        if (isMounted) setReviewsResult({ reviews: [], averageRating: 0, totalCount: 0 });
      }
    };

    loadReviews();
    return () => {
      isMounted = false;
    };
  }, [propertyId]);

  useEffect(() => {
    let isMounted = true;

    const loadReviewEligibility = async () => {
      if (!user || !propertyId) {
        if (isMounted) setReviewEligibility(null);
        return;
      }
      try {
        if (isMounted) setReviewEligibilityLoading(true);
        const member = await getMemberProfile(user.id);
        if (!member?.id || !isMounted) return;
        const result = await getReviewEligibilityForProperty(propertyId, member.id);
        if (isMounted) setReviewEligibility(result);
      } catch (err) {
        console.error('Error loading review eligibility:', err);
        if (isMounted) setReviewEligibility(null);
      } finally {
        if (isMounted) setReviewEligibilityLoading(false);
      }
    };

    loadReviewEligibility();
    return () => {
      isMounted = false;
    };
  }, [user, propertyId]);

  const displayRating =
    reviewsResult != null
      ? reviewsResult.averageRating > 0
        ? reviewsResult.averageRating.toFixed(1)
        : '—'
      : fallbackRating != null
        ? fallbackRating.toFixed(1)
        : '—';

  const displayReviewCount = reviewsResult?.totalCount ?? fallbackReviewCount ?? 0;

  return (
    <>
      <section className={`space-y-8 ${className}`.trim()}>
        <div className="flex items-center justify-between mr-4">
          <h2 className="text-2xl font-semibold text-navy">{t('propertyDetail.reviews.heading')}</h2>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-gold text-gold" />
            <span className="text-lg font-semibold text-navy">{displayRating}</span>
            <span className="text-charcoal">
              {t('propertyDetail.reviews.reviewsCount', { count: displayReviewCount })}
            </span>
          </div>
        </div>

        {user &&
          (reviewEligibilityLoading ? null : reviewEligibility?.canReview && reviewEligibility.booking ? (
            <div className="mb-4">
              <Button variant="primary" size="sm" onClick={() => setIsReviewModalOpen(true)}>
                {t('reviews.addReview')}
              </Button>
            </div>
          ) : reviewEligibility?.reason ? (
            <p className="text-charcoal text-sm mb-4">
              {reviewEligibility.reason.startsWith('reviews.')
                ? t(reviewEligibility.reason)
                : reviewEligibility.reason}
            </p>
          ) : null)}

        {reviewsResult && reviewsResult.reviews.length > 0 ? (
          <div className="space-y-4">
            {reviewsResult.reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border border-warm-gray bg-white/80 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-warm-gray-light flex items-center justify-center text-navy font-semibold">
                      {(review.reviewerName || '?').charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-navy">
                        {review.reviewerName || t('reviews.anonymous')}
                      </p>
                      <p className="text-xs text-charcoal/80">
                        {new Date(review.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-gold text-gold" />
                    <span className="text-sm font-medium text-navy">{review.rating.toFixed(1)}</span>
                  </div>
                </div>
                {review.comment ? (
                  <p className="text-sm text-charcoal leading-relaxed">{review.comment}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-charcoal text-sm">{t('propertyDetail.reviews.noReviews')}</p>
        )}
      </section>

      <LeaveReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={() => {
          setIsReviewModalOpen(false);
          setReviewEligibility((prev) =>
            prev?.canReview ? { canReview: false, reason: 'reviews.errors.reviewAlreadyExists' } : prev,
          );
          getReviewsByPropertyId(propertyId).then(setReviewsResult);
        }}
        bookingId={reviewEligibility?.booking?.id ?? ''}
        propertyTitle={propertyTitle}
      />
    </>
  );
}
