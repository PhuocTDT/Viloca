import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import supabase from '../lib/supabase';
import type { Mission, UserMissionProgress, MissionWithProgress } from '../types';

interface UseMissionsResult {
  missions: MissionWithProgress[];
  loading: boolean;
  reportProgress: (metric: string) => Promise<void>;
  claim: (missionId: string) => Promise<{ ok: true; aiCreditsRemaining: number } | { ok: false; error: string }>;
  refetch: () => void;
}

export function useMissions(): UseMissionsResult {
  const [missions, setMissions] = useState<MissionWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useFocusEffect(useCallback(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { if (!cancelled) { setMissions([]); setLoading(false); } return; }

      const [missionsRes, progressRes] = await Promise.all([
        supabase.from('missions').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('user_mission_progress').select('mission_id, progress_count, completed_at, claimed_at')
          .eq('user_id', session.user.id),
      ]);
      if (cancelled) return;

      const progressByMission = new Map<string, UserMissionProgress>(
        (progressRes.data ?? []).map((p: UserMissionProgress) => [p.mission_id, p])
      );

      const merged: MissionWithProgress[] = (missionsRes.data ?? []).map((m: Mission) => {
        const p = progressByMission.get(m.id);
        return {
          ...m,
          progressCount: p?.progress_count ?? 0,
          completedAt: p?.completed_at ?? null,
          claimedAt: p?.claimed_at ?? null,
        };
      });

      setMissions(merged);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [reloadKey]));

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  const reportProgress = useCallback(async (metric: string) => {
    await supabase.rpc('report_mission_progress', { p_metric: metric });
    refetch();
  }, [refetch]);

  const claim = useCallback(async (missionId: string) => {
    const { data, error } = await supabase.rpc('claim_mission_reward', { p_mission_id: missionId });
    if (error) return { ok: false as const, error: error.message };
    refetch();
    return { ok: true as const, aiCreditsRemaining: data?.[0]?.ai_credits_remaining ?? 0 };
  }, [refetch]);

  return { missions, loading, reportProgress, claim, refetch };
}
