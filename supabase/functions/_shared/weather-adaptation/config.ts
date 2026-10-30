/** Product defaults for a first rollout, not meteorological safety standards. */
export const WEATHER_ADAPTATION_CONFIG = {
  version: 1,
  proactiveHours: 72,
  forecastDays: 7,
  cacheFreshMs: 30 * 60_000,
  cacheStaleMs: 60 * 60_000,
  manualRefreshMinMs: 60_000,
  indoorRadiusKm: 10,
  rainProbabilityPercent: 60,
  rainMmPerHour: 1,
  heavyRainMmPerHour: 5,
  strongGustKmh: 40,
  lowVisibilityMeters: 1000,
  optionStepMinutes: 30,
  unknownTravelBufferMinutes: 30,
} as const;

export type WeatherRegion = 'hue' | 'hoi_an' | 'mekong_delta' | 'ha_giang';
export type ShelterType = 'indoor' | 'outdoor' | 'mixed' | 'unknown';
export type WeatherExposure = 'ordinary' | 'water' | 'cycling' | 'mountain_road';

export const REGION_LABELS: Record<WeatherRegion, { vi: string; en: string }> = {
  hue: { vi: 'Huế', en: 'Hue' },
  hoi_an: { vi: 'Hội An', en: 'Hoi An' },
  mekong_delta: { vi: 'Miền Tây', en: 'Mekong Delta' },
  ha_giang: { vi: 'Hà Giang', en: 'Ha Giang' },
};
