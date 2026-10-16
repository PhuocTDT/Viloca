import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Location } from '@/src/types';
import type { StringKey } from '@/src/lib/i18n';

const DEBOUNCE_MS = 300;

export const CITY_OPTIONS: { code: string | null; tKey: StringKey }[] = [
  { code: null,  tKey: 'searchAllCities' },
  { code: 'HN',  tKey: 'cityHN' },
  { code: 'SG',  tKey: 'cityHCM' },
  { code: 'DN',  tKey: 'cityDN' },
];

export type CityCode = (typeof CITY_OPTIONS)[number]['code'];

export function useLocationSearch(initialCategory?: string | null) {
  const [query, setQuery]                   = useState('');
  const [cityCode, setCityCode]             = useState<CityCode>(null);
  const [categoryKeyword, setCategoryKeyword] = useState<string | null>(initialCategory ?? null);
  const [results, setResults]               = useState<Location[]>([]);
  const [loading, setLoading]               = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(async () => {
      const { data } = await supabase.rpc('search_locations', {
        search_query:     query.trim(),
        city_code:        cityCode ?? null,
        category_keyword: categoryKeyword ?? null,
      });
      const rows = (data as Location[]) ?? [];
      setResults(cityCode ? rows.filter(l => l.city === cityCode) : rows);
      setLoading(false);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, cityCode, categoryKeyword]);

  return { query, setQuery, cityCode, setCityCode, categoryKeyword, setCategoryKeyword, results, loading };
}
