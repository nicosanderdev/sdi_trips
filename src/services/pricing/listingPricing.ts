import type { Property } from '../../types';
import type { GuestSiteListingType } from '../../types/guestReviewContract';
import type { ListingPricingInput, SearchContext } from './types';

export function listingPricingFromProperty(property: Property): ListingPricingInput {
  const base =
    property.basePrice ??
    property.price ??
    0;

  return {
    listingId: property.listingId,
    basePrice: base,
    minPrice: property.minPrice ?? null,
    maxPrice: property.maxPrice ?? null,
    longStayDiscountEnabled: property.longStayDiscountEnabled,
    longStayMinDays: property.longStayMinDays ?? null,
    longStayDiscountPercentage: property.longStayDiscountPercentage ?? null,
  };
}

export function toIsoDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function buildSearchContext(
  siteListingType: GuestSiteListingType,
  checkIn?: Date | null,
  checkOut?: Date | null,
  guests?: number,
): SearchContext {
  return {
    siteListingType,
    checkIn: checkIn ? toIsoDate(checkIn) : undefined,
    checkOut: checkOut ? toIsoDate(checkOut) : undefined,
    guests,
  };
}

/** Read dynamic pricing columns from RPC rows (PascalCase or camelCase). */
export function mapRpcPricingFields(row: Record<string, unknown>): {
  listingId?: string;
  basePrice: number;
  minPrice?: number | null;
  maxPrice?: number | null;
  longStayDiscountEnabled?: boolean;
  longStayMinDays?: number | null;
  longStayDiscountPercentage?: number | null;
} {
  const num = (key: string, alt?: string): number | null | undefined => {
    const v = row[key] ?? (alt ? row[alt] : undefined);
    if (v == null || v === '') return undefined;
    return typeof v === 'number' ? v : parseFloat(String(v));
  };
  const bool = (key: string, alt?: string): boolean | undefined => {
    const v = row[key] ?? (alt ? row[alt] : undefined);
    if (v == null) return undefined;
    return Boolean(v);
  };

  const rent = num('RentPrice', 'rentPrice') ?? 0;
  const sale = num('SalePrice', 'salePrice');
  const base =
    num('BasePrice', 'basePrice') ??
    (rent || sale || 0);

  return {
    listingId:
      (row.ListingId as string | undefined) ??
      (row.listingId as string | undefined),
    basePrice: base,
    minPrice: num('MinPrice', 'minPrice') ?? null,
    maxPrice: num('MaxPrice', 'maxPrice') ?? null,
    longStayDiscountEnabled: bool('LongStayDiscountEnabled', 'longStayDiscountEnabled'),
    longStayMinDays: num('LongStayMinDays', 'longStayMinDays') ?? null,
    longStayDiscountPercentage:
      num('LongStayDiscountPercentage', 'longStayDiscountPercentage') ?? null,
  };
}
