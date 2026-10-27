import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import supabase from '../lib/supabase';
import type { CheckinMilestone, CheckinState, CheckinResult } from '../types';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useCheckin() {
  const [state, setState] = useState<CheckinState | null>(null);
  const [milestones, setMilestones] = useState<CheckinMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useFocusEffect(useCallback(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { if (!cancelled) { setState(null); setLoading(false); } return; }

      const [stateRes, milestonesRes] = await Promise.all([
        supabase.from('checkin_state')
          .select('current_streak, last_checkin_date, streak_shields')
          .eq('user_id', session.user.id).maybeSingle(),
        supabase.from('checkin_milestones')
          .select('day_threshold, reward_credits, grants_shield')
          .order('sort_order'),
      ]);
      if (cancelled) return;

      setState(stateRes.data ?? null);
      setMilestones(milestonesRes.data ?? []);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [reloadKey]));

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  const canCheckinToday = state?.last_checkin_date !== todayStr();

  const checkin = useCallback(async () => {
    const { data, error } = await supabase.rpc('daily_checkin');
    if (error) return { ok: false as const, error: error.message };
    refetch();
    return { ok: true as const, result: data?.[0] as CheckinResult };
  }, [refetch]);

  return { state, milestones, loading, canCheckinToday, checkin, refetch };
}
