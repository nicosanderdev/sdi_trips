import type { Database } from '../types/supabase';

type DbProperty = Database['public']['Tables']['EstateProperties']['Row'];
type DbListing = Database['public']['Tables']['Listings']['Row'];

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
 * Shape returned by get_public_summer_rent_properties / get_public_summer_rent_property_by_id.
 * Ordered by EstateProperties -> Listings -> SummerRentExtension.
 */
export interface RpcSummerRentPropertyRow {
  EstatePropertyId: EstateProperty['Id'];
  StreetName: EstateProperty['StreetName'] | null;
  HouseNumber: EstateProperty['HouseNumber'] | null;
  Neighborhood: EstateProperty['Neighborhood'] | null;
  City: EstateProperty['City'] | null;
  State: EstateProperty['State'] | null;
  ZipCode: EstateProperty['ZipCode'] | null;
  Country: EstateProperty['Country'] | null;
  LocationLatitude: EstateProperty['LocationLatitude'];
  LocationLongitude: EstateProperty['LocationLongitude'];
  AreaValue: EstateProperty['AreaValue'] | null;
  AreaUnit: EstateProperty['AreaUnit'] | null;
  Bedrooms: EstateProperty['Bedrooms'];
  Bathrooms: EstateProperty['Bathrooms'];
  HasGarage: EstateProperty['HasGarage'];
  GarageSpaces: EstateProperty['GarageSpaces'];
  OwnerId: EstateProperty['OwnerId'] | null;
  IsDeleted: EstateProperty['IsDeleted'];
  HasLaundryRoom: EstateProperty['HasLaundryRoom'];
  HasPool: EstateProperty['HasPool'];
  HasBalcony: EstateProperty['HasBalcony'];
  IsFurnished: EstateProperty['IsFurnished'];
  Capacity: EstateProperty['Capacity'] | null;
  LocationCategory: EstateProperty['LocationCategory'];
  ViewType: EstateProperty['ViewType'];

  ListingId: Listing['Id'];
  ListingType: Listing['ListingType'];
  ListingDescription: Listing['Description'];
  AvailableFrom: Listing['AvailableFrom'];
  ListingCapacity: Listing['Capacity'];
  Currency: Listing['Currency'];
  SalePrice: Listing['SalePrice'];
  RentPrice: Listing['RentPrice'];
  HasCommonExpenses: Listing['HasCommonExpenses'];
  CommonExpensesValue: Listing['CommonExpensesValue'];
  IsElectricityIncluded: Listing['IsElectricityIncluded'];
  IsWaterIncluded: Listing['IsWaterIncluded'];
  IsPriceVisible: Listing['IsPriceVisible'];
  Status: Listing['Status'];
  IsActive: Listing['IsActive'];
  IsPropertyVisible: Listing['IsPropertyVisible'];
  IsFeatured: Listing['IsFeatured'];
  BlockedForBooking: Listing['BlockedForBooking'];
  Title: Listing['Title'];

  MinStayDays: SummerRentExtension['MinStayDays'];
  MaxStayDays: SummerRentExtension['MaxStayDays'];
  LeadTimeDays: SummerRentExtension['LeadTimeDays'];
  BufferDays: SummerRentExtension['BufferDays'];

  AmenityNames: string[] | null;
}
