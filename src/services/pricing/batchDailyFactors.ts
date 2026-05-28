import { fetchListingDailyFactors } from './fetchParameters';
import type { DailyFactorEntry } from './types';

const DEFAULT_CONCURRENCY = 8;

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker(): Promise<void> {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

/** Batch-fetch daily factors keyed by listing id for search/map views. */
export async function batchListingDailyFactors(
  listingIds: string[],
  from: string,
  to: string,
  concurrency = DEFAULT_CONCURRENCY,
): Promise<Map<string, DailyFactorEntry[]>> {
  const unique = [...new Set(listingIds.filter(Boolean))];
  const map = new Map<string, DailyFactorEntry[]>();
  if (!unique.length || !from || !to) return map;

  const pairs = await mapWithConcurrency(unique, concurrency, async (id) => {
    const factors = await fetchListingDailyFactors(id, from, to);
    return [id, factors] as const;
  });

  for (const [id, factors] of pairs) {
    map.set(id, factors);
  }
  return map;
}
