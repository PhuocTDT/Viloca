import { WEATHER_ADAPTATION_CONFIG as CFG } from './config.ts';

export interface ForecastHour {
  /** UTC epoch milliseconds; hourly precipitation is for the preceding hour. */
  endsAt: number;
  weatherCode: number | null;
  precipitationProbability: number | null;
  precipitationMm: number | null;
  windGustKmh: number | null;
  visibilityMeters: number | null;
}

export interface HourlyForecast {
  latitude: number;
  longitude: number;
  fetchedAt: number;
  hours: ForecastHour[];
}

const cache = new Map<string, HourlyForecast>();
const pending = new Map<string, Promise<HourlyForecast>>();
const lastRequest = new Map<string, number>();

function nullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function cacheKey(latitude: number, longitude: number): string {
  return `${latitude.toFixed(3)},${longitude.toFixed(3)},${CFG.forecastDays}`;
}

/** Open-Meteo hourly Unix timestamps are UTC instants; precipitation refers to the hour ending there. */
export function parseHourlyForecast(data: unknown, latitude: number, longitude: number, fetchedAt: number): HourlyForecast {
  const hourly = (data as { hourly?: Record<string, unknown> } | null)?.hourly;
  if (!hourly || !Array.isArray(hourly.time) || hourly.time.length === 0) {
    throw new Error('Missing hourly forecast');
  }
  const variables = ['weather_code', 'precipitation_probability', 'precipitation', 'wind_gusts_10m', 'visibility'];
  for (const variable of variables) {
    if (!Array.isArray(hourly[variable]) || hourly[variable].length !== hourly.time.length) {
      throw new Error(`Invalid forecast variable: ${variable}`);
    }
  }
  const hours = hourly.time.map((time: unknown, i: number): ForecastHour => {
    if (typeof time !== 'number' || !Number.isFinite(time)) throw new Error('Invalid hourly time');
    return {
      endsAt: time * 1000,
      weatherCode: nullableNumber((hourly.weather_code as unknown[])[i]),
      precipitationProbability: nullableNumber((hourly.precipitation_probability as unknown[])[i]),
      precipitationMm: nullableNumber((hourly.precipitation as unknown[])[i]),
      windGustKmh: nullableNumber((hourly.wind_gusts_10m as unknown[])[i]),
      visibilityMeters: nullableNumber((hourly.visibility as unknown[])[i]),
    };
  });
  if (hours.some((hour, i) => i > 0 && hour.endsAt <= hours[i - 1].endsAt)) {
    throw new Error('Unordered hourly forecast');
  }
  return { latitude, longitude, fetchedAt, hours };
}

export function forecastFreshness(forecast: HourlyForecast, now = Date.now()): 'fresh' | 'aging' | 'stale' {
  const age = now - forecast.fetchedAt;
  return age <= CFG.cacheFreshMs ? 'fresh' : age <= CFG.cacheStaleMs ? 'aging' : 'stale';
}

export async function getHourlyForecast(
  latitude: number,
  longitude: number,
  options: { force?: boolean; signal?: AbortSignal; now?: number } = {},
): Promise<HourlyForecast> {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new Error('Invalid forecast coordinates');
  }
  const key = cacheKey(latitude, longitude);
  const now = options.now ?? Date.now();
  const previous = cache.get(key);
  if (!options.force && previous && forecastFreshness(previous, now) === 'fresh') return previous;
  if (options.force && previous && now - (lastRequest.get(key) ?? 0) < CFG.manualRefreshMinMs) return previous;
  const existing = pending.get(key);
  if (existing) return existing;
  const params = new URLSearchParams({
    latitude: String(latitude), longitude: String(longitude),
    hourly: 'weather_code,precipitation_probability,precipitation,wind_gusts_10m,visibility',
    forecast_days: String(CFG.forecastDays), timezone: 'Asia/Ho_Chi_Minh', timeformat: 'unixtime',
  });
  lastRequest.set(key, now);
  const promise = (async () => {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: options.signal });
    if (!response.ok) throw new Error(`Forecast HTTP ${response.status}`);
    const parsed = parseHourlyForecast(await response.json(), latitude, longitude, now);
    cache.set(key, parsed);
    return parsed;
  })();
  pending.set(key, promise);
  try { return await promise; } finally { pending.delete(key); }
}

export function cachedHourlyForecast(latitude: number, longitude: number): HourlyForecast | null {
  return cache.get(cacheKey(latitude, longitude)) ?? null;
}
