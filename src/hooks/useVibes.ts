import { useState, useEffect } from 'react';
import supabase from '@/src/lib/supabase';
import { readLocations } from '@/src/lib/location-access';

export interface Vibe {
  id: number;
  name: string;
  icon: string | null;
}

export function useVibes(): { vibes: Vibe[]; loading: boolean } {
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Try dedicated vibes table first
      const { data, error } = await supabase
        .from('vibes')
        .select('id, name, icon')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        setVibes(data as Vibe[]);
        setLoading(false);
        return;
      }

      // Fallback: derive distinct tags from locations.style_tag (comma-separated)
      const locs = await readLocations<{ style_tag: string | null }>((table) => {
        const q = supabase.from(table).select('style_tag').not('style_tag', 'is', null).limit(150);
        return table === 'locations' ? q.eq('is_active', true).eq('verified', true) : q;
      });

      if (locs.length > 0) {
        const seen = new Set<string>();
        const unique: Vibe[] = [];
        for (const row of locs) {
          const tags = (row.style_tag as string)
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean);
          for (const t of tags) {
            if (!seen.has(t)) {
              seen.add(t);
              unique.push({ id: unique.length, name: t, icon: null });
            }
          }
        }
        setVibes(unique.slice(0, 14));
      }
      setLoading(false);
    }
    load();
  }, []);

  return { vibes, loading };
}
