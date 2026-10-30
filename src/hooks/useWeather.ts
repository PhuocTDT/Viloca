import { useState, useEffect } from 'react';

export interface WeatherNow {
  temperatureC: number;
  weatherCode: number;
  isDay: boolean;
}

interface UseWeatherResult {
  weather: WeatherNow | null;
  loading: boolean;
  error: boolean;
}

/** Thời tiết hiện tại tại toạ độ cho trước, qua Open-Meteo (free, không cần API key). */
export function useWeather(lat: number | null, lng: number | null): UseWeatherResult {
  const [weather, setWeather] = useState<WeatherNow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (lat == null || lng == null) { setWeather(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(false);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,is_day&timezone=auto`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const current = data?.current;
        if (!current) { setError(true); setWeather(null); return; }
        setWeather({
          temperatureC: current.temperature_2m,
          weatherCode: current.weather_code,
          isDay: current.is_day === 1,
        });
      })
      .catch(() => { if (!cancelled) { setError(true); setWeather(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [lat, lng]);

  return { weather, loading, error };
}
