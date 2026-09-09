import { useMemo } from 'react';
import {
  resolvePoliciesForDisplay,
  type PublicPropertyPolicy,
} from '../../models/properties/propertyPolicies';

export interface PropertyPolicySectionsProps {
  publicPolicies?: PublicPropertyPolicy[];
  heading: string;
  locale: string;
  className?: string;
}

export default function PropertyPolicySections({
  publicPolicies,
  heading,
  locale,
  className,
}: PropertyPolicySectionsProps) {
  const resolved = useMemo(
    () => resolvePoliciesForDisplay(publicPolicies ?? [], locale),
    [publicPolicies, locale],
  );

  if (resolved.length === 0) {
    return null;
  }

  const sectionClass = className ? `mt-10 space-y-4 ${className}` : 'mt-10 space-y-4';

  return (
    <section className={sectionClass}>
      <h2 className="text-2xl font-semibold text-navy">{heading}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {resolved.map((policy) => (
          <div
            key={policy.id}
            className="space-y-2 rounded-2xl border border-warm-gray bg-white/90 p-4 text-sm text-charcoal"
          >
            {policy.title ? (
              <h3 className="text-base font-semibold text-navy">{policy.title}</h3>
            ) : null}
            {policy.description ? (
              <p className="text-charcoal whitespace-pre-line m-0">{policy.description}</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
