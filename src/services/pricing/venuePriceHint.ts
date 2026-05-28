import type { TFunction } from 'i18next';
import { formatPriceAmount } from './formatPrice';

/** Build guest-facing venue price line for alt app cards. */
export function buildVenuePriceHint(
  amount: number,
  labelKey: string,
  currency: string,
  t: TFunction,
): string {
  const prefix = t(labelKey);
  const formatted = formatPriceAmount(amount, currency);
  return `${prefix} ${formatted} ${t('alt.pricing.perEvent')}`;
}
