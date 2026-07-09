export const AMENITY_LANGS = ['es', 'en', 'pt'] as const;
export type AmenityLanguage = (typeof AMENITY_LANGS)[number];

export interface PublicAmenity {
  id: string;
  name: string;
  iconId?: string | null;
  descriptions?: Partial<Record<AmenityLanguage, string>>;
}

export function parseAmenities(raw: unknown): PublicAmenity[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as PublicAmenity[];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as PublicAmenity[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function pickAmenityDescription(
  descriptions: Partial<Record<AmenityLanguage, string>> | undefined,
  preferredLocale?: string,
): string | undefined {
  if (!descriptions) return undefined;
  const pref = preferredLocale?.toLowerCase().slice(0, 2) as AmenityLanguage | undefined;
  const order: AmenityLanguage[] = [];
  if (pref && AMENITY_LANGS.includes(pref)) order.push(pref);
  for (const lang of AMENITY_LANGS) {
    if (!order.includes(lang)) order.push(lang);
  }
  for (const lang of order) {
    const v = descriptions[lang]?.trim();
    if (v) return v;
  }
  return undefined;
}

export function amenitiesFromNames(names: string[]): PublicAmenity[] {
  return names.map((name, index) => ({
    id: `name-${index}-${name}`,
    name,
  }));
}

export interface AmenityWithDescription {
  amenity: PublicAmenity;
  description: string;
}

export function partitionAmenitiesForDisplay(
  amenities: PublicAmenity[],
  locale: string,
): { withDescription: AmenityWithDescription[]; nameOnly: PublicAmenity[] } {
  const withDescription: AmenityWithDescription[] = [];
  const nameOnly: PublicAmenity[] = [];

  for (const amenity of amenities) {
    const description = pickAmenityDescription(amenity.descriptions, locale);
    if (description) {
      withDescription.push({ amenity, description });
    } else {
      nameOnly.push(amenity);
    }
  }

  return { withDescription, nameOnly };
}
