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
  const [shieldDates, setShieldDates] = useState<string[]>([]);
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
          setShieldDates([]);
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
          if (parsed && Array.isArray(parsed.dates)) {
            setCheckinDates((prev) => Array.from(new Set([...prev, ...parsed.dates])));
          }
          if (parsed && Array.isArray(parsed.shields)) {
            setShieldDates((prev) => Array.from(new Set([...prev, ...parsed.shields])));
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
          .select('checkin_date, kind')
          .eq('user_id', userId),
      ]);
      if (cancelled) return;

      const st = stateRes.data ?? null;
      setState(st);
      setMilestones(milestonesRes.data ?? []);

      const datesSet = new Set<string>();
      const shieldsSet = new Set<string>();

      // From logs table — tách riêng ngày được Khiên bảo vệ (shield) khỏi ngày điểm danh thật
      if (logsRes.data) {
        for (const row of logsRes.data as { checkin_date: string; kind?: string | null }[]) {
          if (!row.checkin_date) continue;
          if (row.kind === 'shield') {
            shieldsSet.add(row.checkin_date);
          } else {
            datesSet.add(row.checkin_date);
          }
        }
      }

      // Nếu last_checkin_date chưa có log tương ứng (dữ liệu cũ trước khi có bảng checkin_logs)
      if (st?.last_checkin_date) {
        datesSet.add(st.last_checkin_date);

        // Suy diễn ngược các ngày trước đó theo streak — chỉ áp dụng cho dữ liệu cũ chưa có
        // log thật (không ghi đè ngày đã biết là 'shield').
        if (st.current_streak > 1) {
          try {
            const [y, m, d] = st.last_checkin_date.split('-').map(Number);
            const anchor = new Date(y, m - 1, d);
            for (let i = 1; i < st.current_streak; i++) {
              const prevDate = new Date(anchor);
              prevDate.setDate(anchor.getDate() - i);
              const prevStr = formatLocalDate(prevDate);
              if (!shieldsSet.has(prevStr)) datesSet.add(prevStr);
            }
          } catch {}
        }
      }

      const mergedDates = Array.from(datesSet).sort();
      const mergedShields = Array.from(shieldsSet).sort();
      setCheckinDates(mergedDates);
      setShieldDates(mergedShields);
      setLoading(false);

      AsyncStorage.setItem(cacheKey, JSON.stringify({ dates: mergedDates, shields: mergedShields })).catch(() => {});
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

  const isShielded = useCallback((dateStr: string) => {
    return shieldDates.includes(dateStr);
  }, [shieldDates]);

  const checkin = useCallback(async () => {
    const { data, error } = await supabase.rpc('daily_checkin');
    if (error) return { ok: false as const, error: error.message };
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

    // Điểm danh bù ngày quá khứ: tốn credit, bắt buộc qua RPC (client không còn quyền
    // insert thẳng vào checkin_logs — xem migration 20261028000001).
    const { data, error } = await supabase.rpc('backfill_checkin', { p_date: dateStr });
    if (error) {
      if (error.message?.includes('Not enough AI credits')) {
        return { ok: false as const, reason: 'insufficient_credits' as const, error: error.message };
      }
      return { ok: false as const, reason: 'error' as const, error: error.message };
    }

    refetch();
    return {
      ok: true as const,
      reason: 'past' as const,
      creditsRemaining: data?.[0]?.ai_credits_remaining as number | undefined,
    };
  }, [canCheckinToday, checkin, checkinDates, refetch]);

  return {
    state,
    milestones,
    checkinDates,
    shieldDates,
    isCheckedIn,
    isShielded,
    loading,
    canCheckinToday,
    checkin,
    markDateCheckin,
    refetch,
  };
}
