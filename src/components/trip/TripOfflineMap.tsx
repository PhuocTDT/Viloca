import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import type { Trip, TripItem, TripJournal } from '../../types';
import { useT } from '../../lib/i18n';
import { buildRouteMapHtml } from '../../lib/trip-map-html';
import { offlineMapHtml, offlineMapSignature, offlineMapStops, validMapImage, type OfflineMapSnapshot } from '../../lib/offline-map';
import { loadOfflineMap, saveOfflineMap } from '../../lib/offline-map-storage';
import { saveTripCache } from '../../lib/trip-cache';
import { colors } from '../../theme/colors';

interface Props {
  trip: Trip;
  day: number;
  items: TripItem[];
  journals: TripJournal[];
  isOffline: boolean;
}

export function TripOfflineMap({ trip, day, items, journals, isOffline }: Props) {
  const t = useT();
  const webView = useRef<WebView<{}>>(null);
  const [saved, setSaved] = useState<OfflineMapSnapshot | null>(null);
  const [checking, setChecking] = useState(true);
  const [preview, setPreview] = useState(false);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const pending = useRef<{ id: string; signature: string } | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stops = useMemo(() => offlineMapStops(items.filter(item => item.day_number === day)), [items, day]);
  const signature = offlineMapSignature(stops);
  const missingCoords = stops.some(stop => stop.lat === null || stop.lng === null);
  const staticMode = isOffline || preview;
  const stale = !!saved && saved.signature !== signature;
  const loadingLabel = t('mapRouteLoading');
  const minuteLabel = t('expMinUnit');
  const html = useMemo(() => buildRouteMapHtml(
    stops.filter(stop => stop.lat !== null && stop.lng !== null)
      .map(stop => ({ lat: stop.lat!, lng: stop.lng!, name: stop.name, order: stop.order })),
    { loadingRoute: loadingLabel, minUnit: minuteLabel },
  ), [signature, loadingLabel, minuteLabel]);
  const onlineSource = useMemo(() => ({ html }), [html]);
  const savedHtml = useMemo(() => saved ? offlineMapHtml(saved) : '', [saved]);

  useEffect(() => {
    let cancelled = false;
    setChecking(true);
    loadOfflineMap(trip.user_id, trip.id, day).then(snapshot => {
      if (!cancelled) { setSaved(snapshot); setChecking(false); }
    });
    return () => {
      cancelled = true;
      pending.current = null;
      if (timeout.current) clearTimeout(timeout.current);
      if (loadTimeout.current) clearTimeout(loadTimeout.current);
    };
  }, [trip.id, trip.user_id, day]);

  useEffect(() => {
    setReady(false);
    setSaving(false);
    pending.current = null;
    if (timeout.current) clearTimeout(timeout.current);
    if (!staticMode) loadTimeout.current = setTimeout(() => setError(true), 45000);
    return () => { if (loadTimeout.current) clearTimeout(loadTimeout.current); };
  }, [signature, staticMode, html]);

  function fail() {
    if (timeout.current) clearTimeout(timeout.current);
    pending.current = null;
    setSaving(false);
    setError(true);
  }

  function capture() {
    if (!ready || saving || missingCoords || isOffline) return;
    const requestId = `${Date.now()}-${day}`;
    pending.current = { id: requestId, signature };
    setSaving(true);
    setError(false);
    timeout.current = setTimeout(fail, 30000);
    webView.current?.injectJavaScript(`window.captureOfflineMap && window.captureOfflineMap(${JSON.stringify(requestId)}); true;`);
  }

  async function onMessage(event: WebViewMessageEvent) {
    let message: { type: string; requestId?: string; image?: string };
    try { message = JSON.parse(event.nativeEvent.data); } catch { return; }
    if (message.type === 'route-ready') {
      if (loadTimeout.current) clearTimeout(loadTimeout.current);
      setReady(true); setError(false); return;
    }
    if (message.type === 'route-error') { setReady(false); setError(true); return; }
    const request = pending.current;
    if (!request || message.requestId !== request.id || request.signature !== signature) return;
    if (message.type !== 'snapshot' || !validMapImage(message.image)) { fail(); return; }
    if (timeout.current) clearTimeout(timeout.current);
    const snapshot: OfflineMapSnapshot = {
      version: 1, tripId: trip.id, day, signature, savedAt: new Date().toISOString(),
      title: `${trip.title} · ${t('tripDayLabel')} ${day}`, stops, image: message.image,
    };
    try {
      // The itinerary must also survive a cold start before claiming offline readiness.
      await saveTripCache(trip.id, { trip, items, journals, cachedAt: snapshot.savedAt }, true);
      await saveOfflineMap(trip.user_id, snapshot);
      if (pending.current?.id !== request.id) return;
      pending.current = null;
      setSaved(snapshot);
      setSaving(false);
      setPreview(true);
    } catch { if (pending.current?.id === request.id) fail(); }
  }

  const legend = staticMode && saved ? saved.stops : stops;
  return (
    <View style={s.container}>
      <View style={s.toolbar}>
        <Text style={s.hint}>{t('offlineMapHint')}</Text>
        {saved && <Text style={[s.status, stale && s.warning]}>
          {stale ? t('offlineMapStale') : t('offlineMapSaved')} · {new Date(saved.savedAt).toLocaleString()}
        </Text>}
        {missingCoords && <Text style={s.warning}>{t('offlineMapMissingCoords')}</Text>}
        {error && !staticMode && <Text style={s.warning}>{t('offlineMapError')}</Text>}
        <View style={s.actions}>
          {!isOffline && !preview && (
            <TouchableOpacity accessibilityRole="button" disabled={!ready || saving || missingCoords}
              style={[s.button, (!ready || saving || missingCoords) && s.disabled]} onPress={capture}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.buttonText}>{t('offlineMapSave')}</Text>}
            </TouchableOpacity>
          )}
          {!isOffline && saved && (
            <TouchableOpacity accessibilityRole="button" disabled={saving} style={s.secondary} onPress={() => { setPreview(!preview); setError(false); }}>
              <Text style={s.link}>{t(preview ? 'offlineMapOnline' : 'offlineMapView')}</Text>
            </TouchableOpacity>
          )}
          {!isOffline && error && !preview && (
            <TouchableOpacity accessibilityRole="button" style={s.secondary} onPress={() => { setReady(false); setError(false); webView.current?.reload(); }}>
              <Text style={s.link}>{t('offlineMapRetry')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={s.map} pointerEvents={saving ? 'none' : 'auto'}>
        {staticMode ? checking ? <ActivityIndicator style={s.empty} /> : saved ? (
          <WebView key={`saved-${saved.savedAt}`} source={{ html: savedHtml }} style={s.map}
            originWhitelist={['about:blank']} javaScriptEnabled
            onShouldStartLoadWithRequest={request => request.url === 'about:blank'} />
        ) : <View style={s.empty}><Text style={s.hint}>{t('offlineMapNotSaved')}</Text></View> : (
          <WebView<{}> key={signature} ref={webView} source={onlineSource} style={s.map} javaScriptEnabled applicationNameForUserAgent="Viloca/1.0"
            onMessage={onMessage} onError={() => { setReady(false); setError(true); }}
            onHttpError={() => { setReady(false); setError(true); }}
            onLoadEnd={() => {
              webView.current?.injectJavaScript("if(!window.maplibregl){window.ReactNativeWebView.postMessage(JSON.stringify({type:'route-error'}));} true;");
            }} />
        )}
      </View>
      <ScrollView style={s.legend} contentContainerStyle={s.legendContent}>
        {legend.map(stop => <View key={stop.order} style={s.stop}>
          <Text style={s.number}>{stop.order}</Text>
          <View style={s.stopText}>
            <Text style={s.name}>{stop.time ? `${stop.time} · ` : ''}{stop.name}</Text>
            {!!stop.address && <Text style={s.detail}>{stop.address}</Text>}
            {!!stop.note && <Text style={s.detail}>{stop.note}</Text>}
          </View>
        </View>)}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 }, map: { flex: 1, minHeight: 120 },
  toolbar: { paddingHorizontal: 16, paddingVertical: 8, gap: 6, backgroundColor: '#f3f7fc' },
  hint: { fontSize: 12, color: '#425466' }, status: { fontSize: 12, color: '#188038' },
  warning: { fontSize: 12, color: '#a34000' }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: { backgroundColor: colors.nomad.primary, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 8, minHeight: 42 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 13 }, disabled: { opacity: 0.45 },
  secondary: { padding: 11 }, link: { color: colors.nomad.primary, fontSize: 13, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  legend: { maxHeight: 150, backgroundColor: '#fff' }, legendContent: { padding: 12, gap: 10 },
  stop: { flexDirection: 'row', gap: 10 }, number: { fontWeight: '800', color: '#1a73e8', width: 24 },
  stopText: { flex: 1 }, name: { fontSize: 13, fontWeight: '600', color: '#223' }, detail: { fontSize: 12, color: '#52606d', marginTop: 3 },
});
