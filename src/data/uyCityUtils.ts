import uyCitiesData from './uy-cities.json';

export interface UyCity {
  name: string;
  lat: string;
  long: string;
  zoom: string;
}

const uyCities: UyCity[] = uyCitiesData as UyCity[];

/** Portal RPC `p_city` matches EstateProperties.City (locality), not full uy-cities labels. */
export function portalRpcCityFromUyLabel(displayName: string): string {
  return displayName.split(',')[0]?.trim() || displayName;
}

export function findExactUyCityMatch(query: string): UyCity | undefined {
  const q = query.trim().toLowerCase();
  return uyCities.find((c) => c.name.toLowerCase() === q);
}

export function getUyCities(): UyCity[] {
  return uyCities;
}
