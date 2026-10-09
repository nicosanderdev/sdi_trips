import type { PublicPropertyImage } from '../../types/guestReviewContract';

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
