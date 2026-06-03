import type {
  PropertyContentSection,
  PropertySectionImage,
  PropertySectionLayoutConfig,
  SectionLayoutType,
} from '../../types';
import { pickLocalizedText, type LocalizedLanguage } from './localizedText';

export interface PublicContentSectionImage {
  propertyImageId?: string;
  url: string;
  altText?: string;
  displayOrder?: number;
}

export interface PublicContentSection {
  id: string;
  propertyType?: string;
  localizedName?: Partial<Record<LocalizedLanguage, string>>;
  localizedDescription?: Partial<Record<LocalizedLanguage, string>>;
  /** Legacy plain text from table or old RPC builders */
  name?: string;
  description?: string | null;
  layoutType?: SectionLayoutType | string;
  layoutConfig?: PropertySectionLayoutConfig | Record<string, unknown> | string | null;
  displayOrder?: number;
  images?: PublicContentSectionImage[];
}

function isValidLayoutType(value: string | null | undefined): value is SectionLayoutType {
  return value === 'split' || value === 'carousel' || value === 'stacked';
}

export function parseLayoutConfig(
  raw: PropertySectionLayoutConfig | Record<string, unknown> | string | null | undefined,
): PropertySectionLayoutConfig | undefined {
  if (!raw) return undefined;
  let obj: Record<string, unknown>;
  if (typeof raw === 'string') {
    try {
      obj = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return undefined;
    }
  } else if (typeof raw === 'object') {
    obj = raw as Record<string, unknown>;
  } else {
    return undefined;
  }

  const config: PropertySectionLayoutConfig = {};
  const dp = obj.descriptionPosition;
  if (dp === 'top' || dp === 'right' || dp === 'bottom') {
    config.descriptionPosition = dp;
  }
  const co = obj.contentOrder;
  if (co === 'text-first' || co === 'images-first') {
    config.contentOrder = co;
  }
  const dv = obj.displayVariant;
  if (dv === 'default' || dv === 'compact' || dv === 'hero') {
    config.displayVariant = dv;
  }
  return Object.keys(config).length ? config : undefined;
}

export function parseContentSections(raw: unknown): PublicContentSection[] {
  if (!raw) return [];
  let arr: unknown[];
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      arr = Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  } else {
    return [];
  }

  return arr
    .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
    .map((item) => {
      const id = String(item.id ?? item.Id ?? '');
      const imagesRaw = (item.images ?? item.Images) as unknown;
      const images = parseSectionImages(imagesRaw);

      return {
        id,
        propertyType: (item.propertyType ?? item.PropertyType) as string | undefined,
        localizedName: (item.localizedName ?? item.LocalizedName) as
          | Partial<Record<LocalizedLanguage, string>>
          | undefined,
        localizedDescription: (item.localizedDescription ?? item.LocalizedDescription) as
          | Partial<Record<LocalizedLanguage, string>>
          | undefined,
        name: (item.name ?? item.Name) as string | undefined,
        description: (item.description ?? item.Description) as string | null | undefined,
        layoutType: (item.layoutType ?? item.LayoutType) as string | undefined,
        layoutConfig: (item.layoutConfig ?? item.LayoutConfig) as PublicContentSection['layoutConfig'],
        displayOrder: (item.displayOrder ?? item.DisplayOrder) as number | undefined,
        images,
      } satisfies PublicContentSection;
    })
    .filter((s) => s.id);
}

function parseSectionImages(raw: unknown): PublicContentSectionImage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
    .map((img, index) => ({
      propertyImageId: (img.propertyImageId ?? img.PropertyImageId) as string | undefined,
      url: String(img.url ?? img.R2Url ?? ''),
      altText: (img.altText ?? img.AltText ?? img.Title ?? img.title) as string | undefined,
      displayOrder: (img.displayOrder ?? img.DisplayOrder ?? index) as number,
    }))
    .filter((img) => img.url)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

export function pickSectionName(section: PublicContentSection, preferredLocale?: string): string | undefined {
  const localized = pickLocalizedText(section.localizedName, preferredLocale);
  if (localized) return localized;
  const legacy = section.name?.trim();
  return legacy || undefined;
}

export function pickSectionDescription(
  section: PublicContentSection,
  preferredLocale?: string,
): string | undefined {
  const localized = pickLocalizedText(section.localizedDescription, preferredLocale);
  if (localized) return localized;
  const legacy = section.description?.trim();
  return legacy || undefined;
}

function mapImagesToDisplay(images: PublicContentSectionImage[] | undefined): PropertySectionImage[] {
  if (!images?.length) return [];
  return images.map((img, index) => ({
    id: img.propertyImageId ?? `section-img-${index}`,
    imageId: img.propertyImageId,
    url: img.url,
    title: img.altText ?? null,
    displayOrder: img.displayOrder,
  }));
}

/** Convert legacy SectionData rows into PublicContentSection shape for fallback. */
export function legacySectionDataToPublic(
  sections: Array<{
    Id: string;
    Name: string;
    Description: string | null;
    LayoutType: string | null;
    LayoutConfig: Record<string, unknown> | null;
    DisplayOrder: number | null;
    Images?: Array<{
      Id: string;
      PropertyImageId: string | null;
      R2Url: string;
      Title: string | null;
      Metadata?: Record<string, unknown> | null;
      DisplayOrder: number | null;
    }> | null;
  }>,
): PublicContentSection[] {
  return sections.map((section) => ({
    id: section.Id,
    name: section.Name,
    description: section.Description,
    layoutType: section.LayoutType ?? 'split',
    layoutConfig: section.LayoutConfig,
    displayOrder: section.DisplayOrder ?? undefined,
    images: (section.Images ?? []).map((image) => ({
      propertyImageId: image.PropertyImageId ?? image.Id,
      url: image.R2Url,
      altText: image.Title ?? undefined,
      displayOrder: image.DisplayOrder ?? undefined,
    })),
  }));
}

/** Prefer ContentSections JSON; fall back to legacy SectionData from RPC. */
export function resolvePublicContentSectionsFromRow(
  contentSections: unknown,
  sectionData: Parameters<typeof legacySectionDataToPublic>[0] | null | undefined,
): PublicContentSection[] {
  const parsed = parseContentSections(contentSections);
  if (parsed.length > 0) return parsed;
  if (sectionData?.length) return legacySectionDataToPublic(sectionData);
  return [];
}

export function resolveSectionsForDisplay(
  sections: PublicContentSection[],
  locale: string,
): PropertyContentSection[] {
  return sections
    .slice()
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((section) => {
      const name = pickSectionName(section, locale);
      const description = pickSectionDescription(section, locale);
      const layoutType = isValidLayoutType(section.layoutType) ? section.layoutType : 'split';

      return {
        id: section.id,
        name: name ?? '',
        description: description ?? null,
        layoutType,
        layoutConfig: parseLayoutConfig(section.layoutConfig),
        displayOrder: section.displayOrder,
        images: mapImagesToDisplay(section.images),
      };
    })
    .filter((s) => s.name.trim() || (s.description?.trim() ?? '') || s.images.length > 0);
}
