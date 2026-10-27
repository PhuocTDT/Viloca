export interface StaticMapStop {
  lat: number;
  lng: number;
  order: number;
}

const ROUTE_COLOR = '1a73e8';
const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 400;

/**
 * URL ảnh bản đồ tĩnh (Mapbox Static Images API) vẽ các điểm dừng + đường nối theo thứ tự.
 * Trả `null` khi không có điểm nào hoặc chưa có token — caller tự xử lý fallback.
 */
export function buildMapboxStaticMapUrl(
  stops: StaticMapStop[],
  token: string,
  opts?: { width?: number; height?: number }
): string | null {
  if (!token || stops.length === 0) return null;

  const sorted = [...stops].sort((a, b) => a.order - b.order);
  const overlays: string[] = [];

  if (sorted.length >= 2) {
    const routeGeoJson = {
      type: 'Feature',
      properties: { stroke: `#${ROUTE_COLOR}`, 'stroke-width': 4, 'stroke-opacity': 0.85 },
      geometry: { type: 'LineString', coordinates: sorted.map((s) => [s.lng, s.lat]) },
    };
    overlays.push(`geojson(${encodeURIComponent(JSON.stringify(routeGeoJson))})`);
  }

  for (const s of sorted) {
    const label = s.order <= 99 ? String(s.order) : '';
    overlays.push(`pin-s-${label}+${ROUTE_COLOR}(${s.lng},${s.lat})`);
  }

  const width = opts?.width ?? DEFAULT_WIDTH;
  const height = opts?.height ?? DEFAULT_HEIGHT;

  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${overlays.join(',')}/auto/${width}x${height}@2x?access_token=${token}`;
}
