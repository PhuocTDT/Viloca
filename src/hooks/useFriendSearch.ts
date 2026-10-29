import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import type { ProfileSearchResult } from '@/src/types';

const DEBOUNCE_MS = 300;

/**
 * Giá trị nhúng vào `.or()` của PostgREST cần bọc trong dấu nháy kép nếu có
 * ký tự đặc biệt (`,` kết thúc điều kiện, `(`/`)` dùng để group) — thiếu bước
 * này, input có dấu phẩy/ngoặc sẽ phá cấu trúc filter hoặc tạo điều kiện OR
 * ngoài ý muốn.
 */
function escapeOrFilterValue(raw: string): string {
  return raw.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function useFriendSearch() {
  const user = useAuthStore((s) => s.user);
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<ProfileSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (!q || !user) { setResults([]); setLoading(false); return; }

    setLoading(true);
    const timer = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      const safeQ = escapeOrFilterValue(q);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio')
        .or(`username.ilike."%${safeQ}%",full_name.ilike."%${safeQ}%"`)
        .neq('id', user.id)
        .limit(20);

      // Bỏ kết quả nếu đã có 1 lần search mới hơn bắt đầu sau đó (tránh
      // response chậm của lần search cũ đè lên kết quả mới hơn).
      if (requestIdRef.current !== requestId) return;

      const rows = profiles ?? [];
      if (rows.length === 0) { setResults([]); setLoading(false); return; }

      const ids = rows.map((p) => p.id);
      const [followersRes, followingRes] = await Promise.all([
        supabase.from('user_follows').select('following_id').in('following_id', ids),
        supabase.from('user_follows').select('follower_id').in('follower_id', ids),
      ]);

      if (requestIdRef.current !== requestId) return;

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
