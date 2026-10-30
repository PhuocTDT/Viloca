import assert from 'node:assert/strict';
import { activityWindow, assessWeatherImpact, vietnamDayStart } from '@/src/lib/weather-adaptation/impact';
import { forecastFreshness, parseHourlyForecast, type HourlyForecast } from '@/src/lib/weather-adaptation/forecast';
import type { Trip, TripItem } from '@/src/types';

const trip = { start_date: '2026-10-27' } as Trip;
const item = {
  id: 'trip-item-1', location_id: 'hoi-an-place', day_number: 1,
  time_slot: 'afternoon', visit_time: '16:00:00',
} as TripItem;

function hour(utcHour: number, code = 0, rain = 0, chance = 0, gust = 10, visibility = 10000) {
  return { endsAt: Date.UTC(2026, 9, 27, utcHour), weatherCode: code,
    precipitationMm: rain, precipitationProbability: chance,
    windGustKmh: gust, visibilityMeters: visibility };
}

function forecast(hours: HourlyForecast['hours']): HourlyForecast {
  return { latitude: 15.88, longitude: 108.33, fetchedAt: Date.UTC(2026, 9, 27, 0), hours };
}

test('Vietnam civil day and hour do not depend on device timezone', () => {
  assert.equal(vietnamDayStart('2026-10-27', 1), Date.UTC(2026, 9, 26, 17));
  assert.equal(vietnamDayStart('2026-10-27', 2), Date.UTC(2026, 9, 27, 17));
  assert.equal(vietnamDayStart('2026-02-30', 1), null);
  assert.deepEqual(activityWindow(trip, item, 90), {
    from: Date.UTC(2026, 9, 27, 9), to: Date.UTC(2026, 9, 27, 10, 30), approximate: false,
  });
});

test('afternoon without a fixed time is described as an approximate interval', () => {
  assert.deepEqual(activityWindow(trip, { ...item, visit_time: null }, null), {
    from: Date.UTC(2026, 9, 27, 5), to: Date.UTC(2026, 9, 27, 11), approximate: true,
  });
});

test('heavy rain in the latter half of a boat ride is detected', () => {
  const outcome = assessWeatherImpact(trip, item, 90, 'water', forecast([
    hour(10), hour(11, 82, 6, 90),
  ]));
  assert.equal(outcome?.level, 'high');
  assert.ok(outcome?.kinds.includes('heavy_rain'));
});

test('fog on a mountain road is hazardous even when weather icon might say cloudy', () => {
  const outcome = assessWeatherImpact(trip, item, 60, 'mountain_road', forecast([hour(10, 45, 0, 0, 10, 800)]));
  assert.equal(outcome?.level, 'high');
  assert.ok(outcome?.kinds.includes('fog'));
});

test('known thunder is not erased by missing visibility', () => {
  const cloudy = { ...hour(10, 95), visibilityMeters: null };
  const outcome = assessWeatherImpact(trip, item, 60, 'water', forecast([cloudy]));
  assert.equal(outcome?.level, 'high');
  assert.equal(outcome?.incomplete, true);
});

test('missing forecast hours are unknown, not clear weather', () => {
  assert.equal(assessWeatherImpact(trip, item, 90, 'ordinary', forecast([]))?.level, 'unknown');
});

test('hourly parser rejects mismatched arrays and keeps unknown values null', () => {
  const input = { hourly: { time: [Date.UTC(2026, 9, 27, 10) / 1000], weather_code: [null],
    precipitation_probability: [0], precipitation: [0], wind_gusts_10m: [10], visibility: [10000] } };
  assert.equal(parseHourlyForecast(input, 15.88, 108.33, 10).hours[0].weatherCode, null);
  assert.throws(() => parseHourlyForecast({ hourly: { ...input.hourly, visibility: [] } }, 15.88, 108.33, 10));
});

test('stale forecast is never treated as fresh', () => {
  const cached = forecast([]);
  assert.equal(forecastFreshness(cached, cached.fetchedAt + 31 * 60_000), 'aging');
  assert.equal(forecastFreshness(cached, cached.fetchedAt + 61 * 60_000), 'stale');
});
