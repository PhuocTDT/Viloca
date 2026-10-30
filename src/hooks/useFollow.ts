import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export function useFollow(targetUserId: string) {
  const user = useAuthStore((s) => s.user);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.id === targetUserId) { setLoading(false); return; }

    supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .maybeSingle()
      .then(({ data }) => {
        setIsFollowing(!!data);
        setLoading(false);
      });
  }, [user, targetUserId]);

  const toggle = useCallback(async () => {
    if (!user) return;

    if (isFollowing) {
      setIsFollowing(false);
      await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);
    } else {
      setIsFollowing(true);
      await supabase
        .from('user_follows')
        .insert({ follower_id: user.id, following_id: targetUserId });
    }
  }, [user, targetUserId, isFollowing]);

  return { isFollowing, toggle, loading };
}
