import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from '../lib/supabase';
import type { CheckinMilestone, CheckinState, CheckinResult } from '../types';

import { formatLocalDate, todayStr } from '../lib/date-utils';
export { formatLocalDate, todayStr };

export function useCheckin() {
  const [state, setState] = useState<CheckinState | null>(null);
  const [milestones, setMilestones] = useState<CheckinMilestone[]>([]);
  const [checkinDates, setCheckinDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useFocusEffect(useCallback(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (!cancelled) {
          setState(null);
          setCheckinDates([]);
          setLoading(false);
        }
        return;
      }

      const userId = session.user.id;
      const cacheKey = `@checkin_dates_${userId}`;

      // Hydrate cached dates first for instant rendering
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached && !cancelled) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setCheckinDates((prev) => Array.from(new Set([...prev, ...parsed])));
          }
        }
      } catch {}

      const [stateRes, milestonesRes, logsRes] = await Promise.all([
        supabase.from('checkin_state')
          .select('current_streak, last_checkin_date, streak_shields')
          .eq('user_id', userId).maybeSingle(),
        supabase.from('checkin_milestones')
          .select('day_threshold, reward_credits, grants_shield')
          .order('sort_order'),
        supabase.from('checkin_logs')
          .select('checkin_date')
          .eq('user_id', userId),
      ]);
      if (cancelled) return;

      const st = stateRes.data ?? null;
      setState(st);
      setMilestones(milestonesRes.data ?? []);

      const datesSet = new Set<string>();

      // From logs table
      if (logsRes.data) {
        for (const row of logsRes.data) {
          if (row.checkin_date) datesSet.add(row.checkin_date);
        }
      }

      // If last_checkin_date exists, add it
      if (st?.last_checkin_date) {
        datesSet.add(st.last_checkin_date);

        // Also backfill streak days backwards from last_checkin_date
        if (st.current_streak > 1) {
          try {
            const [y, m, d] = st.last_checkin_date.split('-').map(Number);
            const anchor = new Date(y, m - 1, d);
            for (let i = 1; i < st.current_streak; i++) {
              const prevDate = new Date(anchor);
              prevDate.setDate(anchor.getDate() - i);
              datesSet.add(formatLocalDate(prevDate));
            }
          } catch {}
        }
      }

      const mergedDates = Array.from(datesSet).sort();
      setCheckinDates(mergedDates);
      setLoading(false);

      // Save to cache
      AsyncStorage.setItem(cacheKey, JSON.stringify(mergedDates)).catch(() => {});
    }

    load();
    return () => { cancelled = true; };
  }, [reloadKey]));

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  const today = todayStr();
  const canCheckinToday = state?.last_checkin_date !== today && !checkinDates.includes(today);

  const isCheckedIn = useCallback((dateStr: string) => {
    return checkinDates.includes(dateStr);
  }, [checkinDates]);

  const checkin = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase.rpc('daily_checkin');
    if (error) return { ok: false as const, error: error.message };

    const t = todayStr();
    setCheckinDates((prev) => {
      const next = Array.from(new Set([...prev, t])).sort();
      if (session?.user?.id) {
        AsyncStorage.setItem(`@checkin_dates_${session.user.id}`, JSON.stringify(next)).catch(() => {});
      }
      return next;
    });

    refetch();
    return { ok: true as const, result: data?.[0] as CheckinResult };
  }, [refetch]);

  const markDateCheckin = useCallback(async (dateStr: string) => {
    const t = todayStr();
    if (dateStr === t) {
      if (!canCheckinToday) {
        return { ok: false as const, reason: 'already_done' as const };
      }
      const res = await checkin();
      if (!res.ok) return { ok: false as const, reason: 'error' as const, error: res.error };
      return { ok: true as const, reason: 'today' as const, result: res.result };
    }

    if (dateStr > t) {
      return { ok: false as const, reason: 'future' as const };
    }

    if (checkinDates.includes(dateStr)) {
      return { ok: false as const, reason: 'already_done' as const };
    }

    // Past date check-in: record in checkin_logs and local cache
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      await supabase.from('checkin_logs').upsert({
        user_id: session.user.id,
        checkin_date: dateStr,
      });
      const next = Array.from(new Set([...checkinDates, dateStr])).sort();
      setCheckinDates(next);
      AsyncStorage.setItem(`@checkin_dates_${session.user.id}`, JSON.stringify(next)).catch(() => {});
      refetch();
      return { ok: true as const, reason: 'past' as const };
    }

    return { ok: false as const, reason: 'unauthenticated' as const };
  }, [canCheckinToday, checkin, checkinDates, refetch]);

  return {
    state,
    milestones,
    checkinDates,
    isCheckedIn,
    loading,
    canCheckinToday,
    checkin,
    markDateCheckin,
    refetch,
  };
}
