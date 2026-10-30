import type { StringKey } from './i18n';

export interface CityCenter {
  code: 'HN' | 'SG' | 'DN';
  tKey: StringKey;
  lat: number;
  lng: number;
}

/** Toạ độ trung tâm 3 thành phố chính app hỗ trợ — đủ cho lọc/dự báo cấp tỉnh, không cần tra DB. */
export const VN_CITY_CENTERS: CityCenter[] = [
  { code: 'HN', tKey: 'cityHN',  lat: 21.0278, lng: 105.8342 },
  { code: 'SG', tKey: 'cityHCM', lat: 10.7769, lng: 106.7009 },
  { code: 'DN', tKey: 'cityDN',  lat: 16.0544, lng: 108.2022 },
];

function haversineMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/** Thành phố (trong 3 tp hỗ trợ) gần toạ độ cho trước nhất, theo đường chim bay. */
export function nearestCityCode(lat: number, lng: number): CityCenter['code'] {
  let best = VN_CITY_CENTERS[0];
  let bestDist = Infinity;
  for (const city of VN_CITY_CENTERS) {
    const d = haversineMeters(lat, lng, city.lat, city.lng);
    if (d < bestDist) { bestDist = d; best = city; }
  }
  return best.code;
}
