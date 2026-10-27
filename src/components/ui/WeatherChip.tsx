import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWeather } from '@/src/hooks/useWeather';
import { getWeatherIconInfo } from '@/src/lib/weather-codes';
import { useT } from '@/src/lib/i18n';
import { colors } from '@/src/theme/colors';
import { radius } from '@/src/theme/spacing';

const N = colors.nomad;

interface Props {
  lat: number;
  lng: number;
}

/** Chip nhỏ hiện nhiệt độ + icon thời tiết hiện tại tại 1 toạ độ. Tự ẩn khi đang tải hoặc lỗi. */
export function WeatherChip({ lat, lng }: Props) {
  const { weather, loading, error } = useWeather(lat, lng);
  const t = useT();

  if (loading || error || !weather) return null;

  const { icon, labelKey } = getWeatherIconInfo(weather.weatherCode);

  return (
    <View style={styles.chip}>
      <Ionicons name={icon as any} size={13} color={N.primary} />
      <Text style={styles.text}>{Math.round(weather.temperatureC)}°C · {t(labelKey)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: N.surfaceContainer,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '600', color: N.onSurfaceVariant },
});
