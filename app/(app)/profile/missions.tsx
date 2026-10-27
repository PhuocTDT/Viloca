import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { colors } from '@/src/theme/colors';
import { spacing, radius } from '@/src/theme/spacing';
import { useT } from '@/src/lib/i18n';
import { useLocalize } from '@/src/lib/location-i18n';
import { useMissions } from '@/src/hooks/useMissions';

export default function MissionsScreen() {
  const t = useT();
  const localize = useLocalize();
  const { missions, loading, claim } = useMissions();
  const [claimingId, setClaimingId] = useState<string | null>(null);

  async function handleClaim(missionId: string) {
    setClaimingId(missionId);
    const result = await claim(missionId);
    setClaimingId(null);
    if (!result.ok) Alert.alert(t('errGeneral'), result.error);
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.nomad.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('missionsTitle')}</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.nomad.primary} />
        </View>
      ) : missions.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="trophy-outline" size={40} color={colors.nomad.outlineVariant} />
          <Text style={styles.emptyText}>{t('missionsEmptyText')}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {missions.map((m) => {
            const isCompleted = !!m.completedAt;
            const isClaimed = !!m.claimedAt;
            const progressPct = Math.min(1, m.progressCount / m.target_count);

            return (
              <View key={m.id} style={styles.card}>
                <View style={styles.cardIconWrap}>
                  <Ionicons name={(m.icon ?? 'trophy-outline') as any} size={20} color={colors.nomad.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{localize(m.title, m.title_en)}</Text>
                  {m.description && (
                    <Text style={styles.cardDesc}>{localize(m.description, m.description_en)}</Text>
                  )}
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progressPct * 100}%` }]} />
                  </View>
                  <View style={styles.cardFooterRow}>
                    <Text style={styles.progressLabel}>{Math.min(m.progressCount, m.target_count)}/{m.target_count}</Text>
                    <Text style={styles.rewardLabel}>+{m.reward_credits} {t('missionCreditUnit')}</Text>
                  </View>
                </View>
                {isClaimed ? (
                  <View style={styles.claimedBadge}>
                    <Ionicons name="checkmark" size={14} color={colors.nomad.primary} />
                  </View>
                ) : isCompleted ? (
                  <TouchableOpacity
                    style={styles.claimBtn}
                    disabled={claimingId === m.id}
                    onPress={() => handleClaim(m.id)}
                  >
                    {claimingId === m.id ? (
                      <ActivityIndicator size="small" color={colors.nomad.onPrimary} />
                    ) : (
                      <Text style={styles.claimBtnText}>{t('missionClaimBtn')}</Text>
                    )}
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.nomad.outlineVariant,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.nomad.onSurface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: spacing.xl },
  emptyText: { fontSize: 14, color: colors.nomad.onSurfaceVariant, textAlign: 'center' },
  list: { padding: spacing.lg, gap: 12 },
  card: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    padding: spacing.md, borderRadius: radius.lg,
    backgroundColor: colors.nomad.surfaceContainerLow, borderWidth: 1, borderColor: colors.nomad.outlineVariant,
  },
  cardIconWrap: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.nomad.secondaryContainer,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.nomad.onSurface },
  cardDesc: { fontSize: 12, color: colors.nomad.onSurfaceVariant, marginTop: 2 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.nomad.outlineVariant, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.nomad.primary },
  cardFooterRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  progressLabel: { fontSize: 11, color: colors.nomad.onSurfaceVariant },
  rewardLabel: { fontSize: 11, fontWeight: '700', color: colors.nomad.primary },
  claimedBadge: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.nomad.secondaryContainer,
  },
  claimBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.nomad.primary },
  claimBtnText: { fontSize: 12, fontWeight: '700', color: colors.nomad.onPrimary },
});
