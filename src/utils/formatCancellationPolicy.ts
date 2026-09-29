import type { PublicCancellationPolicy } from '../types/guestReviewContract';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

/**
 * Builds a short localized summary of a property cancellation policy.
 * Example (es): "Cancelación gratuita hasta 7 días antes del check-in. Después, reembolso del 0%. Seña del 50%; saldo 7 días antes."
 */
export function formatCancellationPolicySummary(
  policy: PublicCancellationPolicy,
  t: TranslateFn,
): string {
  const parts: string[] = [];

  if (policy.freeCancellationDays <= 0) {
    parts.push(
      t('cancellationPolicy.summary.noFreeWindow', {
        percent: policy.refundPercentAfter,
      }),
    );
  } else if (policy.refundPercentBefore === policy.refundPercentAfter) {
    parts.push(
      t('cancellationPolicy.summary.flatRefund', {
        days: policy.freeCancellationDays,
        percent: policy.refundPercentBefore,
      }),
    );
  } else {
    parts.push(
      t('cancellationPolicy.summary.freeUntil', {
        days: policy.freeCancellationDays,
        percentBefore: policy.refundPercentBefore,
      }),
    );
    parts.push(
      t('cancellationPolicy.summary.afterCutoff', {
        percent: policy.refundPercentAfter,
      }),
    );
  }

  if (policy.depositPercent >= 100) {
    parts.push(t('cancellationPolicy.summary.fullUpfront'));
  } else if (policy.balanceDueDays != null && policy.balanceDueDays > 0) {
    parts.push(
      t('cancellationPolicy.summary.depositWithBalance', {
        depositPercent: policy.depositPercent,
        balanceDays: policy.balanceDueDays,
      }),
    );
  } else {
    parts.push(
      t('cancellationPolicy.summary.depositOnly', {
        depositPercent: policy.depositPercent,
      }),
    );
  }

  return parts.join(' ');
}
