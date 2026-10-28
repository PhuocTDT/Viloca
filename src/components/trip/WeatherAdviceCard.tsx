import { useMemo, useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import { colors } from '@/src/theme/colors';
import { useLangStore } from '@/src/store/langStore';
import { useWeather } from '@/src/hooks/useWeather';
import { getWeatherIconInfo } from '@/src/lib/weather-codes';
import { useT } from '@/src/lib/i18n';
import type { WeatherAlert, WeatherProposal } from '@/src/hooks/useTripWeatherAdvice';

const N = colors.nomad;
const ACTIONS: WeatherProposal['action'][] = ['later', 'other_day', 'indoor', 'keep'];
const LABELS = {
  vi: { later: 'Dời sang muộn hơn', other_day: 'Đổi sang ngày khác', indoor: 'Thay bằng hoạt động trong nhà', keep: 'Giữ nguyên lịch trình',
    title: 'Sen gợi ý điều chỉnh lịch', noOption: 'Sen chưa tìm được phương án đã kiểm tra. Bạn có thể giữ nguyên hoặc chỉnh lịch thủ công.',
    changed: 'Dự báo đã thay đổi', current: 'Dự báo hiện tại', stale: 'Dữ liệu thời tiết chưa sẵn sàng',
    close: 'Đóng', back: 'Quay lại', saving: 'Đang lưu…', manual: 'Bạn cần tự kiểm tra điều kiện thực tế và giờ mở cửa.',
    booking: 'Chỉ sửa lịch trong Viloca. Nếu đã đặt vé/dịch vụ, hãy xác nhận lại với nhà cung cấp.',
    refreshed: 'Dự báo được lấy lúc', confirm: 'Xác nhận:', retry: 'Thử lại',
  },
  en: { later: 'Move later today', other_day: 'Move to another day', indoor: 'Replace with an indoor activity', keep: 'Keep itinerary',
    title: 'Sen suggests a schedule change', noOption: 'Sen could not find a checked option. You can keep the plan or edit it manually.',
    changed: 'Forecast has changed', current: 'Current forecast', stale: 'Weather data is not available',
    close: 'Close', back: 'Back', saving: 'Saving…', manual: 'Check actual conditions and opening hours yourself.',
    booking: 'This changes only your Viloca plan. Confirm any booking with the provider.',
    refreshed: 'Forecast fetched at', confirm: 'Confirm:', retry: 'Retry',
  },
} as const;

interface Props {
  coordinates?: { lat: number; lng: number };
  alerts: WeatherAlert[];
  loading: boolean;
  error: boolean;
  offline: boolean;
  onRefresh: () => void;
  onApply: (proposalId: string, requestId: string) => Promise<void>;
}

export function WeatherAdviceCard({ coordinates, alerts, loading, error, offline, onRefresh, onApply }: Props) {
  const language = useLangStore((state) => state.lang);
  const t = useT();
  const { weather } = useWeather(coordinates?.lat ?? null, coordinates?.lng ?? null);
  const weatherIcon = weather ? getWeatherIconInfo(weather.weatherCode) : null;
  const iconColor = !weather ? '#4A87D4' : weather.weatherCode === 0 ? '#E69216' : weather.weatherCode <= 3 ? '#5289CF' : '#2875BA';
  const iconBackground = !weather ? '#E6F2FF' : weather.weatherCode === 0 ? '#FFF1CB' : weather.weatherCode <= 3 ? '#E8F2FF' : '#DDF1FF';
  const copy = LABELS[language];
  const [showOverview, setShowOverview] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<WeatherAlert | null>(null);
  const [selectedAction, setSelectedAction] = useState<WeatherProposal['action'] | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<WeatherProposal | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const pendingRequest = useRef<{ proposalId: string; requestId: string } | null>(null);
  const selected = useMemo(() => alerts.find((item) => item.eventId === selectedAlert?.eventId) ?? selectedAlert, [alerts, selectedAlert]);
  const close = () => { if (!saving) { setShowOverview(false); setSelectedAlert(null); setSelectedAction(null); setSelectedProposal(null); setSaveError(''); } };
  const choose = async (proposal: WeatherProposal) => {
    if (offline || saving) return;
    setSaveError('');
    setSaving(true);
    if (pendingRequest.current?.proposalId !== proposal.id) {
      pendingRequest.current = { proposalId: proposal.id, requestId: Crypto.randomUUID() };
    }
    try {
      await onApply(proposal.id, pendingRequest.current.requestId);
      pendingRequest.current = null;
      setSaving(false);
      setSelectedAlert(null);
      setSelectedAction(null);
      setSelectedProposal(null);
      setShowOverview(false);
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : String(cause));
      setSaving(false);
    }
  };

  return (
    <View style={styles.chipWrap}>
      <TouchableOpacity style={styles.chip} onPress={() => setShowOverview(true)} accessibilityRole="button"
        accessibilityLabel={language === 'vi' ? 'Xem thời tiết và gợi ý của Sen' : 'View weather and Sen advice'}>
        <View style={[styles.chipIcon, { backgroundColor: iconBackground }]}><Ionicons name={(weatherIcon?.icon ?? 'cloud-outline') as any} size={15} color={iconColor} /></View>
        <Text style={styles.chipText}>{weather ? `${Math.round(weather.temperatureC)}° · ${t(weatherIcon!.labelKey)}` : (language === 'vi' ? 'Thời tiết' : 'Weather')}</Text>
        {alerts.length > 0 && <View style={styles.chipCount}><Text style={styles.chipCountText}>{alerts.length}</Text></View>}
        <Ionicons name="chevron-forward" size={13} color={N.primary} />
      </TouchableOpacity>
      <Modal visible={showOverview} animationType="slide" transparent onRequestClose={close}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{selected?.itemName ?? (language === 'vi' ? 'Thời tiết & Sen' : 'Weather & Sen')}</Text>
              <TouchableOpacity onPress={close} accessibilityRole="button" accessibilityLabel={copy.close}>
                <Ionicons name="close" size={22} color={N.onSurface} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.options}>
              {!selected ? <>
                {weather && <Text style={styles.weatherSummary}>{Math.round(weather.temperatureC)}°C · {t(weatherIcon!.labelKey)}</Text>}
                {error && <TouchableOpacity onPress={onRefresh} style={styles.option} accessibilityRole="button"><Text style={styles.optionText}>{copy.stale} · {copy.retry}</Text></TouchableOpacity>}
                {loading && <Text style={styles.muted}>{language === 'vi' ? 'Đang kiểm tra dự báo…' : 'Checking forecast…'}</Text>}
                {!loading && alerts.length === 0 && !error && <Text style={styles.muted}>{language === 'vi' ? 'Sen chưa thấy thay đổi thời tiết cần điều chỉnh lịch.' : 'Sen has no weather-related schedule changes to suggest.'}</Text>}
                {alerts.map((alert) => <TouchableOpacity key={alert.eventId} style={styles.option} onPress={() => { setSelectedAlert(alert); setSelectedAction(null); }} accessibilityRole="button">
                  <View style={{ flex: 1 }}><Text style={styles.alertTitle}>{alert.firstObservation ? copy.current : copy.changed} · {alert.itemName}</Text>
                    <Text style={styles.body}>{language === 'vi' ? `Ngày ${alert.dayNumber}${alert.time ? `, ${alert.time}` : ''}: ${alert.impact.kinds.join(', ') || 'thời tiết bất lợi'}.` : `Day ${alert.dayNumber}${alert.time ? `, ${alert.time}` : ''}: ${alert.impact.kinds.join(', ') || 'adverse weather'}.`}</Text>
                    <Text style={styles.muted}>{copy.refreshed} {new Date(alert.impact.forecastFetchedAt).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}</Text>
                    {alert.transport && <Text style={styles.transport}>{alert.transport.title}. {alert.transport.explanation}</Text>}
                  </View><Ionicons name="chevron-forward" size={17} color={N.primary} />
                </TouchableOpacity>)}
              </> : !selectedAction ? <>
                <TouchableOpacity onPress={() => setSelectedAlert(null)} accessibilityRole="button"><Text style={styles.muted}>← {copy.back}</Text></TouchableOpacity>
                <Text style={styles.body}>{language === 'vi' ? `Bạn muốn Sen làm gì với ${selected.itemName}?` : `What should Sen do with ${selected.itemName}?`}</Text>
                {ACTIONS.map((action) => (
                <TouchableOpacity key={action} style={styles.option} onPress={() => {
                  setSelectedAction(action); setSelectedProposal(null); setSaveError('');
                }} accessibilityRole="button">
                  <Text style={styles.optionText}>{copy[action]}</Text>
                  <Ionicons name="chevron-forward" size={17} color={N.primary} />
                </TouchableOpacity>
              ))}</> : (
                <>
                  <TouchableOpacity onPress={() => { setSelectedAction(null); setSelectedProposal(null); }} accessibilityRole="button"><Text style={styles.muted}>← {copy.back}</Text></TouchableOpacity>
                  <Text style={styles.sheetTitle}>{copy[selectedAction]}</Text>
                  {(selected?.proposals.filter((p) => p.action === selectedAction) ?? []).length === 0 ?
                    <Text style={styles.muted}>{copy.noOption}</Text> :
                    selected?.proposals.filter((p) => p.action === selectedAction).map((proposal) => (
                      <TouchableOpacity key={proposal.id} style={[styles.option, selectedProposal?.id === proposal.id && styles.activeOption]}
                        onPress={() => { setSelectedProposal(proposal); setSaveError(''); }} accessibilityRole="radio" accessibilityState={{ selected: selectedProposal?.id === proposal.id }}>
                        <Text style={styles.optionText}>{proposal.label}</Text>
                      </TouchableOpacity>
                    ))}
                  {selectedProposal && <>
                    {!selectedProposal.checked && <Text style={styles.warning}>{copy.manual}</Text>}
                    {selectedProposal.action !== 'keep' && <Text style={styles.muted}>{copy.booking}</Text>}
                    <TouchableOpacity style={[styles.button, (saving || offline) && styles.disabled]} disabled={saving || offline}
                      onPress={() => void choose(selectedProposal)} accessibilityRole="button">
                      <Text style={styles.buttonText}>{saving ? copy.saving : `${copy.confirm} ${selectedProposal.label}`}</Text>
                    </TouchableOpacity>
                  </>}
                  {!!saveError && <Text style={styles.warning}>{saveError}</Text>}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  chipWrap: { position: 'absolute', bottom: 13, right: 12, zIndex: 2 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,252,233,0.97)', paddingLeft: 4, paddingRight: 7, paddingVertical: 3, borderRadius: 18, maxWidth: 158, borderWidth: 1.5, borderColor: '#fff', elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  chipIcon: { width: 23, height: 23, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  chipText: { color: N.onSurface, fontSize: 11, fontWeight: '800', flexShrink: 1 },
  chipCount: { backgroundColor: N.secondaryContainer, minWidth: 17, height: 17, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  chipCountText: { color: N.onSurface, fontSize: 10, fontWeight: '800' },
  weatherSummary: { color: N.onSurface, fontSize: 18, fontWeight: '700' },
  card: { marginHorizontal: 12, marginVertical: 8, backgroundColor: N.secondaryContainer, borderRadius: 16, padding: 14, gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon: { fontSize: 20 },
  heading: { flex: 1, color: N.onSurface, fontSize: 15, fontWeight: '700' },
  alert: { backgroundColor: N.background, borderRadius: 12, padding: 12, gap: 5 },
  alertTitle: { color: N.onSurface, fontSize: 14, fontWeight: '700' },
  body: { color: N.onSurfaceVariant, fontSize: 13, lineHeight: 19 },
  muted: { color: N.onSurfaceVariant, fontSize: 12, lineHeight: 17 },
  transport: { color: N.primary, fontSize: 12, lineHeight: 18 },
  button: { alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 10, backgroundColor: N.primary, marginTop: 7 },
  buttonText: { color: N.onPrimary, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  disabled: { opacity: 0.5 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { maxHeight: '82%', backgroundColor: N.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  sheetTitle: { flex: 1, color: N.onSurface, fontSize: 17, fontWeight: '700' },
  options: { gap: 10, paddingVertical: 15 },
  option: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, borderColor: N.outlineVariant, borderRadius: 12, gap: 10 },
  activeOption: { borderColor: N.primary, backgroundColor: N.secondaryContainer },
  optionText: { flex: 1, color: N.onSurface, fontSize: 14, lineHeight: 20 },
  warning: { color: colors.warning, fontSize: 12, lineHeight: 18 },
});
