import { getWeatherIconInfo } from '../src/lib/weather-codes';

describe('getWeatherIconInfo', () => {
  it('code 0 → clear', () => {
    expect(getWeatherIconInfo(0)).toEqual({ icon: 'sunny-outline', labelKey: 'weatherClear' });
  });

  it('code 2 (partly cloudy) → cloudy', () => {
    expect(getWeatherIconInfo(2).labelKey).toBe('weatherCloudy');
  });

  it('code 45 (fog) → cloudy', () => {
    expect(getWeatherIconInfo(45).labelKey).toBe('weatherCloudy');
  });

  it('code 61 (rain, slight) → rain light', () => {
    expect(getWeatherIconInfo(61).labelKey).toBe('weatherRainLight');
  });

  it('code 63 (rain, moderate) → rain', () => {
    expect(getWeatherIconInfo(63).labelKey).toBe('weatherRain');
  });

  it('code 65 (rain, heavy) → rain heavy', () => {
    expect(getWeatherIconInfo(65).labelKey).toBe('weatherRainHeavy');
  });

  it('code 80 (rain shower, slight) → rain light', () => {
    expect(getWeatherIconInfo(80).labelKey).toBe('weatherRainLight');
  });

  it('code 73 (snow) → rain heavy (folded into nearest rain bucket)', () => {
    expect(getWeatherIconInfo(73).labelKey).toBe('weatherRainHeavy');
  });

  it('code 95 (thunderstorm) → rain heavy', () => {
    expect(getWeatherIconInfo(95).labelKey).toBe('weatherRainHeavy');
  });

  it('unrecognized code → rain fallback', () => {
    expect(getWeatherIconInfo(999).labelKey).toBe('weatherRain');
  });
});
