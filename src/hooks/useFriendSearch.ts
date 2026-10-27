import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import type { ProfileSearchResult } from '@/src/types';

const DEBOUNCE_MS = 300;

export function useFriendSearch() {
  const user = useAuthStore((s) => s.user);
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<ProfileSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q || !user) { setResults([]); setLoading(false); return; }

    setLoading(true);
    const timer = setTimeout(async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio')
        .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
        .neq('id', user.id)
        .limit(20);

      const rows = profiles ?? [];
      if (rows.length === 0) { setResults([]); setLoading(false); return; }

      const ids = rows.map((p) => p.id);
      const [followersRes, followingRes] = await Promise.all([
        supabase.from('user_follows').select('following_id').in('following_id', ids),
        supabase.from('user_follows').select('follower_id').in('follower_id', ids),
      ]);

      const followersCount = new Map<string, number>();
      (followersRes.data ?? []).forEach((r: { following_id: string }) => {
        followersCount.set(r.following_id, (followersCount.get(r.following_id) ?? 0) + 1);
      });
      const followingCount = new Map<string, number>();
      (followingRes.data ?? []).forEach((r: { follower_id: string }) => {
        followingCount.set(r.follower_id, (followingCount.get(r.follower_id) ?? 0) + 1);
      });

      setResults(rows.map((p): ProfileSearchResult => ({
        ...p,
        followersCount: followersCount.get(p.id) ?? 0,
        followingCount: followingCount.get(p.id) ?? 0,
      })));
      setLoading(false);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, user]);

  return { query, setQuery, results, loading };
}
