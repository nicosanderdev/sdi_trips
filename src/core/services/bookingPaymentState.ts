export type PaymentStateKey = 'notPaid' | 'depositPending' | 'depositPaid' | 'paid';

/** Guest-facing payment state from amounts. PaymentStatus 1 is a recorded payment. */
export function resolvePaymentStateKey(options: {
  amountPaid?: number | null;
  depositAmount?: number | null;
  totalAmount?: number | null;
  paymentStatus?: number | null;
}): PaymentStateKey {
  if (options.paymentStatus === 1) return 'paid';

  const paid =
    options.amountPaid != null && Number.isFinite(options.amountPaid) ? options.amountPaid : 0;
  const total =
    options.totalAmount != null && Number.isFinite(options.totalAmount) ? options.totalAmount : null;
  const deposit =
    options.depositAmount != null && Number.isFinite(options.depositAmount)
      ? options.depositAmount
      : null;
  const hasPartialDeposit = deposit != null && (total == null || deposit + 0.009 < total);

  if (total != null && paid + 0.009 >= total) return 'paid';
  if (paid <= 0.009) return hasPartialDeposit ? 'depositPending' : 'notPaid';
  if (hasPartialDeposit && deposit != null && paid + 0.009 < deposit) return 'depositPending';
  return 'depositPaid';
}
