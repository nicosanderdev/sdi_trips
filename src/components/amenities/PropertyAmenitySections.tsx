import { useMemo } from 'react';
import {
  amenitiesFromNames,
  partitionAmenitiesForDisplay,
  type PublicAmenity,
} from '../../models/properties/publicAmenity';
import AmenityIcon from './AmenityIcon';

export interface PropertyAmenitySectionsProps {
  publicAmenities?: PublicAmenity[];
  fallbackNames?: string[];
  locale: string;
  describedHeading: string;
  nameOnlyHeading: string;
}

export default function PropertyAmenitySections({
  publicAmenities,
  fallbackNames = [],
  locale,
  describedHeading,
  nameOnlyHeading,
}: PropertyAmenitySectionsProps) {
  const { withDescription, nameOnly } = useMemo(() => {
    const usedStructured = (publicAmenities?.length ?? 0) > 0;
    const parsed = usedStructured
      ? publicAmenities!
      : amenitiesFromNames(fallbackNames);
    return partitionAmenitiesForDisplay(parsed, locale);
  }, [publicAmenities, fallbackNames, locale]);

  if (!withDescription.length && !nameOnly.length) {
    return null;
  }

  return (
    <>
      {withDescription.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-navy">{describedHeading}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {withDescription.map(({ amenity, description }) => (
              <div
                key={amenity.id}
                className="flex items-start gap-4 rounded-3xl border border-warm-gray bg-white/80 p-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-warm-gray-light">
                  <AmenityIcon iconId={amenity.iconId} className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal">{amenity.name}</p>
                  <p className="text-sm text-charcoal/80 whitespace-pre-line">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {nameOnly.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-navy">{nameOnlyHeading}</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {nameOnly.map((amenity) => (
              <div
                key={amenity.id}
                className="flex items-center gap-2 rounded-2xl border border-warm-gray bg-white/80 px-3 py-2 text-sm text-charcoal"
              >
                <AmenityIcon iconId={amenity.iconId} className="h-4 w-4 text-gold shrink-0" />
                <span>{amenity.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
