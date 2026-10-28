import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Trip, TripItem, TripJournal } from '../types';

export interface CachedTripPayload {
  trip: Trip;
  items: TripItem[];
  journals: TripJournal[];
  cachedAt: string;
}

function cacheKey(tripId: string) {
  return `viloca:trip:${tripId}`;
}

/** Lưu lại dữ liệu trip (trip + items + journals) sau mỗi lần fetch thành công, để xem offline. */
export async function saveTripCache(tripId: string, payload: CachedTripPayload, requireSuccess = false): Promise<void> {
  try {
    await AsyncStorage.setItem(cacheKey(tripId), JSON.stringify(payload));
  } catch (error) {
    if (requireSuccess) throw error;
    // Lưu cache thất bại không nên chặn luồng chính — bỏ qua.
  }
}

/** Discover saved trips without depending on a successful network request. */
export async function loadCachedTrips(userId: string): Promise<Trip[]> {
  const keys = (await AsyncStorage.getAllKeys()).filter(key => key.startsWith('viloca:trip:'));
  if (!keys.length) return [];
  const entries = await AsyncStorage.multiGet(keys);
  return entries.flatMap(([, raw]) => {
    try {
      const value = raw ? JSON.parse(raw) as CachedTripPayload : null;
      return value?.trip?.user_id === userId ? [value.trip] : [];
    } catch { return []; }
  });
}

export async function removeTripCache(tripId: string): Promise<void> {
  await AsyncStorage.removeItem(cacheKey(tripId));
}

/** Đọc lại dữ liệu trip đã cache, dùng khi mất mạng hoặc fetch lỗi. */
export async function loadTripCache(tripId: string): Promise<CachedTripPayload | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(tripId));
    return raw ? (JSON.parse(raw) as CachedTripPayload) : null;
  } catch {
    return null;
  }
}
