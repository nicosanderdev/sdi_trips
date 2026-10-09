import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { PublicCancellationPolicy } from '../../types/guestReviewContract';
import { formatCancellationPolicySummary } from '../../utils/formatCancellationPolicy';

export interface CancellationPolicySummaryProps {
  policy: PublicCancellationPolicy | null | undefined;
  className?: string;
}

export default function CancellationPolicySummary({
  policy,
  className,
}: CancellationPolicySummaryProps) {
  const { t } = useTranslation();

  const summary = useMemo(
    () => (policy ? formatCancellationPolicySummary(policy, t) : null),
    [policy, t],
  );

  if (!policy || !summary) {
    return null;
  }

  const sectionClass = className ? `mt-10 space-y-4 ${className}` : 'mt-10 space-y-4';

  return (
    <section className={sectionClass}>
      <h2 className="text-2xl font-semibold text-navy">{t('cancellationPolicy.heading')}</h2>
      <div className="rounded-2xl border border-warm-gray bg-white/90 p-4 text-sm text-charcoal">
        <h3 className="text-base font-semibold text-navy m-0 mb-2">
          {t('cancellationPolicy.title')}
        </h3>
        <p className="text-charcoal m-0 whitespace-pre-line">{summary}</p>
      </div>
    </section>
  );
}
