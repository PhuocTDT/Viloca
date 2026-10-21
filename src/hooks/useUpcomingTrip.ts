import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import supabase from '../lib/supabase';
import { localDateString, daysFromToday } from '../lib/trip-utils';
import type { Trip } from '../types';

interface UpcomingTripResult {
  /** Chuyến sắp tới gần nhất (status 'planning', ngày bắt đầu từ hôm nay trở đi). */
  trip: Trip | null;
  /** Chuyến đang diễn ra (status 'active'), nếu có. */
  activeTrip: Trip | null;
  /** Số ngày từ hôm nay tới ngày bắt đầu của `trip` (0 = bắt đầu hôm nay). */
  daysUntil: number;
  loading: boolean;
}

export function useUpcomingTrip(): UpcomingTripResult {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [daysUntil, setDaysUntil] = useState(0);
  const [loading, setLoading] = useState(true);

  // Tải lại mỗi lần màn hình được focus để thấy chuyến vừa tạo hoặc vừa đổi trạng thái.
  useFocusEffect(useCallback(() => {
    let cancelled = false;

    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (!cancelled) { setTrip(null); setActiveTrip(null); setLoading(false); }
        return;
      }
      const uid = session.user.id;
      const today = localDateString();

      const [active, upcoming] = await Promise.all([
        supabase.from('trips').select('*')
          .eq('user_id', uid).eq('status', 'active')
          .order('start_date', { ascending: false })
          .limit(1).maybeSingle(),
        supabase.from('trips').select('*')
          .eq('user_id', uid).eq('status', 'planning')
          .gte('start_date', today)
          .order('start_date', { ascending: true })
          .limit(1).maybeSingle(),
      ]);
      if (cancelled) return;

      setActiveTrip((active.data as Trip | null) ?? null);
      const next = (upcoming.data as Trip | null) ?? null;
      setTrip(next);
      setDaysUntil(next?.start_date ? daysFromToday(next.start_date) : 0);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, []));

  return { trip, activeTrip, daysUntil, loading };
}
