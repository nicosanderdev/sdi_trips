export type PhoneCountryCode = 'UY' | 'BR' | 'AR';

export const SUPPORTED_PHONE_COUNTRIES = [
  { code: 'UY' as const, dialCode: '+598', flag: '🇺🇾' },
  { code: 'BR' as const, dialCode: '+55', flag: '🇧🇷' },
  { code: 'AR' as const, dialCode: '+54', flag: '🇦🇷' },
] as const;

export function buildInternationalPhone(country: string, local: string): string {
  const localDigits = (local || '').replace(/\D/g, '');
  if (!localDigits) {
    return '';
  }

  const countryConfig = SUPPORTED_PHONE_COUNTRIES.find((c) => c.code === country);
  if (countryConfig) {
    const dialDigits = countryConfig.dialCode.replace(/\D/g, '');
    return `+${dialDigits}${localDigits}`;
  }

  return '';
}

export function isValidLocalPhone(local: string): boolean {
  const digits = (local || '').replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 14;
}
