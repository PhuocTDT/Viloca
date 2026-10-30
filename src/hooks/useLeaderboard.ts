import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import supabase from '../lib/supabase';
import type { LeaderboardEntry, ProfileSummary } from '../types';

const PROFILE_COLS = 'id, username, full_name, avatar_url';

export function useLeaderboard(kind: 'posts' | 'checkins') {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const { data: rows } = kind === 'posts'
        ? await supabase.from('leaderboard_posts').select('user_id, post_count').order('post_count', { ascending: false }).limit(50)
        : await supabase.from('leaderboard_checkins').select('user_id, current_streak').order('current_streak', { ascending: false }).limit(50);
      if (cancelled) return;

      const ranked = (rows ?? []) as { user_id: string; post_count?: number; current_streak?: number }[];
      const ids = ranked.map((r) => r.user_id);
      if (ids.length === 0) { setEntries([]); setLoading(false); return; }

      const { data: profiles } = await supabase.from('profiles').select(PROFILE_COLS).in('id', ids);
      if (cancelled) return;

      const byId = new Map<string, ProfileSummary>((profiles ?? []).map((p: ProfileSummary) => [p.id, p]));
      const merged = ranked
        .map((r, i) => {
          const profile = byId.get(r.user_id);
          if (!profile) return null;
          return { ...profile, rank: i + 1, value: (r.post_count ?? r.current_streak ?? 0) } as LeaderboardEntry;
        })
        .filter((e): e is LeaderboardEntry => !!e);

      setEntries(merged);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [kind]));

  return { entries, loading };
}
