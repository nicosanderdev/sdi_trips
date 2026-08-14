/** Booking statuses where guests may see Mercado Pago pay UI on lookup. */
const MERCADO_PAGO_PAY_VISIBLE_STATUSES = new Set(['confirmed', 'completed']);

export function shouldShowMercadoPagoPay(status: string): boolean {
  return MERCADO_PAGO_PAY_VISIBLE_STATUSES.has(status);
}
