/** Format a numeric amount with currency symbol for guest display. */
export function formatPriceAmount(amount: number, currency = 'USD'): string {
  const symbol = currency === 'UYU' ? '$U' : '$';
  const rounded = Number.isInteger(amount) ? amount : Math.round(amount * 100) / 100;
  return `${symbol}${rounded.toLocaleString()}`;
}

export function getPriceLabelKey(
  displayLabel: 'from' | 'per_night' | 'total_stay',
): string {
  switch (displayLabel) {
    case 'from':
      return 'pricing.from';
    case 'per_night':
      return 'pricing.perNight';
    case 'total_stay':
      return 'pricing.totalStay';
    default:
      return 'pricing.perNight';
  }
}
