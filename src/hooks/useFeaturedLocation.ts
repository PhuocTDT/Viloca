import { useState, useEffect } from 'react';
import supabase from '@/src/lib/supabase';
import type { Location } from '@/src/types';
import { readLocations } from '@/src/lib/location-access';

export function useFeaturedLocation(
  category: string | null
): { location: Location | null; loading: boolean } {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    readLocations<Location>((table) => {
      let query = supabase.from(table).select('*').eq('is_featured', true).limit(1);
      if (table === 'locations') query = query.eq('is_active', true);
      if (category) query = query.ilike('category', `%${category}%`);
      return query;
    }).then((rows) => {
      setLocation(rows[0] ?? null);
      setLoading(false);
    });
  }, [category]);

  return { location, loading };
}
