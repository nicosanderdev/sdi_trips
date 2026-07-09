import type {
  PropertyContentSection,
  PropertySectionLayoutConfig,
  SectionDisplayVariant,
  SectionLayoutType,
} from '../../types';
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

function resolveDisplayVariant(layoutConfig?: PropertySectionLayoutConfig | null): SectionDisplayVariant {
  const v = layoutConfig?.displayVariant;
  if (v === 'compact' || v === 'hero') return v;
  return 'default';
}

function sectionShellClass(variant: SectionDisplayVariant): string {
  if (variant === 'compact') return 'space-y-3 rounded-3xl border border-warm-gray bg-white/90 p-4';
  if (variant === 'hero') return 'space-y-5 rounded-[2rem] border border-warm-gray bg-white/90 p-6 shadow-[0_20px_45px_-25px_rgba(43,43,43,0.2)]';
  return 'space-y-4 rounded-4xl border border-warm-gray bg-white/90 p-6';
}

function carouselImageHeightClass(variant: SectionDisplayVariant): string {
  if (variant === 'hero') return 'h-96 min-h-[24rem] md:h-[28rem]';
  if (variant === 'compact') return 'h-48';
  return 'h-72';
}

function gridImageHeightClass(variant: SectionDisplayVariant): string {
  if (variant === 'hero') return 'h-56 md:h-64';
  if (variant === 'compact') return 'h-36';
  return 'h-48';
}

function headingClass(variant: SectionDisplayVariant): string {
  if (variant === 'hero') return 'text-2xl font-semibold text-navy';
  return 'text-xl font-semibold text-navy';
}

export default function PropertySection({ section, className }: PropertySectionProps) {
  const layoutType = resolveLayoutType(section.layoutType);
  const displayVariant = resolveDisplayVariant(section.layoutConfig);
  const description = section.description?.trim();
  const hasImages = section.images.length > 0;
  const shellClass = sectionShellClass(displayVariant);

  const descriptionBlock = description ? (
    <div className="space-y-2">
      <h3 className={headingClass(displayVariant)}>{section.name}</h3>
      <p className="text-sm leading-relaxed text-charcoal">{description}</p>
    </div>
  ) : (
    <h3 className={headingClass(displayVariant)}>{section.name}</h3>
  );

  if (layoutType === 'carousel') {
    const descriptionPosition = resolveDescriptionPosition(section.layoutConfig);
    return (
      <section className={withClassName(shellClass, className)}>
        {descriptionPosition === 'top' ? descriptionBlock : null}
        <div
          className={
            descriptionPosition === 'right'
              ? 'grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start'
              : ''
          }
        >
          {hasImages ? (
            <SectionImageGallery
              images={section.images}
              mode="carousel"
              mainImageClassName={carouselImageHeightClass(displayVariant)}
            />
          ) : null}
          {descriptionPosition === 'right' ? descriptionBlock : null}
        </div>
        {descriptionPosition === 'bottom' ? descriptionBlock : null}
      </section>
    );
  }

  if (layoutType === 'stacked') {
    const contentOrder = resolveContentOrder(section.layoutConfig);
    return (
      <section className={withClassName(shellClass, className)}>
        {contentOrder === 'text-first' ? descriptionBlock : null}
        {hasImages ? (
          <SectionImageGallery
            images={section.images}
            mode="grid"
            gridImageClassName={gridImageHeightClass(displayVariant)}
          />
        ) : null}
        {contentOrder === 'images-first' ? descriptionBlock : null}
      </section>
    );
  }

  return (
    <section className={withClassName(shellClass, className)}>
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div>{descriptionBlock}</div>
        {hasImages ? (
          <SectionImageGallery
            images={section.images}
            mode="grid"
            gridImageClassName={gridImageHeightClass(displayVariant)}
          />
        ) : null}
      </div>
    </section>
  );
}
