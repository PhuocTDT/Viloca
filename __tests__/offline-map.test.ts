import { offlineMapHtml, offlineMapSignature, offlineMapStops, validMapImage, type OfflineMapSnapshot } from '../src/lib/offline-map';
import { buildRouteMapHtml } from '../src/lib/trip-map-html';
import type { TripItem } from '../src/types';

const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aoyoAAAAASUVORK5CYII=';
function item(order: number, lat: number | null): TripItem {
  return { sort_order: order, experience_title: 'Stop', locations: lat === null ? null : { name: 'Điểm đến', coordinates: { lat, lng: 108 } } } as TripItem;
}

test('stop numbers remain aligned with the itinerary when a stop has no coordinates', () => {
  const stops = offlineMapStops([item(2, 16), item(0, null), item(1, 0)]);
  expect(stops.map(s => [s.order, s.lat])).toEqual([[1, null], [2, 0], [3, 16]]);
  expect(offlineMapStops([item(0, NaN)])[0].lat).toBeNull();
});

test('route signatures change for reorder, coordinates, notes and times', () => {
  const items = [item(0, 16), item(1, 17)];
  const signature = offlineMapSignature(offlineMapStops(items));
  for (const patch of [{ note: 'New note' }, { visit_time: '10:00' }, { sort_order: 2 }]) {
    expect(offlineMapSignature(offlineMapStops([{ ...items[0], ...patch }, items[1]]))).not.toBe(signature);
  }
  expect(offlineMapSignature(offlineMapStops([item(0, 18), items[1]]))).not.toBe(signature);
});

test('offline viewer embeds the image, has no network dependencies, and escapes user text', () => {
  const snapshot = { image, title: '"><script>alert(1)</script>' } as OfflineMapSnapshot;
  const html = offlineMapHtml(snapshot);
  expect(html).toContain(image);
  expect(html).not.toMatch(/(?:src|href)="https?:/);
  expect(html).toContain("default-src 'none'");
  expect(html).toContain('&lt;script&gt;');
  expect(html).not.toContain('<script>alert(1)</script>');
  expect(() => offlineMapHtml({ ...snapshot, image: 'https://example.com/map.png' })).toThrow();
  expect(validMapImage('data:image/png;base64,notpng')).toBe(false);
});

test('generated online scripts parse and stop names cannot close the script element', () => {
  const html = buildRouteMapHtml([{ lat: 16, lng: 108, order: 1, name: '</script><script>alert(1)</script>' }],
    { loadingRoute: 'Loading', minUnit: 'min' });
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  expect(scripts).toHaveLength(1);
  expect(() => new Function(scripts[0][1])).not.toThrow();
  expect(html).toContain('captureOfflineMap');
});
