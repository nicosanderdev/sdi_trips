import type { PublicPropertyImage } from '../../types/guestReviewContract';
import { resolveAssetUrl } from '../../utils/resolveAssetUrl';

/**
 * Parse public detail-RPC `Images` jsonb into ordered gallery items.
 * Accepts camelCase (shipped) and PascalCase for older payloads.
 */
export function parsePublicPropertyImages(raw: unknown): PublicPropertyImage[] {
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
    .map((item, index) => {
      const url = String(item.url ?? item.Url ?? '').trim();
      const propertyImageId = String(
        item.propertyImageId ?? item.PropertyImageId ?? item.id ?? item.Id ?? '',
      );
      return {
        propertyImageId: propertyImageId || `img-${index}`,
        url,
        altText: (item.altText ?? item.AltText ?? null) as string | null,
        isMain: Boolean(item.isMain ?? item.IsMain),
        displayOrder: Number(item.displayOrder ?? item.DisplayOrder ?? index) || 0,
      } satisfies PublicPropertyImage;
    })
    .filter((img) => Boolean(img.url))
    .sort((a, b) => {
      if (Boolean(a.isMain) !== Boolean(b.isMain)) return a.isMain ? -1 : 1;
      return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    });
}

export interface RpcImageFields {
  MainImageUrl?: string | null;
  MainImageAltText?: string | null;
  Images?: unknown;
}

/**
 * Map list/detail RPC image fields onto Property-compatible gallery fields.
 * Featured URL: first Images url, else MainImageUrl. Pass URLs through as-is.
 */
export function mapRpcImageFields(row: RpcImageFields): {
  images: string[];
  publicImages?: PublicPropertyImage[];
  imageAltText?: string | null;
} {
  const publicImages = parsePublicPropertyImages(row.Images);
  const mainUrl =
    typeof row.MainImageUrl === 'string' && row.MainImageUrl.trim()
      ? row.MainImageUrl.trim()
      : null;
  const mainAlt =
    row.MainImageAltText != null && String(row.MainImageAltText).trim()
      ? String(row.MainImageAltText).trim()
      : null;

  if (publicImages.length > 0) {
    return {
      images: publicImages.map((img) => img.url),
      publicImages,
      imageAltText: publicImages[0]?.altText ?? mainAlt,
    };
  }

  if (mainUrl) {
    return {
      images: [mainUrl],
      imageAltText: mainAlt,
    };
  }

  return { images: [] };
}

/** Minimal gallery item used when splitting hero vs all-photos lists. */
export interface GalleryPartitionImage {
  propertyImageId?: string;
  url: string;
  alt?: string;
}

/** Section image ref used only for membership checks against the gallery. */
export interface SectionImageRef {
  propertyImageId?: string;
  url: string;
}

function isRealPropertyImageId(id: string | undefined): id is string {
  if (!id?.trim()) return false;
  // Synthetics from parsers when the RPC omitted a real id
  if (/^(img|section-img)-\d+$/i.test(id)) return false;
  return true;
}

/**
 * Split the property gallery so section photos are omitted from the hero carousel
 * but remain in the full All photos list (order unchanged).
 */
export function partitionGalleryBySectionImages(
  gallery: GalleryPartitionImage[],
  sectionImages: SectionImageRef[],
): { heroImages: GalleryPartitionImage[]; allImages: GalleryPartitionImage[] } {
  const allImages = gallery.slice();
  if (gallery.length === 0 || sectionImages.length === 0) {
    return { heroImages: allImages, allImages };
  }

  const sectionIds = new Set<string>();
  const sectionUrls = new Set<string>();
  for (const img of sectionImages) {
    if (isRealPropertyImageId(img.propertyImageId)) {
      sectionIds.add(img.propertyImageId);
    }
    const resolved = resolveAssetUrl(img.url);
    if (resolved) sectionUrls.add(resolved);
  }

  const heroImages = gallery.filter((img) => {
    if (isRealPropertyImageId(img.propertyImageId) && sectionIds.has(img.propertyImageId)) {
      return false;
    }
    const resolved = resolveAssetUrl(img.url);
    if (resolved && sectionUrls.has(resolved)) {
      return false;
    }
    return true;
  });

  return { heroImages, allImages };
}
