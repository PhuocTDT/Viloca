import type { SearchFilters } from '@/src/components/home/FilterSheet';

let pending: SearchFilters | null = null;

export function setPendingSearchFilters(filters: SearchFilters) {
  pending = filters;
}

export function consumePendingSearchFilters(): SearchFilters | null {
  const v = pending;
  pending = null;
  return v;
}
