import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PropertySectionImage } from '../../types';

type GalleryMode = 'carousel' | 'grid' | 'strip';

interface SectionImageGalleryProps {
  images: PropertySectionImage[];
  mode?: GalleryMode;
  className?: string;
  mainImageClassName?: string;
  gridImageClassName?: string;
}

const STRIP_GAP_PX = 16;

function normalizeClassName(className?: string): string {
  return className ? ` ${className}` : '';
}

export default function SectionImageGallery({
  images,
  mode = 'grid',
  className,
  mainImageClassName = 'h-72',
  gridImageClassName = 'aspect-[4/3]',
}: SectionImageGalleryProps) {
  const sortedImages = useMemo(
    () => [...images].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [images],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (mode !== 'strip') return;
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      setCanScrollPrev(el.scrollLeft > 4);
      setCanScrollNext(maxScroll > 4 && el.scrollLeft < maxScroll - 4);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [mode, sortedImages]);

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
            className={`${mainImageClassName} w-full object-cover`}
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

  if (mode === 'strip') {
    const slideWidthClass =
      sortedImages.length > 1 ? 'w-[85%] sm:w-[calc((100%-1rem)/2)]' : 'w-full';

    const scrollBySlide = (direction: -1 | 1) => {
      const el = scrollerRef.current;
      const slide = el?.querySelector<HTMLElement>('[data-strip-slide]');
      if (!el || !slide) return;
      el.scrollBy({ left: direction * (slide.offsetWidth + STRIP_GAP_PX), behavior: 'smooth' });
    };

    return (
      <div className={`relative${normalizeClassName(className)}`}>
        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory"
        >
          {sortedImages.map((image) => (
            <div
              key={image.id}
              data-strip-slide
              className={`${slideWidthClass} shrink-0 snap-start overflow-hidden rounded-2xl border border-warm-gray bg-white/80`}
            >
              <img
                src={image.url}
                alt={image.title ?? 'Section image'}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          ))}
        </div>
        {canScrollPrev ? (
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => scrollBySlide(-1)}
            className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-lg transition-colors hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5 text-navy" />
          </button>
        ) : null}
        {canScrollNext ? (
          <button
            type="button"
            aria-label="Next image"
            onClick={() => scrollBySlide(1)}
            className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-lg transition-colors hover:bg-white"
          >
            <ChevronRight className="h-5 w-5 text-navy" />
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`grid gap-3 sm:grid-cols-2${normalizeClassName(className)}`}>
      {sortedImages.map((image) => (
        <div key={image.id} className="overflow-hidden rounded-2xl border border-warm-gray bg-white/80">
          <img
            src={image.url}
            alt={image.title ?? 'Section image'}
            className={`${gridImageClassName} w-full object-cover`}
          />
        </div>
      ))}
    </div>
  );
}
