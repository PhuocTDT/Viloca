import { useCallback, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';
import supabase from '@/src/lib/supabase';
import { WEATHER_ADAPTATION_CONFIG as CFG, type WeatherRegion } from '@/src/lib/weather-adaptation/config';
import type { WeatherImpact } from '@/src/lib/weather-adaptation/impact';
import type { TransportAdvice } from '@/src/lib/weather-adaptation/transport';

export interface WeatherProposal {
  id: string;
  action: 'later' | 'other_day' | 'indoor' | 'keep';
  label: string;
  checked: boolean;
}

export interface WeatherAlert {
  eventId: string;
  itemId: string;
  itemName: string;
  region: WeatherRegion | null;
  dayNumber: number;
  time: string | null;
  impact: WeatherImpact;
  firstObservation: boolean;
  proposals: WeatherProposal[];
  transport: TransportAdvice | null;
}

export function useTripWeatherAdvice(tripId: string | undefined, enabled: boolean, language: 'vi' | 'en') {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [checkedAt, setCheckedAt] = useState<number | null>(null);
  const lastRequest = useRef(0);
  const lastManualRequest = useRef(0);
  const generation = useRef(0);

  const refresh = useCallback(async (force = false) => {
    if (!tripId || !enabled) return;
    const now = Date.now();
    if (!force && now - lastRequest.current < CFG.cacheFreshMs) return;
    if (force && now - lastManualRequest.current < CFG.manualRefreshMinMs) return;
    if (force) lastManualRequest.current = now;
    lastRequest.current = now;
    const current = ++generation.current;
    setLoading(true);
    setError(false);
    const { data, error: requestError } = await supabase.functions.invoke('weather-advice', {
      body: { tripId, language },
    });
    if (generation.current !== current) return;
    if (requestError || !data || !Array.isArray(data.alerts)) {
      setError(true);
    } else {
      setAlerts(data.alerts);
      setCheckedAt(data.checkedAt ?? Date.now());
      setError((data.unavailableCount ?? 0) > 0);
    }
    setLoading(false);
  }, [tripId, enabled, language]);

  useFocusEffect(useCallback(() => {
    if (!enabled) { setAlerts([]); return; }
    generation.current++;
    lastRequest.current = 0;
    void refresh();
    const interval = setInterval(() => { void refresh(); }, CFG.cacheFreshMs);
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => { generation.current++; clearInterval(interval); appState.remove(); };
  }, [enabled, refresh]));

  const dismissEvent = useCallback((eventId: string) => {
    setAlerts((current) => current.filter((item) => item.eventId !== eventId));
  }, []);

  return { alerts, loading, error, checkedAt, refresh, dismissEvent };
}
