import type { TFunction } from 'i18next';
import { STATIC_VENUE_CORES, type StaticVenueCore } from './staticVenues';

export type LocalizedVenue = StaticVenueCore & {
  name: string;
  location: string;
  priceHint: string;
  subtitle: string;
  description: string;
  amenities: string[];
  eventTypes: string[];
  layoutNotes: string;
  policies: { title: string; body: string }[];
};

export function localizeVenue(core: StaticVenueCore, t: TFunction): LocalizedVenue {
  const base = `alt.venues.byId.${core.id}`;
  const amenities = t(`${base}.amenities`, { returnObjects: true });
  const eventTypes = t(`${base}.eventTypes`, { returnObjects: true });
  const policies = t(`${base}.policies`, { returnObjects: true });
  return {
    ...core,
    name: t(`${base}.name`),
    location: t(`${base}.location`),
    priceHint: t(`${base}.priceHint`),
    subtitle: t(`${base}.subtitle`),
    description: t(`${base}.description`),
    layoutNotes: t(`${base}.layoutNotes`),
    amenities: Array.isArray(amenities) ? (amenities as string[]) : [],
    eventTypes: Array.isArray(eventTypes) ? (eventTypes as string[]) : [],
    policies: Array.isArray(policies) ? (policies as { title: string; body: string }[]) : [],
  };
}

export function listLocalizedVenues(t: TFunction): LocalizedVenue[] {
  return STATIC_VENUE_CORES.map((c) => localizeVenue(c, t));
}

export function getLocalizedVenueById(id: string, t: TFunction): LocalizedVenue | undefined {
  const core = STATIC_VENUE_CORES.find((c) => c.id === id);
  return core ? localizeVenue(core, t) : undefined;
}
