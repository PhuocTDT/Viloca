// Mock the Supabase client: readLocations now determines pro/free explicitly
// via `supabase.auth.getUser()` + `profiles.plan`, instead of guessing from
// whether the full table came back empty.
const mockGetUser = jest.fn();
const mockSingle = jest.fn();
jest.mock('../src/lib/supabase', () => ({
  __esModule: true,
  default: {
    auth: { getUser: (...args: unknown[]) => mockGetUser(...args) },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: (...args: unknown[]) => mockSingle(...args),
        })),
      })),
    })),
  },
}));

import { readLocations, type LocationTable } from '../src/lib/location-access';

function mockPlan(plan: 'pro' | 'free' | null) {
  if (plan === null) {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    return;
  }
  mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
  mockSingle.mockResolvedValue({ data: { plan } });
}

describe('readLocations', () => {
  it('queries `locations` for a pro user', async () => {
    mockPlan('pro');
    const run = jest.fn(async () => ({ data: [{ id: '1' }], error: null }));
    const rows = await readLocations(run);
    expect(rows).toEqual([{ id: '1' }]);
    expect(run).toHaveBeenCalledWith('locations');
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('queries `locations_preview` for a free user, even when they can read some full rows (own-trip RLS)', async () => {
    mockPlan('free');
    const run = jest.fn(async (table: LocationTable) =>
      table === 'locations_preview' ? { data: [{ id: '2' }], error: null } : { data: [{ id: 'narrow' }], error: null }
    );
    const rows = await readLocations(run);
    expect(rows).toEqual([{ id: '2' }]);
    expect(run).toHaveBeenCalledWith('locations_preview');
    expect(run).toHaveBeenCalledTimes(1); // never touches `locations` at all for a free user
  });

  it('falls back to the view when a pro user\'s `locations` query errors', async () => {
    mockPlan('pro');
    const run = jest.fn(async (table: LocationTable) =>
      table === 'locations'
        ? { data: null, error: new Error('permission denied') }
        : { data: [{ id: '3' }], error: null }
    );
    const rows = await readLocations(run);
    expect(rows).toEqual([{ id: '3' }]);
  });

  it('treats an unauthenticated caller as free', async () => {
    mockPlan(null);
    const run = jest.fn(async () => ({ data: [{ id: '4' }], error: null }));
    await readLocations(run);
    expect(run).toHaveBeenCalledWith('locations_preview');
  });

  it('returns [] when both the table and the view come back empty', async () => {
    mockPlan('pro');
    const run = jest.fn(async () => ({ data: [], error: null }));
    expect(await readLocations(run)).toEqual([]);
  });

  it('returns [] when the view also errors', async () => {
    mockPlan('pro');
    const run = jest.fn(async (table: LocationTable) =>
      table === 'locations'
        ? { data: null, error: new Error('x') }
        : { data: null, error: new Error('y') }
    );
    expect(await readLocations(run)).toEqual([]);
  });
});
