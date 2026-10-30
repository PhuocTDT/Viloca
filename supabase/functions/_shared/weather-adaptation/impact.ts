import { WEATHER_ADAPTATION_CONFIG as CFG, type WeatherExposure } from './config.ts';
import type { ForecastHour, HourlyForecast } from './forecast.ts';

type Trip = { start_date: string | null };
type TripItem = { id: string; location_id: string | null; day_number: number; time_slot: string | null; visit_time: string | null };

const VIETNAM_UTC_OFFSET_MS = 7 * 60 * 60_000;
export type RiskKind = 'rain' | 'heavy_rain' | 'thunder' | 'gust' | 'fog' | 'unusual';
export type RiskLevel = 'none' | 'caution' | 'high' | 'unknown';

export interface WeatherImpact {
  level: RiskLevel;
  kinds: RiskKind[];
  incomplete: boolean;
  from: number;
  to: number;
  forecastFetchedAt: number;
  scheduleFingerprint: string;
  riskSignature: string;
}

/** Converts a trip's Vietnamese civil date plus day number to UTC without using the device timezone. */
export function vietnamDayStart(startDate: string, dayNumber: number): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(startDate);
  if (!match || !Number.isInteger(dayNumber) || dayNumber < 1) return null;
  const [, y, m, d] = match.map(Number);
  const utc = Date.UTC(y, m - 1, d);
  const check = new Date(utc);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) return null;
  return utc + (dayNumber - 1) * 86_400_000 - VIETNAM_UTC_OFFSET_MS;
}

export function activityWindow(
  trip: Pick<Trip, 'start_date'>,
  item: Pick<TripItem, 'day_number' | 'time_slot' | 'visit_time'>,
  durationMinutes: number | null | undefined,
): { from: number; to: number; approximate: boolean } | null {
  if (!trip.start_date) return null;
  const day = vietnamDayStart(trip.start_date, item.day_number);
  if (day == null) return null;
  const slotRanges = { morning: [7, 12], afternoon: [12, 18], evening: [18, 23] } as const;
  const time = item.visit_time && /^(\d{1,2}):(\d{2})/.exec(item.visit_time);
  if (time) {
    const hour = Number(time[1]);
    const minute = Number(time[2]);
    if (hour >= 24 || minute >= 60) return null;
    const from = day + (hour * 60 + minute) * 60_000;
    const duration = durationMinutes && durationMinutes > 0 ? durationMinutes : 60;
    return { from, to: from + duration * 60_000, approximate: !(durationMinutes && durationMinutes > 0) };
  }
  const [begin, end] = slotRanges[(item.time_slot ?? 'morning') as keyof typeof slotRanges] ?? slotRanges.morning;
  return { from: day + begin * 3_600_000, to: day + end * 3_600_000, approximate: true };
}

export function scheduleFingerprint(trip: Pick<Trip, 'start_date'>, item: Pick<TripItem, 'id' | 'location_id' | 'day_number' | 'time_slot' | 'visit_time'>): string {
  return [item.id, trip.start_date ?? '', item.location_id ?? '', item.day_number, item.time_slot, item.visit_time ?? ''].join('|');
}

/** Select hourly records whose preceding-hour interval intersects the activity window. */
export function intersectingHours(hours: ForecastHour[], from: number, to: number): ForecastHour[] {
  return hours.filter((hour) => hour.endsAt > from && hour.endsAt - 3_600_000 < to);
}

export function assessWeatherImpact(
  trip: Pick<Trip, 'start_date'>,
  item: Pick<TripItem, 'id' | 'location_id' | 'day_number' | 'time_slot' | 'visit_time'>,
  durationMinutes: number | null | undefined,
  exposure: WeatherExposure,
  forecast: HourlyForecast,
): WeatherImpact | null {
  const window = activityWindow(trip, item, durationMinutes);
  if (!window) return null;
  const hours = intersectingHours(forecast.hours, window.from, window.to);
  const kinds = new Set<RiskKind>();
  let incomplete = hours.length === 0 || hours.length < Math.ceil((window.to - window.from) / 3_600_000);
  let high = false;
  let caution = false;
  for (const hour of hours) {
    const { weatherCode: code, precipitationProbability: probability, precipitationMm: rain,
      windGustKmh: gust, visibilityMeters: visibility } = hour;
    if ([code, probability, rain, gust, visibility].some((value) => value == null)) incomplete = true;
    if (code != null && (code < 0 || code > 99 || [56, 57, 66, 71, 73, 75, 77, 85, 86].includes(code))) {
      kinds.add('unusual'); caution = true;
    }
    if (code != null && [95, 96, 99].includes(code)) { kinds.add('thunder'); high = true; }
    if ((code != null && [65, 67, 82].includes(code)) || (rain != null && rain >= CFG.heavyRainMmPerHour)) {
      kinds.add('heavy_rain'); high = true;
    } else if ((rain != null && rain >= CFG.rainMmPerHour) || (probability != null && probability >= CFG.rainProbabilityPercent) || (code != null && code >= 51 && code <= 81)) {
      kinds.add('rain'); caution = true;
    }
    if (gust != null && gust >= CFG.strongGustKmh) { kinds.add('gust'); high = true; }
    if ((code != null && [45, 48].includes(code)) || (visibility != null && visibility < CFG.lowVisibilityMeters)) {
      kinds.add('fog');
      if (exposure === 'water' || exposure === 'cycling' || exposure === 'mountain_road') high = true;
      else caution = true;
    }
  }
  const level: RiskLevel = high ? 'high' : caution ? 'caution' : incomplete ? 'unknown' : 'none';
  const fingerprint = scheduleFingerprint(trip, item);
  const riskSignature = `${level}:${[...kinds].sort().join(',')}`;
  return {
    level, kinds: [...kinds].sort(), incomplete, from: window.from, to: window.to,
    forecastFetchedAt: forecast.fetchedAt, scheduleFingerprint: fingerprint, riskSignature,
  };
}
