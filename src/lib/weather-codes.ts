import type { StringKey } from './i18n';

export interface WeatherIconInfo {
  icon: string;
  labelKey: StringKey;
}

/**
 * Map mã thời tiết WMO (Open-Meteo `weather_code`) sang icon Ionicons + key i18n.
 * Chỉ dùng 3 nhóm phù hợp khí hậu VN — Nắng / Nhiều mây / Mưa (có mức độ nhỏ–vừa–lớn) —
 * gộp các mã hiếm gặp ở VN (sương mù, tuyết, giông) vào nhóm mưa gần nhất thay vì
 * hiện riêng, vì chúng gây hiểu nhầm (vd "giông bão" nghe như bão) hoặc không xảy ra.
 */
export function getWeatherIconInfo(code: number): WeatherIconInfo {
  if (code === 0) return { icon: 'sunny-outline', labelKey: 'weatherClear' };
  if ((code >= 1 && code <= 3) || code === 45 || code === 48) {
    return { icon: 'cloudy-outline', labelKey: 'weatherCloudy' };
  }
  // Mưa nhỏ: mưa phùn, mưa rào nhẹ
  if ([51, 53, 56, 61, 71, 77, 80].includes(code)) {
    return { icon: 'rainy-outline', labelKey: 'weatherRainLight' };
  }
  // Mưa lớn: mưa to, mưa đá, giông, tuyết dày (hiếm, gộp tạm vào đây)
  if ([65, 67, 73, 75, 82, 86, 95, 96, 99].includes(code)) {
    return { icon: 'rainy-outline', labelKey: 'weatherRainHeavy' };
  }
  // Mưa vừa: mã mưa còn lại (55, 57, 63, 81, ...) + fallback an toàn cho mã lạ
  return { icon: 'rainy-outline', labelKey: 'weatherRain' };
}
