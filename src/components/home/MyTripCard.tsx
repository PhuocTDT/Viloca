import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { useT, type StringKey } from '@/src/lib/i18n';
import { useUpcomingTrip } from '@/src/hooks/useUpcomingTrip';
import { useTodaySchedule } from '@/src/hooks/useTodaySchedule';
import type { TimeSlot } from '@/src/types';

const N = colors.nomad;

const SLOT_KEY: Record<TimeSlot, StringKey> = {
  morning: 'slotMorning',
  afternoon: 'slotAfternoon',
  evening: 'slotEvening',
};

const MAX_ITEMS = 3;

/**
 * Thẻ "Chuyến đi của tôi" trên Home:
 *  - có chuyến đang diễn ra  -> lịch của hôm nay;
 *  - không thì có chuyến sắp tới -> tên chuyến và số ngày còn lại;
 *  - không có chuyến nào -> không hiển thị gì.
 */
export function MyTripCard() {
  const t = useT();
  const { trip: upcoming, activeTrip, daysUntil, loading } = useUpcomingTrip();
  const { items, dayNumber, loading: scheduleLoading } = useTodaySchedule(activeTrip);

  const shown = activeTrip ?? upcoming;
  if (loading || !shown) return null;

  const isActive = !!activeTrip;
  const title = isActive
    ? `${t('homeTripToday')} · ${t('homeTripDay')} ${dayNumber}`
    : t('homeTripUpcoming');
  const sub = isActive
    ? shown.title
    : `${shown.title} · ${daysUntil === 0 ? t('homeTripStartsToday') : `${daysUntil} ${t('homeTripDaysLeft')}`}`;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/trip/${shown.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${sub}`}
    >
      <View style={styles.head}>
        <View style={styles.iconWrap}>
          <Ionicons name={isActive ? 'walk-outline' : 'calendar-outline'} size={18} color={N.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub} numberOfLines={1}>{sub}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={N.outline} />
      </View>

      {isActive && (
        <View style={styles.list}>
          {scheduleLoading ? null : items.length === 0 ? (
            <Text style={styles.empty}>{t('homeTripNoItems')}</Text>
          ) : (
            items.slice(0, MAX_ITEMS).map((it) => (
              <View key={it.id} style={styles.row}>
                <Text style={styles.slot}>{t(SLOT_KEY[it.time_slot] ?? 'slotMorning')}</Text>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {it.experience_title ?? ''}
                </Text>
              </View>
            ))
          )}
          {items.length > MAX_ITEMS && (
            <Text style={styles.more}>+{items.length - MAX_ITEMS}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16, marginBottom: 16, padding: 14,
    backgroundColor: '#fff', borderRadius: 20,
    borderWidth: 1, borderColor: N.outlineVariant,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#E3F0D6',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 15, fontWeight: '700', color: N.onSurface },
  sub: { fontSize: 13, color: N.onSurfaceVariant, marginTop: 2 },
  list: { marginTop: 12, gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: N.surfaceContainer },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  slot: { width: 56, fontSize: 12, fontWeight: '600', color: N.primary },
  itemTitle: { flex: 1, fontSize: 14, color: N.onSurface },
  empty: { fontSize: 13, color: N.onSurfaceVariant },
  more: { fontSize: 12, color: N.outline },
});
