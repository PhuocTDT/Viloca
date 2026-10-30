import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Trip, TripItem, TripJournal } from '../../types';
import { useT } from '../../lib/i18n';
import { buildRouteMapHtml } from '../../lib/trip-map-html';
import { offlineMapStops } from '../../lib/offline-map';
import { colors } from '../../theme/colors';

interface Props {
  trip: Trip;
  day: number;
  items: TripItem[];
  journals: TripJournal[];
  isOffline: boolean;
}

/**
 * Bản web của TripOfflineMap: `react-native-webview` không có implementation
 * cho web, và lưu bản đồ offline (`expo-file-system`) cũng không khả dụng
 * trên web (không có filesystem bền của thiết bị) — nên bản web chỉ hiện
 * route map trực tiếp qua `<iframe>`, không có nút lưu/xem offline.
 */
export function TripOfflineMap({ day, items }: Props) {
  const t = useT();
  const stops = useMemo(() => offlineMapStops(items.filter((item) => item.day_number === day)), [items, day]);
  const missingCoords = stops.some((stop) => stop.lat === null || stop.lng === null);
  const html = useMemo(() => buildRouteMapHtml(
    stops.filter((stop) => stop.lat !== null && stop.lng !== null)
      .map((stop) => ({ lat: stop.lat!, lng: stop.lng!, name: stop.name, order: stop.order })),
    { loadingRoute: t('mapRouteLoading'), minUnit: t('expMinUnit') },
  ), [stops, t]);

  return (
    <View style={s.container}>
      <View style={s.toolbar}>
        <Text style={s.hint}>{t('offlineMapHint')}</Text>
        {missingCoords && <Text style={s.warning}>{t('offlineMapMissingCoords')}</Text>}
      </View>
      <View style={s.map}>
        <iframe title="route-map" srcDoc={html} style={{ flex: 1, border: 0, width: '100%', height: '100%' }} />
      </View>
      <ScrollView style={s.legend} contentContainerStyle={s.legendContent}>
        {stops.map((stop) => (
          <View key={stop.order} style={s.stop}>
            <Text style={s.number}>{stop.order}</Text>
            <View style={s.stopText}>
              <Text style={s.name}>{stop.time ? `${stop.time} · ` : ''}{stop.name}</Text>
              {!!stop.address && <Text style={s.detail}>{stop.address}</Text>}
              {!!stop.note && <Text style={s.detail}>{stop.note}</Text>}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 }, map: { flex: 1, minHeight: 120 },
  toolbar: { paddingHorizontal: 16, paddingVertical: 8, gap: 6, backgroundColor: '#f3f7fc' },
  hint: { fontSize: 12, color: '#425466' },
  warning: { fontSize: 12, color: '#a34000' },
  legend: { maxHeight: 150, backgroundColor: '#fff' }, legendContent: { padding: 12, gap: 10 },
  stop: { flexDirection: 'row', gap: 10 }, number: { fontWeight: '800', color: colors.nomad.primary, width: 24 },
  stopText: { flex: 1 }, name: { fontSize: 13, fontWeight: '600', color: '#223' }, detail: { fontSize: 12, color: '#52606d', marginTop: 3 },
});
