import type { GuestSiteListingType } from '../types/guestReviewContract';

const STORAGE_PREFIX = 'mp_pay_handoff:';

export interface MercadoPagoPayHandoff {
  bookingId: string;
  manageToken?: string;
  reservationCode?: string;
  listingType?: GuestSiteListingType;
}

export function saveMercadoPagoPayHandoff(handoff: MercadoPagoPayHandoff): void {
  if (!handoff.bookingId.trim()) return;
  try {
    sessionStorage.setItem(
      `${STORAGE_PREFIX}${handoff.bookingId}`,
      JSON.stringify({
        bookingId: handoff.bookingId,
        manageToken: handoff.manageToken?.trim() || undefined,
        reservationCode: handoff.reservationCode?.trim() || undefined,
        listingType: handoff.listingType,
      } satisfies MercadoPagoPayHandoff),
    );
  } catch {
    // sessionStorage may be unavailable (private mode / quota); continue without handoff.
  }
}

export function loadMercadoPagoPayHandoff(bookingId: string): MercadoPagoPayHandoff | null {
  if (!bookingId.trim()) return null;
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${bookingId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MercadoPagoPayHandoff;
    if (!parsed?.bookingId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearMercadoPagoPayHandoff(bookingId: string): void {
  if (!bookingId.trim()) return;
  try {
    sessionStorage.removeItem(`${STORAGE_PREFIX}${bookingId}`);
  } catch {
    // ignore
  }
}
