export const LOCALIZED_LANGS = ['es', 'en', 'pt'] as const;
export type LocalizedLanguage = (typeof LOCALIZED_LANGS)[number];

export function pickLocalizedText(
  map: Partial<Record<LocalizedLanguage, string>> | undefined,
  preferredLocale?: string,
): string | undefined {
  if (!map) return undefined;
  const pref = preferredLocale?.toLowerCase().slice(0, 2) as LocalizedLanguage | undefined;
  const order: LocalizedLanguage[] = [];
  if (pref && LOCALIZED_LANGS.includes(pref)) order.push(pref);
  for (const lang of LOCALIZED_LANGS) {
    if (!order.includes(lang)) order.push(lang);
  }
  for (const lang of order) {
    const v = map[lang]?.trim();
    if (v) return v;
  }
  return undefined;
}
