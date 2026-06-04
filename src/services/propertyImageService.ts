import { supabase } from '../lib/supabase';
import { resolveAssetUrl } from '../utils/resolveAssetUrl';

interface PropertyImageRow {
  EstatePropertyId: string;
  Url: string;
  IsMain: boolean;
  DisplayOrder: number;
}

function sortPropertyImages(rows: PropertyImageRow[]): PropertyImageRow[] {
  return [...rows].sort((a, b) => {
    if (a.IsMain !== b.IsMain) return a.IsMain ? -1 : 1;
    return a.DisplayOrder - b.DisplayOrder;
  });
}

export async function fetchPropertyImagesByPropertyIds(
  propertyIds: string[],
): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>();
  if (propertyIds.length === 0) return result;

  const uniqueIds = [...new Set(propertyIds)];

  const { data, error } = await supabase
    .from('PropertyImages')
    .select('EstatePropertyId, Url, IsMain, DisplayOrder')
    .in('EstatePropertyId', uniqueIds)
    .eq('IsDeleted', false);

  if (error) {
    console.error('Error fetching property images:', error);
    return result;
  }

  const grouped = new Map<string, PropertyImageRow[]>();
  for (const row of (data ?? []) as PropertyImageRow[]) {
    const existing = grouped.get(row.EstatePropertyId) ?? [];
    existing.push(row);
    grouped.set(row.EstatePropertyId, existing);
  }

  for (const [propertyId, rows] of grouped) {
    const urls = sortPropertyImages(rows)
      .map((row) => resolveAssetUrl(row.Url))
      .filter(Boolean);
    if (urls.length > 0) {
      result.set(propertyId, urls);
    }
  }

  return result;
}

export async function enrichPropertiesWithImages<T extends { id: string; images: string[] }>(
  properties: T[],
): Promise<T[]> {
  if (properties.length === 0) return properties;

  const imageMap = await fetchPropertyImagesByPropertyIds(properties.map((p) => p.id));

  return properties.map((property) => ({
    ...property,
    images: imageMap.get(property.id) ?? [],
  }));
}
