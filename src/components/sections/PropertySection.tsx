import type { PropertyContentSection, PropertySectionLayoutConfig, SectionLayoutType } from '../../types';
import SectionImageGallery from './SectionImageGallery';

interface PropertySectionProps {
  section: PropertyContentSection;
  className?: string;
}

function withClassName(base: string, className?: string): string {
  return className ? `${base} ${className}` : base;
}

function resolveLayoutType(layoutType?: SectionLayoutType): SectionLayoutType {
  if (layoutType === 'carousel' || layoutType === 'stacked' || layoutType === 'split') {
    return layoutType;
  }
  return 'split';
}

function resolveDescriptionPosition(layoutConfig?: PropertySectionLayoutConfig | null): 'top' | 'right' | 'bottom' {
  if (
    layoutConfig?.descriptionPosition === 'top' ||
    layoutConfig?.descriptionPosition === 'right' ||
    layoutConfig?.descriptionPosition === 'bottom'
  ) {
    return layoutConfig.descriptionPosition;
  }
  return 'bottom';
}

function resolveContentOrder(layoutConfig?: PropertySectionLayoutConfig | null): 'text-first' | 'images-first' {
  return layoutConfig?.contentOrder === 'images-first' ? 'images-first' : 'text-first';
}

export default function PropertySection({ section, className }: PropertySectionProps) {
  const layoutType = resolveLayoutType(section.layoutType);
  const description = section.description?.trim();
  const hasImages = section.images.length > 0;

  const descriptionBlock = description ? (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold text-navy">{section.name}</h3>
      <p className="text-sm leading-relaxed text-charcoal">{description}</p>
    </div>
  ) : (
    <h3 className="text-xl font-semibold text-navy">{section.name}</h3>
  );

  if (layoutType === 'carousel') {
    const descriptionPosition = resolveDescriptionPosition(section.layoutConfig);
    return (
      <section className={withClassName('space-y-4 rounded-4xl border border-warm-gray bg-white/90 p-6', className)}>
        {descriptionPosition === 'top' ? descriptionBlock : null}
        <div className={descriptionPosition === 'right' ? 'grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start' : ''}>
          {hasImages ? <SectionImageGallery images={section.images} mode="carousel" /> : null}
          {descriptionPosition === 'right' ? descriptionBlock : null}
        </div>
        {descriptionPosition === 'bottom' ? descriptionBlock : null}
      </section>
    );
  }

  if (layoutType === 'stacked') {
    const contentOrder = resolveContentOrder(section.layoutConfig);
    return (
      <section className={withClassName('space-y-4 rounded-4xl border border-warm-gray bg-white/90 p-6', className)}>
        {contentOrder === 'text-first' ? descriptionBlock : null}
        {hasImages ? <SectionImageGallery images={section.images} mode="grid" /> : null}
        {contentOrder === 'images-first' ? descriptionBlock : null}
      </section>
    );
  }

  return (
    <section className={withClassName('rounded-4xl border border-warm-gray bg-white/90 p-6', className)}>
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div>{descriptionBlock}</div>
        {hasImages ? <SectionImageGallery images={section.images} mode="grid" /> : null}
      </div>
    </section>
  );
}
