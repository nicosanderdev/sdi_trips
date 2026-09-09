/** Show Mercado Pago pay UI from RPC flags, not booking Status. Pending can pay. */
export function shouldShowMercadoPagoPay(options: {
  canPayOnline?: boolean;
  mercadoPagoApproved?: boolean;
}): boolean {
  return Boolean(options.canPayOnline || options.mercadoPagoApproved);
}
