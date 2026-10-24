// Mock the Supabase client so importing it doesn't pull in React Native /
// AsyncStorage (this file is only reached for `countLocations`, which calls
// `supabase.from` directly; `readLocations` never touches the real client
// because the caller supplies `run`).
jest.mock('../src/lib/supabase', () => ({
  __esModule: true,
  default: { from: jest.fn(() => ({ select: jest.fn() })) },
}));

import { readLocations, countLocations, type LocationTable } from '../src/lib/location-access';

describe('readLocations', () => {
  it('returns rows from `locations` when the full table has data (pro user)', async () => {
    const run = jest.fn(async (table: LocationTable) =>
      table === 'locations' ? { data: [{ id: '1' }], error: null } : { data: null, error: null }
    );
    const rows = await readLocations(run);
    expect(rows).toEqual([{ id: '1' }]);
    expect(run).toHaveBeenCalledTimes(1); // never needed to fall back
  });

  it('falls back to `locations_preview` when `locations` is empty (RLS-blocked free user)', async () => {
    const run = jest.fn(async (table: LocationTable) =>
      table === 'locations' ? { data: [], error: null } : { data: [{ id: '2' }], error: null }
    );
    const rows = await readLocations(run);
    expect(rows).toEqual([{ id: '2' }]);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('falls back to the view when `locations` errors', async () => {
    const run = jest.fn(async (table: LocationTable) =>
      table === 'locations'
        ? { data: null, error: new Error('permission denied') }
        : { data: [{ id: '3' }], error: null }
    );
    const rows = await readLocations(run);
    expect(rows).toEqual([{ id: '3' }]);
  });

  it('returns [] when both the table and the view come back empty', async () => {
    const run = jest.fn(async () => ({ data: [], error: null }));
    expect(await readLocations(run)).toEqual([]);
  });

  it('returns [] when the view also errors', async () => {
    const run = jest.fn(async (table: LocationTable) =>
      table === 'locations'
        ? { data: null, error: new Error('x') }
        : { data: null, error: new Error('y') }
    );
    expect(await readLocations(run)).toEqual([]);
  });
});

describe('countLocations', () => {
  it('returns the full-table count when it is truthy (pro user)', async () => {
    const apply = jest.fn(async (_q: unknown, table: LocationTable) => ({
      count: table === 'locations' ? 42 : 7,
    }));
    expect(await countLocations(apply)).toBe(42);
  });

  it('falls back to the preview count when the full table reports 0 (free user, RLS-blocked)', async () => {
    const apply = jest.fn(async (_q: unknown, table: LocationTable) => ({
      count: table === 'locations' ? 0 : 5,
    }));
    expect(await countLocations(apply)).toBe(5);
  });

  it('falls back to the preview count when the full table reports null', async () => {
    const apply = jest.fn(async (_q: unknown, table: LocationTable) => ({
      count: table === 'locations' ? null : 3,
    }));
    expect(await countLocations(apply)).toBe(3);
  });

  it('returns 0 when neither the table nor the view report a count', async () => {
    const apply = jest.fn(async () => ({ count: null }));
    expect(await countLocations(apply)).toBe(0);
  });
});
