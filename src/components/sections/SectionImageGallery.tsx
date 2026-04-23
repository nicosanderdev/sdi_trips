import { useMemo, useState } from 'react';
import type { PropertySectionImage } from '../../types';

type GalleryMode = 'carousel' | 'grid';

interface SectionImageGalleryProps {
  images: PropertySectionImage[];
  mode?: GalleryMode;
  className?: string;
}

function normalizeClassName(className?: string): string {
  return className ? ` ${className}` : '';
}

export default function SectionImageGallery({
  images,
  mode = 'grid',
  className,
}: SectionImageGalleryProps) {
  const sortedImages = useMemo(
    () => [...images].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [images],
  );
  const [activeIndex, setActiveIndex] = useState(0);

  if (!sortedImages.length) {
    return null;
  }

  if (mode === 'carousel') {
    const safeIndex = activeIndex % sortedImages.length;
    const currentImage = sortedImages[safeIndex];

    return (
      <div className={`space-y-3${normalizeClassName(className)}`}>
        <div className="relative overflow-hidden rounded-3xl border border-warm-gray bg-white/80">
          <img
            src={currentImage.url}
            alt={currentImage.title ?? 'Section image'}
            className="h-72 w-full object-cover"
          />
        </div>
        {sortedImages.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto py-1">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border ${
                  index === safeIndex ? 'border-gold' : 'border-transparent'
                }`}
              >
                <img src={image.url} alt={image.title ?? `Image ${index + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`grid gap-3 sm:grid-cols-2${normalizeClassName(className)}`}>
      {sortedImages.map((image) => (
        <div key={image.id} className="overflow-hidden rounded-2xl border border-warm-gray bg-white/80">
          <img src={image.url} alt={image.title ?? 'Section image'} className="h-48 w-full object-cover" />
        </div>
      ))}
    </div>
  );
}
