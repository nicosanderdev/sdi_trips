import {
  loadMercadoPagoPayHandoff,
} from './mercadoPagoPayHandoff';

export type MercadoPagoReturnOutcome =
  | 'abandoned'
  | 'approved'
  | 'pending'
  | 'rejected'
  | 'unknown';

export interface MercadoPagoReturnQuery {
  bookingId: string;
  outcome: MercadoPagoReturnOutcome;
}

function isNullishMpValue(value: string | null): boolean {
  if (value == null) return true;
  const trimmed = value.trim();
  return trimmed === '' || trimmed.toLowerCase() === 'null';
}

/** Payment state Mercado Pago appended to the return URL. The URL never marks a booking paid. */
export function resolveMercadoPagoReturnOutcome(params: URLSearchParams): MercadoPagoReturnOutcome {
  if (isNullishMpValue(params.get('payment_id'))) return 'abandoned';

  const collectionStatus = params.get('collection_status');
  const rawStatus =
    collectionStatus != null && !isNullishMpValue(collectionStatus)
      ? collectionStatus
      : (params.getAll('status').at(-1) ?? '');

  switch (rawStatus.trim().toLowerCase()) {
    case 'approved':
      return 'approved';
    case 'pending':
    case 'in_process':
      return 'pending';
    case 'rejected':
      return 'rejected';
    default:
      return 'unknown';
  }
}

/** Listing return: only when Mercado Pago sent the guest back with `mpReturn=1` and `bookingId`. */
export function parseMercadoPagoListingReturn(params: URLSearchParams): MercadoPagoReturnQuery | null {
  if (params.get('mpReturn') !== '1') return null;
  const bookingId = params.get('bookingId')?.trim() ?? '';
  if (!bookingId) return null;
  return { bookingId, outcome: resolveMercadoPagoReturnOutcome(params) };
}

export function hasMercadoPagoReturnSignal(params: URLSearchParams): boolean {
  if (params.get('mpReturn') === '1') return true;
  if (params.get('bookingId')?.trim()) return true;
  if (params.has('payment_id') || params.has('collection_status') || params.has('collection_id')) {
    return true;
  }
  return params.getAll('status').some((value) => value.trim() !== '');
}

/**
 * Legacy `/pago-mercado-pago/resultado` preferences.
 * When the stash matches `bookingId` and has a listing id, reopen that listing on this site.
 */
export function buildLegacyListingRedirect(
  params: URLSearchParams,
  listingBasePath: '/property' | '/venue',
): string | null {
  const bookingId = params.get('bookingId')?.trim() ?? '';
  if (!bookingId) return null;
  const handoff = loadMercadoPagoPayHandoff(bookingId);
  const propertyId = handoff?.propertyId?.trim();
  if (!handoff || handoff.bookingId !== bookingId || !propertyId) return null;
  const next = new URLSearchParams(params);
  next.set('mpReturn', '1');
  return `${listingBasePath}/${propertyId}?${next.toString()}`;
}
