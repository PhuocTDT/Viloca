import {
  suggestTime,
  tripDayCount,
  dayLabel,
  formatDate,
  buildGoogleMapsUrl,
  stripDiacritics,
} from '../src/lib/trip-utils';
import type { Trip, TripItem } from '../src/types';

// ─── suggestTime ─────────────────────────────────────────────────────────────

describe('suggestTime', () => {
  it('morning slot, first item → 07:00', () => {
    expect(suggestTime('morning', 0)).toBe('07:00');
  });

  it('morning slot, second item → 08:30 (90-min offset)', () => {
    expect(suggestTime('morning', 1)).toBe('08:30');
  });

  it('afternoon slot, first item → 13:00', () => {
    expect(suggestTime('afternoon', 0)).toBe('13:00');
  });

  it('afternoon slot, second item → 14:30', () => {
    expect(suggestTime('afternoon', 1)).toBe('14:30');
  });

  it('evening slot, first item → 18:00', () => {
    expect(suggestTime('evening', 0)).toBe('18:00');
  });

  it('unknown slot falls back to morning base → 07:00', () => {
    expect(suggestTime('unknown_slot', 0)).toBe('07:00');
  });

  it('pads single-digit minutes with zero', () => {
    // morning slot index 0 → 07:00 (already tested)
    // afternoon slot index 3 → 13:00 + 270min = 17:30
    expect(suggestTime('afternoon', 3)).toBe('17:30');
  });
});

// ─── tripDayCount ─────────────────────────────────────────────────────────────

function makeTrip(overrides: Partial<Trip>): Trip {
  return {
    id: 'test-id',
    user_id: 'u1',
    title: 'Test',
    destination: 'Hà Nội',
    start_date: null,
    end_date: null,
    cover_image: null,
    status: 'planning',
    summary_note: null,
    place_id: null,
    is_ai_generated: false,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('tripDayCount', () => {
  it('returns 0 when no dates set', () => {
    expect(tripDayCount(makeTrip({}))).toBe(0);
  });

  it('returns 0 when only start_date is set', () => {
    expect(tripDayCount(makeTrip({ start_date: '2026-09-18' }))).toBe(0);
  });

  it('returns 1 for same-day trip', () => {
    expect(tripDayCount(makeTrip({ start_date: '2026-09-18', end_date: '2026-09-18' }))).toBe(1);
  });

  it('returns 2 for two-day trip', () => {
    expect(tripDayCount(makeTrip({ start_date: '2026-09-18', end_date: '2026-09-19' }))).toBe(2);
  });

  it('returns 7 for a week trip', () => {
    expect(tripDayCount(makeTrip({ start_date: '2026-09-01', end_date: '2026-09-07' }))).toBe(7);
  });

  it('clamps to 30 when range exceeds 30 days', () => {
    expect(tripDayCount(makeTrip({ start_date: '2026-01-01', end_date: '2026-12-31' }))).toBe(30);
  });
});

// ─── formatDate ──────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('converts ISO date to DD/MM/YYYY', () => {
    expect(formatDate('2026-09-18')).toBe('18/09/2026');
  });

  it('returns em-dash for empty string', () => {
    expect(formatDate('')).toBe('—');
  });

  it('pads single-digit day and month', () => {
    expect(formatDate('2026-01-05')).toBe('05/01/2026');
  });
});

// ─── dayLabel ────────────────────────────────────────────────────────────────

describe('dayLabel', () => {
  it('returns "Ngày N" when no start_date', () => {
    expect(dayLabel(makeTrip({}), 3)).toBe('Ngày 3');
  });

  it('includes date when start_date is set', () => {
    const label = dayLabel(makeTrip({ start_date: '2026-09-18' }), 1);
    expect(label).toBe('Ngày 1 · 18/9');
  });

  it('advances date correctly for day 2', () => {
    const label = dayLabel(makeTrip({ start_date: '2026-09-18' }), 2);
    expect(label).toBe('Ngày 2 · 19/9');
  });
});

// ─── buildGoogleMapsUrl ───────────────────────────────────────────────────────

function makeItem(overrides: Partial<TripItem> & { locOverride?: any } = {}): TripItem {
  const { locOverride, ...rest } = overrides;
  return {
    id: 'item-1',
    trip_id: 'trip-1',
    experience_id: null,
    location_id: null,
    experience_title: null,
    experience_location: null,
    experience_image: null,
    experience_category: null,
    day_number: 1,
    time_slot: 'morning',
    visit_time: null,
    note: null,
    ai_reason: null,
    sort_order: 0,
    locations: locOverride ?? null,
    ...rest,
  };
}

describe('buildGoogleMapsUrl', () => {
  it('returns base maps URL for empty array', () => {
    expect(buildGoogleMapsUrl([])).toBe('https://maps.google.com');
  });

  it('returns search URL for single item with coordinates', () => {
    const item = makeItem({ locOverride: { coordinates: { lat: 10.762, lng: 106.660 } } });
    const url = buildGoogleMapsUrl([item]);
    expect(url).toContain('maps/search');
    expect(url).toContain('10.762');
    expect(url).toContain('106.66');
  });

  it('returns directions URL for two items with coordinates', () => {
    const item1 = makeItem({ sort_order: 0, locOverride: { coordinates: { lat: 10.762, lng: 106.660 } } });
    const item2 = makeItem({ id: 'item-2', sort_order: 1, locOverride: { coordinates: { lat: 10.775, lng: 106.700 } } });
    const url = buildGoogleMapsUrl([item1, item2]);
    expect(url).toContain('maps/dir');
    expect(url).toContain('origin=10.762');
    expect(url).toContain('destination=10.775');
    expect(url).toContain('travelmode=driving');
  });

  it('no waypoints param for exactly two items', () => {
    const item1 = makeItem({ sort_order: 0, locOverride: { coordinates: { lat: 10.762, lng: 106.660 } } });
    const item2 = makeItem({ id: 'item-2', sort_order: 1, locOverride: { coordinates: { lat: 10.775, lng: 106.700 } } });
    const url = buildGoogleMapsUrl([item1, item2]);
    expect(url).not.toContain('waypoints=');
  });

  it('includes waypoints param for three items', () => {
    const item1 = makeItem({ sort_order: 0, locOverride: { coordinates: { lat: 10.762, lng: 106.660 } } });
    const item2 = makeItem({ id: 'item-2', sort_order: 1, locOverride: { coordinates: { lat: 10.770, lng: 106.680 } } });
    const item3 = makeItem({ id: 'item-3', sort_order: 2, locOverride: { coordinates: { lat: 10.775, lng: 106.700 } } });
    const url = buildGoogleMapsUrl([item1, item2, item3]);
    expect(url).toContain('waypoints=');
    expect(url).toContain('10.77');
  });

  it('falls back to encoded address when no coordinates', () => {
    const item = makeItem({ locOverride: { address: 'Hội An, Quảng Nam', coordinates: null } });
    const url = buildGoogleMapsUrl([item]);
    expect(url).toContain('maps/search');
    expect(url).toContain(encodeURIComponent('Hội An, Quảng Nam'));
  });
});

// ─── stripDiacritics ─────────────────────────────────────────────────────────

describe('stripDiacritics', () => {
  it('removes Vietnamese diacritics', () => {
    expect(stripDiacritics('Hội An')).toBe('Hoi An');
  });

  it('converts đ to d and Đ to D', () => {
    expect(stripDiacritics('đường')).toBe('duong');
    expect(stripDiacritics('Đà Nẵng')).toBe('Da Nang');
  });

  it('leaves plain ASCII unchanged', () => {
    expect(stripDiacritics('Hanoi')).toBe('Hanoi');
  });

  it('handles mixed string', () => {
    expect(stripDiacritics('TP. Hồ Chí Minh')).toBe('TP. Ho Chi Minh');
  });
});
