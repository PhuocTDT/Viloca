import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TouchableWithoutFeedback,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserLocation } from '@/src/hooks/useUserLocation';
import { colors } from '@/src/theme/colors';
import { useT, type StringKey } from '@/src/lib/i18n';
import { getWeatherIconInfo } from '@/src/lib/weather-codes';
import { VN_CITY_CENTERS, type CityCenter } from '@/src/lib/vn-cities';

const N = colors.nomad;

const WEEKDAY_KEYS: StringKey[] = [
  'weekdaySun', 'weekdayMon', 'weekdayTue', 'weekdayWed', 'weekdayThu', 'weekdayFri', 'weekdaySat',
];

interface DailyForecast {
  weekday: number; // 0=Sun..6=Sat, local calendar day
  day: number;
  month: number;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
}

function DayRow({ day, isToday }: { day: DailyForecast; isToday: boolean }) {
  const t = useT();
  const { icon, labelKey } = getWeatherIconInfo(day.weatherCode);
  const dateLabel = `${t(WEEKDAY_KEYS[day.weekday])} ${day.day}/${day.month}`;
  const iconColor = isToday ? '#fff' : N.primary;
  return (
    <View style={[styles.dayRow, isToday && styles.dayRowToday]}>
      <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]} numberOfLines={1}>
        {isToday ? t('homeTripToday') : dateLabel}
      </Text>
      <View style={styles.dayIconWrap}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
        <Text style={[styles.dayCondition, isToday && styles.dayConditionToday]} numberOfLines={1}>{t(labelKey)}</Text>
      </View>
      <Text style={[styles.dayTemp, isToday && styles.dayTempToday]}>
        {Math.round(day.tempMax)}° <Text style={[styles.dayTempMin, isToday && styles.dayTempMinToday]}>{Math.round(day.tempMin)}°</Text>
      </Text>
    </View>
  );
}

/** Dự báo 7 ngày cho 1 toạ độ. Tự huỷ fetch cũ khi lat/lng đổi. */
function useForecast(lat: number | null | undefined, lng: number | null | undefined) {
  const [forecast, setForecast] = useState<DailyForecast[] | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(false);

  useEffect(() => {
    if (lat == null || lng == null) { setForecast(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=7&timezone=auto`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const daily = data?.daily;
        if (!daily?.time) { setError(true); return; }
        const days: DailyForecast[] = (daily.time as string[]).map((dateStr, i) => {
          const [y, m, d] = dateStr.split('-').map(Number);
          return {
            weekday: new Date(y, m - 1, d).getDay(),
            day: d,
            month: m,
            weatherCode: daily.weather_code[i],
            tempMax: daily.temperature_2m_max[i],
            tempMin: daily.temperature_2m_min[i],
          };
        });
        setForecast(days);
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [lat, lng]);

  return { forecast, loading, error };
}

export default function WeatherScreen() {
  const insets = useSafeAreaInsets();
  const t = useT();

  const { coords: userCoords, permissionDenied, loading: locationLoading } = useUserLocation();
  const [city, setCity] = useState<CityCenter | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const lat = city ? city.lat : userCoords?.latitude;
  const lng = city ? city.lng : userCoords?.longitude;
  const { forecast, loading: forecastLoading, error: forecastError } = useForecast(lat, lng);

  const noCurrentLocation = !city && !locationLoading && (permissionDenied || !userCoords);
  const placeName = city ? t(city.tKey) : t('weatherCurrentLocation');

  function pickCity(opt: CityCenter | null) {
    setCity(opt);
    setMenuOpen(false);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={N.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('gridWeather')}</Text>
      </View>

      <View style={styles.menuWrap}>
        <View style={styles.placeRow}>
          <Ionicons name={city ? 'location' : 'navigate'} size={14} color={N.primary} />
          <Text style={styles.placeName} numberOfLines={1}>{placeName}</Text>
          <TouchableOpacity style={styles.menuTrigger} onPress={() => setMenuOpen((v) => !v)}>
            <Text style={styles.menuTriggerText}>{t('weatherChangeLocation')}</Text>
            <Ionicons name={menuOpen ? 'chevron-up' : 'chevron-down'} size={14} color={N.primary} />
          </TouchableOpacity>
        </View>

        {menuOpen && (
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuRow} onPress={() => pickCity(null)}>
              <Ionicons name="navigate-outline" size={14} color={N.onSurfaceVariant} />
              <Text style={styles.menuRowText}>{t('weatherCurrentLocation')}</Text>
            </TouchableOpacity>
            {VN_CITY_CENTERS.map((opt) => (
              <TouchableOpacity key={opt.code} style={styles.menuRow} onPress={() => pickCity(opt)}>
                <Ionicons name="location-outline" size={14} color={N.onSurfaceVariant} />
                <Text style={styles.menuRowText}>{t(opt.tKey)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <TouchableWithoutFeedback onPress={() => setMenuOpen(false)}>
        <View style={styles.body}>
          {noCurrentLocation ? (
            <View style={styles.lockWrap}>
              <Ionicons name="navigate-outline" size={28} color={N.outline} />
              <Text style={styles.lockText}>{t('weatherNoPermission')}</Text>
            </View>
          ) : locationLoading && !city ? (
            <ActivityIndicator color={N.primary} style={{ marginTop: 48 }} />
          ) : forecastLoading ? (
            <ActivityIndicator color={N.primary} style={{ marginTop: 48 }} />
          ) : forecastError || !forecast ? (
            <View style={styles.lockWrap}>
              <Ionicons name="cloud-offline-outline" size={28} color={N.outline} />
              <Text style={styles.lockText}>{t('weatherLoadError')}</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
              {forecast.map((day, i) => (
                <DayRow key={`${day.month}-${day.day}`} day={day} isToday={i === 0} />
              ))}
            </ScrollView>
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: N.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: N.onSurface },

  menuWrap: { paddingHorizontal: 16, zIndex: 10 },
  placeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  placeName: { flex: 1, fontSize: 15, fontWeight: '700', color: N.onSurface },
  menuTrigger: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99,
    backgroundColor: N.surfaceContainer,
  },
  menuTriggerText: { fontSize: 12, fontWeight: '600', color: N.primary },

  menu: {
    backgroundColor: '#fff', borderRadius: 12, marginTop: 8,
    borderWidth: 1, borderColor: N.outlineVariant, overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: N.surfaceContainerLow,
  },
  menuRowText: { flex: 1, fontSize: 13, color: N.onSurface, fontWeight: '500' },

  body: { flex: 1, paddingTop: 12 },

  lockWrap: { alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 56, paddingHorizontal: 40 },
  lockText: { fontSize: 13, color: N.onSurfaceVariant, textAlign: 'center', lineHeight: 19 },

  list: { paddingHorizontal: 16, paddingBottom: 32, gap: 8 },
  dayRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: N.outlineVariant,
  },
  dayRowToday: {
    backgroundColor: N.primary, borderColor: N.primary,
    paddingVertical: 14,
    elevation: 3, shadowColor: N.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 8,
  },
  dayLabel:         { width: 64, fontSize: 13, fontWeight: '600', color: N.onSurface },
  dayLabelToday:    { color: '#fff', fontSize: 14, fontWeight: '800' },
  dayIconWrap:      { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  dayCondition:     { fontSize: 12, color: N.onSurfaceVariant },
  dayConditionToday:{ color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  dayTemp:          { fontSize: 14, fontWeight: '700', color: N.onSurface },
  dayTempToday:     { color: '#fff', fontSize: 16 },
  dayTempMin:       { fontSize: 13, fontWeight: '500', color: N.outline },
  dayTempMinToday:  { color: 'rgba(255,255,255,0.75)' },
});
