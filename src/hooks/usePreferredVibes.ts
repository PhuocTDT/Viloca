import { useState, useEffect } from 'react';
import supabase from '../lib/supabase';

/**
 * Phong cách du lịch người dùng chọn ở màn hình quiz lúc mới đăng ký
 * (`profiles.preferred_vibes`). Dùng để cá nhân hóa Home ngay từ lần đầu,
 * trước khi họ tự bấm filter nào. Rỗng nếu chưa đăng nhập hoặc bỏ qua quiz.
 */
export function usePreferredVibes(): { vibes: string[]; loading: boolean } {
  const [vibes, setVibes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { if (!cancelled) { setVibes([]); setLoading(false); } return; }

      const { data } = await supabase
        .from('profiles')
        .select('preferred_vibes')
        .eq('id', session.user.id)
        .single();

      if (!cancelled) {
        setVibes((data?.preferred_vibes as string[] | null) ?? []);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { vibes, loading };
}
