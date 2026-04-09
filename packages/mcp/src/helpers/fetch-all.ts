/**
 * Paginate through all pages of a Moneroo list endpoint.
 * Stops after `maxPages` to avoid runaway requests.
 */
export async function fetchAll<T>(
  fetcher: (page: number, limit: number) => Promise<{ data: T[] }>,
  opts: { limit?: number; maxPages?: number } = {},
): Promise<T[]> {
  const limit = opts.limit ?? 100;
  const maxPages = opts.maxPages ?? 5; // max 500 items
  const results: T[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const res = await fetcher(page, limit);
    const items = res.data ?? [];
    results.push(...items);
    if (items.length < limit) break; // last page
  }

  return results;
}
