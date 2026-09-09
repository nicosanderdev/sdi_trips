import { format, isValid, parseISO } from 'date-fns';
import { enUS, es, ptBR } from 'date-fns/locale';

const DATE_FNS_LOCALES = { en: enUS, es, pt: ptBR } as const;

/**
 * Formats a booking stay date for display, e.g. "miércoles 22/07/2026".
 */
export function formatReservationStayDate(value: string, language: string): string {
  if (!value) return value;

  const normalized = value.includes('T') ? value : `${value}T00:00:00`;
  const date = parseISO(normalized);
  if (!isValid(date)) return value;

  const lang = language.split('-')[0] as keyof typeof DATE_FNS_LOCALES;
  const locale = DATE_FNS_LOCALES[lang] ?? enUS;
  return format(date, 'EEEE dd/MM/yyyy', { locale });
}
