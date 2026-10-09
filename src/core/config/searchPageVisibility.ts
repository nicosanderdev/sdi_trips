/**
 * Guest catalog switch (per main/alt deploy). Search stays visible unless
 * `VITE_SHOW_SEARCH_PAGE` is exactly `false`; read at build time.
 */
export const isSearchPageEnabled = import.meta.env.VITE_SHOW_SEARCH_PAGE !== 'false';

/** Target for "browse"/recovery links: the catalog when enabled, otherwise the homepage. */
export const browseFallbackPath = isSearchPageEnabled ? '/search' : '/';
