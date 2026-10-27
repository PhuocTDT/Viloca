import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { InfoAlertModal } from '@/src/components/ui/InfoAlertModal';
import { colors } from '@/src/theme/colors';
import { spacing, radius } from '@/src/theme/spacing';
import { useCheckin } from '@/src/hooks/useCheckin';
import { useT } from '@/src/lib/i18n';
import type { CheckinResult } from '@/src/types';

const N = colors.nomad;

export default function CheckinScreen() {
  const t = useT();
  const { state, milestones, loading, canCheckinToday, checkin } = useCheckin();
  const [submitting, setSubmitting] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ title: string; message: string } | null>(null);

  const streak = state?.current_streak ?? 0;
  const shields = state?.streak_shields ?? 0;
  const nextMilestone = milestones.find((m) => m.day_threshold > streak);

  async function handleCheckin() {
    setSubmitting(true);
    const result = await checkin();
    setSubmitting(false);

    if (!result.ok) {
      setAlertInfo({ title: t('checkinTitle'), message: t('checkinAlreadyDone') });
      return;
    }

    const r: CheckinResult = result.result;
    const lines: string[] = [];
    if (r.milestone_hit) {
      lines.push(`${t('checkinMilestoneReachedPfx')}${r.milestone_hit}${t('checkinMilestoneReachedSfx')}`);
    }
    if (r.credits_granted > 0) {
      lines.push(`${t('checkinRewardCreditPfx')}${r.credits_granted} ${t('missionCreditUnit')}`);
    }
    if (r.shield_used) {
      lines.push(t('checkinRewardShieldUsedMsg'));
    }
    if (r.milestone_hit && !r.shield_used && milestones.find((m) => m.day_threshold === r.milestone_hit)?.grants_shield) {
      lines.push(t('checkinRewardShieldGainedMsg'));
    }
    if (lines.length === 0) {
      lines.push(`${t('checkinStreakNowPfx')}${r.streak}${t('checkinStreakNowSfx')}`);
    }

    setAlertInfo({ title: t('checkinRewardTitle'), message: lines.join('\n') });
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={N.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('checkinTitle')}</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={N.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {/* Streak card */}
          <View style={styles.streakCard}>
            <Ionicons name="flame" size={36} color="#fff" />
            <Text style={styles.streakValue}>{streak}</Text>
            <Text style={styles.streakLabel}>{t('checkinStreakLabel')}</Text>
            <View style={styles.shieldRow}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#fff" />
              <Text style={styles.shieldText}>{shields} · {t('checkinShieldsLabel')}</Text>
            </View>
          </View>

          {/* Check-in button */}
          <TouchableOpacity
            style={[styles.checkinBtn, !canCheckinToday && styles.checkinBtnDone]}
            onPress={handleCheckin}
            disabled={!canCheckinToday || submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={N.onPrimary} />
            ) : (
              <Text style={[styles.checkinBtnText, !canCheckinToday && styles.checkinBtnTextDone]}>
                {canCheckinToday ? t('checkinBtnToday') : t('checkinBtnDone')}
              </Text>
            )}
          </TouchableOpacity>

          {/* Milestones */}
          <View style={styles.milestoneSection}>
            {milestones.map((m) => {
              const reached = streak >= m.day_threshold;
              const isNext = nextMilestone?.day_threshold === m.day_threshold;
              return (
                <View key={m.day_threshold} style={[styles.milestoneRow, isNext && styles.milestoneRowNext]}>
                  <View style={[styles.milestoneBadge, reached && styles.milestoneBadgeDone]}>
                    {reached ? (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    ) : (
                      <Text style={styles.milestoneBadgeText}>{m.day_threshold}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.milestoneLabel}>
                      {m.day_threshold} {t('checkinStreakLabel')} — +{m.reward_credits} {t('missionCreditUnit')}
                      {m.grants_shield ? ` + 1 ${t('checkinShieldsLabel')}` : ''}
                    </Text>
                    {isNext && (
                      <Text style={styles.milestoneHint}>
                        {t('checkinNextMilestonePfx')}{m.day_threshold - streak}{t('checkinNextMilestoneMid')}{m.day_threshold}{t('checkinNextMilestoneSfx')}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          <TouchableOpacity onPress={() => router.push('/(app)/profile/leaderboard')} style={styles.leaderboardLink}>
            <Text style={styles.leaderboardLinkText}>{t('checkinViewLeaderboard')}</Text>
            <Ionicons name="chevron-forward" size={14} color={N.primary} />
          </TouchableOpacity>
        </ScrollView>
      )}

      <InfoAlertModal
        visible={alertInfo !== null}
        title={alertInfo?.title ?? ''}
        message={alertInfo?.message ?? ''}
        onClose={() => setAlertInfo(null)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: N.outlineVariant },
  headerTitle: { fontSize: 17, fontWeight: '700', color: N.onSurface },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body:        { padding: spacing.lg, gap: spacing.lg, paddingBottom: 40 },

  streakCard:  { alignItems: 'center', gap: 4, backgroundColor: N.primary, borderRadius: radius.xl, paddingVertical: spacing.xl },
  streakValue: { fontSize: 44, fontWeight: '800', color: '#fff', marginTop: 4 },
  streakLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  shieldRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5 },
  shieldText:  { fontSize: 12, color: '#fff', fontWeight: '600' },

  checkinBtn:      { height: 52, borderRadius: radius.lg, backgroundColor: N.primary, alignItems: 'center', justifyContent: 'center' },
  checkinBtnDone:  { backgroundColor: N.surfaceContainer },
  checkinBtnText:  { fontSize: 15, fontWeight: '700', color: N.onPrimary },
  checkinBtnTextDone: { color: N.onSurfaceVariant },

  milestoneSection: { gap: 10 },
  milestoneRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: N.surfaceContainerLow, borderRadius: radius.lg, borderWidth: 1, borderColor: N.outlineVariant, padding: spacing.md },
  milestoneRowNext: { borderColor: N.primary, borderWidth: 1.5 },
  milestoneBadge:     { width: 32, height: 32, borderRadius: 16, backgroundColor: N.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  milestoneBadgeDone: { backgroundColor: N.primary },
  milestoneBadgeText: { fontSize: 12, fontWeight: '700', color: N.onSurfaceVariant },
  milestoneLabel:   { fontSize: 13, fontWeight: '700', color: N.onSurface },
  milestoneHint:    { fontSize: 11, color: N.primary, fontWeight: '600', marginTop: 2 },

  leaderboardLink:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8 },
  leaderboardLinkText: { fontSize: 13, fontWeight: '700', color: N.primary },
});
