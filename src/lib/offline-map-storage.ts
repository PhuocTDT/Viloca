import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validMapImage, type OfflineMapSnapshot } from './offline-map';

function directory() {
  if (!FileSystem.documentDirectory) throw new Error('Offline maps require a device filesystem');
  return `${FileSystem.documentDirectory}offline-maps/`;
}

function pointerKey(userId: string, tripId: string, day: number) {
  return `viloca:offline-map:${JSON.stringify([userId, tripId, day])}`;
}

export async function loadOfflineMap(userId: string, tripId: string, day: number): Promise<OfflineMapSnapshot | null> {
  try {
    const filename = await AsyncStorage.getItem(pointerKey(userId, tripId, day));
    if (!filename || !/^[a-zA-Z0-9-]+\.json$/.test(filename)) return null;
    const path = directory() + filename;
    if (!(await FileSystem.getInfoAsync(path)).exists) return null;
    const saved = JSON.parse(await FileSystem.readAsStringAsync(path)) as OfflineMapSnapshot;
    return saved.version === 1 && saved.tripId === tripId && saved.day === day
      && typeof saved.signature === 'string' && Number.isFinite(Date.parse(saved.savedAt))
      && typeof saved.title === 'string' && Array.isArray(saved.stops)
      && saved.stops.every(stop => Number.isFinite(stop.order) && typeof stop.name === 'string'
        && typeof stop.address === 'string' && typeof stop.note === 'string' && typeof stop.time === 'string')
      && validMapImage(saved.image) ? saved : null;
  } catch { return null; }
}

export async function saveOfflineMap(userId: string, snapshot: OfflineMapSnapshot): Promise<void> {
  if (!validMapImage(snapshot.image)) throw new Error('Invalid map image');
  const key = pointerKey(userId, snapshot.tripId, snapshot.day);
  const previous = await AsyncStorage.getItem(key);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.json`;
  const path = directory() + filename;
  await FileSystem.makeDirectoryAsync(directory(), { intermediates: true });
  // Publish only after writing the complete file. A failed write preserves the old map.
  try {
    await FileSystem.writeAsStringAsync(path, JSON.stringify(snapshot));
    await AsyncStorage.setItem(key, filename);
  } catch (error) {
    await FileSystem.deleteAsync(path, { idempotent: true }).catch(() => {});
    throw error;
  }
  if (previous && /^[a-zA-Z0-9-]+\.json$/.test(previous)) {
    await FileSystem.deleteAsync(directory() + previous, { idempotent: true }).catch(() => {});
  }
}

/**
 * Xoá mọi bản đồ offline đã lưu của 1 trip (mọi ngày) — gọi khi xoá trip, tránh để lại
 * file ảnh mồ côi trong FileSystem. Không cần biết trước trip có bao nhiêu ngày: quét
 * AsyncStorage theo tiền tố key để tìm đúng mọi (userId, tripId, *).
 */
export async function deleteOfflineMapsForTrip(userId: string, tripId: string): Promise<void> {
  try {
    const prefix = `viloca:offline-map:${JSON.stringify([userId, tripId]).slice(0, -1)},`;
    const allKeys = await AsyncStorage.getAllKeys();
    const matching = allKeys.filter((k) => k.startsWith(prefix));
    if (matching.length === 0) return;

    const entries = await AsyncStorage.multiGet(matching);
    const dir = directory();
    await Promise.all(entries.map(async ([, filename]) => {
      if (filename && /^[a-zA-Z0-9-]+\.json$/.test(filename)) {
        await FileSystem.deleteAsync(dir + filename, { idempotent: true }).catch(() => {});
      }
    }));
    await AsyncStorage.multiRemove(matching);
  } catch {
    // Best-effort — không chặn việc xoá trip nếu dọn file offline-map lỗi.
  }
}
