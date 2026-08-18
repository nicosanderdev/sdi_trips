import type { GuestSiteListingType } from '../types/guestReviewContract';

const STORAGE_PREFIX = 'mp_pay_handoff:';

export interface MercadoPagoPayHandoff {
  bookingId: string;
  manageToken?: string;
  manageExpiresAt?: string;
  reservationCode?: string;
  listingType?: GuestSiteListingType;
}

function isExpired(expiresAt?: string): boolean {
  if (!expiresAt?.trim()) return false;
  const expires = Date.parse(expiresAt);
  return Number.isFinite(expires) && expires <= Date.now();
}

export function saveMercadoPagoPayHandoff(handoff: MercadoPagoPayHandoff): void {
  if (!handoff.bookingId.trim()) return;
  try {
    const existing = loadMercadoPagoPayHandoff(handoff.bookingId);
    const merged: MercadoPagoPayHandoff = {
      bookingId: handoff.bookingId,
      manageToken: handoff.manageToken?.trim() || existing?.manageToken,
      manageExpiresAt: handoff.manageExpiresAt?.trim() || existing?.manageExpiresAt,
      reservationCode: handoff.reservationCode?.trim() || existing?.reservationCode,
      listingType: handoff.listingType ?? existing?.listingType,
    };
    sessionStorage.setItem(`${STORAGE_PREFIX}${handoff.bookingId}`, JSON.stringify(merged));
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

export function getLiveManageToken(bookingId: string): string | null {
  const handoff = loadMercadoPagoPayHandoff(bookingId);
  const token = handoff?.manageToken?.trim();
  if (!token) return null;
  if (isExpired(handoff?.manageExpiresAt)) return null;
  return token;
}

export function clearMercadoPagoPayHandoff(bookingId: string): void {
  if (!bookingId.trim()) return;
  try {
    sessionStorage.removeItem(`${STORAGE_PREFIX}${bookingId}`);
  } catch {
    // ignore
  }
}
