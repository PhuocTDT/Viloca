import { useState, useEffect } from 'react';
import supabase from '@/src/lib/supabase';
import type { Location } from '@/src/types';

export function useLocations(
  limit = 6,
  categoryFilter?: string | null,
  vibeFilter?: string | null,
) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      let query = supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .limit(limit);

      if (categoryFilter) {
        query = query.ilike('category', `%${categoryFilter}%`);
      }

      if (vibeFilter) {
        query = query.ilike('style_tag', `%${vibeFilter}%`);
      }

      const { data, error } = await query;

      if (!error && data) setLocations(data as Location[]);
      setLoading(false);
    }
    load();
  }, [limit, categoryFilter, vibeFilter]);

  return { locations, loading };
}
