import { pickLocalizedText, type LocalizedLanguage } from './localizedText';

export interface PublicPropertyPolicy {
  id: string;
  listingType: string;
  title: Partial<Record<LocalizedLanguage, string>>;
  description: Partial<Record<LocalizedLanguage, string>>;
  displayOrder: number;
}

export interface ResolvedPolicyForDisplay {
  id: string;
  title?: string;
  description?: string;
}

export function parsePolicies(raw: unknown): PublicPropertyPolicy[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as PublicPropertyPolicy[];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as PublicPropertyPolicy[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function pickPolicyTitle(
  policy: PublicPropertyPolicy,
  preferredLocale?: string,
): string | undefined {
  return pickLocalizedText(policy.title, preferredLocale);
}

export function pickPolicyDescription(
  policy: PublicPropertyPolicy,
  preferredLocale?: string,
): string | undefined {
  return pickLocalizedText(policy.description, preferredLocale);
}

export function resolvePoliciesForDisplay(
  policies: PublicPropertyPolicy[],
  locale: string,
): ResolvedPolicyForDisplay[] {
  return policies
    .slice()
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((policy) => ({
      id: policy.id,
      title: pickPolicyTitle(policy, locale),
      description: pickPolicyDescription(policy, locale),
    }))
    .filter((p) => p.title || p.description);
}
