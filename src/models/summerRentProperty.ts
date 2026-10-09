import type { Database } from '../types/supabase';
import type { PublicSummerRentListRow } from '../types/guestReviewContract';

type DbProperty = Database['public']['Tables']['EstateProperties']['Row'];
type DbListing = Database['public']['Tables']['Listings']['Row'];

export type { PublicSummerRentListRow };

export interface EstateProperty {
  Id: string;
  StreetName: string | null;
  HouseNumber: string | null;
  Neighborhood: string | null;
  City: string | null;
  State: string | null;
  ZipCode: string | null;
  Country: string | null;
  LocationLatitude: number;
  LocationLongitude: number;
  AreaValue: number | null;
  AreaUnit: number | null;
  Bedrooms: number;
  Bathrooms: number;
  HasGarage: boolean;
  GarageSpaces: number;
  OwnerId: string | null;
  IsDeleted: boolean;
  HasLaundryRoom: boolean;
  HasPool: boolean;
  HasBalcony: boolean;
  IsFurnished: boolean;
  Capacity: number | null;
  LocationCategory: DbProperty['LocationCategory'];
  ViewType: DbProperty['ViewType'];
}

export interface Listing {
  Id: string;
  EstatePropertyId: string;
  ListingType: DbListing['ListingType'];
  Description: string | null;
  AvailableFrom: string;
  Capacity: number | null;
  Currency: number;
  SalePrice: number | null;
  RentPrice: number | null;
  HasCommonExpenses: boolean;
  CommonExpensesValue: number | null;
  IsElectricityIncluded: boolean | null;
  IsWaterIncluded: boolean | null;
  IsPriceVisible: boolean;
  Status: number;
  IsActive: boolean;
  IsPropertyVisible: boolean;
  IsFeatured: boolean;
  BlockedForBooking: boolean;
  IsDeleted: boolean;
  Created: string;
  CreatedBy: string | null;
  LastModified: string;
  LastModifiedBy: string | null;
  Title: string | null;
}

export interface SummerRentExtension {
  EstatePropertyId: string;
  MinStayDays: number | null;
  MaxStayDays: number | null;
  LeadTimeDays: number | null;
  BufferDays: number | null;
  Created: string;
  CreatedBy: string | null;
  LastModified: string;
  LastModifiedBy: string | null;
  ICalExportToken: string | null;
}

/**
 * Shape returned by get_public_summer_rent_properties /
 * get_public_featured_summer_rent_properties / get_public_summer_rent_property_by_id.
 * Alias of the shared guest contract list row.
 */
export type RpcSummerRentPropertyRow = PublicSummerRentListRow;

export interface RpcPropertySectionImageRow {
  Id: string;
  PropertyImageId: string | null;
  R2Url: string;
  Title: string | null;
  Metadata: Record<string, unknown> | null;
  DisplayOrder: number | null;
}

export interface RpcPropertySectionRow {
  Id: string;
  Name: string;
  Description: string | null;
  LayoutType: 'split' | 'carousel' | 'stacked' | null;
  LayoutConfig: Record<string, unknown> | null;
  DisplayOrder: number | null;
  Images: RpcPropertySectionImageRow[] | null;
}
