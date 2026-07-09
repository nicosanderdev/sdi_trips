import { useMemo } from 'react';
import {
  resolveSectionsForDisplay,
  type PublicContentSection,
} from '../../models/properties/propertyContentSections';
import type { PropertyContentSection } from '../../types';
import PropertySection from './PropertySection';

export interface PropertyContentSectionsProps {
  publicContentSections?: PublicContentSection[];
  /** @deprecated Legacy pre-resolved sections; converted when publicContentSections is empty */
  legacySections?: PropertyContentSection[];
  locale: string;
  className?: string;
}

function legacyDisplaySectionsToPublic(sections: PropertyContentSection[]): PublicContentSection[] {
  return sections.map((section) => ({
    id: section.id,
    name: section.name,
    description: section.description,
    layoutType: section.layoutType,
    layoutConfig: section.layoutConfig,
    displayOrder: section.displayOrder,
    images: section.images.map((img) => ({
      propertyImageId: img.imageId ?? img.id,
      url: img.url,
      altText: img.title ?? undefined,
      displayOrder: img.displayOrder,
    })),
  }));
}

export default function PropertyContentSections({
  publicContentSections,
  legacySections,
  locale,
  className,
}: PropertyContentSectionsProps) {
  const resolved = useMemo(() => {
    const source =
      (publicContentSections?.length ?? 0) > 0
        ? publicContentSections!
        : legacySections?.length
          ? legacyDisplaySectionsToPublic(legacySections)
          : [];
    return resolveSectionsForDisplay(source, locale);
  }, [publicContentSections, legacySections, locale]);

  if (resolved.length === 0) {
    return null;
  }

  const wrapperClass = className ? `space-y-8 ${className}` : 'space-y-8';

  return (
    <div className={wrapperClass}>
      {resolved.map((section) => (
        <PropertySection key={section.id} section={section} />
      ))}
    </div>
  );
}
