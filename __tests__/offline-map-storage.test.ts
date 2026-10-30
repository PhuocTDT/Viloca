jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///documents/', getInfoAsync: jest.fn(), readAsStringAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(), writeAsStringAsync: jest.fn(), deleteAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(), setItem: jest.fn(),
}));
import * as fs from 'expo-file-system/legacy';
import storage from '@react-native-async-storage/async-storage';
import { loadOfflineMap, saveOfflineMap } from '../src/lib/offline-map-storage';
import type { OfflineMapSnapshot } from '../src/lib/offline-map';

const snapshot: OfflineMapSnapshot = {
  version: 1, tripId: 'trip', day: 1, signature: '[]', title: 'Trip', savedAt: '2026-10-27T00:00:00Z', stops: [],
  image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aoyoAAAAASUVORK5CYII=',
};
beforeEach(() => { jest.clearAllMocks(); jest.mocked(storage.getItem).mockResolvedValue('previous.json'); });

test('failed file writes keep the previous map published', async () => {
  jest.mocked(fs.writeAsStringAsync).mockRejectedValueOnce(new Error('disk full'));
  await expect(saveOfflineMap('user', snapshot)).rejects.toThrow('disk full');
  expect(storage.setItem).not.toHaveBeenCalled();
  expect(fs.deleteAsync).not.toHaveBeenCalledWith('file:///documents/offline-maps/previous.json', expect.anything());
});

test('a pointer failure removes only the new document', async () => {
  jest.mocked(storage.setItem).mockRejectedValueOnce(new Error('quota'));
  await expect(saveOfflineMap('user', snapshot)).rejects.toThrow('quota');
  expect(fs.deleteAsync).not.toHaveBeenCalledWith('file:///documents/offline-maps/previous.json', expect.anything());
});

test('successful writes publish an account-specific pointer and clean up the previous file', async () => {
  await saveOfflineMap('user', snapshot);
  expect(storage.setItem).toHaveBeenCalledWith('viloca:offline-map:["user","trip",1]', expect.stringMatching(/\.json$/));
  expect(fs.deleteAsync).toHaveBeenCalledWith('file:///documents/offline-maps/previous.json', { idempotent: true });
});

test('cold reads require a local image belonging to the requested trip and day', async () => {
  jest.mocked(fs.getInfoAsync).mockResolvedValue({ exists: true } as fs.FileInfo);
  jest.mocked(fs.readAsStringAsync).mockResolvedValue(JSON.stringify(snapshot));
  expect(await loadOfflineMap('user', 'trip', 1)).toEqual(snapshot);
  expect(await loadOfflineMap('user', 'trip', 2)).toBeNull();
  jest.mocked(fs.readAsStringAsync).mockResolvedValue('{broken');
  expect(await loadOfflineMap('user', 'trip', 1)).toBeNull();
});
