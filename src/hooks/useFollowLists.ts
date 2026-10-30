import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import supabase from '../lib/supabase';
import type { ProfileSummary } from '../types';

const PROFILE_COLS = 'id, username, full_name, avatar_url';

export function useFollowLists(userId: string | undefined) {
  const [following, setFollowing] = useState<ProfileSummary[]>([]);
  const [followers, setFollowers] = useState<ProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useFocusEffect(useCallback(() => {
    let cancelled = false;

    async function load() {
      if (!userId) { setFollowing([]); setFollowers([]); setLoading(false); return; }
      setLoading(true);

      const [followingRes, followersRes] = await Promise.all([
        supabase.from('user_follows').select('following_id').eq('follower_id', userId),
        supabase.from('user_follows').select('follower_id').eq('following_id', userId),
      ]);
      if (cancelled) return;

      const followingIds = (followingRes.data ?? []).map((r: { following_id: string }) => r.following_id);
      const followerIds  = (followersRes.data ?? []).map((r: { follower_id: string }) => r.follower_id);
      const allIds = Array.from(new Set([...followingIds, ...followerIds]));

      if (allIds.length === 0) {
        setFollowing([]); setFollowers([]); setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles').select(PROFILE_COLS).in('id', allIds);
      if (cancelled) return;

      const byId = new Map<string, ProfileSummary>((profiles ?? []).map((p: ProfileSummary) => [p.id, p]));
      setFollowing(followingIds.map((id: string) => byId.get(id)).filter((p): p is ProfileSummary => !!p));
      setFollowers(followerIds.map((id: string) => byId.get(id)).filter((p): p is ProfileSummary => !!p));
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [userId, reloadKey]));

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return { following, followers, loading, refetch };
}
