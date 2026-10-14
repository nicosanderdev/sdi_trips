import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';

export const PREVIEW_QUERY_PARAM = 'preview';

export type PreviewTokenStatus = 'ok' | 'expired' | 'invalid';

export interface ResolvedPropertyPreview {
  status: PreviewTokenStatus;
  listingType: string | null;
  estatePropertyId: string | null;
}

export function readPreviewToken(search: string): string | null {
  const token = new URLSearchParams(search).get(PREVIEW_QUERY_PARAM)?.trim();
  return token ? token : null;
}

export function isPreviewLocation(search = typeof window === 'undefined' ? '' : window.location.search): boolean {
  return readPreviewToken(search) !== null;
}

export async function resolvePropertyPreview(token: string): Promise<ResolvedPropertyPreview> {
  const { data, error } = await supabase.rpc('resolve_property_preview_token', {
    p_token: token,
  });
  if (error) throw error;

  const row = ((data ?? []) as {
    status?: string;
    listing_type?: string | null;
    estate_property_id?: string | null;
  }[])[0];

  const status = row?.status === 'ok' || row?.status === 'expired' ? row.status : 'invalid';
  return {
    status,
    listingType: row?.listing_type ?? null,
    estatePropertyId: row?.estate_property_id ?? null,
  };
}

function leavingAnchor(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null;
  const anchor = target.closest('a');
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('#')) return null;
  return anchor;
}

/** Stops links that leave the property while a preview token is in the URL. */
export function usePreviewGuards(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    const block = (event: MouseEvent) => {
      if (!leavingAnchor(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
    };

    const blockKey = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;
      if (!leavingAnchor(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
    };

    document.addEventListener('click', block, true);
    document.addEventListener('auxclick', block, true);
    document.addEventListener('keydown', blockKey, true);
    return () => {
      document.removeEventListener('click', block, true);
      document.removeEventListener('auxclick', block, true);
      document.removeEventListener('keydown', blockKey, true);
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;

    let meta = document.querySelector('meta[name="robots"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    const previous = meta.getAttribute('content');
    meta.setAttribute('content', 'noindex, nofollow');

    return () => {
      if (created) {
        meta?.remove();
        return;
      }
      if (previous == null) meta?.removeAttribute('content');
      else meta?.setAttribute('content', previous);
    };
  }, [active]);
}

export function PreviewBanner({ hiddenFromGuests }: { hiddenFromGuests: boolean }) {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      className="sticky top-28 z-40 rounded-2xl border border-gold/40 bg-gold/15 px-4 py-3 text-sm text-navy"
    >
      <p className="font-medium">{t('propertyDetail.preview.banner')}</p>
      {hiddenFromGuests && <p className="mt-1">{t('propertyDetail.preview.hidden')}</p>}
    </div>
  );
}

export function PreviewExpired() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-20">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-navy">{t('propertyDetail.preview.expiredTitle')}</h1>
        <p className="mt-3 text-charcoal">{t('propertyDetail.preview.expiredBody')}</p>
      </div>
    </div>
  );
}
