import { useState, useEffect } from 'react';
import supabase from '@/src/lib/supabase';
import type { Location } from '@/src/types';
import { readLocations } from '@/src/lib/location-access';

export function useLocations(
  limit = 6,
  categoryFilter?: string | null,
  vibeFilter?: string | null,
) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const rows = await readLocations<Location>((table) => {
        let query = supabase.from(table).select('*').limit(limit);
        if (table === 'locations') query = query.eq('is_active', true);
        if (categoryFilter) query = query.ilike('category', `%${categoryFilter}%`);
        if (vibeFilter) query = query.ilike('style_tag', `%${vibeFilter}%`);
        return query;
      });

      setLocations(rows);
      setLoading(false);
    }
    load();
  }, [limit, categoryFilter, vibeFilter]);

  return { locations, loading };
}
