import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { spacing, radius } from '@/src/theme/spacing';
import { useT } from '@/src/lib/i18n';
import { formatLocalDate, getDaysInMonth, getMondayFirstStartOffset } from '@/src/lib/date-utils';

const N = colors.nomad;

interface Props {
  currentStreak: number;
  shields: number;
  checkinDates: string[];
  isCheckedIn: (dateStr: string) => boolean;
  onDatePress: (dateStr: string) => void;
  canCheckinToday: boolean;
}

export function MonthlyCheckinCalendar({
  currentStreak,
  shields,
  isCheckedIn,
  onDatePress,
  canCheckinToday,
}: Props) {
  const t = useT();
  const [viewDate, setViewDate] = useState(() => new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const today = useMemo(() => new Date(), []);
  const todayDateStr = useMemo(() => formatLocalDate(today), [today]);
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  function handlePrevMonth() {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }
  function handleNextMonth() {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }
  function handleGoToday() {
    setViewDate(new Date());
  }

  // Weekday headers (Mon-first)
  const weekDays = useMemo(() => {
    const isEn = t('checkinCalendarMonth') === 'Month';
    return isEn
      ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
      : ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  }, [t]);

  // Build flat grid cells
  const cells = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const startOffset = getMondayFirstStartOffset(year, month);

    type Cell = { key: string; day: number | null; dateStr: string | null; isToday: boolean; isChecked: boolean; isFuture: boolean };
    const result: Cell[] = [];

    for (let i = 0; i < startOffset; i++) {
      result.push({ key: `pad-${i}`, day: null, dateStr: null, isToday: false, isChecked: false, isFuture: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      result.push({
        key: dateStr,
        day: d,
        dateStr,
        isToday: dateStr === todayDateStr,
        isChecked: isCheckedIn(dateStr),
        isFuture: dateStr > todayDateStr,
      });
    }

    // Pad end to fill last row
    const remainder = result.length % 7;
    if (remainder > 0) {
      for (let j = 0; j < 7 - remainder; j++) {
        result.push({ key: `end-${j}`, day: null, dateStr: null, isToday: false, isChecked: false, isFuture: false });
      }
    }

    return result;
  }, [year, month, todayDateStr, isCheckedIn]);

  // Month title
  const monthTitle = useMemo(() => {
    const isEn = t('checkinCalendarMonth') === 'Month';
    if (isEn) {
      const names = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      return `${names[month]} ${year}`;
    }
    return `Tháng ${month + 1}, ${year}`;
  }, [month, year, t]);

  const todayChecked = isCheckedIn(todayDateStr);

  return (
    <View style={styles.card}>
      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.streakPill}>
          <Ionicons name="flame" size={15} color="#E86427" />
          <Text style={styles.streakText}>
            {t('checkinStreakPillPfx')}{currentStreak}{t('checkinStreakPillSfx')}
          </Text>
        </View>
        {shields > 0 && (
          <View style={styles.shieldPill}>
            <Ionicons name="shield-checkmark" size={13} color={N.primary} />
            <Text style={styles.shieldText}>{shields}</Text>
          </View>
        )}
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={!todayChecked && canCheckinToday ? () => onDatePress(todayDateStr) : undefined}
          activeOpacity={!todayChecked ? 0.7 : 1}
          style={[styles.statusPill, todayChecked ? styles.statusDone : styles.statusPending]}
        >
          <Ionicons
            name={todayChecked ? 'checkmark-circle' : 'ellipse-outline'}
            size={12}
            color={todayChecked ? '#059669' : '#B45309'}
          />
          <Text style={[styles.statusText, todayChecked ? styles.statusTextDone : styles.statusTextPending]}>
            {todayChecked ? t('checkinBtnDone').replace(' ✓', '') : t('checkinBtnToday')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Month nav */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={handlePrevMonth} hitSlop={12} activeOpacity={0.6}>
          <Ionicons name="chevron-back" size={20} color={N.onSurfaceVariant} />
        </TouchableOpacity>
        <TouchableOpacity onPress={isCurrentMonth ? undefined : handleGoToday} activeOpacity={isCurrentMonth ? 1 : 0.6}>
          <Text style={styles.monthTitle}>{monthTitle}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNextMonth} hitSlop={12} activeOpacity={0.6}>
          <Ionicons name="chevron-forward" size={20} color={N.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekRow}>
        {weekDays.map((wd, i) => (
          <Text key={wd} style={[styles.weekLabel, i >= 5 && styles.weekLabelWeekend]}>{wd}</Text>
        ))}
      </View>

      {/* Calendar grid — no borders, just numbers + ticks */}
      <View style={styles.grid}>
        {cells.map((c) => {
          if (c.day === null) {
            return <View key={c.key} style={styles.cell} />;
          }

          return (
            <TouchableOpacity
              key={c.key}
              style={styles.cell}
              onPress={() => c.dateStr && onDatePress(c.dateStr)}
              activeOpacity={0.6}
            >
              {c.isChecked ? (
                <Image
                  source={require('@/assets/sen-grid/daily-checkin.png')}
                  style={styles.checkedStamp}
                  resizeMode="contain"
                />
              ) : (
                <Text
                  style={[
                    styles.dayNum,
                    c.isToday && styles.dayNumToday,
                    c.isFuture && styles.dayNumFuture,
                  ]}
                >
                  {c.day}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: N.outlineVariant,
  },

  /* Stats */
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm, flexWrap: 'wrap' },
  streakPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  streakText: { fontSize: 11, fontWeight: '700', color: '#C2410C' },
  shieldPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999 },
  shieldText: { fontSize: 11, fontWeight: '600', color: N.primary },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  statusDone: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' },
  statusPending: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' },
  statusText: { fontSize: 10, fontWeight: '700' },
  statusTextDone: { color: '#047857' },
  statusTextPending: { color: '#B45309' },

  /* Nav */
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  monthTitle: { fontSize: 15, fontWeight: '700', color: N.onSurface },

  /* Weekday headers */
  weekRow: { flexDirection: 'row', paddingBottom: 4, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: N.outlineVariant, marginBottom: 2 },
  weekLabel: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: N.outline },
  weekLabelWeekend: { color: '#C2410C' },

  /* Grid */
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.285%', height: 38, alignItems: 'center', justifyContent: 'center' },

  /* Day number */
  dayNum: { fontSize: 14, fontWeight: '600', color: N.onSurface },
  dayNumToday: { color: N.primary, fontWeight: '800' },
  dayNumFuture: { color: N.outline },

  /* Checked stamp */
  checkedStamp: { width: 30, height: 30 },
});
